import { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import FileAttachmentBtn from "./FileAttachmentBtn";
import { IComment } from "../../db/interfaces";
import { useUpdateComment } from "../../graphql/hooks/comment";
import { readFileAsBase64 } from "../../utils/attachment-handling";
import { AttachmentInput } from "../../graphql/hooks/case";
import { XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface EditButtonProps {
  comment: IComment;
  currentAttachments?: string[];
  caseNumber: number;
}

export interface UpdateCommentInput {
  content?: string;
  attachments?: File[];
  deletedAttachments?: string[];
}

const EditButton: React.FC<EditButtonProps> = ({ comment, caseNumber }) => {
  if (!comment) {
    return <div>Loading...</div>;
  }

  const { t } = useTranslation("modals");
  const [content, setContent] = useState<string>(comment.content || "");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  const { updateComment, loading, error } = useUpdateComment(caseNumber);

  useEffect(() => {
    // This runs when the component mounts or the initial comment data changes.
    setContent(comment.content || "");
    setExistingAttachments(comment.attachments || []);
    setNewAttachments([]); // Always clear new files on open
  }, [comment]);

  const handleRemoveExistingAttachment = (urlToRemove: string) => {
    setExistingAttachments((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSave = async () => {
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
      // Here you would typically close the dialog, which can be done by wrapping
      // the save button in <Dialog.Close> or managing an `isOpen` state.
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error updating comment</div>;

  return (
    <Dialog.Root>
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
        <Dialog.Overlay className="fixed z-25 inset-0 bg-black/50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
          <Dialog.Title className="text-lg  font-medium text-gray-900">
            {t("editComment")}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            {t("editCommentInfo")}
          </Dialog.Description>
          <textarea
            className="w-full h-24 border border-gray-300 rounded-lg p-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("writeHere")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="space-y-3">
            {/* List of existing files */}
            {existingAttachments.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Текущи файлове:
                </p>
                <ul className="text-sm text-gray-800 space-y-1 rounded p-2 border border-gray-200 bg-gray-50 max-h-28 overflow-y-auto">
                  {existingAttachments.map((url) => {
                    const filename = url.split("/").pop() || url;
                    return (
                      <li
                        key={url}
                        className="flex justify-between items-center group p-1 rounded hover:bg-gray-200"
                      >
                        <span className="truncate pr-2" title={filename}>
                          {filename}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingAttachment(url)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remove ${filename}`}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Your FileAttachmentBtn now handles ONLY new files */}
            <FileAttachmentBtn
              attachments={newAttachments}
              setAttachments={setNewAttachments}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Dialog.Close asChild>
              <button
                className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                type="button"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
              type="button"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditButton;
