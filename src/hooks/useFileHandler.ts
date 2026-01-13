// src/hooks/useFileHandler.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { compressFile } from "../utils/fileCompression";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  UPLOAD_MAX_SIZE_MB,
  UPLOAD_MAX_SIZE_BYTES,
} from "../utils/GLOBAL_PARAMETERS";

interface UseFileHandlerReturn {
  processFiles: (files: File[]) => Promise<File[]>;
  isCompressing: boolean;
}

export const useFileHandler = (delay: number = 2000): UseFileHandlerReturn => {
  const [isCompressing, setIsCompressing] = useState(false);
  const { t } = useTranslation("modals");

  // Използваме ReturnType за съвместимост (Browser/Node)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Пазим ID на текущия toast, за да не натрупваме съобщения при бързи промени
  const toastIdRef = useRef<number | string | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    };
  }, []);

  const processFiles = useCallback(
    async (files: File[]): Promise<File[]> => {
      // 1. Ако има предишен таймер (debounce), го чистим
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Ако има предишен активен тоаст, го махаме, за да не станат два
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      setIsCompressing(true);

      // 2. Определяме съобщението ВЕДНАГА (преди delay-a)
      const processingMessage =
        files.length === 1
          ? t("processing_one", "Обработва файла...")
          : t("processing_many", "Обработва файловете...");

      // 3. Показваме директно правилното съобщение
      const toastId = toast.info(processingMessage, {
        autoClose: false,
        isLoading: true,
      });

      // Запазваме ID-то в ref-а
      toastIdRef.current = toastId;

      return new Promise<File[]>((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            // Тук вече не е нужно да правим toast.update за текст,
            // защото текстът е правилен от самото начало.
            const processedFiles = await Promise.all(
              files.map(async (file) => {
                // Вече подаваме MAX_SIZE_MB като втори параметър
                const processed = await compressFile(file, UPLOAD_MAX_SIZE_MB);

                if (processed.size > UPLOAD_MAX_SIZE_BYTES) {
                  toast.warning(
                    t("file_too_large_warning", {
                      fileName: file.name,
                      maxSize: UPLOAD_MAX_SIZE_MB,
                      defaultValue: `Файлът ${file.name} не можа да бъде компресиран под ${UPLOAD_MAX_SIZE_MB}MB.`,
                    })
                  );
                }
                return processed;
              })
            );

            toast.dismiss(toastId);
            toastIdRef.current = null;
            resolve(processedFiles);
          } catch (error) {
            console.error("Compression error", error);
            toast.dismiss(toastId);
            toastIdRef.current = null;
            toast.error(
              t(
                "generic_process_error",
                "Възникна грешка при обработката на файловете."
              )
            );
            resolve(files);
          } finally {
            setIsCompressing(false);
            timeoutRef.current = null;
          }
        }, delay);
      });
    },
    [delay, t]
  );

  return { processFiles, isCompressing };
};
