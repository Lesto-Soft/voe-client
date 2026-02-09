import React from "react";
import { IAnswer } from "../../db/interfaces";
import { useGetCaseAnswers } from "../../graphql/hooks/answer";
import { CheckCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface CaseAnswerSelectorProps {
  caseId: string;
  onSelect: (content: string) => void;
}

const CaseAnswerSelector: React.FC<CaseAnswerSelectorProps> = ({
  caseId,
  onSelect,
}) => {
  const { answers, loading, error } = useGetCaseAnswers(caseId);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
        Зареждане на отговори...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 p-3 bg-red-50 rounded-lg">
        Грешка при зареждане на отговори
      </div>
    );
  }

  if (answers.length === 0) {
    return null;
  }

  // Sort answers: approved first, then by date (newest first)
  const sortedAnswers = [...answers].sort((a: IAnswer, b: IAnswer) => {
    // Approved answers come first
    if (a.approved && !b.approved) return -1;
    if (!a.approved && b.approved) return 1;
    // Then sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + "...";
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Зареди от отговор на сигнал
        </span>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar-xs">
        {sortedAnswers.map((answer: IAnswer) => {
          const isApproved = !!answer.approved;
          return (
            <button
              key={answer._id}
              type="button"
              onClick={() => onSelect(answer.content || "")}
              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                isApproved
                  ? "border-green-300 bg-green-50/50 hover:bg-green-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {answer.creator?.name || "Неизвестен"}
                  </span>
                  {isApproved && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                      <CheckCircleIcon className="h-3 w-3" />
                      Одобрен
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(answer.date)}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {truncateContent(answer.content || "")}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CaseAnswerSelector;
