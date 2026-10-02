# Tour Itinerary (WordPress block)

A day-by-day tour programme block with stops and times that adds
schema.org `TouristTrip` structured data to the page. Built for the
WordPress.org Block Directory: one block, no settings page, no external
service, minimal PHP.

The structured data comes from
[tourist-trip-schema](https://github.com/First-Point/tourist-trip-schema).
WordPress.org listing text lives in `readme.txt`.

## How it works

- **Editor (`src/edit.js`)** builds the JSON-LD with the library whenever the
  inputs change and stores it in the `schema` attribute. Invalid input shows
  a warning and stores nothing.
- **Saved markup (`src/save.js`, `src/timeline.js`)** is the visible
  timeline. The editor preview uses the same component.
- **`src/render.php`** prints the saved markup plus the stored JSON-LD,
  completed with page values (title when the block has no name, permalink,
  featured image). It builds nothing itself.
- **kses:** for users without `unfiltered_html`, WordPress turns "&" into
  "&amp;" inside block attributes. Every read decodes entities (`clean()` in
  `src/data.js`, `tour_itinerary_decode()` in PHP), so the round trip is
  stable. Tested with an Author account in `wp-env`. Known limit: for those
  users kses also strips text that looks like a tag (`<6`) from the
  structured data; the visible text is not affected.

## Development

```sh
npm install
npm run build        # build/ is what WordPress loads
npm test             # Vitest
npm run lint:js && npm run lint:css
npm run env start    # WordPress at http://localhost:8888 (admin / password), needs Docker
```

`tourist-trip-schema` is linked from `../tourist-trip-schema` until it is
published to npm. **Before the first release, replace the `file:`
dependency with the npm version**, otherwise CI cannot install it.

## Release

1. Bump the version in `tour-itinerary.php`, `src/block.json`,
   `package.json` and `readme.txt` (`Stable tag`), add a changelog entry.
2. Push a tag such as `0.1.0`. `.github/workflows/deploy.yml` deploys to
   WordPress.org SVN (secrets `SVN_USERNAME`, `SVN_PASSWORD`).

The first version has to be submitted by hand at
https://wordpress.org/plugins/developers/add/ and pass review before SVN
access exists. Directory assets (icon, banner, screenshots) go into
`.wordpress-org/`.

## License

GPL-2.0-or-later. Made by [Your Next Tours](https://yournext.tours).
