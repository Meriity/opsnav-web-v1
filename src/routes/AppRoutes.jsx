import { Routes, Route } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import AppLayout from '@/components/layout/AppLayout'
import AdminDashboard from '@/pages/dashboard/AdminDashboard'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* Add other routes here */}
      </Route>
    </Routes>
  )
}

export default AppRoutes
