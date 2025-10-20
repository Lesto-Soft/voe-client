// src/hooks/usePastedAttachments.ts
import { useEffect } from "react";
import { toast } from "react-toastify";
import { TFunction } from "i18next";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../../../db/config";

export const usePastedAttachments = (
  isOpen: boolean,
  newAttachments: File[],
  existingAttachments: string[],
  setNewAttachments: React.Dispatch<React.SetStateAction<File[]>>,
  t: TFunction<("dashboard" | "caseSubmission")[], undefined>
) => {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const containsFiles = Array.from(items).some(
        (item) => item.kind === "file"
      );
      if (!containsFiles) {
        return;
      }

      const currentFilesCount =
        newAttachments.length + existingAttachments.length;
      if (currentFilesCount >= MAX_UPLOAD_FILES) {
        toast.warn(
          t("caseSubmission:caseSubmission.noMoreAttachmentsAllowed", {
            max: MAX_UPLOAD_FILES,
          })
        );
        return;
      }

      const availableSlots = MAX_UPLOAD_FILES - currentFilesCount;
      const pastedBlobs: Blob[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            if (blob.size > MAX_UPLOAD_MB * 1024 * 1024) {
              toast.error(
                t("caseSubmission:errors.fileTooLarge", {
                  fileName: "Pasted image",
                  maxSize: MAX_UPLOAD_MB,
                })
              );
              continue;
            }
            pastedBlobs.push(blob);
          }
        }
      }

      if (pastedBlobs.length > 0) {
        event.preventDefault();

        const blobsToProcess = pastedBlobs.slice(0, availableSlots);

        if (pastedBlobs.length > blobsToProcess.length) {
          toast.warn(
            t("caseSubmission:errors.maxFilesExceeded", {
              max: MAX_UPLOAD_FILES,
            })
          );
        }

        const filesToAdd = blobsToProcess.map((blob, index) => {
          const extension = blob.type.split("/")[1] || "png";
          const newFileName = `pasted-image-${Date.now()}-${index}.${extension}`;
          return new File([blob], newFileName, { type: blob.type });
        });

        if (filesToAdd.length > 0) {
          setNewAttachments((prevAttachments) => [
            ...prevAttachments,
            ...filesToAdd,
          ]);
          toast.success(
            t("caseSubmission:caseSubmission.filesAdded", {
              count: filesToAdd.length,
            })
          );
        }
      }
    };

    if (isOpen) {
      document.addEventListener("paste", handlePaste);
    }

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, newAttachments, existingAttachments, setNewAttachments, t]);
};
