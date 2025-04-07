import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../page/Home";

const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

const Router = () => <RouterProvider router={mainRouter} />;

export default Router;
