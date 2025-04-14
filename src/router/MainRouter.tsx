import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../page/Home";
import Users from "../page/Users";
import CaseSubmittion from "../page/CaseSubmittion";
import Dashboard from "../page/Dashboard";
import LoadingTestPage from "../page/LoadingTestPage";

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "/submit-case",
    element: <CaseSubmittion />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/loading",
    element: <LoadingTestPage />,
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
