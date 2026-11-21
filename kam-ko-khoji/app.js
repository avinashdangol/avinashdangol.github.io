/* Kam Ko Khoji PL — public site */
(() => {
  'use strict';

  const cfg = window.KKK_CONFIG || {};
  const LIVE = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = LIVE ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  // Only these columns are public (poster phone/email stay private)
  const PUBLIC_COLS = 'id,created_at,title,company,city,category,salary,contract,hours,accommodation,docs_accepted,languages,description';
  const MAX_FILES = 3, MAX_MB = 5;
  const OK_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  // ---------- translations ----------
  const T = {
    en: {
      nav_jobs: 'Jobs', nav_post: 'Post a job', nav_safety: 'Safety', btn_post: 'Post a job',
      eyebrow: 'For Nepali people in Poland',
      search_ph: 'Job title or keyword', all_cities: 'All cities', all_types: 'All job types', search_btn: 'Search',
      stat_jobs: 'open jobs', stat_cities: 'cities', stat_fee: 'fee for workers',
      send_profile: "Haven't found a job? Send your profile →",
      jobs_title: 'Latest jobs', f_accom: 'Accommodation', f_applied: 'TRC applied OK',
      results: n => n === 1 ? '1 job found' : `${n} jobs found`,
      empty: 'No jobs match your search. Try another city — or send your profile and we will contact you when a job comes.',
      loading: 'Loading jobs…', view_apply: 'View & apply', report: 'Report',
      salary: 'Salary', hours: 'Hours', contract: 'Contract', language: 'Language',
      today: 'Today', day_ago: '1 day ago', days_ago: n => `${n} days ago`,
      how1_t: 'Find', how1_d: 'Search jobs by city and type. Every job is checked before it goes live.',
      how2_t: 'Apply', how2_d: 'Send your details and documents — passport, visa, TRC or TRC-applied proof.',
      how3_t: 'Get a call', how3_d: 'We share your application only with that employer, and they contact you.',
      post_title: 'Post a job', post_intro: 'Employer, agency or friend — anyone can post a job and help others find work.',
      post_free: 'Free to post', post_checked: 'Checked within 24 hours', post_private: 'Your phone and email stay private',
      f_title: 'Job title', ph_title: 'e.g. Warehouse worker', f_company: 'Company', f_city: 'City', f_type: 'Job type',
      f_salary: 'Salary', ph_salary: 'e.g. 30 zł/h brutto', f_docs: 'Documents accepted',
      doc_visa: 'Passport + visa', doc_trc: 'TRC card', doc_trc_applied: 'TRC applied OK',
      doc_trc_full: 'TRC (Karta pobytu)', doc_trc_applied_full: 'TRC applied (stamp / proof)',
      f_accom_prov: 'Accommodation provided', f_desc: 'Job description', ph_desc: 'What is the work? Shifts, transport, start date…',
      f_name: 'Your name', f_phone: 'Phone / WhatsApp', more: 'More details (optional)',
      f_hours: 'Working hours', ph_hours: 'e.g. 10–12 h/day', f_contract: 'Contract', choose: 'Choose', other: 'Other',
      f_lang: 'Languages needed', ph_lang: 'e.g. Basic English', f_email: 'Email',
      no_fee: 'I confirm this is a real job and workers will not be asked to pay any fee.',
      submit_job: 'Submit job',
      safety_title: 'Stay safe',
      s1_t: 'Never pay for a job', s1_d: 'A real employer never asks workers for money for a job, a contract or a visa file.',
      s2_t: 'Keep your passport', s2_d: 'Share a copy only. No one may keep your original passport or TRC card.',
      s3_t: 'Get a written contract', s3_d: 'Sign an umowa before you start and keep a copy. Ask for it in English if needed.',
      s4_t: 'Report bad jobs', s4_d: 'Use the Report button on any job and our team will check it.',
      footer_about: 'A free community job board for Nepali people in Poland.', privacy: 'Privacy',
      apply_h: 'Apply for this job', profile_h: 'Send your profile',
      profile_t: 'Looking for work?', profile_d: 'Send your details once. When a matching job comes, we will contact you.',
      a_name: 'Full name', a_email: 'Email (optional)', a_city: 'City you live in', a_docstatus: 'Your documents',
      a_upload: 'Upload documents', a_upload_hint: 'Passport, visa / TRC or TRC-applied proof. Up to 3 files · PDF, JPG or PNG · max 5 MB each.',
      a_msg: 'Experience (optional)', ph_msg: 'e.g. 1 year warehouse experience',
      consent: 'I agree that Kam Ko Khoji stores my details and documents and shares them only with the employer for this job. I can ask for deletion at any time.',
      send_app: 'Send application', done_t: 'Application sent',
      done_d: 'We will call you if the employer is interested. Remember: never pay money for a job.', close: 'Close',
      share_wa: 'Share on WhatsApp', share_fb: 'Share on Facebook', copy_link: 'Copy link', copied: 'Link copied',
      fill_req: 'Please fill in all required fields.', sending: 'Sending…',
      job_thanks: 'Thank you! Your job will appear after review.', send_fail: 'Sorry, sending failed. Please try again.',
      load_fail: 'Could not load jobs. Please refresh the page.', demo_note: 'Demo mode — nothing was sent.',
      max_files: `Maximum ${MAX_FILES} files.`, bad_type: n => `"${n}" — only PDF, JPG or PNG allowed.`, too_big: n => `"${n}" is bigger than ${MAX_MB} MB.`,
      report_soon: 'Thanks — reporting will work once contact details are added.',
      p1: 'We collect only what you type in the forms and the documents you upload.',
      p2: 'Documents are kept in private, encrypted storage and are never shown on the website.',
      p3: 'Your application is shared only with the employer of the job you applied to.',
      p4: 'Applications and documents are deleted after 90 days, or earlier if you ask.',
      p5: 'To see or delete your data, contact us using the details at the bottom of the page.',
      t_new: 'NEW', t_fee: '<b>0 zł</b> fee for workers', t_checked: 'Every job is <b>checked</b> before it goes live',
      cats: { factory: 'Factory', warehouse: 'Warehouse', food: 'Restaurant & kitchen', cleaning: 'Cleaning', construction: 'Construction', driver: 'Driver & delivery', hotel: 'Hotel', other: 'Other' }
    },
    ne: {
      nav_jobs: 'कामहरू', nav_post: 'काम राख्नुहोस्', nav_safety: 'सुरक्षा', btn_post: 'काम राख्नुहोस्',
      eyebrow: 'पोल्याण्डमा काम खोज्ने नेपालीहरूको लागि',
      search_ph: 'कामको नाम वा शब्द', all_cities: 'सबै सहर', all_types: 'सबै प्रकारका काम', search_btn: 'खोज्नुहोस्',
      stat_jobs: 'खुला काम', stat_cities: 'सहर', stat_fee: 'कामदारलाई शुल्क',
      send_profile: 'काम भेटिएन? आफ्नो प्रोफाइल पठाउनुहोस् →',
      jobs_title: 'नयाँ कामहरू', f_accom: 'बस्ने ठाउँ', f_applied: 'TRC अप्लाई गरेको चल्छ',
      results: n => `${n} काम भेटियो`,
      empty: 'तपाईंको खोजसँग मिल्ने काम भेटिएन। अर्को सहर खोज्नुहोस् — वा प्रोफाइल पठाउनुहोस्, काम आएपछि हामी सम्पर्क गर्छौं।',
      loading: 'काम लोड हुँदैछ…', view_apply: 'हेर्नुहोस् र आवेदन दिनुहोस्', report: 'रिपोर्ट',
      salary: 'तलब', hours: 'समय', contract: 'सम्झौता', language: 'भाषा',
      today: 'आज', day_ago: '१ दिन अघि', days_ago: n => `${n} दिन अघि`,
      how1_t: 'खोज्नुहोस्', how1_d: 'सहर र कामको प्रकार अनुसार खोज्नुहोस्। हरेक काम प्रकाशित गर्नु अघि जाँच गरिन्छ।',
      how2_t: 'आवेदन दिनुहोस्', how2_d: 'आफ्नो विवरण र कागजात पठाउनुहोस् — पासपोर्ट, भिसा, TRC वा TRC अप्लाई गरेको प्रमाण।',
      how3_t: 'फोन आउँछ', how3_d: 'तपाईंको आवेदन त्यही रोजगारदातालाई मात्र दिइन्छ, र उहाँहरूले सम्पर्क गर्नुहुन्छ।',
      post_title: 'काम राख्नुहोस्', post_intro: 'रोजगारदाता, एजेन्सी वा साथी — जो कोहीले काम राखेर अरूलाई काम पाउन मद्दत गर्न सक्नुहुन्छ।',
      post_free: 'निःशुल्क पोस्ट', post_checked: '२४ घण्टाभित्र जाँच', post_private: 'तपाईंको फोन र इमेल गोप्य रहन्छ',
      f_title: 'कामको नाम', ph_title: 'जस्तै: गोदाम कामदार', f_company: 'कम्पनी', f_city: 'सहर', f_type: 'कामको प्रकार',
      f_salary: 'तलब', ph_salary: 'जस्तै: 30 zł/h brutto', f_docs: 'स्वीकार्य कागजात',
      doc_visa: 'पासपोर्ट + भिसा', doc_trc: 'TRC कार्ड', doc_trc_applied: 'TRC अप्लाई गरेको चल्छ',
      doc_trc_full: 'TRC (Karta pobytu)', doc_trc_applied_full: 'TRC अप्लाई गरेको (स्ट्याम्प / प्रमाण)',
      f_accom_prov: 'बस्ने ठाउँ दिइन्छ', f_desc: 'कामको विवरण', ph_desc: 'के काम हो? सिफ्ट, यातायात, सुरु मिति…',
      f_name: 'तपाईंको नाम', f_phone: 'फोन / WhatsApp', more: 'थप विवरण (ऐच्छिक)',
      f_hours: 'काम गर्ने समय', ph_hours: 'जस्तै: दिनमा 10–12 घण्टा', f_contract: 'सम्झौता', choose: 'छान्नुहोस्', other: 'अन्य',
      f_lang: 'चाहिने भाषा', ph_lang: 'जस्तै: सामान्य अंग्रेजी', f_email: 'इमेल',
      no_fee: 'म पुष्टि गर्छु कि यो साँचो काम हो र कामदारसँग कुनै शुल्क लिइने छैन।',
      submit_job: 'काम पठाउनुहोस्',
      safety_title: 'सुरक्षित रहनुहोस्',
      s1_t: 'कामको लागि पैसा नतिर्नुहोस्', s1_d: 'साँचो रोजगारदाताले काम, सम्झौता वा भिसा फाइलको लागि कहिल्यै पैसा माग्दैन।',
      s2_t: 'पासपोर्ट आफैंसँग राख्नुहोस्', s2_d: 'प्रतिलिपि मात्र दिनुहोस्। कसैले पनि तपाईंको सक्कली पासपोर्ट वा TRC कार्ड राख्न पाउँदैन।',
      s3_t: 'लिखित सम्झौता लिनुहोस्', s3_d: 'काम सुरु गर्नु अघि umowa मा हस्ताक्षर गरी प्रतिलिपि राख्नुहोस्। आवश्यक परे अंग्रेजीमा माग्नुहोस्।',
      s4_t: 'शंकास्पद काम रिपोर्ट गर्नुहोस्', s4_d: 'कुनै पनि कामको "रिपोर्ट" बटन थिच्नुहोस्, हाम्रो टोलीले जाँच गर्छ।',
      footer_about: 'पोल्याण्डमा रहेका नेपालीहरूको लागि निःशुल्क जागिर पोर्टल।', privacy: 'गोपनीयता',
      apply_h: 'यो कामको लागि आवेदन दिनुहोस्', profile_h: 'आफ्नो प्रोफाइल पठाउनुहोस्',
      profile_t: 'काम खोज्दै हुनुहुन्छ?', profile_d: 'एक पटक विवरण पठाउनुहोस्। मिल्दो काम आएपछि हामी सम्पर्क गर्छौं।',
      a_name: 'पूरा नाम', a_email: 'इमेल (ऐच्छिक)', a_city: 'अहिले बस्ने सहर', a_docstatus: 'तपाईंको कागजात',
      a_upload: 'कागजात अपलोड गर्नुहोस्', a_upload_hint: 'पासपोर्ट, भिसा / TRC वा TRC अप्लाई प्रमाण। बढीमा ३ फाइल · PDF, JPG वा PNG · प्रति फाइल ५ MB।',
      a_msg: 'अनुभव (ऐच्छिक)', ph_msg: 'जस्तै: १ वर्ष गोदाम अनुभव',
      consent: 'म सहमत छु कि काम को खोजीले मेरो विवरण र कागजात सुरक्षित राख्छ र यो कामको रोजगारदातासँग मात्र बाँड्छ। म जुनसुकै बेला मेटाउन अनुरोध गर्न सक्छु।',
      send_app: 'आवेदन पठाउनुहोस्', done_t: 'आवेदन पठाइयो',
      done_d: 'रोजगारदाताले चासो देखाएमा हामी फोन गर्छौं। सम्झनुहोस्: कामको लागि कहिल्यै पैसा नतिर्नुहोस्।', close: 'बन्द गर्नुहोस्',
      share_wa: 'WhatsApp मा सेयर', share_fb: 'Facebook मा सेयर', copy_link: 'लिंक कपी', copied: 'लिंक कपी भयो',
      fill_req: 'कृपया सबै आवश्यक (*) विवरण भर्नुहोस्।', sending: 'पठाउँदै…',
      job_thanks: 'धन्यवाद! जाँच पछि तपाईंको काम देखिनेछ।', send_fail: 'माफ गर्नुहोस्, पठाउन सकिएन। फेरि प्रयास गर्नुहोस्।',
      load_fail: 'काम लोड हुन सकेन। पेज रिफ्रेस गर्नुहोस्।', demo_note: 'डेमो मोड — केही पठाइएन।',
      max_files: `बढीमा ${MAX_FILES} फाइल मात्र।`, bad_type: n => `"${n}" — PDF, JPG वा PNG मात्र।`, too_big: n => `"${n}" ${MAX_MB} MB भन्दा ठूलो छ।`,
      report_soon: 'धन्यवाद — सम्पर्क विवरण थपेपछि रिपोर्ट गर्न मिल्नेछ।',
      p1: 'हामी फारममा लेखिएको विवरण र अपलोड गरिएका कागजात मात्र राख्छौं।',
      p2: 'कागजात गोप्य, सुरक्षित स्टोरेजमा राखिन्छ र वेबसाइटमा कहिल्यै देखाइँदैन।',
      p3: 'तपाईंको आवेदन तपाईंले आवेदन दिएको कामको रोजगारदातासँग मात्र बाँडिन्छ।',
      p4: 'आवेदन र कागजात ९० दिनपछि, वा तपाईंले भन्नुभएमा अघि नै मेटाइन्छ।',
      p5: 'आफ्नो विवरण हेर्न वा मेटाउन पेजको तल दिइएको सम्पर्कमा लेख्नुहोस्।',
      t_new: 'नयाँ', t_fee: 'कामदारलाई <b>० शुल्क</b>', t_checked: 'हरेक काम <b>जाँच</b> गरेर मात्र प्रकाशित',
      cats: { factory: 'फ्याक्ट्री', warehouse: 'गोदाम', food: 'रेस्टुरेन्ट र किचन', cleaning: 'सफाइ', construction: 'निर्माण', driver: 'ड्राइभर र डेलिभरी', hotel: 'होटल', other: 'अन्य' }
    }
  };
  const CONTRACTS = { uop: 'Umowa o pracę', uz: 'Umowa zlecenie', b2b: 'B2B' };

  let lang = 'en';
  try { lang = localStorage.getItem('kkk-lang') || (navigator.language || '').startsWith('ne') && 'ne' || 'en'; } catch (_) { /* storage blocked */ }
  const t = (k, ...a) => { const v = T[lang][k] ?? T.en[k]; return typeof v === 'function' ? v(...a) : v; };
  const catName = c => t('cats')[c] || t('cats').other;
  const docName = d => ({ visa: t('doc_visa'), trc: t('doc_trc'), trc_applied: t('doc_trc_applied') }[d] || d);
  const contractName = c => c === 'other' ? t('other') : (CONTRACTS[c] || c);

  const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();
  const DEMO = [
    { id: 'demo-1', created_at: daysAgo(0), title: 'Production worker (food packing)', company: 'Example Foods Sp. z o.o.', city: 'Wrocław', category: 'factory', salary: '28 zł/h brutto', contract: 'uz', hours: '10–12 h/day, 6 days', accommodation: true, docs_accepted: ['trc', 'trc_applied', 'visa'], languages: 'No Polish needed', description: 'Packing ready meals on a production line.\nFree transport from the hostel to the factory.' },
    { id: 'demo-2', created_at: daysAgo(1), title: 'Warehouse picker', company: 'Example Logistics', city: 'Poznań', category: 'warehouse', salary: '27–31 zł/h', contract: 'uop', hours: '3 shifts, 8 h', accommodation: false, docs_accepted: ['trc'], languages: 'Basic English', description: 'Picking orders with a hand scanner. Overtime available.' },
    { id: 'demo-3', created_at: daysAgo(2), title: 'Kitchen helper', company: 'Example Ramen Bar', city: 'Warszawa', category: 'food', salary: '25 zł/h netto', contract: 'uz', hours: 'Evenings + weekends', accommodation: false, docs_accepted: ['trc', 'trc_applied'], languages: 'English', description: 'Preparing vegetables, dishwashing and helping the chef.' }
  ];
  const DEFAULT_CITIES = ['Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk', 'Łódź', 'Katowice', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Rzeszów', 'Gdynia', 'Toruń', 'Białystok', 'Olsztyn'];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const short = s => String(s || '').split('(')[0].trim();

  let jobs = [];
  let loaded = false;
  let openJob = undefined; // job currently in the dialog (null = profile)
  const f = { q: '', city: '', cat: '', accom: false, applied: false };

  // ---------- helpers ----------
  let toastTimer;
  function toast(msg, bad = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('bad', bad);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }
  function ago(iso) {
    const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    return d <= 0 ? t('today') : d === 1 ? t('day_ago') : t('days_ago', d);
  }

  // ---------- language ----------
  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    fillTypeSelects();
    if (loaded) { render(); buildTicker(); }
    if (dlg.open) fillDialog(openJob);
  }

  function fillTypeSelects() {
    const keep = $('#cat').value;
    $('#cat').innerHTML = `<option value="">${esc(t('all_types'))}</option>` +
      Object.keys(T.en.cats).map(k => `<option value="${k}">${esc(catName(k))}</option>`).join('');
    $('#cat').value = keep;
    const pc = $('#postCategory'), pKeep = pc.value;
    pc.innerHTML = `<option value="">${esc(t('choose'))}</option>` +
      Object.keys(T.en.cats).map(k => `<option value="${k}">${esc(catName(k))}</option>`).join('');
    pc.value = pKeep;
  }

  // ---------- load ----------
  async function loadJobs() {
    if (!LIVE) {
      jobs = DEMO;
      $('#demoBanner').hidden = false;
    } else {
      $('#jobList').innerHTML = `<p class="empty">${esc(t('loading'))}</p>`;
      const { data, error } = await sb.from('jobs').select(PUBLIC_COLS).order('created_at', { ascending: false }).limit(300);
      if (error) { console.error(error); toast(t('load_fail'), true); jobs = []; }
      else jobs = data || [];
    }
    loaded = true;
    fillCities();
    render();
    buildTicker();
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

  // ---------- search ----------
  const norm = s => String(s || '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ALIASES = { warsaw: 'warszawa', cracow: 'krakow', breslau: 'wroclaw', danzig: 'gdansk', posen: 'poznan', kitchen: 'food', restaurant: 'food', magazyn: 'warehouse', fabryka: 'factory' };
  function matches(j) {
    const q = norm(f.q).trim();
    if (q) {
      const hay = norm([j.title, j.company, j.city, j.description, j.category, T.en.cats[j.category], T.ne.cats[j.category],
        ...(j.docs_accepted || []).map(d => T.en['doc_' + d]), j.accommodation ? 'accommodation' : ''].join(' '));
      if (!q.split(/\s+/).every(w => hay.includes(w) || (ALIASES[w] && hay.includes(ALIASES[w])))) return false;
    }
    if (f.city && j.city !== f.city) return false;
    if (f.cat && j.category !== f.cat) return false;
    if (f.accom && !j.accommodation) return false;
    if (f.applied && !(j.docs_accepted || []).includes('trc_applied')) return false;
    return true;
  }

  // ---------- render ----------
  const tagsHtml = j => (j.docs_accepted || []).map(d => `<span class="tag">${esc(docName(d))}</span>`).join('') +
    (j.accommodation ? `<span class="tag home">${esc(t('f_accom'))}</span>` : '');
  const factsHtml = (j, withLang) => `<ul class="facts">
      ${j.salary ? `<li><span>${esc(t('salary'))}</span>${esc(j.salary)}</li>` : ''}
      ${j.hours ? `<li><span>${esc(t('hours'))}</span>${esc(j.hours)}</li>` : ''}
      ${j.contract ? `<li><span>${esc(t('contract'))}</span>${esc(contractName(j.contract))}</li>` : ''}
      ${withLang && j.languages ? `<li><span>${esc(t('language'))}</span>${esc(j.languages)}</li>` : ''}
    </ul>`;

  function card(j) {
    return `<article class="job">
      <div class="job-top"><span class="cat">${esc(catName(j.category))}</span><span class="when">${ago(j.created_at)}${LIVE ? '' : '<span class="example-tag">EXAMPLE</span>'}</span></div>
      <h3>${esc(j.title)}</h3>
      <p class="company">${esc(j.company)} · <b>${esc(j.city)}</b></p>
      ${factsHtml(j, false)}
      <div class="tags">${tagsHtml(j)}</div>
      <div class="job-actions">
        <button class="btn btn-dark" type="button" data-open="${esc(j.id)}">${esc(t('view_apply'))}</button>
        <button class="text-btn" type="button" data-report="${esc(j.id)}">${esc(t('report'))}</button>
      </div>
    </article>`;
  }

  function render() {
    const list = jobs.filter(matches);
    $('#jobList').innerHTML = list.map(card).join('');
    $('#emptyMsg').hidden = list.length > 0;
    $('#resultCount').textContent = list.length ? t('results', list.length) : '';
  }

  function buildTicker() {
    const items = jobs.map(j => `<span><span class="sep">●</span> <b>${esc(t('t_new'))}</b> ${esc(short(j.title))} — ${esc(j.city)}${j.salary ? ' · ' + esc(short(j.salary)) : ''}</span>`);
    items.push(`<span><span class="sep">●</span> ${t('t_fee')}</span>`, `<span><span class="sep">●</span> ${t('t_checked')}</span>`);
    const row = items.join('');
    $('#tickerTrack').innerHTML = row + row; // doubled for a seamless loop
  }

  // ---------- dialog ----------
  const dlg = $('#applyDialog');

  function fillDialog(job) {
    if (job) {
      const url = `${location.origin}${location.pathname}#job-${job.id}`;
      const shareText = encodeURIComponent(`${job.title} – ${job.city}\n${url}`);
      $('#applyHeading').textContent = t('apply_h');
      $('#dlgJob').innerHTML = `
        <span class="cat">${esc(catName(job.category))}</span>
        <h2 id="dlgTitle">${esc(job.title)}</h2>
        <p class="company">${esc(job.company)} · <b>${esc(job.city)}</b> · ${ago(job.created_at)}</p>
        ${factsHtml(job, true)}
        <div class="tags">${tagsHtml(job)}</div>
        <div class="desc">${esc(job.description)}</div>
        <div class="share">
          <a class="text-btn" href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener">${esc(t('share_wa'))}</a>
          <a class="text-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">${esc(t('share_fb'))}</a>
          <button class="text-btn" type="button" data-copy="${esc(url)}">${esc(t('copy_link'))}</button>
        </div>`;
    } else {
      $('#applyHeading').textContent = t('profile_h');
      $('#dlgJob').innerHTML = `<h2 id="dlgTitle">${esc(t('profile_t'))}</h2><p class="muted">${esc(t('profile_d'))}</p>`;
    }
  }

  function openApply(job) {
    const form = $('#applyForm');
    form.reset();
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    form.hidden = false;
    $('#applyDone').hidden = true;
    form.job_id.value = job ? job.id : '';
    openJob = job || null;
    fillDialog(openJob);
    if (job) history.replaceState(null, '', `#job-${job.id}`);
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
      const bad = el.type === 'checkbox' ? !el.checked : el.type === 'file' ? !el.files.length : !String(el.value).trim() || !el.checkValidity();
      el.classList.toggle('invalid', bad);
      (el.closest('.confirm') || {}).classList?.toggle('invalid', bad);
      if (bad) ok = false;
    });
    form.querySelectorAll('input[type=email]').forEach(el => {
      if (el.value && !el.checkValidity()) { el.classList.add('invalid'); ok = false; }
    });
    if (!ok) {
      toast(t('fill_req'), true);
      const first = form.querySelector('.invalid');
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (first?.focus) first.focus({ preventScroll: true });
    }
    return ok;
  }

  function checkFiles(files) {
    if (files.length > MAX_FILES) return t('max_files');
    for (const file of files) {
      if (!OK_TYPES.includes(file.type)) return t('bad_type', file.name);
      if (file.size > MAX_MB * 1024 * 1024) return t('too_big', file.name);
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
    btn.disabled = true; btn.textContent = t('sending');

    try {
      if (!LIVE) { await sleep(700); showDone(); toast(t('demo_note')); return; }

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
      toast(t('send_fail'), true);
    } finally {
      btn.disabled = false; btn.textContent = t('send_app');
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
    if (form.website.value) { form.reset(); return toast(t('job_thanks')); }
    if (!checkRequired(form)) return;

    const row = {
      title: form.elements.title.value.trim(),
      company: form.company.value.trim(),
      city: form.city.value.trim(),
      category: form.category.value,
      salary: form.salary.value.trim() || null,
      hours: form.hours.value.trim() || null,
      contract: form.contract.value || null,
      languages: form.languages.value.trim() || null,
      accommodation: form.accommodation.checked,
      docs_accepted: $$('input[name=docs]:checked', form).map(i => i.value),
      description: form.description.value.trim(),
      contact_name: form.contact_name.value.trim(),
      contact_phone: form.contact_phone.value.trim(),
      contact_email: form.contact_email.value.trim() || null,
      status: 'pending'
    };

    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = t('sending');
    try {
      if (!LIVE) await sleep(600);
      else {
        const { error } = await sb.from('jobs').insert(row);
        if (error) throw error;
      }
      form.reset();
      form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
      toast(LIVE ? t('job_thanks') : t('demo_note'));
    } catch (err) {
      console.error(err);
      toast(t('send_fail'), true);
    } finally {
      btn.disabled = false; btn.textContent = t('submit_job');
    }
  }

  // ---------- report ----------
  function report(id) {
    const job = jobs.find(j => String(j.id) === id);
    const subject = encodeURIComponent(`Report job: ${job ? job.title : id}`);
    const body = encodeURIComponent(`Job ID: ${id}\nTitle: ${job?.title || ''}\nCity: ${job?.city || ''}\n\nWhat is wrong?\n`);
    if (cfg.CONTACT_EMAIL) location.href = `mailto:${cfg.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    else if (cfg.WHATSAPP) window.open(`https://wa.me/${cfg.WHATSAPP}?text=${body}`, '_blank', 'noopener');
    else toast(t('report_soon'));
  }

  // ---------- events ----------
  function bind() {
    $('#searchForm').addEventListener('submit', e => {
      e.preventDefault();
      f.q = $('#q').value; f.city = $('#city').value; f.cat = $('#cat').value;
      render();
      $('#jobs').scrollIntoView();
    });
    $('#q').addEventListener('input', e => { f.q = e.target.value; render(); });
    $('#city').addEventListener('change', e => { f.city = e.target.value; render(); });
    $('#cat').addEventListener('change', e => { f.cat = e.target.value; render(); });
    $('#fAccom').addEventListener('change', e => { f.accom = e.target.checked; render(); });
    $('#fApplied').addEventListener('change', e => { f.applied = e.target.checked; render(); });

    $$('.lang button').forEach(b => b.addEventListener('click', () => {
      lang = b.dataset.lang;
      try { localStorage.setItem('kkk-lang', lang); } catch (_) { /* storage blocked */ }
      applyLang();
    }));

    document.addEventListener('click', e => {
      const open = e.target.closest('[data-open]');
      if (open) return openApply(jobs.find(j => String(j.id) === open.dataset.open));
      if (e.target.closest('[data-profile]')) return openApply(null);
      const rep = e.target.closest('[data-report]');
      if (rep) return report(rep.dataset.report);
      const cp = e.target.closest('[data-copy]');
      if (cp) { navigator.clipboard?.writeText(cp.dataset.copy).then(() => toast(t('copied'))); return; }
      const cl = e.target.closest('[data-close]');
      if (cl) return closeDialog(cl.closest('dialog'));
    });
    $$('dialog').forEach(d => {
      d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
      d.addEventListener('cancel', () => { if (location.hash.startsWith('#job-')) history.replaceState(null, '', location.pathname); });
    });

    $('#registerBtn').addEventListener('click', () => openApply(null));
    $('#applyForm').addEventListener('submit', submitApply);
    $('#postForm').addEventListener('submit', submitJob);
    $$('.form').forEach(fm => fm.addEventListener('input', e => {
      e.target.classList.remove('invalid');
      e.target.closest('.confirm')?.classList.remove('invalid');
    }));
    $('#privacyLink').addEventListener('click', e => { e.preventDefault(); $('#privacyDialog').showModal(); });
    window.addEventListener('hashchange', openFromHash);

    const bar = $('.topbar');
    window.addEventListener('scroll', () => bar.classList.toggle('scrolled', scrollY > 8), { passive: true });

    if (cfg.WHATSAPP) { const a = $('#footerWa'); a.href = `https://wa.me/${cfg.WHATSAPP}`; a.hidden = false; }
    if (cfg.CONTACT_EMAIL) { const a = $('#footerMail'); a.href = `mailto:${cfg.CONTACT_EMAIL}`; a.hidden = false; }
  }

  bind();
  applyLang();
  loadJobs();
})();
