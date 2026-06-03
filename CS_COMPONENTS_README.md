# CS-Themed Portfolio Components

## What Was Added

Three new CS-themed components have been integrated into your portfolio:

### 1. ✅ TerminalCard (Integrated in Hero)
**Location:** `src/components/TerminalCard.jsx`  
**Used in:** Hero section (below stats)

A live typing terminal animation that shows developer commands:
- Types out bash commands with realistic delays
- Shows your tech stack, problem-solving stats
- Includes MacOS-style window controls
- Respects `prefers-reduced-motion` for accessibility

### 2. ✅ SortViz (Integrated in LeetCode Stats)
**Location:** `src/components/SortViz.jsx`  
**Used in:** LeetCode Stats section (below stats grid)

An animated bubble sort visualization:
- Shows real-time sorting algorithm in action
- Displays Big-O notation `O(n²)`
- Uses gradient bars (violet to cyan)
- Only animates when in viewport
- Reshuffles and repeats continuously

### 3. ⭐ CodeRain (Optional - Not Yet Integrated)
**Location:** `src/components/CodeRain.jsx`  
**Usage:** Background effect for any section

Matrix-style code rain effect using canvas:
- Subtle, performant animation
- Capped opacity for readability
- Can be placed behind hero or any section

## How to Use CodeRain (Optional)

Add it as a background to any section:

```jsx
import CodeRain from "./components/CodeRain"

// In your component:
<section className="relative">
  <CodeRain opacity={0.12} />
  {/* Your content here */}
</section>
```

**Recommended placements:**
- Behind the hero section
- Behind the About section
- Behind the Skills section

**Example for Hero:**

```jsx
// In Hero.jsx, add import:
import CodeRain from "./CodeRain"

// Inside the section, before other content:
<section id="hero" className="relative min-h-screen...">
  <CodeRain opacity={0.08} />
  {/* rest of hero content */}
</section>
```

## Other CS-Themed Ideas

From the original suggestions, here are more quick wins:

### Konami Code Easter Egg
Add this hook to detect ↑↑↓↓←→←→BA:

```jsx
// src/hooks/useKonami.js
import { useEffect } from "react"

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]

export function useKonami(callback) {
  useEffect(() => {
    let pos = 0
    const handler = (e) => {
      if (e.key.toLowerCase() === KONAMI[pos]) {
        pos++
        if (pos === KONAMI.length) {
          callback()
          pos = 0
        }
      } else pos = 0
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [callback])
}
```

Use in App.jsx:
```jsx
useKonami(() => {
  document.body.style.filter = "hue-rotate(180deg)"
  setTimeout(() => document.body.style.filter = "", 3000)
})
```

### Glitch Text Effect
Add to a name on hover:

```css
.glitch {
  position: relative;
}
.glitch:hover::before,
.glitch:hover::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  animation: glitch 0.3s infinite;
}
.glitch:hover::before {
  color: #f59e0b;
  z-index: -1;
  clip-path: inset(40% 0 60% 0);
}
.glitch:hover::after {
  color: #06b6d4;
  z-index: -2;
  clip-path: inset(60% 0 40% 0);
}
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  33% { transform: translate(-2px, 2px); }
  66% { transform: translate(2px, -2px); }
}
```

## Technical Details

### Dependencies Used
- `framer-motion` - Already in your project
- React hooks (`useEffect`, `useState`, `useRef`)
- Your existing `usePrefersReducedMotion` hook

### Performance
- TerminalCard: Lightweight interval-based typing
- SortViz: Only animates when in viewport
- CodeRain: Throttled to ~18fps, uses requestAnimationFrame

### Accessibility
- All components respect `prefers-reduced-motion`
- CodeRain marked with `aria-hidden`
- Semantic HTML maintained

## What Makes This Special

Most portfolios just *claim* DSA skills. Yours now *shows* them:
- Terminal commands prove you build
- Live sorting visualization proves you understand algorithms
- Clean, performant implementation proves you write quality code

The combination tells the story: "I don't just solve problems — I understand them deeply enough to visualize them."
