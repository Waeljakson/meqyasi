// واجهة المنصة (صفحة واحدة).
const cfg = window.APP_CONFIG;
const root = document.getElementById('app');
const S = { user: null, scale: null, idx: 0, answers: [], result: null, results: [], view: 'auth', authTab: 'login', msg: '' };

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ageOf = p => new Date().getFullYear() - Number(p.birthYear);
const fmtDate = d => new Date(d).toLocaleDateString('ar-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtScore = (r) => (Number.isInteger(r.total) ? r.total : r.total.toFixed(2)) + ' / ' + r.max;
const CHEERS = ['رائع! واصل 🌟', 'أنت بطل! 💪', 'ممتاز، اقتربنا 🚀', 'أحسنت! نجمة جديدة ⭐', 'شجاع جداً 🦁'];
const MASCOT = `<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 8l14 30 33 4-24 23 6 33-29-16-29 16 6-33L13 42l33-4z" fill="#ffc93c" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round"/><circle cx="48" cy="56" r="5" fill="#3b2f2f"/><circle cx="72" cy="56" r="5" fill="#3b2f2f"/><path d="M47 70q13 12 26 0" fill="none" stroke="#3b2f2f" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="66" r="4" fill="#ff9aa2"/><circle cx="80" cy="66" r="4" fill="#ff9aa2"/></svg>`;

function setTheme() {
  const p = S.user && S.user.profile;
  const st = p && p.birthYear ? stageOf(ageOf(p)) : 'adult';
  document.body.className = 'theme-' + st;
  return st;
}
function go(view) { S.view = view; S.msg = ''; render(); window.scrollTo(0, 0); }
function shell(inner, opts = {}) {
  const u = S.user;
  return `<header class="top no-print"><div class="brand"><span class="logo">🧠</span>${esc(cfg.appName)}</div>
    ${u && u.profile.birthYear ? `<nav><button data-act="home">الرئيسية</button><button data-act="history">سجلّي</button><button data-act="logout">خروج</button></nav>` : ''}</header>
    ${Store.live ? '' : '<div class="demo no-print">وضع تجريبي: البيانات تُحفظ على هذا الجهاز فقط حتى يُربط Appwrite.</div>'}
    <main class="${opts.cls || ''}">${inner}</main>
    <footer class="no-print">هذه المنصة أداة فرز أولي ولا تقدم تشخيصاً. التشخيص والعلاج من اختصاص الأخصائي النفسي أو الطبيب.</footer>`;
}

// ---------- الشاشات ----------
const V = {
  auth() {
    const su = S.authTab === 'signup';
    return shell(`<section class="card narrow"><h1>${su ? 'حساب جديد' : 'تسجيل الدخول'}</h1>
      <p class="muted">اختبر نفسك بمقاييس نفسية معتمدة، واحصل على نتيجتك وتقريرك فوراً.</p>
      <form data-form="auth">
        ${su ? '<label>الاسم<input name="name" required maxlength="60" autocomplete="name"></label>' : ''}
        <label>البريد الإلكتروني<input name="email" type="email" required autocomplete="email" dir="ltr"></label>
        <label>كلمة المرور<input name="password" type="password" required minlength="8" autocomplete="${su ? 'new-password' : 'current-password'}" dir="ltr"></label>
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}
        <button class="btn primary" type="submit">${su ? 'إنشاء الحساب' : 'دخول'}</button>
      </form>
      <button class="link" data-act="tab">${su ? 'لدي حساب بالفعل' : 'ليس لدي حساب — إنشاء حساب جديد'}</button></section>`);
  },
  profile() {
    const p = S.user.profile || {}; const y = new Date().getFullYear(); let years = '';
    for (let i = y - 5; i >= y - 95; i--) years += `<option value="${i}" ${Number(p.birthYear) === i ? 'selected' : ''}>${i}</option>`;
    return shell(`<section class="card narrow"><h1>بياناتك</h1>
      <p class="muted">نحتاج العمر والجنس فقط لاختيار المقاييس والواجهة المناسبة لك.</p>
      <form data-form="profile">
        <label>سنة الميلاد<select name="birthYear" required><option value="">اختر</option>${years}</select></label>
        <label>الجنس<select name="gender" required><option value="">اختر</option>
          <option value="m" ${p.gender === 'm' ? 'selected' : ''}>ذكر</option><option value="f" ${p.gender === 'f' ? 'selected' : ''}>أنثى</option></select></label>
        <label class="check"><input type="checkbox" name="consent" ${p.consent ? 'checked' : ''}> إذا كان عمري أقل من 18 سنة: ولي أمري يعلم باستخدامي للمنصة وموافق عليه.</label>
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}
        <button class="btn primary" type="submit">حفظ ومتابعة</button></form></section>`);
  },
  home() {
    const p = S.user.profile, age = ageOf(p), st = stageOf(age), list = scalesFor(age, p.gender);
    const hello = st === 'child' ? `${MASCOT}<h1>أهلاً ${esc(S.user.name)}! جاهز للمغامرة؟</h1>` : `<h1>أهلاً ${esc(S.user.name)}</h1>`;
    const cards = list.map(s => `<button class="scale" data-act="intro" data-id="${s.id}">
      <span class="ico">${s.icon}</span><b>${esc(s.name)}</b><small>${esc(s.measures)}</small>
      <span class="meta">${s.items.length} سؤالاً · ${s.minutes} د</span></button>`).join('');
    return shell(`<section class="hero">${hello}<p class="muted">${st === 'child' ? 'اختر لعبتك وأجب بصدق، لا توجد إجابة صحيحة أو خاطئة.' : 'اختر مقياساً وأجب بصدق؛ لا توجد إجابات صحيحة أو خاطئة.'}</p></section>
      ${list.length ? `<section class="grid">${cards}</section>` : '<p class="card">لا توجد مقاييس تقرير ذاتي مناسبة لهذا العمر. ننصح ولي الأمر باستشارة المرشد الطلابي أو أخصائي نفسي للأطفال.</p>'}
      <p class="center no-print"><button class="link" data-act="editProfile">تعديل بياناتي</button></p>`);
  },
  intro() {
    const s = S.scale;
    return shell(`<section class="card narrow center"><div class="bigico">${s.icon}</div><h1>${esc(s.name)}</h1>
      <p class="muted">${esc(s.formal)}</p><p>${esc(s.timeframe)}</p>
      <p class="meta">${s.items.length} سؤالاً · نحو ${s.minutes} دقائق</p>
      <button class="btn primary" data-act="start">ابدأ</button> <button class="btn" data-act="home">رجوع</button></section>`);
  },
  question() {
    const s = S.scale, i = S.idx, it = s.items[i], opts = it.opts || s.options, n = s.items.length;
    const child = document.body.classList.contains('theme-child');
    const pct = Math.round((i / n) * 100);
    const prog = child
      ? `<div class="stars" aria-label="التقدم">${Array.from({ length: 10 }, (_, k) => `<span class="${k < Math.floor((i / n) * 10) ? 'on' : ''}">★</span>`).join('')}</div>`
      : `<div class="bar"><i style="width:${pct}%"></i></div>`;
    const cheer = child && i > 0 && i % 8 === 0 ? `<p class="cheer">${CHEERS[(i / 8) % CHEERS.length]}</p>` : '';
    const btns = opts.map((o, k) => `<button class="opt ${S.answers[i] === k ? 'sel' : ''}" data-act="answer" data-k="${k}">${o.e ? `<span class="emo">${o.e}</span>` : ''}${esc(o.t)}</button>`).join('');
    return shell(`<section class="card qcard">${prog}<p class="meta">سؤال ${i + 1} من ${n}</p>${cheer}
      ${child ? MASCOT : ''}<p class="tf">${esc(s.timeframe)}</p><h2 class="qtext">${esc(it.t)}</h2>
      <div class="opts ${opts.length > 4 ? 'many' : ''}">${btns}</div>
      <div class="qnav"><button class="btn" data-act="back">${i === 0 ? 'إلغاء' : 'السابق'}</button></div></section>`);
  },
  result() {
    const r = S.result, s = SCALES.find(x => x.id === r.scaleId);
    if (document.body.classList.contains('theme-child') && !S.parentView) {
      return shell(`<section class="card narrow center party">${MASCOT}<h1>أحسنت! أنهيت المغامرة 🎉</h1>
        <p>شكراً لأنك أجبت بصدق. أنت شجاع!</p><p class="muted">اطلب الآن من والدك أو والدتك أو المرشد أن يشاهد النتيجة معك.</p>
        <button class="btn primary" data-act="parent">عرض النتيجة لولي الأمر</button> <button class="btn" data-act="home">الرئيسية</button></section>`);
    }
    return shell(reportBody(r, s) + `<p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> <button class="btn" data-act="home">الرئيسية</button></p>`, { cls: 'report' });
  },
  history() {
    const rows = S.results.map(r => `<li><div><b>${esc(r.scaleName)}</b><small>${fmtDate(r.date)} · ${fmtScore(r)} · ${esc(r.band)}</small></div>
      <span class="lvl l${r.level}"></span><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button><button class="btn sm ghost" data-act="del" data-id="${r.id}">حذف</button></li>`).join('');
    return shell(`<section class="card"><h1>سجلّي</h1>${rows ? `<ul class="hist">${rows}</ul>` : '<p class="muted">لم تُجرِ أي مقياس بعد.</p>'}</section>`);
  }
};

function reportBody(r, s) {
  const adv = ADVICE[r.level], plan = buildPlan(s, r);
  const pct = Math.max(3, Math.min(100, Math.round((r.total / r.max) * 100)));
  const subs = r.subs.length ? `<h3>الأبعاد الفرعية</h3><table><tr><th>البُعد</th><th>الدرجة</th><th>التصنيف</th></tr>
    ${r.subs.map(x => `<tr><td>${esc(x.name)}</td><td>${x.score}</td><td>${esc(x.label || '—')}</td></tr>`).join('')}</table>` : '';
  return `<section class="card rep">
    <h1>تقرير ${esc(s.name)}</h1><p class="muted">${esc(s.formal)}</p>
    <div class="who"><span>الاسم: <b>${esc(S.user.name)}</b></span><span>العمر: <b>${r.age}</b></span><span>الجنس: <b>${r.gender === 'f' ? 'أنثى' : 'ذكر'}</b></span><span>التاريخ: <b>${fmtDate(r.date)}</b></span></div>
    ${r.urgent ? `<div class="urgent"><b>تنبيه مهم</b><p>${esc(cfg.urgentHelp)}</p></div>` : ''}
    <div class="score"><div class="num">${fmtScore(r)}</div><div class="gauge ${s.positive ? 'pos' : ''}"><i style="width:${pct}%"></i></div><div class="band l${r.level}">${esc(r.band)}</div></div>
    <div class="advice ${adv.tone}"><b>${adv.title}</b><p>${adv.text}</p></div>
    ${subs}
    <h3>خطة الدعم المقترحة</h3><p><b>الهدف:</b> ${plan.goal}</p>
    <ol>${plan.steps.map(x => `<li>${x}</li>`).join('')}</ol>
    <h3>عادات يومية مساندة</h3><ul>${plan.habits.map(x => `<li>${x}</li>`).join('')}</ul>
    <p class="ref"><b>${plan.referral}</b></p>
    <p class="note">هذه خطة دعم ذاتي وإرشادي عامة وليست خطة علاج؛ الخطة العلاجية يضعها الأخصائي بعد المقابلة. النتيجة مؤشر فرز أولي وليست تشخيصاً. المصدر: ${esc(s.source)}</p></section>`;
}

function render() { setTheme(); root.innerHTML = V[S.view](); }

// ---------- الأحداث ----------
const errText = e => {
  const m = (e && e.message) || '';
  if (/Invalid credentials/i.test(m)) return 'البريد أو كلمة المرور غير صحيحة.';
  if (/already exists/i.test(m)) return 'يوجد حساب بهذا البريد بالفعل.';
  return 'تعذر إتمام العملية. حاول مرة أخرى.' + (m ? ' (' + m + ')' : '');
};
async function afterLogin(u) {
  S.user = u;
  if (!u.profile || !u.profile.birthYear) return go('profile');
  go('home');
}
root.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f).entries());
  try {
    if (f.dataset.form === 'auth') {
      const u = S.authTab === 'signup' ? await Store.signup(d.email, d.password, d.name) : await Store.login(d.email, d.password);
      await afterLogin(u);
    } else if (f.dataset.form === 'profile') {
      const age = new Date().getFullYear() - Number(d.birthYear);
      if (age < 18 && !d.consent) { S.msg = 'يلزم علم ولي الأمر وموافقته لمن هم دون 18 سنة.'; return render(); }
      S.user = await Store.saveProfile({ birthYear: Number(d.birthYear), gender: d.gender, consent: !!d.consent });
      go('home');
    }
  } catch (err) { S.msg = errText(err); render(); }
});
root.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  try {
    if (act === 'tab') { S.authTab = S.authTab === 'login' ? 'signup' : 'login'; go('auth'); }
    else if (act === 'home') { S.parentView = false; go('home'); }
    else if (act === 'editProfile') go('profile');
    else if (act === 'logout') { await Store.logout(); S.user = null; go('auth'); }
    else if (act === 'intro') { S.scale = SCALES.find(s => s.id === b.dataset.id); go('intro'); }
    else if (act === 'start') { S.idx = 0; S.answers = []; go('question'); }
    else if (act === 'back') { if (S.idx === 0) go('home'); else { S.idx--; render(); } }
    else if (act === 'answer') {
      S.answers[S.idx] = Number(b.dataset.k);
      if (S.idx < S.scale.items.length - 1) { S.idx++; render(); } else await finish();
    }
    else if (act === 'parent') { S.parentView = true; render(); }
    else if (act === 'print') { try { window.print(); } catch (x) { /* غير متاح في المعاينة */ } }
    else if (act === 'history') { S.results = await Store.listResults(); go('history'); }
    else if (act === 'open') { S.result = S.results.find(r => r.id === b.dataset.id); S.parentView = true; go('result'); }
    else if (act === 'del') { await Store.deleteResult(b.dataset.id); S.results = S.results.filter(r => r.id !== b.dataset.id); render(); }
  } catch (err) { S.msg = errText(err); render(); }
});
async function finish() {
  const p = S.user.profile, sc = scoreScale(S.scale, S.answers);
  const r = Object.assign(sc, { scaleId: S.scale.id, scaleName: S.scale.name, answers: S.answers.slice(), age: ageOf(p), gender: p.gender, date: new Date().toISOString() });
  try { S.result = await Store.saveResult(S.user, r); } catch (err) { S.result = r; }
  S.parentView = false; go('result');
}

(async function init() {
  const u = await Store.me();
  if (u) await afterLogin(u); else render();
})();
