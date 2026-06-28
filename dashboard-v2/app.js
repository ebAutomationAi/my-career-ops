'use strict';

// TSV paths relative to project root (dashboard-v2/ is one level deep)
const TSV_PATHS = {
  recepcionista: '../profiles/recepcionista/data/applications.tsv',
  formacion:     '../profiles/formacion/data/applications.tsv',
};

// Funnel stages in pipeline order
const FUNNEL_STAGES  = ['Scan', 'Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Other'];
const FUNNEL_COLORS  = ['#8fa8d4', '#4e79c4', '#e8954e', '#5ba8c9', '#9a6bc9', '#45a063', '#b0b0b0'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mapToStage(status) {
  const s = (status || '').trim().toLowerCase();
  if (['evaluated', 'skip'].includes(s))                    return 'Evaluated';
  if (['applied', 'sent'].includes(s))                      return 'Applied';
  if (['responded', 'interview scheduled'].includes(s))     return 'Responded';
  if (['interview', 'technical test'].includes(s))          return 'Interview';
  if (['offer', 'accepted'].includes(s))                    return 'Offer';
  return 'Other';
}

function parseScore(raw) {
  const m = String(raw || '').match(/(\d+\.?\d*)\/5/);
  return m ? parseFloat(m[1]) : null;
}

// ── TSV Parser ────────────────────────────────────────────────────────────────
// Header: num\tdate\tcompany\trole\tscore\tstatus\tpdf\treport\tnotes\tchannel\tsource\turl\tcv\tcover

function parseTsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const entries = [];
  for (let i = 1; i < lines.length; i++) {          // skip header row
    const line = lines[i];
    if (!line.trim()) continue;
    const c = line.split('\t');
    entries.push({
      num:     c[0]  || '',
      date:    c[1]  || '',
      company: c[2]  || '',
      role:    c[3]  || '',
      score:   c[4]  || '',
      status:  c[5]  || '',
      pdf:     c[6]  || '',
      report:  c[7]  || '',
      notes:   c[8]  || '',
      channel: c[9]  || '',
      source:  c[10] || '',
      url:     c[11] || '',
      cv:      c[12] || '',
      cover:   c[13] || '',
    });
  }
  return entries;
}

// ── Metric 1: Conversion Funnel ───────────────────────────────────────────────

function renderFunnel(entries) {
  const counts = {};
  FUNNEL_STAGES.forEach(s => { counts[s] = 0; });
  counts['Scan'] = entries.length;
  for (const e of entries) counts[mapToStage(e.status)]++;

  const max    = Math.max(...Object.values(counts), 1);
  const barH   = 24;
  const gap    = 10;
  const lblW   = 92;    // label column width
  const barMax = 330;   // maximum bar pixel width (in viewBox units)
  const svgW   = lblW + barMax + 56;
  const svgH   = FUNNEL_STAGES.length * (barH + gap) + gap;

  let rows = '';
  FUNNEL_STAGES.forEach((stage, i) => {
    const count = counts[stage];
    const bw    = count > 0 ? Math.max(Math.round((count / max) * barMax), 3) : 0;
    const y     = gap + i * (barH + gap);
    const mid   = y + barH / 2;
    const color = FUNNEL_COLORS[i];

    rows += `<text x="${lblW - 6}" y="${mid}" text-anchor="end" dominant-baseline="middle" class="bl">${esc(stage)}</text>`;
    if (bw > 0) {
      rows += `<rect x="${lblW}" y="${y}" width="${bw}" height="${barH}" fill="${color}" rx="3"/>`;
    }
    rows += `<text x="${lblW + bw + 6}" y="${mid}" dominant-baseline="middle" class="bc">${count}</text>`;
  });

  return `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" class="bar-chart">${rows}</svg>`;
}

// ── Metric 2: Response Rate by Channel ───────────────────────────────────────

function renderChannelRate(entries) {
  const data = {};

  for (const e of entries) {
    const ch = (e.channel || '').trim();
    if (!ch || ch.toLowerCase() === 'unknown') continue;

    const s      = (e.status || '').trim().toLowerCase();
    const isSent = !['evaluated', 'skip', ''].includes(s);
    if (!isSent) continue;

    const replied = ['responded', 'interview scheduled', 'interview', 'technical test', 'offer', 'accepted', 'rejected'].includes(s);
    if (!data[ch]) data[ch] = { sent: 0, replied: 0 };
    data[ch].sent++;
    if (replied) data[ch].replied++;
  }

  const rows = Object.entries(data).sort((a, b) => b[1].sent - a[1].sent);
  if (!rows.length) return '<p class="empty">No data with channel information yet.</p>';

  const trs = rows.map(([ch, d]) => {
    const pct = ((d.replied / d.sent) * 100).toFixed(0);
    return `<tr><td>${esc(ch)}</td><td class="r">${d.sent}</td><td class="r">${d.replied}</td><td class="r">${pct}%</td></tr>`;
  }).join('');

  return `<table class="dt">
<thead><tr><th>Channel</th><th>Sent</th><th>Replied</th><th>%</th></tr></thead>
<tbody>${trs}</tbody>
</table>`;
}

// ── Metric 3: Unanswered Applications Age ────────────────────────────────────

function renderAgeTable(entries) {
  const now = Date.now();

  const pending = entries
    .filter(e => ['applied', 'sent'].includes((e.status || '').trim().toLowerCase()))
    .map(e => {
      const ms   = e.date ? Date.parse(e.date) : NaN;
      const days = isNaN(ms) ? null : Math.floor((now - ms) / 86_400_000);
      return { ...e, days };
    })
    .sort((a, b) => (b.days ?? -1) - (a.days ?? -1));

  if (!pending.length) return '<p class="empty">No pending unanswered applications.</p>';

  const trs = pending.map(e => {
    const cls  = e.days === null ? '' : e.days > 14 ? 'red' : e.days >= 7 ? 'ylw' : 'grn';
    const dStr = e.days === null ? '—' : `${e.days}d`;
    return `<tr>
<td class="r">${esc(e.num)}</td>
<td>${esc(e.company)}</td>
<td class="trole">${esc(e.role)}</td>
<td>${esc(e.channel || '—')}</td>
<td class="r ${cls}">${dStr}</td>
<td>${esc(e.status)}</td>
</tr>`;
  }).join('');

  return `<table class="dt">
<thead><tr><th>#</th><th>Company</th><th>Role</th><th>Channel</th><th>Days</th><th>Status</th></tr></thead>
<tbody>${trs}</tbody>
</table>`;
}

// ── Metric 4: Avg Score by Channel + Source ───────────────────────────────────

function renderScoreTable(entries) {
  const groups = {};

  for (const e of entries) {
    const ch  = (e.channel || '').trim();
    const src = (e.source  || '').trim();
    if (!ch || !src) continue;
    const score = parseScore(e.score);
    if (score === null) continue;
    const key = `${ch}\x00${src}`;
    if (!groups[key]) groups[key] = { ch, src, scores: [] };
    groups[key].scores.push(score);
  }

  const rows = Object.values(groups)
    .map(g => {
      const avg = g.scores.reduce((a, b) => a + b, 0) / g.scores.length;
      return { ch: g.ch, src: g.src, n: g.scores.length, avg, min: Math.min(...g.scores), max: Math.max(...g.scores) };
    })
    .sort((a, b) => b.avg - a.avg);

  if (!rows.length) return '<p class="empty">No entries with channel, source and score yet.</p>';

  const trs = rows.map(r =>
    `<tr><td>${esc(r.ch)}</td><td>${esc(r.src)}</td><td class="r">${r.n}</td><td class="r">${r.avg.toFixed(2)}</td><td class="r">${r.min.toFixed(1)}</td><td class="r">${r.max.toFixed(1)}</td></tr>`
  ).join('');

  return `<table class="dt">
<thead><tr><th>Channel</th><th>Source</th><th>n</th><th>Avg/5</th><th>Min</th><th>Max</th></tr></thead>
<tbody>${trs}</tbody>
</table>`;
}

// ── Core ──────────────────────────────────────────────────────────────────────

function setStatus(msg, isErr) {
  const el = document.getElementById('sbar');
  el.textContent = msg;
  el.className   = isErr ? 'err' : 'ok';
}

function render(entries) {
  document.getElementById('c1').innerHTML = renderFunnel(entries);
  document.getElementById('c2').innerHTML = renderChannelRate(entries);
  document.getElementById('c3').innerHTML = renderAgeTable(entries);
  document.getElementById('c4').innerHTML = renderScoreTable(entries);
}

async function load() {
  const profile = document.getElementById('psel').value;
  const url     = TSV_PATHS[profile];
  setStatus('Loading…');
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} — ${resp.statusText}`);
    const entries = parseTsv(await resp.text());
    setStatus(`✓ ${entries.length} entries · ${profile} · ${new Date().toLocaleTimeString()}`);
    render(entries);
  } catch (err) {
    setStatus(`✗ ${err.message}  (serve the project via a local HTTP server, e.g. npx serve .)`, true);
    ['c1', 'c2', 'c3', 'c4'].forEach(id => {
      document.getElementById(id).innerHTML = '<p class="empty">No data loaded.</p>';
    });
  }
}

document.getElementById('psel').addEventListener('change', load);
document.getElementById('rbtn').addEventListener('click', load);
load();
