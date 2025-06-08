# ChatIt Design System

A comprehensive design system for ChatIt that ensures consistent UI/UX across all pages and components.

## 🎨 Theme Overview

ChatIt uses a clean **black and white theme** with strategic use of grays for a professional, modern aesthetic.

### Color Palette

```css
Primary Colors:
- Black: #000000 (primary actions, text)
- White: #ffffff (backgrounds, secondary actions)

Gray Scale:
- Gray 50: #f9fafb (lightest backgrounds)
- Gray 100: #f3f4f6 (subtle backgrounds)
- Gray 200: #e5e7eb (borders, dividers)
- Gray 300: #d1d5db (disabled states)
- Gray 400: #9ca3af (secondary text)
- Gray 500: #6b7280 (body text)
- Gray 600: #4b5563 (headings)
- Gray 700: #374151 (dark text)
- Gray 800: #1f2937 (darkest elements)
- Gray 900: #111827 (highest contrast)

Status Colors:
- Success: #10b981 (green)
- Warning: #f59e0b (amber)
- Error: #ef4444 (red)
- Info: #3b82f6 (blue)
```

## 📁 File Structure

```
src/
├── lib/
│   └── theme.ts           # Theme configuration and utilities
├── components/
│   └── ui/
│       ├── Layout.tsx     # Layout components
│       ├── Button.tsx     # Button component
│       ├── Card.tsx       # Card components
│       └── index.ts       # Export all UI components
└── ChatItLandingPage.tsx  # Main landing page (index)
```

## 🧩 Components

### Layout Components

#### `Layout`
Main layout wrapper for full pages
```tsx
import { Layout } from './components/ui';

<Layout 
  containerSize="lg" 
  showHeader={true} 
  showFooter={true}
  animated={true}
>
  <YourContent />
</Layout>
```

#### `PageWrapper`
For authenticated pages with consistent spacing
```tsx
import { PageWrapper } from './components/ui';

<PageWrapper 
  title="Dashboard" 
  subtitle="Manage your chatbots"
  animated={true}
>
  <YourContent />
</PageWrapper>
```

#### `Section`
For consistent section spacing and backgrounds
```tsx
import { Section } from './components/ui';

<Section 
  background="gray" 
  padding="lg" 
  animated={true}
>
  <YourContent />
</Section>
```

### Interactive Components

#### `Button`
Consistent button styling with variants
```tsx
import { Button } from './components/ui';

<Button 
  variant="primary" 
  size="lg" 
  animated={true}
  loading={false}
  icon={<ArrowRight />}
  iconPosition="right"
>
  Get Started
</Button>
```

**Variants:**
- `primary` - Black background, white text
- `secondary` - White background, black text, gray border
- `ghost` - Transparent background, black text
- `danger` - Red background, white text

**Sizes:**
- `sm` - Small (px-3 py-1.5)
- `md` - Medium (px-4 py-2) [default]
- `lg` - Large (px-6 py-3)
- `xl` - Extra large (px-8 py-4)

#### `Card`
Flexible card component with variants
```tsx
import { Card, CardHeader, CardContent, CardFooter } from './components/ui';

<Card variant="interactive" animated={true} hover={true}>
  <CardHeader title="Card Title" subtitle="Card subtitle" />
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## 🎭 Animations

Using Framer Motion for consistent animations:

```tsx
import { animations } from './components/ui';

// Predefined animation variants
<motion.div variants={animations.fadeIn}>
<motion.div variants={animations.fadeInUp}>
<motion.div variants={animations.stagger}>
<motion.div variants={animations.slideInLeft}>
<motion.div variants={animations.slideInRight}>
<motion.div variants={animations.scaleIn}>
```

## 🛠 Utilities

### `cn()` - Class Name Utility
Combines class names safely:
```tsx
import { cn } from './components/ui';

const buttonClass = cn(
  'base-class',
  isActive && 'active-class',
  customClass
);
```

### Helper Functions
```tsx
import { 
  getButtonClasses, 
  getInputClasses, 
  getCardClasses, 
  getContainerClasses 
} from './components/ui';

// Get pre-styled component classes
const buttonClass = getButtonClasses('primary', 'lg');
const cardClass = getCardClasses('elevated');
const containerClass = getContainerClasses('xl');
```

## 📐 Typography

```css
Font Family: Inter, system-ui, -apple-system, sans-serif
Font Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

Font Sizes:
- xs: 0.75rem
- sm: 0.875rem  
- base: 1rem
- lg: 1.125rem
- xl: 1.25rem
- 2xl: 1.5rem
- 3xl: 1.875rem
- 4xl: 2.25rem
- 5xl: 3rem
- 6xl: 3.75rem
- 7xl: 4.5rem
```

## 📏 Spacing

```css
0: 0
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
32: 8rem (128px)
```

## 📱 Responsive Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🎯 Usage Guidelines

### 1. Page Structure
Every page should follow this structure:

```tsx
import { Layout, PageWrapper } from './components/ui';

function YourPage() {
  return (
    <Layout>
      <PageWrapper title="Page Title" subtitle="Description">
        {/* Page content */}
      </PageWrapper>
    </Layout>
  );
}
```

### 2. Component Consistency
- Always use the provided UI components instead of custom styling
- Use the theme utilities for consistent spacing and colors
- Apply animations consistently using the predefined variants

### 3. Color Usage
- Use black for primary actions and important text
- Use white for backgrounds and secondary actions
- Use gray-500 for body text, gray-600 for headings
- Reserve status colors for their specific purposes

### 4. Animation Guidelines
- Use subtle animations (fadeIn, scaleIn) for content appearance
- Use stagger animations for lists and grids
- Keep animation durations between 200ms-800ms
- Always provide reduced motion alternatives

## 🚀 Getting Started

1. **Import the design system:**
```tsx
import { 
  Layout, 
  Button, 
  Card, 
  PageWrapper,
  theme,
  animations
} from './components/ui';
```

2. **Use consistent patterns:**
```tsx
function MyComponent() {
  return (
    <Layout>
      <PageWrapper title="My Page">
        <Card animated hover>
          <CardHeader title="Example" />
          <CardContent>
            <p>Content here</p>
          </CardContent>
          <CardFooter>
            <Button variant="primary">Action</Button>
          </CardFooter>
        </Card>
      </PageWrapper>
    </Layout>
  );
}
```

3. **Follow the theme:**
- All components automatically use the black/white theme
- Consistent spacing and typography are applied
- Animations enhance the user experience

## 🔧 Customization

The design system is built for consistency but allows customization:

```tsx
// Extend the theme
import { theme, cn } from './components/ui';

// Custom component using theme
function CustomComponent() {
  return (
    <div className={cn(
      'p-4 rounded-lg',
      'bg-white border border-gray-200',
      'hover:shadow-lg transition-shadow'
    )}>
      Custom content
    </div>
  );
}
```

## 📋 Checklist for New Pages

- [ ] Uses Layout or PageWrapper components
- [ ] Follows black/white color theme
- [ ] Uses predefined Button variants
- [ ] Implements consistent spacing
- [ ] Includes appropriate animations
- [ ] Uses theme utilities (cn, getXClasses)
- [ ] Responsive design implemented
- [ ] Consistent typography applied

---

This design system ensures that all ChatIt pages maintain visual consistency while providing flexibility for different use cases. Follow these guidelines to create a cohesive user experience across the entire application. 