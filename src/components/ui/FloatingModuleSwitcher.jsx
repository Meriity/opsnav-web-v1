// components/ui/FloatingModuleSwitcher.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function FloatingModuleSwitcher() {
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
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-md">
            {getModuleIcon(currentModule)}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-500 font-medium">Active</div>
          <div className="text-sm font-bold text-gray-800">
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

      {/* Floating Cards */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 w-72 mt-3">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    🔄
                  </div>
                  <div>
                    <h3 className="font-bold">Switch Module</h3>
                    <p className="text-slate-300 text-xs">
                      Choose your workspace
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2">
                {availableModules.map((module) => (
                  <button
                    key={module}
                    onClick={() => handleModuleChange(module)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-102 ${
                      currentModule === module
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        currentModule === module
                          ? "bg-white/20"
                          : "bg-white shadow-sm"
                      }`}
                    >
                      {getModuleIcon(module)}
                    </div>
                    <div className="flex-1 text-left">
                      <div
                        className={`font-semibold ${
                          currentModule === module
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {getModuleDisplayName(module)}
                      </div>
                      <div
                        className={`text-xs ${
                          currentModule === module
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {currentModule === module
                          ? "Active workspace"
                          : "Click to switch"}
                      </div>
                    </div>
                    {currentModule === module && (
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600">
                        ✓
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

export default FloatingModuleSwitcher;
