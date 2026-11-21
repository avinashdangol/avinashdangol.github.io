/* Kam Ko Khoji PL — public site */
(() => {
  'use strict';

  const cfg = window.KKK_CONFIG || {};
  const LIVE = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = LIVE ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  // Only these columns are public (poster's phone/email stay private)
  const PUBLIC_COLS = 'id,created_at,title,company,city,category,salary,contract,hours,accommodation,docs_accepted,languages,description';
  const MAX_FILES = 3, MAX_MB = 5;
  const OK_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  const CATS = {
    factory: ['Factory', 'फ्याक्ट्री'],
    warehouse: ['Warehouse', 'गोदाम'],
    food: ['Restaurant / Kitchen', 'रेस्टुरेन्ट'],
    cleaning: ['Cleaning', 'सफाइ'],
    construction: ['Construction', 'निर्माण'],
    driver: ['Driver / Delivery', 'ड्राइभर'],
    hotel: ['Hotel', 'होटल'],
    other: ['Other', 'अन्य']
  };
  const DOCS = { visa: 'Passport + visa', trc: 'TRC card', trc_applied: 'TRC applied OK' };
  const CONTRACTS = { uop: 'Umowa o pracę', uz: 'Umowa zlecenie', b2b: 'B2B', other: 'Other' };

  const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();
  const DEMO = [
    { id: 'demo-1', created_at: daysAgo(0), title: 'Production worker (food packing)', company: 'Example Foods Sp. z o.o.', city: 'Wrocław', category: 'factory', salary: '28 zł/h brutto', contract: 'uz', hours: '10–12 h/day, 6 days', accommodation: true, docs_accepted: ['trc', 'trc_applied', 'visa'], languages: 'No Polish needed', description: 'Packing ready meals on a production line.\nFree transport from the hostel to the factory.\nStart: next Monday.' },
    { id: 'demo-2', created_at: daysAgo(1), title: 'Warehouse picker', company: 'Example Logistics', city: 'Poznań', category: 'warehouse', salary: '27–31 zł/h', contract: 'uop', hours: '3 shifts, 8 h', accommodation: false, docs_accepted: ['trc'], languages: 'Basic English', description: 'Picking orders with a hand scanner. Overtime available. Contract of employment after 3 months.' },
    { id: 'demo-3', created_at: daysAgo(2), title: 'Kitchen helper', company: 'Example Ramen Bar', city: 'Warszawa', category: 'food', salary: '25 zł/h netto', contract: 'uz', hours: 'Evenings + weekends', accommodation: false, docs_accepted: ['trc', 'trc_applied'], languages: 'English', description: 'Preparing vegetables, dishwashing and helping the chef. Free meal every shift.' },
    { id: 'demo-4', created_at: daysAgo(3), title: 'Hotel housekeeping', company: 'Example Hotel', city: 'Kraków', category: 'hotel', salary: '4 800 zł/month', contract: 'uop', hours: '8 h, 5 days', accommodation: true, docs_accepted: ['trc', 'visa'], languages: 'Basic English', description: 'Cleaning rooms and common areas. Shared accommodation available for 500 zł/month.' },
    { id: 'demo-5', created_at: daysAgo(5), title: 'Delivery driver (category B)', company: 'Example Courier', city: 'Gdańsk', category: 'driver', salary: '30 zł/h', contract: 'b2b', hours: 'Flexible', accommodation: false, docs_accepted: ['trc'], languages: 'English, basic Polish', description: 'Polish or EU driving licence category B required. Company van provided.' }
  ];
  const DEFAULT_CITIES = ['Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk', 'Łódź', 'Katowice', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Rzeszów', 'Gdynia', 'Toruń', 'Białystok', 'Olsztyn'];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  let jobs = [];
  const f = { q: '', city: '', cat: '', accom: false, applied: false };

  // ---------- helpers ----------
  let toastTimer;
  function toast(msg, bad = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('bad', bad);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
  }
  function ago(iso) {
    const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    if (d <= 0) return 'Today · आज';
    if (d === 1) return '1 day ago';
    return `${d} days ago`;
  }
  const catLabel = c => (CATS[c] || CATS.other)[0];

  // ---------- load ----------
  async function loadJobs() {
    if (!LIVE) {
      jobs = DEMO;
      $('#demoBanner').hidden = false;
    } else {
      $('#jobList').innerHTML = '<p class="empty">Loading jobs… लोड हुँदैछ…</p>';
      const { data, error } = await sb.from('jobs').select(PUBLIC_COLS).order('created_at', { ascending: false }).limit(300);
      if (error) {
        console.error(error);
        toast('Could not load jobs. Please refresh the page.', true);
        jobs = [];
      } else {
        jobs = data || [];
      }
    }
    fillCities();
    render();
    openFromHash();
  }

  function fillCities() {
    const inJobs = [...new Set(jobs.map(j => j.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'));
    const sel = $('#city');
    sel.length = 1;
    inJobs.forEach(c => sel.add(new Option(c, c)));
    const all = [...new Set([...DEFAULT_CITIES, ...inJobs])].sort((a, b) => a.localeCompare(b, 'pl'));
    $('#cityList').innerHTML = all.map(c => `<option value="${esc(c)}">`).join('');
    $('#statJobs').textContent = jobs.length;
    $('#statCities').textContent = inJobs.length;
  }

  // ---------- render ----------
  function matches(j) {
    const q = f.q.trim().toLowerCase();
    if (q) {
      const hay = `${j.title} ${j.company} ${j.city} ${j.description} ${(CATS[j.category] || []).join(' ')}`.toLowerCase();
      if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
    }
    if (f.city && j.city !== f.city) return false;
    if (f.cat && j.category !== f.cat) return false;
    if (f.accom && !j.accommodation) return false;
    if (f.applied && !(j.docs_accepted || []).includes('trc_applied')) return false;
    return true;
  }

  function card(j) {
    const docs = (j.docs_accepted || []).map(d => `<span class="tag">${esc(DOCS[d] || d)}</span>`).join('');
    return `<article class="job">
      <div class="job-top"><span class="cat">${esc(catLabel(j.category))}</span><span class="when">${ago(j.created_at)}${LIVE ? '' : '<span class="example-tag">EXAMPLE</span>'}</span></div>
      <h3>${esc(j.title)}</h3>
      <p class="company">${esc(j.company)} · <b>${esc(j.city)}</b></p>
      <ul class="facts">
        ${j.salary ? `<li><b>Salary</b>${esc(j.salary)}</li>` : ''}
        ${j.hours ? `<li><b>Hours</b>${esc(j.hours)}</li>` : ''}
        ${j.contract ? `<li><b>Contract</b>${esc(CONTRACTS[j.contract] || j.contract)}</li>` : ''}
      </ul>
      <div class="tags">${docs}${j.accommodation ? '<span class="tag home">Accommodation</span>' : ''}</div>
      <div class="job-actions">
        <button class="btn btn-dark" type="button" data-open="${esc(j.id)}">View & apply · आवेदन</button>
        <button class="icon-btn" type="button" data-report="${esc(j.id)}">Report</button>
      </div>
    </article>`;
  }

  function render() {
    const list = jobs.filter(matches);
    $('#jobList').innerHTML = list.map(card).join('');
    $('#emptyMsg').hidden = list.length > 0;
  }

  function buildChips() {
    const wrap = $('#catChips');
    const items = [['', ['All', 'सबै']], ...Object.entries(CATS)];
    wrap.innerHTML = items.map(([k, [en, ne]]) =>
      `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === f.cat}">${en} · ${ne}</button>`).join('');
    $('#postCategory').innerHTML = '<option value="">— choose —</option>' +
      Object.entries(CATS).map(([k, [en, ne]]) => `<option value="${k}">${en} · ${ne}</option>`).join('');
  }

  // ---------- dialog ----------
  const dlg = $('#applyDialog');

  function openApply(job) {
    const form = $('#applyForm');
    form.reset();
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    form.hidden = false;
    $('#applyDone').hidden = true;
    form.job_id.value = job ? job.id : '';

    if (job) {
      const url = `${location.origin}${location.pathname}#job-${job.id}`;
      const shareText = encodeURIComponent(`${job.title} – ${job.city}\n${url}`);
      $('#applyHeading').textContent = 'Apply for this job · आवेदन दिनुहोस्';
      $('#dlgJob').innerHTML = `
        <span class="cat">${esc(catLabel(job.category))}</span>
        <h2 id="dlgTitle">${esc(job.title)}</h2>
        <p class="company">${esc(job.company)} · <b>${esc(job.city)}</b> · ${ago(job.created_at)}</p>
        <ul class="facts">
          ${job.salary ? `<li><b>Salary</b>${esc(job.salary)}</li>` : ''}
          ${job.hours ? `<li><b>Hours</b>${esc(job.hours)}</li>` : ''}
          ${job.contract ? `<li><b>Contract</b>${esc(CONTRACTS[job.contract] || job.contract)}</li>` : ''}
          ${job.languages ? `<li><b>Language</b>${esc(job.languages)}</li>` : ''}
        </ul>
        <div class="tags">${(job.docs_accepted || []).map(d => `<span class="tag">${esc(DOCS[d] || d)}</span>`).join('')}${job.accommodation ? '<span class="tag home">Accommodation</span>' : ''}</div>
        <div class="desc">${esc(job.description)}</div>
        <div class="share">
          <a class="icon-btn" href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener">Share on WhatsApp</a>
          <a class="icon-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Share on Facebook</a>
          <button class="icon-btn" type="button" data-copy="${esc(url)}">Copy link</button>
        </div>`;
      history.replaceState(null, '', `#job-${job.id}`);
    } else {
      $('#applyHeading').textContent = 'Send your profile · आफ्नो प्रोफाइल पठाउनुहोस्';
      $('#dlgJob').innerHTML = `<h2 id="dlgTitle">Looking for work? · काम खोज्दै हुनुहुन्छ?</h2>
        <p>Send your details once. When a matching job comes, we will contact you.</p>`;
    }
    dlg.showModal();
  }

  function closeDialog(d) {
    d.close();
    if (location.hash.startsWith('#job-')) history.replaceState(null, '', location.pathname);
  }

  function openFromHash() {
    const m = location.hash.match(/^#job-(.+)$/);
    if (!m) return;
    const job = jobs.find(j => String(j.id) === decodeURIComponent(m[1]));
    if (job) openApply(job);
  }

  // ---------- validation ----------
  function checkRequired(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      const bad = el.type === 'checkbox' ? !el.checked : !String(el.value).trim() || (el.type === 'file' ? !el.files.length : !el.checkValidity());
      el.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    form.querySelectorAll('input[type=email]').forEach(el => {
      if (el.value && !el.checkValidity()) { el.classList.add('invalid'); ok = false; }
    });
    if (!ok) {
      toast('Please fill all required (*) fields · * भएका सबै भर्नुहोस्', true);
      form.querySelector('.invalid')?.focus();
    }
    return ok;
  }

  function checkFiles(files) {
    if (files.length > MAX_FILES) return `Maximum ${MAX_FILES} files.`;
    for (const file of files) {
      if (!OK_TYPES.includes(file.type)) return `"${file.name}" — only PDF, JPG or PNG allowed.`;
      if (file.size > MAX_MB * 1024 * 1024) return `"${file.name}" is bigger than ${MAX_MB} MB.`;
    }
    return '';
  }

  // ---------- submit: application ----------
  async function submitApply(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.website.value) return showDone(); // bot trap
    if (!checkRequired(form)) return;

    const files = [...form.docs.files];
    const fileErr = checkFiles(files);
    if (fileErr) { form.docs.classList.add('invalid'); return toast(fileErr, true); }

    const btn = form.querySelector('[type=submit]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending… पठाउँदै…';

    try {
      if (!LIVE) { await sleep(700); showDone(); toast('Demo mode — nothing was sent.'); return; }

      const appId = crypto.randomUUID();
      const paths = [];
      for (const [i, file] of files.entries()) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
        const path = `${appId}/${i + 1}.${ext}`;
        const { error } = await sb.storage.from('documents').upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
        paths.push(path);
      }
      const jobId = form.job_id.value;
      const { error } = await sb.from('applications').insert({
        id: appId,
        job_id: jobId && !jobId.startsWith('demo') ? jobId : null,
        full_name: form.full_name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim() || null,
        current_city: form.current_city.value.trim() || null,
        doc_status: form.doc_status.value,
        doc_paths: paths,
        message: form.message.value.trim() || null,
        consent: true
      });
      if (error) throw error;
      showDone();
    } catch (err) {
      console.error(err);
      toast('Sorry, sending failed. Please try again · फेरि प्रयास गर्नुहोस्।', true);
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  }
  function showDone() {
    $('#applyForm').hidden = true;
    $('#applyDone').hidden = false;
    $('#applyDone').scrollIntoView({ block: 'center' });
  }

  // ---------- submit: new job ----------
  async function submitJob(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.website.value) { form.reset(); return toast('Thank you! Your job will appear after review.'); }
    if (!checkRequired(form)) return;

    const row = {
      title: form.title.value.trim(),
      company: form.company.value.trim(),
      city: form.city.value.trim(),
      category: form.category.value,
      salary: form.salary.value.trim() || null,
      hours: form.hours.value.trim() || null,
      contract: form.contract.value || null,
      languages: form.languages.value.trim() || null,
      accommodation: form.accommodation.checked,
      docs_accepted: [...form.querySelectorAll('input[name=docs]:checked')].map(i => i.value),
      description: form.description.value.trim(),
      contact_name: form.contact_name.value.trim(),
      contact_phone: form.contact_phone.value.trim(),
      contact_email: form.contact_email.value.trim() || null,
      status: 'pending'
    };

    const btn = form.querySelector('[type=submit]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending… पठाउँदै…';
    try {
      if (!LIVE) { await sleep(600); }
      else {
        const { error } = await sb.from('jobs').insert(row);
        if (error) throw error;
      }
      form.reset();
      form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
      toast(LIVE ? 'Thank you! Your job will appear after review · धन्यवाद!' : 'Demo mode — job not saved.');
    } catch (err) {
      console.error(err);
      toast('Sorry, could not send. Please try again.', true);
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  }

  // ---------- report ----------
  function report(id) {
    const job = jobs.find(j => String(j.id) === id);
    const subject = encodeURIComponent(`Report job: ${job ? job.title : id}`);
    const body = encodeURIComponent(`Job ID: ${id}\nTitle: ${job?.title || ''}\nCity: ${job?.city || ''}\n\nWhat is wrong?\n`);
    if (cfg.CONTACT_EMAIL) location.href = `mailto:${cfg.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    else if (cfg.WHATSAPP) window.open(`https://wa.me/${cfg.WHATSAPP}?text=${body}`, '_blank', 'noopener');
    else toast('Thanks — reporting will work once contact details are added.');
  }

  // ---------- events ----------
  function bind() {
    $('#searchForm').addEventListener('submit', e => {
      e.preventDefault();
      f.q = $('#q').value; f.city = $('#city').value;
      render();
      $('#jobs').scrollIntoView();
    });
    $('#q').addEventListener('input', e => { f.q = e.target.value; render(); });
    $('#city').addEventListener('change', e => { f.city = e.target.value; render(); });
    $('#fAccom').addEventListener('change', e => { f.accom = e.target.checked; render(); });
    $('#fApplied').addEventListener('change', e => { f.applied = e.target.checked; render(); });

    $('#catChips').addEventListener('click', e => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      f.cat = b.dataset.cat;
      document.querySelectorAll('#catChips .chip').forEach(c => c.setAttribute('aria-pressed', c === b));
      render();
    });

    document.addEventListener('click', e => {
      const open = e.target.closest('[data-open]');
      if (open) return openApply(jobs.find(j => String(j.id) === open.dataset.open));
      const rep = e.target.closest('[data-report]');
      if (rep) return report(rep.dataset.report);
      const cp = e.target.closest('[data-copy]');
      if (cp) { navigator.clipboard?.writeText(cp.dataset.copy).then(() => toast('Link copied')); return; }
      const cl = e.target.closest('[data-close]');
      if (cl) return closeDialog(cl.closest('dialog'));
    });
    document.querySelectorAll('dialog').forEach(d => {
      d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
      d.addEventListener('cancel', () => { if (location.hash.startsWith('#job-')) history.replaceState(null, '', location.pathname); });
    });

    $('#registerBtn').addEventListener('click', () => openApply(null));
    $('#applyForm').addEventListener('submit', submitApply);
    $('#postForm').addEventListener('submit', submitJob);
    document.querySelectorAll('.form').forEach(fm => fm.addEventListener('input', e => e.target.classList.remove('invalid')));
    $('#privacyLink').addEventListener('click', e => { e.preventDefault(); $('#privacyDialog').showModal(); });
    window.addEventListener('hashchange', openFromHash);

    if (cfg.WHATSAPP) { const a = $('#footerWa'); a.href = `https://wa.me/${cfg.WHATSAPP}`; a.hidden = false; }
    if (cfg.CONTACT_EMAIL) { const a = $('#footerMail'); a.href = `mailto:${cfg.CONTACT_EMAIL}`; a.hidden = false; }
  }

  buildChips();
  bind();
  loadJobs();
})();
