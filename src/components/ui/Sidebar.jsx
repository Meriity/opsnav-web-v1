import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "../../icons/Sidebar icons/Dashboard.svg";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";
import { useDropdown } from "../../hooks/dropdown";
import { ChevronsUpDown, LogOut, CircleUserRound } from "lucide-react";

export default function Sidebar() {
  const { isOpen, setIsOpen, dropdownRef, buttonRef } = useDropdown();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  let managerUser = { label: "Manage Users", icon: ManageUsersIcon, to: "/admin/manage-users" };
  const menuItems = [
    { label: "Dashboard", icon: DashboardIcon, to: isAdminRoute ? "/admin/dashboard" : "/user/dashboard" },
    { label: "View Clients", icon: ViewClientsIcon, to: isAdminRoute ? "/admin/view-clients" : "/user/view-clients" },
    { label: "Archived Clients", icon: ArchivedChatsIcon, to: isAdminRoute ? "/admin/archived-clients" : "/user/archived-clients" },
  ];

  isAdminRoute && menuItems.splice(1, 0, managerUser);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("client-storage");
    localStorage.removeItem("matterNumber");
    navigate("/admin/login");
  }

  return (
    <aside className="flex flex-col w-64 h-screen justify-between px-4 py-8 bg-white border-r border-gray-200">
      {/* Logo */}
      <div>
        <div className="flex">
          <img
            className="w-[70px] h-[58px]"
            // src="https://vklawyers.com.au/wp-content/uploads/2024/10/vk-lawers-logo.png"
            src={localStorage.getItem("logo")}
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
                className={`flex items-center cursor-pointer px-4 py-2 rounded-md transition-colors w-full text-left ${isActive
                  ? "bg-[#00AEEF] text-white"
                  : "hover:bg-gray-100 text-gray-800"
                  }`}
              >
                <img
                  src={icon}
                  alt={label}
                  className={`w-[30px] h-[30px] ${isActive ? "filter brightness-0 invert" : ""
                    }`}
                />
                <span className="ml-4 font-medium">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      {/* User Dropdown Footer */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className="px-4 py-2 cursor-pointer flex text-black w-55 items-center justify-between bg-sky-100 rounded-2xl"
        >
          <div className="flex gap-2">
            <CircleUserRound />
            {localStorage.getItem("user")}
          </div>
          <ChevronsUpDown className="w-5" />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute bottom-full mt-2 mb-2 bg-white shadow-md p-2 rounded w-50 hover:bg-sky-200 active:bg-sky-100"
          >

            <button onClick={handleLogout}
              className="px-4 flex cursor-pointer text-black rounded w-50 items-center justify-between"
            >
              Logout <LogOut className="w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

