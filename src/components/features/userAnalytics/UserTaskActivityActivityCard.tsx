import React from "react";
import { ICase, ITaskActivity } from "../../../db/interfaces";
import ShowDate from "../../global/ShowDate";
import TaskLink from "../../global/links/TaskLink";
import TaskStatusBadge from "../../task/TaskStatusBadge";
import TaskPriorityBadge from "../../task/TaskPriorityBadge";
import CaseLink from "../../global/links/CaseLink";
import {
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

type TaskActivityActivityType =
  | "task_comment"
  | "task_help_request"
  | "task_approval_request"
  | "task_status_change"
  | "task_priority_change"
  | "task_assignee_change"
  | "task_analysis_submitted";

interface UserTaskActivityActivityCardProps {
  taskActivity: ITaskActivity;
  activityType: TaskActivityActivityType;
  date: string;
  view?: "full" | "compact";
}

const ACTIVITY_CONFIG: Record<
  TaskActivityActivityType,
  { icon: React.ReactNode; label: string }
> = {
  task_comment: {
    icon: <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />,
    label: "Коментира задача",
  },
  task_help_request: {
    icon: <QuestionMarkCircleIcon className="h-5 w-5 text-red-500" />,
    label: "Поиска помощ за задача",
  },
  task_approval_request: {
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    label: "Поиска одобрение за задача",
  },
  task_status_change: {
    icon: <ArrowPathIcon className="h-5 w-5 text-blue-500" />,
    label: "Промени статус на задача",
  },
  task_priority_change: {
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />,
    label: "Промени приоритет на задача",
  },
  task_assignee_change: {
    icon: <UserIcon className="h-5 w-5 text-indigo-500" />,
    label: "Промени изпълнител на задача",
  },
  task_analysis_submitted: {
    icon: <BeakerIcon className="h-5 w-5 text-teal-500" />,
    label: "Подаде анализ за задача",
  },
};

function tFunctionForCaseLinkProp(key: string): string {
  if (key === "details_for") return "Детайли за";
  return key;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

const UserTaskActivityActivityCard: React.FC<
  UserTaskActivityActivityCardProps
> = ({ taskActivity, activityType, date, view = "full" }) => {
  const config = ACTIVITY_CONFIG[activityType];
  const task = taskActivity.task;
  const contentPreview = taskActivity.content
    ? stripHtml(taskActivity.content)
    : "";

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
              {task && (
                <div className="flex-shrink-0">
                  <TaskLink task={task} />
                </div>
              )}
              {view === "compact" && task && (
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
              {contentPreview && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {contentPreview}
                </p>
              )}
              {task && (
                <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
                  <TaskStatusBadge status={task.status} size="sm" />
                  <TaskPriorityBadge priority={task.priority} size="sm" />
                  {task.relatedCase && task.relatedCase.case_number && (
                    <div className="w-20">
                      <CaseLink
                        my_case={task.relatedCase as ICase}
                        t={tFunctionForCaseLinkProp}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTaskActivityActivityCard;
