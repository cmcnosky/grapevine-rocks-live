# Grapevine Rocks Live

The Grapevine live music guide is published on [GitHub Pages](https://cmcnosky.github.io/grapevine-rocks-live/).

## Editing the guide

Select **Log in** in the website footer or open the [login page](https://cmcnosky.github.io/grapevine-rocks-live/login/), then sign in with the account details supplied privately. **Overview** summarizes the current edition, shows the schedule for a selected date and collects the publication controls. **Shows** can be searched, filtered by date or venue and sorted by date, artist or venue. **Venues** can be searched, sorted and opened with their scheduled shows. **Edition** controls the public guide’s date range and label.

Use **Edit** to change a record, **Duplicate** to create a separate repeat booking from an existing show or **Add show** and **Add venue** to create records. A show or venue form can also use an HTTPS photo URL with a description, credit and source link. Complete all four photo fields, or clear all four to restore the standard guide photo when one is available.

Saving a form stages an unpublished change in that browser tab. Record badges distinguish published, edited and new entries, and **View live** appears only for records that already exist on the public site. Review the pending changes from **Overview**, then select **Publish changes** to update the shared guide. Publication creates a numbered revision in the hosted database. If another editor publishes first, reload the current revision before publishing again.

## Public data and calendars

- `owner-source.js` specifies the public catalog and subscription feed. The login verifier and session records are held by the publishing service.
- `guide.js` validates and displays the current catalog, builds individual and full calendar downloads, and provides an embedded fallback.
- `owner-content.json` is the GitHub copy of the published catalog. The scheduled **Mirror published catalog** workflow updates it and the legacy `calendar.ics` subscription. GitHub also allows a manual workflow run.
- `media.js`, `archive-data.js` and `archive.js` supply the featured stories, social links and searchable Instagram archive.
- `app.js` contains visitor routes and the contact-message forms. The visitor chooses where to send a prepared message.
- `listing-photos.js` associates the standard performer and venue photographs with their public source, credit, description and local files under `assets/photos/`.
- `assets/` also contains artwork, fonts and their license files.
