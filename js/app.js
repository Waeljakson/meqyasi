// واجهة المنصة (صفحة واحدة).
const cfg = window.APP_CONFIG;
const root = document.getElementById('app');
const S = { user: null, scale: null, idx: 0, answers: [], result: null, results: [], admin: null, adminUser: null, q: '', info: '', sum: null, view: 'auth', authTab: 'login', msg: '' };

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
function go(view, keep) { S.view = view; if (!keep) { S.msg = ''; S.info = ''; } render(); window.scrollTo(0, 0); }
function shell(inner, opts = {}) {
  const u = S.user;
  return `<header class="top no-print"><div class="brand"><span class="logo">🧠</span>${esc(cfg.appName)}</div>
    ${u && u.profile.birthYear ? `<nav><button data-act="home">الرئيسية</button><button data-act="history">سجلّي</button>${u.isAdmin ? '<button data-act="admin">الإدارة</button>' : ''}<button data-act="logout">خروج</button></nav>` : ''}</header>
    ${Store.live ? '' : '<div class="demo no-print">وضع تجريبي: البيانات تُحفظ على هذا الجهاز فقط حتى يُربط Appwrite.</div>'}
    <main class="${opts.cls || ''}">${inner}</main>
    <footer class="no-print">هذه المنصة أداة فرز أولي ولا تقدم تشخيصاً. التشخيص والعلاج من اختصاص الأخصائي النفسي أو الطبيب.
      <br><button class="link" data-act="privacy">الخصوصية وحماية البيانات</button></footer>`;
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
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}${S.info ? `<p class="okmsg">${esc(S.info)}</p>` : ''}
        <button class="btn primary" type="submit">${su ? 'إنشاء الحساب' : 'دخول'}</button>
      </form>
      ${su ? '' : '<button class="link" data-act="forgot">نسيت كلمة المرور؟</button><br>'}
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
        <label class="check"><input type="checkbox" name="share" required ${p.birthYear ? 'checked' : ''}> أعلم أن مختص المنصة (مدير النظام) يستطيع الاطلاع على بياناتي ونتائجي بغرض المتابعة والإرشاد، وأوافق على ذلك.</label>
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
      ${Store.progress.get(S.user.id, s.id) ? '<button class="btn primary" data-act="resume">متابعة من حيث توقفت</button> <button class="btn" data-act="start">بدء من جديد</button>' : '<button class="btn primary" data-act="start">ابدأ</button>'} <button class="btn" data-act="home">رجوع</button></section>`);
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
    return shell(reportBody(r, s, r.userName || S.user.name) + `<p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> <button class="btn" data-act="home">الرئيسية</button></p>`, { cls: 'report' });
  },
  history() {
    const rows = S.results.map(r => `<li><div><b>${esc(r.scaleName)}</b><small>${fmtDate(r.date)} · ${fmtScore(r)} · ${esc(r.band)}</small></div>
      <span class="lvl l${r.level}"></span><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button><button class="btn sm ghost" data-act="del" data-id="${r.id}">حذف</button></li>`).join('');
    return shell(`<section class="card"><h1>سجلّي</h1>${rows ? `<p><button class="btn primary" data-act="summary">التقرير الشامل</button></p>${trends(S.results)}<ul class="hist">${rows}</ul>` : '<p class="muted">لم تُجرِ أي مقياس بعد.</p>'}</section>`);
  }
};

const LV = ['طبيعي', 'خفيف', 'متوسط', 'مرتفع'];
function spark(list) { // list: نتائج مقياس واحد من الأقدم للأحدث
  const W = 220, H = 46, n = list.length;
  const pts = list.map((r, i) => [W - 8 - (n === 1 ? 0 : i * (W - 16) / (n - 1)), H - 6 - (r.total / r.max) * (H - 12)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="تطور الدرجة"><polyline fill="none" stroke="currentColor" stroke-width="2" points="${pts.map(p => p.join(',')).join(' ')}"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="currentColor"/>`).join('')}</svg>`;
}
function byScale(results) {
  const g = {}; results.slice().sort((a, b) => a.date < b.date ? -1 : 1).forEach(r => { (g[r.scaleId] = g[r.scaleId] || []).push(r); });
  return Object.values(g);
}
function trends(results) {
  const rows = byScale(results).filter(l => l.length > 1).map(l => { const a = l[0], z = l[l.length - 1];
    return `<div class="trend"><b>${esc(z.scaleName)}</b>${spark(l)}<small>${l.length} مرات · من ${a.total} إلى ${z.total}</small></div>`; }).join('');
  return rows ? `<h3>تطور النتائج</h3>${rows}` : '';
}
V.summary = function () {
  const c = S.sum, groups = byScale(c.results), last = groups.map(l => l[l.length - 1]);
  const top = last.length ? Math.max(...last.map(r => r.level)) : 0, adv = ADVICE[top], urgent = last.some(r => r.urgent);
  const rows = groups.map(l => { const r = l[l.length - 1];
    return `<tr><td>${esc(r.scaleName)}</td><td>${fmtScore(r)}</td><td><span class="chip l${r.level}">${esc(r.band.length > 40 ? LV[r.level] : r.band)}${r.urgent ? ' · تنبيه عاجل' : ''}</span></td><td>${fmtDate(r.date)}</td><td>${l.length > 1 ? spark(l) : '—'}</td></tr>`; }).join('');
  const focus = last.filter(r => r.level >= 1).sort((a, b) => b.level - a.level).map(r => { const s = SCALES.find(x => x.id === r.scaleId), p = buildPlan(s, r);
    return `<li><b>${esc(s.measures)}:</b> ${p.goal} ${p.steps[0]}</li>`; }).join('');
  return shell(`<section class="card rep"><h1>التقرير الشامل</h1>
    <div class="who"><span>الاسم: <b>${esc(c.name)}</b></span><span>عدد المقاييس: <b>${groups.length}</b></span><span>التاريخ: <b>${fmtDate(new Date())}</b></span></div>
    ${urgent ? `<div class="urgent"><b>تنبيه مهم</b><p>${esc(cfg.urgentHelp)}</p></div>` : ''}
    <div class="advice ${adv.tone}"><b>الخلاصة: ${adv.title}</b><p>${adv.text}</p></div>
    <h3>آخر نتيجة في كل مقياس</h3><div class="tw"><table><tr><th>المقياس</th><th>الدرجة</th><th>التصنيف</th><th>التاريخ</th><th>التطور</th></tr>${rows}</table></div>
    ${focus ? `<h3>أولويات الدعم</h3><ul>${focus}</ul>` : '<p>لا توجد مجالات تحتاج دعماً خاصاً حالياً.</p>'}
    <p class="note">هذا ملخص لنتائج فرز أولي وليس تشخيصاً. الخطة العلاجية يضعها الأخصائي بعد المقابلة.</p></section>
    <p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> <button class="btn" data-act="${c.admin ? 'admin' : 'home'}">رجوع</button></p>`, { cls: 'report' });
};
V.forgot = () => shell(`<section class="card narrow"><h1>استعادة كلمة المرور</h1><p class="muted">اكتب بريدك وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.</p>
  <form data-form="forgot"><label>البريد الإلكتروني<input name="email" type="email" required dir="ltr"></label>
  ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">إرسال الرابط</button></form>
  <button class="link" data-act="toAuth">رجوع لتسجيل الدخول</button></section>`);
V.reset = () => shell(`<section class="card narrow"><h1>كلمة مرور جديدة</h1>
  <form data-form="reset"><label>كلمة المرور الجديدة<input name="password" type="password" required minlength="8" autocomplete="new-password" dir="ltr"></label>
  ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">حفظ</button></form></section>`);
V.privacy = () => shell(`<section class="card"><h1>الخصوصية وحماية البيانات</h1>
  <h3>ما الذي نحفظه؟</h3><ul><li>الاسم والبريد الإلكتروني وسنة الميلاد والجنس.</li><li>إجاباتك ودرجاتك في كل مقياس وتاريخ إجرائه.</li></ul>
  <h3>من يطّلع عليه؟</h3><ul><li>أنت: ترى نتائجك وتقاريرك في "سجلّي".</li><li>مختص المنصة (مدير النظام): يطّلع على بيانات ونتائج المستخدمين بغرض المتابعة والإرشاد فقط.</li><li>لا تُشارك البيانات مع أي جهة أخرى ولا تُستخدم للإعلانات.</li></ul>
  <h3>أين تُحفظ؟</h3><p>في قاعدة بيانات المنصة لدى خدمة Appwrite السحابية. كلمة المرور لا يراها أحد، ولا مدير النظام.</p>
  <h3>حقوقك</h3><ul><li>حذف أي نتيجة من "سجلّي" في أي وقت.</li><li>طلب حذف حسابك وكل بياناتك بالتواصل مع إدارة المنصة.</li></ul>
  <h3>من هم دون 18 سنة</h3><p>يُشترط علم ولي الأمر وموافقته، وتُعرض نتيجة الطفل لولي الأمر لا للطفل مباشرة.</p>
  <h3>تنبيه</h3><p>المنصة أداة فرز أولي، لا تقدم تشخيصاً ولا علاجاً، ولا تغني عن مراجعة المختص. في الحالات العاجلة: ${esc(cfg.urgentHelp)}</p>
  <p class="no-print"><button class="btn" data-act="${S.user && S.user.profile.birthYear ? 'home' : 'toAuth'}">رجوع</button></p></section>`);

V.admin = function () {
  const A = S.admin, y = new Date().getFullYear();
  const byUser = {}; A.results.forEach(r => { (byUser[r.userId] = byUser[r.userId] || []).push(r); });
  const refer = A.results.filter(r => r.level >= 2), urgent = A.results.filter(r => r.urgent);
  const tile = (n, t, c) => `<div class="tile ${c || ''}"><b>${n}</b><span>${t}</span></div>`;
  const perScale = {}; A.results.forEach(r => { perScale[r.scaleName] = (perScale[r.scaleName] || 0) + 1; });
  const mx = Math.max(1, ...Object.values(perScale));
  const bars = Object.entries(perScale).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="hbar"><span>${esc(k)}</span><i style="width:${Math.round(v / mx * 100)}%"></i><b>${v}</b></div>`).join('');
  const cases = refer.slice(0, 15).map(r => `<tr><td>${esc(r.userName)}</td><td>${esc(r.scaleName)}</td><td>${fmtScore(r)}</td><td><span class="chip l${r.level}">${r.urgent ? 'عاجل' : LV[r.level]}</span></td><td>${fmtDate(r.date)}</td><td><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button></td></tr>`).join('');
  const ql = S.q.trim().toLowerCase();
  const users = A.users.filter(u => !ql || (u.name + ' ' + u.email).toLowerCase().includes(ql)).map(u => {
    const rs = byUser[u.id] || [], top = rs.length ? Math.max(...rs.map(r => r.level)) : -1, bl = A.blocked.includes(u.id);
    return `<tr class="${bl ? 'blk' : ''}"><td>${esc(u.name)}</td><td dir="ltr">${esc(u.email)}</td><td>${u.birthYear ? y - u.birthYear : '—'}</td><td>${u.gender === 'f' ? 'أنثى' : u.gender === 'm' ? 'ذكر' : '—'}</td><td>${rs.length}</td>
      <td>${top < 0 ? '—' : `<span class="chip l${top}">${LV[top]}</span>`}</td><td>${bl ? 'موقوف' : 'نشط'}</td>
      <td><button class="btn sm" data-act="adminUser" data-id="${u.id}">النتائج</button> ${u.id === S.user.id ? '' : `<button class="btn sm ghost" data-act="${bl ? 'unblock' : 'block'}" data-id="${u.id}">${bl ? 'إلغاء الإيقاف' : 'إيقاف'}</button>`}</td></tr>`;
  }).join('');
  return shell(`<section class="card"><h1>لوحة الإدارة</h1>
    <div class="tiles">${tile(A.users.length, 'مستخدم')}${tile(A.results.length, 'مقياس مُنجز')}${tile(refer.length, 'نتيجة تحتاج مختصاً', 'warn')}${tile(urgent.length, 'تنبيه عاجل', 'danger')}</div></section>
    <section class="card"><h2>حالات تحتاج متابعة</h2>${cases ? `<div class="tw"><table><tr><th>المستخدم</th><th>المقياس</th><th>الدرجة</th><th>المستوى</th><th>التاريخ</th><th></th></tr>${cases}</table></div>` : '<p class="muted">لا توجد حالات.</p>'}</section>
    <section class="card"><h2>المستخدمون</h2><input name="q" placeholder="بحث بالاسم أو البريد" value="${esc(S.q)}">
      <div class="tw"><table><tr><th>الاسم</th><th>البريد</th><th>العمر</th><th>الجنس</th><th>المقاييس</th><th>أعلى مستوى</th><th>الحالة</th><th></th></tr>${users}</table></div></section>
    <section class="card"><h2>المقاييس الأكثر استخداماً</h2>${bars || '<p class="muted">لا توجد بيانات بعد.</p>'}
      <p><button class="btn" data-act="csv">تصدير كل النتائج CSV</button></p></section>`, { cls: 'wide' });
};
V.adminUser = function () {
  const u = S.admin.users.find(x => x.id === S.adminUser) || { name: '', email: '' };
  const rows = S.admin.results.filter(r => r.userId === S.adminUser).map(r => `<li><div><b>${esc(r.scaleName)}</b><small>${fmtDate(r.date)} · ${fmtScore(r)} · ${esc(r.band)}</small></div>
    <span class="lvl l${r.level}"></span><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button><button class="btn sm ghost" data-act="adel" data-id="${r.id}">حذف</button></li>`).join('');
  return shell(`<section class="card"><h1>${esc(u.name)}</h1><p class="muted" dir="ltr">${esc(u.email)}</p>
    ${rows ? `<p><button class="btn primary" data-act="asummary">التقرير الشامل</button></p>${trends(S.admin.results.filter(r => r.userId === S.adminUser))}<ul class="hist">${rows}</ul>` : '<p class="muted">لم يُجرِ أي مقياس بعد.</p>'}
    <h3>ملاحظات المتابعة</h3>
    <form data-form="note"><label>ملاحظة جديدة (يراها المدير فقط)<input name="text" required maxlength="900"></label><button class="btn" type="submit">إضافة</button></form>
    <ul class="hist">${(S.admin.notes || []).filter(n => n.userId === S.adminUser).map(n => `<li><div>${esc(n.text)}<small>${fmtDate(n.date)} · ${esc(n.author)}</small></div><button class="btn sm ghost" data-act="ndel" data-id="${n.id}">حذف</button></li>`).join('') || '<li class="muted">لا توجد ملاحظات.</li>'}</ul>
    <p><button class="btn" data-act="admin">رجوع للوحة</button></p></section>`);
};

function reportBody(r, s, name) {
  const adv = ADVICE[r.level], plan = buildPlan(s, r);
  const pct = Math.max(3, Math.min(100, Math.round((r.total / r.max) * 100)));
  const subs = r.subs.length ? `<h3>الأبعاد الفرعية</h3><table><tr><th>البُعد</th><th>الدرجة</th><th>التصنيف</th></tr>
    ${r.subs.map(x => `<tr><td>${esc(x.name)}</td><td>${x.score}</td><td>${esc(x.label || '—')}</td></tr>`).join('')}</table>` : '';
  return `<section class="card rep">
    <h1>تقرير ${esc(s.name)}</h1><p class="muted">${esc(s.formal)}</p>
    <div class="who"><span>الاسم: <b>${esc(name)}</b></span><span>العمر: <b>${r.age}</b></span><span>الجنس: <b>${r.gender === 'f' ? 'أنثى' : 'ذكر'}</b></span><span>التاريخ: <b>${fmtDate(r.date)}</b></span></div>
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
  if (m === 'BLOCKED') return 'تم إيقاف هذا الحساب. تواصل مع إدارة المنصة.';
  if (/Invalid credentials/i.test(m)) return 'البريد أو كلمة المرور غير صحيحة.';
  if (/already exists/i.test(m)) return 'يوجد حساب بهذا البريد بالفعل.';
  return 'تعذر إتمام العملية. حاول مرة أخرى.' + (m ? ' (' + m + ')' : '');
};
async function afterLogin(u) {
  S.user = u;
  if (!u.profile || !u.profile.birthYear) return go('profile');
  if (Store.live) Store.saveProfile(u, u.profile).catch(() => {});
  go('home');
}
root.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f).entries());
  try {
    if (f.dataset.form === 'auth') {
      const u = S.authTab === 'signup' ? await Store.signup(d.email, d.password, d.name) : await Store.login(d.email, d.password);
      await afterLogin(u);
    } else if (f.dataset.form === 'forgot') {
      await Store.recover(d.email); S.info = 'إن كان البريد مسجلاً فستصلك رسالة فيها رابط الاستعادة خلال دقائق.'; S.authTab = 'login'; go('auth', true);
    } else if (f.dataset.form === 'reset') {
      await Store.resetPassword(S.recovery.userId, S.recovery.secret, d.password);
      S.recovery = null; S.info = 'تم تغيير كلمة المرور. سجّل الدخول الآن.'; go('auth', true);
    } else if (f.dataset.form === 'note') {
      const n = await Store.addNote(S.adminUser, d.text, S.user.name); (S.admin.notes = S.admin.notes || []).unshift(n); render();
    } else if (f.dataset.form === 'profile') {
      const age = new Date().getFullYear() - Number(d.birthYear);
      if (age < 18 && !d.consent) { S.msg = 'يلزم علم ولي الأمر وموافقته لمن هم دون 18 سنة.'; return render(); }
      S.user = await Store.saveProfile(S.user, { birthYear: Number(d.birthYear), gender: d.gender, consent: !!d.consent });
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
    else if (act === 'start') { Store.progress.clear(); S.idx = 0; S.answers = []; go('question'); }
    else if (act === 'resume') { const p = Store.progress.get(S.user.id, S.scale.id); S.answers = p.answers; S.idx = Math.min(p.idx, S.scale.items.length - 1); go('question'); }
    else if (act === 'forgot') go('forgot');
    else if (act === 'toAuth') go('auth');
    else if (act === 'privacy') go('privacy');
    else if (act === 'summary') { S.sum = { name: S.user.name, results: S.results, admin: false }; go('summary'); }
    else if (act === 'asummary') { const u = S.admin.users.find(x => x.id === S.adminUser); S.sum = { name: u ? u.name : '', results: S.admin.results.filter(r => r.userId === S.adminUser), admin: true }; go('summary'); }
    else if (act === 'ndel') { await Store.deleteNote(b.dataset.id); S.admin.notes = S.admin.notes.filter(n => n.id !== b.dataset.id); render(); }
    else if (act === 'back') { if (S.idx === 0) go('home'); else { S.idx--; render(); } }
    else if (act === 'answer') {
      S.answers[S.idx] = Number(b.dataset.k);
      if (S.idx < S.scale.items.length - 1) { S.idx++; Store.progress.set({ userId: S.user.id, scaleId: S.scale.id, idx: S.idx, answers: S.answers }); render(); } else { Store.progress.clear(); await finish(); }
    }
    else if (act === 'parent') { S.parentView = true; render(); }
    else if (act === 'print') { try { window.print(); } catch (x) { /* غير متاح في المعاينة */ } }
    else if (act === 'history') { S.results = await Store.listResults(S.user); S.fromAdmin = false; go('history'); }
    else if (act === 'open') { S.result = (S.fromAdmin ? S.admin.results : S.results).find(r => r.id === b.dataset.id); S.parentView = true; go('result'); }
    else if (act === 'admin') { S.admin = await Store.adminData(); S.fromAdmin = true; go('admin'); }
    else if (act === 'adminUser') { S.adminUser = b.dataset.id; go('adminUser'); }
    else if (act === 'block') { await Store.block(b.dataset.id); S.admin.blocked.push(b.dataset.id); render(); }
    else if (act === 'unblock') { await Store.unblock(b.dataset.id); S.admin.blocked = S.admin.blocked.filter(x => x !== b.dataset.id); render(); }
    else if (act === 'adel') { await Store.deleteResult(b.dataset.id); S.admin.results = S.admin.results.filter(r => r.id !== b.dataset.id); render(); }
    else if (act === 'csv') exportCsv();
    else if (act === 'del') { await Store.deleteResult(b.dataset.id); S.results = S.results.filter(r => r.id !== b.dataset.id); render(); }
  } catch (err) { S.msg = errText(err); render(); }
});
async function finish() {
  const p = S.user.profile, sc = scoreScale(S.scale, S.answers);
  const r = Object.assign(sc, { scaleId: S.scale.id, scaleName: S.scale.name, answers: S.answers.slice(), age: ageOf(p), gender: p.gender, date: new Date().toISOString() });
  try { S.result = await Store.saveResult(S.user, r); } catch (err) { S.result = r; }
  S.parentView = false; go('result');
}

root.addEventListener('input', e => {
  if (e.target.name !== 'q') return;
  S.q = e.target.value; const pos = e.target.selectionStart; render();
  const i = root.querySelector('[name=q]'); if (i) { i.focus(); i.setSelectionRange(pos, pos); }
});
function exportCsv() {
  const cell = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const rows = [['الاسم', 'البريد', 'العمر', 'الجنس', 'المقياس', 'الدرجة', 'من', 'التصنيف', 'المستوى', 'عاجل', 'التاريخ']];
  const mail = Object.fromEntries(S.admin.users.map(u => [u.id, u.email]));
  S.admin.results.forEach(r => rows.push([r.userName, mail[r.userId] || '', r.age, r.gender === 'f' ? 'أنثى' : 'ذكر', r.scaleName, r.total, r.max, r.band, r.level, r.urgent ? 'نعم' : '', r.date.slice(0, 10)]));
  const blob = new Blob(['\ufeff' + rows.map(x => x.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'meqyasi-results.csv'; a.click();
}

(async function init() {
  const qs = new URLSearchParams(location.search);
  if (qs.get('userId') && qs.get('secret')) {
    S.recovery = { userId: qs.get('userId'), secret: qs.get('secret') };
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* لا شيء */ }
    return go('reset');
  }
  try { const u = await Store.me(); if (u) await afterLogin(u); else render(); }
  catch (err) { S.msg = errText(err); render(); }
})();
