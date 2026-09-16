// Dashboard Application Logic

// State
let siteConfig = null;
let imageMap = null;
let currentSection = 'overview';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (sessionStorage.getItem('dashboard_auth') === 'true') {
    showDashboard();
  }

  // Setup login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Setup navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      switchSection(section);
    });
  });

  // Setup upload zone
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--border)';
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--border)';
    handleFileSelect(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));

  // Load config
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
    
    // Load site-config.json
    const siteConfigResponse = await fetch(config.paths.siteConfig);
    if (siteConfigResponse.ok) {
      siteConfig = await siteConfigResponse.json();
    }
    
    // Load image-map.json
    try {
      const imageMapResponse = await fetch(config.paths.imageMap);
      if (imageMapResponse.ok) {
        imageMap = await imageMapResponse.json();
      }
    } catch (e) {
      console.log('Could not load image map from file:', e);
    }
    
    // Also check localStorage for any uploaded images
    try {
      const savedImageMap = localStorage.getItem('imageMap');
      if (savedImageMap) {
        const parsed = JSON.parse(savedImageMap);
        // Merge with file-based image map
        if (imageMap) {
          // Add any new categories from localStorage
          Object.entries(parsed.categories || {}).forEach(([catName, catData]) => {
            if (!imageMap.categories[catName]) {
              imageMap.categories[catName] = catData;
            } else {
              // Add new images to existing category
              const existingImages = new Set(imageMap.categories[catName].images.map(img => 
                typeof img === 'string' ? img : img.imageUrl
              ));
              catData.images.forEach(img => {
                const imgUrl = typeof img === 'string' ? img : img.imageUrl;
                if (!existingImages.has(imgUrl)) {
                  imageMap.categories[catName].images.push(img);
                }
              });
            }
          });
        } else {
          imageMap = parsed;
        }
      }
    } catch (e) {
      console.log('Could not load image map from localStorage:', e);
    }
    
    updateUI();
    setupAdaptiveNavigation();
  } catch (error) {
    console.log('Could not load site config:', error);
  }
}

function loadDashboardData() {
  const config = window.DASHBOARD_CONFIG;
  
  // Update business info
  document.getElementById('sidebarBusinessName').textContent = config.businessName;
  document.getElementById('headerBusinessName').textContent = config.businessName;
  document.getElementById('loginBusinessName').textContent = config.businessName;
  
  // Update info section
  document.getElementById('infoBusiness').textContent = config.businessName;
  document.getElementById('infoIndustry').textContent = config.industry;
  document.getElementById('infoLocation').textContent = config.city;
  document.getElementById('infoPhone').textContent = config.phone;
  
  // Update settings
  document.getElementById('settingsPhone').value = config.phone || '';
  document.getElementById('settingsEmail').value = config.email || '';
  document.getElementById('settingsAddress').value = config.address || '';
  document.getElementById('settingsFacebook').value = config.social?.facebook || '';
  document.getElementById('settingsInstagram').value = config.social?.instagram || '';
  document.getElementById('settingsTwitter').value = config.social?.twitter || '';
  
  // Update SEO
  document.getElementById('seoTitle').value = config.seo?.title || '';
  document.getElementById('seoDescription').value = config.seo?.description || '';
  document.getElementById('seoKeywords').value = config.seo?.keywords || '';
  
  // Load gallery folders
  loadGalleryFolders();
  
  // Load services
  loadServices();
  
  // Load testimonials
  loadTestimonials();
  
  // Load blog posts
  loadBlogPosts();
  
  // Update stats
  updateStats();
}

function updateUI() {
  if (!siteConfig) return;
  
  // Update gallery count
  const galleryCount = siteConfig.gallery?.length || 0;
  document.getElementById('galleryCount').textContent = galleryCount;
  
  // Update services count
  const servicesCount = siteConfig.services?.length || 0;
  document.getElementById('blogCount').textContent = servicesCount;
}

function updateStats() {
  // These would come from analytics in production
  document.getElementById('totalVisits').textContent = '--';
  document.getElementById('uniqueVisitors').textContent = '--';
}

// ============================================
// ADAPTIVE NAVIGATION
// ============================================

function setupAdaptiveNavigation() {
  // Hide sections that don't have data
  const hasGallery = imageMap?.categories && Object.keys(imageMap.categories).length > 0;
  const hasBlog = siteConfig?.blogPosts && siteConfig.blogPosts.length > 0;
  const hasServices = siteConfig?.services && siteConfig.services.length > 0;
  const hasPricing = siteConfig?.pricing && siteConfig.pricing.length > 0;
  const hasTestimonials = siteConfig?.testimonials && siteConfig.testimonials.length > 0;
  
  // Show/hide navigation items based on data
  document.querySelectorAll('.nav-item').forEach(item => {
    const section = item.dataset.section;
    
    switch(section) {
      case 'gallery':
        if (!hasGallery) item.style.display = 'none';
        break;
      case 'blog':
        if (!hasBlog) item.style.display = 'none';
        break;
      case 'services':
        if (!hasServices) item.style.display = 'none';
        break;
      case 'pricing':
        if (!hasPricing) item.style.display = 'none';
        break;
      case 'seo':
        // Always show SEO section
        break;
      case 'testimonials':
        if (!hasTestimonials) item.style.display = 'none';
        break;
    }
  });
  
  // Update stats with real data
  if (hasGallery) {
    const galleryCount = Object.values(imageMap.categories).reduce((sum, cat) => sum + cat.images.length, 0);
    document.getElementById('galleryCount').textContent = galleryCount;
  }
  
  if (hasServices) {
    document.getElementById('blogCount').textContent = siteConfig.services.length;
  }
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

function loadGalleryFolders() {
  const grid = document.getElementById('galleryGrid');
  const select = document.getElementById('uploadFolder');
  
  // Get categories from image-map.json
  const categories = imageMap?.categories || {};
  
  // Clear existing
  grid.innerHTML = '';
  select.innerHTML = '';
  
  // Add folders from image-map.json
  Object.entries(categories).forEach(([catName, catData]) => {
    const count = catData.images?.length || 0;
    
    // Skip empty categories
    if (count === 0) return;
    
    // Grid item
    const folder = document.createElement('div');
    folder.className = 'gallery-folder';
    folder.innerHTML = `
      <div class="gallery-folder-icon"><i class="fas fa-folder"></i></div>
      <div class="gallery-folder-name">${catName}</div>
      <div class="gallery-folder-count">${count} photos</div>
    `;
    folder.onclick = () => viewFolder(catName);
    grid.appendChild(folder);
    
    // Select option
    const option = document.createElement('option');
    option.value = catName;
    option.textContent = catName;
    select.appendChild(option);
  });
}

function viewFolder(category) {
  // Would open folder view with images
  console.log('Viewing folder:', category);
}

function createFolder() {
  const input = document.getElementById('newFolderName');
  const name = input.value.trim();
  
  if (!name) return;
  
  // Add to imageMap
  if (!imageMap) {
    imageMap = { categories: {} };
  }
  if (!imageMap.categories[name]) {
    imageMap.categories[name] = { images: [] };
  }
  
  // Update UI
  loadGalleryFolders();
  input.value = '';
  
  // Save image map
  saveImageMap();
}

// ============================================
// BLOG MANAGEMENT
// ============================================

function loadBlogPosts() {
  const list = document.getElementById('blogList');
  list.innerHTML = '';
  
  const blogPosts = siteConfig?.blogPosts || [];
  
  if (blogPosts.length === 0) {
    list.innerHTML = `
      <div class="blog-item">
        <div class="blog-info">
          <div class="blog-title">No blog posts yet</div>
          <div class="blog-meta">Create your first blog post</div>
        </div>
      </div>
    `;
    return;
  }
  
  blogPosts.forEach((post, index) => {
    const item = document.createElement('div');
    item.className = 'blog-item';
    item.innerHTML = `
      <div class="blog-info">
        <div class="blog-title">${post.title || 'Untitled'}</div>
        <div class="blog-meta">${post.date || ''} ${post.url ? `- <a href="${post.url}" target="_blank">View</a>` : ''}</div>
      </div>
      <div class="blog-actions">
        <button class="secondary-btn" onclick="editBlogPost(${index})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="danger-btn" onclick="deleteBlogPost(${index})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    list.appendChild(item);
  });
}

function openBlogEditor() {
  // Open blog editor modal
  document.getElementById('blogEditorModal').classList.remove('hidden');
  document.getElementById('blogTitle').value = '';
  document.getElementById('blogContent').value = '';
  document.getElementById('blogImageUrl').value = '';
  document.getElementById('blogEditorTitle').textContent = 'New Blog Post';
  document.getElementById('blogEditorSubmit').onclick = addBlogPost;
}

function editBlogPost(index) {
  const post = siteConfig.blogPosts[index];
  if (!post) return;
  
  document.getElementById('blogEditorModal').classList.remove('hidden');
  document.getElementById('blogTitle').value = post.title || '';
  document.getElementById('blogContent').value = post.excerpt || '';
  document.getElementById('blogImageUrl').value = post.images?.[0] || '';
  document.getElementById('blogEditorTitle').textContent = 'Edit Blog Post';
  document.getElementById('blogEditorSubmit').onclick = () => updateBlogPost(index);
}

function addBlogPost() {
  const title = document.getElementById('blogTitle').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const imageUrl = document.getElementById('blogImageUrl').value.trim();
  
  if (!title) {
    showToast('Please enter a title', 'warning');
    return;
  }
  
  if (!siteConfig.blogPosts) siteConfig.blogPosts = [];
  
  siteConfig.blogPosts.push({
    title,
    excerpt: content,
    date: new Date().toISOString().split('T')[0],
    url: '',
    images: imageUrl ? [imageUrl] : [],
  });
  
  saveSiteConfig();
  loadBlogPosts();
  closeBlogEditor();
  showToast('Blog post added!');
}

function updateBlogPost(index) {
  const title = document.getElementById('blogTitle').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const imageUrl = document.getElementById('blogImageUrl').value.trim();
  
  if (!title) {
    showToast('Please enter a title', 'warning');
    return;
  }
  
  siteConfig.blogPosts[index] = {
    ...siteConfig.blogPosts[index],
    title,
    excerpt: content,
    images: imageUrl ? [imageUrl] : siteConfig.blogPosts[index].images,
  };
  
  saveSiteConfig();
  loadBlogPosts();
  closeBlogEditor();
  showToast('Blog post updated!');
}

function deleteBlogPost(index) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;
  
  siteConfig.blogPosts.splice(index, 1);
  saveSiteConfig();
  loadBlogPosts();
  showToast('Blog post deleted!');
}

function closeBlogEditor() {
  document.getElementById('blogEditorModal').classList.add('hidden');
}

// ============================================
// SERVICES MANAGEMENT
// ============================================

function loadServices() {
  const list = document.getElementById('servicesList');
  list.innerHTML = '';
  
  const services = siteConfig?.services || [];
  
  if (services.length === 0) {
    list.innerHTML = `
      <div class="service-item">
        <div class="service-info">
          <div class="service-title">No services yet</div>
          <div class="service-description">Add your first service</div>
        </div>
      </div>
    `;
    return;
  }
  
  services.forEach((service, index) => {
    const item = document.createElement('div');
    item.className = 'service-item';
    item.innerHTML = `
      <div class="service-info">
        <div class="service-title">${service.title}</div>
        <div class="service-description">${service.description || ''}</div>
        ${service.priceTag ? `<div class="service-price">${service.priceTag}</div>` : ''}
      </div>
      <div class="service-actions">
        <button class="secondary-btn" onclick="editService(${index})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="danger-btn" onclick="deleteService(${index})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
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
  const service = siteConfig.services[index];
  if (!service) return;
  
  document.getElementById('serviceEditorModal').classList.remove('hidden');
  document.getElementById('serviceTitle').value = service.title || '';
  document.getElementById('serviceDescription').value = service.description || '';
  document.getElementById('servicePrice').value = service.priceTag || '';
  document.getElementById('serviceEditorTitle').textContent = 'Edit Service';
  document.getElementById('serviceEditorSubmit').onclick = () => updateService(index);
}

function addService() {
  const title = document.getElementById('serviceTitle').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  
  if (!title) {
    showToast('Please enter a service name', 'warning');
    return;
  }
  
  if (!siteConfig.services) siteConfig.services = [];
  
  siteConfig.services.push({
    title,
    description,
    priceTag: price || undefined,
    icon: 'Star',
  });
  
  saveSiteConfig();
  loadServices();
  closeServiceEditor();
  showToast('Service added!');
}

function updateService(index) {
  const title = document.getElementById('serviceTitle').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  
  if (!title) {
    showToast('Please enter a service name', 'warning');
    return;
  }
  
  siteConfig.services[index] = {
    ...siteConfig.services[index],
    title,
    description,
    priceTag: price || undefined,
  };
  
  saveSiteConfig();
  loadServices();
  closeServiceEditor();
  showToast('Service updated!');
}

function deleteService(index) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  
  siteConfig.services.splice(index, 1);
  saveSiteConfig();
  loadServices();
  showToast('Service deleted!');
}

function closeServiceEditor() {
  document.getElementById('serviceEditorModal').classList.add('hidden');
}

// ============================================
// PRICING MANAGEMENT
// ============================================

function loadPricing() {
  const list = document.getElementById('pricingList');
  list.innerHTML = '';
  
  const pricing = siteConfig?.pricing || [];
  
  if (pricing.length === 0) {
    list.innerHTML = `
      <div class="pricing-item">
        <div class="pricing-info">
          <div class="pricing-title">No pricing packages yet</div>
          <div class="pricing-meta">Add your first pricing package</div>
        </div>
      </div>
    `;
    return;
  }
  
  pricing.forEach((pkg, index) => {
    const item = document.createElement('div');
    item.className = 'pricing-item';
    item.innerHTML = `
      <div class="pricing-info">
        <div class="pricing-title">${pkg.service || 'Untitled'}</div>
        <div class="pricing-price">${pkg.price || 'Contact for pricing'}</div>
        <div class="pricing-details">${pkg.details || ''}</div>
      </div>
      <div class="pricing-actions">
        <button class="secondary-btn" onclick="editPricing(${index})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="danger-btn" onclick="deletePricing(${index})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
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
  const pkg = siteConfig.pricing[index];
  if (!pkg) return;
  
  document.getElementById('pricingEditorModal').classList.remove('hidden');
  document.getElementById('pricingName').value = pkg.service || '';
  document.getElementById('pricingPrice').value = pkg.price || '';
  document.getElementById('pricingDetails').value = pkg.details || '';
  document.getElementById('pricingEditorTitle').textContent = 'Edit Pricing Package';
  document.getElementById('pricingEditorSubmit').onclick = () => updatePricing(index);
}

function addPricing() {
  const name = document.getElementById('pricingName').value.trim();
  const price = document.getElementById('pricingPrice').value.trim();
  const details = document.getElementById('pricingDetails').value.trim();
  
  if (!name) {
    showToast('Please enter a package name', 'warning');
    return;
  }
  
  if (!siteConfig.pricing) siteConfig.pricing = [];
  
  siteConfig.pricing.push({
    service: name,
    price: price || 'Contact for pricing',
    details,
  });
  
  saveSiteConfig();
  loadPricing();
  closePricingEditor();
  showToast('Pricing package added!');
}

function updatePricing(index) {
  const name = document.getElementById('pricingName').value.trim();
  const price = document.getElementById('pricingPrice').value.trim();
  const details = document.getElementById('pricingDetails').value.trim();
  
  if (!name) {
    showToast('Please enter a package name', 'warning');
    return;
  }
  
  siteConfig.pricing[index] = {
    ...siteConfig.pricing[index],
    service: name,
    price: price || 'Contact for pricing',
    details,
  };
  
  saveSiteConfig();
  loadPricing();
  closePricingEditor();
  showToast('Pricing package updated!');
}

function deletePricing(index) {
  if (!confirm('Are you sure you want to delete this pricing package?')) return;
  
  siteConfig.pricing.splice(index, 1);
  saveSiteConfig();
  loadPricing();
  showToast('Pricing package deleted!');
}

function closePricingEditor() {
  document.getElementById('pricingEditorModal').classList.add('hidden');
}

// ============================================
// TESTIMONIALS MANAGEMENT
// ============================================

function loadTestimonials() {
  const list = document.getElementById('testimonialsList');
  list.innerHTML = '';
  
  const testimonials = siteConfig?.testimonials || [];
  
  if (testimonials.length === 0) {
    list.innerHTML = `
      <div class="testimonial-item">
        <div class="testimonial-text">No testimonials yet</div>
        <div class="testimonial-meta">
          <span class="testimonial-author">Add your first testimonial</span>
        </div>
      </div>
    `;
    return;
  }
  
  testimonials.forEach((t, index) => {
    const item = document.createElement('div');
    item.className = 'testimonial-item';
    item.innerHTML = `
      <div class="testimonial-text">"${t.text}"</div>
      <div class="testimonial-meta">
        <span class="testimonial-author">${t.name}</span>
        <span class="testimonial-rating">${'★'.repeat(t.rating || 5)}</span>
      </div>
      <div class="testimonial-actions">
        <button class="secondary-btn" onclick="editTestimonial(${index})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="danger-btn" onclick="deleteTestimonial(${index})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
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
  
  if (!name || !text) {
    showToast('Please enter name and testimonial text', 'warning');
    return;
  }
  
  if (!siteConfig.testimonials) siteConfig.testimonials = [];
  
  siteConfig.testimonials.push({
    name,
    text,
    rating: Math.min(5, Math.max(1, rating)),
    source: 'Dashboard',
  });
  
  saveSiteConfig();
  loadTestimonials();
  closeTestimonialEditor();
  showToast('Testimonial added!');
}

function updateTestimonial(index) {
  const name = document.getElementById('testimonialName').value.trim();
  const text = document.getElementById('testimonialText').value.trim();
  const rating = parseInt(document.getElementById('testimonialRating').value) || 5;
  
  if (!name || !text) {
    showToast('Please enter name and testimonial text', 'warning');
    return;
  }
  
  siteConfig.testimonials[index] = {
    ...siteConfig.testimonials[index],
    name,
    text,
    rating: Math.min(5, Math.max(1, rating)),
  };
  
  saveSiteConfig();
  loadTestimonials();
  closeTestimonialEditor();
  showToast('Testimonial updated!');
}

function deleteTestimonial(index) {
  if (!confirm('Are you sure you want to delete this testimonial?')) return;
  
  siteConfig.testimonials.splice(index, 1);
  saveSiteConfig();
  loadTestimonials();
  showToast('Testimonial deleted!');
}

function closeTestimonialEditor() {
  document.getElementById('testimonialEditorModal').classList.add('hidden');
}

// ============================================
// SETTINGS
// ============================================

function saveContact() {
  const phone = document.getElementById('settingsPhone').value;
  const email = document.getElementById('settingsEmail').value;
  const address = document.getElementById('settingsAddress').value;
  
  // Update site config
  if (siteConfig) {
    siteConfig.contact = siteConfig.contact || {};
    siteConfig.contact.phone = phone;
    siteConfig.contact.email = email;
    siteConfig.contact.address = address;
    
    // Also update top-level fields
    if (phone) siteConfig.phone = phone;
    if (email) siteConfig.email = email;
  }
  
  // Update dashboard config
  const config = window.DASHBOARD_CONFIG;
  config.phone = phone;
  config.email = email;
  config.address = address;
  
  saveSiteConfig();
  showToast('Contact info saved!');
}

function saveSocial() {
  const facebook = document.getElementById('settingsFacebook').value;
  const instagram = document.getElementById('settingsInstagram').value;
  const twitter = document.getElementById('settingsTwitter').value;
  
  // Update site config
  if (siteConfig) {
    siteConfig.socialLinks = siteConfig.socialLinks || {};
    siteConfig.socialLinks.facebook = facebook;
    siteConfig.socialLinks.instagram = instagram;
    siteConfig.socialLinks.twitter = twitter;
  }
  
  // Update dashboard config
  const config = window.DASHBOARD_CONFIG;
  config.social = { facebook, instagram, twitter };
  
  saveSiteConfig();
  showToast('Social links saved!');
}

function saveSeo() {
  const title = document.getElementById('seoTitle').value;
  const description = document.getElementById('seoDescription').value;
  const keywords = document.getElementById('seoKeywords').value;
  
  // Update site config
  if (siteConfig) {
    siteConfig.seo = siteConfig.seo || {};
    siteConfig.seo.title = title;
    siteConfig.seo.description = description;
    siteConfig.seo.keywords = keywords.split(',').map(k => k.trim());
  }
  
  // Update dashboard config
  const config = window.DASHBOARD_CONFIG;
  config.seo = { title, description, keywords };
  
  saveSiteConfig();
  showToast('SEO settings saved!');
}

function saveBusinessHours() {
  const hours = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const open = document.getElementById(`${day}Open`)?.value;
    const close = document.getElementById(`${day}Close`)?.value;
    if (open && close) {
      hours[day] = { open, close };
    }
  });
  
  if (siteConfig) {
    siteConfig.businessHours = hours;
  }
  
  saveSiteConfig();
  showToast('Business hours saved!');
}

async function saveSiteConfig() {
  try {
    // Save to localStorage as backup
    localStorage.setItem('siteConfig', JSON.stringify(siteConfig));
    
    // Save to server (public/site-config.json)
    const response = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteConfig: siteConfig,
        imageMap: imageMap,
      }),
    });
    
    if (response.ok) {
      console.log('Config saved to server');
    } else {
      console.log('Could not save to server, saved to localStorage');
    }
  } catch (error) {
    console.log('Could not save to server:', error);
    console.log('Saved to localStorage as backup');
  }
}

// ============================================
// FILE UPLOAD
// ============================================

function openUploadModal() {
  document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
  document.getElementById('uploadPreview').innerHTML = '';
}

function handleFileSelect(files) {
  const preview = document.getElementById('uploadPreview');
  preview.innerHTML = '';
  
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function uploadFiles() {
  const fileInput = document.getElementById('fileInput');
  const folder = document.getElementById('uploadFolder').value;
  const files = fileInput.files;
  
  if (files.length === 0) {
    showToast('Please select files to upload', 'warning');
    return;
  }
  
  // Process each file
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${folder.toLowerCase()}-${timestamp}-${file.name}`;
    
    // Read file as data URL for preview and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      
      // Add to image-map.json
      addImageToMap(folder, filename, imageData);
      
      // Show success message
      showToast(`${file.name} uploaded to ${folder}!`);
    };
    reader.readAsDataURL(file);
  });
  
  closeUploadModal();
  
  // Update gallery count
  loadGalleryFolders();
}

function addImageToMap(category, filename, imageData) {
  // Initialize imageMap if not exists
  if (!imageMap) {
    imageMap = { categories: {} };
  }
  
  // Initialize category if not exists
  if (!imageMap.categories[category]) {
    imageMap.categories[category] = { images: [] };
  }
  
  // Add new image to category
  const newImage = {
    imageUrl: `/assets/${category.toLowerCase()}/${filename}`,
    caption: `${category} - ${imageMap.categories[category].images.length + 1}`,
    category: category,
    data: imageData // Store base64 data for immediate display
  };
  
  imageMap.categories[category].images.push(newImage);
  
  // Save updated image-map.json
  saveImageMap();
  
  // Update gallery display
  loadGalleryFolders();
}

async function saveImageMap() {
  try {
    // In a real implementation, this would save to the server
    // For now, we'll store in localStorage as a demo
    localStorage.setItem('imageMap', JSON.stringify(imageMap));
    console.log('Image map saved:', imageMap);
    showToast('Image map updated!');
  } catch (error) {
    console.error('Error saving image map:', error);
    showToast('Error saving image map', 'error');
  }
}

// ============================================
// NAVIGATION
// ============================================

function switchSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  // Show selected section
  document.getElementById(section).classList.add('active');
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });
  
  // Update title
  const titles = {
    overview: 'Overview',
    gallery: 'Gallery Management',
    blog: 'Blog Posts',
    services: 'Services',
    seo: 'SEO & Analytics',
    testimonials: 'Testimonials',
    settings: 'Settings',
  };
  document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
  
  currentSection = section;
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ============================================
// UTILITIES
// ============================================

function togglePassword() {
  const input = document.getElementById('password');
  const icon = document.querySelector('.toggle-password i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

function showToast(message, type = 'success') {
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--danger)'};
    color: white;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    z-index: 1000;
    animation: slideUp 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
