import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "../page/Home";
import Users from "../page/Users";
import CaseSubmittion from "../page/CaseSubmittion";
import Dashboard from "../page/Dashboard";
import LoadingTestPage from "../page/LoadingTestPage";
import NavBar from "./NavBar";

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
    ],
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
