import { createBrowserRouter } from "react-router-dom";
import SignUp from "../pages/auth/sign-up";
import { UserDashboard, Dashboard, Auth } from "@/layouts";
import NotFoundPage from "../pages/404Page";
import AuthProtectedRoute from "./AuthProtectedRoute";
import Providers from "../Providers";
import SignIn  from "../pages/auth/sign-in";
import HomePage from "@/pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/auth/*",
        element: <Auth />,
      },
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/dashboard/*",
            element: <Dashboard />,
          },
          {
            path: "/userdashboard/*",
            element: <UserDashboard />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
