# Exhibit3Design Material Design Purple Dark System

## Overview

A sophisticated dark-mode design system based on Material Design Purple 800 (#6A1B9A), featuring dark gray gradients, animated backgrounds, and consistent Material Design principles. Built for an AI-powered 3D exhibition design platform.

---

## Design Philosophy

**"Create a consistent, Material Design-based dark interface with Purple 800 as the brand color, animated backgrounds, and proper contrast for long creative sessions."**

### Core Principles

1. **Material Design Purple**: Based on Purple 800 (#6A1B9A) with full color palette
2. **Dark Gray Backgrounds**: Not too dark - uses #2E2F3E base with gradients
3. **Animated Backgrounds**: Subtle gradient flow and floating particle effects
4. **High Contrast**: White headings (#FFFFFF) with proper contrast ratios
5. **Material Elevation**: Consistent shadow system following Material Design
6. **8px Baseline**: Consistent spacing and 8px border radius
7. **Micro Animations**: Smooth transitions, hover effects, and background motion

---

## Color System

### Surface Colors (Dark Gray - Not Too Dark)

```css
--background: #2E2F3E          /* Base: Dark gray (245 15% 20%) */
--background-gradient: linear-gradient(135deg, #2E2F3E 0%, #26243B 100%)
--surface: #353649             /* Elevated: Lighter gray (245 18% 24%) */
--card: #3A3C4F                /* Cards: Even lighter (245 20% 26%) */
```

**Note:** Background uses animated gradient with `gradient-flow` animation (15s) and `particle-float` for subtle motion effects.

### Material Design Purple Palette

```css
/* Primary - Purple 800 & 700 */
--primary-from: #6A1B9A        /* Purple 800 (280 70% 36%) */
--primary-to: #8E24AA          /* Purple 600 (288 68% 40%) */
--primary: #7B1FA2             /* Purple 700 (283 70% 38%) - Main brand */

/* Interactive - Purple 500 & 400 */
--accent: #9C27B0              /* Purple 500 (291 64% 42%) */
--accent-hover: #AB47BC        /* Purple 400 (294 48% 50%) - Hover state */
```

### Full Material Purple Scale

```css
Purple 900: #4A148C  /* Darkest */
Purple 800: #6A1B9A  ← Primary brand color (main identity)
Purple 700: #7B1FA2  ← Primary solid color
Purple 600: #8E24AA  ← Gradient end
Purple 500: #9C27B0  ← Interactive accent
Purple 400: #AB47BC  ← Hover state
Purple 300: #BA68C8  /* Lightest */
```

**Usage:**
- Purple 800-600: Primary CTAs with gradient background
- Purple 700: Solid purple for single-color uses (borders, icons)
- Purple 500-400: Interactive states and hover effects
- Gradients always use 800 → 600 for consistency

### Text Hierarchy (High Contrast)

```css
--heading: #FFFFFF             /* Pure white for headings (maximum contrast) */
--foreground: #E3E4E8          /* Light gray for body text (240 10% 90%) */
--muted-foreground: #B8B9C0    /* Medium gray for secondary text (240 5% 75%) */
```

**Important:** Always use pure white (#FFFFFF) for headings on dark backgrounds. Never use purple text overlays that reduce readability.

### Borders & Inputs

```css
--border: #464856              /* Subtle separation (245 12% 32%) */
--input: #3E3F4D               /* Input background (245 15% 28%) */
```

### Semantic Colors (Material Design)

```css
--success: #4CAF50             /* Green 500 (122 39% 49%) */
--warning: #FFC107             /* Amber 500 (45 100% 51%) */
--error: #F44336               /* Red 500 (4 90% 58%) */
```

---

## Typography

### Font Family

**Primary:** Inter (geometric, modern, highly legible)

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Font Sizes

```css
xs:  0.75rem   /* 12px - Labels, captions */
sm:  0.875rem  /* 14px - Small text */
base: 1rem     /* 16px - Body text (base) */
lg:  1.125rem  /* 18px - Large body */
xl:  1.25rem   /* 20px - Small headings */
2xl: 1.5rem    /* 24px - Section headings */
3xl: 1.875rem  /* 30px - Page headings */
4xl: 2.25rem   /* 36px - Hero subheadings */
5xl: 3rem      /* 48px - Hero headings */
6xl: 3.75rem   /* 60px - Extra large hero */
```

### Font Weights

```css
normal:   400  /* Body text */
medium:   500  /* Emphasized text */
semibold: 600  /* Subheadings */
bold:     700  /* Headings */
```

### Line Heights

```css
tight:   1.2   /* Headings */
normal:  1.5   /* Body text */
relaxed: 1.6   /* Comfortable reading */
```

### Letter Spacing

```css
tight:  -0.02em /* Large headings */
normal:  0      /* Body text */
wide:    0.02em /* Buttons */
wider:   0.05em /* Uppercase labels */
```

---

## Spacing System

**8px base scale** for consistent rhythm:

```css
0:  0       /* None */
1:  0.25rem /* 4px  - Micro spacing */
2:  0.5rem  /* 8px  - Tight spacing */
3:  0.75rem /* 12px - Small spacing */
4:  1rem    /* 16px - Default spacing */
6:  1.5rem  /* 24px - Medium spacing */
8:  2rem    /* 32px - Large spacing */
12: 3rem    /* 48px - Section spacing */
16: 4rem    /* 64px - Major sections */
24: 6rem    /* 96px - Hero sections */
```

---

## Border Radius (Zone Baseline)

**Consistent 8px system:**

```css
sm:  0.25rem  /* 4px  - Micro elements */
md:  0.5rem   /* 8px  - Buttons, cards (base) */
lg:  0.75rem  /* 12px - Large cards */
xl:  1rem     /* 16px - Modals */
2xl: 1.5rem   /* 24px - Pills/chips */
```

**Key Change:** Primary buttons and cards use 8px radius (md) to match Zone's modern aesthetic.

---

## Shadows & Glows

### Standard Elevation

```css
sm: 0 2px 8px rgba(0, 0, 0, 0.4)   /* Subtle depth */
md: 0 4px 16px rgba(0, 0, 0, 0.5)  /* Moderate elevation */
lg: 0 8px 32px rgba(0, 0, 0, 0.6)  /* Strong elevation */
```

### Glow Effects

```css
/* Purple glows (brand identity) */
--glow-purple: 0 4px 20px rgba(124, 58, 237, 0.4)
--glow-purple-strong: 0 8px 40px rgba(124, 58, 237, 0.6),
                      0 0 60px rgba(124, 58, 237, 0.3)

/* Cyan glows (interactive states) */
--glow-cyan: 0 4px 20px rgba(34, 211, 238, 0.4)

/* Card hover glow */
--glow-card-hover: 0 8px 32px rgba(124, 58, 237, 0.2),
                   0 0 0 1px rgba(124, 58, 237, 0.3)
```

**Usage:**
- Purple glow on primary CTAs
- Cyan glow on hover states
- Card edges glow on hover
- Input focus rings

---

## Animation System

### Timing Functions (Motion Tokens)

```css
--motion-fast:   150ms
--motion-medium: 250ms
--motion-slow:   400ms

easeOut:    cubic-bezier(0.16, 1, 0.3, 1)
easeInOut:  cubic-bezier(0.65, 0, 0.35, 1)
spring:     cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Keyframes

#### Gradient Shimmer (CTAs)
```css
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
/* Duration: 3s infinite */
```

#### Glow Pulse
```css
@keyframes glow-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
    opacity: 1;
  }
  50% { 
    box-shadow: 0 0 40px rgba(124, 58, 237, 0.6);
    opacity: 0.9;
  }
}
/* Duration: 2s ease-in-out infinite */
```

#### Lift (Hover Effect)
```css
@keyframes lift {
  0%   { transform: translateY(0) scale(1); }
  100% { transform: translateY(-4px) scale(1.02); }
}
/* Duration: 200ms ease-out forwards */
```

#### Fade Up (Content Entrance)
```css
@keyframes fade-up {
  0%   { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
/* Duration: 600ms ease-out forwards */
```

---

## Component Library

### Buttons

#### Variant: Default (Gradient Primary)

**Design (Zone-Aligned):**
- Background: `linear-gradient(90deg, #7C3AED, #C084FC)`
- Border radius: **8px** (md)
- Height: **44px** (standard), **36px** (small/header)
- Padding: 0 20px (md), 0 12px (sm)
- Font: 500 weight, 0.02em letter-spacing
- Glow: `0 4px 20px rgba(124, 58, 237, 0.4)`
- Gradient shift animation on background

**Hover:**
- Lift: `translateY(-2px)`
- Stronger glow: `0 6px 30px rgba(124, 58, 237, 0.6)`
- Gradient continues shifting

**Active:**
- Scale: 0.98

**Code:**
```tsx
<Button variant="default" size="default">
  Primary Action
</Button>
```

---

#### Variant: Outline (Neon Cyan)

**Design:**
- Border: 2px solid `#22D3EE`
- Background: transparent
- Text color: `#22D3EE`
- Border radius: 10px

**Hover:**
- Fill background with cyan: `#22D3EE`
- Text becomes white
- Subtle glow ring

**Code:**
```tsx
<Button variant="outline">
  Secondary Action
</Button>
```

---

#### Variant: Ghost

**Design:**
- Transparent background
- Text color: `foreground`
- No border, no glow

**Hover:**
- Background: `purple/10`
- Subtle scale: 1.02

---

### Cards

**Base Design:**
- Background: `hsl(240 6% 12%)`
- Border: 1px solid `hsl(240 6% 20%)`
- Border radius: 12–16px
- Padding: 24px

**Hover:**
- Transform: `translateY(-4px)`
- Glow edge: `0 8px 32px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(124, 58, 237, 0.3)`
- Transition: 300ms ease-out

**Code:**
```tsx
<Card className="hover:-translate-y-1 hover:shadow-glow-purple">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

### Inputs

**Base Design:**
- Background: `hsl(240 6% 10%)`
- Border: 1px solid `hsl(240 6% 20%)`
- Border radius: 10px
- Padding: 12px 16px
- Height: 48px (touch-friendly)

**Focus:**
- Border color: `#7C3AED` (purple)
- Glow ring: `0 0 0 3px rgba(124, 58, 237, 0.2)`
- Smooth transition: 200ms

**Code:**
```tsx
<Input 
  type="text" 
  placeholder="Enter text"
  className="focus:border-primary focus:ring-2 focus:ring-primary/20"
/>
```

---

### Badges

**Design:**
- Border radius: 24px (pill shape)
- Padding: 6px 12px
- Font size: 12px, 600 weight

**Active State:**
- Neon cyan underline: 2px solid `#22D3EE`
- Transform from center: `scaleX(0)` → `scaleX(1)`
- Duration: 200ms

**Code:**
```tsx
<Badge variant="default">
  Category
</Badge>
```

---

### Modals/Dialogs

**Backdrop:**
- Blur: 10px (`backdrop-blur-lg`)
- Overlay: `rgba(0, 0, 0, 0.75)`

**Content:**
- Dark gradient background
- Border radius: 16px
- Glow: `0 20px 60px rgba(124, 58, 237, 0.3)`
- Max width: 600px
- Padding: 32px

**Code:**
```tsx
<Dialog>
  <DialogContent className="backdrop-blur-lg rounded-xl shadow-glow-purple-strong">
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## Navigation

### Header

**Design:**
- Position: fixed top
- Height: 64px
- Transparent at top: `bg-background/80`
- Backdrop blur: 10px

**On Scroll:**
- Solid background: `bg-background`
- Bottom border: 1px solid `border`
- Smooth transition: 300ms

**Mobile:**
- Full-width menu with slide-in animation
- Dark gradient background
- Backdrop blur

**Code:**
```tsx
<header className="fixed top-0 w-full bg-background/80 backdrop-blur-xl z-50 transition-all duration-300">
  {/* Navigation content */}
</header>
```

---

## Utility Classes

### Gradient Text

```css
/* Purple gradient text */
.text-gradient-purple {
  @apply bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent;
}

/* Cyan gradient text */
.text-gradient-cyan {
  @apply bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] bg-clip-text text-transparent;
}
```

**Usage:**
```tsx
<h1 className="text-gradient-purple">
  Futuristic Heading
</h1>
```

---

### Glow Effects

```css
/* Standard purple glow */
.glow-purple {
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

/* Cyan glow */
.glow-cyan {
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
}

/* Strong purple glow (hero elements) */
.glow-purple-strong {
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.6),
              0 0 60px rgba(124, 58, 237, 0.3);
}
```

---

### Elevation

```css
.elevation-1 { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); }
.elevation-2 { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5); }
.elevation-3 { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); }
```

---

## Accessibility

### Contrast Requirements

- **Text on dark background:** Minimum 4.5:1 ratio
- **Primary buttons:** White text on purple gradient ✓
- **Secondary buttons:** Cyan on transparent (ensure sufficient contrast)

### Focus Indicators

All interactive elements receive a purple focus ring:

```css
focus-visible:ring-2 
focus-visible:ring-purple-500 
focus-visible:ring-offset-2 
focus-visible:ring-offset-background
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Layout System

### Grid

- **Columns:** 12-column responsive grid
- **Gutters:** 24px (desktop), 16px (mobile)
- **Max width:** 1280px (container)

### Section Padding

```css
Desktop: 64–96px vertical
Mobile:  32–48px vertical
```

### Responsive Breakpoints

```css
xs:  475px  /* Extra small devices */
sm:  640px  /* Small devices */
md:  768px  /* Medium devices (tablets) */
lg:  1024px /* Large devices (desktops) */
xl:  1280px /* Extra large devices */
2xl: 1536px /* Ultra-wide screens */
```

---

## Performance Considerations

### Glow Effects

- Use `will-change: box-shadow` sparingly (only on hover)
- Reduce glow intensity on mobile to save battery

### Backdrop Blur

- Check browser support (graceful degradation)
- Mobile browsers may not fully support `backdrop-filter`

### Animations

- Keep under 60fps for smooth performance
- Avoid animating expensive properties (layout, paint)
- Prefer `transform` and `opacity`

---

## Implementation Checklist

- [x] Add Inter font to `index.html`
- [x] Update color system in `src/index.css` (dark-only)
- [x] Configure typography in `tailwind.config.ts`
- [x] Add animation keyframes to Tailwind
- [x] Update Button component with gradient variants
- [x] Update Card component with glow hover
- [x] Update Input component with purple focus ring
- [x] Update Badge component with pill shape
- [x] Redesign Hero section with gradient overlay
- [x] Update CTA section with new styles
- [x] Add global utility classes
- [x] Implement sticky header with blur
- [x] Test accessibility and performance

---

## Resources

- **Figma File:** [Design System Components]
- **Tailwind Config:** `tailwind.config.ts`
- **CSS Variables:** `src/index.css`
- **Component Library:** `src/components/ui/`

---

## Version History

- **v1.0** (2025-11-04): Initial futuristic dark-mode design system
