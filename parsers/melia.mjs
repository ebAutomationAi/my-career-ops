#!/usr/bin/env node
// parsers/melia.mjs — SuccessFactors CSB scraper para Meliá Hotels

const BASE = 'https://careers.melia.com';
const CAT_ID = '8861001';
const COMPANY = 'Meliá Hotels';
const PAGE_DELAY_MS = 1000;
const MAX_PAGES = 5;

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'es-ES,es;q=0.9',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function extractId(href) {
  const m = href.match(/\/(\d+)\/?$/);
  return m ? m[1] : null;
}

function parseOffers(html, base) {
  const locSpans = [];
  const locRe = /<span[^>]+class="[^"]*jobLocation[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  let m;
  while ((m = locRe.exec(html)) !== null) {
    if (m[1].includes('<a')) continue;
    locSpans.push({ index: m.index, text: decodeEntities(stripTags(m[1])), used: false });
  }

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

    const anchorEnd = m.index + m[0].length;
    const locEntry = locSpans.find(s => !s.used && s.index > anchorEnd);
    if (locEntry) locEntry.used = true;
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const title = decodeEntities(stripTags(body)).replace(/\s+/g, ' ').trim();
    if (!title) continue;

    offers.push({
      title,
      url: new URL(href, base).href,
      company: COMPANY,
      location: locEntry ? locEntry.text : '',
    });
  }
  return offers;
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Fix encoding: SuccessFactors devuelve ISO-8859-1, no UTF-8
  const buffer = await res.arrayBuffer();
  return new TextDecoder('iso-8859-1').decode(buffer);
}

async function run() {
  const searchUrl = new URL(`${BASE}/search/`);
  searchUrl.searchParams.set('searchby', 'category');
  searchUrl.searchParams.set('catId', CAT_ID);
  searchUrl.searchParams.set('q', '');
  searchUrl.searchParams.set('location', 'Barcelona');

  process.stderr.write(`Parser: ${COMPANY}\n`);
  process.stderr.write(`URL búsqueda: ${searchUrl.href}\n`);

  const globalSeenIds = new Set();
  const allOffers = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0) await sleep(PAGE_DELAY_MS);

    const pageUrl = new URL(searchUrl.href);
    if (page > 0) pageUrl.searchParams.set('startrow', String(page * 25));

    process.stderr.write(`Fetching página ${page + 1}: ${pageUrl.href}\n`);

    let html;
    try {
      html = await fetchPage(pageUrl.href);
    } catch (err) {
      process.stderr.write(`Error: ${err.message} — parando\n`);
      break;
    }

    const pageOffers = parseOffers(html, BASE);
    let newCount = 0;

    for (const offer of pageOffers) {
      const id = extractId(offer.url);
      if (!id || globalSeenIds.has(id)) continue;
      globalSeenIds.add(id);
      allOffers.push(offer);
      newCount++;
    }

    process.stderr.write(
      `  → ${pageOffers.length} en página, ${newCount} nuevas (total: ${allOffers.length})\n`
    );
    if (newCount === 0) break;
  }

  process.stderr.write(`Total final: ${allOffers.length} ofertas\n`);
  process.stdout.write(JSON.stringify(allOffers) + '\n');
}

run().catch(err => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
