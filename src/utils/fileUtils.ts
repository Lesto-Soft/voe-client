import {
  DocumentTextIcon,
  PhotoIcon,
  TableCellsIcon,
  ArchiveBoxIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

const serverBaseUrl = import.meta.env.VITE_API_URL || "";

export const createFileUrl = (
  type: string,
  id: string,
  fileName: string
): string => {
  return `${serverBaseUrl}/static/${type}/${id}/${fileName}`;
};

export const getIconForFile = (fileName: string) => {
  const extension = fileName?.split(".").pop()?.toLowerCase() || "";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  if (imageExtensions.includes(extension)) {
    return PhotoIcon; // Icon for images
  }

  if (extension === "pdf") {
    return DocumentTextIcon; // A specific icon for previewable PDFs
  }

  const docExtensions = ["doc", "docx", "txt"];
  if (docExtensions.includes(extension)) {
    return DocumentIcon; // A more generic icon for non-previewable text files
  }

  const sheetExtensions = ["xls", "xlsx", "csv"];
  if (sheetExtensions.includes(extension)) {
    return TableCellsIcon; // Icon for spreadsheets
  }

  const archiveExtensions = ["zip", "rar", "7z"];
  if (archiveExtensions.includes(extension)) {
    return ArchiveBoxIcon; // Icon for archives
  }

  return DocumentIcon; // Default fallback icon
};
