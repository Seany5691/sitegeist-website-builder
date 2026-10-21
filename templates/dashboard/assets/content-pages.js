/**
 * Content & Pages + Navigation — unified dashboard.
 * 
 * EDITORS RENDER DIRECTLY INTO THE ACCORDION (no DOM borrowing).
 * When Edit is clicked, the editor HTML is injected into the accordion body
 * and the matching load function is called. All IDs match the original
 * sections so every existing JS function works unchanged.
 */

// ── Data ───────────────────────────────────────────────────────────────────

const CP_PAGES = [
  { id: 'home', label: 'Homepage', locked: true, lockedFirst: 'hero' },
  { id: 'services', label: 'Services Page', lockedFirst: 'services' },
  { id: 'portfolio', label: 'Portfolio Page', lockedFirst: 'gallery' },
  { id: 'about', label: 'About Page', lockedFirst: 'about' },
  { id: 'contact', label: 'Contact Page', locked: true, lockedFirst: 'contact' },
  { id: 'teamPage', label: 'Team Page', lockedFirst: 'team' },
  { id: 'blogPage', label: 'Blog Page', lockedFirst: 'blogStrip' },
  { id: 'faqPage', label: 'FAQ Page', lockedFirst: 'faq' },
  { id: 'reviewsPage', label: 'Reviews Page', lockedFirst: 'testimonials' },
  { id: 'areasPage', label: 'Areas Page', lockedFirst: 'serviceAreas' },
  { id: 'privacy', label: 'Privacy Page', locked: true },
  { id: 'processPage', label: 'Process Page', lockedFirst: 'process' },
]

const CP_SECTIONS = [
  { id: 'hero', label: 'Hero', locked: true },
  { id: 'statsBar', label: 'Stats / By the Numbers' },
  { id: 'services', label: 'Services', hasSubmenu: true },
  { id: 'process', label: 'Process / How It Works' },
  { id: 'gallery', label: 'Gallery / Portfolio' },
  { id: 'beforeAfter', label: 'Before / After' },
  { id: 'latestWork', label: 'Latest Work' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'trustBadges', label: 'Trust Badges' },
  { id: 'about', label: 'About / Story' },
  { id: 'team', label: 'Team' },
  { id: 'partners', label: 'Partners' },
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
  { id: 'vsl', label: 'VSL' },
]

const CP_DEFAULTS = {
  home: ['hero', 'statsBar', 'services', 'gallery', 'testimonials', 'about', 'cta', 'contact'],
  services: ['hero', 'services', 'process', 'faq', 'cta', 'contact'],
  portfolio: ['hero', 'gallery', 'cta', 'contact'],
  about: ['hero', 'about', 'statsBar', 'team', 'cta', 'contact'],
  contact: ['hero', 'contact', 'location', 'faq', 'cta'],
  teamPage: ['hero', 'team', 'cta', 'contact'],
  blogPage: ['hero', 'blogStrip', 'cta', 'contact'],
  faqPage: ['hero', 'faq', 'cta', 'contact'],
  reviewsPage: ['hero', 'testimonials', 'cta', 'contact'],
  areasPage: ['hero', 'serviceAreas', 'location', 'cta', 'contact'],
  privacy: ['hero', 'cta', 'contact'],
  processPage: ['hero', 'process', 'services', 'cta', 'contact'],
}

let cpCurrentPage = 'home'
let cpOpenEditorId = null

// ── Custom editor HTML (extracted from original sections) ─────────────────

const CP_HTML_HERO = `<div class="section-header">
            <h2>Hero Section</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('hero')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              <button class="primary-btn" onclick="saveHeroContent()">
                <i class="fas fa-save"></i><span>Save Changes</span>
              </button>
            </div>
          </div>
          <div class="editor-grid">
            <div class="editor-card">
              <h3>Hero Image</h3>
              <div class="hero-image-preview" id="heroImagePreview">
                <div class="hero-placeholder">
                  <i class="fas fa-image"></i>
                  <p>No hero image set</p>
                </div>
              </div>
              <div class="hero-image-actions">
                <button class="primary-btn" onclick="document.getElementById('heroImageInput').click()">
                  <i class="fas fa-upload"></i> Upload New Hero Image
                </button>
                <input type="file" id="heroImageInput" accept="image/*" hidden onchange="handleHeroImageUpload(this.files)">
                <button class="secondary-btn" onclick="removeHeroImage()">
                  <i class="fas fa-trash"></i> Remove
                </button>
              </div>
              <p class="help-text">Any image size works. It will automatically fit the hero section.</p>
            </div>
            <div class="editor-card">
              <h3>Hero Text</h3>
              <div class="editor-field">
                <label>Headline</label>
                <input type="text" id="heroHeadline" placeholder="Your main headline">
              </div>
              <div class="editor-field">
                <label>Subheadline</label>
                <textarea id="heroSubheadline" rows="2" placeholder="Supporting text below headline"></textarea>
              </div>
              <div class="editor-field">
                <label>Badge Text</label>
                <input type="text" id="heroBadge" placeholder="Small badge above headline">
              </div>
              <div class="editor-field">
                <label>Button Text</label>
                <input type="text" id="heroCta" placeholder="e.g., Get a Free Quote">
              </div>
              <div class="editor-field">
                <label>Button Link</label>
                <input type="text" id="heroCtaLink" placeholder="#contact">
              </div>
            </div>
          </div>`

const CP_HTML_SERVICES = `<div class="section-header">
            <h2>Services</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('services')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              <button class="primary-btn" onclick="openServiceEditor()">
                <i class="fas fa-plus"></i><span>Add Service</span>
              </button>
            </div>
          </div>
          <p class="help-text">Drag the grip handle to reorder services.</p>
          <div id="servicesList" class="services-list"></div>`

const CP_HTML_GALLERY = `<div class="section-header">
  <h2>Gallery Management</h2>
</div>

<div class="content-page-card" style="margin-bottom:1.25rem;">
  <h3><i class="fas fa-heading"></i> Section heading</h3>
  <p class="help-text">The heading and subheading that introduce your gallery on the home page.</p>
  <div class="editor-field">
    <label>Heading</label>
    <input type="text" id="galleryTitle" placeholder="Our Work">
    <p class="help-text">Visitors see this as the big heading above your photo gallery on the home page.</p>
  </div>
  <div class="editor-field">
    <label>Subheading</label>
    <input type="text" id="gallerySubtitle" placeholder="Browse our latest creations">
    <p class="help-text">A smaller line of text that sits above the heading.</p>
  </div>
  
</div>

<div style="display:flex;gap:8px;margin-bottom:12px;"><button type="button" class="primary-btn" onclick="openAddFolderModal()"><i class="fas fa-folder-plus"></i> Add Folder</button><button type="button" class="secondary-btn" onclick="openUploadModal()"><i class="fas fa-upload"></i> Upload Photos</button></div>
<p class="help-text">Use ↑ ↓ to reorder folders. Click a folder to open its photo manager.</p>
<div id="galleryGrid" class="gallery-grid"></div>

<!-- Folder Detail View (hidden by default) -->
<div id="folderDetail" style="display:none;margin-top:1.25rem;">
  <div class="content-page-card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
      <div style="display:flex;align-items:center;gap:10px;">
        <button type="button" class="secondary-btn" onclick="closeFolderDetail()">
          <i class="fas fa-arrow-left"></i> Back to folders
        </button>
        <h3 id="folderDetailTitle" style="margin:0;">Folder</h3>
      </div>
      <div style="display:flex;gap:8px;">
        <button type="button" class="secondary-btn" onclick="folderDetailSetThumb()">
          <i class="fas fa-image"></i> Set Thumbnail
        </button>
        <button type="button" class="danger-btn" onclick="folderDetailBulkDelete()">
          <i class="fas fa-trash"></i> Delete Selected
        </button>
        <button type="button" class="primary-btn" onclick="folderDetailUpload()">
          <i class="fas fa-upload"></i> Upload Photos
        </button>
      </div>
    </div>
    <p class="help-text">Click a photo to select it. Drag to reorder. Use the buttons above for bulk actions.</p>
    <input type="file" id="folderDetailFileInput" accept="image/*" multiple hidden onchange="folderDetailUploadFiles(this.files)">
    <div id="folderDetailGrid" style="display:flex;flex-wrap:wrap;gap:10px;"></div>
  </div>
</div>

<div class="gallery-display-card">
  <h3><i class="fas fa-home"></i> Homepage Gallery Display</h3>
  <p class="help-text" style="margin-bottom:0;">Choose how the gallery looks on the home page. "View full Gallery" always opens the gallery page with everything.</p>
  <div class="gallery-display-grid">
    <div class="editor-field" style="margin-bottom:0;">
      <label for="galleryHomeMode">Show on homepage as</label>
      <select id="galleryHomeMode">
        <option value="pictures">Pictures</option>
        <option value="folders">Folders</option>
      </select>
    </div>
    <div class="editor-field" style="margin-bottom:0;">
      <label for="galleryHomeFilter">Default filter</label>
      <select id="galleryHomeFilter">
        <option value="All">All</option>
      </select>
    </div>
    <div class="editor-field" id="galleryPictureLimitField" style="margin-bottom:0;">
      <label for="galleryPictureLimit">Pictures to show</label>
      <input type="number" id="galleryPictureLimit" min="1" max="48" value="8">
    </div>
    <div class="editor-field" id="galleryFolderLimitField" style="margin-bottom:0;">
      <label for="galleryFolderLimit">Folders to show</label>
      <input type="number" id="galleryFolderLimit" min="1" max="24" value="6">
    </div>
  </div>
  
</div>`

const CP_HTML_TESTIMONIALS = `<div class="section-header">
            <h2>Testimonials</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('testimonials')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              
            </div>
          </div>
          <div class="content-page-card" style="margin-bottom:1.25rem;">
            <h3><i class="fas fa-heading"></i> Section heading</h3>
            <p class="help-text">The heading and subheading that introduce your testimonials on the home page.</p>
            <div class="editor-field">
              <label>Heading</label>
              <input type="text" id="testimonialsTitle" placeholder="What Our Customers Say">
              <p class="help-text">Visitors see this as the big heading above your customer reviews.</p>
            </div>
            <div class="editor-field">
              <label>Subheading</label>
              <input type="text" id="testimonialsSubtitle" placeholder="Happy Clients">
              <p class="help-text">A smaller line of text that sits above the heading.</p>
            </div>
            
          </div>
          <p class="help-text">Drag the grip handle to reorder testimonials.</p>
          <div id="testimonialsList" class="testimonials-list"></div>`

const CP_HTML_ABOUT = `<div class="section-header">
            <h2>About Page</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('about')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              <button class="primary-btn" onclick="saveAboutContent()">
                <i class="fas fa-save"></i><span>Save Changes</span>
              </button>
            </div>
          </div>
          <div class="editor-grid">
            <div class="editor-card">
              <h3>About Content</h3>
              <div class="editor-field">
                <label>Page Title</label>
                <input type="text" id="aboutTitle" placeholder="Our Story">
              </div>
              <div class="editor-field">
                <label>Tagline</label>
                <input type="text" id="aboutTagline" placeholder="Baked with Love, Served with Joy">
              </div>
              <div class="editor-field">
                <label>Paragraph 1</label>
                <textarea id="aboutPara1" rows="4" placeholder="First paragraph about the business"></textarea>
              </div>
              <div class="editor-field">
                <label>Paragraph 2</label>
                <textarea id="aboutPara2" rows="4" placeholder="Second paragraph"></textarea>
              </div>
              <div class="editor-field">
                <label>Paragraph 3</label>
                <textarea id="aboutPara3" rows="4" placeholder="Third paragraph"></textarea>
              </div>
            </div>
            <div class="editor-card">
              <h3>About Image</h3>
              <div class="hero-image-preview" id="aboutImagePreview">
                <div class="hero-placeholder"><i class="fas fa-image"></i><p>No image set</p></div>
              </div>
              <div class="hero-image-actions">
                <button class="primary-btn" onclick="document.getElementById('aboutImageInput').click()">
                  <i class="fas fa-upload"></i> Upload Image
                </button>
                <input type="file" id="aboutImageInput" accept="image/*" hidden onchange="handleAboutImageUpload(this.files)">
              </div>
            </div>
          </div>`

const CP_HTML_TEAM = `<div class="section-header">
            <h2>Team Members</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('team')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              <button class="primary-btn" onclick="openTeamEditor()">
                <i class="fas fa-plus"></i><span>Add Team Member</span>
              </button>
            </div>
          </div>
          <p class="help-text">Drag the grip handle to reorder team members.</p>
          <div id="teamList" class="team-list"></div>`

const CP_HTML_PRICING = `<div class="section-header">
            <h2>Pricing & Packages</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('pricing')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              <button class="primary-btn" onclick="openPricingEditor()">
                <i class="fas fa-plus"></i><span>Add Package</span>
              </button>
            </div>
          </div>
          <p class="help-text">Drag the grip handle to reorder packages.</p>
          <div id="pricingList" class="pricing-list"></div>`

const CP_HTML_FAQ = `<div class="section-header">
            <h2>FAQ Items</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('faq')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              
            </div>
          </div>
          <div class="content-page-card" style="margin-bottom:1.25rem;">
            <h3><i class="fas fa-heading"></i> Section heading</h3>
            <p class="help-text">The heading and subheading that introduce your frequently asked questions on the home page.</p>
            <div class="editor-field">
              <label>Heading</label>
              <input type="text" id="faqTitle" placeholder="Frequently Asked Questions">
              <p class="help-text">Visitors see this as the big heading above your questions and answers.</p>
            </div>
            <div class="editor-field">
              <label>Subheading</label>
              <input type="text" id="faqSubtitle" placeholder="Questions & Answers">
              <p class="help-text">A smaller line of text that sits above the heading.</p>
            </div>
            
          </div>
          <p class="help-text">Drag the grip handle to reorder FAQ items.</p>
          <div id="faqList" class="faq-list"></div>`

const CP_HTML_BLOG = `<div class="section-header">
            <h2>Blog Posts</h2>
            <button class="primary-btn" onclick="openBlogEditor()">
              <i class="fas fa-plus"></i><span>New Post</span>
            </button>
          </div>
          <p class="help-text">Drag the grip handle to reorder posts.</p>
          <div id="blogList" class="blog-list"></div>`

const CP_HTML_CONTENT = `<div class="section-header">
            <h2><i class="fas fa-heading"></i> Page Headings</h2>
            <div class="section-header-actions">
              <button class="reset-btn" onclick="resetSection('content')">
                <i class="fas fa-undo"></i> Reset to Default
              </button>
              <button class="primary-btn" onclick="savePageContent()">
                <i class="fas fa-save"></i><span>Save Changes</span>
              </button>
            </div>
          </div>
          <p class="help-text">
            Change the <strong>banner</strong> (the big picture with text at the top) and the
            <strong>heading</strong> that introduces the main content on each page.
            Cards for pages you have switched off are hidden automatically.
            Click <strong>Save Changes</strong> when you are done.
          </p>

          <div class="content-pages">

            <div class="content-page-card" data-page="services">
              <h3><i class="fas fa-concierge-bell"></i> Services page</h3>
              <p class="help-text">This is the page linked from your menu as <strong>Services</strong>.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="servicesHeroTitle" placeholder="What We Bake">
                <p class="help-text">The big heading on the picture at the very top of your Services page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="servicesHeroSubtitle" placeholder="Short supporting line for the services page banner">
                <p class="help-text">A smaller line of text that sits under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="servicesHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('servicesHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('servicesHeroImage','servicesHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="servicesHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'servicesHeroImage', 'servicesHeroImagePreview')">
                </div>
                <div id="servicesHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline. Upload a new one or paste an image link.</p>
              </div>
              <div class="editor-field">
                <label>Services list heading</label>
                <input type="text" id="servicesPageTitle" placeholder="Our Services">
                <p class="help-text">The heading that introduces your list of services lower down the page.</p>
              </div>
              <div class="editor-field">
                <label>Services list description</label>
                <textarea id="servicesPageDesc" rows="2" placeholder="A short line under the heading"></textarea>
                <p class="help-text">One or two sentences under that heading, explaining what you offer.</p>
              </div>
              <div class="editor-field">
                <label>Call-to-action title</label>
                <input type="text" id="servicesCtaTitle" placeholder="Ready to Order?">
                <p class="help-text">The bold line in the "get in touch" box at the bottom of the Services page.</p>
              </div>
              <div class="editor-field">
                <label>Call-to-action text</label>
                <textarea id="servicesCtaText" rows="2" placeholder="Get in touch to discuss your order"></textarea>
                <p class="help-text">The sentence under that bold line, inviting people to contact you.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="portfolio">
              <h3><i class="fas fa-images"></i> Gallery page</h3>
              <p class="help-text">This is the page linked from your menu as <strong>Gallery</strong> (or Portfolio).</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="portfolioHeroTitle" placeholder="Fresh From Our Ovens">
                <p class="help-text">The big heading on the picture at the very top of your Gallery page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="portfolioHeroSubtitle" placeholder="A look at what we've been baking lately">
                <p class="help-text">A smaller line of text that sits under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="portfolioHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('portfolioHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('portfolioHeroImage','portfolioHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="portfolioHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'portfolioHeroImage', 'portfolioHeroImagePreview')">
                </div>
                <div id="portfolioHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline. Upload a new one or paste an image link.</p>
              </div>
              <div class="editor-field">
                <label>Gallery page heading</label>
                <input type="text" id="portfolioPageTitle" placeholder="Our Sweet Creations">
                <p class="help-text">The heading that introduces your photo gallery lower down the page.</p>
              </div>
              <div class="editor-field">
                <label>Gallery page description</label>
                <textarea id="portfolioPageDesc" rows="2" placeholder="Browse our portfolio"></textarea>
                <p class="help-text">One or two sentences under that heading, introducing your work.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="about">
              <h3><i class="fas fa-book-open"></i> About page</h3>
              <p class="help-text">This is the page linked from your menu as <strong>About</strong>.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="aboutHeroTitle" placeholder="Our Story">
                <p class="help-text">The big heading on the picture at the very top of your About page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="aboutHeroSubtitle" placeholder="Family recipes, local ingredients...">
                <p class="help-text">A smaller line of text that sits under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="aboutHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('aboutHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('aboutHeroImage','aboutHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="aboutHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'aboutHeroImage', 'aboutHeroImagePreview')">
                </div>
                <div id="aboutHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline. Upload a new one or paste an image link.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="contact">
              <h3><i class="fas fa-envelope"></i> Contact page</h3>
              <p class="help-text">This is the page linked from your menu as <strong>Contact</strong>. The contact form itself is always on and uses the phone, email and address you set in <strong>Settings</strong>.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="contactHeroTitle" placeholder="Get In Touch">
                <p class="help-text">The big heading on the picture at the very top of your Contact page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="contactHeroSubtitle" placeholder="Call us, visit our counter...">
                <p class="help-text">A smaller line of text that sits under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="contactHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('contactHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('contactHeroImage','contactHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="contactHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'contactHeroImage', 'contactHeroImagePreview')">
                </div>
                <div id="contactHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline. Upload a new one or paste an image link.</p>
              </div>
              <div class="editor-field">
                <label>Contact form heading</label>
                <input type="text" id="contactPageTitle" placeholder="Get In Touch">
                <p class="help-text">The heading that introduces the contact form and business hours.</p>
              </div>
              <div class="editor-field">
                <label>Contact form description</label>
                <textarea id="contactPageDesc" rows="2" placeholder="Tell us about your event"></textarea>
                <p class="help-text">One or two sentences under that heading, inviting people to get in touch.</p>
              </div>
            </div>
            <div class="content-page-card" data-page="blog">
              <h3><i class="fas fa-blog"></i> Blog page</h3>
              <p class="help-text">Banner at the top of the Blog page.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="blogHeroTitle" placeholder="Latest News">
                <p class="help-text">The big heading on the picture at the top of this page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="blogHeroSubtitle" placeholder="Tips, news and updates from us">
                <p class="help-text">A smaller line of text under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="blogHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('blogHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('blogHeroImage','blogHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="blogHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'blogHeroImage', 'blogHeroImagePreview')">
                </div>
                <div id="blogHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="team">
              <h3><i class="fas fa-users"></i> Team page</h3>
              <p class="help-text">Banner at the top of the Team page.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="teamHeroTitle" placeholder="Meet the Team">
                <p class="help-text">The big heading on the picture at the top of this page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="teamHeroSubtitle" placeholder="The people behind the work">
                <p class="help-text">A smaller line of text under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="teamHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('teamHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('teamHeroImage','teamHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="teamHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'teamHeroImage', 'teamHeroImagePreview')">
                </div>
                <div id="teamHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="faq">
              <h3><i class="fas fa-question-circle"></i> FAQ page</h3>
              <p class="help-text">Banner at the top of the FAQ page.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="faqHeroTitle" placeholder="Common Questions">
                <p class="help-text">The big heading on the picture at the top of this page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="faqHeroSubtitle" placeholder="Answers to questions we hear most">
                <p class="help-text">A smaller line of text under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="faqHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('faqHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('faqHeroImage','faqHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="faqHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'faqHeroImage', 'faqHeroImagePreview')">
                </div>
                <div id="faqHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="reviews">
              <h3><i class="fas fa-star"></i> Reviews page</h3>
              <p class="help-text">Banner at the top of the Reviews page.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="reviewsHeroTitle" placeholder="What People Say">
                <p class="help-text">The big heading on the picture at the top of this page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="reviewsHeroSubtitle" placeholder="Real feedback from real customers">
                <p class="help-text">A smaller line of text under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="reviewsHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('reviewsHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('reviewsHeroImage','reviewsHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="reviewsHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'reviewsHeroImage', 'reviewsHeroImagePreview')">
                </div>
                <div id="reviewsHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="areas">
              <h3><i class="fas fa-map-marker-alt"></i> Areas page</h3>
              <p class="help-text">Banner at the top of the Areas page.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="areasHeroTitle" placeholder="Areas We Serve">
                <p class="help-text">The big heading on the picture at the top of this page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="areasHeroSubtitle" placeholder="Towns and suburbs we cover">
                <p class="help-text">A smaller line of text under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="areasHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('areasHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('areasHeroImage','areasHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="areasHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'areasHeroImage', 'areasHeroImagePreview')">
                </div>
                <div id="areasHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline.</p>
              </div>
            </div>

            <div class="content-page-card" data-page="privacy">
              <h3><i class="fas fa-shield-alt"></i> Privacy page</h3>
              <p class="help-text">Banner at the top of the Privacy page.</p>
              <div class="editor-field">
                <label>Banner headline</label>
                <input type="text" id="privacyHeroTitle" placeholder="Privacy Policy">
                <p class="help-text">The big heading on the picture at the top of this page.</p>
              </div>
              <div class="editor-field">
                <label>Banner subheading</label>
                <input type="text" id="privacyHeroSubtitle" placeholder="How we handle your information">
                <p class="help-text">A smaller line of text under the banner headline.</p>
              </div>
              <div class="editor-field">
                <label>Banner image</label>
                <input type="url" id="privacyHeroImage" placeholder="https://...">
                <div class="image-url-actions">
                  <button type="button" class="secondary-btn" onclick="document.getElementById('privacyHeroImageFile').click()"><i class="fas fa-upload"></i> Upload image</button>
                  <button type="button" class="danger-btn" onclick="clearImageField('privacyHeroImage','privacyHeroImagePreview')"><i class="fas fa-trash"></i> Remove</button>
                  <input type="file" id="privacyHeroImageFile" accept="image/*" hidden onchange="uploadImageToField(this.files, 'privacyHeroImage', 'privacyHeroImagePreview')">
                </div>
                <div id="privacyHeroImagePreview" class="image-url-preview"></div>
                <p class="help-text">The wide picture behind the banner headline.</p>
              </div>
            </div>


            <div class="content-page-card">
              <h3><i class="fas fa-video"></i> Videos</h3>
              <div class="editor-field">
                <label>Video links (one per line)</label>
                <textarea id="videoUrls" rows="4" placeholder="https://www.youtube.com/watch?v=..."></textarea>
                <p class="help-text">Paste a YouTube or Vimeo link on each line. Leave this empty to hide videos from the home page.</p>
              </div>
            </div>

          </div>

          <div class="section-header-actions" style="margin-top:1.25rem;justify-content:flex-end;">
            <button class="primary-btn" onclick="savePageContent()">
              <i class="fas fa-save"></i><span>Save Changes</span>
            </button>
          </div>`

const CP_EDITOR_HTML = {
  'hero': CP_HTML_HERO,
  'services': CP_HTML_SERVICES,
  'gallery': CP_HTML_GALLERY,
  'testimonials': CP_HTML_TESTIMONIALS,
  'about': CP_HTML_ABOUT,
  'team': CP_HTML_TEAM,
  'pricing': CP_HTML_PRICING,
  'faq': CP_HTML_FAQ,
  'blogStrip': CP_HTML_BLOG,
  'blog': CP_HTML_BLOG,
  'content': CP_HTML_CONTENT,
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cpGetNav() {
  return (siteConfig && siteConfig.navPages) || {}
}

function cpIsPageOn(pageId) {
  const nav = cpGetNav()
  if (nav[pageId] !== undefined) return nav[pageId] !== false
  const c = siteConfig && siteConfig.controls && siteConfig.controls.pages
  if (c && typeof c[pageId] === 'boolean') return c[pageId]
  return ['home', 'services', 'portfolio', 'about', 'contact'].includes(pageId)
}

function cpGetMenuLabel(pageId) {
  const page = CP_PAGES.find((p) => p.id === pageId)
  const nav = cpGetNav()
  if (nav[pageId + '_label']) return nav[pageId + '_label']
  const n = siteConfig && siteConfig.navigation
  if (n && n[pageId]) return n[pageId]
  return (page && page.label) || pageId
}

function cpGetPageSections(pageId) {
  const config = siteConfig || {}
  const map = config.pageSections || {}
  let list

  if (Array.isArray(map[pageId]) && map[pageId].length > 0) {
    list = map[pageId].map((s) =>
      typeof s === 'string' ? { id: s, enabled: true } : { id: s.id, enabled: s.enabled !== false }
    )
  } else {
    const def = CP_DEFAULTS[pageId] || ['hero', 'cta', 'contact']
    list = CP_SECTIONS.map((s) => ({ id: s.id, enabled: def.includes(s.id) }))
  }

  const enabled = list.filter((s) => s.enabled)
  const disabled = list.filter((s) => !s.enabled)

  // Hero always first
  const heroIdx = enabled.findIndex((s) => s.id === 'hero')
  if (heroIdx > 0) {
    const hero = enabled.splice(heroIdx, 1)[0]
    enabled.unshift(hero)
  }

  // Pin page-specific section after Hero
  const pageDef = CP_PAGES.find((p) => p.id === pageId)
  if (pageDef && pageDef.lockedFirst && pageDef.lockedFirst !== 'hero') {
    const pIdx = enabled.findIndex((s) => s.id === pageDef.lockedFirst)
    if (pIdx > 1) {
      const pinned = enabled.splice(pIdx, 1)[0]
      enabled.splice(1, 0, pinned)
    }
  }

  return enabled.concat(disabled)
}

function cpSetPageSections(pageId, sections) {
  if (!siteConfig) siteConfig = {}
  if (!siteConfig.pageSections) siteConfig.pageSections = {}
  siteConfig.pageSections[pageId] = sections.map((s) => ({
    id: s.id,
    enabled: s.enabled !== false,
    mode: s.mode || 'linked',
  }))
}

function cpGetSectionMode(pageId, sectionId) {
  if (sectionId === 'hero') return 'independent'
  const config = siteConfig || {}
  const map = config.pageSections || {}
  const list = map[pageId] || []
  const entry = list.find((s) => (typeof s === 'string' ? s === sectionId : s.id === sectionId))
  if (entry && typeof entry === 'object' && entry.mode) return entry.mode
  return pageId === 'home' ? 'independent' : 'linked'
}

function cpSetSectionMode(pageId, sectionId, mode) {
  if (!siteConfig) siteConfig = {}
  if (!siteConfig.pageSections) siteConfig.pageSections = {}
  if (!Array.isArray(siteConfig.pageSections[pageId])) return
  const list = siteConfig.pageSections[pageId]
  const entry = list.find((s) => (typeof s === 'string' ? s === sectionId : s.id === sectionId))
  if (entry) {
    if (typeof entry === 'string') {
      const idx = list.indexOf(entry)
      list[idx] = { id: entry, enabled: true, mode }
    } else {
      entry.mode = mode
    }
  }
}

// ── Editor rendering (NO DOM borrowing) ────────────────────────────────────

function cpRenderEditorHtml(sectionId) {
  // Modal-based list editors (Phase 3)
  if (typeof CP_LIST_SECTIONS !== 'undefined' && CP_LIST_SECTIONS[sectionId]) {
    return cpRenderListEditor(sectionId)
  }
  // Type A: schema-driven
  if (typeof isSectionEditor === 'function' && isSectionEditor(sectionId)) {
    return renderFeatureCardBody(sectionId)
  }
  // Type B: custom HTML
  return CP_EDITOR_HTML[sectionId] || '<p class="help-text">No editor available.</p>'
}

function cpPostInitEditor(sectionId) {
  // Type A: hydrate + render into Fields container if present
  if (typeof isSectionEditor === 'function' && isSectionEditor(sectionId)) {
    try {
      if (typeof harvestSectionEditors === 'function') harvestSectionEditors()
      if (typeof hydrateSectionView === 'function') hydrateSectionView(sectionId)
      if (typeof renderSectionFields === 'function') renderSectionFields(sectionId)
    } catch (e) { console.warn('hydrate', e) }
    return
  }

  // Per-page hero: hydrate from pageHeroes
  if (sectionId === 'hero') {
    try {
      const pgHero = siteConfig?.pageHeroes?.[cpCurrentPage]
      const baseHero = siteConfig?.hero || {}
      const h = pgHero || baseHero
      const el = (id) => document.getElementById(id)
      if (el('heroHeadline')) el('heroHeadline').value = h.headline || ''
      if (el('heroSubheadline')) el('heroSubheadline').value = h.subheadline || ''
      if (el('heroBadge')) el('heroBadge').value = h.badge || ''
      if (el('heroCta')) el('heroCta').value = h.ctaText || ''
      if (el('heroCtaLink')) el('heroCtaLink').value = h.ctaLink || '#contact'
      const preview = el('heroImagePreview')
      if (preview && h.heroImageUrl) {
        preview.innerHTML = '<img src="' + h.heroImageUrl + '" alt="Hero" style="width:100%;height:100%;object-fit:cover">'
      }
    } catch (e) { console.warn('hero hydrate', e) }
    return
  }

  // Type B loaders
  try {
    if (sectionId === 'services' && typeof loadServices === 'function') loadServices()
    if (sectionId === 'gallery') {
      if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
      if (typeof loadGallerySettings === 'function') loadGallerySettings()
    }
    if (sectionId === 'testimonials' && typeof loadTestimonials === 'function') loadTestimonials()
    if (sectionId === 'about' && typeof loadAboutContent === 'function') loadAboutContent()
    if (sectionId === 'team' && typeof loadTeam === 'function') loadTeam()
    if (sectionId === 'pricing' && typeof loadPricing === 'function') loadPricing()
    if (sectionId === 'faq' && typeof loadFaq === 'function') loadFaq()
    if (sectionId === 'blogStrip' && typeof loadBlogPosts === 'function') loadBlogPosts()
    if (sectionId === 'content' && typeof loadPageContent === 'function') loadPageContent()
    if (sectionId === 'vsl' && typeof renderVslFields === 'function') renderVslFields()
  } catch (e) { console.warn('load fn', e) }
}

function cpSaveEditorData(sectionId) {
  try {
    if (typeof isSectionEditor === 'function' && isSectionEditor(sectionId)) {
      if (typeof writeFeatureFieldsFromDom === 'function') writeFeatureFieldsFromDom(sectionId)
      if (typeof applySectionView === 'function') applySectionView(sectionId)
    } else {
      if (sectionId === 'hero' && typeof applyHeroFields === 'function') applyHeroFields()
      if (sectionId === 'about' && typeof applyAboutFields === 'function') applyAboutFields()
      if (sectionId === 'content' && typeof applyPageContentFields === 'function') applyPageContentFields()
      if (sectionId === 'gallery') {
        const t = document.getElementById('galleryTitle')
        const st = document.getElementById('gallerySubtitle')
        if (t && siteConfig) {
          if (!siteConfig.pageContent) siteConfig.pageContent = {}
          siteConfig.pageContent.galleryTitle = t.value
          siteConfig.pageContent.gallerySubtitle = st ? st.value : ''
        }
      }
    }

    // Per-page hero save
    if (sectionId === 'hero') {
      if (!siteConfig) siteConfig = {}
      if (!siteConfig.pageHeroes) siteConfig.pageHeroes = {}
      siteConfig.pageHeroes[cpCurrentPage] = {
        headline: (document.getElementById('heroHeadline') || {}).value || '',
        subheadline: (document.getElementById('heroSubheadline') || {}).value || '',
        badge: (document.getElementById('heroBadge') || {}).value || '',
        ctaText: (document.getElementById('heroCta') || {}).value || '',
        ctaLink: (document.getElementById('heroCtaLink') || {}).value || '#contact',
        heroImageUrl: siteConfig.hero?.heroImageUrl || '',
      }
    }

    // Content independence
    const mode = cpGetSectionMode(cpCurrentPage, sectionId)
    if (mode === 'independent' && sectionId !== 'hero') {
      if (!siteConfig.pageContentOverrides) siteConfig.pageContentOverrides = {}
      if (!siteConfig.pageContentOverrides[cpCurrentPage]) siteConfig.pageContentOverrides[cpCurrentPage] = {}
      siteConfig.pageContentOverrides[cpCurrentPage][sectionId] = JSON.parse(JSON.stringify(
        siteConfig[sectionId] || siteConfig.pageContent?.[sectionId] || {}
      ))
    }
  } catch (e) { console.warn('save editor', e) }
}

function cpSaveAndClose(sectionId) {
  cpSaveEditorData(sectionId)
  saveSiteConfig().then((ok) => { if (ok) showToast('Saved!') })
  cpOpenEditorId = null
  renderCPSectionList()
}

// ── Service sub-pages ──────────────────────────────────────────────────────

function cpGetSubmenuMode() {
  return (siteConfig && siteConfig.serviceSubpages && siteConfig.serviceSubpages.mode) || 'existing'
}

function cpIsSubmenuOn() {
  return !!(siteConfig && siteConfig.servicesSubmenu && siteConfig.servicesSubmenu.enabled)
}

function renderSubmenuNameFields() {
  const config = siteConfig || {}
  const items = (config.serviceSubpages && config.serviceSubpages.items) || (config.servicesSubmenu && config.servicesSubmenu.items) || []
  if (items.length === 0) {
    return '<p class="help-text" style="color:#64748b">No sub-menu items yet. Services from your Services section will appear here once loaded.</p>'
  }
  return items.map((item, i) =>
    '<div class="nav-submenu-row" data-index="' + i + '">' +
    '<div class="nav-drag-sm" draggable="true">⠿</div>' +
    '<input type="text" class="nav-submenu-name" data-index="' + i + '" value="' + String(item.label || '').replace(/"/g, '&quot;') + '" placeholder="Menu label">' +
    '<input type="text" class="nav-submenu-slug" data-index="' + i + '" value="' + String(item.slug || '').replace(/"/g, '&quot;') + '" placeholder="/services/item">' +
    '<label class="cp-toggle-sm"><input type="checkbox" class="nav-submenu-check" data-index="' + i + '" ' + (item.enabled !== false ? 'checked' : '') + '><span class="cp-switch"></span></label>' +
    '</div>'
  ).join('')
}

function renderSubpageEditor(host) {
  const slug = cpCurrentPage.replace('subpage:', '')
  const sp = siteConfig && siteConfig.serviceSubpages
  const item = sp && Array.isArray(sp.items) ? sp.items.find((i) => i.slug === slug || i.label === slug) : null
  if (!item) {
    host.innerHTML = '<p class="help-text">Service sub-page not found.</p>'
    return
  }

  const mode = item.mode || 'linked'
  const isLinked = mode === 'linked'
  host.innerHTML =
    '<div class="cp-card on open">' +
    '<div class="cp-row"><div class="cp-label"><span class="cp-name">' + (item.label || item.slug) + '</span><span class="cp-badge sub">service page</span></div></div>' +
    '<div class="cp-accordion" style="display:block"><div class="cp-accordion-body">' +
    '<div class="cp-content-mode" style="margin-bottom:16px">' +
    '<h4>Content source</h4>' +
    '<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#94a3b8"><input type="radio" name="subpageMode" value="linked" ' + (isLinked ? 'checked' : '') + '> Same as Services section (shared content)</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#94a3b8"><input type="radio" name="subpageMode" value="independent" ' + (!isLinked ? 'checked' : '') + '> Own content (edit independently)</label>' +
    '</div>' +
    '<div class="editor-grid">' +
    '<div class="editor-card"><div class="editor-field"><label>Page Heading</label><input type="text" id="subpageHeadline" value="' + String(item.headline || item.label || '').replace(/"/g, '&quot;') + '"' + (isLinked ? ' disabled style="opacity:0.5"' : '') + '></div>' +
    '<div class="editor-field"><label>Subheading</label><textarea id="subpageSubheadline" rows="2"' + (isLinked ? ' disabled style="opacity:0.5"' : '') + '>' + String(item.subheadline || '').replace(/</g, '&lt;') + '</textarea></div></div>' +
    '<div class="editor-card"><div class="editor-field"><label>Hero Image URL</label><input type="text" id="subpageImage" value="' + String(item.image || item.heroImageUrl || '').replace(/"/g, '&quot;') + '" placeholder="https://..."' + (isLinked ? ' disabled style="opacity:0.5"' : '') + '></div>' +
    '<div class="editor-field"><label>Menu Label</label><input type="text" id="subpageLabel" value="' + String(item.label || '').replace(/"/g, '&quot;') + '"' + (isLinked ? ' disabled style="opacity:0.5"' : '') + '></div></div>' +
    '</div>' +
    '<div class="editor-card" style="margin-top:12px"><div class="editor-field"><label>Page Content (paragraphs, one per line)</label><textarea id="subpageContent" rows="8"' + (isLinked ? ' disabled style="opacity:0.5"' : '') + '>' + String(item.content || item.description || '').replace(/</g, '&lt;') + '</textarea></div></div>' +
    '<div class="cp-editor-save" style="margin-top:16px">' +
    '<button type="button" class="primary-btn" onclick="cpSaveSubpageContent()"><i class="fas fa-save"></i> Save</button>' +
    '</div>' +
    '</div></div></div>'

  // Wire mode radios
  document.querySelectorAll('input[name="subpageMode"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      const sp2 = siteConfig && siteConfig.serviceSubpages
      const it = sp2 && Array.isArray(sp2.items) ? sp2.items.find((x) => x.slug === slug || x.label === slug) : null
      if (it) it.mode = e.target.value
      const linked = e.target.value === 'linked'
      ;['subpageHeadline', 'subpageSubheadline', 'subpageImage', 'subpageLabel', 'subpageContent'].forEach((id) => {
        const el = document.getElementById(id)
        if (el) { el.disabled = linked; el.style.opacity = linked ? '0.5' : '1' }
      })
      markDirty()
    })
  })
}

function cpHarvestSubpageFields() {
  if (!cpCurrentPage || !cpCurrentPage.startsWith('subpage:')) return
  const slug = cpCurrentPage.replace('subpage:', '')
  const sp = siteConfig && siteConfig.serviceSubpages
  const item = sp && Array.isArray(sp.items) ? sp.items.find((i) => i.slug === slug || i.label === slug) : null
  if (!item) return
  const el = (id) => document.getElementById(id)
  if (el('subpageHeadline')) item.headline = el('subpageHeadline').value || item.headline
  if (el('subpageSubheadline')) item.subheadline = el('subpageSubheadline').value || item.subheadline
  if (el('subpageImage')) item.image = el('subpageImage').value || item.image
  if (el('subpageLabel')) item.label = el('subpageLabel').value || item.label
  if (el('subpageContent')) item.content = el('subpageContent').value || item.content
  const modeRadio = document.querySelector('input[name="subpageMode"]:checked')
  if (modeRadio) item.mode = modeRadio.value
}

function cpSaveSubpageContent() {
  cpHarvestSubpageFields()
  saveSiteConfig().then((ok) => { if (ok) showToast('Service page saved!') })
}

function navAddSubmenuItem() {
  if (!siteConfig) siteConfig = {}
  if (!siteConfig.serviceSubpages) siteConfig.serviceSubpages = { enabled: true, mode: 'existing', items: [] }
  if (!Array.isArray(siteConfig.serviceSubpages.items)) siteConfig.serviceSubpages.items = []
  siteConfig.serviceSubpages.items.push({ label: 'New Item', slug: '/services/item-' + (siteConfig.serviceSubpages.items.length + 1), enabled: true })
  renderNavList()
  markDirty()
}

function wireSubmenuNameFields() {
  document.querySelectorAll('.nav-submenu-name').forEach((input) => {
    input.addEventListener('change', (e) => {
      const i = parseInt(e.target.dataset.index)
      const sp = siteConfig?.serviceSubpages
      if (sp && sp.items && sp.items[i]) {
        sp.items[i].label = e.target.value.trim()
        markDirty()
      }
    })
  })
  document.querySelectorAll('.nav-submenu-check').forEach((input) => {
    input.addEventListener('change', (e) => {
      const i = parseInt(e.target.dataset.index)
      const sp = siteConfig?.serviceSubpages
      if (sp && sp.items && sp.items[i]) {
        sp.items[i].enabled = e.target.checked
        markDirty()
      }
    })
  })
}

// ── CONTENT & PAGES ────────────────────────────────────────────────────────

function initContentMaster() {
  renderCPDropdown()
  renderCPPageMeta()
  renderCPSectionList()
  wireCPPageMeta()
}

function renderCPDropdown() {
  const sel = document.getElementById('cpPageSelect')
  if (!sel) return
  const pages = CP_PAGES.filter((p) => cpIsPageOn(p.id))
  const sp = siteConfig && siteConfig.serviceSubpages
  const subItems = (sp && sp.enabled && Array.isArray(sp.items)) ? sp.items.filter((i) => i && (i.slug || i.label)) : []
  const subOptions = subItems.map((s) => '<option value="subpage:' + (s.slug || s.label) + '">Service — ' + (s.label || s.slug) + '</option>').join('')
  sel.innerHTML = pages.map((p) => '<option value="' + p.id + '">' + p.label + '</option>').join('') + (subOptions ? '<optgroup label="Service Sub-Pages">' + subOptions + '</optgroup>' : '')
  if (pages.find((p) => p.id === cpCurrentPage) || cpCurrentPage.startsWith('subpage:')) {
    sel.value = cpCurrentPage
  } else if (pages.length > 0) {
    cpCurrentPage = pages[0].id
    sel.value = cpCurrentPage
  }
}

function renderCPPageMeta() {
  const meta = document.getElementById('cpPageMeta')
  if (!meta) return
  const label = cpGetMenuLabel(cpCurrentPage)
  meta.innerHTML =
    '<div class="cp-meta-item">' +
    '<span class="cp-meta-label">Menu name</span>' +
    '<input type="text" class="cp-meta-input" value="' + String(label).replace(/"/g, '&quot;') + '" readonly>' +
    '<span class="cp-meta-hint">Rename in Navigation</span>' +
    '</div>'
}

function renderCPSectionList() {
  const host = document.getElementById('cpSections')
  if (!host) return

  // Close any open editor
  if (cpOpenEditorId) {
    cpSaveEditorData(cpOpenEditorId)
    cpOpenEditorId = null
  }

  // Service sub-pages get a content editor
  if (cpCurrentPage && cpCurrentPage.startsWith('subpage:')) {
    renderSubpageEditor(host)
    return
  }

  const sections = cpGetPageSections(cpCurrentPage)
  const pageDef = CP_PAGES.find((p) => p.id === cpCurrentPage)
  const lockedFirst = pageDef && pageDef.lockedFirst

  host.innerHTML = sections
    .map((s, i) => {
      const lib = CP_SECTIONS.find((l) => l.id === s.id) || { label: s.id }
      // Edit is always enabled when we have an editor (Type A or Type B)
      const hasEditor = !!(lib.id && (CP_EDITOR_HTML[s.id] || (typeof isSectionEditor === 'function' && isSectionEditor(s.id))))
      const isFirst = lockedFirst && s.id === lockedFirst
      const mode = cpGetSectionMode(cpCurrentPage, s.id)
      const showMode = cpCurrentPage !== 'home' && s.enabled && s.id !== 'hero'

      return (
        '<div class="cp-card' + (s.enabled ? ' on' : '') + (isFirst ? ' pinned' : '') + '" data-id="' + s.id + '" data-index="' + i + '">' +
        '<div class="cp-row">' +
        (isFirst ? '<div class="cp-drag pinned-icon" title="Always first on this page">📌</div>' : '<div class="cp-drag" draggable="true" title="Drag to reorder">⠿</div>') +
        '<label class="cp-toggle">' +
        '<input type="checkbox" class="cp-check" data-id="' + s.id + '" ' + (s.enabled ? 'checked' : '') + ' ' + (lib.locked ? 'disabled' : '') + '>' +
        '<span class="cp-switch"></span>' +
        '</label>' +
        '<div class="cp-label">' +
        '<span class="cp-name">' + lib.label + '</span>' +
        (lib.locked ? '<span class="cp-badge">locked</span>' : '') +
        (isFirst ? '<span class="cp-badge pin">first</span>' : '') +
        (lib.hasSubmenu ? '<span class="cp-badge sub">sub-menus</span>' : '') +
        '</div>' +
        (showMode ?
          '<select class="cp-mode-select" data-id="' + s.id + '">' +
          '<option value="linked"' + (mode === 'linked' ? ' selected' : '') + '>Same as Homepage</option>' +
          '<option value="independent"' + (mode === 'independent' ? ' selected' : '') + '>Own content</option>' +
          '</select>' : '') +
        '<button type="button" class="cp-edit-btn" data-id="' + s.id + '" ' + (hasEditor ? '' : 'disabled') + '>' +
        '<i class="fas fa-pen"></i> Edit' +
        '</button>' +
        '</div>' +
        '<div class="cp-accordion" data-acc="' + s.id + '" style="display:none">' +
        '<div class="cp-accordion-body" id="cpAcc_' + s.id + '"></div>' +
        '</div>' +
        '</div>'
      )
    })
    .join('')

  // Wire toggles
  host.querySelectorAll('.cp-check').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id
      const list = cpGetPageSections(cpCurrentPage)
      const entry = list.find((s) => s.id === id)
      if (entry) entry.enabled = e.target.checked
      cpSetPageSections(cpCurrentPage, list)
      if (!siteConfig.controls) siteConfig.controls = {}
      if (!siteConfig.controls.sections) siteConfig.controls.sections = {}
      siteConfig.controls.sections[id] = e.target.checked
      markDirty()
      renderCPSectionList()
    })
  })

  // Wire mode selects
  host.querySelectorAll('.cp-mode-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      cpSetSectionMode(cpCurrentPage, e.target.dataset.id, e.target.value)
      markDirty()
    })
  })

  // Wire edit buttons (accordion toggle — RENDER DIRECTLY)
  host.querySelectorAll('.cp-edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id
      if (cpOpenEditorId === id) {
        // Close
        cpSaveEditorData(id)
        cpOpenEditorId = null
        renderCPSectionList()
        return
      }
      // Save previous
      if (cpOpenEditorId) cpSaveEditorData(cpOpenEditorId)
      cpOpenEditorId = id
      renderCPSectionList()
      // Open this one — render editor directly
      const card = host.querySelector('.cp-card[data-id="' + id + '"]')
      if (card) {
        card.classList.add('open')
        cpScrollToCard(card)  // Auto-scroll to card top
        const acc = card.querySelector('.cp-accordion')
        const body = card.querySelector('.cp-accordion-body')
        if (acc && body) {
          acc.style.display = 'block'
          // Render editor HTML directly into accordion body
          body.innerHTML = cpRenderEditorHtml(id)
          // Wire event delegation for Type A editors
          body.addEventListener('click', onFeaturesGridClick)
          body.addEventListener('input', onFeaturesGridChange)
          body.addEventListener('change', (ev) => {
            onFeaturesGridChange(ev)
            if (typeof onFeaturesGridFileChange === 'function') onFeaturesGridFileChange(ev)
          })
          // Post-init (hydrate + load)
          cpPostInitEditor(id)
          if (typeof CP_LIST_SECTIONS !== 'undefined' && CP_LIST_SECTIONS[id]) { cpWireListDrag(id) }
        }
      }
    })
  })

  // Wire drag
  host.querySelectorAll('.cp-drag[draggable]').forEach((handle) => {
    const row = handle.closest('.cp-card')
    handle.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', row.dataset.index)
      row.classList.add('dragging')
    })
    handle.addEventListener('dragend', () => row.classList.remove('dragging'))
    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('drag-over') })
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'))
    row.addEventListener('drop', (e) => {
      e.preventDefault()
      row.classList.remove('drag-over')
      const from = parseInt(e.dataTransfer.getData('text/plain'))
      const to = parseInt(row.dataset.index)
      if (from === to) return
      const list = cpGetPageSections(cpCurrentPage)
      const moved = list.splice(from, 1)[0]
      list.splice(to, 0, moved)
      cpSetPageSections(cpCurrentPage, list)
      if (!siteConfig.controls) siteConfig.controls = {}
      siteConfig.controls.sectionOrder = list.filter((s) => s.enabled).map((s) => s.id)
      renderCPSectionList()
      markDirty()
    })
  })
}

function wireCPPageMeta() {
  const sel = document.getElementById('cpPageSelect')
  if (sel) {
    sel.addEventListener('change', (e) => {
      cpCurrentPage = e.target.value
      cpOpenEditorId = null
      renderCPPageMeta()
      renderCPSectionList()
    })
  }
}

// ── NAVIGATION ─────────────────────────────────────────────────────────────

function initNavigationEditor() {
  // Auto-populate from services if mode is 'existing' and items is empty
  if (siteConfig && siteConfig.serviceSubpages && siteConfig.serviceSubpages.mode !== 'new') {
    const sp = siteConfig.serviceSubpages
    if (!Array.isArray(sp.items) || sp.items.length === 0) {
      const services = siteConfig.services || []
      if (services.length > 0) {
        sp.items = services.map((s) => ({
          slug: (s.title || s.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          label: s.title || s.name || '',
          headline: s.title || s.name || '',
          subheadline: s.description || '',
          content: s.description || '',
          image: s.imageUrl || s.image || '',
          enabled: true,
        }))
      }
    }
  }
  renderNavList()
}

function renderNavList() {
  const host = document.getElementById('navigationEditorContainer')
  if (!host) return

  const onPages = CP_PAGES.filter((p) => cpIsPageOn(p.id))
  const offPages = CP_PAGES.filter((p) => !cpIsPageOn(p.id))
  const ordered = onPages.concat(offPages)

  host.innerHTML =
    '<div class="nav-editor">' +
    '<p class="help-text">Turn pages on/off and drag to reorder the website menu. Page ON = menu button appears. Rename the menu label here.</p>' +
    '<div class="nav-editor-list" id="navEditorList">' +
    ordered.map((p, i) => {
      const on = cpIsPageOn(p.id)
      return (
        '<div class="nav-row' + (on ? ' on' : '') + '" data-id="' + p.id + '" data-index="' + i + '">' +
        '<div class="nav-drag" draggable="true">⠿</div>' +
        '<label class="cp-toggle">' +
        '<input type="checkbox" class="nav-check" data-id="' + p.id + '" ' + (on ? 'checked' : '') + ' ' + (p.locked ? 'disabled' : '') + '>' +
        '<span class="cp-switch"></span>' +
        '</label>' +
        '<div class="nav-label-wrap">' +
        '<input type="text" class="nav-label-input" data-id="' + p.id + '" value="' + String(cpGetMenuLabel(p.id)).replace(/"/g, '&quot;') + '" placeholder="' + p.label + '">' +
        '<span class="nav-canonical">' + p.label + '</span>' +
        '</div>' +
        (p.locked ? '<span class="cp-badge">locked</span>' : '') +
        '</div>'
      )
    }).join('') +
    '</div>' +

    // Services sub-pages
    '<div class="nav-submenu-block">' +
    '<h3>Services Sub-Pages</h3>' +
    '<p class="help-text">Each service gets its own page under /services/. Hover Services in the menu to see them.</p>' +
    '<label class="cp-toggle-row">' +
    '<label class="cp-toggle"><input type="checkbox" id="navSubmenuToggle" ' + (cpIsSubmenuOn() ? 'checked' : '') + '><span class="cp-switch"></span></label>' +
    '<span class="cp-toggle-label">Enable Services sub-pages</span>' +
    '</label>' +
    '<div id="navSubmenuItems" style="display:' + (cpIsSubmenuOn() ? 'block' : 'none') + '">' +
    '<div class="cp-submenu-mode" style="margin:12px 0;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px">' +
    '<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;color:#94a3b8;cursor:pointer">' +
    '<input type="radio" name="navSubMode" value="existing" ' + (cpGetSubmenuMode() !== 'new' ? 'checked' : '') + '> Same as Current Services (auto-create from your services list)' +
    '</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#94a3b8;cursor:pointer">' +
    '<input type="radio" name="navSubMode" value="new" ' + (cpGetSubmenuMode() === 'new' ? 'checked' : '') + '> New Content (build sub-pages from scratch)' +
    '</label>' +
    '</div>' +
    renderSubmenuNameFields() +
    '<button type="button" class="secondary-btn" onclick="navAddSubmenuItem()">+ Add service sub-page</button>' +
    '</div>' +
    '</div>' +
    '</div>'

  // Wire page toggles
  host.querySelectorAll('.nav-check').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id
      if (!siteConfig) siteConfig = {}
      if (!siteConfig.navPages) siteConfig.navPages = {}
      siteConfig.navPages[id] = e.target.checked
      if (!siteConfig.controls) siteConfig.controls = {}
      if (!siteConfig.controls.pages) siteConfig.controls.pages = {}
      siteConfig.controls.pages[id] = e.target.checked
      e.target.closest('.nav-row').classList.toggle('on', e.target.checked)
      markDirty()
    })
  })

  // Wire rename
  host.querySelectorAll('.nav-label-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id
      if (!siteConfig) siteConfig = {}
      if (!siteConfig.navPages) siteConfig.navPages = {}
      siteConfig.navPages[id + '_label'] = e.target.value.trim()
      if (!siteConfig.navigation) siteConfig.navigation = {}
      siteConfig.navigation[id] = e.target.value.trim()
      markDirty()
    })
  })

  // Wire page drag
  host.querySelectorAll('.nav-drag').forEach((handle) => {
    const row = handle.closest('.nav-row')
    handle.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', row.dataset.index)
      row.classList.add('dragging')
    })
    handle.addEventListener('dragend', () => row.classList.remove('dragging'))
    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('drag-over') })
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'))
    row.addEventListener('drop', (e) => {
      e.preventDefault()
      row.classList.remove('drag-over')
      const from = parseInt(e.dataTransfer.getData('text/plain'))
      const to = parseInt(row.dataset.index)
      if (from === to) return
      const all = Array.from(document.querySelectorAll('.nav-row'))
      const ids = all.map((r) => r.dataset.id)
      const moved = ids.splice(from, 1)[0]
      ids.splice(to, 0, moved)
      if (!siteConfig.navPages) siteConfig.navPages = {}
      siteConfig.navPages._order = ids
      renderNavList()
      markDirty()
    })
  })

  // Wire sub-menu toggle
  const subToggle = document.getElementById('navSubmenuToggle')
  if (subToggle) {
    subToggle.addEventListener('change', (e) => {
      if (!siteConfig) siteConfig = {}
      if (!siteConfig.serviceSubpages) siteConfig.serviceSubpages = { enabled: true, mode: 'existing', items: [] }
      siteConfig.serviceSubpages.enabled = e.target.checked
      if (!siteConfig.servicesSubmenu) siteConfig.servicesSubmenu = {}
      siteConfig.servicesSubmenu.enabled = e.target.checked
      const items = document.getElementById('navSubmenuItems')
      if (items) items.style.display = e.target.checked ? 'block' : 'none'
      markDirty()
    })
  }

  // Wire sub-mode radios
  document.querySelectorAll('input[name="navSubMode"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      if (!siteConfig) siteConfig = {}
      if (!siteConfig.serviceSubpages) siteConfig.serviceSubpages = { enabled: true, mode: 'existing', items: [] }
      siteConfig.serviceSubpages.mode = e.target.value
      if (e.target.value === 'new') {
        siteConfig.serviceSubpages.items = []
      } else {
        const services = siteConfig.services || []
        siteConfig.serviceSubpages.items = services.map((s) => ({
          slug: (s.title || s.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          label: s.title || s.name || '',
          headline: s.title || s.name || '',
          subheadline: s.description || '',
          content: s.description || '',
          image: s.imageUrl || s.image || '',
          enabled: true,
        }))
      }
      renderNavList()
      markDirty()
    })
  })

  // Wire sub-menu name fields
  wireSubmenuNameFields()
}

// ── Init ───────────────────────────────────────────────────────────────────

function initDashboardUnified() {
  initContentMaster()
  initNavigationEditor()
}

if (typeof window.__initDashboardExtras === 'function') {
  const prev = window.__initDashboardExtras
  window.__initDashboardExtras = function () {
    try { prev() } catch (e) { console.warn('prev init', e) }
    try { initDashboardUnified() } catch (e) { console.warn('unified init', e) }
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const iv = setInterval(() => {
      if (typeof siteConfig !== 'undefined' && siteConfig && Object.keys(siteConfig).length > 0) {
        clearInterval(iv)
        initDashboardUnified()
      }
    }, 200)
    setTimeout(() => { clearInterval(iv); initDashboardUnified() }, 3000)
  })
}

// Re-render when tabs are opened
(function () {
  function patchSwitchSection() {
    if (typeof switchSection !== 'function' && typeof window.switchSection !== 'function') return false
    const orig = typeof switchSection === 'function' ? switchSection : window.switchSection
    function patchedSwitch(section) {
      orig.call(this, section)
      if (section === 'contentMaster') {
        try { renderCPDropdown(); renderCPPageMeta(); renderCPSectionList() } catch (e) { console.warn('re-render CP', e) }
      }
      if (section === 'navigation') {
        try { renderNavList() } catch (e) { console.warn('re-render nav', e) }
      }
    }
    window.switchSection = patchedSwitch
    try { switchSection = patchedSwitch } catch (e) { /* binding may be read-only */ }
    return true
  }
  if (!patchSwitchSection()) {
    const iv = setInterval(() => {
      if (patchSwitchSection()) clearInterval(iv)
    }, 300)
    setTimeout(() => clearInterval(iv), 5000)
  }
})()



// ── Gallery UX: Add Folder modal + Folder Detail ──────────────────────────

var cpGalleryCurrentFolder = null
var cpGallerySelectedImages = []
var cpAddFolderPhotos = []
var cpAddFolderThumbUrl = ''

function openAddFolderModal() {
  var modal = document.getElementById('addFolderModal')
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'addFolderModal'
    modal.className = 'modal'
    modal.innerHTML = '<div class="modal-overlay" onclick="closeAddFolderModal()"></div>' +
      '<div class="modal-content" style="max-width:500px;">' +
      '<div class="modal-header"><h3>Add Folder</h3>' +
      '<button class="modal-close" onclick="closeAddFolderModal()"><i class="fas fa-times"></i></button></div>' +
      '<div class="modal-body">' +
      '<div class="editor-field"><label>Folder name</label>' +
      '<input type="text" id="addFolderName" placeholder="e.g., Weddings, Families"></div>' +
      '<div class="editor-field"><label>Photos (add now or later)</label>' +
      '<button type="button" class="secondary-btn" onclick="document.getElementById(\'addFolderPhotoInput\').click()">' +
      '<i class="fas fa-upload"></i> Add Photos</button>' +
      '<input type="file" id="addFolderPhotoInput" accept="image/*" multiple hidden onchange="addFolderPhotos(this.files)">' +
      '<div class="add-folder-photos" id="addFolderPhotos"></div></div>' +
      '<div class="editor-field"><label>Thumbnail</label>' +
      '<button type="button" class="secondary-btn" onclick="addFolderPickThumbnail()">' +
      '<i class="fas fa-image"></i> Pick from added photos</button>' +
      '<div id="addFolderThumbPreview" style="margin-top:8px;"></div></div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button class="secondary-btn" onclick="closeAddFolderModal()">Cancel</button>' +
      '<button class="secondary-btn" onclick="addFolderCreate(true)"><i class="fas fa-plus"></i> Add & Continue</button>' +
      '<button class="primary-btn" onclick="addFolderCreate(false)"><i class="fas fa-save"></i> Save Folder</button>' +
      '</div></div></div>'
    document.body.appendChild(modal)
  }
  document.getElementById('addFolderName').value = ''
  document.getElementById('addFolderPhotos').innerHTML = ''
  document.getElementById('addFolderThumbPreview').innerHTML = ''
  cpAddFolderPhotos = []
  cpAddFolderThumbUrl = ''
  modal.classList.remove('hidden')
}

function closeAddFolderModal() {
  var modal = document.getElementById('addFolderModal')
  if (modal) modal.classList.add('hidden')
}

function addFolderPhotos(files) {
  if (!files || !files.length) return
  var container = document.getElementById('addFolderPhotos')
  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var formData = new FormData()
      formData.append('file', file)
      fetch('/api/upload', { method: 'POST', body: formData })
        .then(function(r) { return r.json() })
        .then(function(result) {
          if (result && result.url) {
            cpAddFolderPhotos.push(result.url)
            var img = document.createElement('img')
            img.src = result.url
            img.onclick = function() {
              cpAddFolderThumbUrl = result.url
              document.getElementById('addFolderThumbPreview').innerHTML =
                '<div style="position:relative;display:inline-block;"><img src="' + result.url + '" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:2px solid #6366f1"><span style="position:absolute;top:2px;right:2px;background:#6366f1;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;">&#10003;</span></div>'
            }
            container.appendChild(img)
          }
        })
    })(files[i])
  }
}

function addFolderPickThumbnail() {
  if (cpAddFolderPhotos.length === 0) {
    showToast('Add some photos first', 'warning')
    return
  }
  cpAddFolderThumbUrl = cpAddFolderPhotos[0]
  document.getElementById('addFolderThumbPreview').innerHTML =
    '<div style="position:relative;display:inline-block;"><img src="' + cpAddFolderThumbUrl + '" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:2px solid #6366f1"><span style="position:absolute;top:2px;right:2px;background:#6366f1;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;">&#10003;</span></div>'
}

function addFolderCreate(continueAfter) {
  var name = (document.getElementById('addFolderName') || {}).value || ''
  name = name.trim()
  if (!name) { showToast('Enter a folder name', 'warning'); return }
  if (!window.imageMap) window.imageMap = { categories: {}, categoryOrder: [] }
  if (!imageMap.categories) imageMap.categories = {}
  if (!imageMap.categoryOrder) imageMap.categoryOrder = []
  if (imageMap.categories[name]) { showToast('Folder already exists', 'warning'); return }

  imageMap.categories[name] = {
    images: cpAddFolderPhotos.slice(),
    thumbnail: cpAddFolderThumbUrl || cpAddFolderPhotos[0] || ''
  }
  imageMap.categoryOrder.push(name)

  saveImageMap().then(function() {
    if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
    showToast('Folder "' + name + '" created!')
    if (continueAfter) {
      document.getElementById('addFolderName').value = ''
      document.getElementById('addFolderPhotos').innerHTML = ''
      document.getElementById('addFolderThumbPreview').innerHTML = ''
      cpAddFolderPhotos = []
      cpAddFolderThumbUrl = ''
    } else {
      closeAddFolderModal()
    }
  })
}

function openFolderDetail(category) {
  cpGalleryCurrentFolder = category
  cpGallerySelectedImages = []
  var detail = document.getElementById('folderDetail')
  if (!detail) return
  detail.style.display = 'block'
  document.getElementById('folderDetailTitle').textContent = category
  var grid = document.getElementById('galleryGrid')
  if (grid) grid.style.display = 'none'
  renderFolderDetailGrid()
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function closeFolderDetail() {
  var detail = document.getElementById('folderDetail')
  if (detail) detail.style.display = 'none'
  cpGalleryCurrentFolder = null
  cpGallerySelectedImages = []
  var grid = document.getElementById('galleryGrid')
  if (grid) grid.style.display = ''
}

function renderFolderDetailGrid() {
  if (!cpGalleryCurrentFolder || !window.imageMap) return
  var cat = imageMap.categories[cpGalleryCurrentFolder]
  if (!cat) return
  var grid = document.getElementById('folderDetailGrid')
  if (!grid) return
  var images = cat.images || []
  grid.innerHTML = images.map(function(img, i) {
    var url = typeof img === 'string' ? img : (img.src || img.imageUrl || '')
    var sel = cpGallerySelectedImages.indexOf(i) !== -1
    return '<div class="folder-detail-grid-item' + (sel ? ' selected' : '') + '" data-index="' + i + '" onclick="toggleFolderDetailSelect(' + i + ')">' +
      '<img src="' + url + '" alt="Photo ' + (i+1) + '">' +
      '<div class="item-check">' + (sel ? '<i class="fas fa-check" style="color:#fff;font-size:10px;"></i>' : '') + '</div></div>'
  }).join('')
  if (images.length === 0) {
    grid.innerHTML = '<p class="help-text">No photos yet. Click "Upload Photos" to add some.</p>'
  }
}

function toggleFolderDetailSelect(index) {
  var i = cpGallerySelectedImages.indexOf(index)
  if (i === -1) { cpGallerySelectedImages.push(index) } else { cpGallerySelectedImages.splice(i, 1) }
  renderFolderDetailGrid()
}

function folderDetailUpload() {
  var input = document.getElementById('folderDetailFileInput')
  if (input) input.click()
}

function folderDetailUploadFiles(files) {
  if (!files || !files.length || !cpGalleryCurrentFolder) return
  var category = cpGalleryCurrentFolder
  var pending = files.length
  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var formData = new FormData()
      formData.append('file', file)
      fetch('/api/upload', { method: 'POST', body: formData })
        .then(function(r) { return r.json() })
        .then(function(result) {
          if (result && result.url) {
            if (!window.imageMap) window.imageMap = { categories: {}, categoryOrder: [] }
            if (!imageMap.categories[category]) imageMap.categories[category] = { images: [], thumbnail: '' }
            imageMap.categories[category].images.push(result.url)
          }
          pending--
          if (pending === 0) {
            saveImageMap().then(function() {
              renderFolderDetailGrid()
              if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
              showToast(files.length + ' photo(s) uploaded!')
            })
          }
        })
        .catch(function() {
          pending--
          if (pending === 0) {
            saveImageMap().then(function() {
              renderFolderDetailGrid()
              if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
            })
          }
        })
    })(files[i])
  }
}

function folderDetailBulkDelete() {
  if (!cpGalleryCurrentFolder || cpGallerySelectedImages.length === 0) {
    showToast('Select photos to delete first', 'warning')
    return
  }
  showConfirm('Delete ' + cpGallerySelectedImages.length + ' selected photo(s)?', 'Delete Photos').then(function(ok) {
    if (!ok) return
    var cat = imageMap.categories[cpGalleryCurrentFolder]
    if (!cat) return
    var sorted = cpGallerySelectedImages.slice().sort(function(a,b) { return b - a })
    for (var i = 0; i < sorted.length; i++) { cat.images.splice(sorted[i], 1) }
    cpGallerySelectedImages = []
    saveImageMap().then(function() {
      renderFolderDetailGrid()
      if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
      showToast('Photos deleted!')
    })
  })
}

function folderDetailSetThumb() {
  if (!cpGalleryCurrentFolder) return
  if (cpGallerySelectedImages.length !== 1) {
    showToast('Select exactly one photo to set as thumbnail', 'warning')
    return
  }
  var cat = imageMap.categories[cpGalleryCurrentFolder]
  if (!cat) return
  var idx = cpGallerySelectedImages[0]
  var img = cat.images[idx]
  cat.thumbnail = typeof img === 'string' ? img : (img.src || img.imageUrl || '')
  saveImageMap().then(function() {
    if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
    showToast('Thumbnail set!')
  })
}


// ── CP_LIST_SECTIONS: config for modal-based list editors ────────────────
const CP_LIST_SECTIONS = {
  statsBar: {
    addLabel: 'Add Stat',
    itemTitle: (it) => (it.value || '') + (it.label ? ' — ' + it.label : ''),
    itemPreview: (it) => it.label || '',
    headingFields: ['statsTitle', 'statsSubtitle'],
    listKey: 'stats',
    modalTitle: (idx) => idx >= 0 ? 'Edit Stat' : 'Add Stat',
  },
  process: {
    addLabel: 'Add Step',
    itemTitle: (it) => (it.step ? it.step + '. ' : '') + (it.title || ''),
    itemPreview: (it) => it.description || '',
    headingFields: ['processLayout', 'processTitle', 'processSubtitle'],
    listKey: 'process',
    modalTitle: (idx) => idx >= 0 ? 'Edit Step' : 'Add Step',
  },
  latestWork: {
    addLabel: 'Add Case Study',
    itemTitle: (it) => it.title || '',
    itemPreview: (it) => it.result || it.summary || '',
    headingFields: ['caseStudiesTitle', 'caseStudiesSubtitle'],
    listKey: 'caseStudies',
    modalTitle: (idx) => idx >= 0 ? 'Edit Case Study' : 'Add Case Study',
  },
  partners: {
    addLabel: 'Add Partner',
    itemTitle: (it) => it.name || '',
    itemPreview: (it) => it.url || '',
    headingFields: ['title'],
    listKey: 'items',
    modalTitle: (idx) => idx >= 0 ? 'Edit Partner' : 'Add Partner',
  },
  video: {
    addLabel: 'Add Video',
    itemTitle: (it) => (it.url || '').slice(0, 60) + ((it.url || '').length > 60 ? '…' : ''),
    itemPreview: () => '',
    headingFields: [],
    listKey: 'videos',
    modalTitle: (idx) => idx >= 0 ? 'Edit Video' : 'Add Video',
  },
  awards: {
    addLabel: 'Add Award',
    itemTitle: (it) => it.title || '',
    itemPreview: (it) => (it.issuer || '') + (it.year ? ' · ' + it.year : ''),
    headingFields: ['awardsTitle', 'awardsSubtitle'],
    listKey: 'awards',
    modalTitle: (idx) => idx >= 0 ? 'Edit Award' : 'Add Award',
  },
  instagram: {
    addLabel: 'Add Photo',
    itemTitle: (it) => (it.url || '').slice(0, 50) + ((it.url || '').length > 50 ? '…' : ''),
    itemPreview: () => '',
    headingFields: ['socialTitle', 'socialSubtitle'],
    listKey: 'instagramFeed',
    modalTitle: () => 'Add Photo',
    itemShape: 'string',
  },
}

var cpModalSectionId = null
var cpModalEditIndex = -1

function cpRenderListEditor(sectionId) {
  const cfg = CP_LIST_SECTIONS[sectionId]
  if (!cfg) return null
  const def = (typeof SECTION_FIELDS !== 'undefined' && SECTION_FIELDS[sectionId]) || {}
  const view = (typeof ensureSectionView === 'function') ? ensureSectionView(sectionId) : {}
  const items = Array.isArray(view[cfg.listKey]) ? view[cfg.listKey] : []

  // Heading fields (non-list fields)
  let headingHtml = ''
  const headingDefs = (def.fields || []).filter(f => cfg.headingFields.includes(f.key) && f.type !== 'list')
  if (headingDefs.length > 0) {
    headingHtml = '<div class="editor-card" style="margin-bottom:12px">' +
      headingDefs.map(f => {
        if (typeof renderFeatureField === 'function') {
          return renderFeatureField(sectionId, f, view[f.key])
        }
        return '<div class="editor-field"><label>' + (f.label || f.key) + '</label><input type="text" data-feature-field="' + sectionId + '" data-key="' + f.key + '" value="' + (view[f.key] || '') + '"></div>'
      }).join('') +
      '</div>'
  }

  // Item list
  let listHtml = '<div class="cp-item-list" id="cpList_' + sectionId + '">'
  if (items.length === 0) {
    listHtml += '<p class="help-text" style="color:#64748b;text-align:center;padding:20px">No items yet. Click "' + cfg.addLabel + '" to create one.</p>'
  } else {
    items.forEach((item, i) => {
      const title = cfg.itemTitle(item) || 'Untitled'
      const preview = cfg.itemPreview(item)
      const thumb = item.image || item.logoUrl || item.url && item.url.match(/^https?:\/\//) ? (item.image || item.logoUrl || '') : ''
      listHtml += '<div class="cp-item-card" data-index="' + i + '">' +
        '<div class="cp-drag" draggable="true" title="Drag to reorder">⠿</div>' +
        (thumb ? '<img src="' + thumb + '" class="cp-item-thumb" alt="">' : '<div class="cp-item-thumb-placeholder"><i class="fas fa-grip-vertical"></i></div>') +
        '<div class="cp-item-info">' +
        '<div class="cp-item-title">' + title + '</div>' +
        (preview ? '<div class="cp-item-preview">' + preview + '</div>' : '') +
        '</div>' +
        '<div class="cp-item-actions">' +
        '<button type="button" class="cp-edit-btn-sm" onclick="cpOpenItemModal(\'' + sectionId + '\',' + i + ')"><i class="fas fa-pen"></i></button>' +
        '<button type="button" class="cp-delete-btn-sm" onclick="cpDeleteItem(\'' + sectionId + '\',' + i + ')"><i class="fas fa-trash"></i></button>' +
        '</div>' +
        '</div>'
    })
  }
  listHtml += '</div>'

  // Add button
  const addHtml = '<button type="button" class="primary-btn" onclick="cpOpenItemModal(\'' + sectionId + '\',-1)" style="width:100%;margin-top:12px"><i class="fas fa-plus"></i> ' + cfg.addLabel + '</button>'

  return headingHtml + listHtml + addHtml
}

function cpOpenItemModal(sectionId, editIndex) {
  cpModalSectionId = sectionId
  cpModalEditIndex = editIndex
  const cfg = CP_LIST_SECTIONS[sectionId]
  const def = (typeof SECTION_FIELDS !== 'undefined' && SECTION_FIELDS[sectionId]) || {}
  const view = (typeof ensureSectionView === 'function') ? ensureSectionView(sectionId) : {}
  const listKey = cfg.listKey
  const items = Array.isArray(view[listKey]) ? view[listKey] : []
  const item = editIndex >= 0 ? items[editIndex] : null

  // Build fields from SECTION_FIELDS list definition
  const listField = (def.fields || []).find(f => f.key === listKey)
  const itemFields = (listField && listField.itemFields) || []

  let fieldsHtml = itemFields.map(f => {
    const val = item ? (item[f.key] != null ? item[f.key] : '') : (f.default != null ? f.default : '')
    if (typeof renderFeatureField === 'function') {
      // Use renderFeatureField but with cpModal_ prefixed data attrs so we can read them
      let html = renderFeatureField(sectionId, f, val)
      // Replace data-feature-field with data-cp-field for modal context
      html = html.replace(/data-feature-field="[^"]*"/g, 'data-cp-field="1"')
      return html
    }
    return '<div class="editor-field"><label>' + (f.label || f.key) + '</label><input type="text" data-cp-field="1" data-key="' + f.key + '" value="' + (val || '') + '"></div>'
  }).join('')

  // Create or reuse modal
  var modal = document.getElementById('cpItemModal')
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'cpItemModal'
    modal.className = 'modal'
    document.body.appendChild(modal)
  }
  modal.innerHTML =
    '<div class="modal-overlay" onclick="cpCloseItemModal()"></div>' +
    '<div class="modal-content" style="max-width:520px;max-height:85vh;overflow-y:auto;">' +
    '<div class="modal-header"><h3>' + cfg.modalTitle(editIndex) + '</h3>' +
    '<button class="modal-close" onclick="cpCloseItemModal()"><i class="fas fa-times"></i></button></div>' +
    '<div class="modal-body">' + fieldsHtml + '</div>' +
    '<div class="modal-footer">' +
    '<button class="secondary-btn" onclick="cpCloseItemModal()">Cancel</button>' +
    '<button class="primary-btn" onclick="cpSaveItemModal()"><i class="fas fa-save"></i> Save</button>' +
    '</div></div></div>'
  modal.classList.remove('hidden')
}

function cpCloseItemModal() {
  var modal = document.getElementById('cpItemModal')
  if (modal) modal.classList.add('hidden')
  cpModalSectionId = null
  cpModalEditIndex = -1
}

function cpSaveItemModal() {
  if (!cpModalSectionId) return
  const cfg = CP_LIST_SECTIONS[cpModalSectionId]
  const def = (typeof SECTION_FIELDS !== 'undefined' && SECTION_FIELDS[cpModalSectionId]) || {}
  const view = (typeof ensureSectionView === 'function') ? ensureSectionView(cpModalSectionId) : {}
  const listKey = cfg.listKey
  const listField = (def.fields || []).find(f => f.key === listKey)
  const itemFields = (listField && listField.itemFields) || []

  // Read values from modal
  const item = {}
  itemFields.forEach(f => {
    const inputs = document.querySelectorAll('#cpItemModal [data-cp-field][data-key="' + f.key + '"]')
    if (inputs.length > 0) {
      const el = inputs[0]
      if (el.type === 'checkbox') item[f.key] = !!el.checked
      else item[f.key] = el.value
    }
  })

  if (!Array.isArray(view[listKey])) view[listKey] = []
  if (cpModalEditIndex >= 0) {
    view[listKey][cpModalEditIndex] = item
  } else {
    view[listKey].push(item)
  }

  cpCloseItemModal()
  if (typeof markDirty === 'function') markDirty()
  // Re-render the list
  const listEl = document.getElementById('cpList_' + cpModalSectionId)
  if (listEl) {
    // Re-render just the editor content
    const section = cpModalSectionId
    cpModalSectionId = null // prevent recursion
    const html = cpRenderListEditor(section)
    const accBody = document.querySelector('.cp-card[data-id="' + section + '"] .cp-accordion-body')
    if (accBody && html) {
      // Find the save bar and keep it
      const saveBar = accBody.querySelector('.cp-editor-save')
      accBody.innerHTML = html
      if (saveBar) accBody.appendChild(saveBar)
    }
    // Re-wire drag handles
    cpWireListDrag(section)
  }
}

function cpDeleteItem(sectionId, index) {
  const cfg = CP_LIST_SECTIONS[sectionId]
  if (!cfg) return
  if (typeof showConfirm === 'function') {
    showConfirm('Delete this item?', 'Delete').then(ok => {
      if (!ok) return
      const view = (typeof ensureSectionView === 'function') ? ensureSectionView(sectionId) : {}
      if (Array.isArray(view[cfg.listKey])) {
        view[cfg.listKey].splice(index, 1)
      }
      if (typeof markDirty === 'function') markDirty()
      // Re-render
      const html = cpRenderListEditor(sectionId)
      const accBody = document.querySelector('.cp-card[data-id="' + sectionId + '"] .cp-accordion-body')
      if (accBody && html) {
        const saveBar = accBody.querySelector('.cp-editor-save')
        accBody.innerHTML = html
        if (saveBar) accBody.appendChild(saveBar)
      }
      cpWireListDrag(sectionId)
    })
  }
}

function cpWireListDrag(sectionId) {
  const cfg = CP_LIST_SECTIONS[sectionId]
  if (!cfg) return
  const handles = document.querySelectorAll('#cpList_' + sectionId + ' .cp-drag[draggable]')
  handles.forEach(handle => {
    const row = handle.closest('.cp-item-card')
    handle.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', row.dataset.index)
      row.classList.add('dragging')
    })
    handle.addEventListener('dragend', () => row.classList.remove('dragging'))
    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('drag-over') })
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'))
    row.addEventListener('drop', (e) => {
      e.preventDefault()
      row.classList.remove('drag-over')
      const from = parseInt(e.dataTransfer.getData('text/plain'))
      const to = parseInt(row.dataset.index)
      if (from === to) return
      const view = (typeof ensureSectionView === 'function') ? ensureSectionView(sectionId) : {}
      if (Array.isArray(view[cfg.listKey])) {
        const moved = view[cfg.listKey].splice(from, 1)[0]
        view[cfg.listKey].splice(to, 0, moved)
      }
      if (typeof markDirty === 'function') markDirty()
      // Re-render
      const html = cpRenderListEditor(sectionId)
      const accBody = document.querySelector('.cp-card[data-id="' + sectionId + '"] .cp-accordion-body')
      if (accBody && html) {
        const saveBar = accBody.querySelector('.cp-editor-save')
        accBody.innerHTML = html
        if (saveBar) accBody.appendChild(saveBar)
      }
      cpWireListDrag(sectionId)
    })
  })
}

// ── Click-outside to close editor (single global handler) ──────────────
var cpIgnoreNextOutside = false
document.addEventListener('mousedown', function cpOutsideClick(e) {
  if (!cpOpenEditorId) return
  if (cpIgnoreNextOutside) { cpIgnoreNextOutside = false; return }
  var openCard = document.querySelector('.cp-card.open')
  if (!openCard) return
  if (openCard.contains(e.target)) return
  // Defer close so any click handlers on the target complete first
  setTimeout(function() {
    if (!cpOpenEditorId) return
    cpSaveEditorData(cpOpenEditorId)
    cpOpenEditorId = null
    renderCPSectionList()
  }, 50)
}, true)

// Auto-scroll to card top when Edit is clicked
function cpScrollToCard(cardEl) {
  if (!cardEl) return
  var rect = cardEl.getBoundingClientRect()
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop
  var targetY = rect.top + scrollTop - 80 // 80px offset for header
  window.scrollTo({ top: targetY, behavior: 'smooth' })
}


window.openAddFolderModal = openAddFolderModal
window.closeAddFolderModal = closeAddFolderModal
window.addFolderPhotos = addFolderPhotos
window.addFolderPickThumbnail = addFolderPickThumbnail
window.addFolderCreate = addFolderCreate
window.openFolderDetail = openFolderDetail
window.closeFolderDetail = closeFolderDetail
window.toggleFolderDetailSelect = toggleFolderDetailSelect
window.folderDetailUpload = folderDetailUpload
window.folderDetailUploadFiles = folderDetailUploadFiles
window.folderDetailBulkDelete = folderDetailBulkDelete
window.folderDetailSetThumb = folderDetailSetThumb

// ── Folder View Modal: Upload + Multi-Select ──────────────────────────────

var cpFolderViewSelected = []

function folderViewUploadFiles(files) {
  if (!files || !files.length || !currentFolder) return
  var category = currentFolder
  var pending = files.length
  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var formData = new FormData()
      formData.append('file', file)
      fetch('/api/upload', { method: 'POST', body: formData })
        .then(function(r) { return r.json() })
        .then(function(result) {
          if (result && result.url) {
            if (!window.imageMap) window.imageMap = { categories: {}, categoryOrder: [] }
            if (!imageMap.categories[category]) imageMap.categories[category] = { images: [], thumbnail: '' }
            imageMap.categories[category].images.push(result.url)
          }
          pending--
          if (pending === 0) {
            saveImageMap().then(function() {
              viewFolder(category)
              if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
              showToast(files.length + ' photo(s) uploaded!')
            })
          }
        })
        .catch(function() {
          pending--
          if (pending === 0) {
            saveImageMap().then(function() {
              viewFolder(category)
              if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
            })
          }
        })
    })(files[i])
  }
}

function folderViewToggleSelect(index) {
  var i = cpFolderViewSelected.indexOf(index)
  if (i === -1) { cpFolderViewSelected.push(index) } else { cpFolderViewSelected.splice(i, 1) }
  // Update visual state
  var items = document.querySelectorAll('#folderImageGrid .folder-image-item')
  items.forEach(function(item, idx) {
    if (cpFolderViewSelected.indexOf(idx) !== -1) {
      item.style.outline = '3px solid #6366f1'
      item.style.outlineOffset = '-1px'
    } else {
      item.style.outline = ''
      item.style.outlineOffset = ''
    }
  })
}

function folderViewBulkDelete() {
  if (!currentFolder || cpFolderViewSelected.length === 0) {
    showToast('Select photos to delete first', 'warning')
    return
  }
  showConfirm('Delete ' + cpFolderViewSelected.length + ' selected photo(s)?', 'Delete Photos').then(function(ok) {
    if (!ok) return
    var cat = imageMap.categories[currentFolder]
    if (!cat) return
    var sorted = cpFolderViewSelected.slice().sort(function(a,b) { return b - a })
    for (var i = 0; i < sorted.length; i++) { cat.images.splice(sorted[i], 1) }
    cpFolderViewSelected = []
    saveImageMap().then(function() {
      viewFolder(currentFolder)
      if (typeof loadGalleryFolders === 'function') loadGalleryFolders()
      showToast('Photos deleted!')
    })
  })
}
