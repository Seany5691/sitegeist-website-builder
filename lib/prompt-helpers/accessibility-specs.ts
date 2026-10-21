/**
 * Accessibility Enhancement Helpers for Prompt Builder
 * Implements GAP 43-49: ARIA landmarks, keyboard nav, focus traps, screen reader text, color contrast, alt text, form errors
 */

export function buildAccessibilitySpecifications(): string {
  return `
==================================================
ACCESSIBILITY (WCAG 2.1 AA COMPLIANCE)
==================================================

${buildARIALandmarkInstructions()}

${buildKeyboardNavigationInstructions()}

${buildFocusTrapInstructions()}

${buildScreenReaderTextInstructions()}

${buildColorContrastInstructions()}

${buildAltTextInstructions()}

${buildFormErrorInstructions()}
`;
}

/**
 * GAP 43: ARIA Landmark Roles
 */
function buildARIALandmarkInstructions(): string {
  return `
==================================================
GAP 43: ARIA LANDMARK ROLES (Screen Reader Navigation)
==================================================

WHY LANDMARKS MATTER:
- Screen reader users navigate by landmarks (not by scrolling)
- Landmarks allow "Skip to main content" and section jumping
- WCAG 2.1 requires proper page structure

REQUIRED LANDMARKS:

1. <header> OR role="banner":
<header> {/* Implicit role="banner" */}
  <nav aria-label="Main navigation"> {/* Explicit navigation */}
  </nav>
</header>

2. <nav> OR role="navigation":
<nav aria-label="Main navigation">
  {/* Use aria-label to distinguish multiple navs */}
</nav>

<nav aria-label="Footer navigation">
  {/* Second nav needs descriptive label */}
</nav>

3. <main> OR role="main":
<main id="main-content"> {/* Only ONE main per page */}
  {/* All primary content goes here */}
</main>

4. <aside> OR role="complementary":
<aside aria-label="Related articles">
  {/* Sidebar content */}
</aside>

5. <footer> OR role="contentinfo":
<footer> {/* Implicit role="contentinfo" */}
  {/* Footer content */}
</footer>

6. <section> with aria-labelledby:
<section aria-labelledby="services-heading">
  <h2 id="services-heading">Our Services</h2>
  {/* Section content */}
</section>

7. <form> OR role="search":
<form role="search" aria-label="Site search">
  <input type="search" aria-label="Search query" />
  <button type="submit">Search</button>
</form>

COMPLETE PAGE STRUCTURE:
<body>
  <header>
    <nav aria-label="Main navigation"></nav>
  </header>
  
  <main id="main-content">
    <section aria-labelledby="hero-heading">
      <h1 id="hero-heading">Welcome</h1>
    </section>
    
    <section aria-labelledby="services-heading">
      <h2 id="services-heading">Our Services</h2>
    </section>
    
    <section aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading">Testimonials</h2>
    </section>
  </main>
  
  <footer>
    <nav aria-label="Footer navigation"></nav>
  </footer>
</body>

SKIP LINK (first focusable element):
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white">
  Skip to main content
</a>

CRITICAL RULES:
1. Only ONE <header>, <main>, <footer> per page
2. Use aria-label or aria-labelledby on <section> elements
3. Distinguish multiple <nav> elements with aria-label
4. Always include "Skip to main content" link
5. Use semantic HTML (<header>, <nav>, <main>) instead of <div role="">

VERIFICATION:
□ Page has <header>, <main>, <footer>
□ All <section> elements have aria-labelledby
□ Multiple <nav> elements have aria-label
□ "Skip to main content" link is first focusable element
□ Test with screen reader (NVDA on Windows, VoiceOver on Mac)
`;
}

/**
 * GAP 44: Keyboard Navigation
 */
function buildKeyboardNavigationInstructions(): string {
  return `
==================================================
GAP 44: KEYBOARD NAVIGATION (WCAG 2.1.1)
==================================================

ALL interactive elements MUST be keyboard accessible.

KEYBOARD SHORTCUTS:
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter/Space: Activate buttons and links
- Escape: Close modals, menus, dropdowns
- Arrow keys: Navigate within menus, carousels, tabs

INTERACTIVE ELEMENTS:

1. BUTTONS:
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click Me
</button>

2. LINKS:
<a href="#section" className="focus-visible:ring-2 focus-visible:ring-primary">
  Link Text
</a>

3. CUSTOM INTERACTIVE ELEMENTS (e.g., card as link):
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="cursor-pointer focus-visible:ring-2"
>
  Card Content
</div>

4. DROPDOWN MENU:
<button
  onClick={() => setMenuOpen(!menuOpen)}
  onKeyDown={(e) => {
    if (e.key === 'Escape') setMenuOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Focus first menu item
    }
  }}
  aria-expanded={menuOpen}
  aria-haspopup="true"
>
  Menu
</button>

<ul role="menu" hidden={!menuOpen}>
  <li role="menuitem">
    <a href="#" onKeyDown={(e) => {
      if (e.key === 'ArrowDown') {/* Focus next */}
      if (e.key === 'ArrowUp') {/* Focus previous */}
      if (e.key === 'Escape') setMenuOpen(false);
    }}>
      Item 1
    </a>
  </li>
</ul>

5. MODAL/DIALOG:
useEffect(() => {
  if (modalOpen) {
    // Trap focus inside modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'Tab') {
        // Trap focus within modal
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }
}, [modalOpen]);

6. CAROUSEL/GALLERY:
<button onClick={prevSlide} aria-label="Previous slide">
  <ChevronLeft />
</button>
<button onClick={nextSlide} aria-label="Next slide">
  <ChevronRight />
</button>

<div role="region" aria-label="Gallery carousel" onKeyDown={(e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
}}>
  {/* Carousel content */}
</div>

FOCUS VISIBLE STYLES (globals.css):
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline, use custom ring */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

TAILWIND FOCUS CLASSES:
<button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">

CRITICAL RULES:
1. All interactive elements must have tabIndex (0 for in flow, -1 for out of flow)
2. All custom interactive elements need onKeyDown handler for Enter/Space
3. Escape key must close modals, menus, dropdowns
4. Arrow keys should navigate within menus, carousels
5. Focus must be visible (outline or ring)
6. Skip links must be first focusable element
7. Tab order must be logical (top to bottom, left to right)

VERIFICATION:
□ Tab through entire page (no keyboard traps)
□ Enter/Space activates all buttons and links
□ Escape closes modals/menus
□ Arrow keys navigate carousels/menus
□ Focus visible on all interactive elements
□ Tab order is logical
□ Test without mouse (keyboard only)
`;
}

/**
 * GAP 45: Focus Trap for Modals/Lightboxes
 */
function buildFocusTrapInstructions(): string {
  return `
==================================================
GAP 45: FOCUS TRAP (Modals, Lightboxes, Drawers)
==================================================

WHY FOCUS TRAP:
- When modal opens, focus should be trapped inside modal
- User shouldn't be able to Tab to elements behind modal
- Escape key should close modal

IMPLEMENTATION (use react-focus-lock OR custom):

OPTION 1: react-focus-lock (Recommended):
npm install react-focus-lock

import FocusLock from 'react-focus-lock';

<FocusLock autoFocus returnFocus>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Modal Title</h2>
    <p>Modal content</p>
    <button onClick={closeModal}>Close</button>
  </div>
</FocusLock>

OPTION 2: Custom Focus Trap:
useEffect(() => {
  if (!modalOpen) return;

  const modal = document.getElementById('modal');
  const focusableElements = modal?.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  // Focus first element
  firstElement?.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: If on first element, jump to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: If on last element, jump to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };

  document.addEventListener('keydown', handleTab);
  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('keydown', handleTab);
    document.removeEventListener('keydown', handleEscape);
  };
}, [modalOpen]);

MODAL STRUCTURE:
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  id="modal"
  className="fixed inset-0 z-50 flex items-center justify-center"
>
  {/* Backdrop */}
  <div 
    className="absolute inset-0 bg-black/50"
    onClick={closeModal}
    aria-hidden="true"
  />
  
  {/* Modal Content */}
  <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
    <h2 id="modal-title" className="text-2xl font-bold mb-4">
      Modal Title
    </h2>
    
    <p>Modal content here</p>
    
    <button 
      onClick={closeModal}
      className="absolute top-4 right-4"
      aria-label="Close modal"
    >
      <X className="size-6" />
    </button>
  </div>
</div>

LIGHTBOX EXAMPLE:
<FocusLock autoFocus returnFocus>
  <div role="dialog" aria-modal="true" aria-label="Image lightbox">
    <img src={currentImage} alt={currentImageAlt} />
    
    <button onClick={prevImage} aria-label="Previous image">
      <ChevronLeft />
    </button>
    
    <button onClick={nextImage} aria-label="Next image">
      <ChevronRight />
    </button>
    
    <button onClick={closeLightbox} aria-label="Close lightbox">
      <X />
    </button>
  </div>
</FocusLock>

CRITICAL RULES:
1. Use role="dialog" and aria-modal="true"
2. Use aria-labelledby or aria-label to describe modal
3. Trap focus inside modal (Tab cycles within modal)
4. Escape key closes modal
5. Return focus to trigger element when modal closes
6. Backdrop should be aria-hidden="true"

VERIFICATION:
□ Tab stays within modal (doesn't escape to background)
□ Shift+Tab cycles backward within modal
□ Escape closes modal
□ Focus returns to trigger element after closing
□ Screen reader announces modal role and label
`;
}

/**
 * GAP 46: Screen Reader Text
 */
function buildScreenReaderTextInstructions(): string {
  return `
==================================================
GAP 46: SCREEN READER ONLY TEXT (WCAG 1.3.1)
==================================================

WHY SCREEN READER TEXT:
- Provide context for screen reader users that sighted users don't need
- Example: "Read more" link → "Read more about [service name]"

SR-ONLY UTILITY (globals.css):
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: initial;
  margin: initial;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

TAILWIND BUILT-IN:
<span className="sr-only">Screen reader only text</span>

USE CASES:

1. ICON-ONLY BUTTONS:
<button aria-label="Close modal">
  <X className="size-6" />
  <span className="sr-only">Close modal</span>
</button>

2. GENERIC "READ MORE" LINKS:
<a href="/services/photography">
  Read more
  <span className="sr-only"> about wedding photography</span>
</a>

3. FORM LABELS (when visual label is hidden):
<div>
  <label htmlFor="email" className="sr-only">Email address</label>
  <input 
    id="email" 
    type="email" 
    placeholder="Email address"
    aria-label="Email address"
  />
</div>

4. SKIP LINKS:
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
  Skip to main content
</a>

5. LOADING/STATUS INDICATORS:
<div role="status" aria-live="polite">
  <Spinner className="animate-spin" />
  <span className="sr-only">Loading...</span>
</div>

6. PAGINATION:
<nav aria-label="Pagination">
  <a href="?page=1" aria-label="Go to page 1">
    1
  </a>
  <span aria-current="page" aria-label="Current page, page 2">
    2
  </span>
  <a href="?page=3" aria-label="Go to page 3">
    3
  </a>
</nav>

7. SOCIAL ICONS:
<a href="https://facebook.com/business" aria-label="Visit us on Facebook">
  <Facebook className="size-6" />
  <span className="sr-only">Facebook</span>
</a>

CRITICAL RULES:
1. ALWAYS add sr-only text to icon-only buttons
2. ALWAYS make generic links descriptive ("Read more about X")
3. NEVER hide important content with sr-only (only use for extra context)
4. Use aria-label OR sr-only (not both)
5. Test with screen reader (NVDA, VoiceOver)

VERIFICATION:
□ All icon-only buttons have aria-label or sr-only
□ All "Read more" links are descriptive
□ Skip link works (Tab to focus, Enter to jump)
□ Social icons have descriptive labels
□ Test with NVDA (Windows) or VoiceOver (Mac)
`;
}

/**
 * GAP 47: Color Contrast Ratios
 */
function buildColorContrastInstructions(): string {
  return `
==================================================
GAP 47: COLOR CONTRAST RATIOS (WCAG 1.4.3)
==================================================

WCAG AA REQUIREMENTS:
- Normal text (< 18px): 4.5:1 contrast ratio
- Large text (≥ 18px OR ≥ 14px bold): 3:1 contrast ratio
- UI components (buttons, form inputs): 3:1 contrast ratio

WCAG AAA REQUIREMENTS (Aspirational):
- Normal text: 7:1 contrast ratio
- Large text: 4.5:1 contrast ratio

COLOR CONTRAST CHECKER:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect element → Accessibility tab → Contrast ratio

COMMON VIOLATIONS:

1. LIGHT TEXT ON WHITE BACKGROUND:
❌ BAD: #999999 on #FFFFFF (2.8:1 - FAIL)
✅ GOOD: #666666 on #FFFFFF (5.7:1 - PASS)

2. DARK TEXT ON DARK BACKGROUND:
❌ BAD: #333333 on #000000 (5.7:1 - FAIL for UI)
✅ GOOD: #FFFFFF on #000000 (21:1 - PASS)

3. COLORED TEXT ON COLORED BACKGROUND:
❌ BAD: #FF6B6B on #FFF5F5 (1.8:1 - FAIL)
✅ GOOD: #DC2626 on #FFF5F5 (5.2:1 - PASS)

4. PRIMARY BUTTON:
❌ BAD: #FFEB3B (yellow) with white text (1.2:1 - FAIL)
✅ GOOD: #0EA5E9 (blue) with white text (4.5:1 - PASS)

COLOR PALETTE VALIDATION:

PRIMARY (Buttons, Links):
- If background is dark → Use light text (#FFFFFF)
- If background is light → Use dark text (#000000 or #1A1A1A)
- Test: Check contrast ratio with WebAIM

SECONDARY (Muted Text):
- Minimum: #666666 on #FFFFFF (5.7:1)
- Recommended: #4B5563 (gray-600) on #FFFFFF (7.5:1)

ACCENT (Badges, Highlights):
- Must meet 3:1 contrast against background
- Example: #F59E0B (amber-500) on #FFFBF5 (cream) = 4.2:1 ✅

CSS CUSTOM PROPERTIES WITH CONTRAST GUARDS:
:root {
  --color-primary: #0EA5E9;
  --color-on-primary: #FFFFFF; /* Always sufficient contrast */
  --color-secondary: #6366F1;
  --color-on-secondary: #FFFFFF;
  --color-bg: #FFFFFF;
  --color-text: #1A1A1A; /* 16.1:1 on white */
  --color-muted: #6B7280; /* 4.6:1 on white */
}

TAILWIND COLOR RECOMMENDATIONS:
- Text: text-gray-900 (very dark) or text-gray-800
- Muted text: text-gray-600 or text-gray-500 (test first!)
- Links: text-blue-600 (sufficient contrast on white)
- Buttons: bg-blue-600 text-white (sufficient contrast)

VERIFICATION TOOLS:
1. axe DevTools (Chrome extension)
2. WAVE (Web Accessibility Evaluation Tool)
3. WebAIM Contrast Checker
4. Chrome DevTools Accessibility Panel

CRITICAL RULES:
1. ALWAYS check contrast ratios for text
2. Body text must be at least 4.5:1 (WCAG AA)
3. UI components (buttons) must be at least 3:1
4. Don't rely on color alone (use icons, labels, patterns)
5. Test with color blindness simulators

VERIFICATION:
□ All body text meets 4.5:1 contrast
□ All UI components meet 3:1 contrast
□ Run axe DevTools (0 contrast violations)
□ Test with WebAIM Contrast Checker
□ Simulate color blindness (Chrome DevTools → Rendering → Emulate vision deficiencies)
`;
}

/**
 * GAP 48: Alt Text Writing Guidelines
 */
function buildAltTextInstructions(): string {
  return `
==================================================
GAP 48: ALT TEXT WRITING GUIDELINES (WCAG 1.1.1)
==================================================

WHY ALT TEXT MATTERS:
- Screen readers read alt text aloud
- Alt text displays when image fails to load
- Search engines use alt text for SEO
- Required by WCAG 2.1 Level A

ALT TEXT RULES:

1. BE DESCRIPTIVE, NOT LITERAL:
❌ BAD: alt="IMG_1234.jpg"
❌ BAD: alt="image"
✅ GOOD: alt="Bride and groom walking down the aisle at outdoor wedding ceremony"

2. INCLUDE CONTEXT:
❌ BAD: alt="Wedding"
✅ GOOD: alt="Intimate backyard wedding ceremony in Pretoria, South Africa"

3. DECORATIVE IMAGES → EMPTY ALT:
<div style={{ backgroundImage: 'url(...)' }} role="img" aria-label=""></div>
OR
<img src="decorative-border.svg" alt="" />

4. FUNCTIONAL IMAGES → DESCRIBE FUNCTION:
<button>
  <img src="close-icon.svg" alt="Close modal" />
</button>

5. COMPLEX IMAGES → PROVIDE LONG DESCRIPTION:
<img 
  src="chart.png" 
  alt="Bar chart showing monthly revenue growth from January to December 2024"
  aria-describedby="chart-description"
/>
<p id="chart-description" className="sr-only">
  Detailed description: Revenue started at R50,000 in January...
</p>

ALT TEXT FORMULAS BY IMAGE TYPE:

PORTRAITS/PEOPLE:
"[Person name], [role/title], [context]"
Example: "Sarah Johnson, professional photographer, holding camera at outdoor photo shoot"

PRODUCTS:
"[Product name], [key features], [context]"
Example: "Chocolate wedding cake with three tiers, decorated with fresh roses and gold leaf"

BEFORE/AFTER:
"Before: [description] / After: [description]"
Example: "Before: Overgrown garden with weeds / After: Manicured lawn with flower beds"

EVENTS:
"[Event type] at [location], showing [key elements]"
Example: "Corporate team-building event at Sandton Convention Centre, team members collaborating on strategy exercise"

ARCHITECTURE/INTERIORS:
"[Room/building type], [style], [key features]"
Example: "Modern open-plan kitchen with white marble countertops, stainless steel appliances, and island seating"

FOOD:
"[Dish name], [key ingredients/presentation]"
Example: "Grilled salmon fillet with roasted vegetables and lemon herb butter"

LANDSCAPES:
"[Location/scene], [time of day], [notable features]"
Example: "Table Mountain at sunset, viewed from Camps Bay beach with orange and purple sky"

SERVICES (ABSTRACT):
"[Service action/outcome], [industry context]"
Example: "Security guard monitoring CCTV screens in control room"

ALT TEXT DON'TS:
❌ Don't start with "Image of" or "Picture of" (screen readers already announce "image")
❌ Don't use ALL CAPS (screen readers may spell out letters)
❌ Don't exceed 125 characters (screen readers may cut off)
❌ Don't include file names or technical details
❌ Don't repeat caption text (if caption is visible)

ALT TEXT LENGTH:
- Aim for 125 characters or less
- If longer description needed, use aria-describedby

CRITICAL RULES:
1. EVERY image must have alt attribute (even if alt="")
2. Decorative images: alt=""
3. Functional images: Describe function, not appearance
4. Content images: Describe what's important in context
5. Include location for local businesses
6. Never leave alt text empty for content images

VERIFICATION:
□ All <img> tags have alt attribute
□ No alt text says "image" or "photo"
□ Decorative images have alt=""
□ Content images have descriptive alt text
□ Alt text is < 125 characters
□ Run axe DevTools (0 missing alt text violations)
`;
}

/**
 * GAP 49: Form Error Announcement Strategy
 */
function buildFormErrorInstructions(): string {
  return `
==================================================
GAP 49: FORM ERROR ANNOUNCEMENT (WCAG 3.3.1, 3.3.3)
==================================================

WHY ERROR ANNOUNCEMENTS MATTER:
- Screen reader users can't see red error messages
- Errors must be announced programmatically
- Errors must be associated with form fields

FORM ERROR PATTERN:

1. FIELD-LEVEL ERRORS (Real-time validation):
<div>
  <label htmlFor="email">Email address</label>
  <input 
    id="email"
    type="email"
    aria-invalid={emailError ? 'true' : 'false'}
    aria-describedby={emailError ? 'email-error' : undefined}
    className={emailError ? 'border-red-500' : 'border-gray-300'}
  />
  {emailError && (
    <p id="email-error" role="alert" className="text-red-600 text-sm mt-1">
      {emailError}
    </p>
  )}
</div>

2. FORM-LEVEL ERRORS (Submit validation):
{formErrors.length > 0 && (
  <div 
    role="alert" 
    aria-live="assertive" 
    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
  >
    <h3 className="font-bold text-red-800 mb-2">
      {formErrors.length} error{formErrors.length > 1 ? 's' : ''} found:
    </h3>
    <ul className="list-disc list-inside text-red-700">
      {formErrors.map((error, i) => (
        <li key={i}>{error}</li>
      ))}
    </ul>
  </div>
)}

3. SUCCESS CONFIRMATION:
{submitted && (
  <div 
    role="status" 
    aria-live="polite" 
    className="bg-green-50 border border-green-200 rounded-lg p-4"
  >
    <p className="text-green-800">
      ✓ Form submitted successfully! We'll get back to you within 24 hours.
    </p>
  </div>
)}

ARIA LIVE REGIONS:

role="alert" (Assertive):
- Announces immediately, interrupts screen reader
- Use for ERRORS

role="status" (Polite):
- Announces after current speech
- Use for SUCCESS, INFO, WARNINGS

aria-live="assertive":
- Same as role="alert"
- Use for critical errors

aria-live="polite":
- Same as role="status"
- Use for non-critical updates

COMPLETE FORM EXAMPLE:
<form onSubmit={handleSubmit}>
  {/* Form-level error summary */}
  {formErrors.length > 0 && (
    <div role="alert" className="bg-red-50 p-4 mb-4 rounded-lg">
      <h3>Please fix the following errors:</h3>
      <ul>
        {formErrors.map(error => <li key={error}>{error}</li>)}
      </ul>
    </div>
  )}

  {/* Name field */}
  <div>
    <label htmlFor="name">
      Name <span aria-label="required">*</span>
    </label>
    <input 
      id="name"
      type="text"
      required
      aria-required="true"
      aria-invalid={nameError ? 'true' : 'false'}
      aria-describedby={nameError ? 'name-error' : 'name-hint'}
    />
    <p id="name-hint" className="text-sm text-gray-600">
      Enter your full name
    </p>
    {nameError && (
      <p id="name-error" role="alert" className="text-red-600 text-sm">
        {nameError}
      </p>
    )}
  </div>

  {/* Email field */}
  <div>
    <label htmlFor="email">
      Email <span aria-label="required">*</span>
    </label>
    <input 
      id="email"
      type="email"
      required
      aria-required="true"
      aria-invalid={emailError ? 'true' : 'false'}
      aria-describedby={emailError ? 'email-error' : 'email-hint'}
    />
    <p id="email-hint" className="text-sm text-gray-600">
      We'll never share your email
    </p>
    {emailError && (
      <p id="email-error" role="alert" className="text-red-600 text-sm">
        {emailError}
      </p>
    )}
  </div>

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>

ERROR MESSAGE WRITING:

❌ BAD: "Invalid"
✅ GOOD: "Please enter a valid email address"

❌ BAD: "Required"
✅ GOOD: "Name is required"

❌ BAD: "Error"
✅ GOOD: "Password must be at least 8 characters"

CRITICAL RULES:
1. Use aria-invalid="true" on fields with errors
2. Use aria-describedby to link error message to field
3. Use role="alert" for errors (announced immediately)
4. Use role="status" for success messages (polite)
5. Error messages must be visible AND announced
6. Required fields must have aria-required="true"
7. Focus first error field after submit

VERIFICATION:
□ All required fields have aria-required="true"
□ Error messages have role="alert"
□ Error messages are linked with aria-describedby
□ Fields with errors have aria-invalid="true"
□ Success messages have role="status"
□ Test with screen reader (NVDA, VoiceOver)
□ Form errors are announced on submit
`;
}
