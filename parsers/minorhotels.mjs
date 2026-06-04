#!/usr/bin/env node
// parsers/minorhotels.mjs — SuccessFactors CSB scraper for Minor Hotels (NH / NH Collection / nhow)
// Stdout: JSON array [{title, url, company, location}]. Debug logs go to stderr.

const BASE = 'https://euamcareers.minorhotels.com';
const PAGE_SIZE = 25;
const MAX_PAGES = 10;
const MAX_OFFERS = 500;
const PAGE_DELAY_MS = 1000;

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'es-ES,es;q=0.9',
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractId(href) {
  const m = href.match(/\/(\d+)\/?$/);
  return m ? m[1] : null;
}

function parseOffers(html) {
  // Collect all <span class="jobLocation"> with their positions.
  // The nav header span wraps an <a> — skip those.
  const locSpans = [];
  const locRe = /<span[^>]+class="[^"]*jobLocation[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  let m;
  while ((m = locRe.exec(html)) !== null) {
    if (m[1].includes('<a')) continue;
    locSpans.push({
      index: m.index,
      text: decodeEntities(stripTags(m[1])),
      used: false,
    });
  }

  // Match ALL <a> with jobTitle-link regardless of attribute order.
  // Each job appears twice (desktop href-first, mobile class-first) with the same ID.
  const anchorRe = /<a\b([^>]*\bjobTitle-link\b[^>]*)>([\s\S]*?)<\/a>/gi;
  const seenIds = new Set();
  const offers = [];

  while ((m = anchorRe.exec(html)) !== null) {
    const attrs = m[1];
    const body = m[2];
    const hrefM = attrs.match(/href="([^"]+)"/);
    if (!hrefM) continue;
    const href = hrefM[1];
    const id = extractId(href);
    if (!id) continue;

    // Always consume the next location span so the cursor stays aligned,
    // even for duplicate anchors that will be skipped below.
    const anchorEnd = m.index + m[0].length;
    const locEntry = locSpans.find(s => !s.used && s.index > anchorEnd);
    if (locEntry) locEntry.used = true;

    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const title = decodeEntities(stripTags(body)).replace(/\s+/g, ' ').trim();
    if (!title) continue;

    const url = new URL(href, BASE).href;
    offers.push({ title, url, company: 'Minor Hotels', location: locEntry ? locEntry.text : '' });
  }

  return offers;
}

async function run() {
  const careersUrl = process.argv[2];
  if (!careersUrl) {
    process.stderr.write('Usage: node parsers/minorhotels.mjs <careers_url>\n');
    process.exit(1);
  }

  const globalSeenIds = new Set();
  const allOffers = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0) await sleep(PAGE_DELAY_MS);

    const pageUrl = new URL(careersUrl);
    pageUrl.searchParams.set('q', '');
    pageUrl.searchParams.set('startrow', String(page * PAGE_SIZE));

    process.stderr.write(`Fetching page ${page + 1}: ${pageUrl.href}\n`);

    const res = await fetch(pageUrl.href, { headers: HEADERS });
    if (!res.ok) {
      process.stderr.write(`HTTP ${res.status} — stopping\n`);
      break;
    }

    const html = await res.text();
    const pageOffers = parseOffers(html);

    let newCount = 0;
    for (const offer of pageOffers) {
      const id = extractId(offer.url);
      if (!id || globalSeenIds.has(id)) continue;
      globalSeenIds.add(id);
      allOffers.push(offer);
      newCount++;
    }

    process.stderr.write(`  → ${pageOffers.length} on page, ${newCount} new (total: ${allOffers.length})\n`);

    if (newCount === 0) break;
    if (allOffers.length >= MAX_OFFERS) {
      process.stderr.write(`Safety cap (${MAX_OFFERS}) reached — stopping\n`);
      break;
    }
  }

  process.stdout.write(JSON.stringify(allOffers) + '\n');
}

run().catch(err => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
