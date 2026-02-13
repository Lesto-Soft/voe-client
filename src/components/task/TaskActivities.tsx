import React, { useState, useMemo } from "react";
import { ITaskActivity, IMe, TaskActivityType } from "../../db/interfaces";
import {
  useCreateTaskActivity,
  useUpdateTaskActivity,
  useDeleteTaskActivity,
} from "../../graphql/hooks/task";
import UserLink from "../global/links/UserLink";
import ActionMenu from "../global/ActionMenu";
import ShowDate from "../global/ShowDate";
import { renderContentSafely } from "../../utils/contentRenderer";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal, {
  GalleryItem,
} from "../modals/imageModals/ImagePreviewModal";
import UnifiedEditor from "../forms/partials/UnifiedRichTextEditor";
import {
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

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
    textColor: "text-slate-500",
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
  [TaskActivityType.AnalysisSubmitted]: {
    label: "Подаден анализ",
    icon: BeakerIcon,
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    leftBorderColor: "border-l-teal-500",
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

// Helper component to display activity attachments in read-only mode
const ActivityAttachments: React.FC<{
  attachments: string[];
  activityId: string;
}> = ({ attachments, activityId }) => {
  const galleryItems: GalleryItem[] = useMemo(
    () =>
      attachments.map((file) => ({
        url: createFileUrl("taskActivities", activityId, file),
        name: file,
      })),
    [attachments, activityId],
  );

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((file) => (
        <ImagePreviewModal
          key={file}
          galleryItems={galleryItems}
          imageUrl={createFileUrl("taskActivities", activityId, file)}
          fileName={file}
        />
      ))}
    </div>
  );
};

interface TaskActivitiesProps {
  taskId: string;
  activities: ITaskActivity[];
  currentUser: IMe;
  refetch: () => void;
  mentions?: { _id: string; name: string; username: string }[];
}

const TaskActivities: React.FC<TaskActivitiesProps> = ({
  taskId,
  activities,
  currentUser,
  refetch,
  mentions = [],
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

  // Attachment state for new activity
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  // Attachment state for editing activity
  const [editAttachments, setEditAttachments] = useState<File[]>([]);
  const [editExistingAttachments, setEditExistingAttachments] = useState<
    string[]
  >([]);
  const [editOriginalAttachments, setEditOriginalAttachments] = useState<
    string[]
  >([]);

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
        content: newContent,
        attachments: newAttachments.length > 0 ? newAttachments : undefined,
      });
      setNewContent("");
      setNewAttachments([]);
      setActivityType(TaskActivityType.Comment);
      refetch();
    } catch (error) {
      console.error("Failed to add activity:", error);
    }
  };

  const handleStartEdit = (activity: ITaskActivity) => {
    setEditingActivityId(activity._id);
    setEditContent(activity.content || "");
    setEditAttachments([]);
    setEditExistingAttachments(activity.attachments || []);
    setEditOriginalAttachments(activity.attachments || []);
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setEditContent("");
    setEditAttachments([]);
    setEditExistingAttachments([]);
    setEditOriginalAttachments([]);
  };

  const handleSaveEdit = async (activityId: string) => {
    if (!editContent.trim() || updateLoading) return;

    const removedAttachments = editOriginalAttachments.filter(
      (a) => !editExistingAttachments.includes(a),
    );

    try {
      await updateTaskActivity(activityId, {
        content: editContent,
        attachments: editAttachments.length > 0 ? editAttachments : undefined,
        deletedAttachments:
          removedAttachments.length > 0 ? removedAttachments : undefined,
      });
      setEditingActivityId(null);
      setEditContent("");
      setEditAttachments([]);
      setEditExistingAttachments([]);
      setEditOriginalAttachments([]);
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

  // Sort activities by creation date (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Add activity section - FIXED AT TOP */}
      <div className="flex-shrink-0 mb-4 border border-0 border-b-3 border-gray-300 p-3 pb-12 bg-gray-50 shadow-md">
        {/* Title and activity type selector on same line */}
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Нов запис
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

        {/* Rich text input with send button */}
        <UnifiedEditor
          content={newContent}
          onContentChange={setNewContent}
          attachments={newAttachments}
          setAttachments={setNewAttachments}
          onSend={handleSubmitActivity}
          mentions={mentions}
          placeholder="Добавете запис..."
          minLength={0}
          maxLength={1500}
          isSending={createLoading}
          type="taskActivity"
          editorClassName="h-[80px] min-h-[80px] max-h-[80px]"
        />
      </div>

      {/* Activities list - SCROLLABLE */}
      <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar-xs ml-3">
        {sortedActivities.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Няма активност все още. Бъдете първият!
          </p>
        ) : (
          sortedActivities.map((activity) => {
            const config = activityTypeConfig[activity.type];
            const Icon = config.icon;
            const isSystemActivity = systemActivityTypes.includes(
              activity.type,
            );
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
                  <Icon
                    className={`h-3.5 w-3.5 flex-shrink-0 ${config.textColor}`}
                  />
                  <span className={`font-medium ${config.textColor}`}>
                    {activity.content}
                  </span>
                  <div className="ml-auto">
                    <ShowDate date={activity.createdAt} />
                  </div>
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
                        <ShowDate date={activity.createdAt} />
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
                        <UnifiedEditor
                          content={editContent}
                          onContentChange={setEditContent}
                          attachments={editAttachments}
                          setAttachments={setEditAttachments}
                          existingAttachments={editExistingAttachments}
                          setExistingAttachments={setEditExistingAttachments}
                          mentions={mentions}
                          placeholder="Редактирайте съдържанието..."
                          minLength={0}
                          maxLength={1500}
                          type="taskActivity"
                          hideSideButtons
                          editorClassName="h-[100px] min-h-[100px] max-h-[100px]"
                          caseId={activity._id}
                          attachmentFolder="taskActivities"
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
                      <>
                        <div className="text-sm text-gray-700 max-h-40 overflow-y-auto custom-scrollbar-xs">
                          {renderContentSafely(activity.content || "")}
                        </div>
                        {activity.attachments &&
                          activity.attachments.length > 0 && (
                            <ActivityAttachments
                              attachments={activity.attachments}
                              activityId={activity._id}
                            />
                          )}
                      </>
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
