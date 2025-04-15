import React, { useState } from "react";
import {
  UsersIcon,
  PlusIcon,
  CheckIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  PlusIcon as PlusIconSolid,
  CheckIcon as CheckIconSolid,
  XMarkIcon as XMarkIconSolid,
} from "@heroicons/react/20/solid";

import CreateUserModal from "../components/modals/CreateUserModal";
import CreateUserFormModal from "../components/modals/CreateUserFormModal";

interface User {
  id: string;
  avatarInitial: string;
  username: string;
  name: string;
  position: string;
  email: string;
  isExpert: boolean;
  isAdmin: boolean;
}

const initialSampleUsers: User[] = [
  {
    id: "1",
    avatarInitial: "A",
    username: "admin",
    name: "Admin User",
    position: "Administrator",
    email: "admin@example.com",
    isExpert: true,
    isAdmin: true,
  },
  {
    id: "2",
    avatarInitial: "J",
    username: "jdoe",
    name: "John Doe",
    position: "Expert",
    email: "j.doe@example.com",
    isExpert: true,
    isAdmin: false,
  },
  {
    id: "3",
    avatarInitial: "S",
    username: "sara",
    name: "Sara Lee",
    position: "User",
    email: "s.lee@example.com",
    isExpert: false,
    isAdmin: false,
  },
];

const UserManagementPage: React.FC = () => {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialSampleUsers);

  // Modal Handlers
  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Form Submission Handler
  const handleFormSubmit = (formData: any, editingUserId: string | null) => {
    console.log("Handling submit for:", formData, "Editing ID:", editingUserId);
    if (editingUserId) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUserId
            ? {
                ...user,
                ...formData,
                id: user.id,
                avatarInitial: user.avatarInitial,
              }
            : user
        )
      );
      console.log("User updated");
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        avatarInitial: formData.username.charAt(0).toUpperCase() || "?",
        ...formData,
        name: formData.name || "N/A",
        username: formData.username || "newuser",
        position: formData.position || "",
        email: formData.email || "",
        isExpert: formData.isExpert || false,
        isAdmin: formData.isAdmin || false,
      };
      setUsers((prevUsers) => [...prevUsers, newUser]);
      console.log("User created");
    }
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <UsersIcon className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Брой потребители</p>
              <p className="text-2xl font-semibold text-gray-800">
                {users.length}
              </p>
            </div>
          </div>
          <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div className="w-[32px]"></div>
            <div>
              <p className="text-xs text-gray-500">Експерти</p>
              <p className="text-2xl font-semibold text-gray-800">
                {users.filter((u) => u.isExpert).length}
              </p>
            </div>
          </div>
          <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div className="w-[32px]"></div>
            <div>
              <p className="text-xs text-gray-500">Администратори</p>
              <p className="text-2xl font-semibold text-gray-800">
                {users.filter((u) => u.isAdmin).length}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <PlusIconSolid className="h-5 w-5" />
          Създай Потребител
        </button>
      </section>

      {/* Users Table Section */}
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <table className="w-full text-left text-sm">
          {/* Head */}
          <thead className="bg-gray-700 text-xs uppercase text-gray-300">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Аватар | Потребител
              </th>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Име
              </th>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Позиция
              </th>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Имейл
              </th>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Експерти
              </th>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Администратор
              </th>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Редактирай
              </th>
            </tr>
          </thead>
          {/* Body */}
          <tbody className="text-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 bg-white hover:bg-gray-50"
              >
                {/* Avatar/Username cell */}
                <td className="px-4 py-3 lg:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-600">
                      {user.avatarInitial}
                    </div>
                    <a
                      href="#"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {user.username}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 lg:px-6">{user.name}</td>
                <td className="px-4 py-3 lg:px-6">{user.position}</td>
                <td className="px-4 py-3 lg:px-6">{user.email}</td>
                <td className="px-4 py-3 text-center lg:px-6">
                  {user.isExpert ? (
                    <CheckIconSolid className="mx-auto h-5 w-5 text-green-500" />
                  ) : (
                    <XMarkIconSolid className="mx-auto h-5 w-5 text-red-500" />
                  )}
                </td>
                <td className="px-4 py-3 text-center lg:px-6">
                  {user.isAdmin ? (
                    <CheckIconSolid className="mx-auto h-5 w-5 text-green-500" />
                  ) : (
                    <XMarkIconSolid className="mx-auto h-5 w-5 text-red-500" />
                  )}
                </td>
                {/* Edit Button cell */}
                <td className="px-4 py-3 text-center lg:px-6">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Редактирай потребител ${user.username}`}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {/* No users row */}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Няма намерени потребители.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal Rendering */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Редактирай потребител" : "Създай нов потребител"}
      >
        <CreateUserFormModal
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          initialData={editingUser}
          submitButtonText={editingUser ? "Запази промените" : "Създай"}
        />
      </CreateUserModal>
    </div>
  );
};

export default UserManagementPage;
