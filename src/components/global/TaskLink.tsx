// src/components/global/TaskLink.tsx

import React from "react";
import { Link } from "react-router";

// A simplified interface for the task prop
interface ITask {
  id: number | string;
  title: string;
}

interface ITaskLinkProps {
  task: ITask;
}

const TaskLink: React.FC<ITaskLinkProps> = ({ task }) => {
  if (!task) {
    return null;
  }

  // Using teal as the unique color combination
  const baseClasses =
    "inline-flex items-center justify-center w-20 px-2 py-1 rounded-md text-xs font-bold transition-colors duration-150 ease-in-out border shadow-sm";
  const colorClasses = "bg-red-100 text-red-800 border-red-200";
  const hoverClasses = "hover:bg-red-200 hover:text-red-900";
  const title = `View details for task: ${task.title}`;

  const linkContent = (
    <>
      <span className="font-bold">#{task.id}</span>
    </>
  );

  return (
    <Link
      to={`/task/${task.id}`}
      className={`${baseClasses} ${colorClasses} ${hoverClasses} cursor-pointer`}
      title={title}
    >
      {linkContent}
    </Link>
  );
};

export default TaskLink;
