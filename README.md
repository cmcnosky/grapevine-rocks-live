# Grapevine Rocks Live

[Visit Grapevine Rocks Live](https://cmcnosky.github.io/grapevine-rocks-live/)

The live music calendar, venue directory, GRL TV, community events and social archive for Grapevine, Texas.

## Publication

GitHub Pages publishes the repository root from the main branch. Ordinary hash links open individual shows, venues, stories and series. To serve the site locally, run `python3 -m http.server` from the repository root.

## Editorial files

- `guide.js` holds published show and venue records, calendar filtering and iCalendar serialization.
- `calendar.ics` is the public subscription feed. After changing calendar records, run `node scripts/update-calendar.cjs` and commit the updated feed with the source data.
- `media.js` contains the GRL profile links and featured original stories.
- `archive-data.js` and `archive.js` power the searchable Instagram post index.
- `app.js` contains public routes, directory entries and contact options.
- `assets/` contains the site artwork and fonts, with the two font licenses.

Show records retain their sources so an editor can check times and amend a listing. The site links to the original publisher for social media. Visitors choose where to send a drafted message. Contact details stay out of this repository.
