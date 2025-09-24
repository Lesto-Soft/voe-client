import React, { useState, useMemo } from "react";
import { IUser } from "../../../db/interfaces";
import { BulkActionsModal } from "../../../components/modals/BulkActionsModal";
import { IndividualUserSettingsModal } from "../../../components/modals/IndividualUserSettingsModal";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

const BulkChangesSettings: React.FC = () => {
  const allUsers: IUser[] = [
    { _id: "1", name: "Иван Иванов", username: "ivan.i" },
    { _id: "2", name: "Мария Петрова", username: "maria.p" },
    { _id: "3", name: "Георги Димитров", username: "georgi.d" },
    { _id: "4", name: "Елена Тодорова", username: "elena.t" },
  ] as IUser[];

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Масови промени в настройки
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Изберете потребители, за да редактирате техните настройки, шаблони
            или права.
          </p>
        </div>
        <button
          onClick={() => setIsBulkModalOpen(true)}
          disabled={selectedUserIds.length === 0}
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Масови действия ({selectedUserIds.length})
        </button>
      </div>
      <hr className="my-4 border-gray-200" />

      <input
        type="text"
        placeholder="Търсене на потребители..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-md border-gray-300 mb-4"
      />

      <div className="max-h-96 overflow-y-auto rounded-xs">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-3 border-b border-b-gray-200 hover:bg-gray-50 last:border-b-0"
          >
            <label className="flex items-center gap-3 cursor-pointer flex-grow">
              <input
                type="checkbox"
                className="cursor-pointer h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                checked={selectedUserIds.includes(user._id)}
                onChange={() => handleSelectUser(user._id)}
              />
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </label>
            <button
              onClick={() => setUserToEdit(user)}
              className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title={`Редактирай настройките на ${user.name}`}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedUserIds={selectedUserIds}
      />

      {userToEdit && (
        <IndividualUserSettingsModal
          isOpen={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          user={userToEdit}
        />
      )}
    </div>
  );
};

export default BulkChangesSettings;
