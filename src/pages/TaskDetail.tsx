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
    <div className="h-[calc(100vh-6rem)] overflow-hidden bg-gray-100 flex flex-col">
      {/* Main content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left column - Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 overflow-y-auto space-y-4 pr-2 custom-scrollbar-xs">
            {/* Task Header Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Back link */}
              <Link
                to="/tasks"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Към задачите</span>
              </Link>

              {/* Task number & priority */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Задача #{taskData.taskNumber}
                </span>
                <TaskPriorityBadge priority={taskData.priority} />
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-gray-900 mb-3">
                {taskData.title}
              </h1>

              {/* Status row */}
              <div className="flex items-center gap-2 mb-3">
                <TaskStatusBadge status={taskData.status} size="md" />
                {canEdit && (
                  <TaskStatusChanger
                    taskId={taskData._id}
                    currentStatus={taskData.status}
                    onStatusChanged={refetch}
                  />
                )}
              </div>

              {/* Action buttons */}
              {canEdit && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
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

            {/* Task Description - Collapsible */}
            <TaskDescriptionCard description={taskData.description} />

            {/* Origin - Related Case */}
            {taskData.relatedCase && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Произход
                </h3>
                <div className="w-24">
                  <CaseLink my_case={taskData.relatedCase} t={t} />
                </div>
              </div>
            )}

            {/* People - Creator & Assignees */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Възложена от/на
              </h3>
              <dl className="space-y-3">
                {/* Creator */}
                <div>
                  <dt className="text-xs text-gray-400 mb-1">Създател</dt>
                  <dd>
                    <UserLink user={taskData.creator} />
                  </dd>
                </div>

                {/* Assignee */}
                <div>
                  <dt className="text-xs text-gray-400 mb-1">Възложена на</dt>
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

            {/* Dates Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <dl className="space-y-3">
                {/* Due Date */}
                <div>
                  <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Краен срок
                  </dt>
                  <dd>
                    <TaskDueDateIndicator
                      dueDate={taskData.dueDate}
                      status={taskData.status}
                      size="md"
                    />
                  </dd>
                </div>

                {/* Created At */}
                <div>
                  <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                    <ClockIcon className="h-4 w-4" />
                    Създадена на
                  </dt>
                  <dd className="text-sm text-gray-700">
                    {formatDateTime(taskData.createdAt)}
                  </dd>
                </div>

                {/* Completed At */}
                {taskData.completedAt && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                      <ClockIcon className="h-4 w-4" />
                      Завършена на
                    </dt>
                    <dd className="text-sm text-gray-700">
                      {formatDateTime(taskData.completedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Right column - Activity/Analysis (lg:col-span-8) */}
          <div className="lg:col-span-8 overflow-hidden flex flex-col">
            <div className="bg-white rounded-lg shadow-sm p-6 flex-1 flex flex-col overflow-hidden">
              {/* View Toggle */}
              <div className="flex items-center gap-1 mb-4 border-b border-gray-200 pb-3 flex-shrink-0">
                <button
                  onClick={() => setRightPanelView("activities")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    rightPanelView === "activities"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Работен Процес
                </button>
                <button
                  onClick={() => setRightPanelView("analysis")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    rightPanelView === "analysis"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  Анализи
                </button>
              </div>

              {/* Content based on selected view */}
              <div
                className={
                  rightPanelView === "activities"
                    ? "flex-1 flex flex-col min-h-0"
                    : "flex-1 overflow-y-auto custom-scrollbar-xs"
                }
              >
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
