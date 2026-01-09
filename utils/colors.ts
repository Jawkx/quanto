/**
 * Color utility functions for theme generation
 * Converts between hex and HSL, and generates secondary colors
 */

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Convert hex color to HSL
 */
export function hexToHSL(hex: string): HSL {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate secondary (darker) color from primary
 * Reduces lightness by 12-16% while preserving hue
 */
export function generateSecondaryColor(primaryHex: string, lightnessReduction: number = 14): string {
  const hsl = hexToHSL(primaryHex);

  // Reduce lightness by the specified amount (default 14%)
  const newLightness = Math.max(0, hsl.l - lightnessReduction);

  return hslToHex({
    h: hsl.h, // Preserve hue exactly
    s: hsl.s, // Preserve saturation
    l: newLightness,
  });
}

/**
 * Generate a complete color palette from a primary color
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  selected: string;
  background: string;
  error: string;
}

export function generatePalette(primaryHex: string): ColorPalette {
  const primaryHSL = hexToHSL(primaryHex);
  const secondary = generateSecondaryColor(primaryHex, 14);

  // Generate background as an even darker shade
  const backgroundHSL = {
    h: primaryHSL.h,
    s: primaryHSL.s,
    l: Math.max(0, primaryHSL.l - 22),
  };

  // Generate selected state color (between secondary and background)
  const selectedHSL = {
    h: primaryHSL.h,
    s: primaryHSL.s,
    l: Math.max(0, primaryHSL.l - 18),
  };

  // Generate border color (slightly lighter than secondary)
  const borderHSL = {
    h: primaryHSL.h,
    s: primaryHSL.s,
    l: Math.max(0, primaryHSL.l - 8),
  };

  return {
    primary: primaryHex,
    secondary,
    text: '#ffffff',
    textMuted: '#9ca3af',
    border: hslToHex(borderHSL),
    selected: hslToHex(selectedHSL),
    background: hslToHex(backgroundHSL),
    error: '#ef4444',
  };
}

// Default color - the original primary color from the app
export const DEFAULT_PRIMARY_COLOR = '#374151';
