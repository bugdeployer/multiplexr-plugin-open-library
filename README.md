# Open Library metadata for Multiplexr

Searches book works using Open Library. Returns title, authors, first publication year and Open Library identity. No API key is required.

Allow your book collection and `https://openlibrary.org` in **Manage > Permissions**, then enable the plugin and choose Open Library in Find metadata.

Uses the [Open Library Search API](https://openlibrary.org/dev/docs/api/search). Searches are paged and request only the required fields.

## Install

Requires the patched Multiplexr plugin host (0.5.1 or newer). Download the signed `.mpx.json` from Releases and install it through **Settings > Plugins & themes**. Review access before enabling. The 0.1.0 release was a starter and has no metadata handler.

## Development

Node.js 22 or newer.

```sh
npm ci
npm run check
npm test
npm run build
```

Tests use the bundled plugin entrypoint with host fixtures, not service credentials. To sign, run `npm run sign -- --key /private/publisher.pem`. Keep the publisher key outside the repository. The release workflow uses the `PLUGIN_SIGNING_KEY` Actions secret.

[Plugin SDK](https://github.com/bugdeployer/Multiplexr/tree/main/packages/multiplexr_plugin_sdk) · GPL-3.0-only.
