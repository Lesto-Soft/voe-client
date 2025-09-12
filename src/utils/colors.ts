// src/utils/colors.ts

/**
 * Calculates the perceived luminance of a hex color to determine if a dark or light foreground color is more suitable.
 * @param hex - The hex color string (e.g., "#RRGGBB").
 * @returns 'dark' if the color is light (needs dark text), or 'light' if the color is dark (needs light text).
 */
export const getContrastingTextColor = (hex: string): "dark" | "light" => {
  if (!hex) return "dark"; // Default to dark text for invalid input

  // Remove '#' if present and expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return "dark"; // Default to dark text for invalid hex
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Formula for perceived brightness (YIQ)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? "dark" : "light";
};

export const PREDEFINED_CATEGORY_COLORS: string[] = [];
// A curated selection of 40 visually distinct colors from the Tailwind CSS palette.
// Organized by hue for easier visual scanning in the color picker.
export const PREDEFINED_CATEGORY_COLORS_OLD: string[] = [
  // Reds
  "#EF4444", // red-500
  "#F87171", // red-400
  // Oranges
  "#F97316", // orange-500
  "#FB923C", // orange-400
  // Amber / Yellow
  "#F59E0B", // amber-500
  "#FBBF24", // amber-400
  // Limes
  "#84CC16", // lime-500
  "#A3E635", // lime-400
  // Greens
  "#22C55E", // green-500
  "#4ADE80", // green-400
  // Emeralds
  "#10B981", // emerald-500
  "#34D399", // emerald-400
  // Teals
  "#14B8A6", // teal-500
  "#2DD4BF", // teal-400
  // Cyans
  "#06B6D4", // cyan-500
  "#22D3EE", // cyan-400
  // Sky / Blues
  "#0EA5E9", // sky-500
  "#38BDF8", // sky-400
  "#3B82F6", // blue-500
  "#60A5FA", // blue-400
  // Indigos
  "#6366F1", // indigo-500
  "#818CF8", // indigo-400
  // Violets
  "#8B5CF6", // violet-500
  "#A78BFA", // violet-400
  // Purples
  "#A855F7", // purple-500
  "#C084FC", // purple-400
  // Fuchsias
  "#D946EF", // fuchsia-500
  "#E879F9", // fuchsia-400
  // Pinks
  "#EC4899", // pink-500
  "#F472B6", // pink-400
  // Roses
  "#F43F5E", // rose-500
  "#FB7185", // rose-400
  // Grays & Neutrals
  "#64748B", // slate-500
  "#94A3B8", // slate-400
  "#737373", // neutral-500
  "#A3A3A3", // neutral-400
  "#78716C", // stone-500
  "#A8A29E", // stone-400
  "#7E22CE", // dark purple
  "#164E63", // dark cyan
];
