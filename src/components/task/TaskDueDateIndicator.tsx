import React from "react";
import {
  CalendarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { TaskStatus } from "../../db/interfaces";

type DueDateStatus = "overdue" | "warning" | "normal" | "none";

interface TaskDueDateIndicatorProps {
  dueDate?: string;
  status: TaskStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
}

// Calculate days until due date
const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get due date status
export const getDueDateStatus = (
  dueDate?: string,
  status?: TaskStatus
): DueDateStatus => {
  if (!dueDate) return "none";
  // Don't show warnings for completed tasks
  if (status === TaskStatus.Done) return "normal";

  const daysUntil = getDaysUntilDue(dueDate);

  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 2) return "warning"; // Warning if due within 2 days
  return "normal";
};

// Format due date with relative text
const formatDueDate = (dueDate: string, status: DueDateStatus): string => {
  const daysUntil = getDaysUntilDue(dueDate);
  const dateStr = new Date(dueDate).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (status === "overdue") {
    const daysOverdue = Math.abs(daysUntil);
    return daysOverdue === 1
      ? `${dateStr} (1 ден закъснение)`
      : `${dateStr} (${daysOverdue} дни закъснение)`;
  }

  if (status === "warning") {
    if (daysUntil === 0) return `${dateStr} (днес)`;
    if (daysUntil === 1) return `${dateStr} (утре)`;
    return `${dateStr} (след ${daysUntil} дни)`;
  }

  return dateStr;
};

// Status configuration
const statusConfig: Record<
  DueDateStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  overdue: {
    icon: ExclamationTriangleIcon,
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  warning: {
    icon: ClockIcon,
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  normal: {
    icon: CalendarIcon,
    textColor: "text-gray-600",
    bgColor: "",
    borderColor: "",
  },
  none: {
    icon: CalendarIcon,
    textColor: "text-gray-500",
    bgColor: "",
    borderColor: "",
  },
};

const TaskDueDateIndicator: React.FC<TaskDueDateIndicatorProps> = ({
  dueDate,
  status,
  size = "sm",
  showIcon = true,
}) => {
  const dueDateStatus = getDueDateStatus(dueDate, status);
  const config = statusConfig[dueDateStatus];
  const Icon = config.icon;

  if (!dueDate) {
    return (
      <span className={`text-${size === "sm" ? "xs" : "sm"} text-gray-500 flex items-center gap-1`}>
        {showIcon && <CalendarIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />}
        Няма краен срок
      </span>
    );
  }

  const formattedDate = formatDueDate(dueDate, dueDateStatus);

  // For normal status, just show text
  if (dueDateStatus === "normal") {
    return (
      <span className={`text-${size === "sm" ? "xs" : "sm"} ${config.textColor} flex items-center gap-1`}>
        {showIcon && <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />}
        {formattedDate}
      </span>
    );
  }

  // For warning/overdue, show with badge styling
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.bgColor} ${config.borderColor} ${config.textColor} text-${size === "sm" ? "xs" : "sm"} font-medium`}
    >
      {showIcon && <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />}
      {formattedDate}
    </span>
  );
};

export default TaskDueDateIndicator;
