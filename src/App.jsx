import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ViewClients from "./pages/admin/ViewClients";
import ArchivedClients from "./pages/admin/ArchivedClients";
import AdminLogin from "./components/auth/AdminLogin";
import ClientLogin from "./components/auth/ClientLogin";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import StagesLayout from "./pages/admin/stages/StagesLayout";
import ForgotPassword from "./components/auth/ForgotPasswordForm";
import SetPassword from "./pages/auth/SetPassword";
import SetClientPassword from "./pages/clients/SetPassword";
import WorkSelection from "./pages/admin/WorkSelection";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";
import AutoLogoutWrapper from "./contexts/autoLogoutWrapper";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Auth Wrapper inside this file
function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken"); // <- ✅ Match your login token key
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

function RequireAuthClient({ children }) {
  const matterNumber = localStorage.getItem("matterNumber"); // <- ✅ Match your login token key
  const location = useLocation();

  if (!matterNumber) {
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
      <>
    <Routes>
      {/* 🔓 Public Routes */}
      {/* <Route path="/" element={<ComingSoon/>}  /> */}
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgotPassword" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/client/set-password" element={<SetClientPassword />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/client/forgotPassword" element={<ForgotPassword />} />

      {/* 🔒 Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AutoLogoutWrapper>
              <AppLayout />
            </AutoLogoutWrapper>
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="view-clients" element={<ViewClients />} />
        <Route path="archived-clients" element={<ArchivedClients />} />
        <Route
          path="client/stages/:matterNumber/:stageNo?"
          element={<StagesLayout />}
        />
      </Route>

           {/* Work Selection Route — Protected but no AppLayout */}
      <Route
        path="/admin/work-selection"
        element={
          <RequireAuth>
            <AutoLogoutWrapper>
            <WorkSelection />
            </AutoLogoutWrapper>
          </RequireAuth>
        }
      />

      {/* 🔒 Protected Client Dashboard */}
      <Route
        path="/client/dashboard/:matterNumber"
        element={
          <RequireAuthClient>
            <AutoLogoutWrapper>
            <ClientDashboard />
            </AutoLogoutWrapper>
          </RequireAuthClient>
        }
      />

      {/* 🔒 Protected User Routes */}
      <Route
        path="/user"
        element={
          <RequireAuth>
            <AutoLogoutWrapper>
            <AppLayout />
            </AutoLogoutWrapper>
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="view-clients" element={<ViewClients />} />
        <Route path="archived-clients" element={<ArchivedClients />} />
        <Route path="client/:clientId/stages" element={<StagesLayout />} />
      </Route>

      {/* Work Selection Route — Protected but no AppLayout */}
      <Route
        path="/user/work-selection"
        element={
          <RequireAuth>
            <AutoLogoutWrapper>
            <WorkSelection />
            </AutoLogoutWrapper>
          </RequireAuth>
        }
      />
    </Routes>
    <ToastContainer position="top-right" />
    </>
  );
}

export default App;
