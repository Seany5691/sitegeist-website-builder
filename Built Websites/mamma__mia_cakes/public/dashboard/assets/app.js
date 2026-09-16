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
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('dashboard_auth') === 'true') {
    showDashboard();
  }

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
// AUTHENTICATION
// ============================================

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const config = window.DASHBOARD_CONFIG;
  if (username === config.username && password === config.password) {
    sessionStorage.setItem('dashboard_auth', 'true');
    showDashboard();
  } else {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = 'Invalid username or password';
    errorEl.style.display = 'block';
  }
}

function logout() {
  sessionStorage.removeItem('dashboard_auth');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
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
    if (configRes.status === 'fulfilled' && configRes.value.ok) siteConfig = await configRes.value.json();
    if (imageRes.status === 'fulfilled' && imageRes.value.ok) imageMap = await imageRes.value.json();
    if (defaultsRes.status === 'fulfilled' && defaultsRes.value.ok) siteConfigDefaults = await defaultsRes.value.json();

    // Only merge localStorage if it's for the same business
    try {
      const saved = localStorage.getItem('imageMap');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (imageMap) {
          Object.entries(parsed.categories || {}).forEach(([cat, data]) => {
            if (!imageMap.categories[cat]) { imageMap.categories[cat] = data; }
            else {
              const existing = new Set(imageMap.categories[cat].images.map(i => typeof i === 'string' ? i : i.imageUrl));
              data.images.forEach(img => { const url = typeof img === 'string' ? img : img.imageUrl; if (!existing.has(url)) imageMap.categories[cat].images.push(img); });
            }
          });
        } else { imageMap = parsed; }
      }
    } catch {}

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
  document.getElementById('galleryCount').textContent = hasGallery ? Object.values(imageMap.categories).reduce((s, c) => s + (c.images?.length || 0), 0) : '0';
  if (hasServices) document.getElementById('blogCount').textContent = siteConfig.services.length;
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

function deleteFolderImage(category, index) {
  if (!confirm('Delete this image?')) return;
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

function deleteFolder(catName) {
  if (!confirm(`Delete folder "${catName}" and all its images? This cannot be undone.`)) return;
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

function resetSection(section) {
  if (!siteConfigDefaults) {
    showToast('No defaults file found. Build a new site first.', 'warning');
    return;
  }
  if (!confirm(`Reset ${section} to default? This will overwrite your changes.`)) return;

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
  document.getElementById('serviceEditorTitle').textContent = 'Edit Service';
  document.getElementById('serviceEditorSubmit').onclick = () => updateService(index);
}

function addService() {
  const title = document.getElementById('serviceTitle').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  if (!title) { showToast('Enter a service name', 'warning'); return; }
  if (!siteConfig.services) siteConfig.services = [];
  siteConfig.services.push({ title, description, priceTag: price || undefined, icon: 'Star' });
  saveSiteConfig(); loadServices(); closeServiceEditor(); showToast('Service added!');
}

function updateService(index) {
  const title = document.getElementById('serviceTitle').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  if (!title) { showToast('Enter a service name', 'warning'); return; }
  siteConfig.services[index] = { ...siteConfig.services[index], title, description, priceTag: price || undefined };
  saveSiteConfig(); loadServices(); closeServiceEditor(); showToast('Service updated!');
}

function deleteService(index) {
  if (!confirm('Delete this service?')) return;
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

function deletePricing(index) {
  if (!confirm('Delete this package?')) return;
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

function deleteTestimonial(index) {
  if (!confirm('Delete this testimonial?')) return;
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

function deleteBlogPost(index) {
  if (!confirm('Delete this blog post?')) return;
  siteConfig.blogPosts.splice(index, 1);
  saveSiteConfig(); loadBlogPosts(); showToast('Blog post deleted!');
}

function closeBlogEditor() { document.getElementById('blogEditorModal').classList.add('hidden'); }

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
      showToast('Changes saved!');
    } else {
      showToast('Saved locally (server unavailable)');
    }
  } catch {
    showToast('Saved locally (server unavailable)');
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
    if (res.ok) showToast('Image map saved!');
    else showToast('Saved locally');
  } catch {
    showToast('Saved locally');
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
  };
  document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
  currentSection = section;

  // Load design system data when that section is selected
  if (section === 'design-system') {
    loadDesignSystem();
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

  // Color Palette
  const colors = siteConfig.brandAssets?.brandColors || {};
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
    const headingFont = siteConfig.theme?.fonts?.heading || 'System Font';
    const bodyFont = siteConfig.theme?.fonts?.body || 'System Font';
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
    const seedId = siteConfig.buildSlug || 'default';
    seedInfo.innerHTML = `
      <div class="seed-detail">
        <span class="seed-label">Seed ID</span>
        <span class="seed-value">${seedId}</span>
      </div>
      <div class="seed-detail">
        <span class="seed-label">Archetype</span>
        <span class="seed-value">${siteConfig.industry || 'General'}</span>
      </div>
    `;
  }

  // Density
  const densityInfo = document.getElementById('densityInfo');
  if (densityInfo) {
    densityInfo.innerHTML = `
      <div class="density-detail">
        <span class="density-label">Density Profile</span>
        <span class="density-value">Balanced</span>
      </div>
      <div class="density-detail">
        <span class="density-label">Decorative Intensity</span>
        <span class="density-value">Subtle</span>
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
