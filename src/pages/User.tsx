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

import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ForbiddenPage";

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
  // 1. Fetch data
  const {
    loading: userLoading,
    error: userError,
    user,
    refetch: refetchUser, // <-- Get refetch function
  } = useGetFullUserByUsername(userUsernameFromParams);

  // 2. Call the authorization hook with the fetched data
  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "user",
    data: user,
  });

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
      expert_categories: formData.expert_categories,
      managed_categories: formData.managed_categories,
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
      // --- MODIFIED ORDER ---
      // 1. Close the form modal immediately
      closeEditModal();
      // 2. Show the success message immediately
      setSuccessModalMessage("Потребителят е редактиран успешно!");
      setIsSuccessModalOpen(true);
      // 3. Update avatar version and refetch data in the background
      setAvatarVersion(Date.now());
      refetchUser();
    } catch (err: any) {
      console.error("Error during user update:", err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const message =
        graphQLError || networkError || err.message || "Неизвестна грешка";
      alert(`Грешка при редактиране: ${message}`);
    }
  };

  // 3. Handle all loading, error, and not found states
  if (userUsernameFromParams === undefined) {
    return (
      <PageStatusDisplay
        notFound
        message="Потребителското име не беше намерено в адреса."
      />
    );
  }

  if (userLoading || authLoading) {
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на потребителски данни..."
      />
    );
  }

  if (userError) {
    return <PageStatusDisplay error={userError} />;
  }

  if (!user) {
    return (
      <PageStatusDisplay
        notFound
        message={`Потребител с потребителско име: '${userUsernameFromParams}' не е намерен.`}
      />
    );
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  // 4. Handle forbidden access
  if (!isAllowed) {
    return <ForbiddenPage />;
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
  const isSelf = currentUser?._id === user?._id;
  const canEdit =
    isAdmin ||
    (isManagerForCategory && user?.role?._id !== ROLES.ADMIN) || // up to us if we want to allow non-admin (manager) users to edit admins
    isSelf;

  return (
    <>
      <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          <UserInformationPanel
            user={user}
            isLoading={userLoading && !!user}
            serverBaseUrl={serverBaseUrl}
            onEditUser={openEditModal} // <-- Pass handler
            // Pass calculated permission
            canEdit={canEdit}
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
        {updateLoading && (
          <div
            className="flex items-center justify-center p-4 text-center"
            style={{ minHeight: "450px" }}
          >
            Изпращане...
          </div>
        )}
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
