import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import Dashboard from "../pages/Dashboard";
import RegisterPage from "../pages/RegisterPage";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";

function ProtectedRoute({ children }: any) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: any) {
  const user = useAuthStore((s) => s.user);
  return user?.role === "admin" ? children : <Navigate to="/" />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes */}
          <Route index element={<ProjectsPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="project/:id" element={<ProjectDetailPage />} />

          {/* Admin Only */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <div>Admin Panel</div>
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}