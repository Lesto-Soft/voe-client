import { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import FileAttachmentBtn from "./FileAttachmentBtn";
import SimpleTextEditor from "../forms/partials/SimplifiedTextEditor";
import { IAnswer } from "../../db/interfaces";
import { readFileAsBase64 } from "../../utils/attachment-handling";
import { AttachmentInput } from "../../graphql/hooks/case";
import { useUpdateAnswer } from "../../graphql/hooks/answer";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface EditButtonProps {
  answer: IAnswer;
  currentAttachments?: string[];
  caseNumber: number;
  me: any;
}

export interface UpdateAnswerInput {
  content?: string;
  attachments?: File[];
  deletedAttachments?: string[];
}

const EditAnswerButton: React.FC<EditButtonProps> = ({
  answer,
  currentAttachments,
  caseNumber,
  me,
}) => {
  if (!answer) {
    return <div>Loading...</div>;
  }

  const { t } = useTranslation("modals");
  const [content, setContent] = useState<string>(answer.content || "");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const { updateAnswer, loading, error } = useUpdateAnswer(caseNumber);

  useEffect(() => {
    // This runs when the component mounts or the initial comment data changes.
    setContent(answer.content || "");
    setExistingAttachments(answer.attachments || []);
    setNewAttachments([]); // Always clear new files on open
  }, [answer]);

  const handleRemoveExistingAttachment = (urlToRemove: string) => {
    setExistingAttachments((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSave = async () => {
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
    } catch (error) {
      console.error("Error updating answer:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error updating answer</div>;

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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 max-h-[85vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
            {t("editAnswer", "Edit Answer")}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            {t("editAnswerInfo", "Update your answer content and attachments.")}
          </Dialog.Description>

          {/* SimpleTextEditor replacing the textarea */}
          <div className="mb-4">
            <SimpleTextEditor
              content={content}
              onUpdate={(html) => setContent(html)}
              placeholder={t("writeHere", "Пишете тук...")}
              height="123px"
              wrapperClassName="w-full border border-gray-300 rounded-lg shadow-sm overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            />
          </div>
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
