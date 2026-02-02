import React from "react";
import { useParams, Link } from "react-router";
import { useGetTaskByNumber } from "../graphql/hooks/task";
import { useCurrentUser } from "../context/UserContext";
import { ITask } from "../db/interfaces";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import TaskStatusBadge from "../components/task/TaskStatusBadge";
import TaskPriorityBadge from "../components/task/TaskPriorityBadge";
import CaseLink from "../components/global/links/CaseLink";
import UserLink from "../components/global/links/UserLink";
import TaskStatusChanger from "../components/task/TaskStatusChanger";
import TaskActivities from "../components/task/TaskActivities";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

const TaskDetail: React.FC = () => {
  const { t } = useTranslation();
  const { taskNumber: taskNumberParam } = useParams<{ taskNumber: string }>();
  const currentUser = useCurrentUser();

  // Validate task number
  if (
    !taskNumberParam ||
    isNaN(parseInt(taskNumberParam, 10)) ||
    parseInt(taskNumberParam, 10) <= 0
  ) {
    return (
      <PageStatusDisplay
        notFound
        message={`Номерът на задачата "${taskNumberParam || ""}" липсва или е невалиден.`}
      />
    );
  }

  const numericTaskNumber = parseInt(taskNumberParam, 10);

  const { task, loading, error, refetch } = useGetTaskByNumber(numericTaskNumber);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не е зададен";
    return new Date(dateString).toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                <TaskStatusChanger
                  taskId={taskData._id}
                  currentStatus={taskData.status}
                  onStatusChanged={refetch}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                Описание
              </h2>
              {taskData.description ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: taskData.description }}
                />
              ) : (
                <p className="text-gray-500 italic">Няма описание.</p>
              )}
            </div>

            {/* Activities / Comments section */}
            <TaskActivities
              taskId={taskData._id}
              activities={taskData.activities || []}
              currentUser={currentUser}
              refetch={refetch}
            />
          </div>

          {/* Right column - Metadata sidebar */}
          <div className="space-y-6">
            {/* Details card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Детайли</h3>
              <dl className="space-y-4">
                {/* Related Case */}
                {taskData.relatedCase && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                      <LinkIcon className="h-4 w-4" />
                      Свързан сигнал
                    </dt>
                    <dd>
                      <div className="w-24">
                        <CaseLink my_case={taskData.relatedCase} t={t} />
                      </div>
                    </dd>
                  </div>
                )}

                {/* Due Date */}
                <div>
                  <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Краен срок
                  </dt>
                  <dd className="text-sm text-gray-900 font-medium">
                    {formatDate(taskData.dueDate)}
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

            {/* People card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Хора</h3>
              <dl className="space-y-4">
                {/* Creator */}
                <div>
                  <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-2">
                    <UserIcon className="h-4 w-4" />
                    Създател
                  </dt>
                  <dd>
                    <UserLink user={taskData.creator} />
                  </dd>
                </div>

                {/* Assignee */}
                <div>
                  <dt className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-2">
                    <UserIcon className="h-4 w-4" />
                    Възложена на
                  </dt>
                  <dd>
                    {taskData.assignee ? (
                      <UserLink user={taskData.assignee} />
                    ) : (
                      <span className="text-sm text-gray-500 italic">Невъзложена</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
