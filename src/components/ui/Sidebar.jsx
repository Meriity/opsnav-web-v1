import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "../../icons/Sidebar icons/Dashboard.svg";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";
import { useDropdown } from "../../hooks/dropdown";
import {
  ChevronsUpDown,
  LogOut,
  CircleUserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({
  setSidebarOpen,
  isCollapsed,
  onCollapseToggle,
}) {
  const { isOpen, setIsOpen, dropdownRef, buttonRef } = useDropdown();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const menuItems = [
    {
      label: "Dashboard",
      icon: DashboardIcon,
      to: isAdminRoute ? "/admin/dashboard" : "/user/dashboard",
    },
    {
      label: "View Clients",
      icon: ViewClientsIcon,
      to: isAdminRoute ? "/admin/view-clients" : "/user/view-clients",
    },
    {
      label: "Archived Clients",
      icon: ArchivedChatsIcon,
      to: isAdminRoute ? "/admin/archived-clients" : "/user/archived-clients",
    },
  ];

  if (isAdminRoute) {
    menuItems.splice(1, 0, {
      label: "Manage Users",
      icon: ManageUsersIcon,
      to: "/admin/manage-users",
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("client-storage");
    localStorage.removeItem("matterNumber");
    // This line forces a hard refresh
    window.location.href = "/admin/login";
  };

  const handleViewClientsClick = () => {
    localStorage.removeItem("client-storage");
    navigate(isAdminRoute ? "/admin/view-clients" : "/user/view-clients");
    if (typeof setSidebarOpen === "function") {
      setSidebarOpen(false);
    }
  };

  const handleNavigate = (to) => {
    navigate(to);
    if (typeof setSidebarOpen === "function") {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className="flex flex-col h-screen justify-between px-4 py-8 bg-white relative">
      <div>
        <div className="flex px-2 justify-center">
          <img
            className={`${
              isCollapsed ? "w-[40px]" : "w-[120px]"
            } h-auto transition-all duration-300`}
            src={
              localStorage.getItem("logo") ||
              "https://via.placeholder.com/70x58"
            }
            alt="Logo"
          />
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={onCollapseToggle}
          className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 p-1 rounded-full bg-gray-200 shadow-md z-50 hover:bg-gray-300"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="flex flex-col space-y-4 mt-7">
          {menuItems.map(({ label, icon, to }) => {
            const isActive = location.pathname === to;
            const handleClick =
              label === "View Clients"
                ? handleViewClientsClick
                : () => handleNavigate(to);

            return (
              <button
                key={to}
                onClick={handleClick}
                title={label}
                className={`flex items-center cursor-pointer px-4 py-2 rounded-md transition-colors w-full ${
                  isActive
                    ? "bg-[#00AEEF] text-white"
                    : "hover:bg-gray-100 text-gray-800"
                } ${isCollapsed ? "justify-center" : "text-left"}`}
              >
                <img
                  src={icon}
                  alt={label}
                  className={`w-[30px] h-[30px] ${
                    isActive ? "filter brightness-0 invert" : ""
                  }`}
                />
                {!isCollapsed && (
                  <span className="ml-4 font-medium">{label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`px-4 py-2 cursor-pointer flex text-black w-full items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } bg-sky-100 rounded-2xl`}
        >
          <div className="flex gap-2 items-center truncate">
            <CircleUserRound />
            {!isCollapsed && (
              <span className="truncate">{localStorage.getItem("user")}</span>
            )}
          </div>
          {!isCollapsed && <ChevronsUpDown className="w-5 shrink-0" />}
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute bottom-full mb-2 bg-white shadow-lg p-2 rounded w-full border"
          >
            <button
              onClick={handleLogout}
              title="Logout"
              className={`w-full px-4 py-2 flex items-center rounded cursor-pointer text-black hover:bg-sky-100 ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!isCollapsed && <span>Logout</span>}
              <LogOut className="w-4 shrink-0" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
