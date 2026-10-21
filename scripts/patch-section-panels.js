const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idxPath = P + '/index.html';
const appPath = P + '/assets/app.js';

// ─────────────────────────────────────────────────────────────────────────────
// Schema: 9 orphan sections. Field keys are DOM-shaped; save maps to siteConfig
// exactly as the site components read them.
//
//   mirrorPageContent : write to siteConfig[key] AND siteConfig.pageContent[key]
//   container         : scalars/lists nest under siteConfig[container]
//   itemShape:'string': list holds bare strings in siteConfig (view holds {key})
//   transform:'tags'  : DOM is a comma string, siteConfig is string[]
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'process', tab: 'Process', icon: 'fa-list-ol',
    help: 'Your step-by-step process — how you take a client from first contact to finished job.',
    fields: [
      { key: 'processTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Our Process' },
      { key: 'processSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'How We Work' },
      { key: 'processLayout', label: 'Layout — how the steps are shown', type: 'select', default: 'steps', options: [
        { value: 'steps', label: 'Steps — numbered row across the page' },
        { value: 'timeline', label: 'Timeline — down the page, alternating' },
        { value: 'cards', label: 'Cards — big numbered cards' },
      ]},
      { key: 'process', label: 'Steps', type: 'list', addLabel: 'Add step', itemFields: [
        { key: 'step', label: 'Number (leave blank to auto-number)', type: 'text', placeholder: '1' },
        { key: 'title', label: 'Step title', type: 'text' },
        { key: 'description', label: 'What happens in this step', type: 'textarea' },
        { key: 'image', label: 'Photo (optional)', type: 'image' },
      ]},
    ],
  },
  {
    id: 'latestWork', tab: 'Latest Work', icon: 'fa-briefcase',
    help: 'Case studies of real jobs you have done. Show off recent projects with a photo and a short story.',
    fields: [
      { key: 'caseStudiesTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Latest Work' },
      { key: 'caseStudiesSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'Case Studies' },
      { key: 'caseStudies', label: 'Case studies', type: 'list', addLabel: 'Add case study', itemFields: [
        { key: 'title', label: 'Project name', type: 'text' },
        { key: 'summary', label: 'Short story about the job', type: 'textarea' },
        { key: 'result', label: 'Result highlight (optional)', type: 'text', placeholder: 'Finished 2 days early' },
        { key: 'image', label: 'Photo', type: 'image' },
        { key: 'tags', label: 'Tags (comma separated)', type: 'text', transform: 'tags', placeholder: 'Kitchen, Bakery' },
      ]},
    ],
  },
  {
    id: 'partners', tab: 'Partners', icon: 'fa-handshake', container: 'partners',
    help: 'The brands, suppliers and partners you work with — their logos shown as a clean strip.',
    fields: [
      { key: 'title', label: 'Section title (optional)', type: 'text', placeholder: 'Who we work with' },
      { key: 'items', label: 'Partners', type: 'list', addLabel: 'Add partner', itemFields: [
        { key: 'name', label: 'Partner name', type: 'text' },
        { key: 'logoUrl', label: 'Logo', type: 'image' },
        { key: 'url', label: 'Website link (optional)', type: 'text' },
      ]},
    ],
  },
  {
    id: 'awards', tab: 'Awards', icon: 'fa-trophy',
    help: 'Awards, accreditations and press mentions that prove you are the real deal.',
    fields: [
      { key: 'awardsTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Awards & Press' },
      { key: 'awardsSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'Recognition' },
      { key: 'awards', label: 'Awards', type: 'list', addLabel: 'Add award', itemFields: [
        { key: 'title', label: 'Award name', type: 'text' },
        { key: 'issuer', label: 'Who gave it', type: 'text', placeholder: 'Best of Ballito' },
        { key: 'year', label: 'Year', type: 'text' },
        { key: 'image', label: 'Badge or logo (optional)', type: 'image' },
        { key: 'url', label: 'Link (optional)', type: 'text' },
      ]},
    ],
  },
  {
    id: 'instagram', tab: 'Social Feed', icon: 'fa-hashtag',
    help: 'Photos from your social media, so visitors can follow along. Your profile links are edited in Settings > Social Media.',
    fields: [
      { key: 'socialTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Follow Along' },
      { key: 'socialSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'Social' },
      { key: 'instagramFeed', label: 'Photos to show', type: 'list', addLabel: 'Add photo', itemShape: 'string', itemFields: [
        { key: 'url', label: 'Photo', type: 'image' },
      ]},
    ],
  },
  {
    id: 'newsletter', tab: 'Newsletter', icon: 'fa-envelope-open-text', container: 'newsletter',
    help: 'A sign-up box so visitors can join your mailing list.',
    fields: [
      { key: 'headline', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Short text under the heading', type: 'textarea' },
      { key: 'ctaLabel', label: 'Button label', type: 'text', placeholder: 'Subscribe' },
    ],
  },
  {
    id: 'statsBar', tab: 'Stats', icon: 'fa-chart-simple',
    help: 'Big numbers that build trust — years in business, happy clients, projects completed.',
    fields: [
      { key: 'statsTitle', label: 'Section title (optional)', type: 'text', mirrorPageContent: true },
      { key: 'statsSubtitle', label: 'Small heading above the title (optional)', type: 'text', mirrorPageContent: true },
      { key: 'stats', label: 'Numbers', type: 'list', addLabel: 'Add number', itemFields: [
        { key: 'value', label: 'Number', type: 'text', placeholder: '30+' },
        { key: 'label', label: 'What it means', type: 'text', placeholder: 'Years in business' },
      ]},
    ],
  },
  {
    id: 'video', tab: 'Video', icon: 'fa-film',
    help: 'Videos of your work, a tour, or a walkthrough. Paste a YouTube or Vimeo link.',
    fields: [
      { key: 'videos', label: 'Videos', type: 'list', addLabel: 'Add video', itemFields: [
        { key: 'url', label: 'YouTube or Vimeo link', type: 'text', placeholder: 'https://youtu.be/...' },
      ]},
    ],
  },
  {
    id: 'hours', tab: 'Hours', icon: 'fa-clock',
    help: 'Heading over your opening hours. The days and times themselves are edited in Settings > Business Hours.',
    fields: [
      { key: 'businessHoursTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Business Hours' },
      { key: 'businessHoursSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'When to Find Us' },
    ],
  },
];

const TITLES = {
  process: 'Process / How It Works', latestWork: 'Latest Work / Case Studies',
  partners: 'Partners / Sponsors', awards: 'Awards / Press',
  instagram: 'Instagram / Social Feed', newsletter: 'Newsletter Block',
  statsBar: 'Stats / By the Numbers', video: 'Video', hours: 'Business Hours',
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. index.html — nav items + panels
// ═══════════════════════════════════════════════════════════════════════════
let idx = fs.readFileSync(idxPath, 'utf8');

if (idx.includes('data-section="process"')) {
  console.log('index.html  already patched — skipped');
} else {
  // 1a. nav items, right after the VSL nav item
  const navAnchor = `        <a href="#" class="nav-item" data-section="vsl">
          <i class="fas fa-video"></i>
          <span>VSL</span>
        </a>
      </nav>`;
  if (!idx.includes(navAnchor)) throw new Error('nav anchor not found');
  const navRows = SECTIONS.map(s => `        <a href="#" class="nav-item" data-section="${s.id}">
          <i class="fas ${s.icon}"></i>
          <span>${s.tab}</span>
        </a>`).join('\n');
  idx = idx.replace(navAnchor, navAnchor.replace('      </nav>', `${navRows}\n      </nav>`));

  // 1b. panels, just before the closing of the sections container
  const panelAnchor = `        </section>

      </div>
    </main>`;
  if (!idx.includes(panelAnchor)) throw new Error('panel anchor not found');
  const panels = SECTIONS.map(s => `
        <!-- ============== ${s.tab.toUpperCase()} ============== -->
        <section id="${s.id}" class="section">
          <div class="section-header">
            <h2>${s.tab}</h2>
            <div class="section-header-actions">
              <button class="primary-btn" onclick="saveSectionData('${s.id}')">
                <i class="fas fa-save"></i><span>Save ${s.tab}</span>
              </button>
            </div>
          </div>
          <p class="help-text">${s.help}</p>
          <div class="feature-card on vsl-card">
            <div class="feature-card-body" id="${s.id}Fields">
              <!-- Populated by JS -->
            </div>
            <div class="feature-save-row">
              <button type="button" class="secondary-btn feature-save-btn" onclick="saveSectionData('${s.id}')">
                <i class="fas fa-save"></i> Save
              </button>
            </div>
          </div>
        </section>
`).join('\n');
  idx = idx.replace(panelAnchor, `${panels}\n${panelAnchor}`);
  fs.writeFileSync(idxPath, idx, 'utf8');
  console.log('index.html  patched  ' + idx.length + ' bytes');
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. app.js — schemas + view/save layer
// ═══════════════════════════════════════════════════════════════════════════
let app = fs.readFileSync(appPath, 'utf8');

if (app.includes('const SECTION_FIELDS')) {
  console.log('app.js  already patched — skipped');
} else {
  const js = `
// ============================================
// SECTION FIELDS — content editors for homepage sections
//
// These sections render from top-level siteConfig keys (not featureData), so
// they get their own schema + write layer. Field RENDERING is shared with the
// feature cards via renderFeatureCardBody / renderFeatureField / renderFeatureList.
// Each editor works against a DOM-shaped VIEW object; saveSectionData() maps
// that view onto siteConfig in exactly the shape the site components read.
// ============================================
const SECTION_FIELDS = ${JSON.stringify(Object.fromEntries(SECTIONS.map(s => [s.id, s])), null, 2)};

const SECTION_VIEWS = {};

function isSectionEditor(id) {
  return Object.prototype.hasOwnProperty.call(SECTION_FIELDS, id);
}

/** DOM-shaped working copy for one section editor. */
function ensureSectionView(sectionId) {
  if (!SECTION_VIEWS[sectionId] || typeof SECTION_VIEWS[sectionId] !== 'object') SECTION_VIEWS[sectionId] = {};
  return SECTION_VIEWS[sectionId];
}

/**
 * Load siteConfig -> view. Called when a section tab is opened so the form
 * shows what is currently saved. Never called on re-render (that would wipe
 * the client's in-progress edits).
 */
function hydrateSectionView(sectionId) {
  const def = SECTION_FIELDS[sectionId];
  if (!def) return;
  const sc = siteConfig || {};
  const pc = sc.pageContent || {};
  const source = def.container ? (sc[def.container] || {}) : sc;
  const view = ensureSectionView(sectionId);
  Object.keys(view).forEach(k => { delete view[k]; });

  def.fields.forEach(f => {
    if (f.type === 'list') {
      let raw = source[f.key];
      if (!Array.isArray(raw)) raw = [];
      view[f.key] = raw.map(item => {
        if (f.itemShape === 'string') return { [f.itemFields[0].key]: typeof item === 'string' ? item : (item && item.url) || '' };
        const out = {};
        (f.itemFields || []).forEach(sub => {
          let v = item ? item[sub.key] : '';
          if (sub.transform === 'tags') v = Array.isArray(v) ? v.join(', ') : (v || '');
          out[sub.key] = v == null ? '' : v;
        });
        return out;
      });
    } else {
      let v = source[f.key];
      if (v == null && f.mirrorPageContent) v = pc[f.key];
      view[f.key] = v == null ? (f.default != null ? f.default : '') : v;
    }
  });
}

/** Render one section editor into its panel. */
function renderSectionFields(sectionId) {
  const container = document.getElementById(sectionId + 'Fields');
  if (!container || !SECTION_FIELDS[sectionId]) return;
  container.innerHTML = renderFeatureCardBody(sectionId);
}

/** Re-render every open section editor from its view. */
function renderAllSectionFields() {
  Object.keys(SECTION_FIELDS).forEach(renderSectionFields);
}

/** Map the view onto siteConfig in exactly the shape the site components read. */
function applySectionView(sectionId) {
  const def = SECTION_FIELDS[sectionId];
  if (!def) return;
  if (!siteConfig) siteConfig = {};
  const target = def.container
    ? (siteConfig[def.container] || (siteConfig[def.container] = {}))
    : siteConfig;
  const view = ensureSectionView(sectionId);
  if (!siteConfig.pageContent || typeof siteConfig.pageContent !== 'object') siteConfig.pageContent = {};

  def.fields.forEach(f => {
    if (f.type === 'list') {
      const raw = Array.isArray(view[f.key]) ? view[f.key] : [];
      if (f.itemShape === 'string') {
        const key = f.itemFields[0].key;
        target[f.key] = raw.map(it => (it && it[key]) || '').filter(Boolean);
      } else {
        target[f.key] = raw.map(it => {
          const out = {};
          (f.itemFields || []).forEach(sub => {
            let v = it ? it[sub.key] : '';
            if (sub.transform === 'tags') {
              v = Array.isArray(v) ? v : String(v || '').split(',');
              v = v.map(s => String(s).trim()).filter(Boolean);
            }
            out[sub.key] = v == null ? '' : v;
          });
          return out;
        });
      }
    } else {
      let v = view[f.key];
      if (v == null) v = '';
      target[f.key] = v;
      if (f.mirrorPageContent) siteConfig.pageContent[f.key] = v;
    }
  });
}

/** Flush the form into the view, write it to siteConfig, and persist. */
async function saveSectionData(sectionId) {
  if (!isSectionEditor(sectionId)) return;
  writeFeatureFieldsFromDom(sectionId);   // DOM -> view (ensureFeatureData routes here)
  applySectionView(sectionId);            // view -> siteConfig
  getWebsiteControls();
  const ok = await saveSiteConfig({ silent: true });
  if (ok) showToast(SECTION_FIELDS[sectionId].tab + ' saved — refresh the website to see it.');
}

/**
 * Harvest every section editor's DOM into its view first. Add/Remove/Upload
 * must not discard text the client has typed but not yet saved.
 */
function harvestSectionEditors() {
  Object.keys(SECTION_FIELDS).forEach(id => {
    if (document.getElementById(id + 'Fields')) writeFeatureFieldsFromDom(id);
  });
}

`;

  // Insert the block just before ensureFeatureData (which we then re-route)
  const anchor = 'function ensureFeatureData(key) {';
  if (!app.includes(anchor)) throw new Error('ensureFeatureData anchor not found');
  app = app.replace(anchor, js + '\n' + anchor);

  // Re-route ensureFeatureData to the view for section editors
  const efOld = `function ensureFeatureData(key) {
  const data = getFeatureData();
  if (!data[key] || typeof data[key] !== 'object') data[key] = {};
  return data[key];
}`;
  const efNew = `function ensureFeatureData(key) {
  // Section editors keep a DOM-shaped view and map it to siteConfig on save.
  if (isSectionEditor(key)) return ensureSectionView(key);
  const data = getFeatureData();
  if (!data[key] || typeof data[key] !== 'object') data[key] = {};
  return data[key];
}`;
  if (!app.includes(efOld)) throw new Error('ensureFeatureData body not found');
  app = app.replace(efOld, efNew);

  // renderFeatureCardBody must read SECTION_FIELDS too
  const rbcOld = `function renderFeatureCardBody(featureId) {
  const fields = FEATURE_FIELDS[featureId] || [];`;
  const rbcNew = `function renderFeatureCardBody(featureId) {
  const fields = SECTION_FIELDS[featureId]?.fields || FEATURE_FIELDS[featureId] || [];`;
  if (!app.includes(rbcOld)) throw new Error('renderFeatureCardBody anchor not found');
  app = app.replace(rbcOld, rbcNew);

  // renderFeatureList must resolve the schema from either registry
  const rlOld = `    const def = (FEATURE_FIELDS[featureId] || []).find(f => f.key === listKey);
    const data = ensureFeatureData(featureId);`;
  const rlNew = `    const def = ((SECTION_FIELDS[featureId] && SECTION_FIELDS[featureId].fields) || FEATURE_FIELDS[featureId] || []).find(f => f.key === listKey);
    const data = ensureFeatureData(featureId);`;
  if (!app.includes(rlOld)) throw new Error('add-btn def anchor not found');
  app = app.replace(rlOld, rlNew);

  // Harvest DOM before list mutations so typed text is not lost
  const addOld = `  const addBtn = e.target.closest('[data-feature-add]');
  if (addBtn) {
    const featureId = addBtn.dataset.featureAdd;
    const listKey = addBtn.dataset.list;`;
  const addNew = `  const addBtn = e.target.closest('[data-feature-add]');
  if (addBtn) {
    harvestSectionEditors();
    const featureId = addBtn.dataset.featureAdd;
    const listKey = addBtn.dataset.list;`;
  if (!app.includes(addOld)) throw new Error('add-btn anchor not found');
  app = app.replace(addOld, addNew);

  const rmOld = `  const removeBtn = e.target.closest('[data-feature-remove]');
  if (removeBtn) {
    const featureId = removeBtn.dataset.featureRemove;`;
  const rmNew = `  const removeBtn = e.target.closest('[data-feature-remove]');
  if (removeBtn) {
    harvestSectionEditors();
    const featureId = removeBtn.dataset.featureRemove;`;
  if (!app.includes(rmOld)) throw new Error('remove-btn anchor not found');
  app = app.replace(rmOld, rmNew);

  const clOld = `  const clearBtn = e.target.closest('[data-feature-image-clear]');
  if (clearBtn) {
    const featureId = clearBtn.dataset.featureImageClear;`;
  const clNew = `  const clearBtn = e.target.closest('[data-feature-image-clear]');
  if (clearBtn) {
    harvestSectionEditors();
    const featureId = clearBtn.dataset.featureImageClear;`;
  if (!app.includes(clOld)) throw new Error('clear-btn anchor not found');
  app = app.replace(clOld, clNew);

  // refreshFeatureViews must also re-render the section editors
  const rfvOld = `function refreshFeatureViews() {
  renderFeatureCards();
  renderVslFields();
}`;
  const rfvNew = `function refreshFeatureViews() {
  renderFeatureCards();
  renderVslFields();
  renderAllSectionFields();
}`;
  if (!app.includes(rfvOld)) throw new Error('refreshFeatureViews anchor not found');
  app = app.replace(rfvOld, rfvNew);

  // sectionTabs — gate the new tabs on their Website Control toggle
  const stOld = `const sectionTabs = {
    services: 'services',
    gallery: 'gallery',
    testimonials: 'testimonials',
    about: 'about',
    team: 'team',
    pricing: 'pricing',
    faq: 'faq',
    blogStrip: 'blog',
    vsl: 'vsl',
  };`;
  const stNew = `const sectionTabs = {
    services: 'services',
    gallery: 'gallery',
    testimonials: 'testimonials',
    about: 'about',
    team: 'team',
    pricing: 'pricing',
    faq: 'faq',
    blogStrip: 'blog',
    vsl: 'vsl',
    process: 'process',
    latestWork: 'latestWork',
    partners: 'partners',
    awards: 'awards',
    instagram: 'instagram',
    newsletter: 'newsletter',
    statsBar: 'statsBar',
    video: 'video',
    hours: 'hours',
  };`;
  if (!app.includes(stOld)) throw new Error('sectionTabs anchor not found');
  app = app.replace(stOld, stNew);

  // switchSection titles + load dispatch
  const ssOld = `    team: 'Team Members', faq: 'FAQ Items', leads: 'Email / Leads', features: 'Features',
    vsl: 'VSL — Video Sales Letter',
  };`;
  const ssNew = `    team: 'Team Members', faq: 'FAQ Items', leads: 'Email / Leads', features: 'Features',
    vsl: 'VSL — Video Sales Letter',
    process: ${JSON.stringify(TITLES.process)}, latestWork: ${JSON.stringify(TITLES.latestWork)},
    partners: ${JSON.stringify(TITLES.partners)}, awards: ${JSON.stringify(TITLES.awards)},
    instagram: ${JSON.stringify(TITLES.instagram)}, newsletter: ${JSON.stringify(TITLES.newsletter)},
    statsBar: ${JSON.stringify(TITLES.statsBar)}, video: ${JSON.stringify(TITLES.video)},
    hours: ${JSON.stringify(TITLES.hours)},
  };`;
  if (!app.includes(ssOld)) throw new Error('switchSection titles anchor not found');
  app = app.replace(ssOld, ssNew);

  const sdOld = `  } else if (section === 'vsl') {
    renderVslFields();
  } else if (section === 'settings') {`;
  const sdNew = `  } else if (section === 'vsl') {
    renderVslFields();
  } else if (isSectionEditor(section)) {
    harvestSectionEditors();
    hydrateSectionView(section);
    renderSectionFields(section);
  } else if (section === 'settings') {`;
  if (!app.includes(sdOld)) throw new Error('switchSection dispatch anchor not found');
  app = app.replace(sdOld, sdNew);

  // Bind the shared feature handlers to every section panel (same as #vsl does)
  const domReady = app.indexOf('DOMContentLoaded');
  const bindBlock = `
  // Section editors reuse the feature-card field/list/upload handlers.
  ${SECTIONS.map(s => `document.getElementById('${s.id}')?.addEventListener('input', onFeaturesGridChange);
  document.getElementById('${s.id}')?.addEventListener('change', onFeaturesGridChange);
  document.getElementById('${s.id}')?.addEventListener('click', onFeaturesGridClick);
  document.getElementById('${s.id}')?.addEventListener('change', onFeaturesGridFileChange);`).join('\n  ')}
`;
  // append just after the vsl bindings if present, else before the end of the DOMContentLoaded handler
  if (app.includes("getElementById('vsl')")) {
    const v = app.indexOf("getElementById('vsl')");
    const lineEnd = app.indexOf('\n', app.indexOf(';', app.indexOf('onFeaturesGridFileChange', v)));
    app = app.slice(0, lineEnd + 1) + bindBlock + app.slice(lineEnd + 1);
  } else if (domReady > 0) {
    const braceStart = app.indexOf('{', domReady);
    app = app.slice(0, braceStart + 1) + bindBlock + app.slice(braceStart + 1);
  } else {
    throw new Error('no bind point found');
  }

  fs.writeFileSync(appPath, app, 'utf8');
  console.log('app.js  patched  ' + app.length + ' bytes');
}

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
const idx2 = fs.readFileSync(idxPath, 'utf8');
const app2 = fs.readFileSync(appPath, 'utf8');
for (const s of SECTIONS) {
  console.log('  ' + s.id.padEnd(12) +
    (idx2.includes('data-section="' + s.id + '"') ? 'nav ' : 'NO-NAV ') +
    (idx2.includes('id="' + s.id + '"') ? 'panel ' : 'NO-PANEL ') +
    (idx2.includes('id="' + s.id + 'Fields"') ? 'fields ' : 'NO-FIELDS ') +
    (app2.includes("isSectionEditor") ? '' : 'NO-DISPATCH ') +
    (app2.includes(s.id + ": '") || app2.includes('"' + s.id + '":') || app2.includes(s.id + ':') ? 'schema' : 'NO-SCHEMA'));
}
for (const k of ['SECTION_FIELDS', 'hydrateSectionView', 'applySectionView', 'saveSectionData', 'renderAllSectionFields', 'harvestSectionEditors']) {
  console.log('  ' + k.padEnd(26) + (app2.includes('function ' + k) || app2.includes('const ' + k) ? 'present' : '*** MISSING ***'));
}
console.log('  ensureFeatureData routed : ' + (app2.includes('if (isSectionEditor(key)) return ensureSectionView(key)')));
console.log('  renderFeatureCardBody    : ' + (app2.includes('SECTION_FIELDS[featureId]?.fields || FEATURE_FIELDS')));
console.log('  sectionTabs has 9        : ' + ["process","latestWork","partners","awards","instagram","newsletter","statsBar","video","hours"].every(k => app2.includes(k + ": '" + k + "'")));
console.log('  cache-buster             : ' + (idx2.match(/assets\/app\.js\?v=[0-9.]+/) || ['none'])[0]);
