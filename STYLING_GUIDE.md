# EnergyDocPage Styling Guide

## Overview
The EnergyDocPage styling is now fully controlled by `frontend/src/styles/energyDocPage.css`. This guide explains how to customize the appearance of your Energy Document Assistant page.

## Quick Start
The CSS file is now imported in EnergyDocPage.jsx and will automatically apply styles to your page.

## Customization Methods

### 1. CSS Variables (Recommended)
The easiest way to customize styling is by modifying the CSS variables at the bottom of energyDocPage.css:

```css
:root {
  /* Colors */
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  --text-primary: #2d3748;
  --text-secondary: #4a5568;
  --background-light: rgba(255, 255, 255, 0.9);
  --shadow-color: rgba(0, 0, 0, 0.1);
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-small: 0.875rem;
  --font-size-medium: 1.125rem;
  --font-size-large: 1.875rem;
  --font-size-xl: 2.25rem;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 2.5rem;
  
  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### 2. Color Schemes
Change the entire color scheme by modifying these variables:

**Dark Theme Example:**
```css
:root {
  --primary-color: #1a202c;
  --secondary-color: #2d3748;
  --text-primary: #f7fafc;
  --text-secondary: #e2e8f0;
  --background-light: rgba(45, 55, 72, 0.9);
}
```

**Mars Theme Example:**
```css
:root {
  --primary-color: #c53030;
  --secondary-color: #dd6b20;
  --accent-color: #f56565;
  --text-primary: #742a2a;
}
```

### 3. Typography Customization
Change fonts and text sizes:

```css
:root {
  --font-family: 'Space Mono', monospace;
  --font-size-xl: 3rem;
  --font-size-large: 2rem;
}
```

### 4. Layout Adjustments
Modify spacing and border radius:

```css
:root {
  --spacing-lg: 3rem;
  --border-radius-xl: 2rem;
}
```

## Component-Level Styling

### Page Background
```css
.energy-doc-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change gradient or use solid color */
}
```

### Header Section
```css
.energy-doc-header {
  background: rgba(255, 255, 255, 0.95);
  /* Change transparency or color */
}

.energy-doc-title {
  font-size: 2.25rem;
  color: #1a202c;
  /* Modify title appearance */
}
```

### Buttons
```css
.back-button {
  background: #4299e1;
  /* Change back button color */
}

.start-energy-doc-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change main button gradient */
}
```

### Content Sections
```css
.welcome-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  /* Modify welcome card appearance */
}
```

## Utility Classes
The CSS file includes utility classes for quick styling:

### Positioning
- `.position-top-left`
- `.position-top-right`
- `.position-bottom-left`
- `.position-bottom-right`
- `.position-center`

### Text Styling
- `.text-small`, `.text-medium`, `.text-large`
- `.text-bold`, `.text-semibold`, `.text-light`
- `.text-center`, `.text-left`, `.text-right`

### Button Sizes
- `.btn-small`, `.btn-medium`, `.btn-large`
- `.btn-primary`, `.btn-secondary`, `.btn-accent`
- `.btn-outline`, `.btn-ghost`

### Hover Effects
- `.hover-lift`
- `.hover-scale`
- `.hover-shadow`

### Animations
- `.fade-in`
- `.slide-up`

## Responsive Design
The CSS includes responsive breakpoints. Modify these as needed:

```css
@media (max-width: 768px) {
  .energy-doc-title {
    font-size: 1.5rem; /* Smaller on mobile */
  }
}
```

## Testing Changes
1. Save changes to energyDocPage.css
2. The styles will automatically apply to EnergyDocPage
3. Refresh the page if hot reload doesn't work
4. Use browser DevTools to inspect and test changes

## Advanced Customization
For more advanced styling, you can:
1. Add new CSS classes to energyDocPage.css
2. Modify existing selectors
3. Add custom animations
4. Create new CSS variables for specific components

## Troubleshooting
- If styles don't apply, check that the CSS file is imported in EnergyDocPage.jsx
- Ensure CSS specificity is correct (use !important if necessary)
- Check for conflicting styles in other CSS files
