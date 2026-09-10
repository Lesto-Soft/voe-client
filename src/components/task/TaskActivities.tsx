import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { ITaskActivity, IMe, TaskActivityType, TaskStatus } from "../../db/interfaces";
import {
  useCreateTaskActivity,
  useDeleteTaskActivity,
  useChangeTaskStatus,
} from "../../graphql/hooks/task";
import UserLink from "../global/links/UserLink";
import ActionMenu from "../global/ActionMenu";
import ShowDate from "../global/ShowDate";
import { renderContentSafely } from "../../utils/contentRenderer";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal, {
  GalleryItem,
} from "../modals/imageModals/ImagePreviewModal";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import UnifiedEditor from "../forms/partials/UnifiedRichTextEditor";
import EditTaskActivityModal from "./EditTaskActivityModal";
import TaskActivityDiffModal from "./TaskActivityDiffModal";
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
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HandThumbUpIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import { usePersistentState } from "../../hooks/usePersistentState";

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
  [TaskActivityType.DescriptionChange]: {
    label: "Промяна на описание",
    icon: PencilIcon,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    leftBorderColor: "border-l-gray-500",
  },
  [TaskActivityType.TitleChange]: {
    label: "Промяна на заглавие",
    icon: PencilSquareIcon,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    leftBorderColor: "border-l-indigo-500",
  },
  [TaskActivityType.DueDateChange]: {
    label: "Промяна на краен срок",
    icon: CalendarDaysIcon,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    leftBorderColor: "border-l-orange-500",
  },
  [TaskActivityType.AttachmentsChange]: {
    label: "Промяна на файлове",
    icon: PaperClipIcon,
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    leftBorderColor: "border-l-cyan-500",
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
  TaskActivityType.DescriptionChange,
  TaskActivityType.AnalysisSubmitted,
  TaskActivityType.TitleChange,
  TaskActivityType.DueDateChange,
  TaskActivityType.AttachmentsChange,
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
  readOnly?: boolean;
  currentStatus?: TaskStatus;
  canChangeStatus?: boolean;
}

const TaskActivities: React.FC<TaskActivitiesProps> = ({
  taskId,
  activities,
  currentUser,
  refetch,
  mentions = [],
  readOnly = false,
  currentStatus,
  canChangeStatus = false,
}) => {
  const [activitySortAsc, setActivitySortAsc] = usePersistentState(
    "voe.taskActivities.sortAsc",
    false,
  );
  const [isAddActivityVisible, setIsAddActivityVisible] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [activityType, setActivityType] = useState<TaskActivityType>(
    TaskActivityType.Comment,
  );
  const [editingActivity, setEditingActivity] = useState<ITaskActivity | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null,
  );

  // Attachment state for new activity
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  // Expand/collapse: a persisted "expand all" preference plus per-item overrides
  // (an override flips an item away from the preference; new items follow it)
  const [expandAllActivities, setExpandAllActivities] = usePersistentState(
    "voe.taskActivities.expandAll",
    false,
  );
  const [expandOverrides, setExpandOverrides] = useState<Set<string>>(new Set());
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [overflowingActivities, setOverflowingActivities] = useState<Set<string>>(new Set());

  const isActivityExpanded = (id: string) =>
    expandAllActivities !== expandOverrides.has(id);

  // Height of the collapsed content box (max-h-40 = 160px). Comparing
  // scrollHeight against it detects "would overflow when clamped" regardless of
  // the current expansion state, so short entries never get a toggle button.
  const ACTIVITY_CONTENT_CLAMP_PX = 160;

  // Detect which activities actually need an expand/collapse toggle
  useEffect(() => {
    const newOverflowing = new Set<string>();
    contentRefs.current.forEach((el, id) => {
      if (el.scrollHeight > ACTIVITY_CONTENT_CLAMP_PX) newOverflowing.add(id);
    });
    setOverflowingActivities(newOverflowing);
  }, [activities]);

  const toggleExpand = (id: string) => {
    setExpandOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    setExpandAllActivities((prev) => !prev);
    setExpandOverrides(new Set());
  };

  const { createTaskActivity, loading: createLoading } =
    useCreateTaskActivity(taskId);
  const { deleteTaskActivity, loading: deleteLoading } =
    useDeleteTaskActivity(taskId);
  const { changeTaskStatus, loading: statusLoading } =
    useChangeTaskStatus(taskId);

  const [approvingActivityId, setApprovingActivityId] = useState<string | null>(
    null,
  );
  const canApproveTask =
    canChangeStatus && currentStatus !== undefined && currentStatus !== TaskStatus.Done;

  const handleApprove = async () => {
    if (statusLoading || !currentUser) return;
    try {
      await changeTaskStatus(taskId, TaskStatus.Done, currentUser._id);
      refetch();
    } catch (error) {
      console.error("Failed to approve task:", error);
    } finally {
      setApprovingActivityId(null);
    }
  };

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
    setEditingActivity(activity);
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
    if (readOnly) return false;
    // Allow modification if user is the creator OR is an admin
    return (
      activity.createdBy._id === currentUser._id ||
      currentUser.role?._id === ROLES.ADMIN
    );
  };

  // Deep-link scroll & highlight (runs once per hash)
  const location = useLocation();
  const highlightedRef = useRef<HTMLElement | null>(null);
  const highlightedHashRef = useRef<string | null>(null);

  useEffect(() => {
    const hash = location.hash; // e.g. "#activity-abc123"
    if (!hash.startsWith("#activity-")) return;
    if (highlightedHashRef.current === hash) return;

    const targetId = hash.substring(1); // "activity-abc123"

    // Small delay to allow the DOM to render
    const timerId = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (!el) return;

      highlightedHashRef.current = hash;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight");
      highlightedRef.current = el;

      setTimeout(() => {
        el.classList.remove("highlight");
        highlightedRef.current = null;
      }, 5000);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [location.hash, activities]);

  // Sort activities by creation date
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return activitySortAsc ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Add activity toggle + sort toggle row */}
      {!readOnly && (
        <div className="flex-shrink-0 mb-2 px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddActivityVisible((prev) => !prev)}
              className="cursor-pointer flex-1 flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-700 font-semibold ring-1 ring-gray-300 focus:outline-none active:ring-2 active:ring-indigo-400 transition-colors"
            >
              <span className="flex items-center justify-center gap-2 text-sm">
                <ChatBubbleLeftIcon className="h-6 w-6 text-gray-500" />
                {isAddActivityVisible ? "Скрий добавяне на запис" : "Добави запис"}
              </span>
              {isAddActivityVisible ? (
                <MinusCircleIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <PlusCircleIcon className="h-6 w-6 text-gray-500" />
              )}
            </button>
            {sortedActivities.length > 1 && (
              <button
                onClick={() => setActivitySortAsc((prev) => !prev)}
                className="flex items-center text-gray-400 hover:text-gray-600 cursor-pointer p-2 rounded hover:bg-gray-50"
                title={activitySortAsc ? "Най-нови първо" : "Най-стари първо"}
              >
                {activitySortAsc ? (
                  <BarsArrowUpIcon className="h-5 w-5" />
                ) : (
                  <BarsArrowDownIcon className="h-5 w-5" />
                )}
              </button>
            )}
            {sortedActivities.length > 0 && (
              <button
                onClick={handleToggleExpandAll}
                className="flex items-center text-gray-400 hover:text-gray-600 cursor-pointer p-2 rounded hover:bg-gray-50"
                title={expandAllActivities ? "Сгъни всички записи" : "Разгъни всички записи"}
              >
                {expandAllActivities ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          {isAddActivityVisible && (
            <div className="mt-4 border border-gray-300 p-3 bg-white shadow-md rounded-lg">
              {/* Title and activity type selector on same line */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Нов запис
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectableActivityTypes.map((type) => {
                    const config = activityTypeConfig[type];
                    const TypeIcon = config.icon;
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
                        <TypeIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rich text input with send button */}
              <div className="min-h-[160px]">
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
                  editorMinHeight="min-h-[125px]"
                  editorClassName="max-h-[125px]"
                  autoFocus
                  enableHeightToggle
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sort + expand/collapse toggles for read-only mode */}
      {readOnly && sortedActivities.length > 0 && (
        <div className="flex justify-end px-5 mb-2">
          {sortedActivities.length > 1 && (
            <button
              onClick={() => setActivitySortAsc((prev) => !prev)}
              className="flex items-center text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-50"
              title={activitySortAsc ? "Най-нови първо" : "Най-стари първо"}
            >
              {activitySortAsc ? (
                <BarsArrowUpIcon className="h-5 w-5" />
              ) : (
                <BarsArrowDownIcon className="h-5 w-5" />
              )}
            </button>
          )}
          <button
            onClick={handleToggleExpandAll}
            className="flex items-center text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-50"
            title={expandAllActivities ? "Сгъни всички записи" : "Разгъни всички записи"}
          >
            {expandAllActivities ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      {/* Activities list - SCROLLABLE */}
      <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar-xs px-5 py-3">
        {sortedActivities.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Няма активност все още. Бъдете първият!
          </p>
        ) : (
          <>
          {sortedActivities.map((activity, index) => {
            const displayNumber = activitySortAsc ? index + 1 : sortedActivities.length - index;
            const config = activityTypeConfig[activity.type];
            const Icon = config.icon;
            const isSystemActivity = systemActivityTypes.includes(
              activity.type,
            );
            const canModify = canModifyActivity(activity) && !isSystemActivity;

            // Compact rendering for system activities
            if (isSystemActivity) {
              return (
                <div
                  key={activity._id}
                  id={`activity-${activity._id}`}
                  className={`flex items-center gap-2 py-1.5 px-3 text-xs rounded-md border-l-2 ${config.leftBorderColor} ${config.bgColor}`}
                >
                  <span className="text-xs font-bold text-gray-400 flex-shrink-0">
                    #{displayNumber}
                  </span>
                  <Icon
                    className={`h-3.5 w-3.5 flex-shrink-0 ${config.textColor}`}
                  />
                  <span className={`font-medium ${config.textColor}`}>
                    {activity.content}
                  </span>
                  {activity.oldValue != null && activity.newValue != null && (
                    <TaskActivityDiffModal
                      activity={activity}
                      changeLabel={config.label}
                    />
                  )}
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
                id={`activity-${activity._id}`}
                className={`border-l-4 ${config.leftBorderColor} rounded-lg py-2 px-3 bg-white shadow-sm border border-gray-200`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">
                    #{displayNumber}
                  </span>
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
                        {activity.type === TaskActivityType.ApprovalRequest &&
                          canApproveTask && (
                            <button
                              type="button"
                              onClick={() =>
                                setApprovingActivityId(activity._id)
                              }
                              disabled={statusLoading}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm bg-btnGreen text-white hover:bg-btnGreenHover focus:ring-2 focus:ring-green-300 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Одобри заявката и завърши задачата"
                            >
                              <HandThumbUpIcon className="h-3.5 w-3.5" />
                              Одобри
                            </button>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShowDate date={activity.createdAt} />
                        {/* ActionMenu with Edit/Delete */}
                        {canModify && (
                          <ActionMenu>
                            <button
                              onClick={() => handleStartEdit(activity)}
                              className="flex items-center gap-2 w-full p-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md cursor-pointer"
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

                    {/* Normal content display */}
                    <>
                        {overflowingActivities.has(activity._id) && (
                          <button
                            onClick={() => toggleExpand(activity._id)}
                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mb-1 cursor-pointer"
                          >
                            {isActivityExpanded(activity._id) ? (
                              <>Скрий <ChevronUpIcon className="h-3 w-3" /></>
                            ) : (
                              <>Покажи цялото съдържание <ChevronDownIcon className="h-3 w-3" /></>
                            )}
                          </button>
                        )}
                        <div
                          ref={(el) => {
                            if (el) contentRefs.current.set(activity._id, el);
                            else contentRefs.current.delete(activity._id);
                          }}
                          className={`text-sm text-gray-700 bg-gray-50 rounded p-2 break-words ${
                            isActivityExpanded(activity._id) ? "" : "max-h-40 overflow-y-auto"
                          } custom-scrollbar-xs`}
                        >
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
                  </div>
                </div>
              </div>
            );
          })}
          </>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={deletingActivityId !== null}
        onOpenChange={(open) => { if (!open) setDeletingActivityId(null); }}
        onConfirm={() => { if (deletingActivityId) handleDelete(deletingActivityId); }}
        title="Изтриване на запис"
        description="Сигурни ли сте, че искате да изтриете този запис? Това действие е необратимо."
        confirmButtonText="Изтрий"
        cancelButtonText="Отмени"
        isDestructiveAction
      />

      <ConfirmActionDialog
        isOpen={approvingActivityId !== null}
        onOpenChange={(open) => { if (!open) setApprovingActivityId(null); }}
        onConfirm={handleApprove}
        title="Одобряване на задача"
        description="Сигурни ли сте, че искате да одобрите тази заявка? Статусът на задачата ще бъде променен на „Завършена“."
        confirmButtonText="Одобри"
        cancelButtonText="Отмени"
      />

      {editingActivity && (
        <EditTaskActivityModal
          activity={editingActivity}
          taskId={taskId}
          mentions={mentions}
          isOpen={!!editingActivity}
          onOpenChange={(open) => { if (!open) setEditingActivity(null); }}
          onSaved={refetch}
        />
      )}
    </div>
  );
};

export default TaskActivities;
