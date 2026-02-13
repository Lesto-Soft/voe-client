import React, { useState } from "react";
import { IUser } from "../../db/interfaces";
import { useAssignTask } from "../../graphql/hooks/task";
import { useCurrentUser } from "../../context/UserContext";
import UserLink from "../global/links/UserLink";
import UserAvatar from "../cards/UserAvatar";
import { endpoint } from "../../db/config";
import UserCombobox from "../global/dropdown/UserCombobox";
import { UserPlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

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
    currentAssignee?._id || "",
  );

  const currentUser = useCurrentUser();
  const { assignTask, loading } = useAssignTask(taskId);

  const handleSave = async () => {
    try {
      await assignTask(taskId, selectedUserId || undefined, currentUser._id);
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
        <div className="flex items-center gap-2">
          {currentAssignee && (
            <UserAvatar
              name={currentAssignee.name}
              imageUrl={
                currentAssignee.avatar
                  ? `${endpoint}/static/avatars/${currentAssignee._id}/${currentAssignee.avatar}`
                  : null
              }
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
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          title="Промени възложен"
        >
          <UserPlusIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <UserCombobox
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
        placeholder="Търси потребител..."
        allowUnassign
      />

      {/* Save/Cancel buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
          Отмени
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <CheckIcon className="h-3.5 w-3.5" />
          {loading ? "Запазване..." : "Запази"}
        </button>
      </div>
    </div>
  );
};

export default TaskAssigneeChanger;
