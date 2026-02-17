import React from "react";
import { useNavigate } from "react-router";
import { ITask } from "../../db/interfaces";
import { getPriorityBorderColor } from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import { getDueDateStatus } from "./TaskDueDateIndicator";
import TaskLink from "../global/links/TaskLink";
import CaseLink from "../global/links/CaseLink";
import UserLink from "../global/links/UserLink";
import ShowDate from "../global/ShowDate";
import {
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
interface TaskCardProps {
  task: ITask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  const borderColor = getPriorityBorderColor(task.priority);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if the click originated from an inner link
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    navigate(`/tasks/${task.taskNumber}`);
  };

  return (
    <div onClick={handleCardClick} className="block cursor-pointer">
      <div
        className={`bg-white p-4 rounded-lg shadow-md border-t-8 ${borderColor} hover:shadow-xl transition-shadow duration-200 flex flex-col h-52`}
      >
        {/* Top Section: Title and Status */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold text-gray-800 flex-1 pr-2 line-clamp-2">
              {task.title}
            </h3>
            <TaskStatusBadge status={task.status} showIcon={false} />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Bottom Section: Metadata */}
        <div className="flex-shrink-0 divide-y divide-gray-100">
          {/* Upper metadata */}
          <div className="pb-3 text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2">
              <span>Задача:</span>
              <div className="w-20">
                <TaskLink task={task} />
              </div>
              {task.relatedCase && (
                <>
                  <span>Сигнал:</span>
                  <div className="w-20">
                    <CaseLink my_case={task.relatedCase} />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Създадена от:</span>
              <UserLink user={task.creator} />
            </div>
          </div>

          {/* Lower metadata */}
          <div className="pt-3 text-sm">
            <div className="flex justify-between items-end">
              {task.dueDate ? (
                <div className="flex items-center gap-1.5">
                  <ShowDate date={task.dueDate} />
                  {getDueDateStatus(task.dueDate, task.status) ===
                    "overdue" && (
                    <span title="Просрочена задача">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    </span>
                  )}
                  {getDueDateStatus(task.dueDate, task.status) ===
                    "warning" && (
                    <span title="Краен срок наближава">
                      <ClockIcon className="h-4 w-4 text-amber-500" />
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">Няма краен срок</span>
              )}
              {task.assignee && (
                  <UserLink user={task.assignee} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
