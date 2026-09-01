import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import UploadReport from "./pages/UploadReport";
import ReportDetails from "./pages/ReportDetails";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/upload" element={<UploadReport />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-page px-4 text-center">
            <h1 className="font-display text-h1 text-ink">Page not found</h1>
            <p className="mt-2 text-body text-muted">The page you're looking for doesn't exist.</p>
            <a href="/" className="mt-6 text-body font-medium text-forest hover:underline">
              Back to home
            </a>
          </div>
        }
      />
    </Routes>
  );
}
