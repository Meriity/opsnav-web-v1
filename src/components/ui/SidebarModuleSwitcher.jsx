// components/ui/SidebarModuleSwitcher.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SidebarModuleSwitcher() {
  const [currentModule, setCurrentModule] = useState("");
  const [availableModules, setAvailableModules] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateModuleState = () => {
      const storedModule = localStorage.getItem("currentModule") || "";
      const accessList = (localStorage.getItem("access") || "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((module) => module.toLowerCase());

      setCurrentModule(storedModule);
      setAvailableModules(accessList);
    };

    updateModuleState();
    window.addEventListener("moduleChanged", updateModuleState);
    window.addEventListener("storage", updateModuleState);

    return () => {
      window.removeEventListener("moduleChanged", updateModuleState);
      window.removeEventListener("storage", updateModuleState);
    };
  }, []);

  const getTargetPath = (currentPath) => {
    const role = localStorage.getItem("role");
    const basePath = role === "user" ? "/user" : "/admin";

    if (currentPath.includes("/dashboard")) return `${basePath}/dashboard`;
    if (currentPath.includes("/view-clients"))
      return `${basePath}/view-clients`;
    if (currentPath.includes("/manage-clients"))
      return `${basePath}/manage-clients`;
    if (currentPath.includes("/manage-users"))
      return `${basePath}/manage-users`;
    if (currentPath.includes("/archived-clients"))
      return `${basePath}/archived-clients`;
    if (currentPath.includes("/client/stages")) return `${basePath}/dashboard`;
    return `${basePath}/dashboard`;
  };

  const handleModuleChange = (module) => {
    localStorage.setItem("currentModule", module.toLowerCase());
    localStorage.setItem("workType", module.toUpperCase());
    setCurrentModule(module.toLowerCase());
    setIsOpen(false);
    window.dispatchEvent(new Event("moduleChanged"));

    const targetPath = getTargetPath(location.pathname);
    setTimeout(() => {
      window.location.href = targetPath;
    }, 100);
  };

  // Helper functions
  const getModuleDisplayName = (module) => {
    const moduleMap = {
      conveyancing: "Conveyancing",
      wills: "Wills & Estates",
      "print media": "Print Media",
      commercial: "Commercial",
      idg: "IDG",
      default: module.charAt(0).toUpperCase() + module.slice(1),
    };
    return moduleMap[module.toLowerCase()] || moduleMap.default;
  };

  const getModuleIcon = (module) => {
    const iconMap = {
      conveyancing: "🏠",
      wills: "📝",
      "print media": "📰",
      commercial: "💼",
      idg: "🖨️",
      default: "📁",
    };
    return iconMap[module.toLowerCase()] || iconMap.default;
  };

  if (availableModules.length <= 1) return null;

  return (
    <div className="relative">
      {/* Trigger Button with pointer cursor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 group mr-4 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs">
          {getModuleIcon(currentModule)}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {getModuleDisplayName(currentModule)}
        </span>
        <svg
          className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          {/* Mobile: bottom sheet style, Desktop: sidebar style */}
          <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full z-50 sm:mt-2">
            <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 overflow-hidden mx-0 sm:mx-0">
              {/* Header - More compact */}
              <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      Workspace
                    </h3>
                    <p className="text-slate-300 text-xs">Select module</p>
                  </div>
                  {/* Close button for mobile with pointer */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="sm:hidden text-slate-300 hover:text-white p-1 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modules List - More compact with better scroll handling */}
              <div
                className={`p-1 space-y-1 ${
                  availableModules.length > 6 ? "max-h-64 overflow-y-auto" : ""
                }`}
              >
                {availableModules.map((module) => (
                  <button
                    key={module}
                    onClick={() => handleModuleChange(module)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                      currentModule === module
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base flex-shrink-0 ${
                        currentModule === module
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getModuleIcon(module)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">
                        {getModuleDisplayName(module)}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          currentModule === module
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {currentModule === module
                          ? "Active"
                          : "Click to switch"}
                      </div>
                    </div>
                    {currentModule === module && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Show module count if many modules */}
              {availableModules.length > 6 && (
                <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    {availableModules.length} modules available
                  </p>
                </div>
              )}

              {/* Mobile bottom hint */}
              <div className="sm:hidden p-2 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Swipe down or tap outside to close
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SidebarModuleSwitcher;
