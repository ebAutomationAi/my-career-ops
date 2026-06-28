// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Orbio Work ATS provider.
// Auto-detects from careers_url pattern jobs.orbio.work/sites/{apCode}.
// API key is the public read-only platform key embedded in Orbio's own
// frontend bundle (not a secret — delivered to every visitor of their
// careers site). To refresh it if it ever rotates: visit any
// jobs.orbio.work page, open /assets/index-*.js, search ORBIO_API_KEY.

const ORBIO_BASE = 'https://eu.platform.orbio.work/api';
const ORBIO_API_KEY = 'orbio_apikey_live_4f8b2c1e7a9d4b3f8c2e1d5a6b7c9e0f';
const ORBIO_HOST = 'jobs.orbio.work';
const ORBIO_SITES_PREFIX = '/sites/';

function resolveApCode(entry) {
  const raw = typeof entry.careers_url === 'string' ? entry.careers_url : '';
  let parsed;
  try { parsed = new URL(raw); } catch { return null; }
  if (parsed.hostname !== ORBIO_HOST) return null;
  if (!parsed.pathname.startsWith(ORBIO_SITES_PREFIX)) return null;
  const code = parsed.pathname.slice(ORBIO_SITES_PREFIX.length).split('/')[0];
  return code || null;
}

/** @type {Provider} */
export default {
  id: 'orbio',

  detect(entry) {
    return resolveApCode(entry) ? { url: entry.careers_url } : null;
  },

  async fetch(entry, ctx) {
    const apCode = resolveApCode(entry);
    if (!apCode) throw new Error(`orbio: cannot derive apCode from ${entry.careers_url}`);

    const apiUrl = `${ORBIO_BASE}/hiring/${apCode}/positions-public`;
    const json = await ctx.fetchJson(apiUrl, {
      headers: { 'x-api-key': ORBIO_API_KEY },
    });

    const companyName = json.company?.name || entry.name;
    const jobs = Array.isArray(json.jobs) ? json.jobs : [];

    return jobs.map(j => ({
      title:    j.name      || '',
      url:      j.apply_url || '',
      location: j.location  || '',
      company:  companyName,
    }));
  },
};
