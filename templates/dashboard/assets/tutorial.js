/**
 * Interactive Dashboard Tutorial System
 * First-time user onboarding with contextual tips
 */

class DashboardTutorial {
  constructor() {
    this.currentStep = 0;
    this.currentSection = 'overview';
    this.isActive = false;
    this.steps = this.defineSteps();
    this.completedSections = new Set();
    
    // Check if tutorial has been completed
    this.isCompleted = localStorage.getItem('dashboardTutorialCompleted') === 'true';
    
    // Create tutorial elements
    this.createTutorialElements();
    
    // Bind methods
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.skip = this.skip.bind(this);
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this.complete = this.complete.bind(this);
  }

  defineSteps() {
    return {
      overview: [
        {
          target: '.stats-grid',
          title: 'Dashboard Overview',
          message: 'Here you can see your website statistics at a glance. This updates automatically as visitors interact with your site.',
          icon: 'chart-pie',
          position: 'bottom'
        },
        {
          target: '.quick-actions',
          title: 'Quick Actions',
          message: 'Use these shortcuts to jump directly to the most common editing tasks.',
          icon: 'bolt',
          position: 'bottom'
        },
        {
          target: '.sidebar-nav',
          title: 'Navigation Menu',
          message: 'Click on any menu item to edit that section of your website. The menu only shows sections that exist on your site.',
          icon: 'bars',
          position: 'right'
        }
      ],
      hero: [
        {
          target: '#heroImagePreview',
          title: 'Hero Image',
          message: 'This is the first image visitors see. Click "Upload New Hero Image" to change it. Any size works—it will automatically fit.',
          icon: 'image',
          position: 'right',
          watchAction: 'heroImageUpload'
        },
        {
          target: '#heroHeadline',
          title: 'Hero Headline',
          message: 'Your main headline grabs attention. Edit it to match your business message.',
          icon: 'heading',
          position: 'bottom',
          watchAction: 'heroEdit'
        },
        {
          target: '#heroCta',
          title: 'Call-to-Action Button',
          message: 'Customize your button text and link. This guides visitors to take action (e.g., "Get a Free Quote", "Contact Us").',
          icon: 'mouse-pointer',
          position: 'bottom',
          watchAction: 'heroEdit'
        },
        {
          target: '.reset-btn',
          title: 'Reset to Default',
          message: 'Made changes you want to undo? This button restores the original AI-generated content.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      gallery: [
        {
          target: '#newFolderName',
          title: 'Create Folders',
          message: 'Organize your photos into categories like "Weddings", "Families", "Products", etc. Type a name and click "Create Folder".',
          icon: 'folder-plus',
          position: 'bottom',
          watchAction: 'folderCreate'
        },
        {
          target: '.primary-btn',
          title: 'Upload Photos',
          message: 'Click here to upload multiple images at once. Drag and drop works too!',
          icon: 'upload',
          position: 'bottom',
          watchAction: 'photoUpload'
        },
        {
          target: '.gallery-folder',
          title: 'Gallery Folders',
          message: 'Click a folder to view and manage its images. You can set a thumbnail, reorder images, or delete photos.',
          icon: 'images',
          position: 'bottom',
          watchAction: 'folderView'
        },
        {
          target: '.folder-image-item',
          title: 'Reorder & Delete Images',
          message: 'Inside a folder, drag images to reorder them. Click the X button to delete. The order you set appears on your live website.',
          icon: 'grip-vertical',
          position: 'right',
          requiresContext: 'folderView'
        }
      ],
      services: [
        {
          target: '.drag-handle',
          title: 'Drag to Reorder',
          message: 'Grab this handle and drag services up or down. The order you set is how they appear on your website.',
          icon: 'grip-vertical',
          position: 'right'
        },
        {
          target: '.service-item .secondary-btn',
          title: 'Edit Services',
          message: 'Click this button to edit the service name, description, and price. Changes save automatically.',
          icon: 'edit',
          position: 'left',
          watchAction: 'serviceEdit'
        },
        {
          target: '.section-header .primary-btn',
          title: 'Add New Service',
          message: 'Click here to add more services. All changes appear immediately on your live website.',
          icon: 'plus',
          position: 'bottom',
          watchAction: 'serviceAdd'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset Services',
          message: 'This restores the original AI-generated services if you want to start over.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      pricing: [
        {
          target: '.drag-handle',
          title: 'Reorder Pricing',
          message: 'Drag packages to change their display order. Put your most popular option first!',
          icon: 'grip-vertical',
          position: 'right'
        },
        {
          target: '.section-header .primary-btn',
          title: 'Add Pricing Package',
          message: 'Create new pricing tiers. Include name, price, features, and whether it\'s recommended.',
          icon: 'tags',
          position: 'bottom',
          watchAction: 'pricingAdd'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset Pricing',
          message: 'Restore original pricing packages if needed.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      testimonials: [
        {
          target: '.section-header .primary-btn',
          title: 'Add Testimonials',
          message: 'Share customer reviews! Include client name, their testimonial, and a star rating (1-5).',
          icon: 'star',
          position: 'bottom',
          watchAction: 'testimonialAdd'
        },
        {
          target: '.drag-handle',
          title: 'Reorder Testimonials',
          message: 'Drag to show your best reviews first. First impressions matter!',
          icon: 'grip-vertical',
          position: 'right'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset Testimonials',
          message: 'Go back to the original AI-generated testimonials.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      about: [
        {
          target: '#aboutTitle',
          title: 'About Page Title',
          message: 'Edit your page title and tagline. This is where you tell your business story.',
          icon: 'info-circle',
          position: 'bottom',
          watchAction: 'aboutEdit'
        },
        {
          target: '#aboutPara1',
          title: 'About Content',
          message: 'Edit up to 3 paragraphs about your business, history, mission, and values. Make it personal!',
          icon: 'file-alt',
          position: 'bottom',
          watchAction: 'aboutEdit'
        },
        {
          target: '#aboutImagePreview',
          title: 'About Image',
          message: 'Upload a photo that represents your business—your team, workspace, or products.',
          icon: 'camera',
          position: 'right',
          watchAction: 'aboutImageUpload'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset About Page',
          message: 'Restore the original AI-generated about content.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      content: [
        {
          target: '.content-page-card',
          title: 'Page Content Settings',
          message: 'Edit the text that appears on each page of your website. Customize titles, descriptions, and call-to-action sections.',
          icon: 'file-alt',
          position: 'bottom',
          watchAction: 'pageContentEdit'
        },
        {
          target: '#servicesPageTitle',
          title: 'Services Page',
          message: 'Customize your services page heading and description text.',
          icon: 'concierge-bell',
          position: 'bottom',
          watchAction: 'pageContentEdit'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset Page Content',
          message: 'Restore all page content to original settings.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      blog: [
        {
          target: '.section-header .primary-btn',
          title: 'Create Blog Posts',
          message: 'Share news, tips, or updates with blog posts. Include title, content, and optional images.',
          icon: 'blog',
          position: 'bottom',
          watchAction: 'blogAdd'
        },
        {
          target: '.drag-handle',
          title: 'Reorder Posts',
          message: 'Drag posts to change their order. Newest posts typically go first.',
          icon: 'grip-vertical',
          position: 'right'
        }
      ],
      seo: [
        {
          target: '#seoTitle',
          title: 'SEO Meta Title',
          message: 'This title appears in search results and browser tabs. Keep it under 60 characters.',
          icon: 'search',
          position: 'bottom',
          watchAction: 'seoEdit'
        },
        {
          target: '#seoDescription',
          title: 'SEO Description',
          message: 'This description appears in search results. Make it compelling! Keep it under 160 characters.',
          icon: 'align-left',
          position: 'bottom',
          watchAction: 'seoEdit'
        },
        {
          target: '#seoKeywords',
          title: 'SEO Keywords',
          message: 'Add relevant keywords separated by commas. These help search engines understand your site.',
          icon: 'tags',
          position: 'bottom',
          watchAction: 'seoEdit'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset SEO',
          message: 'Restore original SEO settings.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      settings: [
        {
          target: '#settingsPhone',
          title: 'Contact Information',
          message: 'Update your phone number, email, and address. This appears throughout your website.',
          icon: 'phone',
          position: 'bottom',
          watchAction: 'contactEdit'
        },
        {
          target: '.business-hours-row',
          title: 'Business Hours',
          message: 'Set your hours for each day. Check "Closed" for days you\'re not open.',
          icon: 'clock',
          position: 'right',
          watchAction: 'hoursEdit'
        },
        {
          target: '#settingsFacebook',
          title: 'Social Media Links',
          message: 'Add your social media URLs. Leave blank if you don\'t use a particular platform.',
          icon: 'share-alt',
          position: 'bottom',
          watchAction: 'socialEdit'
        }
      ],
      team: [
        {
          target: '.section-header .primary-btn',
          title: 'Add Team Members',
          message: 'Showcase your team! Add names, positions, bios, and photos.',
          icon: 'users',
          position: 'bottom',
          watchAction: 'teamAdd'
        },
        {
          target: '.drag-handle',
          title: 'Reorder Team',
          message: 'Drag to arrange team members in your preferred order.',
          icon: 'grip-vertical',
          position: 'right'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset Team',
          message: 'Restore original team members.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      faq: [
        {
          target: '.section-header .primary-btn',
          title: 'Add FAQ Items',
          message: 'Answer common customer questions. Click here to add question and answer pairs.',
          icon: 'question-circle',
          position: 'bottom',
          watchAction: 'faqAdd'
        },
        {
          target: '.drag-handle',
          title: 'Reorder FAQs',
          message: 'Put the most important questions first by dragging.',
          icon: 'grip-vertical',
          position: 'right'
        },
        {
          target: '.section-header .reset-btn',
          title: 'Reset FAQ',
          message: 'Restore original FAQ items.',
          icon: 'undo',
          position: 'bottom'
        }
      ],
      'design-system': [
        {
          target: '.design-overview',
          title: 'Design System',
          message: 'This shows your website\'s visual identity: colors, fonts, and layout. These are set automatically and cannot be edited—this keeps your site looking professional.',
          icon: 'palette',
          position: 'bottom'
        },
        {
          target: '.color-swatches',
          title: 'Color Palette',
          message: 'Your brand colors are used consistently throughout your website.',
          icon: 'fill-drip',
          position: 'bottom'
        }
      ]
    };
  }

  createTutorialElements() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    document.body.appendChild(this.overlay);

    // Create spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'tutorial-spotlight';
    document.body.appendChild(this.spotlight);

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    document.body.appendChild(this.tooltip);

    // Create welcome modal
    this.welcome = document.createElement('div');
    this.welcome.className = 'tutorial-welcome';
    this.welcome.innerHTML = `
      <div class="tutorial-welcome-icon">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <h2>Welcome to Your Dashboard!</h2>
      <p>Let's take a quick tour to show you how to manage your website. We'll guide you through each section step-by-step. You can skip at any time.</p>
      <div class="tutorial-welcome-actions">
        <button class="tutorial-welcome-btn tutorial-welcome-btn-primary" onclick="tutorial.start()">
          <i class="fas fa-play"></i>
          <span>Start Tour</span>
        </button>
        <button class="tutorial-welcome-btn tutorial-welcome-btn-secondary" onclick="tutorial.skip()">
          <span>Skip Tutorial</span>
        </button>
      </div>
    `;
    document.body.appendChild(this.welcome);

    // Create completion modal
    this.completeModal = document.createElement('div');
    this.completeModal.className = 'tutorial-complete';
    this.completeModal.innerHTML = `
      <div class="tutorial-complete-icon">
        <i class="fas fa-check"></i>
      </div>
      <h2>Congratulations!</h2>
      <p>You've completed the dashboard tour! Remember: all changes save automatically and appear on your live website immediately. Happy editing!</p>
      <button class="tutorial-complete-btn" onclick="tutorial.complete()">
        <i class="fas fa-rocket"></i>
        <span>Start Editing</span>
      </button>
    `;
    document.body.appendChild(this.completeModal);

    // Create restart button
    this.restartBtn = document.createElement('div');
    this.restartBtn.className = 'tutorial-restart-btn';
    this.restartBtn.title = 'Restart Tutorial';
    this.restartBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
    this.restartBtn.onclick = () => this.restart();
    document.body.appendChild(this.restartBtn);

    // Skip button in overlay
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        // Don't close on overlay click, only on skip button
      }
    });
  }

  showWelcome() {
    if (this.isCompleted) return;
    this.welcome.classList.add('active');
    this.overlay.classList.add('active');
  }

  start() {
    this.welcome.classList.remove('active');
    this.isActive = true;
    this.currentStep = 0;
    this.currentSection = 'overview';
    document.body.classList.add('tutorial-active');
    
    // Switch to overview section if not already there
    if (typeof switchSection === 'function') {
      switchSection('overview');
    }
    
    setTimeout(() => this.showStep(), 300);
  }

  restart() {
    this.isCompleted = false;
    localStorage.removeItem('dashboardTutorialCompleted');
    this.completedSections.clear();
    this.showWelcome();
  }

  showStep() {
    const sectionSteps = this.steps[this.currentSection];
    if (!sectionSteps || this.currentStep >= sectionSteps.length) {
      // Move to next section
      this.moveToNextSection();
      return;
    }

    const step = sectionSteps[this.currentStep];
    const target = document.querySelector(step.target);

    if (!target) {
      console.warn(`Tutorial: target not found: ${step.target}`);
      this.next();
      return;
    }

    // Position spotlight
    this.positionSpotlight(target);
    this.spotlight.classList.add('active');

    // Position and show tooltip
    this.renderTooltip(step, target);
    this.tooltip.classList.add('active');

    // Setup action watchers if specified
    if (step.watchAction) {
      this.setupActionWatcher(step.watchAction);
    }
  }

  positionSpotlight(element) {
    const rect = element.getBoundingClientRect();
    const padding = 8;
    
    this.spotlight.style.top = `${rect.top - padding + window.scrollY}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;
  }

  renderTooltip(step, target) {
    const rect = target.getBoundingClientRect();
    const sectionSteps = this.steps[this.currentSection];
    const totalSteps = sectionSteps.length;
    const sectionName = this.currentSection.charAt(0).toUpperCase() + this.currentSection.slice(1);

    this.tooltip.innerHTML = `
      <div class="tutorial-tooltip-header">
        <div class="tutorial-tooltip-icon">
          <i class="fas fa-${step.icon}"></i>
        </div>
        <div class="tutorial-tooltip-title">${step.title}</div>
      </div>
      <div class="tutorial-tooltip-message">${step.message}</div>
      <div class="tutorial-tooltip-footer">
        <div class="tutorial-progress">
          <div>${sectionName}: ${this.currentStep + 1}/${totalSteps}</div>
          <div class="tutorial-progress-bar">
            ${Array.from({length: totalSteps}, (_, i) => 
              `<div class="tutorial-progress-dot ${i === this.currentStep ? 'active' : ''}"></div>`
            ).join('')}
          </div>
        </div>
        <div class="tutorial-tooltip-actions">
          ${this.currentStep > 0 ? 
            '<button class="tutorial-btn tutorial-btn-secondary" onclick="tutorial.previous()"><i class="fas fa-arrow-left"></i></button>' : 
            '<button class="tutorial-btn tutorial-btn-secondary" onclick="tutorial.skip()">Skip Tutorial</button>'}
          <button class="tutorial-btn tutorial-btn-primary" onclick="tutorial.next()">
            ${this.currentStep === totalSteps - 1 ? 'Next Section' : 'Next'}
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    this.tooltip.dataset.position = step.position;
    this.positionTooltip(step.position, rect);
  }

  positionTooltip(position, targetRect) {
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const offset = 20;
    let top, left;

    switch (position) {
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
        top = targetRect.top - tooltipRect.height - offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + offset;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - offset;
        break;
      default:
        top = targetRect.bottom + offset;
        left = targetRect.left;
    }

    // Keep tooltip in viewport
    const padding = 20;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = targetRect.bottom + offset;

    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left}px`;
  }

  setupActionWatcher(actionType) {
    // Watch for user actions that should auto-advance
    const advanceOnAction = () => {
      this.removeActionWatchers();
      setTimeout(() => this.next(), 500);
    };

    switch (actionType) {
      case 'heroImageUpload':
      case 'aboutImageUpload':
        this.actionWatcher = () => advanceOnAction();
        document.addEventListener('imageUploaded', this.actionWatcher);
        break;
      case 'heroEdit':
      case 'aboutEdit':
      case 'pageContentEdit':
      case 'seoEdit':
      case 'contactEdit':
      case 'hoursEdit':
      case 'socialEdit':
        // Watch for input changes
        const inputs = document.querySelectorAll('input[onchange], textarea[onchange]');
        this.actionWatcher = () => advanceOnAction();
        inputs.forEach(input => input.addEventListener('change', this.actionWatcher, { once: true }));
        break;
      case 'serviceAdd':
      case 'pricingAdd':
      case 'testimonialAdd':
      case 'blogAdd':
      case 'teamAdd':
      case 'faqAdd':
        // Watch for modal open
        this.actionWatcher = () => advanceOnAction();
        document.addEventListener('modalOpened', this.actionWatcher);
        break;
      case 'serviceEdit':
        // Watch for edit button click
        this.actionWatcher = () => advanceOnAction();
        document.addEventListener('editClicked', this.actionWatcher);
        break;
      case 'folderCreate':
      case 'photoUpload':
      case 'folderView':
        this.actionWatcher = () => advanceOnAction();
        document.addEventListener('galleryAction', this.actionWatcher);
        break;
    }
  }

  removeActionWatchers() {
    if (this.actionWatcher) {
      document.removeEventListener('imageUploaded', this.actionWatcher);
      document.removeEventListener('modalOpened', this.actionWatcher);
      document.removeEventListener('editClicked', this.actionWatcher);
      document.removeEventListener('galleryAction', this.actionWatcher);
      this.actionWatcher = null;
    }
  }

  next() {
    this.removeActionWatchers();
    this.currentStep++;
    
    const sectionSteps = this.steps[this.currentSection];
    if (this.currentStep >= sectionSteps.length) {
      this.moveToNextSection();
    } else {
      this.showStep();
    }
  }

  previous() {
    this.removeActionWatchers();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep();
    }
  }

  moveToNextSection() {
    this.completedSections.add(this.currentSection);
    
    const sections = Object.keys(this.steps);
    const currentIndex = sections.indexOf(this.currentSection);
    
    if (currentIndex < sections.length - 1) {
      // Move to next section
      this.currentSection = sections[currentIndex + 1];
      this.currentStep = 0;
      
      // Switch to that section in dashboard
      if (typeof switchSection === 'function') {
        switchSection(this.currentSection);
      }
      
      setTimeout(() => this.showStep(), 300);
    } else {
      // Tutorial complete!
      this.showCompletion();
    }
  }

  showCompletion() {
    this.spotlight.classList.remove('active');
    this.tooltip.classList.remove('active');
    this.completeModal.classList.add('active');
  }

  complete() {
    this.isActive = false;
    this.isCompleted = true;
    localStorage.setItem('dashboardTutorialCompleted', 'true');
    
    this.overlay.classList.remove('active');
    this.spotlight.classList.remove('active');
    this.tooltip.classList.remove('active');
    this.welcome.classList.remove('active');
    this.completeModal.classList.remove('active');
    document.body.classList.remove('tutorial-active');
  }

  skip() {
    if (confirm('Are you sure you want to skip the tutorial? You can restart it anytime by clicking the help button.')) {
      this.complete();
    }
  }
}

// Initialize tutorial
let tutorial;

// Auto-start on first login
document.addEventListener('DOMContentLoaded', () => {
  tutorial = new DashboardTutorial();
  
  // Check if user just logged in and hasn't seen tutorial
  const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
  if (justLoggedIn && !tutorial.isCompleted) {
    sessionStorage.removeItem('justLoggedIn');
    setTimeout(() => tutorial.showWelcome(), 1000);
  }
});
