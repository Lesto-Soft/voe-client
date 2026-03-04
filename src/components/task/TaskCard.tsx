import React from "react";
import { useNavigate } from "react-router";
import { ITask, TaskStatus } from "../../db/interfaces";
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
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { getContentPreview } from "../../utils/contentRenderer";
interface TaskCardProps {
  task: ITask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  const borderColor = getPriorityBorderColor(task.priority);
  const isDone = task.status === TaskStatus.Done;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if the click originated from an inner link
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    navigate(`/tasks/${task.taskNumber}`);
  };

  return (
    <div onClick={handleCardClick} className="block cursor-pointer">
      <div
        className={`p-4 rounded-lg shadow-md border-t-8 ${borderColor} hover:shadow-xl transition-shadow duration-200 flex flex-col h-52 ${
          isDone ? "bg-gray-100 text-gray-500" : "bg-white"
        }`}
      >
        {/* 1. Title + Status */}
        <div className="flex justify-between items-start">
          <h3 className={`text-base font-bold flex-1 pr-2 line-clamp-1 truncate ${isDone ? "text-gray-500" : "text-gray-800"}`}>
            {task.title}
          </h3>
          <TaskStatusBadge status={task.status} showIcon={false} />
        </div>

        {/* 2. Description (2 lines max, fixed height) */}
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2lh]">
          {task.description ? getContentPreview(task.description, 75) : "\u00A0"}
        </p>

        {/* 3. Task number + Related case */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
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

        {/* Spacer */}
        <div className="flex-grow" />

        {/* 3.5 Separation line + bottom metadata */}
        <div className="flex-shrink-0 border-t border-gray-100 pt-2 text-xs text-gray-500 space-y-1">
          {/* 4+5. Creator -> Assignee */}
          <div className="flex items-center gap-1">
            <UserLink user={task.creator} />
            <ArrowRightIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
            {task.assignee ? (
              <UserLink user={task.assignee} />
            ) : (
              <span className="italic text-gray-400">Няма</span>
            )}
          </div>

          {/* 6. Due date */}
          <div className="flex items-center gap-1">
            <span>Срок:</span>
            {task.dueDate ? (
              <>
                <ShowDate date={task.dueDate} />
                {getDueDateStatus(task.dueDate, task.status) === "overdue" && (
                  <span title="Просрочена задача">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  </span>
                )}
                {getDueDateStatus(task.dueDate, task.status) === "warning" && (
                  <span title="Краен срок наближава">
                    <ClockIcon className="h-4 w-4 text-amber-500" />
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400">Няма</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
