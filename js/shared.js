/* =====================================================================
   HMB 360 — Shared Report Theme, Formatters, Registry & UI Primitives
   Used across Dashboard, EOP, NTB, and all upcoming reports.
   ===================================================================== */

/* ---------------- Report Registry (single source of truth for Dashboard & Drawer) ---------------- */
const REPORT_REGISTRY = [
  {
    id: 'eop',
    route: '/eop-report',
    drawerLabel: 'EOP Report',
    title: 'EOP Deposit Performance',
    sub: 'Deposits, targets, averages & child reports',
    icon: ['account_balance_wallet', 'o'],
    accent: '#047857',
  },
  {
    id: 'ntb',
    route: '/ntb-report',
    drawerLabel: 'NTB Report',
    title: 'NTB Performance',
    sub: 'Accounts opened, funded & role breakdown',
    icon: ['group_add', 'o'],
    accent: '#3867D6',
  },
];

/* ---------------- Report Theme (EopTheme / Shared) ---------------- */
const ET = {
  background: '#F4F6F3', card: '#FFFFFF', ink: '#0E1512', muted: '#62716A', text2: '#3E4C46', primary: '#047857',
  border: '#E2E8E4', pillBorder: '#DFE8E2', pillText: '#31443A', tile: '#F1F5F2', track: '#D0DAD4', grid: '#E9EEEB',
  negative: '#C2410C', positive: '#047857', eyeBorder: '#E2E8F0', dashed: '#EAECF0', sortLabel: '#98A2B3',
};
const css = (fam) => (s, w, c, ls, lh) => `font-family:var(${fam});font-size:${s}px;font-weight:${w};color:${c};${ls != null ? `letter-spacing:${ls}px;` : ''}line-height:${lh != null ? lh + 'px' : 'normal'};`;
const TB = css('--fBody'), TD = css('--fDisp'), TM = css('--fMono');

const EOP_STREAMS = [
  { id: '', label: 'Both' },
  { id: 'Conventional Banking', label: 'Conventional' },
  { id: 'Islamic Banking', label: 'Islamic' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function parseIso(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function toIso(d) { return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''; }
function shortMonthLbl(d) { return d ? `${MONTHS[d.getMonth()]}-${String(d.getFullYear()).slice(2)}` : ''; }
function dayShortLbl(d) { return d ? `${d.getDate()}-${MONTHS[d.getMonth()]}-${String(d.getFullYear()).slice(2)}` : '—'; }

/* Whole numbers everywhere; non-zero |v| < 0.5 keeps 2 decimals */
const F = {
  date(d, full = false) {
    if (!d) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const y = full ? String(d.getFullYear()) : String(d.getFullYear() % 100).padStart(2, '0');
    return `${dd}-${MONTHS[d.getMonth()]}-${y}`;
  },
  group(digits) { let b = ''; for (let i = 0; i < digits.length; i++) { if (i > 0 && (digits.length - i) % 3 === 0) b += ','; b += digits[i]; } return b; },
  number(v, dec) {
    if (v == null || typeof v !== 'number' || isNaN(v)) return '–';
    let dp = dec === undefined ? 0 : dec;
    if (dp === 0 && v !== 0 && Math.abs(v) < 0.5) dp = 2;
    const fixed = Math.abs(v).toFixed(dp);
    const p = fixed.split('.');
    const neg = v < 0 && parseFloat(fixed) !== 0;
    const g = F.group(p[0]);
    return dp === 0 ? (neg ? '−' : '') + g : `${neg ? '−' : ''}${g}.${p[1]}`;
  },
  signed(v, dec) {
    if (v == null || typeof v !== 'number' || isNaN(v)) return '–';
    let dp = dec === undefined ? 0 : dec;
    if (dp === 0 && v !== 0 && Math.abs(v) < 0.5) dp = 2;
    const fixed = Math.abs(v).toFixed(dp);
    const p = fixed.split('.');
    const z = parseFloat(fixed) === 0;
    const g = F.group(p[0]);
    const body = dp === 0 ? g : `${g}.${p[1]}`;
    if (z) return body;
    return (v < 0 ? '−' : '+') + body;
  },
  count(v) {
    if (v == null || typeof v !== 'number' || isNaN(v)) return '–';
    const neg = v < 0 && Math.round(Math.abs(v)) !== 0;
    return (neg ? '−' : '') + F.group(String(Math.round(Math.abs(v))));
  },
  percent(v, dp = 1) { return v == null || typeof v !== 'number' || isNaN(v) ? '–' : v.toFixed(dp) + '%'; },
  axis(v) {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e6) return s + (a / 1e6).toFixed(1) + 'M';
    if (a >= 1000) return s + (a / 1000).toFixed(1) + 'K';
    if (a === 0) return '0';
    return s + a.toFixed(a >= 100 ? 0 : 1);
  },
  color(hex, fb) { const c = String(hex || '').replace('#', ''); return /^[0-9a-fA-F]{6}$/.test(c) ? '#' + c : fb; },
  delta(v) { return v < 0 ? ET.negative : ET.positive; },
};

/* ---------------- Shared Report Widgets ---------------- */
function bigNumber(v, size, { weight = 700, ls = null, ic = ET.ink, dc = ET.muted } = {}) {
  const s = F.number(v);
  const parts = s.split('.');
  return `<span style="white-space:nowrap"><span style="${TD(size, weight, ic, ls)}">${parts[0]}</span>${parts[1] ? `<span style="${TD(size, weight, dc, ls)}">.${parts[1]}</span>` : ''}</span>`;
}
function signedValue(v, { size = 12.5, weight = 700, icon = true, ls = null, end = false, gp = '' } = {}) {
  const c = F.delta(v);
  const text = `<span class="el1" style="${TM(size, weight, c, ls)}">${F.signed(v)}</span>${gp}`;
  if (!icon) return `<span style="display:inline-flex;align-items:baseline;min-width:0;max-width:100%;${end ? 'justify-content:flex-end;' : ''}">${text}</span>`;
  return `<span style="display:inline-flex;align-items:center;min-width:0;max-width:100%;${end ? 'justify-content:flex-end;' : ''}"><span style="${TM(9, 700, c)}flex:none">${v < 0 ? '▼' : '▲'}</span><span style="width:5px;flex:none"></span>${text}</span>`;
}
function infoBtn(title, tip) {
  if (!tip) return '';
  return `<button type="button" class="infobtn" title="Info" data-act="tip" data-title="${esc(title)}" data-tip="${esc(tip)}">${I('info_outline', 'f', 16, 'currentColor')}</button>`;
}
function contextPill(text) {
  return `<div style="padding:9px 12px;background:#fff;border-radius:14px;border:1px solid ${ET.pillBorder};box-shadow:0 2px 8px rgba(20,45,32,.039);display:flex;align-items:center;min-width:0">
    <div style="width:8px;height:8px;border-radius:50%;background:${ET.primary};flex:none"></div><div style="width:10px;flex:none"></div>
    <div class="el2 grow" style="${TB(11.5, 700, ET.pillText, null, 15)}">${esc(text)}</div></div>`;
}
function ring(pct) {
  const frac = Math.max(0, Math.min(1, pct / 100)); const r = 44, circ = 2 * Math.PI * r;
  return `<div style="width:96px;height:96px;position:relative;flex:none">
    <svg width="96" height="96" style="position:absolute;inset:0"><circle cx="48" cy="48" r="${r}" fill="none" stroke="#E3EAE6" stroke-width="8"/>
    ${frac > 0 ? `<circle cx="48" cy="48" r="${r}" fill="none" stroke="${ET.primary}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${frac * circ} ${circ}" transform="rotate(-90 48 48)"/>` : ''}</svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="${TD(18, 700, ET.ink)}">${F.percent(pct)}</span><span style="height:2px"></span><span style="${TB(9, 600, ET.text2)}">of target</span></div></div>`;
}
function tabRow(labels, selected, act) {
  return `<div class="tabrow hscroll">${labels.map((l, i) => `<div class="tb" data-act="${act}" data-i="${i}" style="${TB(13, i === selected ? 700 : 500, i === selected ? ET.primary : ET.muted)}">${esc(l)}</div>`).join('')}</div>`;
}
function chartLegend(series, showTarget) {
  return `<div style="display:flex;flex-wrap:wrap;column-gap:16px;row-gap:6px">${series.map(s => `<div style="display:flex;align-items:center;min-width:0"><div style="width:10px;height:10px;border-radius:3px;background:${s.color};flex:none"></div><span style="width:7px"></span><span class="el1" style="${TB(11, 600, ET.text2)}">${esc(s.name)}</span></div>`).join('')}
    ${showTarget ? `<div style="display:flex;align-items:center"><div style="display:flex;gap:3px"><div style="width:5px;height:2px;background:${ET.sortLabel}"></div><div style="width:5px;height:2px;background:${ET.sortLabel}"></div></div><span style="width:7px"></span><span style="${TB(11, 600, ET.muted)}">Target</span></div>` : ''}</div>`;
}
function trendSvg(width, { series, labels, target, fillArea }) {
  const count = labels.length;
  const showPtLabels = series.length === 1 && count <= 4;
  const twoLineX = count > 2 && labels.some(l => String(l || '').length > 10);
  const H = 220, TOP = showPtLabels ? 24 : 16, BOTTOM = twoLineX ? 174 : 182, LEFT = 56, TICKS = 6;
  const right = width - 10;
  const padX = count <= 1 ? 0 : count === 2 ? 34 : count <= 4 ? 22 : 18;
  const plotL = LEFT + padX, plotR = right - padX, plotW = Math.max(10, plotR - plotL);
  const all = []; series.forEach(s => s.values.forEach(v => { if (typeof v === 'number' && !isNaN(v)) all.push(v); }));
  if (target != null && target > 0) all.push(target);
  if (!all.length) return `<svg width="${width}" height="${H}"></svg>`;
  const mn = Math.min(...all), mx = Math.max(...all);
  let range = mx - mn; if (range === 0) range = Math.abs(mx) === 0 ? 1 : Math.abs(mx) * 0.1;
  const lo = mn >= 0 ? Math.max(0, mn - range * 0.12) : mn - range * 0.12, hi = mx + range * 0.12;
  const yOf = v => BOTTOM - (v - lo) / (hi - lo) * (BOTTOM - TOP);
  const xOf = i => (count <= 1 ? (plotL + plotR) / 2 : plotL + plotW * i / (count - 1));
  const tickFmt = v => ((hi - lo) >= 5 ? F.number(Math.round(v), 0) : F.number(v, 1));
  let o = '';
  for (let i = 0; i < TICKS; i++) {
    const f = i / (TICKS - 1), y = TOP + (BOTTOM - TOP) * f, v = hi - (hi - lo) * f;
    o += `<line x1="${LEFT}" y1="${y}" x2="${right}" y2="${y}" stroke="${ET.grid}" stroke-width="1"/>`;
    o += `<text x="${LEFT - 7}" y="${y}" text-anchor="end" dominant-baseline="central" style="font-family:var(--fMono);font-size:9.5px;font-weight:400" fill="${ET.muted}">${tickFmt(v)}</text>`;
  }
  if (target != null && target > 0) {
    const dc = series.length === 1 ? series[0].color : ET.primary, y = yOf(target);
    o += `<line x1="${LEFT}" y1="${y}" x2="${right}" y2="${y}" stroke="${dc}" stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  }
  series.forEach(s => {
    const runs = [];
    let curRun = [];
    for (let i = 0; i < count; i++) {
      const val = s.values[i];
      if (typeof val === 'number' && !isNaN(val)) {
        curRun.push({ x: xOf(i), y: yOf(val), val, lbl: labels[i] });
      } else if (curRun.length) {
        runs.push(curRun); curRun = [];
      }
    }
    if (curRun.length) runs.push(curRun);
    runs.forEach(run => {
      if (run.length >= 2) {
        const d = run.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
        if (fillArea) o += `<path d="${d} L${run[run.length - 1].x.toFixed(2)},${BOTTOM} L${run[0].x.toFixed(2)},${BOTTOM} Z" fill="${s.color}" fill-opacity="0.08"/>`;
        o += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      run.forEach((p, idx) => {
        o += `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4" fill="#fff" stroke="${s.color}" stroke-width="2.5"><title>${esc(s.name)} · ${esc(p.lbl)}: ${F.number(p.val)}</title></circle>`;
        if (showPtLabels) {
          const prev = idx > 0 ? run[idx - 1] : null;
          const next = idx < run.length - 1 ? run[idx + 1] : null;
          const risesRight = next && p.y - next.y > 14;
          const risesLeft = prev && p.y - prev.y > 14;
          const placeBelow = (risesRight || risesLeft) && p.y < BOTTOM - 20;
          const ly = placeBelow ? p.y + 15 : p.y - 10;
          o += `<text x="${p.x.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round" style="font-family:var(--fMono);font-size:9px;font-weight:700" fill="${ET.ink}">${F.number(p.val)}</text>`;
        }
      });
    });
  });
  for (let i = 0; i < count; i++) {
    const raw = String(labels[i] || '');
    const x = xOf(i);
    if (twoLineX && /^((?:SP|FTM|YTD) Avg)\s+(.+)$/.test(raw)) {
      const m = raw.match(/^((?:SP|FTM|YTD) Avg)\s+(.+)$/);
      o += `<text x="${x.toFixed(2)}" y="${BOTTOM + 16}" text-anchor="middle" style="font-family:var(--fMono);font-size:9px;font-weight:500;letter-spacing:-0.2px" fill="${ET.muted}"><tspan x="${x.toFixed(2)}" dy="0">${esc(m[1])}</tspan><tspan x="${x.toFixed(2)}" dy="12">${esc(m[2])}</tspan></text>`;
    } else {
      const fs = count >= 6 ? 8.5 : 9.5;
      o += `<text x="${x.toFixed(2)}" y="${BOTTOM + 22}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--fMono);font-size:${fs}px;font-weight:500;letter-spacing:-0.3px" fill="${ET.muted}">${esc(raw)}</text>`;
    }
  }
  return `<svg width="${width}" height="${H}" style="display:block;overflow:visible">${o}</svg>`;
}
function accordionCard(a, expanded) {
  const fmt = (v, c) => (c ? F.count(v) : F.number(v));
  const leadTone = (!a.leadIsCount || a.negTone) && a.leadValue < 0 ? ET.negative : ET.ink;
  const rows = a.rows.length
    ? a.rows.map((r, i) => {
        const v = r.text != null ? r.text : (r.isCount ? F.count(r.value) : r.isPercent ? F.percent(r.value) : F.number(r.value));
        const tone = (!r.isCount || r.negTone) && r.value < 0 ? ET.negative : ET.ink;
        return `<div style="padding:10px 0;${i < a.rows.length - 1 ? `border-bottom:1px solid ${ET.grid};` : ''}display:flex;align-items:center;gap:6px">
          <div style="flex:1;min-width:0"><div class="el2" style="${TB(13, 700, ET.text2)}">${esc(r.title)}</div>${r.subtitle ? `<div class="el2" style="padding-top:2px;${TB(10, 500, ET.muted)}">${esc(r.subtitle)}</div>` : ''}</div>
          ${r.tip ? infoBtn(r.title, r.tip) : ''}
          <span style="${TM(13, 700, tone)}white-space:nowrap">${v}</span></div>`;
      }).join('')
    : `<div style="padding:14px 0;text-align:center;${TB(11, 600, ET.muted)}">Nothing here for this selection</div>`;
  return `<div class="esurf tap acc ${expanded ? 'open' : ''}" data-act="acc" data-id="${esc(a.id)}" style="border-radius:20px">
    <div style="padding:15px 16px 15px 18px;display:flex;align-items:center">
      <div style="flex:1;min-width:0"><div class="el1" style="${TD(15, 700, ET.ink, -0.2)}">${esc(a.title)}</div><div style="height:3px"></div><div style="${TB(10, 500, ET.muted, null, 14)}">${esc(a.subtitle)}</div></div>
      <span style="width:10px"></span>
      <div style="display:flex;flex-direction:column;align-items:flex-end"><span style="${TM(19, 700, leadTone)}white-space:nowrap">${a.leadText != null ? a.leadText : fmt(a.leadValue, a.leadIsCount)}</span><span style="height:2px"></span><span style="${TB(9, 800, ET.muted, 0.7)}white-space:nowrap">${esc(a.leadCaption.toUpperCase())}</span></div>
      <span style="width:8px"></span><span class="acc-arrow">${I(expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down', 'r', 20, ET.muted)}</span>
    </div>
    <div class="acc-body"><div><div style="padding:0 18px 16px">${rows}${a.footer ? `<div style="height:10px"></div><div style="${TB(10, 500, ET.muted, null, 14)}">${esc(a.footer)}</div>` : ''}</div></div></div></div>`;
}
function sectionHeading(title, trailing) {
  return `<div style="padding:0 2px;display:flex;align-items:flex-start"><div class="grow" style="${TB(10, 800, ET.muted, 0.5, 14)}">${esc(title)}</div><span style="width:12px"></span><span style="${TB(10, 800, ET.muted, null, 14)}white-space:nowrap">${esc(trailing)}</span></div>`;
}
function sortBar(field, desc) {
  return `<div class="esurf" style="border-radius:14px;padding:8px 10px;display:flex;align-items:center">
    <span style="${TB(10, 800, ET.sortLabel, 0.6)}white-space:nowrap">SORT BY</span><span style="width:10px"></span>
    <div class="grow" data-act="sortfield" style="height:40px;padding:0 14px;background:${ET.tile};border-radius:12px;border:1px solid ${ET.track};display:flex;align-items:center;cursor:pointer">
      <span class="el1 grow" style="${TB(13.5, 600, ET.ink)}">${esc(field)}</span>${I('keyboard_arrow_down', 'r', 20, ET.ink)}</div>
    <span style="width:8px"></span>
    <div data-act="sortdir" style="height:40px;padding:0 12px;background:${ET.tile};border-radius:10px;display:flex;align-items:center;cursor:pointer;white-space:nowrap"><span style="${TB(12.5, 700, ET.primary)}">${desc ? 'High → Low' : 'Low → High'}</span></div></div>`;
}
function messageView(message, actionLabel, act) {
  return `<div style="padding:36px 24px;display:flex;align-items:center;justify-content:center"><div style="display:flex;flex-direction:column;align-items:center">
    <div style="${TB(13, 600, ET.muted)}text-align:center">${esc(message)}</div>
    ${actionLabel ? `<div style="height:14px"></div><button class="text-btn" data-act="${act}" style="${TB(13, 800, ET.primary)}">${esc(actionLabel)}</button>` : ''}</div></div>`;
}
function eopDetailSheet(title, items) {
  const rows = items.map((it, i) => {
    const txt = it.html != null ? it.html : (it.type === 'count' ? (it.signed ? F.signed(it.value, 0) : F.count(it.value)) : it.type === 'percent' ? F.percent(it.value) : (it.signed ? F.signed(it.value) : F.number(it.value)) + (it.gp || ''));
    const tone = it.signed && typeof it.value === 'number' ? F.delta(it.value) : ET.text2;
    return `${i ? `<div style="height:1px;background:${ET.grid}"></div>` : ''}<div style="padding:13px 0;display:flex;align-items:baseline;gap:10px">
      <span class="grow" style="${TB(13.5, 500, '#64748B')}">${esc(it.name)}</span>
      <span style="${TM(13.5, 700, tone)}white-space:nowrap">${txt}</span></div>`;
  }).join('');
  const content = h(`<div style="display:flex;flex-direction:column;min-height:0;max-height:inherit">
    <div style="padding:18px 18px 14px;display:flex;align-items:center;flex:none"><span class="el2 grow" style="${TB(15.5, 700, ET.ink)}">${esc(title)}</span><span style="width:12px"></span>
      <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none">${I('close', 'r', 16, ET.ink)}</div></div>
    <div style="height:1px;background:${ET.grid};flex:none"></div>
    <div class="scroll" style="flex:1 1 auto;min-height:0;padding:0 18px 18px">${rows}</div></div>`);
  const sheet = openSheet(content);
  content.querySelector('[data-act=close]').onclick = () => sheet.close();
}

/* ---------------- showDatePicker (Material 3) ---------------- */
function datePicker({ initial, first, last }) {
  const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let sel = new Date(initial.getFullYear(), initial.getMonth(), initial.getDate());
  let view = new Date(sel.getFullYear(), sel.getMonth(), 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const el = h(`<div class="dp"></div>`);
  const render = () => {
    const y = view.getFullYear(), m = view.getMonth();
    const startDow = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    const canPrev = new Date(y, m, 0) >= new Date(first.getFullYear(), first.getMonth(), 1);
    const canNext = new Date(y, m + 1, 1) <= last;
    let cells = '';
    for (let i = 0; i < startDow; i++) cells += `<span></span>`;
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d), dis = dt < first || dt > last;
      cells += `<button class="d ${same(dt, sel) ? 'sel' : ''} ${same(dt, today) && !same(dt, sel) ? 'today' : ''} ${dis ? 'dis' : ''}" ${dis ? 'disabled' : ''} data-d="${d}">${d}</button>`;
    }
    el.innerHTML = `
      <div style="padding:16px 12px 12px 24px">
        <div style="font:500 14px var(--fApp);color:var(--onSurfaceVariant);letter-spacing:.1px">Select date</div>
        <div style="display:flex;align-items:center;margin-top:36px"><div style="flex:1;font:400 32px var(--fApp);color:var(--onSurface)">${DAYS[sel.getDay()]}, ${MONTHS[sel.getMonth()]} ${sel.getDate()}</div>${I('edit', 'o', 24, 'var(--onSurfaceVariant)', 'margin-right:12px')}</div>
      </div>
      <div style="height:1px;background:rgba(0,0,0,.12)"></div>
      <div style="display:flex;align-items:center;padding:4px 12px 4px 24px;height:52px">
        <div style="flex:1;font:500 14px var(--fApp);color:var(--onSurfaceVariant);display:flex;align-items:center;gap:4px">${MON_FULL[m]} ${y} ${I('arrow_drop_down', 'f', 20, 'var(--onSurfaceVariant)')}</div>
        <button class="icon-btn" data-nav="-1" style="color:var(--onSurfaceVariant);${canPrev ? '' : 'opacity:.38;pointer-events:none'}">${I('chevron_left', 'f', 24)}</button>
        <button class="icon-btn" data-nav="1" style="color:var(--onSurfaceVariant);${canNext ? '' : 'opacity:.38;pointer-events:none'}">${I('chevron_right', 'f', 24)}</button>
      </div>
      <div class="grid">${WD.map(w => `<span class="wd">${w}</span>`).join('')}${cells}</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 12px 12px"><button class="text-btn" data-a="cancel">Cancel</button><button class="text-btn" data-a="ok">OK</button></div>`;
  };
  render();
  const d = Overlay.open({ el });
  el.addEventListener('click', e => {
    const n = e.target.closest('[data-nav]'); if (n) { view = new Date(view.getFullYear(), view.getMonth() + (+n.dataset.nav), 1); render(); return; }
    const b = e.target.closest('[data-d]'); if (b && !b.disabled) { sel = new Date(view.getFullYear(), view.getMonth(), +b.dataset.d); render(); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'cancel') d.close(null);
    if (a.dataset.a === 'ok') d.close(sel);
  });
  return d.done.then(v => v || null);
}
