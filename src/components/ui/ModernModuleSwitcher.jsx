// components/ui/ModernModuleSwitcher.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ModernModuleSwitcher() {
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

  const getModuleColor = (module) => {
    const colorMap = {
      conveyancing: "from-blue-500 to-blue-600",
      wills: "from-purple-500 to-purple-600",
      "print media": "from-green-500 to-green-600",
      commercial: "from-orange-500 to-orange-600",
      idg: "from-red-500 to-red-600",
      default: "from-gray-500 to-gray-600",
    };
    return colorMap[module.toLowerCase()] || colorMap.default;
  };

  if (availableModules.length <= 1) return null;

  return (
    <div className="relative">
      {/* Modern Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
      >
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getModuleColor(
            currentModule
          )} flex items-center justify-center text-white text-sm font-medium`}
        >
          {getModuleIcon(currentModule)}
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-500 font-medium">
            Current Module
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {getModuleDisplayName(currentModule)}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
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

      {/* Modern Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 w-80 mt-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-semibold text-gray-800">
                  Switch Workspace
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choose your working module
                </p>
              </div>

              {/* Modules Grid */}
              <div className="p-3 grid gap-2">
                {availableModules.map((module) => (
                  <button
                    key={module}
                    onClick={() => handleModuleChange(module)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      currentModule === module
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getModuleColor(
                        module
                      )} flex items-center justify-center text-white text-lg shadow-sm`}
                    >
                      {getModuleIcon(module)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-800">
                        {getModuleDisplayName(module)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {currentModule === module
                          ? "Currently active"
                          : "Switch to this module"}
                      </div>
                    </div>
                    {currentModule === module && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ModernModuleSwitcher;
