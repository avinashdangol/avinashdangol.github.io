/* Kam Ko Khoji PL — admin dashboard */
(() => {
  'use strict';
  const cfg = window.KKK_CONFIG || {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = iso => iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  const DOCS = { visa: 'Passport + visa', trc: 'TRC card', trc_applied: 'TRC applied', other: 'Other' };

  function toast(msg, bad = false) {
    const t = $('#toast');
    t.textContent = msg; t.classList.toggle('bad', bad); t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3500);
  }

  if (!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase)) {
    $('#notConfigured').hidden = false;
    return;
  }
  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  let jobs = [], apps = [], tab = 'pending';

  async function start() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { $('#loginForm').hidden = false; return; }
    const { data: isAdmin, error } = await sb.rpc('is_admin');
    if (error || !isAdmin) {
      await sb.auth.signOut();
      $('#loginForm').hidden = false;
      return toast('This account is not an admin.', true);
    }
    $('#loginForm').hidden = true;
    $('#panel').hidden = false;
    $('#logoutBtn').hidden = false;
    load();
  }

  async function load() {
    const [j, a] = await Promise.all([
      sb.from('jobs').select('*').order('created_at', { ascending: false }),
      sb.from('applications').select('*, jobs(title, company, city, contact_name, contact_phone, contact_email)').order('created_at', { ascending: false })
    ]);
    if (j.error || a.error) { console.error(j.error || a.error); return toast('Loading failed', true); }
    jobs = j.data; apps = a.data;
    const now = Date.now();
    const live = jobs.filter(x => x.status === 'approved' && new Date(x.expires_at) > now);
    $('#cPending').textContent = jobs.filter(x => x.status === 'pending').length;
    $('#cApproved').textContent = live.length;
    $('#cClosed').textContent = jobs.length - live.length - jobs.filter(x => x.status === 'pending').length;
    $('#cApps').textContent = apps.filter(x => x.status === 'new').length + ' new';
    render();
  }

  function jobRow(j) {
    const expired = new Date(j.expires_at) < Date.now();
    const acts = [];
    if (j.status === 'pending') acts.push(`<button class="btn btn-ok" data-job="${j.id}" data-set="approved">Approve</button><button class="btn btn-no" data-job="${j.id}" data-set="rejected">Reject</button>`);
    if (j.status === 'approved') acts.push(`<button class="btn btn-outline" data-extend="${j.id}">+30 days</button><button class="btn btn-no" data-job="${j.id}" data-set="closed">Close</button>`);
    if (j.status !== 'pending' && j.status !== 'approved') acts.push(`<button class="btn btn-outline" data-job="${j.id}" data-set="approved">Re-open</button>`);
    acts.push(`<button class="btn btn-no" data-deljob="${j.id}">Delete</button>`);
    return `<div class="row">
      <span class="status">${esc(j.status)}${expired && j.status === 'approved' ? ' · expired' : ''}</span>
      <h3>${esc(j.title)}</h3>
      <p class="meta">${esc(j.company)} · ${esc(j.city)} · ${esc(j.category)} · posted ${fmt(j.created_at)} · expires ${fmt(j.expires_at)}</p>
      <p class="meta">${esc(j.salary || '')} ${j.hours ? '· ' + esc(j.hours) : ''} ${j.contract ? '· ' + esc(j.contract) : ''} · docs: ${(j.docs_accepted || []).map(d => esc(DOCS[d] || d)).join(', ') || '—'} ${j.accommodation ? '· accommodation' : ''}</p>
      <div class="desc">${esc(j.description)}</div>
      <div class="private">Poster (private): <b>${esc(j.contact_name)}</b> · ${esc(j.contact_phone)} ${j.contact_email ? '· ' + esc(j.contact_email) : ''}</div>
      <div class="acts">${acts.join('')}</div>
    </div>`;
  }

  function appRow(a) {
    const job = a.jobs;
    const files = (a.doc_paths || []).map((p, i) => `<button class="btn btn-outline" data-file="${esc(p)}">Document ${i + 1}</button>`).join('');
    const opts = ['new', 'contacted', 'forwarded', 'hired', 'rejected'].map(s => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('');
    return `<div class="row">
      <span class="status">${esc(a.status)}</span>
      <h3>${esc(a.full_name)} <small class="muted">· ${esc(DOCS[a.doc_status] || a.doc_status)}</small></h3>
      <p class="meta">${fmt(a.created_at)} · ${job ? `for <b>${esc(job.title)}</b> (${esc(job.company)}, ${esc(job.city)})` : '<b>General profile</b> (no specific job)'}</p>
      <div class="private">Phone: <a href="tel:${esc(a.phone)}">${esc(a.phone)}</a> ${a.email ? `· <a href="mailto:${esc(a.email)}">${esc(a.email)}</a>` : ''} ${a.current_city ? '· lives in ' + esc(a.current_city) : ''}</div>
      ${a.message ? `<div class="desc">${esc(a.message)}</div>` : ''}
      ${job ? `<p class="meta">Employer contact: ${esc(job.contact_name)} · ${esc(job.contact_phone)} ${job.contact_email ? '· ' + esc(job.contact_email) : ''}</p>` : ''}
      <div class="acts">${files}
        <select class="inline" data-appstatus="${a.id}">${opts}</select>
        <button class="btn btn-no" data-delapp="${a.id}">Delete (with documents)</button>
      </div>
    </div>`;
  }

  function render() {
    const now = Date.now();
    let html = '';
    if (tab === 'apps') html = apps.map(appRow).join('');
    else {
      const list = jobs.filter(j => {
        const live = j.status === 'approved' && new Date(j.expires_at) > now;
        if (tab === 'pending') return j.status === 'pending';
        if (tab === 'approved') return live;
        return j.status !== 'pending' && !live;
      });
      html = list.map(jobRow).join('');
    }
    $('#list').innerHTML = html || '<p class="empty">Nothing here.</p>';
  }

  // ---------- actions ----------
  async function setJob(id, status) {
    const patch = { status };
    if (status === 'approved') patch.expires_at = new Date(Date.now() + 30 * 864e5).toISOString();
    const { error } = await sb.from('jobs').update(patch).eq('id', id);
    if (error) return toast(error.message, true);
    toast(`Job ${status}`); load();
  }
  async function extend(id) {
    const j = jobs.find(x => x.id === id);
    const base = Math.max(Date.now(), new Date(j.expires_at).getTime());
    const { error } = await sb.from('jobs').update({ expires_at: new Date(base + 30 * 864e5).toISOString() }).eq('id', id);
    if (error) return toast(error.message, true);
    toast('Extended 30 days'); load();
  }
  async function delJob(id) {
    if (!confirm('Delete this job permanently? Applications for it stay, but lose the job link.')) return;
    const { error } = await sb.from('jobs').delete().eq('id', id);
    if (error) return toast(error.message, true);
    toast('Job deleted'); load();
  }
  async function openFile(path) {
    const { data, error } = await sb.storage.from('documents').createSignedUrl(path, 300);
    if (error) return toast(error.message, true);
    window.open(data.signedUrl, '_blank', 'noopener');
  }
  async function setApp(id, status) {
    const { error } = await sb.from('applications').update({ status }).eq('id', id);
    if (error) return toast(error.message, true);
    toast('Saved'); load();
  }
  async function delApp(id) {
    if (!confirm('Delete this application and its documents permanently?')) return;
    const a = apps.find(x => x.id === id);
    if (a?.doc_paths?.length) {
      const { error } = await sb.storage.from('documents').remove(a.doc_paths);
      if (error) return toast(error.message, true);
    }
    const { error } = await sb.from('applications').delete().eq('id', id);
    if (error) return toast(error.message, true);
    toast('Application deleted'); load();
  }

  // ---------- events ----------
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fm = e.currentTarget;
    const { error } = await sb.auth.signInWithPassword({ email: fm.email.value, password: fm.password.value });
    if (error) return toast(error.message, true);
    start();
  });
  $('#logoutBtn').addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });
  $('#refreshBtn').addEventListener('click', load);
  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    tab = b.dataset.tab;
    document.querySelectorAll('#tabs .chip').forEach(c => c.setAttribute('aria-pressed', c === b));
    render();
  });
  $('#list').addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.set) setJob(t.dataset.job, t.dataset.set);
    else if (t.dataset.extend) extend(t.dataset.extend);
    else if (t.dataset.deljob) delJob(t.dataset.deljob);
    else if (t.dataset.file) openFile(t.dataset.file);
    else if (t.dataset.delapp) delApp(t.dataset.delapp);
  });
  $('#list').addEventListener('change', e => {
    if (e.target.dataset.appstatus) setApp(e.target.dataset.appstatus, e.target.value);
  });

  start();
})();
