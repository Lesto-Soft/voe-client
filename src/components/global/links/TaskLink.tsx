import React from "react";
import { Link } from "react-router";
import { ITask } from "../../../db/interfaces";
import { useCurrentUser } from "../../../context/UserContext";
import { ROLES } from "../../../utils/GLOBAL_PARAMETERS";

interface TaskLinkProps {
  task: ITask;
}

const TaskLink: React.FC<TaskLinkProps> = ({ task }) => {
  const currentUser = useCurrentUser();

  if (!task || !currentUser) {
    return null;
  }

  const isAdmin = currentUser.role?._id === ROLES.ADMIN;
  const hasAccess =
    isAdmin ||
    currentUser.accessibleTasks?.some((t) => t._id === task._id);

  const baseClasses =
    "inline-flex items-center justify-center w-full px-2 py-1 rounded-md text-xs font-bold transition-colors duration-150 ease-in-out border shadow-sm";

  const linkContent = (
    <>
      <span className="font-bold">#{task.taskNumber}</span>
      <svg
        className="ml-1 h-4 w-4 text-rose-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  if (hasAccess) {
    const colorClasses =
      "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 hover:text-rose-900 cursor-pointer";
    const title = `Детайли за задача #${task.taskNumber}`;

    return (
      <Link
        to={`/tasks/${task.taskNumber}`}
        className={`${baseClasses} ${colorClasses}`}
        title={title}
      >
        {linkContent}
      </Link>
    );
  } else {
    const disabledClasses =
      "bg-rose-50 text-rose-400 border-rose-200 opacity-60 cursor-not-allowed";
    return (
      <span
        className={`${baseClasses} ${disabledClasses}`}
        title="Нямате права за достъп до тази задача"
      >
        {linkContent}
      </span>
    );
  }
};

export default TaskLink;
