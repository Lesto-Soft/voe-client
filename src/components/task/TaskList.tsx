import React from "react";
import { ITask } from "../../db/interfaces";
import TaskCard from "./TaskCard";
import TaskTable from "./TaskTable";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

interface TaskListProps {
  tasks: ITask[];
  viewMode: "grid" | "table";
  loading?: boolean;
}

const TaskListEmpty: React.FC = () => (
  <div className="text-center py-16 text-gray-500">
    <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
    <p className="text-lg font-semibold">Няма намерени задачи</p>
    <p>Няма задачи, които да отговарят на избраните филтри.</p>
  </div>
);

const TaskListSkeleton: React.FC<{ viewMode: "grid" | "table" }> = ({ viewMode }) => {
  if (viewMode === "table") {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-gray-200 flex items-center px-6 gap-4">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow-md border-t-8 border-gray-200 h-52 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
          <div className="flex-grow" />
          <div className="space-y-3 mt-auto">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, viewMode, loading }) => {
  if (loading) {
    return <TaskListSkeleton viewMode={viewMode} />;
  }

  if (tasks.length === 0) {
    return <TaskListEmpty />;
  }

  if (viewMode === "table") {
    return <TaskTable tasks={tasks} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
