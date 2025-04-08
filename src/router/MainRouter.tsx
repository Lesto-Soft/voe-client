import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../page/Home";
import Users from "../page/Users";

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/users",
    element: <Users />,
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
