const BASES = {
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  mamma_mia_cakes_and_catering: 'https://mammamiacakesandcatering.vercel.app',
  tammy_s_sticker_shop: 'https://tammy-s-sticker-shop.sitespire.co.za',
};
const FORM_FIELDS = ['teamImageUrl', 'blogImageUrl', 'serviceImageUrl', 'servicesHeroImage', 'portfolioHeroImage', 'aboutHeroImage', 'contactHeroImage'];

(async () => {
  let fail = 0;
  for (const [name, base] of Object.entries(BASES)) {
    console.log('\n=== ' + name + ' ===');
    const h = await (await fetch(base + '/dashboard/index.html', { cache: 'no-store' })).text();
    const app = await (await fetch(base + '/dashboard/assets/app.js', { cache: 'no-store' })).text();
    const css = await (await fetch(base + '/dashboard/assets/styles.css', { cache: 'no-store' })).text();

    for (const f of FORM_FIELDS) {
      const hasFile = h.includes('id="' + f + 'File"');
      const hasHandler = h.includes("uploadImageToField(this.files, '" + f + "'");
      const hasClear = h.includes("clearImageField('" + f + "'");
      const ok = hasFile && hasHandler && hasClear;
      console.log('  ' + f.padEnd(20) + 'file:' + (hasFile ? 'Y' : 'N') + ' handler:' + (hasHandler ? 'Y' : 'N') + ' clear:' + (hasClear ? 'Y' : 'N') + (ok ? '' : '  *** MISSING ***'));
      if (!ok) fail++;
    }

    const appChecks = {
      'uploadImageToField': app.includes('function uploadImageToField'),
      'clearImageField': app.includes('function clearImageField'),
      'image field has URL input': app.includes('image-url-input'),
      'image field hint': app.includes('Upload a photo, or paste an image link'),
    };
    for (const [k, v] of Object.entries(appChecks)) {
      console.log('  ' + k.padEnd(28) + (v ? 'ok' : '*** MISSING ***'));
      if (!v) fail++;
    }
    console.log('  css .image-url-actions      ' + (css.includes('.image-url-actions') ? 'ok' : '*** MISSING ***'));
    if (!css.includes('.image-url-actions')) fail++;

    // the single-page-image fields rendered through FEATURE_FIELDS / SECTION_FIELDS
    const imgCount = (app.match(/case 'image': \{/g) || []).length;
    console.log('  case image blocks: ' + imgCount);
    // confirm every type:'image' field exists in schema
    const imgKeys = (app.match(/type: 'image'/g) || []).length;
    console.log('  type:image fields in schemas: ' + imgKeys);
    if (imgKeys === 0) fail++;
  }
  console.log('\n' + (fail === 0 ? 'IMAGE UPLOAD CHECKS PASS' : fail + ' PROBLEM(S)'));
  process.exit(fail === 0 ? 0 : 1);
})();
