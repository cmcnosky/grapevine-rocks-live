(function () {
  "use strict";

  const CHECKED_DATE = "2026-11-20";
  const CALENDAR_TIMEZONE = "America/Chicago";
  const CALENDAR_DOWNLOAD = "./calendar.ics";
  const CALENDAR_SUBSCRIBE =
    "webcal://cmcnosky.github.io/grapevine-rocks-live/calendar.ics";
  const GRL_WEEKEND_URL = "https://www.instagram.com/p/Df6zjpSFMKI/";
  const GRL_WEEKEND_SOURCE = {
    label: "GRL weekend guide",
    url: GRL_WEEKEND_URL,
  };
  const TOLBERTS_SOURCE = {
    label: "Tolbert’s calendar",
    url: "https://tolbertsrestaurant.com/calendar/",
  };
  const CHEZ_SOURCE = {
    label: "Chez Fabien calendar",
    url: "https://chezfabienbistro.com/",
  };
  const PIAF_SOURCE = {
    label: "PIAF calendar",
    url: "https://piafkitchen.com/the-perch-rooftop-patio/",
  };

  function publishedEvent(data) {
    const sources = data.sources || [GRL_WEEKEND_SOURCE];
    return {
      endTime: "",
      genres: "Live music",
      cover: "Not listed",
      summary: "",
      sourceStatus:
        sources.length > 1
          ? "GRL + venue"
          : sources[0].url === GRL_WEEKEND_URL
            ? "GRL guide"
            : "Venue-published",
      sources,
      verifiedAt: CHECKED_DATE,
      ...data,
    };
  }

  const embeddedCatalog = {
    venues: [
      {
        id: "tolberts",
        name: "Tolbert’s Restaurant & Chili Parlor",
        address: "423 South Main Street, Grapevine, TX 76051",
        url: "https://tolbertsrestaurant.com/",
        description:
          "A Main Street restaurant and concert room with a published live-music calendar.",
        features: ["Live music", "Food + bar", "Main Street"],
      },
      {
        id: "willhoites",
        name: "Willhoite’s Restaurant",
        address: "432 South Main Street, Grapevine, TX 76051",
        url: "https://www.willhoites.com/",
        description:
          "A long-running Grapevine restaurant and bar whose official site advertises live music Wednesday through Sunday.",
        features: ["Live music", "Food + bar", "Late night"],
      },
      {
        id: "ajs-on-main",
        name: "AJ’s on Main",
        address: "651 South Main Street, Grapevine, TX 76051",
        url: "https://www.ajsonmaintx.com/",
        description:
          "A Main Street barbecue destination listed in the City of Grapevine’s downtown guide.",
        features: ["Barbecue", "Main Street", "Local venue"],
      },
      {
        id: "third-rail",
        name: "Third Rail at Harvest Hall",
        address: "815 South Main Street, Grapevine, TX 76051",
        url: "https://www.harvesthall.com/about",
        description:
          "Harvest Hall’s intimate event space with a year-round mix of bands, DJs, comedy and community programming.",
        features: ["Live music", "Events", "Food hall"],
      },
      {
        id: "glass-cactus",
        name: "Glass Cactus",
        address: "1501 Gaylord Trail, Grapevine, TX 76051",
        url: "https://glasscactus.gaylordtexan.com/nightlife",
        description:
          "A large lakeside nightlife venue at Gaylord Texan with live music, DJs and a dance floor.",
        features: ["Live music", "Nightlife", "21+"],
      },
      {
        id: "napolis",
        name: "Napoli’s Italian Restaurant",
        address: "309 South Main Street, Grapevine, TX 76051",
        url: "https://www.napolisgrapevine.com/",
        description:
          "A family-run Italian restaurant and bar in historic downtown Grapevine.",
        features: ["Restaurant", "Full bar", "Main Street"],
      },
      {
        id: "hop-and-sting",
        name: "Hop & Sting Brewing Co.",
        address: "906 Jean Street, Grapevine, TX 76051",
        url: "https://hopandsting.myshopify.com/pages/food-truck-schedule",
        description:
          "A Grapevine brewery and taproom whose official site lists live music among its regular events.",
        features: ["Brewery", "Live music", "Family friendly"],
      },
      {
        id: "hotel-vin-lobby",
        name: "Hotel Vin Lobby Lounge",
        address: "215 East Dallas Road, Grapevine, TX 76051",
        url: "https://www.hotelvin.com/",
        description:
          "The lobby lounge at Hotel Vin, next to Grapevine Main Station and Harvest Hall.",
        features: ["Hotel lounge", "Live music", "Downtown"],
      },
      {
        id: "rock-and-brews",
        name: "Rock & Brews Grapevine",
        address: "520 West State Highway 114, Grapevine, TX 76051",
        url: "https://www.rockandbrews.com/grapevine",
        description:
          "A rock-themed restaurant and sports bar whose official site promotes regular live music.",
        features: ["Live music", "Restaurant", "All ages"],
      },
      {
        id: "chez-fabien",
        name: "Chez Fabien Bistro",
        address: "316 South Main Street, Grapevine, TX 76051",
        url: "https://chezfabienbistro.com/",
        description:
          "A French-inspired Main Street bistro with an official live-music calendar.",
        features: ["Live music", "Bistro", "Main Street"],
      },
      {
        id: "piaf",
        name: "PIAF Kitchen + Wine + Bar",
        address: "129 South Main Street, Suite 130, Grapevine, TX 76051",
        url: "https://piafkitchen.com/the-perch-rooftop-patio/",
        description:
          "A Mediterranean restaurant whose rooftop Perch publishes a live-music calendar.",
        features: ["Live music", "Rooftop", "Main Street"],
      },
      {
        id: "grapevine-elks",
        name: "Grapevine Elks Lodge #2483",
        address: "909 Bushong Road, Grapevine, TX 76051",
        url: "https://www.grapevineelks.org/",
        description:
          "The Grapevine lodge of the Benevolent and Protective Order of Elks.",
        features: ["Lodge", "Community", "Live music"],
      },
      {
        id: "airport-cities-vfw",
        name: "Airport Cities VFW Post 10454",
        address: "221 North Main Street, Grapevine, TX 76051",
        url: "https://www.vfw10454.net/",
        description: "A VFW post and public canteen on North Main Street.",
        features: ["VFW post", "Open to public", "Live music"],
      },
      {
        id: "chill",
        name: "Chill Bar & Grill",
        address: "814 South Main Street, Grapevine, TX 76051",
        url: "https://chilldfw.com/",
        description:
          "A late-night Main Street bar and restaurant whose official site promotes DJs, live music and themed events.",
        features: ["DJ", "Karaoke", "Late night"],
      },
      {
        id: "bohemian-bull",
        name: "Bohemian Bull Grapevine",
        address: "1112 West Northwest Highway, Grapevine, TX 76051",
        url: "https://www.bohemianbull.com/index.html?draft=grapevine",
        description:
          "A neighborhood restaurant and beer garden with live-music programming.",
        features: ["Live music", "Open jam", "Restaurant"],
      },
      {
        id: "grape-vine-springs",
        name: "Grape Vine Springs Winery",
        address: "409 South Main Street, Grapevine, TX 76051",
        url: "https://www.grapevinespringswinery.com/",
        description:
          "A Main Street winery with an official calendar for upcoming events.",
        features: ["Winery", "Live music", "Main Street"],
      },
    ],
    events: [
      publishedEvent({
        id: "napolis-dathan-martin-2026-11-20",
        title: "Dathan Martin",
        artist: "Dathan Martin",
        venueId: "napolis",
        date: "2026-11-20",
        time: "15:30",
      }),
      publishedEvent({
        id: "hop-sting-bobby-falk-2026-11-20",
        title: "Bobby Falk Group",
        artist: "Bobby Falk Group",
        venueId: "hop-and-sting",
        date: "2026-11-20",
        time: "18:00",
        endTime: "21:00",
        genres: "Taps & Tracks",
        sourceStatus: "Times differ — recheck",
        sourceNote: "GRL and pianist Jeff Furgo list the Bobby Falk Group from 6 to 9 p.m. Bobby Falk lists his trio from 7 to 10 p.m. Confirm the start time with Hop & Sting.",
        sources: [
          GRL_WEEKEND_SOURCE,
          { label: "Pianist Jeff Furgo’s event", url: "https://thefurgos.com/events/" },
          { label: "Bobby Falk’s calendar", url: "https://www.bobbyfalkmusic.com/calendar" },
        ],
      }),
      publishedEvent({
        id: "third-rail-dusty-moats-2026-11-20",
        title: "Dusty Moats",
        artist: "Dusty Moats",
        venueId: "third-rail",
        date: "2026-11-20",
        time: "19:00",
        endTime: "21:00",
        sources: [
          GRL_WEEKEND_SOURCE,
          {
            label: "Harvest Hall event",
            url: "https://www.harvesthall.com/events/tarrant-county/dusty-moats--live-at-third-rail",
          },
        ],
      }),
      publishedEvent({
        id: "hotel-vin-corey-breedlove-2026-11-20",
        title: "Corey Breedlove",
        artist: "Corey Breedlove",
        venueId: "hotel-vin-lobby",
        date: "2026-11-20",
        time: "19:00",
        endTime: "22:00",
        genres: "Live in the Living Room",
      }),
      publishedEvent({
        id: "rock-brews-chasing-angels-2026-11-20",
        title: "Chasing Angels",
        artist: "Chasing Angels",
        venueId: "rock-and-brews",
        date: "2026-11-20",
        time: "19:00",
      }),
      publishedEvent({
        id: "grapevine-elks-brent-rozell-2026-11-20",
        title: "Brent Rozell & The Soulmates",
        artist: "Brent Rozell & The Soulmates",
        venueId: "grapevine-elks",
        date: "2026-11-20",
        time: "19:15",
      }),
      publishedEvent({
        id: "ajs-josh-ingram-2026-11-20",
        title: "Josh Ingram",
        artist: "Josh Ingram",
        venueId: "ajs-on-main",
        date: "2026-11-20",
        time: "19:30",
      }),
      publishedEvent({
        id: "chez-fabien-ford-nelson-2026-11-20",
        title: "Ford Nelson",
        artist: "Ford Nelson",
        venueId: "chez-fabien",
        date: "2026-11-20",
        time: "19:30",
        endTime: "22:30",
        sourceStatus: "Times differ — recheck",
        sourceNote:
          "GRL lists 7–10 PM; Chez Fabien lists 7:30–10:30 PM. The venue time is shown.",
        sources: [GRL_WEEKEND_SOURCE, CHEZ_SOURCE],
      }),
      publishedEvent({
        id: "piaf-aautumn-2026-11-20",
        title: "Aautumn",
        artist: "Aautumn",
        venueId: "piaf",
        date: "2026-11-20",
        time: "19:30",
        endTime: "22:30",
        sourceStatus: "Times differ — recheck",
        sourceNote:
          "GRL lists 7–9:30 PM; PIAF lists 7:30–10:30 PM. The venue time is shown.",
        sources: [GRL_WEEKEND_SOURCE, PIAF_SOURCE],
      }),
      publishedEvent({
        id: "vfw-dan-shinedling-2026-11-20",
        title: "Dan Shinedling",
        artist: "Dan Shinedling",
        venueId: "airport-cities-vfw",
        date: "2026-11-20",
        time: "20:00",
      }),
      publishedEvent({
        id: "tolberts-alternatives-2026-11-20",
        title: "The Alternatives",
        artist: "The Alternatives",
        venueId: "tolberts",
        date: "2026-11-20",
        time: "21:00",
        endTime: "23:59",
        genres: "Nineties • Alternative",
        summary:
          "Tolbert’s identifies The Alternatives as a nineties and alternative act.",
        sourceNote:
          "GRL rounds the end time to midnight. Tolbert’s lists 11:59 PM, the time shown here.",
        sources: [GRL_WEEKEND_SOURCE, TOLBERTS_SOURCE],
      }),
      publishedEvent({
        id: "willhoites-strangle-love-2026-11-20",
        title: "Strangle Love",
        artist: "Strangle Love",
        venueId: "willhoites",
        date: "2026-11-20",
        time: "21:00",
        endTime: "01:00",
        genres: "Monsters of Rock show",
        sourceStatus: "GRL guide — recheck",
        sourceNote:
          "GRL lists Strangle Love on both Friday and Saturday. Confirm the night with Willhoite’s.",
      }),
      publishedEvent({
        id: "chill-dj-mike-b-2026-11-20",
        title: "DJ Mike B",
        artist: "DJ Mike B",
        venueId: "chill",
        date: "2026-11-20",
        time: "22:00",
        genres: "DJ",
      }),

      publishedEvent({
        id: "third-rail-halftones-2026-11-21",
        title: "The Halftones",
        artist: "The Halftones",
        venueId: "third-rail",
        date: "2026-11-21",
        time: "19:00",
        endTime: "21:00",
        sources: [
          GRL_WEEKEND_SOURCE,
          {
            label: "Harvest Hall event",
            url: "https://www.harvesthall.com/events/tarrant-county/the-halftones--live-at-third-rail",
          },
        ],
      }),
      publishedEvent({
        id: "bohemian-bull-shannon-morales-2026-11-21",
        title: "Shannon Morales & The Max",
        artist: "Shannon Morales & The Max",
        venueId: "bohemian-bull",
        date: "2026-11-21",
        time: "19:00",
        endTime: "22:00",
      }),
      publishedEvent({
        id: "rock-brews-8-tracks-2026-11-21",
        title: "The 8 Tracks",
        artist: "The 8 Tracks",
        venueId: "rock-and-brews",
        date: "2026-11-21",
        time: "19:00",
      }),
      publishedEvent({
        id: "grape-vine-springs-road-trip-2026-11-21",
        title: "Road Trip",
        artist: "Road Trip",
        venueId: "grape-vine-springs",
        date: "2026-11-21",
        time: "19:00",
        endTime: "21:00",
        summary: "Road Trip plays the winery’s birthday party.",
        sources: [
          GRL_WEEKEND_SOURCE,
          { label: "Winery birthday party", url: "https://www.grapevinespringswinery.com/events/2026/11/21/winery-birthday-party-and-live-music-with-road-trip" },
        ],
      }),
      publishedEvent({
        id: "ajs-christian-haworth-2026-11-21",
        title: "Christian Haworth",
        artist: "Christian Haworth",
        venueId: "ajs-on-main",
        date: "2026-11-21",
        time: "19:30",
      }),
      publishedEvent({
        id: "chez-fabien-sylvester-jones-2026-11-21",
        title: "Sylvester Jones Jr.",
        artist: "Sylvester Jones Jr.",
        venueId: "chez-fabien",
        date: "2026-11-21",
        time: "19:30",
        endTime: "22:30",
        sourceStatus: "Details differ — recheck",
        sourceNote:
          "GRL lists Sylvester Jones Jr., 7–10 PM; Chez Fabien lists Sylvester Jones, 7:30–10:30 PM. The venue time is shown.",
        sources: [GRL_WEEKEND_SOURCE, CHEZ_SOURCE],
      }),
      publishedEvent({
        id: "piaf-aautumn-2026-11-21",
        title: "Aautumn",
        artist: "Aautumn",
        venueId: "piaf",
        date: "2026-11-21",
        time: "19:30",
        endTime: "22:30",
        sourceStatus: "Times differ — recheck",
        sourceNote:
          "GRL lists 7–9:30 PM; PIAF lists 7:30–10:30 PM. The venue time is shown.",
        sources: [GRL_WEEKEND_SOURCE, PIAF_SOURCE],
      }),
      publishedEvent({
        id: "vfw-jd-monson-2026-11-21",
        title: "JD Monson",
        artist: "JD Monson",
        venueId: "airport-cities-vfw",
        date: "2026-11-21",
        time: "20:00",
      }),
      publishedEvent({
        id: "tolberts-cherry-bomb-2026-11-21",
        title: "Cherry Bomb",
        artist: "Cherry Bomb",
        venueId: "tolberts",
        date: "2026-11-21",
        time: "21:00",
        endTime: "23:59",
        genres: "Women of rock tribute",
        summary:
          "Tolbert’s describes Cherry Bomb as a tribute to the women of rock.",
        sourceNote:
          "GRL rounds the end time to midnight. Tolbert’s lists 11:59 PM, the time shown here.",
        sources: [GRL_WEEKEND_SOURCE, TOLBERTS_SOURCE],
      }),
      publishedEvent({
        id: "willhoites-strangle-love-2026-11-21",
        title: "Strangle Love",
        artist: "Strangle Love",
        venueId: "willhoites",
        date: "2026-11-21",
        time: "21:00",
        endTime: "01:00",
        genres: "Monsters of Rock show",
        sourceStatus: "GRL guide — recheck",
        sourceNote:
          "GRL lists Strangle Love on both Friday and Saturday. Confirm the night with Willhoite’s.",
      }),
      publishedEvent({
        id: "chill-dj-junior-2026-11-21",
        title: "DJ Junior in the Mix",
        artist: "DJ Junior in the Mix",
        venueId: "chill",
        date: "2026-11-21",
        time: "22:00",
        genres: "DJ",
      }),

      publishedEvent({
        id: "ajs-brendon-preece-2026-11-22",
        title: "Brendon Preece",
        artist: "Brendon Preece",
        venueId: "ajs-on-main",
        date: "2026-11-22",
        time: "13:00",
      }),
      publishedEvent({
        id: "tolberts-country-dead-2026-11-22",
        title: "The Country Dead",
        artist: "The Country Dead",
        venueId: "tolberts",
        date: "2026-11-22",
        time: "14:30",
        endTime: "17:30",
        cover: "Free",
        genres: "Grateful Dead • Country",
        summary: "Tolbert’s bills The Country Dead as Grateful Dead gone country.",
        sourceStatus: "Times differ — recheck",
        sourceNote: "Tolbert’s calendar lists 2:30–5:30 p.m. Its concert poster gives a 3 p.m. start and free admission. Confirm the start time with Tolbert’s.",
        sources: [GRL_WEEKEND_SOURCE, TOLBERTS_SOURCE, { label: "Tolbert’s concert poster", url: "https://tolbertscms.com/wp-content/uploads/2026/11/TCD.jpg" }],
      }),
      publishedEvent({
        id: "bohemian-bull-blues-jam-2026-11-22",
        title: "Blues at the Bull",
        artist: "Open blues jam hosted by Mister Fantastic Blues Band",
        venueId: "bohemian-bull",
        date: "2026-11-22",
        time: "17:00",
        endTime: "20:00",
        genres: "Open blues jam",
      }),
      publishedEvent({
        id: "tolberts-jordan-whitmore-2026-11-22",
        title: "Jordan Whitmore",
        artist: "Jordan Whitmore",
        venueId: "tolberts",
        date: "2026-11-22",
        time: "19:00",
        endTime: "21:00",
        genres: "Texas songwriter • Storyteller",
        summary:
          "Tolbert’s identifies Jordan Whitmore as a Texas songwriter and storyteller.",
        sources: [GRL_WEEKEND_SOURCE, TOLBERTS_SOURCE],
      }),
      publishedEvent({
        id: "willhoites-guy-patrick-2026-11-22",
        title: "Guy Patrick",
        artist: "Guy Patrick",
        venueId: "willhoites",
        date: "2026-11-22",
        time: "19:00",
      }),
      publishedEvent({
        id: "chill-sunday-karaoke-2026-11-22",
        title: "Sunday Karaoke",
        artist: "Sing with Shag, hosted by Shannon Cobb",
        venueId: "chill",
        date: "2026-11-22",
        time: "22:00",
        genres: "Karaoke",
      }),

      publishedEvent({
        id: "tolberts-andrea-venezio-2026-11-23",
        title: "Andrea Venezio",
        artist: "Andrea Venezio",
        venueId: "tolberts",
        date: "2026-11-23",
        time: "19:00",
        endTime: "21:30",
        genres: "Acoustic solo",
        summary: "Tolbert’s lists an acoustic solo set by Andrea Venezio.",
        sources: [TOLBERTS_SOURCE],
      }),
      publishedEvent({
        id: "tolberts-chaz-marie-band-2026-11-24",
        title: "Chaz Marie Band",
        artist: "Chaz Marie Band",
        venueId: "tolberts",
        date: "2026-11-24",
        time: "19:30",
        endTime: "22:00",
        genres: "Blues • Classic rock • Soul",
        summary:
          "Tolbert’s describes Chaz Marie Band as blues, classic rock and soul.",
        sources: [TOLBERTS_SOURCE],
      }),
      publishedEvent({
        id: "tolberts-miller-jam-2026-11-25",
        title: "The Miller Jam",
        artist: "The Miller Jam",
        venueId: "tolberts",
        date: "2026-11-25",
        time: "20:00",
        endTime: "23:30",
        genres: "Annual family jam",
        summary: "Tolbert’s lists The Miller Family Annual Jam.",
        sources: [TOLBERTS_SOURCE],
      }),
      publishedEvent({
        id: "chez-fabien-michael-2026-11-26",
        title: "Michael",
        artist: "Michael",
        venueId: "chez-fabien",
        date: "2026-11-26",
        time: "19:30",
        endTime: "21:30",
        sources: [CHEZ_SOURCE],
      }),
    ],
  };

  let catalog = {
    schemaVersion: 1,
    revision: 0,
    edition: {
      startDate: "2026-11-20",
      endDate: "2026-11-26",
      label: "November 20–26, 2026",
      sourceCheckedDate: CHECKED_DATE,
    },
    venues: embeddedCatalog.venues,
    events: embeddedCatalog.events,
  };
  let catalogSource = "embedded";

  const handledRoutes = new Set(["guide", "venues", "venue", "show"]);
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeURL(value) {
    if (!value) return "";
    try {
      const baseURL =
        typeof window !== "undefined" && window.location?.href
          ? window.location.href
          : "https://cmcnosky.github.io/grapevine-rocks-live/";
      const url = new URL(value, baseURL);
      return ["http:", "https:", "webcal:"].includes(url.protocol)
        ? url.href
        : "";
    } catch (error) {
      return "";
    }
  }

  function requiredString(value, field) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) throw new TypeError(field + " must be a nonempty string.");
    return text;
  }

  function optionalString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function strictWebURL(value, field) {
    const text = requiredString(value, field);
    let url;
    try {
      url = new URL(text);
    } catch (error) {
      throw new TypeError(field + " must be an absolute web URL.");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new TypeError(field + " must use http or https.");
    }
    return url.href;
  }

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const parsed = new Date(value + "T00:00:00Z");
    return (
      !Number.isNaN(parsed.valueOf()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }

  function requiredDate(value, field) {
    const text = requiredString(value, field);
    if (!validDate(text)) throw new TypeError(field + " must be YYYY-MM-DD.");
    return text;
  }

  function requiredTime(value, field) {
    const text = requiredString(value, field);
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)) {
      throw new TypeError(field + " must be HH:MM in 24-hour time.");
    }
    return text;
  }

  function optionalTime(value, field) {
    const text = optionalString(value);
    return text ? requiredTime(text, field) : "";
  }

  function requiredId(value, field) {
    const text = requiredString(value, field);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) {
      throw new TypeError(field + " must be a lowercase kebab-case ID.");
    }
    return text;
  }

  function normalizeCatalog(payload) {
    let input = payload;
    if (typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch (error) {
        throw new TypeError("The catalog JSON string could not be parsed.");
      }
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new TypeError("The catalog must be a JSON object.");
    }
    if (input.schemaVersion !== 1) {
      throw new TypeError("The catalog schemaVersion must be 1.");
    }
    if (!Number.isInteger(input.revision) || input.revision < 0) {
      throw new TypeError("The catalog revision must be a nonnegative integer.");
    }
    const rawEdition = input.edition;
    if (!rawEdition || typeof rawEdition !== "object" || Array.isArray(rawEdition)) {
      throw new TypeError("The catalog edition must be an object.");
    }
    const edition = {
      ...rawEdition,
      startDate: requiredDate(rawEdition.startDate, "edition.startDate"),
      endDate: requiredDate(rawEdition.endDate, "edition.endDate"),
      label: requiredString(rawEdition.label, "edition.label"),
      sourceCheckedDate: requiredDate(
        rawEdition.sourceCheckedDate,
        "edition.sourceCheckedDate",
      ),
    };
    if (edition.endDate < edition.startDate) {
      throw new TypeError("edition.endDate cannot precede edition.startDate.");
    }
    if (!Array.isArray(input.venues) || !Array.isArray(input.shows)) {
      throw new TypeError("The catalog must contain venues and shows arrays.");
    }
    const venueIds = new Set();
    const venues = input.venues.map(function (rawVenue, index) {
      const field = "venues[" + index + "]";
      if (!rawVenue || typeof rawVenue !== "object" || Array.isArray(rawVenue)) {
        throw new TypeError(field + " must be an object.");
      }
      const id = requiredId(rawVenue.id, field + ".id");
      if (venueIds.has(id)) throw new TypeError("Duplicate venue ID: " + id);
      venueIds.add(id);
      if (!Array.isArray(rawVenue.features)) {
        throw new TypeError(field + ".features must be an array.");
      }
      return {
        ...rawVenue,
        id: id,
        name: requiredString(rawVenue.name, field + ".name"),
        address: requiredString(rawVenue.address, field + ".address"),
        url: strictWebURL(rawVenue.url, field + ".url"),
        description: requiredString(
          rawVenue.description,
          field + ".description",
        ),
        features: rawVenue.features.map(function (feature, featureIndex) {
          return requiredString(
            feature,
            field + ".features[" + featureIndex + "]",
          );
        }),
      };
    });
    const showIds = new Set();
    const events = input.shows.map(function (rawShow, index) {
      const field = "shows[" + index + "]";
      if (!rawShow || typeof rawShow !== "object" || Array.isArray(rawShow)) {
        throw new TypeError(field + " must be an object.");
      }
      const id = requiredId(rawShow.id, field + ".id");
      if (showIds.has(id)) throw new TypeError("Duplicate show ID: " + id);
      showIds.add(id);
      const venueId = requiredId(rawShow.venueId, field + ".venueId");
      if (!venueIds.has(venueId)) {
        throw new TypeError(field + ".venueId does not match a venue.");
      }
      if (!Array.isArray(rawShow.sources) || !rawShow.sources.length) {
        throw new TypeError(field + ".sources must contain at least one source.");
      }
      const sources = rawShow.sources.map(function (rawSource, sourceIndex) {
        const sourceField = field + ".sources[" + sourceIndex + "]";
        if (!rawSource || typeof rawSource !== "object" || Array.isArray(rawSource)) {
          throw new TypeError(sourceField + " must be an object.");
        }
        return {
          ...rawSource,
          label: requiredString(rawSource.label, sourceField + ".label"),
          url: strictWebURL(rawSource.url, sourceField + ".url"),
        };
      });
      const verifiedAt = optionalString(rawShow.verifiedAt);
      if (verifiedAt && !validDate(verifiedAt)) {
        throw new TypeError(field + ".verifiedAt must be YYYY-MM-DD.");
      }
      return {
        ...rawShow,
        id: id,
        title: requiredString(rawShow.title, field + ".title"),
        artist: requiredString(rawShow.artist, field + ".artist"),
        venueId: venueId,
        date: requiredDate(rawShow.date, field + ".date"),
        time: requiredTime(rawShow.time, field + ".time"),
        endTime: optionalTime(rawShow.endTime, field + ".endTime"),
        genres: requiredString(rawShow.genres, field + ".genres"),
        cover: requiredString(rawShow.cover, field + ".cover"),
        summary: optionalString(rawShow.summary),
        sourceStatus: optionalString(rawShow.sourceStatus),
        sourceNote: optionalString(rawShow.sourceNote),
        verifiedAt: verifiedAt,
        sources: sources,
      };
    });
    return {
      ...input,
      schemaVersion: 1,
      revision: input.revision,
      edition: edition,
      venues: venues,
      events: events,
    };
  }

  function activateCatalog(nextCatalog, source) {
    catalog = nextCatalog;
    catalogSource = source;
    if (
      typeof window.dispatchEvent === "function" &&
      typeof window.CustomEvent === "function"
    ) {
      window.dispatchEvent(
        new window.CustomEvent("grl:catalog-ready", {
          detail: { source: source, revision: nextCatalog.revision },
        }),
      );
    }
  }

  async function fetchCatalog(url, source) {
    const requestURL = new URL(url, window.location.href);
    requestURL.searchParams.set("_grl", String(Date.now()));
    const response = await window.fetch(requestURL.href, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error("Catalog request failed with HTTP " + response.status + ".");
    }
    return {
      catalog: normalizeCatalog(await response.json()),
      source: source,
    };
  }

  async function loadOwnerCatalog() {
    if (
      typeof window.fetch !== "function" ||
      !window.location ||
      !/^https?:$/.test(window.location.protocol)
    ) {
      return { source: catalogSource, revision: catalog.revision };
    }
    const requests = [];
    const liveURL = safeURL(window.GRL_CATALOG_URL);
    if (liveURL) requests.push([liveURL, "live"]);
    requests.push([
      new URL("owner-content.json", window.location.href).href,
      "packaged",
    ]);
    for (const request of requests) {
      try {
        const result = await fetchCatalog(request[0], request[1]);
        activateCatalog(result.catalog, result.source);
        return { source: result.source, revision: result.catalog.revision };
      } catch (error) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("GRL catalog source unavailable; trying fallback.", error);
        }
      }
    }
    return { source: catalogSource, revision: catalog.revision };
  }

  function directionsURL(address) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(address)
    );
  }

  function calendarSubscribeURL() {
    const override = safeURL(window.GRL_FEED_URL);
    if (!override) return CALENDAR_SUBSCRIBE;
    return override.replace(/^https?:/i, "webcal:");
  }

  function getVenue(venueId) {
    return catalog.venues.find(function (venue) {
      return venue.id === venueId;
    });
  }

  function defaultSummary(event, venue) {
    if (!venue) return event.title + " in Grapevine.";
    return event.title + " at " + venue.name.replace(/[.!?]+$/, "") + ".";
  }

  function publicEvents() {
    return catalog.events.slice().sort(function (a, b) {
      return (a.date + "T" + a.time).localeCompare(b.date + "T" + b.time);
    });
  }

  function formatDate(date, includeYear) {
    const parsed = new Date(date + "T12:00:00Z");
    if (Number.isNaN(parsed.valueOf())) return date;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: CALENDAR_TIMEZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined,
    }).format(parsed);
  }

  function formatTime(time) {
    if (!time) return "Time TBA";
    const parts = time.split(":").map(Number);
    const parsed = new Date(Date.UTC(2000, 0, 1, parts[0], parts[1]));
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed);
  }

  function chicagoDateKey(now) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: CALENDAR_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now || new Date());
    const values = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") values[part.type] = part.value;
    });
    return values.year + "-" + values.month + "-" + values.day;
  }

  function editionState() {
    const today = chicagoDateKey();
    const edition = catalog.edition;
    if (today < edition.startDate) {
      return {
        key: "upcoming",
        label: "Upcoming edition",
        note:
          "This edition begins " + formatDate(edition.startDate, true) + ".",
      };
    }
    if (today > edition.endDate) {
      return {
        key: "archive",
        label: "Edition archive",
        note: "This dated edition has ended. Listings remain available as an archive.",
      };
    }
    return {
      key: "current",
      label: "Current edition",
      note: "Schedules can change. Open any listing for its published sources.",
    };
  }

  function eventSources(event) {
    return (Array.isArray(event.sources) ? event.sources : [])
      .map(function (source) {
        return {
          label: String(source.label || "Source"),
          url: safeURL(source.url),
        };
      })
      .filter(function (source) {
        return source.url;
      });
  }

  function listingPhoto(kind, record) {
    if (!record) return null;
    const custom = record.photo;
    if (custom && typeof custom === "object" && typeof custom.src === "string" &&
        /^https:\/\//i.test(custom.src) && safeURL(custom.src) &&
        typeof custom.source === "string" && /^https:\/\//i.test(custom.source) && safeURL(custom.source) && custom.credit && custom.alt) {
      return { src: safeURL(custom.src), source: safeURL(custom.source),
        credit: String(custom.credit), alt: String(custom.alt) };
    }
    const collection = window.GRLPhotos?.[kind];
    const key = kind === "artists" ? record.artist : record.id;
    return collection && Object.hasOwn(collection, key) ? collection[key] : null;
  }

  function photoImage(photo, small) {
    const position = /^\d{1,3}% \d{1,3}%$/.test(photo.position || "")
      ? ' style="object-position:' + photo.position + '"' : "";
    const src = small && photo.thumb ? photo.thumb : photo.src;
    const width = Number.isInteger(photo.width) && photo.width > 0 ? photo.width : 800;
    const height = Number.isInteger(photo.height) && photo.height > 0 ? photo.height : 550;
    return '<img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' +
      escapeHTML(src) + '" alt="' + escapeHTML(photo.alt) + '" width="' + width +
      '" height="' + height + '"' + position + '>';
  }

  function creditedPhoto(photo, className) {
    if (!photo) return "";
    return '<figure class="grl-photo ' + className + '">' + photoImage(photo, false) +
      '<figcaption>' + (photo.caption ? escapeHTML(photo.caption) + ' ' : '') + '<a href="' + escapeHTML(safeURL(photo.source)) +
      '" target="_blank" rel="noreferrer">' + escapeHTML(photo.credit) + '</a>' +
      ' · <a href="' + escapeHTML(photo.src) + '" target="_blank" rel="noreferrer">Full photo</a>' +
      (photo.license && photo.licenseUrl ? ' · <a href="' + escapeHTML(safeURL(photo.licenseUrl)) + '" target="_blank" rel="noreferrer">' + escapeHTML(photo.license) + '</a>' : '') + '</figcaption></figure>';
  }

  function listingImages(artist, room, event, venue) {
    if (!artist && !room) return "";
    return '<div class="grl-listing-images' + (artist && room ? ' paired' : '') + '">' +
      (artist ? '<figure class="artist-shot"><a href="#show/' + encodeURIComponent(event.id) +
        '" aria-label="Show details for ' + escapeHTML(event.title) + '">' + photoImage(artist, true) + '</a></figure>' : '') +
      (room ? '<figure class="venue-shot"><a href="#venue/' + encodeURIComponent(venue.id) +
        '" aria-label="Venue: ' + escapeHTML(venue.name) + '">' + photoImage(room, true) +
        '<span class="grl-room-label">Venue</span></a></figure>' : '') + '</div>';
  }

  function eventRow(event, options = {}) {
    const venue = getVenue(event.venueId);
    const href = "#show/" + encodeURIComponent(event.id);
    const media = listingImages(listingPhoto("artists", event), options.atVenue ? null : listingPhoto("venues", venue), event, venue);
    const time = formatTime(event.time) + (event.endTime ? "–" + formatTime(event.endTime) : "");
    const date = options.grouped ? "" : formatDate(event.date) + " · ";
    const past = event.date < chicagoDateKey() ? '<span class="grl-archive-label">Past</span> ' : "";
    const sub = event.artist && event.artist !== event.title ? '<p class="grl-performer">' + escapeHTML(event.artist) + '</p>' : "";
    const venueName = escapeHTML(venue ? venue.name : "Venue TBA");
    return '<article class="grl-event-row' + (options.compact ? ' grl-event-row--compact' : '') +
      (media ? ' with-media' : '') + '" data-event-id="' + escapeHTML(event.id) + '">' + media +
      '<div class="grl-event-copy"><p class="grl-listing-time">' + past + escapeHTML(date + time) +
      (event.sourceNote ? ' <span class="grl-time-note">' + (/times differ/i.test(event.sourceStatus) ? 'Times differ' : 'Check details') + '</span>' : '') + '</p><h3><a href="' + href + '">' + escapeHTML(event.title) + '</a></h3>' + sub +
      (options.atVenue ? '' : '<p class="grl-event-venue"><a href="#venue/' + encodeURIComponent(event.venueId) + '">' + venueName + '</a></p>') +
      '</div><a class="grl-row-link" href="' + href + '" aria-label="Open ' +
      escapeHTML(event.title) + ' details">Details</a></article>';
  }

  function daySections(events) {
    const days = new Map();
    for (const event of events) {
      if (!days.has(event.date)) days.set(event.date, []);
      days.get(event.date).push(event);
    }
    return Array.from(days, ([date, listings]) =>
      '<section class="grl-day" aria-labelledby="day-' + date +
      '"><h2 id="day-' + date + '">' + escapeHTML(new Intl.DateTimeFormat("en-US", {
        weekday: "long", month: "long", day: "numeric", timeZone: CALENDAR_TIMEZONE
      }).format(new Date(date + "T12:00:00Z"))) + '</h2>' +
      listings.map(event => eventRow(event, { grouped: true })).join("") + '</section>'
    ).join("");
  }

  function emptyState(title, copy, headingLevel) {
    const headingTag = headingLevel === 2 ? "h2" : "h3";
    return (
      '<div class="grl-empty"><' +
      headingTag +
      ">" +
      escapeHTML(title) +
      "</" +
      headingTag +
      "><p>" +
      escapeHTML(copy) +
      "</p></div>"
    );
  }

  function homeRows() {
    const events = publicEvents();
    const today = chicagoDateKey();
    const future = events.filter(function (event) {
      return event.date >= today;
    });
    const representatives = (future.length ? future : events).slice(0, 3);
    return representatives.length
      ? representatives
          .map(function (event) {
            return eventRow(event, { compact: true });
          })
          .join("")
      : emptyState("No listings in this edition", "Browse the venue directory.");
  }

  function guideView() {
    const venues = catalog.venues.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    const events = publicEvents();
    const dates = Array.from(
      new Set(
        events.map(function (event) {
          return event.date;
        }),
      ),
    ).sort();
    const edition = editionState();
    const weekendSource = events.some(function (event) {
      return eventSources(event).some(function (source) {
        return source.url === GRL_WEEKEND_URL;
      });
    })
      ? ' · <a class="grl-weekend-source" href="' +
        escapeHTML(GRL_WEEKEND_URL) +
        '" target="_blank" rel="noreferrer">Weekend source</a>'
      : "";
    return [
      '<section class="grl-page grl-guide-page" aria-labelledby="guide-title">',
      '<header class="grl-page-head"><p class="grl-eyebrow">',
      escapeHTML(edition.label),
      '</p><h1 id="guide-title">Live music guide.</h1>',
      '<p class="grl-page-intro"><strong>',
      escapeHTML(catalog.edition.label),
      "</strong> · Search ",
      events.length,
      " live music, DJ and karaoke listings across Grapevine",
      weekendSource,
      ".</p></header>",
      '<form class="grl-filters" id="grl-guide-filters" aria-label="Filter live music guide">',
      '<label><span>Artist or show</span><input id="grl-filter-query" type="search" placeholder="Try Cherry Bomb" autocomplete="off"></label>',
      '<label><span>Date</span><select id="grl-filter-date"><option value="">All dates</option>',
      dates
        .map(function (date) {
          return (
            '<option value="' +
            escapeHTML(date) +
            '">' +
            escapeHTML(formatDate(date, true)) +
            "</option>"
          );
        })
        .join(""),
      '</select></label><label><span>Venue</span><select id="grl-filter-venue"><option value="">All venues</option>',
      venues
        .map(function (venue) {
          return (
            '<option value="' +
            escapeHTML(venue.id) +
            '">' +
            escapeHTML(venue.name) +
            "</option>"
          );
        })
        .join(""),
      '</select></label><button type="reset" class="grl-text-button">Clear filters</button></form>',
      '<p class="grl-results-summary" id="grl-results-summary" aria-live="polite"></p>',
      '<div class="grl-event-list" id="grl-guide-results"></div>',
      '<section class="grl-calendar-panel" aria-labelledby="calendar-title"><div>',
      '<p class="grl-eyebrow">Take the guide with you</p><h2 id="calendar-title">Add this guide to your calendar.</h2>',
      '<p>Download this edition, or subscribe to the calendar URL in a compatible calendar app.</p></div>',
      '<div class="grl-calendar-actions"><a class="grl-button" href="',
      escapeHTML(CALENDAR_DOWNLOAD),
      '" download data-grl-calendar-download>Download .ics</a><a class="grl-button grl-button--outline" data-grl-calendar-subscribe href="',
      escapeHTML(calendarSubscribeURL()),
      '">Subscribe</a></div></section>',
      '</section>',
    ].join("");
  }

  let savedFilters = { query: "", date: "", venue: "" };

  function searchableText(value) {
    return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase()
      .replace(/[’']/g, "").replace(/&/g, " and ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }

  function bindGuide() {
    const form = document.querySelector("#grl-guide-filters");
    const results = document.querySelector("#grl-guide-results");
    const summary = document.querySelector("#grl-results-summary");
    if (!form || !results || !summary) return;
    const queryInput = form.querySelector("#grl-filter-query");
    const dateInput = form.querySelector("#grl-filter-date");
    const venueInput = form.querySelector("#grl-filter-venue");
    queryInput.value = savedFilters.query;
    dateInput.value = Array.from(dateInput.options).some(option => option.value === savedFilters.date) ? savedFilters.date : "";
    venueInput.value = Array.from(venueInput.options).some(option => option.value === savedFilters.venue) ? savedFilters.venue : "";
    const draw = function () {
      const words = searchableText(queryInput.value).split(/\s+/);
      const date = form.querySelector("#grl-filter-date").value;
      const venueId = form.querySelector("#grl-filter-venue").value;
      savedFilters = { query: queryInput.value, date, venue: venueId };
      const matches = publicEvents().filter(function (event) {
        const venue = getVenue(event.venueId);
        const searchText = searchableText([event.artist, event.title, event.genres, venue?.name || ""].join(" "));
        return (
          words.every(word => searchText.includes(word)) &&
          (!date || event.date === date) &&
          (!venueId || event.venueId === venueId)
        );
      });
      summary.textContent =
        "Showing " +
        matches.length +
        " " +
        (matches.length === 1 ? "listing" : "listings");
      results.innerHTML = matches.length
        ? daySections(matches)
        : emptyState(
            "No listings match",
            "Clear a filter or choose another date or venue.",
            2,
          );
    };
    queryInput.addEventListener("input", draw);
    dateInput.addEventListener("change", draw);
    venueInput.addEventListener("change", draw);
    form.addEventListener("reset", function () {
      window.setTimeout(draw, 0);
    });
    draw();
  }

  function venueCard(venue) {
    const count = publicEvents().filter(function (event) {
      return event.venueId === venue.id;
    }).length;
    return [
      '<article class="grl-venue-card">',
      listingPhoto("venues", venue) ? '<a class="grl-directory-image" href="#venue/' + encodeURIComponent(venue.id) + '" aria-label="View ' + escapeHTML(venue.name) + '">' + photoImage(listingPhoto("venues", venue), true) + '</a>' : "",
      '<div class="grl-venue-card-top">',
      "<span>Grapevine venue</span><span>",
      count ? count + (count === 1 ? " listing" : " listings") : "Venue profile",
      "</span></div><h2><a href=\"#venue/",
      encodeURIComponent(venue.id),
      '">',
      escapeHTML(venue.name),
      '</a></h2><p class="grl-address">',
      escapeHTML(venue.address),
      "</p><p>",
      escapeHTML(venue.description),
      '</p><ul class="grl-chip-list" aria-label="Venue features">',
      venue.features
        .map(function (item) {
          return "<li>" + escapeHTML(item) + "</li>";
        })
        .join(""),
      '</ul><div class="grl-card-actions"><a href="#venue/',
      encodeURIComponent(venue.id),
      '">View venue</a><a href="',
      escapeHTML(safeURL(venue.url)),
      '" target="_blank" rel="noreferrer">Official site</a><a href="',
      escapeHTML(directionsURL(venue.address)),
      '" target="_blank" rel="noreferrer" aria-label="Get directions to ',
      escapeHTML(venue.name),
      '">Directions</a></div></article>',
    ].join("");
  }

  let venueQuery = "";

  function directoryVenues(query = "") {
    const words = searchableText(query).split(/\s+/);
    return catalog.venues.filter(venue => {
      const searchable = searchableText([venue.name, venue.address, ...venue.features, venue.description].join(" "));
      return words.every(word => searchable.includes(word));
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  function bindVenues() {
    const input = document.querySelector("#venue-search");
    input.value = venueQuery;
    const draw = () => {
      venueQuery = input.value;
      const venues = directoryVenues(venueQuery);
      document.querySelector("#venue-search-count").textContent =
        venues.length + (venues.length === 1 ? " venue" : " venues");
      document.querySelector("#venue-search-results").innerHTML = venues.length
        ? venues.map(venueCard).join("")
        : emptyState("No matching venues", "Try another venue name, street or feature.", 2);
    };
    input.addEventListener("input", draw);
    draw();
  }

  function venuesView() {
    const venues = catalog.venues;
    return [
      '<section class="grl-page" aria-labelledby="venues-title"><header class="grl-page-head">',
      '<p class="grl-eyebrow">',
      venues.length,
      ' Grapevine venues</p><h1 id="venues-title">Venue guide.</h1>',
      '<p class="grl-page-intro">Explore Grapevine’s music venues, find the address and see who’s playing.</p>',
      '</header><div class="grl-venue-search"><label for="venue-search">Search venues</label>',
      '<input id="venue-search" type="search" placeholder="Name, street or feature" autocomplete="off">',
      '<span id="venue-search-count" role="status"></span></div><div class="grl-venue-grid" id="venue-search-results">',
      "</div></section>",
    ].join("");
  }

  function venueView(id) {
    const venue = getVenue(id);
    if (!venue) {
      return notFoundView(
        "Venue not found",
        "That venue is not in this directory.",
        "#venues",
        "Back to venues",
      );
    }
    const events = publicEvents().filter(function (event) {
      return event.venueId === venue.id;
    });
    const edition = editionState();
    return [
      '<section class="grl-page" aria-labelledby="venue-title"><a class="grl-back-link" href="#venues">Back to all venues</a>',
      '<header class="grl-page-head grl-venue-hero' + (listingPhoto("venues", venue) ? ' with-photo' : '') + '"><div><p class="grl-eyebrow">Venue guide</p>',
      '<h1 id="venue-title">',
      escapeHTML(venue.name),
      '</h1><p class="grl-page-intro">',
      escapeHTML(venue.description),
      '</p><div class="grl-venue-meta"><span>',
      escapeHTML(venue.address),
      '</span><a href="',
      escapeHTML(safeURL(venue.url)),
      '" target="_blank" rel="noreferrer">Official site</a><a href="',
      escapeHTML(directionsURL(venue.address)),
      '" target="_blank" rel="noreferrer" aria-label="Get directions to ',
      escapeHTML(venue.name),
      '">Directions</a></div></div>',
      creditedPhoto(listingPhoto("venues", venue), "grl-venue-photo"),
      '</header>',
      '<section class="grl-section" aria-labelledby="venue-shows-title"><div class="grl-section-heading">',
      '<p class="grl-eyebrow">',
      escapeHTML(edition.label),
      '</p><h2 id="venue-shows-title">',
      escapeHTML(catalog.edition.label),
      " listings</h2></div>",
      '<div class="grl-event-list">',
      events.length
        ? events
            .map(function (event) {
              return eventRow(event, { atVenue: true });
            })
            .join("")
        : emptyState(
            "No listings in this edition",
            "Use the official-site link for the venue’s latest schedule.",
          ),
      "</div></section></section>",
    ].join("");
  }

  function showView(id) {
    const event = publicEvents().find(function (item) {
      return item.id === id;
    });
    if (!event) {
      return notFoundView(
        "Show not found",
        "That listing is not in this edition.",
        "#guide",
        "Back to the guide",
      );
    }
    const venue = getVenue(event.venueId);
    const sources = eventSources(event);

    const past =
      event.date < chicagoDateKey()
        ? '<span class="grl-archive-label">Past</span>'
        : "";
    const sourceList = sources
      .map(function (source) {
        return (
          '<a href="' +
          escapeHTML(source.url) +
          '" target="_blank" rel="noreferrer">' +
          escapeHTML(source.label) +
          "</a>"
        );
      })
      .join("<br>");
    return [
      '<section class="grl-page grl-show-page" aria-labelledby="show-title">',
      '<a class="grl-back-link" href="#guide">Back to the music guide</a>',
      '<header class="grl-gig-head' + (listingPhoto("artists", event) ? ' with-photo' : '') + '"><div class="grl-gig-type">',
      '<p class="grl-gig-date">', past, escapeHTML(formatDate(event.date, true)), '</p>',
      '<h1 id="show-title">', escapeHTML(event.title), '</h1>',
      event.artist !== event.title ? '<p class="grl-gig-artist">' + escapeHTML(event.artist) + '</p>' : '',
      '<p class="grl-gig-time">', escapeHTML(formatTime(event.time)),
      event.endTime ? '–' + escapeHTML(formatTime(event.endTime)) : '', '</p>',
      venue ? '<a class="grl-gig-room" href="#venue/' + encodeURIComponent(venue.id) + '">' + escapeHTML(venue.name) + '</a>' : '',
      '</div>', creditedPhoto(listingPhoto("artists", event), "grl-performer-photo"), '</header>',
      '<div class="grl-show-grid"><section class="grl-show-info"><h2>Show details</h2>',
      event.summary ? '<p class="grl-show-lede">' + escapeHTML(event.summary) + '</p>' : '',
      event.sourceNote ? '<aside class="grl-source-note"><strong>Check before you go.</strong><p>' +
        escapeHTML(event.sourceNote) + '</p></aside>' : '',
      '<dl class="grl-show-facts">',
      event.genres ? '<div><dt>Program</dt><dd>' + escapeHTML(event.genres) + '</dd></div>' : '',
      '<div><dt>Admission</dt><dd>', escapeHTML(event.cover), '</dd></div>',
      sources.length ? '<div><dt>Sources</dt><dd>' + sourceList +
        (event.verifiedAt ? '<br><small>Checked ' + escapeHTML(formatDate(event.verifiedAt, true)) + '</small>' : '') +
        '</dd></div>' : '', '</dl>',
      '<div class="grl-show-actions"><button class="grl-button" type="button" id="grl-download-show">Add to calendar (.ics)</button></div></section>',
      venue ? '<section class="grl-show-location"><h2><a href="#venue/' + encodeURIComponent(venue.id) +
        '">' + escapeHTML(venue.name) + '</a></h2>' + creditedPhoto(listingPhoto("venues", venue), "grl-location-photo") +
        '<p class="grl-location-address">' + escapeHTML(venue.address) + '</p><div class="grl-card-actions">' +
        '<a href="' + escapeHTML(directionsURL(venue.address)) + '" target="_blank" rel="noreferrer" aria-label="Get directions to ' +
        escapeHTML(venue.name) + '">Directions</a><a href="' + escapeHTML(safeURL(venue.url)) +
        '" target="_blank" rel="noreferrer">Venue site</a></div></section>' : '',
      '</div></section>',
    ].join("");
  }

  function minutes(time) {
    const parts = time.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }

  function nextDate(date) {
    const parts = date.split("-").map(Number);
    const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
    return [
      next.getUTCFullYear(),
      String(next.getUTCMonth() + 1).padStart(2, "0"),
      String(next.getUTCDate()).padStart(2, "0"),
    ].join("-");
  }

  function icalDateTime(date, time) {
    return date.replaceAll("-", "") + "T" + time.replace(":", "") + "00";
  }

  function icalEscape(value) {
    return String(value == null ? "" : value)
      .replaceAll("\\", "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replaceAll(";", "\\;")
      .replaceAll(",", "\\,");
  }

  function foldICalLine(line) {
    const encoder = new TextEncoder();
    const rows = [];
    let current = "";
    Array.from(line).forEach(function (character) {
      if (encoder.encode(current + character).length > 73 && current) {
        rows.push(current);
        current = " " + character;
      } else {
        current += character;
      }
    });
    if (current) rows.push(current);
    return rows.join("\r\n");
  }

  function calendarStamp(date) {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  }

  function calendarText(eventList, name, calendarCatalog) {
    const feedCatalog = calendarCatalog || catalog;
    const generatedAt = calendarStamp(new Date());
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Grapevine Rocks Live//Music Guide//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:" + icalEscape(name),
      "X-WR-TIMEZONE:" + CALENDAR_TIMEZONE,
      "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
      "X-PUBLISHED-TTL:PT6H",
      "BEGIN:VTIMEZONE",
      "TZID:" + CALENDAR_TIMEZONE,
      "X-LIC-LOCATION:" + CALENDAR_TIMEZONE,
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:-0600",
      "TZOFFSETTO:-0500",
      "TZNAME:CDT",
      "DTSTART:20070311T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:-0500",
      "TZOFFSETTO:-0600",
      "TZNAME:CST",
      "DTSTART:20071104T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
      "END:STANDARD",
      "END:VTIMEZONE",
    ];
    eventList.forEach(function (event) {
      const venue = feedCatalog.venues.find(function (candidate) {
        return candidate.id === event.venueId;
      });
      const sources = eventSources(event);
      const description = [
        event.summary || defaultSummary(event, venue),
        event.endTime ? "" : "End time not listed.",
        event.sourceNote || "",
      ]
        .concat(
          sources.map(function (source) {
            return "Source: " + source.label + " — " + source.url;
          }),
        )
        .filter(Boolean)
        .join("\n");
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + event.id + "@cmcnosky.github.io",
        "DTSTAMP:" + generatedAt,
        "SEQUENCE:" + feedCatalog.revision,
        "DTSTART;TZID=" +
          CALENDAR_TIMEZONE +
          ":" +
          icalDateTime(event.date, event.time),
      );
      if (event.endTime) {
        const endDate =
          minutes(event.endTime) <= minutes(event.time)
            ? nextDate(event.date)
            : event.date;
        lines.push(
          "DTEND;TZID=" +
            CALENDAR_TIMEZONE +
            ":" +
            icalDateTime(endDate, event.endTime),
        );
      }
      lines.push(
        "SUMMARY:" + icalEscape(event.title),
        "DESCRIPTION:" + icalEscape(description),
        "LOCATION:" +
          icalEscape(
            venue ? venue.name + ", " + venue.address : "Grapevine, TX",
          ),
        "CATEGORIES:" + icalEscape(event.genres),
      );
      if (sources[0]) lines.push("URL:" + sources[0].url);
      lines.push("TRANSP:OPAQUE", "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return (
      lines
        .map(function (line) {
          return foldICalLine(line);
        })
        .join("\r\n") + "\r\n"
    );
  }

  function calendarFeed(input) {
    const feedCatalog =
      typeof input === "undefined" ? catalog : normalizeCatalog(input);
    return calendarText(
      feedCatalog.events.slice().sort(function (a, b) {
        return (a.date + "T" + a.time).localeCompare(b.date + "T" + b.time);
      }),
      "Grapevine Rocks Live Calendar",
      feedCatalog,
    );
  }

  function downloadCalendarFile(content, fileName) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectURL;
    link.download = fileName;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(objectURL);
    }, 1000);
  }

  function downloadCalendar() {
    downloadCalendarFile(
      calendarFeed(),
      "grapevine-rocks-live-calendar.ics",
    );
  }

  function downloadShowCalendar(event) {
    const content = calendarText(
      [event],
      event.title + " — Grapevine Rocks Live",
      catalog,
    );
    const fileName =
      event.date +
      "-" +
      event.title
        .toLocaleLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      ".ics";
    downloadCalendarFile(content, fileName);
  }

  function bindShow(id) {
    const event = publicEvents().find(function (item) {
      return item.id === id;
    });
    const button = document.querySelector("#grl-download-show");
    if (!event || !button) return;
    button.addEventListener("click", function () {
      downloadShowCalendar(event);
    });
  }

  function notFoundView(title, copy, href, label) {
    return (
      '<section class="grl-page"><div class="grl-empty grl-empty--page"><h1>' +
      escapeHTML(title) +
      "</h1><p>" +
      escapeHTML(copy) +
      '</p><a class="grl-button" href="' +
      escapeHTML(href) +
      '">' +
      escapeHTML(label) +
      "</a></div></section>"
    );
  }

  function render(route, id, options) {
    if (!handledRoutes.has(route)) return false;
    const main = document.querySelector("#main");
    if (!main) return false;
    let decodedId = "";
    try {
      decodedId = id ? decodeURIComponent(id) : "";
    } catch (error) {
      decodedId = "";
    }
    if (route === "guide") main.innerHTML = guideView();
    if (route === "venues") main.innerHTML = venuesView();
    if (route === "venue") main.innerHTML = venueView(decodedId);
    if (route === "show") main.innerHTML = showView(decodedId);
    if (route === "guide") bindGuide();
    if (route === "venues") bindVenues();
    if (route === "show") bindShow(decodedId);
    document.title =
      (main.querySelector("h1")?.textContent || "Music guide") +
      " | Grapevine Rocks Live";
    const heading = main.querySelector("h1");
    if (heading && (!options || options.focus !== false)) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    return true;
  }

  function publicCatalog() {
    const output = clone(catalog);
    output.shows = output.events;
    delete output.events;
    return output;
  }

  const catalogReady = loadOwnerCatalog();

  if (typeof document !== "undefined") {
    document.addEventListener("error", function (event) {
      if (event.target.tagName !== "IMG") return;
      const holder = event.target.closest(".grl-photo, .grl-listing-images figure, .grl-directory-image");
      if (!holder) return;
      const parent = holder.parentElement;
      holder.remove();
      if (parent.classList.contains("grl-listing-images")) {
        parent.classList.remove("paired");
        if (!parent.children.length) {
          parent.closest(".grl-event-row")?.classList.remove("with-media");
          parent.remove();
        }
      } else {
        parent.classList.remove("with-photo");
      }
    }, true);
    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-grl-calendar-download]");
      if (!trigger) return;
      event.preventDefault();
      downloadCalendar();
    });
  }

  window.GRLGuide = Object.freeze({
    render: render,
    homeRows: homeRows,
    handles: function (route) {
      return handledRoutes.has(route);
    },
    getShows: function () {
      return clone(publicEvents());
    },
    getVenues: function () {
      return clone(catalog.venues);
    },
    getCatalog: publicCatalog,
    catalogStatus: function () {
      return { source: catalogSource, revision: catalog.revision };
    },
    ready: catalogReady,
    calendarFeed: calendarFeed,
    calendarLinks: function () {
      return {
        download: CALENDAR_DOWNLOAD,
        subscribe: calendarSubscribeURL(),
      };
    },
    downloadCalendar: downloadCalendar,
  });
})();
