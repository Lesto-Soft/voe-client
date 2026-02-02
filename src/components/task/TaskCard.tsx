import React from "react";
import { Link } from "react-router";
import { ITask } from "../../db/interfaces";
import { getPriorityBorderColor } from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskDueDateIndicator from "./TaskDueDateIndicator";
import TaskLink from "../global/links/TaskLink";
import CaseLink from "../global/links/CaseLink";
import UserLink from "../global/links/UserLink";
import { useTranslation } from "react-i18next";

interface TaskCardProps {
  task: ITask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { t } = useTranslation();
  const borderColor = getPriorityBorderColor(task.priority);

  return (
    <Link to={`/tasks/${task.taskNumber}`} className="block">
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
              <div className="w-20" onClick={(e) => e.stopPropagation()}>
                <TaskLink task={task} />
              </div>
              {task.relatedCase && (
                <>
                  <span>Сигнал:</span>
                  <div className="w-20" onClick={(e) => e.stopPropagation()}>
                    <CaseLink my_case={task.relatedCase} t={t} />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Създадена от:</span>
              <div onClick={(e) => e.stopPropagation()}>
                <UserLink user={task.creator} />
              </div>
            </div>
          </div>

          {/* Lower metadata */}
          <div className="pt-3 text-sm">
            <div className="flex justify-between items-end">
              <TaskDueDateIndicator
                dueDate={task.dueDate}
                status={task.status}
                size="sm"
              />
              {task.assignee && (
                <div onClick={(e) => e.stopPropagation()}>
                  <UserLink user={task.assignee} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
