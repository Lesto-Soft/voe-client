import { useState, useMemo, useEffect } from "react";
import { useCreateComment } from "../../graphql/hooks/comment";
import FileAttachmentAnswer from "../global/FileAttachmentAnswer";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { COMMENT_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import SimpleTextEditor from "../forms/partials/TextEditor/SimplifiedTextEditor";
import { getTextLength } from "../../utils/contentRenderer";

// Interface for the props of the AddComment component
interface AddCommentProps {
  caseId?: string;
  t: (key: string) => string; // Translation function
  me: any; // User object, assuming it has an _id property
  caseNumber: number;
  answerId?: string;
  inputId?: string; // Optional input ID for file attachment
  mentions?: { name: string; username: string; _id: string }[];
}

// The AddComment component
const AddComment: React.FC<AddCommentProps> = ({
  caseId,
  t = (key: string) => key, // Default t function for standalone or testing
  me,
  caseNumber,
  answerId,
  inputId,
  mentions = [],
}) => {
  // State for attachments, file errors, content input, and submission errors
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    createComment,
    loading,
    error: apiError,
  } = useCreateComment(caseNumber);

  const charCount = useMemo(() => content.length, [content]);

  // ADDED: validation for both min and max length
  const isContentTooLong = useMemo(
    () => charCount > COMMENT_CONTENT.MAX,
    [charCount]
  );
  const isContentTooShort = useMemo(
    () => charCount > 0 && charCount < COMMENT_CONTENT.MIN,
    [charCount]
  );
  const isInvalid = isContentTooLong || isContentTooShort;

  // Effect to handle API errors from the useCreateComment hook
  useEffect(() => {
    if (apiError) {
      setSubmissionError(
        apiError.message ||
          t("caseSubmission.errors.submission.apiError") ||
          "An API error occurred."
      );
    }
  }, [apiError, t]);

  // Memoize object URLs for each file
  const fileObjectUrls = useMemo(() => {
    const map = new Map<string, string>();
    attachments.forEach((file) => {
      map.set(file.name + "-" + file.lastModified, URL.createObjectURL(file));
    });
    return map;
  }, [attachments]);

  // Cleanup object URLs on unmount or when attachments change
  useEffect(() => {
    return () => {
      fileObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileObjectUrls]);

  // Function to handle form submission
  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior
    setSubmissionError(null); // Clear previous errors

    // UPDATED: Validate content length
    if (isContentTooLong) {
      setSubmissionError(
        `Коментарът не може да надвишава ${COMMENT_CONTENT.MAX} символа.`
      );
      return;
    }
    if (content.length > 0 && content.length < COMMENT_CONTENT.MIN) {
      setSubmissionError(
        `Коментарът трябва да е поне ${COMMENT_CONTENT.MIN} символа.`
      );
      return;
    }
    // Validate if content or attachments are present
    if (!content.trim() && attachments.length === 0) {
      setSubmissionError(
        t("caseSubmission.errors.submission.emptyComment") || // Specific key for comment
          "Cannot submit an empty comment."
      );
      return;
    }

    try {
      const commentPayload: any = {
        // Define type more strictly if possible
        attachments,
        content,
        creator: me._id,
      };

      if (caseId) {
        commentPayload.case = caseId;
      } else if (answerId) {
        commentPayload.answer = answerId;
      } else {
        setSubmissionError(
          t("caseSubmission.errors.submission.missingIdentifier") ||
            "Cannot submit comment without case or answer ID."
        );
        return;
      }

      await createComment(commentPayload);

      // Reset form fields on successful submission
      setContent("");
      setAttachments([]);
      // No 'data' returned from hook, so success message is harder to implement here
      // Could set a temporary success message state if needed.
    } catch (error: any) {
      // Catch errors from the createComment promise itself
      console.error("Error creating comment:", error);
      setSubmissionError(
        error?.message ||
          t("caseSubmission.errors.submission.genericCommentError") ||
          "Failed to submit comment."
      );
    }
  };

  // Function to remove an attachment
  const handleRemoveAttachment = (fileNameToRemove: string) => {
    setFileError(null); // Clear any existing file error
    setAttachments((prevAttachments) =>
      prevAttachments.filter((file) => file.name !== fileNameToRemove)
    );
  };

  // Function to handle changes in the textarea content
  const handleContentChange = (html: string) => {
    setContent(html);
    // Clear submission error related to length if user corrects it
    if (submissionError && getTextLength(html) <= COMMENT_CONTENT.MAX) {
      setSubmissionError(null);
    }
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled =
    isInvalid || // UPDATED
    loading ||
    (!content.trim() && attachments.length === 0);

  return (
    <div>
      {/* Main container for the input area */}
      <div className="flex flex-col gap-2 mx-5">
        {/* Flex container for textarea, attachment button, and submit button */}
        {/* UPDATED: Container now stretches children to be equal height */}
        <div className="flex items-stretch gap-2">
          {/* Container for the textarea and character counter */}
          <div className="flex-grow relative">
            {/* <textarea
              className={`border border-gray-300 bg-white rounded-lg p-3 w-full h-full resize-none focus:outline-none focus:ring-1 ${
                isInvalid
                  ? "ring-red-500 border-red-500" // Style for any invalid state
                  : "border-gray-300 focus:ring-blue-500"
              } transition-colors duration-150`}
              placeholder={t("writeComment") || "Write your comment..."}
              value={content}
              onChange={handleContentChange}
              minLength={COMMENT_CONTENT.MIN}
              maxLength={COMMENT_CONTENT.MAX}
              aria-invalid={isInvalid}
              aria-describedby="comment-char-counter submission-error-display"
            /> */}
            <SimpleTextEditor
              content={content}
              onUpdate={handleContentChange}
              placeholder={"Напишете решение..."}
              maxLength={COMMENT_CONTENT.MAX}
              minLength={COMMENT_CONTENT.MIN}
              wrapperClassName="transition-colors duration-150 h-36"
              height="36"
              mentions={mentions}
            />
            <div
              id="comment-char-counter"
              className={`absolute bottom-3 right-4 text-xs ${
                isInvalid ? "text-red-600 font-semibold" : "text-gray-500"
              } bg-white px-1 rounded shadow-sm`}
            >
              {charCount}/{COMMENT_CONTENT.MAX}
            </div>
          </div>
          {/* File attachment component */}
          {/* NOTE: For FileAttachmentAnswer to match height, its internal button should also be h-24.
              This might require changes within FileAttachmentAnswer or passing height props/classes. */}
          <FileAttachmentAnswer
            inputId={inputId ?? "default"}
            attachments={attachments}
            setAttachments={setAttachments}
            setFileError={setFileError}
            height={36}
          />
          {/* Submit button */}
          <button
            onClick={submitComment}
            disabled={isSubmitDisabled}
            aria-label={t("submitComment") || "Submit Comment"}
            className={`flex items-center justify-center h-auto w-24 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-btnRedHover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150`}
            title="Изпрати"
            // h-24 to match textarea, w-24 for a squarer look with the icon
          >
            {loading ? (
              // Loading spinner
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              // Paper airplane icon (h-6 w-6 is a bit smaller for h-24 button)
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Display file errors */}
      {fileError && (
        <div className="mx-5 mt-2 px-2">
          {" "}
          {/* Consistent margin with mx-5 */}
          <p className="text-sm text-red-500 transition-opacity duration-200 opacity-100">
            {fileError || "\u00A0"}
          </p>
        </div>
      )}

      {/* Display list of attached files */}
      {attachments.length > 0 && (
        <div className="mx-5 mt-2 text-sm text-gray-600 space-y-1 overflow-y-auto rounded p-2 bg-gray-100 border border-gray-200 max-h-28">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => {
              const fileKey = file.name + "-" + file.lastModified;
              const fileUrl = fileObjectUrls.get(fileKey) || "";

              return (
                <div
                  key={file.name + "-" + file.lastModified + "-" + file.size}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 rounded-full hover:bg-gray-300"
                  title={file.name}
                >
                  <ImagePreviewModal
                    imageUrl={fileUrl}
                    fileName={file.name}
                    triggerElement={
                      <button
                        type="button"
                        className="truncate max-w-[150px] sm:max-w-xs cursor-pointer"
                        title={file.name}
                      >
                        {file.name}
                      </button>
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(file.name)}
                    className="p-0.5 rounded-full hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                    aria-label={`${t("removeFile") || "Remove file"} ${
                      file.name
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4 text-btnRed hover:text-red-700" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submission Error Display - Always rendered, uses opacity for transition */}
      <div
        id="submission-error-display" // Ensure this ID is unique if multiple instances on one page or use aria-describedby on textarea
        className={`mx-5 mt-3 col-span-1 md:col-span-2 p-3 rounded-md border
          transition-opacity duration-300
          ${
            submissionError
              ? "bg-red-100 border-red-400 text-red-700 opacity-100" // Visible styles
              : "border-transparent text-transparent opacity-0 h-0 p-0 overflow-hidden" // Hidden and collapse space
          }`}
        aria-live="polite"
        role="alert"
      >
        {/* Display error or non-breaking space to maintain height when not fully collapsed */}
        {submissionError}
      </div>
    </div>
  );
};

export default AddComment;
