import React, { useState, useMemo } from "react"; // Added useMemo to import
import { useParams } from "react-router";
import { useGetFullUserByUsername, useUpdateUser } from "../graphql/hooks/user";
import { useGetRoles } from "../graphql/hooks/role";
import { IMe } from "../db/interfaces";
import { UpdateUserInput } from "../graphql/mutation/user";

// Hooks
import useUserActivityStats from "../hooks/useUserActivityStats";
import { useCurrentUser } from "../context/UserContext";

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import UserInformationPanel from "../components/features/userAnalytics/UserInformationPanel";
import UserActivityList from "../components/features/userAnalytics/UserActivityList";
import UserStatisticsPanel from "../components/features/userAnalytics/UserStatisticsPanel";
import UserModal from "../components/modals/UserModal";
import UserForm from "../components/forms/UserForm";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";
import { useNavigate } from "react-router";
// Constants
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { containsAnyCategoryById } from "../utils/arrayUtils";

import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";

const User: React.FC = () => {
  const navigate = useNavigate();
  const { username: userUsernameFromParams } = useParams<{
    username: string;
  }>();

  // --- State and Other Hooks ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
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
    refetch: refetchUser,
  } = useGetFullUserByUsername(userUsernameFromParams);

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

  // --- MODIFIED: This calculation now respects the date range ---
  const ratedCasesCount = useMemo(() => {
    console.log("Metric Scores: ", user?.metricScores);
    if (!user?.metricScores) return 0;
    const isInDateRange = (itemDateStr: string) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const itemDate = new Date(itemDateStr);
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    };
    const filteredScores = user.metricScores.filter((score) =>
      isInDateRange(score.date)
    );
    const ratedCaseIds = new Set(filteredScores.map((score) => score.case._id));
    return ratedCaseIds.size;
  }, [user, dateRange]);

  // --- MODIFIED: Now uses a fallback for legacy data ---
  const approvalsCount = useMemo(() => {
    if (!user?.approvedAnswers) return 0;
    const isInDateRange = (dateStr: string) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const itemDate = new Date(dateStr);
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    };

    return user.approvedAnswers.filter((a) => {
      const dateToFilterBy = a.approved_date || a.date;
      return isInDateRange(dateToFilterBy);
    }).length;
  }, [user, dateRange]);

  // --- MODIFIED: Now uses a fallback for legacy data ---
  const financesCount = useMemo(() => {
    if (!user?.financialApprovedAnswers) return 0;
    const isInDateRange = (dateStr: string) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const itemDate = new Date(dateStr);
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    };

    return user.financialApprovedAnswers.filter((a) => {
      const dateToFilterBy = a.financial_approved_date || a.date;
      return isInDateRange(dateToFilterBy);
    }).length;
  }, [user, dateRange]);

  // --- Form Submit Handler ---
  const handleFormSubmit = async (
    formData: any,
    editingUserId: string | null,
    avatarData: File | null | undefined
  ) => {
    if (!editingUserId) return;

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

    Object.keys(finalInput).forEach((key) => {
      if (finalInput[key as keyof typeof finalInput] === undefined)
        delete finalInput[key as keyof typeof finalInput];
    });

    try {
      await updateUser(editingUserId, finalInput as UpdateUserInput);
      if (finalInput.username) {
        navigate(`/user/${finalInput.username}`);
      }
      await refetchUser();
      closeEditModal();
      setSuccessModalMessage("Потребителят е редактиран успешно!");
      setIsSuccessModalOpen(true);
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

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  if (userLoading || authLoading) {
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на потребителски данни..."
      />
    );
  }

  if (userUsernameFromParams === undefined) {
    return (
      <PageStatusDisplay
        notFound
        message="Потребителското име не беше намерено в адреса."
      />
    );
  }

  if (userError || !user) {
    return <PageStatusDisplay error={userError} />;
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  // --- Logic after all hooks and returns ---
  const activityCounts = {
    cases: userStats?.totalSignals || 0,
    answers: userStats?.totalAnswers || 0,
    comments: userStats?.totalComments || 0,
    ratings: ratedCasesCount,
    approvals: approvalsCount,
    finances: financesCount,
    all:
      (userStats?.totalSignals || 0) +
      (userStats?.totalAnswers || 0) +
      (userStats?.totalComments || 0) +
      ratedCasesCount +
      approvalsCount +
      financesCount,
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
    (isManagerForCategory && user?.role?._id !== ROLES.ADMIN) ||
    isSelf;

  return (
    <>
      <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          <UserInformationPanel
            user={user}
            isLoading={userLoading && !!user}
            serverBaseUrl={serverBaseUrl}
            onEditUser={openEditModal}
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
            key={user._id}
            onSubmit={handleFormSubmit}
            onClose={closeEditModal}
            initialData={user}
            submitButtonText={"Запази"}
            roles={rolesData?.getAllLeanRoles || []}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
            isAdmin={isAdmin || isManagerForCategory}
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
