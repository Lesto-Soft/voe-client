import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "../page/Home";
import Users from "../page/Users";
import CaseSubmittion from "../page/CaseSubmittion";
import Dashboard from "../page/Dashboard";
import LoadingTestPage from "../page/LoadingTestPage";
import NavBar from "../components/menu/NavBar";
import Profile from "../page/Profile";
import Analyses from "../page/Analyses";
import NotFoundPage from "../page/NotFound";

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
        path: "/users",
        element: <Users />,
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
