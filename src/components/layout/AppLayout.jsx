import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-grow h-full p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;