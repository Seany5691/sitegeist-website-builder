"use strict";
/**
 * Micro-Interaction Enhancement Helpers for Prompt Builder
 * Implements GAP 50, 55: Hover state timing, toast notifications
 * (GAP 51-54 covered in previous gaps)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMicroInteractionSpecifications = buildMicroInteractionSpecifications;
function buildMicroInteractionSpecifications() {
    return `
==================================================
MICRO-INTERACTIONS & POLISH
==================================================

${buildHoverStateInstructions()}

${buildToastNotificationInstructions()}
`;
}
/**
 * GAP 50: Hover State Timing Specifications
 */
function buildHoverStateInstructions() {
    return `
==================================================
GAP 50: HOVER STATE TIMING & ANIMATION SPECS
==================================================

WHY HOVER TIMING MATTERS:
- Too fast: Jarring, distracting
- Too slow: Feels sluggish, unresponsive
- Optimal: 150-300ms for most interactions

HOVER TIMING SCALE:

1. INSTANT (0ms) - No transition:
   - Text color changes
   - Cursor changes
   Example: cursor-pointer (no transition needed)

2. SNAPPY (150ms) - Quick feedback:
   - Button background changes
   - Link underlines
   - Icon color changes
   Example: transition-colors duration-150

3. SMOOTH (200-250ms) - Standard interactions:
   - Card hover effects (scale, translate)
   - Shadow elevation
   - Border changes
   Example: transition-all duration-200

4. GENTLE (300ms) - Elegant, subtle:
   - Image zoom/scale
   - Complex transform animations
   - Fade in/out
   Example: transition-transform duration-300

5. SLOW (400-500ms) - Intentional, dramatic:
   - Hero section parallax
   - Page transitions
   - Modal open/close
   Example: transition-all duration-500

EASING FUNCTIONS:

linear: Constant speed (rarely used)
- Example: Progress bars, loading spinners

ease: Default (slow start, fast middle, slow end)
- Example: Most hover effects

ease-in: Slow start, fast end
- Example: Dropdown menus appearing

ease-out: Fast start, slow end (MOST COMMON)
- Example: Buttons, cards, links (feels responsive)

ease-in-out: Slow start and end, fast middle
- Example: Modal animations, page transitions

cubic-bezier(0.16, 1, 0.3, 1): Custom "Bounce-out" (Apple-style)
- Example: Premium feel, hero animations

COMPONENT-SPECIFIC TIMING:

1. BUTTONS:
<button className="
  bg-primary text-white px-6 py-3 rounded-lg
  transition-colors duration-150 ease-out
  hover:bg-primary/90
  active:scale-95 active:duration-100
">
  Click Me
</button>

CSS:
.button {
  transition: background-color 150ms ease-out,
              transform 100ms ease-out;
}
.button:hover {
  background-color: ...;
}
.button:active {
  transform: scale(0.95);
}

2. CARDS:
<div className="
  group p-6 bg-white rounded-xl shadow-md
  transition-all duration-200 ease-out
  hover:-translate-y-1 hover:shadow-xl
">
  <img className="
    transition-transform duration-300 ease-out
    group-hover:scale-105
  " />
</div>

CSS:
.card {
  transition: transform 200ms ease-out,
              box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: ...;
}
.card img {
  transition: transform 300ms ease-out;
}
.card:hover img {
  transform: scale(1.05);
}

3. LINKS:
<a className="
  relative text-primary
  after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
  after:bg-primary after:transition-all after:duration-200 after:ease-out
  hover:after:w-full
">
  Link Text
</a>

CSS:
.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: width 200ms ease-out;
}
.link:hover::after {
  width: 100%;
}

4. IMAGES (Gallery):
<div className="overflow-hidden rounded-lg">
  <img className="
    transition-transform duration-300 ease-out
    hover:scale-110
  " />
</div>

5. ICONS (Micro-interactions):
<button>
  <Heart className="
    transition-all duration-200 ease-out
    hover:scale-110 hover:text-red-500
  " />
</button>

6. NAVIGATION LINKS:
<a className="
  relative py-2 px-4
  transition-colors duration-150 ease-out
  hover:text-primary
  after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5
  after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 after:ease-out
  hover:after:scale-x-100
">
  Nav Link
</a>

7. DROPDOWN MENU:
<div className="
  absolute top-full left-0 mt-2
  opacity-0 scale-95 pointer-events-none
  transition-all duration-200 ease-out
  group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
">
  Dropdown Content
</div>

MOBILE CONSIDERATIONS:

DISABLE HOVER ON TOUCH DEVICES:
@media (hover: hover) {
  .card:hover {
    transform: translateY(-4px);
  }
}

/* OR in Tailwind: */
<div className="md:hover:-translate-y-1">
  {/* Only apply hover on devices with mouse */}
</div>

TAILWIND TRANSITION CLASSES:
- transition-none: No transition
- transition-all: All properties
- transition-colors: Color properties only
- transition-opacity: Opacity only
- transition-transform: Transform only
- transition-shadow: Box-shadow only

- duration-75: 75ms
- duration-100: 100ms
- duration-150: 150ms (buttons, links)
- duration-200: 200ms (cards, most interactions)
- duration-300: 300ms (images, complex animations)
- duration-500: 500ms (modals, page transitions)
- duration-700: 700ms (hero parallax)

- ease-linear: linear
- ease-in: ease-in
- ease-out: ease-out (MOST COMMON)
- ease-in-out: ease-in-out

CRITICAL RULES:
1. Buttons: 150ms ease-out (feels responsive)
2. Cards: 200ms ease-out (smooth elevation)
3. Images: 300ms ease-out (elegant zoom)
4. Use ease-out for 90% of hover effects
5. Disable hover on touch devices (@media (hover: hover))
6. Always include transition property (not just :hover state)
7. Active state should be faster (100ms)

VERIFICATION:
□ All hover effects have transition timing specified
□ Buttons transition in 150ms
□ Cards transition in 200ms
□ Images transition in 300ms
□ Hover disabled on mobile (@media (hover: hover))
□ Active states are faster than hover states
□ No jarring animations (too fast) or sluggish animations (too slow)
`;
}
/**
 * GAP 55: Toast Notification Positioning/Timing
 */
function buildToastNotificationInstructions() {
    return `
==================================================
GAP 55: TOAST NOTIFICATION SPECIFICATIONS
==================================================

TOAST POSITIONING:

Desktop (≥ 768px):
- Position: Fixed top-right
- Offset: top: 1rem, right: 1rem
- Stack: Vertically downward
- Max visible: 5 toasts

Mobile (< 768px):
- Position: Fixed bottom-center
- Offset: bottom: 1rem, left: 1rem, right: 1rem
- Stack: Vertically upward
- Max visible: 3 toasts

TOAST TIMING:

Auto-dismiss Duration:
- Success: 3000ms (3 seconds)
- Info: 4000ms (4 seconds)
- Warning: 5000ms (5 seconds)
- Error: 7000ms (7 seconds)
- Critical error: No auto-dismiss (manual close only)

Animation Duration:
- Enter: 300ms ease-out
- Exit: 300ms ease-in
- Progress bar: Matches auto-dismiss duration (linear)

TOAST STRUCTURE:

<div className="fixed z-50 md:top-4 md:right-4 md:bottom-auto md:left-auto bottom-4 left-4 right-4 top-auto">
  {toasts.map(toast => (
    <div 
      key={toast.id}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="
        mb-3 p-4 rounded-lg shadow-lg
        flex items-start gap-3
        animate-slide-in
        bg-white dark:bg-gray-800
      "
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {toast.type === 'success' && <CheckCircle className="size-5 text-green-500" />}
        {toast.type === 'error' && <XCircle className="size-5 text-red-500" />}
        {toast.type === 'warning' && <AlertTriangle className="size-5 text-amber-500" />}
        {toast.type === 'info' && <Info className="size-5 text-blue-500" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
        
        {/* Progress bar (if auto-dismiss) */}
        {toast.duration && (
          <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary animate-progress"
              style={{ animationDuration: \`\${toast.duration}ms\` }}
            />
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="
          flex-shrink-0 size-8 flex items-center justify-center
          rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150
        "
      >
        <X className="size-4" />
      </button>
    </div>
  ))}
</div>

ANIMATIONS (globals.css):

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slide-in {
  animation: slide-in 300ms ease-out;
}

.animate-slide-out {
  animation: slide-out 300ms ease-in;
}

.animate-progress {
  animation: progress linear;
}

/* Mobile: Slide from bottom */
@media (max-width: 767px) {
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(100%);
    }
  }
}

ZUSTAND TOAST STORE (lib/use-toast.ts):

import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const AUTO_DISMISS_DURATIONS = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 7000,
};

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = toast.duration ?? AUTO_DISMISS_DURATIONS[toast.type];
    
    set((state) => {
      const newToasts = [...state.toasts, { ...toast, id, duration }];
      // Limit to 5 toasts (desktop) or 3 (mobile)
      const maxToasts = window.innerWidth >= 768 ? 5 : 3;
      return {
        toasts: newToasts.slice(-maxToasts),
      };
    });
    
    // Auto-dismiss
    if (duration) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearAll: () => set({ toasts: [] }),
}));

// Convenience functions
export const toast = {
  success: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'success', title, message });
  },
  
  error: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'error', title, message });
  },
  
  warning: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'warning', title, message });
  },
  
  info: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'info', title, message });
  },
};

USAGE IN COMPONENTS:

import { toast } from '@/lib/use-toast';

function ContactForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitForm(formData);
      toast.success(
        'Message sent!',
        "We'll get back to you within 24 hours."
      );
    } catch (error) {
      toast.error(
        'Submission failed',
        'Please try again or call us directly.'
      );
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

ACCESSIBILITY:

role="alert" (Errors):
- Announced immediately
- Interrupts screen reader

role="status" (Success, Info, Warning):
- Announced politely
- Doesn't interrupt

aria-live="assertive" (Errors):
- Same as role="alert"

aria-live="polite" (Others):
- Same as role="status"

CRITICAL RULES:
1. Desktop: top-right, mobile: bottom-center
2. Auto-dismiss: 3s (success), 4s (info), 5s (warning), 7s (error)
3. Max visible: 5 (desktop), 3 (mobile)
4. Animation: 300ms slide-in/out
5. Progress bar: Linear animation matching duration
6. Close button: 44x44px touch target
7. Use role="alert" for errors, role="status" for others
8. Include icon for visual identification

VERIFICATION:
□ Toasts appear in correct position (top-right/bottom-center)
□ Auto-dismiss after correct duration
□ Progress bar animates correctly
□ Close button works (44x44px touch target)
□ Maximum toast limit enforced
□ Smooth enter/exit animations
□ Screen reader announces toasts
□ Color contrast meets WCAG AA
`;
}
