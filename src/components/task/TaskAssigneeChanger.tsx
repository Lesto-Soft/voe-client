import React, { useState, useMemo } from "react";
import { IUser } from "../../db/interfaces";
import { useAssignTask } from "../../graphql/hooks/task";
import { useGetAllUsers } from "../../graphql/hooks/user";
import { useCurrentUser } from "../../context/UserContext";
import UserLink from "../global/links/UserLink";
import UserAvatar from "../cards/UserAvatar";
import { endpoint } from "../../db/config";
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
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = useCurrentUser();
  const { assignTask, loading } = useAssignTask(taskId);
  const { users } = useGetAllUsers({ itemsPerPage: 1000, currentPage: 0 });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users || [];
    const query = searchQuery.toLowerCase();
    return (users || []).filter((user: IUser) =>
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleSave = async () => {
    try {
      await assignTask(taskId, selectedUserId || undefined, currentUser._id);
      setIsChanging(false);
      setSearchQuery("");
      onAssigneeChanged();
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const handleCancel = () => {
    setSelectedUserId(currentAssignee?._id || "");
    setSearchQuery("");
    setIsChanging(false);
  };

  if (!isChanging) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {currentAssignee && (
            <UserAvatar
              name={currentAssignee.name}
              imageUrl={currentAssignee.avatar
                ? `${endpoint}/static/avatars/${currentAssignee._id}/${currentAssignee.avatar}`
                : null}
              size={32}
            />
          )}
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
      {/* Search input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Търси потребител..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Scrollable user list */}
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
        <button
          type="button"
          onClick={() => setSelectedUserId("")}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${!selectedUserId ? "bg-blue-50" : ""}`}
        >
          -- Без възложен --
        </button>
        {filteredUsers.map((user: IUser) => (
          <button
            type="button"
            key={user._id}
            onClick={() => setSelectedUserId(user._id)}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 ${
              selectedUserId === user._id ? "bg-blue-100" : ""
            }`}
          >
            <UserAvatar
              name={user.name}
              imageUrl={user.avatar
                ? `${endpoint}/static/avatars/${user._id}/${user.avatar}`
                : null}
              size={24}
            />
            <span className="flex-1">{user.name}</span>
            <span className="text-gray-500 text-xs">({user.username})</span>
          </button>
        ))}
      </div>

      {/* Save/Cancel buttons */}
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
