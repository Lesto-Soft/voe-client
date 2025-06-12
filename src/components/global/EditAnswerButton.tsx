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

interface EditButtonProps {
  answer: IAnswer;
  currentAttachments?: string[];
  caseNumber: number;
  me: any;
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const { updateAnswer, loading, error } = useUpdateAnswer(caseNumber);

  useEffect(() => {
    if (currentAttachments && currentAttachments.length > 0) {
      Promise.all(
        currentAttachments.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          // Extract filename from URL or use a fallback
          const filename = url.split("/").pop() || "attachment";
          return new File([blob], filename, { type: blob.type });
        })
      ).then(setAttachments);
    } else {
      setAttachments([]);
    }
  }, [currentAttachments]);

  const handleSave = async () => {
    // --- Prepare Attachments ---
    let attachmentInputs: AttachmentInput[] = [];
    try {
      attachmentInputs = await Promise.all(
        attachments.map(async (file): Promise<AttachmentInput> => {
          const base64Data = await readFileAsBase64(file);
          return { filename: file.name, file: base64Data };
        })
      );
    } catch (fileReadError) {
      console.error("Client: Error reading files to base64:", fileReadError);
      return;
    }

    try {
      await updateAnswer(
        {
          content,
          attachments: attachmentInputs,
        },
        answer._id,
        me._id
      );
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
              placeholder={t("writeHere", "Write your answer here...")}
              minHeight="120px"
              maxHeight="300px"
              wrapperClassName="w-full border border-gray-300 rounded-lg shadow-sm overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            />
          </div>

          <FileAttachmentBtn
            attachments={attachments}
            setAttachments={setAttachments}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                type="button"
              >
                {t("cancel", "Cancel")}
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
