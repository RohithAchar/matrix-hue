import { useRef, useCallback } from 'react';

export default function HSLSlider({ label, value, min, max, unit, onChange, trackColor }) {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const dragging = useRef(false);

  const pct = ((value - min) / (max - min)) * 100;

  const valueFromEvent = useCallback(
    (clientY) => {
      const rect = trackRef.current.getBoundingClientRect();
      const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      const ratio = 1 - y / rect.height;
      return Math.round(min + ratio * (max - min));
    },
    [min, max]
  );

  function handleTrackClick(e) {
    const v = valueFromEvent(e.clientY);
    if (v !== value) onChange(v);
  }

  function handleMouseDown(e) {
    e.preventDefault();
    dragging.current = true;
    const v = valueFromEvent(e.clientY);
    if (v !== value) onChange(v);

    function onMove(ev) {
      if (!dragging.current) return;
      const v = valueFromEvent(ev.clientY);
      onChange(v);
    }

    function onUp() {
      dragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(value + 1, max));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(value - 1, min));
    }
  }

  return (
    <div className="hsl-slider">
      <label className="slider-label">{label}</label>
      <div className="slider-track-wrap">
        <div
          className="slider-track"
          ref={trackRef}
          onClick={handleTrackClick}
          style={{ background: trackColor }}
        >
          <div
            className="slider-thumb"
            ref={thumbRef}
            style={{ bottom: `${pct}%` }}
            onMouseDown={handleMouseDown}
            tabIndex={0}
            role="slider"
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <span className="slider-value">{value}{unit}</span>
    </div>
  );
}
