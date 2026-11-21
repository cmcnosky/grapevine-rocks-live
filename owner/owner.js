(() => {
  "use strict";

  const LEGACY_ACCESS_KEY_STORAGE = "grl-owner-access-key";
  const REQUEST_TIMEOUT_MS = 20000;

  const elements = {
    loginView: document.querySelector("#login-view"),
    loginForm: document.querySelector("#login-form"),
    loginError: document.querySelector("#login-error"),
    username: document.querySelector("#username"),
    password: document.querySelector("#password"),
    signIn: document.querySelector("#sign-in"),
    workspace: document.querySelector("#workspace"),
    signOut: document.querySelector("#sign-out"),
    workspaceStatus: document.querySelector("#workspace-status"),
    workspaceAlert: document.querySelector("#workspace-alert"),
    conflictPanel: document.querySelector("#conflict-panel"),
    conflictCopy: document.querySelector("#conflict-copy"),
    downloadDraft: document.querySelector("#download-draft"),
    reloadLatest: document.querySelector("#reload-latest"),
    showsTab: document.querySelector("#shows-tab"),
    venuesTab: document.querySelector("#venues-tab"),
    editionTab: document.querySelector("#edition-tab"),
    showsPanel: document.querySelector("#shows-panel"),
    venuesPanel: document.querySelector("#venues-panel"),
    editionPanel: document.querySelector("#edition-panel"),
    editionForm: document.querySelector("#edition-form"),
    editionStart: document.querySelector("#edition-start"),
    editionEnd: document.querySelector("#edition-end"),
    editionLabel: document.querySelector("#edition-label"),
    editionChecked: document.querySelector("#edition-checked"),
    editionError: document.querySelector("#edition-error"),
    publish: document.querySelector("#publish"),
    changeState: document.querySelector("#change-state"),
    addShow: document.querySelector("#add-show"),
    addVenue: document.querySelector("#add-venue"),
    showSearch: document.querySelector("#show-search"),
    showDateFilter: document.querySelector("#show-date-filter"),
    showVenueFilter: document.querySelector("#show-venue-filter"),
    showSort: document.querySelector("#show-sort"),
    showFiltersClear: document.querySelector("#show-filters-clear"),
    venueSearch: document.querySelector("#venue-search"),
    venueSort: document.querySelector("#venue-sort"),
    venueFiltersClear: document.querySelector("#venue-filters-clear"),
    showsCount: document.querySelector("#shows-count"),
    venuesCount: document.querySelector("#venues-count"),
    showsList: document.querySelector("#shows-list"),
    venuesList: document.querySelector("#venues-list"),
    editorDialog: document.querySelector("#editor-dialog"),
    editorForm: document.querySelector("#editor-form"),
    editorKicker: document.querySelector("#editor-kicker"),
    editorTitle: document.querySelector("#editor-title"),
    editorShortcuts: document.querySelector("#editor-shortcuts"),
    editorFields: document.querySelector("#editor-fields"),
    editorError: document.querySelector("#editor-error"),
    editorSave: document.querySelector("#editor-save"),
    editorActionNote: document.querySelector("#editor-action-note"),
    editorCancel: document.querySelector("#editor-cancel"),
    editorClose: document.querySelector("#editor-close"),
    confirmDialog: document.querySelector("#confirm-dialog"),
    confirmTitle: document.querySelector("#confirm-title"),
    confirmMessage: document.querySelector("#confirm-message"),
    confirmCancel: document.querySelector("#confirm-cancel"),
    confirmAction: document.querySelector("#confirm-action"),
  };

  const state = {
    token: "",
    revision: null,
    catalog: null,
    publishedCatalog: null,
    showKey: "events",
    activeTab: "overview",
    conflict: false,
    conflictDraft: null,
    pendingReauth: null,
    editor: null,
    confirmResolve: null,
    returnFocus: null,
    busy: false,
  };

  class ApiError extends Error {
    constructor(status, payload) {
      super("Publishing API request failed");
      this.name = "ApiError";
      this.status = status;
      this.payload = payload;
    }
  }

  function clearLegacyAccessKey() {
    const rawFragment = window.location.hash.slice(1);
    const params = new URLSearchParams(rawFragment);
    if (params.has("key")) {
      params.delete("key");
      const remaining = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          window.location.search +
          (remaining ? "#" + remaining : ""),
      );
    }
    try {
      window.localStorage.removeItem(LEGACY_ACCESS_KEY_STORAGE);
    } catch (_error) {
      // Login still works if browser storage is unavailable.
    }
  }

  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function adapter() {
    const candidate = window.GRL_OWNER_API;
    if (!candidate || typeof candidate.request !== "function") {
      throw new ApiError(0, { reason: "unavailable" });
    }
    return candidate;
  }

  async function request(path, options = {}, authenticated = true) {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };
    if (authenticated && state.token)
      headers.Authorization = "Bearer " + state.token;
    try {
      const response = await adapter().request(path, {
        ...options,
        headers,
        signal: controller.signal,
      });
      if (
        !response ||
        typeof response.status !== "number" ||
        typeof response.text !== "function"
      )
        throw new ApiError(0, { reason: "invalid-response" });
      const text = await response.text();
      let payload = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch (_error) {
          payload = { text };
        }
      }
      if (!response.ok) throw new ApiError(response.status, payload);
      return payload;
    } catch (error) {
      if (error?.name === "AbortError")
        throw new ApiError(0, { reason: "timeout" });
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, { reason: "network" });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function errorMessage(error, context = "request") {
    if (error?.payload?.reason === "timeout")
      return "The request timed out. Try again.";
    if (error?.payload?.reason === "unavailable")
      return "The login service is unavailable. Try again later.";
    if (error?.status === 429)
      return "Too many attempts. Wait a moment, then try again.";
    if (error?.status === 401 || error?.status === 403) {
      return context === "login"
        ? "The username or password was not accepted."
        : "The session has ended. Log in again.";
    }
    if (error?.status === 409 || error?.status === 412)
      return "A newer catalog version is available.";
    if (error?.status === 400 || error?.status === 422)
      return "The catalog was not accepted. Review the entries and try again.";
    if (context === "login") return "Unable to log in. Try again.";
    return "The request could not be completed. Try again.";
  }

  function setLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.hidden = !message;
    if (message) elements.loginError.focus();
  }

  function setWorkspaceAlert(message) {
    elements.workspaceAlert.textContent = message;
    elements.workspaceAlert.hidden = !message;
    if (message) elements.workspaceAlert.focus();
  }

  function setStatus(message) {
    elements.workspaceStatus.textContent = message;
  }

  function clearMessages() {
    setWorkspaceAlert("");
    setStatus("");
  }

  function setBusy(busy, label = "") {
    state.busy = busy;
    elements.signIn.disabled = busy;
    elements.signOut.disabled = busy;
    elements.publish.disabled = busy || !hasChanges() || state.conflict;
    elements.reloadLatest.disabled = busy;
    elements.workspace.querySelectorAll('.desk-tabs, [role="tabpanel"]').forEach(panel => { panel.inert = busy; });
    if (state.catalog) updatePublishingTools();
    if (label) setStatus(label);
  }

  function isCatalog(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    if (!Array.isArray(value.venues)) return false;
    return Array.isArray(value.events) || Array.isArray(value.shows);
  }

  function isDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  function isTime(value) {
    return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
  }

  function isHttpUrl(value) {
    try {
      return /^https?:$/.test(new URL(value).protocol);
    } catch (_error) {
      return false;
    }
  }

  function validateCatalog(catalog, expectedRevision) {
    const fail = (message) => {
      throw new Error(message);
    };
    if (!isCatalog(catalog)) fail("The catalog structure is incomplete.");
    if (catalog.schemaVersion !== 1)
      fail("The catalog schema version is not supported.");
    if (
      !Number.isInteger(catalog.revision) ||
      catalog.revision < 0 ||
      catalog.revision !== expectedRevision
    )
      fail("The catalog revision is out of sync. Reload the latest catalog.");
    if (
      !catalog.edition ||
      !isDate(catalog.edition.startDate) ||
      !isDate(catalog.edition.endDate) ||
      catalog.edition.endDate < catalog.edition.startDate ||
      !String(catalog.edition.label || "").trim() ||
      !isDate(catalog.edition.sourceCheckedDate)
    )
      fail("The catalog edition information is incomplete.");

    const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      venueIds = new Set(),
      showIds = new Set();
    for (const venue of catalog.venues) {
      if (!idPattern.test(String(venue.id || "")) || venueIds.has(venue.id))
        fail("Every venue needs a unique lowercase kebab-case ID.");
      venueIds.add(venue.id);
      if (
        !String(venue.name || "").trim() ||
        !String(venue.address || "").trim() ||
        !String(venue.description || "").trim()
      )
        fail("Complete the name, address and description for every venue.");
      if (!isHttpUrl(venue.url))
        fail(
          "Every venue website must be a complete http:// or https:// address.",
        );
      if (
        !Array.isArray(venue.features) ||
        venue.features.some((feature) => typeof feature !== "string")
      )
        fail("Every venue features field must be a list of text values.");
    }

    const catalogShows = Array.isArray(catalog.shows)
      ? catalog.shows
      : catalog.events;
    for (const show of catalogShows) {
      if (!idPattern.test(String(show.id || "")) || showIds.has(show.id))
        fail("Every show needs a unique lowercase kebab-case ID.");
      showIds.add(show.id);
      if (
        !String(show.title || "").trim() ||
        !String(show.artist || "").trim() ||
        !String(show.genres || "").trim() ||
        !String(show.cover || "").trim()
      )
        fail(
          "Complete the title, artist, genre and cover fields for every show.",
        );
      if (!venueIds.has(show.venueId))
        fail("Every show must use a venue that is still in the catalog.");
      if (!isDate(show.date) || !isTime(show.time))
        fail("Every show needs a valid date and start time.");
      if (show.endTime && !isTime(show.endTime))
        fail("A show has an invalid end time.");
      if (show.verifiedAt && !isDate(show.verifiedAt))
        fail("A show has an invalid checked date.");
      if (!Array.isArray(show.sources) || !show.sources.length)
        fail("Every show needs at least one source.");
      for (const source of show.sources) {
        if (
          !source ||
          typeof source !== "object" ||
          Array.isArray(source) ||
          !String(source.label || "").trim() ||
          !isHttpUrl(source.url)
        )
          fail("Every show source needs a label and a complete web address.");
      }
    }
  }

  function useCatalog(payload) {
    if (!payload || !isCatalog(payload.catalog))
      throw new ApiError(0, { reason: "invalid-catalog" });
    if (!Object.hasOwn(payload, "revision"))
      throw new ApiError(0, { reason: "invalid-revision" });
    state.showKey = Array.isArray(payload.catalog.events) ? "events" : "shows";
    state.revision = payload.revision;
    state.catalog = clone(payload.catalog);
    state.publishedCatalog = clone(payload.catalog);
    state.conflict = false;
    state.conflictDraft = null;
    elements.conflictPanel.hidden = true;
    elements.downloadDraft.hidden = true;
    elements.conflictCopy.textContent =
      "This copy was not published. Reload the latest catalog before publishing again.";
    renderEdition();
    renderCatalog();
  }

  function shows() {
    return state.catalog?.[state.showKey] || [];
  }

  function venues() {
    return state.catalog?.venues || [];
  }

  function isDirty() {
    if (!state.catalog || !state.publishedCatalog) return false;
    return (
      JSON.stringify(state.catalog) !== JSON.stringify(state.publishedCatalog)
    );
  }

  function editionFormValues() {
    return {
      startDate: elements.editionStart.value,
      endDate: elements.editionEnd.value,
      label: elements.editionLabel.value.trim(),
      sourceCheckedDate: elements.editionChecked.value,
    };
  }

  function editionFormChanged() {
    if (!state.catalog?.edition || elements.workspace.hidden) return false;
    const values = editionFormValues();
    return ["startDate", "endDate", "label", "sourceCheckedDate"].some(
      (key) => values[key] !== String(state.catalog.edition[key] || ""),
    );
  }

  function hasChanges() {
    return isDirty() || editionFormChanged();
  }

  function renderEdition() {
    const edition = state.catalog?.edition || {};
    elements.editionStart.value = edition.startDate || "";
    elements.editionEnd.value = edition.endDate || "";
    elements.editionLabel.value = edition.label || "";
    elements.editionChecked.value = edition.sourceCheckedDate || "";
    elements.editionError.textContent = "";
    elements.editionError.hidden = true;
  }

  function setEditionError(message, target = null) {
    elements.editionError.textContent = message;
    elements.editionError.hidden = !message;
    if (!message) return;
    target?.setAttribute("aria-invalid", "true");
    window.requestAnimationFrame(() => (target || elements.editionError).focus());
  }

  function applyEdition(event, quiet = false) {
    event?.preventDefault();
    setEditionError("");
    let firstInvalid = null;
    for (const field of elements.editionForm.querySelectorAll("[required]")) {
      field.setCustomValidity("");
      field.removeAttribute("aria-invalid");
      if (!String(field.value).trim()) {
        field.setCustomValidity("Please complete this field.");
        firstInvalid ||= field;
      }
    }
    firstInvalid ||= [...elements.editionForm.elements].find(
      (field) => typeof field.checkValidity === "function" && !field.checkValidity(),
    );
    if (firstInvalid) {
      const label = firstInvalid.closest("label")?.querySelector("span")?.textContent || "field";
      setEditionError(
        firstInvalid.validity.valueMissing
          ? "Complete the required field: " + label + "."
          : label + ": " + (firstInvalid.validationMessage || "Enter a valid value."),
        firstInvalid,
      );
      firstInvalid.reportValidity();
      return false;
    }
    const values = editionFormValues();
    if (
      !isDate(values.startDate) ||
      !isDate(values.endDate) ||
      !isDate(values.sourceCheckedDate)
    ) {
      const target = !isDate(values.startDate)
        ? elements.editionStart
        : !isDate(values.endDate)
          ? elements.editionEnd
          : elements.editionChecked;
      setEditionError("Enter valid edition dates.", target);
      return false;
    }
    if (values.endDate < values.startDate) {
      elements.editionEnd.setCustomValidity(
        "End date must be on or after the start date.",
      );
      setEditionError("End date must be on or after the start date.", elements.editionEnd);
      elements.editionEnd.reportValidity();
      return false;
    }
    if (!editionFormChanged()) {
      updateChangeState();
      if (!quiet) setStatus("No edition changes to save.");
      return true;
    }
    state.catalog.edition = { ...state.catalog.edition, ...values };
    updateChangeState();
    renderOverview();
    if (!quiet) setStatus("Edition saved. Publish changes when ready.");
    return true;
  }

  function updateChangeState() {
    const dirty = hasChanges();
    elements.changeState.textContent = dirty
      ? "Unpublished changes"
      : "Up to date";
    elements.changeState.classList.toggle("unsaved", dirty);
    elements.publish.disabled = state.busy || !dirty || state.conflict;
    updatePublishingTools();
  }

  function showWorkspace() {
    elements.loginView.hidden = true;
    elements.workspace.hidden = false;
    document.title = "Content manager | Grapevine Rocks Live";
  }

  function showLogin(message = "", { preserveDraft = false } = {}) {
    if (preserveDraft && state.catalog && state.publishedCatalog) {
      state.pendingReauth = {
        revision: state.revision,
        catalog: clone(state.catalog),
        publishedCatalog: clone(state.publishedCatalog),
        showKey: state.showKey,
        activeTab: state.activeTab,
        editionDraft: editionFormChanged() ? editionFormValues() : null,
      };
    } else if (!preserveDraft) {
      state.pendingReauth = null;
    }
    state.token = "";
    state.catalog = null;
    state.publishedCatalog = null;
    state.revision = null;
    state.conflict = false;
    state.conflictDraft = null;
    elements.workspace.hidden = true;
    elements.conflictPanel.hidden = true;
    elements.downloadDraft.hidden = true;
    elements.loginView.hidden = false;
    elements.password.value = "";
    setLoginError(message);
    document.title = "Log in | Grapevine Rocks Live";
    elements.username.focus();
  }

  async function loadCatalog() {
    const payload = await request("/catalog", { method: "GET" });
    useCatalog(payload);
  }

  function restoreAfterReauthentication(payload) {
    const pending = state.pendingReauth;
    if (!pending) {
      selectTab("overview");
      desk("desk-agenda-date").replaceChildren();
      useCatalog(payload);
      return "loaded";
    }
    if (
      !payload ||
      !isCatalog(payload.catalog) ||
      !Object.hasOwn(payload, "revision")
    )
      throw new ApiError(0, { reason: "invalid-catalog" });
    const draft = clone(pending.catalog);
    if (pending.editionDraft)
      draft.edition = { ...draft.edition, ...pending.editionDraft };
    if (payload.revision === pending.revision) {
      draft.revision = payload.revision;
      state.revision = payload.revision;
      state.catalog = draft;
      state.publishedCatalog = clone(payload.catalog);
      state.showKey = pending.showKey;
      state.conflict = false;
      state.conflictDraft = null;
      state.pendingReauth = null;
      elements.conflictPanel.hidden = true;
      elements.downloadDraft.hidden = true;
      renderEdition();
      renderCatalog();
      selectTab(pending.activeTab);
      return "restored";
    }
    useCatalog(payload);
    state.conflict = true;
    state.conflictDraft = draft;
    state.pendingReauth = null;
    elements.conflictPanel.hidden = false;
    elements.downloadDraft.hidden = false;
    elements.conflictCopy.textContent =
      "The catalog changed while your session was inactive. The latest catalog is loaded; download your unpublished copy before reconciling the changes.";
    updateChangeState();
    return "conflict";
  }

  async function signIn(event) {
    event.preventDefault();
    setLoginError("");
    if (!elements.loginForm.reportValidity()) return;
    setBusy(true);
    elements.signIn.textContent = "Logging in…";
    try {
      const payload = await request(
        "/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: elements.username.value.trim(),
            password: elements.password.value,
          }),
        },
        false,
      );
      if (!payload || typeof payload.token !== "string" || !payload.token)
        throw new ApiError(0, { reason: "invalid-token" });
      state.token = payload.token;
      const catalogPayload = await request("/catalog", { method: "GET" });
      const outcome = restoreAfterReauthentication(catalogPayload);
      elements.password.value = "";
      setLoginError("");
      showWorkspace();
      if (outcome === "restored")
        setStatus("Session restored. Unpublished changes are ready.");
      else if (outcome === "conflict")
        setWorkspaceAlert(
          "The catalog changed while your session was inactive. Your unpublished copy has not been overwritten.",
        );
    } catch (error) {
      state.token = "";
      setLoginError(errorMessage(error, "login"));
    } finally {
      setBusy(false);
      elements.signIn.textContent = "Log in";
      if (!elements.workspace.hidden && elements.workspaceAlert.hidden) {
        elements.workspace.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
      }
    }
  }

  function makeElement(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return value || "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value + "T12:00:00"));
  }

  function formatTime(value) {
    if (!/^\d{2}:\d{2}$/.test(String(value || ""))) return value || "";
    const [hours, minutes] = value.split(":").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(2000, 0, 1, hours, minutes));
  }

  function venueName(id) {
    return venues().find((venue) => venue.id === id)?.name || "Unknown venue";
  }

  function actionButton(label, action, id, danger = false) {
    const button = makeElement(
      "button",
      "text-button" + (danger ? " danger" : ""),
      label,
    );
    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = id;
    return button;
  }

  function publishedRecord(type, id) {
    const collection =
      type === "show"
        ? state.publishedCatalog?.events || state.publishedCatalog?.shows || []
        : state.publishedCatalog?.venues || [];
    return collection.find((record) => record.id === id) || null;
  }

  function recordState(type, record) {
    const published = publishedRecord(type, record.id);
    if (!published) return { label: "New", className: "new" };
    if (JSON.stringify(record) !== JSON.stringify(published))
      return { label: "Edited", className: "edited" };
    return { label: "Published", className: "published" };
  }

  function recordStatus(type, record) {
    const status = recordState(type, record);
    return makeElement(
      "span",
      "record-status record-status--" + status.className,
      status.label,
    );
  }

  function publicRecordLink(type, id, label, recordLabel) {
    const link = makeElement("a", "library-action", label);
    link.href = "../#" + type + "/" + encodeURIComponent(id);
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", label + " for " + recordLabel);
    return link;
  }

  function libraryAction(label, action, id, recordLabel, danger = false) {
    const button = actionButton(label, action, id, danger);
    button.className =
      "library-action" + (danger ? " library-action--danger" : "");
    button.setAttribute("aria-label", label + " " + recordLabel);
    return button;
  }

  function localPhotoSource(value) {
    const src = String(value || "").trim();
    if (src.startsWith("assets/")) return "../" + src;
    if (src.startsWith("../assets/") || src.startsWith("/")) return src;
    if (/^https:\/\//i.test(src)) return src;
    return "";
  }

  function libraryMedia(type, record) {
    const media = makeElement("div", "library-card-media");
    const fallback = () => {
      const label = String(
        type === "show" ? record.artist || record.title : record.name,
      ).trim();
      const mark = makeElement(
        "span",
        "library-card-monogram",
        (label.match(/[\p{L}\p{N}]/u)?.[0] || "G").toLocaleUpperCase(),
      );
      mark.setAttribute("aria-hidden", "true");
      media.replaceChildren(mark);
      media.classList.add("library-card-media--fallback");
    };
    const photo =
      typeof lookupPortalPhoto === "function"
        ? lookupPortalPhoto(type, record)
        : null;
    const src = localPhotoSource(photo?.thumb || photo?.src);
    if (!src) {
      fallback();
      return media;
    }
    const image = document.createElement("img");
    image.src = src;
    image.alt = String(photo.alt || "");
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.width = 360;
    image.height = 220;
    const framing =
      photo.framing?.[type === "show" ? "listing" : "directory"] || {};
    if (["cover", "contain"].includes(framing.fit))
      image.style.objectFit = framing.fit;
    const position = framing.position || photo.position;
    if (position) image.style.objectPosition = position;
    image.addEventListener("error", fallback, { once: true });
    media.append(image);
    return media;
  }

  function reconcileFilterOptions(select, entries, firstLabel) {
    const selected = select.value;
    const options = [new Option(firstLabel, "")];
    for (const [value, label] of entries) options.push(new Option(label, value));
    select.replaceChildren(...options);
    select.value = entries.some(([value]) => value === selected) ? selected : "";
  }

  function syncShowFilters() {
    const dates = [...new Set(shows().map((show) => show.date).filter(isDate))]
      .sort()
      .map((date) => [date, formatDate(date)]);
    const places = [...venues()]
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
      .map((venue) => [venue.id, venue.name || "Unnamed venue"]);
    reconcileFilterOptions(elements.showDateFilter, dates, "All dates");
    reconcileFilterOptions(elements.showVenueFilter, places, "All venues");
  }

  function showSortValue(show, mode) {
    if (mode === "artist")
      return [show.artist || show.title || "", show.date || "", show.time || ""];
    if (mode === "venue")
      return [venueName(show.venueId), show.date || "", show.time || ""];
    return [show.date || "", show.time || "", show.title || ""];
  }

  function compareShowRecords(a, b, mode) {
    const comparison = showSortValue(a, mode)
      .join("|")
      .localeCompare(showSortValue(b, mode).join("|"));
    return mode === "latest" ? -comparison : comparison;
  }

  function showTimeLabel(show) {
    const start = formatTime(show.time);
    const end = formatTime(show.endTime);
    return end ? start + "–" + end : start;
  }

  function appendShowCard(show) {
    const label = show.title || "Untitled show";
    const card = makeElement("article", "library-card library-card--show");
    card.dataset.recordId = show.id;
    const media = libraryMedia("show", show);
    const body = makeElement("div", "library-card-body");
    const headingId = "show-card-" + show.id;
    const top = makeElement("div", "library-card-topline");
    const date = makeElement("time", "library-date", formatDate(show.date));
    date.dateTime = show.date || "";
    top.append(date, recordStatus("show", show));
    const heading = makeElement("h3", "", label);
    heading.id = headingId;
    card.setAttribute("aria-labelledby", headingId);
    body.append(top, heading);
    if (show.artist && show.artist !== show.title)
      body.append(makeElement("p", "library-card-byline", show.artist));
    const details = makeElement("div", "library-card-details");
    details.append(
      makeElement("span", "", showTimeLabel(show) || "Time not set"),
      makeElement("span", "", venueName(show.venueId)),
    );
    body.append(details);
    const facts = makeElement("div", "library-card-facts");
    if (show.genres) facts.append(makeElement("span", "", show.genres));
    if (show.sourceStatus)
      facts.append(makeElement("span", "", show.sourceStatus));
    const sourceCount = Array.isArray(show.sources) ? show.sources.length : 0;
    facts.append(
      makeElement(
        "span",
        "",
        sourceCount + (sourceCount === 1 ? " source" : " sources"),
      ),
    );
    body.append(facts);
    const actions = makeElement("div", "library-card-actions");
    actions.append(
      libraryAction("Edit", "edit-show", show.id, label),
      libraryAction("Duplicate", "duplicate-show", show.id, label),
    );
    if (publishedRecord("show", show.id))
      actions.append(publicRecordLink("show", show.id, "View live", label));
    actions.append(
      libraryAction("Remove", "remove-show", show.id, label, true),
    );
    card.append(media, body, actions);
    elements.showsList.append(card);
  }

  function renderShows() {
    const query = elements.showSearch.value.trim().toLocaleLowerCase();
    const date = elements.showDateFilter.value;
    const venueId = elements.showVenueFilter.value;
    const mode = elements.showSort.value;
    const sorted = [...shows()].sort((a, b) => compareShowRecords(a, b, mode));
    const filtered = sorted.filter(
      (show) =>
        (!date || show.date === date) &&
        (!venueId || show.venueId === venueId) &&
        [
          show.title,
          show.artist,
          show.date,
          show.time,
          show.genres,
          venueName(show.venueId),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query),
    );
    const filtering = Boolean(query || date || venueId);
    elements.showsCount.textContent = filtering
      ? "Showing " + filtered.length + " of " + sorted.length + " shows"
      : sorted.length + (sorted.length === 1 ? " show" : " shows") + " in the guide";
    elements.showFiltersClear.hidden = !(
      filtering || elements.showSort.value !== "soonest"
    );
    elements.showsList.replaceChildren();
    if (!filtered.length) {
      const empty = makeElement("div", "library-empty");
      empty.append(
        makeElement("h3", "", filtering ? "No matching shows" : "No shows yet"),
        makeElement(
          "p",
          "",
          filtering
            ? "Try another search or clear the filters."
            : "Add the first show to start this edition.",
        ),
      );
      if (filtering)
        empty.append(
          libraryAction("Clear filters", "clear-show-filters", "", "shows"),
        );
      elements.showsList.append(empty);
      return;
    }
    for (const show of filtered) appendShowCard(show);
  }

  function venueShowCount(venueId) {
    return shows().filter((show) => show.venueId === venueId).length;
  }

  function appendVenueCard(venue) {
    const label = venue.name || "Unnamed venue";
    const count = venueShowCount(venue.id);
    const card = makeElement("article", "library-card library-card--venue");
    card.dataset.recordId = venue.id;
    const media = libraryMedia("venue", venue);
    const body = makeElement("div", "library-card-body");
    const headingId = "venue-card-" + venue.id;
    const top = makeElement("div", "library-card-topline");
    top.append(
      makeElement(
        "span",
        "library-card-count",
        count + (count === 1 ? " scheduled show" : " scheduled shows"),
      ),
      recordStatus("venue", venue),
    );
    const heading = makeElement("h3", "", label);
    heading.id = headingId;
    card.setAttribute("aria-labelledby", headingId);
    body.append(top, heading);
    if (venue.address)
      body.append(makeElement("p", "library-card-address", venue.address));
    if (venue.description)
      body.append(makeElement("p", "library-card-summary", venue.description));
    if (Array.isArray(venue.features) && venue.features.length) {
      const features = makeElement("ul", "library-feature-list");
      for (const feature of venue.features.slice(0, 4))
        features.append(makeElement("li", "", feature));
      body.append(features);
    }
    const actions = makeElement("div", "library-card-actions");
    actions.append(libraryAction("Edit", "edit-venue", venue.id, label));
    if (publishedRecord("venue", venue.id))
      actions.append(publicRecordLink("venue", venue.id, "View live", label));
    if (count)
      actions.append(
        libraryAction("View shows", "filter-shows", venue.id, label),
      );
    if (isHttpUrl(venue.url)) {
      const website = makeElement("a", "library-action", "Website");
      website.href = venue.url;
      website.target = "_blank";
      website.rel = "noopener noreferrer";
      website.setAttribute("aria-label", "Open website for " + label);
      actions.append(website);
    }
    actions.append(
      libraryAction("Remove", "remove-venue", venue.id, label, true),
    );
    card.append(media, body, actions);
    elements.venuesList.append(card);
  }

  function renderVenues() {
    const query = elements.venueSearch.value.trim().toLocaleLowerCase();
    const mode = elements.venueSort.value;
    const sorted = [...venues()].sort((a, b) => {
      if (mode === "shows") {
        const difference = venueShowCount(b.id) - venueShowCount(a.id);
        if (difference) return difference;
      }
      const first = mode === "address" ? a.address : a.name;
      const second = mode === "address" ? b.address : b.name;
      return String(first || "").localeCompare(String(second || ""));
    });
    const filtered = sorted.filter((venue) =>
      [venue.name, venue.address, ...(venue.features || [])]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
    elements.venuesCount.textContent = query
      ? "Showing " + filtered.length + " of " + sorted.length + " venues"
      : sorted.length + (sorted.length === 1 ? " venue" : " venues") + " in the guide";
    elements.venueFiltersClear.hidden = !(
      query || elements.venueSort.value !== "name"
    );
    elements.venuesList.replaceChildren();
    if (!filtered.length) {
      const empty = makeElement("div", "library-empty");
      empty.append(
        makeElement("h3", "", query ? "No matching venues" : "No venues yet"),
        makeElement(
          "p",
          "",
          query
            ? "Try another search or clear it."
            : "Add a venue before adding its first show.",
        ),
      );
      if (query)
        empty.append(
          libraryAction("Clear search", "clear-venue-filters", "", "venues"),
        );
      elements.venuesList.append(empty);
      return;
    }
    for (const venue of filtered) appendVenueCard(venue);
  }

  function renderCatalog() {
    syncShowFilters();
    renderShows();
    renderVenues();
    renderOverview();
    updateChangeState();
  }

  function lookupPortalPhoto(type, record) {
    if (!record) return null;
    const custom = record.photo;
    if (custom && /^https:\/\//i.test(custom.src) && isHttpUrl(custom.src) && custom.alt && custom.credit && isHttpUrl(custom.source)) {
      return { ...custom, thumb: custom.src };
    }
    const collection = window.GRLPhotos?.[type === "show" ? "artists" : "venues"];
    const key = type === "show" ? record.artist : record.id;
    if (!collection || !Object.hasOwn(collection, key)) return null;
    const photo = collection[key];
    return { ...photo, src: "../" + photo.src, thumb: "../" + (photo.thumb || photo.src) };
  }

  function desk(id) {
    return document.getElementById(id);
  }

  const changeLabels = {
    venueId: "venue", startDate: "start date", endDate: "end date", sourceCheckedDate: "source check date",
    verifiedAt: "verification date", time: "start time", endTime: "end time", sourceStatus: "source status",
    genres: "genre", features: "features", photo: "photo", url: "website", sources: "sources",
  };

  function changedFields(oldRecord, record) {
    const keys = new Set([...Object.keys(oldRecord), ...Object.keys(record)]);
    return [...keys].filter(key => JSON.stringify(oldRecord[key]) !== JSON.stringify(record[key]))
      .map(key => changeLabels[key] || key.replace(/([A-Z])/g, " $1").toLowerCase());
  }

  function catalogChanges() {
    if (!state.catalog || !state.publishedCatalog) return [];
    const changes = [];
    for (const [group, noun] of [[state.showKey, "Show"], ["venues", "Venue"]]) {
      const previous = new Map(state.publishedCatalog[group].map(record => [record.id, record]));
      for (const record of state.catalog[group]) {
        const oldRecord = previous.get(record.id);
        const name = record.title || record.name || record.id;
        const fields = oldRecord ? changedFields(oldRecord, record) : [];
        if (!oldRecord || fields.length) changes.push({ name, action: oldRecord ? "Edited" : "Added", detail: [noun, ...fields].join(" · ") });
        previous.delete(record.id);
      }
      for (const record of previous.values()) {
        changes.push({ name: record.title || record.name || record.id, action: "Removed", detail: noun });
      }
    }
    const edition = editionFormChanged() ? { ...state.catalog.edition, ...editionFormValues() } : state.catalog.edition;
    const fields = changedFields(state.publishedCatalog.edition, edition);
    if (fields.length) changes.push({ name: "Guide edition", action: "Edited", detail: fields.join(" · ") });
    return changes;
  }

  function updatePublishingTools() {
    if (!state.catalog) return;
    const changes = catalogChanges();
    desk("desk-review-status").textContent = state.conflict ? "A newer revision is available. Resolve the changes before publishing." : changes.length
      ? changes.length + (changes.length === 1 ? " change ready to review." : " changes ready to review.")
      : "Published revision " + state.revision + ". All changes are live.";
    desk("desk-review-changes").disabled = !changes.length || state.busy;
    desk("desk-discard").disabled = !changes.length || state.busy || state.conflict;
    desk("desk-review-publish").disabled = !changes.length || state.busy || state.conflict;
    const listing = desk("desk-change-list");
    listing.replaceChildren();
    for (const item of changes) {
      const row = makeElement("li");
      row.append(makeElement("strong", "", item.name), makeElement("span", "", item.action + " · " + item.detail));
      listing.append(row);
    }
  }

  function renderDeskAgenda() {
    const date = desk("desk-agenda-date").value;
    const list = desk("desk-agenda-list");
    list.replaceChildren();
    const records = shows().filter(show => show.date === date).sort((a, b) =>
      (a.time || "99").localeCompare(b.time || "99") || a.title.localeCompare(b.title));
    for (const record of records) {
      const row = makeElement("li");
      const time = makeElement("span", "desk-show-time", formatTime(record.time) || "Time TBA");
      const content = makeElement("div", "desk-show-name");
      content.append(makeElement("strong", "", record.title), makeElement("span", "", venueName(record.venueId)));
      const edit = makeElement("button", "desk-link", "Edit");
      edit.type = "button";
      edit.dataset.deskEdit = record.id;
      edit.setAttribute("aria-label", "Edit " + record.title);
      row.append(time, content, edit);
      list.append(row);
    }
    if (!records.length) list.append(makeElement("li", "desk-no-shows", "No shows scheduled."));
  }

  function renderOverview() {
    if (!state.catalog) return;
    desk("desk-edition").textContent = state.catalog.edition.label || "Guide edition";
    desk("desk-shows").textContent = shows().length;
    desk("desk-venues").textContent = venues().length;
    const dates = [...new Set(shows().map(record => record.date))].sort();
    const picker = desk("desk-agenda-date");
    const preferred = picker.value;
    const today = localDate();
    picker.replaceChildren();
    for (const date of dates) picker.add(new Option(formatDate(date), date));
    if (dates.length) picker.value = dates.includes(preferred) ? preferred : dates.find(date => date >= today) || dates[dates.length - 1];
    picker.parentElement.hidden = !dates.length;
    renderDeskAgenda();
  }

  async function discardCatalogDraft() {
    if (!hasChanges() || state.busy || state.conflict) return;
    if (!(await confirmAction({title: "Discard unpublished changes?", message: "All edits made since the last publication in this tab will be lost.", label: "Discard changes"}))) return;
    state.catalog = clone(state.publishedCatalog);
    renderEdition();
    renderCatalog();
    setStatus("Unpublished changes discarded.");
    desk("desk-export").focus();
  }

  function selectTab(tab, focus = false) {
    state.activeTab = tab;
    const items = [
      ["overview", desk("overview-tab"), desk("overview-panel")],
      ["shows", elements.showsTab, elements.showsPanel],
      ["venues", elements.venuesTab, elements.venuesPanel],
      ["edition", elements.editionTab, elements.editionPanel],
    ];
    for (const [name, button, panel] of items) {
      const selected = name === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
    }
    if (focus) items.find(([name]) => name === tab)?.[1].focus();
  }

  function localDate() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const value = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );
    return value.year + "-" + value.month + "-" + value.day;
  }

  function uniqueId(prefix) {
    const used = new Set([
      ...shows().map((item) => item.id),
      ...venues().map((item) => item.id),
    ]);
    let id = "";
    do {
      const random =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString(36) + Math.random().toString(36).slice(2);
      id = prefix + "-" + random.toLocaleLowerCase();
    } while (used.has(id));
    return id;
  }

  function editorSection(id, title, description = "", optional = false) {
    const section = document.createElement(optional ? "details" : "fieldset");
    section.id = "editor-" + id;
    section.className = "editor-section full-field";
    if (optional) {
      const summary = makeElement("summary", "editor-section-heading");
      summary.append(
        makeElement("span", "editor-section-number", "Optional"),
        makeElement("strong", "", title),
      );
      section.append(summary);
    } else {
      const legend = document.createElement("legend");
      legend.append(makeElement("strong", "", title));
      section.append(legend);
    }
    if (description) section.append(makeElement("p", "editor-section-copy", description));
    const grid = makeElement("div", "editor-section-grid");
    section.append(grid);
    elements.editorFields.append(section);
    return { section, grid };
  }

  function renderEditorShortcuts(sections) {
    elements.editorShortcuts.replaceChildren();
    for (const { section, label } of sections) {
      const link = makeElement("a", "", label);
      link.href = "#" + section.id;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (section instanceof HTMLDetailsElement) section.open = true;
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        section.querySelector("input, select, textarea, button")?.focus({ preventScroll: true });
      });
      elements.editorShortcuts.append(link);
    }
  }

  function addHiddenField(name, value) {
    const field = document.createElement("input");
    field.type = "hidden";
    field.id = "edit-" + name;
    field.name = name;
    field.value = value ?? "";
    elements.editorFields.append(field);
    return field;
  }

  function addField({
    name,
    label,
    value = "",
    type = "text",
    required = false,
    readonly = false,
    full = false,
    help = "",
    maxLength = 500,
    placeholder = "",
    autocomplete = "",
    parent = elements.editorFields,
  }) {
    const wrapper = makeElement("label", full ? "full-field" : "");
    const labelText = makeElement("span", "", label);
    wrapper.append(labelText);
    const control =
      type === "textarea"
        ? document.createElement("textarea")
        : document.createElement("input");
    control.id = "edit-" + name;
    control.name = name;
    if (type !== "textarea") control.type = type;
    control.value = value ?? "";
    if (placeholder) control.placeholder = placeholder;
    if (autocomplete) control.autocomplete = autocomplete;
    control.required = required;
    control.readOnly = readonly;
    if (maxLength) control.maxLength = maxLength;
    wrapper.append(control);
    if (help) wrapper.append(makeElement("span", "field-help", help));
    parent.append(wrapper);
    return control;
  }

  function addVenueSelect(value, parent = elements.editorFields) {
    const wrapper = makeElement("label", "full-field");
    wrapper.append(makeElement("span", "", "Venue"));
    const select = document.createElement("select");
    select.id = "edit-venueId";
    select.name = "venueId";
    select.required = true;
    const blank = makeElement("option", "", "Select a venue");
    blank.value = "";
    select.append(blank);
    for (const venue of [...venues()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name)),
    )) {
      const option = makeElement("option", "", venue.name);
      option.value = venue.id;
      option.selected = venue.id === value;
      select.append(option);
    }
    if (value && !venues().some((venue) => venue.id === value)) {
      const missing = makeElement("option", "", "Missing venue: " + value);
      missing.value = value;
      missing.selected = true;
      select.append(missing);
    }
    wrapper.append(select);
    parent.append(wrapper);
    return select;
  }

  function syncSourceRecords() {
    if (!state.editor || state.editor.type !== "show") return;
    const current = state.editor.sourceRecords || [];
    for (const row of elements.editorFields.querySelectorAll(".source-row")) {
      const index = Number(row.dataset.index);
      current[index] = {
        ...(current[index] || {}),
        label: row.querySelector('[data-source-field="label"]').value,
        url: row.querySelector('[data-source-field="url"]').value,
      };
    }
    state.editor.sourceRecords = current;
  }

  function renderSourceRows() {
    const container = elements.editorFields.querySelector("#source-rows");
    if (!container || !state.editor) return;
    container.replaceChildren();
    state.editor.sourceRecords.forEach((source, index) => {
      const row = makeElement("div", "source-row");
      row.dataset.index = String(index);
      const labelField = makeElement("label");
      labelField.append(makeElement("span", "", "Source label"));
      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.name = "source-" + index + "-label";
      labelInput.required = true;
      labelInput.maxLength = 160;
      labelInput.value = source.label || "";
      labelInput.dataset.sourceField = "label";
      labelField.append(labelInput);
      const urlField = makeElement("label");
      urlField.append(makeElement("span", "", "Source URL"));
      const urlInput = document.createElement("input");
      urlInput.type = "url";
      urlInput.name = "source-" + index + "-url";
      urlInput.required = true;
      urlInput.maxLength = 1000;
      urlInput.value = source.url || "";
      urlInput.dataset.sourceField = "url";
      urlField.append(urlInput);
      const remove = makeElement(
        "button",
        "text-button danger",
        "Remove source",
      );
      remove.type = "button";
      remove.disabled = state.editor.sourceRecords.length === 1;
      remove.addEventListener("click", () => {
        syncSourceRecords();
        state.editor.sourceRecords.splice(index, 1);
        renderSourceRows();
      });
      row.append(labelField, urlField, remove);
      container.append(row);
    });
  }

  function addSourceEditor(record, parent = elements.editorFields) {
    const fieldset = makeElement("fieldset", "source-editor full-field");
    fieldset.append(makeElement("legend", "", "Published links"));
    fieldset.append(
      makeElement(
        "p",
        "field-help",
        "Add the event page, venue post or other link that confirms this listing.",
      ),
    );
    const rows = makeElement("div", "source-rows");
    rows.id = "source-rows";
    const add = makeElement("button", "secondary-button", "Add another source");
    add.type = "button";
    add.addEventListener("click", () => {
      syncSourceRecords();
      state.editor.sourceRecords.push({ label: "", url: "" });
      renderSourceRows();
      window.requestAnimationFrame(() =>
        rows.lastElementChild
          ?.querySelector('[data-source-field="label"]')
          ?.focus(),
      );
    });
    fieldset.append(rows, add);
    parent.append(fieldset);
    renderSourceRows();
  }

  function addPhotoFields(record, type, parent = elements.editorFields) {
    const box = makeElement("div", "photo-field-grid full-field");
    box.append(makeElement("p", "field-help", "Use a photo you have permission to publish. Leave every field empty to use the guide’s usual photo."));
    const photo = record.photo || {};
    for (const [key, label, limit] of [
      ["src", type === "show" ? "Performer image URL" : "Venue image URL", 2000], ["alt", "Image description", 400],
      ["credit", "Photographer or source", 200], ["source", "Credit link", 2000],
    ]) {
      addField({ name: "photo-" + key, label, value: photo[key], maxLength: limit, parent: box });
    }
    parent.append(box);
  }

  function readPhoto(data) {
    const entries = ["src", "alt", "credit", "source"].map(key =>
      [key, String(data.get("photo-" + key) || "").trim()]);
    if (entries.every(([, value]) => !value)) return null;
    const photo = Object.fromEntries(entries);
    const missing = entries.find(([, value]) => !value);
    if (missing)
      throw editorFailure(
        "Complete all four photo fields, or clear all four to use the guide’s usual photo.",
        elements.editorFields.querySelector("#edit-photo-" + missing[0]),
      );
    if (![photo.src, photo.source].every(value => isHttpUrl(value) && /^https:\/\//i.test(value)))
      throw editorFailure(
        "The image URL and credit link must both begin with https://.",
        elements.editorFields.querySelector("#edit-photo-src"),
      );
    return photo;
  }

  function openEditor(type, id = "", options = {}) {
    clearMessages();
    const collection = type === "show" ? shows() : venues();
    const existing = !options.seed && id ? collection.find((item) => item.id === id) : null;
    const duplicated = Boolean(type === "show" && options.duplicate && options.seed);
    const record = options.seed
      ? clone(options.seed)
      : existing
      ? clone(existing)
      : type === "show"
        ? {
            id: uniqueId("show"),
            title: "",
            artist: "",
            venueId: "",
            date: localDate(),
            time: "",
            endTime: "",
            genres: "Live music",
            cover: "Not listed",
            summary: "",
            sourceStatus: "GRL guide",
            sourceNote: "",
            verifiedAt: "",
            sources: [],
          }
        : {
            id: uniqueId("venue"),
            name: "",
            address: "",
            url: "",
            description: "",
            features: [],
          };
    if (duplicated) {
      record.id = uniqueId("show");
      record.date = "";
      record.verifiedAt = "";
    }
    state.returnFocus = document.activeElement;
    state.editor = {
      type,
      id: record.id,
      isNew: !existing || duplicated,
      original: record,
      sourceRecords:
        type === "show" &&
        Array.isArray(record.sources) &&
        record.sources.length
          ? clone(record.sources)
          : type === "show"
            ? [{ label: "", url: "" }]
            : [],
    };
    elements.editorFields.replaceChildren();
    elements.editorError.hidden = true;
    elements.editorError.textContent = "";
    elements.editorKicker.textContent =
      type === "show" ? "Music guide listing" : "Venue directory";
    elements.editorTitle.textContent =
      duplicated
        ? "Schedule another date"
        : (existing ? "Edit " : "Add ") + (type === "show" ? "show" : "venue");
    elements.editorSave.textContent = existing && !duplicated ? "Save changes" : "Add " + type;
    elements.editorActionNote.textContent = duplicated
      ? "Set the new date and check the source links for this booking."
      : "Save stages this record. Publish when the guide is ready.";

    addHiddenField("id", record.id);
    const sections = [];
    if (type === "show") {
      const basics = editorSection(
        "show-basics",
        "Who and where",
        "Name the act and choose where the performance takes place.",
      );
      sections.push({ section: basics.section, label: "Basics" });
      addField({
        name: "title",
        label: "Listing title",
        value: record.title,
        required: true,
        placeholder: "Dathan Martin",
        parent: basics.grid,
      });
      addField({
        name: "artist",
        label: "Artist or group",
        value: record.artist,
        required: true,
        placeholder: "Artist name",
        parent: basics.grid,
      });
      addVenueSelect(record.venueId, basics.grid);

      const schedule = editorSection(
        "show-schedule",
        "Date and time",
        duplicated
          ? "Choose the new performance date. The time was copied from the original listing."
          : "Use the venue’s local Grapevine date and time.",
      );
      sections.push({ section: schedule.section, label: "Schedule" });
      addField({
        name: "date",
        label: "Date",
        value: record.date,
        type: "date",
        required: true,
        parent: schedule.grid,
      });
      addField({
        name: "time",
        label: "Start time",
        value: record.time,
        type: "time",
        required: true,
        parent: schedule.grid,
      });
      addField({
        name: "endTime",
        label: "End time",
        value: record.endTime,
        type: "time",
        help: "Optional",
        parent: schedule.grid,
      });

      const presentation = editorSection(
        "show-presentation",
        "Guide details",
        "Add the information visitors need to decide whether to go.",
      );
      sections.push({ section: presentation.section, label: "Details" });
      addField({
        name: "genres",
        label: "Genre or format",
        value: record.genres,
        required: true,
        placeholder: "Live music",
        parent: presentation.grid,
      });
      addField({
        name: "cover",
        label: "Cover or admission",
        value: record.cover,
        required: true,
        placeholder: "Free, $10 or Not listed",
        parent: presentation.grid,
      });
      addField({
        name: "summary",
        label: "Visitor summary",
        value: record.summary,
        type: "textarea",
        full: true,
        maxLength: 1200,
        placeholder: "What should someone know before heading out?",
        help: "Optional. Keep it short and specific.",
        parent: presentation.grid,
      });

      const verification = editorSection(
        "show-sources",
        "Sources and review",
        "Record where the listing came from and when it was last checked.",
      );
      sections.push({ section: verification.section, label: "Sources" });
      addField({
        name: "sourceStatus",
        label: "Source status",
        value: record.sourceStatus,
        placeholder: "GRL guide",
        parent: verification.grid,
      });
      addField({
        name: "verifiedAt",
        label: "Last checked",
        value: record.verifiedAt,
        type: "date",
        help: "Optional. Enter this after reviewing the source links.",
        parent: verification.grid,
      });
      addField({
        name: "sourceNote",
        label: "Public source note",
        value: record.sourceNote,
        type: "textarea",
        full: true,
        maxLength: 1200,
        help: "Optional. Appears in show details under “Check before you go” and in calendar descriptions.",
        parent: verification.grid,
      });
      addSourceEditor(record, verification.grid);
    } else {
      const basics = editorSection(
        "venue-basics",
        "Venue information",
        "Use the public name, complete address and official website.",
      );
      sections.push({ section: basics.section, label: "Basics" });
      addField({
        name: "name",
        label: "Venue name",
        value: record.name,
        required: true,
        full: true,
        placeholder: "Venue name",
        parent: basics.grid,
      });
      addField({
        name: "address",
        label: "Address",
        value: record.address,
        required: true,
        full: true,
        autocomplete: "street-address",
        parent: basics.grid,
      });
      addField({
        name: "url",
        label: "Website",
        value: record.url,
        type: "url",
        required: true,
        full: true,
        placeholder: "https://",
        parent: basics.grid,
      });

      const presentation = editorSection(
        "venue-presentation",
        "Directory description",
        "Explain the room and list the features visitors care about.",
      );
      sections.push({ section: presentation.section, label: "Description" });
      addField({
        name: "description",
        label: "Description",
        value: record.description,
        type: "textarea",
        required: true,
        full: true,
        maxLength: 1200,
        placeholder: "Describe the venue, its music and the experience.",
        parent: presentation.grid,
      });
      addField({
        name: "features",
        label: "Features and amenities",
        value: Array.isArray(record.features) ? record.features.join("\n") : "",
        type: "textarea",
        full: true,
        help: "Enter one per line, such as Patio, Food or All ages.",
        parent: presentation.grid,
      });
    }
    const photo = editorSection(
      "record-photo",
      type === "show" ? "Performer photo" : "Venue photo",
      "Add a licensed image and complete credit when this record needs its own photo.",
      true,
    );
    photo.section.classList.add("photo-fields");
    sections.push({ section: photo.section, label: "Photo" });
    addPhotoFields(record, type, photo.grid);
    renderEditorShortcuts(sections);
    state.editor.initialState = editorState();
    elements.editorDialog.showModal();
    const first = elements.editorFields.querySelector(
      type === "show" ? "#edit-title" : "#edit-name",
    );
    const focusTarget = duplicated
      ? elements.editorFields.querySelector("#edit-date")
      : first;
    window.requestAnimationFrame(() => focusTarget?.focus());
  }

  function editorState() {
    return new URLSearchParams(new FormData(elements.editorForm)).toString();
  }

  function editorDirty() {
    return Boolean(state.editor && editorState() !== state.editor.initialState);
  }

  function editorFailure(message, target) {
    const error = new Error(message);
    error.focusTarget = target;
    return error;
  }

  function setEditorError(message, target = null) {
    elements.editorError.textContent = message;
    elements.editorError.hidden = !message;
    if (!message) return;
    const details = target?.closest("details");
    if (details) details.open = true;
    window.requestAnimationFrame(() => (target || elements.editorError).focus());
  }

  function sourcesFromEditor() {
    syncSourceRecords();
    const sources = state.editor.sourceRecords || [];
    if (!sources.length) throw new Error("Add at least one source.");
    return sources.map((source, index) => {
      const label = String(source.label || "").trim();
      const value = String(source.url || "").trim();
      const row = elements.editorFields.querySelector(`.source-row[data-index="${index}"]`);
      const labelInput = row?.querySelector('[data-source-field="label"]');
      const urlInput = row?.querySelector('[data-source-field="url"]');
      if (!label) throw editorFailure("Add a label for every published link.", labelInput);
      let url;
      try {
        url = new URL(value);
      } catch (_error) {
        throw editorFailure("Each published link needs a complete web address.", urlInput);
      }
      if (!/^https?:$/.test(url.protocol))
        throw editorFailure("Published links must begin with http:// or https://.", urlInput);
      return { ...source, label, url: value };
    });
  }

  function validateEditor() {
    let firstInvalid = null;
    for (const field of elements.editorForm.querySelectorAll("[required]")) {
      field.setCustomValidity("");
      field.removeAttribute("aria-invalid");
      if (!String(field.value).trim()) {
        field.setCustomValidity("Please complete this field.");
        field.setAttribute("aria-invalid", "true");
        firstInvalid ||= field;
      }
    }
    firstInvalid ||= [...elements.editorForm.elements].find(
      (field) => typeof field.checkValidity === "function" && !field.checkValidity(),
    );
    if (!firstInvalid) return true;
    firstInvalid.setAttribute("aria-invalid", "true");
    const label = firstInvalid.closest("label")?.querySelector("span")?.textContent || "required field";
    const message = firstInvalid.validity.valueMissing
      ? "Complete the required field: " + label + "."
      : label + ": " + (firstInvalid.validationMessage || "Enter a valid value.");
    setEditorError(message, firstInvalid);
    firstInvalid.reportValidity();
    return false;
  }

  function saveEditor(event) {
    event.preventDefault();
    setEditorError("");
    if (!state.editor || !validateEditor()) return;
    if (!state.editor.isNew && !editorDirty()) {
      closeEditor();
      setStatus("No changes to save.");
      return;
    }
    const data = new FormData(elements.editorForm);
    try {
      const type = state.editor.type;
      const updated = clone(state.editor.original);
      const photo = readPhoto(data);
      if (photo) updated.photo = photo;
      else delete updated.photo;
      updated.id = state.editor.original.id;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updated.id))
        throw new Error("The record ID must be lowercase kebab-case.");
      if (type === "show") {
        for (const field of [
          "title",
          "artist",
          "venueId",
          "date",
          "time",
          "endTime",
          "genres",
          "cover",
          "summary",
          "sourceStatus",
          "sourceNote",
          "verifiedAt",
        ])
          updated[field] = String(data.get(field) || "").trim();
        updated.sources = sourcesFromEditor();
        if (!isDate(updated.date) || !isTime(updated.time))
          throw editorFailure(
            "Enter a valid show date and start time.",
            !isDate(updated.date)
              ? elements.editorFields.querySelector("#edit-date")
              : elements.editorFields.querySelector("#edit-time"),
          );
        if (updated.endTime && !isTime(updated.endTime))
          throw editorFailure(
            "Enter a valid end time.",
            elements.editorFields.querySelector("#edit-endTime"),
          );
        if (updated.verifiedAt && !isDate(updated.verifiedAt))
          throw editorFailure(
            "Enter a valid checked date.",
            elements.editorFields.querySelector("#edit-verifiedAt"),
          );
      } else {
        for (const field of ["name", "address", "url", "description"])
          updated[field] = String(data.get(field) || "").trim();
        if (!isHttpUrl(updated.url))
          throw editorFailure(
            "The venue website must begin with http:// or https://.",
            elements.editorFields.querySelector("#edit-url"),
          );
        updated.features = [
          ...new Set(
            String(data.get("features") || "")
              .split(/\r?\n/)
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        ];
      }
      const collection = type === "show" ? shows() : venues();
      const index = collection.findIndex((item) => item.id === updated.id);
      if (state.editor.isNew) {
        if (index !== -1) throw new Error("This ID is already in use.");
        collection.push(updated);
      } else {
        if (index === -1) throw new Error("This record no longer exists.");
        collection[index] = updated;
      }
      closeEditor();
      renderCatalog();
      setStatus(
        (type === "show" ? "Show" : "Venue") +
          " saved. Publish changes when ready.",
      );
    } catch (error) {
      setEditorError(error.message || "Review the form and try again.", error.focusTarget);
    }
  }

  function closeEditor() {
    const editorType = state.editor?.type;
    state.editor = null;
    elements.editorDialog.close();
    const target = state.returnFocus;
    const action = target?.dataset?.action || "";
    const id = target?.dataset?.id || "";
    state.returnFocus = null;
    window.requestAnimationFrame(() => {
      const replacement = action
        ? [...document.querySelectorAll("button[data-action]")].find(
            (button) => button.dataset.action === action && button.dataset.id === id,
          )
        : null;
      const fallback = editorType === "show" ? elements.addShow : elements.addVenue;
      (target?.isConnected ? target : replacement || fallback)?.focus();
    });
  }

  async function requestEditorClose() {
    if (!state.editor) return;
    if (
      editorDirty() &&
      !(await confirmAction({
        title: "Discard changes?",
        message: "Changes in this form have not been saved.",
        label: "Discard changes",
        danger: true,
      }))
    )
      return;
    closeEditor();
  }

  function confirmAction({ title, message, label, danger = true }) {
    if (state.confirmResolve) return Promise.resolve(false);
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmAction.textContent = label;
    elements.confirmAction.className = danger
      ? "danger-button"
      : "primary-button";
    elements.confirmDialog.returnValue = "cancel";
    elements.confirmDialog.showModal();
    window.requestAnimationFrame(() => elements.confirmCancel.focus());
    return new Promise((resolve) => {
      state.confirmResolve = resolve;
    });
  }

  function finishConfirmation() {
    const resolve = state.confirmResolve;
    state.confirmResolve = null;
    if (resolve) resolve(elements.confirmDialog.returnValue === "confirm");
  }

  async function removeShow(id) {
    const show = shows().find((item) => item.id === id);
    if (!show) return;
    const approved = await confirmAction({
      title: "Remove show?",
      message:
        (show.title || "This show") +
        " will be removed from the working copy. Publish to make the removal public.",
      label: "Remove show",
    });
    if (!approved) return;
    state.catalog[state.showKey] = shows().filter((item) => item.id !== id);
    renderCatalog();
    setStatus("Show removed. Publish changes when ready.");
    elements.addShow.focus();
  }

  async function removeVenue(id) {
    const venue = venues().find((item) => item.id === id);
    if (!venue) return;
    const linked = shows().filter((show) => show.venueId === id);
    if (linked.length) {
      setWorkspaceAlert(
        "This venue is used by " +
          linked.length +
          (linked.length === 1 ? " show" : " shows") +
          ". Reassign or remove those shows first.",
      );
      return;
    }
    const approved = await confirmAction({
      title: "Remove venue?",
      message:
        (venue.name || "This venue") +
        " will be removed from the working copy. Publish to make the removal public.",
      label: "Remove venue",
    });
    if (!approved) return;
    state.catalog.venues = venues().filter((item) => item.id !== id);
    renderCatalog();
    setStatus("Venue removed. Publish changes when ready.");
    elements.addVenue.focus();
  }

  async function publishCatalog() {
    if (!hasChanges() || state.busy || state.conflict) return;
    if (editionFormChanged()) {
      selectTab("edition");
      if (!applyEdition(null, true)) return;
    }
    if (!isDirty()) return;
    clearMessages();
    try {
      validateCatalog(state.catalog, state.revision);
    } catch (error) {
      setWorkspaceAlert(error.message);
      return;
    }
    setBusy(true, "Publishing changes…");
    try {
      const payload = await request("/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revision: state.revision,
          catalog: state.catalog,
        }),
      });
      if (!Object.hasOwn(payload, "revision"))
        throw new ApiError(0, { reason: "invalid-revision" });
      if (payload.catalog !== undefined && !isCatalog(payload.catalog))
        throw new ApiError(0, { reason: "invalid-catalog" });
      const nextCatalog = payload.catalog
        ? clone(payload.catalog)
        : clone(state.catalog);
      nextCatalog.revision = payload.revision;
      validateCatalog(nextCatalog, payload.revision);
      state.revision = payload.revision;
      state.showKey = Array.isArray(nextCatalog.events) ? "events" : "shows";
      state.catalog = nextCatalog;
      state.publishedCatalog = clone(state.catalog);
      state.conflict = false;
      state.conflictDraft = null;
      elements.conflictPanel.hidden = true;
      elements.downloadDraft.hidden = true;
      renderEdition();
      renderCatalog();
      setStatus("Changes published. Revision " + String(state.revision) + ".");
    } catch (error) {
      if (error.status === 409 || error.status === 412) {
        state.conflict = true;
        state.conflictDraft = clone(state.catalog);
        elements.conflictPanel.hidden = false;
        elements.downloadDraft.hidden = false;
        setWorkspaceAlert(
          "Publishing stopped because the catalog changed elsewhere.",
        );
      } else if (error.status === 401 || error.status === 403) {
        showLogin(errorMessage(error), { preserveDraft: true });
      } else {
        setWorkspaceAlert(errorMessage(error));
      }
    } finally {
      setBusy(false);
      updateChangeState();
    }
  }

  async function reloadLatest() {
    if (state.busy) return;
    if (
      (hasChanges() || state.conflictDraft) &&
      !(await confirmAction({
        title: "Reload latest catalog?",
        message: "Your unpublished changes will be discarded.",
        label: "Reload latest",
        danger: true,
      }))
    )
      return;
    clearMessages();
    setBusy(true, "Loading the latest catalog…");
    try {
      await loadCatalog();
      setStatus("Latest catalog loaded.");
    } catch (error) {
      if (error.status === 401 || error.status === 403)
        showLogin(errorMessage(error));
      else setWorkspaceAlert(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function downloadUnpublishedCopy() {
    if (!state.catalog) return;
    const draft = clone(state.conflictDraft || state.catalog);
    if (!state.conflictDraft && editionFormChanged()) draft.edition = { ...draft.edition, ...editionFormValues() };
    if (!draft) return;
    const blob = new Blob([JSON.stringify(draft, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (state.conflictDraft || hasChanges() ? "grl-unpublished-catalog-" : "grl-catalog-") + localDate() + ".json";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Catalog downloaded.");
  }

  async function signOut() {
    if (state.busy) return;
    if (
      (hasChanges() || state.conflictDraft) &&
      !(await confirmAction({
        title: "Sign out?",
        message: "Your unpublished changes will be discarded.",
        label: "Sign out",
        danger: true,
      }))
    )
      return;
    setBusy(true);
    try {
      await request("/logout", { method: "POST" });
    } catch (_error) {
      // The in-memory token is cleared even if the server cannot be reached.
    } finally {
      setBusy(false);
      showLogin();
    }
  }

  function clearShowFilters({ focus = false } = {}) {
    elements.showSearch.value = "";
    elements.showDateFilter.value = "";
    elements.showVenueFilter.value = "";
    elements.showSort.value = "soonest";
    renderShows();
    if (focus) elements.showSearch.focus();
  }

  function clearVenueFilters({ focus = false } = {}) {
    elements.venueSearch.value = "";
    elements.venueSort.value = "name";
    renderVenues();
    if (focus) elements.venueSearch.focus();
  }

  function filterShowsByVenue(venueId) {
    const venue = venues().find((record) => record.id === venueId);
    if (!venue) return;
    elements.showSearch.value = "";
    elements.showDateFilter.value = "";
    elements.showVenueFilter.value = venueId;
    elements.showSort.value = "soonest";
    selectTab("shows");
    renderShows();
    elements.showVenueFilter.focus();
    setStatus("Showing shows at " + venue.name + ".");
  }

  function handleRecordAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    clearMessages();
    const { action, id } = button.dataset;
    if (action === "edit-show") openEditor("show", id);
    if (action === "duplicate-show") {
      const show = shows().find((record) => record.id === id);
      if (show) openEditor("show", "", { seed: show, duplicate: true });
      else
        setWorkspaceAlert(
          "This show could not be duplicated. Open it and add a new show instead.",
        );
    }
    if (action === "remove-show") removeShow(id);
    if (action === "edit-venue") openEditor("venue", id);
    if (action === "remove-venue") removeVenue(id);
    if (action === "filter-shows") filterShowsByVenue(id);
    if (action === "clear-show-filters") clearShowFilters({ focus: true });
    if (action === "clear-venue-filters") clearVenueFilters({ focus: true });
  }

  function handleTabKeys(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const order = ["overview", "shows", "venues", "edition"];
    if (event.key === "Home") return selectTab(order[0], true);
    if (event.key === "End") return selectTab(order.at(-1), true);
    const current = order.indexOf(state.activeTab),
      offset = event.key === "ArrowRight" ? 1 : -1,
      next = (current + offset + order.length) % order.length;
    selectTab(order[next], true);
  }


  clearLegacyAccessKey();
  elements.loginForm.addEventListener("submit", signIn);
  elements.signOut.addEventListener("click", signOut);
  elements.publish.addEventListener("click", publishCatalog);
  elements.reloadLatest.addEventListener("click", reloadLatest);
  elements.downloadDraft.addEventListener("click", downloadUnpublishedCopy);
  elements.addShow.addEventListener("click", () => {
    if (!venues().length) {
      setWorkspaceAlert("Add a venue before adding a show.");
      return;
    }
    openEditor("show");
  });
  elements.addVenue.addEventListener("click", () => openEditor("venue"));
  elements.showsTab.addEventListener("click", () => selectTab("shows"));
  elements.venuesTab.addEventListener("click", () => selectTab("venues"));
  elements.editionTab.addEventListener("click", () => selectTab("edition"));
  elements.showsTab.parentElement.addEventListener("keydown", handleTabKeys);
  elements.showSearch.addEventListener("input", renderShows);
  elements.showDateFilter.addEventListener("change", renderShows);
  elements.showVenueFilter.addEventListener("change", renderShows);
  elements.showSort.addEventListener("change", renderShows);
  elements.showFiltersClear.addEventListener("click", () =>
    clearShowFilters({ focus: true }),
  );
  elements.venueSearch.addEventListener("input", renderVenues);
  elements.venueSort.addEventListener("change", renderVenues);
  elements.venueFiltersClear.addEventListener("click", () =>
    clearVenueFilters({ focus: true }),
  );
  elements.editionForm.addEventListener("submit", applyEdition);
  elements.editionForm.addEventListener("input", (event) => {
    event.target.setCustomValidity("");
    event.target.removeAttribute("aria-invalid");
    setEditionError("");
    updateChangeState();
  });
  elements.showsList.addEventListener("click", handleRecordAction);
  elements.venuesList.addEventListener("click", handleRecordAction);
  elements.editorForm.addEventListener("submit", saveEditor);
  elements.editorForm.addEventListener("input", (event) => {
    event.target.setCustomValidity?.("");
    event.target.removeAttribute?.("aria-invalid");
    setEditorError("");
  });
  elements.editorCancel.addEventListener("click", requestEditorClose);
  elements.editorClose.addEventListener("click", requestEditorClose);
  elements.editorDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    requestEditorClose();
  });
  elements.confirmDialog.addEventListener("close", finishConfirmation);
  window.addEventListener("hashchange", clearLegacyAccessKey);
  window.addEventListener("beforeunload", (event) => {
    if (!hasChanges() && !editorDirty() && !state.conflictDraft && !state.pendingReauth) return;
    event.preventDefault();
    event.returnValue = "";
  });

  desk("overview-tab").addEventListener("click", () => selectTab("overview"));
  elements.workspace.addEventListener("click", event => {
    const tab = event.target.closest("[data-desk-tab]");
    if (tab) selectTab(tab.dataset.deskTab, true);
    const edit = event.target.closest("[data-desk-edit]");
    if (edit) openEditor("show", edit.dataset.deskEdit);
  });
  desk("desk-agenda-date").addEventListener("change", renderDeskAgenda);
  desk("desk-add-show").addEventListener("click", () => elements.addShow.click());
  desk("desk-add-venue").addEventListener("click", () => elements.addVenue.click());
  desk("desk-review-changes").addEventListener("click", () => desk("review-dialog").showModal());
  desk("desk-review-publish").addEventListener("click", () => {
    desk("review-dialog").close();
    publishCatalog();
  });
  desk("desk-export").addEventListener("click", downloadUnpublishedCopy);
  desk("desk-refresh").addEventListener("click", reloadLatest);
  desk("desk-discard").addEventListener("click", discardCatalogDraft);
  selectTab("overview");
})();
