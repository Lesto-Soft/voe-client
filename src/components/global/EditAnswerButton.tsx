// src/components/case-components/answer/EditAnswerButton.tsx
import React, { useState, useEffect, useMemo } from "react";
import { PencilIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { useUpdateAnswer } from "../../graphql/hooks/answer";
import { ANSWER_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import UnifiedEditor from "../forms/partials/UnifiedRichTextEditor";
import { IAnswer } from "../../db/interfaces";

interface EditButtonProps {
  answer: IAnswer;
  currentAttachments?: string[];
  caseNumber: number;
  me: any;
  mentions: { name: string; username: string; _id: string }[];
  showText?: boolean;
}

export interface UpdateAnswerInput {
  content?: string;
  attachments?: File[];
  deletedAttachments?: string[];
}

const EditAnswerButton: React.FC<EditButtonProps> = ({
  answer,
  caseNumber,
  me,
  mentions,
  showText = false,
}) => {
  if (!answer) return null;

  const { t } = useTranslation(["modals", "caseSubmission"]);
  const [isOpen, setIsOpen] = useState(false);

  // States за съдържание и файлове
  const [content, setContent] = useState<string>(answer.content || "");
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

  const { updateAnswer, loading } = useUpdateAnswer(caseNumber);

  // Инициализация при отваряне
  useEffect(() => {
    if (isOpen) {
      const initContent = answer.content || "";
      const initFiles = answer.attachments || [];

      setContent(initContent);
      setInitialContent(initContent);

      setExistingAttachments(initFiles);
      setInitialExistingAttachments(initFiles);

      setNewAttachments([]);
      setError(null);
    }
  }, [isOpen, answer]);

  // Проверка за промени
  const hasChanges = useMemo(() => {
    if (loading) return false;
    if (content !== initialContent) return true;
    if (newAttachments.length > 0) return true;

    // Сравнение на масивите с вече качени файлове
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

    // Изчисляване на изтрити файлове
    const deletedAttachments = initialExistingAttachments.filter(
      (url) => !existingAttachments.includes(url)
    );

    const input: UpdateAnswerInput = {
      content,
      attachments: newAttachments.length > 0 ? newAttachments : undefined,
      deletedAttachments:
        deletedAttachments.length > 0 ? deletedAttachments : undefined,
    };

    try {
      await updateAnswer(input, answer._id, me._id);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Възникна грешка при записа.");
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
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-40 max-h-[85vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
              {t("editAnswer", "Редактирай решението")}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              {t(
                "editAnswerInfo",
                "Редактирай текстовото съдържание и/или прикачените файлове."
              )}
            </Dialog.Description>

            {/* Unified Editor - Заменя SimpleTextEditor и FileAttachmentBtn */}
            <div className="mb-4" id="edit-comment-popup-container">
              <UnifiedEditor
                content={content}
                onContentChange={setContent}
                attachments={newAttachments}
                setAttachments={setNewAttachments}
                existingAttachments={existingAttachments}
                setExistingAttachments={setExistingAttachments}
                mentions={mentions}
                placeholder={
                  t("caseSubmission:caseSubmission.content.placeholder") ||
                  "Напишете съдържание..."
                }
                editorClassName="flex-grow min-h-0 h-full max-h-none"
                minLength={ANSWER_CONTENT.MIN}
                maxLength={ANSWER_CONTENT.MAX}
                hideSideButtons={true} // Крием страничните бутони, защото ползваме тези на модала
                onProcessingChange={setIsProcessing}
                caseId={answer._id} // Важно за AttachmentZone (static URLs)
                type="answer"
              />
            </div>

            {error && (
              <div className="mb-4 flex items-start p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 font-bold">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
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
                  (content.length > 0 && content.length < ANSWER_CONTENT.MIN)
                }
                className={`px-6 py-2 text-sm font-medium text-white rounded transition-all shadow-md ${
                  loading || isProcessing || !hasChanges
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
                type="button"
              >
                {isProcessing
                  ? t("caseSubmission:caseSubmission.actions.saving")
                  : loading
                  ? t("saving", "Записване...")
                  : t("save", "Запази")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Диалог за потвърждение при незапазени промени */}
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

export default EditAnswerButton;
