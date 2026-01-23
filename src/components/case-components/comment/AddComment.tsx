// src/components/case-components/comment/AddComment.tsx
import { useState, useEffect } from "react";
import { useCreateComment } from "../../../graphql/hooks/comment";
import { COMMENT_CONTENT } from "../../../utils/GLOBAL_PARAMETERS";
import UnifiedEditor from "../../forms/partials/UnifiedRichTextEditor";
import { getTextLength } from "../../../utils/contentRenderer";

interface AddCommentProps {
  caseId?: string;
  t: (key: string) => string;
  me: any;
  caseNumber: number;
  answerId?: string;
  mentions?: { name: string; username: string; _id: string }[];
  onCommentSubmitted?: () => void;
  content: string;
  setContent: (content: string) => void;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
}

const AddComment: React.FC<AddCommentProps> = ({
  caseId,
  t,
  me,
  caseNumber,
  answerId,
  mentions = [],
  onCommentSubmitted,
  content,
  setContent,
  attachments,
  setAttachments,
}) => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    createComment,
    loading,
    error: apiError,
  } = useCreateComment(caseNumber);

  // Ефект за грешки от API-то
  useEffect(() => {
    if (apiError) {
      setSubmissionError(
        apiError.message ||
          t("caseSubmission.errors.submission.apiError") ||
          "Възникна грешка.",
      );
    }
  }, [apiError, t]);

  const submitComment = async () => {
    setSubmissionError(null);

    // Допълнителна валидация (въпреки че UnifiedEditor блокира бутона)
    const textLength = getTextLength(content);
    if (textLength < COMMENT_CONTENT.MIN) return;

    try {
      const commentPayload: any = {
        attachments,
        content,
        creator: me._id,
      };

      if (caseId) {
        commentPayload.case = caseId;
      } else if (answerId) {
        commentPayload.answer = answerId;
      } else {
        setSubmissionError("Липсва идентификатор на случай или решение.");
        return;
      }

      const newComment = await createComment(commentPayload);

      // Изчистване на стейта при успех
      setContent("");
      setAttachments([]);

      if (onCommentSubmitted) {
        onCommentSubmitted();
      }

      // Навигация към новия коментар
      if (newComment && newComment._id) {
        const commentHighlightHash = answerId
          ? `answers-${newComment._id}?comment=true`
          : `comments-${newComment._id}`;
        setTimeout(() => {
          window.location.hash = commentHighlightHash;
        }, 100);
      }
    } catch (error: any) {
      console.error("Error creating comment:", error);
      setSubmissionError(error?.message || "Неуспешно изпращане на коментара.");
    }
  };

  return (
    <div className="w-full">
      <div className="mx-5">
        <UnifiedEditor
          content={content}
          onContentChange={(html) => {
            setContent(html);
            if (submissionError) setSubmissionError(null);
          }}
          attachments={attachments}
          setAttachments={setAttachments}
          onSend={submitComment}
          mentions={mentions}
          placeholder={
            answerId
              ? "Напишете коментар към решението..."
              : "Напишете коментар..."
          }
          editorClassName="h-[180px] min-h-[180px] max-h-[180px]"
          minLength={COMMENT_CONTENT.MIN}
          maxLength={COMMENT_CONTENT.MAX}
          isSending={loading}
          type="comment"
        />

        {/* Специфични грешки при изпращане (API грешки) */}
        {submissionError && (
          <div
            className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-xs font-bold rounded-md animate-in fade-in duration-300"
            role="alert"
          >
            {submissionError}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddComment;
