import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Footer from "./Footer";
import { useState, useRef, useEffect } from "react";
import { FiMenu } from "react-icons/fi";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // New state for desktop sidebar
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        !sidebarRef.current?.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Toggle function for the desktop sidebar
  const handleCollapseToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const location = useLocation();
  
  // Hide mobile hamburger menu on CRM detail pages because they have their own navigation
  const isCrmViewPage = location.pathname.match(/\/admin\/crm\/(contacts|companies|leads)\/[a-zA-Z0-9_-]+/);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Mobile Menu Button - Only shows when sidebar is closed and not on CRM Detail View page */}
      {!sidebarOpen && !isCrmViewPage && (
        <button
          ref={menuButtonRef}
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-2.5 right-4 z-50 p-1.5 rounded-md bg-white shadow-md border border-gray-100"
        >
          <FiMenu className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Mobile Sidebar with backdrop */}
      <div className={`lg:hidden fixed inset-0 z-[9999] ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* Backdrop - only visible when sidebar is open */}
        {sidebarOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" />
        )}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`absolute left-0 top-0 h-full w-64 bg-white transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out pointer-events-auto`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>
      </div>

      {/* Desktop Sidebar (always visible) */}
      <div
        className={`hidden lg:block h-full bg-white transition-all duration-300 ease-in-out shadow-lg ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <Sidebar
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
          onCollapseToggle={handleCollapseToggle}
        />
      </div>

      {/* Main Content Area - Fixed to show on all screens */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="w-full">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
