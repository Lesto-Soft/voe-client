import React from "react";
import { ICase, ITask } from "../../../db/interfaces";
import ShowDate from "../../global/ShowDate";
import TaskLink from "../../global/links/TaskLink";
import TaskStatusBadge from "../../task/TaskStatusBadge";
import TaskPriorityBadge from "../../task/TaskPriorityBadge";
import CaseLink from "../../global/links/CaseLink";
import {
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface UserTaskActivityCardProps {
  task: ITask;
  activityType: "task_created" | "task_assigned" | "task_completed";
  date: string;
  view?: "full" | "compact";
}

const ACTIVITY_CONFIG = {
  task_created: {
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5 text-rose-500" />,
    label: "Създаде задача",
  },
  task_assigned: {
    icon: <UserGroupIcon className="h-5 w-5 text-blue-500" />,
    label: "Назначен е на задача",
  },
  task_completed: {
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    label: "Завърши задача",
  },
};

function tFunctionForCaseLinkProp(key: string): string {
  if (key === "details_for") return "Детайли за";
  return key;
}

const UserTaskActivityCard: React.FC<UserTaskActivityCardProps> = ({
  task,
  activityType,
  date,
  view = "full",
}) => {
  const config = ACTIVITY_CONFIG[activityType];

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 group transition-colors duration-150">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div
          className={`flex-shrink-0 pt-1 ${view === "compact" ? "ml-2" : ""}`}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`flex flex-row sm:items-baseline sm:justify-between text-sm ${
              view === "compact" ? "md:flex-wrap" : "flex-wrap"
            }`}
          >
            <div className="flex items-baseline flex-wrap gap-x-1.5 min-w-0 mr-2">
              {view === "full" && (
                <span className="text-gray-700 whitespace-nowrap">
                  {config.label}
                </span>
              )}
              <div className="flex-shrink-0">
                <TaskLink task={task} />
              </div>
              {view === "compact" && (
                <span className="ml-1 text-sm text-gray-600 line-clamp-1">
                  {task.title}
                </span>
              )}
            </div>
            {date && (
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0 sm:mt-1 self-start sm:self-baseline">
                <ShowDate date={date} />
              </span>
            )}
          </div>
          {view === "full" && (
            <>
              <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                {task.title}
              </p>
              <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
                <TaskStatusBadge status={task.status} size="sm" />
                <TaskPriorityBadge priority={task.priority} size="sm" />
                {task.relatedCase && task.relatedCase.case_number && (
                  <CaseLink
                    my_case={task.relatedCase as ICase}
                    t={tFunctionForCaseLinkProp}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTaskActivityCard;
