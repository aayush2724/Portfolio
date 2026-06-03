# CLI Terminal Components Usage Guide

This document shows examples of how to use the Terminal, CommandLabel, and AsciiBox components throughout your portfolio.

## 1. Terminal Components

### Static Terminal
Use for showing code snippets or static command outputs:

```jsx
import { Terminal, Block } from "./Terminal"

<Terminal title="aayush@portfolio — zsh">
  <Block 
    path="~/projects" 
    cmd="npm ls --depth=0" 
    out={`├── react@18
├── vite@5
├── tailwindcss@3
├── framer-motion@11
└── three@0.16`} 
  />
</Terminal>
```

### Typing Terminal
Use for animated terminal sequences (perfect for hero sections):

```jsx
import { TypingTerminal } from "./Terminal"

<TypingTerminal
  title="aayush@portfolio — zsh"
  path="~"
  steps={[
    { cmd: "whoami", out: "Aayush Kumar — CS student & full-stack dev" },
    { cmd: "cat skills.txt", out: "React · Node · Python · C++ · DSA" },
    { cmd: "./launch --status", out: "🚀 available for opportunities" },
  ]}
/>
```

## 2. CommandLabel

Use as section eyebrows to replace traditional headings:

```jsx
import CommandLabel from "./CommandLabel"

// Projects section
<CommandLabel>ls ~/projects --featured</CommandLabel>

// About section
<CommandLabel>cat about.md</CommandLabel>

// Skills section
<CommandLabel>npm ls --depth=0</CommandLabel>

// Stats section
<CommandLabel>cat ~/stats.json</CommandLabel>

// Contact section
<CommandLabel>./contact --open</CommandLabel>

// Journey/Timeline section
<CommandLabel>git log --oneline</CommandLabel>
```

## 3. AsciiBox

Use to frame important content with a labeled border:

```jsx
import AsciiBox from "./AsciiBox"

// Stats section
<AsciiBox label="metrics">
  <div className="grid grid-cols-3 gap-6">
    {/* Your stats content */}
  </div>
</AsciiBox>

// Skills section
<AsciiBox label="tech-stack">
  <div className="flex flex-wrap gap-2">
    {/* Your skill tags */}
  </div>
</AsciiBox>

// Achievements section
<AsciiBox label="achievements">
  <ul className="space-y-2">
    {/* Your achievements list */}
  </ul>
</AsciiBox>
```

## Integration Examples

### Hero Section ✅ (Already Implemented)
```jsx
<TypingTerminal
  steps={[
    { cmd: "whoami", out: "Aayush Kumar — CS student & full-stack dev" },
    { cmd: "cat skills.txt", out: "React · Node · Python · C++ · DSA" },
    { cmd: "./launch --status", out: "🚀 available for opportunities" },
  ]}
/>
```

### Projects Section ✅ (Already Implemented)
```jsx
<CommandLabel>ls ~/projects --featured</CommandLabel>
```

### About Section ✅ (Already Implemented)
```jsx
<CommandLabel>cat about.md</CommandLabel>
```

### Stats Section ✅ (Already Implemented)
```jsx
<CommandLabel>cat ~/stats.json</CommandLabel>
<AsciiBox label="metrics">
  {/* Stats grid */}
</AsciiBox>
```

### Skills Section (Potential Enhancement)
```jsx
<CommandLabel>npm ls --depth=0</CommandLabel>
<Terminal title="package.json — dependencies">
  <Block cmd="cat package.json" out={`{
  "dependencies": {
    "react": "^18.2.0",
    "node": "^20.0.0",
    "python": "^3.11",
    "mongodb": "^6.0.0"
  }
}`} />
</Terminal>
```

### Contact Section (Potential Enhancement)
```jsx
<CommandLabel>./contact --open</CommandLabel>
<AsciiBox label="reach-me">
  {/* Contact form or links */}
</AsciiBox>
```

## Design Guidelines

### Taste Guardrails (Keep it Classy)
1. **Limit Terminals**: Use 2-3 terminals max across the entire site
   - One in Hero (animated TypingTerminal)
   - One in Skills or Contact (static Terminal)
   
2. **CommandLabel Consistency**: Use CommandLabels as eyebrows for ALL major sections
   - Projects: `ls ~/projects`
   - About: `cat about.md`
   - Skills: `npm ls --depth=0`
   - Stats: `cat ~/stats.json`
   - Contact: `./contact --open`

3. **AsciiBox Usage**: Frame only the most important content
   - Stats metrics
   - Key achievements
   - Featured skills

4. **Accent Control**: Let the accent color only hit:
   - The `$` or `➜` prompt symbol
   - The label tab on AsciiBox
   - The cursor caret

## Performance Notes

- **TypingTerminal** respects `prefers-reduced-motion` (shows final state instantly)
- **Static Terminal** has zero animation overhead
- All components use CSS variables for theming
- Font: JetBrains Mono (already configured in tailwind.config.js)
