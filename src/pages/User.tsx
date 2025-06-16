import React, { useState } from "react";
import { useParams } from "react-router";
import {
  useGetFullUserByUsername,
  useUpdateUser, // <-- Import hook for updating
} from "../graphql/hooks/user";
import { useGetRoles } from "../graphql/hooks/role"; // <-- Import hook for roles
import { IUser, IMe } from "../db/interfaces";
import { AttachmentInput, UpdateUserInput } from "../graphql/mutation/user";

// Hooks
import useUserActivityStats from "../hooks/useUserActivityStats";
import { useCurrentUser } from "../context/UserContext"; // <-- Import current user hook

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import UserInformationPanel from "../components/features/userAnalytics/UserInformationPanel";
import UserActivityList from "../components/features/userAnalytics/UserActivityList";
import UserStatisticsPanel from "../components/features/userAnalytics/UserStatisticsPanel";
import UserModal from "../components/modals/UserModal"; // <-- Use renamed modal
import UserForm from "../components/forms/UserForm"; // <-- Use renamed form
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Constants
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { containsAnyCategoryById } from "../utils/arrayUtils";

const User: React.FC = () => {
  const { username: userUsernameFromParams } = useParams<{
    username: string;
  }>();

  // --- NEW: State for Modals and Data ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const currentUser = useCurrentUser() as IMe | undefined;

  // --- GraphQL Hooks ---
  const {
    loading: userLoading,
    error: userError,
    user,
    refetch: refetchUser, // <-- Get refetch function
  } = useGetFullUserByUsername(userUsernameFromParams);

  const {
    updateUser,
    loading: updateLoading,
    error: updateError,
  } = useUpdateUser();

  const {
    roles: rolesData,
    loading: rolesLoading,
    error: rolesError,
  } = useGetRoles();

  const userStats = useUserActivityStats(
    user,
    dateRange.startDate,
    dateRange.endDate
  );

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- NEW: Edit Modal Handlers ---
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  // --- NEW: Form Submit Handler ---
  const handleFormSubmit = async (
    formData: any,
    editingUserId: string | null,
    avatarData: AttachmentInput | null | undefined
  ) => {
    if (!editingUserId) return; // Should not happen in this context

    const finalInput: Partial<UpdateUserInput> = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      position: formData.position,
      role: formData.role,
      financial_approver: formData.financial_approver,
      ...(formData.password && { password: formData.password }),
      ...(avatarData !== undefined && { avatar: avatarData }),
    };

    // Clean up undefined values
    Object.keys(finalInput).forEach((key) => {
      if (finalInput[key as keyof typeof finalInput] === undefined)
        delete finalInput[key as keyof typeof finalInput];
    });

    try {
      await updateUser(editingUserId, finalInput as UpdateUserInput);
      await refetchUser(); // Refetch user data to show changes
      setAvatarVersion(Date.now()); // Force avatar refresh
      closeEditModal();

      setSuccessModalMessage("Потребителят е редактиран успешно!");
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Error during user update:", err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const message =
        graphQLError || networkError || err.message || "Неизвестна грешка";
      alert(`Грешка при редактиране: ${message}`);
    }
  };

  if (userUsernameFromParams === undefined) {
    return (
      <PageStatusDisplay
        notFound
        message="User Username не е намерен в URL адреса."
        height="h-screen"
      />
    );
  }

  if (userLoading && !user) {
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на потребителски данни..."
        height="h-[calc(100vh-6rem)]"
      />
    );
  }

  if (userError) {
    return (
      <PageStatusDisplay
        error={{ message: userError.message }}
        message={`Грешка при зареждане на потребител с ID: ${userUsernameFromParams}.`}
        height="h-[calc(100vh-6rem)]"
      />
    );
  }

  if (!user) {
    return (
      <PageStatusDisplay
        notFound
        message={`Потребител с Username: ${userUsernameFromParams} не е намерен.`}
        height="h-[calc(100vh-6rem)]"
      />
    );
  }

  const activityCounts = {
    cases: userStats?.totalSignals || 0,
    answers: userStats?.totalAnswers || 0,
    comments: userStats?.totalComments || 0,
    all:
      (userStats?.totalSignals || 0) +
      (userStats?.totalAnswers || 0) +
      (userStats?.totalComments || 0),
  };

  const isAdmin = currentUser?.role._id === ROLES.ADMIN;
  const isManagerForCategory =
    currentUser?.role?._id === ROLES.EXPERT &&
    (containsAnyCategoryById(
      currentUser?.managed_categories || [],
      user?.expert_categories || []
    ) ||
      containsAnyCategoryById(
        currentUser?.managed_categories || [],
        user?.managed_categories || []
      ));

  return (
    <>
      <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          <UserInformationPanel
            user={user}
            isLoading={userLoading && !!user}
            serverBaseUrl={serverBaseUrl}
            onEditUser={openEditModal} // <-- Pass handler
          />

          <UserActivityList
            user={user}
            isLoading={userLoading && !!user}
            counts={activityCounts}
            userId={userUsernameFromParams}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          <UserStatisticsPanel
            userStats={userStats}
            userName={user.name}
            isLoading={userLoading && !!user}
          />
        </div>
      </div>

      {/* --- NEW: Render Modal for Editing --- */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Редактирай потребител"
      >
        {updateLoading && <div className="p-4 text-center">Изпращане...</div>}
        {updateError && !updateLoading && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис: {updateError?.message || "Неизвестна грешка"}
          </div>
        )}
        {!updateLoading && (
          <UserForm
            key={user._id} // Use user ID as key to re-mount on user change
            onSubmit={handleFormSubmit}
            onClose={closeEditModal}
            initialData={user}
            submitButtonText={"Запази"}
            roles={rolesData?.getAllLeanRoles || []}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
            isAdmin={isAdmin || isManagerForCategory} // <-- Pass permission flag
          />
        )}
      </UserModal>

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </>
  );
};

export default User;
