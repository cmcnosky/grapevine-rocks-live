const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "owner-content.json");
const calendarPath = path.join(root, "calendar.ics");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const runtime = { window: {}, URL, Intl, Date, structuredClone, console, TextEncoder };
vm.runInNewContext(fs.readFileSync(path.join(root, "guide.js"), "utf8"), runtime);
const calendar = runtime.window.GRLGuide.calendarFeed(catalog);
const eventCount = (calendar.match(/^BEGIN:VEVENT\r$/gm) || []).length;
if (
  !calendar.startsWith("BEGIN:VCALENDAR\r\n") ||
  !calendar.endsWith("END:VCALENDAR\r\n") ||
  eventCount !== catalog.shows.length
) {
  throw new Error("The music guide did not produce a complete iCalendar feed.");
}

const withoutGenerationStamp = (value) =>
  value.replace(/^DTSTAMP:\d{8}T\d{6}Z\r?$/gm, "DTSTAMP:<generated>");
const existing = fs.existsSync(calendarPath)
  ? fs.readFileSync(calendarPath, "utf8")
  : "";
const current =
  existing && withoutGenerationStamp(existing) === withoutGenerationStamp(calendar);

if (process.argv.includes("--check")) {
  if (!current) {
    console.error("calendar.ics is out of sync with owner-content.json.");
    process.exitCode = 1;
  }
} else if (!current) {
  fs.writeFileSync(calendarPath, calendar, "utf8");
  console.log("Updated calendar.ics from owner-content.json.");
} else {
  console.log("calendar.ics already matches owner-content.json.");
}
