// components/ui/ModuleSwitcher.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ModuleSwitcher() {
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

    // Initial load
    updateModuleState();

    // Listen for module changes
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

    // Map current path to equivalent path in new module
    if (currentPath.includes("/dashboard")) {
      return `${basePath}/dashboard`;
    } else if (currentPath.includes("/view-clients")) {
      return `${basePath}/view-clients`;
    } else if (currentPath.includes("/manage-clients")) {
      return `${basePath}/manage-clients`;
    } else if (currentPath.includes("/manage-users")) {
      return `${basePath}/manage-users`;
    } else if (currentPath.includes("/archived-clients")) {
      return `${basePath}/archived-clients`;
    } else if (currentPath.includes("/client/stages")) {
      return `${basePath}/dashboard`;
    } else {
      return `${basePath}/dashboard`;
    }
  };

  const handleModuleChange = async (module) => {
    const company = localStorage.getItem("company");

    // Set the new module in localStorage
    localStorage.setItem("currentModule", module.toLowerCase());
    localStorage.setItem("workType", module.toUpperCase());

    // Update local state
    setCurrentModule(module.toLowerCase());
    setIsOpen(false);

    // Trigger module change event
    window.dispatchEvent(new Event("moduleChanged"));

    // Get the target path
    const targetPath = getTargetPath(location.pathname);

    // Use window.location.href for full page reload to ensure all components re-render
    setTimeout(() => {
      window.location.href = targetPath;
    }, 100);
  };

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

  if (availableModules.length <= 1) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base">{getModuleIcon(currentModule)}</span>
        <span className="hidden sm:inline">
          {getModuleDisplayName(currentModule)}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
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

      {isOpen && (
        <div className="absolute right-0 z-50 w-56 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              Switch Module
            </div>
            {availableModules.map((module) => (
              <button
                key={module}
                className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-150 ${
                  currentModule === module
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleModuleChange(module)}
              >
                <span className="mr-3 text-base">{getModuleIcon(module)}</span>
                <span className="flex-1 text-left">
                  {getModuleDisplayName(module)}
                </span>
                {currentModule === module && (
                  <span className="ml-2 text-blue-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default ModuleSwitcher;
