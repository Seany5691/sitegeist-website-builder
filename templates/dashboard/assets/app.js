// Dashboard Application Logic

// State
let siteConfig = null;
let imageMap = null;
let siteConfigDefaults = null;
let currentSection = 'overview';
let currentFolder = null;
let draggedItem = null;
let draggedListId = null;
let draggedIndex = null;

// ============================================
// MODAL HELPER FUNCTIONS
// ============================================

/**
 * Show custom confirmation modal (replaces window.confirm)
 * @param {string} message - The confirmation message
 * @param {string} title - Modal title (optional)
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirm(message, title = 'Confirm Action') {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.remove('hidden');
    
    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    const handleOk = () => {
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };
    
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

/**
 * Show custom alert modal (replaces window.alert)
 * @param {string} message - The alert message
 * @param {string} title - Modal title (optional)
 * @returns {Promise<void>}
 */
function showAlert(message, title = 'Alert') {
  return new Promise((resolve) => {
    const modal = document.getElementById('alertModal');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const okBtn = document.getElementById('alertOk');
    
    titleEl.textContent = title;
    messageEl.innerHTML = message.replace(/\n/g, '<br>');
    modal.classList.remove('hidden');
    
    const handleOk = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      resolve();
    };
    
    okBtn.addEventListener('click', handleOk);
  });
}

/**
 * Show unsaved changes modal on dashboard load
 * @param {Object} drafts - Object with configDraft and imageDraft
 * @returns {Promise<boolean>} - True if user wants to restore, false if discard
 */
function showUnsavedModal(drafts) {
  return new Promise((resolve) => {
    const modal = document.getElementById('unsavedModal');
    const detailsEl = document.getElementById('unsavedDetails');
    const restoreBtn = document.getElementById('unsavedRestore');
    const discardBtn = document.getElementById('unsavedDiscard');
    
    // Show what's in the drafts
    const details = [];
    if (drafts.configDraft) details.push('• Site configuration changes');
    if (drafts.imageDraft) details.push('• Image gallery changes');
    detailsEl.innerHTML = `<ul style="margin-top: 12px; padding-left: 20px;">${details.map(d => `<li style="margin: 4px 0;">${d}</li>`).join('')}</ul>`;
    
    modal.classList.remove('hidden');
    
    const cleanup = () => {
      modal.classList.add('hidden');
      restoreBtn.removeEventListener('click', handleRestore);
      discardBtn.removeEventListener('click', handleDiscard);
    };
    
    const handleRestore = () => {
      cleanup();
      resolve(true);
    };
    
    const handleDiscard = () => {
      cleanup();
      resolve(false);
    };
    
    restoreBtn.addEventListener('click', handleRestore);
    discardBtn.addEventListener('click', handleDiscard);
  });
}


// ============================================
// INITIALIZATION
// ============================================


// ============================================
// SECTION FIELD DEFINITIONS
// ============================================
const SECTION_FIELDS = {
  "process": {
    id: 'process', tab: 'Process', icon: 'fa-list-ol',
    help: 'Your step-by-step process — how you take a client from first contact to finished job.',
    fields: [
      { key: 'processLayout', label: 'Layout style', type: 'select', options: [
        { value: 'steps', label: 'Steps (top to bottom)' },
        { value: 'timeline', label: 'Timeline (numbered across)' },
        { value: 'cards', label: 'Cards (grid)' }
      ], placeholder: 'Choose a layout style' },
      { key: 'processTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Our Process' },
      { key: 'processSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'How We Work' },
      { key: 'process', label: 'Steps', type: 'list', addLabel: 'Add step', itemFields: [
        { key: 'step', label: 'Number (leave blank to auto-number)', type: 'text', placeholder: '1' },
        { key: 'title', label: 'Step title', type: 'text' },
        { key: 'description', label: 'What happens in this step', type: 'textarea' },
        { key: 'image', label: 'Photo (optional)', type: 'image' }
      ]}
    ]
  },
  "latestWork": {
    id: 'latestWork', tab: 'Latest Work', icon: 'fa-briefcase',
    help: 'Case studies of real jobs you have done.',
    fields: [
      { key: 'caseStudiesTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Latest Work' },
      { key: 'caseStudiesSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'Case Studies' },
      { key: 'caseStudies', label: 'Case studies', type: 'list', addLabel: 'Add case study', itemFields: [
        { key: 'title', label: 'Project name', type: 'text' },
        { key: 'summary', label: 'Short story about the job', type: 'textarea' },
        { key: 'result', label: 'Result highlight (optional)', type: 'text', placeholder: 'Finished 2 days early' },
        { key: 'image', label: 'Photo', type: 'image' },
        { key: 'tags', label: 'Tags (comma separated)', type: 'text', transform: 'tags', placeholder: 'Kitchen, Bakery' }
      ]}
    ]
  },
  "partners": {
    id: 'partners', tab: 'Partners', icon: 'fa-handshake', container: 'partners',
    help: 'Companies and organizations you work with.',
    fields: [
      { key: 'title', label: 'Section title (optional)', type: 'text', placeholder: 'Who we work with' },
      { key: 'items', label: 'Partners', type: 'list', addLabel: 'Add partner', itemFields: [
        { key: 'name', label: 'Partner name', type: 'text' },
        { key: 'logoUrl', label: 'Logo', type: 'image' },
        { key: 'url', label: 'Website link (optional)', type: 'text' }
      ]}
    ]
  },
  "awards": {
    id: 'awards', tab: 'Awards', icon: 'fa-trophy',
    help: 'Awards, press mentions, and recognition.',
    fields: [
      { key: 'awardsTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Awards & Press' },
      { key: 'awardsSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'Recognition' },
      { key: 'awards', label: 'Awards', type: 'list', addLabel: 'Add award', itemFields: [
        { key: 'title', label: 'Award name', type: 'text' },
        { key: 'issuer', label: 'Who gave it', type: 'text', placeholder: 'Best of Ballito' },
        { key: 'year', label: 'Year', type: 'text' },
        { key: 'image', label: 'Badge or logo (optional)', type: 'image' },
        { key: 'url', label: 'Link (optional)', type: 'text' }
      ]}
    ]
  },
  "instagram": {
    id: 'instagram', tab: 'Social Feed', icon: 'fa-hashtag',
    help: 'Photos from your social media.',
    fields: [
      { key: 'socialTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Follow Along' },
      { key: 'socialSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'Social' },
      { key: 'instagramFeed', label: 'Photos to show', type: 'list', addLabel: 'Add photo', itemShape: 'string', itemFields: [
        { key: 'url', label: 'Photo', type: 'image' }
      ]}
    ]
  },
  "newsletter": {
    id: 'newsletter', tab: 'Newsletter', icon: 'fa-envelope-open-text', container: 'newsletter',
    help: 'Email signup block.',
    fields: [
      { key: 'headline', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Short text under the heading', type: 'textarea' },
      { key: 'ctaLabel', label: 'Button label', type: 'text', placeholder: 'Subscribe' }
    ]
  },
  "statsBar": {
    id: 'statsBar', tab: 'Stats', icon: 'fa-chart-simple',
    help: 'Big numbers that build trust — years in business, happy clients, projects completed.',
    fields: [
      { key: 'statsTitle', label: 'Section title (optional)', type: 'text', mirrorPageContent: true },
      { key: 'statsSubtitle', label: 'Small heading above the title (optional)', type: 'text', mirrorPageContent: true },
      { key: 'stats', label: 'Numbers', type: 'list', addLabel: 'Add number', itemFields: [
        { key: 'value', label: 'Number', type: 'text', placeholder: '30+' },
        { key: 'label', label: 'What it means', type: 'text', placeholder: 'Years in business' }
      ]}
    ]
  },
  "video": {
    id: 'video', tab: 'Video', icon: 'fa-film',
    help: 'Embedded videos from YouTube or Vimeo.',
    fields: [
      { key: 'videos', label: 'Videos', type: 'list', addLabel: 'Add video', itemFields: [
        { key: 'url', label: 'YouTube or Vimeo link', type: 'text', placeholder: 'https://youtu.be/...' }
      ]}
    ]
  },
  "hours": {
    id: 'hours', tab: 'Hours', icon: 'fa-clock',
    help: 'Your business operating hours.',
    fields: [
      { key: 'businessHoursTitle', label: 'Section title', type: 'text', mirrorPageContent: true, placeholder: 'Business Hours' },
      { key: 'businessHoursSubtitle', label: 'Small heading above the title', type: 'text', mirrorPageContent: true, placeholder: 'When to Find Us' }
    ]
  },
  "beforeAfter": {
    id: 'beforeAfter', tab: 'Before / After', icon: 'fa-exchange-alt',
    help: 'Before and after comparison images.',
    fields: [
      { key: 'title', label: 'Section title', type: 'text', placeholder: 'The Transformation' },
      { key: 'pairs', label: 'Comparisons', type: 'list', addLabel: 'Add comparison', itemFields: [
        { key: 'before', label: 'Before image', type: 'image' },
        { key: 'after', label: 'After image', type: 'image' },
        { key: 'caption', label: 'Caption (optional)', type: 'text' }
      ]}
    ]
  },
  "trustBadges": {
    id: 'trustBadges', tab: 'Trust Badges', icon: 'fa-shield-alt',
    help: 'Logos and badges that build trust.',
    fields: [
      { key: 'title', label: 'Section title (optional)', type: 'text' },
      { key: 'showFrame', label: 'Show decorative frame', type: 'toggle', default: true },
      { key: 'size', label: 'Badge size', type: 'select', default: 'medium', options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ]},
      { key: 'badges', label: 'Badges', type: 'list', addLabel: 'Add badge', itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'icon', label: 'Icon (FontAwesome)', type: 'text' },
        { key: 'image', label: 'Logo', type: 'image' },
        { key: 'url', label: 'Link (optional)', type: 'text' }
      ]}
    ]
  },
  "serviceAreas": {
    id: 'serviceAreas', tab: 'Service Areas', icon: 'fa-map-marker-alt',
    help: 'Cities and areas your business serves.',
    fields: [
      { key: 'title', label: 'Section title (optional)', type: 'text', mirrorPageContent: true },
      { key: 'subtitle', label: 'Small heading (optional)', type: 'text', mirrorPageContent: true },
      { key: 'areas', label: 'Areas', type: 'list', addLabel: 'Add area', itemFields: [
        { key: 'name', label: 'Area name', type: 'text', placeholder: 'Cape Town' }
      ]}
    ]
  },
  "location": {
    id: 'location', tab: 'Location / Map', icon: 'fa-map',
    help: 'Google Map embed and location details.',
    fields: [
      { key: 'locationHeading', label: 'Location heading', type: 'text', placeholder: 'Find Us', mirrorPageContent: true },
      { key: 'mapEmbedUrl', label: 'Map embed URL', type: 'text', placeholder: 'https://www.google.com/maps?q=...&output=embed' },
      { key: 'address', label: 'Full street address', type: 'text' }
    ]
  },
  "vsl": {
    id: 'vsl', tab: 'VSL', icon: 'fa-film',
    help: 'Video Sales Letter.',
    fields: [
      { key: 'headline', label: 'Heading', type: 'text' },
      { key: 'subheadline', label: 'Subheading', type: 'text' },
      { key: 'videoUrl', label: 'Video URL', type: 'text', placeholder: 'https://www.youtube.com/embed/...' },
      { key: 'poster', label: 'Poster image', type: 'image' },
      { key: 'size', label: 'Video size', type: 'select', default: 'medium', options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ]},
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', default: false },
      { key: 'showControls', label: 'Show video controls', type: 'toggle', default: true },
      { key: 'ctaLabel', label: 'CTA button label', type: 'text' },
      { key: 'ctaUrl', label: 'CTA button link', type: 'text' }
    ]
  }
};

// ============================================
// FEATURE FIELD DEFINITIONS (for Features tab)
// ============================================
const FEATURE_FIELDS = {
  trustBadges: SECTION_FIELDS.trustBadges.fields,
  areasServedStrip: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'areas', label: 'Areas', type: 'list', addLabel: 'Add area', itemFields: [
      { key: 'name', label: 'Area name', type: 'text' }
    ]}
  ],
  beforeAfter: SECTION_FIELDS.beforeAfter.fields,
  vsl: SECTION_FIELDS.vsl.fields
};

// ============================================
// SECTION_VIEWS — working copy for section editors
// ============================================
const SECTION_VIEWS = {};

function isSectionEditor(id) {
  return Object.prototype.hasOwnProperty.call(SECTION_FIELDS, id);
}

function ensureSectionView(sectionId) {
  if (!SECTION_VIEWS[sectionId] || typeof SECTION_VIEWS[sectionId] !== 'object') SECTION_VIEWS[sectionId] = {};
  return SECTION_VIEWS[sectionId];
}

function ensureFeatureData(key) {
  if (isSectionEditor(key)) return ensureSectionView(key);
  const data = getFeatureData();
  if (!data[key] || typeof data[key] !== 'object') data[key] = {};
  return data[key];
}

function getFeatureData() {
  if (!siteConfig) siteConfig = {};
  if (!siteConfig.featureData) siteConfig.featureData = {};
  return siteConfig.featureData;
}

// ============================================
// HYDRATE / APPLY SECTION VIEWS
// ============================================
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

function applySectionView(sectionId) {
  const def = SECTION_FIELDS[sectionId];
  if (!def) return;
  if (!siteConfig) siteConfig = {};
  const target = def.container ? (siteConfig[def.container] || (siteConfig[def.container] = {})) : siteConfig;
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

function saveSectionData(sectionId) {
  if (!isSectionEditor(sectionId)) return;
  writeFeatureFieldsFromDom(sectionId);
  applySectionView(sectionId);
  getWebsiteControls();
  saveSiteConfig({ silent: true }).then(ok => {
    if (ok) showToast(SECTION_FIELDS[sectionId].tab + ' saved — refresh the website to see it.');
  });
}

function harvestSectionEditors() {
  Object.keys(SECTION_FIELDS).forEach(id => {
    if (document.getElementById(id + 'Fields')) writeFeatureFieldsFromDom(id);
  });
}

// ============================================
// RENDER FEATURE FIELDS / LISTS / CARDS
// ============================================
function renderFeatureField(featureId, field, value, listKey, index) {
  const isList = typeof index === 'number';
  const dataAttrs = 'data-feature-field="' + escapeHtml(featureId) + '"' + (isList ? ' data-list="' + escapeHtml(listKey) + '" data-index="' + index + '"' : '') + ' data-key="' + escapeHtml(field.key) + '"';
  const val = value == null ? '' : value;
  const hintHtml = field.hint ? '<div class="field-hint">' + escapeHtml(field.hint) + '</div>' : '';

  let controlHtml;
  switch (field.type) {
    case 'textarea':
      controlHtml = '<div class="editor-field"><label>' + escapeHtml(field.label) + '</label><textarea rows="3" ' + dataAttrs + '>' + escapeHtml(val) + '</textarea></div>';
      break;
    case 'number':
      controlHtml = '<div class="editor-field"><label>' + escapeHtml(field.label) + '</label><input type="number" ' + dataAttrs + ' value="' + escapeHtml(val) + '"></div>';
      break;
    case 'date':
      controlHtml = '<div class="editor-field"><label>' + escapeHtml(field.label) + '</label><input type="date" ' + dataAttrs + ' value="' + escapeHtml(val) + '"></div>';
      break;
    case 'select': {
      const selectedVal = (val === '' || val == null) && field.default != null ? String(field.default) : String(val);
      const options = (field.options || []).map(opt => {
        const optValue = opt && typeof opt === 'object' ? String(opt.value) : String(opt);
        const optLabel = opt && typeof opt === 'object' ? String(opt.label != null ? opt.label : opt.value) : String(opt);
        return '<option value="' + escapeHtml(optValue) + '"' + (selectedVal === optValue ? ' selected' : '') + '>' + escapeHtml(optLabel) + '</option>';
      }).join('');
      controlHtml = '<div class="editor-field"><label>' + escapeHtml(field.label) + '</label><select ' + dataAttrs + '>' + options + '</select></div>';
      break;
    }
    case 'toggle':
      controlHtml = '<div class="toggle-field"><label class="toggle-label"><input type="checkbox" ' + dataAttrs + (val ? ' checked' : '') + '><span class="toggle-switch"></span><span class="toggle-text">' + escapeHtml(field.label) + '</span></label></div>';
      break;
    case 'image': {
      const uploadAttrs = 'data-feature-upload="' + escapeHtml(featureId) + '"' + (isList ? ' data-list="' + escapeHtml(listKey) + '" data-index="' + index + '"' : '') + ' data-key="' + escapeHtml(field.key) + '"';
      const removeAttrs = 'data-feature-image-clear="' + escapeHtml(featureId) + '"' + (isList ? ' data-list="' + escapeHtml(listKey) + '" data-index="' + index + '"' : '') + ' data-key="' + escapeHtml(field.key) + '"';
      const fileAttrs = 'data-feature-file="' + escapeHtml(featureId) + '"' + (isList ? ' data-list="' + escapeHtml(listKey) + '" data-index="' + index + '"' : '') + ' data-key="' + escapeHtml(field.key) + '"';
      const thumb = val
        ? '<div class="feature-thumb"><img src="' + escapeHtml(val) + '" alt="' + escapeHtml(field.label) + '"></div>'
        : '<div class="feature-thumb"><i class="fas fa-image"></i></div>';
      controlHtml = '<div class="editor-field"><label>' + escapeHtml(field.label) + '</label><div class="feature-image-row">' + thumb +
        '<button type="button" class="secondary-btn" ' + uploadAttrs + '><i class="fas fa-upload"></i> Upload</button>' +
        (val ? '<button type="button" class="danger-btn" ' + removeAttrs + '><i class="fas fa-trash"></i> Remove</button>' : '') +
        '<input type="file" accept="image/*" hidden ' + fileAttrs + '></div>' +
        '<input type="text" ' + dataAttrs + ' value="' + escapeHtml(val) + '" placeholder="https://... paste an image link" class="image-url-input">' +
        '<div class="field-hint">Upload a photo, or paste an image link.</div></div>';
      break;
    }
    default:
      controlHtml = '<div class="editor-field"><label>' + escapeHtml(field.label) + '</label><input type="text" ' + dataAttrs + ' value="' + escapeHtml(val) + '"' + (field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : '') + '></div>';
  }
  return controlHtml + hintHtml;
}

function renderFeatureList(featureId, listField, items) {
  const listKey = listField.key;
  const rows = (items || []).map((item, index) => {
    const fields = (listField.itemFields || []).map(f =>
      renderFeatureField(featureId, f, item ? item[f.key] : '', listKey, index)
    ).join('');
    return '<div class="feature-list-row">' + fields +
      '<button type="button" class="danger-btn list-remove-btn" data-feature-remove="' + escapeHtml(featureId) + '" data-list="' + escapeHtml(listKey) + '" data-index="' + index + '"><i class="fas fa-trash"></i></button></div>';
  }).join('');

  return '<div class="editor-field"><label>' + escapeHtml(listField.label) + '</label><div class="feature-list">' + rows +
    '<button type="button" class="secondary-btn" data-feature-add="' + escapeHtml(featureId) + '" data-list="' + escapeHtml(listKey) + '"><i class="fas fa-plus"></i> ' + escapeHtml(listField.addLabel || 'Add item') + '</button></div></div>';
}

function renderFeatureCardBody(featureId) {
  const fields = SECTION_FIELDS[featureId]?.fields || FEATURE_FIELDS[featureId] || [];
  const data = ensureFeatureData(featureId);
  const body = fields.map(field => {
    if (field.type === 'list') {
      return renderFeatureList(featureId, field, Array.isArray(data[field.key]) ? data[field.key] : []);
    }
    return renderFeatureField(featureId, field, data[field.key]);
  }).join('');
  return body + (featureId === 'trustBadges' ? renderTrustBadgesPreview(data) : '');
}

function renderSectionFields(sectionId) {
  const container = document.getElementById(sectionId + 'Fields');
  if (!container || !SECTION_FIELDS[sectionId]) return;
  container.innerHTML = renderFeatureCardBody(sectionId);
}

function renderAllSectionFields() {
  Object.keys(SECTION_FIELDS).forEach(renderSectionFields);
}

// ============================================
// WRITE FEATURE FIELDS FROM DOM
// ============================================
function writeFeatureFieldsFromDom(featureId) {
  const data = ensureFeatureData(featureId);
  document.querySelectorAll('[data-feature-field="' + CSS.escape(featureId) + '"]').forEach(input => {
    const key = input.dataset.key;
    if (!key) return;
    let value;
    if (input.type === 'checkbox') {
      value = !!input.checked;
    } else if (input.type === 'range') {
      const n = Number(input.value);
      value = Number.isFinite(n) ? n : '';
    } else if (input.type === 'color' && input.dataset.colorUnset) {
      value = '';
    } else {
      value = input.value;
    }
    if (input.dataset.list) {
      const listKey = input.dataset.list;
      const index = parseInt(input.dataset.index, 10);
      if (!Array.isArray(data[listKey])) data[listKey] = [];
      if (!data[listKey][index]) data[listKey][index] = {};
      data[listKey][index][key] = value;
    } else {
      data[key] = value;
    }
  });
  return data;
}

// ============================================
// EVENT HANDLERS (features grid)
// ============================================
function onFeaturesGridClick(e) {
  const addBtn = e.target.closest('[data-feature-add]');
  if (addBtn) {
    harvestSectionEditors();
    const featureId = addBtn.dataset.featureAdd;
    const listKey = addBtn.dataset.list;
    const def = ((SECTION_FIELDS[featureId] && SECTION_FIELDS[featureId].fields) || FEATURE_FIELDS[featureId] || []).find(f => f.key === listKey);
    const data = ensureFeatureData(featureId);
    if (!Array.isArray(data[listKey])) data[listKey] = [];
    const blank = {};
    ((def && def.itemFields) || []).forEach(f => { blank[f.key] = ''; });
    data[listKey].push(blank);
    markDirty();
    refreshFeatureViews();
    return;
  }

  const removeBtn = e.target.closest('[data-feature-remove]');
  if (removeBtn) {
    harvestSectionEditors();
    const featureId = removeBtn.dataset.featureRemove;
    const listKey = removeBtn.dataset.list;
    const index = parseInt(removeBtn.dataset.index, 10);
    const data = ensureFeatureData(featureId);
    if (Array.isArray(data[listKey])) {
      data[listKey].splice(index, 1);
      markDirty();
      refreshFeatureViews();
    }
    return;
  }

  const uploadBtn = e.target.closest('[data-feature-upload]');
  if (uploadBtn) {
    const fileInput = uploadBtn.parentElement.querySelector('[data-feature-file]');
    if (fileInput) fileInput.click();
    return;
  }

  const clearBtn = e.target.closest('[data-feature-image-clear]');
  if (clearBtn) {
    const featureId = clearBtn.dataset.featureImageClear;
    const key = clearBtn.dataset.key;
    const listKey = clearBtn.dataset.list;
    const index = clearBtn.dataset.index;
    const data = ensureFeatureData(featureId);
    if (listKey && index != null) {
      if (data[listKey] && data[listKey][index]) data[listKey][index][key] = '';
    } else {
      data[key] = '';
    }
    markDirty();
    refreshFeatureViews();
    return;
  }

  const saveBtn = e.target.closest('[data-feature-save]');
  if (saveBtn) {
    saveSingleFeature(saveBtn.dataset.featureSave);
    return;
  }

  const colorResetBtn = e.target.closest('[data-feature-color-reset]');
  if (colorResetBtn) {
    const featureId = colorResetBtn.dataset.featureColorReset;
    const keys = (colorResetBtn.dataset.resetKeys || '').split(',').map(k => k.trim()).filter(Boolean);
    const data = ensureFeatureData(featureId);
    keys.forEach(k => { delete data[k]; });
    markDirty();
    refreshFeatureViews();
    showToast('Colours reset to default — Save to apply on the site.');
    return;
  }
}

function onFeaturesGridChange(e) {
  const input = e.target.closest('[data-feature-field]');
  if (!input) return;
  const featureId = input.dataset.featureField;
  const key = input.dataset.key;
  if (!key) return;
  const data = ensureFeatureData(featureId);
  let value;
  if (input.type === 'checkbox') {
    value = !!input.checked;
  } else if (input.type === 'range') {
    const n = Number(input.value);
    value = Number.isFinite(n) ? n : '';
  } else if (input.type === 'color' && input.dataset.colorUnset) {
    value = '';
  } else {
    value = input.value;
  }
  if (input.dataset.list) {
    const listKey = input.dataset.list;
    const index = parseInt(input.dataset.index, 10);
    if (!Array.isArray(data[listKey])) data[listKey] = [];
    if (!data[listKey][index]) data[listKey][index] = {};
    data[listKey][index][key] = value;
  } else {
    data[key] = value;
  }
  markDirty();
}

function onFeaturesGridFileChange(e) {
  const fileInput = e.target.closest('[data-feature-file]');
  if (!fileInput || !fileInput.files || !fileInput.files.length) return;
  const featureId = fileInput.dataset.featureFile;
  const key = fileInput.dataset.key;
  const listKey = fileInput.dataset.list;
  const index = fileInput.dataset.index;
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  fetch('/api/upload', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(result => {
      if (result && result.url) {
        const data = ensureFeatureData(featureId);
        if (listKey && index != null) {
          if (!Array.isArray(data[listKey])) data[listKey] = [];
          if (!data[listKey][index]) data[listKey][index] = {};
          data[listKey][index][key] = result.url;
        } else {
          data[key] = result.url;
        }
        markDirty();
        refreshFeatureViews();
      }
    })
    .catch(err => console.warn('Upload error:', err));
}

function refreshFeatureViews() {
  try { renderFeatureCards(); } catch (e) { /* no features grid */ }
  try { renderVslFields(); } catch (e) { /* no vsl */ }
  try { renderAllSectionFields(); } catch (e) { /* no section fields */ }
}

function saveSingleFeature(featureId) {
  harvestSectionEditors();
  writeFeatureFieldsFromDom(featureId);
  if (isSectionEditor(featureId)) {
    applySectionView(featureId);
  }
  getWebsiteControls();
  saveSiteConfig().then(ok => {
    if (ok) showToast('Saved!');
  });
}

// ============================================
// TRUST BADGES PREVIEW
// ============================================
function renderBadgePreviewItems(data) {
  const badges = Array.isArray(data.badges) ? data.badges.filter(b => b && (b.image || b.label || b.icon)) : [];
  return badges.map(b =>
    '<div class="badge-preview-item">' +
    (b.image ? '<img src="' + escapeHtml(b.image) + '" alt="' + escapeHtml(b.label || '') + '">' :
      (b.icon ? '<i class="fas ' + escapeHtml(b.icon) + '"></i>' : '')) +
    (b.label ? '<span>' + escapeHtml(b.label) + '</span>' : '') +
    '</div>'
  ).join('');
}

function renderTrustBadgesPreview(data) {
  const items = renderBadgePreviewItems(data);
  return '<div class="badge-preview">' + (items || '<div class="badge-preview-empty">No badges yet</div>') + '</div>';
}

function refreshBadgePreview(featureId) {
  if (featureId !== 'trustBadges') return;
  const data = ensureFeatureData(featureId);
  const preview = document.querySelector('.badge-preview');
  if (preview) {
    preview.innerHTML = renderBadgePreviewItems(data) || '<div class="badge-preview-empty">No badges yet</div>';
  }
}

// ============================================
// CONTROL SECTIONS / PAGES / FEATURES
// ============================================
const CONTROL_SECTIONS = [
  { id: 'hero', label: 'Hero', locked: true },
  { id: 'statsBar', label: 'Stats / By the Numbers' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process / How It Works' },
  { id: 'gallery', label: 'Gallery / Portfolio' },
  { id: 'beforeAfter', label: 'Before / After' },
  { id: 'latestWork', label: 'Latest Work / Case Studies' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'trustBadges', label: 'Trust Badges' },
  { id: 'about', label: 'About / Story' },
  { id: 'team', label: 'Team' },
  { id: 'partners', label: 'Partners / Sponsors' },
  { id: 'video', label: 'Video' },
  { id: 'serviceAreas', label: 'Service Areas' },
  { id: 'location', label: 'Location / Map' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'blogStrip', label: 'Blog' },
  { id: 'awards', label: 'Awards / Press' },
  { id: 'instagram', label: 'Instagram / Social' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'cta', label: 'CTA Banner', locked: true },
  { id: 'contact', label: 'Contact', locked: true },
  { id: 'vsl', label: 'VSL' }
];

const CONTROL_SECTION_DEFAULTS = {
  hero: true, statsBar: true, services: true, process: true, gallery: true,
  beforeAfter: false, latestWork: true, testimonials: true, trustBadges: false,
  about: true, team: false, partners: false, video: false, serviceAreas: true,
  location: true, pricing: true, faq: true, blogStrip: false, awards: false,
  instagram: false, newsletter: false, cta: true, contact: true, vsl: false
};

const CONTROL_PAGES = [
  { id: 'home', label: 'Home', locked: true },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio / Gallery' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact', locked: true },
  { id: 'privacy', label: 'Privacy / Terms' },
  { id: 'teamPage', label: 'Team — page' },
  { id: 'blogPage', label: 'Blog — page' },
  { id: 'faqPage', label: 'FAQ — page' },
  { id: 'reviewsPage', label: 'Reviews — page' },
  { id: 'areasPage', label: 'Areas We Serve' },
  { id: 'processPage', label: 'Process Page' }
];

const CONTROL_PAGE_DEFAULTS = {
  home: true, services: true, portfolio: true, about: true, contact: true,
  privacy: true, teamPage: false, blogPage: false, faqPage: false,
  reviewsPage: false, areasPage: false, processPage: false
};

const FEATURE_DEFS = [
  { id: 'whatsapp', label: 'WhatsApp Chat', icon: 'fa-whatsapp', defaultOn: true },
  { id: 'cookieBar', label: 'Cookie Bar', icon: 'fa-cookie-bite', defaultOn: false },
  { id: 'quotePopup', label: 'Quote Slide-In', icon: 'fa-comment-dollar', defaultOn: false },
  { id: 'trustBadges', label: 'Trust Badges Strip', icon: 'fa-shield-alt', defaultOn: false },
  { id: 'areasServedStrip', label: 'Areas We Serve Strip', icon: 'fa-map-marker-alt', defaultOn: true },
  { id: 'beforeAfter', label: 'Before / After Slider', icon: 'fa-exchange-alt', defaultOn: false }
];

const SECTION_FEATURE_KEY = {
  trustBadges: 'trustBadges',
  areasServedStrip: 'serviceAreas',
  beforeAfter: 'beforeAfter',
  whatsapp: 'whatsapp',
  cookieBar: 'cookieBar',
  quotePopup: 'quotePopup'
};

// ============================================
// GET WEBSITE CONTROLS (normalize + sync)
// ============================================
function getWebsiteControls() {
  if (!siteConfig) siteConfig = {};
  // Sync navPages to controls.pages
  if (siteConfig.navPages && typeof siteConfig.navPages === 'object') {
    if (!siteConfig.controls) siteConfig.controls = {};
    if (!siteConfig.controls.pages) siteConfig.controls.pages = {};
    Object.keys(siteConfig.navPages).forEach(function(k) {
      if (k === '_order') return;
      if (typeof siteConfig.navPages[k] === 'boolean') {
        siteConfig.controls.pages[k] = siteConfig.navPages[k];
      }
    });
  }
  if (!siteConfig.controls) siteConfig.controls = {};
  const c = siteConfig.controls;
  if (!c.sections || typeof c.sections !== 'object') c.sections = {};
  if (!c.pages || typeof c.pages !== 'object') c.pages = {};
  if (!c.features || typeof c.features !== 'object') c.features = {};

  CONTROL_SECTIONS.forEach(s => {
    if (s.locked) { c.sections[s.id] = true; return; }
    if (typeof c.sections[s.id] !== 'boolean') c.sections[s.id] = CONTROL_SECTION_DEFAULTS[s.id] === true;
  });
  CONTROL_PAGES.forEach(p => {
    if (p.locked) { c.pages[p.id] = true; return; }
    if (typeof c.pages[p.id] !== 'boolean') c.pages[p.id] = CONTROL_PAGE_DEFAULTS[p.id] === true;
  });
  FEATURE_DEFS.forEach(f => {
    if (typeof c.features[f.id] !== 'boolean') c.features[f.id] = f.defaultOn === true;
  });

  // Section order
  const validIds = CONTROL_SECTIONS.map(s => s.id);
  let order = Array.isArray(c.sectionOrder) ? c.sectionOrder.slice() : [];
  order = order.filter((id, i) => validIds.indexOf(id) !== -1 && order.indexOf(id) === i);
  validIds.forEach(id => { if (order.indexOf(id) === -1) order.push(id); });
  order = order.filter(id => id !== 'hero' && id !== 'cta');
  order.unshift('hero');
  order.push('cta');
  c.sectionOrder = order;

  return c;
}

// ============================================
// HARVEST PENDING FORM EDITS
// ============================================
function harvestPendingFormEdits() {
  if (!siteConfig) return true;
  applyHeroFields();
  applyAboutFields();
  applyPageContentFields();
  applySeoFields();
  applyBusinessIdentityFields();
  applyContactFields();
  applySocialFields();
  applyNavigationFields();
  applyWhatsappFields();
  applyBusinessHoursToggle();

  // Service sub-page content
  try {
    if (typeof cpHarvestSubpageFields === 'function') cpHarvestSubpageFields()
  } catch (e) { console.warn('harvest subpage', e) }

  // Gallery display settings
  try {
    var gm = document.getElementById('galleryHomeMode')
    var gf = document.getElementById('galleryHomeFilter')
    var gp = document.getElementById('galleryPictureLimit')
    var gf2 = document.getElementById('galleryFolderLimit')
    if (gm) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homeMode = gm.value }
    if (gf) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homeFilter = gf.value }
    if (gp) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homePictureLimit = gp.value }
    if (gf2) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homeFolderLimit = gf2.value }
  } catch (e) { console.warn('gallery settings harvest', e) }

  // Section editors
  Object.keys(SECTION_FIELDS).forEach((sectionId) => {
    try {
      writeFeatureFieldsFromDom(sectionId);
      applySectionView(sectionId);
    } catch (e) {
      console.warn('harvest section', sectionId, e)
    }
  })

  // Feature fields
  Object.keys(FEATURE_FIELDS || {}).forEach((featureId) => {
    try {
      writeFeatureFieldsFromDom(featureId)
    } catch (e) {
      console.warn('harvest feature', featureId, e)
    }
  })

  getWebsiteControls();

  return applyLocationIdentityFields();
}

// ============================================
// LOCATION IDENTITY (Settings)
// ============================================
function loadLocationIdentity() {
  const el = (id) => document.getElementById(id);
  const sc = siteConfig || {};
  const contact = sc.contact || {};
  const geo = sc.geo || {};
  if (el('settingsStreetAddress')) el('settingsStreetAddress').value = contact.address || '';
  if (el('settingsPostalCode')) el('settingsPostalCode').value = contact.postalCode || '';
  if (el('settingsLat')) el('settingsLat').value = geo.latitude || '';
  if (el('settingsLng')) el('settingsLng').value = geo.longitude || '';
  if (el('settingsFoundingDate')) el('settingsFoundingDate').value = sc.foundingDate || '';
  if (el('settingsServiceAreas')) el('settingsServiceAreas').value = (geo.serviceAreas || []).join(', ');
  if (el('settingsMapUrl')) el('settingsMapUrl').value = sc.mapEmbedUrl || '';
  if (el('settingsLocationHeading')) el('settingsLocationHeading').value = sc.locationHeading || '';
}

function applyLocationIdentityFields() {
  const el = (id) => document.getElementById(id);
  if (!siteConfig) siteConfig = {};
  if (!siteConfig.contact) siteConfig.contact = {};
  if (!siteConfig.geo) siteConfig.geo = {};

  if (el('settingsStreetAddress')) siteConfig.contact.address = el('settingsStreetAddress').value;
  if (el('settingsPostalCode')) siteConfig.contact.postalCode = el('settingsPostalCode').value;
  if (el('settingsLat')) siteConfig.geo.latitude = el('settingsLat').value;
  if (el('settingsLng')) siteConfig.geo.longitude = el('settingsLng').value;
  if (el('settingsFoundingDate')) siteConfig.foundingDate = el('settingsFoundingDate').value;
  if (el('settingsServiceAreas')) {
    const raw = el('settingsServiceAreas').value || '';
    siteConfig.geo.serviceAreas = raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (el('settingsMapUrl')) siteConfig.mapEmbedUrl = el('settingsMapUrl').value;
  if (el('settingsLocationHeading')) siteConfig.locationHeading = el('settingsLocationHeading').value;

  return true;
}

function saveLocationIdentity() {
  applyLocationIdentityFields();
  saveSiteConfig().then(ok => {
    if (ok) showToast('Location & Identity saved!');
  });
}

function toMapEmbedUrl(input) {
  if (!input) return '';
  let url = String(input).trim();
  if (url.includes('output=embed')) return url;
  if (url.includes('google.com/maps')) {
    if (!url.includes('output=embed')) {
      url += (url.includes('?') ? '&' : '?') + 'output=embed';
    }
    return url;
  }
  return url;
}

// ============================================
// VSL (Video Sales Letter)
// ============================================
function normalizeVslData() {
  if (!siteConfig) siteConfig = {};
  if (!siteConfig.featureData) siteConfig.featureData = {};
  if (!siteConfig.featureData.vsl) siteConfig.featureData.vsl = {};
  return siteConfig.featureData.vsl;
}

function renderVslFields() {
  const container = document.getElementById('vslFields');
  if (!container) return;
  container.innerHTML = renderFeatureCardBody('vsl');
}

function saveVsl() {
  writeFeatureFieldsFromDom('vsl');
  saveSiteConfig().then(ok => {
    if (ok) showToast('VSL saved!');
  });
}

// ============================================
// MARK DIRTY / FLOATING SAVE
// ============================================
function markDirty() {
  if (typeof suppressDirty !== 'undefined' && suppressDirty) return;
  setDirty(true);
}

function setDirty(value) {
  isDirty = !!value;
  updateFloatingSave();
}

function updateFloatingSave() {
  const el = document.getElementById('floatingSave');
  if (!el) return;
  el.classList.toggle('visible', isDirty);
}

// ============================================
// REORDER ARRAY (drag and drop)
// ============================================
function reorderArray(listId, fromIndex, toIndex) {
  if (!siteConfig) return;
  let arr;
  switch (listId) {
    case 'services': arr = siteConfig.services; break;
    case 'pricing': arr = siteConfig.pricing; break;
    case 'testimonials': arr = siteConfig.testimonials; break;
    case 'blog': arr = siteConfig.blogPosts; break;
    case 'team': arr = siteConfig.team; break;
    case 'faq': arr = siteConfig.faq; break;
    default:
      if (listId.startsWith('folder-')) {
        const catName = listId.replace('folder-', '');
        const cat = imageMap?.categories?.[catName];
        if (cat && Array.isArray(cat.images)) {
          const [moved] = cat.images.splice(fromIndex, 1);
          cat.images.splice(toIndex, 0, moved);
          saveImageMap();
          return;
        }
      }
      return;
  }
  if (!Array.isArray(arr)) return;
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  saveSiteConfig();
}

// ============================================
// MAKE DRAGGABLE
// ============================================
function makeDraggable(itemEl, listId, index) {
  itemEl.setAttribute('draggable', 'true');
  itemEl.dataset.index = index;
  itemEl.dataset.listId = listId;

  itemEl.addEventListener('dragstart', (e) => {
    draggedItem = itemEl;
    draggedListId = listId;
    draggedIndex = index;
    itemEl.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  });

  itemEl.addEventListener('dragend', () => {
    itemEl.style.opacity = '1';
    draggedItem = null;
  });

  itemEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  itemEl.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedItem || draggedListId !== listId) return;
    const toIndex = parseInt(itemEl.dataset.index, 10);
    if (draggedIndex === toIndex) return;
    reorderArray(listId, draggedIndex, toIndex);
  });
}


// ============================================
// UTILITY: HTML ESCAPING
// ============================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  if (str == null) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// ============================================
// PROMPT MODAL
// ============================================
function showPrompt(message, title, defaultValue, label) {
  return new Promise((resolve) => {
    const modal = document.getElementById('promptModal');
    if (!modal) { resolve(defaultValue || ''); return; }
    const msgEl = document.getElementById('promptMessage');
    const inputEl = document.getElementById('promptInput');
    const okBtn = document.getElementById('promptOk');
    const cancelBtn = document.getElementById('promptCancel');
    const titleEl = document.getElementById('promptTitle');
    if (titleEl && title) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message || '';
    if (inputEl) inputEl.value = defaultValue || '';
    if (label) {
      const labelEl = document.getElementById('promptLabel');
      if (labelEl) labelEl.textContent = label;
    }
    modal.classList.remove('hidden');

    const handleOk = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      resolve(inputEl ? inputEl.value : defaultValue || '');
    };
    const handleCancel = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      resolve(null);
    };
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if already authenticated via NextAuth session
  checkAuth();

  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(item.dataset.section);
    });
  });

  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'var(--primary)'; });
  uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = 'var(--border)'; });
  uploadZone.addEventListener('drop', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'var(--border)'; handleFileSelect(e.dataTransfer.files); });
  fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));

  loadSiteConfig();
});

// ============================================
// AUTHENTICATION (NextAuth Integration)
// ============================================

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/session')
    const session = await res.json()
    
    if (session?.user) {
      showDashboard()
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');
  
  try {
    // Get CSRF token
    const csrfRes = await fetch('/api/auth/csrf')
    const { csrfToken } = await csrfRes.json()
    
    // Call NextAuth credentials endpoint
    const res = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        csrfToken,
        callbackUrl: '/dashboard',
        json: true
      })
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data.url || !data.error) {
        // Success - NextAuth set secure HTTP-only cookie
        showDashboard()
        errorEl.style.display = 'none'
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
    } else {
      throw new Error('Invalid username or password')
    }
  } catch (error) {
    errorEl.textContent = error.message || 'Login failed. Please try again.'
    errorEl.style.display = 'block'
  }
}

async function logout() {
  try {
    await fetch('/api/auth/signout', { method: 'POST' })
  } catch (e) {
    console.error('Logout error:', e)
  }
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  sessionStorage.setItem('justLoggedIn', 'true'); // Flag for tutorial
  loadDashboardData();
}

// ============================================
// DATA LOADING
// ============================================

async function loadSiteConfig() {
  try {
    const config = window.DASHBOARD_CONFIG;

    // Clear localStorage if business name changed (prevents stale data from other sites)
    const savedBusinessName = localStorage.getItem('dashboard_business_name');
    if (savedBusinessName && savedBusinessName !== config.businessName) {
      localStorage.removeItem('siteConfig');
      localStorage.removeItem('imageMap');
      localStorage.removeItem('dashboard_business_name');
    }
    localStorage.setItem('dashboard_business_name', config.businessName);

    // Always fetch fresh data from server (with cache-busting)
    const timestamp = Date.now();
    const [configRes, imageRes, defaultsRes] = await Promise.allSettled([
      fetch(config.paths.siteConfig + '?t=' + timestamp),
      fetch(config.paths.imageMap + '?t=' + timestamp),
      fetch('/site-config-defaults.json?t=' + timestamp),
    ]);
    
    // Enhanced error handling with JSON parse protection
    if (configRes.status === 'fulfilled' && configRes.value.ok) {
      try {
        const text = await configRes.value.text();
        siteConfig = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse site-config.json:', e);
        siteConfig = {};
      }
    } else {
      console.warn('Failed to fetch site-config.json');
      siteConfig = {};
    }
    
    if (imageRes.status === 'fulfilled' && imageRes.value.ok) {
      try {
        const text = await imageRes.value.text();
        imageMap = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse image-map.json:', e);
        imageMap = { businessName: config.businessName, totalImages: 0, categories: {} };
      }
    } else {
      console.warn('Failed to fetch image-map.json');
      imageMap = { businessName: config.businessName, totalImages: 0, categories: {} };
    }
    
    if (defaultsRes.status === 'fulfilled' && defaultsRes.value.ok) {
      try {
        const text = await defaultsRes.value.text();
        siteConfigDefaults = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse site-config-defaults.json:', e);
        siteConfigDefaults = {};
      }
    } else {
      console.warn('Failed to fetch site-config-defaults.json');
      siteConfigDefaults = {};
    }

    // DO NOT merge localStorage - always use fresh server data to prevent cross-contamination

    updateUI();
    setupAdaptiveNavigation();
  } catch (error) {
    console.log('Could not load site config:', error);
  }
}

function loadDashboardData() {
  const config = window.DASHBOARD_CONFIG;
  document.getElementById('sidebarBusinessName').textContent = config.businessName;
  document.getElementById('headerBusinessName').textContent = config.businessName;
  document.getElementById('loginBusinessName').textContent = config.businessName;
  document.getElementById('infoBusiness').textContent = config.businessName;
  document.getElementById('infoIndustry').textContent = config.industry;
  document.getElementById('infoLocation').textContent = config.city;
  document.getElementById('infoPhone').textContent = config.phone;
  document.getElementById('settingsPhone').value = config.phone || '';
  document.getElementById('settingsEmail').value = config.email || '';
  document.getElementById('settingsAddress').value = config.address || '';
  document.getElementById('settingsFacebook').value = config.social?.facebook || '';
  document.getElementById('settingsInstagram').value = config.social?.instagram || '';
  document.getElementById('settingsTwitter').value = config.social?.twitter || '';
  document.getElementById('seoTitle').value = config.seo?.title || '';
  document.getElementById('seoDescription').value = config.seo?.description || '';
  document.getElementById('seoKeywords').value = config.seo?.keywords || '';
  loadHeroContent();
  loadAboutContent();
  loadPageContent();
  loadGalleryFolders();
  loadServices();
  loadPricing();
  loadTestimonials();
  loadBlogPosts();
  updateStats();
}

function updateUI() {
  if (!siteConfig) return;
  document.getElementById('galleryCount').textContent = siteConfig.gallery?.length || 0;
  document.getElementById('blogCount').textContent = siteConfig.services?.length || 0;
}

function updateStats() {
  document.getElementById('totalVisits').textContent = '--';
  document.getElementById('uniqueVisitors').textContent = '--';
}

function setupAdaptiveNavigation() {
  const hasGallery = imageMap?.categories && Object.keys(imageMap.categories).length > 0;
  const hasServices = siteConfig?.services && siteConfig.services.length > 0;
  const hasPricing = siteConfig?.pricing && siteConfig.pricing.length > 0;
  const hasTestimonials = siteConfig?.testimonials && siteConfig.testimonials.length > 0;
  const hasBlog = siteConfig?.blog && siteConfig.blog.length > 0;
  const hasTeam = siteConfig?.team && siteConfig.team.length > 0;
  const hasFaq = siteConfig?.faq && siteConfig.faq.length > 0;
  
  // Update counts
  document.getElementById('galleryCount').textContent = hasGallery ? Object.values(imageMap.categories).reduce((s, c) => s + (c.images?.length || 0), 0) : '0';
  if (hasServices) document.getElementById('blogCount').textContent = siteConfig.services.length;
  
  // Hide/show navigation items based on content availability
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const section = item.dataset.section;
    let shouldShow = true;
    
    switch(section) {
      case 'gallery':
        shouldShow = hasGallery;
        break;
      case 'services':
        shouldShow = hasServices;
        break;
      case 'pricing':
        shouldShow = hasPricing;
        break;
      case 'testimonials':
        shouldShow = hasTestimonials;
        break;
      case 'blog':
        shouldShow = hasBlog;
        break;
      case 'team':
        shouldShow = hasTeam;
        break;
      case 'faq':
        shouldShow = hasFaq;
        break;
      // Always show: overview, hero, about, content, seo, settings, design-system
      default:
        shouldShow = true;
    }
    
    item.style.display = shouldShow ? 'flex' : 'none';
  });
}

// ============================================
// DRAG AND DROP — SHARED
// ============================================

function makeDraggable(itemEl, listId, index) {
  itemEl.setAttribute('draggable', 'true');
  itemEl.dataset.index = index;
  itemEl.dataset.listId = listId;

  itemEl.addEventListener('dragstart', (e) => {
    draggedItem = itemEl;
    draggedListId = listId;
    draggedIndex = index;
    itemEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  });

  itemEl.addEventListener('dragend', () => {
    itemEl.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    draggedItem = null;
    draggedListId = null;
    draggedIndex = null;
  });

  itemEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (itemEl !== draggedItem && itemEl.dataset.listId === draggedListId) {
      itemEl.classList.add('drag-over');
    }
  });

  itemEl.addEventListener('dragleave', () => {
    itemEl.classList.remove('drag-over');
  });

  itemEl.addEventListener('drop', (e) => {
    e.preventDefault();
    itemEl.classList.remove('drag-over');
    if (!draggedItem || itemEl === draggedItem || itemEl.dataset.listId !== draggedListId) return;

    const fromIndex = draggedIndex;
    const toIndex = parseInt(itemEl.dataset.index);
    if (isNaN(toIndex)) return;

    reorderArray(listId, fromIndex, toIndex);
  });
}

function reorderArray(listId, fromIndex, toIndex) {
  let arr;
  let saveFn;

  switch (listId) {
    case 'services':
      arr = siteConfig.services;
      saveFn = () => { saveSiteConfig(); loadServices(); };
      break;
    case 'pricing':
      arr = siteConfig.pricing;
      saveFn = () => { saveSiteConfig(); loadPricing(); };
      break;
    case 'testimonials':
      arr = siteConfig.testimonials;
      saveFn = () => { saveSiteConfig(); loadTestimonials(); };
      break;
    case 'blog':
      arr = siteConfig.blogPosts;
      saveFn = () => { saveSiteConfig(); loadBlogPosts(); };
      break;
    case 'team':
      arr = siteConfig.team;
      saveFn = () => { saveSiteConfig(); loadTeam(); };
      break;
    case 'faq':
      arr = siteConfig.faq;
      saveFn = () => { saveSiteConfig(); loadFaq(); };
      break;
    default:
      if (listId.startsWith('folder-')) {
        const cat = listId.replace('folder-', '');
        arr = imageMap.categories[cat]?.images;
        saveFn = () => { saveImageMap(); viewFolder(cat); };
      }
      break;
  }

  if (!arr || fromIndex < 0 || toIndex < 0 || fromIndex >= arr.length || toIndex >= arr.length) return;

  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  saveFn();
  showToast('Reordered!');
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

function loadGalleryFolders() {
  const grid = document.getElementById('galleryGrid');
  const select = document.getElementById('uploadFolder');
  const categories = imageMap?.categories || {};
  grid.innerHTML = '';
  select.innerHTML = '';

  Object.entries(categories).forEach(([catName, catData]) => {
    const count = catData.images?.length || 0;

    const folder = document.createElement('div');
    folder.className = 'gallery-folder';

    const thumbUrl = catData.thumbnail || (catData.images?.[0] ? (typeof catData.images[0] === 'string' ? catData.images[0] : catData.images[0].imageUrl) : '');
    const thumbHtml = thumbUrl
      ? `<img src="${thumbUrl}" alt="${catName}">`
      : '<div class="thumb-placeholder"><i class="fas fa-folder"></i></div>';

    folder.innerHTML = `
      <div class="gallery-folder-thumb">${thumbHtml}</div>
      <div class="gallery-folder-info">
        <div class="gallery-folder-name">${catName}</div>
        <div class="gallery-folder-count">${count} photo${count !== 1 ? 's' : ''}</div>
        <button class="danger-btn" style="margin-top:0.5rem;font-size:0.75rem;padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); deleteFolder('${catName}')">
          <i class="fas fa-trash"></i> Delete Folder
        </button>
      </div>
    `;
    folder.onclick = () => viewFolder(catName);
    grid.appendChild(folder);

    const option = document.createElement('option');
    option.value = catName;
    option.textContent = catName;
    select.appendChild(option);
  });
}

function viewFolder(category) {
  currentFolder = category;
  const modal = document.getElementById('folderViewModal');
  const title = document.getElementById('folderViewTitle');
  const grid = document.getElementById('folderImageGrid');
  const countEl = document.getElementById('folderImageCount');
  const thumbPreview = document.getElementById('folderThumbnailPreview');

  title.textContent = category;
  modal.classList.remove('hidden');

  const catData = imageMap?.categories?.[category] || { images: [] };
  const images = catData.images || [];
  countEl.textContent = `(${images.length})`;

  // Thumbnail preview
  const thumbUrl = catData.thumbnail || '';
  thumbPreview.innerHTML = thumbUrl
    ? `<img src="${thumbUrl}" alt="Thumbnail">`
    : '<div class="hero-placeholder"><i class="fas fa-image"></i><p>No thumbnail set</p></div>';

  // Image grid with drag-and-drop
  grid.innerHTML = '';
  images.forEach((imgUrl, index) => {
    const url = typeof imgUrl === 'string' ? imgUrl : imgUrl.imageUrl;
    const item = document.createElement('div');
    item.className = 'folder-image-item';
    item.innerHTML = `
      <img src="${url}" alt="Image ${index + 1}" loading="lazy">
      <button class="delete-image-btn" onclick="event.stopPropagation(); deleteFolderImage('${category}', ${index})" title="Delete">
        <i class="fas fa-times"></i>
      </button>
    `;
    makeDraggable(item, 'folder-' + category, index);
    grid.appendChild(item);
  });
}

function closeFolderView() {
  document.getElementById('folderViewModal').classList.add('hidden');
  currentFolder = null;
  loadGalleryFolders();
}

async function deleteFolderImage(category, index) {
  if (!await showConfirm('Delete this image?', 'Delete Image')) return;
  imageMap.categories[category].images.splice(index, 1);
  saveImageMap();
  viewFolder(category);
  showToast('Image deleted!');
}

function createFolder() {
  const input = document.getElementById('newFolderName');
  const name = input.value.trim();
  if (!name) return;
  if (!imageMap) imageMap = { categories: {} };
  if (!imageMap.categories[name]) imageMap.categories[name] = { images: [] };
  loadGalleryFolders();
  input.value = '';
  saveImageMap();
  showToast('Folder created!');
}

async function deleteFolder(catName) {
  if (!await showConfirm(`Delete folder "${catName}" and all its images? This cannot be undone.`, 'Delete Folder')) return;
  if (!imageMap || !imageMap.categories[catName]) return;
  delete imageMap.categories[catName];
  saveImageMap();
  loadGalleryFolders();
  showToast(`Folder "${catName}" deleted!`);
}

// ============================================
// THUMBNAIL MANAGEMENT
// ============================================

async function handleThumbnailUpload(files) {
  if (!files.length || !currentFolder) return;
  const file = files[0];
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const result = await res.json();
      if (!imageMap.categories[currentFolder]) imageMap.categories[currentFolder] = { images: [] };
      imageMap.categories[currentFolder].thumbnail = result.url;
      saveImageMap();
      viewFolder(currentFolder);
      showToast('Thumbnail set!');
    }
  } catch (e) {
    showToast('Upload failed', 'error');
  }
}

function pickThumbnailFromImages() {
  if (!currentFolder) return;
  const modal = document.getElementById('thumbnailPickerModal');
  const grid = document.getElementById('thumbnailPickerGrid');
  const images = imageMap?.categories?.[currentFolder]?.images || [];
  grid.innerHTML = '';

  images.forEach((imgUrl, index) => {
    const url = typeof imgUrl === 'string' ? imgUrl : imgUrl.imageUrl;
    const item = document.createElement('div');
    item.className = 'folder-image-item';
    item.innerHTML = `<img src="${url}" alt="Image ${index + 1}" loading="lazy">`;
    item.onclick = () => {
      imageMap.categories[currentFolder].thumbnail = url;
      saveImageMap();
      viewFolder(currentFolder);
      closeThumbnailPicker();
      showToast('Thumbnail set!');
    };
    grid.appendChild(item);
  });

  modal.classList.remove('hidden');
}

function closeThumbnailPicker() {
  document.getElementById('thumbnailPickerModal').classList.add('hidden');
}

// ============================================
// HERO SECTION
// ============================================

function loadHeroContent() {
  const hero = siteConfig?.hero || {};
  document.getElementById('heroHeadline').value = hero.headline || '';
  document.getElementById('heroSubheadline').value = hero.subheadline || '';
  document.getElementById('heroBadge').value = hero.badge || '';
  document.getElementById('heroCta').value = hero.ctaText || '';
  document.getElementById('heroCtaLink').value = hero.ctaLink || '#contact';

  const preview = document.getElementById('heroImagePreview');
  const imgUrl = hero.heroImageUrl || '';
  preview.innerHTML = imgUrl
    ? `<img src="${imgUrl}" alt="Hero">`
    : '<div class="hero-placeholder"><i class="fas fa-image"></i><p>No hero image set</p></div>';
}

function saveHeroContent() {
  if (!siteConfig) return;
  if (!siteConfig.hero) siteConfig.hero = {};
  siteConfig.hero.headline = document.getElementById('heroHeadline').value;
  siteConfig.hero.subheadline = document.getElementById('heroSubheadline').value;
  siteConfig.hero.badge = document.getElementById('heroBadge').value;
  siteConfig.hero.ctaText = document.getElementById('heroCta').value;
  siteConfig.hero.ctaLink = document.getElementById('heroCtaLink').value;
  saveSiteConfig();
}

async function handleHeroImageUpload(files) {
  if (!files.length) return;
  const file = files[0];
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const result = await res.json();
      if (!siteConfig.hero) siteConfig.hero = {};
      siteConfig.hero.heroImageUrl = result.url;
      saveSiteConfig();
      loadHeroContent();
      showToast('Hero image updated!');
    }
  } catch (e) {
    showToast('Upload failed', 'error');
  }
}

function removeHeroImage() {
  if (!siteConfig?.hero) return;
  siteConfig.hero.heroImageUrl = '';
  saveSiteConfig();
  loadHeroContent();
  showToast('Hero image removed!');
}

// ============================================
// ABOUT PAGE
// ============================================

function loadAboutContent() {
  const about = siteConfig?.about || {};
  document.getElementById('aboutTitle').value = about.title || '';
  document.getElementById('aboutTagline').value = about.tagline || '';
  document.getElementById('aboutPara1').value = about.paragraph1 || '';
  document.getElementById('aboutPara2').value = about.paragraph2 || '';
  document.getElementById('aboutPara3').value = about.paragraph3 || '';

  const preview = document.getElementById('aboutImagePreview');
  const imgUrl = about.imageUrl || '';
  preview.innerHTML = imgUrl
    ? `<img src="${imgUrl}" alt="About">`
    : '<div class="hero-placeholder"><i class="fas fa-image"></i><p>No image set</p></div>';
}

function saveAboutContent() {
  if (!siteConfig) return;
  if (!siteConfig.about) siteConfig.about = {};
  siteConfig.about.title = document.getElementById('aboutTitle').value;
  siteConfig.about.tagline = document.getElementById('aboutTagline').value;
  siteConfig.about.paragraph1 = document.getElementById('aboutPara1').value;
  siteConfig.about.paragraph2 = document.getElementById('aboutPara2').value;
  siteConfig.about.paragraph3 = document.getElementById('aboutPara3').value;
  saveSiteConfig();
}

async function handleAboutImageUpload(files) {
  if (!files.length) return;
  const file = files[0];
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const result = await res.json();
      if (!siteConfig.about) siteConfig.about = {};
      siteConfig.about.imageUrl = result.url;
      saveSiteConfig();
      loadAboutContent();
      showToast('About image updated!');
    }
  } catch (e) {
    showToast('Upload failed', 'error');
  }
}

// ============================================
// PAGE CONTENT EDITORS
// ============================================

function loadPageContent() {
  const pc = siteConfig?.pageContent || {};
  document.getElementById('servicesPageTitle').value = pc.servicesTitle || '';
  document.getElementById('servicesPageDesc').value = pc.servicesDescription || '';
  document.getElementById('servicesCtaTitle').value = pc.servicesCtaTitle || '';
  document.getElementById('servicesCtaText').value = pc.servicesCtaText || '';
  document.getElementById('contactPageTitle').value = pc.contactTitle || '';
  document.getElementById('contactPageDesc').value = pc.contactDescription || '';
  document.getElementById('portfolioPageTitle').value = pc.portfolioTitle || '';
  document.getElementById('portfolioPageDesc').value = pc.portfolioDescription || '';
  document.getElementById('testimonialsTitle').value = pc.testimonialsTitle || '';
  document.getElementById('testimonialsSubtitle').value = pc.testimonialsSubtitle || '';
  document.getElementById('faqTitle').value = pc.faqTitle || '';
  document.getElementById('faqSubtitle').value = pc.faqSubtitle || '';
}

function savePageContent() {
  if (!siteConfig) return;
  siteConfig.pageContent = {
    servicesTitle: document.getElementById('servicesPageTitle').value,
    servicesDescription: document.getElementById('servicesPageDesc').value,
    servicesCtaTitle: document.getElementById('servicesCtaTitle').value,
    servicesCtaText: document.getElementById('servicesCtaText').value,
    contactTitle: document.getElementById('contactPageTitle').value,
    contactDescription: document.getElementById('contactPageDesc').value,
    portfolioTitle: document.getElementById('portfolioPageTitle').value,
    portfolioDescription: document.getElementById('portfolioPageDesc').value,
    testimonialsTitle: document.getElementById('testimonialsTitle').value,
    testimonialsSubtitle: document.getElementById('testimonialsSubtitle').value,
    faqTitle: document.getElementById('faqTitle').value,
    faqSubtitle: document.getElementById('faqSubtitle').value,
  };
  saveSiteConfig();
}

// ============================================
// RESET TO DEFAULT
// ============================================

async function resetSection(section) {
  if (!siteConfigDefaults) {
    showToast('No defaults file found. Build a new site first.', 'warning');
    return;
  }
  if (!await showConfirm(`Reset ${section} to default? This will overwrite your changes.`, 'Reset Section')) return;

  switch (section) {
    case 'hero':
      siteConfig.hero = JSON.parse(JSON.stringify(siteConfigDefaults.hero || {}));
      loadHeroContent();
      break;
    case 'about':
      siteConfig.about = JSON.parse(JSON.stringify(siteConfigDefaults.about || {}));
      loadAboutContent();
      break;
    case 'services':
      siteConfig.services = JSON.parse(JSON.stringify(siteConfigDefaults.services || []));
      loadServices();
      break;
    case 'pricing':
      siteConfig.pricing = JSON.parse(JSON.stringify(siteConfigDefaults.pricing || []));
      loadPricing();
      break;
    case 'testimonials':
      siteConfig.testimonials = JSON.parse(JSON.stringify(siteConfigDefaults.testimonials || []));
      loadTestimonials();
      break;
    case 'team':
      siteConfig.team = JSON.parse(JSON.stringify(siteConfigDefaults.team || []));
      loadTeam();
      break;
    case 'faq':
      siteConfig.faq = JSON.parse(JSON.stringify(siteConfigDefaults.faq || []));
      loadFaq();
      break;
    case 'content':
      siteConfig.pageContent = JSON.parse(JSON.stringify(siteConfigDefaults.pageContent || {}));
      loadPageContent();
      break;
    case 'seo':
      siteConfig.seo = JSON.parse(JSON.stringify(siteConfigDefaults.seo || {}));
      const config = window.DASHBOARD_CONFIG;
      if (siteConfig.seo) {
        document.getElementById('seoTitle').value = siteConfig.seo.title || '';
        document.getElementById('seoDescription').value = siteConfig.seo.description || '';
        document.getElementById('seoKeywords').value = (siteConfig.seo.keywords || []).join(', ');
        config.seo = siteConfig.seo;
      }
      break;
  }

  saveSiteConfig();
  showToast(`${section} reset to default!`);
}

// ============================================
// SERVICES MANAGEMENT (with drag)
// ============================================

function loadServices() {
  const list = document.getElementById('servicesList');
  list.innerHTML = '';
  const services = siteConfig?.services || [];
  if (services.length === 0) {
    list.innerHTML = '<div class="service-item"><div class="service-info"><div class="service-title">No services yet</div><div class="service-description">Add your first service</div></div></div>';
    return;
  }
  services.forEach((service, index) => {
    const item = document.createElement('div');
    item.className = 'service-item draggable-item';
    item.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
      ${service.imageUrl ? `<div class="service-thumb" style="width:60px;height:60px;border-radius:8px;overflow:hidden;flex-shrink:0"><img src="${service.imageUrl}" style="width:100%;height:100%;object-fit:cover" /></div>` : ''}
      <div class="service-info" style="flex:1">
        <div class="service-title">${service.title}</div>
        <div class="service-description">${service.description || ''}</div>
        ${service.priceTag ? `<div class="service-price">${service.priceTag}</div>` : ''}
      </div>
      <div class="service-actions">
        <button class="secondary-btn" onclick="editService(${index})"><i class="fas fa-edit"></i></button>
        <button class="danger-btn" onclick="deleteService(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    makeDraggable(item, 'services', index);
    list.appendChild(item);
  });
}

function openServiceEditor() {
  document.getElementById('serviceEditorModal').classList.remove('hidden');
  document.getElementById('serviceTitle').value = '';
  document.getElementById('serviceDescription').value = '';
  document.getElementById('servicePrice').value = '';
  document.getElementById('serviceImageUrl').value = '';
  document.getElementById('serviceImagePreview').innerHTML = '';
  document.getElementById('serviceEditorTitle').textContent = 'New Service';
  document.getElementById('serviceEditorSubmit').onclick = addService;
}

function editService(index) {
  const s = siteConfig.services[index];
  if (!s) return;
  document.getElementById('serviceEditorModal').classList.remove('hidden');
  document.getElementById('serviceTitle').value = s.title || '';
  document.getElementById('serviceDescription').value = s.description || '';
  document.getElementById('servicePrice').value = s.priceTag || '';
  document.getElementById('serviceImageUrl').value = s.imageUrl || '';
  document.getElementById('serviceImagePreview').innerHTML = s.imageUrl ? `<img src="${s.imageUrl}" style="max-width:200px;border-radius:8px" />` : '';
  document.getElementById('serviceEditorTitle').textContent = 'Edit Service';
  document.getElementById('serviceEditorSubmit').onclick = () => updateService(index);
}

function addService() {
  const title = document.getElementById('serviceTitle').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  const imageUrl = document.getElementById('serviceImageUrl').value.trim();
  if (!title) { showToast('Enter a service name', 'warning'); return; }
  if (!siteConfig.services) siteConfig.services = [];
  siteConfig.services.push({ title, description, priceTag: price || undefined, icon: 'Star', imageUrl: imageUrl || undefined });
  saveSiteConfig(); loadServices(); closeServiceEditor(); showToast('Service added!');
}

function updateService(index) {
  const title = document.getElementById('serviceTitle').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  const imageUrl = document.getElementById('serviceImageUrl').value.trim();
  if (!title) { showToast('Enter a service name', 'warning'); return; }
  siteConfig.services[index] = { ...siteConfig.services[index], title, description, priceTag: price || undefined, imageUrl: imageUrl || undefined };
  saveSiteConfig(); loadServices(); closeServiceEditor(); showToast('Service updated!');
}

async function deleteService(index) {
  if (!await showConfirm('Delete this service?', 'Delete Service')) return;
  siteConfig.services.splice(index, 1);
  saveSiteConfig(); loadServices(); showToast('Service deleted!');
}

function closeServiceEditor() { document.getElementById('serviceEditorModal').classList.add('hidden'); }

// ============================================
// PRICING MANAGEMENT (with drag)
// ============================================

function loadPricing() {
  const list = document.getElementById('pricingList');
  list.innerHTML = '';
  const pricing = siteConfig?.pricing || [];
  if (pricing.length === 0) {
    list.innerHTML = '<div class="pricing-item"><div class="pricing-info"><div class="pricing-title">No pricing packages yet</div><div class="pricing-meta">Add your first package</div></div></div>';
    return;
  }
  pricing.forEach((pkg, index) => {
    const item = document.createElement('div');
    item.className = 'pricing-item draggable-item';
    item.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
      <div class="pricing-info" style="flex:1">
        <div class="pricing-title">${pkg.service || 'Untitled'}</div>
        <div class="pricing-price">${pkg.price || 'Contact for pricing'}</div>
        <div class="pricing-details">${pkg.details || ''}</div>
      </div>
      <div class="pricing-actions">
        <button class="secondary-btn" onclick="editPricing(${index})"><i class="fas fa-edit"></i></button>
        <button class="danger-btn" onclick="deletePricing(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    makeDraggable(item, 'pricing', index);
    list.appendChild(item);
  });
}

function openPricingEditor() {
  document.getElementById('pricingEditorModal').classList.remove('hidden');
  document.getElementById('pricingName').value = '';
  document.getElementById('pricingPrice').value = '';
  document.getElementById('pricingDetails').value = '';
  document.getElementById('pricingEditorTitle').textContent = 'New Pricing Package';
  document.getElementById('pricingEditorSubmit').onclick = addPricing;
}

function editPricing(index) {
  const p = siteConfig.pricing[index];
  if (!p) return;
  document.getElementById('pricingEditorModal').classList.remove('hidden');
  document.getElementById('pricingName').value = p.service || '';
  document.getElementById('pricingPrice').value = p.price || '';
  document.getElementById('pricingDetails').value = p.details || '';
  document.getElementById('pricingEditorTitle').textContent = 'Edit Pricing';
  document.getElementById('pricingEditorSubmit').onclick = () => updatePricing(index);
}

function addPricing() {
  const name = document.getElementById('pricingName').value.trim();
  const price = document.getElementById('pricingPrice').value.trim();
  const details = document.getElementById('pricingDetails').value.trim();
  if (!name) { showToast('Enter a package name', 'warning'); return; }
  if (!siteConfig.pricing) siteConfig.pricing = [];
  siteConfig.pricing.push({ service: name, price: price || 'Contact for pricing', details });
  saveSiteConfig(); loadPricing(); closePricingEditor(); showToast('Package added!');
}

function updatePricing(index) {
  const name = document.getElementById('pricingName').value.trim();
  const price = document.getElementById('pricingPrice').value.trim();
  const details = document.getElementById('pricingDetails').value.trim();
  if (!name) { showToast('Enter a package name', 'warning'); return; }
  siteConfig.pricing[index] = { ...siteConfig.pricing[index], service: name, price: price || 'Contact for pricing', details };
  saveSiteConfig(); loadPricing(); closePricingEditor(); showToast('Package updated!');
}

async function deletePricing(index) {
  if (!await showConfirm('Delete this package?', 'Delete Package')) return;
  siteConfig.pricing.splice(index, 1);
  saveSiteConfig(); loadPricing(); showToast('Package deleted!');
}

function closePricingEditor() { document.getElementById('pricingEditorModal').classList.add('hidden'); }

// ============================================
// TESTIMONIALS MANAGEMENT (with drag)
// ============================================

function loadTestimonials() {
  const list = document.getElementById('testimonialsList');
  list.innerHTML = '';
  const testimonials = siteConfig?.testimonials || [];
  if (testimonials.length === 0) {
    list.innerHTML = '<div class="testimonial-item"><div class="testimonial-text">No testimonials yet</div><div class="testimonial-meta"><span class="testimonial-author">Add your first testimonial</span></div></div>';
    return;
  }
  testimonials.forEach((t, index) => {
    const item = document.createElement('div');
    item.className = 'testimonial-item draggable-item';
    item.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
      <div style="flex:1">
        <div class="testimonial-text">"${t.text}"</div>
        <div class="testimonial-meta">
          <span class="testimonial-author">${t.name}</span>
          <span class="testimonial-rating">${'★'.repeat(t.rating || 5)}</span>
        </div>
      </div>
      <div class="testimonial-actions">
        <button class="secondary-btn" onclick="editTestimonial(${index})"><i class="fas fa-edit"></i></button>
        <button class="danger-btn" onclick="deleteTestimonial(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    makeDraggable(item, 'testimonials', index);
    list.appendChild(item);
  });
}

function openTestimonialEditor() {
  document.getElementById('testimonialEditorModal').classList.remove('hidden');
  document.getElementById('testimonialName').value = '';
  document.getElementById('testimonialText').value = '';
  document.getElementById('testimonialRating').value = '5';
  document.getElementById('testimonialEditorTitle').textContent = 'New Testimonial';
  document.getElementById('testimonialEditorSubmit').onclick = addTestimonial;
}

function editTestimonial(index) {
  const t = siteConfig.testimonials[index];
  if (!t) return;
  document.getElementById('testimonialEditorModal').classList.remove('hidden');
  document.getElementById('testimonialName').value = t.name || '';
  document.getElementById('testimonialText').value = t.text || '';
  document.getElementById('testimonialRating').value = t.rating || 5;
  document.getElementById('testimonialEditorTitle').textContent = 'Edit Testimonial';
  document.getElementById('testimonialEditorSubmit').onclick = () => updateTestimonial(index);
}

function addTestimonial() {
  const name = document.getElementById('testimonialName').value.trim();
  const text = document.getElementById('testimonialText').value.trim();
  const rating = parseInt(document.getElementById('testimonialRating').value) || 5;
  if (!name || !text) { showToast('Enter name and text', 'warning'); return; }
  if (!siteConfig.testimonials) siteConfig.testimonials = [];
  siteConfig.testimonials.push({ name, text, rating: Math.min(5, Math.max(1, rating)), source: 'Dashboard' });
  saveSiteConfig(); loadTestimonials(); closeTestimonialEditor(); showToast('Testimonial added!');
}

function updateTestimonial(index) {
  const name = document.getElementById('testimonialName').value.trim();
  const text = document.getElementById('testimonialText').value.trim();
  const rating = parseInt(document.getElementById('testimonialRating').value) || 5;
  if (!name || !text) { showToast('Enter name and text', 'warning'); return; }
  siteConfig.testimonials[index] = { ...siteConfig.testimonials[index], name, text, rating: Math.min(5, Math.max(1, rating)) };
  saveSiteConfig(); loadTestimonials(); closeTestimonialEditor(); showToast('Testimonial updated!');
}

async function deleteTestimonial(index) {
  if (!await showConfirm('Delete this testimonial?', 'Delete Testimonial')) return;
  siteConfig.testimonials.splice(index, 1);
  saveSiteConfig(); loadTestimonials(); showToast('Testimonial deleted!');
}

function closeTestimonialEditor() { document.getElementById('testimonialEditorModal').classList.add('hidden'); }

// ============================================
// BLOG MANAGEMENT (with drag)
// ============================================

function loadBlogPosts() {
  const list = document.getElementById('blogList');
  list.innerHTML = '';
  const blogPosts = siteConfig?.blogPosts || [];
  if (blogPosts.length === 0) {
    list.innerHTML = '<div class="blog-item"><div class="blog-info"><div class="blog-title">No blog posts yet</div><div class="blog-meta">Create your first blog post</div></div></div>';
    return;
  }
  blogPosts.forEach((post, index) => {
    const item = document.createElement('div');
    item.className = 'blog-item draggable-item';
    item.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
      <div class="blog-info" style="flex:1">
        <div class="blog-title">${post.title || 'Untitled'}</div>
        <div class="blog-meta">${post.date || ''}</div>
      </div>
      <div class="blog-actions">
        <button class="secondary-btn" onclick="editBlogPost(${index})"><i class="fas fa-edit"></i></button>
        <button class="danger-btn" onclick="deleteBlogPost(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    makeDraggable(item, 'blog', index);
    list.appendChild(item);
  });
}

function openBlogEditor() {
  document.getElementById('blogEditorModal').classList.remove('hidden');
  document.getElementById('blogTitle').value = '';
  document.getElementById('blogContent').value = '';
  document.getElementById('blogImageUrl').value = '';
  document.getElementById('blogEditorTitle').textContent = 'New Blog Post';
  document.getElementById('blogEditorSubmit').onclick = addBlogPost;
}

function editBlogPost(index) {
  const p = siteConfig.blogPosts[index];
  if (!p) return;
  document.getElementById('blogEditorModal').classList.remove('hidden');
  document.getElementById('blogTitle').value = p.title || '';
  document.getElementById('blogContent').value = p.excerpt || '';
  document.getElementById('blogImageUrl').value = p.images?.[0] || '';
  document.getElementById('blogEditorTitle').textContent = 'Edit Blog Post';
  document.getElementById('blogEditorSubmit').onclick = () => updateBlogPost(index);
}

function addBlogPost() {
  const title = document.getElementById('blogTitle').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const imageUrl = document.getElementById('blogImageUrl').value.trim();
  if (!title) { showToast('Enter a title', 'warning'); return; }
  if (!siteConfig.blogPosts) siteConfig.blogPosts = [];
  siteConfig.blogPosts.push({ title, excerpt: content, date: new Date().toISOString().split('T')[0], url: '', images: imageUrl ? [imageUrl] : [] });
  saveSiteConfig(); loadBlogPosts(); closeBlogEditor(); showToast('Blog post added!');
}

function updateBlogPost(index) {
  const title = document.getElementById('blogTitle').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const imageUrl = document.getElementById('blogImageUrl').value.trim();
  if (!title) { showToast('Enter a title', 'warning'); return; }
  siteConfig.blogPosts[index] = { ...siteConfig.blogPosts[index], title, excerpt: content, images: imageUrl ? [imageUrl] : siteConfig.blogPosts[index].images };
  saveSiteConfig(); loadBlogPosts(); closeBlogEditor(); showToast('Blog post updated!');
}

async function deleteBlogPost(index) {
  if (!await showConfirm('Delete this blog post?', 'Delete Blog Post')) return;
  siteConfig.blogPosts.splice(index, 1);
  saveSiteConfig(); loadBlogPosts(); showToast('Blog post deleted!');
}

function closeBlogEditor() { document.getElementById('blogEditorModal').classList.add('hidden'); }

// ============================================
// TEAM MEMBERS MANAGEMENT (with drag)
// ============================================

function loadTeam() {
  const list = document.getElementById('teamList');
  if (!list) return;
  if (!siteConfig.team) siteConfig.team = [];
  list.innerHTML = '';
  siteConfig.team.forEach((member, index) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
      <div class="list-item-content">
        <div class="list-item-title">${member.name || 'Unnamed'}</div>
        <div class="list-item-subtitle">${member.position || ''}</div>
        ${member.bio ? `<div class="list-item-text">${member.bio.substring(0, 100)}${member.bio.length > 100 ? '...' : ''}</div>` : ''}
      </div>
      <div class="list-item-actions">
        <button class="secondary-btn" onclick="editTeamMember(${index})"><i class="fas fa-edit"></i></button>
        <button class="danger-btn" onclick="deleteTeamMember(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    makeDraggable(item, 'team', index);
    list.appendChild(item);
  });
}

function openTeamEditor() {
  document.getElementById('teamEditorModal').classList.remove('hidden');
  document.getElementById('teamName').value = '';
  document.getElementById('teamPosition').value = '';
  document.getElementById('teamBio').value = '';
  document.getElementById('teamImageUrl').value = '';
  document.getElementById('teamEditorTitle').textContent = 'New Team Member';
  document.getElementById('teamEditorSubmit').onclick = addTeamMember;
}

function editTeamMember(index) {
  const member = siteConfig.team[index];
  if (!member) return;
  document.getElementById('teamEditorModal').classList.remove('hidden');
  document.getElementById('teamName').value = member.name || '';
  document.getElementById('teamPosition').value = member.position || '';
  document.getElementById('teamBio').value = member.bio || '';
  document.getElementById('teamImageUrl').value = member.imageUrl || '';
  document.getElementById('teamEditorTitle').textContent = 'Edit Team Member';
  document.getElementById('teamEditorSubmit').onclick = () => updateTeamMember(index);
}

function addTeamMember() {
  const name = document.getElementById('teamName').value.trim();
  const position = document.getElementById('teamPosition').value.trim();
  const bio = document.getElementById('teamBio').value.trim();
  const imageUrl = document.getElementById('teamImageUrl').value.trim();
  if (!name) { showToast('Enter a name', 'warning'); return; }
  if (!siteConfig.team) siteConfig.team = [];
  siteConfig.team.push({ name, position, bio, imageUrl });
  saveSiteConfig(); loadTeam(); closeTeamEditor(); showToast('Team member added!');
}

function updateTeamMember(index) {
  const name = document.getElementById('teamName').value.trim();
  const position = document.getElementById('teamPosition').value.trim();
  const bio = document.getElementById('teamBio').value.trim();
  const imageUrl = document.getElementById('teamImageUrl').value.trim();
  if (!name) { showToast('Enter a name', 'warning'); return; }
  siteConfig.team[index] = { name, position, bio, imageUrl };
  saveSiteConfig(); loadTeam(); closeTeamEditor(); showToast('Team member updated!');
}

async function deleteTeamMember(index) {
  if (!await showConfirm('Delete this team member?', 'Delete Team Member')) return;
  siteConfig.team.splice(index, 1);
  saveSiteConfig(); loadTeam(); showToast('Team member deleted!');
}

function closeTeamEditor() { document.getElementById('teamEditorModal').classList.add('hidden'); }

// ============================================
// FAQ MANAGEMENT (with drag)
// ============================================

function loadFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;
  if (!siteConfig.faq) siteConfig.faq = [];
  list.innerHTML = '';
  siteConfig.faq.forEach((item, index) => {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.innerHTML = `
      <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
      <div class="list-item-content">
        <div class="list-item-title">${item.question || 'No question'}</div>
        <div class="list-item-text">${item.answer ? item.answer.substring(0, 150) + (item.answer.length > 150 ? '...' : '') : ''}</div>
      </div>
      <div class="list-item-actions">
        <button class="secondary-btn" onclick="editFaqItem(${index})"><i class="fas fa-edit"></i></button>
        <button class="danger-btn" onclick="deleteFaqItem(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    makeDraggable(listItem, 'faq', index);
    list.appendChild(listItem);
  });
}

function openFaqEditor() {
  document.getElementById('faqEditorModal').classList.remove('hidden');
  document.getElementById('faqQuestion').value = '';
  document.getElementById('faqAnswer').value = '';
  document.getElementById('faqEditorTitle').textContent = 'New FAQ Item';
  document.getElementById('faqEditorSubmit').onclick = addFaqItem;
}

function editFaqItem(index) {
  const item = siteConfig.faq[index];
  if (!item) return;
  document.getElementById('faqEditorModal').classList.remove('hidden');
  document.getElementById('faqQuestion').value = item.question || '';
  document.getElementById('faqAnswer').value = item.answer || '';
  document.getElementById('faqEditorTitle').textContent = 'Edit FAQ Item';
  document.getElementById('faqEditorSubmit').onclick = () => updateFaqItem(index);
}

function addFaqItem() {
  const question = document.getElementById('faqQuestion').value.trim();
  const answer = document.getElementById('faqAnswer').value.trim();
  if (!question || !answer) { showToast('Enter both question and answer', 'warning'); return; }
  if (!siteConfig.faq) siteConfig.faq = [];
  siteConfig.faq.push({ question, answer });
  saveSiteConfig(); loadFaq(); closeFaqEditor(); showToast('FAQ item added!');
}

function updateFaqItem(index) {
  const question = document.getElementById('faqQuestion').value.trim();
  const answer = document.getElementById('faqAnswer').value.trim();
  if (!question || !answer) { showToast('Enter both question and answer', 'warning'); return; }
  siteConfig.faq[index] = { question, answer };
  saveSiteConfig(); loadFaq(); closeFaqEditor(); showToast('FAQ item updated!');
}

async function deleteFaqItem(index) {
  if (!await showConfirm('Delete this FAQ item?', 'Delete FAQ')) return;
  siteConfig.faq.splice(index, 1);
  saveSiteConfig(); loadFaq(); showToast('FAQ item deleted!');
}

function closeFaqEditor() { document.getElementById('faqEditorModal').classList.add('hidden'); }

// ============================================
// SETTINGS
// ============================================

function saveContact() {
  if (siteConfig) {
    siteConfig.contact = siteConfig.contact || {};
    siteConfig.contact.phone = document.getElementById('settingsPhone').value;
    siteConfig.contact.email = document.getElementById('settingsEmail').value;
    siteConfig.contact.address = document.getElementById('settingsAddress').value;
    if (siteConfig.contact.phone) siteConfig.phone = siteConfig.contact.phone;
    if (siteConfig.contact.email) siteConfig.email = siteConfig.contact.email;
  }
  saveSiteConfig(); showToast('Contact info saved!');
}

function saveSocial() {
  if (siteConfig) {
    siteConfig.socialLinks = {
      facebook: document.getElementById('settingsFacebook').value,
      instagram: document.getElementById('settingsInstagram').value,
      twitter: document.getElementById('settingsTwitter').value,
    };
  }
  saveSiteConfig(); showToast('Social links saved!');
}

function saveSeo() {
  if (siteConfig) {
    siteConfig.seo = siteConfig.seo || {};
    siteConfig.seo.title = document.getElementById('seoTitle').value;
    siteConfig.seo.description = document.getElementById('seoDescription').value;
    siteConfig.seo.keywords = document.getElementById('seoKeywords').value.split(',').map(k => k.trim());
  }
  saveSiteConfig(); showToast('SEO saved!');
}


// ============================================
// UNIFIED SETTINGS SAVE
// ============================================

async function saveAllSettings() {
  saveContact();
  saveSocial();
  saveBusinessHours();
  showToast('✅ All settings saved!');
}

// ============================================
// SAVE FUNCTIONS
// ============================================

async function saveSiteConfig() {
  try {
    localStorage.setItem('siteConfig', JSON.stringify(siteConfig));
    const config = window.DASHBOARD_CONFIG;
    const res = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteConfig, imageMap }),
    });
    
    if (res.ok) {
      const result = await res.json();
      // Blob storage = instant updates, no rebuild needed
      showToast('✅ Changes saved!');
    } else {
      showToast('❌ Save failed', 'danger');
    }
  } catch (error) {
    console.error('Save error:', error);
    showToast('❌ Save failed', 'danger');
  }
}

async function saveImageMap() {
  try {
    localStorage.setItem('imageMap', JSON.stringify(imageMap));
    const res = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageMap }),
    });
    
    if (res.ok) {
      showToast('✅ Image map saved!');
    } else {
      showToast('❌ Save failed', 'danger');
    }
  } catch {
    showToast('❌ Save failed', 'danger');
  }
}

// ============================================
// FILE UPLOAD
// ============================================

function openUploadModal() { document.getElementById('uploadModal').classList.remove('hidden'); }
function closeUploadModal() { document.getElementById('uploadModal').classList.add('hidden'); document.getElementById('uploadPreview').innerHTML = ''; }

function handleFileSelect(files) {
  const preview = document.getElementById('uploadPreview');
  preview.innerHTML = '';
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => { const img = document.createElement('img'); img.src = e.target.result; preview.appendChild(img); };
    reader.readAsDataURL(file);
  });
}

async function uploadFiles() {
  const fileInput = document.getElementById('fileInput');
  const folder = document.getElementById('uploadFolder').value;
  const files = fileInput.files;
  if (files.length === 0) { showToast('Select files to upload', 'warning'); return; }

  const uploadBtn = document.querySelector('#uploadModal .primary-btn');
  if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.textContent = 'Uploading...'; }

  let uploaded = 0, failed = 0;
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const result = await res.json();
        addImageToMap(folder, result.url);
        uploaded++;
      } else { failed++; }
    } catch { failed++; }
  }

  closeUploadModal();
  if (uploadBtn) { uploadBtn.disabled = false; uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload'; }
  if (uploaded > 0) showToast(`${uploaded} image(s) uploaded!`);
  if (failed > 0) showToast(`${failed} failed`, 'error');
  loadGalleryFolders();
}

function addImageToMap(category, imageUrl) {
  if (!imageMap) imageMap = { categories: {} };
  if (!imageMap.categories[category]) imageMap.categories[category] = { images: [] };
  imageMap.categories[category].images.push(imageUrl);
  saveImageMap();
}

// ============================================
// NAVIGATION
// ============================================

function switchSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(section)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === section));
  const titles = {
    overview: 'Overview', hero: 'Hero Section', gallery: 'Gallery', services: 'Services',
    pricing: 'Pricing', testimonials: 'Testimonials', about: 'About Page', content: 'Page Content',
    blog: 'Blog', seo: 'SEO', settings: 'Settings', 'design-system': 'Design System',
    team: 'Team Members', faq: 'FAQ Items',
  };
  document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
  currentSection = section;

  // Load section-specific data
  if (section === 'design-system') {
    loadDesignSystem();
  } else if (section === 'settings') {
    loadBusinessHours();
  } else if (section === 'team') {
    loadTeam();
  } else if (section === 'faq') {
    loadFaq();
  }
}

function toggleSidebar() { document.querySelector('.sidebar').classList.toggle('open'); }

// ============================================
// UTILITIES
// ============================================

function togglePassword() {
  const input = document.getElementById('password');
  const icon = document.querySelector('.toggle-password i');
  if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { input.type = 'password'; icon.className = 'fas fa-eye'; }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;background:${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--danger)'};color:white;border-radius:var(--radius-sm);font-size:0.875rem;font-weight:500;z-index:1000;animation:slideUp 0.3s ease-out;`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============================================
// DESIGN SYSTEM SNAPSHOT
// ============================================

function loadDesignSystem() {
  if (!siteConfig) return;

  const ds = siteConfig.designSystem || {};

  // Color Palette
  const colors = ds.colorPalette || siteConfig.brandAssets?.brandColors || {};
  const colorSwatches = document.getElementById('colorSwatches');
  if (colorSwatches) {
    const colorEntries = [
      { name: 'Primary', value: colors.primary || '#0ea5e9' },
      { name: 'Secondary', value: colors.secondary || '#6366f1' },
      { name: 'Accent', value: colors.accent || '#f59e0b' },
      { name: 'Background', value: colors.bg || '#ffffff' },
      { name: 'Text', value: colors.text || '#1a1a1a' },
    ];
    colorSwatches.innerHTML = colorEntries.map(c => `
      <div class="color-swatch">
        <div class="swatch-preview" style="background: ${c.value}"></div>
        <div class="swatch-info">
          <span class="swatch-name">${c.name}</span>
          <span class="swatch-value">${c.value}</span>
        </div>
      </div>
    `).join('');
  }

  // Typography
  const typoPreview = document.getElementById('typographyPreview');
  if (typoPreview) {
    const headingFont = ds.headingFont || siteConfig.theme?.fonts?.heading || 'System Font';
    const bodyFont = ds.bodyFont || siteConfig.theme?.fonts?.body || 'System Font';
    typoPreview.innerHTML = `
      <div class="typo-sample">
        <span class="typo-label">Heading</span>
        <span class="typo-font" style="font-family: '${headingFont}', serif">${headingFont}</span>
      </div>
      <div class="typo-sample">
        <span class="typo-label">Body</span>
        <span class="typo-font" style="font-family: '${bodyFont}', sans-serif">${bodyFont}</span>
      </div>
    `;
  }

  // Design Seed
  const seedInfo = document.getElementById('seedInfo');
  if (seedInfo) {
    const seedId = ds.seedId || siteConfig.buildSlug || 'default';
    const archetypeName = ds.archetype || siteConfig.industry || 'General';
    const artDirection = ds.artDirection || 'editorial';
    seedInfo.innerHTML = `
      <div class="seed-detail">
        <span class="seed-label">Seed ID</span>
        <span class="seed-value">${seedId}</span>
      </div>
      <div class="seed-detail">
        <span class="seed-label">Archetype</span>
        <span class="seed-value">${archetypeName}</span>
      </div>
      <div class="seed-detail">
        <span class="seed-label">Art Direction</span>
        <span class="seed-value">${artDirection}</span>
      </div>
    `;
  }

  // Density
  const densityInfo = document.getElementById('densityInfo');
  if (densityInfo) {
    const densityProfile = ds.densityProfile || 'balanced';
    const decorativeIntensity = ds.decorativeIntensity || 'subtle';
    const motionIntensity = ds.motionIntensity || 'moderate';
    densityInfo.innerHTML = `
      <div class="density-detail">
        <span class="density-label">Density Profile</span>
        <span class="density-value">${densityProfile}</span>
      </div>
      <div class="density-detail">
        <span class="density-label">Decorative Intensity</span>
        <span class="density-value">${decorativeIntensity}</span>
      </div>
      <div class="density-detail">
        <span class="density-label">Motion Intensity</span>
        <span class="density-value">${motionIntensity}</span>
      </div>
    `;
  }

  // Image Treatment
  const imageTreatmentInfo = document.getElementById('imageTreatmentInfo');
  if (imageTreatmentInfo) {
    imageTreatmentInfo.innerHTML = `
      <div class="treatment-detail">
        <i class="fas fa-check"></i>
        <span>Brand-color tint overlay on gallery images</span>
      </div>
      <div class="treatment-detail">
        <i class="fas fa-check"></i>
        <span>Vignette effect on category thumbnails</span>
      </div>
      <div class="treatment-detail">
        <i class="fas fa-check"></i>
        <span>Hero overlay for text readability</span>
      </div>
    `;
  }
}

// ============================================
// ENHANCE SITE
// ============================================

async function enhanceSite() {
  if (!siteConfig) {
    showToast('No site config loaded', 'warning');
    return;
  }

  const btn = document.querySelector('.enhance-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enhancing...</span>';
  }

  try {
    // 1. Ensure all required fields have values
    let changesMade = 0;

    // Ensure hero has all fields
    if (!siteConfig.hero) siteConfig.hero = {};
    if (!siteConfig.hero.badge) { siteConfig.hero.badge = 'Welcome'; changesMade++; }
    if (!siteConfig.hero.ctaText) { siteConfig.hero.ctaText = 'Get Started'; changesMade++; }

    // Ensure pageContent has all fields
    if (!siteConfig.pageContent) siteConfig.pageContent = {};
    const pcDefaults = {
      servicesTitle: 'Our Services', servicesDescription: 'What we offer',
      galleryTitle: 'Our Work', gallerySubtitle: 'Browse our portfolio',
      testimonialsTitle: 'What Our Clients Say', testimonialsSubtitle: 'Testimonials',
      faqTitle: 'Frequently Asked Questions', faqSubtitle: 'Questions & Answers',
      contactTitle: 'Contact Us', contactDescription: 'Get in touch',
      aboutTitle: 'About Us', aboutSubtitle: 'Our story',
    };
    for (const [key, defaultVal] of Object.entries(pcDefaults)) {
      if (!siteConfig.pageContent[key]) { siteConfig.pageContent[key] = defaultVal; changesMade++; }
    }

    // Ensure business hours exist
    if (!siteConfig.businessHours || siteConfig.businessHours.length === 0) {
      siteConfig.businessHours = [
        { dayOfWeek: 'Monday', opens: '08:00', closes: '17:00' },
        { dayOfWeek: 'Tuesday', opens: '08:00', closes: '17:00' },
        { dayOfWeek: 'Wednesday', opens: '08:00', closes: '17:00' },
        { dayOfWeek: 'Thursday', opens: '08:00', closes: '17:00' },
        { dayOfWeek: 'Friday', opens: '08:00', closes: '17:00' },
        { dayOfWeek: 'Saturday', opens: '09:00', closes: '14:00' },
        { dayOfWeek: 'Sunday', opens: 'Closed', closes: 'Closed' },
      ];
      changesMade++;
    }

    // 2. Save changes
    if (changesMade > 0) {
      await saveSiteConfig();
      showToast(`Enhanced! ${changesMade} fields auto-filled.`);
    } else {
      showToast('Site is already optimized!');
    }

    // 3. Reload dashboard data
    loadDashboardData();
  } catch (err) {
    showToast('Enhancement failed: ' + err.message, 'danger');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-magic"></i> <span>Enhance</span>';
    }
  }
}


// ============================================
// PHASE 10: CONTENT EDITORS (Tasks 5-11)
// ============================================

/**
 * Task 10.5: Business Hours Editor
 * Full implementation with UI
 * Data structure: siteConfig.businessHours array
 */
function loadBusinessHours() {
  const list = document.getElementById('businessHoursList');
  if (!list) return;
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = siteConfig?.businessHours || days.map(day => ({ dayOfWeek: day, opens: '09:00', closes: '17:00', closed: false }));
  
  // Ensure all days exist
  days.forEach(day => {
    if (!hours.find(h => h.dayOfWeek === day)) {
      hours.push({ dayOfWeek: day, opens: '09:00', closes: '17:00', closed: false });
    }
  });
  
  list.innerHTML = hours.map((h, idx) => `
    <div class="business-hours-row" data-index="${idx}">
      <div class="hours-day">${h.dayOfWeek}</div>
      <div class="hours-inputs">
        <input type="time" class="hours-time" data-idx="${idx}" data-field="opens" value="${h.opens || '09:00'}" ${h.closed ? 'disabled' : ''}>
        <span>to</span>
        <input type="time" class="hours-time" data-idx="${idx}" data-field="closes" value="${h.closes || '17:00'}" ${h.closed ? 'disabled' : ''}>
        <label class="hours-closed">
          <input type="checkbox" data-idx="${idx}" data-field="closed" ${h.closed ? 'checked' : ''}>
          Closed
        </label>
      </div>
    </div>
  `).join('');
  
  // Add event listeners
  list.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      if (!siteConfig.businessHours) siteConfig.businessHours = hours;
      
      if (field === 'closed') {
        siteConfig.businessHours[idx].closed = e.target.checked;
        // Disable/enable time inputs
        const row = e.target.closest('.business-hours-row');
        row.querySelectorAll('.hours-time').forEach(t => t.disabled = e.target.checked);
      } else {
        siteConfig.businessHours[idx][field] = e.target.value;
      }
    });
  });
}

function saveBusinessHours() {
  saveSiteConfig();
  showToast('Business hours saved!');
}

/**
 * Task 10.6: Hero Content Editor
 * Data: siteConfig.hero (headline, subheadline, ctaText, badge)
 */
function editHeroContent() {
  // Placeholder: Modal for editing hero section
  console.log('Hero editor - to be fully implemented')
}

/**
 * Task 10.7: About Content Editor
 * Data: siteConfig.about (title, paragraphs, history)
 */
function editAboutContent() {
  // Placeholder: Modal for editing about section
  console.log('About editor - to be fully implemented')
}

/**
 * Task 10.8: Team Profiles Editor
 * Data: siteConfig.team array
 */
function addTeamMember() {
  // Placeholder: Add new team member
  console.log('Team editor - to be fully implemented')
}

/**
 * Task 10.9: FAQ Editor
 * Data: siteConfig.faq array
 */
function addFaqItem() {
  // Placeholder: Add FAQ question/answer
  console.log('FAQ editor - to be fully implemented')
}

/**
 * Task 10.10: Service Areas Editor
 * Data: siteConfig.geo.serviceAreas array
 */
function editServiceAreas() {
  // Placeholder: Edit service locations
  console.log('Service areas editor - to be fully implemented')
}

// ============================================
// PHASE 10: UX ENHANCEMENTS (Tasks 16-19)
// ============================================

/**
 * Task 10.16: Auto-Save to LocalStorage
 * Save draft changes every 30 seconds
 */
let autoSaveInterval = null;

function startAutoSave() {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  
  autoSaveInterval = setInterval(() => {
    if (siteConfig && imageMap) {
      try {
        localStorage.setItem('siteConfig_draft', JSON.stringify(siteConfig));
        localStorage.setItem('imageMap_draft', JSON.stringify(imageMap));
        console.log('[Auto-save] Draft saved to localStorage');
      } catch (e) {
        console.error('[Auto-save] Failed:', e);
      }
    }
  }, 30000); // Every 30 seconds
}

async function restoreDraft() {
  try {
    const configDraft = localStorage.getItem('siteConfig_draft');
    const imageDraft = localStorage.getItem('imageMap_draft');
    
    if (configDraft || imageDraft) {
      const restore = await showUnsavedModal({ configDraft, imageDraft });
      if (restore) {
        if (configDraft) siteConfig = JSON.parse(configDraft);
        if (imageDraft) imageMap = JSON.parse(imageDraft);
        return true;
      }
    }
  } catch (e) {
    console.error('[Restore] Failed:', e);
  }
  return false;
}

function clearDraft() {
  localStorage.removeItem('siteConfig_draft');
  localStorage.removeItem('imageMap_draft');
}

/**
 * Task 10.17: Undo/Redo System
 * Track change history with stack
 */
const MAX_HISTORY = 50;
let changeHistory = [];
let historyIndex = -1;

function saveToHistory(description) {
  // Remove any redo history
  if (historyIndex < changeHistory.length - 1) {
    changeHistory = changeHistory.slice(0, historyIndex + 1);
  }
  
  // Add new state
  changeHistory.push({
    timestamp: Date.now(),
    description,
    siteConfig: JSON.parse(JSON.stringify(siteConfig)),
    imageMap: JSON.parse(JSON.stringify(imageMap))
  });
  
  // Limit history size
  if (changeHistory.length > MAX_HISTORY) {
    changeHistory.shift();
  } else {
    historyIndex++;
  }
  
  updateUndoRedoButtons();
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const state = changeHistory[historyIndex];
    siteConfig = JSON.parse(JSON.stringify(state.siteConfig));
    imageMap = JSON.parse(JSON.stringify(state.imageMap));
    loadDashboardData(); // Refresh UI
    updateUndoRedoButtons();
    console.log('[Undo]', state.description);
  }
}

function redo() {
  if (historyIndex < changeHistory.length - 1) {
    historyIndex++;
    const state = changeHistory[historyIndex];
    siteConfig = JSON.parse(JSON.stringify(state.siteConfig));
    imageMap = JSON.parse(JSON.stringify(state.imageMap));
    loadDashboardData(); // Refresh UI
    updateUndoRedoButtons();
    console.log('[Redo]', state.description);
  }
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= changeHistory.length - 1;
}

/**
 * Task 10.18: Validation Layer
 * Validate data before save
 */
function validateSiteConfig() {
  const errors = [];
  
  if (!siteConfig.businessName || siteConfig.businessName.trim().length === 0) {
    errors.push('Business name is required');
  }
  
  if (!siteConfig.contact?.phone) {
    errors.push('Contact phone is required');
  }
  
  if (!siteConfig.services || siteConfig.services.length === 0) {
    errors.push('At least one service is required');
  }
  
  siteConfig.services?.forEach((service, i) => {
    if (!service.title || service.title.trim().length === 0) {
      errors.push(`Service ${i + 1}: Title is required`);
    }
    if (!service.description || service.description.length < 10) {
      errors.push(`Service ${i + 1}: Description must be at least 10 characters`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Task 10.19: Success Modal with Preview Link
 */
function showSuccessModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content success-modal">
      <div class="success-icon">✓</div>
      <h2>Changes Saved Successfully!</h2>
      <p>Your website has been updated.</p>
      <div class="button-group">
        <a href="/" target="_blank" class="primary-btn">
          <i class="fas fa-external-link-alt"></i>
          View Live Site
        </a>
        <button onclick="this.closest('.modal-overlay').remove()" class="secondary-btn">
          Continue Editing
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (modal.parentElement) {
      modal.remove();
    }
  }, 5000);
}

// ============================================
// ENHANCED SAVE FUNCTION
// ============================================

// Create alias for the original save function
const originalSaveSiteConfig = saveSiteConfig;

// Enhanced save function with validation and history
async function saveConfig() {
  // Validate before save
  const validation = validateSiteConfig();
  if (!validation.valid) {
    alert('Validation errors:\n' + validation.errors.join('\n'));
    return;
  }
  
  // Save to history
  saveToHistory('Manual save');
  
  // Call original save
  const result = await originalSaveSiteConfig();
  
  // Clear draft on successful save
  if (result) {
    clearDraft();
    showSuccessModal();
  }
  
  return result;
}

// Initialize auto-save when dashboard loads
if (typeof loadDashboardData !== 'undefined') {
  const originalLoadDashboardData = loadDashboardData;
  loadDashboardData = function() {
    originalLoadDashboardData();
    
    // Restore draft if available
    restoreDraft();
    
    // Start auto-save
    startAutoSave();
    
    // Save initial state to history
    if (siteConfig && changeHistory.length === 0) {
      saveToHistory('Initial state');
    }
  };
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault();
    redo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveConfig();
  }
});

console.log('[Phase 10] Dashboard enhancements loaded: Auth, Auto-save, Undo/Redo, Validation');


// ============================================
// TUTORIAL EVENT DISPATCHERS
// ============================================

// Wrap modal open functions to dispatch tutorial events
const originalOpenServiceEditor = openServiceEditor;
openServiceEditor = function() {
  document.dispatchEvent(new Event('modalOpened'));
  originalOpenServiceEditor.apply(this, arguments);
};

const originalOpenPricingEditor = openPricingEditor;
openPricingEditor = function() {
  document.dispatchEvent(new Event('modalOpened'));
  originalOpenPricingEditor.apply(this, arguments);
};

const originalOpenTestimonialEditor = openTestimonialEditor;
openTestimonialEditor = function() {
  document.dispatchEvent(new Event('modalOpened'));
  originalOpenTestimonialEditor.apply(this, arguments);
};

const originalOpenBlogEditor = openBlogEditor;
openBlogEditor = function() {
  document.dispatchEvent(new Event('modalOpened'));
  originalOpenBlogEditor.apply(this, arguments);
};

const originalOpenTeamEditor = openTeamEditor;
openTeamEditor = function() {
  document.dispatchEvent(new Event('modalOpened'));
  originalOpenTeamEditor.apply(this, arguments);
};

const originalOpenFaqEditor = openFaqEditor;
openFaqEditor = function() {
  document.dispatchEvent(new Event('modalOpened'));
  originalOpenFaqEditor.apply(this, arguments);
};

// Wrap edit functions
const originalEditService = editService;
editService = function() {
  document.dispatchEvent(new Event('editClicked'));
  originalEditService.apply(this, arguments);
};

// Wrap upload functions
const originalHandleHeroImageUpload = handleHeroImageUpload;
handleHeroImageUpload = function() {
  originalHandleHeroImageUpload.apply(this, arguments);
  setTimeout(() => document.dispatchEvent(new Event('imageUploaded')), 500);
};

const originalHandleAboutImageUpload = handleAboutImageUpload;
handleAboutImageUpload = function() {
  originalHandleAboutImageUpload.apply(this, arguments);
  setTimeout(() => document.dispatchEvent(new Event('imageUploaded')), 500);
};

// Wrap gallery functions
const originalCreateFolder = createFolder;
createFolder = function() {
  originalCreateFolder.apply(this, arguments);
  document.dispatchEvent(new Event('galleryAction'));
};

const originalViewFolder = viewFolder;
viewFolder = function() {
  originalViewFolder.apply(this, arguments);
  document.dispatchEvent(new Event('galleryAction'));
};

const originalOpenUploadModal = openUploadModal;
openUploadModal = function() {
  document.dispatchEvent(new Event('galleryAction'));
  originalOpenUploadModal.apply(this, arguments);
};
