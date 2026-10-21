const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];
const TPL_APP = WB + '/templates/dashboard/assets/app.js';
const TPL_IDX = WB + '/templates/dashboard/index.html';
const TPL_CSS = WB + '/templates/dashboard/assets/styles.css';

// ═══════════════════════════════════════════════════════════════════════════
// 1. app.js — `case 'image'` gains a URL input (upload OR paste)
// ═══════════════════════════════════════════════════════════════════════════
let app = fs.readFileSync(TPL_APP, 'utf8');

const OLD_IMAGE = `    case 'image': {
      const uploadAttrs = \`data-feature-upload="\${escapeHtml(featureId)}"\${isList ? \` data-list="\${escapeHtml(listKey)}" data-index="\${index}"\` : ''} data-key="\${escapeHtml(field.key)}"\`;
      const removeAttrs = \`data-feature-image-clear="\${escapeHtml(featureId)}"\${isList ? \` data-list="\${escapeHtml(listKey)}" data-index="\${index}"\` : ''} data-key="\${escapeHtml(field.key)}"\`;
      const fileAttrs = \`data-feature-file="\${escapeHtml(featureId)}"\${isList ? \` data-list="\${escapeHtml(listKey)}" data-index="\${index}"\` : ''} data-key="\${escapeHtml(field.key)}"\`;
      const thumb = val
        ? \`<div class="feature-thumb"><img src="\${escapeHtml(val)}" alt="\${escapeHtml(field.label)}"></div>\`
        : \`<div class="feature-thumb"><i class="fas fa-image"></i></div>\`;
      controlHtml = \`
        <div class="editor-field">
          <label>\${escapeHtml(field.label)}</label>
          <div class="feature-image-row">
            \${thumb}
            <button type="button" class="secondary-btn" \${uploadAttrs}><i class="fas fa-upload"></i> Upload</button>
            \${val ? \`<button type="button" class="danger-btn" \${removeAttrs}><i class="fas fa-trash"></i> Remove</button>\` : ''}
            <input type="file" accept="image/*" hidden \${fileAttrs}>
          </div>
        </div>\`;
      break;
    }`;

const NEW_IMAGE = `    case 'image': {
      const uploadAttrs = \`data-feature-upload="\${escapeHtml(featureId)}"\${isList ? \` data-list="\${escapeHtml(listKey)}" data-index="\${index}"\` : ''} data-key="\${escapeHtml(field.key)}"\`;
      const removeAttrs = \`data-feature-image-clear="\${escapeHtml(featureId)}"\${isList ? \` data-list="\${escapeHtml(listKey)}" data-index="\${index}"\` : ''} data-key="\${escapeHtml(field.key)}"\`;
      const fileAttrs = \`data-feature-file="\${escapeHtml(featureId)}"\${isList ? \` data-list="\${escapeHtml(listKey)}" data-index="\${index}"\` : ''} data-key="\${escapeHtml(field.key)}"\`;
      const thumb = val
        ? \`<div class="feature-thumb"><img src="\${escapeHtml(val)}" alt="\${escapeHtml(field.label)}"></div>\`
        : \`<div class="feature-thumb"><i class="fas fa-image"></i></div>\`;
      // BOTH paths: upload a file, or paste an image link. The URL input carries
      // the standard data-feature-field / data-key so writeFeatureFieldsFromDom
      // picks it up exactly like any other field.
      controlHtml = \`
        <div class="editor-field">
          <label>\${escapeHtml(field.label)}</label>
          <div class="feature-image-row">
            \${thumb}
            <button type="button" class="secondary-btn" \${uploadAttrs}><i class="fas fa-upload"></i> Upload</button>
            \${val ? \`<button type="button" class="danger-btn" \${removeAttrs}><i class="fas fa-trash"></i> Remove</button>\` : ''}
            <input type="file" accept="image/*" hidden \${fileAttrs}>
          </div>
          <input type="text" \${dataAttrs} value="\${escapeHtml(val)}" placeholder="https://… paste an image link" class="image-url-input">
          <div class="field-hint">Upload a photo, or paste an image link.</div>
        </div>\`;
      break;
    }`;

if (app.includes('image-url-input')) {
  console.log('app.js  case image already has URL input — skipped');
} else {
  if (!app.includes(OLD_IMAGE)) {
    console.log('*** case image anchor NOT FOUND — dumping for repair ***');
    const i = app.indexOf("    case 'image': {");
    console.log(JSON.stringify(app.slice(i, i + 1200)));
    process.exit(1);
  }
  app = app.replace(OLD_IMAGE, NEW_IMAGE);
  console.log('app.js  case image -> upload OR paste URL');
}

// ── generic uploader for the hand-written forms ────────────────────────────
if (app.includes('function uploadImageToField')) {
  console.log('app.js  uploadImageToField already present — skipped');
} else {
  const HELPER = `

// ============================================
// IMAGE FIELDS — every photo input accepts a file upload OR a pasted link.
// ============================================

/** Upload a chosen file and drop its URL into a plain text/url input. */
async function uploadImageToField(files, inputId, previewId) {
  if (!files || !files.length) return;
  const file = files[0];
  if (!file.type || !file.type.startsWith('image/')) {
    showToast('Select an image file', 'warning');
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) { showToast('Upload failed', 'error'); return; }
    const result = await res.json();
    if (!result || !result.success || !result.url) { showToast('Upload failed', 'error'); return; }
    const input = document.getElementById(inputId);
    if (input) {
      input.value = result.url;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const pid = previewId || (inputId + 'Preview');
    const preview = document.getElementById(pid);
    if (preview) {
      preview.innerHTML = '<img src="' + result.url + '" alt="" style="max-width:180px;border-radius:8px;margin-top:8px;display:block">';
    }
    markDirty();
    showToast('Image uploaded!');
  } catch (err) {
    console.error('Image upload error:', err);
    showToast('Upload failed', 'error');
  }
}

/** Clear a plain image-URL field (and its preview). */
function clearImageField(inputId, previewId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const pid = previewId || (inputId + 'Preview');
  const preview = document.getElementById(pid);
  if (preview) preview.innerHTML = '';
  markDirty();
  showToast('Image removed — Save to apply.');
}

`;
  const anchor = '// ============================================\n// THUMBNAIL MANAGEMENT';
  if (app.includes(anchor)) {
    app = app.replace(anchor, HELPER + anchor);
    console.log('app.js  uploadImageToField + clearImageField added');
  } else {
    app += HELPER;
    console.log('app.js  helpers appended to end (anchor not found)');
  }
}

fs.writeFileSync(TPL_APP, app, 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 2. index.html — give the 7 hand-written image fields an Upload button
// ═══════════════════════════════════════════════════════════════════════════
let idx = fs.readFileSync(TPL_IDX, 'utf8');

function uploadBlock(inputId, previewId) {
  return `
              <div class="image-url-actions">
                <button type="button" class="secondary-btn" onclick="document.getElementById('${inputId}File').click()"><i class="fas fa-upload"></i> Upload image</button>
                <button type="button" class="danger-btn" onclick="clearImageField('${inputId}','${previewId}')"><i class="fas fa-trash"></i> Remove</button>
                <input type="file" id="${inputId}File" accept="image/*" hidden onchange="uploadImageToField(this.files, '${inputId}', '${previewId}')">
              </div>
              <div id="${previewId}" class="image-url-preview"></div>`;
}

const FIELDS = [
  // [inputId, exact input tag to find, previewId]
  ['servicesHeroImage', '<input type="url" id="servicesHeroImage" placeholder="https://...">', 'servicesHeroImagePreview'],
  ['portfolioHeroImage', '<input type="url" id="portfolioHeroImage" placeholder="https://...">', 'portfolioHeroImagePreview'],
  ['aboutHeroImage', '<input type="url" id="aboutHeroImage" placeholder="https://...">', 'aboutHeroImagePreview'],
  ['contactHeroImage', '<input type="url" id="contactHeroImage" placeholder="https://...">', 'contactHeroImagePreview'],
  ['serviceImageUrl', '<input type="url" id="serviceImageUrl" placeholder="https://example.com/image.jpg">', 'serviceImageUrlPreview'],
  ['blogImageUrl', '<input type="text" id="blogImageUrl" placeholder="https://example.com/image.jpg">', 'blogImageUrlPreview'],
  ['teamImageUrl', '<input type="text" id="teamImageUrl" placeholder="https://example.com/photo.jpg">', 'teamImageUrlPreview'],
];

if (idx.includes('image-url-actions')) {
  console.log('index.html  upload buttons already present — skipped');
} else {
  for (const [id, needle, previewId] of FIELDS) {
    if (!idx.includes(needle)) {
      console.log('  ' + id.padEnd(22) + '*** INPUT TAG NOT FOUND ***');
      continue;
    }
    if (idx.includes('id="' + id + 'File"')) {
      console.log('  ' + id.padEnd(22) + 'already has upload');
      continue;
    }
    idx = idx.replace(needle, needle + uploadBlock(id, previewId));
    const ok = idx.includes('id="' + id + 'File"');
    console.log('  ' + id.padEnd(22) + (ok ? 'upload button added' : '*** FAILED ***'));
  }
  fs.writeFileSync(TPL_IDX, idx, 'utf8');
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. styles.css — layout for the new action rows
// ═══════════════════════════════════════════════════════════════════════════
let css = fs.readFileSync(TPL_CSS, 'utf8');
if (css.includes('.image-url-actions')) {
  console.log('styles.css  already patched — skipped');
} else {
  css += `

/* ============================================
   Image fields — upload OR paste a link
   ============================================ */
.image-url-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.image-url-preview {
  margin-top: 8px;
}

.image-url-preview img {
  max-width: 180px;
  border-radius: 8px;
  display: block;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
}

.image-url-input {
  margin-top: 8px;
}

.editor-field .image-url-input,
.form-group .image-url-input {
  width: 100%;
}
`;
  fs.writeFileSync(TPL_CSS, css, 'utf8');
  console.log('styles.css  patched');
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. verify + sync to the 3 sites
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify template ===');
const app2 = fs.readFileSync(TPL_APP, 'utf8');
const idx2 = fs.readFileSync(TPL_IDX, 'utf8');
const css2 = fs.readFileSync(TPL_CSS, 'utf8');
console.log('  case image has URL input   : ' + app2.includes('image-url-input'));
console.log('  uploadImageToField defined : ' + app2.includes('function uploadImageToField'));
console.log('  clearImageField defined    : ' + app2.includes('function clearImageField'));
console.log('  css .image-url-actions     : ' + css2.includes('.image-url-actions'));
let allOk = true;
for (const [id] of FIELDS) {
  const has = idx2.includes('id="' + id + 'File"') && idx2.includes("uploadImageToField(this.files, '" + id + "'");
  if (!has) allOk = false;
  console.log('  ' + id.padEnd(22) + (has ? 'wired' : '*** NOT WIRED ***'));
}

console.log('\n=== sync to 3 sites ===');
const DASH = [
  ['templates/dashboard/index.html', 'public/dashboard/index.html'],
  ['templates/dashboard/assets/app.js', 'public/dashboard/assets/app.js'],
  ['templates/dashboard/assets/styles.css', 'public/dashboard/assets/styles.css'],
];
for (const s of SITES) {
  for (const [srcRel, destRel] of DASH) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const ok = fs.readFileSync(dst, 'utf8') === content;
    if (!ok) allOk = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(32) + (ok ? 'OK' : '*** MISMATCH ***'));
  }
  // config.js must be untouched and placeholder-free
  const cfg = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/assets/config.js', 'utf8');
  const ph = (cfg.match(/\{\{[A-Z_]+\}\}/g) || []).length;
  const bn = (cfg.match(/businessName:\s*"([^"]*)"/) || [])[1];
  console.log('  ' + s.padEnd(32) + 'config.js untouched  businessName="' + bn + '"  placeholders=' + ph);
  if (ph > 0) allOk = false;
}

console.log('\n' + (allOk && app2.includes('image-url-input') ? 'ALL CHECKS PASS' : 'PROBLEM(S) — see above'));
process.exit(allOk && app2.includes('image-url-input') ? 0 : 1);
