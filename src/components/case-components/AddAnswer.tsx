// src/components/case-components/AddAnswer.tsx
import { useState, useMemo, useEffect } from "react";
import FileAttachmentAnswer from "../global/FileAttachmentAnswer";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useCreateAnswer } from "../../graphql/hooks/answer";
import { ANSWER_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import SimpleTextEditor from "../forms/partials/TextEditor/SimplifiedTextEditor";
import { getTextLength } from "../../utils/contentRenderer";
import ImagePreviewModal, { GalleryItem } from "../modals/ImagePreviewModal";
import { toast } from "react-toastify";

// Interface for the props of the AddAnswer component
interface AddAnswerProps {
  caseId?: string;
  t: (key: string) => string; // Translation function
  me: any; // User object, assuming it has an _id property
  caseNumber: number;
  mentions?: { name: string; username: string; _id: string }[];
  onAnswerSubmitted?: () => void;
}

// The AddAnswer component
const AddAnswer: React.FC<AddAnswerProps> = ({
  caseId,
  t = (key: string) => key, // Default t function for standalone or testing
  me,
  caseNumber,
  mentions,
  onAnswerSubmitted,
}) => {
  // State for attachments, file errors, content input, and submission errors
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Using the actual useCreateAnswer hook

  const {
    createAnswer,
    loading,
    error: apiError,
  } = useCreateAnswer(caseNumber); // Effect to handle API errors from the useCreateAnswer hook

  useEffect(() => {
    if (apiError) {
      setSubmissionError(
        apiError.message ||
          t("caseSubmission.errors.submission.apiError") ||
          "An API error occurred."
      );
    }
  }, [apiError, t]); // Function to handle form submission

  const submitAnswer = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionError(null); // Clear previous errors // Validate content length using plain text length

    const textLength = getTextLength(content);
    if (textLength > ANSWER_CONTENT.MAX) {
      setSubmissionError(
        // t("caseSubmission.errors.submission.contentTooLong") ||
        "Решението е прекалено дълъг."
      );
      return;
    }

    if (textLength < ANSWER_CONTENT.MIN) {
      setSubmissionError(
        // t("caseSubmission.errors.submission.contentTooShort") ||
        `Решението трябва да е поне ${ANSWER_CONTENT.MIN} символа.`
      );
      return;
    } // Validate if content or attachments are present

    const hasContent = content.trim() && textLength > 0;
    if (!hasContent && attachments.length === 0) {
      setSubmissionError(
        t("caseSubmission.errors.submission.emptyContent") ||
          "Cannot submit empty answer."
      );
      return;
    }

    try {
      // Call the createAnswer mutation
      // Capture the response from the mutation
      const newAnswer = await createAnswer({
        case: caseId,
        attachments,
        content,
        creator: me._id,
      });

      // Reset form fields on successful submission
      setContent("");
      setAttachments([]);

      if (onAnswerSubmitted) {
        onAnswerSubmitted();
      }

      // Set the URL hash to focus the new answer
      if (newAnswer && newAnswer._id) {
        // A brief timeout allows the UI to re-render from the refetch
        // before the hash change triggers the scroll effect.
        setTimeout(() => {
          window.location.hash = `answers-${newAnswer._id}`;
        }, 100);
      }

      // Optionally, you can clear submissionError here or rely on API success to imply no error
      // setSubmissionError(null); // Or show a success message
      toast.success(t("answerSubmitted"), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          marginTop: "90px",
        },
        className: "answer-toast",
      });
    } catch (error: any) {
      // Catch errors from the createAnswer promise itself (e.g., network issues if not handled by hook)
      console.error("Error creating answer:", error);
      setSubmissionError(
        error?.message ||
          t("caseSubmission.errors.submission.genericError") ||
          "Failed to submit answer."
      );
    }
  }; // Function to remove an attachment

  const handleRemoveAttachment = (fileNameToRemove: string) => {
    setFileError(null); // Clear any existing file error
    setAttachments((prevAttachments) =>
      prevAttachments.filter((file) => file.name !== fileNameToRemove)
    );
  }; // Updated to handle TextEditor content changes

  const handleContentChange = (html: string) => {
    setContent(html); // Clear submission error related to length if user corrects it
    if (submissionError && getTextLength(html) <= ANSWER_CONTENT.MAX) {
      setSubmissionError(null);
    }
  }; // Updated submit button disabled condition

  const isSubmitDisabled =
    loading || getTextLength(content) < ANSWER_CONTENT.MIN; // Memoize object URLs for each file

  const fileObjectUrls = useMemo(() => {
    const map = new Map<string, string>();
    attachments.forEach((file) => {
      map.set(file.name + "-" + file.lastModified, URL.createObjectURL(file));
    });
    return map;
  }, [attachments]); // Cleanup object URLs on unmount or when attachments change

  // 1. ADD THIS useMemo TO CREATE THE GALLERY ITEMS
  const galleryItems: GalleryItem[] = useMemo(() => {
    return attachments.map((file) => {
      const fileKey = file.name + "-" + file.lastModified;
      return {
        url: fileObjectUrls.get(fileKey) || "",
        name: file.name,
      };
    });
  }, [attachments, fileObjectUrls]);

  useEffect(() => {
    return () => {
      fileObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileObjectUrls]);

  return (
    <div>
      {/* Main container for the input area */}{" "}
      <div className="flex flex-col gap-2 mx-5">
        {" "}
        <div className="flex items-stretch gap-2">
          {/* Container for the TextEditor and character counter */}{" "}
          <div className="flex-grow relative min-w-0 max-w-full">
            {" "}
            <SimpleTextEditor
              content={content}
              onUpdate={handleContentChange}
              placeholder={"Напишете решение..."}
              maxLength={ANSWER_CONTENT.MAX}
              minLength={ANSWER_CONTENT.MIN}
              wrapperClassName="transition-colors duration-150 h-36"
              height="36"
              mentions={mentions} // --- PASTE LOGIC: PASSING PROPS TO EDITOR ---
              attachmentCount={attachments.length}
              onPasteFiles={(files) => {
                setAttachments((prev) => [...prev, ...files]);
              }}
            />{" "}
          </div>
          {/* File attachment component */}{" "}
          <FileAttachmentAnswer
            inputId="file-upload-answer"
            attachments={attachments}
            setAttachments={setAttachments}
            setFileError={setFileError}
            height={36}
          />
          {/* Submit button */}{" "}
          <button
            onClick={submitAnswer}
            disabled={isSubmitDisabled}
            aria-label={t("submitAnswer") || "Submit Answer"}
            className={`cursor-pointer flex items-center justify-center h-36 w-24 min-w-24 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-btnRedHover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150`}
            title="Изпрати"
          >
            {" "}
            {loading ? (
              // Loading spinner
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                {" "}
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>{" "}
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>{" "}
              </svg>
            ) : (
              // Paper airplane icon
              <PaperAirplaneIcon className="h-8 w-8 text-blue-600" /> // Matched spinner color
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>
      {/* Display file errors */}{" "}
      {fileError && (
        <div className="mx-5 mt-2 px-2">
          {/* Consistent margin with mx-5 */}{" "}
          <p className="text-sm text-red-500 transition-opacity duration-200 opacity-100">
            {fileError || "\u00A0"}{" "}
            {/* Non-breaking space for layout consistency */}{" "}
          </p>{" "}
        </div>
      )}
      {/* Display list of attached files */}{" "}
      {attachments.length > 0 && (
        <div className="mx-5 mt-2 text-sm text-gray-600 space-y-1 overflow-y-auto rounded p-2 bg-gray-100 border border-gray-200 max-h-32">
          {" "}
          <div className="flex flex-wrap gap-2">
            {" "}
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
                    galleryItems={galleryItems} // Pass the full gallery
                    imageUrl={fileUrl} // The URL for this specific trigger
                    fileName={file.name} // The name for this specific trigger
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
                    {" "}
                    <XMarkIcon className="h-4 w-4 text-btnRed hover:text-red-700" />{" "}
                  </button>{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </div>
      )}
      {/* Submission Error Display */}{" "}
      {/* This uses conditional rendering for the error message for clarity and accessibility */}{" "}
      {
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
          {" "}
          {/* Display error or non-breaking space to maintain height when not fully collapsed */}
          {submissionError}{" "}
        </div>
      }{" "}
    </div>
  );
};

export default AddAnswer;
