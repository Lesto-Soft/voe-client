import { Category } from "../types/CaseSubmittionTypes";

// Reads a File object and returns a Promise resolving with base64 string
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result?.indexOf(",");
      if (typeof result === "string" && commaIndex !== -1) {
        const base64String = result.substring(commaIndex + 1);
        resolve(base64String);
      } else {
        reject(new Error("Could not read file or extract base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Finds category IDs based on selected names
export const findCategoryIds = (
  selectedNames: string[],
  allCategories: Category[] | undefined // Allow undefined from query hook
): string[] => {
  if (!allCategories || allCategories.length === 0) return [];
  return allCategories
    .filter((cat) => selectedNames.includes(cat.name))
    .map((cat) => cat._id)
    .filter((id): id is string => !!id);
};
