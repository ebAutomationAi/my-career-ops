#!/usr/bin/env node
// parsers/generic-careers.mjs — Generic career page scraper
// Stdout: JSON array [{title, url, company, location}]. Debug logs go to stderr.

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'es-ES,es;q=0.9',
};

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

function normalizeUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch (e) {
    return null;
  }
}

function extractOffersFromHtml(html, base, companyName) {
  const offers = [];
  const anchorRe = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;
  let m;
  const seen = new Set();

  while ((m = anchorRe.exec(html)) !== null) {
    const attrs = m[1];
    const body = m[2];
    const hrefM = attrs.match(/href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    if (!hrefM) continue;
    const href = hrefM[1] || hrefM[2] || hrefM[3];
    const url = normalizeUrl(href, base);
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    const title = decodeEntities(stripTags(body)).trim();
    // Heuristics: accept if anchor text looks like a job title OR url contains common job path
    const lower = title.toLowerCase();
    const jobPathMatch = url.match(/\b(job|vacancy|vacantes|position|oferta|careers?|jobs?)\b/i);
    const titleLooksLikeJob = /recepcion|recepcionista|night auditor|auditor nocturno|reception|receptionist|front desk|receptionist|auditor/i.test(lower);

    if (title && (titleLooksLikeJob || jobPathMatch)) {
      offers.push({ title, url, company: companyName || '', location: '' });
    }
  }

  return offers;
}

async function run() {
  const careersUrl = process.argv[2];
  if (!careersUrl) {
    process.stderr.write('Usage: node parsers/generic-careers.mjs <careers_url> [company]\n');
    process.exit(1);
  }

  const companyName = process.argv[3] || '';
  process.stderr.write(`Fetching ${careersUrl}\n`);
  try {
    const res = await fetch(careersUrl, { headers: HEADERS });
    if (!res.ok) {
      process.stderr.write(`HTTP ${res.status} fetching ${careersUrl}\n`);
      process.exit(1);
    }
    const html = await res.text();

    const offers = extractOffersFromHtml(html, careersUrl, companyName);
    process.stderr.write(`Found ${offers.length} candidate anchors\n`);
    process.stdout.write(JSON.stringify(offers) + '\n');
  } catch (err) {
    process.stderr.write(`Fatal: ${err.message}\n`);
    process.exit(1);
  }
}

run();
