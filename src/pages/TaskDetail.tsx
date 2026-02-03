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
} from "@heroicons/react/24/outline";

const TaskDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskNumber: taskNumberParam } = useParams<{ taskNumber: string }>();
  const currentUser = useCurrentUser();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Parse task number (0 if invalid - hook will skip)
  const numericTaskNumber =
    taskNumberParam && !isNaN(parseInt(taskNumberParam, 10))
      ? parseInt(taskNumberParam, 10)
      : 0;

  // All hooks must be called before any early returns
  const { task, loading, error, refetch } = useGetTaskByNumber(numericTaskNumber);
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
    <div className="min-h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/tasks"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Обратно към задачите</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Задача #{taskData.taskNumber}
                </span>
                <TaskPriorityBadge priority={taskData.priority} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{taskData.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <TaskStatusBadge status={taskData.status} size="md" />
              {canEdit && (
                <>
                  <TaskStatusChanger
                    taskId={taskData._id}
                    currentStatus={taskData.status}
                    onStatusChanged={refetch}
                  />
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Редактирай
                  </button>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Изтрий
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
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
                      <span className="text-sm text-gray-500 italic">Невъзложена</span>
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

            {/* Analysis Tabs Section */}
            <AnalysisTabsSection
              taskId={taskData._id}
              fiveWhys={taskData.fiveWhys || []}
              riskAssessments={taskData.riskAssessments || []}
              currentUser={currentUser}
              refetch={refetch}
            />
          </div>

          {/* Right column - Activity (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                Работен Процес
              </h2>

              {/* Activities / Comments section */}
              <TaskActivities
                taskId={taskData._id}
                activities={taskData.activities || []}
                currentUser={currentUser}
                refetch={refetch}
              />
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
            <strong>#{taskData.taskNumber}: {taskData.title}</strong>?
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
