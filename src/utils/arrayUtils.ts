import { ICategory } from "../db/interfaces";

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

// Generic containsAny function for comparing arrays of any type
export const containsAny = <T>(arr1: T[], arr2: T[]): boolean => {
  return arr1.some((item) => arr2.includes(item));
};

// Specific function for comparing category arrays by _id
export const containsAnyCategoryById = (
  categories1: ICategory[],
  categories2: ICategory[]
): boolean => {
  const ids1 = categories1.map((cat) => cat._id);
  const ids2 = categories2.map((cat) => cat._id);
  return containsAny(ids1, ids2);
};
