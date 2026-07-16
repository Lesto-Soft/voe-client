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
  // The file name is stored verbatim (server-side `path.basename`), so it can
  // contain characters that are URL syntax: `#` truncates the request at the
  // fragment and `?` at the query string, while `%` sequences get decoded back
  // into a name that no longer exists on disk.
  return `${serverBaseUrl}/static/${type}/${id}/${encodeURIComponent(
    fileName
  )}`;
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
