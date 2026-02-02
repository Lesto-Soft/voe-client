import React, { useState } from "react";
import { IUser } from "../../db/interfaces";
import { useAssignTask } from "../../graphql/hooks/task";
import { useGetAllUsers } from "../../graphql/hooks/user";
import UserLink from "../global/links/UserLink";
import { UserPlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

interface TaskAssigneeChangerProps {
  taskId: string;
  currentAssignee?: IUser;
  onAssigneeChanged: () => void;
}

const TaskAssigneeChanger: React.FC<TaskAssigneeChangerProps> = ({
  taskId,
  currentAssignee,
  onAssigneeChanged,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentAssignee?._id || ""
  );

  const { assignTask, loading } = useAssignTask(taskId);
  const { users } = useGetAllUsers({ itemsPerPage: 1000, currentPage: 0 });

  const handleSave = async () => {
    try {
      await assignTask(taskId, selectedUserId || undefined);
      setIsChanging(false);
      onAssigneeChanged();
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const handleCancel = () => {
    setSelectedUserId(currentAssignee?._id || "");
    setIsChanging(false);
  };

  if (!isChanging) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div>
          {currentAssignee ? (
            <UserLink user={currentAssignee} />
          ) : (
            <span className="text-sm text-gray-500 italic">Невъзложена</span>
          )}
        </div>
        <button
          onClick={() => setIsChanging(true)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Промени възложен"
        >
          <UserPlusIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
      >
        <option value="">-- Без възложен --</option>
        {users?.map((user: IUser) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.username})
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
          Отмени
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CheckIcon className="h-3.5 w-3.5" />
          {loading ? "Запазване..." : "Запази"}
        </button>
      </div>
    </div>
  );
};

export default TaskAssigneeChanger;
