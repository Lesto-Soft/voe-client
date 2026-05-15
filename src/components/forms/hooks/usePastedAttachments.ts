// src/hooks/usePastedAttachments.ts
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { TFunction } from "i18next";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../../../db/config";

// Module-level stack of active paste-aware hosts (e.g. case editor, answer editor,
// task activity editor). When several hosts are open at once (e.g. edit-case modal
// over the case page while the new-answer panel is also expanded), only the host
// at the top of the stack — the most recently mounted — should consume the paste.
// Otherwise the same clipboard image ends up attached to every open host.
const activeHosts: number[] = [];
let nextHostId = 1;

export const usePastedAttachments = (
  isOpen: boolean,
  newAttachments: File[],
  existingAttachments: string[],
  setNewAttachments: React.Dispatch<React.SetStateAction<File[]>>,
  t: TFunction<("dashboard" | "caseSubmission")[], undefined>
) => {
  const myIdRef = useRef<number | null>(null);

  // Register / unregister this host in the stack. Depends only on `isOpen` so
  // that unrelated re-renders (e.g. attachments state changing) don't reshuffle
  // the stack and accidentally move this host to the top.
  useEffect(() => {
    if (!isOpen) return;
    if (myIdRef.current === null) myIdRef.current = nextHostId++;
    activeHosts.push(myIdRef.current);
    return () => {
      if (myIdRef.current === null) return;
      const idx = activeHosts.lastIndexOf(myIdRef.current);
      if (idx !== -1) activeHosts.splice(idx, 1);
    };
  }, [isOpen]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Only the topmost open host should consume the paste.
      if (
        myIdRef.current === null ||
        activeHosts[activeHosts.length - 1] !== myIdRef.current
      ) {
        return;
      }

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
