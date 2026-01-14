# Phase 8 Discovery: UI Overhaul

## Research Questions

1. **shadcn/ui Integration**: How to integrate with Tailwind 4 + Next.js 16? Installation steps? Component customization patterns?
2. **Typography**: What distinctive font pairings work well for finance apps? (Avoid: Inter, Roboto, Arial, Space Grotesk)
3. **Color Systems**: Modern approaches to CSS variables for themeable designs? Dominant color + accent patterns?
4. **Motion Design**: Framer Motion best practices for React 19? Animation patterns that don't hurt performance?
5. **Backgrounds**: CSS gradient + pattern techniques for depth without distraction?

## Findings

### shadcn/ui with Tailwind CSS 4

**Compatibility Status:**
- shadcn/ui now officially supports Tailwind v4 and React 19
- The CLI can initialize projects with Tailwind v4, and all components are updated accordingly
- Major breaking change: HSL colors converted to OKLCH format
- Components now use `data-slot` attributes for styling instead of forwardRefs
- `tailwindcss-animate` deprecated in favor of `tw-animate-css` (installed by default in new projects)

**Integration Approach:**
- No longer requires JavaScript config file - uses CSS-only configuration with `@theme` directive
- Components styled using Tailwind CSS with OKLCH color values defined in CSS variables
- Uses `--primary`, `--background`, `--foreground` and other semantic CSS variables
- Every shadcn/ui component automatically matches your theme via shared CSS variables

**Installation Pattern:**
```bash
npx shadcn@latest init
```

The CLI will:
1. Install dependencies
2. Add the `cn` utility function
3. Configure CSS variables (default: true)
4. Set up components to use `@theme inline` directive in globals.css

**Component Customization:**
- Variables follow `--{name}` and `--{name}-foreground` convention
- Example: `--primary` for background, `--primary-foreground` for text
- All colors defined in CSS variables, easily swappable for theming
- Components use semantic tokens, not hardcoded colors

### Typography

**Distinctive Alternatives (Avoiding Inter, Roboto, Arial, Space Grotesk):**

**Option 1: Clash Grotesk + IBM Plex Mono**
- **Heading**: Clash Grotesk - Neo-grotesk with small apertures and closed-shut look, eye-catching and modern
- **Body**: Clash Grotesk (lighter weights)
- **Mono**: IBM Plex Mono for numbers/data
- **Rationale**: Finance apps need clear number readability; Clash Grotesk's distinctive shape creates brand recall without sacrificing legibility

**Option 2: Switzer + Departure Mono**
- **Heading**: Switzer - Nostalgic, text-focused sans inspired by 80s/90s magazine ads (18 styles available)
- **Body**: Switzer (regular weights)
- **Mono**: Departure Mono for financial figures
- **Rationale**: Retro-modern aesthetic stands out from typical fintech; warmth makes finance feel less intimidating

**Option 3: Montserrat + JetBrains Mono**
- **Heading**: Montserrat (semibold/bold) - Geometric with vintage-inspired proportions
- **Body**: Montserrat (regular)
- **Mono**: JetBrains Mono for data tables
- **Rationale**: Proven track record in finance UIs; geometric foundation provides mathematical feel while maintaining personality

**Font Loading Best Practice (Next.js):**
```typescript
import { Clash_Grotesk, JetBrains_Mono } from 'next/font/google'

const clashGrotesk = Clash_Grotesk({
  subsets: ['latin'],
  display: 'swap', // Default in Next.js
  variable: '--font-heading'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono'
})
```

Next.js downloads fonts at build time and self-hosts them with static assets (no Google requests), addressing GDPR concerns and improving performance.

**Recommendation for Personal Nexus**: **Switzer + JetBrains Mono**
- Switzer's 80s/90s vibe aligns with "memorable, non-generic" goal
- JetBrains Mono is highly readable for financial data (designed for code)
- Both available via Google Fonts for easy Next.js integration

### Color Systems

**Modern Approach: OKLCH in Tailwind CSS 4**

Tailwind v4 migrated from HSL to OKLCH (Oklab color space) for all default colors:

**Why OKLCH Over HSL:**
1. **Perceptual Uniformity**: 50% lightness in OKLCH looks equally bright to human eyes across all hues; HSL's "lightness" is mathematically equal but visually inconsistent (yellow looks brighter than blue at same L value)
2. **Wider Gamut (P3)**: Supports vivid colors beyond sRGB that modern displays can render
3. **Better Gradients**: No unwanted gray areas when colors mix (common HSL problem)
4. **Dynamic Theming**: Easier to calculate color scales with CSS functions like `oklch(from var(--color) calc(l/2 + .2) c h)` for hover/disabled states

**Design System Structure:**

```css
@theme inline {
  /* Base semantic tokens */
  --color-background: oklch(98% 0.01 270);
  --color-foreground: oklch(20% 0.01 270);

  /* Primary (dominant color) */
  --color-primary: oklch(60% 0.18 270);
  --color-primary-foreground: oklch(98% 0.01 270);

  /* Accent (complementary) */
  --color-accent: oklch(75% 0.15 60);
  --color-accent-foreground: oklch(20% 0.01 270);

  /* Semantic UI states */
  --color-muted: oklch(92% 0.01 270);
  --color-border: oklch(88% 0.01 270);
  --color-destructive: oklch(60% 0.20 25);
}

@media (prefers-color-scheme: dark) {
  @theme inline {
    --color-background: oklch(15% 0.02 270);
    --color-foreground: oklch(95% 0.01 270);
    /* ... adjust all tokens for dark mode */
  }
}
```

**IDE-Inspired Color Schemes:**

Popular themes for finance apps (inspired by VSCode/JetBrains):
- **Tokyo Night**: Deep purple-blue backgrounds (oklch(15% 0.03 270)), cyan/magenta accents
- **Dracula**: Dark purple base with vibrant pink/cyan/yellow accents (high contrast for data)
- **Nord**: Cool gray-blue palette, muted but distinctive
- **Monokai Pro**: Warmer dark background with coral/green accents

**Recommendation for Personal Nexus**: **Tokyo Night-inspired palette**
- Primary: Deep indigo/purple (evokes trust, less generic than blue)
- Accent: Vibrant cyan for CTAs and important data
- Muted: Subtle purple-grays for backgrounds
- Benefits: Distinctive in fintech space (most use blue), excellent contrast for numbers

### Motion Design

**Framer Motion (now "Motion") for React 19:**

**Rebranding**: Framer Motion is now simply "Motion" as of 2025, though both names are used interchangeably.

**Performance Best Practices:**

1. **GPU-Accelerated Properties Only**
   - Animate `transform` and `opacity` (GPU-optimized)
   - Avoid animating `width`, `height`, `top`, `left` (triggers layout recalculation)

2. **Use Built-in Layout Animations**
   ```tsx
   <motion.div layout>
     {/* Content changes trigger smooth layout animations */}
   </motion.div>
   ```
   - Minimal re-renders, FLIP technique under the hood

3. **Lazy Load with Viewport Detection**
   ```tsx
   const { ref, inView } = useInView()
   <motion.div
     ref={ref}
     initial={{ opacity: 0 }}
     animate={inView ? { opacity: 1 } : { opacity: 0 }}
   />
   ```

4. **Optimize Event Handlers**
   - Use `whileTap` and `whileHover` props instead of custom event handlers
   - These are internally optimized by Motion

5. **Memoize Complex Calculations**
   - Use `useMemo` and `useCallback` for animation values

**Animation Patterns for Personal Nexus:**

**1. Staggered List Reveals**
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {transactions.map(t => (
    <motion.li key={t.id} variants={item}>
      {t.description}
    </motion.li>
  ))}
</motion.ul>
```

**2. Number Counting Animation**
```tsx
<motion.span
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {animatedValue.toFixed(2)}
</motion.span>
```

**3. Card Slide-In Transitions**
```tsx
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: 20, opacity: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  {/* Card content */}
</motion.div>
```

**4. Chart Reveal**
```tsx
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  <RechartsComponent />
</motion.div>
```

**Installation:**
```bash
npm install motion
```

**React 19 Compatibility**: Confirmed working with React 19 (Refine CORE v5 brings React 19 support with Motion integration)

### Backgrounds

**CSS Gradient Techniques for Atmospheric Depth:**

**1. Mesh Gradients (2026 Trend)**
Multi-colored gradients with vibrant palettes, irregular shapes with blur effects:

```css
background:
  radial-gradient(circle at 20% 50%, oklch(60% 0.18 270 / 0.3), transparent 50%),
  radial-gradient(circle at 80% 20%, oklch(75% 0.15 60 / 0.2), transparent 50%),
  radial-gradient(circle at 40% 80%, oklch(55% 0.20 300 / 0.25), transparent 50%),
  oklch(15% 0.02 270);
```

**2. Gradient Noise Backgrounds**
Subtle grain effect adds texture without distraction:

```css
background-image:
  linear-gradient(135deg, oklch(15% 0.02 270), oklch(18% 0.03 260)),
  url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400'...");
background-blend-mode: overlay;
```

**3. Geometric SVG Patterns (Subtle)**

Top tools for generating patterns:
- **Hero Patterns**: Free repeatable SVG background patterns
- **Pattern Monster**: Online SVG pattern generator with customization
- **SVG Backgrounds**: Copy-paste backgrounds, tiny file size

Example pattern overlay:
```css
background-image:
  url("data:image/svg+xml,%3Csvg width='60' height='60'..."),
  linear-gradient(180deg, oklch(15% 0.02 270), oklch(12% 0.03 270));
background-size: 60px 60px, 100% 100%;
opacity: 0.03; /* Very subtle */
```

**4. Layered Gradients for Depth**
```css
.card {
  background:
    linear-gradient(135deg, oklch(20% 0.02 270) 0%, transparent 100%),
    oklch(17% 0.02 265);
  border: 1px solid oklch(25% 0.03 270 / 0.5);
  box-shadow:
    0 10px 40px oklch(10% 0.03 270 / 0.3),
    inset 0 1px 0 oklch(30% 0.03 270 / 0.1);
}
```

**Best Practices:**
- Use gradients in **secondary elements** (hovers, titles, icons, cards)
- Avoid distracting main content areas (keep transaction lists clean)
- Combine with shadows for realistic 3D feel
- SVG patterns should be extremely subtle (opacity < 0.05)

**Recommendation for Personal Nexus:**
- **Main background**: Subtle mesh gradient with deep purple tones
- **Cards**: Layered gradient with border glow effect
- **Accent elements**: Geometric SVG pattern at 0.03 opacity
- **Charts**: Gradient backgrounds within chart areas to guide focus

## Recommendations

### Standard Stack (What to Use)

**Component Library:**
- **shadcn/ui** with Tailwind CSS 4
  - Full React 19 support
  - OKLCH color system built-in
  - CSS-only configuration (no JS config)
  - Copy-paste component approach (full ownership)

**Typography:**
- **Primary**: Switzer (headings and body)
- **Mono**: JetBrains Mono (numbers, data tables, transaction amounts)
- Loaded via `next/font/google` with `display: 'swap'`

**Color System:**
- OKLCH format for all colors
- Tokyo Night-inspired palette: deep indigo/purple primary, cyan accent
- CSS variables with `@theme inline` directive
- Dark mode as default (light mode optional for Phase 2)

**Animation Library:**
- **Motion** (formerly Framer Motion)
- Focus on staggered list reveals and card transitions
- Limit to `transform` and `opacity` animations only

**Background Approach:**
- Mesh gradients with OKLCH colors (3-4 radial gradients layered)
- Optional: Subtle geometric SVG pattern at 0.03 opacity
- Layered gradients on cards with border glow

### Architecture Patterns (How to Structure Work)

**1. Design Token Organization**
```
app/
├── globals.css           # All CSS variables defined here via @theme inline
└── components/
    └── ui/               # shadcn/ui components (auto-theming via CSS vars)
```

**2. Component Refactoring Sequence**
1. Set up design tokens in `globals.css` (colors, fonts, spacing)
2. Install shadcn/ui components (Button, Card, Input, etc.)
3. Wrap existing components with Motion for animation
4. Apply background gradients to layout components
5. Replace hardcoded colors with CSS variable references

**3. Animation Integration Points**
- Transaction lists: Staggered reveal on mount
- Budget cards: Slide-in on page load, scale on hover
- Charts: Fade + scale on reveal
- Form elements: whileTap for buttons, layout animations for expanding sections
- Navigation: Smooth transitions between routes (use `<AnimatePresence>`)

**4. Font Variable Setup**
```typescript
// app/layout.tsx
import { Switzer, JetBrains_Mono } from 'next/font/google'

const switzer = Switzer({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono'
})

// Apply to <body>: className={`${switzer.variable} ${jetbrainsMono.variable}`}
```

Then in `globals.css`:
```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}

body {
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

**5. CSS Variable Naming Convention (shadcn/ui standard)**
```
--background         # Page background
--foreground         # Primary text color
--primary            # Dominant brand color
--primary-foreground # Text on primary color
--accent             # Complementary color (CTAs)
--accent-foreground  # Text on accent color
--muted              # Subdued background for cards
--border             # Border color
--input              # Input field border
--ring               # Focus ring color
--destructive        # Error/delete actions
```

### Don't Hand-Roll (NEVER Custom Solutions For)

1. **Component Primitives**
   - Use shadcn/ui Button, Card, Input, Dialog, etc.
   - Don't build custom dropdown/modal systems

2. **Animation Engine**
   - Don't use CSS transitions for complex animations
   - Don't build custom spring physics (Motion has this)

3. **Color Conversion**
   - Don't manually convert HSL to OKLCH
   - Use tools: https://oklch.com or https://uicolors.app/tailwind-colors

4. **SVG Pattern Generation**
   - Use Hero Patterns or Pattern Monster
   - Don't hand-code SVG patterns

5. **Gradient Palettes**
   - Use WebGradients.com or uiGradients for inspiration
   - Don't guess gradient stops

6. **Font Optimization**
   - Always use `next/font/google` (handles subsetting, preloading, font-display)
   - Don't link Google Fonts in `<head>` manually

### Common Pitfalls

1. **OKLCH Browser Support**
   - Fully supported in all modern browsers (2025+)
   - **Pitfall**: Don't provide HSL fallbacks unless targeting IE11

2. **Animating Layout Properties**
   - **Pitfall**: Animating `width`, `height`, `left`, `top` causes jank
   - **Solution**: Use `transform: scale()` and `transform: translate()` instead
   - **Exception**: Use `layout` prop in Motion for automatic FLIP animations

3. **Font Flash (FOUT)**
   - **Pitfall**: Using `display: 'optional'` can skip custom font load
   - **Solution**: Stick with `display: 'swap'` (default) for brand fonts

4. **Over-Animating**
   - **Pitfall**: Animating every element kills performance and annoys users
   - **Solution**: Limit to 3-4 animation types (list stagger, card slide, button tap, chart reveal)

5. **Saturated Colors on Dark Backgrounds**
   - **Pitfall**: Full-saturation colors (chroma > 0.25 in OKLCH) vibrate on dark backgrounds
   - **Solution**: Reduce chroma to 0.15-0.20 for accents on dark mode

6. **Gradient Performance**
   - **Pitfall**: Complex gradients (5+ stops, large blur radii) can cause repaint issues
   - **Solution**: Limit to 3-4 radial gradients, keep blur radii under 500px equivalent

7. **CSS Variable Specificity**
   - **Pitfall**: Inline styles override CSS variables
   - **Solution**: Always use utility classes for theming, avoid inline `style={{color: '#fff'}}`

8. **Motion AnimatePresence Without Keys**
   - **Pitfall**: Exit animations don't work if children lack unique `key` props
   - **Solution**: Always provide `key` to direct children of `<AnimatePresence>`

9. **Hardcoded Typography**
   - **Pitfall**: Using `className="font-geist-mono"` breaks design system
   - **Solution**: Use semantic classes: `font-mono` maps to `var(--font-mono)`

10. **shadcn/ui Customization**
    - **Pitfall**: Editing components in `components/ui/` directly (gets overwritten on updates)
    - **Solution**: Wrap shadcn components in your own components for customization

## Code Examples

### 1. Setting Up Design Tokens (globals.css)

```css
@import "tailwindcss";

:root {
  --background: oklch(98% 0.01 270);
  --foreground: oklch(20% 0.01 270);
  --primary: oklch(45% 0.18 270);
  --primary-foreground: oklch(98% 0.01 270);
  --accent: oklch(70% 0.15 195);
  --accent-foreground: oklch(20% 0.01 270);
  --muted: oklch(92% 0.01 270);
  --border: oklch(88% 0.01 270);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --font-sans: var(--font-switzer);
  --font-mono: var(--font-jetbrains-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(15% 0.02 270);
    --foreground: oklch(95% 0.01 270);
    --primary: oklch(60% 0.18 270);
    --primary-foreground: oklch(15% 0.02 270);
    --accent: oklch(75% 0.15 195);
    --accent-foreground: oklch(15% 0.02 270);
    --muted: oklch(20% 0.02 270);
    --border: oklch(25% 0.03 270);
  }
}

body {
  background:
    radial-gradient(circle at 20% 50%, oklch(18% 0.03 280 / 0.3), transparent 50%),
    radial-gradient(circle at 80% 20%, oklch(16% 0.03 195 / 0.2), transparent 50%),
    var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

### 2. Font Configuration (app/layout.tsx)

```tsx
import { Switzer } from 'next/font/google'
import localFont from 'next/font/local'

const switzer = Switzer({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-switzer'
})

const jetbrainsMono = localFont({
  src: '../public/fonts/JetBrainsMono-Variable.woff2',
  display: 'swap',
  variable: '--font-jetbrains-mono'
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${switzer.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### 3. Animated Transaction List

```tsx
'use client'
import { motion } from 'motion/react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
}

export default function TransactionList({ transactions }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {transactions.map((transaction) => (
        <motion.li
          key={transaction.id}
          variants={item}
          className="bg-muted border border-border rounded-lg p-4"
        >
          <div className="flex justify-between">
            <span className="font-sans">{transaction.description}</span>
            <span className="font-mono text-accent">
              ${transaction.amount.toFixed(2)}
            </span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### 4. Budget Card with Hover Animation

```tsx
'use client'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BudgetCard({ budget }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="bg-gradient-to-br from-muted to-background border-border">
        <CardHeader>
          <CardTitle className="font-sans">{budget.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono text-primary">
            ${budget.amount.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### 5. shadcn/ui Button with Custom Styling

```tsx
// components/ui/button.tsx (generated by shadcn CLI)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Usage:
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

<motion.div whileTap={{ scale: 0.95 }}>
  <Button variant="default">Add Transaction</Button>
</motion.div>
```

### 6. Chart Container with Reveal Animation

```tsx
'use client'
import { motion } from 'motion/react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export default function SpendingChart({ data }) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="category" stroke="var(--foreground)" />
          <YAxis stroke="var(--foreground)" />
          <Bar
            dataKey="amount"
            fill="var(--accent)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
```

### 7. Mesh Gradient Background Component

```tsx
// components/MeshGradient.tsx
export default function MeshGradient() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, oklch(18% 0.03 280 / 0.3), transparent 50%),
          radial-gradient(circle at 80% 20%, oklch(16% 0.03 195 / 0.2), transparent 50%),
          radial-gradient(circle at 40% 80%, oklch(17% 0.03 300 / 0.25), transparent 50%),
          oklch(15% 0.02 270)
        `
      }}
    />
  )
}

// Usage in layout.tsx:
import MeshGradient from '@/components/MeshGradient'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MeshGradient />
        {children}
      </body>
    </html>
  )
}
```

## Resources & Tools

### Color Tools
- **OKLCH Picker**: https://oklch.com
- **Tailwind Colors in OKLCH**: https://uicolors.app/tailwind-colors
- **shadcn/ui Color Generator**: https://ui.shadcn.com/colors

### Pattern & Gradient Generators
- **Hero Patterns**: https://heropatterns.com
- **SVG Backgrounds**: https://svgbackgrounds.com
- **WebGradients**: https://webgradients.com
- **uiGradients**: https://uigradients.com

### Typography
- **Google Fonts**: https://fonts.google.com
- **Font Pairing**: https://fontpair.co

### Animation Inspiration
- **Motion Documentation**: https://motion.dev
- **Motion Examples**: https://motion.dev/examples

### shadcn/ui
- **Component Library**: https://ui.shadcn.com
- **Tailwind v4 Setup Guide**: https://ui.shadcn.com/docs/tailwind-v4

## Next Steps

After this discovery phase, proceed to:

1. **Create PLAN.md** with implementation tasks:
   - Install shadcn/ui and configure CSS variables
   - Set up font system with Switzer + JetBrains Mono
   - Define Tokyo Night-inspired color palette in OKLCH
   - Install Motion and create animation utilities
   - Generate mesh gradient backgrounds
   - Refactor existing components to use design tokens

2. **Execute Phase 8** systematically:
   - Start with design tokens (foundational)
   - Add typography (visual impact)
   - Integrate shadcn/ui components (structural)
   - Layer in animations (polish)
   - Apply backgrounds (atmosphere)

3. **Test on Mobile** (primary use case):
   - Verify font legibility at small sizes
   - Check animation performance on devices
   - Ensure gradient backgrounds don't impact scrolling
   - Validate touch target sizes with shadcn/ui components
