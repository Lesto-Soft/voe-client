import React, { useState } from "react";
import { ICase, IAnswer } from "../../db/interfaces";
import { renderContentSafely } from "../../utils/contentRenderer";
import CreateTaskModal from "../modals/CreateTaskModal";

// A new component to represent a single answer in the list
const AnswerItem: React.FC<{ answer: IAnswer }> = ({ answer }) => {
  const isApproved = !!answer.approved;
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- State to control the modal

  return (
    <>
      <div
        className={`bg-white shadow-md rounded-lg p-4 mb-4 ${
          isApproved ? "border-2 border-green-500" : "border border-gray-200"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {isApproved && (
              <div className="text-xs font-bold text-green-600 mb-2">
                ОДОБРЕН ОТГОВОР
              </div>
            )}
            <div className="text-gray-800 whitespace-pre-line break-words">
              {renderContentSafely(answer.content || "")}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            {/* This button now opens the modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150 cursor-pointer"
            >
              Създай задача
            </button>
          </div>
        </div>
      </div>

      {/* The Modal itself, which is rendered when isModalOpen is true */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originatingCase={answer.case}
        originatingAnswer={answer}
      />
    </>
  );
};

interface CaseTasksTabProps {
  caseData: ICase;
}

const CaseTasksTab: React.FC<CaseTasksTabProps> = ({ caseData }) => {
  // Sort answers to show the approved one first
  const sortedAnswers = [...(caseData.answers || [])].sort((a, b) => {
    if (a.approved && !b.approved) return -1;
    if (!a.approved && b.approved) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="px-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Създайте задача от отговор
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Изберете отговор по-долу, който да използвате като основа за нова
          задача. Одобреният отговор е подчертан.
        </p>
      </div>

      <div>
        {sortedAnswers.length > 0 ? (
          sortedAnswers.map((answer) => (
            <AnswerItem key={answer._id} answer={answer} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Няма налични отговори, от които да създадете задача.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseTasksTab;
