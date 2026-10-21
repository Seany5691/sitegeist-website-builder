/**
 * Reconstruct lost app.js infrastructure (SECTION_FIELDS, FEATURE_FIELDS, render/save functions).
 * Written as a single block to insert into app.js.
 */

const fs = require('fs')
const path = require('path')

// The lost code block — all reconstructed from explore agent reports + conversation history
const LOST_CODE = `
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
`

// Now insert into app.js
const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

for (const site of SITES) {
  const name = site.split('/').pop()
  const p = path.join(site, 'public', 'dashboard', 'assets', 'app.js')
  if (!fs.existsSync(p)) continue

  let app = fs.readFileSync(p, 'utf8')
  const before = app

  // Insert the lost code before the DOMContentLoaded handler
  // Find "document.addEventListener('DOMContentLoaded'" as the anchor
  const anchor = "document.addEventListener('DOMContentLoaded'"
  const anchorIdx = app.indexOf(anchor)
  if (anchorIdx === -1) {
    console.log(name + ': anchor not found')
    continue
  }

  app = app.slice(0, anchorIdx) + LOST_CODE + '\n' + app.slice(anchorIdx)

  fs.writeFileSync(p, app)
  try {
    new Function(app)
    console.log(name + ': RECONSTRUCTED + VALID (' + app.split('\n').length + ' lines)')
  } catch (e) {
    console.log(name + ': ERROR - ' + e.message)
    // Try to find the error line
    const lines = app.split('\n')
    for (let i = 0; i < lines.length; i++) {
      try { new Function(lines.slice(0, i + 1).join('\n') + '\n}') } catch (e2) {
        if (e2.message.includes('Unexpected token')) {
          console.log('  Around line ' + (i + 1) + ': ' + lines[i].trim().slice(0, 100))
          break
        }
      }
    }
  }
}

// Sync WB
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js', src)
console.log('WB: synced')
console.log('Done.')
