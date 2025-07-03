import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ManageUsers from "./components/layout/ManageUsers";
import ViewClients from "./components/layout/ViewClients";
import ArchivedClients from "./components/layout/ArchivedClients";
import AdminLogin from "./components/auth/AdminLogin";
import ClientLogin from "./components/auth/ClientLogin";
import ClientDashboard from "./pages/dashboard/ClientDashboard";

function App() {
  return (
<Routes>
  <Route path="/admin/login" element={<AdminLogin />} /> 
  <Route path="/admin" element={<AppLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="manage-users" element={<ManageUsers />} />
    <Route path="view-clients" element={<ViewClients />} />
    <Route path="archived-clients" element={<ArchivedClients />} />
  </Route>
   <Route path="/client/login" element={<ClientLogin />} />
    <Route path="/client/dashboard" element={<ClientDashboard />} />

  <Route path="/user" element={<AppLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="view-clients" element={<ViewClients />} />
    <Route path="archived-clients" element={<ArchivedClients />} />
  </Route>
</Routes>
  );
}

export default App;
