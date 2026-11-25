/* =====================================================================
   NTB Performance — updated per implementation scope (4.1–4.7 + 0.1–1.5)
   ===================================================================== */

const NTB_COLS = [
  { k: 'day', label: 'Opened Today', strong: 1 },
  { k: 'mtd', label: 'Opened MTD' },
  { k: 'ytd', label: 'Opened YTD', major: 1 },
  { k: 'pyYtd', label: 'Prior Yr YTD' },
  { k: 'yoyVar', label: 'YoY Var', signed: 1 },
  { k: 'fmtd', label: 'Funded MTD' },
  { k: 'fytd', label: 'Funded YTD' },
  { k: 'pyFytd', label: 'Prior Yr Funded' },
  { k: 'fyoyVar', label: 'Funded YoY', signed: 1 },
  { k: 'tmtd', label: 'Target MTD' },
  { k: 'tytd', label: 'Target YTD', major: 1 },
  { k: 'vmtd', label: 'Var MTD', signed: 1 },
  { k: 'vytd', label: 'Var YTD', signed: 1 },
];
const NTB_ROLES = ['Total', 'AH', 'CM', 'RM', 'SRM', 'BM', 'HM', 'SBBM', 'BBM', 'BSM', 'RO', 'Un-Assigned'];
const NTB_TARGET_IX = {
  Total: [0], AH: [1], CM: [2], RM: [3, 4], SRM: [5, 6], BM: [7, 8],
  HM: [9], SBBM: [10], BBM: [11], BSM: [12], RO: [13], 'Un-Assigned': [],
};
const NTB_VAR_OFFSET = 15;
const NTB_FUNDED_BASE = 13;
const NTB_FUNDED_DAY_IX = {
  Total: [0], AH: [1], CM: [2], RM: [3], SRM: [4], BM: [5], HM: [6],
  SBBM: [], BBM: [7], BSM: [8], RO: [9], 'Un-Assigned': [10],
};

/* 4.1 Top cards: 5 measure cards (Opened Today/MTD/YTD, Target YTD, Funded YTD) + YoY Variance headline card */
const NTB_CARDS = [
  { id: 'day', label: 'Opened Today', sub: 'For the day', accent: '#059669', icon: ['account_balance_wallet', 'o'], on: 'opened' },
  { id: 'mtd', label: 'Opened MTD', sub: 'For the month', accent: '#3867D6', icon: ['bar_chart', 'r'], on: 'opened' },
  { id: 'ytd', label: 'Opened YTD', sub: 'Year to date', accent: '#C98A04', icon: ['apartment', 'r'], on: 'opened' },
  { id: 'tytd', label: 'Target YTD', sub: 'Assigned', accent: '#7C4DDB', icon: ['event_note', 'o'], on: 'opened' },
  { id: 'fytd', label: 'Funded YTD', sub: 'Year to date', accent: '#0D9488', icon: ['payments', 'o'], on: 'funded' },
];
const NTB_MEASURE = {
  opened: { label: 'Accounts Opened', lead: 'ytd', accent: '#047857' },
  funded: { label: 'Accounts Funded', lead: 'fytd', accent: '#0D9488' },
  yoy: { label: 'YoY Variance', lead: 'yoyVar', accent: '#0284C7' },
};
const NTB_PF = [
  { id: 'All', label: 'All' },
  { id: 'Retail', label: 'Retail' },
  { id: 'SME', label: 'SME' },
  { id: 'DS', label: 'Direct Sales' },
];
const NTB_HEADS = { Retail: 'Faheem Elahi', SME: 'Aamir Hameed Piracha' };

/* 0.1 Hierarchies never mix: SME = RBH-SME -> Hub Manager -> Service Center (NO Area Head!) */
const NTB_LEVELS = {
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
  DS: [
    { k: 'rsm', label: 'RSM', field: 'rsm', scope: 'rsmSelf' },
    { k: 'ro', label: 'Relationship Officer', field: 'name', scope: 'roSelf' },
  ],
  All: [{ k: 'rbhAny', label: 'RBH', scope: 'rbhAny', val: b => (b.segment === 'SME' ? b.rbhSme : b.rbh) }],
};
const NTB_ALL_TAIL = {
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

/* 4.4 Role drill targets */
const NTB_ROLE_LEVEL = {
  AH: 'ah', CM: 'cm', HM: 'hm',
  BM: 'sc', SRM: 'sc', RM: 'sc', BSM: 'sc', BBM: 'sc', SBBM: 'sc', RO: 'sc', 'Un-Assigned': 'sc',
};
const NTB_ROLE_LABEL = {
  Branch: 'Branch Roles', Total: 'All Roles', AH: 'Area Head', CM: 'Cluster Manager', RM: 'RM', SRM: 'SRM',
  BM: 'Branch Manager', HM: 'Hub Manager', SBBM: 'SBBM', BBM: 'BBM', BSM: 'BSM', RO: 'Relationship Officer',
  'Un-Assigned': 'Un-Assigned', RBHs: 'All RBHs', TOTAL: 'Total',
};
const NTB_SERIES = ['#047857', '#1D4ED8', '#C98A04', '#7C4DDB', '#0E7490', '#C2410C', '#4338CA', '#0D9488'];
const N = v => (typeof v === 'number' ? F.count(v) : '–');
const P = v => (typeof v === 'number' ? F.percent(v) : '–');
function ntbRoleKey(name) { if (/^RBHs$/i.test(name)) return 'Branch'; if (/^TOTAL$/i.test(name)) return 'Total'; return name; }

/* ---------------- data (port of ntb-report_2.js build() + deterministic prior-year dummy baseline for YoY) ---------------- */
const NtbData = (() => {
  let built = null;
  const num = (a, i) => (a && typeof a[i] === 'number' ? a[i] : 0);
  const sumAt = (a, list, off = 0) => { let t = 0; for (let i = 0; i < list.length; i++) t += num(a, list[i] + off); return t; };
  const achieve = (done, target) => (target ? (done / target) * 100 : 0);
  const pctChange = (cur, py) => (py > 0 ? ((cur - py) / py) * 100 : null);
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  function ntbRand(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => {
      h = (h + 0x6D2B79F5) | 0;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function attachYoY(m, pyYtd, pyFytd) {
    m.pyYtd = pyYtd;
    m.yoyVar = m.ytd - pyYtd;
    m.yoyPct = pctChange(m.ytd, pyYtd);
    m.pyFytd = pyFytd;
    m.fyoyVar = m.fytd - pyFytd;
    m.fyoyPct = pctChange(m.fytd, pyFytd);
    return m;
  }

  function build() {
    const HM_HUBS = {}, HUB_HM = {}, STREAM_OF = {};
    const escSc = WEB_DATA.eop_sc;
    if (escSc) {
      const eix = {};
      escSc.id_columns.forEach((c, i) => { if (!(c in eix)) eix[c] = i; });
      escSc.rows.forEach(r => {
        const hm = r.ids[eix['HUB Manager']], hkey = r.ids[eix['HUB_BR_KEY']];
        if (hm && hkey) {
          if (!HM_HUBS[hm]) HM_HUBS[hm] = {};
          HM_HUBS[hm][String(hkey)] = 1;
          HUB_HM[String(hkey)] = hm;
        }
        const bk = r.ids[eix['BR_KEY']], tp = r.ids[eix['TYPE']];
        if (bk && tp) STREAM_OF[String(bk)] = tp;
      });
    }

    const sc = WEB_DATA.ntb_sc, ix = {};
    sc.id_columns.forEach((c, i) => { if (!(c in ix)) ix[c] = i; });
    const g = (r, c) => (c in ix ? r.ids[ix[c]] : null);
    const rbhFactorCache = {};
    const headFactor = (seg, head) => {
      const k = `${seg}|${head}`;
      if (rbhFactorCache[k] == null) rbhFactorCache[k] = 0.80 + ntbRand(`ntb-yoy-head|${k}`)() * 0.28;
      return rbhFactorCache[k];
    };

    const branches = sc.rows.filter(r => !!g(r, 'SC Code')).map(r => {
      const code = String(g(r, 'SC Code'));
      const hubCode = String(g(r, 'HUB_BR_KEY') || '');
      const b = {
        code,
        name: g(r, 'SC Name') || ('Branch ' + code),
        cmCode: g(r, 'CM_BR') || '',
        cmBranch: g(r, 'CM_BR_Name') || '',
        cm: g(r, 'CM_Name') || 'Vacant',
        hubCode,
        hub: g(r, 'HUB_BR') || 'Unassigned hub',
        hm: HUB_HM[hubCode] || 'Vacant',
        stream: STREAM_OF[code] || '',
        segment: g(r, 'Segment') || 'Retail',
        area: g(r, 'AREA') || 'Unassigned Area',
        ah: g(r, 'AH_Name') || 'Vacant',
        rbh: g(r, 'RBH_Name') || 'Vacant',
        region: g(r, 'Main Region Name') || '',
        rbhSme: g(r, 'RBH SME') || 'Vacant',
        smeRegion: g(r, 'SME-Region') || '',
        m: {},
      };
      const p = r.periods || {};
      const day = p['For the Day'] || [], mtd = p['For The Month'] || [], ytd = p['Year to Date'] || [], tm = p['Target - MTD'] || [], ty = p['Target - YTD'] || [];
      const pyArr = p['Prior Year YTD'] || null;
      const head = b.segment === 'SME' ? b.rbhSme : b.rbh;
      const brRnd = ntbRand(`ntb-yoy-br|${b.segment}|${code}`);
      const brFactor = clamp(headFactor(b.segment, head) + (brRnd() - 0.5) * 0.24, 0.70, 1.24);
      let totPyYtd = 0, totPyFytd = 0;

      NTB_ROLES.forEach((name, i) => {
        const tix = NTB_TARGET_IX[name] || [], fix = NTB_FUNDED_DAY_IX[name] || [];
        const m = {
          day: num(day, i), mtd: num(mtd, i), ytd: num(ytd, i),
          fday: sumAt(day, fix, NTB_FUNDED_BASE),
          fmtd: sumAt(mtd, tix, NTB_FUNDED_BASE),
          fytd: sumAt(ytd, tix, NTB_FUNDED_BASE),
          tmtd: sumAt(tm, tix, 0), tytd: sumAt(ty, tix, 0),
          vmtd: sumAt(tm, tix, NTB_VAR_OFFSET), vytd: sumAt(ty, tix, NTB_VAR_OFFSET),
        };
        m.amtd = achieve(m.fmtd, m.tmtd);
        m.aytd = achieve(m.fytd, m.tytd);
        if (name !== 'Total') {
          let pyYtd, pyFytd;
          if (pyArr) {
            pyYtd = num(pyArr, i);
            pyFytd = sumAt(pyArr, tix, NTB_FUNDED_BASE);
          } else {
            const rr = ntbRand(`ntb-yoy-rl|${code}|${name}`);
            const rf = clamp(brFactor + (rr() - 0.5) * 0.12, 0.68, 1.28);
            const ff = clamp(rf + (rr() - 0.5) * 0.08, 0.68, 1.30);
            pyYtd = m.ytd > 0 ? Math.max(1, Math.round(m.ytd * rf)) : 0;
            pyFytd = m.fytd > 0 ? Math.max(1, Math.round(m.fytd * ff)) : 0;
          }
          attachYoY(m, pyYtd, pyFytd);
          totPyYtd += pyYtd;
          totPyFytd += pyFytd;
        }
        b.m[name] = m;
      });
      attachYoY(b.m.Total, totPyYtd, totPyFytd);

      const t = b.m.Total, ro = b.m.RO;
      const br = {
        day: t.day - ro.day, mtd: t.mtd - ro.mtd, ytd: t.ytd - ro.ytd,
        fday: t.fday - ro.fday, fmtd: t.fmtd - ro.fmtd, fytd: t.fytd - ro.fytd,
        tmtd: t.tmtd - ro.tmtd, tytd: t.tytd - ro.tytd,
        vmtd: t.vmtd - ro.vmtd, vytd: t.vytd - ro.vytd,
      };
      br.amtd = achieve(br.fmtd, br.tmtd);
      br.aytd = achieve(br.fytd, br.tytd);
      attachYoY(br, t.pyYtd - ro.pyYtd, t.pyFytd - ro.pyFytd);
      b.m.Branch = br;
      return b;
    });

    const src = WEB_DATA.ntb_ros, ii = {}, vi = {};
    src.id_columns.forEach((c, i) => { if (!(c in ii)) ii[c] = i; });
    src.columns.forEach((c, i) => { if (!(c in vi)) vi[c] = i; });
    const RO_COL = {
      day: 'For the Day Opened', mtd: 'For The Month Opened', ytd: 'Year to Date Opened',
      fday: 'For the Day Funded', fmtd: 'For The Month Funded', fytd: 'Year to Date Funded',
      tmtd: 'Target - MTD Funded', tytd: 'Target - YTD Funded',
      vmtd: 'Target - MTD Variance', vytd: 'Target - YTD Variance',
    };
    const ros = src.rows.filter(r => !!r.ids[ii['EMP _ Name']]).map(r => {
      const m = {};
      Object.keys(RO_COL).forEach(k => {
        const v = r.values[vi[RO_COL[k]]];
        m[k] = typeof v === 'number' ? v : 0;
      });
      m.amtd = achieve(m.fmtd, m.tmtd);
      m.aytd = achieve(m.fytd, m.tytd);
      const code = r.ids[ii['CRO Code']] || '';
      const name = r.ids[ii['EMP _ Name']];
      const rsm = r.ids[ii['RSM Name']] || 'Unassigned';
      const roRnd = ntbRand(`ntb-yoy-ro|${code}|${name}`);
      const rf = clamp(headFactor('DS', rsm) + (roRnd() - 0.5) * 0.28, 0.68, 1.28);
      const ff = clamp(rf + (roRnd() - 0.5) * 0.08, 0.68, 1.30);
      const pyYtd = m.ytd > 0 ? Math.max(1, Math.round(m.ytd * rf)) : 0;
      const pyFytd = m.fytd > 0 ? Math.max(1, Math.round(m.fytd * ff)) : 0;
      attachYoY(m, pyYtd, pyFytd);
      const o = {
        code,
        name,
        rsm,
        region: r.ids[ii['Main Region Name']] || r.ids[ii['Region']] || '',
        segment: 'DS', area: r.ids[ii['Region']] || '', stream: '', m: {},
      };
      [...NTB_ROLES, 'Branch'].forEach(rl => { o.m[rl] = m; });
      return o;
    });
    return { branches, ros, HM_HUBS, asOf: parseIso(sc.as_of) };
  }
  return { get() { return built || (built = build()); }, achieve, pctChange };
})();

function ntbLevelVal(level, b) { return String((level.val ? level.val(b) : b[level.field]) || 'Unassigned'); }
function ntbSubFor(level, b) {
  switch (level.k) {
    case 'rsm': return `${b.region} · RSM`;
    case 'ro': return `${b.code} · ${b.rsm}`;
    case 'rbhAny': return `${b.segment} · ${b.smeRegion || b.region}`;
    case 'sc': return `${b.code} · ${b.area}`;
    case 'ah': return b.area + (b.segment === 'SME' ? '' : ` · ${b.region}`);
    case 'cm': return b.cmBranch || b.area;
    case 'hm': return b.hub + (b.smeRegion ? ` · ${b.smeRegion}` : '');
    case 'rbhSme': return b.smeRegion || b.region;
    default: return b.region;
  }
}

/* ---------------- NtbVM ---------------- */
class NtbVM {
  constructor(onChange) {
    this.onChange = onChange; this.disposed = false; this.token = 0;
    const role = currentRole();
    this.s = {
      isLoading: true, loaded: false, refreshing: false,
      loginRole: role,
      pf: role.portfolio !== 'Both' ? role.portfolio : 'All',
      stream: '',
      measure: null, // null = home, 'opened' | 'funded' = drill
      role: 'Branch',
      path: [],
      jump: '',
      graphTab: 0,
      sortCol: 'ytd', sortDesc: true,
      openAccordions: new Set(),
    };
  }
  set(p, silent) { this.s = Object.assign({}, this.s, p); if (!this.disposed && !silent) this.onChange(); }
  get D() { return NtbData.get(); }
  seesSummary() { const s = this.s.loginRole.scope || {}; return !(s.rbh || s.rbhSme || s.areaHead || s.cm || s.hm || s.branch); }
  wholeBook() { return !this.s.path.length && !this.s.stream && this.seesSummary(); }
  openPortfolios() {
    const locked = this.s.loginRole.portfolio !== 'Both';
    return NTB_PF.filter(p => (locked ? p.id === this.s.loginRole.portfolio : true));
  }
  pfLabel() { return (NTB_PF.find(p => p.id === this.s.pf) || {}).label || this.s.pf; }
  streamLabel() { return (EOP_STREAMS.find(x => x.id === this.s.stream) || EOP_STREAMS[0]).label; }
  measureMeta() { return NTB_MEASURE[this.s.measure || 'opened']; }
  leadKey() { return this.measureMeta().lead; }

  allChain(path) {
    const head = (path || this.s.path)[0];
    if (!head) return NTB_LEVELS.All;
    const hit = this.D.branches.find(b => String(b.segment === 'SME' ? b.rbhSme : b.rbh) === String(head));
    return NTB_LEVELS.All.concat(NTB_ALL_TAIL[hit && hit.segment === 'SME' ? 'SME' : 'Retail']);
  }
  levels(path) {
    const all = this.s.pf === 'All' ? this.allChain(path) : (NTB_LEVELS[this.s.pf] || NTB_LEVELS.Retail);
    const sc = this.s.loginRole.scope || {};
    let start = 0;
    for (let i = 0; i < all.length; i++) if (sc[all[i].scope]) start = i;
    return all.slice(start);
  }
  bookHead() {
    if (this.s.pf === 'DS') return '';
    if (!this.seesSummary()) return this.s.loginRole.person;
    const lv = this.levels([]);
    if (!lv.length || !lv[0].k.startsWith('rbh')) return '';
    return this.s.pf === 'All' ? `${NTB_HEADS.Retail} & ${NTB_HEADS.SME}` : (NTB_HEADS[this.s.pf] || '');
  }
  inScope(b) {
    const s = this.s.loginRole.scope || {};
    if (this.s.stream && b.stream !== this.s.stream) return false;
    if (this.s.loginRole.portfolio !== 'Both' && b.segment !== this.s.loginRole.portfolio) return false;
    if (s.rbh && b.rbh !== s.rbh) return false;
    if (s.rbhSme && b.rbhSme !== s.rbhSme) return false;
    if (s.areaHead && b.ah !== s.areaHead) return false;
    if (s.cm && b.cm !== s.cm) return false;
    if (s.hm && !(this.D.HM_HUBS[s.hm] || {})[String(b.hubCode)]) return false;
    if (s.branch && b.name !== s.branch) return false;
    return true;
  }
  factsHere() { return this.s.pf === 'DS' ? this.D.ros : this.D.branches; }
  pathBranches(depth, path) {
    const p = path || this.s.path, lv = this.levels(p);
    const d = typeof depth === 'number' ? depth : p.length;
    return this.factsHere().filter(b => {
      if (this.s.pf !== 'DS') {
        if (this.s.pf !== 'All' && b.segment !== this.s.pf) return false;
        if (!this.inScope(b)) return false;
      }
      for (let i = 0; i < d && i < p.length; i++) if (!lv[i] || ntbLevelVal(lv[i], b) !== p[i]) return false;
      return true;
    });
  }
  choicesAt(i) {
    const lv = this.levels();
    if (!lv[i]) return [];
    return [...new Set(this.pathBranches(i).map(b => ntbLevelVal(lv[i], b)))].sort();
  }
  agg(list, roleName) {
    const rk = roleName || this.s.role;
    const out = { day: 0, mtd: 0, ytd: 0, pyYtd: 0, yoyVar: 0, fday: 0, fmtd: 0, fytd: 0, pyFytd: 0, fyoyVar: 0, tmtd: 0, tytd: 0, vmtd: 0, vytd: 0 };
    list.forEach(b => {
      const v = b.m && b.m[rk]; if (!v) return;
      for (const k in out) out[k] += typeof v[k] === 'number' ? v[k] : 0;
    });
    out.amtd = NtbData.achieve(out.fmtd, out.tmtd);
    out.aytd = NtbData.achieve(out.fytd, out.tytd);
    out.yoyPct = NtbData.pctChange(out.ytd, out.pyYtd);
    out.fyoyPct = NtbData.pctChange(out.fytd, out.pyFytd);
    return out;
  }
  listIndex() {
    const lv = this.levels(), i = Math.min(this.s.path.length, lv.length - 1);
    if (this.s.jump) {
      for (let j = 0; j < lv.length; j++) if (lv[j].k === this.s.jump && j >= i) return j;
    }
    return i;
  }
  rowsHere() {
    const lv = this.levels(), i = this.listIndex(), level = lv[i];
    const map = new Map();
    this.pathBranches().forEach(b => {
      const k = ntbLevelVal(level, b);
      if (!map.has(k)) map.set(k, { id: k, label: k, rows: [], sample: b });
      map.get(k).rows.push(b);
    });
    const out = [...map.values()].map(e => {
      e.n = e.rows.length;
      e.sub = ntbSubFor(level, e.sample);
      e.m = this.agg(e.rows, this.s.role);
      e.deeper = level.k === 'rbhAny' || i < lv.length - 1;
      return e;
    });
    const col = this.s.sortCol, dir = this.s.sortDesc ? -1 : 1;
    out.sort((a, b) => {
      const va = col === 'n' ? a.n : (a.m[col] || 0), vb = col === 'n' ? b.n : (b.m[col] || 0);
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    out.level = level;
    out.index = i;
    return out;
  }
  totalBlock() {
    if (this.s.pf === 'DS') return null;
    const t = WEB_DATA.ntb_total;
    if (!t || !t.blocks) return null;
    const want = this.s.pf === 'All' ? 'Total' : this.s.pf === 'SME' ? 'Aamir' : 'Faheem';
    return t.blocks.find(b => b.block.startsWith(want)) || null;
  }
  activeFilterCount() {
    let c = 0;
    if (this.s.stream && this.s.pf !== 'DS') c++;
    if (this.s.measure) c += this.s.path.length;
    return c;
  }

  async loadData() {
    this.set({ isLoading: true });
    await DataLoader.load('eop', 'ntb');
    if (this.disposed) return;
    NtbData.get();
    this.set({ isLoading: false, loaded: true, refreshing: false });
  }
  async pulse(patch) {
    const t = ++this.token;
    this.set(Object.assign({ refreshing: true }, patch));
    await sleep(120); if (this.disposed || t !== this.token) return;
    this.set({ refreshing: false });
  }
  selectPortfolio(pf) {
    if (pf === this.s.pf) return Promise.resolve();
    return this.pulse({ pf, path: [], jump: '', role: 'Branch', graphTab: 0, openAccordions: new Set() });
  }
  selectStream(stream) {
    if (stream === this.s.stream) return Promise.resolve();
    return this.pulse({ stream, path: [], jump: '', role: 'Branch', openAccordions: new Set() });
  }
  resetFilters() {
    const defaultPf = this.s.loginRole.portfolio !== 'Both' ? this.s.loginRole.portfolio : 'All';
    return this.pulse({ pf: defaultPf, stream: '', path: [], jump: '', role: 'Branch', openAccordions: new Set() });
  }
  selectCard(cardId) {
    const c = NTB_CARDS.find(x => x.id === cardId);
    const meas = c ? c.on : (cardId === 'funded' ? 'funded' : cardId === 'yoy' ? 'yoy' : 'opened');
    const lead = NTB_MEASURE[meas].lead;
    return this.pulse({ measure: meas, role: 'Branch', path: [], jump: '', graphTab: 0, sortCol: lead, sortDesc: true, openAccordions: new Set() });
  }
  /* 4.4 Tapping a role card drills straight to that role's level */
  openRoleCard(roleName) {
    const meas = this.s.measure || 'opened';
    const jump = NTB_ROLE_LEVEL[roleName] || '';
    const rk = ntbRoleKey(roleName);
    const lead = NTB_MEASURE[meas].lead;
    return this.pulse({ measure: meas, role: rk, jump, graphTab: 0, sortCol: lead, sortDesc: true, openAccordions: new Set() });
  }
  openRow(row) {
    const j = this.listIndex();
    const lv = this.levels(this.s.path.length ? undefined : [row.id]);
    if (j >= lv.length - 1) return Promise.resolve();
    const p = [];
    for (let q = 0; q <= j && q < lv.length; q++) p.push(ntbLevelVal(lv[q], row.sample));
    return this.pulse({ path: p, jump: '', graphTab: 0, openAccordions: new Set() });
  }
  goToCrumb(idx) {
    return this.pulse({ jump: '', path: idx < 0 ? [] : this.s.path.slice(0, idx + 1), role: idx < 0 ? 'Branch' : this.s.role, graphTab: 0, openAccordions: new Set() });
  }
  selectLevelFilter(i, val) {
    return this.pulse({ jump: '', path: [...this.s.path.slice(0, i), ...(val ? [val] : [])], graphTab: 0, openAccordions: new Set() });
  }
  handleBack() {
    if (this.s.jump) { this.set({ jump: '', role: 'Branch', openAccordions: new Set() }); return true; }
    if (this.s.path.length) { this.set({ path: this.s.path.slice(0, -1), graphTab: 0, openAccordions: new Set() }); return true; }
    if (this.s.measure) { this.set({ measure: null, role: 'Branch', path: [], jump: '', graphTab: 0, openAccordions: new Set() }); return true; }
    return false;
  }
}

/* ---------------- NTB widgets ---------------- */
function ntbSignedPct(pct) {
  if (typeof pct !== 'number' || isNaN(pct)) return '—';
  const z = Math.abs(pct) < 0.05;
  return z ? '0.0%' : `${pct < 0 ? '−' : '+'}${Math.abs(pct).toFixed(1)}%`;
}
function ntbYoYPipe(pct) {
  if (typeof pct !== 'number' || isNaN(pct)) return '';
  return `<span class="gp ${pct < 0 ? 'neg' : ''}"><i>|</i>${ntbSignedPct(pct)}</span>`;
}
function ntbYears(vm) {
  const cur = vm.D.asOf ? vm.D.asOf.getFullYear() : 2026;
  return { cur, py: cur - 1 };
}
function ntbSigned(v, pct) {
  if (typeof v !== 'number') return `<span style="${TM(12.5, 600, ET.muted)}">—</span>`;
  const c = F.delta(v);
  return `<span style="display:inline-flex;align-items:center;min-width:0;max-width:100%"><span style="${TM(9, 700, c)}flex:none">${v < 0 ? '▼' : '▲'}</span><span style="width:5px;flex:none"></span><span class="el1" style="${TM(12.5, 700, c)}">${F.signed(v, 0)}</span>${ntbYoYPipe(pct)}</span>`;
}

/* 4.1 / Item #10 NTB YoY Variance Headline Card (simulated prior-year baseline until API provides audited prior-year NTB) */
function ntbYoYHeadlineCard(vm, v) {
  const yrs = ntbYears(vm);
  const neg = v.yoyVar < 0;
  const tone = F.delta(v.yoyVar);
  const ratio = v.pyYtd > 0 ? Math.max(0, Math.min(100, (v.ytd / v.pyYtd) * 100)) : 0;
  const scopeTxt = vm.s.pf === 'DS' ? 'Direct Sales' : 'Branch roles';
  const badgeStyle = neg
    ? `background:#FFF7ED;border:1px solid #FED7AA;color:${ET.negative}`
    : `background:${ET.positive};color:#fff`;
  const tip = [
    `Opened YTD (${yrs.cur}): ${N(v.ytd)}`,
    `Prior Year YTD (${yrs.py}): ${N(v.pyYtd)}`,
    `YoY Variance (Opened): ${F.signed(v.yoyVar, 0)}${v.yoyPct != null ? ` (${ntbSignedPct(v.yoyPct)})` : ''}`,
    `Funded YTD (${yrs.cur}): ${N(v.fytd)}`,
    `Prior Year Funded (${yrs.py}): ${N(v.pyFytd)}`,
    `YoY Variance (Funded): ${F.signed(v.fyoyVar, 0)}${v.fyoyPct != null ? ` (${ntbSignedPct(v.fyoyPct)})` : ''}`,
    `(Prior-year NTB figures are simulated placeholder data until audited prior-year columns are supplied by the API.)`,
  ].join('\n');

  return `<div class="lifted tap esurf" data-act="card" data-id="yoy" style="border-radius:20px;background:#fff;position:relative;overflow:hidden;border:0">
    <div style="position:absolute;top:-54px;right:-54px;width:210px;height:210px;border-radius:50%;background:radial-gradient(circle closest-side,${rgba(tone, .13)},${rgba(tone, 0)})"></div>
    <div style="position:relative;padding:14px;border-radius:20px;border:1px solid ${ET.border}">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:34px;height:34px;border-radius:11px;background:${rgba(tone, .14)};border:1px solid ${rgba(tone, .3)};display:flex;align-items:center;justify-content:center;flex:none">${I(neg ? 'trending_down' : 'trending_up', 'r', 18, tone)}</div>
        <div class="grow">
          <div class="el1" style="${TB(12.5, 800, ET.ink)}">NTB YoY Variance</div>
          <div class="el1" style="${TB(10, 500, ET.muted)}margin-top:1px">YTD ${yrs.cur} vs ${yrs.py} · ${scopeTxt}</div>
        </div>
        ${infoBtn('NTB YoY Variance', tip)}
        <div class="pillbtn" title="Open YoY Variance" style="background:${rgba(tone, .08)};border:1px solid ${rgba(tone, .22)}">${I('chevron_right', 'r', 18, tone)}</div>
      </div>

      <div style="margin-top:12px;display:flex;align-items:baseline;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:baseline;gap:6px;min-width:0">
          <span style="${TD(26, 800, tone, -0.8)}">${F.signed(v.yoyVar, 0)}</span>
          <span style="${TB(10.5, 700, ET.muted)}">accounts</span>
        </div>
        <span class="badge-pct" style="${badgeStyle}">${neg ? '▼' : '▲'} ${ntbSignedPct(v.yoyPct)}</span>
      </div>

      <div style="margin-top:9px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px">
          <span style="${TB(10.5, 600, ET.muted)}">vs prior year (${yrs.py})</span>
          <span style="${TM(11, 700, ET.text2)}white-space:nowrap">${N(v.ytd)} vs ${N(v.pyYtd)}</span>
        </div>
        <div style="height:6px;border-radius:999px;background:${ET.track};overflow:hidden">
          <div style="height:6px;width:${ratio}%;background:${tone}"></div>
        </div>
      </div>

      <div style="margin-top:11px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="padding:9px 10px;background:${ET.tile};border-radius:12px;min-width:0">
          <div class="el1" style="${TB(9, 800, ET.muted, 0.7)}">OPENED YTD (${yrs.cur})</div>
          <div style="margin-top:4px;${TM(13, 800, ET.ink)}">${N(v.ytd)}</div>
          <div class="el1" style="margin-top:2px;${TB(9.5, 600, ET.muted)}">${yrs.py}: ${N(v.pyYtd)}</div>
        </div>
        <div style="padding:9px 10px;background:${ET.tile};border-radius:12px;min-width:0">
          <div class="el1" style="${TB(9, 800, ET.muted, 0.7)}">FUNDED YOY VAR</div>
          <div style="margin-top:4px">${ntbSigned(v.fyoyVar, v.fyoyPct)}</div>
          <div class="el1" style="margin-top:2px;${TB(9.5, 600, ET.muted)}">${N(v.fytd)} vs ${N(v.pyFytd)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* 4.2 Hero with Accounts Opened and Accounts Funded stacked together */
function ntbHero(vm, v) {
  const subTxt = vm.s.pf === 'DS' ? 'Year to date · Direct Sales' : 'Year to date · branch roles';
  const target = v.tytd || 0;
  const block = (title, val, color, actId) => {
    const pct = target ? (val / target) * 100 : 0;
    const w = Math.max(0, Math.min(100, pct));
    return `<div class="tap" data-act="card" data-id="${actId}" style="padding:12px 13px;border-radius:16px;background:#F7FAF8;border:1px solid ${ET.border};position:relative;overflow:hidden;cursor:pointer">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div class="grow">
          <div style="${TB(11, 800, color, 1.0)}">${esc(title.toUpperCase())}</div>
          <div style="${TB(10, 500, ET.muted)}margin-top:1px">${esc(subTxt)}</div>
        </div>
        <span class="badge-pct ${pct >= 100 ? 'over' : ''}">${F.percent(pct)}</span>
      </div>
      <div style="margin-top:8px;display:flex;align-items:baseline;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:baseline;gap:6px">
          <span style="${TD(28, 800, ET.ink, -1.0)}">${N(val)}</span>
          <span style="${TB(10, 700, ET.muted)}">accounts</span>
        </div>
        <span style="${TM(11, 700, ET.muted)}white-space:nowrap">${N(val)} of ${N(target)}</span>
      </div>
      <div style="height:6px;margin-top:8px;border-radius:999px;background:${ET.track};overflow:hidden">
        <div style="height:6px;width:${w}%;background:${color}"></div>
      </div>
    </div>`;
  };
  const stat = (l, val, signed) => `<div style="padding:10px 10px;background:${ET.tile};border-radius:13px;min-width:0">
    <div class="el1" style="${TB(9, 800, ET.muted, 0.8)}">${l}</div>
    <div style="height:5px"></div>
    ${signed ? ntbSigned(val) : `<div class="el1" style="${TM(13, 800, ET.ink)}">${N(val)}</div>`}</div>`;

  return `<div class="esurf" style="border-radius:24px;padding:13px">
    <div style="display:flex;flex-direction:column;gap:9px">
      ${block('Accounts Opened', v.ytd, '#047857', 'ytd')}
      ${block('Accounts Funded', v.fytd, '#0D9488', 'fytd')}
    </div>
    <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">
      ${stat('TODAY', v.day, false)}${stat('MTD', v.mtd, false)}${stat('TGT VAR', v.vytd, true)}
    </div>
  </div>`;
}

/* 4.1 Top 5 measure cards (Opened Today, Opened MTD, Opened YTD, Target YTD, Funded YTD) */
function ntbMeasureCard(c, v) {
  const extras = {
    day: [['MTD', v.mtd], ['YTD', v.ytd], ['Target MTD', v.tmtd]],
    mtd: [['Target MTD', v.tmtd], ['Var MTD', v.vmtd, 1], ['Ach % MTD', v.amtd, 0, 1]],
    ytd: [['Target YTD', v.tytd], ['Var YTD', v.vytd, 1], ['Ach % YTD', v.aytd, 0, 1]],
    tytd: [['Target MTD', v.tmtd], ['Opened YTD', v.ytd], ['Var YTD', v.vytd, 1]],
    fytd: [['Funded Today', v.fday], ['Funded MTD', v.fmtd], ['Target YTD', v.tytd]],
  }[c.id];
  const target = c.id === 'mtd' ? v.tmtd : (c.id === 'ytd' || c.id === 'fytd') ? v.tytd : null;
  const val = v[c.id];
  const ach = target ? (val / target) * 100 : null;
  const row = ([l, x, signed, pct]) => `<div style="height:28px;display:flex;align-items:center"><span style="${TB(9.5, 800, ET.muted, 0.9)}">${esc(l.toUpperCase())}</span><span style="width:10px"></span>
    <div style="flex:1;min-width:0;display:flex;justify-content:flex-end">${signed ? ntbSigned(x) : `<span class="el1" style="${TM(12.5, 700, ET.ink)}">${pct ? P(x) : N(x)}</span>`}</div></div>`;
  return `<div class="lifted tap esurf" data-act="card" data-id="${c.id}" style="border-radius:18px;background:#fff;position:relative;overflow:hidden;border:0">
    <div style="position:absolute;top:-50px;right:-50px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle closest-side,${rgba(c.accent, .13)},${rgba(c.accent, 0)})"></div>
    <div style="position:relative;padding:13px;border-radius:18px;border:1px solid ${ET.border}">
      <div style="display:flex;align-items:center">
        <div style="width:30px;height:30px;border-radius:10px;background:${rgba(c.accent, .16)};border:1px solid ${rgba(c.accent, .34)};display:flex;align-items:center;justify-content:center;flex:none">${I(c.icon[0], c.icon[1], 16, c.accent)}</div>
        <span style="width:11px"></span>
        <div class="grow"><div class="el1" style="${TB(11.5, 800, ET.text2)}">${esc(c.label)}</div><div class="el1" style="${TB(10, 500, ET.muted)}">${esc(c.sub)}</div></div>
        ${I('chevron_right', 'r', 18, ET.muted)}
      </div>
      <div style="height:10px"></div>
      <div style="display:flex;align-items:baseline;gap:6px"><span style="${TD(20, 700, ET.ink)}">${N(val)}</span><span style="${TB(10, 800, ET.muted)}">accounts</span></div>
      ${target ? `<div style="height:8px"></div>
        <div style="display:flex;align-items:center"><span style="${TB(11, 600, ET.muted)}white-space:nowrap">vs target</span><span style="width:6px"></span><span class="el1 grow" style="${TM(11, 700, ET.ink)}">${N(target)}</span><span class="badge-pct ${ach >= 100 ? 'over' : ''}">${P(ach)}</span></div>
        <div style="height:7px"></div><div style="height:6px;border-radius:999px;background:${ET.track};overflow:hidden"><div style="height:6px;width:${Math.max(0, Math.min(100, ach))}%;background:${c.accent}"></div></div>` : ''}
      <div style="height:10px"></div>
      <div style="padding-top:10px;border-top:1px solid ${ET.grid}">${extras.map(row).join('')}</div>
    </div></div>`;
}

function ntbChartCard({ title, subtitle, rows, tabIndex, stats, leadKey }, charts) {
  if (!rows.length) return '';
  const lk = leadKey || 'ytd';
  const isYoy = lk === 'yoyVar';
  const shown = rows.slice().sort((a, b) => (b.m[lk] || 0) - (a.m[lk] || 0)).slice(0, 8);
  const tabs = ['All', ...shown.map(r => r.label)];
  const sel = Math.max(0, Math.min(tabIndex, tabs.length - 1));
  const vis = sel === 0 ? shown : shown.filter(r => r.label === tabs[sel]);
  const vals = isYoy ? r => [r.m.pyYtd, r.m.ytd] : lk === 'fytd' ? r => [r.m.fday, r.m.fmtd, r.m.fytd] : r => [r.m.day, r.m.mtd, r.m.ytd];
  const labels = isYoy ? ['PY YTD', 'Cur YTD'] : ['Today', 'MTD', 'YTD'];
  const series = vis.map(r => ({ name: r.label, color: NTB_SERIES[shown.indexOf(r) % NTB_SERIES.length], values: vals(r) }));
  const target = vis.length === 1 && vis[0].m.tytd > 0 ? vis[0].m.tytd : null;
  const ci = charts.push({ series, labels, target, fillArea: vis.length === 1 }) - 1;
  let statRows = '';
  if (stats) {
    const metric = s => {
      const signed = !!s[2];
      const col = signed ? F.delta(s[1]) : (s[1] < 0 ? ET.negative : ET.ink);
      const txt = signed ? F.signed(s[1], 0) : N(s[1]);
      return `<div class="el1" style="${TB(9, 700, ET.muted, 0.4)}">${esc(s[0])}</div><div style="height:3px"></div><div class="el1" style="${TM(12.5, 900, col)}">${txt}</div>`;
    };
    statRows = `<div style="display:flex;gap:8px;margin:8px 0 10px">${stats.map(s => `<div style="flex:1;min-width:0">${metric(s)}</div>`).join('')}</div>`;
  }
  return `<div class="esurf" style="border-radius:20px;padding:13px">
    <div style="${TB(10, 800, ET.muted, 0.5)}">${esc(title.toUpperCase())}</div><div style="height:4px"></div>
    <div style="${TB(11, 500, ET.muted, null, 15)}">${esc(subtitle)}</div><div style="height:6px"></div>
    ${tabRow(tabs, sel, 'gtab')}${statRows}
    <div style="height:4px"></div><div class="trend" data-ci="${ci}" style="height:220px"></div><div style="height:8px"></div>
    ${chartLegend(series, target != null)}</div>`;
}

/* 4.4 Role cards on every level (Home and Drill), dynamically computed from list, tappable to drill */
function ntbRoleCardsSection(vm, list, ctx) {
  const block = vm.totalBlock();
  if (!block) return '';
  const isWhole = vm.wholeBook();
  const where = vm.s.path.length ? vm.s.path[vm.s.path.length - 1] : (vm.bookHead() || vm.pfLabel());
  ctx.roleRows = [];

  const cards = block.rows.map((r, i) => {
    const v = vm.agg(list, ntbRoleKey(r.role));
    const isTotal = /^(RBHs|TOTAL)$/i.test(r.role);
    const hc = isWhole ? r.values.hc : null;
    const zero = isWhole ? r.values.zero : null;
    const pMtd = isWhole ? r.values.pMtd : null;
    const pYtd = isWhole ? r.values.pYtd : null;
    ctx.roleRows.push({ role: r.role, v, hc, zero, pMtd, pYtd, where });

    const sub = NTB_ROLE_LABEL[r.role] && NTB_ROLE_LABEL[r.role] !== r.role ? NTB_ROLE_LABEL[r.role] : '';
    const grp = (lbl, body) => `<div style="min-width:0;padding:8px 9px;background:${ET.tile};border-radius:11px">
      <div style="${TB(8.5, 800, ET.muted, 0.6)}">${lbl}</div>
      <div style="margin-top:3px;${TM(11, 700, ET.ink)}">${body}</div></div>`;
    const sv = x => `<span style="color:${F.delta(x)}">${F.signed(x, 0)}</span>`;

    return `<div class="esurf tap" data-act="roledrill" data-id="${esc(r.role)}" style="border-radius:18px;padding:13px;margin-bottom:10px;${isTotal ? 'background:#F2FAF6;border-color:rgba(4,120,87,.28)' : ''}">
      <div style="display:flex;align-items:center">
        <div class="grow">
          <div style="${TB(14, 800, isTotal ? ET.primary : ET.ink)}">${esc(r.role)}</div>
          ${sub ? `<div style="${TB(11, 500, ET.muted)}">${esc(sub)}</div>` : ''}
        </div>
        <div class="pillbtn" title="Details" data-act="roledetails" data-i="${i}" style="background:#fff;border:1px solid ${ET.eyeBorder}">${I('visibility', 'o', 17, ET.muted)}</div>
        <span style="width:7px"></span>
        <div class="pillbtn" title="Open ${esc(r.role)}" data-act="roledrill" data-id="${esc(r.role)}" style="background:rgba(4,120,87,.08);border:1px solid rgba(4,120,87,.22)">${I('chevron_right', 'r', 18, ET.primary)}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px">
        ${grp('OPENED (T / M / Y)', `${N(v.day)} · ${N(v.mtd)} · <b>${N(v.ytd)}</b>`)}
        ${grp('FUNDED (T / M / Y)', `${N(v.fday)} · ${N(v.fmtd)} · <b>${N(v.fytd)}</b>`)}
        ${grp('TARGET (M / Y)', `${N(v.tmtd)} · <b>${N(v.tytd)}</b>`)}
        ${grp('TGT VAR (M / Y)', `${sv(v.vmtd)} · ${sv(v.vytd)}`)}
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid ${ET.grid};display:flex;flex-wrap:wrap;gap:6px 14px;${TB(10, 600, ET.muted)}">
        <span>YoY Var <b style="font-family:var(--fMono);color:${F.delta(v.yoyVar)}">${F.signed(v.yoyVar, 0)}</b>${ntbYoYPipe(v.yoyPct)}</span>
        <span>HC ACT <b style="font-family:var(--fMono);color:${ET.ink}">${N(hc)}</b></span>
        <span>Zero Bal <b style="font-family:var(--fMono);color:${ET.ink}">${N(zero)}</b></span>
        <span>Prod/Day <b style="font-family:var(--fMono);color:${ET.ink}">${typeof pMtd === 'number' ? F.number(pMtd, 2) : '—'} / ${typeof pYtd === 'number' ? F.number(pYtd, 2) : '—'}</b></span>
      </div>
    </div>`;
  }).join('');

  return `<div style="margin-top:8px">
    ${sectionHeading(`NTB PERFORMANCE · ${where.toUpperCase()}`, `${F.count(block.rows.length)} roles`)}
    <div style="padding:4px 2px 10px;${TB(10.5, 500, ET.muted, null, 15)}">By role, as the NTB workbook’s Total sheet reports it · tap a role to drill${isWhole ? '' : ' — head count, zero balance and production per day are published for the whole book only'}</div>
    ${cards}
  </div>`;
}

/* 1.1–1.6 NTB Accounts by month opened (MoM table, current month only) */
function ntbMomScope(vm, list) {
  if (vm.s.pf === 'SME' || vm.s.pf === 'DS') return null;
  if (vm.s.loginRole.portfolio === 'SME') return null;
  const retailList = (list || []).filter(b => b.segment !== 'SME' && b.segment !== 'DS');
  if (vm.s.pf === 'All' && vm.s.path.length > 0 && !retailList.length) return null;

  const sc = vm.s.loginRole.scope || {};
  if (sc.rbhSme || sc.hm) return null;

  if (sc.areaHead || sc.cm || sc.branch) {
    const hit = retailList.find(b => b.rbh && b.rbh !== 'Vacant') || retailList[0];
    const rbh = hit && hit.rbh;
    if (!rbh) return null;
    return { block: rbh, note: `${rbh}'s figures, the file goes no lower` };
  }
  if (sc.rbh) {
    const belowRbh = vm.s.path.length >= 2;
    return { block: sc.rbh, note: belowRbh ? `${sc.rbh}'s figures, the file goes no lower` : '' };
  }
  if (!vm.s.path.length) {
    return { block: 'Retail', note: vm.s.pf === 'All' ? 'Retail book' : '' };
  }
  const rbh = vm.s.path[0];
  return {
    block: rbh,
    note: vm.s.path.length >= 2 ? `${rbh}'s figures, the file goes no lower` : '',
  };
}

function ntbMomEntryRow(vm, list) {
  const scope = ntbMomScope(vm, list);
  if (!scope) return '';
  const asOf = (WEB_DATA.ntb_mom && WEB_DATA.ntb_mom.as_of_month) || 'Oct-26';
  const unit = (WEB_DATA.ntb_mom && WEB_DATA.ntb_mom.unit) || 'PKR Mn';
  const subParts = [scope.block === 'Retail' && scope.note ? scope.note : scope.block, unit, `as of ${asOf}`];
  return `<div class="mom-entry" data-act="mom" data-block="${esc(scope.block)}" data-note="${esc(scope.note)}" style="margin-top:4px;margin-bottom:12px">
    <div class="grow" style="min-width:0">
      <div class="el1" style="${TB(13.5, 700, ET.ink)}">Accounts by month opened</div>
      <div class="el1" style="margin-top:2px;${TB(10.5, 500, ET.muted)}">${esc(subParts.join(' · '))}</div>
    </div>
    ${I('chevron_right', 'r', 20, ET.muted)}
  </div>`;
}

function openNtbMomSheet(blockName, note = '') {
  const sbEl = $('#statusbar');
  const sbH = sbEl ? sbEl.offsetHeight : 28;
  const sheetH = Math.max(320, appH() - sbH);

  const fmtAc = v => (v == null || typeof v !== 'number' || isNaN(v) ? '–' : F.count(v));
  const fmtPlain = v => {
    if (v == null || typeof v !== 'number' || isNaN(v)) return `<span style="color:${ET.muted}">–</span>`;
    const txt = F.number(v);
    const col = v < 0 && txt !== '0' ? ET.negative : ET.ink;
    return `<span style="color:${col}">${txt}</span>`;
  };
  const fmtMove = v => {
    if (v == null || typeof v !== 'number' || isNaN(v)) return `<span style="color:${ET.muted}">–</span>`;
    const txt = F.signed(v);
    const col = txt === '0' ? ET.ink : (v < 0 ? ET.negative : ET.positive);
    return `<span style="color:${col}">${txt}</span>`;
  };
  const dataRow = (r, cls) => `<div class="mom-grid ${cls}">
    <span>${esc(r.month)}</span>
    <span>${fmtAc(r.accounts)}</span>
    ${fmtPlain(r.eop)}
    ${fmtMove(r.mtd)}
    ${fmtPlain(r.ytd)}
  </div>`;

  const content = h(`<div style="display:flex;flex-direction:column;height:100%;min-height:0;background:#fff">
    <div style="padding:9px 0 2px;display:flex;justify-content:center;flex:none">
      <div style="width:36px;height:4px;border-radius:999px;background:#D5DDD8"></div>
    </div>
    <div style="padding:8px 14px 12px;display:flex;align-items:flex-start;gap:10px;border-bottom:1px solid ${ET.grid};flex:none">
      <div class="grow" style="min-width:0">
        <div class="el2" style="${TD(16, 800, ET.ink, -0.2)}">Accounts by month opened · ${esc(blockName)}</div>
        <div data-slot="sub" style="margin-top:3px;${TB(11, 500, ET.muted, null, 15)}"></div>
      </div>
      <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none">${I('close', 'r', 16, ET.ink)}</div>
    </div>
    <div data-slot="body" class="scroll" style="flex:1 1 auto;min-height:0;overflow-x:hidden"></div>
  </div>`);

  const subEl = content.querySelector('[data-slot=sub]');
  const bodyEl = content.querySelector('[data-slot=body]');

  const renderBody = () => {
    const mom = WEB_DATA.ntb_mom;
    const asOf = (mom && mom.as_of_month) || 'Oct-26';
    const unit = (mom && mom.unit) || 'PKR Mn';
    subEl.textContent = `${unit} · as of ${asOf}${note ? ` · ${note}` : ''}`;

    if (!mom) {
      bodyEl.innerHTML = `<div style="padding:16px 14px;display:flex;flex-direction:column;gap:12px">
        ${Array.from({ length: 5 }, () => `<div class="mom-skel"></div>`).join('')}
      </div>`;
      return;
    }
    const blk = (mom.blocks || []).find(b => b.block === blockName);
    if (!blk) {
      bodyEl.innerHTML = `<div style="padding:36px 20px;text-align:center;${TB(13, 600, ET.muted, null, 19)}">No month-opened figures for ${esc(blockName)} in the bank's file.</div>`;
      return;
    }

    let rowsHtml = `<div class="mom-grid mom-head">
      <span>Month</span><span>A/Cs</span><span>EOP Vol.</span><span>MTD</span><span>YTD</span>
    </div>`;
    (blk.bands || []).forEach(band => {
      rowsHtml += `<div class="mom-band">${esc(band.name)}</div>`;
      (band.rows || []).forEach(r => { rowsHtml += dataRow(r, 'mom-row'); });
      if (band.total) rowsHtml += dataRow(band.total, 'mom-total');
    });
    if (blk.grand) rowsHtml += dataRow(blk.grand, 'mom-grand');
    bodyEl.innerHTML = `<div style="padding-bottom:24px">${rowsHtml}</div>`;
  };

  renderBody();
  const sheet = openSheet(content, { radius: 24 });
  sheet.el.style.height = sheetH + 'px';
  sheet.el.style.maxHeight = sheetH + 'px';
  content.querySelector('[data-act=close]').onclick = () => sheet.close();

  if (!WEB_DATA.ntb_mom) {
    DataLoader.load('ntb').then(renderBody).catch(() => {});
  }
  return sheet;
}

/* 4.3 Entity card (Opened Today on Opened measure; Funded MTD/YTD/Var on Funded; YoY comparison on YoY) + 1.2 info button on SC */
function ntbEntityCard(vm, item, level) {
  const v = item.m, isFunded = vm.s.measure === 'funded', isYoy = vm.s.measure === 'yoy', isSc = level.k === 'sc';
  const yrs = ntbYears(vm);
  const stats = isYoy
    ? [['Opened YTD', v.ytd], [`Prior Yr (${yrs.py})`, v.pyYtd], ['YoY Var', v.yoyVar, 1, v.yoyPct], ['Funded YoY', v.fyoyVar, 1, v.fyoyPct]]
    : isFunded
      ? [['Funded MTD', v.fmtd], ['Funded YTD', v.fytd], ['Target YTD', v.tytd], ['Var YTD', v.vytd, 1]]
      : [['Opened Today', v.day], ['Opened MTD', v.mtd], ['Opened YTD', v.ytd], ['Var YTD', v.vytd, 1]];
  const leadVal = isFunded ? v.fytd : v.ytd;
  const ach = v.tytd ? (leadVal / v.tytd) * 100 : 0;
  const yoyNeg = v.yoyVar < 0;
  const yoyTone = F.delta(v.yoyVar);
  const yoyRatio = v.pyYtd > 0 ? Math.max(0, Math.min(100, (v.ytd / v.pyYtd) * 100)) : 0;
  const tip = isSc && vm.s.pf !== 'DS' ? EopData.whose(item.label) : '';
  const cell = ([l, val, signed, pct]) => `<div style="min-width:0">
    <div class="el1" style="${TB(9.5, 700, ET.sortLabel, 0.3)}">${esc(l.toUpperCase())}</div>
    <div style="height:4px"></div>
    <div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:1px">
      <span style="${TM(12.5, 700, signed ? F.delta(val) : ET.ink)}">${signed ? F.signed(val, 0) : N(val)}</span>${typeof pct === 'number' ? ntbYoYPipe(pct) : ''}
    </div></div>`;
  const barHtml = isYoy
    ? (v.pyYtd > 0 ? `<div style="margin-top:9px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="${TB(10, 600, ET.muted)}">vs ${yrs.py} YTD (${N(v.pyYtd)})</span>
          <span class="badge-pct ${!yoyNeg ? 'over' : ''}" style="${yoyNeg ? `background:#FFF7ED;color:${ET.negative}` : ''}">${ntbSignedPct(v.yoyPct)}</span>
        </div>
        <div style="height:5px;border-radius:999px;background:${ET.track};overflow:hidden"><div style="height:5px;width:${yoyRatio}%;background:${yoyTone}"></div></div>
      </div>` : '')
    : (v.tytd > 0 ? `<div style="margin-top:9px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="${TB(10, 600, ET.muted)}">${isFunded ? 'Funded' : 'Opened'} vs target ${N(v.tytd)}</span>
          <span class="badge-pct ${ach >= 100 ? 'over' : ''}">${P(ach)}</span>
        </div>
        <div style="height:5px;border-radius:999px;background:${ET.track};overflow:hidden"><div style="height:5px;width:${Math.max(0, Math.min(100, ach))}%;background:${vm.measureMeta().accent}"></div></div>
      </div>` : '');
  return `<div class="esurf ${item.deeper ? 'tap' : ''}" ${item.deeper ? `data-act="open" data-id="${esc(item.id)}"` : ''} style="border-radius:20px;padding:14px">
    <div style="display:flex;align-items:center">
      <div class="grow">
        <div class="el2" style="${TB(14, 700, ET.ink)}">${esc(item.label)}</div>
        <div class="el2" style="margin-top:2px;${TB(11.5, 500, ET.muted)}">${esc(item.sub)}${!isSc && level.k !== 'ro' ? ` · ${F.count(item.n)} ${vm.s.pf === 'DS' ? 'ROs' : (item.n === 1 ? 'branch' : 'branches')}` : ''}</div>
      </div>
      ${tip ? infoBtn(item.label, tip) : ''}
      <span style="width:6px"></span>
      <div class="pillbtn" title="Details" data-act="details" data-id="${esc(item.id)}" style="background:#fff;border:1px solid ${ET.eyeBorder}">${I('visibility', 'o', 18, ET.muted)}</div>
      ${item.deeper ? `<span style="width:7px"></span><div class="pillbtn" title="Open" data-act="open" data-id="${esc(item.id)}" style="background:rgba(4,120,87,.078);border:1px solid rgba(4,120,87,.22)">${I('chevron_right', 'r', 18, ET.primary)}</div>` : ''}
    </div>
    ${barHtml}
    <div style="height:12px"></div>
    <div style="height:1px;background:repeating-linear-gradient(90deg,${ET.dashed} 0 4px,transparent 4px 7px)"></div>
    <div style="height:12px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px">${stats.map(cell).join('')}</div>
  </div>`;
}

function ntbCrumbBar(vm) {
  const lv = vm.levels();
  const sep = `<span class="sep">›</span>`;
  const parts = [
    `<button type="button" data-act="home">NTB Report</button>`,
    sep,
    `<button type="button" data-act="crumb" data-i="-1">${esc(vm.pfLabel())}</button>`,
    sep,
    vm.s.path.length || vm.s.jump
      ? `<button type="button" data-act="crumb" data-i="-1">${esc(vm.measureMeta().label)}</button>`
      : `<span class="cur">${esc(vm.measureMeta().label)}</span>`,
  ];
  vm.s.path.forEach((name, i) => {
    parts.push(sep);
    const isLast = i === vm.s.path.length - 1 && !vm.s.jump;
    parts.push(isLast
      ? `<span class="cur">${esc(name)}</span>`
      : `<button type="button" data-act="crumb" data-i="${i}">${esc(name)}</button>`);
    if (lv[i]) parts.push(`<span style="${TB(10, 500, ET.muted)}flex:none">(${esc(lv[i].label)})</span>`);
  });
  if (vm.s.jump) {
    parts.push(sep);
    parts.push(`<span class="cur">${esc(NTB_ROLE_LABEL[vm.s.role] || vm.s.role)}</span>`);
  }
  return `<div class="crumbbar">
    <button type="button" class="crumb-back" data-act="crumbback" aria-label="Back">${I('chevron_left', 'r', 22, ET.ink)}</button>
    <div class="crumbs">${parts.join('')}</div>
  </div>`;
}

/* ---------------- NtbReportScreen ---------------- */
Routes['/ntb-report'] = () => {
  const el = h(`<div style="background:${ET.background}">${appBar('NTB Performance', { back: true })}
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;background:${ET.background}">
      <div data-slot="fbar" style="padding:12px 16px 0"></div>
      <div data-slot="tabs"></div>
      <div data-slot="body" class="scroll" style="flex:1;min-height:0;position:relative"></div>
    </div></div>`);
  const slots = { fbar: el.querySelector('[data-slot=fbar]'), tabs: el.querySelector('[data-slot=tabs]'), body: el.querySelector('[data-slot=body]') };
  let lastKey = null, filterSheet = null, ctx = {};
  const vm = new NtbVM(() => { render(); filterSheet && filterSheet.render(); });

  function pillText(scope) {
    const s = vm.s, parts = [];
    if (s.pf === 'All') parts.push('All');
    else {
      const head = s.loginRole.id === 'ge' ? vm.bookHead() : s.loginRole.person;
      if (head) parts.push(head);
      parts.push(vm.pfLabel());
    }
    if (s.stream && s.pf !== 'DS') parts.push(vm.streamLabel());
    parts.push(...s.path);
    if (s.jump) parts.push(NTB_ROLE_LABEL[s.role] || s.role);
    if (!(s.pf === 'All' && scope === 'All measures')) parts.push(scope);
    parts.push(`as of ${F.date(vm.D.asOf)}`);
    return parts.join(' · ');
  }

  function homeHtml(charts) {
    const list = vm.pathBranches(0, []);
    const v = vm.agg(list, 'Branch');
    const rows = vm.rowsHere();
    let o = vm.s.refreshing ? `<div style="padding-bottom:10px">${linear(4)}</div>` : '';
    o += contextPill(pillText('All measures'));
    if (!list.length) return o + messageView(`No records in ${vm.pfLabel()} for ${vm.s.loginRole.person}${vm.s.stream ? ` (${vm.streamLabel()})` : ''}.`, 'Reset filters', 'reset');
    o += `<div style="height:14px"></div>${ntbHero(vm, v)}<div style="height:12px"></div>`;
    o += `${ntbYoYHeadlineCard(vm, v)}<div style="height:12px"></div>`;
    o += ntbChartCard({ title: `Accounts opened — by ${rows.level.label}`, subtitle: `${vm.pfLabel()} · top ${Math.min(8, rows.length)} ${rows.level.label}s of ${rows.length} by year to date · dashed line is YTD target`, rows, tabIndex: vm.s.graphTab, leadKey: 'ytd' }, charts);
    o += `<div style="height:12px"></div>`;
    NTB_CARDS.forEach(c => { o += ntbMeasureCard(c, v) + `<div style="height:12px"></div>`; });
    o += ntbRoleCardsSection(vm, list, ctx);
    o += ntbMomEntryRow(vm, list);
    return o;
  }

  function drillHtml(charts) {
    const list = vm.pathBranches();
    const v = vm.agg(list, vm.s.role);
    const rows = vm.rowsHere();
    ctx.rows = rows;
    const level = rows.level, meta = vm.measureMeta(), isFunded = vm.s.measure === 'funded', isYoy = vm.s.measure === 'yoy';
    const yrs = ntbYears(vm);
    const lv = vm.levels();
    const head = vm.s.path.length ? '' : vm.bookHead();
    const where = head || (vm.s.path.length ? vm.s.path[vm.s.path.length - 1] : vm.pfLabel());
    const whereSub = vm.s.path.length
      ? (list[0] ? ntbSubFor(lv[vm.s.path.length - 1], list[0]) : '')
      : `${vm.pfLabel()} · ${NTB_ROLE_LABEL[vm.s.role] || vm.s.role}`;

    let o = vm.s.refreshing ? `<div style="padding-bottom:10px">${linear(4)}</div>` : '';
    o += contextPill(pillText(meta.label.toUpperCase()));
    if (!list.length) return o + messageView('Nothing at this level for this selection.', 'Reset filters', 'reset');

    const leadVal = isYoy ? v.yoyVar : isFunded ? v.fytd : v.ytd;
    const ach = v.tytd ? (leadVal / v.tytd) * 100 : 0;
    const yoyNeg = v.yoyVar < 0;
    const yoyTone = F.delta(v.yoyVar);
    const yoyRatio = v.pyYtd > 0 ? Math.max(0, Math.min(100, (v.ytd / v.pyYtd) * 100)) : 0;
    const cells = isYoy
      ? [[`Opened YTD (${yrs.cur})`, v.ytd], [`Prior Yr (${yrs.py})`, v.pyYtd], ['YoY Growth %', v.yoyPct, 1, 2], [`Funded YTD (${yrs.cur})`, v.fytd], [`Prior Yr Funded`, v.pyFytd], ['Funded YoY Var', v.fyoyVar, 1, 0, v.fyoyPct]]
      : isFunded
        ? [['Funded Today', v.fday], ['Funded MTD', v.fmtd], ['Target YTD', v.tytd], ['Variance YTD', v.vytd, 1], ['Ach % MTD', v.amtd, 0, 1], ['Opened YTD', v.ytd]]
        : [['Opened Today', v.day], ['Opened MTD', v.mtd], ['Target YTD', v.tytd], ['Variance YTD', v.vytd, 1], ['Ach % MTD', v.amtd, 0, 1], ['Funded YTD', v.fytd]];
    const cell = ([l, val, signed, pctMode, pipePct]) => {
      const tone = signed && typeof val === 'number' ? F.delta(val) : ET.ink;
      const txt = pctMode === 2 ? ntbSignedPct(val) : pctMode === 1 ? P(val) : (signed ? F.signed(val, 0) : N(val));
      return `<div style="min-width:0">
        <div class="el1" style="${TB(9.5, 800, ET.muted, 0.3)}">${esc(l.toUpperCase())}</div><div style="height:4px"></div>
        <div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:1px">
          <span style="${TM(14, 900, tone)}">${txt}</span>${typeof pipePct === 'number' ? ntbYoYPipe(pipePct) : ''}
        </div></div>`;
    };

    const headDisplay = isYoy
      ? `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
          <div style="display:flex;align-items:baseline;gap:7px;min-width:0">
            <span style="${TD(26, 800, yoyTone, -0.8)}">${F.signed(leadVal, 0)}</span>
            <span style="${TB(10, 800, ET.muted)}">accounts</span>
          </div>
          <span class="badge-pct ${!yoyNeg ? 'over' : ''}" style="${yoyNeg ? `background:#FFF7ED;border:1px solid #FED7AA;color:${ET.negative}` : ''}">${yoyNeg ? '▼' : '▲'} ${ntbSignedPct(v.yoyPct)}</span>
        </div>
        <div style="${TB(10, 500, ET.muted)}margin-top:2px">as of ${F.date(vm.D.asOf)} · vs prior year YTD (${yrs.py})</div>
        <div style="height:12px"></div>
        <div style="display:flex;align-items:center"><span class="grow" style="${TB(10, 800, ET.muted, 0.3)}">VS PRIOR YEAR (${yrs.py})</span><span style="${TM(11, 700, ET.text2)}">${N(v.ytd)} vs ${N(v.pyYtd)}</span></div>
        <div style="height:6px"></div><div style="height:5px;border-radius:999px;background:${ET.tile};overflow:hidden"><div style="height:5px;width:${yoyRatio}%;background:${yoyTone}"></div></div>`
      : `<div style="display:flex;align-items:baseline;gap:7px"><span style="${TD(26, 800, ET.ink, -0.8)}">${N(leadVal)}</span><span style="${TB(10, 800, ET.muted)}">accounts</span></div>
        <div style="${TB(10, 500, ET.muted)}margin-top:2px">as of ${F.date(vm.D.asOf)}</div>
        <div style="height:12px"></div>
        <div style="display:flex;align-items:center"><span class="grow" style="${TB(10, 800, ET.muted, 0.3)}">AGAINST TARGET</span><span class="badge-pct ${ach >= 100 ? 'over' : ''}">${P(ach)}</span></div>
        <div style="height:6px"></div><div style="height:5px;border-radius:999px;background:${ET.tile};overflow:hidden"><div style="height:5px;width:${Math.max(0, Math.min(100, ach))}%;background:${meta.accent}"></div></div>`;

    o += `<div style="height:14px"></div><div class="esurf" style="border-radius:18px;padding:14px">
      <div class="el1" style="${TB(10, 800, isYoy ? yoyTone : meta.accent, 0.4)}">${esc(meta.label.toUpperCase())} · ${esc((NTB_ROLE_LABEL[vm.s.role] || vm.s.role).toUpperCase())}</div>
      <div style="height:2px"></div>
      <div class="el1" style="${TD(15, 700, ET.ink)}">${esc(where)}</div>
      <div class="el1" style="${TB(10.5, 600, ET.muted)}margin-top:1px">${esc(whereSub)}</div>
      <div style="height:10px"></div>
      ${headDisplay}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;margin-top:14px">${cells.map(cell).join('')}</div>
    </div>`;

    /* Chart */
    o += `<div style="height:12px"></div>` + ntbChartCard({
      title: where,
      subtitle: isYoy
        ? `${rows.length > 8 ? `Top 8 ${level.label}s of ${rows.length} by YoY variance · ` : ''}${yrs.py} YTD vs ${yrs.cur} YTD`
        : `${rows.length > 8 ? `Top 8 ${level.label}s of ${rows.length} · ` : ''}dashed line is YTD target`,
      rows, tabIndex: vm.s.graphTab, leadKey: vm.leadKey(),
      stats: isYoy
        ? [['PY YTD', v.pyYtd], ['Cur YTD', v.ytd], ['YoY Var', v.yoyVar, 1], ['Target', v.tytd]]
        : isFunded
          ? [['Today', v.fday], ['MTD', v.fmtd], ['YTD', v.fytd], ['Target', v.tytd]]
          : [['Today', v.day], ['MTD', v.mtd], ['YTD', v.ytd], ['Target', v.tytd]],
    }, charts) + `<div style="height:12px"></div>`;

    /* Entity board accordions */
    const top = list.slice().sort((a, b) => (b.m[vm.s.role][vm.leadKey()] || 0) - (a.m[vm.s.role][vm.leadKey()] || 0)).slice(0, 10);
    if (isYoy) {
      const topLead = top.length ? top[0].m[vm.s.role].yoyVar : 0;
      o += accordionCard({
        id: 'top',
        title: vm.s.pf === 'DS' ? `Top ${Math.min(10, list.length)} YoY officers` : `Top ${Math.min(10, list.length)} YoY gainers`,
        subtitle: `YoY Variance · ${yrs.cur} vs ${yrs.py}`,
        leadValue: topLead,
        leadText: `<span style="color:${F.delta(topLead)}">${F.signed(topLead, 0)}</span>`,
        leadCaption: vm.s.pf === 'DS' ? 'Top YoY officer' : 'Top YoY branch',
        leadIsCount: true, negTone: true,
        footer: `${F.count(list.length)} ${vm.s.pf === 'DS' ? 'officers' : 'branches'} in view`,
        rows: top.map(b => {
          const bm = b.m[vm.s.role];
          return {
            title: b.name, subtitle: `${b.code} · ${b.area}`, value: bm.yoyVar,
            text: `<span style="color:${F.delta(bm.yoyVar)}">${F.signed(bm.yoyVar, 0)}</span>${ntbYoYPipe(bm.yoyPct)}`,
            isCount: true, negTone: true, tip: vm.s.pf === 'DS' ? '' : EopData.whose(b.name),
          };
        }),
      }, vm.s.openAccordions.has('top')) + `<div style="height:10px"></div>`;

      const decl = list.filter(b => (b.m[vm.s.role].yoyVar || 0) < 0)
        .map(b => [b, b.m[vm.s.role].yoyVar]).sort((a, b) => a[1] - b[1]);
      const declTot = decl.reduce((t, x) => t + x[1], 0);
      o += accordionCard({
        id: 'behind', title: 'Negative YoY',
        subtitle: `${F.count(decl.length)} of ${F.count(list.length)} ${vm.s.pf === 'DS' ? 'officers' : 'branches'} below ${yrs.py} YTD`,
        leadValue: declTot,
        leadText: F.signed(declTot, 0),
        leadCaption: 'Total YoY decline', leadIsCount: true, negTone: true,
        footer: `Accounts below prior-year YTD (${yrs.py})`,
        rows: decl.slice(0, 6).map(([b, g]) => {
          const bm = b.m[vm.s.role];
          return {
            title: b.name, subtitle: `${b.code} · ${b.area}`, value: g,
            text: `${F.signed(g, 0)}${ntbYoYPipe(bm.yoyPct)}`,
            isCount: true, negTone: true, tip: vm.s.pf === 'DS' ? '' : EopData.whose(b.name),
          };
        }),
      }, vm.s.openAccordions.has('behind')) + `<div style="height:12px"></div>`;
    } else {
      o += accordionCard({
        id: 'top', title: vm.s.pf === 'DS' ? 'Top 10 officers' : `Top ${Math.min(10, list.length)} branches`,
        subtitle: `${meta.label} · year to date`,
        leadValue: top.length ? top[0].m[vm.s.role][vm.leadKey()] : 0, leadCaption: vm.s.pf === 'DS' ? 'Top officer' : 'Biggest branch', leadIsCount: true,
        footer: `${F.count(list.length)} ${vm.s.pf === 'DS' ? 'officers' : 'branches'} in view`,
        rows: top.map(b => ({ title: b.name, subtitle: `${b.code} · ${b.area}`, value: b.m[vm.s.role][vm.leadKey()], isCount: true, tip: vm.s.pf === 'DS' ? '' : EopData.whose(b.name) })),
      }, vm.s.openAccordions.has('top')) + `<div style="height:10px"></div>`;

      const short = list.filter(b => b.m[vm.s.role].tytd && (b.m[vm.s.role][vm.leadKey()] || 0) - b.m[vm.s.role].tytd < 0)
        .map(b => [b, (b.m[vm.s.role][vm.leadKey()] || 0) - b.m[vm.s.role].tytd]).sort((a, b) => a[1] - b[1]);
      const shortTot = short.reduce((t, x) => t + x[1], 0);
      o += accordionCard({
        id: 'behind', title: 'Behind target',
        subtitle: `${F.count(short.length)} of ${F.count(list.length)} ${vm.s.pf === 'DS' ? 'officers' : 'branches'} short of YTD target`,
        leadValue: shortTot, leadCaption: 'Total shortfall', leadIsCount: true, negTone: true,
        footer: 'Accounts short of target',
        rows: short.slice(0, 6).map(([b, g]) => ({ title: b.name, subtitle: `${b.code} · ${b.area}`, value: g, isCount: true, negTone: true, tip: vm.s.pf === 'DS' ? '' : EopData.whose(b.name) })),
      }, vm.s.openAccordions.has('behind')) + `<div style="height:12px"></div>`;
    }

    /* 4.6 Listing (tap-to-drill, NO inline tree) */
    const sortCols = [{ k: 'n', label: vm.s.pf === 'DS' ? 'Officers' : 'Branches' }, ...NTB_COLS];
    const curSort = sortCols.find(c => c.k === vm.s.sortCol) || sortCols[1];
    o += sectionHeading(`${meta.label.toUpperCase()} · ${(NTB_ROLE_LABEL[vm.s.role] || vm.s.role).toUpperCase()} · BY ${level.label.toUpperCase()}`, `${F.count(rows.length)} rows`);
    o += `<div style="height:10px"></div>` + sortBar(curSort.label, vm.s.sortDesc) + `<div style="height:12px"></div>`;
    rows.forEach(r => { o += ntbEntityCard(vm, r, level) + `<div style="height:12px"></div>`; });
    o += ntbMomEntryRow(vm, list);

    /* 4.4 Role cards on EVERY level (below listing on drill levels) */
    o += ntbRoleCardsSection(vm, list, ctx);
    return o;
  }

  function render() {
    const s = vm.s, count = vm.activeFilterCount();
    slots.fbar.innerHTML = `<div data-act="filters" style="height:40px;padding:0 12px;background:#fff;border-radius:14px;border:1px solid ${ET.pillBorder};display:flex;align-items:center;cursor:pointer">
      ${I('tune', 'r', 18, ET.primary)}<span style="width:8px"></span><span style="${TB(13, 800, ET.ink)}">Filters</span>
      ${count > 0 ? `<span style="width:7px"></span><span style="min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:${ET.primary};display:flex;align-items:center;justify-content:center;${TB(10, 800, '#fff')}">${count}</span>` : ''}
      <span class="grow"></span>${I('keyboard_arrow_down', 'r', 20, ET.muted)}</div>`;

    if (!s.measure) {
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

    const key = `${s.loginRole.id}|${s.pf}|${s.stream}|${s.measure}|${s.role}|${s.jump}|${s.path.join('>')}`;
    const charts = []; ctx = {};
    const inner = s.measure ? drillHtml(charts) : homeHtml(charts);
    const keep = key === lastKey ? body.scrollTop : 0;
    body.innerHTML = `<div style="padding:12px 16px 32px">${inner}</div>`;
    body.scrollTop = keep; lastKey = key;
    $$('.trend', body).forEach(t => { t.innerHTML = trendSvg(t.clientWidth || 354, charts[+t.dataset.ci]); });
  }

  /* 1.5 Filters sheet: Portfolio -> Stream -> level selects + Reset & Done */
  function openFilterSheet() {
    const content = h(`<div style="display:flex;flex-direction:column;min-height:0;max-height:inherit"></div>`);
    let groups = [];
    const renderSheet = () => {
      const s = vm.s, prev = content.querySelector('.fs-list'), st = prev ? prev.scrollTop : 0;
      groups = [];
      if (s.measure) {
        const lv = vm.levels();
        for (let i = 0; i <= s.path.length && i < lv.length; i++) {
          const opts = vm.choicesAt(i);
          if (opts.length) groups.push({ i, label: lv[i].label, allLabel: `All ${lv[i].label}s`, selected: s.path[i] || '', options: opts });
        }
      }
      const pfs = vm.openPortfolios(), locked = pfs.length <= 1;
      const label = t => `<div style="padding-bottom:8px;${TB(10, 800, ET.muted, 0.6)}">${esc(t.toUpperCase())}</div>`;
      const field = (text, icon, act, extra = '', disabled = false) => `<div class="eop-dd" ${disabled ? '' : `data-act="${act}"`} ${extra} style="${disabled ? 'opacity:.6;cursor:default' : ''}"><span class="el1 grow" style="${TB(14, 600, ET.ink)}">${esc(text)}</span>${I(icon[0], icon[1], 20, ET.muted)}</div>`;
      content.innerHTML = `
        <div style="padding:18px 18px 14px;display:flex;align-items:center;flex:none"><span class="grow" style="${TD(18, 800, ET.ink)}">Filters</span>
          <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer">${I('close', 'r', 16, ET.ink)}</div></div>
        <div style="height:1px;background:${ET.grid};flex:none"></div>
        ${s.refreshing ? `<div style="flex:none">${linear(2)}</div>` : ''}
        <div class="fs-list scroll" style="flex:1 1 auto;min-height:0;padding:16px 18px 10px">
          ${label('Portfolio')}${field(vm.pfLabel() + (locked ? ' (fixed by login)' : ''), ['keyboard_arrow_down', 'r'], 'fs_pf', '', locked)}
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

  el.addEventListener('click', async e => {
    const t = e.target.closest('[data-act]'); if (!t || !el.contains(t)) return;
    const act = t.dataset.act, id = t.dataset.id;
    if (act === 'tip') { e.stopPropagation(); showTipSheet(t.dataset.title, t.dataset.tip); return; }
    switch (act) {
      case 'filters': openFilterSheet(); break;
      case 'pf': vm.selectPortfolio(id); break;
      case 'reset': vm.resetFilters(); break;
      case 'card': vm.selectCard(id); break;
      case 'gtab': vm.set({ graphTab: +t.dataset.i }); break;
      case 'home': vm.set({ measure: null, role: 'Branch', path: [], jump: '', openAccordions: new Set() }); break;
      case 'crumb': vm.goToCrumb(+t.dataset.i); break;
      case 'crumbback': vm.handleBack(); break;
      case 'roledrill': vm.openRoleCard(id); break;
      case 'mom': openNtbMomSheet(t.dataset.block, t.dataset.note || ''); break;
      case 'roledetails': {
        e.stopPropagation();
        const r = (ctx.roleRows || [])[+t.dataset.i]; if (!r) break;
        const v = r.v;
        const yrs = ntbYears(vm);
        eopDetailSheet(`${r.role} · NTB Performance · ${r.where}`, [
          { name: 'HC ACT', value: r.hc, type: 'count' },
          { name: 'Opened Today', value: v.day, type: 'count' },
          { name: 'Opened MTD', value: v.mtd, type: 'count' },
          { name: 'Opened YTD', value: v.ytd, type: 'count' },
          { name: `Prior Year YTD (${yrs.py})`, value: v.pyYtd, type: 'count' },
          { name: 'YoY Variance (Opened)', value: v.yoyVar, signed: true, html: `${F.signed(v.yoyVar, 0)}${ntbYoYPipe(v.yoyPct)}` },
          { name: 'Funded Today', value: v.fday, type: 'count' },
          { name: 'Funded MTD', value: v.fmtd, type: 'count' },
          { name: 'Funded YTD', value: v.fytd, type: 'count' },
          { name: `Prior Year Funded (${yrs.py})`, value: v.pyFytd, type: 'count' },
          { name: 'YoY Variance (Funded)', value: v.fyoyVar, signed: true, html: `${F.signed(v.fyoyVar, 0)}${ntbYoYPipe(v.fyoyPct)}` },
          { name: 'Target MTD', value: v.tmtd, type: 'count' },
          { name: 'Target YTD', value: v.tytd, type: 'count' },
          { name: 'Target Variance MTD', value: v.vmtd, type: 'count', signed: true },
          { name: 'Target Variance YTD', value: v.vytd, type: 'count', signed: true },
          { name: 'Zero Balance', value: r.zero, type: 'count' },
          { name: 'PROD PER DAY MTD', html: typeof r.pMtd === 'number' ? F.number(r.pMtd, 2) : '—' },
          { name: 'PROD PER DAY YTD', html: typeof r.pYtd === 'number' ? F.number(r.pYtd, 2) : '—' },
        ]);
        break;
      }
      case 'acc': {
        const o = new Set(vm.s.openAccordions);
        if (!o.delete(id)) o.add(id);
        vm.set({ openAccordions: o }, true);
        const open = vm.s.openAccordions.has(id);
        t.classList.toggle('open', open);
        t.querySelector('.acc-arrow').innerHTML = I(open ? 'keyboard_arrow_up' : 'keyboard_arrow_down', 'r', 20, ET.muted);
        break;
      }
      case 'sortfield': {
        const cols = [{ k: 'n', label: vm.s.pf === 'DS' ? 'Officers' : 'Branches' }, ...NTB_COLS];
        const v = await openMenu(t, cols.map(c => ({ value: c.k, html: `<span style="${TB(13, c.k === vm.s.sortCol ? 800 : 600, c.k === vm.s.sortCol ? ET.primary : ET.text2)}">${esc(c.label)}</span>` })));
        if (v !== undefined) vm.set({ sortCol: v });
        break;
      }
      case 'sortdir': vm.set({ sortDesc: !vm.s.sortDesc }); break;
      case 'open': { const r = (ctx.rows || []).find(x => x.id === id); if (r) vm.openRow(r); break; }
      case 'details': {
        e.stopPropagation();
        const r = (ctx.rows || []).find(x => x.id === id); if (!r) break;
        const pctFor = k => (k === 'yoyVar' ? r.m.yoyPct : k === 'fyoyVar' ? r.m.fyoyPct : null);
        eopDetailSheet(r.sub ? `${r.label} · ${r.sub}` : r.label, [
          { name: vm.s.pf === 'DS' ? 'Officers' : 'Branches', value: r.n, type: 'count' },
          ...NTB_COLS.map(c => {
            const p = pctFor(c.k);
            return p != null
              ? { name: c.label, value: r.m[c.k], signed: true, html: `${F.signed(r.m[c.k], 0)}${ntbYoYPipe(p)}` }
              : { name: c.label, value: r.m[c.k], type: 'count', signed: !!c.signed };
          }),
          { name: 'Funded Today', value: r.m.fday, type: 'count' },
          { name: 'Ach % MTD', value: r.m.amtd, type: 'percent' },
          { name: 'Ach % YTD', value: r.m.aytd, type: 'percent' },
        ]);
        break;
      }
    }
  });

  const back = () => { if (vm.handleBack()) return; vm.disposed = true; Nav.go('/home'); };
  el.querySelector('[data-a=back]').onclick = back;
  render();
  vm.loadData();
  return { el, light: true, bg: ET.background, onBack: back, vm, openFilterSheet, destroy() { vm.disposed = true; } };
};
