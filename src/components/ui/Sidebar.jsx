import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "../../icons/Sidebar icons/Dashboard.svg";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const menuItems = [
    { label: "Dashboard", icon: DashboardIcon, to:isAdminRoute ? "/admin/dashboard" : "/user/dashboard" },
    ...(isAdminRoute
      ? [{ label: "Manage Users", icon: ManageUsersIcon, to: "/admin/manage-users" }]
      : []),
    { label: "View Clients", icon: ViewClientsIcon, to: isAdminRoute ? "/admin/view-clients" : "/user/view-clients" },
    { label: "Archived Chats", icon: ArchivedChatsIcon, to: isAdminRoute ? "/admin/archived-clients" : "/user/archived-clients" },
  ];

  return (
    <aside className="flex flex-col w-64 h-screen justify-between px-4 py-8 bg-white border-r border-gray-200">
      {/* Logo */}
      <div>
        <div className="flex">
          <img
            className="w-[70px] h-[58px]"
            src="https://vklawyers.com.au/wp-content/uploads/2024/10/vk-lawers-logo.png"
            alt="Logo"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 mt-7">
          {menuItems.map(({ label, icon, to }) => {
            const isActive = location.pathname === to;

            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors w-full text-left ${
                  isActive
                    ? "bg-sky-500 text-white"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <img
                  src={icon}
                  alt={label}
                  className={`w-[30px] h-[30px] ${
                    isActive ? "filter brightness-0 invert" : ""
                  }`}
                />
                <span className="ml-4 font-medium">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="flex items-center px-4 mt-10">
        <img
          className="object-cover rounded-full w-10 h-10"
          src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
          alt="avatar"
        />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">Vinu</p>
          <p className="text-xs text-gray-500">{isAdminRoute ? "Super Admin" : "User"}</p>
        </div>
      </div>
    </aside>
  );
}
