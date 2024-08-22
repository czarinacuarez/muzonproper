import { Routes, Route, Navigate } from "react-router-dom";
import { UserDashboard, Dashboard, Auth } from "@/layouts";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/404Page";
import AuthProtectedRoute from "./router/AuthProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/*" element={<Auth />} />

      {/* Auth Routes */}
      <Route element={<AuthProtectedRoute />}>
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/userdashboard/*" element={<UserDashboard />} />
      </Route>

      {/* Catch All Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;