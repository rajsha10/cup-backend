# 🎨 AgenticCup Design System & Theme Guidelines

This theme is inspired by the modern, premium athletic design featuring a clean light-mode aesthetic, tall high-impact typography, and a vibrant electric blue accent.

---

## 🎨 Color Palette

| Token Name | Hex Code | Usage | Visual Example |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#1868FF` | Call-to-action buttons, active badges, highlights, links. | `🔵 Electric Blue` |
| **Main Background** | `#F4F4F6` | Page background, light, clean slate layout. | `⚪ Cool Off-White` |
| **Card / Container** | `#FFFFFF` | Content panels, navigation containers, table rows. | `⬜ Pure White` |
| **Primary Text** | `#0F0F11` | Headings, titles, high-priority text. | `⚫ Deep Charcoal` |
| **Secondary Text** | `#5E5E6E` | Body copy, descriptions, placeholders. | `🔘 Muted Slate` |
| **Soft Border** | `rgba(15, 15, 17, 0.08)` | Input borders, separator lines, cards. | `░ Light Gray Line` |

---

## 🏛️ CSS Design Tokens (Custom Properties)

Place this block inside your root CSS file (e.g., `index.css` or `styles.css`) to use across your components:

```css
:root {
  /* Color System */
  --color-primary: #1868FF;
  --color-primary-hover: #0051D9;
  --color-background: #F4F4F6;
  --color-surface: #FFFFFF;
  --color-text-primary: #0F0F11;
  --color-text-secondary: #5E5E6E;
  --color-border: rgba(15, 15, 17, 0.08);

  /* Typography */
  --font-family-display: 'Oswald', 'Antonio', sans-serif; /* For tall, condensed headers */
  --font-family-body: 'Outfit', 'Inter', sans-serif;

  /* Spacing & Borders */
  --radius-pill: 9999px;
  --radius-card: 20px;
  --radius-button: 12px;
  
  /* Shadows & Depth */
  --shadow-sm: 0 2px 8px rgba(15, 15, 17, 0.02);
  --shadow-md: 0 8px 30px rgba(15, 15, 17, 0.04);
}
```

---

## ✍️ Typography Hierarchy

1. **High-Impact Display Headings (`<h1>`, `<h2>`)**
   - **Font**: Tall, condensed, uppercase sans-serif (e.g., Google Fonts `Oswald` or `Antonio`).
   - **Style**: Bold / Ultra-Bold, uppercase, close letter-spacing (`letter-spacing: -0.02em`).
   - **CSS Example**:
     ```css
     h1 {
       font-family: var(--font-family-display);
       text-transform: uppercase;
       font-size: 5rem;
       font-weight: 700;
       color: var(--color-text-primary);
       line-height: 0.9;
     }
     ```

2. **Body & Interface Text (`<p>`, UI buttons, labels)**
   - **Font**: Clean, geometric sans-serif (e.g., Google Fonts `Outfit` or `Inter`).
   - **CSS Example**:
     ```css
     body {
       font-family: var(--font-family-body);
       color: var(--color-text-secondary);
       font-size: 1rem;
       line-height: 1.6;
     }
     ```

---

## 🎛️ UI & Layout Patterns

### 1. Pill Navigation Bar
- A pure white floating pill (`border-radius: 9999px`) with dark charcoal hover tags.
- The selected menu item uses a solid black background with white text.

### 2. Cards with Stats Grid
- Rounded container (`border-radius: 20px`) with a white background and a subtle drop shadow (`box-shadow: var(--shadow-md)`).
- Metric dividers should be thin vertical lines matching the secondary border color.

### 3. Sports Accent Stripes (Diagonal Stripes)
- Used as background highlights or borders behind players/assets:
  ```css
  .accent-stripe {
    background: repeating-linear-gradient(
      -45deg,
      var(--color-primary),
      var(--color-primary) 4px,
      transparent 4px,
      transparent 12px
    );
    height: 16px;
    width: 80px;
  }
  ```

---

## 🌐 Google Fonts Import

Include this at the top of your CSS or in the HTML `<head>` to import the design system fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Antonio:wght@700&family=Outfit:wght@300;400;500;700&display=swap" rel="stylesheet">
```
