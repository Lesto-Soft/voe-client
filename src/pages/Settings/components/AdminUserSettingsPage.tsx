import React from "react";
import { useParams } from "react-router";
// import { useGetFullUserByUsername } from "../../graphql/hooks/user";
import { useGetFullUserByUsername } from "../../../graphql/hooks/user";
import PageStatusDisplay from "../../../components/global/PageStatusDisplay";
import SettingsPage from "../SettingsPage";

// NOTE: For this to work perfectly, SettingsPage and its children (AccountSettings etc.)
// would need to be refactored to accept an optional 'user' prop.
// If the prop exists, they use it; otherwise, they use `useCurrentUser()`.
// This mock assumes that adaptation has been made.

const AdminUserSettingsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user, loading, error } = useGetFullUserByUsername(username);

  if (loading) {
    return (
      <PageStatusDisplay
        loading
        message={`Зареждане на настройки за ${username}...`}
      />
    );
  }

  if (error) {
    return <PageStatusDisplay error={error} />;
  }

  if (!user) {
    return (
      <PageStatusDisplay
        notFound
        message={`Потребител с име ${username} не беше намерен.`}
      />
    );
  }

  return (
    // This is a conceptual representation.
    // You would pass the fetched `user` object down into a modified <SettingsPage>
    // which would then pass it to its children instead of them calling useCurrentUser.
    <div>
      <div
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
        role="alert"
      >
        <p className="font-bold">Режим на Администратор</p>
        <p>
          Вие редактирате настройките за потребител:{" "}
          <strong className="font-bold">
            {user.name} ({user.username})
          </strong>
          .
        </p>
      </div>

      {/* This is a placeholder. To make this truly work, SettingsPage would need a prop like:
              <SettingsPage targetUser={user} />
              And all child components would use `targetUser` instead of `useCurrentUser()`.
            */}
      <h2 className="text-2xl text-center p-8">
        [Тук ще се зареди пълният интерфейс за настройки, но за потребителя "
        {user.name}"]
      </h2>
    </div>
  );
};

export default AdminUserSettingsPage;
