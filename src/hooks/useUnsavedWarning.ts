// src/hooks/useUnsavedChangesWarning.ts
import { useState, useEffect, useRef, useCallback, useId } from "react";
import { getTextLength } from "../utils/contentRenderer";
import { useTranslation } from "react-i18next";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";

interface WarningDialogContent {
  title: string;
  description: string;
  confirmText: string;
}

/**
 * A hook to warn users about unsaved changes before closing an editor or navigating away.
 * @param content The text content of the editor.
 * @param enabled A boolean to indicate if the warning system should be active (e.g., when the editor is visible).
 */
export const useUnsavedChangesWarning = (
  content: string,
  enabled: boolean = true,
  attachmentCount: number = 0 // add attachmentCount to the signature
) => {
  const { t } = useTranslation("modals");
  const uniqueId = useId();
  const { addDirtySource, removeDirtySource } = useUnsavedChanges();

  // isDirty to check both content and attachments
  const isDirty = getTextLength(content) > 0 || attachmentCount > 0;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const proceedCallback = useRef<(() => void) | null>(null);

  // Effect to register this editor's dirty status with the global navigation blocker
  useEffect(() => {
    if (enabled && isDirty) {
      addDirtySource(uniqueId);
    } else {
      removeDirtySource(uniqueId);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      removeDirtySource(uniqueId);
    };
  }, [enabled, isDirty, uniqueId, addDirtySource, removeDirtySource]);

  /**
   * Wraps an action (like closing a modal/editor).
   * If there are unsaved changes, it opens the confirmation dialog.
   * Otherwise, it executes the action immediately.
   * @param callback The function to execute.
   */
  const withWarning = useCallback(
    (callback: () => void) => {
      if (isDirty && enabled) {
        setIsDialogOpen(true);
        proceedCallback.current = callback;
      } else {
        callback();
      }
    },
    [isDirty, enabled]
  );

  const handleConfirm = () => {
    if (proceedCallback.current) {
      proceedCallback.current();
    }
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    proceedCallback.current = null;
  };

  const dialogContent: WarningDialogContent = {
    title: t("unsavedChangesTitle", "Незапазени промени"),
    description: t(
      "unsavedChangesDescription",
      "Имате незапазен текст или прикачени файлове, които ще бъдат изгубени. Сигурни ли сте, че искате да затворите?"
    ),
    confirmText: t("closeEditor", "Затвори"),
  };

  return {
    isDialogOpen,
    handleConfirm,
    handleCancel,
    withWarning,
    dialogContent,
  };
};
