import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "../pages/Home";
import CaseSubmission from "../pages/CaseSubmission";
import Dashboard from "../pages/Dashboard";
import LoadingTestPage from "../pages/LoadingTestPage";
import UserManagement from "../pages/UserManagement";
import NavBar from "../components/menu/NavBar";
import Profile from "../pages/Profile";
import Analyses from "../pages/Analyses";
import NotFoundPage from "../pages/NotFound";
import UserData from "../pages/UserData";
import User from "../pages/User";
import Category from "../pages/Category";
import Case from "../pages/Case";
import CategoryManagement from "../pages/CategoryManagement";
import { useGetMe } from "../graphql/hooks/user";
import { IMe } from "../db/interfaces";
import { UserProvider } from "../context/UserContext";

const AppLayout = () => {
  const { me, error, loading } = useGetMe();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
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
    path: "/user-data/:userId",
    element: <UserData />,
  },
  {
    path: "/loading",
    element: <LoadingTestPage />,
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
        element: <UserManagement />,
      },
      {
        path: "/category-management",
        element: <CategoryManagement />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/analyses",
        element: <Analyses />,
      },
      {
        path: "/user/:id",
        element: <User />,
      },
      {
        path: "/category/:id",
        element: <Category />,
      },
      {
        path: "/case/:number",
        element: <Case />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
