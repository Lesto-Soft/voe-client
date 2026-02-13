import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { IUser } from "../../db/interfaces";
import { useRevokeTaskAccess } from "../../graphql/hooks/task";
import UserAvatar from "../cards/UserAvatar";
import UserLink from "../global/links/UserLink";
import { endpoint } from "../../db/config";

interface TaskAccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  canAccessUsers: IUser[];
  assigneeId?: string;
  creatorId: string;
  onAccessChanged: () => void;
}

const TaskAccessModal: React.FC<TaskAccessModalProps> = ({
  isOpen,
  onOpenChange,
  taskId,
  canAccessUsers,
  assigneeId,
  creatorId,
  onAccessChanged,
}) => {
  const { revokeTaskAccess, loading } = useRevokeTaskAccess(taskId);

  const handleRevoke = async (userId: string) => {
    try {
      await revokeTaskAccess(userId);
      onAccessChanged();
    } catch (err) {
      console.error("Failed to revoke access:", err);
    }
  };

  // Determine role label for each user
  const getUserRole = (userId: string): string | null => {
    if (userId === creatorId) return "Създател";
    if (userId === assigneeId) return "Възложен";
    return null;
  };

  // Can the user be removed? (not assignee, not creator)
  const canRemove = (userId: string): boolean => {
    return userId !== creatorId && userId !== assigneeId;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <LockClosedIcon className="h-5 w-5 text-gray-600" />
              Достъп до задачата
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-xs p-4">
            {canAccessUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Няма потребители с достъп
              </p>
            ) : (
              <div className="space-y-2">
                {canAccessUsers.map((user) => {
                  const role = getUserRole(user._id);
                  const removable = canRemove(user._id);

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={user.name}
                          imageUrl={
                            user.avatar
                              ? `${endpoint}/static/avatars/${user._id}/${user.avatar}`
                              : null
                          }
                          size={36}
                        />
                        <div className="min-w-0">
                          <UserLink user={user} />
                          {role && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {role}
                            </span>
                          )}
                        </div>
                      </div>

                      {removable ? (
                        <button
                          onClick={() => handleRevoke(user._id)}
                          disabled={loading}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Премахни достъп"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="flex-shrink-0 w-7" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3">
            <p className="text-xs text-gray-500">
              Създателят и възложеният не могат да бъдат премахнати. Достъп се
              добавя автоматично при споменаване или преназначаване.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskAccessModal;
