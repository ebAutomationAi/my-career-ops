// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Bizneo ATS provider.
// Auto-detects from careers_url hostname matching `career.{company}.com`.
// Also activated by explicit `provider: bizneo` in portals.yml.
//
// Fetches all paginated pages of the public Bizneo career portal and
// parses `.job-card` elements from the server-rendered HTML.
// No API key required — Bizneo career portals are public HTML.
//
// Tested against: career.ilerna.com

const MAX_PAGES = 20;
const TIMEOUT_MS = 15_000;
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'accept': 'text/html,application/xhtml+xml',
  'accept-language': 'es-ES,es;q=0.9',
};

// Auto-detect: hostname must be exactly `career.{one-label}.com`
// (e.g. career.ilerna.com — not career.foo.bar.com)
function isBizneoUrl(url) {
  try {
    const { hostname } = new URL(url);
    // Split: ['career', '{company}', 'com'] — exactly 3 parts
    const parts = hostname.split('.');
    return parts.length === 3 && parts[0] === 'career' && parts[2] === 'com';
  } catch {
    return false;
  }
}

function baseJobsUrl(careersUrl) {
  try {
    const u = new URL(careersUrl);
    // Always use /jobs regardless of what path was given
    return `${u.protocol}//${u.hostname}/jobs`;
  } catch {
    return careersUrl;
  }
}

// Extract job cards from HTML using regex — no cheerio dependency.
// Each card: <a class="job-card" ... href="..."> ... <div class="title">...</div>
// ... <div class="details"><span>location</span> ...
function parseJobCards(html, companyName) {
  const jobs = [];

  // Match each job-card anchor block
  const cardPattern = /<a\s+class="job-card"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let cardMatch;
  while ((cardMatch = cardPattern.exec(html)) !== null) {
    const url = cardMatch[1].trim();
    const cardHtml = cardMatch[2];

    // Extract title from <div class="title">...</div>
    const titleMatch = cardHtml.match(/<div\s+class="title"[^>]*>([\s\S]*?)<\/div>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Extract first <span> in .details as location
    const detailsMatch = cardHtml.match(/<div\s+class="details"[^>]*>([\s\S]*?)<\/div>/);
    let location = '';
    if (detailsMatch) {
      const spanMatch = detailsMatch[1].match(/<span[^>]*>([\s\S]*?)<\/span>/);
      if (spanMatch) location = spanMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    if (title && url) {
      jobs.push({ title, url, location, company: companyName });
    }
  }

  return jobs;
}

// Returns true if the page HTML contains any job cards
function hasJobCards(html) {
  return html.includes('class="job-card"');
}

/** @type {Provider} */
export default {
  id: 'bizneo',

  detect(entry) {
    if (!entry.careers_url) return null;
    return isBizneoUrl(entry.careers_url) ? { url: entry.careers_url } : null;
  },

  async fetch(entry, ctx) {
    const base = baseJobsUrl(entry.careers_url);
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
        break; // Subsequent pages may 404 — stop gracefully
      }

      if (!hasJobCards(html)) break;

      const pageJobs = parseJobCards(html, companyName);
      if (pageJobs.length === 0) break;

      let newOnThisPage = 0;
      for (const job of pageJobs) {
        if (!seenUrls.has(job.url)) {
          seenUrls.add(job.url);
          allJobs.push(job);
          newOnThisPage++;
        }
      }

      // If all jobs on this page were already seen, pagination has looped back
      if (newOnThisPage === 0) break;
    }

    return allJobs;
  },
};
