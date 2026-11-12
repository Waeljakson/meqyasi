// طبقة البيانات: Appwrite عند ضبط config.js، وإلا وضع تجريبي يحفظ على الجهاز فقط.
const Store = (() => {
  const cfg = window.APP_CONFIG;
  const live = !!(cfg.projectId && window.Appwrite);
  let account, db, AW;
  if (live) {
    AW = window.Appwrite;
    const client = new AW.Client().setEndpoint(cfg.endpoint).setProject(cfg.projectId);
    account = new AW.Account(client);
    db = new AW.TablesDB(client);
  }
  const mem = {};
  const ls = {
    get(k, d) { try { const v = localStorage.getItem('nafsi_' + k); return v ? JSON.parse(v) : (k in mem ? mem[k] : d); } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem('nafsi_' + k, JSON.stringify(v)); } catch (e) { /* يبقى في الذاكرة */ } },
    del(k) { delete mem[k]; try { localStorage.removeItem('nafsi_' + k); } catch (e) { /* لا شيء */ } }
  };
  const toUser = u => ({ id: u.$id, name: u.name, email: u.email, profile: u.prefs || {} });
  const toDoc = r => ({
    scaleId: r.scaleId, scaleName: r.scaleName, total: r.total, max: r.max, band: r.band, level: r.level,
    urgent: !!r.urgent, subs: JSON.stringify(r.subs), answers: JSON.stringify(r.answers), age: r.age, gender: r.gender
  });
  const fromDoc = d => ({
    id: d.$id, date: d.$createdAt, scaleId: d.scaleId, scaleName: d.scaleName, total: d.total, max: d.max, band: d.band,
    level: d.level, urgent: d.urgent, subs: JSON.parse(d.subs || '[]'), answers: JSON.parse(d.answers || '[]'), age: d.age, gender: d.gender
  });

  return {
    live,
    async me() {
      if (!live) return ls.get('user', null);
      try { return toUser(await account.get()); } catch (e) { return null; }
    },
    async signup(email, password, name) {
      if (!live) { const u = { id: 'local', name, email, profile: {} }; ls.set('user', u); return u; }
      await account.create(AW.ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      return toUser(await account.get());
    },
    async login(email, password) {
      if (!live) { const u = ls.get('user', null) || { id: 'local', name: email.split('@')[0], email, profile: {} }; ls.set('user', u); return u; }
      await account.createEmailPasswordSession(email, password);
      return toUser(await account.get());
    },
    async logout() {
      if (!live) { ls.del('user'); return; }
      await account.deleteSession('current');
    },
    async saveProfile(profile) {
      if (!live) { const u = ls.get('user', null); u.profile = profile; ls.set('user', u); return u; }
      return toUser(await account.updatePrefs(profile));
    },
    async saveResult(user, r) {
      if (!live) {
        const all = ls.get('results', []); r.id = 'r' + Date.now(); r.date = new Date().toISOString();
        all.unshift(r); ls.set('results', all); return r;
      }
      const role = AW.Role.user(user.id);
      const d = await db.createRow(cfg.databaseId, cfg.tableId, AW.ID.unique(), toDoc(r),
        [AW.Permission.read(role), AW.Permission.delete(role)]);
      return fromDoc(d);
    },
    async listResults() {
      if (!live) return ls.get('results', []);
      const res = await db.listRows(cfg.databaseId, cfg.tableId, [AW.Query.orderDesc('$createdAt'), AW.Query.limit(100)]);
      return res.rows.map(fromDoc);
    },
    async deleteResult(id) {
      if (!live) { ls.set('results', ls.get('results', []).filter(r => r.id !== id)); return; }
      await db.deleteRow(cfg.databaseId, cfg.tableId, id);
    }
  };
})();
