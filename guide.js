(function () {
  "use strict";

  const CHECKED_DATE = "2026-11-20";
  const EDITION_START = "2026-11-20";
  const EDITION_END = "2026-11-26";
  const CALENDAR_TIMEZONE = "America/Chicago";
  const CALENDAR_DOWNLOAD = "./calendar.ics";
  const CALENDAR_SUBSCRIBE =
    "webcal://cmcnosky.github.io/grapevine-rocks-live/calendar.ics";
  // Initial published feed revision. Increment when a committed event changes.
  const CALENDAR_SEQUENCE = 0;
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

  const catalog = {
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
        genres: "Grateful Dead • Country",
        summary:
          "Tolbert’s bills The Country Dead as Grateful Dead gone country.",
        sources: [GRL_WEEKEND_SOURCE, TOLBERTS_SOURCE],
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

  const handledRoutes = new Set(["guide", "venues", "venue", "show"]);
  const sourceBadges = {
    "GRL guide": "GRL",
    "GRL + venue": "GRL + venue",
    "Venue-published": "Venue",
    "Times differ — recheck": "Time check",
    "Details differ — recheck": "Details check",
    "GRL guide — recheck": "Recheck",
  };

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
      const url = new URL(value, window.location.href);
      return ["http:", "https:", "webcal:"].includes(url.protocol)
        ? url.href
        : "";
    } catch (error) {
      return "";
    }
  }

  function directionsURL(address) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(address)
    );
  }

  function getVenue(venueId) {
    return catalog.venues.find(function (venue) {
      return venue.id === venueId;
    });
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

  function dayNumber(date) {
    return Number(date.slice(8, 10));
  }

  function monthShort(date) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "short",
    }).format(new Date(date + "T12:00:00Z"));
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
    if (today < EDITION_START) {
      return {
        key: "upcoming",
        label: "Upcoming edition",
        note: "This edition begins Friday, November 20, 2026.",
      };
    }
    if (today > EDITION_END) {
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

  function statusLabel(event) {
    return sourceBadges[event.sourceStatus] || "Source";
  }

  function listingStatus(event, detail) {
    const sources = eventSources(event);
    const needsCheck = /recheck|differ/i.test(event.sourceStatus || "");
    const badge =
      '<span class="' +
      (needsCheck ? "grl-check-label" : "grl-source-label") +
      '">' +
      escapeHTML(statusLabel(event)) +
      "</span>";
    if (detail || !sources.length) return badge;
    if (sources.length > 1) {
      return (
        badge +
        '<a class="grl-source-link" href="#show/' +
        encodeURIComponent(event.id) +
        '">' +
        sources.length +
        " sources</a>"
      );
    }
    return (
      badge +
      '<a class="grl-source-link" href="' +
      escapeHTML(sources[0].url) +
      '" target="_blank" rel="noreferrer">Source</a>'
    );
  }

  function eventRow(event, options) {
    const venue = getVenue(event.venueId);
    const compact = options && options.compact ? " grl-event-row--compact" : "";
    const artistLine =
      event.artist && event.artist !== event.title
        ? "<strong>" + escapeHTML(event.artist) + "</strong> · "
        : "";
    const past =
      event.date < chicagoDateKey()
        ? '<span class="grl-archive-label">Past</span>'
        : "";
    return [
      '<article class="grl-event-row',
      compact,
      '" data-event-id="',
      escapeHTML(event.id),
      '">',
      '<div class="grl-event-date" aria-label="',
      escapeHTML(formatDate(event.date, true)),
      '"><span>',
      escapeHTML(formatDate(event.date).split(",")[0]),
      "</span><strong>",
      escapeHTML(dayNumber(event.date)),
      "</strong></div>",
      '<div class="grl-event-copy"><div class="grl-event-kicker">',
      past,
      listingStatus(event, false),
      "<span>",
      escapeHTML(event.genres),
      "</span></div><h3><a href=\"#show/",
      encodeURIComponent(event.id),
      '">',
      escapeHTML(event.title),
      "</a></h3><p>",
      artistLine,
      escapeHTML(formatTime(event.time)),
      event.endTime ? "–" + escapeHTML(formatTime(event.endTime)) : "",
      '</p><p class="grl-event-venue"><a href="#venue/',
      encodeURIComponent(event.venueId),
      '">',
      escapeHTML(venue ? venue.name : "Venue TBA"),
      "</a></p></div>",
      '<a class="grl-row-link" href="#show/',
      encodeURIComponent(event.id),
      '" aria-label="Open ',
      escapeHTML(event.title),
      ' details">Details</a></article>',
    ].join("");
  }

  function emptyState(title, copy) {
    return (
      '<div class="grl-empty"><h3>' +
      escapeHTML(title) +
      "</h3><p>" +
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
    return [
      '<section class="grl-page grl-guide-page" aria-labelledby="guide-title">',
      '<header class="grl-page-head"><p class="grl-eyebrow">',
      escapeHTML(edition.label),
      '</p><h1 id="guide-title">Live music guide.</h1>',
      '<p class="grl-page-intro"><strong>November 20–26, 2026</strong> · Search ',
      events.length,
      ' live music, DJ and karaoke listings across Grapevine. <a class="grl-weekend-source" href="',
      escapeHTML(GRL_WEEKEND_URL),
      '" target="_blank" rel="noreferrer">Weekend source</a></p></header>',
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
      '" download>Download .ics</a><a class="grl-button grl-button--outline" href="',
      escapeHTML(CALENDAR_SUBSCRIBE),
      '">Subscribe</a></div></section>',
      '<aside class="grl-guide-cta"><div><p class="grl-eyebrow">The GRL newsletter</p>',
      "<h2>Get the next music guide in your inbox.</h2></div>",
      '<a class="grl-button grl-button--cream" href="#newsletter">Join the list</a></aside></section>',
    ].join("");
  }

  function bindGuide() {
    const form = document.querySelector("#grl-guide-filters");
    const results = document.querySelector("#grl-guide-results");
    const summary = document.querySelector("#grl-results-summary");
    if (!form || !results || !summary) return;
    const draw = function () {
      const query = form
        .querySelector("#grl-filter-query")
        .value.trim()
        .toLocaleLowerCase();
      const date = form.querySelector("#grl-filter-date").value;
      const venueId = form.querySelector("#grl-filter-venue").value;
      const matches = publicEvents().filter(function (event) {
        const venue = getVenue(event.venueId);
        const searchText = [
          event.artist,
          event.title,
          event.genres,
          venue ? venue.name : "",
        ]
          .join(" ")
          .toLocaleLowerCase();
        return (
          (!query || searchText.includes(query)) &&
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
        ? matches
            .map(function (event) {
              return eventRow(event);
            })
            .join("")
        : emptyState(
            "No listings match",
            "Clear a filter or choose another date or venue.",
          );
    };
    form.addEventListener("input", draw);
    form.addEventListener("change", draw);
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
      '<article class="grl-venue-card"><div class="grl-venue-card-top">',
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

  function venuesView() {
    const venues = catalog.venues.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    return [
      '<section class="grl-page" aria-labelledby="venues-title"><header class="grl-page-head">',
      '<p class="grl-eyebrow">',
      venues.length,
      ' Grapevine venues</p><h1 id="venues-title">Find the room that fits the night.</h1>',
      '<p class="grl-page-intro">Explore the restaurants, bars, wineries, taprooms and community rooms in this edition. Every profile includes its official site and directions.</p>',
      '</header><div class="grl-venue-grid">',
      venues.map(venueCard).join(""),
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
      '<header class="grl-page-head grl-venue-hero"><p class="grl-eyebrow">Venue guide</p>',
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
      '">Directions</a></div></header>',
      '<section class="grl-section" aria-labelledby="venue-shows-title"><div class="grl-section-heading">',
      '<p class="grl-eyebrow">',
      escapeHTML(edition.label),
      '</p><h2 id="venue-shows-title">November 20–26 listings</h2></div>',
      '<div class="grl-event-list">',
      events.length
        ? events
            .map(function (event) {
              return eventRow(event);
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
    const lede =
      event.summary ||
      event.title + (venue ? " at " + venue.name + "." : " in Grapevine.");
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
      '<div class="grl-show-poster"><div class="grl-show-date-block"><span>',
      escapeHTML(formatDate(event.date).split(",")[0]),
      "</span><strong>",
      escapeHTML(dayNumber(event.date)),
      "</strong><span>",
      escapeHTML(monthShort(event.date)),
      '</span></div><div><p class="grl-eyebrow">',
      listingStatus(event, true),
      "<span>",
      escapeHTML(event.genres),
      '</span></p><h1 id="show-title">',
      escapeHTML(event.title),
      "</h1>",
      event.artist !== event.title
        ? '<p class="grl-show-artist">' +
          escapeHTML(event.artist) +
          "</p>"
        : "",
      "</div></div>",
      '<div class="grl-show-grid"><div><p class="grl-show-lede">',
      escapeHTML(lede),
      "</p>",
      event.sourceNote
        ? '<aside class="grl-source-note"><strong>Check before you go.</strong><p>' +
          escapeHTML(event.sourceNote) +
          "</p></aside>"
        : '<p class="grl-source-freshness">Sources checked ' +
          escapeHTML(formatDate(event.verifiedAt, true)) +
          ". Schedules can change.</p>",
      '<div class="grl-show-actions"><button class="grl-button" type="button" id="grl-download-show">Add to calendar (.ics)</button>',
      venue
        ? '<a class="grl-button grl-button--outline" href="' +
          escapeHTML(safeURL(venue.url)) +
          '" target="_blank" rel="noreferrer">Venue site</a>'
        : "",
      "</div></div>",
      '<dl class="grl-show-facts"><div><dt>Date</dt><dd>',
      escapeHTML(formatDate(event.date, true)),
      "</dd></div><div><dt>Time</dt><dd>",
      escapeHTML(formatTime(event.time)),
      event.endTime ? "–" + escapeHTML(formatTime(event.endTime)) : "",
      '</dd></div><div><dt>Venue</dt><dd><a href="#venue/',
      encodeURIComponent(event.venueId),
      '">',
      escapeHTML(venue ? venue.name : "Venue TBA"),
      "</a>",
      venue
        ? '<br><small>' +
          escapeHTML(venue.address) +
          '</small><br><a href="' +
          escapeHTML(directionsURL(venue.address)) +
          '" target="_blank" rel="noreferrer" aria-label="Get directions to ' +
          escapeHTML(venue.name) +
          '">Directions</a>'
        : "",
      "</dd></div><div><dt>Admission</dt><dd>",
      escapeHTML(event.cover),
      "</dd></div>",
      sources.length
        ? "<div><dt>Sources</dt><dd>" +
          sourceList +
          "<br><small>Checked " +
          escapeHTML(formatDate(event.verifiedAt, true)) +
          "</small></dd></div>"
        : "",
      "</dl></div></section>",
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

  function calendarText(eventList, name) {
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
      const venue = getVenue(event.venueId);
      const sources = eventSources(event);
      const description = [
        event.summary ||
          event.title + (venue ? " at " + venue.name + "." : " in Grapevine."),
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
        "SEQUENCE:" + CALENDAR_SEQUENCE,
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

  function calendarFeed() {
    return calendarText(
      publicEvents(),
      "Grapevine Rocks Live Calendar",
    );
  }

  function downloadShowCalendar(event) {
    const content = calendarText(
      [event],
      event.title + " — Grapevine Rocks Live",
    );
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName =
      event.date +
      "-" +
      event.title
        .toLocaleLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      ".ics";
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

  function render(route, id) {
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
    if (route === "show") bindShow(decodedId);
    document.title =
      (main.querySelector("h1")?.textContent || "Music guide") +
      " | Grapevine Rocks Live";
    const heading = main.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    return true;
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
    calendarFeed: calendarFeed,
  });
})();
