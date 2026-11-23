/* =====================================================================
   Screens — auth / home / profile / settings / base url
   ===================================================================== */

/* ---------------- SplashScreen ---------------- */
Routes['/'] = () => {
  const el = h(`<div style="background:#fff">
    <div class="blob" style="top:-120px;left:-80px;width:350px;height:350px;background:${rgba(C.primary, .06)}"></div>
    <div class="blob" style="bottom:-120px;right:-80px;width:350px;height:350px;background:${rgba(C.secondary, .06)}"></div>
    <div class="fade-in" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      ${gradientIconBox(96, 28, ['account_balance', 'o'], 48, `0 12px 30px ${rgba(C.primary, .3)}`)}
      <div style="height:28px"></div>
      <div class="t" style="font-size:36px;font-weight:900;letter-spacing:1px;background:linear-gradient(90deg,${C.primary},${C.primaryLight});-webkit-background-clip:text;background-clip:text;color:transparent">HMB 360</div>
      <div style="height:8px"></div>
      <div class="t" style="font-size:13px;color:${C.onSurfaceVariant};letter-spacing:.5px">HabibMetro Bank</div>
    </div>
    <div class="fade-in" style="position:absolute;left:0;right:0;bottom:60px;display:flex;flex-direction:column;align-items:center">
      ${spinner(24, 2.5, C.primary)}
      <div style="height:12px"></div>
      <div class="t" style="font-size:11px;color:${C.onSurfaceVariant}">HabibMetro Bank — Secure Instance</div>
    </div></div>`);
  const t = setTimeout(() => Nav.go(Store.session ? '/home' : '/login'), 900);
  return { el, destroy() { clearTimeout(t); } };
};

/* ---------------- LoginScreen ---------------- */
Routes['/login'] = () => {
  const el = h(`<div style="background:#fff">
    <div class="blob" style="top:-100px;right:-100px;width:300px;height:300px;background:${rgba(C.primary, .05)}"></div>
    <div class="blob" style="bottom:-100px;left:-100px;width:300px;height:300px;background:${rgba(C.secondary, .05)}"></div>
    <div class="safe" style="position:absolute;inset:0;display:flex;flex-direction:column">
     <div class="center-scroll"><div class="inner" style="padding:16px 24px;display:flex;flex-direction:column;align-items:center">
      ${gradientIconBox(80, 20, ['account_balance', 'o'], 40, `0 10px 20px ${rgba(C.primary, .2)}`)}
      <div style="height:16px"></div>
      <div class="t" style="font-size:32px;font-weight:900;color:${C.onSurface}">HMB 360</div>
      <div style="height:4px"></div>
      <div class="t" style="font-size:13px;color:${C.onSurfaceVariant}">HabibMetro Bank</div>
      <div style="height:40px"></div>
      <div style="width:100%;padding:28px;background:#fff;border-radius:24px;border:1px solid ${rgba(C.outlineVariant, .3)};box-shadow:0 8px 40px rgba(0,0,0,.04)">
        <div class="t" style="font-size:20px;font-weight:700;color:${C.onSurface}">Sign In</div>
        <div style="height:24px"></div>
        <div data-slot="user"></div>
        <div style="height:20px"></div>
        <div class="row between">
          <span class="t" style="font-size:14px;font-weight:600;color:${C.onSurfaceVariant}">Password</span>
          <button class="text-btn" data-a="forgot" style="font-size:13px;font-weight:700">Forgot Password?</button>
        </div>
        <div style="height:4px"></div>
        <div data-slot="pass"></div>
        <div style="height:28px"></div>
        <div data-slot="btn"></div>
      </div>
      <div style="height:24px"></div>
      <div class="row" style="width:100%;height:16px">
        <div style="flex:1;height:1px;background:${rgba(C.outlineVariant, .5)}"></div>
        <span class="t" style="padding:0 16px;font-size:13px;font-weight:600;color:${C.onSurfaceVariant};letter-spacing:1.5px">OR</span>
        <div style="flex:1;height:1px;background:${rgba(C.outlineVariant, .5)}"></div>
      </div>
      <div style="height:20px"></div>
      <div data-a="fp" style="display:flex;flex-direction:column;align-items:center;cursor:pointer" data-slot="fp"></div>
      <div style="height:32px"></div>
      <div class="row" style="justify-content:center">
        <div style="width:8px;height:8px;border-radius:50%;background:${C.green}"></div>
        <div style="width:8px"></div>
        <span class="t" style="color:${C.onSurfaceVariant};font-size:11px">HabibMetro Bank — Secure Instance</span>
      </div>
      ${CONFIG.isTesting ? `<div style="height:16px"></div>
        <div class="t" data-slot="url" style="font-size:10px;color:${C.onSurfaceVariant};text-align:center"></div>
        <button class="text-btn" data-a="url" style="font-size:12px;font-weight:400">Change URL</button>` : ''}
     </div></div></div></div>`);

  const user = TextField({ label: 'Username', hint: 'Enter your username', prefix: ['person_outline', 'f'], validator: v => (!v.trim() ? 'Please enter username' : null) });
  const pass = TextField({ hint: 'Enter your password', prefix: ['lock_outline', 'f'], obscure: true, toggle: ['visibility', 'visibility_off'], toggleSize: 20, validator: v => (!v ? 'Please enter password' : null), onEnter: () => login() });
  const btn = GradButton('Sign In', ['arrow_forward', 'f'], () => login());
  el.querySelector('[data-slot=user]').appendChild(user.el);
  el.querySelector('[data-slot=pass]').appendChild(pass.el);
  el.querySelector('[data-slot=btn]').appendChild(btn.el);

  const renderFp = () => {
    const en = Store.biometricEnabled;
    el.querySelector('[data-slot=fp]').innerHTML = `
      <div style="width:80px;height:80px;border-radius:50%;border:2px solid ${en ? C.primary : C.outlineVariant};background:${en ? rgba(C.primary, .05) : C.surface};display:flex;align-items:center;justify-content:center">${I('fingerprint', 'r', 40, en ? C.primary : C.onSurfaceVariant)}</div>
      <div style="height:12px"></div>
      <span class="t" style="font-size:13px;font-weight:500;color:${en ? C.primary : C.onSurfaceVariant}">${en ? 'Tap to sign in with fingerprint' : 'Fingerprint login not enabled'}</span>`;
  };
  const renderUrl = () => { const u = el.querySelector('[data-slot=url]'); if (u) u.textContent = `URL: ${Store.savedUrl || CONFIG.apiUrl}`; };
  renderFp(); renderUrl();

  let alive = true;
  async function login() {
    const ok = [user.validate(), pass.validate()].every(Boolean);
    if (!ok || btn.loading) return;
    btn.setLoading(true);
    await sleep(900);
    if (!alive) return;
    btn.setLoading(false);
    Store.pendingLoginId = user.value.trim();
    Nav.go('/otp');
  }
  el.querySelector('[data-a=forgot]').onclick = async () => {
    btn.setLoading(true);           // checkResetPasswordFunctionality sets isLoading
    await sleep(600);
    if (!alive) return;
    btn.setLoading(false);
    Nav.push('/forgot-password');
  };
  el.querySelector('[data-a=fp]').onclick = async () => {
    if (!Store.biometricEnabled) { Snack.error('Fingerprint login not enabled. Enable it in Settings.'); return; }
    const ok = await biometricPrompt('Sign in with your fingerprint');
    if (!alive) return;
    if (!ok) { Snack.error('Fingerprint authentication failed'); return; }
    btn.setLoading(true); await sleep(700); if (!alive) return; btn.setLoading(false);
    Store.session = true; Nav.go('/home');
  };
  const urlBtn = el.querySelector('[data-a=url]');
  if (urlBtn) urlBtn.onclick = () => Nav.push('/select-base-url').then(() => renderUrl());
  return { el, destroy() { alive = false; } };
};

/* ---------------- OtpScreen ---------------- */
Routes['/otp'] = (extra) => {
  const isForget = !!extra.isForgetPassword, isChange = !!extra.isChangePassword;
  const LEN = 4, DEF = 60;
  let secs = DEF, expired = false, timer = null, alive = true, loading = false;
  const el = h(`<div style="background:#fff">
    <div class="blob" style="top:-80px;right:-80px;width:250px;height:250px;background:${rgba(C.primary, .06)}"></div>
    <div class="blob" style="bottom:-80px;left:-80px;width:250px;height:250px;background:${rgba(C.secondary, .06)}"></div>
    <div class="safe" style="position:absolute;inset:0;display:flex;flex-direction:column">
     <div class="center-scroll"><div class="inner" style="padding:16px 24px;display:flex;flex-direction:column;align-items:center">
      <div class="pulse">${gradientIconBox(80, 20, ['lock_clock', 'o'], 40, `0 10px 24px ${rgba(C.primary, .25)}`)}</div>
      <div style="height:28px"></div>
      <div class="t" style="font-size:28px;font-weight:700;color:${C.onSurface}">Verification</div>
      <div style="height:8px"></div>
      <div class="t" style="font-size:14px;color:${C.onSurfaceVariant};text-align:center">Enter the OTP sent to ${esc(Store.pendingLoginId || '')}</div>
      <div style="height:40px"></div>
      <div style="width:100%;padding:32px;background:#fff;border-radius:24px;border:1px solid ${rgba(C.outlineVariant, .3)};box-shadow:0 8px 40px rgba(0,0,0,.03);display:flex;flex-direction:column;align-items:center">
        <div class="row" data-slot="timer" style="justify-content:center"></div>
        <div style="height:32px"></div>
        <div class="row" data-slot="boxes" style="width:100%;justify-content:space-evenly"></div>
        <div style="height:36px"></div>
        <div data-slot="btn" style="width:100%"></div>
      </div>
      <div style="height:32px"></div>
      <button class="text-btn" data-a="back" style="color:${C.onSurfaceVariant};font-size:14px;font-weight:400">${I('arrow_back', 'f', 16, C.onSurfaceVariant)}<span>${isChange ? 'Back to Change Password' : isForget ? 'Back to Reset Password' : 'Back to Login'}</span></button>
     </div></div></div></div>`);

  const boxesHost = el.querySelector('[data-slot=boxes]');
  const inputs = [];
  for (let i = 0; i < LEN; i++) {
    const b = h(`<div class="otp-box"><input inputmode="numeric" maxlength="1" autocomplete="one-time-code"></div>`);
    const inp = b.querySelector('input');
    inp.addEventListener('focus', () => { b.classList.add('focus'); setTimeout(() => inp.setSelectionRange(inp.value.length, inp.value.length)); });
    inp.addEventListener('blur', () => b.classList.remove('focus'));
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(-1);
      if (inp.value && i < LEN - 1) inputs[i + 1].focus();
      else if (!inp.value && i > 0) inputs[i - 1].focus();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && i > 0) { e.preventDefault(); inputs[i - 1].focus(); } if (e.key === 'Enter') verify(); });
    inp.addEventListener('paste', e => {
      const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, LEN);
      if (!d) return; e.preventDefault();
      d.split('').forEach((c, k) => { if (inputs[k]) inputs[k].value = c; });
      inputs[Math.min(d.length, LEN - 1)].focus();
    });
    inputs.push(inp); boxesHost.appendChild(b);
  }
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const renderTimer = () => {
    const col = secs <= 10 ? C.error : C.primary;
    el.querySelector('[data-slot=timer]').innerHTML = `${I('timer', 'o', 18, col)}<span style="width:6px"></span><span class="t" style="color:${col};font-size:22px;font-weight:700;transition:color .3s">${fmt(secs)}</span>`;
  };
  let btn = null;
  const renderBtn = () => {
    const host = el.querySelector('[data-slot=btn]'); host.innerHTML = '';
    if (!expired) btn = GradButton('Verify OTP', ['verified', 'o'], () => verify());
    else if (isForget) btn = GradButton('Resend OTP', ['refresh', 'f'], () => resend());
    else { btn = null; return; }
    btn.setLoading(loading);
    host.appendChild(btn.el);
  };
  const start = () => {
    timer = setInterval(() => {
      if (!alive) { clearInterval(timer); return; }
      if (secs > 0) secs--; else { expired = true; clearInterval(timer); showExpired(); renderBtn(); }
      renderTimer();
    }, 1000);
  };
  async function showExpired() {
    if (isForget) return;
    await showInfoDialog('OTP Expired', 'Your OTP has expired. Please login again.', false);
    if (!alive) return;
    Nav.go(isChange ? '/change-password' : '/login');
  }
  async function resend() {
    loading = true; renderBtn(); await sleep(800); if (!alive) return; loading = false;
    secs = DEF; expired = false; inputs.forEach(i => (i.value = '')); renderBtn(); renderTimer(); start();
    Snack.success('OTP sent successfully');
  }
  async function verify() {
    const code = inputs.map(i => i.value).join('');
    if (code.length < LEN) { Snack.warning(`Please enter all ${LEN} digits`); return; }
    if (loading) return;
    loading = true; btn && btn.setLoading(true);
    await sleep(900); if (!alive) return;
    loading = false; btn && btn.setLoading(false);
    if (isChange) {
      Store.session = false; Store.user = null;
      Nav.go('/login'); Snack.success('Password changed successfully. Please login again.');
      return;
    }
    if (isForget) Nav.push('/new-password');
    else { Store.session = true; Nav.go('/home'); }
  }
  el.querySelector('[data-a=back]').onclick = () => Nav.go(isChange ? '/change-password' : isForget ? '/forgot-password' : '/login');
  renderTimer(); renderBtn(); start();
  return { el, destroy() { alive = false; clearInterval(timer); } };
};

/* ---------------- ForgotPasswordScreen ---------------- */
Routes['/forgot-password'] = () => {
  const el = h(`<div style="background:#fff">${appBar('Reset Password', { back: true })}
    <div style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden">
      <div class="blob" style="top:-100px;right:-100px;width:300px;height:300px;background:${rgba(C.primary, .06)}"></div>
      <div class="center-scroll"><div class="inner" style="padding:16px 24px">
        ${gradientIconBox(72, 20, ['lock_reset', 'o'], 36, `0 8px 20px ${rgba(C.primary, .25)}`)}
        <div style="height:24px"></div>
        <div class="t" style="font-size:28px;font-weight:700;color:${C.onSurface}">Reset Password</div>
        <div style="height:8px"></div>
        <div class="t" style="font-size:14px;color:${C.onSurfaceVariant}">Enter your Login ID and we'll send you a reset code.</div>
        <div style="height:32px"></div>
        <div data-slot="id"></div>
        <div style="height:12px"></div>
        <div data-slot="err"></div>
        <div style="height:24px"></div>
        <div data-slot="btn"></div>
      </div></div></div></div>`);
  let alive = true;
  const id = TextField({ label: 'Login ID', hint: 'Enter your login ID', prefix: ['person_outline', 'r'], validator: v => (!v.trim() ? 'Login ID is required' : null), onEnter: () => submit() });
  const btn = GradButton('Send Reset Code', ['send', 'o'], () => submit());
  el.querySelector('[data-slot=id]').appendChild(id.el);
  el.querySelector('[data-slot=btn]').appendChild(btn.el);
  async function submit() {
    if (!id.validate() || btn.loading) return;
    el.querySelector('[data-slot=err]').innerHTML = '';
    btn.setLoading(true); await sleep(900); if (!alive) return; btn.setLoading(false);
    Store.pendingLoginId = id.value.trim();
    Nav.push('/otp', { isForgetPassword: true });
  }
  el.querySelector('[data-a=back]').onclick = () => Nav.pop();
  return { el, light: true, destroy() { alive = false; } };
};

/* ---------------- NewPasswordScreen ---------------- */
Routes['/new-password'] = () => {
  const el = h(`<div style="background:#fff">${appBar('New Password', { back: true })}
    <div style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden">
      <div class="blob" style="bottom:-100px;left:-100px;width:300px;height:300px;background:${rgba(C.secondary, .06)}"></div>
      <div class="center-scroll"><div class="inner" style="padding:16px 24px">
        ${gradientIconBox(72, 20, ['key', 'o'], 36, `0 8px 20px ${rgba(C.primary, .25)}`)}
        <div style="height:24px"></div>
        <div class="t" style="font-size:28px;font-weight:700;color:${C.onSurface}">New Password</div>
        <div style="height:8px"></div>
        <div class="t" style="font-size:14px;color:${C.onSurfaceVariant}">Enter and confirm your new password.</div>
        <div style="height:32px"></div>
        <div data-slot="p1"></div>
        <div style="height:16px"></div>
        <div data-slot="p2"></div>
        <div style="height:12px"></div>
        <div data-slot="err"></div>
        <div style="height:24px"></div>
        <div data-slot="btn"></div>
      </div></div></div></div>`);
  let alive = true;
  const p1 = TextField({ label: 'New Password', hint: '••••••••', prefix: ['lock_outline', 'r'], obscure: true, toggle: ['visibility_off', 'visibility'], validator: v => (!v ? 'New password is required' : null) });
  const p2 = TextField({ label: 'Confirm New Password', hint: '••••••••', prefix: ['lock_outline', 'r'], obscure: true, toggle: ['visibility_off', 'visibility'], validator: v => (!v ? 'Please confirm your password' : v !== p1.value ? 'Passwords do not match' : null), onEnter: () => submit() });
  const btn = GradButton('Reset Password', ['check_circle_outline', 'r'], () => submit());
  el.querySelector('[data-slot=p1]').appendChild(p1.el);
  el.querySelector('[data-slot=p2]').appendChild(p2.el);
  el.querySelector('[data-slot=btn]').appendChild(btn.el);
  async function submit() {
    if (![p1.validate(), p2.validate()].every(Boolean) || btn.loading) return;
    if (!validComplexity(p1.value)) { showInfoDialog('Password Requirements', PWD_RULES); return; }
    el.querySelector('[data-slot=err]').innerHTML = '';
    btn.setLoading(true); await sleep(900); if (!alive) return; btn.setLoading(false);
    Nav.go('/login'); Snack.success('Password reset successfully. Please login.');
  }
  el.querySelector('[data-a=back]').onclick = () => Nav.pop();
  return { el, light: true, destroy() { alive = false; } };
};

/* ---------------- ChangePasswordScreen ---------------- */
Routes['/change-password'] = () => {
  const el = h(`<div style="background:#fff">${appBar('Change Password', { back: true })}
    <div class="scroll" style="flex:1;padding:24px">
      <div data-slot="err"></div>
      <div data-slot="p0"></div><div style="height:16px"></div>
      <div data-slot="p1"></div><div style="height:16px"></div>
      <div data-slot="p2"></div><div style="height:32px"></div>
      <div data-slot="btn"></div>
    </div></div>`);
  let alive = true;
  const eye = ['visibility_off', 'visibility'];
  const p0 = TextField({ label: 'Old Password', hint: '••••••••', prefix: ['lock_outline', 'r'], obscure: true, toggle: eye, validator: v => (!v ? 'Old password is required' : null) });
  const p1 = TextField({ label: 'New Password', hint: '••••••••', prefix: ['lock_outline', 'r'], obscure: true, toggle: eye, validator: v => (!v ? 'New password is required' : null) });
  const p2 = TextField({ label: 'Confirm New Password', hint: '••••••••', prefix: ['lock_outline', 'r'], obscure: true, toggle: eye, validator: v => (!v ? 'Please confirm your password' : v !== p1.value ? 'Passwords do not match' : null), onEnter: () => submit() });
  const btn = GradButton('Change Password', ['check_circle_outline', 'r'], () => submit());
  el.querySelector('[data-slot=p0]').appendChild(p0.el);
  el.querySelector('[data-slot=p1]').appendChild(p1.el);
  el.querySelector('[data-slot=p2]').appendChild(p2.el);
  el.querySelector('[data-slot=btn]').appendChild(btn.el);
  async function submit() {
    if (![p0.validate(), p1.validate(), p2.validate()].every(Boolean) || btn.loading) return;
    if (!validComplexity(p1.value)) { showInfoDialog('Password Requirements', PWD_RULES); return; }
    el.querySelector('[data-slot=err]').innerHTML = '';
    Store.pendingChange = { oldPassword: p0.value, newPassword: p1.value };
    btn.setLoading(true); await sleep(900); if (!alive) return; btn.setLoading(false);
    Nav.push('/otp', { isChangePassword: true });
  }
  el.querySelector('[data-a=back]').onclick = () => Nav.pop();
  return { el, light: true, destroy() { alive = false; } };
};

/* ---------------- AppDrawer (reads dynamically from REPORT_REGISTRY) ---------------- */
function openDrawer(currentRoute) {
  const u = Store.user;
  const name = u ? fullName(u) : 'User';
  const desig = (u && u.designationName) || 'HabibMetro Bank';
  const img = u && u.profileImg;
  const ini = initialsOf(name, 'U');
  const item = (icon, title, act, { selected = false, color = null } = {}) => {
    const active = color || C.primary;
    const ic = selected ? active : C.onSurfaceVariant;
    const tc = selected ? active : (color || C.onSurface);
    return `<div class="drawer-item" data-a="${act}" style="${selected ? `background:${rgba(active, .08)}` : ''}">
      ${I(icon[0], icon[1], 22, ic)}<span class="t" style="font-size:14px;font-weight:${selected ? 600 : 400};color:${tc}">${esc(title)}</span></div>`;
  };
  const label = t => `<div class="t" style="padding:16px 0 4px 20px;font-size:11px;font-weight:700;color:${C.onSurfaceVariant};letter-spacing:1.2px">${t}</div>`;
  const el = h(`<div class="drawer"><div class="safe" style="display:flex;flex-direction:column;height:100%">
    <div class="row" style="padding:20px">
      <div data-a="profile" style="width:48px;height:48px;border-radius:50%;background:${rgba(C.primary, .15)};border:1px solid ${rgba(C.primary, .3)};display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;flex:none">
        ${img ? `<img src="${img}" style="width:48px;height:48px;object-fit:cover">` : `<span class="t" style="font-size:18px;font-weight:700;color:${C.primary}">${esc(ini)}</span>`}
      </div>
      <div style="width:14px"></div>
      <div class="grow" data-a="profile" style="cursor:pointer">
        <div class="t el1" style="font-weight:700;font-size:15px;color:${C.onSurface}">${esc(name)}</div>
        <div style="height:2px"></div>
        <div class="t el1" style="font-size:12px;color:${C.onSurfaceVariant}">${esc(desig || 'HabibMetro Bank')}</div>
      </div>
    </div>
    <div style="height:1px;background:${C.sc}"></div>
    <div class="scroll" style="flex:1;padding:8px 0">
      ${item(['home', 'o'], 'Home', 'home', { selected: currentRoute === '/home' })}
      ${label('REPORTS')}
      ${REPORT_REGISTRY.map(rep => item(rep.icon, rep.drawerLabel, 'rep:' + rep.route, { selected: currentRoute === rep.route })).join('')}
      ${label('ACCOUNT')}
      ${item(['person_outline', 'f'], 'My Profile', 'myprofile')}
      ${item(['settings', 'o'], 'Settings', 'settings')}
      ${item(['lock_outline', 'f'], 'Change Password', 'changepw')}
      ${item(['logout', 'o'], 'Logout', 'logout', { color: C.error })}
      ${label('LOGIN SCOPE')}
      <div style="padding:6px 20px 14px">
        <select class="drawer-role" data-a="drole">${LOGIN_ROLES.map(x => `<option value="${esc(x.id)}" ${x.id === currentRole().id ? 'selected' : ''}>${esc(x.label)} — ${esc(x.person)}</option>`).join('')}</select>
      </div>
    </div></div></div>`);
  const d = Overlay.open({ el });
  const drole = el.querySelector('[data-a=drole]');
  if (drole) drole.onchange = () => {
    const r = LOGIN_ROLES.find(x => x.id === drole.value) || LOGIN_ROLES[0];
    Store.loginRole = r;
    d.close();
    const top = Nav.top();
    if (top && (top.route === '/home' || REPORT_REGISTRY.some(x => x.route === top.route))) Nav.go(top.route);
    Snack.success(`Switched to ${r.label} (${r.person})`);
  };
  el.addEventListener('click', async e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act === 'profile') { d.close(); Nav.push('/profile'); }
    if (act === 'home') { d.close(); Nav.go('/home'); }
    if (act.startsWith('rep:')) { d.close(); Nav.go(act.slice(4)); }
    if (act === 'myprofile') { d.close(); Nav.push('/profile'); }
    if (act === 'settings') { d.close(); Nav.push('/settings'); }
    if (act === 'changepw') { d.close(); Nav.push('/change-password'); }
    if (act === 'logout') {
      const ok = await showConfirmDialog('Logout', 'Are you sure you want to logout of your session?', 'Logout', true);
      if (ok === true) { await sleep(300); Store.session = false; Store.user = null; Overlay.closeAll(); Nav.go('/login'); }
    }
  });
  return d;
}

/* ---------------- ProfileScreen ---------------- */
Routes['/profile'] = () => {
  const el = h(`<div style="background:#fff">${appBar('My Profile', { back: true })}<div class="scroll" style="flex:1;padding:16px" data-slot="body"></div></div>`);
  let uploading = false;
  const st = () => {
    const u = Store.user;
    if (!u) return { fullName: '', designation: '', email: '', phone: '', branch: '', area: '', region: '', img: '' };
    return { fullName: fullName(u), designation: u.designationName || '', email: u.emailAddress || '', phone: u.phoneNumber || '', branch: u.branchName || '', area: u.areaName || '', region: u.regionName || '', img: u.profileImg || '' };
  };
  const row = (l, v) => `<div class="row" style="align-items:flex-start;padding-bottom:12px">
      <div class="t" style="flex:2;font-size:14px;color:${C.onSurfaceVariant}">${esc(l)}</div>
      <div class="t" style="flex:3;font-size:14px;font-weight:600;color:${C.onSurface};word-break:break-word">${esc(v || 'N/A')}</div></div>`;
  const card = (title, rows) => `<div style="width:100%;padding:16px;background:${C.surface};border-radius:12px;box-shadow:0 4px 10px ${rgba(C.onSurface, .05)}">
      <div class="t" style="font-size:16px;font-weight:700;color:${C.primary}">${esc(title)}</div><div style="height:16px"></div>${rows}</div>`;
  const render = () => {
    const s = st();
    const ini = s.fullName ? initialsOf(s.fullName, '') : '';
    el.querySelector('[data-slot=body]').innerHTML = `
      <div style="height:24px"></div>
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="position:relative;width:120px;height:120px">
          <div data-a="avatar" style="width:120px;height:120px;border-radius:50%;background:${rgba(C.primary, .15)};border:2px solid ${C.primary};display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer">
            ${uploading ? spinner(36, 4, C.primary) : s.img ? `<img src="${s.img}" style="width:120px;height:120px;object-fit:cover">` : `<span class="t" style="font-size:40px;font-weight:700;color:${C.primary}">${esc(ini)}</span>`}
          </div>
          <div style="position:absolute;right:0;bottom:0;padding:8px;background:${C.primary};border-radius:50%;display:flex;pointer-events:none">${I('camera_alt', 'f', 20, '#fff')}</div>
        </div>
        <div style="height:16px"></div>
        <div class="t" style="font-size:20px;font-weight:700;color:${C.onSurface};min-height:23px">${esc(s.fullName)}</div>
        <div style="height:4px"></div>
        <div class="t" style="font-size:14px;color:${C.onSurfaceVariant};min-height:16px">${esc(s.designation)}</div>
      </div>
      <div style="height:32px"></div>
      ${card('Personal Information', row('Full Name', s.fullName) + row('Designation', s.designation))}
      <div style="height:16px"></div>
      ${card('Contact Information', row('Email Address', s.email) + row('Phone Number', s.phone))}
      <div style="height:16px"></div>
      ${card('Location Information', row('Branch', s.branch) + row('Area', s.area) + row('Region', s.region))}`;
  };
  async function upload(dataUrl) {
    uploading = true; render();
    await sleep(900);
    uploading = false;
    if (Store.user) Store.user.profileImg = dataUrl || '';
    render();
    Snack.plain(dataUrl ? 'Profile picture updated' : 'Profile picture removed');
  }
  function pick(capture) {
    const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*'; if (capture) f.capture = 'environment';
    f.onchange = () => { const file = f.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => upload(r.result); r.readAsDataURL(file); };
    f.click();
  }
  function openPhotoSheet() {
    const has = !!st().img;
    const opt = (icon, label, color, act) => `<div data-a="${act}" style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
        <div style="padding:16px;background:${rgba(color, .1)};border-radius:50%;display:flex">${I(icon, 'f', 28, color)}</div>
        <div style="height:8px"></div><span class="t" style="font-size:14px;font-weight:500;color:${color}">${label}</span></div>`;
    const content = h(`<div style="padding:24px;background:${C.surface};border-radius:20px 20px 0 0">
        <div class="t" style="font-size:18px;font-weight:700;text-align:center">Profile Photo</div>
        <div style="height:24px"></div>
        <div class="row" style="justify-content:space-evenly">
          ${opt('camera_alt', 'Camera', C.primary, 'cam')}${opt('photo_library', 'Gallery', C.primary, 'gal')}${has ? opt('delete_outline', 'Remove', C.error, 'rem') : ''}
        </div></div>`);
    const s = openSheet(content, { bg: 'transparent', radius: 0 });
    s.el.style.boxShadow = 'none';
    content.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      s.close();
      if (a.dataset.a === 'cam') pick(true);
      if (a.dataset.a === 'gal') pick(false);
      if (a.dataset.a === 'rem') upload('');
    });
  }
  render();
  el.addEventListener('click', e => { if (e.target.closest('[data-a=avatar]')) openPhotoSheet(); });
  const back = () => Nav.pop(); // ref.invalidate(profileViewModelProvider) + popRoute
  el.querySelector('[data-a=back]').onclick = back;
  return { el, light: true, onBack: back, openPhotoSheet };
};

/* ---------------- SettingsScreen ---------------- */
Routes['/settings'] = () => {
  const el = h(`<div style="background:#fff">${appBar('Settings', { back: true })}<div class="scroll" style="flex:1;position:relative" data-slot="body"></div></div>`);
  let loading = true, toggling = false, alive = true;
  const render = () => {
    const body = el.querySelector('[data-slot=body]');
    if (loading) { body.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${spinner(36, 4, C.primary)}</div>`; return; }
    const en = Store.biometricEnabled, av = Store.biometricAvailable;
    body.innerHTML = `<div style="padding:20px">
      <div class="t" style="font-size:11px;font-weight:700;color:${C.onSurfaceVariant};letter-spacing:1.5px">SECURITY</div>
      <div style="height:12px"></div>
      <div style="background:#fff;border-radius:16px;border:1px solid ${rgba(C.outlineVariant, .15)};box-shadow:0 4px 10px rgba(0,0,0,.03)">
        <div class="row" style="padding:16px 18px">
          <div style="width:42px;height:42px;border-radius:12px;background:${rgba(C.primary, .1)};display:flex;align-items:center;justify-content:center;flex:none">${I('fingerprint', 'r', 24, C.primary)}</div>
          <div style="width:16px"></div>
          <div class="grow">
            <div class="t" style="font-weight:600;font-size:15px;color:${C.onSurface}">Fingerprint Login</div>
            <div style="height:3px"></div>
            <div class="t" style="font-size:12px;color:${C.onSurfaceVariant}">${en ? 'Enabled — tap to disable' : 'Use fingerprint to sign in quickly'}</div>
          </div>
          ${toggling ? `<div style="width:24px;height:24px">${spinner(24, 2, C.primary)}</div>` : `<div class="m3switch ${en ? 'on' : ''} ${av ? '' : 'dis'}" data-a="sw"><div class="th"></div></div>`}
        </div>
      </div>
      ${!av ? `<div style="height:12px"></div><div class="row" style="padding:14px;background:${rgba(C.error, .08)};border-radius:12px">${I('info_outline', 'f', 16, C.error)}<div style="width:10px"></div><div class="t grow" style="font-size:12px;color:${C.error}">Biometric authentication is not available on this device or no fingerprint is enrolled.</div></div>` : ''}
    </div>`;
  };
  async function toggle(value) {
    if (toggling) return;
    toggling = true; render();
    if (value) {
      const ok = await biometricPrompt('Scan your fingerprint to enable biometric login');
      if (!alive) return;
      if (!ok) Snack.error('Fingerprint authentication cancelled');
      else { await sleep(600); Store.biometricEnabled = true; Snack.success('Fingerprint login enabled successfully'); }
    } else { Store.biometricEnabled = false; Snack.success('Fingerprint login disabled'); }
    toggling = false; if (alive) render();
  }
  el.addEventListener('click', e => { if (e.target.closest('[data-a=sw]') && Store.biometricAvailable) toggle(!Store.biometricEnabled); });
  el.querySelector('[data-a=back]').onclick = () => Nav.pop();
  render();
  setTimeout(() => { if (!alive) return; loading = false; render(); }, 350);
  return { el, light: true, destroy() { alive = false; } };
};

/* ---------------- SelectBaseUrlScreen ---------------- */
Routes['/select-base-url'] = () => {
  const el = h(`<div style="background:#fff">${appBar('Select Server Instance', { back: true })}<div class="scroll" style="flex:1;padding:16px" data-slot="body"></div></div>`);
  const predefined = CONFIG.apiUrlList.slice();
  const st = { savedUrl: Store.savedUrl, selectedUrl: Store.savedUrl || predefined[0] || '', errorMessage: null, isSaving: false };
  let customText = predefined.includes(st.selectedUrl) ? '' : st.selectedUrl;
  const render = () => {
    const isPre = predefined.includes(st.selectedUrl);
    const body = el.querySelector('[data-slot=body]');
    body.innerHTML = `
      ${st.savedUrl ? `<div style="padding:16px;background:${C.sc};border-radius:8px">
          <div class="t" style="font-size:12px;font-weight:700;color:#9E9E9E">CURRENTLY ACTIVE SERVER</div>
          <div style="height:8px"></div>
          <div class="t" style="font-size:16px;font-weight:600;color:${C.onSurface};word-break:break-all">${esc(st.savedUrl)}</div></div>` : ''}
      <div style="height:24px"></div>
      <div class="oi" data-a="dd" style="cursor:pointer;padding:4px 12px">
        <span class="lbl">Predefined Servers</span>
        <span class="t grow el1" style="font-size:16px;color:${C.onSurface}">${isPre ? esc(st.selectedUrl) : ''}</span>
        ${I('arrow_drop_down', 'f', 24, C.onSurfaceVariant)}
      </div>
      <div style="height:16px"></div>
      ${!isPre ? `<div class="oi" data-slot="custom" style="padding:0 16px"><span class="lbl">Custom Server URL</span>
          <input data-a="custom" value="${esc(customText)}" placeholder="https://..." style="flex:1;border:0;outline:0;background:transparent;font:400 16px var(--fApp);color:${C.onSurface};height:54px"></div>` : ''}
      ${st.errorMessage ? `<div style="height:8px"></div><div class="t" style="color:#F44336;font-size:14px">${esc(st.errorMessage)}</div>` : ''}
      <div style="height:32px"></div>
      <button class="elev-btn" data-a="save">${st.isSaving ? spinner(36, 4, C.primary) : 'Save &amp; Apply'}</button>`;
    const ci = body.querySelector('[data-a=custom]');
    if (ci) {
      const box = body.querySelector('[data-slot=custom]');
      ci.addEventListener('focus', () => box.classList.add('focus'));
      ci.addEventListener('blur', () => box.classList.remove('focus'));
      ci.addEventListener('input', () => { customText = ci.value; st.selectedUrl = ci.value; });
    }
  };
  el.addEventListener('click', async e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'dd') {
      const v = await openMenu(a, [...predefined.map(u => ({ value: u, html: `<span class="t" style="font-size:16px;color:${C.onSurface}">${esc(u)}</span>` })), { value: 'custom', html: `<span class="t" style="font-size:16px;color:${C.onSurface}">Custom Server URL</span>` }], { width: a.offsetWidth, color: C.surface, overlap: true });
      if (v === undefined) return;
      if (v === 'custom') { st.selectedUrl = customText; } else { st.selectedUrl = v; customText = ''; }
      render();
    }
    if (a.dataset.a === 'save' && !st.isSaving) {
      const url = st.selectedUrl;
      let ok = false; try { const u = new URL(url); ok = !!u.protocol && !!u.host; } catch (_) { ok = false; }
      if (!url || !ok) { st.errorMessage = 'Invalid URL'; render(); return; }
      st.isSaving = true; st.errorMessage = null; render();
      await sleep(600);
      Store.savedUrl = url; st.isSaving = false; st.savedUrl = url;
      Snack.success('Base URL applied successfully');
      Nav.pop();
    }
  });
  const back = () => Nav.pop();
  el.querySelector('[data-a=back]').onclick = back;
  render();
  return { el, light: true, onBack: back };
};
