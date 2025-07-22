import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Footer from "./Footer";
import { useState, useRef, useEffect } from "react";
import { FiMenu } from "react-icons/fi";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && 
          !sidebarRef.current?.contains(event.target) && 
          !menuButtonRef.current?.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Mobile Menu Button - Only shows when sidebar is closed */}
      {!sidebarOpen && (
        <button 
          ref={menuButtonRef}
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Sidebar with backdrop */}
      <div className="md:hidden  inset-0 z-30">
        {/* Backdrop - only visible when sidebar is open */}
        {sidebarOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        )}
        
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`absolute left-0 top-0 h-full w-64 bg-white transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>
      </div>

      {/* Desktop Sidebar (always visible) */}
      <div className="hidden md:block md:w-64 md:h-full md:bg-white md:border-r">
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main Content Area - Fixed to show on all screens */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="p-4 w-full">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;