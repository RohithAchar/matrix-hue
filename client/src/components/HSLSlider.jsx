/*
 * HSLSlider.jsx — Vertical range slider for Hue, Saturation, or Lightness
 *
 * TODO:
 * - Render a vertical track (thin, rounded, dark gray #333)
 * - Render a filled portion of the track using trackColor prop
 * - Render a circular thumb (16px) with hover glow
 * - Label above, numeric readout below
 * - Click on track → jump thumb to that position
 * - Drag thumb → continuously fire onChange
 * - Keyboard: up/down arrows ±1
 * - Props: { label, value, min, max, unit, onChange, trackColor }
 */

export default function HSLSlider({ label, value, min, max, unit, onChange, trackColor }) {
  return (
    <div className="hsl-slider">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        orient="vertical"
      />
      <span className="slider-value">{value}{unit}</span>
    </div>
  );
}
