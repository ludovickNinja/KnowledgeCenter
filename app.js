/* ============================================================
   Knowledge Center POC — application
   Vanilla JS, hash routing, localStorage persistence.
   ============================================================ */
(() => {
  const D = window.KC_DATA;
  const LS_KEY = 'kc-poc-state-v1';
  const TODAY = new Date().toISOString().slice(0, 10);

  /* ---------- state ---------- */
  const clone = o => JSON.parse(JSON.stringify(o));
  // Documents and queue items are compiled from content/ by scripts/build_content.py into content.js.
  const C = window.KC_CONTENT || { docs: [], ongoing: [], build: 'none' };
  const REPO = 'https://github.com/ludovickNinja/KnowledgeCenter';
  const ghView = p => `${REPO}/blob/main/${p}`, ghEdit = p => `${REPO}/edit/main/${p}`;
  const ext = 'target="_blank" rel="noopener"';
  const defaultState = () => ({
    user: 'maya',
    build: C.build,
    progress: clone(D.SEED_PROGRESS),
    requests: clone(D.SEED_REQUESTS),
    docs: clone(C.docs),
    ongoing: clone(C.ongoing),
    deptOverride: {},
  });
  let S;
  const load = () => {
    try { S = JSON.parse(localStorage.getItem(LS_KEY)) || defaultState(); } catch { S = defaultState(); }
    if (!S.docs) S = defaultState();
    // Content was rebuilt since this browser last visited: take the fresh documents, keep progress and requests.
    if (S.build !== C.build) { S.docs = clone(C.docs); S.ongoing = clone(C.ongoing); S.build = C.build; save(); }
  };
  const save = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch {} };
  const UI = { modal: null, quiz: {}, quizResult: null, knowQuery: '', knowCat: '', chat: {}, manageTab: 'overview', toast: null, teamMember: null, askDraft: '' };

  /* ---------- helpers ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Minimal Markdown for section bodies: paragraphs, bullet lists, **bold**, *italic*, [links](url). Escapes first.
  const inlineMd = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[^)\s]*)\)/g, (m, t, u) => `<a href="${u}"${u.startsWith('http') ? ` ${ext}` : ''}>${t}</a>`);
  const md = src => String(src || '').replace(/\r/g, '').split(/\n\s*\n/).filter(b => b.trim()).map(b => {
    const lines = b.split('\n');
    if (lines.every(l => /^\s*[-*]\s+/.test(l))) return `<ul>${lines.map(l => `<li>${inlineMd(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    return `<p>${inlineMd(lines.join(' '))}</p>`;
  }).join('');
  const txt = s => s.text || s.p || '';
  const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const deptName = id => id === 'all' ? 'Everyone' : (D.DEPARTMENTS[id]?.short || id);
  const deptList = ids => ids.map(deptName).join(', ');
  const cat = id => D.CATEGORIES.find(c => c.id === id);
  const userById = id => D.USERS.find(u => u.id === id);
  const me = () => { const u = clone(userById(S.user)); if (S.deptOverride[u.id]) u.dept = S.deptOverride[u.id]; return u; };
  const docById = id => S.docs.find(d => d.id === id);
  const currentVersion = doc => [...doc.versions].reverse().find(v => v.status === 'published') || null;
  const pendingVersion = doc => doc.versions.find(v => v.status === 'review' || v.status === 'draft') || null;
  const appliesTo = (item, user) => item.depts.includes('all') || item.depts.includes(user.dept);
  const visibleDocs = user => S.docs.filter(d => currentVersion(d) && appliesTo(d, user));
  const progressOf = uid => (S.progress[uid] = S.progress[uid] || {});
  const isDone = (uid, id) => !!progressOf(uid)[id];
  const stageItems = (stage, user) => stage === 'ongoing'
    ? S.ongoing.filter(o => appliesTo(o, user)).sort((a, b) => b.date.localeCompare(a.date))
    : D.MODULES.filter(m => m.stage === stage && appliesTo(m, user));
  const allItems = user => D.STAGES.flatMap(s => stageItems(s.id, user));
  const dueItems = user => allItems(user).filter(i => !isDone(user.id, i.id));
  const findItem = id => D.MODULES.find(m => m.id === id) || S.ongoing.find(o => o.id === id);
  const toast = msg => { UI.toast = msg; render(); setTimeout(() => { UI.toast = null; render(); }, 2800); };
  const go = hash => { location.hash = hash; };
  const stageOf = item => item.stage || 'ongoing';

  /* ---------- retrieval for Ask (keyword, approved docs only) ---------- */
  const STOP = new Set('the a an and or of to in on for is are was be can i we my our do does what how when where which who with about that this it its as at by from if not no any into than then them they there their'.split(' '));
  const tokens = s => s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)).map(w => w.replace(/(ing|ed|es|s)$/, ''));
  function ask(query, user) {
    const q = [...new Set(tokens(query))];
    if (!q.length) return { found: false, q };
    const hits = [];
    visibleDocs(user).forEach(doc => {
      const v = currentVersion(doc);                      // never archived / draft
      const titleT = tokens(doc.title + ' ' + doc.tags.join(' '));
      v.sections.forEach((sec, i) => {
        const headT = tokens(sec.h), bodyT = tokens(txt(sec));
        let score = 0, matched = 0;
        q.forEach(t => {
          let s = 0;
          if (titleT.includes(t)) s += 2;
          if (headT.includes(t)) s += 3;
          if (bodyT.includes(t)) s += 1.5;
          if (s) matched++;
          score += s;
        });
        if (matched) hits.push({ doc, v, sec, i, score, matched });
      });
    });
    hits.sort((a, b) => b.score - a.score || b.matched - a.matched);
    const best = hits[0];
    const need = q.length === 1 ? 1 : Math.max(2, Math.ceil(q.length * 0.5));
    if (!best || best.matched < need || best.score < 3) return { found: false, q, near: hits.filter(h => h.matched >= 2).slice(0, 2) };
    const supporting = hits.filter(h => h !== best && h.matched >= need && h.score >= 3).slice(0, 2);
    const sentences = txt(best.sec).match(/[^.!?]+[.!?]+/g) || [txt(best.sec)];
    return { found: true, q, best, answer: sentences.slice(0, 2).join(' ').trim(), supporting };
  }

  /* ---------- actions ---------- */
  function completeItem(uid, item) {
    const doc = docById(item.docId || item.docs?.[0]);
    const version = item.version || (doc ? currentVersion(doc)?.v : undefined);
    progressOf(uid)[item.id] = { date: TODAY, version };
    save();
  }
  function publishVersion(docId, { summary, push, depts, title, pendingV }) {
    const doc = docById(docId);
    const cur = currentVersion(doc);
    let v;
    if (pendingV) { v = doc.versions.find(x => x.v === pendingV); v.status = 'published'; v.date = TODAY; v.summary = summary; v.pushed = push; if (!v.sections.length && cur) v.sections = clone(cur.sections); }
    else { v = { v: Math.max(...doc.versions.map(x => x.v)) + 1, status: 'published', date: TODAY, summary, pushed: push, sections: cur ? clone(cur.sections) : [] }; doc.versions.push(v); }
    doc.versions.forEach(x => { if (x !== v && x.status === 'published') x.status = 'archived'; });
    if (push) S.ongoing.push({ id: `o-${docId}-v${v.v}`, docId, version: v.v, depts, date: TODAY, title: title || `Update: ${doc.title} (v${v.v})`, minutes: 5, quiz: null });
    save();
  }
  function archiveDoc(docId) { docById(docId).versions.forEach(v => { if (v.status === 'published') v.status = 'archived'; }); save(); }

  /* ---------- routing ---------- */
  const route = () => { const h = (location.hash.slice(1) || '/learn').split('?')[0]; const parts = h.split('/').filter(Boolean); return { page: parts[0] || 'learn', a: parts[1], b: parts[2], query: new URLSearchParams(location.hash.split('?')[1] || '') }; };

  /* ---------- views ---------- */
  function topbar(r, user) {
    const due = dueItems(user).length;
    const nav = [
      ['learn', '🎓', 'Learn', due ? `<span class="badge count">${due}</span>` : ''],
      ['know', '📚', 'Know', ''],
      ['ask', '✨', 'Ask', ''],
    ];
    if (user.role === 'supervisor' || user.role === 'admin') nav.push(['team', '👥', 'My Team', '']);
    if (user.role === 'admin') { const pend = S.docs.filter(pendingVersion).length + S.requests.filter(x => x.status === 'open').length; nav.push(['manage', '🛠️', 'Manage', pend ? `<span class="badge count">${pend}</span>` : '']); }
    return `<header class="topbar"><div class="topbar-inner">
      <div class="brand"><span class="mark">K</span><span>Knowledge Center</span><span class="poc">POC</span></div>
      <nav class="main">${nav.map(([id, ico, lbl, badge]) => `<a href="#/${id}" class="${r.page === id ? 'active' : ''}">${ico} <span class="lbl">${lbl}</span>${badge}</a>`).join('')}</nav>
      <div class="user-switch">
        <select data-change="switch-user" title="Switch persona (demo)">${D.USERS.map(u => `<option value="${u.id}" ${u.id === S.user ? 'selected' : ''}>${esc(u.name)} · ${esc(u.title)}</option>`).join('')}</select>
        <span class="avatar" title="${esc(user.name)}">${initials(user.name)}</span>
      </div>
    </div></header>`;
  }

  /* ----- LEARN ----- */
  function learnPage(user) {
    const items = allItems(user), done = items.filter(i => isDone(user.id, i.id)).length;
    const pct = items.length ? Math.round(done / items.length * 100) : 0;
    const next = dueItems(user)[0];
    return `<div class="page-head"><div><h1>Learn</h1><p class="muted">Work through your modules at your own pace. Everything stays open after you complete it, and new items appear in Ongoing Learning when documentation changes.</p></div></div>
    <div class="grid side-r">
      <div>
        ${D.STAGES.map((st, idx) => stageBlock(st, idx, user)).join('')}
      </div>
      <div class="stack">
        <div class="card">
          <div class="row spread mb-s"><h3>Your progress</h3><span class="badge ${pct === 100 ? 'ok' : 'accent'}">${pct}%</span></div>
          <div class="progress ${pct === 100 ? 'ok' : ''}"><span style="width:${pct}%"></span></div>
          <p class="small muted mt-s">${done} of ${items.length} items complete · ${deptName(user.dept)}</p>
          ${next ? `<a class="btn primary mt-s" href="#/learn/${next.id}">Continue: ${esc(next.title)} →</a>` : `<div class="notice ok mt-s">You are fully up to date.</div>`}
        </div>
        <div class="card flat">
          <h3>Demo: switch department</h3>
          <p class="small muted">Company-wide stages stay complete. Only the department path and ongoing items change.</p>
          <select data-change="switch-dept">${Object.values(D.DEPARTMENTS).map(d => `<option value="${d.id}" ${d.id === user.dept ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>
        </div>
        <div class="card flat small muted">
          <strong>How the queue works</strong>
          <ul style="padding-left:18px;margin:6px 0 0">
            <li>Module content is pulled live from the knowledge base; nothing is written twice.</li>
            <li>Completing a module records the document version you saw.</li>
            <li>When a document is republished with a substantive change, a new Ongoing Learning item is created. Minor edits are not pushed.</li>
          </ul>
        </div>
      </div>
    </div>`;
  }
  function stageBlock(st, idx, user) {
    const items = stageItems(st.id, user), done = items.filter(i => isDone(user.id, i.id)).length;
    const pct = items.length ? Math.round(done / items.length * 100) : 0;
    const complete = items.length && done === items.length;
    return `<div class="stage">
      <div class="stage-head">
        <div class="stage-num ${complete ? 'done' : ''}">${complete ? '✓' : idx + 1}</div>
        <div class="meta"><div class="row spread"><h3 style="margin:0">${esc(st.name)}</h3><span class="badge">${esc(st.who)}</span></div><div class="small muted">${esc(st.blurb)}</div></div>
        <div style="text-align:right"><div class="progress ${complete ? 'ok' : ''}"><span style="width:${pct}%"></span></div><div class="tiny muted mt-s">${done}/${items.length}</div></div>
      </div>
      <div class="module-list">
        ${items.length ? items.map(m => moduleRow(m, user)).join('') : `<div class="empty small">Nothing here for ${esc(deptName(user.dept))} yet.</div>`}
      </div>
    </div>`;
  }
  function moduleRow(m, user) {
    const rec = progressOf(user.id)[m.id];
    const doc = docById(m.docId || m.docs?.[0]);
    const cur = doc && currentVersion(doc);
    const isOngoing = !!m.docId;
    return `<a class="module ${rec ? 'done' : (isOngoing ? 'due' : '')}" href="#/learn/${m.id}">
      <div class="check">${rec ? '✓' : ''}</div>
      <div class="body">
        <div class="title">${esc(m.title)} ${isOngoing ? `<span class="badge warn">Update · v${m.version}</span>` : ''}</div>
        <div class="sub">${esc(m.purpose || (doc ? `Change summary from ${esc(doc.title)}` : ''))}</div>
      </div>
      <div class="small muted" style="text-align:right;white-space:nowrap">${rec ? `Completed ${fmtDate(rec.date)}${rec.version ? ` · v${rec.version}` : ''}` : `${m.minutes} min${isOngoing ? ` · added ${fmtDate(m.date)}` : ''}`}</div>
    </a>`;
  }

  function modulePage(id, user) {
    const m = findItem(id);
    if (!m) return `<div class="empty">Module not found.</div>`;
    const doc = docById(m.docId || m.docs[0]);
    const isOngoing = !!m.docId;
    const ver = isOngoing ? doc.versions.find(v => v.v === m.version) : currentVersion(doc);
    const prev = isOngoing ? doc.versions.filter(v => v.v < m.version).pop() : null;
    const rec = progressOf(user.id)[m.id];
    const stage = D.STAGES.find(s => s.id === stageOf(m));
    const res = UI.quizResult?.id === id ? UI.quizResult : null;
    return `<div class="row mb-s"><a href="#/learn" class="btn ghost sm">← Learn</a><span class="muted small">${esc(stage.name)}</span></div>
    <div class="page-head"><div><h1>${esc(m.title)}</h1><p class="muted">${esc(m.purpose || 'Review the change below, then confirm you have read it.')}</p></div>
      ${rec ? `<span class="badge ok">✓ Completed ${fmtDate(rec.date)}${rec.version ? ` · v${rec.version}` : ''}</span>` : `<span class="badge">${m.minutes} min</span>`}</div>
    <div class="grid side-r">
      <div class="card doc">
        ${isOngoing ? `<div class="diff-box mb"><div class="lbl">What changed · v${prev ? prev.v + ' → ' : ''}v${m.version} · ${fmtDate(ver.date)}</div>${esc(ver.summary)}${prev && prev.sections.length ? `<details class="mt-s small"><summary>Compare with v${prev.v}</summary><div class="mt-s">${prev.sections.map(s => `<p><strong>${esc(s.h)}</strong> — ${esc(txt(s))}</p>`).join('')}</div></details>` : ''}</div>` : ''}
        ${!ver || !ver.sections.length ? `<div class="notice warn">This content is no longer published. The module remains in your record.</div>` : `
        <div class="row spread mb"><div class="small muted">From the knowledge base: <a href="#/know/${doc.id}">${esc(doc.title)}</a> · v${ver.v} · ${esc(doc.owner)}</div><span class="badge ${ver.status === 'published' ? 'ok' : ''}">${ver.status}</span></div>
        ${ver.sections.map(s => `<section><h3>${esc(s.h)}</h3>${md(s.p)}</section>`).join('')}`}
        ${(m.docs || []).slice(1).map(d => { const dd = docById(d), vv = currentVersion(dd); return vv ? `<hr><div class="small muted mb">Also from: <a href="#/know/${dd.id}">${esc(dd.title)}</a></div>${vv.sections.map(s => `<section><h3>${esc(s.h)}</h3>${md(s.p)}</section>`).join('')}` : ''; }).join('')}
      </div>
      <div class="stack">
        <div class="card">
          ${m.quiz ? `<h3>Knowledge check</h3><p class="small muted">Answer all questions correctly to complete the module.</p>
          <form data-submit="quiz" data-id="${m.id}">
            ${m.quiz.map((q, qi) => `<div class="quiz-q"><div><strong>${qi + 1}.</strong> ${esc(q.q)}</div><div class="opts">${q.a.map((a, ai) => {
              const cls = res ? (ai === q.c ? 'correct' : (res.answers[qi] === ai ? 'wrong' : '')) : '';
              return `<label class="${cls}"><input type="radio" name="q${qi}" value="${ai}" ${res && res.answers[qi] === ai ? 'checked' : ''} required> ${esc(a)}</label>`; }).join('')}</div></div>`).join('')}
            ${res && !res.pass ? `<div class="notice warn mb-s">${res.wrong} answer${res.wrong > 1 ? 's' : ''} incorrect. Review the highlighted sections and try again.</div>` : ''}
            <button class="btn primary" type="submit">${rec ? 'Retake quiz' : 'Submit answers'}</button>
          </form>` : `<h3>Acknowledge</h3><p class="small muted">Confirm you have read the change summary and the updated document.</p>
          <button class="btn primary" data-action="ack" data-id="${m.id}" ${rec ? 'disabled' : ''}>${rec ? 'Acknowledged' : 'I have read this update'}</button>`}
        </div>
        ${rec ? `<div class="card flat small"><strong>Your record</strong><div class="muted mt-s">Completed ${fmtDate(rec.date)} on version ${rec.version || '—'} of ${esc(doc.title)}. This record is retained even if the document is later archived.</div></div>` : ''}
        <div class="card flat small"><strong>Completion criteria</strong><div class="muted mt-s">${m.quiz ? 'All quiz questions answered correctly.' : 'Change summary acknowledged.'} Content stays accessible afterwards.</div></div>
      </div>
    </div>`;
  }

  /* ----- KNOW ----- */
  function highlight(text, q) { if (!q) return esc(text); const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); return esc(text).replace(re, '<mark>$1</mark>'); }
  function knowPage(user) {
    const q = UI.knowQuery.trim().toLowerCase();
    let docs = visibleDocs(user);
    if (UI.knowCat) docs = docs.filter(d => d.category === UI.knowCat);
    const scored = docs.map(d => {
      const v = currentVersion(d);
      let hit = !q, snippet = '';
      if (q) {
        if (d.title.toLowerCase().includes(q) || d.tags.some(t => t.includes(q))) hit = true;
        const sec = v.sections.find(s => (s.h + ' ' + txt(s)).toLowerCase().includes(q));
        if (sec) { hit = true; const t = txt(sec), i = t.toLowerCase().indexOf(q); snippet = (i > 60 ? '…' : '') + t.slice(Math.max(0, i - 60), i + 120) + '…'; }
      }
      return { d, v, hit, snippet };
    }).filter(x => x.hit);
    return `<div class="page-head"><div><h1>Know</h1><p class="muted">Searchable reference for day-to-day work. You see company-wide documents and those labelled for <strong>${esc(deptName(user.dept))}</strong>. Archived versions are never shown here.</p></div></div>
    <div class="search mb"><span class="ico">🔍</span><input type="search" placeholder="Search policies, procedures, products…" value="${esc(UI.knowQuery)}" data-input="know-search" autofocus></div>
    <div class="chips mb"><button class="chip ${!UI.knowCat ? 'active' : ''}" data-action="know-cat" data-id="">All</button>${D.CATEGORIES.map(c => `<button class="chip ${UI.knowCat === c.id ? 'active' : ''}" data-action="know-cat" data-id="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('')}</div>
    ${scored.length ? `<div class="grid cols-3">${scored.map(({ d, v, snippet }) => `<a class="card doc-card" href="#/know/${d.id}">
        <div class="cat">${cat(d.category).icon} ${esc(cat(d.category).name)}</div>
        <div class="title">${highlight(d.title, UI.knowQuery.trim())}</div>
        <div class="small muted">${snippet ? highlight(snippet, UI.knowQuery.trim()) : esc(txt(v.sections[0] || {}).slice(0, 110) + '…')}</div>
        <div class="row mt-s"><span class="badge">v${v.v} · ${fmtDate(v.date)}</span><span class="badge">${esc(deptList(d.depts))}</span></div>
      </a>`).join('')}</div>` : `<div class="card empty">No documents match. <button class="btn ghost" data-action="open-request" data-prefill="${esc(UI.knowQuery)}">Request this topic be documented →</button></div>`}`;
  }
  function docPage(id, user, query) {
    const d = docById(id);
    if (!d) return `<div class="empty">Document not found.</div>`;
    const cur = currentVersion(d);
    const wantV = query.get('v') ? Number(query.get('v')) : null;
    const canSeeArchived = user.role === 'admin';
    const ver = wantV && canSeeArchived ? d.versions.find(v => v.v === wantV) : cur;
    if (!ver) return `<div class="row mb-s"><a href="#/know" class="btn ghost sm">← Know</a></div><div class="card"><h2>${esc(d.title)}</h2><div class="notice warn mt">This document is archived and no longer available for reference. ${user.role === 'admin' ? `Open it in <a href="#/manage/doc/${d.id}">Manage</a>.` : 'Ask Customer Service or your lead for the current procedure.'}</div></div>`;
    if (!appliesTo(d, user) && user.role !== 'admin') return `<div class="card"><div class="notice warn">This document is not labelled for your department.</div></div>`;
    const related = D.MODULES.filter(m => m.docs.includes(d.id));
    const hl = query.get('s');
    return `<div class="row mb-s"><a href="#/know" class="btn ghost sm">← Know</a><span class="muted small">${cat(d.category).icon} ${esc(cat(d.category).name)}</span></div>
    <div class="grid side-r">
      <div class="card doc">
        ${ver.status !== 'published' ? `<div class="notice warn mb">You are viewing an archived version (v${ver.v}). <a href="#/know/${d.id}">Go to current version</a></div>` : ''}
        <h1>${esc(d.title)}</h1>
        <div class="row small muted mb">
          <span>v${ver.v} · ${ver.status === 'published' ? 'Published' : ver.status} ${fmtDate(ver.date)}</span><span>·</span><span>Owner: ${esc(d.owner)}</span><span>·</span><span>Visible to: ${esc(deptList(d.depts))}</span>
        </div>
        ${ver.sections.map((s, i) => `<section id="s${i}" class="${hl == i ? 'hl' : ''}"><h3>${esc(s.h)}</h3>${md(s.p)}</section>`).join('')}
        ${user.role === 'admin' && ver.status === 'published' ? `<div class="tiny muted mt">Source: <a href="${ghView(`content/current/${d.id}.md`)}" ${ext}>content/current/${esc(d.id)}.md</a> · <a href="${ghEdit(`content/current/${d.id}.md`)}" ${ext}>edit on GitHub</a></div>` : ''}
      </div>
      <div class="stack">
        <div class="card flat"><h3>On this page</h3><div class="toc">${ver.sections.map((s, i) => `<a href="#s${i}" data-action="scroll" data-id="s${i}">${esc(s.h)}</a>`).join('')}</div></div>
        <div class="card flat"><h3>Version history</h3><div class="timeline mt-s">${[...d.versions].reverse().filter(v => v.status !== 'draft' && v.status !== 'review').map(v => `<div class="tl-item ${v.status === 'published' ? 'current' : ''}">
          <div class="row spread"><strong class="small">v${v.v}</strong><span class="tiny muted">${fmtDate(v.date)}</span></div>
          <div class="small muted">${esc(v.summary)}</div>
          <div class="row mt-s">${v.status === 'published' ? '<span class="badge ok">Current</span>' : `<span class="badge">Archived</span>${canSeeArchived ? ` <a class="tiny" href="#/know/${d.id}?v=${v.v}">view</a>` : ''}`}${v.pushed ? '<span class="badge warn">Pushed to queues</span>' : '<span class="badge">Minor</span>'}</div>
        </div>`).join('')}</div></div>
        ${related.length ? `<div class="card flat"><h3>Used in training</h3>${related.map(m => `<a class="small" style="display:block;padding:3px 0" href="#/learn/${m.id}">${isDone(user.id, m.id) ? '✓' : '○'} ${esc(m.title)}</a>`).join('')}</div>` : ''}
        <button class="btn sm" data-action="open-request" data-prefill="Re: ${esc(d.title)} — ">Report an issue with this document</button>
      </div>
    </div>`;
  }

  /* ----- ASK ----- */
  function askPage(user) {
    const chat = (UI.chat[user.id] = UI.chat[user.id] || []);
    const samples = ['Can I resize a tungsten ring?', 'How long is a quote valid?', 'What is the QC width tolerance?', 'What do I do if a return arrives without an RMA?', 'What is our parental leave policy?'];
    return `<div class="page-head"><div><h1>Ask</h1><p class="muted">Answers come only from approved, published documentation labelled for <strong>${esc(deptName(user.dept))}</strong> or everyone. Every answer links to its source so you can verify it. If nothing reliable exists, it says so.</p></div></div>
    <div class="grid side-r">
      <div>
        <div class="chat">
          ${chat.length ? chat.map(m => m.role === 'user' ? `<div class="msg user">${esc(m.text)}</div>` : botMsg(m)).join('') : `<div class="msg bot"><strong>Hi ${esc(user.name.split(' ')[0])}.</strong> Ask me about a policy, procedure or product and I will find the applicable document.<div class="suggest">${samples.map(s => `<button class="chip" data-action="ask-sample" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`}
        </div>
        <form class="ask-form" data-submit="ask"><input name="q" placeholder="Ask a question…" value="${esc(UI.askDraft)}" autocomplete="off" autofocus><button class="btn primary" type="submit">Ask</button>${chat.length ? `<button class="btn" type="button" data-action="ask-clear">Clear</button>` : ''}</form>
      </div>
      <div class="stack">
        <div class="card flat small"><strong>How this works</strong>
          <ul class="muted" style="padding-left:18px;margin:6px 0 0">
            <li>Searches only the current published version of each document. Archived versions and drafts are excluded from the index.</li>
            <li>Respects department labels: the assistant cannot see documents you cannot see.</li>
            <li>Identifies the applicable policy or procedure, gives a concise answer, and links to the exact section.</li>
            <li>Says when it cannot find a reliable answer instead of guessing.</li>
          </ul>
        </div>
        <div class="notice small">POC note: retrieval here is keyword-based and runs in your browser. The production version would send the same retrieved passages to a language model to compose the answer, with the same source-only constraint.</div>
      </div>
    </div>`;
  }
  function botMsg(m) {
    const r = m.result;
    if (!r.found) return `<div class="msg bot nf"><strong>I could not find a reliable answer in approved documentation.</strong><p class="small muted mt-s">Rather than guess, I would suggest asking your lead and submitting a documentation request so this gets covered.</p>
      ${r.near?.length ? `<div class="src">Possibly related, but not a match:${r.near.map(h => `<a href="#/know/${h.doc.id}?s=${h.i}">${esc(h.doc.title)} → ${esc(h.sec.h)}</a>`).join('')}</div>` : ''}
      <div class="mt-s"><button class="btn sm" data-action="open-request" data-prefill="${esc(m.q)}">Request documentation on this</button></div></div>`;
    const b = r.best;
    return `<div class="msg bot">
      <div class="tiny muted mb-s">Applicable document: <strong>${esc(b.doc.title)}</strong> · ${esc(b.sec.h)} · v${b.v.v}</div>
      <div>${esc(r.answer)}</div>
      <div class="src">Source${r.supporting.length ? 's' : ''}:
        <a href="#/know/${b.doc.id}?s=${b.i}">📄 ${esc(b.doc.title)} → ${esc(b.sec.h)} (v${b.v.v}, ${fmtDate(b.v.date)})</a>
        ${r.supporting.map(h => `<a href="#/know/${h.doc.id}?s=${h.i}">📄 ${esc(h.doc.title)} → ${esc(h.sec.h)}</a>`).join('')}
      </div>
    </div>`;
  }

  /* ----- TEAM (supervisor) ----- */
  function teamPage(user) {
    const team = user.role === 'admin' ? D.USERS.filter(u => u.id !== user.id) : D.USERS.filter(u => u.supervisor === user.id);
    const stats = u => { const uu = clone(u); if (S.deptOverride[u.id]) uu.dept = S.deptOverride[u.id]; return D.STAGES.map(st => { const items = stageItems(st.id, uu); return { st, total: items.length, done: items.filter(i => isDone(u.id, i.id)).length, items, user: uu }; }); };
    if (UI.teamMember) {
      const u = userById(UI.teamMember); const st = stats(u);
      return `<div class="row mb-s"><button class="btn ghost sm" data-action="team-back">← My Team</button></div>
      <div class="page-head"><div><h1>${esc(u.name)}</h1><p class="muted">${esc(u.title)} · ${esc(deptName(st[0].user.dept))} · started ${fmtDate(u.started)}</p></div></div>
      ${st.map(s => `<div class="card mb"><div class="row spread mb-s"><h3 style="margin:0">${esc(s.st.name)}</h3><span class="badge ${s.done === s.total ? 'ok' : 'warn'}">${s.done}/${s.total}</span></div>
        <table><thead><tr><th>Item</th><th>Status</th><th>Completed</th><th>Version seen</th></tr></thead><tbody>
        ${s.items.map(i => { const r = progressOf(u.id)[i.id]; return `<tr><td>${esc(i.title)}</td><td>${r ? '<span class="badge ok">Complete</span>' : '<span class="badge warn">Pending</span>'}</td><td>${r ? fmtDate(r.date) : '—'}</td><td>${r?.version ? `v${r.version}` : '—'}</td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">None</td></tr>'}
        </tbody></table></div>`).join('')}`;
    }
    return `<div class="page-head"><div><h1>My Team</h1><p class="muted">Completion by stage for the people who report to you. Click a row for the full record, including which document version each person completed.</p></div></div>
    <div class="card pad-0"><table><thead><tr><th>Employee</th><th>Department</th>${D.STAGES.map(s => `<th>${esc(s.name)}</th>`).join('')}<th>Pending updates</th></tr></thead><tbody>
      ${team.map(u => { const st = stats(u); const pend = st[3].total - st[3].done; return `<tr class="clickable" data-action="team-open" data-id="${u.id}">
        <td><div class="row"><span class="avatar">${initials(u.name)}</span><div><div>${esc(u.name)}</div><div class="tiny muted">${esc(u.title)}</div></div></div></td>
        <td class="small">${esc(deptName(st[0].user.dept))}</td>
        ${st.map(s => `<td><div class="progress ${s.done === s.total ? 'ok' : ''}"><span style="width:${s.total ? s.done / s.total * 100 : 0}%"></span></div><span class="small muted">${s.done}/${s.total}</span></td>`).join('')}
        <td>${pend ? `<span class="badge warn">${pend} pending</span>` : '<span class="badge ok">Up to date</span>'}</td></tr>`; }).join('')}
    </tbody></table></div>`;
  }

  /* ----- MANAGE (L&D only) ----- */
  function managePage(user, r) {
    if (user.role !== 'admin') return `<div class="card"><h2>Restricted</h2><div class="notice warn mt">Manage is only available to Learning & Development. It is not shown in the navigation for base access.</div></div>`;
    const tab = r.a || 'overview';
    if (tab === 'doc' && r.b) return manageDoc(r.b);
    const tabs = [['overview', 'Overview'], ['library', 'Library'], ['review', `Review queue (${S.docs.filter(pendingVersion).length})`], ['folders', 'Folders & access'], ['requests', `Requests (${S.requests.filter(x => x.status === 'open').length})`], ['standards', 'Writing standards']];
    return `<div class="page-head"><div><h1>Manage</h1><p class="muted">Organize, review, update and publish documentation. L&D owns the framework, writing standards and quality control; subject matter experts own technical accuracy.</p></div></div>
    <div class="tabs">${tabs.map(([id, lbl]) => `<a href="#/manage/${id}" class="${tab === id ? 'active' : ''}">${lbl}</a>`).join('')}</div>
    ${{ overview: manageOverview, library: manageLibrary, review: manageReview, folders: manageFolders, requests: manageRequests, standards: manageStandards }[tab]?.() || ''}`;
  }
  function manageOverview() {
    const pub = S.docs.filter(currentVersion).length, pend = S.docs.filter(pendingVersion).length;
    const archived = S.docs.reduce((n, d) => n + d.versions.filter(v => v.status === 'archived').length, 0);
    const open = S.requests.filter(x => x.status === 'open').length;
    const emp = D.USERS.filter(u => u.role !== 'admin');
    const totals = emp.reduce((a, u) => { const uu = clone(u); if (S.deptOverride[u.id]) uu.dept = S.deptOverride[u.id]; const items = S.ongoing.filter(o => appliesTo(o, uu)); a.t += items.length; a.d += items.filter(i => isDone(u.id, i.id)).length; return a; }, { t: 0, d: 0 });
    return `<div class="grid cols-4 mb">
      <div class="card kpi"><span class="n">${pub}</span><span class="l">Published documents</span></div>
      <div class="card kpi"><span class="n">${pend}</span><span class="l">Awaiting review / publish</span></div>
      <div class="card kpi"><span class="n">${archived}</span><span class="l">Archived versions retained</span></div>
      <div class="card kpi"><span class="n">${totals.t ? Math.round(totals.d / totals.t * 100) : 0}%</span><span class="l">Queue updates acknowledged</span></div>
    </div>
    <div class="grid cols-2">
      <div class="card"><h3>Publishing workflow</h3>
        <ol class="small" style="padding-left:18px;margin:8px 0 0;line-height:1.8">
          <li><strong>SME submits</strong> content as a file in <span class="mono">content/drafts/</span> and is accountable for accuracy.</li>
          <li><strong>L&D reviews</strong> for framework, writing standards, organization and labels (category, departments).</li>
          <li><strong>Publish</strong> by commit: the previous file moves to <span class="mono">content/archive/</span>, the new one becomes <span class="mono">content/current/</span>. The build validates it and the site updates.</li>
          <li><strong>Decide</strong> whether the change is substantive. Only substantive changes create Ongoing Learning items, with a change summary shown in the queue.</li>
          <li>Completion records keep the version each employee saw.</li>
        </ol></div>
      <div class="card"><h3>Needs attention</h3>
        ${S.docs.filter(pendingVersion).map(d => { const v = pendingVersion(d); return `<div class="row spread mt-s"><div><a href="#/manage/doc/${d.id}">${esc(d.title)}</a><div class="tiny muted">v${v.v} ${v.status} · ${esc(v.summary)}</div></div><span class="badge ${v.status === 'review' ? 'info' : ''}">${v.status}</span></div>`; }).join('')}
        ${open ? `<div class="row spread mt-s"><a href="#/manage/requests">${open} open employee request${open > 1 ? 's' : ''}</a><span class="badge warn">open</span></div>` : ''}
      </div>
    </div>`;
  }
  function manageLibrary() {
    return `<div class="card pad-0"><table><thead><tr><th>Document</th><th>Category</th><th>Departments</th><th>SME owner</th><th>Current</th><th>Pending</th><th>Versions</th></tr></thead><tbody>
      ${S.docs.map(d => { const c = currentVersion(d), p = pendingVersion(d); return `<tr class="clickable" data-href="#/manage/doc/${d.id}">
        <td><strong>${esc(d.title)}</strong></td><td class="small">${cat(d.category).icon} ${esc(cat(d.category).name)}</td><td class="small">${esc(deptList(d.depts))}</td><td class="small">${esc(d.owner)}</td>
        <td>${c ? `<span class="badge ok">v${c.v}</span>` : '<span class="badge danger">archived</span>'}</td><td>${p ? `<span class="badge ${p.status === 'review' ? 'info' : ''}">v${p.v} ${p.status}</span>` : '<span class="muted">—</span>'}</td><td class="small muted">${d.versions.length}</td></tr>`; }).join('')}
    </tbody></table></div>`;
  }
  function manageReview() {
    const list = S.docs.filter(pendingVersion);
    return list.length ? `<div class="stack">${list.map(d => { const v = pendingVersion(d); return `<div class="card"><div class="row spread"><div><h3 style="margin:0">${esc(d.title)} <span class="badge ${v.status === 'review' ? 'info' : ''}">v${v.v} · ${v.status}</span></h3><div class="small muted mt-s">Submitted ${fmtDate(v.date)} by ${esc(d.owner)} · ${esc(v.summary)}</div></div>
      <div class="row"><a class="btn sm" href="#/manage/doc/${d.id}">Open</a><button class="btn primary sm" data-action="open-publish" data-id="${d.id}" data-pending="${v.v}">Review & publish</button></div></div></div>`; }).join('')}</div>` : `<div class="card empty">Nothing waiting for review.</div>`;
  }
  function manageFolders() {
    const cur = S.docs.filter(currentVersion).length, arch = S.docs.reduce((n, d) => n + d.versions.filter(v => v.status === 'archived').length, 0);
    const drafts = S.docs.filter(pendingVersion).length;
    return `<p class="muted small mb">Documents live as Markdown files in the repository's <a href="${ghView('content')}" ${ext}>content/</a> folder, mirroring the SharePoint structure. A build step compiles them into the site on every commit. <a href="${ghView('content/README.md')}" ${ext}>Authoring guide</a></p>
    <div class="grid cols-3">
      <div class="card folder locked"><div class="ico">📝</div><div><h3>Drafts</h3><div class="small muted"><span class="mono">content/drafts/</span><br>SME submissions waiting for L&D review. Not visible in Know, Ask or Learn.</div><div class="row mt-s"><span class="badge">${drafts} waiting</span><span class="badge warn">Restricted</span></div></div></div>
      <div class="card folder locked"><div class="ico">🗄️</div><div><h3>Archived versions</h3><div class="small muted"><span class="mono">content/archive/&lt;id&gt;/v&lt;N&gt;.md</span><br>Every superseded version, kept so completion records stay auditable. Never indexed by Ask.</div><div class="row mt-s"><span class="badge">${arch} versions</span><span class="badge warn">Restricted</span></div></div></div>
      <div class="card folder open"><div class="ico">📂</div><div><h3>Current versions</h3><div class="small muted"><span class="mono">content/current/&lt;id&gt;.md</span><br>One published version per document, filtered by department label in Know, Ask and Learn.</div><div class="row mt-s"><span class="badge">${cur} published</span><span class="badge ok">All access</span></div></div></div>
    </div>
    <div class="notice small mt">In the repository, Git history is the master record and the restricted folders are a convention. In the SharePoint version the master Word files would sit in a restricted library and be converted to this format on publish.</div>
    <div class="card mt"><h3>Labels</h3><p class="small muted">Every document carries a category and one or more department labels. Labels act as a filter for what each employee sees. They never change the content.</p>
      <table><thead><tr><th>Department</th><th>Documents visible</th></tr></thead><tbody>
      ${Object.values(D.DEPARTMENTS).map(dp => `<tr><td>${esc(dp.name)}</td><td class="small">${S.docs.filter(d => currentVersion(d) && (d.depts.includes('all') || d.depts.includes(dp.id))).length} (incl. company-wide)</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  function manageRequests() {
    const types = { question: 'Question', module: 'Module request', correction: 'Correction' };
    return `<div class="card pad-0"><table><thead><tr><th>Date</th><th>From</th><th>Type</th><th>Request</th><th>Status</th></tr></thead><tbody>
      ${[...S.requests].sort((a, b) => b.date.localeCompare(a.date)).map(rq => { const u = userById(rq.user); return `<tr><td class="small muted" style="white-space:nowrap">${fmtDate(rq.date)}</td><td class="small">${esc(u?.name || rq.user)}<div class="tiny muted">${esc(deptName((u && (S.deptOverride[u.id] || u.dept)) || ''))}</div></td><td><span class="badge ${rq.type === 'correction' ? 'danger' : rq.type === 'module' ? 'info' : ''}">${types[rq.type]}</span></td><td>${esc(rq.text)}</td>
        <td><select data-change="request-status" data-id="${rq.id}" style="width:auto;padding:4px 28px 4px 8px;font-size:13px"><option ${rq.status === 'open' ? 'selected' : ''}>open</option><option ${rq.status === 'planned' ? 'selected' : ''}>planned</option><option ${rq.status === 'done' ? 'selected' : ''}>done</option></select></td></tr>`; }).join('')}
    </tbody></table></div>`;
  }
  function manageStandards() {
    return `<div class="grid cols-2">
      <div class="card"><h3>Roles</h3><table><tbody>
        <tr><td><strong>Subject matter expert</strong></td><td class="small">Submits content, answers questions, signs off on technical accuracy of each version.</td></tr>
        <tr><td><strong>L&D</strong></td><td class="small">Framework, writing standards, structure, labels, version control, deciding what is pushed to queues.</td></tr>
        <tr><td><strong>Supervisor</strong></td><td class="small">Monitors team completion; cannot edit documentation.</td></tr>
        <tr><td><strong>Employee</strong></td><td class="small">Completes queue, searches Know, uses Ask, submits requests and corrections.</td></tr>
      </tbody></table></div>
      <div class="card"><h3>Document standard</h3><ul class="small" style="padding-left:18px;margin:8px 0 0;line-height:1.8">
        <li>One topic per document. Short, titled sections so Ask can cite precisely.</li>
        <li>Lead each section with the rule, then the reason, then the exception.</li>
        <li>Numbers and thresholds stated once, in the section they belong to.</li>
        <li>Every version has a one-sentence change summary written for employees, not editors.</li>
        <li>Mark the change <em>minor</em> (formatting, clarification) or <em>substantive</em> (rule, number, step changed).</li>
      </ul></div>
    </div>`;
  }
  function manageDoc(id) {
    const d = docById(id); if (!d) return `<div class="empty">Not found.</div>`;
    const cur = currentVersion(d), pend = pendingVersion(d);
    const completions = v => { const out = []; D.USERS.forEach(u => { Object.entries(progressOf(u.id)).forEach(([iid, rec]) => { const it = findItem(iid); if (!it) return; const usesDoc = it.docId === d.id || (it.docs && it.docs[0] === d.id); if (usesDoc && rec.version === v.v) out.push(`${u.name} (${fmtDate(rec.date)})`); }); }); return out; };
    return `<div class="row mb-s"><a href="#/manage/library" class="btn ghost sm">← Library</a></div>
    <div class="page-head"><div><h1>${esc(d.title)}</h1><p class="muted">${cat(d.category).icon} ${esc(cat(d.category).name)} · Owner: ${esc(d.owner)} · Visible to: ${esc(deptList(d.depts))}</p></div>
      <div class="row">${cur ? `<a class="btn sm" href="#/know/${d.id}">View as employee</a><button class="btn danger sm" data-action="archive-doc" data-id="${d.id}">Archive document</button>` : ''}${pend ? `<button class="btn primary sm" data-action="open-publish" data-id="${d.id}" data-pending="${pend.v}">Publish v${pend.v}</button>` : `<button class="btn primary sm" data-action="open-publish" data-id="${d.id}">Publish new version</button>`}</div></div>
    <div class="grid side-r">
      <div class="card"><h3>Version history</h3><div class="timeline mt">${[...d.versions].reverse().map(v => { const c = completions(v); return `<div class="tl-item ${v.status === 'published' ? 'current' : (v.status === 'archived' ? '' : 'pending')}">
        <div class="row spread"><div class="row"><strong>v${v.v}</strong><span class="badge ${v.status === 'published' ? 'ok' : v.status === 'archived' ? '' : 'info'}">${v.status}</span>${v.status !== 'draft' && v.status !== 'review' ? (v.pushed ? '<span class="badge warn">Pushed to queues</span>' : '<span class="badge">Minor · not pushed</span>') : ''}</div><span class="small muted">${fmtDate(v.date)}</span></div>
        <div class="small mt-s">${esc(v.summary)}</div>
        ${v.status === 'archived' && v.sections.length ? `<a class="tiny" href="#/know/${d.id}?v=${v.v}">View archived content</a>` : ''}
        ${c.length ? `<div class="tiny muted mt-s">Completed on this version: ${esc(c.join(', '))}</div>` : (v.status === 'published' || v.status === 'archived' ? `<div class="tiny muted mt-s">No completion records on this version.</div>` : '')}
      </div>`; }).join('')}</div></div>
      <div class="stack">
        <div class="card flat"><h3>Source files</h3><div class="small stack mt-s">
          ${cur ? `<div class="lock-note">📂 <a href="${ghView(`content/current/${d.id}.md`)}" ${ext}>content/current/${esc(d.id)}.md</a> · <a href="${ghEdit(`content/current/${d.id}.md`)}" ${ext}>edit</a></div>` : '<div class="lock-note">📂 content/current/ — not published</div>'}
          ${d.versions.filter(v => v.status === 'archived').map(v => `<div class="lock-note">🗄️ <a href="${ghView(`content/archive/${d.id}/v${v.v}.md`)}" ${ext}>content/archive/${esc(d.id)}/v${v.v}.md</a></div>`).join('') || '<div class="lock-note">🗄️ content/archive/ — none</div>'}
          ${pend ? `<div class="lock-note">📝 <a href="${ghView(`content/drafts/${d.id}.md`)}" ${ext}>content/drafts/${esc(d.id)}.md</a> · <a href="${ghEdit(`content/drafts/${d.id}.md`)}" ${ext}>edit</a></div>` : ''}
          <div class="muted tiny mt-s">Edit on GitHub and commit; the build validates and publishes within a minute. <a href="${ghView('content/README.md')}" ${ext}>Authoring guide</a></div></div></div>
        <div class="card flat small"><strong>Queue items from this document</strong>${S.ongoing.filter(o => o.docId === d.id).map(o => `<div class="mt-s"><a href="#/learn/${o.id}">${esc(o.title)}</a><div class="tiny muted">v${o.version} · ${esc(deptList(o.depts))} · ${D.USERS.filter(u => isDone(u.id, o.id)).length} completed</div></div>`).join('') || '<div class="muted mt-s">None</div>'}</div>
      </div>
    </div>`;
  }

  /* ---------- modals ---------- */
  function modalHtml(user) {
    const m = UI.modal; if (!m) return '';
    let body = '';
    if (m.type === 'request') body = `<h2>Suggest a topic or ask a question</h2><p class="small muted">Goes to Learning & Development. Use this for questions the documentation did not answer, requests for new modules, or corrections.</p>
      <form data-submit="request">
        <div class="field"><label>Type</label><select name="type"><option value="question">Question the docs did not answer</option><option value="module">Request a new module or document</option><option value="correction">Report an error or inconsistency</option></select></div>
        <div class="field"><label>Details</label><textarea name="text" rows="4" required>${esc(m.prefill || '')}</textarea></div>
        <div class="row" style="justify-content:flex-end"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary" type="submit">Send to L&D</button></div>
      </form>`;
    if (m.type === 'publish') {
      const d = docById(m.docId), cur = currentVersion(d), pend = m.pending ? d.versions.find(v => v.v === m.pending) : null;
      const nextV = pend ? pend.v : Math.max(...d.versions.map(v => v.v)) + 1;
      body = `<h2>Publish ${esc(d.title)} · v${nextV}</h2>
      <p class="small muted">${cur ? `v${cur.v} will move to the restricted Archived folder. Employees who completed v${cur.v} keep that record.` : 'This document is currently unpublished.'}</p>
      <div class="notice warn small mb">Demo only: this publishes in your browser. The real publish is a commit that moves <span class="mono">content/current/${esc(d.id)}.md</span> to <span class="mono">content/archive/${esc(d.id)}/v${cur ? cur.v : 1}.md</span> and adds the new current file. <a href="${ghView('content/README.md#publishing-a-new-version-ld')}" ${ext}>How to publish</a></div>
      <form data-submit="publish" data-id="${d.id}" data-pending="${pend ? pend.v : ''}">
        <div class="field"><label>Change summary (shown to employees in their queue)</label><textarea name="summary" rows="3" required placeholder="What changed and why it matters, in one or two sentences.">${esc(pend?.summary || '')}</textarea></div>
        <div class="field"><label>Type of change</label>
          <label class="checkrow"><input type="radio" name="kind" value="minor" ${!pend || !pend.pushed ? 'checked' : ''} data-change="publish-kind"><div><strong>Minor</strong><div class="hint">Formatting, clarification, typo. Published to Current but <strong>not</strong> pushed to learning queues.</div></div></label>
          <label class="checkrow mt-s"><input type="radio" name="kind" value="major" data-change="publish-kind"><div><strong>Substantive</strong><div class="hint">Rule, number, step or product changed. Creates an Ongoing Learning item with the change summary for the departments below.</div></div></label>
        </div>
        <div class="field" id="pushFields" style="display:${m.kind === 'major' ? 'block' : 'none'}">
          <label>Queue item title</label><input name="title" value="Update: ${esc(d.title)} (v${nextV})">
          <label class="mt-s">Push to departments</label>
          <div class="row">${['all', ...Object.keys(D.DEPARTMENTS)].map(dp => `<label class="row small" style="gap:4px"><input type="checkbox" name="depts" value="${dp}" ${d.depts.includes(dp) ? 'checked' : ''} style="width:auto"> ${esc(deptName(dp))}</label>`).join('')}</div>
          <div class="hint">Defaults to the document's labels. Employees in these departments will see the item in Ongoing Learning until they acknowledge it.</div>
        </div>
        <div class="row" style="justify-content:flex-end"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary" type="submit">Publish v${nextV}</button></div>
      </form>`;
    }
    if (m.type === 'confirm') body = `<h2>${esc(m.title)}</h2><p class="small muted">${esc(m.text)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-action="close-modal">Cancel</button><button class="btn danger" data-action="${m.action}" data-id="${m.id}" data-confirmed="1">${esc(m.ok)}</button></div>`;
    return `<div class="modal-bg" data-action="close-modal-bg"><div class="modal">${body}</div></div>`;
  }

  /* ---------- render ---------- */
  function render() {
    const r = route(), user = me();
    let body = '';
    switch (r.page) {
      case 'learn': body = r.a ? modulePage(r.a, user) : learnPage(user); break;
      case 'know': body = r.a ? docPage(r.a, user, r.query) : knowPage(user); break;
      case 'ask': body = askPage(user); break;
      case 'team': body = (user.role === 'supervisor' || user.role === 'admin') ? teamPage(user) : `<div class="card"><div class="notice warn">Team view is available to supervisors.</div></div>`; break;
      case 'manage': body = managePage(user, r); break;
      default: body = learnPage(user);
    }
    const focused = document.activeElement; const focusSel = focused?.dataset?.input; const selStart = focused?.selectionStart;
    document.getElementById('app').innerHTML = `${topbar(r, user)}<main>${body}</main>
      <button class="fab" data-action="open-request">💬 <span>Suggest a topic</span></button>
      ${modalHtml(user)}${UI.toast ? `<div class="toast">${esc(UI.toast)}</div>` : ''}
      <footer class="muted tiny" style="text-align:center;padding:10px 16px 20px">Knowledge Center proof of concept · demo data lives in your browser · <a href="#" data-action="reset">reset demo data</a></footer>`;
    if (focusSel) { const el = document.querySelector(`[data-input="${focusSel}"]`); if (el) { el.focus(); try { el.setSelectionRange(selStart, selStart); } catch {} } }
    if (r.page === 'know' && r.a && r.query.get('s')) { const el = document.getElementById('s' + r.query.get('s')); el && setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const row = e.target.closest('[data-href]'); if (row && !e.target.closest('a,button,select')) { go(row.dataset.href); return; }
    const el = e.target.closest('[data-action]'); if (!el) return;
    const a = el.dataset.action, id = el.dataset.id;
    if (a === 'close-modal-bg' && e.target !== el) return;
    switch (a) {
      case 'close-modal': case 'close-modal-bg': UI.modal = null; render(); break;
      case 'open-request': e.preventDefault(); UI.modal = { type: 'request', prefill: el.dataset.prefill || '' }; render(); break;
      case 'open-publish': UI.modal = { type: 'publish', docId: id, pending: el.dataset.pending ? Number(el.dataset.pending) : null, kind: 'minor' }; render(); break;
      case 'know-cat': UI.knowCat = id; render(); break;
      case 'ask-sample': UI.askDraft = ''; submitAsk(el.dataset.q); break;
      case 'ask-clear': UI.chat[S.user] = []; render(); break;
      case 'ack': completeItem(S.user, findItem(id)); toast('Update acknowledged and recorded.'); break;
      case 'team-open': UI.teamMember = id; render(); break;
      case 'team-back': UI.teamMember = null; render(); break;
      case 'scroll': e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
      case 'archive-doc':
        if (!el.dataset.confirmed) { UI.modal = { type: 'confirm', title: 'Archive this document?', text: 'It will disappear from Know, Ask and Learn for everyone. Completion records are kept. You can republish later.', ok: 'Archive', action: 'archive-doc', id }; render(); }
        else { archiveDoc(id); UI.modal = null; toast('Document archived. Completion records retained.'); }
        break;
      case 'reset': e.preventDefault(); if (confirm('Reset all demo data (progress, requests, published versions)?')) { localStorage.removeItem(LS_KEY); load(); UI.chat = {}; UI.quizResult = null; toast('Demo data reset.'); } break;
    }
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]'); if (!el) return;
    switch (el.dataset.change) {
      case 'switch-user': S.user = el.value; UI.teamMember = null; UI.quizResult = null; save(); const r = route(); if ((r.page === 'manage' && me().role !== 'admin') || (r.page === 'team' && me().role === 'employee')) go('#/learn'); else render(); break;
      case 'switch-dept': S.deptOverride[S.user] = el.value; save(); toast(`Department changed to ${deptName(el.value)}. Company-wide progress kept.`); break;
      case 'request-status': { const rq = S.requests.find(x => x.id === el.dataset.id); rq.status = el.value; save(); render(); break; }
      case 'publish-kind': UI.modal.kind = el.value; document.getElementById('pushFields').style.display = el.value === 'major' ? 'block' : 'none'; break;
    }
  });
  document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (!el) return; if (el.dataset.input === 'know-search') { UI.knowQuery = el.value; render(); } });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-submit]'); if (!f) return; e.preventDefault();
    const fd = new FormData(f);
    switch (f.dataset.submit) {
      case 'quiz': {
        const m = findItem(f.dataset.id); const answers = m.quiz.map((_, i) => Number(fd.get('q' + i)));
        const wrong = m.quiz.filter((q, i) => answers[i] !== q.c).length;
        UI.quizResult = { id: m.id, answers, wrong, pass: wrong === 0 };
        if (wrong === 0) { completeItem(S.user, m); toast('Module complete. Nice work.'); } else render();
        break;
      }
      case 'ask': { const q = fd.get('q').trim(); if (!q) return; UI.askDraft = ''; submitAsk(q); break; }
      case 'request': {
        S.requests.push({ id: 'r' + Date.now(), user: S.user, date: TODAY, type: fd.get('type'), text: fd.get('text').trim(), status: 'open' });
        save(); UI.modal = null; toast('Sent to L&D. It will appear in their Requests inbox.'); break;
      }
      case 'publish': {
        const push = fd.get('kind') === 'major';
        publishVersion(f.dataset.id, { summary: fd.get('summary').trim(), push, depts: push ? (fd.getAll('depts').length ? fd.getAll('depts') : docById(f.dataset.id).depts) : [], title: fd.get('title'), pendingV: f.dataset.pending ? Number(f.dataset.pending) : null });
        UI.modal = null; toast(push ? 'Published and pushed to learning queues.' : 'Published. Minor change, not pushed to queues.'); break;
      }
    }
  });
  function submitAsk(q) { const user = me(); const chat = (UI.chat[user.id] = UI.chat[user.id] || []); chat.push({ role: 'user', text: q }); chat.push({ role: 'bot', q, result: ask(q, user) }); render(); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 30); }

  window.addEventListener('hashchange', () => { UI.quizResult = null; UI.modal = null; render(); window.scrollTo(0, 0); });
  load(); render();
})();
