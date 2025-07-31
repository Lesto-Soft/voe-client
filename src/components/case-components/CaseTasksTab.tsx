// src/components/case-components/CaseTasksTab.tsx

import React, { useState } from "react";
import { Link } from "react-router";
import { ICase, IAnswer } from "../../db/interfaces";
import { renderContentSafely } from "../../utils/contentRenderer";
import CreateTaskModal from "../modals/CreateTaskModal";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

// --- ОБНОВЕН КОМПОНЕНТ: Елемент от списъка със съществуващи задачи ---
const TaskListItem: React.FC<{ task: any }> = ({ task }) => {
  const getPriorityBorderStyle = (priority: string) => {
    switch (priority) {
      case "ВИСОК":
        return "border-t-red-500";
      case "СРЕДЕН":
        return "border-t-yellow-500";
      case "НИСЪК":
        return "border-t-green-500";
      default:
        return "border-t-gray-400";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Процес":
        return "bg-yellow-100 text-yellow-800";
      case "За изпълнение":
        return "bg-blue-100 text-blue-800";
      case "Завършена":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Link to={`/task/${task.id}`} className="block">
      <div
        className={`bg-white p-3 rounded-lg h-20 shadow-md border-t-8 ${getPriorityBorderStyle(
          task.priority
        )} hover:shadow-lg transition-shadow duration-200`}
      >
        <div className="flex justify-between items-center h-10">
          <p className="text-sm font-semibold text-gray-800 break-normal pr-2">
            {task.title}
          </p>
          <span
            className={`px-2 py-0.5 w-30 h-5 text-xs font-semibold rounded-full ${getStatusStyle(
              task.status
            )}`}
          >
            {task.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

// Компонент, който представя единичен отговор в списъка
const AnswerItem: React.FC<{ answer: IAnswer; caseData: ICase }> = ({
  answer,
  caseData,
}) => {
  const isApproved = !!answer.approved;
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150 cursor-pointer"
            >
              Създай задача
            </button>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originatingCase={caseData}
        originatingAnswer={answer}
      />
    </>
  );
};

interface CaseTasksTabProps {
  caseData: ICase;
}

const CaseTasksTab: React.FC<CaseTasksTabProps> = ({ caseData }) => {
  // --- Макетирани данни за съществуващи задачи ---
  const existingTasks = [
    {
      id: 1,
      title: "Актуализация на драйверите за принтери в офиса",
      status: "Процес",
      priority: "ВИСОК",
    },
    {
      id: 5,
      title: "Подмяна на дефектните офис столове",
      status: "Завършена",
      priority: "НИСЪК",
    },
  ];

  const sortedAnswers = [...(caseData.answers || [])].sort((a, b) => {
    if (a.approved && !b.approved) return -1;
    if (!a.approved && b.approved) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="px-4">
      {/* --- Секция: Съществуващи Задачи --- */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Съществуващи Задачи по Сигнала
        </h3>
        {existingTasks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {existingTasks.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-md">
            <ClipboardDocumentCheckIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm">
              Все още няма създадени задачи по този сигнал.
            </p>
          </div>
        )}
      </div>

      {/* --- Секция за Създаване на Нова Задача --- */}
      <div className="mb-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Създайте нова задача от отговор
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Изберете отговор по-долу, който да използвате като основа за нова
          задача. Одобреният отговор е подчертан.
        </p>
      </div>

      <div>
        {sortedAnswers.length > 0 ? (
          sortedAnswers.map((answer) => (
            <AnswerItem key={answer._id} answer={answer} caseData={caseData} />
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
