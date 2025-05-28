import { useState } from "react";
import { useCreateComment } from "../../graphql/hooks/comment";
import FileAttachmentAnswer from "../global/FileAttachmentAnswer";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { AttachmentInput } from "../../graphql/mutation/user";
import { readFileAsBase64 } from "../../utils/attachment-handling";

interface AddCommentProps {
  caseId: string;
  refetch: () => void;
  t: (key: string) => string;
  me: any;
}
const AddComment: React.FC<AddCommentProps> = ({ caseId, refetch, t, me }) => {
  const [attachments, setAttachments] = useState<File[]>([]); // Holds selected File objects
  const [fileError, setFileError] = useState<string | null>(null); // State for file error message
  const [content, setContent] = useState<string>(""); // Holds the content of the comment
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { createComment, loading, error } = useCreateComment();

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior

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
      setSubmissionError(
        t("caseSubmission.errors.submission.fileProcessingError")
      );
      return;
    }

    if (attachments.length > 0) {
      const formData = new FormData();
      attachments.forEach((file) => {
        formData.append("attachments", file); // Append each file to the FormData object
      });
      try {
        await createComment({
          case: caseId,
          attachments: attachmentInputs,
          content,
          creator: me.me._id,
        });
        refetch(); // Refetch data after comment creation
        setAttachments([]); // Clear attachments after submission
      } catch (error) {
        console.error("Error creating comment:", error);
      }
    } else {
      setFileError(t("noFilesSelected")); // Set error message if no files are selected
    }
  };

  const handleRemoveAttachment = (fileNameToRemove: string) => {
    setFileError(null);
    setAttachments((prevAttachments) =>
      // Create a new array excluding the file with the matching name
      prevAttachments.filter((file) => file.name !== fileNameToRemove)
    );
    // Note: Programmatically clearing the <input type="file"> value is
    // unreliable across browsers and often not necessary. The user can
    // always click "Choose Files" again to re-select.
  };

  return (
    <div>
      <div className="flex flex-col gap-2 mx-5">
        <div className="flex  gap-2 mb-1 mx-5">
          <textarea
            className="border border-gray-300 rounded-lg p-2 w-full h-24 resize-none focus:outline-none focus:ring-2 focus:ring-btnRedHover"
            placeholder={t("writeComment")}
            onChange={(e) => setContent(e.target.value)} // Update content state on change
          ></textarea>
          <FileAttachmentAnswer
            attachments={attachments}
            setAttachments={setAttachments}
            setFileError={setFileError}
          />
          <button
            onClick={submitComment}
            className="hover:cursor-pointer h-24 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
          >
            <PaperAirplaneIcon className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* Display File Errors */}
      {fileError && (
        <div className="mx-10 px-2">
          <p className="text-sm text-red-500 transition-opacity duration-200 opacity-100">
            {fileError || "\u00A0"}
          </p>
        </div>
      )}
      <div className="mx-10 text-sm text-gray-600 space-y-1 overflow-y-auto rounded p-2">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <button
                key={file.name + "-" + file.lastModified}
                type="button"
                onClick={() => handleRemoveAttachment(file.name)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                title={file.name}
              >
                <span className="truncate">{file.name}</span>
                <XMarkIcon
                  className="hover:cursor-pointer hover:text-btnRedHover h-5 w-5 text-btnRed font-bold"
                  style={{ verticalAlign: "middle" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submission Error Display - Always rendered, uses opacity */}
      <div
        className={`
          col-span-1 md:col-span-2 p-3 rounded-md border
          transition-opacity duration-300
          ${
            submissionError
              ? "bg-red-100 border-red-400 text-red-700 opacity-100" // Visible styles
              : "border-transparent text-transparent opacity-0" // Hidden: Make border & text transparent, opacity 0
          }
        `}
        aria-live="polite"
      >
        {/* Display error or non-breaking space to maintain height */}
        {submissionError || "\u00A0"}
      </div>
    </div>
  );
};

export default AddComment;
