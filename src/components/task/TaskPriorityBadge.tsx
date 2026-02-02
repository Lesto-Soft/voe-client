import React from "react";
import { CasePriority } from "../../db/interfaces";
import { FlagIcon } from "@heroicons/react/24/outline";

interface TaskPriorityBadgeProps {
  priority: CasePriority;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const priorityConfig: Record<
  CasePriority,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  [CasePriority.High]: {
    label: "Висок",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    borderColor: "border-red-500",
  },
  [CasePriority.Medium]: {
    label: "Среден",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
  },
  [CasePriority.Low]: {
    label: "Нисък",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    borderColor: "border-green-500",
  },
};

const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority,
  showIcon = true,
  showLabel = true,
  size = "sm",
}) => {
  const config = priorityConfig[priority];

  if (!config) {
    return null;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses}`}
    >
      {showIcon && <FlagIcon className="h-4 w-4" />}
      {showLabel && config.label}
    </span>
  );
};

export default TaskPriorityBadge;

/**
 * Returns the border-top color class for a priority (used in TaskCard).
 */
export const getPriorityBorderColor = (priority: CasePriority): string => {
  return priorityConfig[priority]?.borderColor ?? "border-gray-400";
};
