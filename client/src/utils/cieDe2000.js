function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function rgbToXyz(r, g, b) {
  function srgb(v) {
    v /= 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  }
  r = srgb(r); g = srgb(g); b = srgb(b);
  return [
    (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
    (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100,
  ];
}

function xyzToLab(x, y, z) {
  const refX = 95.047, refY = 100.0, refZ = 108.883;
  function f(t) {
    const d = 6 / 29;
    return t > d * d * d ? Math.cbrt(t) : t / (3 * d * d) + 4 / 29;
  }
  return [
    116 * f(y / refY) - 16,
    500 * (f(x / refX) - f(y / refY)),
    200 * (f(y / refY) - f(z / refZ)),
  ];
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

export function cieDe2000(h1, s1, l1, h2, s2, l2) {
  const [r1, g1, b1] = hslToRgb(h1, s1, l1);
  const [r2, g2, b2] = hslToRgb(h2, s2, l2);
  const [x1, y1, z1] = rgbToXyz(r1, g1, b1);
  const [x2, y2, z2] = rgbToXyz(r2, g2, b2);
  const [L1, a1, b1s] = xyzToLab(x1, y1, z1);
  const [L2, a2, b2s] = xyzToLab(x2, y2, z2);

  const kL = 1, kC = 1, kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1s * b1s);
  const C2 = Math.sqrt(a2 * a2 + b2s * b2s);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1s * b1s);
  const C2p = Math.sqrt(a2p * a2p + b2s * b2s);

  function hp(x, y) {
    if (x === 0 && y === 0) return 0;
    const h = radToDeg(Math.atan2(y, x));
    return h >= 0 ? h : h + 360;
  }
  const h1p = hp(a1p, b1s);
  const h2p = hp(a2p, b2s);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  function dh(C1, C2, h1, h2) {
    if (C1 * C2 === 0) return 0;
    let d = h2 - h1;
    if (d > 180) d -= 360;
    else if (d < -180) d += 360;
    return d;
  }
  const dh_ = dh(C1p, C2p, h1p, h2p);
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(degToRad(dh_ / 2));

  const Lb = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  function hpAvg(h1, h2, C1, C2) {
    if (C1 * C2 === 0) return h1 + h2;
    let h = (h1 + h2) / 2;
    if (Math.abs(h1 - h2) > 180) h += h1 + h2 < 360 ? 180 : -180;
    return h;
  }
  const Hp = hpAvg(h1p, h2p, C1p, C2p);

  const T = 1 - 0.17 * Math.cos(degToRad(Hp - 30)) + 0.24 * Math.cos(degToRad(2 * Hp)) + 0.32 * Math.cos(degToRad(3 * Hp + 6)) - 0.20 * Math.cos(degToRad(4 * Hp - 63));

  const dTheta = 30 * Math.exp(-(((Hp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt((Cp ** 7) / ((Cp ** 7) + (25 ** 7)));
  const SL = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2);
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;
  const RT = -Math.sin(degToRad(2 * dTheta)) * Rc;

  const dE = Math.sqrt(
    (dLp / (kL * SL)) ** 2 +
    (dCp / (kC * SC)) ** 2 +
    (dHp / (kH * SH)) ** 2 +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}
