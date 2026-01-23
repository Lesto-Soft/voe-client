// src/components/case-components/answer/AddAnswer.tsx
import { useState } from "react";
import { useCreateAnswer } from "../../../graphql/hooks/answer";
import { ANSWER_CONTENT } from "../../../utils/GLOBAL_PARAMETERS";
import { getTextLength } from "../../../utils/contentRenderer";
import { toast } from "react-toastify";
import { TFunction } from "i18next";
import UnifiedEditor from "../../forms/partials/UnifiedRichTextEditor";

interface AddAnswerProps {
  caseId?: string;
  t: TFunction;
  me: any;
  caseNumber: number;
  mentions?: { name: string; username: string; _id: string }[];
  onAnswerSubmitted?: () => void;
  content: string;
  setContent: (content: string) => void;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
}
const AddAnswer: React.FC<AddAnswerProps> = ({
  caseId,
  t,
  me,
  caseNumber,
  mentions,
  onAnswerSubmitted,
  content,
  setContent,
  attachments,
  setAttachments,
}) => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { createAnswer, loading } = useCreateAnswer(caseNumber);

  const submitAnswer = async (event: React.FormEvent) => {
    event.preventDefault();
    const textLength = getTextLength(content);

    if (textLength < ANSWER_CONTENT.MIN) {
      setSubmissionError(
        `Решението трябва да е поне ${ANSWER_CONTENT.MIN} символа.`,
      );
      return;
    }

    try {
      await createAnswer({
        case: caseId,
        attachments, // Вече са компресирани от UnifiedRichTextEditor
        content,
        creator: me._id,
      });

      setContent("");
      setAttachments([]);
      if (onAnswerSubmitted) onAnswerSubmitted();
      toast.success(t("answerSubmitted"));
    } catch (error: any) {
      setSubmissionError(error?.message || "Грешка при изпращане.");
    }
  };

  return (
    <div className="flex flex-col gap-2 mx-5">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-grow">
          <UnifiedEditor
            editorClassName="h-[180px] min-h-[180px] max-h-[180px]"
            content={content}
            onContentChange={setContent}
            attachments={attachments}
            setAttachments={setAttachments}
            onSend={() =>
              submitAnswer({ preventDefault: () => {} } as React.FormEvent)
            }
            mentions={mentions}
            placeholder="Напишете решение..."
            isSending={loading}
            minLength={ANSWER_CONTENT.MIN}
            maxLength={ANSWER_CONTENT.MAX}
            type="answer"
          />
        </div>
      </div>
      {submissionError && (
        <div className="text-red-600 text-sm mt-1">{submissionError}</div>
      )}
    </div>
  );
};

export default AddAnswer;
