import React, { useState, useEffect } from "react";
import { UsersIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import { useGetUsers } from "../graphql/hooks/user";
import { useCreateUser, useUpdateUser } from "../graphql/hooks/user";
import { CreateUserInput, UpdateUserInput } from "../graphql/mutation/user";
import CreateUserModal from "../components/modals/CreateUserModal";
import CreateUserFormModal from "../components/modals/CreateUserFormModal";

interface Role {
  __typename?: "Role";
  name: string;
  _id: string;
}
interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
  role: Role;
}

const UserManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchQuery] = useState("");
  const {
    users: usersData,
    error: usersError,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsers(searchQuery, itemsPerPage, currentPage);
  const {
    createUser,
    loading: createLoading,
    error: createError,
  } = useCreateUser();
  const {
    updateUser,
    loading: updateLoading,
    error: updateError,
  } = useUpdateUser();
  const users: User[] = usersData?.getAllUsers || [];

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

  // --- Form Submission Handler ---
  const handleFormSubmit = async (
    formData: any,
    editingUserId: string | null
  ) => {
    console.log("Handling submit for:", formData, "Editing ID:", editingUserId);

    try {
      if (editingUserId) {
        const finalInput: UpdateUserInput = { ...formData };
        await updateUser(editingUserId, finalInput);
        console.log("User updated successfully.");
      } else {
        const finalInput: CreateUserInput = {
          ...formData,
          password: formData.password!,
        };
        await createUser(finalInput);
        console.log("User created successfully.");
      }

      await refetchUsers();
      console.log("User list refetched.");
      closeModal();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      alert(
        `Грешка при ${
          editingUserId ? "редактиране" : "създаване"
        } на потребител: ${err?.message || "Неизвестна грешка"}`
      );
    }
  };

  // --- Render Loading/Error States ---
  if (usersLoading)
    return <div className="p-6">Зареждане на потребители...</div>;
  if (usersError)
    return (
      <div className="p-6 text-red-600">
        Грешка при зареждане: {usersError.message}
      </div>
    );
  if (createLoading || updateLoading)
    return <div className="p-6">Изпращане на данни...</div>;
  if (createError || updateError)
    return (
      <div className="p-6 text-red-600">
        Грешка при създаване/редактиране:{" "}
        {createError?.message || updateError?.message}
      </div>
    );

  // --- Calculate Stats ---
  const totalUsers = users.length;
  const expertCount = users.filter((u) => u.role?.name === "експерт").length;
  const adminCount = users.filter((u) => u.role?.name === "админ").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        {/* Stats Cards - Updated counts */}
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <UsersIcon className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Брой потребители</p>
              <p className="text-2xl font-semibold text-gray-800">
                {totalUsers}
              </p>
            </div>
          </div>
          <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div className="w-[32px]"></div>
            <div>
              <p className="text-xs text-gray-500">Експерти</p>
              <p className="text-2xl font-semibold text-gray-800">
                {expertCount}
              </p>
            </div>
          </div>
          <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div className="w-[32px]"></div>
            <div>
              <p className="text-xs text-gray-500">Администратори</p>
              <p className="text-2xl font-semibold text-gray-800">
                {adminCount}
              </p>
            </div>
          </div>
        </div>

        {/* Create User Button */}
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
          <thead className="bg-gray-700 text-xs uppercase text-gray-300">
            <tr>
              <th
                scope="col"
                className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
              >
                Потребителско име
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
                Редактирай
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 bg-white hover:bg-gray-50"
              >
                <td className="px-4 py-3 lg:px-6">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {user.username}
                  </a>
                </td>
                <td className="px-4 py-3 lg:px-6">{user.name}</td>
                <td className="px-4 py-3 lg:px-6">{user.position}</td>
                <td className="px-4 py-3 lg:px-6">{user.email}</td>
                <td className="px-4 py-3 text-center lg:px-6">
                  <button
                    onClick={() => openEditModal(user)} // Pass the full user object
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Редактирай потребител ${user.username}`}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Няма намерени потребители.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal Rendering (Passes correct data) */}
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
