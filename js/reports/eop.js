/* =====================================================================
   EOP Report — 13-Oct-2026 data & implementation-scope mobile UI
   ===================================================================== */

/* ---------------- EOP constants (verbatim from 13-Oct workbook) ---------------- */
const EOP_BOOKS = [
  { id: 'Current Account', short: 'CA', label: 'Total CA', full: 'Current Account', sub: 'Current Account', accent: '#059669', icon: ['payments', 'o'] },
  { id: 'SAVING ACCOUNT', short: 'SA', label: 'Total SA', full: 'Saving Account', sub: 'Saving Account', accent: '#3867D6', icon: ['bar_chart', 'r'] },
  { id: 'HCS', short: 'HCS', label: 'Total HCS', full: 'Home Cash Saver', sub: 'Home Cash Saver', accent: '#C98A04', icon: ['apartment', 'r'] },
  { id: 'TERM DEPOSITS', short: 'TD', label: 'Total TD', full: 'Term Deposits', sub: 'Term Deposits', accent: '#7C4DDB', icon: ['event_note', 'o'] },
  { id: 'TOTAL CASA', short: 'CASA', label: 'Total CASA', full: 'Current + Saving', sub: 'Current + Saving', accent: '#0D9488', icon: ['bar_chart', 'r'] },
];
const EOP_BOOK_MAP = Object.fromEntries([
  ...EOP_BOOKS.map(b => [b.id, b]),
  ['TOTAL DEPOSITS', { id: 'TOTAL DEPOSITS', short: 'TOTAL', label: 'TOTAL DEPOSITS', full: 'Total Deposits', sub: 'CA + SA + HCS + TD', accent: '#047857', icon: ['account_balance_wallet', 'o'] }],
]);

const EOP_PORTFOLIOS = [
  { id: 'All', label: 'All', both: 1 },
  { id: 'Retail', label: 'Retail' },
  { id: 'SME', label: 'SME' },
  { id: 'Diplo', label: 'Diplomatic Enclave' },
  { id: 'DS', label: 'Direct Sales', both: 1 },
];
const EOP_BOOK_HEADS = { Retail: 'Faheem Elahi', SME: 'Aamir Hameed Piracha' };

/* 0.1 Hierarchies never mix: Retail uses AH -> CM -> SC, SME uses HM -> SC */
const EOP_LEVELS = {
  Retail: [
    { k: 'rbh', label: 'RBH', field: 'rbh', scope: 'rbh' },
    { k: 'ah', label: 'Area Head', field: 'ah', scope: 'areaHead' },
    { k: 'cm', label: 'Cluster Manager', field: 'cm', scope: 'cm' },
    { k: 'sc', label: 'Service Center', field: 'name', scope: 'branch' },
  ],
  SME: [
    { k: 'rbhSme', label: 'RBH — SME', field: 'rbhSme', scope: 'rbhSme' },
    { k: 'hm', label: 'Hub Manager', field: 'hm', scope: 'hm' },
    { k: 'sc', label: 'Service Center', field: 'name', scope: 'branch' },
  ],
  Diplo: [{ k: 'sc', label: 'Service Center', field: 'name', scope: 'branch' }],
  DS: [{ k: 'rsm', label: 'RSM', field: 'name', scope: 'rsmSelf' }],
  All: [{ k: 'rbhAny', label: 'RBH', scope: 'rbhAny', val: b => (b.segment === 'SME' ? b.rbhSme : b.rbh) }],
};
const EOP_ALL_TAIL = {
  Retail: [
    { k: 'ah', label: 'Area Head', field: 'ah', scope: 'areaHead' },
    { k: 'cm', label: 'Cluster Manager', field: 'cm', scope: 'cm' },
    { k: 'sc', label: 'Service Center', field: 'name', scope: 'branch' },
  ],
  SME: [
    { k: 'hm', label: 'Hub Manager', field: 'hm', scope: 'hm' },
    { k: 'sc', label: 'Service Center', field: 'name', scope: 'branch' },
  ],
};

/* 2.11 Per-level Current Account headings */
const EOP_LEVEL_CA = {
  ah: 'CURRENT ACCOUNT',
  cm: 'CURRENT ACCOUNT - Retail',
  hm: 'CURRENT ACCOUNT - Business Banking',
  sc: 'Current Account',
  rsm: 'CURRENT ACCOUNT',
};

/* 2.12 Child reports — 4 for Retail (RBH -> AH -> CM -> SC), 2 for SME (RBH-SME -> HM -> SC), 0 for Diplo/DS */
const EOP_CHILDREN = [
  { id: 'move', label: 'RBH YTD Movement', sub: 'CA Campaign Tracker · YTD avg change from 26-Aug-26', books: ['Retail'], icon: ['trending_up', 'r'] },
  { id: 'flows', label: 'Inflow / Outflow', sub: 'Top 5 Branch & Client Inflow / Outflow · ODC / MTD / YTD', books: ['Retail', 'SME'], icon: ['swap_vert', 'r'] },
  { id: 'wow', label: 'Week on Week', sub: 'Weekly Service Centre Performance Report', books: ['Retail'], icon: ['calendar_view_week', 'o'] },
  { id: 'base', label: 'Behind Base', sub: 'Behind Base Analysis · CM / HM & Service Center', books: ['Retail', 'SME'], icon: ['assessment', 'o'] },
];

/* 2.1 Column plan from 13-Oct-2026 workbook; hidden cols (qclose, sat, qtd, odcSat, ytdSat) omitted from SHEET_COLS */
const EOP_COL_PLAN = [
  { k: 'dec25', i: 0, date: 1 },
  { k: 'mar26', i: 1, date: 1 },
  { k: 'jun26', i: 2, date: 1 },
  { k: 'qclose', i: 3, date: 1 },
  { k: 'mstart', i: 4, date: 1 },
  { k: 'lwd', i: 5, date: 1 },
  { k: 'cur', i: 6, date: 1, strong: 1 },
  { k: 'sat', i: 7, date: 1 },
  { k: 'target', i: 8, major: 1 },
  { k: 'odc', i: 9, signed: 1 },
  { k: 'mtd', i: 10, signed: 1 },
  { k: 'ytd', i: 11, signed: 1, major: 1 },
  { k: 'qtd', i: 12, signed: 1 },
  { k: 'odcSat', i: 13, signed: 1 },
  { k: 'ytdSat', i: 14, signed: 1 },
  { k: 'variance', i: 15, signed: 1 },
  { k: 'spDec', i: 16 },
  { k: 'spAug', i: 17 },
  { k: 'ftmSep', i: 18 },
  { k: 'ftmOct', i: 19 },
  { k: 'ytdSep', i: 20 },
  { k: 'ytdOct', i: 21 },
  { k: 'mtdAvg', i: 22, signed: 1 },
  { k: 'ytdAvg', i: 23, signed: 1 },
  { k: 'ytdAugAvg', i: 24, signed: 1 },
];
const EOP_DATE_KEYS = ['dec25', 'mar26', 'jun26', 'mstart', 'lwd', 'cur'];
const EOP_MOVES = ['target', 'odc', 'mtd', 'ytd', 'variance'];
const EOP_AVGS = ['spDec', 'spAug', 'ftmSep', 'ftmOct', 'ytdSep', 'ytdOct', 'mtdAvg', 'ytdAvg', 'ytdAugAvg'];
const EOP_SHEET_COLS = [...EOP_DATE_KEYS, ...EOP_MOVES, ...EOP_AVGS];

/* 1.1 Growth % bases */
const GROWTH_BASE = { odc: 'lwd', mtd: 'mstart', ytd: 'dec25', variance: 'target', mtdAvg: 'ftmSep', ytdAvg: 'spDec' };

const EOP_GRAPH_VIEWS = [
  { id: 'eop', label: 'EOP', keys: EOP_DATE_KEYS, target: 1 },
  { id: 'mtd', label: 'MTD Avg', keys: ['ftmSep', 'ftmOct'] },
  { id: 'ytd', label: 'YTD Avg', keys: ['spDec', 'spAug', 'ytdSep', 'ytdOct'] },
];

const SME_BLOCK = {
  'SAVING ACCOUNT': 'SAVING ACCOUNT - Business Banking',
  HCS: 'HCS - Business Banking',
  'TERM DEPOSITS': 'TERM DEPOSITS - Business Banking',
};

/* ---------------- EopData (builds from embedded 13-Oct WEB_DATA) ---------------- */
const EopData = (() => {
  let built = null, whoseMap = null, ntbIdx = null;
  function avgLabel(name) {
    return String(name == null ? '' : name).replace(/(\d{4})-(\d{2})-(\d{2})/, all => {
      const d = parseIso(all);
      return d ? shortMonthLbl(d) : all;
    });
  }
  function isPct(g) { return /MIX/i.test(g || ''); }
  function hasFigures(v) {
    if (!v) return false;
    for (const k in v) if (typeof v[k] === 'number' && v[k]) return true;
    return false;
  }
  function fromSheet(arr, cols) {
    const o = {};
    cols.forEach(c => { const v = arr[c.i]; o[c.k] = typeof v === 'number' ? v : null; });
    return o;
  }
  function zeroVec(cols) { const o = {}; cols.forEach(c => (o[c.k] = 0)); return o; }
  function totalsAsSheets(m, cols) {
    const sum = parts => {
      const out = {};
      cols.forEach(c => {
        let t = 0, any = false;
        parts.forEach(g => { const v = m[g] && m[g][c.k]; if (typeof v === 'number' && !isNaN(v)) { t += v; any = true; } });
        out[c.k] = any ? Math.round(t * 1e6) / 1e6 : null;
      });
      return out;
    };
    m['TOTAL DEPOSITS'] = sum(['Current Account', 'SAVING ACCOUNT', 'HCS', 'TERM DEPOSITS']);
    m['TOTAL CASA'] = sum(['Current Account', 'SAVING ACCOUNT']);
  }
  function build() {
    const sc = WEB_DATA.eop_sc;
    const headers = sc.metric_columns || [], avgs = sc.avg_columns || [];
    const cols = EOP_COL_PLAN.map(c => {
      const raw = c.i < headers.length ? headers[c.i] : avgs[c.i - headers.length];
      const d = c.date ? parseIso(raw) : null;
      const label = d ? (c.k === 'lwd' || c.k === 'cur' ? dayShortLbl(d) : shortMonthLbl(d)) : avgLabel(raw);
      return { k: c.k, i: c.i, label, signed: !!c.signed, strong: !!c.strong, major: !!c.major, date: d ? raw : '', dateObj: d };
    });
    const colMap = Object.fromEntries(cols.map(c => [c.k, c]));
    const dated = EOP_DATE_KEYS.map(k => colMap[k]).filter(c => c && c.dateObj)
      .map(c => ({ k: c.k, iso: c.date, d: c.dateObj, col: c })).sort((a, b) => a.d - b.d);
    const asOfDate = colMap.cur && colMap.cur.dateObj ? colMap.cur.dateObj : parseIso('2026-10-13');

    const ix = {};
    sc.id_columns.forEach((c, i) => { if (!(c in ix)) ix[c] = i; });
    const g = (r, c) => (c in ix ? r.ids[ix[c]] : null);
    const neededGroups = ['Current Account', 'SAVING ACCOUNT', 'HCS', 'TERM DEPOSITS',
      'SAVING ACCOUNT - Business Banking', 'HCS - Business Banking', 'TERM DEPOSITS - Business Banking'];

    const branches = sc.rows.filter(r => g(r, 'BR_KEY') && String(g(r, 'CLUSTER MANAGER') || '').toUpperCase() !== 'TOTAL').map(r => {
      const code = String(g(r, 'BR_KEY'));
      const b = {
        code,
        name: g(r, 'BR_NAME') || ('Branch ' + code),
        segment: g(r, 'Segment') || 'Retail',
        region: g(r, 'Main Region') || 'South Region',
        regionShort: g(r, 'REGION') || '',
        reg: g(r, 'REG') || '',
        area: g(r, 'AREA') || 'Unassigned Area',
        ah: g(r, 'AREA HEAD') || 'Vacant',
        cm: g(r, 'CLUSTER MANAGER') || 'Vacant',
        cmCode: g(r, 'CM_BR_KEY') || code,
        cmBranch: g(r, 'CM_BR') || '',
        hub: g(r, 'HUB_BR') || '',
        hubCode: g(r, 'HUB_BR_KEY') || '',
        hm: g(r, 'HUB Manager') || 'Vacant',
        rbh: g(r, 'RBH') || 'Vacant',
        rbhSme: g(r, 'RBH-SME') || '',
        smeRegion: g(r, 'SME-Region') || '',
        category: g(r, 'CATEGORY') || 'Urban',
        type: g(r, 'TYPE') || 'Conventional Banking',
        status: g(r, 'STATUS') || 'Active',
        isDiplo: code === '6&31',
        m: {},
      };
      neededGroups.forEach(grp => {
        const src = r.groups && r.groups[grp];
        b.m[grp] = src && src.some(v => typeof v === 'number') ? fromSheet(src, cols) : zeroVec(cols);
      });
      if (b.segment === 'SME') {
        for (const plain in SME_BLOCK) {
          const alt = b.m[SME_BLOCK[plain]];
          if (!hasFigures(b.m[plain]) && hasFigures(alt)) b.m[plain] = alt;
        }
      }
      totalsAsSheets(b.m, cols);
      return b;
    });

    const rs = WEB_DATA.eop_rsm_ds, rix = {};
    rs.id_columns.forEach((c, i) => { if (!(c in rix)) rix[c] = i; });
    const RSM_GROUP = { 'Current Account': 'CURRENT ACCOUNT', 'SAVING ACCOUNT': 'SAVING ACCOUNT', HCS: 'HCS', 'TERM DEPOSITS': 'TD' };
    const rsms = rs.rows.filter(r => r.ids[rix['RSM']] && String(r.ids[rix['STATUS']] || '').toUpperCase() !== 'TOTAL').map(r => {
      const nm = r.ids[rix['RSM']];
      const o = {
        name: nm, reg: r.ids[rix['REGION']] || '', region: r.ids[rix['Main Region']] || 'South Region',
        status: r.ids[rix['STATUS']] || 'RSM', code: r.ids[rix['REGION']] || nm, area: r.ids[rix['Main Region']] || '',
        segment: 'DS', isDiplo: false, rbh: nm, rbhSme: '', ah: nm, cm: nm, hm: nm, type: '', m: {},
      };
      ['Current Account', 'SAVING ACCOUNT', 'HCS', 'TERM DEPOSITS'].forEach(grp => {
        const src = r.groups && r.groups[RSM_GROUP[grp] || grp];
        o.m[grp] = src && src.some(v => typeof v === 'number') ? fromSheet(src, cols) : zeroVec(cols);
      });
      totalsAsSheets(o.m, cols);
      return o;
    });

    return { cols, colMap, dated, asOfDate, branches, rsms };
  }
  function get() { return built || (built = build()); }
  function colByKey(k) { return get().colMap[k] || null; }
  function colForIso(iso) {
    const list = get().dated;
    let pick = list[0];
    for (let i = 0; i < list.length; i++) if (list[i].iso <= iso) pick = list[i];
    return pick;
  }
  function groupLabel(g) {
    const M = { 'Current Account': 'CURRENT ACCOUNT', 'TERM DEPOSITS': 'TERM DEPOSITS', 'TOTAL DEPOSITS': 'TOTAL DEPOSITS', 'TOTAL CASA': 'TOTAL CASA' };
    return M[g] || g;
  }
  function levelGroupLabel(metric, level) {
    if (metric === 'Current Account' && level && EOP_LEVEL_CA[level.k]) return EOP_LEVEL_CA[level.k];
    return groupLabel(metric);
  }
  function agg(list, group) {
    const D = get(), out = {}, has = {};
    D.cols.forEach(c => { out[c.k] = 0; has[c.k] = false; });
    list.forEach(b => {
      const v = b.m && b.m[group];
      if (!v) return;
      D.cols.forEach(c => {
        if (typeof v[c.k] === 'number' && !isNaN(v[c.k])) {
          out[c.k] += v[c.k];
          has[c.k] = true;
        }
      });
    });
    D.cols.forEach(c => { out[c.k] = has[c.k] ? Math.round(out[c.k] * 1e6) / 1e6 : null; });
    return out;
  }
  function growth(m, k) {
    const base = GROWTH_BASE[k];
    if (!base || !m) return null;
    const b = m[base], v = m[k];
    if (typeof b !== 'number' || !b || typeof v !== 'number') return null;
    return (v / Math.abs(b)) * 100;
  }
  function growthPipe(m, k, pct) {
    if (pct) return '';
    const g = growth(m, k);
    if (g === null) return '';
    return `<span class="gp ${g < 0 ? 'neg' : ''}"><i>|</i>${g >= 0 ? '+' : '−'}${Math.abs(g).toFixed(1)}%</span>`;
  }
  function perBranch(v, n, key, asOfKey) {
    if (!n || !v) return null;
    const x = key === 'cur' ? v[asOfKey || 'cur'] : v[key];
    return typeof x === 'number' ? x / n : null;
  }
  function perBranchLine(v, n, pct, asOfKey) {
    if (pct || !n) return '';
    const now = perBranch(v, n, 'cur', asOfKey), base = perBranch(v, n, 'dec25', asOfKey);
    if (now === null) return '';
    const step = base === null ? null : now - base;
    const g = step === null || !base ? null : (step / Math.abs(base)) * 100;
    const c = step != null && step < 0 ? ET.negative : ET.positive;
    return `<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 7px;margin-top:6px">
      <span style="${TB(10, 700, ET.muted)}">Avg / branch</span>
      <span style="${TM(11, 800, ET.ink)}">${F.number(now)}</span>
      ${base != null ? `<span style="${TB(10, 500, ET.muted)}">Dec-25 ${F.number(base)}</span>` : ''}
      ${step != null ? `<span style="${TM(10.5, 700, c)}">${F.signed(step)}${g != null ? ` | ${g >= 0 ? '+' : '−'}${Math.abs(g).toFixed(1)}%` : ''}</span>` : ''}
      <span style="${TB(10, 600, ET.muted)}">${F.count(n)} br</span>
    </div>`;
  }
  /* 1.2 Branch hierarchy tooltip text (ports whose() verbatim) */
  function whose(name) {
    if (!whoseMap) {
      whoseMap = {};
      ((WEB_DATA.eop_sc || {}).rows || []).forEach(r => {
        const n = r.ids[4];
        if (n && !whoseMap[n]) whoseMap[n] = [r.ids[13], r.ids[16], r.ids[17], r.ids[9], r.ids[11], r.ids[15]];
      });
    }
    const w = whoseMap[name];
    if (!w) return '';
    const bits = [];
    if (w[0]) bits.push('Area: ' + w[0]);
    if (w[1]) bits.push('Area Head: ' + w[1]);
    if (w[2]) bits.push('Cluster Manager: ' + w[2]);
    if (w[3]) bits.push('Hub Manager: ' + w[3]);
    if (w[5]) bits.push('RBH: ' + w[5]);
    if (w[4]) bits.push(w[4]);
    return bits.join('\n');
  }
  /* 3.5 Login scope for child reports */
  function childScope(role) {
    const s = (role && role.scope) || {};
    if (!(s.rbh || s.rbhSme || s.areaHead || s.cm || s.hm || s.branch)) return null;
    const out = { keys: {}, cmKeys: {}, cmNames: {}, hubKeys: {}, rbhs: {}, heads: {}, n: 0, below: !!(s.areaHead || s.cm || s.hm || s.branch) };
    ((WEB_DATA.eop_sc || {}).rows || []).forEach(r => {
      const id = r.ids;
      if (role.portfolio !== 'Both' && id[2] !== role.portfolio) return;
      if (s.rbh && id[15] !== s.rbh) return;
      if (s.rbhSme && id[19] !== s.rbhSme) return;
      if (s.areaHead && id[16] !== s.areaHead) return;
      if (s.cm && id[17] !== s.cm) return;
      if (s.hm && id[9] !== s.hm) return;
      if (s.branch && id[4] !== s.branch) return;
      out.n++;
      out.keys[id[3]] = 1;
      if (id[5]) out.cmKeys[id[5]] = 1;
      if (id[6]) out.cmNames[id[6]] = 1;
      if (id[7]) out.hubKeys[id[7]] = 1;
      if (id[15]) out.rbhs[id[15]] = 1;
      const hd = id[2] === 'SME' ? id[19] : id[15];
      if (hd) out.heads[hd] = 1;
    });
    return out;
  }
  function ntbIndex() {
    if (ntbIdx) return ntbIdx;
    ntbIdx = {};
    const src = WEB_DATA.ntb_sc;
    if (!src) return ntbIdx;
    const i = src.id_columns.indexOf('SC Code');
    if (i < 0) return ntbIdx;
    const at = (a, n) => (a && typeof a[n] === 'number' ? a[n] : 0);
    src.rows.forEach(r => {
      const code = r.ids[i]; if (!code) return;
      const p = r.periods || {};
      ntbIdx[String(code)] = {
        day: at(p['For the Day'], 0), mtd: at(p['For The Month'], 0), ytd: at(p['Year to Date'], 0),
        tmtd: at(p['Target - MTD'], 0), tytd: at(p['Target - YTD'], 0),
        vmtd: at(p['Target - MTD'], 15), vytd: at(p['Target - YTD'], 15),
      };
    });
    return ntbIdx;
  }
  function casaBlock(pf, list) {
    const CP = WEB_DATA.casa_portfolio;
    if (!CP || !CP.books) return null;
    const book = pf === 'SME' ? CP.books.SME : CP.books.Retail;
    if (!book || !book.length) return null;
    const want = {};
    list.forEach(b => { const n = pf === 'SME' ? (b.rbhSme || '') : (b.region || ''); if (n) want[n] = 1; });
    const names = Object.keys(want);
    let pick = null;
    if (names.length === 1) pick = book.find(bk => bk.block === names[0]) || null;
    return { block: pick || book[0], asOf: CP.as_of, whole: !pick };
  }
  return { get, isPct, colByKey, colForIso, groupLabel, levelGroupLabel, agg, growth, growthPipe, perBranch, perBranchLine, whose, childScope, ntbIndex, casaBlock };
})();

function eopLevelVal(level, b) { return String((level.val ? level.val(b) : b[level.field]) || 'Unassigned'); }
function eopSubFor(level, b) {
  switch (level.k) {
    case 'rsm': return `${b.region} · ${b.reg}`;
    case 'rbhAny': return `${b.segment} · ${b.smeRegion || b.region}`;
    case 'sc': return `${b.code} · ${b.area}`;
    case 'ah': return b.area + (b.segment === 'SME' ? '' : ` · ${b.region}`);
    case 'cm': return b.cmBranch || b.area;
    case 'hm': return b.hub || b.smeRegion || b.area;
    case 'rbhSme': return b.smeRegion || b.region;
    default: return b.region;
  }
}

/* ---------------- EopVM ---------------- */
class EopVM {
  constructor(onChange) {
    this.onChange = onChange; this.disposed = false; this.token = 0;
    const role = currentRole();
    this.s = {
      isLoading: true, loaded: false, refreshing: false,
      role,
      pf: role.portfolio !== 'Both' ? role.portfolio : 'All',
      stream: '',
      asOfKey: 'cur', asOfDate: '',
      metric: null, // null on Home; book id on Drill
      path: [],     // chosen level names
      graphTab: 0, graphChart: 0,
      sortCol: 'cur', sortDesc: true,
      openAccordions: new Set(),
      /* Child report state (3.1 Movement, 3.2 Flows, 3.3 WOW, 3.4 Behind Base) */
      view: 'eop', // 'eop' | 'move' | 'flows' | 'wow' | 'base'
      childSeg: 'Retail', // active segment when opened from 'All' on 2-segment reports (flows, base)
      mvHead: '', mvAh: '', mvCluster: '',
      flHead: '', flPeriod: 'ytd',
      wowHead: '', wowAh: '', wowCluster: '',
      bbHead: '', bbAh: '', bbCm: '',
    };
  }
  set(p, silent) { this.s = Object.assign({}, this.s, p); if (!this.disposed && !silent) this.onChange(); }
  get D() { return EopData.get(); }
  wholeBook() { const sc = this.s.role.scope || {}; return !(sc.rbh || sc.rbhSme || sc.areaHead || sc.cm || sc.hm || sc.branch); }
  openPortfolios() {
    const locked = this.s.role.portfolio !== 'Both';
    return EOP_PORTFOLIOS.filter(p => {
      if (p.id === 'DS' && !this.wholeBook()) return false;
      return locked ? p.id === this.s.role.portfolio : true;
    });
  }
  pfLabel() { return (EOP_PORTFOLIOS.find(p => p.id === this.s.pf) || {}).label || this.s.pf; }
  streamLabel() { return (EOP_STREAMS.find(x => x.id === this.s.stream) || EOP_STREAMS[0]).label; }
  asOfCol() { return this.s.loaded ? (EopData.colByKey(this.s.asOfKey) || EopData.colByKey('cur')) : null; }
  asOfLabel() { return this.s.loaded ? ((this.asOfCol() || {}).label || dayShortLbl(this.D.asOfDate)) : '—'; }
  lead(v) { return v ? v[this.s.asOfKey] : null; }
  displayAsOfDate() { return this.s.asOfDate ? parseIso(this.s.asOfDate) : ((this.asOfCol() && this.asOfCol().dateObj) || this.D.asOfDate); }

  allChain(path) {
    const head = (path || this.s.path)[0];
    if (!head) return EOP_LEVELS.All;
    const hit = this.D.branches.find(b => String(b.segment === 'SME' ? b.rbhSme : b.rbh) === String(head));
    return EOP_LEVELS.All.concat(EOP_ALL_TAIL[hit && hit.segment === 'SME' ? 'SME' : 'Retail']);
  }
  levels(path) {
    const all = this.s.pf === 'All' ? this.allChain(path) : (EOP_LEVELS[this.s.pf] || EOP_LEVELS.Retail);
    const sc = this.s.role.scope || {};
    let start = 0;
    for (let i = 0; i < all.length; i++) if (sc[all[i].scope]) start = i;
    return all.slice(start);
  }
  bookHead() {
    if (this.s.pf === 'DS' || this.s.pf === 'Diplo') return '';
    if (!this.wholeBook()) return this.s.role.person;
    const lv = this.levels([]);
    if (!lv.length || !lv[0].k.startsWith('rbh')) return '';
    return this.s.pf === 'All' ? `${EOP_BOOK_HEADS.Retail} & ${EOP_BOOK_HEADS.SME}` : (EOP_BOOK_HEADS[this.s.pf] || '');
  }
  inScope(b) {
    const s = this.s.role.scope || {};
    if (this.s.stream && b.type !== this.s.stream) return false;
    if (this.s.role.portfolio !== 'Both' && b.segment !== this.s.role.portfolio) return false;
    if (s.rbh && b.rbh !== s.rbh) return false;
    if (s.rbhSme && b.rbhSme !== s.rbhSme) return false;
    if (s.areaHead && b.ah !== s.areaHead) return false;
    if (s.cm && b.cm !== s.cm) return false;
    if (s.hm && b.hm !== s.hm) return false;
    if (s.branch && b.name !== s.branch) return false;
    return true;
  }
  factsHere() { return this.s.pf === 'DS' ? this.D.rsms : this.D.branches; }
  pathBranches(depth, path) {
    const p = path || this.s.path;
    const lv = this.levels(p);
    const d = typeof depth === 'number' ? depth : p.length;
    return this.factsHere().filter(b => {
      if (this.s.pf !== 'DS') {
        if (b.isDiplo !== (this.s.pf === 'Diplo')) return false;
        if (this.s.pf !== 'Diplo' && this.s.pf !== 'All' && b.segment !== this.s.pf) return false;
        if (!this.inScope(b)) return false;
      }
      for (let i = 0; i < d && i < p.length; i++) if (!lv[i] || eopLevelVal(lv[i], b) !== p[i]) return false;
      return true;
    });
  }
  choicesAt(i) {
    const lv = this.levels();
    if (!lv[i]) return [];
    return [...new Set(this.pathBranches(i).map(b => eopLevelVal(lv[i], b)))].sort();
  }
  rowsHere() {
    const lv = this.levels(), i = Math.min(this.s.path.length, lv.length - 1), level = lv[i];
    const map = new Map();
    this.pathBranches().forEach(b => {
      const k = eopLevelVal(level, b);
      if (!map.has(k)) map.set(k, { id: k, label: k, rows: [], sample: b });
      map.get(k).rows.push(b);
    });
    const out = [...map.values()].map(e => {
      e.n = e.rows.length;
      e.sub = eopSubFor(level, e.sample);
      e.m = EopData.agg(e.rows, this.s.metric);
      e.deeper = level.k === 'rbhAny' || i < lv.length - 1;
      return e;
    });
    const col = this.s.sortCol, dir = this.s.sortDesc ? -1 : 1;
    out.sort((a, b) => {
      const va = col === 'n' ? a.n : (a.m[col] || 0), vb = col === 'n' ? b.n : (b.m[col] || 0);
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    out.level = level;
    return out;
  }
  childOpen(id) {
    if (this.s.pf !== 'Retail' && this.s.pf !== 'SME' && this.s.pf !== 'All') return false;
    return EOP_CHILDREN.some(c => c.id === id && (this.s.pf === 'All' || c.books.includes(this.s.pf)));
  }
  activeFilterCount() {
    let c = 0;
    if (this.s.asOfDate) c++;
    if (this.s.stream && this.s.pf !== 'DS') c++;
    if (this.s.metric) c += this.s.path.length;
    return c;
  }

  async loadData() {
    this.set({ isLoading: true });
    await DataLoader.load('eop', 'ntb');
    if (this.disposed) return;
    EopData.get();
    this.set({ isLoading: false, loaded: true, refreshing: false });
    DataLoader.load('eop_children').catch(() => {});
  }
  async pulse(patch) {
    const t = ++this.token;
    this.set(Object.assign({ refreshing: true }, patch));
    await sleep(120); if (this.disposed || t !== this.token) return;
    this.set({ refreshing: false });
  }
  selectPortfolio(pf) {
    if (pf === this.s.pf) return Promise.resolve();
    const keepChild = this.s.view !== 'eop' && (pf === 'All' || EOP_CHILDREN.some(c => c.id === this.s.view && c.books.includes(pf)));
    return this.pulse({ pf, path: [], graphTab: 0, openAccordions: new Set(), view: keepChild ? this.s.view : 'eop' });
  }
  selectStream(stream) {
    if (stream === this.s.stream) return Promise.resolve();
    return this.pulse({ stream, path: [], openAccordions: new Set() });
  }
  setAsOfDate(d) {
    if (!d) return Promise.resolve();
    const iso = toIso(d);
    const col = EopData.colForIso(iso);
    return this.pulse({ asOfKey: col.k, asOfDate: iso === col.iso && col.k === 'cur' ? '' : iso });
  }
  resetFilters() {
    const defaultPf = this.s.role.portfolio !== 'Both' ? this.s.role.portfolio : 'All';
    return this.pulse({ pf: defaultPf, stream: '', asOfKey: 'cur', asOfDate: '', path: [], openAccordions: new Set() });
  }
  selectProduct(metric) {
    return this.pulse({ view: 'eop', metric, path: [], sortCol: this.s.asOfKey, sortDesc: true, openAccordions: new Set() });
  }
  openChild(id) {
    const next = [...this.s.path, id];
    const lv = this.levels(next);
    if (this.s.path.length >= lv.length - 1) return Promise.resolve();
    return this.pulse({ path: next, sortCol: this.s.asOfKey, sortDesc: true, openAccordions: new Set() });
  }
  goToCrumb(idx) {
    return this.pulse({ path: idx < 0 ? [] : this.s.path.slice(0, idx + 1), openAccordions: new Set() });
  }
  selectLevelFilter(i, val) {
    const next = [...this.s.path.slice(0, i), ...(val ? [val] : [])];
    return this.pulse({ path: next, openAccordions: new Set() });
  }
  async openChildReport(id) {
    if (!this.childOpen(id)) return;
    if (!WEB_DATA.eop_move || !WEB_DATA.eop_base) {
      this.set({ refreshing: true });
      await DataLoader.load('eop_children');
      if (this.disposed) return;
    }
    const seg = this.s.pf === 'SME' ? 'SME' : 'Retail';
    this.set({ view: id, refreshing: false, childSeg: seg, mvHead: '', mvAh: '', mvCluster: '', flHead: '', flPeriod: 'ytd', wowHead: '', wowAh: '', wowCluster: '', bbHead: '', bbAh: '', bbCm: '' });
  }
  closeChildReport() { this.set({ view: 'eop' }); }
  handleBack() {
    if (this.s.view !== 'eop') return handleEopChildBack(this);
    if (this.s.path.length) { this.set({ path: this.s.path.slice(0, -1), openAccordions: new Set() }); return true; }
    if (this.s.metric) { this.set({ metric: null, path: [], openAccordions: new Set() }); return true; }
    return false;
  }
  toggleAccordion(id, silent) { const o = new Set(this.s.openAccordions); if (!o.delete(id)) o.add(id); this.set({ openAccordions: o }, silent); }
}

/* ---------------- EOP-specific widgets ---------------- */
function eopHeroCard(vm, list) {
  const tot = EopData.agg(list, 'TOTAL DEPOSITS');
  const cur = vm.lead(tot) || 0, target = tot.target || 0, ach = target ? (cur / target) * 100 : 0;
  const parts = EOP_BOOKS.slice(0, 4).map(b => {
    const v = vm.lead(EopData.agg(list, b.id)) || 0;
    return { id: b.id, name: b.short, accent: b.accent, eop: v, share: cur > 0 ? (v / cur) * 100 : 0 };
  });
  const bar = `<div style="display:flex;gap:3px;margin-top:14px">${parts.map(p => `<div style="flex:${Math.max(1, Math.round((p.eop / (cur || 1)) * 1000))} 1 0;height:10px;border-radius:999px;background:${p.accent}"></div>`).join('')}</div>`;
  const legItem = p => `<div style="display:flex;align-items:center;min-width:0"><div style="width:10px;height:10px;border-radius:3px;background:${p.accent};flex:none"></div><span style="width:7px;flex:none"></span><span style="${TB(12, 600, ET.text2)}">${p.name}</span><span style="width:6px;flex:none"></span><span class="el1" style="${TM(12, 900, ET.ink)}">${F.percent(p.share)}</span></div>`;
  const legend = `<div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px 14px">${parts.map(legItem).join('')}</div>`;

  const statTile = (label, key) => `<div style="padding:11px 12px;background:${ET.tile};border-radius:14px;min-width:0">
    <div class="el1" style="${TB(9.5, 800, ET.muted, 1.0)}">${esc(label)}</div>
    <div style="height:6px"></div>
    ${signedValue(tot[key] || 0, { size: 12.5, gp: EopData.growthPipe(tot, key) })}</div>`;

  /* 2.4 Per branch average on Hero (book / branches in view, compared with Dec-25) */
  const n = list.length;
  const pbNow = EopData.perBranch(tot, n, 'cur', vm.s.asOfKey);
  const pbBase = EopData.perBranch(tot, n, 'dec25', vm.s.asOfKey);
  const pbStep = pbNow != null && pbBase != null ? pbNow - pbBase : null;
  const pbPct = pbStep != null && pbBase ? (pbStep / Math.abs(pbBase)) * 100 : null;
  const pbTile = n > 0 && pbNow != null
    ? `<div style="margin-top:8px;padding:11px 12px;background:${ET.tile};border-radius:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="min-width:0">
          <div style="${TB(9.5, 800, ET.muted, 1.0)}">PER BRANCH · ${F.count(n)} ${vm.s.pf === 'DS' ? 'RSMS' : (n === 1 ? 'BRANCH' : 'BRANCHES')}</div>
          <div style="margin-top:4px;display:flex;align-items:baseline;gap:6px">
            <span style="${TM(15, 900, ET.ink)}">${F.number(pbNow)}</span>
            <span style="${TB(10, 700, ET.muted)}">PKR Mn</span>
          </div>
        </div>
        ${pbStep != null ? `<div style="text-align:right;flex:none">
          <div style="${TB(9.5, 700, ET.muted)}">vs Dec-25 (${F.number(pbBase)})</div>
          <div style="margin-top:3px">${signedValue(pbStep, { size: 11.5, icon: false, gp: pbPct != null ? `<span class="gp ${pbPct < 0 ? 'neg' : ''}"><i>|</i>${pbPct >= 0 ? '+' : '−'}${Math.abs(pbPct).toFixed(1)}%</span>` : '' })}</div>
        </div>` : ''}
      </div>` : '';

  return `<div class="esurf tap" data-act="hero" style="border-radius:24px;padding:14px 14px">
    <div style="display:flex;align-items:flex-start">
      <div style="flex:1;min-width:0">
        <div class="el1" style="${TB(12, 800, ET.text2, 1.5)}">TOTAL DEPOSITS</div>
        <div style="${TB(10.5, 500, ET.muted)}margin-top:2px">CA + SA + HCS + TD · PKR Mn</div>
        <div style="height:8px"></div>
        <div class="fit">${bigNumber(cur, 32, { ls: -1.4 })}</div>
        <div style="height:8px"></div>
        <div style="display:flex;align-items:center"><span style="${TB(12, 600, ET.muted)}">target</span><span style="width:12px"></span><span class="el1" style="${TM(12, 800, ET.text2)}">${F.number(target)}</span></div>
      </div>
      <div style="width:10px"></div>${ring(ach)}
    </div>${bar}${legend}
    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${statTile('ODC', 'odc')}${statTile('MTD', 'mtd')}${statTile('YTD', 'ytd')}${statTile('TARGET VAR', 'variance')}
    </div>${pbTile}</div>`;
}

/* 2.12 Child reports entry under hero: 4 on All/Retail, 2 on SME (Inflow/Outflow + Behind Base), 0 on Diplo/DS */
function eopChildEntry(vm) {
  const open = EOP_CHILDREN.filter(c => vm.childOpen(c.id));
  if (!open.length) return '';
  const tag = vm.s.pf === 'SME' ? 'SME · 2 reports' : vm.s.pf === 'Retail' ? 'Retail · 4 reports' : '4 reports';
  return `<div style="margin-top:12px">
    <div style="padding:0 2px 8px;display:flex;align-items:center;justify-content:space-between">
      <span style="${TB(10, 800, ET.primary, 0.8)}">CHILD REPORTS</span>
      <span style="${TB(9.5, 700, ET.muted)}">${esc(tag)}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">${open.map(c => {
      const sub = c.id === 'base'
        ? (vm.s.pf === 'SME' ? 'Behind Base Analysis · HM & Service Center' : vm.s.pf === 'Retail' ? 'Behind Base Analysis · CM & Service Center' : c.sub)
        : c.sub;
      return `
      <div class="esurf tap" data-act="child" data-id="${c.id}" style="border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:12px">
        <div style="width:34px;height:34px;border-radius:11px;background:rgba(4,120,87,.1);border:1px solid rgba(4,120,87,.22);display:flex;align-items:center;justify-content:center;flex:none">${I(c.icon[0], c.icon[1], 18, ET.primary)}</div>
        <div class="grow">
          <div class="el1" style="${TB(13.5, 700, ET.ink)}">${esc(c.label)}</div>
          <div class="el1" style="${TB(10.5, 500, ET.muted)}margin-top:1px">${esc(sub)}</div>
        </div>
        ${I('chevron_right', 'r', 20, ET.primary)}
      </div>`;
    }).join('')}</div></div>`;
}

/* 2.3 + Change 3: Single chart on EOP Home with EOP / MTD Avg / YTD Avg toggle */
function eopHomeChart(vm, list, charts) {
  const tabs = ['All', ...EOP_BOOKS.map(b => b.label)];
  const sel = Math.max(0, Math.min(vm.s.graphTab, tabs.length - 1));
  const books = sel === 0 ? EOP_BOOKS : [EOP_BOOKS[sel - 1]];
  const pct = books.length === 1 && EopData.isPct(books[0].id);
  const views = pct ? [EOP_GRAPH_VIEWS[0]] : EOP_GRAPH_VIEWS;
  const view = views[Math.max(0, Math.min(vm.s.graphChart, views.length - 1))];
  const xs = view.keys.map(k => ({ k, label: (EopData.colByKey(k) || {}).label || k }));
  const series = books.map(b => {
    const v = EopData.agg(list, b.id);
    return { name: b.label, color: b.accent, values: xs.map(c => v[c.k]), target: view.target && books.length === 1 ? v.target : null };
  }).filter(sr => sr.values.some(x => typeof x === 'number' && x !== 0));
  if (!series.length) return '';
  const single = books.length === 1 && series.length === 1;
  const target = single && series[0].target > 0 ? series[0].target : null;
  const ci = charts.push({ series, labels: xs.map(x => x.label), target, fillArea: single }) - 1;
  return `<div class="esurf" style="border-radius:22px;padding:13px">
    <div style="${TB(10, 800, ET.muted, 0.5)}">${esc(sel === 0 ? 'ALL BOOKS' : books[0].label.toUpperCase())} — PKR MILLION</div>
    <div style="height:4px"></div>
    <div style="${TB(11, 500, ET.muted, null, 15)}">${esc(vm.pfLabel())} · ${view.id === 'eop' ? 'closing balances through the year' : view.label + ' balances'}</div>
    <div style="height:6px"></div>
    ${tabRow(tabs, sel, 'gtab')}${tabRow(views.map(v => v.label), views.indexOf(view), 'gchart')}
    <div style="height:4px"></div><div class="trend" data-ci="${ci}" style="height:220px"></div><div style="height:8px"></div>
    ${chartLegend(series, target != null)}</div>`;
}

/* 2.2 EXCLUDED: keep clean single-panel book cards with 0.3 whole numbers + 1.1 growth % */
function eopBookCard(vm, b, v) {
  const cur = vm.lead(v) || 0, target = v.target || 0, ach = target ? (cur / target) * 100 : 0;
  const frac = Math.max(0, Math.min(1, ach / 100)), reached = ach >= 100;
  const row = (lbl, key) => `<div style="height:28px;display:flex;align-items:center">
    <span style="${TB(9.5, 800, ET.muted, 0.9)}">${lbl}</span><span style="width:10px"></span>
    <div style="flex:1;min-width:0;display:flex;justify-content:flex-end">${signedValue(v[key] || 0, { end: true, gp: EopData.growthPipe(v, key) })}</div></div>`;
  return `<div class="lifted tap esurf" data-act="acct" data-id="${esc(b.id)}" style="border-radius:18px;background:#fff;position:relative;overflow:hidden;border:0">
    <div style="position:absolute;top:-50px;right:-50px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle closest-side,${rgba(b.accent, .13)},${rgba(b.accent, 0)})"></div>
    <div style="position:relative;padding:13px;border-radius:18px;border:1px solid ${ET.border}">
      <div style="display:flex;align-items:center">
        <div style="width:30px;height:30px;border-radius:10px;background:${rgba(b.accent, .16)};border:1px solid ${rgba(b.accent, .34)};display:flex;align-items:center;justify-content:center;flex:none">${I(b.icon[0], b.icon[1], 16, b.accent)}</div>
        <span style="width:11px"></span>
        <div class="grow"><div class="el1" style="${TB(11.5, 800, ET.text2)}">${esc(b.label)}</div><div class="el1" style="${TB(10, 500, ET.muted)}">${esc(b.sub)}</div></div>
        ${I('chevron_right', 'r', 18, ET.muted)}
      </div>
      <div style="height:10px"></div>
      <div style="display:flex;align-items:baseline;gap:6px"><div class="fit">${bigNumber(cur, 20)}</div><span style="${TB(10, 800, ET.muted)}">PKR Mn</span></div>
      <div style="height:8px"></div>
      <div style="display:flex;align-items:center"><span style="${TB(11, 600, ET.muted)}white-space:nowrap">vs target</span><span style="width:6px"></span><span class="el1 grow" style="${TM(11, 700, ET.ink)}">${F.number(target)}</span><span class="badge-pct ${reached ? 'over' : ''}">${F.percent(ach)}</span></div>
      <div style="height:7px"></div>
      <div style="height:6px;border-radius:999px;background:${ET.track};overflow:hidden"><div style="height:6px;width:${frac * 100}%;background:${b.accent}"></div></div>
      <div style="height:10px"></div>
      <div style="padding-top:10px;border-top:1px solid ${ET.grid}">${row('ODC', 'odc')}${row('MTD', 'mtd')}${row('YTD', 'ytd')}${row('TGT VAR', 'variance')}</div>
    </div></div>`;
}

/* 2.5 Drill page totals strip: headline + 2x2 grid (Target, EOP, MTD Avg, YTD Avg) */
function eopTotalsStrip(vm, list) {
  const metric = vm.s.metric, pct = EopData.isPct(metric);
  const v = EopData.agg(list, metric);
  const cur = vm.lead(v) || 0, target = v.target || 0, pace = target ? Math.max(0, Math.min(100, (cur / target) * 100)) : 0;
  const lv = vm.levels();
  const head = vm.s.path.length ? '' : vm.bookHead();
  const where = head || (vm.s.path.length ? vm.s.path[vm.s.path.length - 1] : vm.pfLabel());
  const whereSub = vm.s.path.length
    ? (list[0] ? eopSubFor(lv[vm.s.path.length - 1], list[0]) : '')
    : (vm.wholeBook() ? (head ? `${vm.pfLabel()} · whole book` : `${vm.pfLabel()}`) : `${vm.pfLabel()} · ${vm.s.role.designation}`);

  const fig = (label, val, { signed = false, key = null } = {}) => {
    const tone = signed && typeof val === 'number' ? F.delta(val) : ET.ink;
    const numTxt = pct ? F.percent(val, 2) : (signed ? F.signed(val) : F.number(val));
    return `<div style="min-width:0">
      <div class="el1" style="${TB(9, 700, ET.muted, 0.3)}">${esc(label.toUpperCase())}</div>
      <div style="margin-top:2px;display:flex;align-items:baseline;flex-wrap:wrap;gap:1px">
        <span style="${TM(12.5, 800, tone)}">${numTxt}</span>${key ? EopData.growthPipe(v, key, pct) : ''}
      </div></div>`;
  };
  const colName = k => (EopData.colByKey(k) || {}).label || k;

  const targetBox = `<div class="sbox">
    <div class="sbox-tag">Target</div>
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="${TB(9, 700, ET.muted)}">PACE</span>
        <span style="${TM(11, 800, pace >= 100 ? ET.positive : ET.ink)}">${F.percent(pace)}</span>
      </div>
      <div style="height:5px;border-radius:999px;background:#D6E0DA;overflow:hidden"><div style="height:5px;width:${pace}%;background:${ET.primary}"></div></div>
    </div>
    ${fig('Target', v.target)}
    ${fig('Tgt var', v.variance, { signed: true, key: 'variance' })}
  </div>`;
  const eopBox = `<div class="sbox">
    <div class="sbox-tag">EOP</div>
    ${fig('ODC', v.odc, { signed: true, key: 'odc' })}
    ${fig('MTD', v.mtd, { signed: true, key: 'mtd' })}
    ${fig('YTD', v.ytd, { signed: true, key: 'ytd' })}
  </div>`;
  const mtdAvgBox = pct ? '' : `<div class="sbox">
    <div class="sbox-tag">MTD Avg</div>
    ${fig('MTD growth', v.mtd, { signed: true, key: 'mtd' })}
    ${fig(colName('ftmOct'), v.ftmOct)}
    ${fig(colName('mtdAvg'), v.mtdAvg, { signed: true, key: 'mtdAvg' })}
  </div>`;
  const ytdAvgBox = pct ? '' : `<div class="sbox">
    <div class="sbox-tag">YTD Avg</div>
    ${fig('YTD growth', v.ytd, { signed: true, key: 'ytd' })}
    ${fig(colName('ytdOct'), v.ytdOct)}
    ${fig(colName('spDec'), v.spDec)}
    ${fig(colName('ytdAvg'), v.ytdAvg, { signed: true, key: 'ytdAvg' })}
  </div>`;

  return `<div class="esurf" style="border-radius:20px;padding:14px">
    <div class="el1" style="${TB(10, 800, ET.primary, 0.5)}">${esc(EopData.groupLabel(metric))}</div>
    <div style="height:2px"></div>
    <div class="el1" style="${TD(15, 700, ET.ink)}">${esc(where)}</div>
    ${whereSub ? `<div class="el1" style="${TB(10.5, 600, ET.muted)}margin-top:1px">${esc(whereSub)}</div>` : ''}
    <div style="height:10px"></div>
    <div style="display:flex;align-items:baseline;gap:7px">
      ${pct ? '' : `<span style="${TB(10, 800, ET.muted)}">PKR Mn</span>`}
      <div class="fit grow"><span style="${TD(26, 800, ET.ink, -0.8)}">${pct ? F.percent(cur, 2) : F.number(cur)}</span></div>
    </div>
    <div style="${TB(10, 500, ET.muted)}margin-top:2px">as of ${esc(vm.asOfLabel())}</div>
    ${EopData.perBranchLine(v, list.length, pct, vm.s.asOfKey)}
    <div class="sgrid">${targetBox}${eopBox}${mtdAvgBox}${ytdAvgBox}</div>
  </div>`;
}

/* 2.11 + Change 3: Single balance chart on drill page with EOP / MTD Avg / YTD Avg toggle */
function eopDrillChart(vm, list, rows, level, charts) {
  const metric = vm.s.metric, pct = EopData.isPct(metric);
  const v = EopData.agg(list, metric);
  const views = pct ? [EOP_GRAPH_VIEWS[0]] : EOP_GRAPH_VIEWS;
  const view = views[Math.max(0, Math.min(vm.s.graphChart, views.length - 1))];
  const xs = view.keys.map(k => ({ k, label: (EopData.colByKey(k) || {}).label || k }));
  const who = vm.s.path.length ? vm.s.path[vm.s.path.length - 1] : (vm.bookHead() || vm.pfLabel());
  const book = EOP_BOOK_MAP[metric] || { accent: ET.primary };
  const target = view.target && v.target > 0 ? v.target : null;
  const series = [{ name: who, color: book.accent, values: xs.map(c => v[c.k]) }];
  const ci = charts.push({ series, labels: xs.map(x => x.label), target, fillArea: true }) - 1;
  const statItem = (l, val, signed) => {
    const num = typeof val === 'number' && !isNaN(val);
    const tone = !num ? ET.muted : (signed ? F.delta(val) : ET.ink);
    const txt = !num ? '–' : (signed ? F.signed(val) : F.number(val));
    return `<div style="flex:1;min-width:0">
      <div class="el1" style="${TB(9, 700, ET.muted, 0.4)}">${esc(l)}</div><div style="height:3px"></div>
      <div class="el1" style="${TM(12, 900, tone)}">${txt}</div></div>`;
  };
  const statsHtml = view.id === 'eop'
    ? statItem('EOP', vm.lead(v), false) + statItem('MTD', v.mtd, true) + statItem('YTD', v.ytd, true) + (view.target ? statItem('TARGET', v.target, false) : '')
    : view.id === 'mtd'
      ? statItem('FTM AVG SEP', v.ftmSep, false) + statItem('FTM AVG OCT', v.ftmOct, false) + statItem('MTD AVG', v.mtdAvg, true)
      : statItem('SP AVG DEC-25', v.spDec, false) + statItem('SP AVG AUG-26', v.spAug, false) + statItem('YTD AVG SEP', v.ytdSep, false) + statItem('YTD AVG OCT', v.ytdOct, false);
  const subTxt = view.id === 'eop' ? 'closing balances through the year' : `${view.label} balances`;
  return `<div class="esurf" style="border-radius:20px;padding:13px">
    <div class="el1" style="${TB(10, 800, ET.muted, 0.5)}">${esc(EopData.groupLabel(metric))} — PKR MILLION</div>
    <div style="height:2px"></div>
    <div class="el1" style="${TB(13.5, 700, ET.ink)}">${esc(who)}</div>
    <div style="${TB(10.5, 500, ET.muted)}margin-top:2px">${F.count(rows.length)} ${esc(level.label)}${rows.length === 1 ? '' : 's'} · ${esc(subTxt)}</div>
    <div style="height:6px"></div>
    ${tabRow(views.map(x => x.label), views.indexOf(view), 'gchart')}
    <div style="display:flex;gap:6px;margin:6px 0 10px">${statsHtml}</div>
    <div class="trend" data-ci="${ci}" style="height:220px"></div>
    <div style="height:8px"></div>${chartLegend(series, target != null)}</div>`;
}

/* Change 2: Average per branch, month-wise strip (below RBH / RBH-SME list on drill page only) */
function eopAvgPerBranchStrip(vm, list) {
  const metric = vm.s.metric;
  if (!metric || EopData.isPct(metric)) return '';
  if (vm.s.pf === 'DS' || vm.s.pf === 'Diplo') return '';
  if (!list || !list.length) return '';
  const sc = vm.s.role.scope || {};
  if (sc.areaHead || sc.cm || sc.hm || sc.branch) return '';
  if (vm.s.path.length > 0) return '';

  const view = EOP_GRAPH_VIEWS[Math.max(0, Math.min(vm.s.graphChart, EOP_GRAPH_VIEWS.length - 1))];
  const v = EopData.agg(list, metric);
  const n = list.length;
  const book = EOP_BOOK_MAP[metric];
  const prodLbl = (book ? book.label : EopData.groupLabel(metric)).toUpperCase();

  const cells = view.keys.map((k, idx) => {
    const col = EopData.colByKey(k);
    const lbl = (col && col.label) || k;
    const raw = v[k];
    const avg = typeof raw === 'number' && !isNaN(raw) ? raw / n : null;
    const txt = avg === null ? '–' : F.number(avg);
    const isLast = idx === view.keys.length - 1;
    const neg = avg !== null && avg < 0 && txt !== '0';
    return `<div class="apb-cell">
      <div class="apb-lbl">${esc(lbl)}</div>
      <div class="apb-val${isLast ? ' cur' : ''}"${neg ? ` style="color:${ET.negative}"` : ''}>${txt}</div>
    </div>`;
  }).join('');

  return `<div data-slot="apb-strip" style="margin-top:4px">
    <div style="padding:0 2px;${TB(10, 800, ET.muted, 0.5, 14)}">AVERAGE PER BRANCH · ${esc(prodLbl)} · PKR Mn</div>
    <div style="padding:2px 2px 8px;${TB(10.5, 500, ET.muted, null, 14)}">${F.count(n)} ${n === 1 ? 'branch' : 'branches'} in view</div>
    <div class="apb-card"><div class="apb-strip">${cells}</div></div>
  </div>`;
}

/* 2.8 Entity board: collapsed accordions at book level (country & segment) AND below */
function eopEntityBoard(vm, list) {
  const metric = vm.s.metric, pct = EopData.isPct(metric);
  const accs = [];

  /* Top 10 branches */
  const nTop = Math.min(10, list.length);
  const top = list.slice().sort((a, b) => (vm.lead(b.m[metric]) || 0) - (vm.lead(a.m[metric]) || 0)).slice(0, nTop);
  const topTitle = !nTop ? 'Branches' : nTop === list.length ? (nTop === 1 ? 'The one branch' : `All ${F.count(nTop)} branches`) : `Top ${F.count(nTop)} branches`;
  accs.push({
    id: 'top', title: vm.s.pf === 'DS' ? `Top ${F.count(nTop)} RSMs` : topTitle,
    subtitle: `${EopData.groupLabel(metric)} · ${vm.asOfLabel()}`,
    leadValue: top.length ? (vm.lead(top[0].m[metric]) || 0) : 0,
    leadCaption: vm.s.pf === 'DS' ? 'Biggest RSM' : 'Biggest branch',
    footer: `${F.count(list.length)} ${vm.s.pf === 'DS' ? 'RSMs' : (list.length === 1 ? 'branch' : 'branches')} in view`,
    rows: top.map(b => ({ title: b.name, subtitle: `${b.code} · ${b.area}`, value: vm.lead(b.m[metric]) || 0, tip: vm.s.pf === 'DS' ? '' : EopData.whose(b.name) })),
  });

  /* Behind base */
  const behind = [];
  let shortTot = 0;
  list.forEach(b => {
    const v = b.m[metric]; if (!v) return;
    const gap = (vm.lead(v) || 0) - (v.dec25 || 0);
    if (gap < 0) { behind.push([b, gap]); shortTot += gap; }
  });
  behind.sort((a, b) => a[1] - b[1]);
  accs.push({
    id: 'behind', title: 'Behind base',
    subtitle: `${F.count(behind.length)} of ${F.count(list.length)} ${vm.s.pf === 'DS' ? 'RSMs' : 'branches'} below their 31-Dec base`,
    leadValue: shortTot, leadCaption: 'Total shortfall', negTone: true,
    footer: 'Worked out from this book',
    rows: behind.slice(0, 6).map(([b, gap]) => ({ title: b.name, subtitle: `${b.code} · ${b.area}`, value: gap, negTone: true, tip: vm.s.pf === 'DS' ? '' : EopData.whose(b.name) })),
  });

  if (vm.s.pf !== 'DS') {
    /* NTB accounts */
    const ix = EopData.ntbIndex(), t = { day: 0, mtd: 0, ytd: 0, tmtd: 0, tytd: 0, vytd: 0 };
    let found = 0;
    list.forEach(b => { const v = ix[String(b.code)]; if (!v) return; found++; for (const k in t) t[k] += v[k]; });
    if (found) {
      const ach = t.tytd ? (t.ytd / t.tytd) * 100 : 0;
      const ntbDate = WEB_DATA.ntb_sc && WEB_DATA.ntb_sc.as_of ? dayShortLbl(parseIso(WEB_DATA.ntb_sc.as_of)) : '';
      accs.push({
        id: 'ntb', title: 'NTB accounts', subtitle: `New accounts as of ${ntbDate}`,
        leadValue: t.ytd, leadCaption: 'Opened YTD', leadIsCount: true,
        footer: `NTB Performance › SC sheet · ${F.count(found)} of ${F.count(list.length)} branches in view`,
        rows: [
          { title: 'Accounts opened today', value: t.day, isCount: true },
          { title: 'Opened MTD', value: t.mtd, isCount: true },
          { title: 'Opened YTD', value: t.ytd, isCount: true },
          { title: 'Target YTD', subtitle: ach ? `${F.percent(ach)} of target` : '', value: t.tytd, isCount: true },
          { title: 'Variance YTD', subtitle: 'from the sheet', value: t.vytd, isCount: true, negTone: true },
        ],
      });
    }
    /* CA portfolio & SA portfolio (2.8 — NOT the 2.9 role table!) */
    const addCasa = (id, roleKey, title, what) => {
      const c = EopData.casaBlock(vm.s.pf, list);
      if (!c) return;
      const hit = (c.block.rows || []).find(r => r.role === roleKey);
      if (!hit || !hit.total) return;
      const share = (hit.ntb / hit.total) * 100;
      const band = c.block.ytdBand || 'YTD';
      accs.push({
        id, title, subtitle: `CASA Portfolio Summary · ${c.block.block}`,
        leadValue: hit.total, leadCaption: `Total ${what}`,
        footer: `CASA Portfolio Summary ${c.asOf} · PKR Mn${c.whole ? ' · whole book' : ''}`,
        rows: [
          { title: 'Existing customers', subtitle: 'ETB', value: hit.etb },
          { title: 'Brought in this year', subtitle: `NTB · ${F.percent(share)} of the book`, value: hit.ntb },
          { title: `Total ${what}`, subtitle: 'EOP balance', value: hit.total },
          { title: `${band} ETB`, value: hit.ytdEtb, negTone: true },
          { title: `${band} NTB`, value: hit.ytdNtb, negTone: true },
        ],
      });
    };
    addCasa('casa_ca', 'Total CA', 'CA portfolio', 'CA');
    addCasa('casa_sa', 'SA', 'SA portfolio', 'saving');
  }

  return accs.map(a => accordionCard(a, vm.s.openAccordions.has(a.id)) + `<div style="height:10px"></div>`).join('');
}

/* 2.4 + 2.10 + 2.11 Compact RBH / Entity card with Per branch (on RBH), growth %, info tip (on SC), details eye, tap-to-open */
function eopEntityCard(vm, item, level) {
  const pct = EopData.isPct(vm.s.metric), v = item.m;
  const isRbh = level.k === 'rbh' || level.k === 'rbhSme' || level.k === 'rbhAny';
  const isSc = level.k === 'sc';
  const curLbl = vm.asOfLabel();
  const stat = (label, key, signed) => {
    const val = key === 'cur' ? vm.lead(v) : v[key];
    const tone = signed && typeof val === 'number' ? F.delta(val) : ET.ink;
    const txt = pct ? F.percent(val, 2) : (signed ? F.signed(val) : F.number(val));
    return `<div style="min-width:0">
      <div class="el1" style="${TB(9.5, 700, ET.sortLabel, 0.3)}">${esc(label.toUpperCase())}</div>
      <div style="height:4px"></div>
      <div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:1px">
        <span style="${TM(12.5, 700, tone)}">${txt}</span>${signed ? EopData.growthPipe(v, key, pct) : ''}
      </div></div>`;
  };
  const tip = isSc ? EopData.whose(item.label) : '';
  return `<div class="esurf ${item.deeper ? 'tap' : ''}" ${item.deeper ? `data-act="open" data-id="${esc(item.id)}"` : ''} style="border-radius:20px;padding:14px">
    <div style="display:flex;align-items:center">
      <div style="flex:1;min-width:0">
        <div class="el2" style="${TB(14, 700, ET.ink)}">${esc(item.label)}</div>
        <div class="el2" style="margin-top:2px;${TB(11.5, 500, ET.muted)}">${esc(item.sub)}${!isSc ? ` · ${F.count(item.n)} ${vm.s.pf === 'DS' ? 'RSM' : (item.n === 1 ? 'branch' : 'branches')}` : ''}</div>
      </div>
      ${tip ? infoBtn(item.label, tip) : ''}
      <span style="width:6px"></span>
      <div class="pillbtn" title="Details" data-act="details" data-id="${esc(item.id)}" style="background:#fff;border:1px solid ${ET.eyeBorder}">${I('visibility', 'o', 18, ET.muted)}</div>
      ${item.deeper ? `<span style="width:7px"></span><div class="pillbtn" title="Open" data-act="open" data-id="${esc(item.id)}" style="background:rgba(4,120,87,.078);border:1px solid rgba(4,120,87,.22)">${I('chevron_right', 'r', 18, ET.primary)}</div>` : ''}
    </div>
    ${isRbh ? EopData.perBranchLine(v, item.n, pct, vm.s.asOfKey) : ''}
    <div style="height:12px"></div>
    <div style="height:1px;background:repeating-linear-gradient(90deg,${ET.dashed} 0 4px,transparent 4px 7px)"></div>
    <div style="height:12px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px">
      ${stat(curLbl, 'cur', false)}${stat('Target', 'target', false)}
      ${stat('ODC', 'odc', true)}${stat('MTD', 'mtd', true)}
      ${stat('YTD', 'ytd', true)}${stat('Tgt Var', 'variance', true)}
    </div>
  </div>`;
}

/* 2.11 Back button + sideways-scrolling breadcrumb in one bar */
function eopCrumbBar(vm) {
  const lv = vm.levels();
  const sep = `<span class="sep">›</span>`;
  const parts = [
    `<button type="button" data-act="home">EOP Report</button>`,
    sep,
    `<button type="button" data-act="crumb" data-i="-1">${esc(vm.pfLabel())}</button>`,
    sep,
    vm.s.path.length
      ? `<button type="button" data-act="crumb" data-i="-1">${esc(EopData.groupLabel(vm.s.metric))}</button>`
      : `<span class="cur">${esc(EopData.groupLabel(vm.s.metric))}</span>`,
  ];
  vm.s.path.forEach((name, i) => {
    parts.push(sep);
    const isLast = i === vm.s.path.length - 1;
    parts.push(isLast
      ? `<span class="cur">${esc(name)}</span>`
      : `<button type="button" data-act="crumb" data-i="${i}">${esc(name)}</button>`);
    if (lv[i]) parts.push(`<span style="${TB(10, 500, ET.muted)}flex:none">(${esc(lv[i].label)})</span>`);
  });
  return `<div class="crumbbar">
    <button type="button" class="crumb-back" data-act="crumbback" aria-label="Back">${I('chevron_left', 'r', 22, ET.ink)}</button>
    <div class="crumbs">${parts.join('')}</div>
  </div>`;
}

/* ---------------- EopReportScreen ---------------- */
Routes['/eop-report'] = () => {
  const el = h(`<div style="background:${ET.background}">${appBar('EOP Deposit Performance', { back: true })}
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;background:${ET.background}">
      <div data-slot="fbar"></div>
      <div data-slot="tabs"></div>
      <div data-slot="body" class="scroll" style="flex:1;min-height:0;position:relative"></div>
    </div></div>`);
  const slots = { fbar: el.querySelector('[data-slot=fbar]'), tabs: el.querySelector('[data-slot=tabs]'), body: el.querySelector('[data-slot=body]') };
  let lastKey = null, filterSheet = null, curRows = [];
  const vm = new EopVM(() => { render(); filterSheet && filterSheet.render(); });

  function pillText(scope) {
    const s = vm.s, parts = [];
    if (s.pf === 'All') parts.push('All');
    else {
      const head = s.role.id === 'ge' ? vm.bookHead() : s.role.person;
      if (head) parts.push(head);
      parts.push(vm.pfLabel());
    }
    if (s.stream && s.pf !== 'DS') parts.push(vm.streamLabel());
    parts.push(...s.path);
    if (!(s.pf === 'All' && scope === 'All books')) parts.push(scope);
    parts.push(`as of ${vm.asOfLabel()}`);
    return parts.join(' · ');
  }

  function homeHtml(charts) {
    const list = vm.pathBranches(0, []);
    let o = vm.s.refreshing ? `<div style="padding-bottom:10px">${linear(4)}</div>` : '';
    o += contextPill(pillText('All books'));
    if (!list.length) return o + messageView(`No branches in ${vm.pfLabel()} for ${vm.s.role.person}${vm.s.stream ? ` (${vm.streamLabel()})` : ''}.`, 'Reset filters', 'reset');
    o += `<div style="height:14px"></div>${eopHeroCard(vm, list)}`;
    o += eopChildEntry(vm);
    o += `<div style="height:12px"></div>${eopHomeChart(vm, list, charts)}<div style="height:12px"></div>`;
    EOP_BOOKS.forEach(b => { o += eopBookCard(vm, b, EopData.agg(list, b.id)) + `<div style="height:12px"></div>`; });
    return o;
  }

  function drillHtml(charts) {
    const list = vm.pathBranches();
    const rows = vm.rowsHere();
    curRows = rows;
    const level = rows.level;
    let o = vm.s.refreshing ? `<div style="padding-bottom:10px">${linear(4)}</div>` : '';
    o += contextPill(pillText(EopData.groupLabel(vm.s.metric)));
    if (!list.length) return o + messageView('Nothing at this level for this selection.', 'Reset filters', 'reset');
    o += `<div style="height:14px"></div>${eopTotalsStrip(vm, list)}`;
    o += `<div style="height:12px"></div>${eopDrillChart(vm, list, rows, level, charts)}`;
    /* 2.8 Entity board at book level (country & segment) AND below */
    o += `<div style="height:12px"></div>${eopEntityBoard(vm, list)}`;
    /* Listing with 2.11 per-level CA headings & 2.1 columns */
    const sortCols = [{ k: 'n', label: vm.s.pf === 'DS' ? 'RSMs' : 'Branches' }, ...EOP_SHEET_COLS.map(EopData.colByKey).filter(Boolean)];
    const curSort = sortCols.find(c => c.k === vm.s.sortCol) || sortCols[1];
    o += `<div style="height:4px"></div>` + sectionHeading(`${EopData.levelGroupLabel(vm.s.metric, level)} · BY ${level.label.toUpperCase()}`, `${F.count(rows.length)} rows`);
    o += `<div style="height:10px"></div>` + sortBar(curSort.label, vm.s.sortDesc) + `<div style="height:12px"></div>`;
    rows.forEach(it => { o += eopEntityCard(vm, it, level) + `<div style="height:12px"></div>`; });
    o += eopAvgPerBranchStrip(vm, list);
    return o;
  }

  function render() {
    const s = vm.s;
    const isChild = s.view !== 'eop';
    const titleEl = el.querySelector('.appbar .title');
    const CHILD_TITLES = { move: 'RBH YTD Movement', flows: 'Inflow / Outflow', wow: 'Week on Week', base: 'Behind Base' };
    if (titleEl) titleEl.textContent = CHILD_TITLES[s.view] || 'EOP Deposit Performance';
    /* Header bar: Filters + compact As-of pill (1.5) when on EOP; hidden on child reports */
    if (!isChild) {
      const count = vm.activeFilterCount();
      slots.fbar.innerHTML = `<div style="padding:12px 16px 0;display:flex;align-items:center;gap:8px">
        <div data-act="filters" style="flex:1;min-width:0;height:40px;padding:0 12px;background:#fff;border-radius:14px;border:1px solid ${ET.pillBorder};display:flex;align-items:center;cursor:pointer">
          ${I('tune', 'r', 18, ET.primary)}<span style="width:8px"></span><span style="${TB(13, 800, ET.ink)}">Filters</span>
          ${count > 0 ? `<span style="width:7px"></span><span style="min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:${ET.primary};display:flex;align-items:center;justify-content:center;${TB(10, 800, '#fff')}">${count}</span>` : ''}
          <span class="grow"></span>${I('keyboard_arrow_down', 'r', 20, ET.muted)}
        </div>
        <div class="asof-pill" data-act="asof" title="Change As-of date">
          ${I('calendar_today', 'o', 14, ET.primary)}
          <span style="${TM(11.5, 700, ET.ink)}">${esc(vm.asOfLabel())}</span>
        </div>
      </div>`;
    } else {
      slots.fbar.innerHTML = '';
    }

    if (!isChild && !s.metric) {
      const pfs = vm.openPortfolios();
      if (pfs.length > 1) {
        const prev = slots.tabs.querySelector('.eop-tabs'), sl = prev ? prev.scrollLeft : 0;
        slots.tabs.innerHTML = `<div style="height:10px"></div><div class="eop-tabs hscroll">${pfs.map(p => {
          const on = p.id === s.pf;
          return `<div class="eop-pill-tab" data-act="pf" data-id="${p.id}" style="background:${on ? ET.primary : '#fff'};border-color:${on ? ET.primary : ET.pillBorder};${TB(13, 700, on ? '#fff' : ET.ink)}">${esc(p.label)}</div>`;
        }).join('')}</div>`;
        slots.tabs.querySelector('.eop-tabs').scrollLeft = sl;
      } else slots.tabs.innerHTML = '';
    } else {
      slots.tabs.innerHTML = '';
    }

    const body = slots.body;
    if (!s.loaded) { lastKey = null; body.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${spinner(36, 4, ET.primary)}</div>`; return; }

    const key = `${s.role.id}|${s.view}|${s.childSeg}|${s.pf}|${s.stream}|${s.asOfKey}|${s.metric}|${s.path.join('>')}|${s.mvHead}|${s.mvAh}|${s.mvCluster}|${s.flHead}|${s.flPeriod}|${s.wowHead}|${s.wowAh}|${s.wowCluster}|${s.bbHead}|${s.bbAh}|${s.bbCm}`;
    const charts = [];
    const inner = isChild ? renderEopChild(vm) : (s.metric ? drillHtml(charts) : homeHtml(charts));
    const keepScroll = key === lastKey ? body.scrollTop : 0;
    body.innerHTML = `<div style="padding:12px 16px 32px">${inner}</div>`;
    body.scrollTop = keepScroll; lastKey = key;
    $$('.trend', body).forEach(t => { t.innerHTML = trendSvg(t.clientWidth || 354, charts[+t.dataset.ci]); });
    $$('.fit', body).forEach(f => { const c = f.firstElementChild; if (!c) return; c.style.transform = ''; const r = f.clientWidth / c.scrollWidth; if (r < 1) c.style.transform = `scale(${r})`; });
  }

  async function pickAsOf() {
    const dated = vm.D.dated;
    const picked = await datePicker({ initial: vm.displayAsOfDate(), first: dated[0].d, last: dated[dated.length - 1].d });
    if (picked) vm.setAsOfDate(picked);
  }

  /* 1.5 Filters sheet order: Portfolio -> As of -> Stream -> level selects + Reset & Done */
  function openFilterSheet() {
    const content = h(`<div style="display:flex;flex-direction:column;min-height:0;max-height:inherit"></div>`);
    let groups = [];
    const renderSheet = () => {
      const s = vm.s, prev = content.querySelector('.fs-list'), st = prev ? prev.scrollTop : 0;
      groups = [];
      if (s.metric) {
        const lv = vm.levels();
        for (let i = 0; i <= s.path.length && i < lv.length; i++) {
          const opts = vm.choicesAt(i);
          if (opts.length) groups.push({ i, label: lv[i].label, allLabel: `All ${lv[i].label}s`, selected: s.path[i] || '', options: opts });
        }
      }
      const pfs = vm.openPortfolios();
      const locked = pfs.length <= 1;
      const col = vm.asOfCol();
      const chosenIso = s.asOfDate || (col && col.date) || '';
      const exact = !s.asOfDate || chosenIso === (col && col.date);
      const asOfText = F.date(vm.displayAsOfDate(), true) + (exact ? '' : ` (showing ${vm.asOfLabel()})`);
      const label = t => `<div style="padding-bottom:8px;${TB(10, 800, ET.muted, 0.6)}">${esc(t.toUpperCase())}</div>`;
      const field = (text, icon, act, extra = '', disabled = false) => `<div class="eop-dd" ${disabled ? '' : `data-act="${act}"`} ${extra} style="${disabled ? 'opacity:.6;cursor:default' : ''}"><span class="el1 grow" style="${TB(14, 600, ET.ink)}">${esc(text)}</span>${I(icon[0], icon[1], 20, ET.muted)}</div>`;
      content.innerHTML = `
        <div style="padding:18px 18px 14px;display:flex;align-items:center;flex:none"><span class="grow" style="${TD(18, 800, ET.ink)}">Filters</span>
          <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer">${I('close', 'r', 16, ET.ink)}</div></div>
        <div style="height:1px;background:${ET.grid};flex:none"></div>
        ${s.refreshing ? `<div style="flex:none">${linear(2)}</div>` : ''}
        <div class="fs-list scroll" style="flex:1 1 auto;min-height:0;padding:16px 18px 10px">
          ${label('Portfolio')}${field(vm.pfLabel() + (locked ? ' (fixed by login)' : ''), ['keyboard_arrow_down', 'r'], 'fs_pf', '', locked)}
          <div style="height:16px"></div>
          ${label('As of')}${field(asOfText, ['calendar_today', 'o'], 'fs_date')}
          ${s.pf !== 'DS' ? `<div style="height:16px"></div>${label('Stream')}${field(vm.streamLabel(), ['keyboard_arrow_down', 'r'], 'fs_stream')}` : ''}
          ${groups.map((g, gi) => `<div style="height:16px"></div>${label(g.label)}${field(g.selected || g.allLabel, ['keyboard_arrow_down', 'r'], 'fs_group', `data-gi="${gi}"`)}`).join('')}
        </div>
        <div style="padding:12px 18px 16px;display:flex;gap:10px;flex:none">
          <div data-act="reset" style="flex:1;height:46px;border-radius:14px;background:${ET.tile};border:1px solid ${ET.track};display:flex;align-items:center;justify-content:center;cursor:pointer;${TB(14, 700, ET.text2)}">Reset</div>
          <div data-act="done" style="flex:2;height:46px;border-radius:14px;background:${ET.primary};display:flex;align-items:center;justify-content:center;cursor:pointer;${TB(14, 700, '#fff')}">Done</div>
        </div>`;
      content.querySelector('.fs-list').scrollTop = st;
    };
    const sheet = openSheet(content, { onDismiss: () => (filterSheet = null) });
    filterSheet = { render: renderSheet };
    renderSheet();
    content.addEventListener('click', async e => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      const act = t.dataset.act;
      const opt = (val, text, sel) => ({ value: val, html: `<span class="el1" style="${TB(14, sel ? 800 : 600, sel ? ET.primary : ET.text2)}">${esc(text)}</span>` });
      if (act === 'close' || act === 'done') { filterSheet = null; sheet.close(); }
      if (act === 'reset') { vm.resetFilters(); filterSheet = null; sheet.close(); }
      if (act === 'fs_pf') {
        const v = await openMenu(t, vm.openPortfolios().map(p => opt(p.id, p.label, p.id === vm.s.pf)), { width: appW() - 36 });
        if (v !== undefined) vm.selectPortfolio(v);
      }
      if (act === 'fs_date') { await pickAsOf(); }
      if (act === 'fs_stream') {
        const v = await openMenu(t, EOP_STREAMS.map(x => opt(x.id, x.label, x.id === vm.s.stream)), { width: appW() - 36 });
        if (v !== undefined) vm.selectStream(v);
      }
      if (act === 'fs_group') {
        const g = groups[+t.dataset.gi]; if (!g) return;
        const v = await openMenu(t, [opt('', g.allLabel, !g.selected), ...g.options.map(o => opt(o, o, g.selected === o))], { width: appW() - 36 });
        if (v !== undefined) vm.selectLevelFilter(g.i, v);
      }
    });
  }

  function showRowDetails(it) {
    const pct = EopData.isPct(vm.s.metric);
    const items = [
      { name: vm.s.pf === 'DS' ? 'RSMs' : 'Branches', value: it.n, type: 'count' },
      ...EOP_SHEET_COLS.map(EopData.colByKey).filter(Boolean).map(c => ({
        name: c.label,
        value: it.m[c.k],
        type: pct ? 'percent' : 'amount',
        signed: c.signed,
        gp: c.signed ? EopData.growthPipe(it.m, c.k, pct) : '',
      })),
    ];
    eopDetailSheet(it.sub ? `${it.label} · ${it.sub}` : it.label, items);
  }

  el.addEventListener('click', async e => {
    const t = e.target.closest('[data-act]'); if (!t || !el.contains(t)) return;
    const act = t.dataset.act, id = t.dataset.id;
    if (act === 'tip') { e.stopPropagation(); showTipSheet(t.dataset.title, t.dataset.tip); return; }
    if (vm.s.view !== 'eop' && handleEopChildClick(vm, t)) return;
    switch (act) {
      case 'filters': openFilterSheet(); break;
      case 'asof': pickAsOf(); break;
      case 'pf': vm.selectPortfolio(id); break;
      case 'reset': vm.resetFilters(); break;
      case 'hero': vm.selectProduct('TOTAL DEPOSITS'); break;
      case 'acct': vm.selectProduct(id); break;
      case 'child': vm.openChildReport(id); break;
      case 'gtab': vm.set({ graphTab: +t.dataset.i }); break;
      case 'gchart': vm.set({ graphChart: +t.dataset.i }); break;
      case 'home': vm.set({ metric: null, path: [], openAccordions: new Set() }); break;
      case 'crumb': vm.goToCrumb(+t.dataset.i); break;
      case 'crumbback': vm.handleBack(); break;
      case 'acc': {
        vm.toggleAccordion(id, true);
        const open = vm.s.openAccordions.has(id);
        t.classList.toggle('open', open);
        t.querySelector('.acc-arrow').innerHTML = I(open ? 'keyboard_arrow_up' : 'keyboard_arrow_down', 'r', 20, ET.muted);
        break;
      }
      case 'sortfield': {
        const cols = [{ k: 'n', label: vm.s.pf === 'DS' ? 'RSMs' : 'Branches' }, ...EOP_SHEET_COLS.map(EopData.colByKey).filter(Boolean)];
        const v = await openMenu(t, cols.map(c => ({ value: c.k, html: `<span style="${TB(13, c.k === vm.s.sortCol ? 800 : 600, c.k === vm.s.sortCol ? ET.primary : ET.text2)}">${esc(c.label)}</span>` })));
        if (v !== undefined) vm.set({ sortCol: v });
        break;
      }
      case 'sortdir': vm.set({ sortDesc: !vm.s.sortDesc }); break;
      case 'open': vm.openChild(id); break;
      case 'details': { e.stopPropagation(); const it = curRows.find(r => r.id === id); if (it) showRowDetails(it); break; }
    }
  });

  const back = () => { if (vm.handleBack()) return; vm.disposed = true; Nav.go('/home'); };
  el.querySelector('[data-a=back]').onclick = back;
  render();
  vm.loadData();
  return { el, light: true, bg: ET.background, onBack: back, vm, openFilterSheet, showRowDetails, destroy() { vm.disposed = true; } };
};

