(() => {
  "use strict";

  const ACCESS_KEY_STORAGE = "grl-owner-access-key";
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
    venueSearch: document.querySelector("#venue-search"),
    showsCount: document.querySelector("#shows-count"),
    venuesCount: document.querySelector("#venues-count"),
    showsList: document.querySelector("#shows-list"),
    venuesList: document.querySelector("#venues-list"),
    editorDialog: document.querySelector("#editor-dialog"),
    editorForm: document.querySelector("#editor-form"),
    editorTitle: document.querySelector("#editor-title"),
    editorFields: document.querySelector("#editor-fields"),
    editorError: document.querySelector("#editor-error"),
    editorSave: document.querySelector("#editor-save"),
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
    activeTab: "shows",
    conflict: false,
    conflictDraft: null,
    pendingReauth: null,
    editor: null,
    confirmResolve: null,
    returnFocus: null,
    privateKey: "",
    busy: false,
  };

  class ApiError extends Error {
    constructor(status, payload) {
      super("Owner API request failed");
      this.name = "ApiError";
      this.status = status;
      this.payload = payload;
    }
  }

  function readPrivateKey() {
    const rawFragment = window.location.hash.slice(1);
    const params = new URLSearchParams(rawFragment);
    const fragmentKey = String(params.get("key") || "").trim();
    if (fragmentKey) {
      state.privateKey = fragmentKey;
      try {
        window.localStorage.setItem(ACCESS_KEY_STORAGE, fragmentKey);
      } catch (_error) {
        // The key remains available for this page even if storage is blocked.
      }
      params.delete("key");
      const remaining = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          window.location.search +
          (remaining ? "#" + remaining : ""),
      );
      return;
    }
    try {
      state.privateKey = String(
        window.localStorage.getItem(ACCESS_KEY_STORAGE) || "",
      ).trim();
    } catch (_error) {
      state.privateKey = "";
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
      return "The owner service is unavailable. Try again later.";
    if (error?.status === 429)
      return "Too many attempts. Wait a moment, then try again.";
    if (error?.status === 401 || error?.status === 403) {
      if (context === "login" && !state.privateKey)
        return "Use the private owner link on this device, then sign in again.";
      return context === "login"
        ? "The username or password was not accepted."
        : "Your session has ended. Sign in again.";
    }
    if (error?.status === 409 || error?.status === 412)
      return "A newer catalog version is available.";
    if (error?.status === 400 || error?.status === 422)
      return "The catalog was not accepted. Review the entries and try again.";
    if (context === "login") return "Unable to sign in. Try again.";
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
    if (label) setStatus(label);
  }

  function isCatalog(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
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
        fail("Every venue website must be a complete http:// or https:// address.");
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
        fail("Complete the title, artist, genre and cover fields for every show.");
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
    return JSON.stringify(state.catalog) !== JSON.stringify(state.publishedCatalog);
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

  function applyEdition(event, quiet = false) {
    event?.preventDefault();
    elements.editionError.textContent = "";
    elements.editionError.hidden = true;
    for (const field of elements.editionForm.querySelectorAll("[required]")) {
      field.setCustomValidity("");
      if (!String(field.value).trim())
        field.setCustomValidity("Please complete this field.");
    }
    if (!elements.editionForm.reportValidity()) return false;
    const values = editionFormValues();
    if (
      !isDate(values.startDate) ||
      !isDate(values.endDate) ||
      !isDate(values.sourceCheckedDate)
    ) {
      elements.editionError.textContent = "Enter valid edition dates.";
      elements.editionError.hidden = false;
      elements.editionError.focus();
      return false;
    }
    if (values.endDate < values.startDate) {
      elements.editionEnd.setCustomValidity(
        "End date must be on or after the start date.",
      );
      elements.editionEnd.reportValidity();
      return false;
    }
    state.catalog.edition = { ...state.catalog.edition, ...values };
    updateChangeState();
    if (!quiet) setStatus("Edition saved. Publish changes when ready.");
    return true;
  }

  function updateChangeState() {
    const dirty = hasChanges();
    elements.changeState.textContent = dirty
      ? "Unpublished changes"
      : "No unpublished changes";
    elements.changeState.classList.toggle("unsaved", dirty);
    elements.publish.disabled = state.busy || !dirty || state.conflict;
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
    document.title = "Owner login | Grapevine Rocks Live";
    elements.username.focus();
  }

  async function loadCatalog() {
    const payload = await request("/catalog", { method: "GET" });
    useCatalog(payload);
  }

  function restoreAfterReauthentication(payload) {
    const pending = state.pendingReauth;
    if (!pending) {
      useCatalog(payload);
      return "loaded";
    }
    if (!payload || !isCatalog(payload.catalog) || !Object.hasOwn(payload, "revision"))
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
    elements.signIn.textContent = "Signing in…";
    try {
      const payload = await request(
        "/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: elements.username.value.trim(),
            password: elements.password.value,
            accessKey: state.privateKey,
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
        setStatus("Signed in. Unpublished changes restored.");
      else if (outcome === "conflict")
        setWorkspaceAlert(
          "The catalog changed while your session was inactive. Your unpublished copy has not been overwritten.",
        );
      else setStatus("Catalog loaded.");
      [elements.showsTab, elements.venuesTab, elements.editionTab]
        .find((tab) => tab.getAttribute("aria-selected") === "true")
        ?.focus();
    } catch (error) {
      state.token = "";
      setLoginError(errorMessage(error, "login"));
    } finally {
      setBusy(false);
      elements.signIn.textContent = "Sign in";
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

  function renderShows() {
    const query = elements.showSearch.value.trim().toLocaleLowerCase();
    const sorted = [...shows()].sort((a, b) =>
      [a.date || "", a.time || "", a.title || ""].join("|").localeCompare(
        [b.date || "", b.time || "", b.title || ""].join("|"),
      ),
    );
    const filtered = sorted.filter((show) =>
      [
        show.title,
        show.artist,
        show.date,
        show.time,
        venueName(show.venueId),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
    elements.showsCount.textContent = query
      ? filtered.length + " of " + sorted.length + " shows"
      : sorted.length + (sorted.length === 1 ? " show" : " shows");
    elements.showsList.replaceChildren();
    if (!filtered.length) {
      elements.showsList.append(
        makeElement(
          "p",
          "empty-state",
          query ? "No shows match this search." : "No shows have been added.",
        ),
      );
      return;
    }
    for (const show of filtered) {
      const card = makeElement("article", "record-card");
      const main = makeElement("div", "record-main");
      main.append(makeElement("h3", "", show.title || "Untitled show"));
      const details = [
        formatDate(show.date),
        formatTime(show.time),
        venueName(show.venueId),
      ].filter(Boolean);
      main.append(makeElement("p", "", details.join(" · ")));
      const actions = makeElement("div", "record-actions");
      actions.append(
        actionButton("Edit", "edit-show", show.id),
        actionButton("Remove", "remove-show", show.id, true),
      );
      card.append(main, actions);
      elements.showsList.append(card);
    }
  }

  function renderVenues() {
    const query = elements.venueSearch.value.trim().toLocaleLowerCase();
    const sorted = [...venues()].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")),
    );
    const filtered = sorted.filter((venue) =>
      [venue.name, venue.address]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
    elements.venuesCount.textContent = query
      ? filtered.length + " of " + sorted.length + " venues"
      : sorted.length + (sorted.length === 1 ? " venue" : " venues");
    elements.venuesList.replaceChildren();
    if (!filtered.length) {
      elements.venuesList.append(
        makeElement(
          "p",
          "empty-state",
          query ? "No venues match this search." : "No venues have been added.",
        ),
      );
      return;
    }
    for (const venue of filtered) {
      const card = makeElement("article", "record-card");
      const main = makeElement("div", "record-main");
      main.append(makeElement("h3", "", venue.name || "Unnamed venue"));
      main.append(makeElement("p", "", venue.address || "No address"));
      const actions = makeElement("div", "record-actions");
      actions.append(
        actionButton("Edit", "edit-venue", venue.id),
        actionButton("Remove", "remove-venue", venue.id, true),
      );
      card.append(main, actions);
      elements.venuesList.append(card);
    }
  }

  function renderCatalog() {
    renderShows();
    renderVenues();
    updateChangeState();
  }

  function selectTab(tab, focus = false) {
    state.activeTab = tab;
    const items = [
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
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
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
    control.required = required;
    control.readOnly = readonly;
    if (maxLength) control.maxLength = maxLength;
    wrapper.append(control);
    if (help) wrapper.append(makeElement("span", "field-help", help));
    elements.editorFields.append(wrapper);
    return control;
  }

  function addVenueSelect(value) {
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
    elements.editorFields.append(wrapper);
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
      const remove = makeElement("button", "text-button danger", "Remove source");
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

  function addSourceEditor(record) {
    const fieldset = makeElement("fieldset", "source-editor full-field");
    fieldset.append(makeElement("legend", "", "Sources"));
    fieldset.append(
      makeElement(
        "p",
        "field-help",
        "Add at least one published source for this show.",
      ),
    );
    const rows = makeElement("div", "source-rows");
    rows.id = "source-rows";
    const add = makeElement("button", "secondary-button", "Add source");
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
    elements.editorFields.append(fieldset);
    renderSourceRows();
  }

  function openEditor(type, id = "") {
    clearMessages();
    const collection = type === "show" ? shows() : venues();
    const existing = id ? collection.find((item) => item.id === id) : null;
    const record = existing
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
            verifiedAt: localDate(),
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
    state.returnFocus = document.activeElement;
    state.editor = {
      type,
      id: record.id,
      isNew: !existing,
      original: record,
      sourceRecords:
        type === "show" && Array.isArray(record.sources) && record.sources.length
          ? clone(record.sources)
          : type === "show"
            ? [{ label: "", url: "" }]
            : [],
    };
    elements.editorFields.replaceChildren();
    elements.editorError.hidden = true;
    elements.editorError.textContent = "";
    elements.editorTitle.textContent =
      (existing ? "Edit " : "Add ") + (type === "show" ? "show" : "venue");
    elements.editorSave.textContent = existing ? "Save changes" : "Add " + type;

    addField({ name: "id", label: "ID", value: record.id, readonly: true, full: true });
    if (type === "show") {
      addField({ name: "title", label: "Show title", value: record.title, required: true });
      addField({ name: "artist", label: "Artist", value: record.artist, required: true });
      addVenueSelect(record.venueId);
      addField({ name: "date", label: "Date", value: record.date, type: "date", required: true });
      addField({ name: "time", label: "Start time", value: record.time, type: "time", required: true });
      addField({ name: "endTime", label: "End time", value: record.endTime, type: "time" });
      addField({ name: "genres", label: "Genre or format", value: record.genres, required: true, full: true });
      addField({ name: "cover", label: "Cover or admission", value: record.cover, required: true, full: true });
      addField({ name: "summary", label: "Summary", value: record.summary, type: "textarea", full: true, maxLength: 1200 });
      addField({ name: "sourceStatus", label: "Source status", value: record.sourceStatus, full: true });
      addField({ name: "sourceNote", label: "Source note", value: record.sourceNote, type: "textarea", full: true, maxLength: 1200 });
      addField({ name: "verifiedAt", label: "Checked date", value: record.verifiedAt, type: "date" });
      addSourceEditor(record);
    } else {
      addField({ name: "name", label: "Venue name", value: record.name, required: true, full: true });
      addField({ name: "address", label: "Address", value: record.address, required: true, full: true });
      addField({ name: "url", label: "Website", value: record.url, type: "url", required: true, full: true });
      addField({ name: "description", label: "Description", value: record.description, type: "textarea", required: true, full: true, maxLength: 1200 });
      addField({
        name: "features",
        label: "Features",
        value: Array.isArray(record.features) ? record.features.join("\n") : "",
        type: "textarea",
        full: true,
        help: "Enter one feature per line.",
      });
    }
    state.editor.initialState = editorState();
    elements.editorDialog.showModal();
    elements.editorFields
      .querySelector("input:not([readonly]), select, textarea")
      ?.focus();
  }

  function editorState() {
    return new URLSearchParams(new FormData(elements.editorForm)).toString();
  }

  function editorDirty() {
    return Boolean(state.editor && editorState() !== state.editor.initialState);
  }

  function setEditorError(message) {
    elements.editorError.textContent = message;
    elements.editorError.hidden = !message;
    if (message) elements.editorError.focus();
  }

  function sourcesFromEditor() {
    syncSourceRecords();
    const sources = state.editor.sourceRecords || [];
    if (!sources.length) throw new Error("Add at least one source.");
    return sources.map((source) => {
      const label = String(source.label || "").trim();
      const value = String(source.url || "").trim();
      if (!label) throw new Error("Complete every source label.");
      let url;
      try {
        url = new URL(value);
      } catch (_error) {
        throw new Error("Each source needs a complete web address.");
      }
      if (!/^https?:$/.test(url.protocol))
        throw new Error("Source URLs must begin with http:// or https://.");
      return { ...source, label, url: value };
    });
  }

  function validateEditor() {
    for (const field of elements.editorForm.querySelectorAll("[required]")) {
      field.setCustomValidity("");
      if (!String(field.value).trim())
        field.setCustomValidity("Please complete this field.");
    }
    return elements.editorForm.reportValidity();
  }

  function saveEditor(event) {
    event.preventDefault();
    setEditorError("");
    if (!state.editor || !validateEditor()) return;
    const data = new FormData(elements.editorForm);
    try {
      const type = state.editor.type;
      const updated = clone(state.editor.original);
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
          throw new Error("Enter a valid show date and start time.");
        if (updated.endTime && !isTime(updated.endTime))
          throw new Error("Enter a valid end time.");
        if (updated.verifiedAt && !isDate(updated.verifiedAt))
          throw new Error("Enter a valid checked date.");
      } else {
        for (const field of ["name", "address", "url", "description"])
          updated[field] = String(data.get(field) || "").trim();
        if (!isHttpUrl(updated.url))
          throw new Error("The venue website must begin with http:// or https://.");
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
      setStatus((type === "show" ? "Show" : "Venue") + " saved. Publish changes when ready.");
    } catch (error) {
      setEditorError(error.message || "Review the form and try again.");
    }
  }

  function closeEditor() {
    state.editor = null;
    elements.editorDialog.close();
    const target = state.returnFocus;
    state.returnFocus = null;
    window.requestAnimationFrame(() => target?.isConnected && target.focus());
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
    elements.confirmAction.className = danger ? "danger-button" : "primary-button";
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
    if (editionFormChanged() && !applyEdition(null, true)) return;
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
        setWorkspaceAlert("Publishing stopped because the catalog changed elsewhere.");
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
      hasChanges() &&
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
    const draft = state.conflictDraft || (state.conflict ? state.catalog : null);
    if (!draft) return;
    const blob = new Blob([JSON.stringify(draft, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grl-unpublished-catalog-" + localDate() + ".json";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Unpublished copy downloaded.");
  }

  async function signOut() {
    if (state.busy) return;
    if (
      hasChanges() &&
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

  function handleRecordAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    clearMessages();
    const { action, id } = button.dataset;
    if (action === "edit-show") openEditor("show", id);
    if (action === "remove-show") removeShow(id);
    if (action === "edit-venue") openEditor("venue", id);
    if (action === "remove-venue") removeVenue(id);
  }

  function handleTabKeys(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const order = ["shows", "venues", "edition"];
    if (event.key === "Home") return selectTab(order[0], true);
    if (event.key === "End") return selectTab(order.at(-1), true);
    const current = order.indexOf(state.activeTab),
      offset = event.key === "ArrowRight" ? 1 : -1,
      next = (current + offset + order.length) % order.length;
    selectTab(order[next], true);
  }

  readPrivateKey();
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
  elements.venueSearch.addEventListener("input", renderVenues);
  elements.editionForm.addEventListener("submit", applyEdition);
  elements.editionForm.addEventListener("input", (event) => {
    event.target.setCustomValidity("");
    elements.editionError.hidden = true;
    updateChangeState();
  });
  elements.showsList.addEventListener("click", handleRecordAction);
  elements.venuesList.addEventListener("click", handleRecordAction);
  elements.editorForm.addEventListener("submit", saveEditor);
  elements.editorForm.addEventListener("input", (event) =>
    event.target.setCustomValidity?.(""),
  );
  elements.editorCancel.addEventListener("click", requestEditorClose);
  elements.editorClose.addEventListener("click", requestEditorClose);
  elements.editorDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    requestEditorClose();
  });
  elements.confirmDialog.addEventListener("close", finishConfirmation);
  window.addEventListener("hashchange", readPrivateKey);
  window.addEventListener("beforeunload", (event) => {
    if (!hasChanges()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  selectTab("shows");
})();
