// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Turijobs provider — portal líder de empleo en turismo y hostelería España.
// Fetches SSR offers embedded in __NEXT_DATA__ (Next.js) — no API, no Playwright.
// URL pattern: https://www.turijobs.com/es-es/ofertas-trabajo/{category}/{location}
// Paginación: ?page=N (~12 items/page).
//
// Tested against: turijobs.com/es-es/ofertas-trabajo/recepcion/barcelona

const MAX_PAGES = 10;
const TIMEOUT_MS = 15_000;
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'es-ES,es;q=0.9',
};

const TURIJOBS_BASE = 'https://www.turijobs.com';
const OFFER_PATH_PREFIX = '/es-es/oferta-trabajo/';

function isTurijobsUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'www.turijobs.com' || hostname === 'turijobs.com';
  } catch {
    return false;
  }
}

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Recursively find first array whose items have enterpriseName
// (directly on item or on item.company) — fallback when primary path is absent
function findOfferArray(obj, depth = 0) {
  if (depth > 8) return null;
  if (Array.isArray(obj) && obj.length > 0) {
    const first = obj[0];
    if (first && typeof first === 'object') {
      if ('enterpriseName' in first ||
          (first.company && typeof first.company === 'object' && 'enterpriseName' in first.company)) {
        return obj;
      }
    }
  }
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') {
        const found = findOfferArray(v, depth + 1);
        if (found) return found;
      }
    }
  }
  return null;
}

function buildAbsoluteUrl(relativeUrl) {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http')) return relativeUrl;
  if (relativeUrl.startsWith('/')) return TURIJOBS_BASE + relativeUrl;
  return TURIJOBS_BASE + OFFER_PATH_PREFIX + relativeUrl;
}

function extractOffers(parsed, companyName) {
  const primary = parsed?.props?.pageProps?.searchData?.offers;
  const offers = Array.isArray(primary) ? primary : findOfferArray(parsed);
  if (!Array.isArray(offers)) return [];

  return offers
    .filter(item => item && item.title)
    .map(item => ({
      title: item.title,
      url: buildAbsoluteUrl(item.url),
      company: item.company?.enterpriseName || companyName,
      location: item.location?.address || item.location?.cityName || '',
    }));
}

/** @type {Provider} */
export default {
  id: 'turijobs',

  detect(entry) {
    if (!entry.careers_url) return null;
    return isTurijobsUrl(entry.careers_url) ? { url: entry.careers_url } : null;
  },

  async fetch(entry, ctx) {
    const base = entry.careers_url;
    const companyName = entry.name || '';
    const allJobs = [];
    const seenUrls = new Set();

    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = page === 1 ? base : `${base}?page=${page}`;
      let html;
      try {
        html = await ctx.fetchText(url, { headers: HEADERS, timeoutMs: TIMEOUT_MS });
      } catch (err) {
        if (page === 1) throw err;
        break;
      }

      const parsed = extractNextData(html);
      if (!parsed) break;

      const pageOffers = extractOffers(parsed, companyName);
      if (pageOffers.length === 0) break;

      let newOnThisPage = 0;
      for (const job of pageOffers) {
        if (job.url && !seenUrls.has(job.url)) {
          seenUrls.add(job.url);
          allJobs.push(job);
          newOnThisPage++;
        }
      }

      if (newOnThisPage === 0) break;
    }

    return allJobs;
  },
};
