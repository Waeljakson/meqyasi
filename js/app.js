// واجهة المنصة (صفحة واحدة).
const cfg = window.APP_CONFIG;
const root = document.getElementById('app');
const S = { user: null, sub: null, settings: {}, myReqs: [], subAdmin: { reqs: [], subs: [] }, country: 'eg', intakes: {}, kase: null, members: [], personId: '', scale: null, idx: 0, answers: [], result: null, results: [], admin: null, adminUser: null,
  q: '', info: '', sum: null, view: 'auth', authTab: 'login', msg: '' };

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const YEAR = new Date().getFullYear();
const ageOf = p => YEAR - Number(p.birthYear);
const fmtDate = d => new Date(d).toLocaleDateString('ar-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtScore = r => (Number.isInteger(r.total) ? r.total : r.total.toFixed(2)) + ' / ' + r.max;
const LV = ['طبيعي', 'خفيف', 'متوسط', 'مرتفع'];
const RELATIONS = ['ابن', 'ابنة', 'زوج', 'زوجة', 'أب', 'أم', 'أخ', 'أخت', 'آخر'];
const CHEERS = ['رائع! واصل 🌟', 'أنت بطل! 💪', 'ممتاز، اقتربنا 🚀', 'أحسنت! نجمة جديدة ⭐', 'شجاع جداً 🦁'];
const CATS = [{ id: 'mood', name: 'المشاعر والمزاج', icon: '💗' }, { id: 'focus', name: 'الانتباه والدراسة', icon: '🎯' }, { id: 'digital', name: 'العادات الرقمية', icon: '🎮' }, { id: 'strength', name: 'العافية والقوة النفسية', icon: '🌟' }];
const CATDESC = { mood: 'القلق والحزن والضغوط وما يرتبط بها', focus: 'نقص الانتباه وفرط الحركة وقلق الاختبار', digital: 'الألعاب والجوال ووسائل التواصل', strength: 'نقاط قوتك: الرضا وتقدير الذات والصمود والدعم' };
const catOf = s => s.cat ? s.cat : s.domain === 'digital' ? 'digital' : s.positive ? 'strength' : 'mood';
const HINTS = ['ما رأيك؟', 'أجب بصدق 😊', 'لا توجد إجابة خاطئة', 'خذ وقتك', 'أنا معك!'];

// ---------- رسوم كرتونية (SVG أصلية) ----------
const MASCOT = `<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 8l14 30 33 4-24 23 6 33-29-16-29 16 6-33L13 42l33-4z" fill="#ffc93c" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round"/><circle cx="48" cy="56" r="5" fill="#3b2f2f"/><circle cx="72" cy="56" r="5" fill="#3b2f2f"/><circle cx="50" cy="54" r="1.6" fill="#fff"/><circle cx="74" cy="54" r="1.6" fill="#fff"/><path d="M47 70q13 12 26 0" fill="none" stroke="#3b2f2f" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="66" r="4" fill="#ff9aa2"/><circle cx="80" cy="66" r="4" fill="#ff9aa2"/></svg>`;
const face = (fill, mouth, brow) => `<svg class="face" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="${fill}" stroke="#0003" stroke-width="3"/><circle cx="28" cy="34" r="5" fill="#3b2f2f"/><circle cx="52" cy="34" r="5" fill="#3b2f2f"/>${brow || ''}<path d="${mouth}" fill="none" stroke="#3b2f2f" stroke-width="4" stroke-linecap="round"/></svg>`;
const FACES = [
  face('#86efac', 'M26 48q14 14 28 0'),
  face('#fde68a', 'M28 53h24'),
  face('#fdba74', 'M26 57q14 -12 28 0', '<path d="M21 25l12 4M59 25l-12 4" stroke="#3b2f2f" stroke-width="3" stroke-linecap="round"/>')
];
const SCENE = `<svg class="scene" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"><circle cx="70" cy="34" r="22" fill="#ffd166"/><path d="M0 120V84q90-44 190-8t200-14 210 10v58z" fill="#95d5b2"/><path d="M0 120V100q120-26 260-6t340-10v36z" fill="#74c69d"/></svg>
  <span class="cloud c1"></span><span class="cloud c2"></span>`;
const HERO = `<svg class="heroart" viewBox="0 0 220 120" aria-hidden="true"><circle cx="60" cy="60" r="44" fill="var(--pri)" opacity=".15"/><circle cx="150" cy="50" r="30" fill="var(--pri)" opacity=".25"/><path d="M110 96c-26-18-40-32-40-48a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 16-14 30-40 48z" fill="var(--pri)"/><path d="M84 52h14l6-12 8 24 6-12h18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LOGO = `<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--pri)"/><stop offset="1" stop-color="var(--pri2)"/></linearGradient></defs><rect width="40" height="40" rx="12" fill="url(#lg)"/><path d="M20 31c-7-5-11-9-11-13.500a5.500 5.500 0 0 1 11-1.500 5.500 5.500 0 0 1 11 1.500c0 4.500-4 8.500-11 13.500z" fill="#fff"/><path d="M12.500 19h4l1.800-3.500 2.600 7 1.800-3.500h4.800" fill="none" stroke="url(#lg)" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const FAMILYART = `<svg class="famart" viewBox="0 0 360 260" aria-hidden="true"><ellipse cx="180" cy="236" rx="150" ry="16" fill="#0001"/><circle cx="70" cy="60" r="38" fill="#fff" opacity=".18"/><circle cx="300" cy="44" r="24" fill="#fff" opacity=".22"/><circle cx="318" cy="150" r="12" fill="#fff" opacity=".3"/>
  <g><rect x="92" y="112" width="64" height="118" rx="30" fill="#fff" opacity=".95"/><circle cx="124" cy="84" r="30" fill="#ffd9b3"/><path d="M96 78q28-40 56 0v-8q-28-34-56 0z" fill="#3b2f2f"/><circle cx="114" cy="86" r="3.500" fill="#3b2f2f"/><circle cx="134" cy="86" r="3.500" fill="#3b2f2f"/><path d="M114 97q10 8 20 0" fill="none" stroke="#3b2f2f" stroke-width="3" stroke-linecap="round"/></g>
  <g><rect x="206" y="122" width="60" height="108" rx="28" fill="#ffe3ec"/><circle cx="236" cy="96" r="28" fill="#ffd9b3"/><path d="M206 100q-4-46 30-46t30 46q-8-30-30-30t-30 30z" fill="#7c4a2d"/><circle cx="227" cy="98" r="3.500" fill="#3b2f2f"/><circle cx="245" cy="98" r="3.500" fill="#3b2f2f"/><path d="M227 108q9 7 18 0" fill="none" stroke="#3b2f2f" stroke-width="3" stroke-linecap="round"/></g>
  <g><rect x="156" y="166" width="48" height="64" rx="22" fill="#ffd166"/><circle cx="180" cy="146" r="23" fill="#ffd9b3"/><path d="M158 142q22-30 44 0-22-12-44 0z" fill="#3b2f2f"/><circle cx="172" cy="148" r="3" fill="#3b2f2f"/><circle cx="188" cy="148" r="3" fill="#3b2f2f"/><path d="M172 157q8 7 16 0" fill="none" stroke="#3b2f2f" stroke-width="3" stroke-linecap="round"/></g>
  <path d="M180 44c-10-7-16-13-16-20a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 7-6 13-16 20z" fill="#ff7a8a"/></svg>`;
const confetti = () => `<div class="confetti" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<i style="--x:${(i * 41) % 100}%;--d:${(i % 7) * 0.25}s;--c:${['#ff7a59', '#ffd166', '#4cc9f0', '#95d5b2', '#c77dff'][i % 5]}"></i>`).join('')}</div>`;

// ---------- الأشخاص ----------
function selfPerson() { const p = S.user.profile; return { id: '', name: S.user.name, birthYear: p.birthYear, gender: p.gender, relation: 'أنا', self: true }; }
function people() { return [selfPerson()].concat(S.members); }
function cur() { return S.members.find(m => m.id === S.personId) || selfPerson(); }
function resultsOf(list, personId) { return list.filter(r => (r.memberId || '') === personId); }
function scalesOf(person) { return scalesFor(ageOf(person), person.gender).filter(s => (s.respondent !== 'parent' || !person.self) && !(cfg.disabledScales || []).includes(s.id)); }
// ---------- الاشتراك ----------
function isSub() { return !!(S.user && (S.user.isAdmin || (S.sub && new Date(S.sub.until) > new Date()))); }
function freeLeft() { return Math.max(0, cfg.freeLimit - S.results.length); }
function lockReason(scale, person) {
  if (isSub()) return '';
  if (S.results.some(r => r.scaleId === scale.id && (r.memberId || '') === person.id)) return 'في النسخة المجانية يُجرى كل مقياس مرة واحدة. اشترك لإعادة القياس ومتابعة التطور.';
  if (freeLeft() <= 0) return 'استخدمت المقاييس المجانية (' + cfg.freeLimit + '). اشترك لاستخدام جميع المقاييس دون حد.';
  return '';
}
function payInfo() { let v = {}; try { v = JSON.parse(S.settings.pay || '{}'); } catch (e) { v = {}; } return { eg: Object.assign({}, cfg.pay.eg, v.eg), sa: Object.assign({}, cfg.pay.sa, v.sa) }; }
function fileToDataUrl(file, maxDim) {
  return new Promise((res, rej) => { if (!file || !file.size) return res(''); const fr = new FileReader();
    fr.onerror = () => rej(new Error('تعذر قراءة الصورة')); fr.onload = () => { const img = new Image(); img.onerror = () => rej(new Error('الملف ليس صورة صالحة'));
      img.onload = () => { const k = Math.min(1, maxDim / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.8)); }; img.src = fr.result; }; fr.readAsDataURL(file); });
}

function setTheme() {
  let st = 'adult';
  if (S.user && S.user.profile.birthYear) {
    st = stageOf(ageOf(cur()));
    if (S.scale && S.scale.respondent === 'parent' && ['intro', 'question', 'result'].includes(S.view)) st = 'adult';
    if (['admin', 'adminUser', 'family', 'familyReport', 'privacy', 'history', 'summary', 'intake', 'caseReport', 'subscribe'].includes(S.view) || (S.view === 'result' && (S.parentView || S.fromAdmin))) st = stageOf(ageOf(selfPerson()));
  }
  document.body.className = 'theme-' + st;
}
function formMode() { return S.scale && (S.scale.respondent === 'parent' || ageOf(cur()) >= 16); }
function navOn(a) { const v = S.view; return a === 'home' ? ['home', 'intro', 'question', 'result'].includes(v) && !S.fromAdmin : a === 'family' ? v.startsWith('family') : a === 'history' ? ['history', 'summary', 'intake', 'caseReport'].includes(v) && !(S.kase && S.kase.admin && v === 'caseReport') && !(S.sum && S.sum.admin && v === 'summary') : a === 'admin' ? v.startsWith('admin') : a === 'subscribe' ? v === 'subscribe' : false; }
function go(view, keep) { S.view = view; if (!keep) { S.msg = ''; S.info = ''; } render(); window.scrollTo(0, 0); }
function shell(inner, opts = {}) {
  const u = S.user, ready = u && u.profile.birthYear;
  return `<header class="top no-print"><div class="brand">${LOGO}<span>${esc(cfg.appName)}</span></div>
    ${ready ? `<nav>${[['home', '🏠', 'الرئيسية'], ['family', '👨‍👩‍👧', 'أسرتي'], ['history', '📊', 'السجل']].concat(u.isAdmin ? [['admin', '🛡️', 'الإدارة']] : [['subscribe', '💎', 'الاشتراك']]).concat([['logout', '🚪', 'خروج']]).map(([a, i, t]) => `<button data-act="${a}" class="${navOn(a) ? 'on' : ''}"><i>${i}</i><span>${t}</span></button>`).join('')}</nav>` : ''}</header>
    ${Store.live ? '' : '<div class="demo no-print">وضع تجريبي: البيانات تُحفظ على هذا الجهاز فقط حتى يُربط Appwrite.</div>'}
    <main class="${opts.cls || ''}">${inner}</main>
    <footer class="no-print"><div class="fbrand">${LOGO}<b>${esc(cfg.appName)}</b></div>
      <p>هذه المنصة أداة فرز أولي ولا تقدم تشخيصاً. التشخيص والعلاج من اختصاص الأخصائي النفسي أو الطبيب.</p>
      <button class="link" data-act="privacy">الخصوصية وحماية البيانات</button>
      <p class="copy">© ${YEAR} جميع الحقوق محفوظة · برمجة وتصميم: <b>الدكتور وائل الجمل</b></p></footer>`;
}
const yearOptions = sel => { let o = ''; for (let i = YEAR - 3; i >= YEAR - 95; i--) o += `<option value="${i}" ${Number(sel) === i ? 'selected' : ''}>${i}</option>`; return o; };

// ---------- الشاشات ----------
const V = {
  auth() {
    const su = S.authTab === 'signup';
    const feat = (i, t, d) => `<li><span>${i}</span><div><b>${t}</b><small>${d}</small></div></li>`;
    return shell(`<section class="landing"><div class="pitch">
        <span class="tag">صحتك النفسية تبدأ بخطوة</span>
        <h1>اطمئن على نفسك وعلى أسرتك في دقائق</h1>
        <p>مقاييس نفسية معروفة عالمياً بواجهة تناسب كل عمر، ونتيجة فورية مع نصيحة وخطة دعم وتقرير جاهز للطباعة.</p>
        <ul class="feats">${feat('🧒', 'واجهة كرتونية للأطفال', 'رحلة ممتعة بوجوه ورسوم بدل الأسئلة الجافة')}${feat('👨‍👩‍👧', 'سجل أسري واحد', 'أضف أبناءك وزوجك وتابع الجميع من حسابك')}${feat('📋', 'تقرير وخطة دعم', 'درجة وتصنيف ونصيحة واضحة متى تراجع المختص')}</ul>
        <div class="stats"><div><b>${SCALES.length}</b><span>مقياساً</span></div><div><b>3</b><span>واجهات عمرية</span></div><div><b>2–10</b><span>دقائق للمقياس</span></div></div>
        ${FAMILYART}</div>
      <div class="card authcard"><h2>${su ? 'حساب جديد' : 'تسجيل الدخول'}</h2>
      <form data-form="auth" class="start">
        ${su ? '<label>الاسم<input name="name" required maxlength="60" autocomplete="name"></label>' : ''}
        <label>البريد الإلكتروني<input name="email" type="email" required autocomplete="email" dir="ltr"></label>
        <label>كلمة المرور<input name="password" type="password" required minlength="8" autocomplete="${su ? 'new-password' : 'current-password'}" dir="ltr"></label>
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}${S.info ? `<p class="okmsg">${esc(S.info)}</p>` : ''}
        <button class="btn primary" type="submit">${su ? 'إنشاء الحساب' : 'دخول'}</button>
      </form>
      ${su ? '' : '<button class="link" data-act="forgot">نسيت كلمة المرور؟</button><br>'}
      <button class="link" data-act="tab">${su ? 'لدي حساب بالفعل' : 'ليس لدي حساب — إنشاء حساب جديد'}</button></div></section>
      <section class="how"><h2>كيف تعمل المنصة؟</h2><div class="steps">
        <div><i>1</i><b>أنشئ حسابك</b><p>وأضف أفراد أسرتك إن أردت.</p></div>
        <div><i>2</i><b>اختر المقياس</b><p>تظهر لك المقاييس المناسبة للعمر فقط.</p></div>
        <div><i>3</i><b>أجب بصدق</b><p>أسئلة قصيرة، سؤال في كل شاشة.</p></div>
        <div><i>4</i><b>استلم تقريرك</b><p>نتيجة ونصيحة وخطة دعم فوراً.</p></div></div></section>`, { cls: 'wide' });
  },
  forgot: () => shell(`<section class="card narrow"><h1>استعادة كلمة المرور</h1><p class="muted">اكتب بريدك وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.</p>
    <form data-form="forgot"><label>البريد الإلكتروني<input name="email" type="email" required dir="ltr"></label>
    ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">إرسال الرابط</button></form>
    <button class="link" data-act="toAuth">رجوع لتسجيل الدخول</button></section>`),
  reset: () => shell(`<section class="card narrow"><h1>كلمة مرور جديدة</h1>
    <form data-form="reset"><label>كلمة المرور الجديدة<input name="password" type="password" required minlength="8" autocomplete="new-password" dir="ltr"></label>
    ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">حفظ</button></form></section>`),
  profile() {
    const p = S.user.profile || {};
    return shell(`<section class="card narrow"><h1>بياناتك</h1>
      <p class="muted">نحتاج العمر والجنس فقط لاختيار المقاييس والواجهة المناسبة لك.</p>
      <form data-form="profile">
        <label>سنة الميلاد<select name="birthYear" required><option value="">اختر</option>${yearOptions(p.birthYear)}</select></label>
        <label>الجنس<select name="gender" required><option value="">اختر</option>
          <option value="m" ${p.gender === 'm' ? 'selected' : ''}>ذكر</option><option value="f" ${p.gender === 'f' ? 'selected' : ''}>أنثى</option></select></label>
        <label class="check"><input type="checkbox" name="consent" ${p.consent ? 'checked' : ''}> إذا كان عمري أقل من 18 سنة: ولي أمري يعلم باستخدامي للمنصة وموافق عليه.</label>
        <label class="check"><input type="checkbox" name="share" required ${p.birthYear ? 'checked' : ''}> أعلم أن مختص المنصة (مدير النظام) يستطيع الاطلاع على بياناتي ونتائجي بغرض المتابعة والإرشاد، وأوافق على ذلك.</label>
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}
        <button class="btn primary" type="submit">حفظ ومتابعة</button></form></section>`);
  },
  home() {
    const person = cur(), age = ageOf(person), st = stageOf(age), all = scalesOf(person), child = st === 'child';
    const chips = people().map(p => `<button class="pchip ${p.id === person.id ? 'on' : ''}" data-act="person" data-id="${p.id}"><span>${p.self ? '🙂' : ageOf(p) <= 12 ? '🧒' : ageOf(p) <= 17 ? '🧑' : p.gender === 'f' ? '👩' : '👨'}</span>${esc(p.self ? 'أنا' : p.name)}</button>`).join('');
    const who = person.self ? esc(S.user.name) : esc(person.name);
    const mine = resultsOf(S.results, person.id), lastOf = {};
    mine.forEach(r => { if (!lastOf[r.scaleId]) lastOf[r.scaleId] = r; });
    const doneN = all.filter(s => lastOf[s.id]).length, pct = all.length ? Math.round(doneN / all.length * 100) : 0;
    const ql = (S.sq || '').trim().toLowerCase(), cat = S.cat || 'all';
    const list = all.filter(s => (cat === 'all' || catOf(s) === cat) && (!ql || (s.name + ' ' + s.measures + ' ' + s.formal).toLowerCase().includes(ql)));
    const card = s => { const r = lastOf[s.id], c = catOf(s), lock = !!lockReason(s, person);
      return `<button class="scard c-${c} ${r ? 'done' : ''} ${lock ? 'locked' : ''}" data-act="intro" data-id="${s.id}">${lock ? '<span class="lockb">🔒 للمشتركين</span>' : ''}
        <span class="sico">${s.icon}</span>
        <span class="sbody"><b>${esc(s.name)}</b><small>${esc(s.measures)}</small>
          <span class="badges"><em>⏱ ${s.minutes} د</em><em>${s.items.length} سؤالاً</em>${s.respondent === 'parent' ? '<em class="par">يجيب ولي الأمر</em>' : ''}</span></span>
        <span class="sfoot">${r ? `<span class="last"><i class="lvl l${r.level}"></i>آخر نتيجة: ${LV[r.level]} · ${fmtDate(r.date)}</span><span class="cta">إعادة ↺</span>` : '<span class="last new">لم يُجرَ بعد</span><span class="cta">ابدأ ←</span>'}</span></button>`; };
    const next = all.find(s => !lastOf[s.id]);
    const tabs = [{ id: 'all', name: 'الكل', icon: '✨' }].concat(CATS).map(c => { const n = c.id === 'all' ? all.length : all.filter(s => catOf(s) === c.id).length;
      return n ? `<button class="tab ${cat === c.id ? 'on' : ''}" data-act="cat" data-id="${c.id}"><span>${c.icon}</span>${c.name}<b>${n}</b></button>` : ''; }).join('');
    const sections = (cat === 'all' && !ql ? CATS : [{ id: null }]).map(c => { const g = c.id ? list.filter(s => catOf(s) === c.id) : list;
      return g.length ? `${c.id ? `<div class="cathead c-${c.id}"><span>${c.icon}</span><div><h2>${c.name}</h2><p>${CATDESC[c.id]}</p></div></div>` : ''}<section class="sgrid">${g.map(card).join('')}</section>` : ''; }).join('');
    const hello = child ? `${MASCOT}<h1>أهلاً ${who}! جاهز للمغامرة؟</h1>` : `<h1>${person.self ? 'أهلاً ' + who : 'مقاييس ' + who}</h1>`;
    if (!all.length) return shell(`<div class="people no-print">${chips}<button class="pchip add" data-act="family">＋ إضافة فرد</button></div><p class="card">لا توجد مقاييس مناسبة لهذا العمر. ننصح باستشارة أخصائي نفسي للأطفال.</p>`);
    return shell(`<div class="people no-print">${chips}<button class="pchip add" data-act="family">＋ إضافة فرد</button></div>
      <section class="hero ${child ? '' : 'banner'}">${child ? '' : HERO}<div class="hgrow">${hello}<p class="muted">${child ? 'اختر لعبتك وأجب بصدق، لا توجد إجابة صحيحة أو خاطئة.' : 'اختر مقياساً وأجب بصدق؛ لا توجد إجابات صحيحة أو خاطئة.'}</p>
        <div class="prog"><div class="pbar"><i style="width:${pct}%"></i></div><span>أُنجز ${doneN} من ${all.length}</span></div></div>
        ${next && !child ? `<button class="nextup" data-act="intro" data-id="${next.id}"><small>مقترح الآن</small><b>${next.icon} ${esc(next.name)}</b><span>${next.minutes} دقائق · ابدأ ←</span></button>` : ''}</section>
      ${isSub() ? '' : `<button class="freebar no-print" data-act="subscribe"><span>💎</span><div><b>النسخة المجانية: بقي لك ${freeLeft()} من ${cfg.freeLimit} مقياس</b><small>اشترك لاستخدام جميع المقاييس (${SCALES.length}) وإعادة القياس دون حد</small></div><i>اشترك الآن ←</i></button>`}
      ${child ? '' : `<div class="tools no-print"><div class="tabs">${tabs}</div><label class="search"><span>🔍</span><input name="sq" placeholder="ابحث عن مقياس..." value="${esc(S.sq || '')}" aria-label="بحث"></label></div>`}
      ${sections || '<p class="card center muted">لا توجد مقاييس مطابقة للبحث.</p>'}
      ${child ? '' : `<button class="dirlink no-print" data-act="directory"><span>🏥</span><div><b>اختبارات يطبقها المختص فقط</b><small>ستانفورد-بينيه، وكسلر، فاينلاند، كونرز، MMPI وغيرها: ما تقيسه ومتى تُطلب</small></div><i>←</i></button>`}
      <p class="center no-print"><button class="link" data-act="editProfile">تعديل بياناتي</button></p>`, { cls: 'wide' });
  },
  intro() {
    const s = S.scale, person = cur(), key = s.id + '|' + person.id;
    let note = '';
    if (!person.self && s.respondent === 'parent') note = `تجيب أنت عن ${esc(person.name)}.`;
    else if (!person.self && ageOf(person) >= 18) note = `هذا المقياس يجيب عنه ${esc(person.name)} بنفسه وبعلمه وموافقته.`;
    else if (!person.self) note = `أعطِ الجهاز لـ${esc(person.name)} ليجيب بنفسه، وكن بجانبه دون أن توجّه إجاباته.`;
    return shell(`<section class="card narrow center"><div class="bigico">${s.icon}</div><h1>${esc(s.name)}</h1>
      <p class="muted">${esc(s.formal)}</p>
      ${stageOf(ageOf(person)) === 'child' && s.respondent !== 'parent' ? `<p>${esc(s.timeframe)}</p>` : `<table class="spec"><tr><th>المجال</th><td>${esc(s.measures)}</td></tr><tr><th>عدد البنود</th><td>${s.items.length}</td></tr><tr><th>المجيب</th><td>${s.respondent === 'parent' ? 'ولي الأمر عن الطفل' : 'تقرير ذاتي'}</td></tr><tr><th>زمن التطبيق</th><td>نحو ${s.minutes} دقائق</td></tr><tr><th>الحد الفاصل</th><td>${esc((CLIN[s.id] || {}).cut || '—')}</td></tr><tr><th>التقنين العربي</th><td>${esc((CLIN[s.id] || {}).psy || '—')}</td></tr></table>
      <div class="instr"><b>التعليمات</b><p>${esc(s.timeframe)}</p><p>أجب عن جميع البنود بما يصف حالتك فعلاً، لا بما تتمنى. لا تتوقف طويلاً عند أي بند.</p></div>`}
      ${note ? `<p class="ref">${note}</p>` : ''}
      ${Store.progress.get(S.user.id, key) ? '<button class="btn primary" data-act="resume">متابعة من حيث توقفت</button> <button class="btn" data-act="start">بدء من جديد</button>' : '<button class="btn primary" data-act="start">ابدأ</button>'} <button class="btn" data-act="home">رجوع</button></section>`);
  },
  question() {
    const s = S.scale, i = S.idx, it = s.items[i], opts = it.opts || s.options, n = s.items.length;
    const child = document.body.classList.contains('theme-child'), pct = Math.round((i / n) * 100);
    if (formMode()) {
      const done = S.answers.filter(x => x != null).length;
      const rows = s.items.map((q, j) => { const o = q.opts || s.options;
        return `<div class="frow ${S.answers[j] != null ? 'ans' : ''}" id="q${j}"><div class="fq"><span class="fn">${j + 1}</span><span>${esc(q.t)}</span></div>
          <div class="fopts n${o.length}">${o.map((x, k) => `<button type="button" class="fo ${S.answers[j] === k ? 'sel' : ''}" data-act="pick" data-i="${j}" data-k="${k}">${esc(x.t)}</button>`).join('')}</div></div>`; }).join('');
      return shell(`<section class="card clinform"><div class="fhead"><div><h1>${esc(s.formal)}</h1><p class="muted">${esc(s.timeframe)}</p></div><span class="qico">${s.icon}</span></div>
        <div class="fsticky"><div class="bar"><i id="fbar" style="width:${Math.round(done / n * 100)}%"></i></div><span id="fcount">${done} / ${n}</span></div>
        ${rows}
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}
        <div class="qnav"><button class="btn primary" data-act="submitForm">إنهاء وعرض النتيجة</button> <button class="btn" data-act="home">إلغاء</button></div></section>`);
    }
    const kidFaces = child && opts.length === 3 && opts[0].e;
    const btns = opts.map((o, k) => `<button class="opt ${S.answers[i] === k ? 'sel' : ''} ${kidFaces ? 'kid f' + k : ''}" data-act="answer" data-k="${k}">${kidFaces ? FACES[k] : `<span class="dot">${k + 1}</span>`}<span>${esc(o.t)}</span></button>`).join('');
    if (child) {
      const cheer = i > 0 && i % 8 === 0 ? CHEERS[(i / 8) % CHEERS.length] : HINTS[i % HINTS.length];
      return shell(`<section class="card qcard kidq">
        <div class="journey">${SCENE}<span class="goal">🏰</span><span class="walker" style="inset-inline-start:calc(${pct}% * .82)">${MASCOT}</span></div>
        <p class="meta">سؤال ${i + 1} من ${n}</p>
        <div class="ask"><div class="pic">${(s.pics && s.pics[i]) || s.icon}</div><div class="bubble">${esc(cheer)}</div></div>
        <h2 class="qtext">${esc(it.t)}</h2><div class="opts kids">${btns}</div>${S.msg ? `<p class="err">${esc(S.msg.replace('اضغط إنهاء', 'اختر إجابتك'))}</p>` : ''}
        <div class="qnav"><button class="btn" data-act="back">${i === 0 ? 'إلغاء' : 'السابق'}</button></div></section>`);
    }
    return shell(`<section class="card qcard"><div class="bar"><i style="width:${pct}%"></i></div>
      <div class="qhead"><span class="qico">${s.icon}</span><span class="meta">سؤال ${i + 1} من ${n}</span></div>
      <p class="tf">${esc(s.timeframe)}</p><h2 class="qtext">${esc(it.t)}</h2>
      <div class="opts ${opts.length > 4 ? 'many' : ''}">${btns}</div>${S.msg ? `<p class="err">${esc(S.msg.replace('اضغط إنهاء', 'اختر إجابتك'))}</p>` : ''}
      <div class="qnav"><button class="btn" data-act="back">${i === 0 ? 'إلغاء' : 'السابق'}</button></div></section>`);
  },
  result() {
    const r = S.result, s = SCALES.find(x => x.id === r.scaleId);
    if (document.body.classList.contains('theme-child') && s.respondent !== 'parent' && !S.parentView) {
      return shell(`<section class="card narrow center party">${confetti()}${MASCOT}<h1>أحسنت! أنهيت المغامرة 🎉</h1>
        <div class="medal">🏅</div><p>شكراً لأنك أجبت بصدق. أنت شجاع!</p><p class="muted">اطلب الآن من والدك أو والدتك أو المرشد أن يشاهد النتيجة معك.</p>
        <button class="btn primary" data-act="parent">عرض النتيجة لولي الأمر</button> <button class="btn" data-act="home">الرئيسية</button></section>`);
    }
    return shell(reportBody(r, s, r.memberName || r.userName || S.user.name) + `<p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> ${S.fromAdmin ? '' : '<button class="btn" data-act="case">تقرير الإحالة للمختص</button> '}<button class="btn" data-act="${S.fromAdmin ? 'admin' : 'home'}">${S.fromAdmin ? 'رجوع للوحة' : 'الرئيسية'}</button></p>`, { cls: 'report' });
  },
  history() {
    const person = cur(), mine = resultsOf(S.results, person.id);
    const rows = mine.map(r => `<li><div><b>${esc(r.scaleName)}</b><small>${fmtDate(r.date)} · ${fmtScore(r)} · ${esc(r.band)}</small></div>
      <span class="lvl l${r.level}"></span><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button>${isSub() ? `<button class="btn sm ghost" data-act="del" data-id="${r.id}">حذف</button>` : ''}</li>`).join('');
    const chips = people().map(p => `<button class="pchip ${p.id === person.id ? 'on' : ''}" data-act="hperson" data-id="${p.id}">${esc(p.self ? 'أنا' : p.name)}</button>`).join('');
    return shell(`<div class="people no-print">${chips}</div><section class="card"><h1>سجل ${person.self ? 'نتائجي' : esc(person.name)}</h1>
      <p class="acts"><button class="btn" data-act="intake">📝 تاريخ الحالة ${S.intakes[person.id] ? '(مُدخل)' : '(غير مُدخل)'}</button>${rows ? ' <button class="btn primary" data-act="case">📄 تقرير الإحالة للمختص</button> <button class="btn" data-act="summary">ملخص مبسّط للأسرة</button>' : ''}</p>
      ${rows ? `${trends(mine)}<ul class="hist">${rows}</ul>` : '<p class="muted">لا توجد مقاييس منجزة بعد.</p>'}</section>`);
  },
  family() {
    const rows = S.members.map(m => { const rs = resultsOf(S.results, m.id), top = rs.length ? Math.max(...rs.map(r => r.level)) : -1;
      return `<tr><td>${esc(m.name)}</td><td>${esc(m.relation)}</td><td>${ageOf(m)}</td><td>${rs.length}</td><td>${top < 0 ? '—' : `<span class="chip l${top}">${LV[top]}</span>`}</td>
        <td><button class="btn sm" data-act="person" data-id="${m.id}">إجراء مقياس</button> <button class="btn sm ghost" data-act="mdel" data-id="${m.id}">حذف</button></td></tr>`; }).join('');
    return shell(`<section class="card"><h1>أسرتي</h1><p class="muted">أضف أبناءك أو زوجك/زوجتك لتجري لهم المقاييس وتتابع حالتهم في سجل أسري واحد.</p>
      ${rows ? `<div class="tw"><table><tr><th>الاسم</th><th>الصلة</th><th>العمر</th><th>المقاييس</th><th>أعلى مستوى</th><th></th></tr>${rows}</table></div>
        <p><button class="btn primary" data-act="familyReport">تقرير الحالة النفسية للأسرة</button></p>` : '<p>لم تضف أحداً بعد.</p>'}</section>
      <section class="card narrow"><h2>إضافة فرد</h2><form data-form="member">
        <label>الاسم<input name="name" required maxlength="60"></label>
        <label>صلة القرابة<select name="relation" required><option value="">اختر</option>${RELATIONS.map(r => `<option>${r}</option>`).join('')}</select></label>
        <label>سنة الميلاد<select name="birthYear" required><option value="">اختر</option>${yearOptions()}</select></label>
        <label>الجنس<select name="gender" required><option value="">اختر</option><option value="m">ذكر</option><option value="f">أنثى</option></select></label>
        <label class="check"><input type="checkbox" name="ok" required> أقرّ بأنني ولي أمر هذا الفرد إن كان قاصراً، أو أنه بالغ يعلم بإضافته ويوافق على حفظ نتائجه في حسابي.</label>
        ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">إضافة</button></form></section>`);
  },
  familyReport() { return shell(familyBody() + `<p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> <button class="btn" data-act="family">رجوع</button></p>`, { cls: 'report' }); },
  summary() {
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
      <p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> <button class="btn" data-act="${c.admin ? 'admin' : 'history'}">رجوع</button></p>`, { cls: 'report' });
  },
  privacy: () => shell(`<section class="card"><h1>الخصوصية وحماية البيانات</h1>
    <h3>ما الذي نحفظه؟</h3><ul><li>الاسم والبريد الإلكتروني وسنة الميلاد والجنس.</li><li>أفراد الأسرة الذين تضيفهم: الاسم وصلة القرابة وسنة الميلاد والجنس.</li><li>الإجابات والدرجات في كل مقياس وتاريخ إجرائه، لك ولأفراد أسرتك.</li><li>طلبات الاشتراك: اسم المحوِّل ورقم العملية وصورة إثبات الدفع التي ترفعها.</li><li>استمارة تاريخ الحالة إن عبّأتها: الشكوى ومدتها وتأثيرها، والأدوية والحالات الصحية والتاريخ الأسري. كلها اختيارية.</li></ul>
    <h3>من يطّلع عليه؟</h3><ul><li>صاحب الحساب: يرى نتائجه ونتائج الأفراد الذين أضافهم.</li><li>مختص المنصة (مدير النظام): يطّلع على بيانات ونتائج المستخدمين وأفراد أسرهم بغرض المتابعة والإرشاد فقط.</li><li>لا تُشارك البيانات مع أي جهة أخرى ولا تُستخدم للإعلانات.</li></ul>
    <h3>أين تُحفظ؟</h3><p>في قاعدة بيانات المنصة لدى خدمة Appwrite السحابية. كلمة المرور لا يراها أحد، ولا مدير النظام.</p>
    <h3>إحصاءات الزيارات</h3><p>نعدّ زيارات المنصة ومرات فتح المقاييس برمز عشوائي يُحفظ على جهازك، دون اسم أو بريد أو عنوان شبكي، ولا يُربط بحسابك.</p>
    <h3>حقوقك</h3><ul><li>حذف أي نتيجة أو أي فرد من حسابك في أي وقت.</li><li>طلب حذف حسابك وكل بياناتك بالتواصل مع إدارة المنصة.</li></ul>
    <h3>القاصرون وأفراد الأسرة البالغون</h3><p>يُشترط أن يكون من يضيف قاصراً هو ولي أمره. الفرد البالغ يجيب عن مقاييسه بنفسه وبعلمه وموافقته، ولا يُجرى له مقياس دون علمه.</p>
    <h3>تنبيه</h3><p>المنصة أداة فرز أولي، لا تقدم تشخيصاً ولا علاجاً، ولا تغني عن مراجعة المختص. في الحالات العاجلة: ${esc(cfg.urgentHelp)}</p>
    <p class="no-print"><button class="btn" data-act="${S.user && S.user.profile.birthYear ? 'home' : 'toAuth'}">رجوع</button></p></section>`),
  admin() {
    const SA = S.subAdmin, subOf = id => SA.subs.find(x => x.userId === id), act = x => x && new Date(x.until) > new Date(), P = payInfo();
    const A = S.admin, byUser = {}; A.results.forEach(r => { (byUser[r.userId] = byUser[r.userId] || []).push(r); });
    const refer = A.results.filter(r => r.level >= 2), urgent = A.results.filter(r => r.urgent);
    const tile = (n, t, c) => `<div class="tile ${c || ''}"><b>${n}</b><span>${t}</span></div>`;
    const perScale = {}; A.results.forEach(r => { perScale[r.scaleName] = (perScale[r.scaleName] || 0) + 1; });
    const mx = Math.max(1, ...Object.values(perScale));
    const bars = Object.entries(perScale).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="hbar"><span>${esc(k)}</span><i style="width:${Math.round(v / mx * 100)}%"></i><b>${v}</b></div>`).join('');
    const cases = refer.slice(0, 15).map(r => `<tr><td>${esc(r.memberName ? r.memberName + ' (أسرة ' + r.userName + ')' : r.userName)}</td><td>${esc(r.scaleName)}</td><td>${fmtScore(r)}</td><td><span class="chip l${r.level}">${r.urgent ? 'عاجل' : LV[r.level]}</span></td><td>${fmtDate(r.date)}</td><td><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button></td></tr>`).join('');
    const ql = S.q.trim().toLowerCase();
    const users = A.users.filter(u => !ql || (u.name + ' ' + u.email).toLowerCase().includes(ql)).map(u => {
      const rs = byUser[u.id] || [], top = rs.length ? Math.max(...rs.map(r => r.level)) : -1, bl = A.blocked.includes(u.id), fam = A.members.filter(m => m.ownerId === u.id).length;
      return `<tr class="${bl ? 'blk' : ''}"><td>${esc(u.name)}</td><td dir="ltr">${esc(u.email)}</td><td>${u.birthYear ? YEAR - u.birthYear : '—'}</td><td>${u.gender === 'f' ? 'أنثى' : u.gender === 'm' ? 'ذكر' : '—'}</td><td>${fam}</td><td>${rs.length}</td>
        <td>${top < 0 ? '—' : `<span class="chip l${top}">${LV[top]}</span>`}</td><td>${bl ? 'موقوف' : 'نشط'}</td>
        <td>${act(subOf(u.id)) ? `<span class="chip l0">حتى ${fmtDate(subOf(u.id).until)}</span> <button class="btn sm ghost" data-act="subOff" data-id="${u.id}">إلغاء</button>` : `<span class="muted">مجاني</span> <button class="btn sm" data-act="subOn" data-id="${u.id}" data-m="1">تفعيل شهر</button>`}</td>
        <td><button class="btn sm" data-act="adminUser" data-id="${u.id}">النتائج</button> ${u.id === S.user.id ? '' : `<button class="btn sm ghost" data-act="${bl ? 'unblock' : 'block'}" data-id="${u.id}">${bl ? 'إلغاء الإيقاف' : 'إيقاف'}</button>`}</td></tr>`;
    }).join('');
    const pend = SA.reqs.filter(r => r.status === 'pending');
    const reqRows = SA.reqs.slice(0, 40).map(r => `<tr class="${r.status !== 'pending' ? 'blk' : ''}"><td>${esc(r.userName)}<br><small dir="ltr">${esc(r.email)}</small></td><td>${r.country === 'sa' ? 'السعودية' : 'مصر'}<br><small>${esc(r.method)}</small></td><td>${esc(r.sender)}<br><small dir="ltr">${esc(r.ref)}</small></td><td>${fmtDate(r.date)}</td>
      <td>${r.proof ? `<details><summary>عرض</summary><img class="proof" src="${esc(r.proof)}" alt="إثبات الدفع"></details>` : '—'}</td>
      <td>${r.status === 'pending' ? `<button class="btn sm primary" data-act="subOn" data-id="${r.userId}" data-m="1" data-req="${r.id}">تفعيل شهر</button> <button class="btn sm" data-act="subOn" data-id="${r.userId}" data-m="3" data-req="${r.id}">3 أشهر</button> <button class="btn sm ghost" data-act="reqNo" data-id="${r.id}">رفض</button>` : (r.status === 'approved' ? 'مُفعَّل' : 'مرفوض')}</td></tr>`).join('');
    const inp = (n, t, v, ltr) => `<label>${t}<input name="${n}" value="${esc(v || '')}" maxlength="120" ${ltr ? 'dir="ltr"' : ''}></label>`;
    const subsBlock = `<section class="card"><h2>طلبات الاشتراك ${pend.length ? `<span class="chip l2">${pend.length} بانتظار المراجعة</span>` : ''}</h2>
        ${reqRows ? `<div class="tw"><table><tr><th>المستخدم</th><th>البلد والطريقة</th><th>المحوِّل ورقم العملية</th><th>التاريخ</th><th>الإثبات</th><th></th></tr>${reqRows}</table></div>` : '<p class="muted">لا توجد طلبات.</p>'}</section>
      <section class="card"><details ${S.info ? 'open' : ''}><summary><b>بيانات الدفع التي تظهر للمشتركين</b></summary>${S.info ? `<p class="okmsg">${esc(S.info)}</p>` : ''}
        <form data-form="paysettings"><h3>مصر</h3><div class="two">${inp('eg_price', 'السعر', P.eg.price)}${inp('eg_vodafone', 'رقم فودافون كاش', P.eg.vodafone, 1)}</div><div class="two">${inp('eg_instapay', 'عنوان إنستا باي', P.eg.instapay, 1)}<label>صورة QR إنستا باي ${S.settings.qr_eg ? '(مرفوعة)' : ''}<input type="file" name="qr_eg" accept="image/*"></label></div>
        <h3>السعودية</h3><div class="two">${inp('sa_price', 'السعر', P.sa.price)}${inp('sa_bank', 'البنك', P.sa.bank)}</div><div class="two">${inp('sa_name', 'اسم صاحب الحساب', P.sa.name)}${inp('sa_account', 'رقم الحساب', P.sa.account, 1)}</div>
        <div class="two">${inp('sa_iban', 'الآيبان', P.sa.iban, 1)}${inp('sa_swift', 'سويفت', P.sa.swift, 1)}</div><label>صورة QR الحساب ${S.settings.qr_sa ? '(مرفوعة)' : ''}<input type="file" name="qr_sa" accept="image/*"></label>
        <button class="btn primary" type="submit">حفظ بيانات الدفع</button></form></details></section>`;
    const VS = S.visits, vmx = VS ? Math.max(1, ...VS.days.map(x => Math.max(x.v, x.o))) : 1, omx = VS ? Math.max(1, ...Object.values(VS.perScale)) : 1;
    const visitBlock = !VS ? '<section class="card"><h2>عداد الزيارات</h2><p class="muted">تعذر تحميل العداد.</p></section>' : `<section class="card"><h2>عداد الزيارات</h2>
      <div class="tiles">${tile(VS.visitors, 'زائر للمنصة')}${tile(VS.visits, 'إجمالي الزيارات')}${tile(VS.vToday, 'زيارات اليوم')}${tile(VS.v7, 'زيارات آخر 7 أيام')}${tile(VS.openers, 'شخص فتح مقياساً')}${tile(VS.opens, 'مرات فتح المقاييس')}${tile(VS.oToday, 'فتح مقياس اليوم')}${tile(A.results.length, 'مقياس مُنجز')}</div>
      <h3>آخر 14 يوماً</h3><div class="vchart">${VS.days.map(x => `<div class="vcol" title="${x.d}: ${x.v} زيارة، ${x.o} فتح مقياس"><div class="vbars"><i style="height:${Math.round(x.v / vmx * 100)}%"></i><i class="o" style="height:${Math.round(x.o / vmx * 100)}%"></i></div><small>${x.d.slice(8)}/${x.d.slice(5, 7)}</small></div>`).join('')}</div>
      <p class="vleg"><span><i></i> زيارات</span><span><i class="o"></i> فتح مقياس</span></p>
      <h3>المقاييس الأكثر فتحاً</h3>${Object.entries(VS.perScale).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `<div class="hbar"><span>${esc((SCALES.find(s => s.id === k) || { name: k }).name)}</span><i style="width:${Math.round(v / omx * 100)}%"></i><b>${v}</b></div>`).join('') || '<p class="muted">لم يُفتح أي مقياس بعد.</p>'}
      <p class="muted">الزيارة تُحسب مرة واحدة يومياً لكل متصفح، والزائر يُعرَّف برمز عشوائي على جهازه دون أي بيانات شخصية. زياراتك كمدير لا تُحسب.${VS.partial ? ' التفاصيل اليومية محسوبة من أحدث 5000 سجل.' : ''}</p></section>`;
    return shell(`<section class="card"><h1>لوحة الإدارة</h1>
      <div class="tiles">${tile(A.users.length, 'مستخدم')}${tile(SA.subs.filter(act).length, 'مشترك فعّال')}${tile(A.members.length, 'فرد أسرة')}${tile(A.results.length, 'مقياس مُنجز')}${tile(refer.length, 'نتيجة تحتاج مختصاً', 'warn')}${tile(urgent.length, 'تنبيه عاجل', 'danger')}</div></section>
      ${visitBlock}
      ${subsBlock}
      <section class="card"><h2>حالات تحتاج متابعة</h2>${cases ? `<div class="tw"><table><tr><th>الشخص</th><th>المقياس</th><th>الدرجة</th><th>المستوى</th><th>التاريخ</th><th></th></tr>${cases}</table></div>` : '<p class="muted">لا توجد حالات.</p>'}</section>
      <section class="card"><h2>المستخدمون</h2><input name="q" placeholder="بحث بالاسم أو البريد" value="${esc(S.q)}">
        <div class="tw"><table><tr><th>الاسم</th><th>البريد</th><th>العمر</th><th>الجنس</th><th>أفراد الأسرة</th><th>المقاييس</th><th>أعلى مستوى</th><th>الحالة</th><th>الاشتراك</th><th></th></tr>${users}</table></div></section>
      <section class="card"><h2>المقاييس الأكثر استخداماً</h2>${bars || '<p class="muted">لا توجد بيانات بعد.</p>'}
        <p><button class="btn" data-act="csv">تصدير كل النتائج CSV</button></p></section>`, { cls: 'wide' });
  },
  adminUser() {
    const A = S.admin, u = A.users.find(x => x.id === S.adminUser) || { name: '', email: '' };
    const all = A.results.filter(r => r.userId === S.adminUser);
    const persons = [{ id: '', name: u.name, rel: 'صاحب الحساب' }].concat(A.members.filter(m => m.ownerId === S.adminUser).map(m => ({ id: m.id, name: m.name, rel: m.relation + '، ' + ageOf(m) + ' سنة' })));
    const blocks = persons.map(p => { const rs = resultsOf(all, p.id);
      const rows = rs.map(r => `<li><div><b>${esc(r.scaleName)}</b><small>${fmtDate(r.date)} · ${fmtScore(r)} · ${esc(r.band)}</small></div>
        <span class="lvl l${r.level}"></span><button class="btn sm" data-act="open" data-id="${r.id}">التقرير</button><button class="btn sm ghost" data-act="adel" data-id="${r.id}">حذف</button></li>`).join('');
      return `<h3>${esc(p.name)} <small class="muted">(${esc(p.rel)})</small></h3>${rows ? `<p><button class="btn sm primary" data-act="acase" data-id="${p.id}">تقرير الإحالة</button> <button class="btn sm" data-act="asummary" data-id="${p.id}">ملخص مبسّط</button></p>${trends(rs)}<ul class="hist">${rows}</ul>` : '<p class="muted">لا توجد مقاييس.</p>'}`; }).join('');
    return shell(`<section class="card"><h1>${esc(u.name)}</h1><p class="muted" dir="ltr">${esc(u.email)}</p>${blocks}
      <h3>ملاحظات المتابعة</h3>
      <form data-form="note"><label>ملاحظة جديدة (يراها المدير فقط)<input name="text" required maxlength="900"></label><button class="btn" type="submit">إضافة</button></form>
      <ul class="hist">${(A.notes || []).filter(n => n.userId === S.adminUser).map(n => `<li><div>${esc(n.text)}<small>${fmtDate(n.date)} · ${esc(n.author)}</small></div><button class="btn sm ghost" data-act="ndel" data-id="${n.id}">حذف</button></li>`).join('') || '<li class="muted">لا توجد ملاحظات.</li>'}</ul>
      <p><button class="btn" data-act="admin">رجوع للوحة</button></p></section>`);
  }
};

V.subscribe = function () {
  const P = payInfo(), c = S.country, p = P[c], on = isSub(), last = S.myReqs[0];
  const kv = (t, v, ltr) => v ? `<div class="payrow"><span>${t}</span><b ${ltr ? 'dir="ltr"' : ''}>${esc(v)}</b></div>` : '';
  const qr = S.settings['qr_' + c] ? `<img class="qr" src="${esc(S.settings['qr_' + c])}" alt="رمز QR للدفع">` : '';
  const status = S.user.isAdmin ? '<div class="advice ok"><b>حساب المدير</b><p>كل المقاييس متاحة لك دون اشتراك.</p></div>'
    : on ? `<div class="advice ok"><b>اشتراكك مفعّل</b><p>سارٍ حتى ${fmtDate(S.sub.until)}. كل المقاييس متاحة لك دون حد.</p></div>`
    : last && last.status === 'pending' ? `<div class="advice mild"><b>طلبك قيد المراجعة</b><p>أُرسل في ${fmtDate(last.date)}. سيُفعَّل الاشتراك بعد تأكد الإدارة من التحويل.</p></div>`
    : last && last.status === 'rejected' ? '<div class="advice high"><b>لم يُقبل طلبك الأخير</b><p>تعذر التأكد من التحويل. راجع البيانات وأرسل الإثبات مرة أخرى.</p></div>'
    : `<div class="advice mild"><b>النسخة المجانية</b><p>بقي لك ${freeLeft()} من ${cfg.freeLimit} مقياس، وكل مقياس مرة واحدة.</p></div>`;
  const methods = c === 'eg' ? ['فودافون كاش', 'إنستا باي'] : ['تحويل إلى حساب الراجحي'];
  return shell(`<section class="card"><h1>💎 الاشتراك</h1>${S.info ? `<p class="okmsg">${esc(S.info)}</p>` : ''}${status}
    <div class="plan"><div><b>ما تحصل عليه</b><ul><li>جميع المقاييس (${SCALES.length}) لك ولأفراد أسرتك</li><li>إعادة القياس ومتابعة التطور بالرسوم</li><li>تقرير الإحالة للمختص وتقرير الأسرة</li></ul></div>
      <div class="price"><small>الاشتراك الشهري</small><b>${esc(p.price)}</b></div></div></section>
    ${S.user.isAdmin ? '' : `<section class="card"><h2>طريقة الدفع</h2>
    <div class="tabs"><button class="tab ${c === 'eg' ? 'on' : ''}" data-act="country" data-id="eg">🇪🇬 من مصر</button><button class="tab ${c === 'sa' ? 'on' : ''}" data-act="country" data-id="sa">🇸🇦 من السعودية</button></div>
    <div class="paybox"><div class="paylist">${c === 'eg' ? kv('فودافون كاش', p.vodafone, 1) + kv('إنستا باي', p.instapay, 1) + kv('المبلغ', p.price) : kv('البنك', p.bank) + kv('اسم صاحب الحساب', p.name) + kv('رقم الحساب', p.account, 1) + kv('الآيبان', p.iban, 1) + kv('سويفت', p.swift, 1) + kv('المبلغ', p.price)}
      ${c === 'sa' && !p.iban && !p.account && !qr ? '<p class="muted">بيانات الحساب ستُضاف قريباً. تواصل مع الإدارة.</p>' : ''}</div>${qr}</div>
    <h3>بعد التحويل: أرسل إثبات الدفع</h3>
    <form data-form="payreq"><div class="two"><label>طريقة الدفع<select name="method" required>${methods.map(m => `<option>${m}</option>`).join('')}</select></label>
      <label>اسم المحوِّل أو رقم جواله<input name="sender" required maxlength="90"></label></div>
      <label>رقم العملية (إن وُجد)<input name="ref" maxlength="150" dir="ltr"></label>
      <label>صورة إثبات التحويل<input name="proof" type="file" accept="image/*"></label>
      ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">إرسال الطلب</button></form>
    <p class="note">التفعيل يدوي من الإدارة بعد التأكد من التحويل، ومدته 30 يوماً من تاريخ التفعيل. الاشتراك مقابل استخدام المنصة وتقاريرها، ولا يتضمن تشخيصاً أو علاجاً.</p></section>`}`);
};
V.directory = () => shell(`<section class="card"><h1>اختبارات يطبقها المختص فقط</h1>
  <p>هذه الاختبارات غير متاحة على المنصة ولا على أي موقع موثوق، لثلاثة أسباب: حقوق نشرها محفوظة لناشريها وتُباع للمختصين المرخّصين فقط، وتُطبَّق فردياً وجهاً لوجه بأدوات ومواد خاصة ووقت محسوب، ونشر بنودها يفسد صلاحيتها لكل من يُختبر بها بعد ذلك.</p>
  <p class="ref">إذا أوصى تقرير الإحالة بأحدها، اطلبه من مركز نفسي مرخّص أو من وحدة الخدمات الإرشادية، واصطحب تقرير المنصة.</p>
  ${SPECIALIST_TESTS.map(g => `<h3>${g.g}</h3><div class="tw"><table class="res"><tr><th>الاختبار</th><th>العمر</th><th>ما يقيسه</th><th>متى يُطلب</th></tr>${g.items.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table></div>`).join('')}
  <p class="note">الأعمار والمكونات من أدلة النسخ الأصلية؛ النسخ العربية المقننة قد تختلف في المدى العمري والمعايير.</p>
  <p class="no-print"><button class="btn" data-act="home">رجوع</button></p></section>`, { cls: 'wide' });
V.intake = function () {
  const p = cur(), k = S.intakes[p.id] || { impact: {}, stress: [] }, kid = ageOf(p) < 18;
  const sel = (name, list, val) => `<select name="${name}"><option value="">اختر</option>${list.map(x => `<option ${val === x ? 'selected' : ''}>${x}</option>`).join('')}</select>`;
  return shell(`<section class="card"><h1>استمارة تاريخ الحالة</h1><p class="muted">${esc(p.self ? S.user.name : p.name)} · تُضاف هذه البيانات إلى تقرير الإحالة ليستفيد منها المختص. كل الحقول اختيارية.</p>
    <form data-form="intake" class="intake">
      <label>سبب طلب التقييم (الشكوى الرئيسية بكلماتك)<textarea name="complaint" rows="3" maxlength="800">${esc(k.complaint || '')}</textarea></label>
      <div class="two"><label>منذ متى؟${sel('duration', INTAKE.duration, k.duration)}</label><label>كيف بدأت؟${sel('onset', INTAKE.onset, k.onset)}</label></div>
      <fieldset><legend>إلى أي درجة تأثرت الجوانب التالية؟</legend>${INTAKE.impact.map(([key, name]) => `<div class="imp"><span>${name}</span><span class="seg">${INTAKE.impactLv.map((t, i) => `<label><input type="radio" name="imp_${key}" value="${i}" ${(k.impact[key] || 0) === i ? 'checked' : ''}><i>${t}</i></label>`).join('')}</span></div>`).join('')}</fieldset>
      <fieldset><legend>ضغوط حالية</legend><div class="chk">${INTAKE.stress.map(t => `<label><input type="checkbox" name="stress" value="${t}" ${(k.stress || []).includes(t) ? 'checked' : ''}><i>${t}</i></label>`).join('')}</div></fieldset>
      <div class="two"><label>مراجعة نفسية سابقة؟${sel('prev', INTAKE.yn.slice(0, 2), k.prev)}</label><label>تاريخ أسري لاضطرابات نفسية؟${sel('famhx', INTAKE.yn, k.famhx)}</label></div>
      <label>تفاصيل المراجعة السابقة أو التشخيص إن وُجد<input name="prevNote" maxlength="300" value="${esc(k.prevNote || '')}"></label>
      <div class="two"><label>أدوية حالية<input name="meds" maxlength="300" value="${esc(k.meds || '')}"></label><label>أمراض مزمنة أو حالات صحية<input name="medical" maxlength="300" value="${esc(k.medical || '')}"></label></div>
      ${kid ? `<label>الأداء الدراسي حالياً${sel('school', ['ممتاز', 'جيد', 'متوسط', 'متراجع عن السابق'], k.school)}</label>` : ''}
      <label>ملاحظات أخرى<textarea name="notes" rows="2" maxlength="600">${esc(k.notes || '')}</textarea></label>
      ${S.msg ? `<p class="err">${esc(S.msg)}</p>` : ''}<button class="btn primary" type="submit">حفظ</button> <button class="btn" type="button" data-act="history">رجوع</button></form></section>`);
};
V.caseReport = function () {
  const c = S.kase, groups = byScale(c.results), last = groups.map(l => l[l.length - 1]).sort((a, b) => b.level - a.level);
  const top = last.length ? Math.max(...last.map(r => r.level)) : 0, urgent = last.some(r => r.urgent), k = c.intake;
  const sc = id => SCALES.find(x => x.id === id), ref = referralLevel(top, urgent);
  const elevated = last.filter(r => r.level >= 1 && !sc(r.scaleId).positive), strengths = last.filter(r => sc(r.scaleId).positive);
  const domains = last.filter(r => r.level >= 1).map(r => sc(r.scaleId).domain);
  const tools = last.map(r => { const s = sc(r.scaleId), v = validity(s, r);
    return `<tr><td><b>${esc(s.formal)}</b></td><td>${s.respondent === 'parent' ? 'ولي الأمر' : 'ذاتي'}</td><td>${fmtDate(r.date)}</td><td class="num2">${Number.isInteger(r.total) ? r.total : r.total.toFixed(2)} / ${r.max}</td><td>${esc((CLIN[s.id] || {}).cut || '—')}</td><td><span class="chip l${r.level}">${esc(r.band.length > 34 ? LV[r.level] : r.band)}</span></td><td class="${v.ok ? '' : 'warn'}">${v.text}</td></tr>`; }).join('');
  const detail = elevated.map(r => { const s = sc(r.scaleId), ti = topItems(s, r), cl = CLIN[s.id] || {};
    const subs = r.subs.length ? `<table class="mini"><tr><th>البُعد الفرعي</th><th>الدرجة</th><th>التصنيف</th></tr>${r.subs.map(x => `<tr><td>${esc(x.name)}</td><td>${x.score}</td><td>${esc(x.label || '—')}</td></tr>`).join('')}</table>` : '';
    const l = byScale(c.results).find(g => g[0].scaleId === r.scaleId);
    return `<div class="cblock"><h4>${esc(s.formal)} <span class="chip l${r.level}">${fmtScore(r)}</span></h4>${subs}
      ${ti.length ? `<p class="lbl">البنود الأعلى استجابة (${ti.length} من ${s.items.length}):</p><ul class="items">${ti.map(x => `<li><span class="fn">${x.n}</span>${esc(x.t)} <em>${esc(x.a)}</em></li>`).join('')}</ul>` : '<p class="muted">لا توجد بنود في النصف الأعلى من المدى.</p>'}
      ${l.length > 1 ? `<p class="lbl">القياسات المتكررة: ${l.map(x => x.total).join(' ← ')} ${spark(l)}</p>` : ''}
      <p class="psy">${esc(cl.psy || '')}</p></div>`; }).join('');
  const dx = [...new Set(elevated.filter(r => r.level >= 2).flatMap(r => (CLIN[r.scaleId] || {}).dx || []))];
  const more = [...new Set(elevated.filter(r => r.level >= 2).flatMap(r => (CLIN[r.scaleId] || {}).more || []))];
  const impact = k ? INTAKE.impact.filter(([key]) => (k.impact[key] || 0) > 0).map(([key, name]) => `${name}: ${INTAKE.impactLv[k.impact[key]]}`) : [];
  const imp = [];
  if (!last.length) imp.push('لم تُطبَّق مقاييس بعد.');
  else {
    if (elevated.filter(r => r.level >= 2).length) imp.push('تشير نتائج الفرز إلى مؤشرات مرتفعة في: ' + elevated.filter(r => r.level >= 2).map(r => esc(sc(r.scaleId).measures) + ' (' + esc(r.band.length > 34 ? LV[r.level] : r.band) + ')').join('، ') + '.');
    if (elevated.filter(r => r.level === 1).length) imp.push('مؤشرات خفيفة في: ' + elevated.filter(r => r.level === 1).map(r => esc(sc(r.scaleId).measures)).join('، ') + '.');
    if (!elevated.length) imp.push('لم تظهر مؤشرات مرتفعة في المقاييس المطبقة.');
    if (k && impact.length) imp.push('يذكر المفحوص أو ولي أمره تأثراً وظيفياً في: ' + impact.map(esc).join('، ') + '.');
    if (k && k.duration) imp.push('مدة الشكوى: ' + esc(k.duration) + (k.onset ? '، وبدايتها ' + esc(k.onset) : '') + '.');
    const low = strengths.filter(r => r.level >= 1), ok = strengths.filter(r => r.level === 0);
    if (ok.length) imp.push('عوامل وقائية ظاهرة: ' + ok.map(r => esc(sc(r.scaleId).measures)).join('، ') + '.');
    if (low.length) imp.push('عوامل وقائية منخفضة: ' + low.map(r => esc(sc(r.scaleId).measures)).join('، ') + '.');
    if (last.some(r => !validity(sc(r.scaleId), r).ok)) imp.push('توجد ملاحظة على صلاحية الاستجابة في مقياس واحد على الأقل، فتُفسَّر نتيجته بحذر.');
  }
  const row = (t, v) => v ? `<tr><th>${t}</th><td>${v}</td></tr>` : '';
  return shell(`<section class="card rep clin">
    <div class="chead"><div>${LOGO}<div><b>${esc(cfg.appName)}</b><small>منصة الفرز النفسي الأولي</small></div></div><div class="cmeta"><span class="conf">سري — للمختص المعالج</span><span>رقم الحالة: <b dir="ltr">MQ-${esc(String(c.id).slice(-6).toUpperCase())}</b></span><span>تاريخ التقرير: <b>${fmtDate(new Date())}</b></span></div></div>
    <h1>تقرير الفرز النفسي الأولي والإحالة</h1>
    <h3>1. البيانات التعريفية</h3><table class="kv">${row('الاسم', esc(c.name))}${row('العمر', c.age ? c.age + ' سنة' : '')}${row('الجنس', c.gender === 'f' ? 'أنثى' : c.gender === 'm' ? 'ذكر' : '')}${row('الصفة', esc(c.relation))}${row('عدد المقاييس المطبقة', String(last.length))}</table>
    <h3>2. سبب التقييم وتاريخ الحالة</h3>${k ? `<table class="kv">${row('الشكوى الرئيسية', esc(k.complaint))}${row('المدة', esc(k.duration))}${row('البداية', esc(k.onset))}${row('التأثر الوظيفي', impact.map(esc).join(' · '))}${row('ضغوط حالية', (k.stress || []).map(esc).join(' · '))}${row('مراجعة نفسية سابقة', esc(k.prev) + (k.prevNote ? ' — ' + esc(k.prevNote) : ''))}${row('أدوية حالية', esc(k.meds))}${row('حالات صحية', esc(k.medical))}${row('تاريخ أسري نفسي', esc(k.famhx))}${row('الأداء الدراسي', esc(k.school))}${row('ملاحظات', esc(k.notes))}</table><p class="note">البيانات أعلاه كما أدخلها المفحوص أو ولي أمره، ولم يتحقق منها مختص.</p>` : '<p class="muted">لم تُعبَّأ استمارة تاريخ الحالة.</p>'}
    <h3>3. الأدوات المطبقة والنتائج</h3>${tools ? `<div class="tw"><table class="res"><tr><th>الأداة</th><th>المجيب</th><th>التاريخ</th><th>الدرجة</th><th>الحد الفاصل</th><th>التصنيف</th><th>صلاحية الاستجابة</th></tr>${tools}</table></div>` : '<p class="muted">لا توجد نتائج.</p>'}
    ${detail ? `<h3>4. التحليل التفصيلي للمقاييس المرتفعة</h3>${detail}` : ''}
    <h3>5. مؤشرات الخطورة</h3>${urgent ? `<div class="urgent"><b>مؤشر خطورة إيجابي</b><p>أجاب المفحوص بغير "أبداً" على بند أفكار إيذاء النفس. يلزم تقييم خطورة مباشر من مختص. ${esc(cfg.urgentHelp)}</p></div>` : '<p>لم يُسجَّل مؤشر خطورة في بنود إيذاء النفس ضمن المقاييس المطبقة. غياب المؤشر في الفرز لا ينفي الخطورة.</p>'}
    <h3>6. الانطباع الأولي (نتيجة فرز لا تشخيص)</h3><ul>${imp.map(t => `<li>${t}</li>`).join('')}</ul>
    ${dx.length ? `<h3>7. مجالات يُقترح تقييمها تشخيصياً</h3><p class="muted">تُذكر لتوجيه المقابلة الإكلينيكية، ولا تعني ثبوت أي منها.</p><ul class="cols">${dx.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
    <h3>8. التوصيات</h3><div class="refbox ${ref.cls}"><b>${ref.title}</b><span>${ref.text}</span></div>
      ${top >= 2 || urgent ? `<p><b>المختص المقترح:</b> ${specialistFor(c.age || 30, top, urgent, domains).join('، ')}.</p>` : ''}
      ${more.length ? `<p class="lbl">تقييمات إضافية مقترحة:</p><ul>${more.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
    <h3>9. حدود التقرير</h3><ul class="small"><li>أدوات فرز بالتقرير الذاتي أو تقرير ولي الأمر، طُبقت إلكترونياً دون إشراف مختص.</li><li>الصياغة العربية للبنود في المنصة ترجمة عمل لم تُقنَّن بعد، فلا تنطبق عليها تماماً بيانات الصدق والثبات المذكورة للنسخ الأصلية والعربية المنشورة.</li><li>الحدود الفاصلة من الأدلة الأصلية أو من دراسات محددة العينة، وقد لا تناسب كل فئة.</li><li>التقرير لا يشخّص ولا يصف علاجاً؛ التشخيص يتطلب مقابلة إكلينيكية.</li></ul>
    <div class="clinbox"><h3>خاص بالمختص</h3><p>الانطباع التشخيصي: <span class="line"></span></p><p>الخطة: <span class="line"></span></p><p class="sig"><span>اسم المختص وتوقيعه: <span class="line s"></span></span><span>التاريخ: <span class="line s"></span></span></p></div>
  </section><p class="center no-print"><button class="btn primary" data-act="print">طباعة / حفظ PDF</button> <button class="btn" data-act="${c.admin ? 'adminUser' : 'history'}" ${c.admin ? `data-id="${esc(S.adminUser)}"` : ''}>رجوع</button></p>`, { cls: 'report' });
};

// ---------- مكونات التقارير ----------
function spark(list) {
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
function reportBody(r, s, name) {
  const adv = ADVICE[r.level], plan = buildPlan(s, r);
  const pct = Math.max(3, Math.min(100, Math.round((r.total / r.max) * 100)));
  const subs = r.subs.length ? `<h3>الأبعاد الفرعية</h3><table><tr><th>البُعد</th><th>الدرجة</th><th>التصنيف</th></tr>
    ${r.subs.map(x => `<tr><td>${esc(x.name)}</td><td>${x.score}</td><td>${esc(x.label || '—')}</td></tr>`).join('')}</table>` : '';
  return `<section class="card rep">
    <h1>تقرير ${esc(s.name)}</h1><p class="muted">${esc(s.formal)}</p>
    <div class="who"><span>الاسم: <b>${esc(name)}</b></span><span>العمر: <b>${r.age}</b></span><span>الجنس: <b>${r.gender === 'f' ? 'أنثى' : 'ذكر'}</b></span><span>التاريخ: <b>${fmtDate(r.date)}</b></span></div>
    ${r.urgent ? `<div class="urgent"><b>تنبيه مهم</b><p>${esc(cfg.urgentHelp)}</p></div>` : ''}
    <div class="score"><div class="ring r${r.level}" style="--p:${pct}"><div class="num">${Number.isInteger(r.total) ? r.total : r.total.toFixed(1)}<small>من ${r.max}</small></div></div><div class="band l${r.level}">${esc(r.band)}</div></div>
    <div class="advice ${adv.tone}"><b>${adv.title}</b><p>${adv.text}</p></div>
    ${subs}
    <h3>خطة الدعم المقترحة</h3><p><b>الهدف:</b> ${plan.goal}</p>
    <ol>${plan.steps.map(x => `<li>${x}</li>`).join('')}</ol>
    <h3>عادات يومية مساندة</h3><ul>${plan.habits.map(x => `<li>${x}</li>`).join('')}</ul>
    <p class="ref"><b>${plan.referral}</b></p>
    <p class="note">هذه خطة دعم ذاتي وإرشادي عامة وليست خطة علاج؛ الخطة العلاجية يضعها الأخصائي بعد المقابلة. النتيجة مؤشر فرز أولي وليست تشخيصاً. المصدر: ${esc(s.source)}</p></section>`;
}
function familyBody() {
  const ppl = people().map(p => { const last = byScale(resultsOf(S.results, p.id)).map(l => l[l.length - 1]);
    return { p, last, top: last.length ? Math.max(...last.map(r => r.level)) : -1, urgent: last.some(r => r.urgent) }; });
  const f = buildFamilyAdvice(ppl.map(x => ({ name: x.p.self ? S.user.name : x.p.name, age: ageOf(x.p), self: !!x.p.self, top: x.top, urgent: x.urgent,
    domains: x.last.filter(r => r.level >= 1).map(r => (SCALES.find(s => s.id === r.scaleId) || {}).domain) })));
  const rows = ppl.map(x => `<tr><td>${esc(x.p.self ? S.user.name : x.p.name)}</td><td>${esc(x.p.relation)}</td><td>${ageOf(x.p)}</td><td>${x.last.length}</td>
    <td>${x.top < 0 ? '<span class="muted">لم يُقَس</span>' : `<span class="chip l${x.top}">${LV[x.top]}${x.urgent ? ' · عاجل' : ''}</span>`}</td>
    <td>${x.last.filter(r => r.level >= 1).map(r => esc(r.scaleName) + ': ' + esc(r.band.length > 40 ? LV[r.level] : r.band)).join('<br>') || (x.top < 0 ? '—' : 'لا مؤشرات')}</td></tr>`).join('');
  const dots = ppl.map(x => `<div class="fam"><span class="av l${Math.max(0, x.top)} ${x.top < 0 ? 'none' : ''}">${x.p.self ? '🙂' : ageOf(x.p) <= 12 ? '🧒' : ageOf(x.p) <= 17 ? '🧑' : x.p.gender === 'f' ? '👩' : '👨'}</span><b>${esc(x.p.self ? 'أنا' : x.p.name)}</b></div>`).join('');
  return `<section class="card rep"><h1>تقرير الحالة النفسية للأسرة</h1>
    <div class="who"><span>رب الأسرة: <b>${esc(S.user.name)}</b></span><span>عدد الأفراد: <b>${ppl.length}</b></span><span>التاريخ: <b>${fmtDate(new Date())}</b></span></div>
    ${ppl.some(x => x.urgent) ? `<div class="urgent"><b>تنبيه مهم</b><p>${esc(cfg.urgentHelp)}</p></div>` : ''}
    <div class="fams">${dots}</div>
    <div class="advice ${f.tone}"><b>${f.title}</b><p>${f.text}</p></div>
    <h3>حالة كل فرد (آخر نتيجة في كل مقياس)</h3><div class="tw"><table><tr><th>الفرد</th><th>الصلة</th><th>العمر</th><th>المقاييس</th><th>أعلى مستوى</th><th>أبرز ما ظهر</th></tr>${rows}</table></div>
    <h3>نصائح لرب الأسرة</h3><ol>${f.tips.map(t => `<li>${t}</li>`).join('')}</ol>
    <h3>عادات أسرية مساندة</h3><ul>${f.habits.map(t => `<li>${t}</li>`).join('')}</ul>
    <p class="note">هذا التقرير يجمع نتائج فرز أولي ولا يشخّص أحداً، ولا يصف "حالة الأسرة" تشخيصاً. الفرد الذي لم يُجرِ مقياساً لا يُعرف وضعه. القرار العلاجي للمختص بعد المقابلة.</p></section>`;
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
async function loadData() {
  const [m, r, k] = await Promise.all([Store.listMembers(S.user).catch(() => []), Store.listResults(S.user).catch(() => []), Store.listIntakes(S.user).catch(() => ({}))]);
  S.members = m; S.results = r; S.intakes = k;
  const [sub, st, rq] = await Promise.all([Store.getSub(S.user).catch(() => null), Store.getSettings().catch(() => ({})), Store.myPayReqs(S.user).catch(() => [])]);
  S.sub = sub; S.settings = st; S.myReqs = rq;
}
async function afterLogin(u) {
  S.user = u; S.personId = '';
  if (!u.profile || !u.profile.birthYear) return go('profile');
  if (Store.live) Store.saveProfile(u, u.profile).catch(() => {});
  await loadData(); go('home');
}
root.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f).entries());
  try {
    if (f.dataset.form === 'auth') {
      await afterLogin(S.authTab === 'signup' ? await Store.signup(d.email, d.password, d.name) : await Store.login(d.email, d.password));
    } else if (f.dataset.form === 'forgot') {
      await Store.recover(d.email); S.info = 'إن كان البريد مسجلاً فستصلك رسالة فيها رابط الاستعادة خلال دقائق.'; S.authTab = 'login'; go('auth', true);
    } else if (f.dataset.form === 'reset') {
      await Store.resetPassword(S.recovery.userId, S.recovery.secret, d.password);
      S.recovery = null; S.info = 'تم تغيير كلمة المرور. سجّل الدخول الآن.'; go('auth', true);
    } else if (f.dataset.form === 'note') {
      const n = await Store.addNote(S.adminUser, d.text, S.user.name); (S.admin.notes = S.admin.notes || []).unshift(n); render();
    } else if (f.dataset.form === 'intake') {
      const fd = new FormData(f), data = { complaint: d.complaint || '', duration: d.duration || '', onset: d.onset || '', impact: {}, stress: fd.getAll('stress'),
        prev: d.prev || '', prevNote: d.prevNote || '', meds: d.meds || '', medical: d.medical || '', famhx: d.famhx || '', school: d.school || '', notes: d.notes || '', date: new Date().toISOString() };
      INTAKE.impact.forEach(([k]) => { data.impact[k] = Number(d['imp_' + k] || 0); });
      await Store.saveIntake(S.user, cur().id, data); S.intakes[cur().id] = data; go('history');
    } else if (f.dataset.form === 'payreq') {
      const proof = await fileToDataUrl(f.querySelector('[name=proof]').files[0], 1000);
      if (!d.ref.trim() && !proof) { S.msg = 'أدخل رقم العملية أو أرفق صورة إثبات التحويل.'; return render(); }
      await Store.createPayReq(S.user, { country: S.country, method: d.method, ref: d.ref.trim(), sender: d.sender.trim(), proof });
      S.myReqs = await Store.myPayReqs(S.user).catch(() => S.myReqs); S.info = 'تم إرسال طلبك. سيُفعَّل الاشتراك بعد مراجعة الإدارة لإثبات الدفع.'; go('subscribe', true);
    } else if (f.dataset.form === 'paysettings') {
      const pay = { eg: { price: d.eg_price, vodafone: d.eg_vodafone, instapay: d.eg_instapay }, sa: { price: d.sa_price, bank: d.sa_bank, name: d.sa_name, account: d.sa_account, iban: d.sa_iban, swift: d.sa_swift } };
      await Store.saveSetting('pay', JSON.stringify(pay)); S.settings.pay = JSON.stringify(pay);
      for (const k of ['qr_eg', 'qr_sa']) { const u = await fileToDataUrl(f.querySelector('[name=' + k + ']').files[0], 600); if (u) { await Store.saveSetting(k, u); S.settings[k] = u; } }
      S.info = 'تم حفظ بيانات الدفع.'; render();
    } else if (f.dataset.form === 'member') {
      S.members.push(await Store.addMember(S.user, { name: d.name.trim(), relation: d.relation, birthYear: Number(d.birthYear), gender: d.gender })); go('family');
    } else if (f.dataset.form === 'profile') {
      if (YEAR - Number(d.birthYear) < 18 && !d.consent) { S.msg = 'يلزم علم ولي الأمر وموافقته لمن هم دون 18 سنة.'; return render(); }
      S.user = await Store.saveProfile(S.user, { birthYear: Number(d.birthYear), gender: d.gender, consent: !!d.consent });
      await loadData(); go('home');
    }
  } catch (err) { S.msg = errText(err); render(); }
});
root.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  try {
    if (act === 'tab') { S.authTab = S.authTab === 'login' ? 'signup' : 'login'; go('auth'); }
    else if (act === 'forgot') go('forgot');
    else if (act === 'toAuth') go('auth');
    else if (act === 'privacy') go('privacy');
    else if (act === 'home') { S.parentView = false; S.fromAdmin = false; S.scale = null; go('home'); }
    else if (act === 'editProfile') go('profile');
    else if (act === 'logout') { await Store.logout(); S.user = null; S.members = []; S.results = []; S.scale = null; go('auth'); }
    else if (act === 'person') { S.cat = 'all'; S.sq = ''; S.personId = id; S.scale = null; S.fromAdmin = false; go('home'); }
    else if (act === 'hperson') { S.personId = id; render(); }
    else if (act === 'family') { S.scale = null; go('family'); }
    else if (act === 'familyReport') go('familyReport');
    else if (act === 'mdel') { await Store.deleteMember(id); S.members = S.members.filter(m => m.id !== id); if (S.personId === id) S.personId = ''; render(); }
    else if (act === 'directory') go('directory');
    else if (act === 'cat') { S.cat = id; render(); }
    else if (act === 'intro') { const sc = SCALES.find(s => s.id === id), why = lockReason(sc, cur()); if (why) { S.info = why; return go('subscribe', true); } S.scale = sc; if (!S.user.isAdmin) Store.track('open', sc.id); go('intro'); }
    else if (act === 'subscribe') { S.scale = null; if (Store.live) S.myReqs = await Store.myPayReqs(S.user).catch(() => S.myReqs); go('subscribe'); }
    else if (act === 'country') { S.country = id; render(); }
    else if (act === 'subOn') { const cur0 = (S.subAdmin.subs.find(x => x.userId === id) || {}).until, until = await Store.activate(id, Number(b.dataset.m || 1), cur0);
      S.subAdmin.subs = S.subAdmin.subs.filter(x => x.userId !== id).concat([{ userId: id, until }]);
      if (b.dataset.req) { await Store.setReqStatus(b.dataset.req, 'approved'); S.subAdmin.reqs.find(x => x.id === b.dataset.req).status = 'approved'; } render(); }
    else if (act === 'subOff') { await Store.cancelSub(id); S.subAdmin.subs = S.subAdmin.subs.filter(x => x.userId !== id); render(); }
    else if (act === 'reqNo') { await Store.setReqStatus(id, 'rejected'); S.subAdmin.reqs.find(x => x.id === id).status = 'rejected'; render(); }
    else if (act === 'start') { Store.progress.clear(); S.idx = 0; S.answers = []; S.t0 = Date.now(); go('question'); }
    else if (act === 'pick') {
      const i = Number(b.dataset.i), k = Number(b.dataset.k); S.answers[i] = k;
      const row = b.closest('.frow'); row.classList.add('ans'); row.classList.remove('miss'); row.querySelectorAll('.fo').forEach(x => x.classList.toggle('sel', x === b));
      const n = S.scale.items.length, done = S.scale.items.filter((_, j) => S.answers[j] != null).length;
      root.querySelector('#fbar').style.width = Math.round(done / n * 100) + '%'; root.querySelector('#fcount').textContent = done + ' / ' + n;
      Store.progress.set({ userId: S.user.id, scaleId: S.scale.id + '|' + cur().id, idx: 0, answers: S.answers });
    }
    else if (act === 'submitForm') {
      const miss = S.scale.items.map((_, j) => j).filter(j => S.answers[j] == null);
      if (miss.length) { miss.forEach(j => root.querySelector('#q' + j).classList.add('miss')); root.querySelector('#q' + miss[0]).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      Store.progress.clear(); await finish();
    }
    else if (act === 'intake') go('intake');
    else if (act === 'case') { const p = cur(); S.kase = { name: p.self ? S.user.name : p.name, age: ageOf(p), gender: p.gender, relation: p.self ? 'صاحب الحساب' : p.relation, id: p.id || S.user.id, results: resultsOf(S.results, p.id), intake: S.intakes[p.id], admin: false }; go('caseReport'); }
    else if (act === 'acase') { const A = S.admin, u = A.users.find(x => x.id === S.adminUser) || {}, m = A.members.find(x => x.id === id), rs = resultsOf(A.results.filter(r => r.userId === S.adminUser), id || ''), k = A.intakes.find(x => x.ownerId === S.adminUser && x.memberId === (id || ''));
      S.kase = { name: m ? m.name : u.name, age: m ? ageOf(m) : (u.birthYear ? YEAR - u.birthYear : (rs[0] || {}).age), gender: m ? m.gender : u.gender, relation: m ? m.relation : 'صاحب الحساب', id: id || S.adminUser, results: rs, intake: k && k.data, admin: true }; go('caseReport'); }
    else if (act === 'resume') { S.t0 = null; const p = Store.progress.get(S.user.id, S.scale.id + '|' + cur().id); S.answers = p.answers; S.idx = Math.min(p.idx, S.scale.items.length - 1); go('question'); }
    else if (act === 'back') { if (S.idx === 0) { S.scale = null; go('home'); } else { S.idx--; render(); } }
    else if (act === 'answer') {
      S.answers[S.idx] = Number(b.dataset.k);
      if (S.idx < S.scale.items.length - 1) { S.idx++; Store.progress.set({ userId: S.user.id, scaleId: S.scale.id + '|' + cur().id, idx: S.idx, answers: S.answers }); render(); }
      else { Store.progress.clear(); await finish(); }
    }
    else if (act === 'parent') { S.parentView = true; render(); }
    else if (act === 'print') { try { window.print(); } catch (x) { /* غير متاح في المعاينة */ } }
    else if (act === 'history') { S.results = await Store.listResults(S.user); S.fromAdmin = false; S.scale = null; go('history'); }
    else if (act === 'summary') { const p = cur(); S.sum = { name: p.self ? S.user.name : p.name, results: resultsOf(S.results, p.id), admin: false }; go('summary'); }
    else if (act === 'open') { S.result = (S.fromAdmin ? S.admin.results : S.results).find(r => r.id === id); S.scale = SCALES.find(s => s.id === S.result.scaleId); S.parentView = true; go('result'); }
    else if (act === 'del') { await Store.deleteResult(id); S.results = S.results.filter(r => r.id !== id); render(); }
    else if (act === 'admin') { S.admin = await Store.adminData(); S.subAdmin = await Store.adminSubs().catch(() => ({ reqs: [], subs: [] })); S.settings = await Store.getSettings().catch(() => S.settings); S.visits = await Store.visitStats().catch(() => null); S.fromAdmin = true; S.scale = null; go('admin'); }
    else if (act === 'adminUser') { S.adminUser = id; go('adminUser'); }
    else if (act === 'asummary') { const u = S.admin.users.find(x => x.id === S.adminUser), m = S.admin.members.find(x => x.id === id);
      S.sum = { name: m ? m.name : (u ? u.name : ''), results: resultsOf(S.admin.results.filter(r => r.userId === S.adminUser), id || ''), admin: true }; go('summary'); }
    else if (act === 'block') { await Store.block(id); S.admin.blocked.push(id); render(); }
    else if (act === 'unblock') { await Store.unblock(id); S.admin.blocked = S.admin.blocked.filter(x => x !== id); render(); }
    else if (act === 'adel') { await Store.deleteResult(id); S.admin.results = S.admin.results.filter(r => r.id !== id); render(); }
    else if (act === 'ndel') { await Store.deleteNote(id); S.admin.notes = S.admin.notes.filter(n => n.id !== id); render(); }
    else if (act === 'csv') exportCsv();
  } catch (err) { S.msg = errText(err); render(); }
});
root.addEventListener('input', e => {
  const nm = e.target.name; if (nm !== 'q' && nm !== 'sq') return;
  S[nm] = e.target.value; const pos = e.target.selectionStart; render();
  const i = root.querySelector('[name=' + nm + ']'); if (i) { i.focus(); i.setSelectionRange(pos, pos); }
});
async function finish() {
  const person = cur(), sc = scoreScale(S.scale, S.answers, person.gender);
  const r = Object.assign(sc, { scaleId: S.scale.id, scaleName: S.scale.name, answers: S.answers.slice(), age: ageOf(person), gender: person.gender,
    memberId: person.id, memberName: person.self ? '' : person.name, userName: S.user.name, secs: S.t0 ? Math.round((Date.now() - S.t0) / 1000) : 0, date: new Date().toISOString() });
  try { S.result = await Store.saveResult(S.user, r); }
  catch (err) {
    if (err.message === 'LIMIT' || err.message === 'REPEAT') { S.results = await Store.listResults(S.user).catch(() => S.results); S.scale = null;
      S.info = err.message === 'REPEAT' ? 'في النسخة المجانية يُجرى كل مقياس مرة واحدة. اشترك لإعادة القياس ومتابعة التطور.' : 'استخدمت المقاييس المجانية (' + cfg.freeLimit + '). اشترك لاستخدام جميع المقاييس دون حد.'; return go('subscribe', true); }
    S.msg = 'لم تُحفظ النتيجة. تحقق من الاتصال ثم اضغط إنهاء مرة أخرى. ' + (err.message || ''); S.idx = Math.max(0, S.scale.items.length - 1); return go('question', true);
  }
  S.results.unshift(S.result); S.parentView = false; go('result');
}
function exportCsv() {
  const cell = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const rows = [['صاحب الحساب', 'البريد', 'الفرد', 'العمر', 'الجنس', 'المقياس', 'الدرجة', 'من', 'التصنيف', 'المستوى', 'عاجل', 'التاريخ']];
  const mail = Object.fromEntries(S.admin.users.map(u => [u.id, u.email]));
  S.admin.results.forEach(r => rows.push([r.userName, mail[r.userId] || '', r.memberName || 'نفسه', r.age, r.gender === 'f' ? 'أنثى' : 'ذكر', r.scaleName, r.total, r.max, r.band, r.level, r.urgent ? 'نعم' : '', r.date.slice(0, 10)]));
  const blob = new Blob(['﻿' + rows.map(x => x.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'meqyasi-results.csv'; a.click();
}

(async function init() {
  const qs = new URLSearchParams(location.search);
  if (qs.get('userId') && qs.get('secret')) {
    S.recovery = { userId: qs.get('userId'), secret: qs.get('secret') };
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* لا شيء */ }
    return go('reset');
  }
  try { const u = await Store.me(); if (!u || !u.isAdmin) Store.track('visit'); if (u) await afterLogin(u); else render(); }
  catch (err) { S.msg = errText(err); render(); }
})();
