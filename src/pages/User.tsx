// src/pages/User.tsx
import React from "react";
import { useParams } from "react-router"; // Ensure using react-router-dom
import {
  useGetUserById,
  useGetFullUserByUsername,
} from "../graphql/hooks/user"; // Adjust path as needed
import { IUser } from "../db/interfaces"; // Adjust path as needed

// Hooks
import useUserActivityStats from "../hooks/useUserActivityStats"; // Adjust path

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay"; // Adjust path
import UserInformationPanel from "../components/features/userAnalytics/UserInformationPanel"; // Adjust path
import UserActivityList from "../components/features/userAnalytics/UserActivityList"; // Adjust path
import UserStatisticsPanel from "../components/features/userAnalytics/UserStatisticsPanel"; // Adjust path

const User: React.FC = () => {
  const { username: userUsernameFromParams } = useParams<{
    username: string;
  }>();

  const {
    loading: userLoading,
    error: userError,
    user,
  } = useGetFullUserByUsername(userUsernameFromParams);

  const userStats = useUserActivityStats(user);

  // Get server base URL for images (used in UserInformationPanel for avatar)
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  if (userUsernameFromParams === undefined) {
    return (
      <PageStatusDisplay
        notFound // Or a more specific error/info message
        message="User Username не е намерен в URL адреса."
        height="h-screen" // Full screen for this fundamental error
      />
    );
  }

  // ---- Page Status Handling ----
  if (userLoading && !user) {
    // Initial full page load scenario
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на потребителски данни..."
        height="h-[calc(100vh-6rem)]" // Assuming a header of approx 6rem
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

  // ---- Main Content Rendering ----
  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left Sidebar: User Information */}
        <UserInformationPanel
          user={user}
          isLoading={userLoading && !!user} // Show skeleton if user object exists but might be updating
          serverBaseUrl={serverBaseUrl}
        />

        {/* Main Content: User Activity Feed/List */}
        <UserActivityList
          user={user}
          isLoading={userLoading && !!user}
          counts={activityCounts}
          userId={userUsernameFromParams} // Pass userId for scroll persistence
        />

        {/* Right Sidebar: User Statistics */}
        <UserStatisticsPanel
          userStats={userStats}
          userName={user.name} // Pass userName for display in panel title
          isLoading={userLoading && !!user}
        />
      </div>
    </div>
  );
};

export default User;
