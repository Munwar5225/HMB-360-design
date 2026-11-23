/* =====================================================================
   HMB 360 — Home / Dashboard Screen (reads dynamically from REPORT_REGISTRY)
   ===================================================================== */

Routes['/home'] = () => {
  const el = h(`<div style="background:${ET.background}">${appBar('HMB 360', { menu: true })}
    <div class="scroll" style="flex:1;padding:18px 16px 28px" data-slot="body"></div></div>`);
  el.querySelector('.title').style.fontWeight = '700';
  let alive = true;

  const render = () => {
    const r = currentRole();
    const cardsHtml = REPORT_REGISTRY.map((rep, idx) => {
      const mb = idx === REPORT_REGISTRY.length - 1 ? 16 : 12;
      return `<div class="esurf tap lifted" data-go="${esc(rep.route)}" style="border-radius:20px;padding:15px 14px;margin-bottom:${mb}px;display:flex;align-items:center;gap:12px">
        <div style="width:44px;height:44px;border-radius:14px;background:${rgba(rep.accent, .12)};border:1px solid ${rgba(rep.accent, .25)};display:flex;align-items:center;justify-content:center;flex:none">${I(rep.icon[0], rep.icon[1], 22, rep.accent)}</div>
        <div class="grow">
          <div style="${TB(14.5, 700, ET.ink)}">${esc(rep.title)}</div>
          <div style="margin-top:2px;${TB(11, 500, ET.muted)}">${esc(rep.sub)}</div>
        </div>
        <div class="pillbtn" style="background:${rgba(rep.accent, .08)};border:1px solid ${rgba(rep.accent, .22)}">${I('chevron_right', 'r', 18, rep.accent)}</div>
      </div>`;
    }).join('');

    el.querySelector('[data-slot=body]').innerHTML = `
      <div style="padding:18px 16px;background:linear-gradient(135deg,${C.primary} 0%,${C.primaryLight} 100%);border-radius:22px;color:#fff;box-shadow:0 10px 28px rgba(0,87,63,.2)">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;flex:none">${I('account_balance', 'o', 24, '#fff')}</div>
          <div class="grow">
            <div style="font:700 18px var(--fDisp);letter-spacing:-.2px">Welcome to HMB 360</div>
            <div style="margin-top:2px;font:500 12px var(--fBody);color:rgba(255,255,255,.82)">${esc(r.label)} · ${esc(r.person)}</div>
          </div>
        </div>
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.16);font:500 11.5px/16px var(--fBody);color:rgba(255,255,255,.86)">${esc(r.note)}</div>
      </div>

      <div style="margin-top:18px;padding:0 2px 8px;${TB(10, 800, ET.muted, 0.8)}">REPORTS</div>
      ${cardsHtml}

      <div style="padding:0 2px 8px;${TB(10, 800, ET.muted, 0.8)}">LOGIN SCOPE PREVIEW</div>
      <div class="esurf" style="border-radius:18px;padding:13px 14px">
        <div style="${TB(11.5, 600, ET.muted)}margin-bottom:8px">Switch role to preview user-scoped data across EOP, Child Reports &amp; NTB</div>
        <select class="drawer-role" data-a="homerole">${LOGIN_ROLES.map(x => `<option value="${esc(x.id)}" ${x.id === r.id ? 'selected' : ''}>${esc(x.label)} — ${esc(x.person)}</option>`).join('')}</select>
      </div>`;

    const sel = el.querySelector('[data-a=homerole]');
    if (sel) sel.onchange = () => {
      Store.loginRole = LOGIN_ROLES.find(x => x.id === sel.value) || LOGIN_ROLES[0];
      render();
      Snack.success(`Switched to ${Store.loginRole.label} (${Store.loginRole.person})`);
    };
  };

  el.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) Nav.go(g.dataset.go);
  });
  setTimeout(() => { if (alive && Store.session && !Store.user) Store.user = { ...DEMO_USER }; }, 150);
  el.querySelector('[data-a=menu]').onclick = () => openDrawer('/home');
  render();
  return { el, light: true, bg: ET.background, onShow: render, destroy() { alive = false; } };
};
