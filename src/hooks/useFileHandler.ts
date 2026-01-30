// src/hooks/useFileHandler.ts
import { useState, useCallback } from "react";
import { compressFile } from "../utils/fileCompression";
import { toast } from "react-toastify";
import { UPLOAD_MAX_SIZE_MB } from "../utils/GLOBAL_PARAMETERS";

export const useFileHandler = () => {
  const [isCompressing, setIsCompressing] = useState(false);

  const processFiles = useCallback(async (files: File[]): Promise<File[]> => {
    if (files.length === 0) return [];

    setIsCompressing(true);
    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          // Only compress images. PDFs and other docs should be passed through.
          if (file.type.startsWith("image/")) {
            return await compressFile(file, UPLOAD_MAX_SIZE_MB);
          }
          return file;
        })
      );
      return processedFiles;
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Грешка при обработка на файловете.");
      return files;
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return { processFiles, isCompressing };
};
