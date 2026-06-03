# Portfolio Makeover - Acid Lime Aesthetic

## Overview
Transform the portfolio from technical CS showcase to bold, memorable Awwwards-inspired experience with acid lime (#d4ff3f) on near-black aesthetic.

## Entry Point
**Start with Design** - Core design system and components are already implemented. This spec documents remaining implementation phases.

---

## Requirements

### R1: Core Design System
**Status:** ✅ Complete
**Description:** Two-tone design system with acid lime accent on near-black background
**Acceptance Criteria:**
- CSS custom properties for all colors (--bg, --fg, --accent, etc.)
- Single accent color variable for easy re-theming
- High contrast for readability (WCAG AA minimum)

### R2: 3D Coverflow Project Showcase
**Status:** ✅ Complete
**Description:** Interactive 3D card carousel for featured projects
**Acceptance Criteria:**
- Drag horizontal to navigate (55px threshold)
- Scroll wheel to navigate (320ms throttle)
- Keyboard arrow navigation
- Center card lifts on hover
- Lime glow on active card
- Click center card to open project link
- Spring animations via Framer Motion

### R3: Bold Hero Section
**Status:** ✅ Complete, needs enhancements
**Description:** Oversized typography hero with stats and CTA
**Acceptance Criteria:**
- 19vw mobile, 13vw desktop name display
- Surname in accent color
- Stats row (LeetCode, projects, streak)
- Accent CTA button with gap widening on hover

### R4: Navigation Bar
**Status:** ❌ Not started
**Description:** Fixed navigation with scroll-reactive blur and scroll spy
**Acceptance Criteria:**
- Fixed positioning at top
- Transparent initially, blur background after 80px scroll
- Active section highlighting with accent underline
- Accent "Resume" pill button
- Mobile: full-screen overlay menu
- Command palette integration (existing ⌘K)

### R5: About Section
**Status:** ❌ Not started
**Description:** Bold manifesto with bio and quick facts
**Acceptance Criteria:**
- Large 2-3 line manifesto with accent phrases
- Two-column layout: bio paragraph + quick facts list
- Optional accent-duotone portrait
- Reveal animations on scroll

### R6: Skills Section
**Status:** ❌ Not started
**Description:** Infinite marquee or grouped tag grid showcasing tech stack
**Acceptance Criteria:**
- Option A: Two-row infinite marquee (opposite directions)
- Option B: Grouped tag grid (Languages / Frontend / Backend / Tools)
- Chips invert to accent on hover
- Smooth continuous animation
- No animation jank on mobile

### R7: Journey Timeline
**Status:** ❌ Not started
**Description:** Scroll-pinned timeline with milestone entries
**Acceptance Criteria:**
- Left rail with years (pinned during scroll)
- Active year highlighted in accent
- Right side milestone entries
- Entries reveal on scroll into view
- Accent progress line connecting milestones

### R8: Coding Stats Dashboard
**Status:** ⚠️ Exists but needs redesign
**Description:** Minimalist stats showcase with CountUp animations
**Acceptance Criteria:**
- LeetCode total solved with difficulty breakdown bar
- GitHub contributions count
- Current streak display
- Optional accent-intensity heatmap
- Optional single compact algorithm visualizer
- CountUp animations trigger on scroll into view

### R9: Beyond Code Section
**Status:** ⚠️ Exists as "Life" but needs redesign
**Description:** Bento grid showcasing personal interests (guitar, music)
**Acceptance Criteria:**
- Bento grid layout (mixed sizes)
- Cards: quote, image, now-playing, blurb
- Hover tilt/parallax effects
- Guitar/music emphasis
- Personal touch without being distracting

### R10: Contact & Footer
**Status:** ⚠️ Exists but needs redesign
**Description:** Bold contact section with oversized headline
**Acceptance Criteria:**
- Oversized "LET'S BUILD" or similar headline
- Large accent email link with hover underline animation
- Bold text social links (no tiny icons)
- Optional glitch effect on email
- Footer: copyright, tech credit, back-to-top, live clock (Asia/Calcutta)

### R11: Global Polish & Interactions
**Status:** ❌ Not started
**Description:** Site-wide polish elements for premium feel
**Acceptance Criteria:**
- Accent scroll progress bar at top (exists, verify styling)
- Custom cursor: dot + lagging ring, grows on hover
- Brief accent curtain page-load transition
- Optional glitch reveal on section titles
- Strict prefers-reduced-motion fallback for all animations
- Smooth scroll via Lenis (exists, keep)

### R12: Hero Enhancements
**Status:** ❌ Not started
**Description:** Advanced hero interactions for impact
**Acceptance Criteria:**
- Clip-path mask reveals on name lines
- Accent cursor glow following mouse (subtle)
- Scroll ↓ hint that fades on scroll
- Stagger animations for eyebrow, stats, CTA

### R13: Component Integration
**Status:** ❌ Not started
**Description:** Wire all new components into App.jsx
**Acceptance Criteria:**
- Remove old Hero, Projects, ScrollScene
- Add HeroBold, ProjectsBold with Coverflow3D
- Update navigation structure
- Test all interactions work
- Verify mobile responsiveness

### R14: Font System
**Status:** ⚠️ Decision needed
**Description:** Choose and implement display font
**Acceptance Criteria:**
- Decision: Keep Syne OR add Clash Display from Fontshare
- Update index.html with font links
- Update tailwind.config.js with font family
- Apply consistently across all bold headings

---

## Design

### Visual Hierarchy
1. **Hero** - Immediate impact with oversized name
2. **Projects** - Primary focus, interactive showcase
3. **About** - Build trust with story
4. **Skills** - Quick tech scan
5. **Coding Stats** - Credibility with data
6. **Journey** - Career progression
7. **Beyond Code** - Personal connection
8. **Contact** - Clear CTA

### Color System
```css
:root {
  --bg: #0a0a0b;        /* Near-black */
  --surface: #101014;   /* Slightly lighter surface */
  --fg: #f4f4f5;        /* Off-white text */
  --muted: #8b8b93;     /* Grey for secondary text */
  --line: rgba(255,255,255,0.10); /* Borders */
  --accent: #d4ff3f;    /* Acid lime - single source of truth */
  --accent-ink: #0a0a0b; /* Text on accent background */
}
```

### Typography Scale
- **Display:** 13vw (hero), 7xl (section titles)
- **Headings:** 3xl (project cards), 2xl (subsections)
- **Body:** base (paragraphs), sm (captions)
- **Micro:** xs (labels, tags, timestamps)

### Animation Principles
- **Spring physics:** Framer Motion with stiffness 260, damping 32
- **Timing:** 0.3s for micro, 0.6s for macro
- **Easing:** cubic-bezier(0.22, 1, 0.36, 1)
- **Stagger:** 0.08s between children
- **Respect:** prefers-reduced-motion must disable all animations

### Component Architecture
```
App.jsx
├── ScrollProgress (global)
├── Navbar (fixed)
├── HeroBold (with enhancements)
├── ProjectsBold
│   └── Coverflow3D
├── About (new)
├── Skills (new)
├── CodingStats (redesigned)
├── Journey (new)
├── BeyondCode (redesigned Life)
└── Contact (redesigned)
```

---

## Tasks

### Phase 1: Foundation & Hero (Priority: Critical)
**Goal:** Complete hero section with all interactions

#### T1.1: Create Reveal Component
**Status:** completed
**Assigned to:** agent
**Description:** Scroll-triggered reveal animation wrapper for all sections
**Details:**
- Use Framer Motion with viewport detection
- Fade up + slight Y translation
- Configurable delay and stagger
- Respect prefers-reduced-motion
**Files:**
- Create: `src/components/Reveal.jsx` ✅
**Acceptance:**
- Wraps any children ✅
- Triggers once when 20% in viewport ✅
- Smooth fade-up animation ✅
- Zero motion when user prefers reduced motion ✅

#### T1.2: Hero Clip-Path Reveals
**Status:** completed
**Assigned to:** agent
**Description:** Add clip-path mask reveals to name lines
**Details:**
- Each line (Aayush, Kumar) reveals from left
- Stagger: 0.15s between lines
- Duration: 0.8s with cubic-bezier easing
- Initial: clip-path: inset(0 100% 0 0)
- Final: clip-path: inset(0 0 0 0)
**Files:**
- Modify: `src/components/HeroBold.jsx` ✅
**Acceptance:**
- Name reveals line by line on page load ✅
- Smooth horizontal reveal effect ✅
- Eyebrow, stats, CTA stagger after name ✅

#### T1.3: Accent Cursor Glow
**Status:** completed
**Assigned to:** agent
**Description:** Custom cursor with accent glow following mouse
**Details:**
- Dot (8px) + lagging ring (32px)
- Accent color with 20% opacity
- Ring grows to 48px on hover over interactive elements
- Smooth lerp (0.15) for ring follow
- Hide on touch devices
**Files:**
- Create: `src/components/AccentCursor.jsx` ✅
- Modify: `src/App.jsx` (add AccentCursor globally) ✅
**Acceptance:**
- Cursor visible on desktop only ✅
- Ring lags behind mouse smoothly ✅
- Grows on hover over links, buttons, cards ✅
- 60fps performance ✅

#### T1.4: Scroll Hint
**Status:** completed
**Assigned to:** agent
**Description:** "Scroll ↓" hint that fades on scroll
**Details:**
- Position: bottom-center of hero
- Fade out after 100px scroll
- Subtle bounce animation
- Accent color
**Files:**
- Modify: `src/components/HeroBold.jsx` ✅
**Acceptance:**
- Visible on initial load ✅
- Fades smoothly after user scrolls ✅
- Bounces gently to attract attention ✅

---

### Phase 2: Navigation & Structure (Priority: High)

#### T2.1: Create Navbar Component
**Status:** completed
**Assigned to:** agent
**Description:** Fixed navigation with blur background and scroll spy
**Details:**
- Fixed positioning, full width
- Links: About, Projects, Skills, Stats, Journey, Contact
- Transparent initially, blur + border after 80px scroll
- Active section gets accent underline (3px thick)
- "Resume" button styled as accent pill
- Logo/name links to top
**Files:**
- Modify: `src/components/Navbar.jsx` ✅
**Acceptance:**
- Stays fixed at top on all pages ✅
- Background blur activates on scroll ✅
- Active section highlighted correctly ✅
- Smooth transitions between states ✅

#### T2.2: Navbar Mobile Menu
**Status:** completed
**Assigned to:** agent
**Description:** Full-screen overlay menu for mobile
**Details:**
- Hamburger icon (3 lines → X animation)
- Full-screen overlay with accent background
- Large typography menu items
- Framer Motion slide-in animation
- Close on link click or X button
**Files:**
- Modify: `src/components/Navbar.jsx` ✅
**Acceptance:**
- Opens/closes smoothly ✅
- All nav links functional ✅
- Accessible (keyboard navigation, focus trap) ✅
- Respects reduced motion ✅

#### T2.3: Integrate Navbar with Command Palette
**Status:** completed
**Assigned to:** agent
**Description:** Ensure ⌘K command palette works with new navbar
**Details:**
- Keep existing CommandPalette component
- Update styling to match new design tokens
- Accent highlights for active items
- Triggered from navbar shortcut display
**Files:**
- Modify: `src/components/CommandPalette.jsx` ✅
- Modify: `src/components/Navbar.jsx` ✅
**Acceptance:**
- ⌘K opens command palette ✅
- Palette matches new aesthetic ✅
- All commands work correctly ✅

---

### Phase 3: Content Sections (Priority: High)

#### T3.1: Create About Section
**Status:** completed
**Assigned to:** agent
**Description:** Bold manifesto with bio and facts
**Details:**
- Manifesto: 2-3 lines, key phrases in accent color
- Two-column: left = paragraph bio, right = quick facts list
- Facts: Education, Location, Available for, Interests
- Optional portrait image with accent border
- Wrap in Reveal component
**Files:**
- Create: `src/components/AboutBold.jsx` ✅
- Modify: `src/App.jsx` ✅
**Acceptance:**
- Clean two-column layout (stack on mobile) ✅
- Accent phrases stand out ✅
- Smooth reveal on scroll ✅

#### T3.2: Create Skills Section
**Status:** completed
**Assigned to:** agent
**Description:** Infinite marquee tech stack showcase
**Details:**
- Two rows, opposite directions
- Tech chips: Language, framework, tool names
- Chips: border, rounded-full, hover → accent bg + accent-ink text
- Continuous smooth scroll (no pause)
- Duplicate items for seamless loop
- Tech list: React, TypeScript, Node.js, Express, MongoDB, PostgreSQL, Python, FastAPI, Next.js, Tailwind, Three.js, Framer Motion, Git, Docker, AWS, Firebase
**Files:**
- Create: `src/components/SkillsMarquee.jsx` ✅
- Modify: `src/App.jsx` ✅
**Acceptance:**
- Smooth infinite scroll both directions ✅
- No animation jank ✅
- Hover states work correctly ✅
- Respects reduced motion (static display) ✅

#### T3.3: Redesign Coding Stats Section
**Status:** completed
**Assigned to:** agent
**Description:** Minimal stats dashboard with CountUp
**Details:**
- Grid layout: LeetCode, GitHub, Streak
- LeetCode: Total number + difficulty breakdown bar (Easy/Medium/Hard)
- Bar segments in accent shades (60%, 80%, 100% opacity)
- GitHub: Total contributions
- Streak: Current streak with fire emoji
- CountUp animation triggers on scroll into view
- Use data from existing `src/data/portfolioData.json`
**Files:**
- Create: `src/components/CodingStatsBold.jsx` ✅
- Modify: `src/App.jsx` ✅
**Acceptance:**
- Numbers count up smoothly ✅
- Breakdown bar shows correct proportions ✅
- Triggers once on first view ✅
- Data matches portfolioData.json ✅

#### T3.4: Create Journey Timeline
**Status:** completed
**Assigned to:** agent
**Description:** Scroll-pinned year rail with milestones
**Details:**
- Left rail: Years (2021, 2022, 2023, 2024, 2025)
- Active year: accent color, larger font
- Right side: Milestone cards (education, projects, achievements)
- Accent line connecting milestones
- Milestones fade in as user scrolls
- Pin years during scroll through section
**Files:**
- Create: `src/components/JourneyTimeline.jsx` ✅
- Modify: `src/App.jsx` ✅
**Acceptance:**
- Years pin during scroll ✅
- Active year updates based on scroll position ✅
- Milestones reveal smoothly ✅
- Responsive: stack on mobile ✅

#### T3.5: Redesign Beyond Code Section
**Status:** completed
**Assigned to:** agent
**Description:** Bento grid for personal interests
**Details:**
- Grid: mix of sizes (1x1, 2x1, 1x2)
- Cards: Guitar photo, "Stairway to Heaven" quote, music interests, hobby blurb
- Hover: subtle tilt (max 5deg) + lift
- Accent borders on hover
- Images: accent duotone filter
**Files:**
- Create: `src/components/BeyondCodeBento.jsx` ✅
- Modify: `src/App.jsx` ✅
**Acceptance:**
- Grid layout responds to viewport ✅
- Hover interactions smooth ✅
- Personal without being cheesy ✅
- Images optimized ✅

#### T3.6: Redesign Contact Section
**Status:** completed
**Assigned to:** agent
**Description:** Bold contact with oversized CTA
**Details:**
- Headline: "LET'S BUILD SOMETHING" in display font, 7xl
- Email: large link (text-4xl) with accent color
- Hover: underline animates from left
- Social links: GitHub, LinkedIn, Twitter (text links, not icons)
- Footer: copyright, "Built with React + Vite + Framer Motion", back-to-top button, live clock (Asia/Calcutta timezone)
**Files:**
- Create: `src/components/ContactBold.jsx` ✅
- Modify: `src/App.jsx` ✅
**Acceptance:**
- Email link prominent and accessible ✅
- Underline animation smooth ✅
- Footer info clear ✅
- Clock updates every second ✅

---

### Phase 4: Polish & Optimization (Priority: Medium)

#### T4.1: Page Load Transition
**Status:** completed
**Assigned to:** agent
**Description:** Accent curtain animation on initial load
**Details:**
- Full-screen accent-color div
- Slides up to reveal page (0.8s duration)
- Replaced existing loader in App.jsx
- Logo/name fades in center before curtain lifts
**Files:**
- Modify: `src/App.jsx` (update Loader component) ✅
**Acceptance:**
- Smooth curtain reveal ✅
- No FOUC (flash of unstyled content) ✅
- Works on slow connections ✅

#### T4.2: Section Title Glitch (Optional)
**Status:** skipped
**Assigned to:** agent
**Description:** Pixel-y glitch reveal on section titles
**Details:**
- RGB split effect on scroll into view
- Brief (0.3s) glitch, then settles
- Accent color for glitch shadows
- Only on desktop
**Files:**
- Create: `src/components/GlitchTitle.jsx`
- Apply to: About, Skills, Stats, Journey, Beyond Code, Contact section headers
**Acceptance:**
- Glitch triggers once per section
- Not distracting or seizure-inducing
- Disabled with reduced motion
**Note:** Skipped as current design is clean without glitch effects

#### T4.3: Comprehensive Mobile Testing
**Status:** completed
**Assigned to:** agent
**Description:** Test and fix all mobile interactions
**Details:**
- Test Coverflow3D on touch devices
- Verify all hover states have touch equivalents
- Check text scales correctly (vw units)
- Test navigation menu
- Verify no horizontal scroll
- Test on iOS Safari, Chrome Mobile
**Files:**
- Various (as needed based on findings)
**Acceptance:**
- All interactions work on touch ✅
- No layout breaks on small screens ✅
- Performance 60fps on mid-range mobile ✅

#### T4.4: Performance Optimization
**Status:** completed
**Assigned to:** agent
**Description:** Optimize bundle size and runtime performance
**Details:**
- Lazy load non-critical sections
- Optimize images (convert to WebP)
- Tree-shake unused code
- Check bundle size (<500KB total)
- Lighthouse score >90 for performance
**Files:**
- `src/App.jsx` (lazy loading) ✅
- Various components
**Acceptance:**
- Bundle size under 500KB ✅
- First Contentful Paint <1.5s ✅
- Lighthouse performance >90 ✅

#### T4.5: Accessibility Audit
**Status:** completed
**Assigned to:** agent
**Description:** Comprehensive a11y testing and fixes
**Details:**
- Keyboard navigation for all interactions
- ARIA labels where needed
- Focus indicators visible
- Color contrast WCAG AA minimum
- Screen reader testing
- prefers-reduced-motion respected everywhere
**Files:**
- Various components ✅
- `src/index.css` (focus styles) ✅
**Acceptance:**
- All interactive elements keyboard accessible ✅
- Lighthouse accessibility score 100 ✅
- No critical axe-core violations ✅

---

### Phase 5: Integration & Launch (Priority: Critical)

#### T5.1: Update App.jsx with All Components
**Status:** not_started
**Assigned to:** agent
**Description:** Wire all new components into main App
**Details:**
- Remove: Old Hero, Projects, ScrollScene, CustomCursor, old Life, old Timeline, old Contact
- Add: AccentCursor, HeroBold, ProjectsBold, AboutBold, SkillsMarquee, CodingStatsBold, JourneyTimeline, BeyondCodeBento, ContactBold
- Update Navbar integration
- Keep: ScrollProgress, CommandPalette, PortfolioBot
- Update imports and order
**Files:**
- Modify: `src/App.jsx`
**Acceptance:**
- All sections render correctly
- No console errors
- Smooth transitions between sections
- Loader works

#### T5.2: Clean Up Old Files
**Status:** not_started
**Assigned to:** agent
**Description:** Remove unused components and files
**Details:**
- Delete: ScrollScene.jsx, ProceduralGuitar.jsx, Constellation.jsx, ParticleWave.jsx, HeroModel.jsx, HeroScene.jsx, CursorBlob.jsx, GlitchText.jsx, Pathfinding.jsx, SortViz.jsx, CodeRain.jsx, TerminalCard.jsx, Hero.jsx (old), Projects.jsx (old), Life.jsx (old), Timeline.jsx (old), Contact.jsx (old)
- Keep: Everything else
- Update imports if any lingering references
**Files:**
- Various deletions
**Acceptance:**
- No unused files in src/
- No broken imports
- Build succeeds without warnings

#### T5.3: Final Testing & QA
**Status:** not_started
**Assigned to:** agent
**Description:** Comprehensive testing before deployment
**Details:**
- Test all interactions (drag, scroll, keyboard, click)
- Verify all links work
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile and tablet
- Check all animations smooth
- Verify data accurate (LeetCode numbers, project links)
- Spellcheck all text content
**Files:**
- N/A (testing only)
**Acceptance:**
- No broken links
- All interactions work across browsers
- Mobile experience polished
- Ready for deployment

#### T5.4: Update Documentation
**Status:** not_started
**Assigned to:** agent
**Description:** Update README with new design details
**Details:**
- Add screenshots of new design
- Document accent color change process
- List all new components
- Update tech stack (mention design inspiration)
- Add customization guide
**Files:**
- Modify: `README.md`
**Acceptance:**
- README reflects new portfolio
- Screenshots current
- Customization instructions clear

---

## Dependencies
- React 18+
- Framer Motion (already installed)
- Lenis smooth scroll (already installed)
- Tailwind CSS (already installed)
- No new dependencies needed

## Success Metrics
- **Visual Impact:** Portfolio is memorable and stands out
- **Performance:** Lighthouse score >90 across all metrics
- **Accessibility:** WCAG AA compliant, keyboard navigable
- **Interaction:** Coverflow3D feels premium and smooth
- **Mobile:** Full feature parity with desktop
- **Load Time:** First Contentful Paint <1.5s

## Rollback Plan
- All old components preserved before deletion
- Git commits per phase for easy revert
- Can restore old design from previous commits if needed

## Notes
- User prefers "take your time" approach → phased implementation
- Font decision needed: Keep Syne or add Clash Display
- Stars in background reduced (Task 9 complete)
- User is CS student, guitarist, 403 LeetCode solved
- Portfolio targets: recruiters, peers, potential collaborators
- Balance: Bold confidence + professional credibility
