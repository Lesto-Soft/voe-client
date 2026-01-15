// src/components/case-components/comment/EditButton.tsx
import React, { useState, useEffect, useMemo } from "react";
import { PencilIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { IComment } from "../../db/interfaces";
import { useUpdateComment } from "../../graphql/hooks/comment";
import { COMMENT_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import UnifiedEditor from "../forms/partials/UnifiedRichTextEditor";

interface EditButtonProps {
  comment: IComment;
  currentAttachments?: string[];
  caseNumber: number;
  mentions: { name: string; username: string; _id: string }[];
  showText?: boolean;
}

export interface UpdateCommentInput {
  content?: string;
  attachments?: File[];
  deletedAttachments?: string[];
}

const EditButton: React.FC<EditButtonProps> = ({
  comment,
  caseNumber,
  mentions,
  showText = false,
}) => {
  if (!comment) return null;

  const { t } = useTranslation(["modals", "caseSubmission"]);
  const [isOpen, setIsOpen] = useState(false);

  // States за съдържание и файлове
  const [content, setContent] = useState<string>(comment.content || "");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  // Първоначални стойности за проверка на промени (Unsaved Changes)
  const [initialContent, setInitialContent] = useState<string>("");
  const [initialExistingAttachments, setInitialExistingAttachments] = useState<
    string[]
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // За компресия на файлове

  const { updateComment, loading } = useUpdateComment(caseNumber);

  // Инициализация при отваряне на модала
  useEffect(() => {
    if (isOpen) {
      const initContent = comment.content || "";
      const initFiles = comment.attachments || [];

      setContent(initContent);
      setInitialContent(initContent);

      setExistingAttachments(initFiles);
      setInitialExistingAttachments(initFiles);

      setNewAttachments([]);
      setError(null);
    }
  }, [isOpen, comment]);

  // Проверка за промени (дали бутонът "Запази" да е активен и дали да показваме предупреждение при затваряне)
  const hasChanges = useMemo(() => {
    if (loading) return false;
    if (content !== initialContent) return true;
    if (newAttachments.length > 0) return true;

    if (initialExistingAttachments.length !== existingAttachments.length)
      return true;
    return (
      [...initialExistingAttachments].sort().join(",") !==
      [...existingAttachments].sort().join(",")
    );
  }, [
    content,
    newAttachments,
    existingAttachments,
    initialContent,
    initialExistingAttachments,
    loading,
  ]);

  const handleCloseRequest = (open: boolean) => {
    if (!open && hasChanges) {
      setIsConfirmOpen(true);
    } else {
      setIsOpen(open);
    }
  };

  const handleSave = async () => {
    setError(null);

    const deletedAttachments = initialExistingAttachments.filter(
      (url) => !existingAttachments.includes(url)
    );

    const input: UpdateCommentInput = {
      content,
      attachments: newAttachments.length > 0 ? newAttachments : undefined,
      deletedAttachments:
        deletedAttachments.length > 0 ? deletedAttachments : undefined,
    };

    try {
      await updateComment(input, comment._id);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Грешка при запис на коментар.");
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleCloseRequest}>
        <Dialog.Trigger asChild>
          <button
            className={`cursor-pointer ${
              showText
                ? "flex items-center gap-2 w-full p-2 text-sm text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                : "p-1.5 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
            }`}
            type="button"
            title="Редактирай"
          >
            <PencilIcon className="h-4 w-4" />
            {showText && <span>Редактирай</span>}
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[85vh]">
            {/* Хедър: Статичен */}
            <div className="p-6 pb-2 flex-shrink-0">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
                {t("editComment", "Редактирай коментара")}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500">
                {t("editCommentInfo")}
              </Dialog.Description>
            </div>

            {/* Редактор: Разтяга се до лимита на модала */}
            <div className="flex-grow overflow-hidden flex flex-col px-6 min-h-0">
              <UnifiedEditor
                content={content}
                onContentChange={setContent}
                attachments={newAttachments}
                setAttachments={setNewAttachments}
                existingAttachments={existingAttachments}
                setExistingAttachments={setExistingAttachments}
                mentions={mentions}
                placeholder={t("writeHere")}
                editorClassName="min-h-0"
                minLength={COMMENT_CONTENT.MIN}
                maxLength={COMMENT_CONTENT.MAX}
                hideSideButtons={true}
                onProcessingChange={setIsProcessing}
                caseId={comment._id}
                type="comment"
              />
            </div>

            {/* Грешки */}
            {error && (
              <div className="mx-6 my-2 flex items-start p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 font-bold">{error}</p>
              </div>
            )}

            {/* Футър: Винаги отдолу */}
            <div className="p-6 pt-2 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  type="button"
                  disabled={loading || isProcessing}
                >
                  {t("cancel", "Отказ")}
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={
                  loading ||
                  isProcessing ||
                  !hasChanges ||
                  (content.length > 0 &&
                    (content.length < COMMENT_CONTENT.MIN ||
                      content.length > COMMENT_CONTENT.MAX))
                }
                className={`px-6 py-2 text-sm font-medium text-white rounded transition-all shadow-md ${
                  loading || isProcessing || !hasChanges
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
                type="button"
              >
                {loading ? t("saving") : t("save")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmActionDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => {
          setIsConfirmOpen(false);
          setIsOpen(false);
        }}
        title={t("unsavedChangesTitle", "Незапазени промени")}
        description={t(
          "unsavedChangesDescription",
          "Имате незапазен текст или прикачени файлове, които ще бъдат изгубени. Сигурни ли сте, че искате да затворите?"
        )}
        confirmButtonText={t("closeEditor", "Затвори")}
        isDestructiveAction={true}
      />
    </>
  );
};

export default EditButton;
