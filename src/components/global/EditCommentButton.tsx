import { useState, useEffect, useMemo } from "react";
import { PencilIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import FileAttachmentBtn from "./FileAttachmentBtn";
import { IComment } from "../../db/interfaces";
import { useUpdateComment } from "../../graphql/hooks/comment";
import { COMMENT_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import SimpleTextEditor from "../forms/partials/TextEditor/SimplifiedTextEditor";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";

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
  if (!comment) {
    return <div>Loading...</div>;
  }

  const { t } = useTranslation("modals");
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string>(comment.content || "");

  // State for initial values
  const [initialContent, setInitialContent] = useState<string>("");
  const [initialExistingAttachments, setInitialExistingAttachments] = useState<
    string[]
  >([]);

  const [charCount, setCharCount] = useState<number>(0);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for confirmation dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    updateComment,
    loading,
    error: apiError,
  } = useUpdateComment(caseNumber);

  const isInvalid =
    charCount > COMMENT_CONTENT.MAX ||
    charCount == 0 ||
    charCount < COMMENT_CONTENT.MIN;

  useEffect(() => {
    if (isOpen) {
      const initialContentValue = comment.content || "";
      const initialAttachmentsValue = comment.attachments || [];

      setContent(initialContentValue);
      setInitialContent(initialContentValue); // Set initial

      setCharCount(initialContentValue.length);

      setExistingAttachments(initialAttachmentsValue);
      setInitialExistingAttachments(initialAttachmentsValue); // Set initial

      setNewAttachments([]);
      setError(null);
    }
  }, [isOpen, comment]);

  const hasChanges = useMemo(() => {
    if (loading) return false;

    if (content !== initialContent) return true;
    if (newAttachments.length > 0) return true;

    const initialSorted = [...initialExistingAttachments].sort();
    const currentSorted = [...existingAttachments].sort();

    if (initialSorted.length !== currentSorted.length) return true;

    return initialSorted.join(",") !== currentSorted.join(",");
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

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    setIsOpen(false);
  };

  const handleSave = async () => {
    setError(null);
    if (isInvalid) {
      setError(
        `Коментарът трябва да е между ${COMMENT_CONTENT.MIN} и ${COMMENT_CONTENT.MAX} символа.`
      );
      return;
    }

    const initialUrls = comment.attachments || [];
    const deletedAttachments = initialUrls.filter(
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
      console.error("Error updating comment:", err);
      setError(err.message || "Грешка при запис на коментар.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (apiError && !isOpen) return <div>Error updating comment</div>;

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleCloseRequest}>
        <Dialog.Trigger asChild>
          <button
            className={`cursor-pointer 
            ${
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
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 max-h-[85vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
              {t("editComment")}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              {t("editCommentInfo")}
            </Dialog.Description>

            <div className="relative mb-4" id="edit-comment-popup-container">
              <SimpleTextEditor
                content={content}
                onUpdate={(html) => setContent(html)}
                placeholder={t("writeHere", "Пишете тук...")}
                minLength={COMMENT_CONTENT.MIN}
                maxLength={COMMENT_CONTENT.MAX}
                wrapperClassName="transition-colors duration-150 h-36"
                height="36"
                mentions={mentions}
                onPasteFiles={(files) =>
                  setNewAttachments((prev) => [...prev, ...files])
                }
                attachmentCount={
                  newAttachments.length + existingAttachments.length
                }
                autoFocus={true} // Auto-focus the editor on mount
              />
            </div>

            {error && (
              <div className="mb-4 flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
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
                type="comments"
                objectId={comment._id}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Dialog.Close asChild>
                <button
                  className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  type="button"
                >
                  {t("cancel")}
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`hover:cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300`}
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
        onConfirm={handleConfirmClose}
        title={t("unsavedChangesTitle", "Незапазени промени")}
        description={t(
          "unsavedChangesDescription",
          "Имате въведени промени, които ще бъдат изгубени. Сигурни ли сте, че искате да затворите редактора?"
        )}
        confirmButtonText={t("closeEditor", "Затвори")}
        isDestructiveAction={true}
      />
    </>
  );
};

export default EditButton;
