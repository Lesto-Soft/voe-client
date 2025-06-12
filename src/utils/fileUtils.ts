const serverBaseUrl = import.meta.env.VITE_API_URL || "";

export const createFileUrl = (
  type: string,
  id: string,
  fileName: string
): string => {
  return `${serverBaseUrl}/static/${type}/${id}/${fileName}`;
};
