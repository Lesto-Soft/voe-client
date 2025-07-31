// src/components/case-components/CaseTasksTab.tsx

import React, { useState } from "react";
import { Link } from "react-router";
import { ICase, IAnswer, IUser } from "../../db/interfaces";
import { renderContentSafely } from "../../utils/contentRenderer";
import CreateTaskModal from "../modals/CreateTaskModal";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import UserLink from "../global/UserLink";

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
        className={`bg-white p-3 rounded-lg shadow-md border-t-8 ${getPriorityBorderStyle(
          task.priority
        )} hover:shadow-lg transition-shadow duration-200 flex flex-col h-42`}
      >
        {/* Top Section */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-gray-800 break-normal pr-2 line-clamp-2">
              {task.title}
            </p>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusStyle(
                task.status
              )} flex-shrink-0`}
            >
              {task.status}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 divide-y divide-gray-100 text-xs">
          <div className="pb-2 text-gray-500 space-y-1.5">
            <div className="flex items-center gap-2">
              <span>Възложена от:</span>
              <UserLink user={task.creator} />
            </div>
          </div>
          <div className="pt-2">
            <div className="flex justify-between items-end">
              <div>
                <strong className="text-gray-500 font-medium">
                  Краен срок:
                </strong>
                <p className="text-sm font-semibold text-gray-700">
                  {task.dueDate ? task.dueDate : "Няма"}
                </p>
              </div>
              <div className="flex space-x-2 overflow-hidden">
                {/* --- CHANGE START: Added fallback for assignees to prevent crash --- */}
                {(task.assignees || []).map((user: IUser) => (
                  <div key={user._id} title={user.name}>
                    <UserLink user={user} />
                  </div>
                ))}
                {/* --- CHANGE END --- */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

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
  tasks: any[];
  onShowMockTasks: () => void;
}

const CaseTasksTab: React.FC<CaseTasksTabProps> = ({
  caseData,
  tasks,
  onShowMockTasks,
}) => {
  const sortedAnswers = [...(caseData.answers || [])].sort((a, b) => {
    if (a.approved && !b.approved) return -1;
    if (!a.approved && b.approved) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="px-4">
      {/* --- Existing Tasks Section --- */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Съществуващи Задачи по Сигнала
        </h3>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-md">
            <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="text-sm mt-2">
              Все още няма създадени задачи по този сигнал.
            </p>
            <button
              onClick={onShowMockTasks}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
            >
              Покажи примерни задачи (за демонстрация)
            </button>
          </div>
        )}
      </div>

      {/* --- Create New Task Section --- */}
      <div className="mb-6 border-t border-gray-300 pt-6">
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
