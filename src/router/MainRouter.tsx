import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "../page/Home";
import CaseSubmittion from "../page/CaseSubmittion";
import Dashboard from "../page/Dashboard";
import LoadingTestPage from "../page/LoadingTestPage";
import UserManagement from "../page/UserManagement";
import NavBar from "../components/menu/NavBar";
import Profile from "../page/Profile";
import Analyses from "../page/Analyses";
import NotFoundPage from "../page/NotFound";
import UserData from "../page/UserData";
import User from "../page/User";
import Category from "../page/Category";
import Case from "../page/Case";

const AppLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div>
        <NavBar />
      </div>
      <div className="flex-1 flex flex-col w-full min-h-0">
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
        element: <UserManagement />,
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
        path: "/case/:id",
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
