import React, { useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetTaskByNumber, useDeleteTask } from "../graphql/hooks/task";
import { useQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../graphql/query/user";
import { useCurrentUser } from "../context/UserContext";
import { useNotificationSubscription } from "../graphql/hooks/notificationHook";
import { ITask } from "../db/interfaces";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { useAuthorization } from "../hooks/useAuthorization";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import TaskPriorityBadge from "../components/task/TaskPriorityBadge";
import TaskStatusPill from "../components/task/TaskStatusPill";
import TaskActivities from "../components/task/TaskActivities";
import TaskFormModal from "../components/task/TaskFormModal";
import TaskAssigneeChanger from "../components/task/TaskAssigneeChanger";
import { getDueDateStatus } from "../components/task/TaskDueDateIndicator";
import TaskDescriptionCard from "../components/task/TaskDescriptionCard";
import AnalysisTabsSection from "../components/task/AnalysisTabsSection";
import CaseLink from "../components/global/links/CaseLink";
import UserLink from "../components/global/links/UserLink";
import UserAvatar from "../components/cards/UserAvatar";
import ShowDate from "../components/global/ShowDate";
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import { endpoint } from "../db/config";
import {
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import TaskAccessModal from "../components/task/TaskAccessModal";

const TaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { taskNumber: taskNumberParam } = useParams<{ taskNumber: string }>();
  const currentUser = useCurrentUser();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Right panel view toggle
  const [rightPanelView, setRightPanelView] = useState<
    "activities" | "analysis"
  >("activities");

  // Parse task number (0 if invalid - hook will skip)
  const numericTaskNumber =
    taskNumberParam && !isNaN(parseInt(taskNumberParam, 10))
      ? parseInt(taskNumberParam, 10)
      : 0;

  // All hooks must be called before any early returns
  const { task, loading, error, refetch } =
    useGetTaskByNumber(numericTaskNumber);
  const { deleteTask, loading: deleteLoading } = useDeleteTask({
    onCompleted: () => navigate("/tasks"),
  });

  // Access gate - must be called before early returns (hook rule)
  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "task",
    data: task as ITask | null,
  });

  // Fetch all users for mention suggestions in task activities
  const { data: leanUsersData } = useQuery(GET_LEAN_USERS);

  const mentions = useMemo(
    () =>
      (leanUsersData?.getLeanUsers || []).map(
        (u: { _id: string; name: string; username: string }) => ({
          _id: u._id,
          name: u.name,
          username: u.username,
        }),
      ),
    [leanUsersData],
  );

  // Real-time: silently refetch task data when a notification arrives for this task.
  // No navigation or disruption — the user stays where they are.
  // Highlighting only happens when the user clicks a notification from the bell icon.
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const handleNotification = useCallback(
    ({ data }: any) => {
      const notification = data.data?.notificationAdded;
      if (!notification || notification.taskNumber !== numericTaskNumber) return;
      refetchRef.current();
    },
    [numericTaskNumber],
  );

  useNotificationSubscription({
    variables: { userId: currentUser._id },
    onData: handleNotification,
  });

  // Now we can have early returns
  if (numericTaskNumber <= 0) {
    return (
      <PageStatusDisplay
        notFound
        message={`Номерът на задачата "${taskNumberParam || ""}" липсва или е невалиден.`}
      />
    );
  }

  if (error) {
    return <PageStatusDisplay error={error} />;
  }

  if (loading) {
    return <PageStatusDisplay loading message="Зареждане на задача..." />;
  }

  if (!task) {
    return (
      <PageStatusDisplay
        notFound
        message={`Не беше намерена задача с номер: "${numericTaskNumber}".`}
      />
    );
  }

  if (!authLoading && !isAllowed) {
    return <ForbiddenPage />;
  }

  const taskData = task as ITask;

  const handleDelete = async () => {
    try {
      await deleteTask(taskData._id);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const isAdmin = currentUser.role?._id === ROLES.ADMIN;
  const isCreator = currentUser._id === taskData.creator._id;

  // Only admins and task creators can edit/delete and change assignee
  const canEdit = isAdmin || isCreator;

  // Only admins and task creators can manually change status
  // Assignee changes status indirectly through activities (auto-transition)
  const canChangeStatus = isAdmin || isCreator;

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 lg:h-[calc(100vh-6rem)] w-full">
      {/* Left Panel - Task Info Sidebar (like CaseInfo) */}
      <div className="max-w-full lg:w-96 lg:shrink-0 order-1 lg:order-none lg:h-full">
        <div className="w-full h-full bg-white shadow-md overflow-y-auto custom-scrollbar-xs">
          <div className="p-4 flex flex-col gap-3">
            {/* Top row: Title + Action buttons */}
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-gray-900 flex-1">
                {taskData.title}
              </h1>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setIsAccessModalOpen(true)}
                    title="Управление на достъпа"
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  >
                    <LockClosedIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    title="Редактирай"
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    title="Изтрий"
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Task Description - always expanded, fixed-height container */}
            <div className="h-48">
              <TaskDescriptionCard
                description={taskData.description}
                attachments={taskData.attachments}
                taskId={taskData._id}
              />
            </div>

            {/* Origin - Related Case */}
            {taskData.relatedCase && (
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                  Произход:
                </h3>
                <CaseLink my_case={taskData.relatedCase} />
              </div>
            )}

            {/* People - Creator & Assignee (stacked with avatars) */}
            <div className="pt-2 border-t border-gray-100">
              <div className="space-y-3">
                {/* Creator */}
                <div>
                  <dt className="text-xs text-gray-400 mb-1">Възложена от:</dt>
                  <dd className="flex items-center gap-2">
                    <UserAvatar
                      name={taskData.creator.name}
                      imageUrl={
                        taskData.creator.avatar
                          ? `${endpoint}/static/avatars/${taskData.creator._id}/${taskData.creator.avatar}`
                          : null
                      }
                      size={32}
                    />
                    <UserLink user={taskData.creator} />
                  </dd>
                </div>

                {/* Assignee */}
                <div>
                  <dt className="text-xs text-gray-400 mb-1">Възложена на:</dt>
                  <dd>
                    {canEdit ? (
                      <TaskAssigneeChanger
                        taskId={taskData._id}
                        currentAssignee={taskData.assignee}
                        onAssigneeChanged={refetch}
                      />
                    ) : taskData.assignee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={taskData.assignee.name}
                          imageUrl={
                            taskData.assignee.avatar
                              ? `${endpoint}/static/avatars/${taskData.assignee._id}/${taskData.assignee.avatar}`
                              : null
                          }
                          size={32}
                        />
                        <UserLink user={taskData.assignee} />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Невъзложена
                      </span>
                    )}
                  </dd>
                </div>
              </div>
            </div>

            {/* Priority & Status */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[120px]">
                  <dt className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    Приоритет:
                  </dt>
                  <dd>
                    <TaskPriorityBadge size="md" priority={taskData.priority} />
                  </dd>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <dt className="text-xs text-gray-400 mb-1">Статус:</dt>
                  <dd>
                    <TaskStatusPill
                      taskId={taskData._id}
                      currentStatus={taskData.status}
                      canChange={canChangeStatus}
                      onStatusChanged={refetch}
                    />
                  </dd>
                </div>
              </div>
            </div>

            {/* Dates (due date first, then created) */}
            <div className="pt-2 border-t border-gray-100">
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                    Краен срок:
                  </dt>
                  <dd>
                    {taskData.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <ShowDate date={taskData.dueDate} />
                        {getDueDateStatus(taskData.dueDate, taskData.status) ===
                          "overdue" && (
                          <span title="Просрочена задача">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                          </span>
                        )}
                        {getDueDateStatus(taskData.dueDate, taskData.status) ===
                          "warning" && (
                          <span title="Краен срок наближава">
                            <ClockIcon className="h-4 w-4 text-amber-500" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Няма краен срок
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                    Създадена на:
                  </dt>
                  <dd>
                    {taskData.createdAt && (
                      <ShowDate date={taskData.createdAt} />
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Activity/Analysis (like Submenu) */}
      <div className="w-full lg:flex-1 lg:w-auto order-2 lg:order-none lg:h-full">
        <div className="flex flex-col lg:h-full bg-white shadow-md">
          {/* Sticky Tab Bar */}
          <div className="flex-shrink-0 sticky top-0 z-1 bg-white border-b border-gray-200">
            <div className="flex justify-center gap-2 py-3">
              <button
                onClick={() => setRightPanelView("activities")}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-150 border cursor-pointer ${
                  rightPanelView === "activities"
                    ? "border-blue-500 text-blue-600 shadow bg-blue-50"
                    : "border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Работен Процес
                <sup className="ml-1">{taskData.activities?.length || 0}</sup>
              </button>
              <button
                onClick={() => setRightPanelView("analysis")}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-150 border cursor-pointer ${
                  rightPanelView === "analysis"
                    ? "border-blue-500 text-blue-600 shadow bg-blue-50"
                    : "border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <BeakerIcon className="h-5 w-5 mr-2" />
                Анализи
                <sup className="ml-1">
                  {(taskData.fiveWhys?.length || 0) +
                    (taskData.riskAssessments?.length || 0)}
                </sup>
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="lg:flex-grow lg:min-h-0 lg:relative">
            <div className="lg:absolute lg:inset-0 lg:overflow-y-auto custom-scrollbar-xs">
              {rightPanelView === "activities" ? (
                <TaskActivities
                  taskId={taskData._id}
                  activities={taskData.activities || []}
                  currentUser={currentUser}
                  refetch={refetch}
                  mentions={mentions}
                />
              ) : (
                <AnalysisTabsSection
                  taskId={taskData._id}
                  fiveWhys={taskData.fiveWhys || []}
                  riskAssessments={taskData.riskAssessments || []}
                  currentUser={currentUser}
                  refetch={refetch}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <TaskFormModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        task={taskData}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Изтриване на задача"
        description={
          <>
            Сигурни ли сте, че искате да изтриете задача{" "}
            <strong>
              #{taskData.taskNumber}: {taskData.title}
            </strong>
            ?
            <br />
            <span className="text-red-600">Това действие е необратимо.</span>
          </>
        }
        confirmButtonText={deleteLoading ? "Изтриване..." : "Изтрий"}
        cancelButtonText="Отмени"
        isDestructiveAction
      />

      {/* Access Management Modal */}
      <TaskAccessModal
        isOpen={isAccessModalOpen}
        onOpenChange={setIsAccessModalOpen}
        taskId={taskData._id}
        canAccessUsers={taskData.canAccessUsers || []}
        assigneeId={taskData.assignee?._id}
        creatorId={taskData.creator._id}
        onAccessChanged={refetch}
      />
    </div>
  );
};

export default TaskDetail;
