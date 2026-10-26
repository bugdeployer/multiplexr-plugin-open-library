const PLUGIN_ID = 'com.bugdeployer.openlibrary';
/** @param {unknown} value @returns {Record<string, unknown>} */
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AppShell.PluginError('invalid_response');
  return /** @type {Record<string, unknown>} */ (value);
}
/** @param {unknown} value @param {number} maximum */
function text(value, maximum = 512) { return typeof value === 'string' ? value.trim().slice(0, maximum) : ''; }
/** @param {import('multiplexr_plugin_sdk').Request} request */
function multiplexrEntry(request) {
  return AppShell.definePlugin({
    'metadata.search': AppShell.contribution('metadata.provider', (params, host) => {
      if (params.kind !== 'ebook') throw new AppShell.PluginError('unsupported_capability');
      const page = params.cursor == null ? 1 : Number(params.cursor);
      if (!Number.isInteger(page) || page < 1 || page > 1000) throw new AppShell.PluginError('invalid_request');
      let url = 'https://openlibrary.org/search.json?title=' + encodeURIComponent(params.query) +
        '&fields=key,title,author_name,first_publish_year&limit=10&page=' + page;
      if (params.creator) url += '&author=' + encodeURIComponent(params.creator);
      if (/^[a-z]{2}(-[A-Z]{2})?$/.test(params.language ?? '') && params.language !== 'us') url += '&lang=' + params.language?.slice(0, 2);
      const response = object(AppShell.httpJson(host, url));
      if (!Array.isArray(response.docs)) throw new AppShell.PluginError('invalid_response');
      const seen = new Set();
      const items = response.docs.slice(0, 10).flatMap(raw => {
        const item = object(raw), title = text(item.title), key = text(item.key).replace(/^\/works\//, '');
        if (!/^OL\d+W$/.test(key) || !title || seen.has(key)) return [];
        seen.add(key);
        const authors = Array.isArray(item.author_name) ? item.author_name.slice(0, 32).map(a => text(a, 256)).filter(Boolean) : [];
        /** @type {import('multiplexr_plugin_sdk').MetadataFields} */
        const fields = { identifier: 'openlibrary:' + key };
        const year = Number(item.first_publish_year);
        if (item.first_publish_year != null && Number.isInteger(year) && year > 0 && year <= 9999) fields.year = year;
        return [{ id: AppShell.namespacedId(PLUGIN_ID, 'work.' + key), title, authors, fields }];
      });
      const total = Number(response.numFound ?? response.num_found);
      return AppShell.page(items, page < 1000 && Number.isFinite(total) && page * 10 < total ? String(page + 1) : null);
    }, PLUGIN_ID),
  })(request);
}
