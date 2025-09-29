import { useState, useEffect } from "react";
import { PencilIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import FileAttachmentBtn from "./FileAttachmentBtn";
import SimpleTextEditor from "../forms/partials/TextEditor/SimplifiedTextEditor";
import { IAnswer } from "../../db/interfaces";
import { useUpdateAnswer } from "../../graphql/hooks/answer";
import { ANSWER_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import { getTextLength } from "../../utils/contentRenderer";

interface EditButtonProps {
  answer: IAnswer;
  currentAttachments?: string[];
  caseNumber: number;
  me: any;
  mentions: { name: string; username: string; _id: string }[];
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
}) => {
  if (!answer) {
    return <div>Loading...</div>;
  }

  const { t } = useTranslation("modals");
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string>(answer.content || "");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null); // State for validation errors
  const {
    updateAnswer,
    loading,
    error: apiError,
  } = useUpdateAnswer(caseNumber);

  useEffect(() => {
    if (isOpen) {
      setContent(answer.content || "");
      setExistingAttachments(answer.attachments || []);
      setNewAttachments([]);
      setError(null); // Clear errors when modal opens
    }
  }, [isOpen, answer]);

  const handleSave = async () => {
    setError(null); // Clear previous errors

    // --- Validation Block ---
    const textLength = getTextLength(content);
    if (textLength < ANSWER_CONTENT.MIN) {
      setError(`Решението трябва да е поне ${ANSWER_CONTENT.MIN} символа.`);
      return; // Stop the submission
    }
    if (textLength > ANSWER_CONTENT.MAX) {
      setError(`Решението не може да надвишава ${ANSWER_CONTENT.MAX} символа.`);
      return; // Stop the submission
    }
    // --- End Validation ---

    const initialUrls = answer.attachments || [];
    const deletedAttachments = initialUrls.filter(
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
      setIsOpen(false); // Close dialog on success
    } catch (err: any) {
      console.error("Error updating answer:", err);
      // Set the error state with the message from the backend
      setError(err.message || "Възникна грешка при записа.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (apiError && !isOpen) return <div>Error updating answer</div>;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="hover:cursor-pointer ml-2 flex items-center px-2 py-1 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          type="button"
          title="Редактирай"
        >
          <PencilIcon className="h-4 w-4 " />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-40 max-h-[85vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
            {t("editAnswer", "Редактирай решението")}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            {t(
              "editAnswerInfo",
              "Редайктирай текстовото съдържанието и/или прикачените файлове."
            )}
          </Dialog.Description>

          {/* SimpleTextEditor replacing the textarea */}
          <div className="mb-4" id="edit-comment-popup-container">
            <SimpleTextEditor
              content={content}
              onUpdate={(html) => setContent(html)}
              placeholder={t("writeHere", "Пишете тук...")}
              minLength={ANSWER_CONTENT.MIN}
              maxLength={ANSWER_CONTENT.MAX}
              wrapperClassName="transition-colors duration-150 h-36"
              height="36"
              mentions={mentions}
              onPasteFiles={(files) =>
                setNewAttachments((prev) => [...prev, ...files])
              }
              attachmentCount={
                newAttachments.length + existingAttachments.length
              }
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {/* Your FileAttachmentBtn now handles ONLY new files */}
            <FileAttachmentBtn
              attachments={newAttachments}
              setAttachments={setNewAttachments}
              existingAttachments={existingAttachments}
              setExistingAttachments={setExistingAttachments}
              type="answers"
              objectId={answer._id}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <button
                className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                type="button"
              >
                {t("cancel", "Cancel")}
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`hover:cursor-pointer px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              type="button"
            >
              {loading ? t("saving", "Saving...") : t("save", "Save")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditAnswerButton;
