'use strict';
/* =====================================================================
   HMB 360 — Core Runtime, Router, Overlays, DataLoader & Device Shell
   ===================================================================== */

/* Shared lazy-loaded dataset store (populated on demand from data/*.js) */
window.WEB_DATA = window.WEB_DATA || {};

const DataLoader = (() => {
  const inflight = {};
  function loadOne(name) {
    if (inflight[name]) return inflight[name];
    inflight[name] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `data/${name}.js`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { delete inflight[name]; reject(new Error(`Failed to load data/${name}.js`)); };
      document.head.appendChild(s);
    });
    return inflight[name];
  }
  function load(...names) { return Promise.all(names.map(loadOne)); }
  return { load };
})();

/* ---------------- utils ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
/* Material icon: v = f (Icons.x) | o (Icons.x_outlined) | r (Icons.x_rounded) */
function I(name, v = 'f', size = 24, color = 'currentColor', extra = '') {
  return `<i class="mi mi-${v}" style="font-size:${size}px;color:${color};${extra}">${name}</i>`;
}
/* CircularProgressIndicator */
function spinner(size = 36, stroke = 4, color = 'var(--primary)') {
  const sw = stroke * 44 / size;
  return `<svg class="spin" width="${size}" height="${size}" viewBox="0 0 44 44"><circle cx="22" cy="22" r="${22 - sw / 2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
}
/* LinearProgressIndicator (indeterminate) */
function linear(height = 4, color = 'var(--ePrimary)', track = 'var(--eTrack)') {
  return `<div class="lin" style="height:${height}px;background:${track};--c:${color}"></div>`;
}
function phoneScale() { const app = $('#app'); return app.getBoundingClientRect().width / app.offsetWidth || 1; }
function relRect(el) {
  const app = $('#app').getBoundingClientRect(); const r = el.getBoundingClientRect(); const s = phoneScale();
  return { left: (r.left - app.left) / s, top: (r.top - app.top) / s, width: r.width / s, height: r.height / s, right: (r.right - app.left) / s, bottom: (r.bottom - app.top) / s };
}
function appW() { return ($('#app') && $('#app').offsetWidth) || 412; }
const APP_W = 412;
function appH() { return ($('#app') && $('#app').offsetHeight) || 844; }

/* ---------------- colors (AppColors) ---------------- */
const C = {
  primary: '#00573F', primaryLight: '#007A59', secondary: '#D4AF37', background: '#FFFFFF', onPrimary: '#FFFFFF',
  surface: '#F5F5F5', onSurface: '#1A1A1A', onSurfaceVariant: '#6B7280', error: '#DC2626', outlineVariant: '#E5E7EB',
  scLowest: '#FFFFFF', scLow: '#F9FAFB', sc: '#F3F4F6', green: '#4CAF50',
};

/* ---------------- app state (secure storage / auth state mocks) ---------------- */
const CONFIG = {
  env: 'dev',
  apiUrl: 'http://salesforceapi.uhfdemo.com/api/v1',
  apiUrlList: ['http://salesforceapi.uhfdemo.com/api/v1', 'http://thesalesforceapi.avengers.pk/api/v1'],
  isTesting: true,
};
const DEMO_USER = {
  username: 'hmb.demo', firstName: 'Muhammad', lastName: 'Ahmed Khan', designationName: 'Branch Manager',
  branchName: 'IBB - Clifton', regionName: 'South Region', areaName: 'Karachi Area 1', empCode: '10245',
  emailAddress: 'muhammad.ahmed@habibmetro.com', phoneNumber: '0300-1234567', profileImg: '',
};
const LOGIN_ROLES = [
  { id: 'ge', label: 'GE Retail', person: 'Head Office', designation: 'Group Executive — Retail', portfolio: 'Both', scope: {}, note: 'Full access — both portfolios, all regions.' },
  { id: 'rbh_retail', label: 'RBH (Retail)', person: 'Wasif Tanwir', designation: 'Regional Business Head — Retail', portfolio: 'Retail', scope: { rbh: 'Wasif Tanwir' }, note: 'Retail portfolio, own region only.' },
  { id: 'rbh_sme', label: 'RBH (SME)', person: 'Nouman Mughal', designation: 'Regional Business Head — SME', portfolio: 'SME', scope: { rbhSme: 'Nouman Mughal' }, note: 'SME portfolio (39 designated branches), own SME region only.' },
  { id: 'ah', label: 'Area Head', person: 'Soorat Khan', designation: 'Area Head', portfolio: 'Retail', scope: { areaHead: 'Soorat Khan' }, note: 'Own area only, pre-filtered on login.' },
  { id: 'cm', label: 'Cluster Manager', person: 'Muhammad Aamir Meraj', designation: 'Cluster Manager', portfolio: 'Retail', scope: { cm: 'Muhammad Aamir Meraj' }, note: 'Own cluster only.' },
  { id: 'hm', label: 'Hub Manager', person: 'Tariq Mehmood', designation: 'Hub Manager — Business Banking', portfolio: 'SME', scope: { hm: 'Tariq Mehmood' }, note: 'Own hub only, SME portfolio (DHA Branch Lahore hub).' },
  { id: 'branch', label: 'Branch (BM / SRM / RM)', person: 'IBB - Quetta', designation: 'Branch Manager', portfolio: 'Retail', scope: { branch: 'IBB - Quetta' }, note: 'Own branch only — the deepest scope.' },
];
const Store = {
  session: false, user: null, pendingLoginId: '', pendingChange: null,
  biometricEnabled: false, biometricAvailable: true, savedUrl: null,
  loginRole: LOGIN_ROLES[0],
};
function currentRole() { return Store.loginRole || LOGIN_ROLES[0]; }
function fullName(u) { const f = `${(u.firstName || '').trim()} ${(u.lastName || '').trim()}`.trim(); return f || u.username; }
function initialsOf(name, fallback) {
  if (!name) return fallback;
  const n = name.split(' ');
  if (n.length >= 2 && n[0] && n[1]) return (n[0][0] + n[1][0]).toUpperCase();
  return n[0][0].toUpperCase();
}

/* ---------------- Router (AppNavigator: go / push / pop) ---------------- */
const Routes = {};
const Nav = {
  stack: [],
  top() { return this.stack[this.stack.length - 1]; },
  _mount(route, extra) {
    const screen = Routes[route](extra || {});
    screen.el.classList.add('route', 'enter');
    screen.el.addEventListener('animationend', () => screen.el.classList.remove('enter'), { once: true });
    $('#routes').appendChild(screen.el);
    return { route, screen, el: screen.el };
  },
  go(route, extra) {
    const old = this.stack;
    const entry = this._mount(route, extra);
    this.stack = [entry];
    old.forEach(e => { e.screen.destroy && e.screen.destroy(); setTimeout(() => e.el.remove(), 400); });
    Shell.onRoute();
    entry.screen.onShow && entry.screen.onShow();
  },
  push(route, extra) {
    return new Promise(resolve => {
      const entry = this._mount(route, extra);
      entry.resolve = resolve;
      this.stack.push(entry);
      Shell.onRoute();
      entry.screen.onShow && entry.screen.onShow();
    });
  },
  canPop() { return this.stack.length > 1; },
  pop(result) {
    if (!this.canPop()) return false;
    const e = this.stack.pop();
    e.screen.destroy && e.screen.destroy();
    e.el.classList.remove('enter'); e.el.classList.add('leave');
    setTimeout(() => e.el.remove(), 300);
    Shell.onRoute();
    const t = this.top(); t.screen.onResume && t.screen.onResume();
    e.resolve && e.resolve(result);
    return true;
  },
};
function hardwareBack() {
  const ov = Overlay.top();
  if (ov) { ov.back(); return; }
  const t = Nav.top(); if (!t) return;
  if (t.screen.onBack) { t.screen.onBack(); return; }
  Nav.pop();
}

/* ---------------- Overlays (dialogs, sheets, drawer, menus) ---------------- */
const Overlay = {
  list: [],
  top() { return this.list[this.list.length - 1]; },
  open({ el, scrim = true, dismissible = true, onDismiss, scrimColor }) {
    const host = $('#overlays');
    const wrap = h(`<div style="position:absolute;inset:0"></div>`);
    let scrimEl = null;
    if (scrim) {
      scrimEl = h(`<div class="scrim"></div>`);
      if (scrimColor) scrimEl.style.background = scrimColor;
      wrap.appendChild(scrimEl);
      scrimEl.addEventListener('click', () => { if (dismissible) handle.close(undefined, true); });
    } else {
      wrap.addEventListener('click', e => { if (e.target === wrap) handle.close(undefined, true); });
    }
    wrap.appendChild(el);
    host.appendChild(wrap);
    let resolveFn; const done = new Promise(r => (resolveFn = r));
    let closed = false;
    const handle = {
      el, done,
      close(result, dismissed) {
        if (closed) return; closed = true;
        Overlay.list = Overlay.list.filter(o => o !== handle);
        el.classList.remove('on'); scrimEl && scrimEl.classList.remove('on');
        setTimeout(() => wrap.remove(), 260);
        if (dismissed && onDismiss) onDismiss();
        resolveFn(result);
      },
      back() { handle.close(undefined, true); },
    };
    this.list.push(handle);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('on'); scrimEl && scrimEl.classList.add('on'); }));
    return handle;
  },
  closeAll() { [...this.list].reverse().forEach(o => o.close()); },
};

function showInfoDialog(title, message, dismissible = true) {
  const el = h(`<div class="dialog"><h3>${esc(title)}</h3><p>${esc(message)}</p><div class="actions"><button class="text-btn" data-a="ok" style="font-weight:700">OK</button></div></div>`);
  const d = Overlay.open({ el, dismissible });
  el.querySelector('[data-a=ok]').onclick = () => d.close();
  return d.done;
}
function showConfirmDialog(title, message, confirmText = 'Confirm', destructive = false) {
  const el = h(`<div class="dialog"><h3>${esc(title)}</h3><p>${esc(message)}</p><div class="actions">
      <button class="text-btn" data-a="no" style="color:var(--onSurfaceVariant)">Cancel</button>
      <button class="text-btn" data-a="yes" style="font-weight:700;color:${destructive ? 'var(--error)' : 'var(--primary)'}">${esc(confirmText)}</button></div></div>`);
  const d = Overlay.open({ el });
  el.querySelector('[data-a=no]').onclick = () => d.close(false);
  el.querySelector('[data-a=yes]').onclick = () => d.close(true);
  return d.done;
}
function openSheet(contentEl, { bg = '#fff', radius = 28, maxHeightPct = 0.88, onDismiss } = {}) {
  const el = h(`<div class="sheet" style="background:${bg};border-radius:${radius}px ${radius}px 0 0;max-height:${Math.round(appH() * maxHeightPct)}px"></div>`);
  el.appendChild(contentEl);
  return Overlay.open({ el, onDismiss });
}
function showTipSheet(title, tipText) {
  if (!tipText) return;
  let head = title || '', rows = '', notes = '';
  String(tipText).split('\n').forEach((raw, i) => {
    const ln = raw.trim(); if (!ln) return;
    const k = ln.indexOf(': ');
    if (!i && k < 0 && !head) { head = ln; return; }
    if (k > 0) {
      rows += `<div style="padding:11px 0;border-bottom:1px solid #E9EEEB;display:flex;align-items:baseline;gap:12px">
        <span style="font:600 12px var(--fBody);color:#62716A;flex:none">${esc(ln.slice(0, k))}</span>
        <span style="font:700 13px var(--fBody);color:#0E1512;text-align:right;flex:1;min-width:0;word-break:break-word">${esc(ln.slice(k + 2))}</span></div>`;
    } else if (ln[0] === '(') {
      notes += `<div style="margin-top:10px;font:500 12px/17px var(--fBody);color:#62716A">${esc(ln)}</div>`;
    } else {
      notes += `<div style="margin-top:10px;display:inline-block;padding:4px 10px;border-radius:999px;background:#F1F5F2;font:700 11px var(--fBody);color:#31443A">${esc(ln)}</div>`;
    }
  });
  const content = h(`<div style="display:flex;flex-direction:column;min-height:0;max-height:inherit">
    <div style="padding:18px 18px 14px;display:flex;align-items:center;gap:12px;flex:none">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(4,120,87,.1);display:flex;align-items:center;justify-content:center;flex:none">${I('info_outline', 'f', 16, '#047857')}</div>
      <span class="el2 grow" style="font:700 15px var(--fBody);color:#0E1512">${esc(head || 'Details')}</span>
      <div data-act="close" style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none">${I('close', 'r', 16, '#0E1512')}</div>
    </div>
    <div style="height:1px;background:#E9EEEB;flex:none"></div>
    <div class="scroll" style="padding:4px 18px 20px">${rows}${notes}</div></div>`);
  const s = openSheet(content, { maxHeightPct: 0.72 });
  content.querySelector('[data-act=close]').onclick = () => s.close();
}
function openMenu(anchor, items, { width, minWidth = 112, maxWidth = 280, color = '#fff', overlap = false } = {}) {
  const r = relRect(anchor);
  const el = h(`<div class="menu" style="background:${color}"></div>`);
  items.forEach(it => {
    const m = h(`<div class="mitem">${it.html}</div>`);
    if (it.height) m.style.minHeight = it.height + 'px';
    m.onclick = () => handle.close(it.value);
    el.appendChild(m);
  });
  if (width) { el.style.width = width + 'px'; } else { el.style.minWidth = minWidth + 'px'; el.style.maxWidth = maxWidth + 'px'; }
  const H = appH();
  let top = overlap ? r.top - 8 : r.bottom;
  el.style.visibility = 'hidden';
  const handle = Overlay.open({ el, scrim: false });
  const mh = Math.min(el.offsetHeight, H - 16 - 28);
  el.style.maxHeight = mh + 'px';
  if (top + mh > H - 8) top = Math.max(28 + 8, H - 8 - mh);
  let left = r.left;
  const mw = el.offsetWidth, aw = appW();
  if (left + mw > aw - 8) left = aw - 8 - mw;
  if (left < 8) left = 8;
  el.style.left = left + 'px'; el.style.top = top + 'px'; el.style.visibility = '';
  return handle.done;
}

/* ---------------- SnackBar ---------------- */
const Snack = {
  queue: [], showing: null,
  show(message, { bg = C.primary, color = '#fff', floating = true } = {}) {
    this.queue.push({ message, bg, color, floating });
    if (!this.showing) this._next();
  },
  error(m) { this.show(m, { bg: C.error }); },
  success(m) { this.show(m, { bg: C.primary }); },
  warning(m) { this.show(m, { bg: C.secondary, color: C.onSurface }); },
  plain(m) { this.show(m, { bg: 'var(--m3InverseSurface)', color: 'var(--m3InverseOn)', floating: false }); },
  _next() {
    const s = this.queue.shift(); if (!s) { this.showing = null; return; }
    const el = h(`<div class="snack ${s.floating ? '' : 'fixed'}" style="background:${s.bg};color:${s.color}">${esc(s.message)}</div>`);
    $('#snack-host').appendChild(el);
    this.showing = el;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    const hide = () => { el.classList.remove('on'); setTimeout(() => { el.remove(); this._next(); }, 250); };
    el.onclick = hide;
    setTimeout(hide, 4000);
  },
  clear() { this.queue = []; $$('#snack-host .snack').forEach(e => e.remove()); this.showing = null; },
};

/* ---------------- Biometric prompt ---------------- */
function biometricPrompt(reason) {
  const el = h(`<div class="sheet" style="background:#F7F9F6;border-radius:28px 28px 0 0;margin:0 8px 8px;border-radius:28px;bottom:0">
    <div style="padding:28px 24px 16px;text-align:center;font-family:var(--fApp)">
      <div style="font:500 13px var(--fApp);color:var(--onSurfaceVariant);margin-bottom:6px">HMB 360</div>
      <div style="font:400 24px var(--fApp);color:var(--onSurface)">Authentication required</div>
      <div style="font:400 14px var(--fApp);color:var(--onSurfaceVariant);margin-top:8px">${esc(reason)}</div>
      <button data-a="fp" title="Tap to simulate a fingerprint touch" style="margin:28px auto 10px;width:64px;height:64px;border-radius:50%;border:0;background:${rgba(C.primary, .1)};display:flex;align-items:center;justify-content:center;cursor:pointer">${I('fingerprint', 'f', 40, C.primary)}</button>
      <div data-a="hint" style="font:400 14px var(--fApp);color:var(--onSurfaceVariant)">Touch the fingerprint sensor</div>
      <div style="font:400 11px var(--fApp);color:#9AA39E;margin-top:4px">(tap the icon to simulate)</div>
      <div style="display:flex;justify-content:flex-start;margin-top:20px"><button class="text-btn" data-a="cancel">Cancel</button></div>
    </div></div>`);
  const d = Overlay.open({ el });
  el.querySelector('[data-a=cancel]').onclick = () => d.close(false);
  el.querySelector('[data-a=fp]').onclick = async () => {
    el.querySelector('[data-a=fp]').innerHTML = I('check_circle', 'f', 40, C.primary);
    el.querySelector('[data-a=hint]').textContent = 'Fingerprint recognised';
    await sleep(450); d.close(true);
  };
  return d.done.then(v => !!v);
}

/* ---------------- base UI widgets ---------------- */
function appBar(title, { back = false, menu = false } = {}) {
  return `<div class="appbar"><div class="bar">
    ${back ? `<button class="icon-btn lead" data-a="back">${I('arrow_back', 'f', 24, '#fff')}</button>` : ''}
    ${menu ? `<button class="icon-btn lead" data-a="menu">${I('menu', 'f', 24, '#fff')}</button>` : ''}
    <div class="title">${esc(title)}</div></div></div>`;
}
function TextField(o) {
  const el = h(`<div class="tf ${o.prefix ? '' : 'nopre'}">
    <div class="tf-box">
      ${o.prefix ? `<span class="tf-pre">${I(o.prefix[0], o.prefix[1], 24, C.onSurfaceVariant)}</span>` : ''}
      ${o.label ? `<label>${esc(o.label)}</label>` : ''}
      <div class="tf-in"><input type="${o.obscure ? 'password' : 'text'}" autocomplete="off" spellcheck="false" ${o.maxLength ? `maxlength="${o.maxLength}"` : ''}></div>
      ${o.toggle ? `<button class="icon-btn tf-suf" type="button" data-a="eye"></button>` : ''}
    </div>
    <div class="tf-err"></div></div>`);
  const input = el.querySelector('input');
  let obscure = !!o.obscure;
  const sync = () => {
    const focus = document.activeElement === input;
    el.classList.toggle('focus', focus);
    el.classList.toggle('float', !!o.label && (focus || input.value.length > 0));
    input.placeholder = (!o.label || focus) ? (o.hint || '') : '';
  };
  const renderEye = () => {
    if (!o.toggle) return;
    const [onIcon, offIcon] = o.toggle;
    const ic = obscure ? onIcon : offIcon;
    el.querySelector('[data-a=eye]').innerHTML = I(ic, 'o', o.toggleSize || 24, C.onSurfaceVariant);
  };
  input.addEventListener('focus', sync); input.addEventListener('blur', sync); input.addEventListener('input', sync);
  if (o.onEnter) input.addEventListener('keydown', e => { if (e.key === 'Enter') o.onEnter(); });
  if (o.toggle) el.querySelector('[data-a=eye]').onclick = () => { obscure = !obscure; input.type = obscure ? 'password' : 'text'; renderEye(); };
  renderEye(); sync();
  return {
    el, input,
    get value() { return input.value; },
    set value(v) { input.value = v; sync(); },
    validate() {
      const msg = o.validator ? o.validator(input.value) : null;
      el.classList.toggle('err', !!msg);
      el.querySelector('.tf-err').textContent = msg || '';
      return !msg;
    },
  };
}
function GradButton(label, icon, onClick) {
  const el = h(`<button class="btn-grad" type="button"></button>`);
  let loading = false;
  const render = () => {
    el.classList.toggle('loading', loading);
    el.innerHTML = (loading ? spinner(18, 2, '#fff') : I(icon[0], icon[1], 18, '#fff')) + `<span>${esc(label)}</span>`;
  };
  el.onclick = () => { if (!loading) onClick(); };
  render();
  return { el, setLoading(v) { loading = v; render(); }, get loading() { return loading; } };
}
function errorBox(msg) {
  return `<div style="padding:12px;background:${rgba(C.error, .08)};border-radius:12px;border:1px solid ${rgba(C.error, .2)};display:flex;align-items:center;gap:8px">
    ${I('error_outline', 'r', 18, C.error)}<span class="t" style="flex:1;color:${C.error};font-size:13px">${esc(msg)}</span></div>`;
}
function gradientIconBox(size, radius, icon, iconSize, shadow) {
  return `<div class="gbox" style="width:${size}px;height:${size}px;border-radius:${radius}px;${shadow ? `box-shadow:${shadow}` : ''}">${I(icon[0], icon[1], iconSize, '#fff')}</div>`;
}
const PWD_RULES = '• Minimum 8 characters\n• At least one digit (0-9)\n• At least one lowercase letter\n• At least one uppercase letter\n• At least one special character (!@#$%^&+_=;*)\n• No spaces allowed';
function validComplexity(p) { return p.length >= 8 && /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&+_=;*])(?=\S+$).+$/.test(p); }

/* ---------------- Shell (status bar, responsive phone chrome) ---------------- */
const Shell = {
  onRoute() {
    const t = Nav.top();
    $('#statusbar').classList.toggle('light', !!(t && t.screen.light));
    $('#app').style.background = (t && t.screen.bg) || '#fff';
  },
  clock() {
    const d = new Date();
    $('#sbTime').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  fit() {
    const wrap = $('#phoneWrap');
    const phone = wrap && wrap.firstElementChild;
    if (!wrap || !phone) return;
    const isMobile = window.innerWidth <= 520;
    document.body.classList.toggle('mobile-full', isMobile);
    if (isMobile) {
      wrap.style.width = ''; wrap.style.height = '';
      phone.style.transform = '';
      return;
    }
    const pw = 436, ph = 916;
    const availH = Math.max(320, window.innerHeight - 32);
    const availW = Math.max(240, window.innerWidth - 32);
    const s = Math.min(1, availH / ph, availW / pw);
    wrap.style.width = (pw * s).toFixed(2) + 'px';
    wrap.style.height = (ph * s).toFixed(2) + 'px';
    phone.style.transformOrigin = 'top left';
    phone.style.transform = `scale(${s})`;
  },
};
