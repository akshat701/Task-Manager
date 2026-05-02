import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";

function ProtectedRoute({ children }: any) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
              <ProjectsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
              <ProjectDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}