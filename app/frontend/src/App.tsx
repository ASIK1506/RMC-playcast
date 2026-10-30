import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/auth/RouteGuards";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Display from "./pages/Display";
import Projector from "./pages/Projector";
import Stage from "./pages/Stage";
import Remote from "./pages/Remote";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Studio Main Page */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Panel (Nested Routes with Layout) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Output Feeds (OBS, Projector, Stage, Remote) */}
          <Route path="/display" element={<Display />} />
          <Route path="/projector" element={<Projector />} />
          <Route path="/stage" element={<Stage />} />
          <Route path="/remote" element={<Remote />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;