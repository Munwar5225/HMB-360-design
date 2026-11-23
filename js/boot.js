/* =====================================================================
   Boot — Standalone Mobile View (modular runtime, lazy report data)
   ===================================================================== */
function ensureSession() { Store.session = true; if (!Store.user) Store.user = { ...DEMO_USER }; if (!Store.pendingLoginId) Store.pendingLoginId = DEMO_USER.username; }
function reset() { Overlay.closeAll(); Snack.clear(); }
function waitFor(fn, timeout = 8000) { return new Promise(res => { const t0 = Date.now(); const tick = () => { if (fn() || Date.now() - t0 > timeout) return res(); setTimeout(tick, 40); }; tick(); }); }

function setRoleIfNeeded(roleId) {
  const r = LOGIN_ROLES.find(x => x.id === roleId) || LOGIN_ROLES[0];
  Store.loginRole = r;
}

async function eopScreen({ pf, roleId } = {}) {
  if (roleId) setRoleIfNeeded(roleId);
  ensureSession();
  Nav.go('/home');
  Nav.go('/eop-report');
  const scr = Nav.top().screen, vm = scr.vm;
  await waitFor(() => vm.s.loaded);
  if (pf && pf !== vm.s.pf) { await vm.selectPortfolio(pf); await waitFor(() => !vm.s.refreshing); }
  return scr;
}
async function eopDrill(metric, path = [], opts = {}) {
  const scr = await eopScreen(opts), vm = scr.vm;
  await vm.selectProduct(metric);
  await waitFor(() => !vm.s.refreshing);
  for (const name of path) {
    await vm.openChild(name);
    await waitFor(() => !vm.s.refreshing);
  }
  return scr;
}
async function ntbScreen({ pf, roleId } = {}) {
  if (roleId) setRoleIfNeeded(roleId);
  ensureSession();
  Nav.go('/home');
  Nav.go('/ntb-report');
  const scr = Nav.top().screen, vm = scr.vm;
  await waitFor(() => vm.s.loaded);
  if (pf && pf !== vm.s.pf) { await vm.selectPortfolio(pf); await waitFor(() => !vm.s.refreshing); }
  return scr;
}
async function ntbDrill(cardId, path = [], opts = {}) {
  const scr = await ntbScreen(opts), vm = scr.vm;
  await vm.selectCard(cardId);
  await waitFor(() => !vm.s.refreshing);
  for (const name of path) {
    const row = vm.rowsHere().find(r => r.id === name);
    if (row) { await vm.openRow(row); await waitFor(() => !vm.s.refreshing); }
  }
  return scr;
}

/* Programmatic hook for automated UI verification */
window.__HMB__ = {
  eopScreen, eopDrill, ntbScreen, ntbDrill, DataLoader,
  setRole(roleId) {
    setRoleIfNeeded(roleId);
    reset();
    const top = Nav.top();
    if (top && (top.route === '/home' || REPORT_REGISTRY.some(r => r.route === top.route))) Nav.go(top.route);
  },
  home() { reset(); ensureSession(); Nav.go('/home'); },
  openRoleCard: async (roleName, opts) => { const s = await ntbScreen(opts); await s.vm.openRoleCard(roleName); return s; },
};

(function boot() {
  const nb = $('#navBack'), nh = $('#navHome');
  if (nb) nb.onclick = hardwareBack;
  if (nh) nh.onclick = () => { reset(); if (Store.session) Nav.go('/home'); else Nav.go('/login'); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hardwareBack(); });

  let rzTimer = null;
  window.addEventListener('resize', () => {
    Shell.fit();
    clearTimeout(rzTimer);
    rzTimer = setTimeout(() => {
      const t = Nav.top();
      if (t && t.screen && t.screen.vm && t.screen.vm.onChange) t.screen.vm.onChange();
    }, 120);
  });

  Shell.fit();
  Shell.clock();
  setInterval(Shell.clock, 15000);

  ensureSession();
  Nav.go('/');

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const t = Nav.top();
      if (t && t.screen && t.screen.vm && t.screen.vm.onChange) t.screen.vm.onChange();
    });
  }
})();
