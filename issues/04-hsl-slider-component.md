# Issue 4 — HSL Slider Component

**Type:** AFK
**Blocked by:** Issue 1 (Project Scaffold)
**User stories covered:** 16

---

## What to Build

A reusable vertical HSL slider component that the player uses to recreate the target color. Three instances are composed together (Hue, Saturation, Lightness) with a live preview swatch.

This component is the primary input mechanism for the entire game. It must be polished, responsive, and visually cohesive with the dark minimal aesthetic.

### Component: `HSLSlider`

Located at `client/src/components/HSLSlider.jsx`.

**Props:**

```js
{
  label: string,        // "Hue", "Saturation", or "Lightness"
  value: number,        // current value
  min: number,          // 0 for H, 0 for S, 0 for L
  max: number,          // 360 for H, 100 for S, 100 for L
  unit: string,         // "°" for H, "%" for S and L
  onChange: (val) => void,
  trackColor: string,   // CSS color for the filled track portion
}
```

**Visual design:**

- Vertical orientation, approximately 200px tall.
- Thin track (4px width), rounded.
- Circular thumb (16px diameter) that appears on hover/drag with a subtle glow.
- Track is dark gray (`#333`), the filled portion uses `trackColor`.
- Numeric readout displayed below or beside the track.
- Label displayed above the track.

**Behavior:**

- Clicking anywhere on the track jumps the thumb to that position.
- Dragging the thumb updates the value continuously.
- `onChange` fires on every value change (controlled component).
- Keyboard accessible: up/down arrows increment/decrement by 1.

### Composition: `HSLSliderGroup`

Located at `client/src/components/HSLSliderGroup.jsx` (or inline in `Game.jsx` later — for now keep it as its own file).

Renders three `HSLSlider` instances:

| Slider | Min | Max | Unit | Track color |
|---|---|---|---|---|
| Hue | 0 | 360 | ° | Gradient from red through rainbow back to red |
| Saturation | 0 | 100 | % | Gradient from gray to the current hue |
| Lightness | 0 | 100 | % | Gradient from black to white through the current hue/sat |

### Component: `ColorPreviewSwatch`

Located at `client/src/components/ColorSwatch.jsx`.

**Props:** `{ h: number, s: number, l: number }`

- Renders a square (80x80) filled with the HSL color.
- Rounded corners (8px).
- Subtle border in very dark gray so white/light colors are visible.
- Updates in real-time as sliders are dragged.

### Example: Usage in a Page

```jsx
const [hsl, setHsl] = useState({ h: 180, s: 50, l: 50 });

<ColorPreviewSwatch h={hsl.h} s={hsl.s} l={hsl.l} />

<HSLSliderGroup
  h={hsl.h}
  s={hsl.s}
  l={hsl.l}
  onChange={({ h, s, l }) => setHsl({ h, s, l })}
/>
```

### Example: Track Color Gradients

For the **Hue slider**, the filled track portion uses a CSS gradient:

```css
background: linear-gradient(to top, 
  hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%),
  hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%)
);
```

For the **Saturation slider**, the filled track goes from gray at the bottom to fully saturated at the top at the current hue:

```css
/* If hue = 200 */
background: linear-gradient(to top, hsl(200, 0%, 50%), hsl(200, 100%, 50%));
```

For the **Lightness slider**, the filled track goes from black at the bottom to white at the top at the current hue + saturation:

```css
/* If hue = 200, saturation = 60% */
background: linear-gradient(to top, hsl(200, 60%, 0%), hsl(200, 60%, 50%), hsl(200, 60%, 100%));
```

---

## Acceptance Criteria

- [x] `HSLSlider` renders a vertical track with a draggable thumb.
- [x] Clicking on the track jumps the thumb to that position.
- [x] Dragging the thumb updates the value and fires `onChange`.
- [x] Numeric readout updates live.
- [x] `HSLSliderGroup` renders three sliders (H, S, L) with correct min/max/unit/trackColor.
- [x] `ColorPreviewSwatch` renders a square filled with the HSL color and updates in real time.
- [x] Test: simulate a drag on the Hue slider and verify the value changes.

---

## Blocked by

Issue 1 — Project Scaffold (need a Vite + React app to render components).
