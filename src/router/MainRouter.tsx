import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "../page/Home";
import CaseSubmittion from "../page/CaseSubmittion";
import Dashboard from "../page/Dashboard";
import LoadingTestPage from "../page/LoadingTestPage";
import UserManagementPage from "../page/UserManagementPage";
import NavBar from "../components/menu/NavBar";
import Profile from "../page/Profile";
import Analyses from "../page/Analyses";
import NotFoundPage from "../page/NotFound";
import UserData from "../page/UserData";

const AppLayout = () => {
  return (
    <div>
      <div>
        <NavBar />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/submit-case",
    element: <CaseSubmittion />,
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
        element: <UserManagementPage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/analyses",
        element: <Analyses />,
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
