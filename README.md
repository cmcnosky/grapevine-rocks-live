# Grapevine Rocks Live

The Grapevine live music guide is published on [GitHub Pages](https://cmcnosky.github.io/grapevine-rocks-live/).

## Editing the guide

Open the private login bookmark on a new browser, then sign in at [Log in](https://cmcnosky.github.io/grapevine-rocks-live/login/). The editor manages shows, venues and the guide edition. Save each edit, then select **Publish changes**. Publication creates a numbered revision in the hosted database. Editors working from an older revision must reload before publishing their changes.

## Public data and calendars

- `owner-source.js` specifies the public catalog and subscription feed. The login verifier and session records are held by the publishing service.
- `guide.js` validates and displays the current catalog, builds individual and full calendar downloads, and provides an embedded fallback.
- `owner-content.json` is the GitHub copy of the published catalog. The scheduled **Mirror published catalog** workflow updates it and the legacy `calendar.ics` subscription. GitHub also allows a manual workflow run.
- `media.js`, `archive-data.js` and `archive.js` supply the featured stories, social links and searchable Instagram archive.
- `app.js` contains visitor routes and the contact-message forms. The visitor chooses where to send a prepared message.
- `assets/` contains artwork, fonts and their license files.
