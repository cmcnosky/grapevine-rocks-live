#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SITE_ROOT = path.resolve(__dirname, "..");
const GUIDE_PATH = path.join(SITE_ROOT, "guide.js");
const APPROVED_ORIGIN =
  "https://grapevine-rocks-live-publishing.cmcnosky.chatgpt.site";
const APPROVED_PATH = "/public/catalog.json";
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 20_000;
const OMIT = Symbol("omit");

// The publication endpoint should already contain public data. This narrow
// blocklist is only defense in depth; unknown public extension fields remain
// intact. The completion report discloses a count if anything is removed.
const PRIVATE_KEYS = new Set([
  "adminnotes",
  "credentials",
  "internalnotes",
  "owneremail",
  "ownerphone",
  "password",
  "privatefields",
  "privatenotes",
  "reviewnotes",
  "secret",
  "submittedby",
  "submitteremail",
  "submitterphone",
  "token",
  "userid",
]);
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

class MirrorError extends Error {}

function fail(message) {
  throw new MirrorError(message);
}

function parseArguments(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!["--source", "--output", "--calendar"].includes(item)) {
      fail(`Unknown argument: ${item}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`Missing value for ${item}`);
    result[item.slice(2)] = value;
    index += 1;
  }
  return result;
}

function isApprovedRemoteURL(url) {
  return (
    url.origin === APPROVED_ORIGIN &&
    url.pathname === APPROVED_PATH &&
    !url.username &&
    !url.password
  );
}

function parseEnvelope(text, label) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    fail(`${label} did not return valid JSON.`);
  }
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch (error) {
      fail(`${label} returned a JSON string without valid catalog JSON.`);
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} did not contain a catalog object.`);
  }
  return value;
}

async function readRemote(url) {
  if (!isApprovedRemoteURL(url)) {
    fail("Remote catalog URL is not the approved publication endpoint.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "grapevine-rocks-live-catalog-mirror/1.0",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) fail(`Catalog request returned HTTP ${response.status}.`);
    if (!isApprovedRemoteURL(new URL(response.url))) {
      fail("Catalog request redirected outside the approved publication endpoint.");
    }

    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
      fail("Catalog response exceeds the size limit.");
    }
    if (!response.body) fail("Catalog response did not contain a body.");

    const reader = response.body.getReader();
    const chunks = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        fail("Catalog response exceeds the size limit.");
      }
      chunks.push(Buffer.from(value));
    }
    return parseEnvelope(Buffer.concat(chunks, bytes).toString("utf8"), "Catalog endpoint");
  } catch (error) {
    if (error instanceof MirrorError) throw error;
    if (controller.signal.aborted || error.name === "AbortError") {
      fail("Catalog request timed out before the response body completed.");
    }
    fail("Catalog request failed.");
  } finally {
    clearTimeout(timeout);
  }
}

function readLocal(source) {
  const localPath = path.resolve(source);
  let stat;
  try {
    stat = fs.statSync(localPath);
  } catch (error) {
    fail("Local fixture could not be read.");
  }
  if (!stat.isFile()) fail("Local fixture is not a file.");
  if (stat.size > MAX_RESPONSE_BYTES) fail("Local fixture exceeds the size limit.");
  return parseEnvelope(fs.readFileSync(localPath, "utf8"), "Local fixture");
}

async function readSource(source) {
  let url;
  try {
    url = new URL(source);
  } catch (error) {
    url = null;
  }
  return url ? readRemote(url) : readLocal(source);
}

function normalizedKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isPrivateKey(key) {
  if (DANGEROUS_KEYS.has(key)) return true;
  const normalized = normalizedKey(key);
  return (
    PRIVATE_KEYS.has(normalized) ||
    normalized.includes("password") ||
    normalized.includes("accesstoken") ||
    normalized.includes("refreshtoken") ||
    normalized.includes("apikey") ||
    normalized.includes("privatekey") ||
    normalized.includes("webhooksecret")
  );
}

function sanitize(value, stats, key) {
  if (key != null && isPrivateKey(key)) {
    stats.strippedFields += 1;
    return OMIT;
  }
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      fail("Catalog contains a non-finite number.");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitize(entry, stats, null))
      .filter((entry) => entry !== OMIT);
  }
  if (typeof value !== "object") {
    fail("Catalog contains a value that JSON cannot represent.");
  }

  const output = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    const sanitized = sanitize(childValue, stats, childKey);
    if (sanitized !== OMIT) output[childKey] = sanitized;
  }
  return output;
}

function orderedCatalog(catalog) {
  const output = {
    schemaVersion: catalog.schemaVersion,
    revision: catalog.revision,
    edition: catalog.edition,
    venues: catalog.venues,
    shows: catalog.shows,
  };
  for (const [key, value] of Object.entries(catalog)) {
    if (!Object.hasOwn(output, key)) output[key] = value;
  }
  return output;
}

function sanitizedCatalog(value, stats) {
  const catalog = orderedCatalog(sanitize(value, stats, null));
  if (Buffer.byteLength(JSON.stringify(catalog), "utf8") > MAX_RESPONSE_BYTES) {
    fail("Sanitized catalog exceeds the size limit.");
  }
  return catalog;
}

function loadGuide() {
  const runtime = {
    window: {},
    URL,
    Intl,
    Date,
    structuredClone,
    console,
    TextEncoder,
  };
  vm.runInNewContext(fs.readFileSync(GUIDE_PATH, "utf8"), runtime, {
    filename: GUIDE_PATH,
  });
  const guide = runtime.window.GRLGuide;
  if (!guide || typeof guide.calendarFeed !== "function") {
    fail("The shared guide calendar serializer is unavailable.");
  }
  return guide;
}

function calendarFromGuide(guide, catalog, label) {
  let calendar;
  try {
    calendar = guide.calendarFeed(catalog);
  } catch (error) {
    fail(`${label} failed the shared guide validation: ${error.message}`);
  }
  const eventCount = (calendar.match(/^BEGIN:VEVENT\r$/gm) || []).length;
  if (
    !calendar.startsWith("BEGIN:VCALENDAR\r\n") ||
    !calendar.endsWith("END:VCALENDAR\r\n") ||
    eventCount !== catalog.shows.length
  ) {
    fail("The shared guide did not produce a complete iCalendar feed.");
  }
  return calendar;
}

function canonicalJSON(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function semanticJSON(catalog) {
  return JSON.stringify(stableValue(catalog));
}

function readExisting(filePath, stats) {
  if (!fs.existsSync(filePath)) return null;
  return sanitizedCatalog(
    parseEnvelope(fs.readFileSync(filePath, "utf8"), "Existing mirror"),
    stats,
  );
}

function withoutGenerationStamp(calendar) {
  return calendar.replace(
    /^DTSTAMP:\d{8}T\d{6}Z\r?$/gm,
    "DTSTAMP:<generated>",
  );
}

function writeAtomically(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content, { encoding: "utf8", mode: 0o644 });
  fs.renameSync(temporary, filePath);
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const source = args.source || process.env.GRL_CATALOG_URL;
  if (!source) fail("GRL_CATALOG_URL or --source is required.");

  const outputPath = path.resolve(args.output || path.join(SITE_ROOT, "owner-content.json"));
  const calendarPath = path.resolve(args.calendar || path.join(SITE_ROOT, "calendar.ics"));
  const stats = { strippedFields: 0 };
  let incoming = sanitizedCatalog(await readSource(source), stats);
  const guide = loadGuide();
  let generatedCalendar = calendarFromGuide(guide, incoming, "Incoming catalog");

  const existing = readExisting(outputPath, stats);
  if (existing) {
    calendarFromGuide(guide, existing, "Existing mirror");
    if (incoming.revision < existing.revision) {
      fail(
        `Incoming revision ${incoming.revision} is older than mirrored revision ${existing.revision}; refusing to overwrite.`,
      );
    }
    if (
      incoming.revision === existing.revision &&
      semanticJSON(incoming) !== semanticJSON(existing)
    ) {
      fail(`Incoming revision ${incoming.revision} conflicts with the existing mirror.`);
    }
    if (incoming.revision === existing.revision) {
      incoming = existing;
      generatedCalendar = calendarFromGuide(guide, incoming, "Existing mirror");
    }
  }

  const json = canonicalJSON(incoming);
  const existingJSON = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, "utf8")
    : "";
  const existingCalendar = fs.existsSync(calendarPath)
    ? fs.readFileSync(calendarPath, "utf8")
    : "";
  const calendar =
    existingCalendar &&
    withoutGenerationStamp(existingCalendar) === withoutGenerationStamp(generatedCalendar)
      ? existingCalendar
      : generatedCalendar;
  const catalogChanged = existingJSON !== json;
  const calendarChanged = existingCalendar !== calendar;

  if (catalogChanged) writeAtomically(outputPath, json);
  if (calendarChanged) writeAtomically(calendarPath, calendar);

  process.stdout.write(
    `${JSON.stringify({
      revision: incoming.revision,
      venues: incoming.venues.length,
      shows: incoming.shows.length,
      strippedFields: stats.strippedFields,
      catalogChanged,
      calendarChanged,
    })}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`Catalog mirror failed: ${error.message}\n`);
  process.exitCode = 1;
});
