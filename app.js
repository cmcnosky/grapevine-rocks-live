(() => {
  "use strict";
  if (
    !window.GRLGuide ||
    !window.GRLArchive ||
    !window.GRLSocial ||
    !Array.isArray(window.GRLPostIndex)
  )
    return;
  const main = document.getElementById("main");
  const nav = document.getElementById("primary");
  const menu = document.querySelector(".menu-toggle");
  const social = window.GRLSocial;
  const contact = Object.freeze({
    instagramMessage: "https://ig.me/m/grapevinerockslive",
    facebookMessage: "https://m.me/GrapevineRocksLive",
    chamber:
      "https://business.grapevinechamber.org/list/member/grapevine-rocks-live-15383",
  });
  const series = [
    {
      id: "garys-rock-run",
      name: "Gary’s Rock Run",
      art: "rock-run",
      label: "GRL original",
    },
    {
      id: "melissa-on-main",
      name: "Melissa On Main",
      art: "main-street",
      label: "GRL original",
    },
    {
      id: "real-bartenders",
      name: "The Real Bartenders of Grapevine",
      art: "bartenders",
      label: "GRL original",
    },
    {
      id: "live-music-guide",
      name: "Live Music Guide",
      art: null,
      label: "Two editions a week",
    },
    {
      id: "late-night-lauren",
      name: "Late Night Lauren",
      art: null,
      label: "GRL original",
    },
    {
      id: "band-of-the-month",
      name: "Band of the Month",
      art: null,
      label: "Music feature",
    },
  ];
  const plans = [
    [
      "community",
      "Community",
      "Venue profile and partner recognition in the twice-weekly music guides, alongside regular music coverage.",
    ],
    [
      "featured",
      "Featured",
      "Community benefits plus a dedicated promotional social post each month and opportunities for a coordinated feature.",
    ],
    [
      "premier",
      "Premier",
      "Featured benefits with priority placement, two dedicated promotional posts per month and planning for special campaigns.",
    ],
  ];
  const businesses = [
    {
      id: "guitar-loft",
      name: "Grapevine Guitar Loft",
      kind: "Music shop",
      address: "1641 W. Northwest Hwy",
      text: "Head upstairs at the Grapevine Antique Market for acoustic and electric guitars, ukuleles and accessories.",
      url: "https://www.guitarasaur.com/",
      video: [
        "Shop video on YouTube",
        "https://www.youtube.com/watch?v=_GDRWvdhpC8",
      ],
    },
    {
      id: "vetro",
      name: "Vetro Glassblowing Studio & Fine Art Gallery",
      kind: "Arts & makers",
      address: "701 S. Main St., Suite 103",
      text: "A working glass studio and gallery on South Main. Its Help Create events invite visitors to assist a glass artist with a piece of their own.",
      url: "https://vetroartglass.com/",
    },
    {
      id: "antique-market",
      name: "Grapevine Antique Market",
      kind: "Records & antiques",
      address: "1641 W. Northwest Hwy",
      text: "Record bins, antiques and collectibles share a roof with a guitar shop and Coco’s Tea Room.",
      url: "https://www.grapevineantiquemarket.com/",
    },
  ];
  const esc = (s = "") =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const external = (label, url) =>
    '<a href="' + esc(url) + '" rel="external noopener">' + esc(label) + "</a>";
  const button = (label, to, style = "") =>
    '<a class="btn ' + style + '" href="' + to + '">' + label + "</a>";
  const externalButton = (label, url, style = "") =>
    '<a class="btn ' +
    style +
    '" href="' +
    esc(url) +
    '" rel="external noopener">' +
    esc(label) +
    "</a>";
  const header = (k, title, sub, color = "") =>
    '<section class="pagehead ' +
    color +
    '"><div class="wrap"><p class="kicker">' +
    k +
    '</p><h1 class="big-title">' +
    title +
    "</h1>" +
    (sub ? '<p class="sub">' + sub + "</p>" : "") +
    "</div></section>";
  const card = (s) =>
    '<a class="series-card" href="#series/' +
    s.id +
    '"><img src="assets/' +
    s.art +
    '.webp" width="724" height="724" loading="lazy" alt=""><div class="card-body"><span class="tag">' +
    s.label +
    "</span><h3>" +
    s.name +
    "</h3></div></a>";
  const profileLinks = () =>
    social.profiles.map((p) => external(p.label, p.url)).join(" · ");
  const visibleSeries = () =>
    series.filter(
      (item) =>
        item.id === "live-music-guide" ||
        social.episodes.some((episode) => episode.series === item.id),
    );
  const displayDate = (value, options) =>
    new Intl.DateTimeFormat("en-US", options).format(
      new Date(value + "T12:00:00"),
    );
  function editionLabel() {
    const dates = window.GRLGuide
      .getShows()
      .map((show) => show.date)
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .sort();
    if (!dates.length) return "Published music listings";
    const first = dates[0],
      last = dates.at(-1),
      firstYear = first.slice(0, 4),
      lastYear = last.slice(0, 4),
      firstMonth = first.slice(0, 7),
      lastMonth = last.slice(0, 7);
    if (first === last)
      return (
        "Published listings · " +
        displayDate(first, { month: "short", day: "numeric", year: "numeric" })
      );
    if (firstYear === lastYear && firstMonth === lastMonth)
      return (
        "Published listings · " +
        displayDate(first, { month: "short", day: "numeric" }) +
        "–" +
        displayDate(last, { day: "numeric" }) +
        ", " +
        lastYear
      );
    return (
      "Published listings · " +
      displayDate(first, { month: "short", day: "numeric", year: "numeric" }) +
      "–" +
      displayDate(last, { month: "short", day: "numeric", year: "numeric" })
    );
  }
  function reader(e) {
    if (
      e.platform !== "Instagram" ||
      !/^https:\/\/www\.instagram\.com\/(p|reel)\/[\w-]+\/?$/.test(e.url)
    )
      return "";
    return (
      '<details class="post-reader"><summary>View Instagram post here</summary><div data-embed="' +
      esc(e.url.replace(/\/$/, "") + "/embed/") +
      '" data-caption="' +
      esc(e.title) +
      '"></div><small>Instagram loads when opened. The original post also opens via the link above.</small></details>'
    );
  }
  function bindReaders() {
    main.querySelectorAll(".post-reader").forEach((box) =>
      box.addEventListener("toggle", () => {
        const host = box.querySelector("[data-embed]");
        if (!box.open) {
          host.replaceChildren();
          return;
        }
        if (host.firstChild) return;
        const frame = document.createElement("iframe");
        frame.src = host.dataset.embed;
        frame.title = "Instagram post: " + host.dataset.caption;
        frame.allowFullscreen = true;
        frame.setAttribute(
          "allow",
          "encrypted-media; fullscreen; picture-in-picture",
        );
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        host.append(frame);
      }),
    );
  }
  const episodeList = (list) =>
    list
      .map(
        (e) =>
          '<article class="story"><span class="meta">' +
          esc(e.platform) +
          (e.date ? " · " + esc(e.date) : "") +
          "</span><h2>" +
          esc(e.title) +
          "</h2><p>" +
          esc(e.description) +
          "</p>" +
          external("Open original on " + e.platform, e.url) +
          reader(e) +
          "</article>",
      )
      .join("");
  function home() {
    return (
      '<section class="hero"><div class="wrap hero-in"><div class="hero-copy"><p class="eyebrow edition">' +
      esc(editionLabel()) +
      '</p><h1>Grapevine<br><span>After Dark.</span></h1><p>Find a band, pick a room, and make a night of it. Your field guide to live music in Grapevine, Texas.</p><div class="hero-actions">' +
      button("Explore the music guide", "#guide") +
      '<a class="text-link" href="#tv">Explore GRL TV</a></div></div><figure class="poster"><img src="assets/hero.webp" fetchpriority="high" width="1350" height="900" alt="An illustrated guitarist in a fringed jacket under a hot-pink and orange stage sun."><figcaption><span>GRAPEVINE ROCKS LIVE</span><span><span class="poster-star" aria-hidden="true">★</span> TEXAS</span></figcaption></figure></div></section>' +
      '<div class="music-strip"><div class="wrap" aria-label="Music covered">Rock <i aria-hidden="true">✦</i> Country <i aria-hidden="true">✦</i> Blues <i aria-hidden="true">✦</i> Americana <i aria-hidden="true">✦</i> Pop <i aria-hidden="true">✦</i> Live in Grapevine</div></div>' +
      '<section class="band"><div class="wrap"><div class="top-line"><div><p class="kicker">Published venue listings</p><h2 class="display">On the bill</h2></div><a class="text-link" href="#guide">See the full guide</a></div><div class="home-guide">' +
      window.GRLGuide.homeRows() +
      '</div><p class="home-original">Read the original <a href="https://www.instagram.com/p/Df6zjpSFMKI/">GRL weekend guide on Instagram</a> or explore <a href="#events">community events</a>.</p></div></section>' +
      '<section class="band tv-band"><div class="wrap"><div class="top-line"><div><p class="kicker">Original programming</p><h2 class="display">GRL TV</h2></div><a class="text-link" href="#tv">Browse all series</a></div><div class="card-grid">' +
      visibleSeries().slice(0, 3).map(card).join("") +
      "</div></div></section>" +
      '<section class="band newsletter-call updates-call"><div class="wrap"><div><p class="eyebrow">Take the guide with you</p><h2 class="display">Follow the music.</h2><p>Subscribe to the public calendar or follow GRL for new guides, performances and local stories.</p></div>' +
      button("Follow the guide", "#updates", "ink") +
      "</div></section>"
    );
  }
  function television() {
    const feature =
      social.episodes.find((e) => e.series === "real-bartenders") ||
      social.episodes[0];
    const programs = visibleSeries();
    let featured = "";
    if (feature) {
      const program = series.find((s) => s.id === feature.series);
      featured =
        '<section class="tv-feature"><img src="assets/' +
        (program?.art || "rock-run") +
        '.webp" alt=""><div><p class="eyebrow">From the GRL archive · ' +
        esc(feature.date) +
        "</p><h2>" +
        esc(feature.title) +
        "</h2><p>" +
        esc(feature.description) +
        "</p>" +
        external("Open original on " + feature.platform, feature.url) +
        "</div></section>";
    }
    return (
      header(
        "Original programming",
        "GRL TV",
        "Find the music guides, familiar faces and recurring series in the Grapevine Rocks Live lineup.",
        "lav",
      ) +
      '<div class="wrap compact">' +
      featured +
      '<p class="archive-invite"><a class="btn ink" href="#archive">Search the Instagram archive</a> <span>' +
      window.GRLPostIndex.length +
      ' posts · June–November 2026</span></p><section><h2 class="section-title">The series</h2><div class="card-grid">' +
      programs.slice(0, 3).map(card).join("") +
      '</div><div class="tv-more">' +
      programs
        .slice(3)
        .map(
          (s) =>
            '<article class="story"><span class="meta">' +
            s.label +
            '</span><h3 class="box-title"><a href="#series/' +
            s.id +
            '">' +
            s.name +
            "</a></h3></article>",
        )
        .join("") +
      "</div></section>" +
      (social.episodes.length
        ? '<section class="archive-list"><h2 class="section-title">Selected posts and episodes</h2>' +
          episodeList(social.episodes) +
          "</section>"
        : "") +
      (social.profiles.length
        ? '<p class="notice">Find GRL on ' + profileLinks() + ".</p>"
        : "") +
      "</div>"
    );
  }
  function seriesView(id) {
    const s = series.find((item) => item.id === id);
    if (!s) return missing();
    const eps = social.episodes.filter((e) => e.series === id);
    if (!eps.length && id !== "live-music-guide") return missing();
    const description = {
      "garys-rock-run": "Follow Gary and his camera between Grapevine shows.",
      "melissa-on-main": "Music on Main through Melissa’s GRL coverage.",
      "real-bartenders": "GRL’s series on the people behind Grapevine’s bars.",
      "live-music-guide":
        "The Monday–Thursday and Friday–Sunday guides bring Grapevine’s show listings together in two editions each week.",
      "late-night-lauren":
        "Lauren takes the microphone out into Grapevine’s music scene.",
    };
    return (
      header("GRL TV · Series", s.name, description[id], "lav") +
      '<div class="wrap compact"><a class="trail" href="#tv">All GRL TV series</a><div class="' +
      (s.art ? "series-layout" : "") +
      '">' +
      (s.art
        ? '<img src="assets/' +
          s.art +
          '.webp" alt="" width="724" height="724">'
        : "") +
      '<section><h2 class="section-title">' +
      (eps.length ? "From the series" : "Music guide archive") +
      "</h2>" +
      (eps.length
        ? episodeList(eps)
        : '<p>Browse the published listings and save the public calendar for future dates.</p>') +
      (id === "live-music-guide"
        ? button("Browse the music guide", "#guide")
        : "") +
      (social.profiles.length
        ? "<p>Find Grapevine Rocks Live on " + profileLinks() + ".</p>"
        : "") +
      "</section></div></div>"
    );
  }
  function local() {
    return (
      header(
        "Around Grapevine",
        "Local business",
        "Dig for a record, try out a guitar or meet the artists working on South Main.",
        "org",
      ) +
      '<div class="wrap compact"><p class="directory-note">A small directory of Grapevine makers, music shops and independent destinations. Each profile links to the business’s own information.</p>' +
      businesses
        .map(
          (b) =>
            '<article class="story"><span class="meta">' +
            b.kind +
            " · " +
            b.address +
            '</span><h2><a href="#business/' +
            b.id +
            '">' +
            b.name +
            "</a></h2><p>" +
            b.text +
            "</p></article>",
        )
        .join("") +
      '<a class="text-link" href="#partners">Explore business spotlights and production</a></div>'
    );
  }
  function business(id) {
    const b = businesses.find((b) => b.id === id);
    if (!b) return missing();
    return (
      header(
        "Local business · " + b.kind,
        b.name,
        b.address + ", Grapevine, TX",
        "org",
      ) +
      '<div class="wrap compact stack"><a class="trail" href="#local">All local businesses</a><p class="sub">' +
      b.text +
      '</p><p class="inline-links">' +
      external("Official business website", b.url) +
      (b.video ? external(b.video[0], b.video[1]) : "") +
      (b.id === "guitar-loft"
        ? external(
            "GRL’s Guitar Joe feature on Instagram",
            "https://www.instagram.com/p/Dd7zZY7NKOb/",
          )
        : "") +
      "</p></div>"
    );
  }
  function events() {
    return (
      header(
        "Community calendar",
        "Around town",
        "Two dates from Grapevine’s published community calendar. Follow the organizer for updates.",
        "org",
      ) +
      '<div class="wrap compact"><article class="story"><span class="meta">Monday · November 23, 2026 · 4–8 PM</span><h2>38th Annual Carol of Lights</h2><p>Historic Main Street hosts the city’s holiday kickoff. GRL’s guide lists the Zack King Band at 5:45 PM and Sleigher at 7 PM on the South Pole Stage near AJ’s on Main.</p><div class="inline-links">' +
      external(
        "Organizer schedule and locations",
        "https://gograpevine.com/event/carol-of-lights-presented-by-grapevine-dodge-chrysler-jeep-ram/",
      ) +
      external(
        "Read GRL’s event guide on Instagram",
        "https://www.instagram.com/p/Df73A3YFM9f/",
      ) +
      '</div></article><article class="story"><span class="meta">Friday · December 4, 2026 · Palace Theatre</span><h2>Big Band Holiday Swing Thing</h2><p>A holiday concert at 300 S. Main Street. The Grapevine Convention &amp; Visitors Bureau lists the performance and ticket information.</p>' +
      external(
        "Official concert listing",
        "https://www.grapevinetexasusa.com/event/big-band-holiday-swing-thing/41907/",
      ) +
      "</article></div>"
    );
  }
  function partners() {
    return (
      header(
        "Partnerships & production",
        "Work with GRL",
        "Bring a venue, a local business or a program idea to Grapevine Rocks Live.",
        "rose",
      ) +
      '<div class="wrap compact"><section><h2 class="section-title">Monthly venue partnerships</h2><p class="sub">Three ways to shape ongoing visibility for a room that hosts live music. Ask GRL about current terms, availability and a private quote. Any local venue can submit a show for the guide.</p><div class="plan-grid">' +
      plans
        .map(
          ([id, n, d]) =>
            '<article class="plan"><h3>' +
            n +
            "</h3><p>" +
            d +
            '</p><a href="#inquiry/' +
            id +
            '">Explore ' +
            n +
            "</a></article>",
        )
        .join("") +
      "</div></section>" +
      '<section class="show-sections split-panel"><article class="story"><span class="meta">For businesses & venues</span><h2>Production and spotlights</h2><p>Plan an owner interview, a behind-the-scenes feature or coverage of a special event. Each project can be scoped by filming, editing and promotion. Paid media is a separate expense.</p>' +
      button("Plan a project", "#inquiry/production") +
      '</article><article class="story"><span class="meta">For sponsors</span><h2>Advertising and sponsorship</h2><p>Explore a program placement, a social campaign or an event sponsorship. Placement, timing and creative can be discussed for each campaign.</p>' +
      button("Explore sponsorship", "#inquiry/sponsorship", "light") +
      '</article></section><section class="coverage"><p class="kicker">From GRL’s coverage</p><h2 class="box-title">See the work</h2><p>Meet a local guitar repairer or step behind the bar with Alister King. These published stories show the kinds of people a business feature can introduce.</p><div class="inline-links"><a href="https://www.instagram.com/p/Dd7zZY7NKOb/">Guitar Joe at the Guitar Loft</a><a href="https://www.instagram.com/reel/Df3BniVt2Sc/">Alister King on Real Bartenders</a></div></section><p class="notice">Partnership details, custom production scopes and payment arrangements are confirmed privately with GRL before work begins.</p></div>'
    );
  }
  const tracks = [
    ...plans.map(([id, name]) => [id, name + " venue partnership"]),
    ["custom", "Custom venue arrangement"],
    ["production", "One-time production project"],
    ["sponsorship", "Advertising or sponsorship"],
  ];
  const profileUrl = (label) =>
    social.profiles.find((profile) => profile.label === label)?.url || "";
  function contactDestinations() {
    return (
      '<div class="contact-actions">' +
      externalButton("Message GRL on Instagram", contact.instagramMessage) +
      externalButton("Message GRL on Facebook", contact.facebookMessage, "light") +
      '</div><p class="contact-sources">Other ways to reach GRL: ' +
      external("Follow GRL on Instagram", profileUrl("Instagram")) +
      " · " +
      external("Visit the GRL Facebook page", profileUrl("Facebook")) +
      " · " +
      external(
        'Grapevine Chamber member page with “Send Email”',
        contact.chamber,
      ) +
      ".</p>"
    );
  }
  function inquiry(id) {
    const track = tracks.find((a) => a[0] === id) || tracks[0];
    return (
      header(
        "Work with GRL",
        "Start a conversation",
        "Tell us about your venue or project.",
        "rose",
      ) +
      '<div class="wrap compact"><a href="#partners" class="trail">Partnerships and services</a><div class="content-form contact-composer"><form id="inquiry-form"><label for="service">What would you like to discuss?</label><select id="service" name="service">' +
      tracks
        .map(
          ([k, n]) =>
            '<option value="' +
            k +
            '" ' +
            (k === track[0] ? "selected" : "") +
            ">" +
            n +
            "</option>",
        )
        .join("") +
      '</select><label for="business-name">Business, venue or organization</label><input id="business-name" name="business" type="text" maxlength="100" autocomplete="organization" placeholder="Your organization name" required><label for="project">What would you like GRL to know?</label><textarea name="project" id="project" maxlength="900" placeholder="Tell GRL about the audience, timing and result you have in mind." required></textarea><button class="btn" type="submit">Prepare message</button></form><section class="composer-output" aria-labelledby="inquiry-draft-title" hidden><h2 class="box-title" id="inquiry-draft-title">Your message</h2><p>Copy this note, then open Instagram or Facebook to send it to GRL.</p><textarea id="inquiry-draft" readonly rows="10" aria-label="Prepared partnership inquiry"></textarea><div class="contact-actions"><button class="btn ink copy-message" id="copy-inquiry" type="button">Copy message</button></div><p class="composer-status" id="inquiry-status" role="status" aria-live="polite"></p>' +
      contactDestinations() +
      "</section></div></div>"
    );
  }
  function submitShow() {
    return (
      header(
        "Music guide",
        "Submit a show",
        "Send us the artist, venue and set time.",
        "rose",
      ) +
      '<div class="wrap compact"><a href="#guide" class="trail">Back to the music guide</a><div class="content-form contact-composer"><p class="notice">GRL reviews submissions and chooses what appears in the guide. Check every detail and include an official event, venue or artist link when one is available.</p><form id="show-submit-form"><label for="show-artist">Artist or event</label><input id="show-artist" name="artist" type="text" maxlength="120" placeholder="Artist or event name" required><label for="show-venue">Venue</label><input id="show-venue" name="venue" type="text" maxlength="120" placeholder="Venue name" required><div class="composer-fields"><label for="show-date">Date<input id="show-date" name="date" type="date" required></label><label for="show-time">Start time<input id="show-time" name="time" type="time" required></label></div><label for="show-source">Official event or artist link <span>(optional)</span></label><input id="show-source" name="source" type="url" maxlength="500" inputmode="url" placeholder="https://"><label for="show-notes">Useful details <span>(optional)</span></label><textarea id="show-notes" name="notes" maxlength="900" placeholder="Cover, age policy, ticket details or a schedule note."></textarea><button class="btn" type="submit">Prepare submission</button></form><section class="composer-output" aria-labelledby="show-draft-title" hidden><h2 class="box-title" id="show-draft-title">Your submission message</h2><p>Copy the event outline, then open Instagram or Facebook to send it to GRL.</p><textarea id="show-draft" readonly rows="12" aria-label="Prepared show submission"></textarea><div class="contact-actions"><button class="btn ink copy-message" id="copy-show" type="button">Copy show details</button></div><p class="composer-status" id="show-status" role="status" aria-live="polite"></p>' +
      contactDestinations() +
      "</section></div></div>"
    );
  }
  function bindComposer(formId, draftId, statusId, copyId, makeDraft) {
    const form = document.getElementById(formId);
    if (!form) return;
    const draft = document.getElementById(draftId),
      status = document.getElementById(statusId),
      copy = document.getElementById(copyId),
      output = draft.closest(".composer-output");
    let preparedState = "";
    const state = () => new URLSearchParams(new FormData(form)).toString();
    const valid = () => {
      for (const field of form.querySelectorAll("[required]")) {
        field.setCustomValidity("");
        if (!String(field.value).trim())
          field.setCustomValidity("Please complete this field.");
      }
      return form.reportValidity();
    };
    const invalidate = (event) => {
      if (typeof event?.target?.setCustomValidity === "function")
        event.target.setCustomValidity("");
      if (!preparedState) return;
      preparedState = "";
      draft.value = "";
      output.hidden = true;
      status.textContent = "";
    };
    for (const eventName of ["input", "change"])
      form.addEventListener(eventName, invalidate);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!valid()) return;
      draft.value = makeDraft(new FormData(form));
      preparedState = state();
      output.hidden = false;
      draft.focus();
      draft.select();
      status.textContent =
        "Your message is ready. Copy it, then choose a GRL message route.";
    });
    copy.addEventListener("click", async () => {
      if (!valid() || !preparedState || preparedState !== state()) {
        invalidate();
        form.querySelector('button[type="submit"]').focus();
        return;
      }
      try {
        if (!navigator.clipboard || !window.isSecureContext)
          throw new Error("Clipboard access unavailable");
        await navigator.clipboard.writeText(draft.value);
        status.textContent = "Message copied. Open Instagram or Facebook to send it to GRL.";
      } catch (_error) {
        draft.focus();
        draft.select();
        status.textContent =
          "The message is selected. Use Copy from your browser or press Command+C or Ctrl+C.";
      }
    });
  }
  function bindInquiry() {
    bindComposer(
      "inquiry-form",
      "inquiry-draft",
      "inquiry-status",
      "copy-inquiry",
      (data) => {
        const service =
            tracks.find((item) => item[0] === data.get("service"))?.[1] ||
            "Partnership or production inquiry",
          business = String(data.get("business") || "").trim(),
          project = String(data.get("project") || "").trim();
        return [
          "Hi Grapevine Rocks Live,",
          "",
          "I’d like to discuss: " + service,
          "Organization: " + business,
          "",
          project,
          "",
          "Thanks — I’d be glad to discuss timing and next steps.",
        ].join("\n");
      },
    );
  }
  function bindShowSubmission() {
    bindComposer(
      "show-submit-form",
      "show-draft",
      "show-status",
      "copy-show",
      (data) => {
        const value = (key) => String(data.get(key) || "").trim(),
          source = value("source"),
          notes = value("notes"),
          date = displayDate(value("date"), {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          [hours, minutes] = value("time").split(":").map(Number),
          time = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(2000, 0, 1, hours, minutes));
        return [
          "Hi Grapevine Rocks Live,",
          "",
          "I’d like to submit this show for the music guide.",
          "Artist or event: " + value("artist"),
          "Venue: " + value("venue"),
          "Date: " + date,
          "Start time: " + time,
          ...(source ? ["Official link: " + source] : []),
          ...(notes ? ["Details: " + notes] : []),
          "",
          "Thanks for reviewing it.",
        ].join("\n");
      },
    );
  }
  function updates() {
    return (
      header(
        "Stay close to the music",
        "Follow the guide",
        "Add the public music calendar, download a copy or follow GRL for new guides and local stories.",
        "org",
      ) +
      '<div class="wrap compact updates-grid"><section class="story calendar-card"><span class="meta">Public music calendar</span><h2>Keep the listings in your calendar app</h2><p>Subscribe once to receive calendar updates from the published guide, or download the current calendar file.</p><div class="calendar-actions">' +
      externalButton(
        "Subscribe in your calendar app",
        "webcal://cmcnosky.github.io/grapevine-rocks-live/calendar.ics",
        "ink",
      ) +
      '<a class="btn light" href="./calendar.ics" download>Download calendar file</a></div><p class="meta">Show details can change. Open each listing’s source and check with the venue before heading out.</p></section><section class="story follow-card"><span class="meta">On social</span><h2>Follow Grapevine Rocks Live</h2><p>Instagram and Facebook carry the music guides, venue coverage and new GRL stories. Find GRL on every channel below.</p><p class="inline-links">' +
      profileLinks() +
      '</p><p><a class="text-link" href="#guide">Browse the published music guide</a></p></section></div>'
    );
  }
  function about() {
    return (
      header(
        "Grapevine, Texas",
        "About Grapevine Rocks Live",
        "Music guides, venue coverage and original stories from around Grapevine.",
      ) +
      '<div class="wrap compact about-copy"><h2 class="box-title">Meet Jaime</h2><p>Jaime Paxton launched Grapevine Rocks Live in 2026 to help people find live music and discover the venues, musicians and local businesses behind it. <a href="https://www.instagram.com/reel/DcsJi0btzxQ/" rel="external noopener">Watch Jaime introduce GRL</a>.</p><h2 class="box-title">Find a show</h2><p>Browse the <a href="#guide">music guide</a> by date, artist or venue, then open a listing for its published source. Times and lineups can change, so check with the venue before heading out.</p><h2 class="box-title">Corrections and submissions</h2><p>If a listing needs a correction, message GRL on <a href="https://ig.me/m/grapevinerockslive" rel="external noopener">Instagram</a> or <a href="https://m.me/GrapevineRocksLive" rel="external noopener">Facebook</a>. Musicians and venues can also <a href="#submit">submit a show</a> for the guide.</p><h2 class="box-title">About GRL</h2><p>Grapevine Rocks Live covers local music and entertainment. The Grapevine Chamber lists the organization under Event and Entertainment Productions.</p><p>' +
      external(
        "Grapevine Chamber listing",
        "https://business.grapevinechamber.org/list/member/grapevine-rocks-live-15383",
      ) +
      "</p>" +
      (social.profiles.length
        ? '<h2 class="box-title">GRL on social</h2><p>' +
          profileLinks() +
          "</p>"
        : "") +
      '<h2 class="box-title">Follow the guide</h2><p><a href="#updates">Add the music calendar</a>, follow GRL on social or <a href="#partners">tell GRL about a venue, business or project</a>.</p></div>'
    );
  }
  function missing() {
    return (
      header(
        "Navigation",
        "Page not found",
        "Try the music guide or browse the GRL TV lineup.",
      ) +
      '<div class="wrap compact">' +
      button("Open the guide", "#guide") +
      "</div>"
    );
  }
  const routes = {
    home,
    events,
    archive: window.GRLArchive.render,
    tv: television,
    series: seriesView,
    local,
    business,
    partners,
    inquiry,
    submit: submitShow,
    updates,
    about,
  };
  function closeMenu() {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      menu.focus();
    }
  });
  document.querySelector(".skip").addEventListener("click", (e) => {
    e.preventDefault();
    main.focus();
    main.scrollIntoView();
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
  document.getElementById("social-links").innerHTML = profileLinks();
  function render() {
    closeMenu();
    let [route, id = ""] = location.hash.slice(1).split("/");
    route = route || "home";
    const legacyRoutes = { newsletter: "updates", desk: "guide" },
      legacyRoute = Object.hasOwn(legacyRoutes, route)
        ? legacyRoutes[route]
        : "";
    if (legacyRoute) {
      route = legacyRoute;
      id = "";
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#" + legacyRoute,
      );
    }
    if (!/^[\w-]+$/.test(id) && id) id = "";
    const families = {
        show: "guide",
        venue: "venues",
        series: "tv",
        archive: "tv",
        business: "local",
        inquiry: "partners",
      },
      family = Object.hasOwn(families, route) ? families[route] : route;
    nav.querySelectorAll("a").forEach((a) => {
      if (a.hash === "#" + family) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (!window.GRLGuide.handles(route)) {
      main.innerHTML = Object.hasOwn(routes, route)
        ? routes[route](id)
        : missing();
      bindInquiry();
      bindShowSubmission();
      bindReaders();
      window.GRLArchive.bind();
    } else {
      window.GRLGuide.render(route, id);
    }
    const heading = main.querySelector("h1"),
      title = (heading?.innerText || heading?.textContent || "Music guide")
        .replace(/\s+/g, " ")
        .trim();
    document.title =
      route === "home"
        ? "Grapevine Rocks Live | Music Guide"
        : title + " | Grapevine Rocks Live";
    document.getElementById("site-announcer").textContent =
      route === "home" ? "Grapevine Rocks Live home" : title;
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", () => {
    render();
    main.focus({ preventScroll: true });
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) render();
  });
  render();
  document.documentElement.classList.add("site-ready");
})();
