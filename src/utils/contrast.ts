/**
 * Determines whether text should be dark or light based on the background color hex.
 * Returns 'text-slate-950' for light backgrounds and 'text-white' for dark backgrounds
 * to ensure high contrast and WCAG readability.
 */
export function getContrastColor(hexColor: string | undefined): string {
  if (!hexColor) return 'text-white';
  
  // If it's a CSS variable or invalid hex, default to white text
  if (hexColor.startsWith('var') || !hexColor.startsWith('#')) {
    return 'text-white';
  }
  
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return 'text-white';
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // YIQ formula for perceived brightness
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Threshold of 145 provides perfect contrast for sports brand colors
  return (yiq >= 145) ? 'text-slate-950' : 'text-white';
}
