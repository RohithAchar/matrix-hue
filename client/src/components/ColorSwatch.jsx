export default function ColorSwatch({ h, s, l, size = 80, className = '' }) {
  return (
    <div
      className={`color-swatch ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
        borderRadius: 8,
        border: '1px solid #333',
      }}
    />
  );
}
