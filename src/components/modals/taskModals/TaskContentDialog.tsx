import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { ITask } from "../../../db/interfaces";
import TaskPriorityBadge from "../../task/TaskPriorityBadge";
import TaskStatusPill from "../../task/TaskStatusPill";
import TaskDescriptionCard from "../../task/TaskDescriptionCard";
import CaseLink from "../../global/links/CaseLink";
import UserLink from "../../global/links/UserLink";
import UserAvatar from "../../cards/UserAvatar";
import ShowDate from "../../global/ShowDate";
import { getDueDateStatus } from "../../task/TaskDueDateIndicator";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import { endpoint } from "../../../db/config";

interface TaskContentDialogProps {
  taskData: ITask;
  refetch: () => void;
  canChangeStatus?: boolean;
}

const TaskContentDialog: React.FC<TaskContentDialogProps> = ({
  taskData,
  refetch,
  canChangeStatus = false,
}) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="hidden lg:flex p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition hover:cursor-pointer"
          type="button"
          title="Отвори задачата на цял екран"
          aria-label="Отвори на цял екран"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 inset-4 md:inset-12 lg:inset-24 bg-white rounded-lg shadow-2xl flex flex-col focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200 flex-shrink-0">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Задача #{taskData.taskNumber}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-800 focus:outline-none hover:cursor-pointer"
                aria-label="Затвори"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body — two columns like ContentDialog */}
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden p-4">
            {/* Left Column: Metadata */}
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar-xs pr-2">
              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900">
                {taskData.title}
              </h2>

              {/* Creator */}
              <div>
                <span className="text-xs text-gray-400">Възложена от:</span>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar
                    name={taskData.creator.name}
                    imageUrl={
                      taskData.creator.avatar
                        ? `${endpoint}/static/avatars/${taskData.creator._id}/${taskData.creator.avatar}`
                        : null
                    }
                    size={36}
                  />
                  <UserLink user={taskData.creator} />
                </div>
              </div>

              {/* Assignee */}
              <div>
                <span className="text-xs text-gray-400">Възложена на:</span>
                {taskData.assignee ? (
                  <div className="flex items-center gap-2 mt-1">
                    <UserAvatar
                      name={taskData.assignee.name}
                      imageUrl={
                        taskData.assignee.avatar
                          ? `${endpoint}/static/avatars/${taskData.assignee._id}/${taskData.assignee.avatar}`
                          : null
                      }
                      size={36}
                    />
                    <UserLink user={taskData.assignee} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-1">
                    Невъзложена
                  </p>
                )}
              </div>

              {/* Related Case */}
              {taskData.relatedCase && (
                <div>
                  <span className="text-xs text-gray-400">Произход:</span>
                  <div className="mt-1">
                    <CaseLink my_case={taskData.relatedCase} />
                  </div>
                </div>
              )}

              {/* Priority & Status */}
              <div className="flex flex-row justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-400">Приоритет:</span>
                  <div className="mt-1">
                    <TaskPriorityBadge
                      size="md"
                      priority={taskData.priority}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs text-gray-400">Статус:</span>
                  <div className="mt-1">
                    <TaskStatusPill
                      taskId={taskData._id}
                      currentStatus={taskData.status}
                      canChange={canChangeStatus}
                      onStatusChanged={refetch}
                    />
                  </div>
                </div>
              </div>

              {/* Due Date & Created Date */}
              <div className="flex flex-row justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-400">Краен срок:</span>
                  <div className="mt-1">
                    {taskData.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <ShowDate date={taskData.dueDate} />
                        {getDueDateStatus(
                          taskData.dueDate,
                          taskData.status
                        ) === "overdue" && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                        )}
                        {getDueDateStatus(
                          taskData.dueDate,
                          taskData.status
                        ) === "warning" && (
                          <ClockIcon className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Няма краен срок
                      </span>
                    )}
                  </div>
                </div>
                {taskData.createdAt && (
                  <div className="flex-1">
                    <span className="text-xs text-gray-400">Създадена:</span>
                    <div className="mt-1">
                      <ShowDate date={taskData.createdAt} />
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {taskData.attachments && taskData.attachments.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400">
                    Прикачени файлове:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {taskData.attachments.map((file: string) => (
                      <span
                        key={file}
                        className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Description */}
            <div className="flex-grow md:w-2/3 lg:w-3/4 flex flex-col gap-4 border-l border-gray-100 pl-6">
              <div className="text-sm font-semibold text-gray-400">
                Описание:
              </div>
              <div className="bg-gray-50 rounded-md p-4 mb-2 text-gray-900 overflow-y-auto custom-scrollbar-xs break-words flex-grow">
                <TaskDescriptionCard
                  description={taskData.description}
                  attachments={taskData.attachments}
                  taskId={taskData._id}
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskContentDialog;
