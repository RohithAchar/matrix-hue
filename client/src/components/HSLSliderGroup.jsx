import HSLSlider from './HSLSlider';

export default function HSLSliderGroup({ h, s, l, onChange }) {
  function hueTrack() {
    const stops = [0, 60, 120, 180, 240, 300, 360].map(
      (deg) => `hsl(${deg}, 100%, 50%)`
    );
    return `linear-gradient(to top, ${stops.join(', ')})`;
  }

  function satTrack() {
    return `linear-gradient(to top, hsl(${h}, 0%, 50%), hsl(${h}, 100%, 50%))`;
  }

  function lightTrack() {
    return `linear-gradient(to top, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`;
  }

  function handleChange(key, val) {
    onChange({ h, s, l, [key]: val });
  }

  return (
    <div className="hsl-slider-group">
      <HSLSlider
        label="Hue"
        value={h}
        min={0}
        max={360}
        unit="°"
        trackColor={hueTrack()}
        onChange={(v) => handleChange('h', v)}
      />
      <HSLSlider
        label="Saturation"
        value={s}
        min={0}
        max={100}
        unit="%"
        trackColor={satTrack()}
        onChange={(v) => handleChange('s', v)}
      />
      <HSLSlider
        label="Lightness"
        value={l}
        min={0}
        max={100}
        unit="%"
        trackColor={lightTrack()}
        onChange={(v) => handleChange('l', v)}
      />
    </div>
  );
}
