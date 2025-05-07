/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize.
 * @returns The capitalized string, or an empty string if input is null/undefined/empty.
 */
export const capitalizeFirstLetter = (
  str: string | undefined | null
): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
