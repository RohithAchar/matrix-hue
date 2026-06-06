/*
 * ColorSwatch.jsx — Renders an HSL color swatch
 *
 * Used for both the target color (large, during memorize phase)
 * and the preview swatch (smaller, during recreate phase)
 *
 * TODO:
 * - Props: { h, s, l, size?: number, className?: string }
 * - Renders a div with background-color: hsl(h, s%, l%)
 * - Size defaults to large (200px) for target, small (80px) for preview
 * - Rounded corners (8px), subtle border for visibility on light colors
 * - GSAP entrance animation (opacity + scale)
 */

export default function ColorSwatch({ h, s, l, size = 200, className = "" }) {
  return (
    <div
      className={`color-swatch ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
        borderRadius: 8,
        border: "1px solid #333",
      }}
    />
  );
}
