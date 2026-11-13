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
  const toUser = u => ({ id: u.$id, name: u.name, email: u.email, profile: u.prefs || {}, isAdmin: (u.labels || []).includes('admin') });
  const toDoc = (r, user) => ({
    scaleId: r.scaleId, scaleName: r.scaleName, total: r.total, max: r.max, band: r.band, level: r.level,
    urgent: !!r.urgent, subs: JSON.stringify(r.subs), answers: JSON.stringify(r.answers), age: r.age, gender: r.gender,
    userId: user.id, userName: user.name, memberId: r.memberId || '', memberName: r.memberName || '', secs: r.secs || 0
  });
  const fromDoc = d => ({
    id: d.$id, date: d.$createdAt, scaleId: d.scaleId, scaleName: d.scaleName, total: d.total, max: d.max, band: d.band,
    level: d.level, urgent: d.urgent, subs: JSON.parse(d.subs || '[]'), answers: JSON.parse(d.answers || '[]'), age: d.age, gender: d.gender,
    userId: d.userId || '', userName: d.userName || '', memberId: d.memberId || '', memberName: d.memberName || '', secs: d.secs || 0
  });
  const toMember = m => ({ id: m.$id, ownerId: m.ownerId, name: m.name, relation: m.relation, birthYear: m.birthYear, gender: m.gender });
  async function listAll(tableId, extra) {
    const out = []; let offset = 0;
    for (;;) {
      const res = await db.listRows(cfg.databaseId, tableId, [AW.Query.orderDesc('$createdAt'), AW.Query.limit(100), AW.Query.offset(offset)].concat(extra || []));
      out.push(...res.rows); offset += res.rows.length;
      if (res.rows.length < 100 || offset >= 5000) return out;
    }
  }
  async function current() {
    const u = toUser(await account.get());
    if (!u.isAdmin) {
      let blocked = false;
      try { await db.getRow(cfg.databaseId, cfg.blocksTableId, u.id); blocked = true; } catch (e) { blocked = false; }
      if (blocked) { try { await account.deleteSession('current'); } catch (e) { /* لا شيء */ } throw new Error('BLOCKED'); }
    }
    return u;
  }

  return {
    live,
    async me() {
      if (!live) return ls.get('user', null);
      try { return await current(); } catch (e) { if (e.message === 'BLOCKED') throw e; return null; }
    },
    async signup(email, password, name) {
      if (!live) { const u = { id: 'local', name, email, profile: {} }; ls.set('user', u); return u; }
      await account.create(AW.ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      return current();
    },
    async login(email, password) {
      if (!live) { const u = ls.get('user', null) || { id: 'local', name: email.split('@')[0], email, profile: {} }; ls.set('user', u); return u; }
      await account.createEmailPasswordSession(email, password);
      return current();
    },
    async recover(email) {
      if (!live) throw new Error('غير متاح في الوضع التجريبي');
      await account.createRecovery(email, cfg.siteUrl);
    },
    async resetPassword(userId, secret, password) { await account.updateRecovery(userId, secret, password); },
    progress: {
      get(userId, scaleId) { const p = ls.get('progress', null); return p && p.userId === userId && p.scaleId === scaleId ? p : null; },
      set(p) { ls.set('progress', p); }, clear() { ls.del('progress'); }
    },
    async logout() {
      if (!live) { ls.del('user'); return; }
      await account.deleteSession('current');
    },
    async saveProfile(user, profile) {
      if (!live) { const u = ls.get('user', null); u.profile = profile; ls.set('user', u); return u; }
      const u = toUser(await account.updatePrefs(profile));
      const row = { userId: u.id, name: u.name, email: u.email, birthYear: profile.birthYear, gender: profile.gender, consent: !!profile.consent };
      const role = AW.Role.user(u.id);
      try { await db.updateRow(cfg.databaseId, cfg.profilesTableId, u.id, row); }
      catch (e) { try { await db.createRow(cfg.databaseId, cfg.profilesTableId, u.id, row, [AW.Permission.read(role), AW.Permission.update(role)]); } catch (e2) { /* سجل الإدارة اختياري */ } }
      return u;
    },
    async saveResult(user, r) {
      if (!live) {
        const all = ls.get('results', []); r.id = 'r' + Date.now(); r.date = new Date().toISOString();
        all.unshift(r); ls.set('results', all); return r;
      }
      const role = AW.Role.user(user.id);
      const d = await db.createRow(cfg.databaseId, cfg.tableId, AW.ID.unique(), toDoc(r, user),
        [AW.Permission.read(role), AW.Permission.delete(role)]);
      return fromDoc(d);
    },
    async listResults(user) {
      if (!live) return ls.get('results', []);
      const q = [AW.Query.orderDesc('$createdAt'), AW.Query.limit(100)];
      if (user && user.isAdmin) q.push(AW.Query.equal('userId', user.id));
      const res = await db.listRows(cfg.databaseId, cfg.tableId, q);
      return res.rows.map(fromDoc);
    },
    async listMembers(user) {
      if (!live) return ls.get('members', []);
      const q = [AW.Query.limit(100)]; if (user.isAdmin) q.push(AW.Query.equal('ownerId', user.id));
      return (await db.listRows(cfg.databaseId, cfg.membersTableId, q)).rows.map(toMember);
    },
    async addMember(user, m) {
      if (!live) { const all = ls.get('members', []); m.id = 'm' + Date.now(); m.ownerId = user.id; all.push(m); ls.set('members', all); return m; }
      const role = AW.Role.user(user.id);
      return toMember(await db.createRow(cfg.databaseId, cfg.membersTableId, AW.ID.unique(),
        { ownerId: user.id, name: m.name, relation: m.relation, birthYear: m.birthYear, gender: m.gender },
        [AW.Permission.read(role), AW.Permission.update(role), AW.Permission.delete(role)]));
    },
    async deleteMember(id) {
      if (!live) { ls.set('members', ls.get('members', []).filter(m => m.id !== id)); return; }
      await db.deleteRow(cfg.databaseId, cfg.membersTableId, id);
    },
    async listIntakes(user) {
      if (!live) return ls.get('intakes', {});
      const q = [AW.Query.limit(100)]; if (user.isAdmin) q.push(AW.Query.equal('ownerId', user.id));
      const out = {}; (await db.listRows(cfg.databaseId, cfg.intakesTableId, q)).rows.forEach(r => { try { out[r.memberId || ''] = JSON.parse(r.data); } catch (e) { /* تجاهل */ } });
      return out;
    },
    async saveIntake(user, memberId, data) {
      if (!live) { const all = ls.get('intakes', {}); all[memberId || ''] = data; ls.set('intakes', all); return; }
      const rowId = memberId || user.id, row = { ownerId: user.id, memberId: memberId || '', data: JSON.stringify(data) }, role = AW.Role.user(user.id);
      try { await db.updateRow(cfg.databaseId, cfg.intakesTableId, rowId, row); }
      catch (e) { await db.createRow(cfg.databaseId, cfg.intakesTableId, rowId, row, [AW.Permission.read(role), AW.Permission.update(role), AW.Permission.delete(role)]); }
    },
    async deleteResult(id) {
      if (!live) { ls.set('results', ls.get('results', []).filter(r => r.id !== id)); return; }
      await db.deleteRow(cfg.databaseId, cfg.tableId, id);
    },
    // ---------- الإدارة (لمن يحمل الوسم admin فقط؛ الصلاحية يفرضها Appwrite) ----------
    async adminData() {
      const [profiles, results, blocks, notes, members, intakes] = await Promise.all([listAll(cfg.profilesTableId), listAll(cfg.tableId), listAll(cfg.blocksTableId), listAll(cfg.notesTableId).catch(() => []), listAll(cfg.membersTableId).catch(() => []), listAll(cfg.intakesTableId).catch(() => [])]);
      return {
        users: profiles.map(p => ({ id: p.userId, name: p.name, email: p.email, birthYear: p.birthYear, gender: p.gender, joined: p.$createdAt })),
        results: results.map(fromDoc), members: members.map(toMember), intakes: intakes.map(r => { let d = {}; try { d = JSON.parse(r.data); } catch (e) { /* تجاهل */ } return { ownerId: r.ownerId, memberId: r.memberId || '', data: d }; }), blocked: blocks.map(b => b.userId),
        notes: notes.map(n => ({ id: n.$id, userId: n.userId, text: n.text, author: n.author, date: n.$createdAt }))
      };
    },
    async addNote(userId, text, author) {
      const n = await db.createRow(cfg.databaseId, cfg.notesTableId, AW.ID.unique(), { userId, text, author });
      return { id: n.$id, userId, text, author, date: n.$createdAt };
    },
    async deleteNote(id) { await db.deleteRow(cfg.databaseId, cfg.notesTableId, id); },
    async block(userId) { await db.createRow(cfg.databaseId, cfg.blocksTableId, userId, { userId }); },
    async unblock(userId) { await db.deleteRow(cfg.databaseId, cfg.blocksTableId, userId); }
  };
})();
