import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { IUser, ITaskReadBy } from "../../db/interfaces";
import { useRevokeTaskAccess } from "../../graphql/hooks/task";
import UserAvatar from "../cards/UserAvatar";
import UserLink from "../global/links/UserLink";
import ShowDate from "../global/ShowDate";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import { endpoint } from "../../db/config";

interface TaskAccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  canAccessUsers: IUser[];
  readBy?: ITaskReadBy[];
  assigneeId?: string;
  creatorId: string;
  onAccessChanged: () => void;
}

const TaskAccessModal: React.FC<TaskAccessModalProps> = ({
  isOpen,
  onOpenChange,
  taskId,
  canAccessUsers,
  readBy = [],
  assigneeId,
  creatorId,
  onAccessChanged,
}) => {
  const { revokeTaskAccess, loading } = useRevokeTaskAccess(taskId);
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);

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
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[70vh] flex flex-col">
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left font-medium pb-2 pl-2">
                      Потребител
                    </th>
                    <th className="text-left font-medium pb-2">Роля</th>
                    <th className="text-left font-medium pb-2 w-44">Първо</th>
                    <th className="text-left font-medium pb-2 w-44">
                      Последно
                    </th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {canAccessUsers.map((user) => {
                    const role = getUserRole(user._id);
                    const removable = canRemove(user._id);
                    const readEntry = readBy.find(
                      (entry) => entry.user._id === user._id,
                    );

                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="py-2 pl-2 pr-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                              <UserAvatar
                                name={user.name}
                                imageUrl={
                                  user.avatar
                                    ? `${endpoint}/static/avatars/${user._id}/${user.avatar}`
                                    : null
                                }
                                size={36}
                              />
                            </div>
                            <div className="min-w-0">
                              <UserLink user={user} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {role ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {role}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {readEntry?.date ? (
                            <ShowDate date={readEntry.date} />
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {readEntry?.lastReadAt ? (
                            <ShowDate date={readEntry.lastReadAt} />
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {removable && (
                            <button
                              onClick={() => setRevokingUserId(user._id)}
                              disabled={loading}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Премахни достъп"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer info */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3">
            <p className="text-xs text-gray-500">
              Създателят и възложеният не могат да бъдат премахнати. Достъп се
              добавя автоматично при споменаване или преназначаване.
            </p>
          </div>

          <ConfirmActionDialog
            isOpen={revokingUserId !== null}
            onOpenChange={(open) => { if (!open) setRevokingUserId(null); }}
            onConfirm={() => { if (revokingUserId) { handleRevoke(revokingUserId); setRevokingUserId(null); } }}
            title="Премахване на достъп"
            description="Сигурни ли сте, че искате да премахнете достъпа на този потребител до задачата?"
            confirmButtonText="Премахни"
            cancelButtonText="Отмени"
            isDestructiveAction
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskAccessModal;
