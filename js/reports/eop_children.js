/* =====================================================================
   EOP Child Reports — 4 for Retail (RBH -> AH -> CM -> SC), 2 for SME (RBH-SME -> HM -> SC), 0 for others
   3.1 RBH YTD Movement (Retail) | 3.2 Inflow / Outflow (Retail & SME)
   3.3 Week on Week (Retail)     | 3.4 Behind Base (Retail & SME, never mixed) (+ 3.5 scope)
   Follows Main EOP's exact drill-down flow: one level per screen, totals at the top, AppBar/hardware Back steps up one level at a time.
   ===================================================================== */

const MV_SP_AUG = 14, MV_FTM_SEP = 15, MV_FTM_OCT = 16, MV_YTD_OCT = 18, MV_CHANGE = 19;
const W_SP = 0, W_TODAY = 4, W_ODC = 5, W_YTD = 7, W_WTD = 8, W_COMM = 9, W_VAR = 10;

function childSumM(list) {
  const out = [];
  list.forEach(m => (m || []).forEach((v, i) => {
    if (typeof v === 'number') out[i] = (out[i] || 0) + v;
    else if (out[i] === undefined) out[i] = null;
  }));
  return out;
}

function childActiveSeg(vm) {
  if (vm.s.role.portfolio === 'SME' || vm.s.pf === 'SME') return 'SME';
  if (vm.s.role.portfolio === 'Retail' || vm.s.pf === 'Retail') return 'Retail';
  return vm.s.childSeg === 'SME' ? 'SME' : 'Retail';
}

function childSegToggleHtml(vm, seg) {
  /* Shown ONLY on Level 1 of 2-segment child reports (Inflow/Outflow & Behind Base) when opened from 'All' by whole-book login */
  if (vm.s.pf !== 'All' || vm.s.role.portfolio !== 'Both') return '';
  return `<div style="display:flex;gap:8px;margin-bottom:12px">${['Retail', 'SME'].map(s => {
    const on = s === seg;
    return `<button type="button" data-act="chseg" data-id="${s}" style="flex:1;height:36px;border-radius:12px;border:1px solid ${on ? ET.primary : ET.pillBorder};background:${on ? ET.primary : '#fff'};cursor:pointer;${TB(12.5, 700, on ? '#fff' : ET.ink)}">${s === 'Retail' ? 'Retail (RBH)' : 'SME (RBH-SME)'}</button>`;
  }).join('')}</div>`;
}

function childMinDepth(vm, isSme = false) {
  const s = (vm.s.role && vm.s.role.scope) || {};
  if (isSme) {
    if (s.branch || s.hm) return 2; // SME Level 3: Service Centers
    if (s.rbhSme) return 1;         // SME Level 2: Hub Managers
    return 0;                       // SME Level 1: RBH-SMEs
  }
  if (s.branch || s.cm) return 3;   // Retail Level 4: Service Centers
  if (s.areaHead) return 2;         // Retail Level 3: Cluster Managers
  if (s.rbh) return 1;              // Retail Level 2: Area Heads
  return 0;                         // Retail Level 1: RBHs
}

function childWho(vm) {
  const sc = EopData.childScope(vm.s.role);
  return sc ? ` · ${vm.s.role.person}’s share` : '';
}

function childTopChrome(vm, title, subtitle) {
  return `<div style="margin-bottom:12px">
    <div style="padding:12px 14px;background:#fff;border-radius:18px;border:1px solid ${ET.border}">
      <div style="${TD(15.5, 800, ET.ink, -0.2)}">${esc(title)}</div>
      <div style="margin-top:4px;${TB(11, 500, ET.muted, null, 15)}">${esc(subtitle)}</div>
    </div>
  </div>`;
}

function childNoneHtml(vm, what) {
  const sc = EopData.childScope(vm.s.role);
  const body = vm.s.role.portfolio === 'SME'
    ? `<b>${esc(what)} carries Retail branches only.</b> SME logins do not have Retail RBH rows in this report.`
    : `<b>Nothing in ${esc(what)} falls under ${esc(vm.s.role.person)}.</b> None of the ${F.count(sc ? sc.n : 0)} branches this login holds appears in the file.`;
  return `<div class="note-box">${I('description', 'o', 18, '#B45309')}<div>${body}</div></div>`;
}

function chDelta(v) {
  if (typeof v !== 'number' || isNaN(v)) return `<span style="${TM(12.5, 600, ET.muted)}">–</span>`;
  return `<span style="${TM(12.5, 700, F.delta(v))}">${F.signed(v)}</span>`;
}

function chChevron() {
  return `<div class="pillbtn" style="background:rgba(4,120,87,.08);border:1px solid rgba(4,120,87,.22)">${I('chevron_right', 'r', 18, ET.primary)}</div>`;
}

function seedRand(seed) {
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

/* ---------------- 3.1 RBH YTD Movement (Retail ONLY: RBH -> AH -> CM -> SC) ---------------- */
let _mvClusterMap = null;
function mvClusterInfo(name) {
  if (!_mvClusterMap) {
    _mvClusterMap = {};
    const g = (WEB_DATA.eop_move || {}).cm || {};
    const k = (g.groups || [])[0];
    (g.rows || []).forEach(r => {
      const v = (r.groups && r.groups[k]) || [];
      _mvClusterMap[r.ids[3]] = {
        mtd: typeof v[MV_FTM_OCT] === 'number' && typeof v[MV_FTM_SEP] === 'number' ? v[MV_FTM_OCT] - v[MV_FTM_SEP] : null,
        cm: r.ids[4], area: r.ids[6], ah: r.ids[7],
      };
    });
  }
  return _mvClusterMap[name] || {};
}
function mvTip(clusterName) {
  const x = mvClusterInfo(clusterName), bits = [];
  if (x.cm) bits.push('Cluster Manager: ' + x.cm);
  bits.push('Cluster Branch: ' + clusterName);
  if (x.ah) bits.push('Area Head: ' + x.ah);
  if (x.area) bits.push('Area: ' + x.area);
  return bits.join('\n');
}

function mvCut(vm) {
  const d = WEB_DATA.eop_move || {};
  const sc = EopData.childScope(vm.s.role);
  const enrichArea = a => {
    let mtd = 0, anyMtd = false, areaName = '';
    (a.clusters || []).forEach(c => {
      const x = mvClusterInfo(c.name);
      if (typeof x.mtd === 'number') { mtd += x.mtd; anyMtd = true; }
      if (!areaName && x.area) areaName = x.area;
    });
    return { ...a, areaName, mtd: anyMtd ? mtd : null };
  };
  if (!sc) {
    return { ...d, heads: (d.heads || []).map(h => ({ ...h, areas: (h.areas || []).map(enrichArea) })) };
  }
  const keepCl = c => !!sc.cmNames[c.name];
  const heads = [];
  (d.heads || []).forEach(h => {
    const areas = [];
    (h.areas || []).forEach(a => {
      const cl = (a.clusters || []).filter(keepCl);
      if (!cl.length) return;
      let dl = 0; cl.forEach(c => { dl += c.delta || 0; });
      areas.push(enrichArea({ ah: a.ah, delta: dl, clusters: cl }));
    });
    if (!areas.length) return;
    let hd = 0, negA = 0, negC = 0, nC = 0;
    areas.forEach(a => {
      hd += a.delta;
      if (a.delta < 0) negA++;
      a.clusters.forEach(c => { nC++; if (c.delta < 0) negC++; });
    });
    heads.push({
      rbh: h.rbh, delta: hd,
      counts: (h.counts || []).map(c => {
        const isArea = /area/i.test(c.label);
        return { label: c.label, text: `${isArea ? negA : negC} out of ${isArea ? areas.length : nC}` };
      }),
      areas,
    });
  });
  const filterGrid = (g, col, set) => {
    g = g || {};
    return { ...g, rows: (g.rows || []).filter(r => !!set[r.ids[col]]) };
  };
  return { ...d, heads, cm: filterGrid(d.cm, 2, sc.cmKeys), sc: filterGrid(d.sc, 3, sc.keys) };
}

function renderMovement(vm) {
  const m = mvCut(vm);
  const heads = m.heads || [];
  const minDepth = childMinDepth(vm, false);
  const title = String(m.title || 'CA Campaign Tracker - YTD Average Change from August 2026').replace(/Campaing/i, 'Campaign');
  const sub = `Current Account, Retail · all values in PKR Million${m.cm_as_of ? ` · ${m.cm_as_of}` : ''}${childWho(vm)}`;

  if (!heads.length) return childTopChrome(vm, title, sub) + childNoneHtml(vm, 'The CA campaign tracker');

  if (minDepth >= 1 && !vm.s.mvHead && heads.length === 1) vm.s.mvHead = heads[0].rbh;
  const picked = heads.find(h => h.rbh === vm.s.mvHead) || null;
  if (vm.s.mvHead && !picked) { vm.s.mvHead = ''; vm.s.mvAh = ''; vm.s.mvCluster = ''; }

  const areas = (picked && picked.areas) || [];
  if (picked && minDepth >= 2 && !vm.s.mvAh && areas.length === 1) vm.s.mvAh = areas[0].ah;
  const pickedAh = areas.find(a => a.ah === vm.s.mvAh) || null;
  if (vm.s.mvAh && !pickedAh) { vm.s.mvAh = ''; vm.s.mvCluster = ''; }

  const clusters = (pickedAh && pickedAh.clusters) || [];
  if (pickedAh && minDepth >= 3 && !vm.s.mvCluster && clusters.length === 1) vm.s.mvCluster = clusters[0].name;
  const pickedCl = clusters.find(c => c.name === vm.s.mvCluster) || null;
  if (vm.s.mvCluster && !pickedCl) vm.s.mvCluster = '';

  /* LEVEL 1: Retail RBH list */
  if (!picked) {
    let o = childTopChrome(vm, title, sub);
    o += sectionHeading('BY RBH · RETAIL', `${F.count(heads.length)} heads`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Δ YTD average vs 26-Aug-26 · tap an RBH to view Area Heads</div>`;
    heads.forEach(h => {
      o += `<div class="esurf tap" data-act="mvhead" data-id="${esc(h.rbh)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px">
        <div class="grow">
          <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(h.rbh)}</div>
          <div style="margin-top:4px;display:flex;flex-direction:column;gap:2px">
            ${(h.counts || []).map(c => `<div class="el1" style="${TB(10.5, 600, ET.muted)}">${esc(c.label)} · <b style="color:${ET.text2}">${esc(c.text)}</b></div>`).join('')}
          </div>
        </div>
        <div style="text-align:right;flex:none">
          <div style="${TB(9, 700, ET.muted)}">Δ YTD</div>
          <div style="${TD(19, 800, F.delta(h.delta || 0))}">${F.signed(h.delta || 0)}</div>
        </div>
        ${chChevron()}
      </div>`;
    });
    return o;
  }

  /* LEVEL 2: Area Heads under picked RBH */
  if (!pickedAh) {
    let o = contextPill(`Retail · ${picked.rbh} · RBH YTD Movement${childWho(vm)}`);
    o += `<div class="esurf" style="border-radius:18px;padding:14px;margin-top:12px">
      <div style="${TB(10, 800, ET.primary, 0.6)}">RETAIL · REGIONAL BUSINESS HEAD</div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:4px">
        <div class="el1" style="${TD(17, 800, ET.ink)}">${esc(picked.rbh)}</div>
        <div style="${TD(22, 800, F.delta(picked.delta || 0))}white-space:nowrap">${F.signed(picked.delta || 0)}</div>
      </div>
      <div style="${TB(10.5, 500, ET.muted)}margin-top:2px">Δ YTD average vs 26-Aug-26 · PKR Mn</div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:flex;flex-wrap:wrap;gap:6px 16px">
        ${(picked.counts || []).map(c => `<span style="${TB(11, 600, ET.muted)}">${esc(c.label)} · <b style="color:${ET.ink}">${esc(c.text)}</b></span>`).join('')}
      </div>
    </div>`;

    o += `<div style="height:14px"></div>` + sectionHeading(`BY AREA HEAD · ${picked.rbh.toUpperCase()}`, `${F.count(areas.length)} area heads`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Δ YTD vs 26-Aug-26 · Δ MTD is Oct vs Sep monthly average · tap an Area Head to view Cluster Managers</div>`;
    areas.forEach(a => {
      o += `<div class="esurf tap" data-act="mvah" data-id="${esc(a.ah)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="grow">
            <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(a.ah)}</div>
            <div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${a.areaName ? `${esc(a.areaName)} · ` : ''}${F.count((a.clusters || []).length)} clusters</div>
          </div>
          ${chChevron()}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><div style="${TB(9, 700, ET.muted)}">Δ MTD</div><div style="margin-top:2px">${chDelta(a.mtd)}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">Δ YTD</div><div style="margin-top:2px">${chDelta(a.delta)}</div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* LEVEL 3: Cluster Managers under picked Area Head */
  if (!pickedCl) {
    let o = contextPill(`Retail · ${picked.rbh} · ${pickedAh.ah}${childWho(vm)}`);
    o += `<div class="esurf" style="border-radius:18px;padding:14px;margin-top:12px">
      <div style="${TB(10, 800, ET.primary, 0.6)}">RETAIL · AREA HEAD</div>
      <div class="el1" style="margin-top:3px;${TD(16.5, 800, ET.ink)}">${esc(pickedAh.ah)}</div>
      ${pickedAh.areaName ? `<div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(pickedAh.areaName)} · ${F.count(clusters.length)} clusters</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid}">
        <div><div style="${TB(9, 700, ET.muted)}">Δ MTD</div><div style="margin-top:2px">${chDelta(pickedAh.mtd)}</div></div>
        <div><div style="${TB(9, 700, ET.muted)}">Δ YTD</div><div style="margin-top:2px">${chDelta(pickedAh.delta)}</div></div>
      </div>
    </div>`;

    o += `<div style="height:14px"></div>` + sectionHeading(`BY CLUSTER MANAGER · ${pickedAh.ah.toUpperCase()}`, `${F.count(clusters.length)} clusters`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Tap a Cluster Manager to view Service Centers</div>`;
    clusters.forEach(c => {
      const ciInfo = mvClusterInfo(c.name);
      const cmLabel = ciInfo.cm || c.name;
      o += `<div class="esurf tap" data-act="mvcl" data-id="${esc(c.name)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px">
          <div class="grow">
            <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(cmLabel)}</div>
            <div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(c.name)}</div>
          </div>
          ${infoBtn(cmLabel, mvTip(c.name))}
          ${chChevron()}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><div style="${TB(9, 700, ET.muted)}">Δ MTD</div><div style="margin-top:2px">${chDelta(ciInfo.mtd)}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">Δ YTD</div><div style="margin-top:2px">${chDelta(c.delta)}</div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* LEVEL 4: Service Centers under picked Cluster Manager (Total card at top) */
  const grid = m.sc || {};
  const rows = (grid.rows || []).filter(r => r.ids[6] === pickedCl.name);
  const ciInfo = mvClusterInfo(pickedCl.name);
  const cmLabel = ciInfo.cm || pickedCl.name;
  let o = contextPill(`Retail · ${picked.rbh} · ${pickedAh.ah} · ${cmLabel}${childWho(vm)}`);
  if (!rows.length) {
    o += `<div style="height:12px"></div>` + sectionHeading(`BY SERVICE CENTER · ${cmLabel.toUpperCase()}`, '0 branches');
    return o + messageView('No Service Centers listed for this cluster.');
  }

  const grpKey = (grid.groups || ['Current Account'])[0];
  const sum = { aug: 0, oct: 0, d: 0, m: 0 };
  const add = (k, x) => { if (typeof x === 'number') sum[k] += x; };
  const said = pickedCl.delta;
  const cell = (l, html) => `<div style="min-width:0"><div class="el1" style="${TB(9.5, 700, ET.muted)}">${l}</div><div style="margin-top:3px">${html}</div></div>`;

  const branchCards = rows.map(r => {
    const v = (r.groups && r.groups[grpKey]) || [];
    const bm = typeof v[MV_FTM_OCT] === 'number' && typeof v[MV_FTM_SEP] === 'number' ? v[MV_FTM_OCT] - v[MV_FTM_SEP] : null;
    add('aug', v[MV_SP_AUG]); add('oct', v[MV_YTD_OCT]); add('d', v[MV_CHANGE]); add('m', bm);
    const brName = r.ids[4], stream = r.ids[11] || '';
    return `<div class="esurf" style="border-radius:16px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:6px">
        <div class="grow">
          <div class="el2" style="${TB(13.5, 700, ET.ink)}">${esc(brName)}</div>
          ${stream ? `<div style="margin-top:2px;${TB(10.5, 600, ET.muted)}">${esc(stream)}</div>` : ''}
        </div>
        ${infoBtn(brName, EopData.whose(brName))}
      </div>
      <div style="height:10px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;padding-top:10px;border-top:1px solid ${ET.grid}">
        ${cell('Δ MTD', chDelta(bm))}
        ${cell('SP AVG 26-AUG-26', `<span style="${TM(12.5, 700, ET.ink)}">${F.number(v[MV_SP_AUG])}</span>`)}
        ${cell('YTD AVG OCT', `<span style="${TM(12.5, 700, ET.ink)}">${F.number(v[MV_YTD_OCT])}</span>`)}
        ${cell('Δ YTD', chDelta(v[MV_CHANGE]))}
      </div>
    </div>`;
  }).join('');

  const gap = typeof said === 'number' ? sum.d - said : 0;
  const mismatch = Math.abs(gap) > 0.05
    ? `<div class="note-box" style="margin-bottom:10px">${I('info_outline', 'f', 18, '#B45309')}<div>These branches come to <b>${F.number(sum.d)}</b>, while the cluster line reads <b>${F.number(said)}</b>. The workbook’s cluster sheet and branch sheet put a branch in different clusters here; area and RBH totals tie exactly.</div></div>`
    : '';

  const totalCard = `<div class="esurf" style="border-radius:16px;padding:13px 14px;margin-top:12px;background:#F2FAF6;border-color:rgba(4,120,87,.25)">
    <div style="${TB(12.5, 800, ET.primary)}">Total · ${F.count(rows.length)} ${rows.length === 1 ? 'branch' : 'branches'}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(4,120,87,.15)">
      ${cell('Δ MTD', chDelta(sum.m))}
      ${cell('SP AVG 26-AUG-26', `<span style="${TM(13, 800, ET.ink)}">${F.number(sum.aug)}</span>`)}
      ${cell('YTD AVG OCT', `<span style="${TM(13, 800, ET.ink)}">${F.number(sum.oct)}</span>`)}
      ${cell('Δ YTD', chDelta(sum.d))}
    </div>
  </div>`;

  const scHead = `<div style="height:14px"></div>` + sectionHeading(`BY SERVICE CENTER · ${cmLabel.toUpperCase()}`, `${F.count(rows.length)} ${rows.length === 1 ? 'branch' : 'branches'}`) +
    `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">${esc(pickedCl.name)} · tracker’s own Service Center sheet · Δ MTD from live FTM Avg columns</div>`;

  return o + totalCard + scHead + mismatch + branchCards;
}

/* ---------------- 3.2 Inflow / Outflow (Retail & SME, strictly separate) ---------------- */
const FL_PERIODS = [{ k: 'odc', label: 'ODC' }, { k: 'mtd', label: 'MTD' }, { k: 'ytd', label: 'YTD' }];
const SME_FL_TOP = { odc: [26, 18], mtd: [115, 80], ytd: [430, 300] };
const FL_CLIENT_POOL = [
  'INDUS VALLEY TEXTILES (PVT) LTD',
  'CRESCENT AGRO TRADERS',
  'AL-MADINA FLOUR & GENERAL MILLS',
  'MEHRAN STEEL & RE-ROLLING MILLS',
  'NATIONAL PHARMA DISTRIBUTORS',
  'PAK ARAB LOGISTICS (PVT) LTD',
  'CHENAB FEED INDUSTRIES',
  'SILVER AGRI COMMODITIES',
  'SUMMIT ENGINEERING WORKS',
  'ZAM ZAM RICE EXPORTERS',
  'RAVI PACKAGING & POLYMERS',
  'SULTAN CHEMICALS & DYES',
  'FAISAL COTTON GINNING FACTORY',
  'KOHINOOR BUILDERS & DEVELOPERS',
  'AL-HARAM TRADING CORPORATION',
  'AL-BARAKA COLD STORAGE & FOODS',
  'MERIDIAN FREIGHT SERVICES',
  'APEX AUTO PARTS SYNDICATE',
  'HORIZON SOLAR ENERGY (PVT) LTD',
  'GANDHARA MEDICAL SUPPLIES',
  'ORIENT LEATHER & GARMENTS',
  'SHALIMAR PAPER & BOARD MILLS',
  'DELTA DIAGNOSTIC LABORATORIES',
  'PLATINUM MARBLE & GRANITE',
  'EVERGREEN FERTILIZER DEALERS',
  'DECCAN SUGAR & ALLIED TRADERS',
  'UNITED TEXTILE WEAVING MILLS',
  'STAR POULTRY & HATCHERIES',
  'PAKISTAN DAIRY PRODUCTS (PVT) LTD',
  'GLOBAL PETROLEUM CARRIERS',
  'CLASSIC CERAMICS & TILES',
  'NORTHERN HARDWARE & TOOLS',
  'GREENLAND SEEDS & PESTICIDES',
  'PRIME SURGICAL INSTRUMENTS',
  'PREMIER ENGINEERING ASSOCIATES',
  'SILK ROUTE IMPORT & EXPORT',
  'NATIONAL GRAIN MERCHANTS',
  'DIAMOND FOUNDRY WORKS',
  'ROYAL SPORTS MANUFACTURING CO',
  'GOLDEN DRY FRUITS SYNDICATE',
  'CHAUDHRY MUHAMMAD SALEEM',
  'SYED WAQAR HUSSAIN SHAH',
  'MALIK TARIQ MAHMOOD',
  'RANA IMRAN ASHRAF',
  'HAJI MUHAMMAD AKRAM & SONS',
  'SHEIKH ZAHID MEHMOOD',
  'MIAN KASHIF NADEEM',
  'SARDAR FAROOQ AHMED KHAN',
  'KHWAJA SALMAN RASHEED',
  'DR. NAVEED ANWAR QURESHI',
  'HAFIZ MUHAMMAD BILAL',
  'MIRZA KAMRAN BAIG',
  'QAZI ASADULLAH SIDDIQUI',
  'CHAUDHRY SAJID ALI',
  'SYED FAISAL ABBAS RIZVI',
  'MUHAMMAD USMAN GHANI',
  'ZAFAR IQBAL & CO',
  'AL-NOOR OIL & GHEE MILLS',
  'ALLIED TRACTOR IMPLEMENTS',
  'SILVER LINE APPAREL (PVT) LTD',
  'HARVEST FOODS & BEVERAGES',
  'ATLAS CABLE & ELECTRIC CO',
  'METROPOLITAN REALTY GROUP',
  'PIONEER CONSTRUCTION SERVICES',
];
const _flHeadCache = new Map();
let _flBranchIdx = null;
let _flActionStore = { branches: [], clients: [] };

function flBranchByName(name, seg) {
  if (!name) return null;
  if (!_flBranchIdx) {
    const byExact = new Map();
    const bySegLc = new Map();
    const byAnyLc = new Map();
    const list = EopData.get().branches;
    list.forEach(b => {
      if (!b.name) return;
      const lc = b.name.toLowerCase();
      if (!byExact.has(b.name)) byExact.set(b.name, b);
      if (!bySegLc.has(b.segment + '|' + lc)) bySegLc.set(b.segment + '|' + lc, b);
      if (!byAnyLc.has(lc)) byAnyLc.set(lc, b);
    });
    _flBranchIdx = { byExact, bySegLc, byAnyLc, list };
  }
  const lc = String(name).trim().toLowerCase();
  if (seg && _flBranchIdx.bySegLc.has(seg + '|' + lc)) return _flBranchIdx.bySegLc.get(seg + '|' + lc);
  if (_flBranchIdx.byExact.has(name)) return _flBranchIdx.byExact.get(name);
  if (_flBranchIdx.byAnyLc.has(lc)) return _flBranchIdx.byAnyLc.get(lc);
  const pfx = lc.slice(0, 22);
  if (pfx.length >= 12) {
    const hit = _flBranchIdx.list.find(b => {
      if (seg && b.segment !== seg) return false;
      const blc = b.name.toLowerCase();
      return blc.startsWith(pfx) || lc.startsWith(blc.slice(0, 22));
    });
    if (hit) return hit;
  }
  return null;
}

function flBranchTip(name, seg) {
  const existing = EopData.whose(name);
  if (existing) return existing;
  const b = flBranchByName(name, seg);
  if (!b) return '';
  const bits = [];
  if (b.area) bits.push('Area: ' + b.area);
  if (b.ah && seg !== 'SME') bits.push('Area Head: ' + b.ah);
  if (b.cm && seg !== 'SME') bits.push('Cluster Manager: ' + b.cm);
  if (b.hm) bits.push('Hub Manager: ' + b.hm);
  if (seg === 'SME' ? b.rbhSme : b.rbh) bits.push((seg === 'SME' ? 'RBH-SME: ' : 'RBH: ') + (seg === 'SME' ? b.rbhSme : b.rbh));
  if (b.type) bits.push(b.type);
  return bits.join('\n');
}

function smeFlowsCut(vm) {
  const sc = EopData.childScope(vm.s.role);
  const byHead = new Map();
  ((WEB_DATA.eop_sc || {}).rows || []).forEach(r => {
    const id = r.ids;
    if (id[2] !== 'SME' || !id[19]) return;
    if (sc && !sc.keys[id[3]]) return;
    if (!byHead.has(id[19])) byHead.set(id[19], []);
    if (id[4]) byHead.get(id[19]).push(id[4]);
  });
  const heads = [...byHead.entries()].map(([rbh, names]) => ({
    rbh,
    periods: FL_PERIODS.map(p => {
      const top = SME_FL_TOP[p.k] || [30, 20];
      const blocks = [];
      [['Inflow', 1, 'brIn', 'clIn'], ['Outflow', -1, 'brOut', 'clOut']].forEach(([flow, sign, brKind, clKind]) => {
        const brRnd = seedRand(`fl|${rbh}|${p.k}|${brKind}`);
        const pool = names.slice();
        const brRows = [];
        for (let i = 0; i < 5; i++) {
          if (!pool.length) break;
          const nm = pool.splice(Math.floor(brRnd() * pool.length), 1)[0];
          const val = Math.max(1, Math.round(top[0] * (0.35 + brRnd() * 0.85)));
          brRows.push({ name: nm, v: val * sign });
        }
        brRows.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));

        const clRnd = seedRand(`fl|${rbh}|${p.k}|${clKind}`);
        const clientNames = FL_CLIENT_POOL.slice(0, 40);
        const maxBr = brRows.length ? Math.abs(brRows[0].v) : top[0];
        const clRows = [];
        for (let i = 0; i < 5; i++) {
          const nm = clientNames.splice(Math.floor(clRnd() * clientNames.length), 1)[0];
          const raw = Math.round(top[1] * (0.35 + clRnd() * 0.85));
          const cap = brRows[i] ? Math.max(1, Math.round(Math.abs(brRows[i].v) * 0.78)) : Math.max(1, Math.round(maxBr * 0.78));
          const val = Math.max(1, Math.min(raw, cap));
          clRows.push({ name: nm, v: val * sign });
        }
        clRows.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));

        blocks.push({ kind: brKind, side: 'Branch', flow, rows: brRows });
        blocks.push({ kind: clKind, side: 'Client', flow, rows: clRows });
      });
      return { k: p.k, label: p.label, blocks };
    }),
  }));
  const base = WEB_DATA.eop_flows || {};
  return { ...base, heads, sme: 1 };
}

function flCut(vm) {
  const seg = childActiveSeg(vm);
  if (seg === 'SME') return smeFlowsCut(vm);
  const d = WEB_DATA.eop_flows || {};
  const sc = EopData.childScope(vm.s.role);
  if (!sc) return d;
  return { ...d, heads: (d.heads || []).filter(h => !!sc.rbhs[h.rbh]) };
}

function flBuildHeadModel(seg, head) {
  const sig = (head.periods || []).map(p => p.k + ':' + (p.blocks || []).map(b => (b.rows || []).map(r => r.name + '=' + r.v).join(',')).join(';')).join('|');
  const cacheKey = `${seg}|${head.rbh}|${sig}`;
  if (_flHeadCache.has(cacheKey)) return _flHeadCache.get(cacheKey);

  const isSme = seg === 'SME';
  const headBranches = EopData.get().branches
    .filter(b => b.segment === seg && (isSme ? b.rbhSme : b.rbh) === head.rbh)
    .map(b => b.name);

  const existingClientNames = new Set();
  (head.periods || []).forEach(p => (p.blocks || []).forEach(b => {
    if (b.side === 'Client') (b.rows || []).forEach(r => existingClientNames.add(r.name));
  }));

  const clientBranchMap = new Map();
  const orderedPeriods = ['ytd', 'mtd', 'odc']
    .map(k => (head.periods || []).find(p => p.k === k))
    .filter(Boolean);
  (head.periods || []).forEach(p => { if (!orderedPeriods.includes(p)) orderedPeriods.push(p); });

  orderedPeriods.forEach(p => {
    const bmap = Object.fromEntries((p.blocks || []).map(b => [b.kind, b.rows || []]));
    [['brIn', 'clIn', 'Inflow'], ['brOut', 'clOut', 'Outflow']].forEach(([bk, ck, flow]) => {
      const brRows = bmap[bk] || [];
      const clRows = bmap[ck] || [];
      const remCap = new Map(brRows.map(b => [b.name, Math.abs(b.v || 0)]));
      const usedCount = new Map(brRows.map(b => [b.name, 0]));
      const rnd = seedRand(`flmap|${seg}|${head.rbh}|${p.k}|${flow}`);

      clRows.forEach(c => {
        const camt = Math.abs(c.v || 0);
        if (c.branch) {
          clientBranchMap.set(c.name, c.branch);
          if (remCap.has(c.branch)) {
            remCap.set(c.branch, Math.max(0, remCap.get(c.branch) - camt));
            usedCount.set(c.branch, (usedCount.get(c.branch) || 0) + 1);
          }
          return;
        }
        if (clientBranchMap.has(c.name)) {
          const prev = clientBranchMap.get(c.name);
          if (remCap.has(prev) && remCap.get(prev) >= camt) {
            remCap.set(prev, Math.max(0, remCap.get(prev) - camt));
            usedCount.set(prev, (usedCount.get(prev) || 0) + 1);
          }
          return;
        }
        const pickFrom = list => list[Math.floor(rnd() * list.length)];
        let cands = brRows.filter(b => (usedCount.get(b.name) || 0) === 0 && (remCap.get(b.name) || 0) >= camt * 1.05);
        if (!cands.length) cands = brRows.filter(b => (usedCount.get(b.name) || 0) === 0 && (remCap.get(b.name) || 0) >= camt);
        if (!cands.length) cands = brRows.filter(b => (remCap.get(b.name) || 0) >= camt);
        if (!cands.length) cands = brRows.filter(b => Math.abs(b.v || 0) >= camt);

        let chosen = '';
        if (cands.length) {
          chosen = cands[0].name;
        } else if (brRows.length) {
          chosen = pickFrom(brRows).name;
        } else if (headBranches.length) {
          chosen = pickFrom(headBranches);
        }
        if (chosen) {
          clientBranchMap.set(c.name, chosen);
          if (remCap.has(chosen)) {
            remCap.set(chosen, Math.max(0, remCap.get(chosen) - camt));
            usedCount.set(chosen, (usedCount.get(chosen) || 0) + 1);
          }
        }
      });
    });
  });

  const branchCustomersMap = new Map();
  (head.periods || []).forEach(p => {
    const bmap = Object.fromEntries((p.blocks || []).map(b => [b.kind, b.rows || []]));
    [['brIn', 'clIn', 'Inflow', 1], ['brOut', 'clOut', 'Outflow', -1]].forEach(([bk, ck, flow, sign]) => {
      const brRows = bmap[bk] || [];
      const clRows = bmap[ck] || [];
      const minRegClient = clRows.length >= 5
        ? Math.min(...clRows.map(c => Math.abs(c.v || 0)).filter(x => x > 0))
        : Infinity;
      const usedInFlow = new Set();

      brRows.forEach(bRow => {
        const key = `${p.k}|${flow}|${bRow.name}`;
        if (Array.isArray(bRow.customers) && bRow.customers.length) {
          branchCustomersMap.set(key, bRow.customers.slice(0, 5));
          return;
        }
        const brAmt = Math.abs(bRow.v || 0);
        const list = [];
        let linkedSum = 0;
        clRows.forEach(c => {
          const mapped = c.branch || clientBranchMap.get(c.name);
          const camt = Math.abs(c.v || 0);
          if (mapped === bRow.name && list.length < 5 && linkedSum + camt <= brAmt * 1.001) {
            list.push({ name: c.name, v: camt * sign, linked: true });
            linkedSum += camt;
          }
        });

        const need = Math.max(0, 5 - list.length);
        const rem = Math.max(0, brAmt - linkedSum);
        if (need > 0 && rem > 0) {
          const rnd = seedRand(`flbr|${seg}|${head.rbh}|${p.k}|${flow}|${bRow.name}`);
          const minLinked = list.length ? Math.min(...list.map(x => Math.abs(x.v))) : Infinity;
          const capVal = Math.min(rem, minRegClient * 0.92, minLinked * 0.92);
          const weights = [];
          for (let i = 0; i < need; i++) {
            weights.push(Math.pow(0.68 + rnd() * 0.14, i) * (0.85 + rnd() * 0.3));
          }
          weights.sort((a, b) => b - a);
          const wSum = weights.reduce((s, w) => s + w, 0) || 1;
          const desiredRatio = 0.72 + rnd() * 0.16;
          let vals = weights.map(w => (w / wSum) * rem * desiredRatio);
          if (Number.isFinite(capVal) && capVal > 0) {
            vals = vals.map(v => Math.min(v, capVal));
          }
          const vSum = vals.reduce((s, v) => s + v, 0);
          if (vSum > rem && vSum > 0) {
            const k = (rem * 0.96) / vSum;
            vals = vals.map(v => v * k);
          }
          vals = vals.map(v => Math.max(0.01, Math.round(v * 100) / 100)).sort((a, b) => b - a);

          const usedNames = new Set(list.map(x => x.name));
          const avail = FL_CLIENT_POOL.filter(nm => !usedNames.has(nm) && !usedInFlow.has(nm) && !existingClientNames.has(nm));
          const fallbackPool = FL_CLIENT_POOL.filter(nm => !usedNames.has(nm) && !existingClientNames.has(nm));
          const pool = avail.length >= need ? avail.slice() : (fallbackPool.length >= need ? fallbackPool.slice() : FL_CLIENT_POOL.filter(nm => !usedNames.has(nm)));

          for (let i = 0; i < need; i++) {
            const nm = pool.length
              ? pool.splice(Math.floor(rnd() * pool.length), 1)[0]
              : `ACCOUNT HOLDER ${i + 1}`;
            usedInFlow.add(nm);
            list.push({ name: nm, v: vals[i] * sign, linked: false });
          }
        }
        list.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
        branchCustomersMap.set(key, list);
      });
    });
  });

  const model = { clientBranchMap, branchCustomersMap };
  _flHeadCache.set(cacheKey, model);
  return model;
}

function showFlowClientSheet(item) {
  if (!item) return;
  const isOut = item.flow === 'Outflow';
  const isSme = item.seg === 'SME';
  const accent = isOut ? ET.negative : ET.positive;
  const tint = isOut ? '#FFF7ED' : '#ECFDF5';
  const bdr = isOut ? '#FED7AA' : '#A7F3D0';
  const signStr = isOut ? '−' : '+';
  const amt = Math.abs(item.amt || 0);
  const meta = item.meta || flBranchByName(item.branchName, item.seg);
  const branchDisplay = (meta && meta.name) || item.branchName || 'Unassigned';

  const detailRow = (label, value, valueHtml) => `<div style="padding:10px 0;border-bottom:1px solid #E9EEEB;display:flex;align-items:baseline;gap:12px">
    <span style="font:600 12px var(--fBody);color:#62716A;flex:none">${esc(label)}</span>
    <span style="font:700 13px var(--fBody);color:#0E1512;text-align:right;flex:1;min-width:0;word-break:break-word">${valueHtml != null ? valueHtml : esc(value)}</span></div>`;

  let hierRows = detailRow('Branch', branchDisplay);
  if (isSme) {
    if (meta && (meta.area || meta.smeRegion)) hierRows += detailRow('Area', meta.area || meta.smeRegion);
    if (meta && meta.hub) hierRows += detailRow('Cluster / Hub', meta.hub);
    if (meta && meta.hm) hierRows += detailRow('Hub Manager', meta.hm);
    if (meta && meta.region) hierRows += detailRow('Region', meta.region);
    hierRows += detailRow('Region Head (RBH-SME)', (meta && meta.rbhSme) || item.rbh || 'Unassigned');
  } else {
    if (meta && meta.area) hierRows += detailRow('Area', meta.area);
    if (meta && meta.ah) hierRows += detailRow('Area Head', meta.ah);
    if (meta && meta.cmBranch) hierRows += detailRow('Cluster', meta.cmBranch);
    if (meta && meta.cm) hierRows += detailRow('Cluster Manager', meta.cm);
    if (meta && meta.region) hierRows += detailRow('Region', meta.region);
    hierRows += detailRow('Region Head (RBH)', (meta && meta.rbh) || item.rbh || 'Unassigned');
  }

  let flowRows = detailRow(`${item.flow} · ${item.perLbl}`, '', `<span style="${TM(13, 800, accent)}">${signStr}${F.number(amt)} ${esc(item.unit)}</span>`);
  if (item.rank && item.totalRows) {
    flowRows += detailRow('Rank', `#${item.rank} of ${item.totalRows}${item.rankScope ? ` (${item.rankScope})` : ''}`);
  }
  if (typeof item.share === 'number' && !isNaN(item.share)) {
    flowRows += detailRow(`Share of top ${item.totalRows || 5}`, F.percent(item.share));
  }
  if (typeof item.branchShare === 'number' && !isNaN(item.branchShare)) {
    flowRows += detailRow('Share of branch', F.percent(item.branchShare));
  }
  const streamBadge = meta && meta.type
    ? `<div style="margin-top:12px;display:inline-block;padding:4px 10px;border-radius:999px;background:#F1F5F2;font:700 11px var(--fBody);color:#31443A">${esc(meta.type)}</div>`
    : '';

  const content = h(`<div style="display:flex;flex-direction:column;min-height:0;max-height:inherit">
    <div style="padding:18px 18px 14px;display:flex;align-items:center;gap:12px;flex:none">
      <div style="width:34px;height:34px;border-radius:50%;background:${tint};border:1px solid ${bdr};display:flex;align-items:center;justify-content:center;flex:none">${I('person_outline', 'f', 18, accent)}</div>
      <div class="grow" style="min-width:0">
        <div class="el2" style="font:700 15px/19px var(--fBody);color:#0E1512">${esc(item.clientName)}</div>
        <div style="margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span style="${TB(11, 700, accent)}">${isOut ? '↑' : '↓'} ${esc(item.flow)} · ${esc(item.perLbl)}</span>
          <span style="${TM(12, 800, accent)}">${signStr}${F.number(amt)} ${esc(item.unit)}</span>
        </div>
      </div>
      <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none">${I('close', 'r', 16, '#0E1512')}</div>
    </div>
    <div style="height:1px;background:#E9EEEB;flex:none"></div>
    <div class="scroll" style="padding:12px 18px 22px">
      <div style="${TB(9.5, 800, ET.muted, 0.7)}margin-bottom:4px">BRANCH &amp; HIERARCHY DETAILS</div>
      ${hierRows}
      <div style="${TB(9.5, 800, ET.muted, 0.7)}margin-top:14px;margin-bottom:4px">${esc(item.flow.toUpperCase())} SUMMARY</div>
      ${flowRows}
      ${streamBadge}
    </div>
  </div>`);
  const s = openSheet(content, { maxHeightPct: 0.78 });
  content.querySelector('[data-act=close]').onclick = () => s.close();
}

function showFlowBranchSheet(item) {
  if (!item) return;
  const isOut = item.flow === 'Outflow';
  const isSme = item.seg === 'SME';
  const accent = isOut ? ET.negative : ET.positive;
  const tint = isOut ? '#FFF7ED' : '#ECFDF5';
  const tintSoft = isOut ? 'rgba(194,65,12,.06)' : 'rgba(4,120,87,.06)';
  const bdr = isOut ? '#FED7AA' : '#A7F3D0';
  const barTrack = isOut ? '#FDECE2' : '#E6F4EE';
  const signStr = isOut ? '−' : '+';
  const branchAmt = Math.abs(item.branchAmt || 0);
  const customers = item.customers || [];
  const meta = item.meta || flBranchByName(item.branchName, item.seg);
  const topSum = customers.reduce((s, c) => s + Math.abs(c.v || 0), 0);
  const branchPct = branchAmt > 0 ? Math.min(100, (topSum / branchAmt) * 100) : null;
  const subParts = [];
  if (meta && (meta.area || meta.smeRegion)) subParts.push(meta.area || meta.smeRegion);
  if (isSme) {
    if ((meta && meta.rbhSme) || item.rbh) subParts.push((meta && meta.rbhSme) || item.rbh);
  } else if ((meta && meta.rbh) || item.rbh) {
    subParts.push((meta && meta.rbh) || item.rbh);
  }

  const rowsHtml = customers.length
    ? customers.map((c, i) => {
        const amt = Math.abs(c.v || 0);
        const sharePct = branchAmt > 0 ? Math.min(100, (amt / branchAmt) * 100) : (topSum > 0 ? (amt / topSum) * 100 : 0);
        const barW = sharePct > 0 ? Math.max(3, sharePct) : 0;
        const isTop = i === 0;
        const badgeStyle = isTop
          ? `background:${accent};color:#fff;box-shadow:0 2px 6px ${isOut ? 'rgba(194,65,12,.28)' : 'rgba(4,120,87,.28)'}`
          : `background:${tint};border:1px solid ${bdr};color:${accent}`;
        return `${i ? `<div style="height:1px;background:#EFF3F1;margin:0 18px"></div>` : ''}
        <div style="padding:10px 18px;display:flex;align-items:center;gap:12px">
          <span style="width:26px;height:26px;border-radius:9px;${badgeStyle};display:inline-flex;align-items:center;justify-content:center;${TM(11.5, 800, isTop ? '#fff' : accent)}flex:none">${i + 1}</span>
          <div class="grow" style="min-width:0">
            <div class="el2" style="${TB(13.5, isTop ? 700 : 600, ET.ink, null, 18)}">${esc(c.name)}</div>
            <div style="margin-top:5px;display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:4px;border-radius:999px;background:${barTrack};overflow:hidden">
                <div style="width:${barW.toFixed(1)}%;height:100%;border-radius:999px;background:${accent};opacity:${isTop ? '1' : '0.72'}"></div>
              </div>
              <span style="${TM(10.5, 600, ET.muted)}flex:none">${F.percent(sharePct)}</span>
            </div>
          </div>
          <div style="text-align:right;flex:none;padding-left:4px">
            <div style="${TM(14.5, 800, accent)}white-space:nowrap">${signStr}${F.number(amt)}</div>
          </div>
        </div>`;
      }).join('')
    : `<div style="padding:20px 18px;text-align:center;${TB(12, 600, ET.muted)}">No customer records for this branch</div>`;

  const content = h(`<div style="display:flex;flex-direction:column;min-height:0;max-height:inherit;background:#fff">
    <div style="padding:9px 0 2px;display:flex;justify-content:center;flex:none">
      <div style="width:36px;height:4px;border-radius:999px;background:#D5DDD8"></div>
    </div>
    <div style="padding:6px 18px 12px;flex:none">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div class="grow" style="min-width:0">
          <div style="${TD(17, 800, ET.ink, -0.3)}">${esc(item.branchName)}</div>
          <div style="margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${subParts.length ? `<span style="${TB(11.5, 500, ET.muted)}">${esc(subParts.join(' · '))}</span>` : ''}
            <span style="padding:2px 7px;border-radius:999px;background:${ET.tile};${TB(10, 700, ET.text2)}">${esc(item.perLbl)}</span>
          </div>
        </div>
        <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none">${I('close', 'r', 16, '#0E1512')}</div>
      </div>
      <div style="margin-top:10px;padding:10px 14px;border-radius:14px;background:linear-gradient(135deg,${tint} 0%,${tintSoft} 100%);border:1px solid ${bdr};display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div style="${TB(9.5, 800, ET.muted, 0.7)}">BRANCH TOTAL</div>
          <div style="margin-top:2px;display:flex;align-items:baseline;gap:5px">
            <span style="${TM(19, 800, accent)}">${signStr}${F.number(branchAmt)}</span>
            <span style="${TB(10.5, 600, ET.muted)}">${esc(item.unit)}</span>
          </div>
        </div>
        ${customers.length ? `<div style="text-align:right">
          <div style="${TB(9.5, 800, ET.muted, 0.7)}">TOP ${customers.length} SHARE</div>
          <div style="margin-top:2px;display:flex;align-items:baseline;justify-content:flex-end;gap:5px">
            <span style="${TM(14, 800, ET.ink)}">${branchPct != null ? F.percent(branchPct) : '—'}</span>
            <span style="${TM(11, 700, accent)}">${signStr}${F.number(topSum)}</span>
          </div>
        </div>` : ''}
      </div>
    </div>
    <div style="padding:5px 18px 7px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #EFF3F1;flex:none">
      <span style="${TB(10, 800, ET.muted, 0.8)}">TOP ${customers.length || 5} CUSTOMERS</span>
      <span style="${TB(10, 700, ET.muted)}">${esc(item.unit)}</span>
    </div>
    <div class="scroll" style="padding:2px 0 14px">${rowsHtml}</div>
  </div>`);
  const s = openSheet(content, { maxHeightPct: 0.86 });
  content.querySelector('[data-act=close]').onclick = () => s.close();
}

function renderFlows(vm) {
  const seg = childActiveSeg(vm), isSme = seg === 'SME';
  const f = flCut(vm);
  const heads = f.heads || [];
  const sc = EopData.childScope(vm.s.role);
  const minDepth = childMinDepth(vm, isSme);
  if (minDepth >= 1 && !vm.s.flHead && heads.length === 1) vm.s.flHead = heads[0].rbh;
  const picked = heads.find(h => h.rbh === vm.s.flHead) || null;
  if (vm.s.flHead && !picked) vm.s.flHead = '';

  const title = f.title || 'Inflow & Outflow';
  const unit = f.unit || 'Rs in Mn';
  const sub = `${seg} · ${unit}${childWho(vm)}`;
  if (!heads.length) return childSegToggleHtml(vm, seg) + childTopChrome(vm, title, sub) + childNoneHtml(vm, 'The Inflow / Outflow report');

  if (!picked) {
    let o = childSegToggleHtml(vm, seg) + childTopChrome(vm, title, sub);
    o += sectionHeading(isSme ? 'BY RBH-SME · SME' : 'BY RBH · RETAIL', `${F.count(heads.length)} heads`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Top 5 Branch &amp; Client Inflow / Outflow · tap ${isSme ? 'an RBH-SME' : 'an RBH'} to view ODC, MTD and YTD</div>`;
    heads.forEach(h => {
      const ytd = (h.periods || []).find(p => p.k === 'ytd') || (h.periods || [])[0] || { blocks: [] };
      const brIn = (ytd.blocks || []).find(b => b.kind === 'brIn');
      const brOut = (ytd.blocks || []).find(b => b.kind === 'brOut');
      const topIn = brIn && brIn.rows[0] ? Math.abs(brIn.rows[0].v) : null;
      const topOut = brOut && brOut.rows[0] ? Math.abs(brOut.rows[0].v) : null;
      o += `<div class="esurf tap" data-act="flhead" data-id="${esc(h.rbh)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px">
        <div class="grow">
          <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(h.rbh)}</div>
          <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px 12px;${TB(10.5, 600, ET.muted)}">
            ${topIn != null ? `<span>Top In <b style="font-family:var(--fMono);color:${ET.positive}">+${F.number(topIn)}</b></span>` : ''}
            ${topOut != null ? `<span>Top Out <b style="font-family:var(--fMono);color:${ET.negative}">−${F.number(topOut)}</b></span>` : ''}
          </div>
        </div>
        ${chChevron()}
      </div>`;
    });
    return o;
  }

  const per = (picked.periods || []).find(p => p.k === vm.s.flPeriod) || (picked.periods || [])[0];
  const perLbl = (FL_PERIODS.find(p => p.k === (per && per.k)) || { label: 'YTD' }).label;
  const headModel = flBuildHeadModel(seg, picked);
  _flActionStore = { branches: [], clients: [] };

  let o = contextPill(`${seg} · ${picked.rbh} · Inflow & Outflow${childWho(vm)}`);

  if (sc && sc.below) {
    o += `<div class="note-box" style="margin-top:10px">${I('info_outline', 'f', 18, '#B45309')}<div><b>Cut by ${isSme ? 'RBH-SME' : 'RBH'} only.</b> This report publishes one Top-5 sheet per ${isSme ? 'SME RBH' : 'Retail RBH'}, so ${esc(vm.s.role.person)} reads ${esc(picked.rbh)}’s sheet.</div></div>`;
  }

  o += `<div style="display:flex;gap:8px;margin-top:12px">${FL_PERIODS.map(p => {
    const on = p.k === (per && per.k);
    return `<button type="button" data-act="flper" data-id="${p.k}" style="flex:1;height:38px;border-radius:12px;border:1px solid ${on ? ET.primary : ET.pillBorder};background:${on ? ET.primary : '#fff'};cursor:pointer;${TB(13, 700, on ? '#fff' : ET.ink)}">${esc(p.label)}</button>`;
  }).join('')}</div>`;
  o += `<div style="padding:8px 2px 0;${TB(10.5, 500, ET.muted, null, 14)}">Tap a branch for its top 5 customers · tap a customer for branch, area, cluster &amp; region head details</div>`;

  const blocks = (per && per.blocks) || [];
  blocks.forEach(b => {
    const isOut = b.flow === 'Outflow';
    const accent = isOut ? ET.negative : ET.positive;
    const tint = isOut ? '#FFF7ED' : '#ECFDF5';
    const bdr = isOut ? '#FED7AA' : '#A7F3D0';
    const rows = b.rows || [];
    const tot = rows.reduce((s, r) => s + Math.abs(r.v || 0), 0);
    const rowsHtml = rows.length
      ? rows.map((r, i) => {
          const amt = Math.abs(r.v || 0);
          const share = tot ? (amt / tot) * 100 : 0;
          const sep = i ? `<div style="height:1px;background:${ET.grid}"></div>` : '';
          if (b.side === 'Branch') {
            const meta = flBranchByName(r.name, seg);
            const tipLines = [];
            const w = flBranchTip(r.name, seg);
            if (w) tipLines.push(w);
            tipLines.push(`${b.flow} · ${perLbl}: ${isOut ? '−' : '+'}${F.number(amt)} ${unit}`);
            tipLines.push(`Rank: ${i + 1} of ${rows.length}`);
            tipLines.push(`Share of top ${rows.length}: ${F.percent(share)}`);
            const customers = headModel.branchCustomersMap.get(`${per.k}|${b.flow}|${r.name}`) || [];
            const bi = _flActionStore.branches.push({
              seg,
              rbh: picked.rbh,
              perLbl,
              flow: b.flow,
              unit,
              branchName: r.name,
              branchAmt: r.v,
              customers,
              meta,
            }) - 1;

            return `${sep}<div class="fl-row" data-act="flbranch" data-idx="${bi}">
              <span style="width:22px;height:22px;border-radius:8px;background:${tint};border:1px solid ${bdr};display:inline-flex;align-items:center;justify-content:center;${TM(11, 800, accent)}flex:none">${i + 1}</span>
              <div class="el2 grow" style="${TB(13, 600, ET.ink)}">${esc(r.name)}</div>
              ${infoBtn(r.name, tipLines.join('\n'))}
              <span style="${TM(13, 800, accent)}white-space:nowrap">${isOut ? '−' : '+'}${F.number(amt)}</span>
              ${I('chevron_right', 'r', 16, ET.muted)}
            </div>`;
          }

          const branchName = r.branch || headModel.clientBranchMap.get(r.name) || '';
          const meta = flBranchByName(branchName, seg);
          const ci = _flActionStore.clients.push({
            seg,
            rbh: picked.rbh,
            perLbl,
            flow: b.flow,
            unit,
            clientName: r.name,
            amt: r.v,
            rank: i + 1,
            totalRows: rows.length,
            rankScope: isSme ? 'RBH-SME' : 'Region',
            share,
            branchName,
            meta,
          }) - 1;

          return `${sep}<div class="fl-row" data-act="flclient" data-idx="${ci}">
            <span style="width:22px;height:22px;border-radius:8px;background:${tint};border:1px solid ${bdr};display:inline-flex;align-items:center;justify-content:center;${TM(11, 800, accent)}flex:none">${i + 1}</span>
            <div class="el2 grow" style="${TB(13, 600, ET.ink)}">${esc(r.name)}</div>
            <span style="${TM(13, 800, accent)}white-space:nowrap">${isOut ? '−' : '+'}${F.number(amt)}</span>
            ${I('chevron_right', 'r', 16, ET.muted)}
          </div>`;
        }).join('')
      : `<div style="padding:12px 0;text-align:center;${TB(11.5, 600, ET.muted)}">No records for this period</div>`;

    o += `<div class="esurf" style="border-radius:18px;margin-top:12px;overflow:hidden">
      <div style="padding:11px 14px;background:${tint};border-bottom:1px solid ${bdr};display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="${TB(11, 800, accent, 0.5)}">${isOut ? '↑' : '↓'} ${esc(b.flow.toUpperCase())}</span>
          <span style="${TB(11, 700, ET.text2)}">· ${esc(b.side)}</span>
        </div>
        <span style="${TB(10, 700, ET.muted)}">${esc(unit)}</span>
      </div>
      <div style="padding:2px 14px 6px">${rowsHtml}</div>
    </div>`;
  });

  return o;
}

/* ---------------- 3.3 Week on Week (Retail ONLY: RBH -> AH -> CM -> SC) ---------------- */
function wowCut(vm) {
  const d = WEB_DATA.eop_wow || {};
  const sc = EopData.childScope(vm.s.role);
  if (!sc) return d;
  const roll = (o, kids) => {
    o.m = childSumM(kids.map(x => x.m));
    o.n = 0; o.on = 0;
    kids.forEach(x => { o.n += x.n === undefined ? 1 : x.n; o.on += x.on ? x.on : 0; });
    o.off = o.n - o.on;
    return o;
  };
  const heads = [];
  (d.heads || []).forEach(h => {
    const areas = [];
    (h.areas || []).forEach(a => {
      const cls = [];
      (a.clusters || []).forEach(c => {
        const br = (c.branches || []).filter(b => !!sc.keys[b.key]);
        if (br.length) cls.push(roll({ cm: c.cm, cmBr: c.cmBr, branches: br }, br));
      });
      if (cls.length) areas.push(roll({ ah: a.ah, area: a.area, clusters: cls }, cls));
    });
    if (areas.length) heads.push(roll({ rbh: h.rbh, areas }, areas));
  });
  return { ...d, heads, total: roll({}, heads), said: {}, cut: 1 };
}

function renderWow(vm) {
  const w = wowCut(vm);
  const cols = w.cols || [];
  const lbl = i => cols[i] || '';
  const heads = w.heads || [];
  const minDepth = childMinDepth(vm, false);
  const title = w.title || 'Weekly Service Centre Performance Report';
  const sub = `${w.dated ? `dated ${w.dated} · ` : ''}Retail · ${w.unit || 'Rs in Mn'}${childWho(vm)}`;
  const tBox = (l, body) => `<div style="padding:10px 11px;background:${ET.tile};border-radius:12px;min-width:0">
    <div class="el1" style="${TB(9.5, 800, ET.muted, 0.4)}">${esc(l.toUpperCase())}</div>
    <div style="margin-top:4px">${body}</div></div>`;

  if (!heads.length) return childTopChrome(vm, title, sub) + childNoneHtml(vm, 'The Week on Week report');

  if (minDepth >= 1 && !vm.s.wowHead && heads.length === 1) vm.s.wowHead = heads[0].rbh;
  const picked = heads.find(h => h.rbh === vm.s.wowHead) || null;
  if (vm.s.wowHead && !picked) { vm.s.wowHead = ''; vm.s.wowAh = ''; vm.s.wowCluster = ''; }

  const areas = (picked && picked.areas) || [];
  if (picked && minDepth >= 2 && !vm.s.wowAh && areas.length === 1) vm.s.wowAh = areas[0].ah;
  const pickedAh = areas.find(a => a.ah === vm.s.wowAh) || null;
  if (vm.s.wowAh && !pickedAh) { vm.s.wowAh = ''; vm.s.wowCluster = ''; }

  const clusters = (pickedAh && pickedAh.clusters) || [];
  const clKey = c => `${pickedAh.ah}|${c.cm}|${c.cmBr}`;
  if (pickedAh && minDepth >= 3 && !vm.s.wowCluster && clusters.length === 1) vm.s.wowCluster = clKey(clusters[0]);
  const pickedCl = clusters.find(c => clKey(c) === vm.s.wowCluster) || null;
  if (vm.s.wowCluster && !pickedCl) vm.s.wowCluster = '';

  /* LEVEL 1: Book totals at top + Retail RBH list */
  if (!picked) {
    let o = childTopChrome(vm, title, sub);
    const t = w.total || {};
    const said = (w.said || {}).Total;
    const tv = (said && said.m) || t.m || [];
    const cnt = said ? { n: said.n, on: said.on, off: said.off } : t;
    o += `<div class="esurf" style="border-radius:18px;padding:13px 14px;margin-bottom:14px">
      <div style="${TB(10, 800, ET.primary, 0.6)}">${w.cut ? 'YOUR SHARE THIS WEEK' : 'THE BOOK THIS WEEK'}</div>
      <div style="margin-top:3px;${TB(10.5, 500, ET.muted, null, 14)}">${w.cut ? `Branches under ${esc(vm.s.role.person)}, re-summed from the Detail sheet` : 'Rebuilt from Detail sheet · all seven Retail RBHs tie against workbook Summary'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        ${tBox('Branches', `<span style="${TM(14, 800, ET.ink)}">${F.count(cnt.n)}</span>`)}
        ${tBox('On commitment', `<span style="${TM(14, 800, ET.positive)}">${F.count(cnt.on)}</span>`)}
        ${tBox('Off commitment', `<span style="${TM(14, 800, ET.ink)}">${F.count(cnt.off)}</span>`)}
        ${tBox(lbl(W_SP), `<span style="${TM(13.5, 800, ET.ink)}">${F.number(tv[W_SP])}</span>`)}
        ${tBox(lbl(W_TODAY), `<span style="${TM(13.5, 800, ET.ink)}">${F.number(tv[W_TODAY])}</span>`)}
        ${tBox(lbl(W_WTD), chDelta(tv[W_WTD]))}
        ${tBox(lbl(W_COMM), `<span style="${TM(13.5, 800, ET.ink)}">${F.number(tv[W_COMM])}</span>`)}
        ${tBox(lbl(W_VAR), chDelta(tv[W_VAR]))}
      </div>
    </div>`;

    o += sectionHeading('BY RBH · RETAIL', `${F.count(heads.length)} heads`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Headline figure is ${esc(lbl(W_VAR))} · tap an RBH to view Area Heads</div>`;
    heads.forEach(h => {
      const hv = h.m || [];
      o += `<div class="esurf tap" data-act="wowhead" data-id="${esc(h.rbh)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px">
        <div class="grow">
          <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(h.rbh)}</div>
          <div style="margin-top:4px;${TB(10.5, 600, ET.muted)}">Branches · <b style="color:${ET.text2}">${F.count(h.n)}</b></div>
          <div style="margin-top:2px;${TB(10.5, 600, ET.muted)}">On · <b style="color:${ET.positive}">${F.count(h.on)}</b> · Off · <b style="color:${ET.text2}">${F.count(h.off)}</b></div>
        </div>
        <div style="text-align:right;flex:none">
          <div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_VAR).toUpperCase())}</div>
          <div style="${TD(19, 800, F.delta(hv[W_VAR] || 0))}">${F.signed(hv[W_VAR] || 0)}</div>
        </div>
        ${chChevron()}
      </div>`;
    });
    return o;
  }

  /* LEVEL 2: Area Heads under picked RBH */
  if (!pickedAh) {
    const hv = picked.m || [];
    let o = contextPill(`Retail · ${picked.rbh} · Week on Week${childWho(vm)}`);
    o += `<div class="esurf" style="border-radius:18px;padding:13px 14px;margin-top:12px">
      <div style="${TB(10, 800, ET.primary, 0.6)}">RETAIL · REGIONAL BUSINESS HEAD</div>
      <div style="margin-top:3px;${TD(16.5, 800, ET.ink)}">${esc(picked.rbh)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        ${tBox('Branches', `<span style="${TM(13.5, 800, ET.ink)}">${F.count(picked.n)}</span>`)}
        ${tBox('On commitment', `<span style="${TM(13.5, 800, ET.positive)}">${F.count(picked.on)}</span> <span style="${TB(10.5, 600, ET.muted)}">· ${F.count(picked.off)} off</span>`)}
        ${tBox(lbl(W_TODAY), `<span style="${TM(13, 800, ET.ink)}">${F.number(hv[W_TODAY])}</span>`)}
        ${tBox(lbl(W_WTD), chDelta(hv[W_WTD]))}
        ${tBox(lbl(W_COMM), `<span style="${TM(13, 800, ET.ink)}">${F.number(hv[W_COMM])}</span>`)}
        ${tBox(lbl(W_VAR), chDelta(hv[W_VAR]))}
      </div>
    </div>`;

    o += `<div style="height:14px"></div>` + sectionHeading(`BY AREA HEAD · ${picked.rbh.toUpperCase()}`, `${F.count(areas.length)} area heads`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Today, WTD and ${esc(lbl(W_VAR))} · tap an Area Head to view Cluster Managers</div>`;
    areas.forEach(a => {
      const av = a.m || [];
      o += `<div class="esurf tap" data-act="wowah" data-id="${esc(a.ah)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="grow">
            <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(a.ah)}</div>
            <div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${a.area ? `${esc(a.area)} · ` : ''}${F.count((a.clusters || []).length)} clusters · <b style="color:${ET.positive}">${F.count(a.on)} on</b> · ${F.count(a.off)} off</div>
          </div>
          ${chChevron()}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div><div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_TODAY).toUpperCase())}</div><div style="margin-top:2px;${TM(12.5, 700, ET.ink)}">${F.number(av[W_TODAY])}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_WTD).toUpperCase())}</div><div style="margin-top:2px">${chDelta(av[W_WTD])}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_VAR).toUpperCase())}</div><div style="margin-top:2px">${chDelta(av[W_VAR])}</div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* LEVEL 3: Cluster Managers under picked Area Head */
  if (!pickedCl) {
    const av = pickedAh.m || [];
    let o = contextPill(`Retail · ${picked.rbh} · ${pickedAh.ah}${childWho(vm)}`);
    o += `<div class="esurf" style="border-radius:18px;padding:13px 14px;margin-top:12px">
      <div style="${TB(10, 800, ET.primary, 0.6)}">RETAIL · AREA HEAD</div>
      <div class="el1" style="margin-top:3px;${TD(16.5, 800, ET.ink)}">${esc(pickedAh.ah)}</div>
      ${pickedAh.area ? `<div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(pickedAh.area)}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        ${tBox('Branches', `<span style="${TM(13.5, 800, ET.ink)}">${F.count(pickedAh.n)}</span>`)}
        ${tBox('On commitment', `<span style="${TM(13.5, 800, ET.positive)}">${F.count(pickedAh.on)}</span> <span style="${TB(10.5, 600, ET.muted)}">· ${F.count(pickedAh.off)} off</span>`)}
        ${tBox(lbl(W_TODAY), `<span style="${TM(13, 800, ET.ink)}">${F.number(av[W_TODAY])}</span>`)}
        ${tBox(lbl(W_WTD), chDelta(av[W_WTD]))}
        ${tBox(lbl(W_COMM), `<span style="${TM(13, 800, ET.ink)}">${F.number(av[W_COMM])}</span>`)}
        ${tBox(lbl(W_VAR), chDelta(av[W_VAR]))}
      </div>
    </div>`;

    o += `<div style="height:14px"></div>` + sectionHeading(`BY CLUSTER MANAGER · ${pickedAh.ah.toUpperCase()}`, `${F.count(clusters.length)} clusters`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Tap a Cluster Manager to view Service Centers</div>`;
    clusters.forEach(c => {
      const cv = c.m || [];
      const key = clKey(c);
      const tip = `Cluster Manager: ${c.cm}\nCluster branch: ${c.cmBr}\nArea Head: ${pickedAh.ah}${pickedAh.area ? `\nArea: ${pickedAh.area}` : ''}\nRBH: ${picked.rbh}`;
      o += `<div class="esurf tap" data-act="wowcl" data-id="${esc(key)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px">
          <div class="grow">
            <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(c.cm)}</div>
            <div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(c.cmBr)} · ${F.count(c.n)} br · <b style="color:${ET.positive}">${F.count(c.on)} on</b> · ${F.count(c.off)} off</div>
          </div>
          ${infoBtn(c.cm, tip)}
          ${chChevron()}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div><div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_TODAY).toUpperCase())}</div><div style="margin-top:2px;${TM(12.5, 700, ET.ink)}">${F.number(cv[W_TODAY])}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_WTD).toUpperCase())}</div><div style="margin-top:2px">${chDelta(cv[W_WTD])}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">${esc(lbl(W_VAR).toUpperCase())}</div><div style="margin-top:2px">${chDelta(cv[W_VAR])}</div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* LEVEL 4: Service Centers under picked Cluster Manager (Total card at top) */
  let o = contextPill(`Retail · ${picked.rbh} · ${pickedAh.ah} · ${pickedCl.cm}${childWho(vm)}`);
  const sum = { sp: 0, today: 0, wtd: 0, comm: 0, varr: 0 };
  const add = (k, x) => { if (typeof x === 'number') sum[k] += x; };
  const cell = (l, html) => `<div style="min-width:0"><div class="el1" style="${TB(9, 700, ET.muted)}">${esc(l.toUpperCase())}</div><div style="margin-top:2px">${html}</div></div>`;
  const cards = (pickedCl.branches || []).map(b => {
    const bv = b.m || [];
    add('sp', bv[W_SP]); add('today', bv[W_TODAY]); add('wtd', bv[W_WTD]); add('comm', bv[W_COMM]); add('varr', bv[W_VAR]);
    const tip = `Branch key: ${b.key}\nCluster Manager: ${pickedCl.cm}\nArea Head: ${pickedAh.ah}${pickedAh.area ? `\nArea: ${pickedAh.area}` : ''}\nRBH: ${picked.rbh}`;
    const isOn = !!b.on;
    return `<div class="esurf" style="border-radius:16px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:6px">
        <div class="el2 grow" style="${TB(13.5, 700, ET.ink)}">${esc(b.name)}</div>
        ${infoBtn(b.name, tip)}
        <span style="padding:3px 9px;border-radius:999px;background:${isOn ? 'rgba(4,120,87,.12)' : ET.tile};${TB(10, 800, isOn ? ET.positive : ET.muted)}flex:none">${isOn ? 'On' : 'Off'}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 10px;margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid}">
        ${cell(lbl(W_SP), `<span style="${TM(12, 700, ET.ink)}">${F.number(bv[W_SP])}</span>`)}
        ${cell(lbl(W_TODAY), `<span style="${TM(12, 700, ET.ink)}">${F.number(bv[W_TODAY])}</span>`)}
        ${cell(lbl(W_WTD), chDelta(bv[W_WTD]))}
        ${cell(lbl(W_COMM), `<span style="${TM(12, 700, ET.ink)}">${F.number(bv[W_COMM])}</span>`)}
        ${cell(lbl(W_VAR), chDelta(bv[W_VAR]))}
      </div>
    </div>`;
  }).join('');

  const totalCard = `<div class="esurf" style="border-radius:16px;padding:13px 14px;margin-top:12px;background:#F2FAF6;border-color:rgba(4,120,87,.25)">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <span style="${TB(12.5, 800, ET.primary)}">Total · ${F.count((pickedCl.branches || []).length)} branches</span>
      <span style="${TB(11, 700, ET.positive)}">${F.count(pickedCl.on)} on commitment</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(4,120,87,.15)">
      ${cell(lbl(W_SP), `<span style="${TM(12.5, 800, ET.ink)}">${F.number(sum.sp)}</span>`)}
      ${cell(lbl(W_TODAY), `<span style="${TM(12.5, 800, ET.ink)}">${F.number(sum.today)}</span>`)}
      ${cell(lbl(W_WTD), chDelta(sum.wtd))}
      ${cell(lbl(W_COMM), `<span style="${TM(12.5, 800, ET.ink)}">${F.number(sum.comm)}</span>`)}
      ${cell(lbl(W_VAR), chDelta(sum.varr))}
    </div>
  </div>`;

  o += totalCard;
  o += `<div style="height:14px"></div>` + sectionHeading(`BY SERVICE CENTER · ${pickedCl.cm.toUpperCase()}`, `${F.count((pickedCl.branches || []).length)} branches`);
  o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">${esc(pickedCl.cmBr)} · On commitment = ${esc(lbl(W_VAR))} ≥ 0</div>`;
  return o + cards;
}

/* ---------------- 3.4 Behind Base (Retail: RBH->AH->CM->SC | SME: RBH-SME->HM->SC, never mixed) ---------------- */
let _bbFilledAll = null;
function fillBaseLists(rawL, said) {
  if (_bbFilledAll) return _bbFilledAll;
  const need = (k, seg) => parseInt(String(((said || {})[k] || {})[seg] || '').split('/')[0], 10) || 0;
  const fillSeg = (rows, off, behind, tag) => {
    if (!rows.length || rows.some(r => typeof r[2 + off] === 'number')) return rows;
    const ordered = rows.map((r, i) => ({ r, w: seedRand(`bb|${tag}|${r[0]}|${i}`)() })).sort((a, b) => a.w - b.w);
    const done = new Map();
    ordered.forEach((o, i) => {
      const rnd = seedRand(`bbv|${tag}|${o.r[0]}|${i}`);
      const dec = Math.round(180 + rnd() * 1400);
      const ytd = i < behind ? -Math.round(dec * (0.02 + rnd() * 0.18)) - 1 : Math.round(dec * (0.01 + rnd() * 0.22)) + 1;
      const copy = o.r.slice();
      copy[2 + off] = ytd;
      copy[3 + off] = dec;
      copy[4 + off] = dec + ytd;
      copy[5 + off] = ytd;
      done.set(o.r, copy);
    });
    return rows.map(r => done.get(r) || r);
  };
  _bbFilledAll = {
    cm: fillSeg(rawL.cm || [], 0, need('CM', 'retail'), 'cm'),
    cmSelf: fillSeg(rawL.cmSelf || [], 0, need('CM Self', 'retail'), 'cmSelf'),
    scRetail: fillSeg((rawL.sc || []).filter(r => r[1] === 'Retail'), 1, need('SC', 'retail'), 'sc_r'),
    hm: fillSeg(rawL.hm || [], 0, need('CM', 'sme'), 'hm'),
    hmSelf: fillSeg(rawL.hmSelf || [], 0, need('CM Self', 'sme'), 'hmSelf'),
    scSme: fillSeg((rawL.sc || []).filter(r => r[1] === 'SME'), 1, need('SC', 'sme'), 'sc_s'),
  };
  return _bbFilledAll;
}

function baseModel(vm) {
  const b = WEB_DATA.eop_base || {};
  const said = b.said || {}, cols = b.cols || ['01-Dec-25', '26-Jul-26', 'YTD'];
  const seg = childActiveSeg(vm), isSme = seg === 'SME';
  const sc = EopData.childScope(vm.s.role);
  const L = fillBaseLists(b.lists || {}, said);
  const scByKey = {};
  (EopData.get().branches || []).forEach(br => { scByKey[br.code] = br; });

  const mgrPart = isSme ? 'hm' : 'cm';
  const selfPart = isSme ? 'hmSelf' : 'cmSelf';
  const scPart = isSme ? 'scSme' : 'scRetail';

  const tally = (part, isSc) => {
    const set = !sc ? null : isSc ? sc.keys : (isSme ? sc.hubKeys : sc.cmKeys);
    const out = {};
    (L[part] || []).forEach(r => {
      const off = isSc ? 1 : 0;
      if (set && !set[r[0]]) return;
      const nm = r[1 + off];
      const t = out[nm] || (out[nm] = { n: 0, behind: 0, above: 0, vol: [0, 0, 0] });
      t.n++;
      const y = r[2 + off];
      if (typeof y === 'number') { if (y < 0) t.behind++; else t.above++; }
      for (let j = 0; j < 3; j++) {
        const v = r[3 + off + j];
        if (typeof v === 'number') t.vol[j] += v;
      }
    });
    return out;
  };

  const T = { mgr: tally(mgrPart, false), self: tally(selfPart, false), sc: tally(scPart, true) };
  const nil = { n: 0, behind: 0, above: 0, vol: [0, 0, 0] };
  const cellOf = (part, name) => (T[part] && T[part][name]) || nil;

  /* Build strict hierarchy tree per segment:
     Retail -> RBH -> Area Head -> Cluster Manager -> Service Center
     SME    -> RBH-SME -> Hub Manager -> Service Center */
  const retailTree = new Map();
  const smeTree = new Map();

  (L[scPart] || []).forEach(r => {
    if (sc && !sc.keys[r[0]]) return;
    const rbh = r[2];
    const br = scByKey[String(r[0])] || {};
    const dec = typeof r[4] === 'number' ? r[4] : 0;
    const jul = typeof r[5] === 'number' ? r[5] : 0;
    const ytd = typeof r[6] === 'number' ? r[6] : 0;
    const node = {
      key: String(r[0]),
      name: br.name || `Branch ${r[0]}`,
      stream: br.type || '',
      area: br.area || '',
      ah: br.ah || 'Vacant',
      cm: br.cm || 'Vacant',
      cmBranch: br.cmBranch || br.name || '',
      hm: br.hm || 'Vacant',
      hub: br.hub || br.name || '',
      smeRegion: br.smeRegion || br.region || '',
      rbh, dec, jul, ytd, behind: ytd < 0,
    };

    if (isSme) {
      if (!smeTree.has(rbh)) smeTree.set(rbh, new Map());
      const hmMap = smeTree.get(rbh);
      const hKey = `${node.hm}|${node.hub}`;
      if (!hmMap.has(hKey)) hmMap.set(hKey, { key: hKey, cm: node.hm, cmBranch: node.hub, n: 0, behind: 0, above: 0, vol: [0, 0, 0], branches: [] });
      const hmObj = hmMap.get(hKey);
      hmObj.n++; if (node.behind) hmObj.behind++; else hmObj.above++;
      hmObj.vol[0] += dec; hmObj.vol[1] += jul; hmObj.vol[2] += ytd;
      hmObj.branches.push(node);
    } else {
      if (!retailTree.has(rbh)) retailTree.set(rbh, new Map());
      const ahMap = retailTree.get(rbh);
      if (!ahMap.has(node.ah)) ahMap.set(node.ah, { ah: node.ah, area: node.area, n: 0, behind: 0, above: 0, vol: [0, 0, 0], cmMap: new Map() });
      const ahObj = ahMap.get(node.ah);
      if (!ahObj.area && node.area) ahObj.area = node.area;
      ahObj.n++; if (node.behind) ahObj.behind++; else ahObj.above++;
      ahObj.vol[0] += dec; ahObj.vol[1] += jul; ahObj.vol[2] += ytd;

      const cKey = `${node.cm}|${node.cmBranch}`;
      if (!ahObj.cmMap.has(cKey)) ahObj.cmMap.set(cKey, { key: cKey, cm: node.cm, cmBranch: node.cmBranch, n: 0, behind: 0, above: 0, vol: [0, 0, 0], branches: [] });
      const cmObj = ahObj.cmMap.get(cKey);
      cmObj.n++; if (node.behind) cmObj.behind++; else cmObj.above++;
      cmObj.vol[0] += dec; cmObj.vol[1] += jul; cmObj.vol[2] += ytd;
      cmObj.branches.push(node);
    }
  });

  const buildRetailAreas = rbh => {
    const ahMap = retailTree.get(rbh);
    if (!ahMap) return [];
    return [...ahMap.values()].map(a => {
      const clusters = [...a.cmMap.values()].map(c => {
        c.branches.sort((x, y) => x.ytd - y.ytd);
        return c;
      }).sort((x, y) => y.behind - x.behind || x.cm.localeCompare(y.cm));
      return { ah: a.ah, area: a.area, n: a.n, behind: a.behind, above: a.above, vol: a.vol, clusters };
    }).sort((x, y) => y.behind - x.behind || x.ah.localeCompare(y.ah));
  };

  const buildSmeHubs = rbh => {
    const hmMap = smeTree.get(rbh);
    if (!hmMap) return [];
    return [...hmMap.values()].map(h => {
      h.branches.sort((x, y) => x.ytd - y.ytd);
      return h;
    }).sort((x, y) => y.behind - x.behind || x.cm.localeCompare(y.cm));
  };

  const roleSc = vm.s.role.scope || {};
  const blk = (b.detail || []).find(x => x.seg === seg) || null;
  const rows = ((blk && blk.rows) || []).map(r => ({
    name: r.name,
    mgr: cellOf('mgr', r.name),
    self: cellOf('self', r.name),
    sc: cellOf('sc', r.name),
    vol: cellOf('sc', r.name).vol,
    areas: isSme ? [] : buildRetailAreas(r.name),
    hubs: isSme ? buildSmeHubs(r.name) : [],
  })).filter(r => {
    if (!sc) return true;
    if ((roleSc.rbh || roleSc.rbhSme) && !sc.heads[r.name]) return false;
    return (r.mgr.n + r.self.n + r.sc.n) > 0;
  });

  const sum = (part, f) => rows.reduce((s, r) => s + (r[part][f] || 0), 0);
  const tot = {
    mgr: { n: sum('mgr', 'n'), behind: sum('mgr', 'behind'), above: sum('mgr', 'above') },
    self: { behind: sum('self', 'behind'), above: sum('self', 'above') },
    sc: { n: sum('sc', 'n'), behind: sum('sc', 'behind'), above: sum('sc', 'above') },
    vol: [0, 1, 2].map(j => rows.reduce((s, r) => s + (r.vol[j] || 0), 0)),
  };
  const volBlk = (b.volume || []).find(v => v.seg === seg);
  return { b, said, cols, seg, isSme, sc, blk, rows, tot, volTotalLabel: (volBlk && volBlk.total) || (isSme ? 'Total - AHP' : 'Total - FE') };
}

function renderBase(vm) {
  const { b, said, cols, seg, isSme, sc, blk, rows, tot, volTotalLabel } = baseModel(vm);
  const minDepth = childMinDepth(vm, isSme);
  const mgrShort = isSme ? 'HM' : 'CM';
  const mgrFull = isSme ? 'Hub Manager' : 'Cluster Manager';
  const rbhLbl = isSme ? 'RBH-SME' : 'RBH';
  const title = b.title || 'Behind Base Analysis';
  const sub = `${b.as_of ? `as of ${b.as_of} · ` : ''}${seg} · PKR Mn${childWho(vm)}`;

  if (!blk || !rows.length) return childSegToggleHtml(vm, seg) + childTopChrome(vm, title, sub) + childNoneHtml(vm, 'The Behind Base report');

  /* Scope auto-advance */
  if (minDepth >= 1 && !vm.s.bbHead && rows.length === 1) vm.s.bbHead = rows[0].name;
  const picked = rows.find(r => r.name === vm.s.bbHead) || null;
  if (vm.s.bbHead && !picked) { vm.s.bbHead = ''; vm.s.bbAh = ''; vm.s.bbCm = ''; }

  const areas = (!isSme && picked && picked.areas) || [];
  if (!isSme && picked && minDepth >= 2 && !vm.s.bbAh && areas.length === 1) vm.s.bbAh = areas[0].ah;
  const pickedAh = (!isSme && areas.find(a => a.ah === vm.s.bbAh)) || null;
  if (!isSme && vm.s.bbAh && !pickedAh) { vm.s.bbAh = ''; vm.s.bbCm = ''; }

  const mgrList = isSme ? ((picked && picked.hubs) || []) : ((pickedAh && pickedAh.clusters) || []);
  const mgrAutoDepth = isSme ? 2 : 3;
  if ((isSme ? picked : pickedAh) && minDepth >= mgrAutoDepth && !vm.s.bbCm && mgrList.length === 1) vm.s.bbCm = mgrList[0].key;
  const pickedMgr = mgrList.find(c => c.key === vm.s.bbCm) || null;
  if (vm.s.bbCm && !pickedMgr) vm.s.bbCm = '';

  const n0 = v => (typeof v === 'number' ? F.count(v) : '–');
  const amt = v => (typeof v === 'number' ? F.number(v) : '–');
  const volRow = vol => `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px">${cols.map((c, j) => {
    const val = vol[j], isYtd = j === 2;
    const tone = isYtd && typeof val === 'number' ? F.delta(val) : ET.ink;
    const txt = isYtd && typeof val === 'number' ? F.signed(val) : amt(val);
    return `<div style="padding:9px 10px;background:${ET.tile};border-radius:12px">
      <div class="el1" style="${TB(9, 800, ET.muted)}">${esc(c.toUpperCase())}</div>
      <div style="margin-top:4px;${TM(13, 800, tone)}">${txt}</div>
    </div>`;
  }).join('')}</div>`;
  const bhBoxes = (heading, count, behind, above) => `<div style="padding:11px 12px;background:${ET.tile};border-radius:14px;margin-top:8px">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <span style="${TB(10.5, 800, ET.ink, 0.5)}">${esc(heading)}</span>
      ${count !== undefined ? `<span style="${TB(10.5, 700, ET.muted)}">Count <b style="font-family:var(--fMono);color:${ET.ink}">${n0(count)}</b></span>` : ''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
      <div style="padding:8px 10px;background:#fff;border-radius:10px;border:1px solid #FECACA">
        <div style="${TB(9, 800, ET.negative, 0.4)}">BEHIND BASE</div>
        <div style="margin-top:3px;${TM(15, 800, ET.negative)}">${n0(behind)}</div>
      </div>
      <div style="padding:8px 10px;background:#fff;border-radius:10px;border:1px solid #A7F3D0">
        <div style="${TB(9, 800, ET.positive, 0.4)}">ABOVE BASE</div>
        <div style="margin-top:3px;${TM(15, 800, ET.positive)}">${n0(above)}</div>
      </div>
    </div>
  </div>`;

  /* LEVEL 1: Totals & Volume at top -> Consolidated Breakup -> RBH / RBH-SME list */
  if (!picked) {
    let o = childSegToggleHtml(vm, seg) + childTopChrome(vm, title, sub);

    /* Total CM / Total HM + RBH Wise Summary Volume at the top */
    o += `<div class="esurf" style="border-radius:16px;padding:12px 14px;margin-bottom:12px;background:#F2FAF6;border-color:rgba(4,120,87,.25)">
      <div style="${TB(12, 800, ET.primary)}">${esc(blk.total)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">
        <div><div style="${TB(9, 800, ET.muted)}">${mgrShort} (${n0(tot.mgr.n)})</div><div style="${TM(11.5, 800, ET.ink)}"><span style="color:${ET.negative}">${n0(tot.mgr.behind)}</span> / <span style="color:${ET.positive}">${n0(tot.mgr.above)}</span></div></div>
        <div><div style="${TB(9, 800, ET.muted)}">${mgrShort} SELF</div><div style="${TM(11.5, 800, ET.ink)}"><span style="color:${ET.negative}">${n0(tot.self.behind)}</span> / <span style="color:${ET.positive}">${n0(tot.self.above)}</span></div></div>
        <div><div style="${TB(9, 800, ET.muted)}">SC (${n0(tot.sc.n)})</div><div style="${TM(11.5, 800, ET.ink)}"><span style="color:${ET.negative}">${n0(tot.sc.behind)}</span> / <span style="color:${ET.positive}">${n0(tot.sc.above)}</span></div></div>
      </div>
    </div>`;

    o += sectionHeading('RBH WISE SUMMARY · VOLUME', cols.join(' / '));
    o += `<div class="esurf" style="border-radius:18px;padding:13px 14px;margin:8px 0 14px">
      <div style="${TB(10, 800, ET.primary, 0.5)}">${esc(volTotalLabel.toUpperCase())} (${esc(seg.toUpperCase())})</div>
      ${volRow(tot.vol)}
    </div>`;

    if (!sc) {
      const tileRow = (label, text) => {
        const p = String(text || '').split('/');
        const bh = parseFloat(p[0]), of = parseFloat(p[1]);
        const pct = of ? (bh / of) * 100 : 0;
        return `<div style="padding:10px 0;border-top:1px solid ${ET.grid}">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
            <span style="${TB(12, 700, ET.text2)}">${esc(label)}</span>
            <span style="${TM(13, 800, ET.ink)}">${esc(String(text || '–').trim())} <span style="${TB(10.5, 700, ET.negative)}">(${Math.round(pct)}%)</span></span>
          </div>
          <div style="height:6px;margin-top:6px;border-radius:999px;background:${ET.tile};overflow:hidden">
            <div style="height:6px;width:${Math.min(100, pct).toFixed(1)}%;background:${ET.negative}"></div>
          </div>
        </div>`;
      };
      const sk = isSme ? 'sme' : 'retail';
      const g = k => (said[k] || {})[sk];
      o += sectionHeading('CONSOLIDATED – BREAKUP', 'Behind base');
      o += `<div class="esurf" style="border-radius:18px;padding:13px 14px;margin:8px 0 14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="${TB(11, 800, ET.primary, 0.5)}">${isSme ? 'SUMMARY – AHP' : 'SUMMARY – FE'}</span>
          <span style="padding:2px 8px;border-radius:999px;background:${ET.tile};${TB(10, 700, ET.text2)}">${esc(seg)}</span>
        </div>
        ${tileRow(isSme ? 'Hub Mgr.' : 'Cluster Mgr.', g('CM'))}
        ${tileRow(isSme ? 'Hub Mgr. Self' : 'Cluster Mgr. Self', g('CM Self'))}
        ${tileRow('Service Center', g('SC'))}
      </div>`;
    }

    o += sectionHeading(`BY ${rbhLbl} · ${seg.toUpperCase()} · ${blk.head.toUpperCase()}`, `${F.count(rows.length)} ${rbhLbl}s`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Behind / Above counts · tap ${isSme ? 'an RBH-SME to view Hub Managers' : 'an RBH to view Area Heads'}</div>`;
    rows.forEach(r => {
      const tip = `${seg} · under ${blk.head}\n${mgrShort}: ${r.mgr.n}\nService Center: ${r.sc.n}`;
      o += `<div class="esurf tap" data-act="bbhead" data-id="${esc(r.name)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px">
          <div class="el1 grow" style="${TB(14, 700, ET.ink)}">${esc(r.name)}</div>
          ${infoBtn(r.name, tip)}
          ${chChevron()}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid}">
          <div><div style="${TB(9, 800, ET.muted)}">${mgrShort} (${n0(r.mgr.n)})</div><div style="margin-top:3px;${TM(11.5, 700, ET.ink)}"><span style="color:${ET.negative}">${n0(r.mgr.behind)}</span> / <span style="color:${ET.positive}">${n0(r.mgr.above)}</span></div></div>
          <div><div style="${TB(9, 800, ET.muted)}">${mgrShort} SELF</div><div style="margin-top:3px;${TM(11.5, 700, ET.ink)}"><span style="color:${ET.negative}">${n0(r.self.behind)}</span> / <span style="color:${ET.positive}">${n0(r.self.above)}</span></div></div>
          <div><div style="${TB(9, 800, ET.muted)}">SC (${n0(r.sc.n)})</div><div style="margin-top:3px;${TM(11.5, 700, ET.ink)}"><span style="color:${ET.negative}">${n0(r.sc.behind)}</span> / <span style="color:${ET.positive}">${n0(r.sc.above)}</span></div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* RETAIL LEVEL 2: Area Heads under picked Retail RBH */
  if (!isSme && !pickedAh) {
    let o = contextPill(`Retail · ${picked.name} · Behind Base${childWho(vm)}`);
    o += `<div class="esurf" style="border-radius:18px;padding:14px;margin-top:12px">
      <div style="${TB(10, 800, ET.primary, 0.6)}">RETAIL · UNDER ${esc(blk.head.toUpperCase())}</div>
      <div style="margin-top:3px;${TD(17, 800, ET.ink)}">${esc(picked.name)}</div>
      ${bhBoxes('CM', picked.mgr.n, picked.mgr.behind, picked.mgr.above)}
      ${bhBoxes('CM Self', undefined, picked.self.behind, picked.self.above)}
      ${bhBoxes('Service Center', picked.sc.n, picked.sc.behind, picked.sc.above)}
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid}">
        <div style="${TB(10, 800, ET.primary, 0.6)}">VOLUME · PKR MN</div>
        ${volRow(picked.vol)}
      </div>
    </div>`;

    o += `<div style="height:14px"></div>` + sectionHeading(`BY AREA HEAD · ${picked.name.toUpperCase()}`, `${F.count(areas.length)} area heads`);
    o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Service Center behind / above base &amp; volume · tap an Area Head to view Cluster Managers</div>`;
    areas.forEach(a => {
      o += `<div class="esurf tap" data-act="bbah" data-id="${esc(a.ah)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="grow">
            <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(a.ah)}</div>
            <div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${a.area ? `${esc(a.area)} · ` : ''}${F.count(a.clusters.length)} clusters · ${F.count(a.n)} br</div>
          </div>
          ${chChevron()}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div><div style="${TB(9, 700, ET.muted)}">BEHIND BASE</div><div style="margin-top:2px;${TM(12.5, 800, ET.negative)}">${n0(a.behind)}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">ABOVE BASE</div><div style="margin-top:2px;${TM(12.5, 800, ET.positive)}">${n0(a.above)}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">YTD VOL</div><div style="margin-top:2px">${chDelta(a.vol[2])}</div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* RETAIL LEVEL 3 (Cluster Managers under AH) OR SME LEVEL 2 (Hub Managers under RBH-SME) */
  if (!pickedMgr) {
    let o = isSme
      ? contextPill(`SME · ${picked.name} · Behind Base${childWho(vm)}`)
      : contextPill(`Retail · ${picked.name} · ${pickedAh.ah}${childWho(vm)}`);

    if (isSme) {
      o += `<div class="esurf" style="border-radius:18px;padding:14px;margin-top:12px">
        <div style="${TB(10, 800, ET.primary, 0.6)}">SME · UNDER ${esc(blk.head.toUpperCase())}</div>
        <div style="margin-top:3px;${TD(17, 800, ET.ink)}">${esc(picked.name)}</div>
        ${bhBoxes('HM', picked.mgr.n, picked.mgr.behind, picked.mgr.above)}
        ${bhBoxes('HM Self', undefined, picked.self.behind, picked.self.above)}
        ${bhBoxes('Service Center', picked.sc.n, picked.sc.behind, picked.sc.above)}
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid}">
          <div style="${TB(10, 800, ET.primary, 0.6)}">VOLUME · PKR MN</div>
          ${volRow(picked.vol)}
        </div>
      </div>`;
      o += `<div style="height:14px"></div>` + sectionHeading(`BY HUB MANAGER · ${picked.name.toUpperCase()}`, `${F.count(mgrList.length)} hub managers`);
      o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Tap a Hub Manager to view Service Centers</div>`;
    } else {
      o += `<div class="esurf" style="border-radius:18px;padding:14px;margin-top:12px">
        <div style="${TB(10, 800, ET.primary, 0.6)}">RETAIL · AREA HEAD</div>
        <div class="el1" style="margin-top:3px;${TD(16.5, 800, ET.ink)}">${esc(pickedAh.ah)}</div>
        ${pickedAh.area ? `<div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(pickedAh.area)} · ${F.count(mgrList.length)} clusters</div>` : ''}
        ${bhBoxes('Service Center', pickedAh.n, pickedAh.behind, pickedAh.above)}
        ${volRow(pickedAh.vol)}
      </div>`;
      o += `<div style="height:14px"></div>` + sectionHeading(`BY CLUSTER MANAGER · ${pickedAh.ah.toUpperCase()}`, `${F.count(mgrList.length)} clusters`);
      o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">Tap a Cluster Manager to view Service Centers</div>`;
    }

    mgrList.forEach(c => {
      const tip = isSme
        ? `Hub Manager: ${c.cm}\nHub branch: ${c.cmBranch}\nRBH-SME: ${picked.name}`
        : `Cluster Manager: ${c.cm}\nCluster branch: ${c.cmBranch}\nArea Head: ${pickedAh.ah}${pickedAh.area ? `\nArea: ${pickedAh.area}` : ''}\nRBH: ${picked.name}`;
      o += `<div class="esurf tap" data-act="bbcm" data-id="${esc(c.key)}" style="border-radius:18px;padding:13px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px">
          <div class="grow">
            <div class="el1" style="${TB(14, 700, ET.ink)}">${esc(c.cm)}</div>
            <div class="el1" style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(c.cmBranch)} · ${F.count(c.n)} ${c.n === 1 ? 'branch' : 'branches'}</div>
          </div>
          ${infoBtn(c.cm, tip)}
          ${chChevron()}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid};display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div><div style="${TB(9, 700, ET.muted)}">BEHIND BASE</div><div style="margin-top:2px;${TM(12.5, 800, ET.negative)}">${n0(c.behind)}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">ABOVE BASE</div><div style="margin-top:2px;${TM(12.5, 800, ET.positive)}">${n0(c.above)}</div></div>
          <div><div style="${TB(9, 700, ET.muted)}">YTD VOL</div><div style="margin-top:2px">${chDelta(c.vol[2])}</div></div>
        </div>
      </div>`;
    });
    return o;
  }

  /* LEAF LEVEL (Retail L4 / SME L3): Service Centers under picked CM / HM (Total card at top) */
  let o = isSme
    ? contextPill(`SME · ${picked.name} · ${pickedMgr.cm}${childWho(vm)}`)
    : contextPill(`Retail · ${picked.name} · ${pickedAh.ah} · ${pickedMgr.cm}${childWho(vm)}`);

  o += `<div class="esurf" style="border-radius:16px;padding:13px 14px;margin-top:12px;background:#F2FAF6;border-color:rgba(4,120,87,.25)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="${TB(12.5, 800, ET.primary)}">Total · ${F.count(pickedMgr.n)} ${pickedMgr.n === 1 ? 'branch' : 'branches'}</span>
      <span style="${TB(10.5, 700, ET.muted)}"><b style="color:${ET.negative}">${n0(pickedMgr.behind)} behind</b> · <b style="color:${ET.positive}">${n0(pickedMgr.above)} above</b></span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(4,120,87,.15)">
      <div><div style="${TB(9, 700, ET.muted)}">${esc(cols[0].toUpperCase())}</div><div style="margin-top:2px;${TM(12.5, 800, ET.ink)}">${amt(pickedMgr.vol[0])}</div></div>
      <div><div style="${TB(9, 700, ET.muted)}">${esc(cols[1].toUpperCase())}</div><div style="margin-top:2px;${TM(12.5, 800, ET.ink)}">${amt(pickedMgr.vol[1])}</div></div>
      <div><div style="${TB(9, 700, ET.muted)}">${esc(cols[2].toUpperCase())}</div><div style="margin-top:2px">${chDelta(pickedMgr.vol[2])}</div></div>
    </div>
  </div>`;

  o += `<div style="height:14px"></div>` + sectionHeading(`BY SERVICE CENTER · ${pickedMgr.cm.toUpperCase()}`, `${F.count(pickedMgr.branches.length)} ${pickedMgr.branches.length === 1 ? 'branch' : 'branches'}`);
  o += `<div style="padding:3px 2px 10px;${TB(10.5, 500, ET.muted, null, 14)}">${esc(pickedMgr.cmBranch)} · Behind Base = YTD &lt; 0 vs ${esc(cols[0])} · PKR Mn</div>`;

  pickedMgr.branches.forEach(br => {
    const badgeBg = br.behind ? '#FEF2F2' : 'rgba(4,120,87,.12)';
    const badgeTone = br.behind ? ET.negative : ET.positive;
    const badgeLbl = br.behind ? 'Behind Base' : 'Above Base';
    o += `<div class="esurf" style="border-radius:16px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:6px">
        <div class="grow">
          <div class="el2" style="${TB(13.5, 700, ET.ink)}">${esc(br.name)}</div>
          ${br.stream ? `<div style="margin-top:2px;${TB(10.5, 600, ET.muted)}">${esc(br.stream)}</div>` : ''}
        </div>
        ${infoBtn(br.name, EopData.whose(br.name))}
        <span style="padding:3px 9px;border-radius:999px;background:${badgeBg};${TB(10, 800, badgeTone)}flex:none">${badgeLbl}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid ${ET.grid}">
        <div><div style="${TB(9, 700, ET.muted)}">${esc(cols[0].toUpperCase())}</div><div style="margin-top:2px;${TM(12, 700, ET.ink)}">${amt(br.dec)}</div></div>
        <div><div style="${TB(9, 700, ET.muted)}">${esc(cols[1].toUpperCase())}</div><div style="margin-top:2px;${TM(12, 700, ET.ink)}">${amt(br.jul)}</div></div>
        <div><div style="${TB(9, 700, ET.muted)}">${esc(cols[2].toUpperCase())}</div><div style="margin-top:2px">${chDelta(br.ytd)}</div></div>
      </div>
    </div>`;
  });
  return o;
}

function renderEopChild(vm) {
  if (vm.s.view === 'move') return renderMovement(vm);
  if (vm.s.view === 'flows') return renderFlows(vm);
  if (vm.s.view === 'wow') return renderWow(vm);
  if (vm.s.view === 'base') return renderBase(vm);
  return '';
}

function handleEopChildBack(vm) {
  const isSme = childActiveSeg(vm) === 'SME';
  if (vm.s.view === 'move') {
    const minDepth = childMinDepth(vm, false);
    if (vm.s.mvCluster && minDepth < 3) { vm.set({ mvCluster: '' }); return true; }
    if (vm.s.mvAh && minDepth < 2) { vm.set({ mvAh: '', mvCluster: '' }); return true; }
    if (vm.s.mvHead && minDepth < 1) { vm.set({ mvHead: '', mvAh: '', mvCluster: '' }); return true; }
    vm.closeChildReport(); return true;
  }
  if (vm.s.view === 'flows') {
    const minDepth = childMinDepth(vm, isSme);
    if (vm.s.flHead && minDepth < 1) { vm.set({ flHead: '' }); return true; }
    vm.closeChildReport(); return true;
  }
  if (vm.s.view === 'wow') {
    const minDepth = childMinDepth(vm, false);
    if (vm.s.wowCluster && minDepth < 3) { vm.set({ wowCluster: '' }); return true; }
    if (vm.s.wowAh && minDepth < 2) { vm.set({ wowAh: '', wowCluster: '' }); return true; }
    if (vm.s.wowHead && minDepth < 1) { vm.set({ wowHead: '', wowAh: '', wowCluster: '' }); return true; }
    vm.closeChildReport(); return true;
  }
  if (vm.s.view === 'base') {
    const minDepth = childMinDepth(vm, isSme);
    if (isSme) {
      if (vm.s.bbCm && minDepth < 2) { vm.set({ bbCm: '' }); return true; }
      if (vm.s.bbHead && minDepth < 1) { vm.set({ bbHead: '', bbAh: '', bbCm: '' }); return true; }
      vm.closeChildReport(); return true;
    }
    if (vm.s.bbCm && minDepth < 3) { vm.set({ bbCm: '' }); return true; }
    if (vm.s.bbAh && minDepth < 2) { vm.set({ bbAh: '', bbCm: '' }); return true; }
    if (vm.s.bbHead && minDepth < 1) { vm.set({ bbHead: '', bbAh: '', bbCm: '' }); return true; }
    vm.closeChildReport(); return true;
  }
  return false;
}

function handleEopChildClick(vm, t) {
  const act = t.dataset.act, id = t.dataset.id;
  if (act === 'chseg') {
    vm.set({ childSeg: id, flHead: '', flPeriod: 'ytd', bbHead: '', bbAh: '', bbCm: '' });
    return true;
  }
  if (act === 'mvhead') { vm.set({ mvHead: id, mvAh: '', mvCluster: '' }); return true; }
  if (act === 'mvah') { vm.set({ mvAh: id, mvCluster: '' }); return true; }
  if (act === 'mvcl') { vm.set({ mvCluster: id }); return true; }
  if (act === 'flhead') { vm.set({ flHead: id, flPeriod: 'ytd' }); return true; }
  if (act === 'flper') { vm.set({ flPeriod: id }); return true; }
  if (act === 'flbranch') { showFlowBranchSheet(_flActionStore.branches[+t.dataset.idx]); return true; }
  if (act === 'flclient') { showFlowClientSheet(_flActionStore.clients[+t.dataset.idx]); return true; }
  if (act === 'wowhead') { vm.set({ wowHead: id, wowAh: '', wowCluster: '' }); return true; }
  if (act === 'wowah') { vm.set({ wowAh: id, wowCluster: '' }); return true; }
  if (act === 'wowcl') { vm.set({ wowCluster: id }); return true; }
  if (act === 'bbhead') { vm.set({ bbHead: id, bbAh: '', bbCm: '' }); return true; }
  if (act === 'bbah') { vm.set({ bbAh: id, bbCm: '' }); return true; }
  if (act === 'bbcm') { vm.set({ bbCm: id }); return true; }
  return false;
}
