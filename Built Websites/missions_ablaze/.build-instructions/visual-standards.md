# Visual Standards

## Adaptive Surface Contrast

Do NOT use a single background color across all sections.
Alternate background tones between adjacent sections:
- Main content: Pure backgrounds (#FFFFFF or #FAFAFA)
- Secondary sections: Light tint (#F8FAFC, #F1F5F9, #F0FDF4)
- Use subtle borders or shadow differences between sections

## Card Geometry

- Creative/Youth/Tech: Maximum curvature (rounded-full / pill)
- Medical/Legal/Corporate: Balanced curvature (rounded-xl or rounded-2xl)
- Ensure text wrapping scales with curvature

## Typography Contrast

- Section Headings: letter-spacing -0.025em, font-bold, deep contrast (#111827)
- Body Text: line-height 1.6-1.75, dark-neutral (#374151)
- Consistent vertical rhythm

## Micro-Interactions

- All actionable cards: Subtle hover states
- Hover: translate-y-[-2px] + soft shadow
- Transition: 200-300ms ease-out
- No layout shift

## WCAG Contrast Guards

When header is transparent over hero:
- Dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- backdrop-blur-md for depth
- All nav text: minimum 4.5:1 contrast ratio
- On scroll: transition to solid background

## Image Treatment

- Hero images: Dark gradient overlay for text readability
- Gallery images: Subtle hover scale (1.05x) with overlay
- Service images: Consistent aspect ratios
- All images: Descriptive alt text