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
  LayoutDashboard,
  FolderOpen,
  FolderArchive,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Sidebar({
  setSidebarOpen,
  isCollapsed,
  onCollapseToggle,
}) {
  const { isOpen, setIsOpen, dropdownRef, buttonRef } = useDropdown();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const company = localStorage.getItem("company");
  const userRole = localStorage.getItem("role");
  const currentModule = localStorage.getItem("currentModule");
  const [hoveredItem, setHoveredItem] = useState(null);

  // Handle mobile responsiveness - auto collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth < 768 &&
        !isCollapsed &&
        typeof onCollapseToggle === "function"
      ) {
        // Logic handled by parent usually, but safe check here
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed, onCollapseToggle]);

  const getMenuLabels = () => {
    if (currentModule === "commercial") {
      return { view: "View Projects", archived: "Archived Projects" };
    } else if (company === "idg") {
      return { view: "View Orders", archived: "Completed Orders" };
    } else {
      return { view: "View Clients", archived: "Archived Clients" };
    }
  };

  const menuLabels = getMenuLabels();

  const getIconForLabel = (label) => {
    switch (label) {
      case "Dashboard":
        return LayoutDashboard;
      case "Manage Users":
        return UserCog;
      case "View Clients":
      case "View Projects":
      case "View Orders":
        return FolderOpen;
      case "Archived Clients":
      case "Archived Projects":
      case "Completed Orders":
        return FolderArchive;
      default:
        return LayoutDashboard;
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: DashboardIcon,
      to: isAdminRoute ? "/admin/dashboard" : "/user/dashboard",
    },
    {
      label: menuLabels.view,
      icon: ViewClientsIcon,
      to: isAdminRoute ? "/admin/view-clients" : "/user/view-clients",
    },
    {
      label: menuLabels.archived,
      icon: ArchivedChatsIcon,
      to: isAdminRoute ? "/admin/archived-clients" : "/user/archived-clients",
    },
  ];

  if (isAdminRoute && (userRole === "admin" || userRole === "superadmin")) {
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
    window.location.href = "/admin/login";
  };

  const handleViewClientsClick = () => {
    localStorage.removeItem("client-storage");
    navigate(isAdminRoute ? "/admin/view-clients" : "/user/view-clients");
    if (typeof setSidebarOpen === "function") setSidebarOpen(false);
  };

  const handleNavigate = (to) => {
    navigate(to);
    if (typeof setSidebarOpen === "function") setSidebarOpen(false);
  };

  const getClickHandler = (label, to) => {
    if (label === menuLabels.view) return handleViewClientsClick;
    return () => handleNavigate(to);
  };

  const sidebarVariants = {
    expanded: {
      width: "16rem",
      paddingLeft: "16px",
      paddingRight: "16px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: "5rem",
      paddingLeft: "8px",
      paddingRight: "8px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <>
      <motion.aside
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        // FIXED: z-[100] forces sidebar on top of EVERYTHING.
        // FIXED: fixed top-0 left-0 ensures it anchors correctly on mobile.
        className="fixed top-0 left-0 bottom-0 h-screen md:sticky md:top-0 flex flex-col justify-between py-6 bg-gradient-to-b from-white via-gray-50/50 to-white border-r border-gray-200/50 z-[100] shadow-2xl md:shadow-none overflow-visible"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#2E3D99]/3 to-[#1D97D7]/3 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#FB4A50]/3 to-[#FF6B6B]/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {/* Logo Area */}
          <div className="flex justify-center mb-8 h-[60px] items-center shrink-0">
            <img
              className={`h-auto object-contain transition-all duration-300 ease-in-out ${
                isCollapsed ? "w-[40px]" : "w-[120px]"
              }`}
              src={
                localStorage.getItem("logo") ||
                "https://via.placeholder.com/70x58"
              }
              alt="Logo"
            />
          </div>

          {/* Toggle Button */}
          <button
            onClick={onCollapseToggle}
            className="hidden md:flex absolute top-1/2 -right-6 transform -translate-y-1/2 p-1.5 rounded-full bg-white shadow-md z-50 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-gray-600" />
            )}
          </button>

          {/* Navigation Menu */}
          <nav className="flex flex-col space-y-2 mt-2 flex-1 overflow-y-auto overflow-x-hidden">
            {menuItems.map(({ label, icon, to }) => {
              const isActive = location.pathname === to;
              const handleClick = getClickHandler(label, to);
              const IconComponent = getIconForLabel(label);

              return (
                <div
                  key={to}
                  onMouseEnter={() => setHoveredItem(label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={handleClick}
                    title={isCollapsed ? label : ""}
                    className={`
                      relative flex items-center cursor-pointer p-3 w-full group overflow-hidden
                      transition-all duration-300 ease-in-out
                      ${
                        isActive
                          ? "bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 border border-[#2E3D99]/20 shadow-sm"
                          : "hover:bg-gray-50/80 border border-transparent hover:border-gray-200"
                      }
                      ${
                        isCollapsed
                          ? "justify-center rounded-2xl"
                          : "rounded-xl"
                      }
                    `}
                  >
                    {isActive && (
                      <div
                        className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-3/5 bg-[#FB4A50] rounded-r-full transition-opacity duration-300 opacity-100`}
                      />
                    )}

                    <div className="relative flex-shrink-0 z-10 w-9 h-9 flex items-center justify-center">
                      <div
                        className={`
                        w-full h-full rounded-lg flex items-center justify-center transition-colors duration-300
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700"
                        }
                      `}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <div
                      className={`
                      flex-1 text-left whitespace-nowrap overflow-hidden
                      transition-all duration-300 ease-in-out
                      ${
                        isCollapsed
                          ? "w-0 opacity-0 translate-x-4 ml-0"
                          : "w-auto opacity-100 translate-x-0 ml-3"
                      }
                    `}
                    >
                      <span
                        className={`font-medium text-sm block truncate ${
                          isActive
                            ? "text-[#2E3D99] font-semibold"
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="relative z-10 mt-auto shrink-0">
          <div className="relative flex justify-center w-full">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen((prev) => !prev)}
              className={`
                relative cursor-pointer flex items-center bg-gray-50/80 border border-gray-200 hover:border-gray-300 hover:shadow-sm overflow-hidden
                transition-all duration-300 ease-in-out
                ${
                  isCollapsed
                    ? "w-10 h-10 rounded-full justify-center p-0"
                    : "w-full rounded-xl px-3 py-3 justify-between"
                }
              `}
            >
              <div
                className={`flex items-center flex-shrink-0 ${
                  isCollapsed ? "justify-center w-full" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center flex-shrink-0">
                  <CircleUserRound className="w-4 h-4 text-white" />
                </div>
              </div>

              <div
                className={`
                flex items-center justify-between flex-1 overflow-hidden whitespace-nowrap
                transition-all duration-300 ease-in-out
                ${
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                }
              `}
              >
                <div className="min-w-0 text-left">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {localStorage.getItem("user") || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {userRole || "Staff"}
                  </p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute bottom-full mb-2 bg-white shadow-lg border border-gray-200 z-50
                    ${
                      isCollapsed
                        ? "w-max min-w-[3rem] p-1.5 rounded-lg left-1/2 -translate-x-1/2"
                        : "w-full p-3 rounded-xl left-0"
                    }
                  `}
                >
                  <div className="space-y-1">
                    {!isCollapsed && (
                      <div className="px-3 py-2 border-b border-gray-100 mb-2">
                        <p className="text-xs font-medium text-gray-500">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {localStorage.getItem("user")}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      title="Logout"
                      className={`flex items-center cursor-pointer text-gray-700 hover:bg-[#FB4A50]/10 hover:text-[#FB4A50] transition-all duration-200 group
                        ${
                          isCollapsed
                            ? "justify-center w-full p-2 rounded-md"
                            : "w-full px-3 py-2.5 justify-between rounded-lg"
                        }
                      `}
                    >
                      <div
                        className={`flex items-center ${
                          isCollapsed ? "justify-center" : "gap-3"
                        }`}
                      >
                        <div
                          className={`rounded-lg ${
                            !isCollapsed
                              ? "p-1.5 bg-[#FB4A50]/10 group-hover:bg-[#FB4A50]/20"
                              : ""
                          }`}
                        >
                          <LogOut
                            className={`w-4 h-4 ${
                              isCollapsed ? "text-[#FB4A50]" : "text-[#FB4A50]"
                            }`}
                          />
                        </div>
                        {!isCollapsed && (
                          <span className="text-sm font-medium">Logout</span>
                        )}
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ${
          !isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCollapseToggle}
      />
    </>
  );
}
