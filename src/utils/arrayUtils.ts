/**
 * Checks if a value is null or an empty array.
 * @param arr - The value to check, expected to be an array, null, or undefined.
 * @returns True if null or an empty array, false otherwise.
 */
export const isNullOrEmptyArray = (
  arr: unknown[] | null | undefined
): boolean => {
  if (arr === null) {
    return true;
  }
  // Array.isArray also narrows down the type from 'unknown[] | undefined' to 'unknown[]'
  if (Array.isArray(arr) && arr.length === 0) {
    return true;
  }
  return false;
};

export const arraysEqualUnordered = (a?: string[], b?: string[]): boolean => {
  if (!a && !b) return true; // Both are undefined or null
  if (!a || !b) return false; // One is undefined or null, the other isn't
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};
