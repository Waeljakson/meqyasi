// دالة Appwrite: تحفظ نتيجة المقياس بعد التحقق من الاشتراك والحد المجاني.
// الجدول results لا يقبل الإنشاء من المتصفح؛ الإنشاء يتم من هنا فقط.
const DB = '6af61245000ab2cb25cb', RESULTS = 'results', SUBS = 'subs', FREE_LIMIT = 2;
const FIELDS = { scaleId: 's', scaleName: 's', total: 'n', max: 'n', band: 's', level: 'n', urgent: 'b', subs: 's', answers: 's', age: 'n', gender: 's', memberId: 's', memberName: 's', userName: 's', secs: 'n' };

module.exports = async ({ req, res, error }) => {
  const uid = req.headers['x-appwrite-user-id'];
  if (!uid) return res.json({ error: 'AUTH' }, 401);
  const base = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const headers = { 'content-type': 'application/json', 'x-appwrite-project': process.env.APPWRITE_FUNCTION_PROJECT_ID, 'x-appwrite-key': req.headers['x-appwrite-key'] };
  const api = async (method, path, body) => {
    const r = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, data: await r.json().catch(() => ({})) };
  };
  try {
    let d = req.body; if (typeof d === 'string') d = JSON.parse(d || '{}');
    const row = { userId: uid };
    for (const k in FIELDS) {
      const v = d[k], t = FIELDS[k];
      if (t === 'n') row[k] = Number.isFinite(Number(v)) ? Number(v) : 0;
      else if (t === 'b') row[k] = !!v;
      else row[k] = String(v == null ? '' : v).slice(0, k === 'subs' ? 3000 : k === 'answers' ? 1000 : 300);
    }
    if (!row.scaleId || !row.scaleName) return res.json({ error: 'BAD' }, 400);
    row.level = Math.max(0, Math.min(3, Math.round(row.level))); row.age = Math.round(row.age); row.secs = Math.round(row.secs);

    const u = await api('GET', '/users/' + uid);
    if (u.status !== 200) return res.json({ error: 'AUTH' }, 401);
    let full = (u.data.labels || []).includes('admin');
    if (!full) { const s = await api('GET', `/tablesdb/${DB}/tables/${SUBS}/rows/${uid}`); full = s.status === 200 && new Date(s.data.until) > new Date(); }
    if (!full) {
      const q = [JSON.stringify({ method: 'equal', attribute: 'userId', values: [uid] }), JSON.stringify({ method: 'limit', values: [100] })];
      const list = await api('GET', `/tablesdb/${DB}/tables/${RESULTS}/rows?` + q.map(x => 'queries[]=' + encodeURIComponent(x)).join('&'));
      if (list.status !== 200) throw new Error('list ' + list.status + ' ' + (list.data.message || ''));
      const rows = list.data.rows || [];
      if (rows.some(r => r.scaleId === row.scaleId && (r.memberId || '') === row.memberId)) return res.json({ error: 'REPEAT' }, 402);
      if ((list.data.total || rows.length) >= FREE_LIMIT) return res.json({ error: 'LIMIT' }, 402);
    }
    const perms = [`read("user:${uid}")`]; if (full) perms.push(`delete("user:${uid}")`);
    const c = await api('POST', `/tablesdb/${DB}/tables/${RESULTS}/rows`, { rowId: 'unique()', data: row, permissions: perms });
    if (c.status >= 300) throw new Error('create ' + c.status + ' ' + (c.data.message || ''));
    return res.json({ row: c.data });
  } catch (e) { error(String(e && e.message || e)); return res.json({ error: 'SERVER' }, 500); }
};
