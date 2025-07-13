import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ManageUsers from "./components/layout/ManageUsers";
import ViewClients from "./components/layout/ViewClients";
import ArchivedClients from "./components/layout/ArchivedClients";
import AdminLogin from "./components/auth/AdminLogin";
import ClientLogin from "./components/auth/ClientLogin";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import StagesLayout from "./pages/admin/stages/StagesLayout";
import ForgotPassword from "./components/auth/ForgotPasswordForm";
import SetPassword from "./pages/auth/SetPassword";

// ✅ Auth Wrapper inside this file
function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken"); // <- ✅ Match your login token key
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgotPassword" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/client/forgotPassword" element={<ForgotPassword />} />

      {/* 🔒 Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="view-clients" element={<ViewClients />} />
        <Route path="archived-clients" element={<ArchivedClients />} />
        <Route path="client/stages/:matterNumber" element={<StagesLayout />} />
      </Route>

      {/* 🔒 Protected Client Dashboard */}
      <Route
        path="/client/dashboard/:matterNumber"
        element={
          <RequireAuth>
            <ClientDashboard />
          </RequireAuth>
        }
      />

      {/* 🔒 Protected User Routes */}
      <Route
        path="/user"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="view-clients" element={<ViewClients />} />
        <Route path="archived-clients" element={<ArchivedClients />} />
        <Route path="client/:clientId/stages" element={<StagesLayout />} />
      </Route>
    </Routes>
  );
}

export default App;
