import React from "react";
import { TaskStatus } from "../../db/interfaces";
import {
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<
  TaskStatus,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  [TaskStatus.Todo]: {
    label: "За изпълнение",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: <ClockIcon className="h-4 w-4" />,
  },
  [TaskStatus.InProgress]: {
    label: "В процес",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: <PlayCircleIcon className="h-4 w-4" />,
  },
  [TaskStatus.Done]: {
    label: "Завършена",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: <CheckCircleIcon className="h-4 w-4" />,
  },
};

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = "sm",
}) => {
  const config = statusConfig[status];

  if (!config) {
    return null;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};

export default TaskStatusBadge;
