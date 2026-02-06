import React, { useState } from "react";
import { ITaskActivity, IMe, TaskActivityType } from "../../db/interfaces";
import {
  useCreateTaskActivity,
  useUpdateTaskActivity,
  useDeleteTaskActivity,
} from "../../graphql/hooks/task";
import UserLink from "../global/links/UserLink";
import ActionMenu from "../global/ActionMenu";
import { renderContentSafely } from "../../utils/contentRenderer";
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Activity type configuration with icons and colors
const activityTypeConfig: Record<
  TaskActivityType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    textColor: string;
    borderColor: string;
    leftBorderColor: string;
  }
> = {
  [TaskActivityType.Comment]: {
    label: "Коментар",
    icon: ChatBubbleLeftIcon,
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
    leftBorderColor: "border-l-slate-500",
  },
  [TaskActivityType.HelpRequest]: {
    label: "Искане за помощ",
    icon: QuestionMarkCircleIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    leftBorderColor: "border-l-red-500",
  },
  [TaskActivityType.ApprovalRequest]: {
    label: "Искане за одобрение",
    icon: CheckCircleIcon,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    leftBorderColor: "border-l-green-500",
  },
  [TaskActivityType.StatusChange]: {
    label: "Промяна на статус",
    icon: ArrowPathIcon,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    leftBorderColor: "border-l-purple-500",
  },
  [TaskActivityType.PriorityChange]: {
    label: "Промяна на приоритет",
    icon: ExclamationTriangleIcon,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    leftBorderColor: "border-l-yellow-500",
  },
  [TaskActivityType.AssigneeChange]: {
    label: "Промяна на възложен",
    icon: UserGroupIcon,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    leftBorderColor: "border-l-blue-500",
  },
};

// User-selectable activity types (exclude system-generated types)
const selectableActivityTypes: TaskActivityType[] = [
  TaskActivityType.Comment,
  TaskActivityType.HelpRequest,
  TaskActivityType.ApprovalRequest,
];

// System-generated activity types (rendered as compact notifications)
const systemActivityTypes: TaskActivityType[] = [
  TaskActivityType.StatusChange,
  TaskActivityType.PriorityChange,
  TaskActivityType.AssigneeChange,
];

interface TaskActivitiesProps {
  taskId: string;
  activities: ITaskActivity[];
  currentUser: IMe;
  refetch: () => void;
}

const TaskActivities: React.FC<TaskActivitiesProps> = ({
  taskId,
  activities,
  currentUser,
  refetch,
}) => {
  const [newContent, setNewContent] = useState("");
  const [activityType, setActivityType] = useState<TaskActivityType>(
    TaskActivityType.Comment,
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [editContent, setEditContent] = useState("");
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null,
  );

  const { createTaskActivity, loading: createLoading } =
    useCreateTaskActivity(taskId);
  const { updateTaskActivity, loading: updateLoading } =
    useUpdateTaskActivity(taskId);
  const { deleteTaskActivity, loading: deleteLoading } =
    useDeleteTaskActivity(taskId);

  const handleSubmitActivity = async () => {
    if (!newContent.trim() || createLoading) return;

    try {
      await createTaskActivity({
        task: taskId,
        createdBy: currentUser._id,
        type: activityType,
        content: newContent.trim(),
        attachments: [],
      });
      setNewContent("");
      setActivityType(TaskActivityType.Comment);
      refetch();
    } catch (error) {
      console.error("Failed to add activity:", error);
    }
  };

  const handleStartEdit = (activity: ITaskActivity) => {
    setEditingActivityId(activity._id);
    setEditContent(activity.content || "");
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (activityId: string) => {
    if (!editContent.trim() || updateLoading) return;

    try {
      await updateTaskActivity(activityId, { content: editContent.trim() });
      setEditingActivityId(null);
      setEditContent("");
      refetch();
    } catch (error) {
      console.error("Failed to update activity:", error);
    }
  };

  const handleDelete = async (activityId: string) => {
    if (deleteLoading) return;

    try {
      await deleteTaskActivity(activityId);
      setDeletingActivityId(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const canModifyActivity = (activity: ITaskActivity) => {
    // Allow modification if user is the creator OR is an admin
    return (
      activity.createdBy._id === currentUser._id ||
      currentUser.role?._id === "ADMIN"
    );
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort activities by creation date (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Add activity section - FIXED AT TOP */}
      <div className="flex-shrink-0 bg-white rounded-lg p-3 border border-gray-200 mb-4">
        {/* Title and activity type selector on same line */}
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Добави запис
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {selectableActivityTypes.map((type) => {
              const config = activityTypeConfig[type];
              const Icon = config.icon;
              const isSelected = activityType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivityType(type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text input with submit button on RIGHT */}
        <div className="flex gap-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={
              activityType === TaskActivityType.Comment
                ? "Добавете коментар..."
                : activityType === TaskActivityType.HelpRequest
                  ? "Опишете от каква помощ се нуждаете..."
                  : "Опишете какво трябва да бъде одобрено..."
            }
            rows={2}
            maxLength={1500}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          />
          <button
            type="button"
            onClick={handleSubmitActivity}
            disabled={!newContent.trim() || createLoading}
            title={createLoading ? "Изпращане..." : "Публикувай"}
            className="flex-shrink-0 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Activities list - SCROLLABLE */}
      <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar-xs">
          {sortedActivities.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Няма активност все още. Бъдете първият!
            </p>
          ) : (
            sortedActivities.map((activity) => {
              const config = activityTypeConfig[activity.type];
              const Icon = config.icon;
              const isSystemActivity = systemActivityTypes.includes(activity.type);
              const isEditing = editingActivityId === activity._id;
              const isDeleting = deletingActivityId === activity._id;
              const canModify = canModifyActivity(activity) && !isSystemActivity;

              // Compact rendering for system activities
              if (isSystemActivity) {
                return (
                  <div
                    key={activity._id}
                    className={`flex items-center gap-2 py-1.5 px-3 text-xs rounded-md border-l-2 ${config.leftBorderColor} ${config.bgColor}`}
                  >
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${config.textColor}`} />
                    <span className={`font-medium ${config.textColor}`}>
                      {activity.content}
                    </span>
                    <span className="text-gray-400 ml-auto whitespace-nowrap">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </div>
                );
              }

              // Full rendering for user activities
              return (
                <div
                  key={activity._id}
                  className={`border-l-4 ${config.leftBorderColor} rounded-lg py-2 px-3 bg-white shadow-sm border border-gray-200`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 ${config.textColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
                          >
                            {config.label}
                          </span>
                          <UserLink user={activity.createdBy} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(activity.createdAt)}
                          </span>
                          {/* ActionMenu with Edit/Delete */}
                          {canModify && !isEditing && !isDeleting && (
                            <ActionMenu>
                              <button
                                onClick={() => handleStartEdit(activity)}
                                className="flex items-center gap-2 w-full p-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md"
                              >
                                <PencilIcon className="h-4 w-4" />
                                Редактирай
                              </button>
                              <button
                                onClick={() =>
                                  setDeletingActivityId(activity._id)
                                }
                                className="flex items-center gap-2 w-full p-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Изтрий
                              </button>
                            </ActionMenu>
                          )}
                        </div>
                      </div>

                      {/* Edit mode */}
                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none bg-white"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={updateLoading}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <XMarkIcon className="h-4 w-4" />
                              Отмени
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(activity._id)}
                              disabled={!editContent.trim() || updateLoading}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              {updateLoading ? "Запазване..." : "Запази"}
                            </button>
                          </div>
                        </div>
                      ) : isDeleting ? (
                        /* Delete confirmation */
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700 mb-3">
                            Сигурни ли сте, че искате да изтриете това?
                          </p>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setDeletingActivityId(null)}
                              disabled={deleteLoading}
                              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Отмени
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(activity._id)}
                              disabled={deleteLoading}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              {deleteLoading ? "Изтриване..." : "Изтрий"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal content display */
                        <div className="text-sm text-gray-700">
                          {renderContentSafely(activity.content || "")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
      </div>
    </div>
  );
};

export default TaskActivities;
