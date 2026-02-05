import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useGetTaskByNumber, useDeleteTask } from "../graphql/hooks/task";
import { useCurrentUser } from "../context/UserContext";
import { ITask } from "../db/interfaces";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import TaskStatusBadge from "../components/task/TaskStatusBadge";
import TaskPriorityBadge from "../components/task/TaskPriorityBadge";
import TaskStatusChanger from "../components/task/TaskStatusChanger";
import TaskActivities from "../components/task/TaskActivities";
import TaskFormModal from "../components/task/TaskFormModal";
import TaskAssigneeChanger from "../components/task/TaskAssigneeChanger";
import TaskDueDateIndicator from "../components/task/TaskDueDateIndicator";
import TaskDescriptionCard from "../components/task/TaskDescriptionCard";
import AnalysisTabsSection from "../components/task/AnalysisTabsSection";
import CaseLink from "../components/global/links/CaseLink";
import UserLink from "../components/global/links/UserLink";
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const TaskDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskNumber: taskNumberParam } = useParams<{ taskNumber: string }>();
  const currentUser = useCurrentUser();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const taskData = task as ITask;

  const handleDelete = async () => {
    try {
      await deleteTask(taskData._id);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
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

  // Check if current user can edit the task
  const canEdit =
    currentUser._id === taskData.creator._id ||
    currentUser._id === taskData.assignee?._id ||
    currentUser.role?._id === "ADMIN";

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 lg:h-[calc(100vh-6rem)] w-full">
      {/* Left Panel - Task Info Sidebar (like CaseInfo) */}
      <div className="max-w-full lg:w-96 lg:shrink-0 order-1 lg:order-none lg:h-full">
        <div className="w-full h-full bg-white shadow-md overflow-y-auto custom-scrollbar-xs">
          <div className="p-4 flex flex-col gap-3">
            {/* Back link */}
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Към задачите</span>
            </Link>

            {/* Task number, priority & status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                Задача #{taskData.taskNumber}
              </span>
              <TaskPriorityBadge priority={taskData.priority} />
              <TaskStatusBadge status={taskData.status} size="md" />
              {canEdit && (
                <TaskStatusChanger
                  taskId={taskData._id}
                  currentStatus={taskData.status}
                  onStatusChanged={refetch}
                />
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900">
              {taskData.title}
            </h1>

            {/* Task Description - Collapsible */}
            <TaskDescriptionCard description={taskData.description} />

            {/* Origin - Related Case */}
            {taskData.relatedCase && (
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Произход
                </h3>
                <CaseLink my_case={taskData.relatedCase} t={t} />
              </div>
            )}

            {/* People - Creator & Assignee */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                Възложена от/на
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-gray-400 mb-0.5">Създател</dt>
                  <dd>
                    <UserLink user={taskData.creator} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 mb-0.5">Възложена на</dt>
                  <dd>
                    {canEdit ? (
                      <TaskAssigneeChanger
                        taskId={taskData._id}
                        currentAssignee={taskData.assignee}
                        onAssigneeChanged={refetch}
                      />
                    ) : taskData.assignee ? (
                      <UserLink user={taskData.assignee} />
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Невъзложена
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Dates */}
            <div className="pt-2 border-t border-gray-100">
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Краен срок
                  </dt>
                  <dd>
                    <TaskDueDateIndicator
                      dueDate={taskData.dueDate}
                      status={taskData.status}
                      size="sm"
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Създадена
                  </dt>
                  <dd className="text-sm text-gray-700">
                    {formatDateTime(taskData.createdAt)}
                  </dd>
                </div>
                {taskData.completedAt && (
                  <div className="col-span-2">
                    <dt className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Завършена на
                    </dt>
                    <dd className="text-sm text-gray-700">
                      {formatDateTime(taskData.completedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Action buttons */}
            {canEdit && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <PencilIcon className="h-4 w-4" />
                  Редактирай
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <TrashIcon className="h-4 w-4" />
                  Изтрий
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Activity/Analysis (like Submenu) */}
      <div className="w-full lg:flex-1 lg:w-auto order-2 lg:order-none lg:h-full">
        <div className="flex flex-col lg:h-full">
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
                <ChartBarIcon className="h-5 w-5 mr-2" />
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
            <div className="p-4 lg:absolute lg:inset-0 lg:overflow-y-auto custom-scrollbar-xs">
              {rightPanelView === "activities" ? (
                <TaskActivities
                  taskId={taskData._id}
                  activities={taskData.activities || []}
                  currentUser={currentUser}
                  refetch={refetch}
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
    </div>
  );
};

export default TaskDetail;
