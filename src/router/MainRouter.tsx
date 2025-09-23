import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "../pages/Home";
import CaseSubmission from "../pages/CaseSubmission";
import Dashboard from "../pages/Dashboard";
import LoadingTestPage from "../pages/LoadingTestPage";
import UserManagement from "../pages/UserManagement";
import NavBar from "../components/menu/NavBar";
import Analyses from "../pages/Analyses";
import NotFoundPage from "../pages/ErrorPages/NotFound";
import User from "../pages/User";
import Category from "../pages/Category";
import Case from "../pages/Case";
import CategoryManagement from "../pages/CategoryManagement";
import RatingManagement from "../pages/RatingManagement";
import RatingMetric from "../pages/RatingMetric";
import { useGetMe } from "../graphql/hooks/user";
import { IMe } from "../db/interfaces";
import { UserProvider } from "../context/UserContext";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import ServerErrorPage from "../pages/ErrorPages/ServerErrorPage";
import NavbarSkeleton from "../components/skeletons/NavbarSkeleton";
import UserSettingsPage from "../pages/UserSettingsPage";
import SettingsPage from "../pages/Settings/SettingsPage";
import AdminUserSettingsPage from "../pages/Settings/components/AdminUserSettingsPage";

const AppLayout = () => {
  const { me, error, loading } = useGetMe();

  if (loading) return <NavbarSkeleton />;
  if (error) return (window.location.href = "/");
  if (!me || !me.me) return <div>Неуспешно зареждане на потребител.</div>;
  const currentUserData: IMe = me.me;

  return (
    <UserProvider value={currentUserData}>
      <div className="w-full min-h-screen flex flex-col">
        <div>
          <NavBar me={currentUserData} />
        </div>
        <div className="flex-1 flex flex-col w-full min-h-0">
          <Outlet />
        </div>
      </div>
    </UserProvider>
  );
};

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/submit-case",
    element: <CaseSubmission />,
  },
  {
    path: "/loading",
    element: <LoadingTestPage />,
  },
  {
    path: "/server-error",
    element: <ServerErrorPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/user-management",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EXPERT]}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/category-management",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EXPERT]}>
            <CategoryManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/rating-management",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EXPERT]}>
            <RatingManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/analyses",
        element: <Analyses />,
      },
      {
        path: "/user/:username",
        element: <User />,
      },
      {
        path: "/category/:name",
        element: <Category />,
      },
      {
        path: "/case/:number",
        element: <Case />,
      },
      {
        path: "/rating-metric/:id",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EXPERT]}>
            <RatingMetric />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings1",
        element: <UserSettingsPage />,
      },

      {
        path: "/settings2",
        element: <SettingsPage />,
      },

      {
        path: "/settings/user/:username",
        element: <AdminUserSettingsPage />,
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
