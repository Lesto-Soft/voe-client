import React, { useState } from "react";
import { Link } from "react-router";
import { ICase, ITask } from "../../db/interfaces";
import { useGetAllTasks } from "../../graphql/hooks/task";
import { TaskFormModal, TaskDueDateIndicator } from "../task";
import TaskStatusBadge from "../task/TaskStatusBadge";
import TaskPriorityBadge, { getPriorityBorderColor } from "../task/TaskPriorityBadge";
import UserLink from "../global/links/UserLink";
import TaskLink from "../global/links/TaskLink";
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface TaskCardProps {
  task: ITask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Link to={`/tasks/${task.taskNumber}`} className="block">
      <div
        className={`bg-white p-3 rounded-lg shadow-md border-t-4 ${getPriorityBorderColor(
          task.priority
        )} hover:shadow-lg transition-shadow duration-200 flex flex-col h-full min-h-[160px]`}
      >
        {/* Top Section */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-start gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
              {task.title}
            </p>
            <TaskStatusBadge status={task.status} size="sm" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <TaskLink task={task} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Bottom Section */}
        <div className="flex-shrink-0 pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
          <TaskDueDateIndicator
            dueDate={task.dueDate}
            status={task.status}
            size="sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span>Възложена на:</span>
              {task.assignee ? (
                <UserLink user={task.assignee} />
              ) : (
                <span className="italic">Няма</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface CaseTasksTabProps {
  caseData: ICase;
}

const CaseTasksTab: React.FC<CaseTasksTabProps> = ({ caseData }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch tasks related to this case
  const { tasks, count, loading, refetch } = useGetAllTasks({
    caseId: caseData._id,
    itemsPerPage: 100, // Show all tasks for this case
    currentPage: 0,
  });

  // Get the approved answer or the latest answer to use as initial description
  const getInitialDescription = (): string | undefined => {
    if (!caseData.answers || caseData.answers.length === 0) return undefined;
    // Prefer approved answer, otherwise use the first answer
    const approvedAnswer = caseData.answers.find((a) => a.approved);
    const answer = approvedAnswer || caseData.answers[0];
    return answer?.content || undefined;
  };

  return (
    <div className="px-4 py-2">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardDocumentCheckIcon className="h-6 w-6 text-rose-500" />
          Задачи по сигнала
          {!loading && <span className="text-gray-400 font-normal">({count})</span>}
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          Нова задача
        </button>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-3 rounded-lg shadow-md border-t-4 border-gray-200 animate-pulse h-[160px]"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task: ITask) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-gray-50 p-8 rounded-lg">
          <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            Все още няма създадени задачи по този сигнал.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            Създай първата задача
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        relatedCaseId={caseData._id}
        initialDescription={getInitialDescription()}
        onSuccess={refetch}
      />
    </div>
  );
};

export default CaseTasksTab;
