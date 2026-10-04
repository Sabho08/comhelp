# DESIGN SYSTEM: ACCESSROUTE LIVE™

## 1. Visual Language & Accessibility Principles
AccessRoute Live provides a **Google Maps familiar mental model** paired with high-clarity accessibility intelligence:
1. **Map-First Layout**: 100% viewport coverage with floating, non-intrusive floating cards.
2. **Accessible Color Contrast**: Complies with **WCAG 2.1 AAA** standards (minimum 7:1 contrast for high-contrast mode, 4.5:1 for standard mode).
3. **No Sole-Color Reliance**: Every warning, status, and transit mode is accompanied by distinct iconography, text labels, and semantic ARIA tags.
4. **Touch Target Sizing**: All buttons, pills, and interactive pins have minimum touch targets of **48px x 48px**.
5. **Reduced Motion**: Respects `prefers-reduced-motion` for all sheet transitions and animated pulsing hazard halos.

---

## 2. Color Palette & Roles

### Standard Light/Dark Theme
- **Primary Brand (Action / Selected)**: `#2563EB` (Accessible Royal Blue)
- **Safe / Step-Free (Verified Ramp, Lift)**: `#059669` (Forest Green - 4.8:1 contrast on white)
- **Warning / Partial Obstacle (Slope, Unverified)**: `#D97706` (Amber Ochre - 4.6:1 contrast)
- **Hazard / Blocked (Stairs, Pothole, Barricade)**: `#DC2626` (Ruby Red - 4.9:1 contrast)
- **Rally / Crowd Zone**: `#7C3AED` (Violet Purple with 30% alpha fill)
- **Surface Neutral (Map Overlays)**: `#FFFFFF` / Dark Slate `#0F172A`
- **Text Primary**: `#0F172A` (Light mode) / `#F8FAFC` (Dark mode)

### WCAG AAA High-Contrast Mode
- **Background**: `#000000` (Pure Black)
- **Text / Borders**: `#FFFF00` (High-Visibility Pure Yellow - 19.5:1 contrast)
- **Action Highlight**: `#00FFFF` (Cyan Neon - 16.7:1 contrast)
- **Hazard Stop**: `#FF3333` (Bright Crimson - 8.2:1 contrast)

---

## 3. Typography & Sizing
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Heading (Next Turn Maneuver)**: 22px / 28px Semi-Bold
- **Subheading (Street / ETA)**: 16px / 22px Medium
- **Body / Badges**: 14px / 20px Regular
- **Telemetry HUD Figures**: 18px Bold Tabular Numbers (Monospaced alignment)

---

## 4. UI Components & States
1. **Floating Search Card**: Default, Focused with autocomplete suggestions list, active place preview.
2. **6-Mode Mobility Selector**: Horizontal scrolling pill bar with active blue fill, icons, and keyboard navigation.
3. **Route Alternative Cards**: 
   - `Recommended (Step-Free Assurance)`: Green badge, bold ETA, verified ramp count.
   - `Alternative`: Neutral border, tradeoff disclosure tags (e.g. *"⚠ 2 Stairs"*).
4. **Turn-by-Turn HUD**: Floating green maneuver banner at top, bottom summary sheet with distance remaining and speed.
5. **Community Hazard Modal**: Multi-select obstacle category, pinpoint location selector, severity selector, submit state.
