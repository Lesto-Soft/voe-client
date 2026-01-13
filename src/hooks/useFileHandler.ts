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
          // Директна компресия без изкуствено чакане
          return await compressFile(file, UPLOAD_MAX_SIZE_MB);
        })
      );
      return processedFiles;
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Грешка при обработка на файловете.");
      return files; // Връщаме оригиналите при фатална грешка
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return { processFiles, isCompressing };
};
