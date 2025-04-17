import React, { useState, useEffect, useRef } from "react";
import { UsersIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useCountUsers,
} from "../graphql/hooks/user";
import { CreateUserInput, UpdateUserInput } from "../graphql/mutation/user";
import CreateUserModal from "../components/modals/CreateUserModal";
import CreateUserFormModal from "../components/modals/CreateUserFormModal";
import { useGetRoles } from "../graphql/hooks/role";
import StatCard from "../components/cards/StatCard";

export interface Role {
  __typename?: "Role";
  _id: string;
  name: string;
  users: any[];
}
interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

const UserManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage] = useState(0);
  const [itemsPerPage] = useState(50);
  const [searchQuery] = useState("");
  const {
    users: usersData,
    error: usersError,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsers(searchQuery, itemsPerPage, currentPage);
  const {
    count: userCount,
    error: userCountError,
    loading: userCountLoading,
    refetch,
  } = useCountUsers();
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
  const {
    roles: rolesData,
    error: rolesError,
    loading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRoles();
  const users: User[] = usersData?.getAllUsers || []; // Extract users from the hook's data
  const roles: Role[] = rolesData?.getAllLeanRoles || []; // Extract roles from the hook's data
  // const users: User[] = usersData?.getAllUsers || [];
  // console.log("Users:", users);
  // const roles: Role[] = rolesData?.getAllLeanRoles || []; // Extract roles from the hook's data
  // console.log("Roles:", roles);

  const getInitials = (name: string): string => {
    const names = name.split(" ");
    let initials = "";
    if (names.length > 0 && names[0]) {
      initials += names[0].charAt(0).toUpperCase();
    }
    if (names.length > 1 && names[1]) {
      initials += names[1].charAt(0).toUpperCase();
    }
    return initials;
  };

  const capitalizeFirstLetter = (str: string | undefined): string => {
    if (!str) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
  if (userCountLoading)
    return <div className="p-6">Зареждане на брой потребители...</div>;
  if (userCountError)
    return (
      <div className="p-6 text-red-600">
        Грешка при зареждане: {userCountError.message}
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          {/* Stats Cards - Updated counts */}
          <StatCard amount={userCount} title="Общо потребители" />
          {roles.map((role) => (
            <StatCard
              key={role._id}
              amount={role.users?.length || 0}
              title={capitalizeFirstLetter(role?.name)}
            />
          ))}
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
                Аватар
              </th>
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
                Роля
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
                  {/* Avatar Image (if a valid one exists) OR div if it doesn't */}
                  {user.avatar ? (
                    <span className="relative block h-8 w-8 rounded-full overflow-hidden">
                      <img
                        src={user.avatar}
                        alt={user.name + "'s avatar"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          const initials = getInitials(user.name);
                          const placeholderDiv = document.createElement("div");
                          placeholderDiv.className =
                            "absolute inset-0 bg-gray-300 flex items-center justify-center text-white font-semibold";
                          placeholderDiv.textContent = initials;
                          // placeholderDiv.id = "avatar-div-" + user.avatar;
                          imgElement.parentNode?.replaceChild(
                            placeholderDiv,
                            imgElement
                          );
                        }}
                      />
                    </span>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </td>
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
                <td className="px-4 py-3 lg:px-6">
                  {capitalizeFirstLetter(user.role?.name)}
                </td>

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
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Няма намерени потребители.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

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
          roles={roles} // Pass the fetched roles to the form
          rolesLoading={rolesLoading} // Optionally pass loading state
          rolesError={rolesError} // Optionally pass error state
        />
      </CreateUserModal>
    </div>
  );
};

export default UserManagementPage;
