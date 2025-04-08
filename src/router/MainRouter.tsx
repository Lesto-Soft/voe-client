import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../page/Home";
import Users from "../page/Users";
import CaseSubmittion from "../page/CaseSubmittion";

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
    path: "/case-submittion",
    element: <CaseSubmittion />,
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
