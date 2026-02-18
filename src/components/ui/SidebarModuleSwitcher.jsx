import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Newspaper,
  Briefcase,
  Printer,
  Folder,
  ChevronDown,
  X,
  Check,
  Scale,
} from "lucide-react";

function SidebarModuleSwitcher() {
  const [currentModule, setCurrentModule] = useState("");
  const [availableModules, setAvailableModules] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateModuleState = () => {
      const storedModule = localStorage.getItem("currentModule") || "";
      const role = localStorage.getItem("role");

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

  const getModuleDisplayName = (module) => {
    const moduleMap = {
      conveyancing: "Conveyancing",
      wills: "Wills & Estates",
      "print media": "Signage & Print",
      commercial: "Commercial",
      vocat: "VOCAT - FAS",
      default: module.charAt(0).toUpperCase() + module.slice(1),
    };
    return moduleMap[module.toLowerCase()] || moduleMap.default;
  };

  const getModuleIcon = (module) => {
    const iconMap = {
      conveyancing: Home,
      wills: FileText,
      "print media": Newspaper,
      commercial: Briefcase,
      idg: Printer,
      vocat: Scale,
      default: Folder,
    };
    return iconMap[module.toLowerCase()] || iconMap.default;
  };

  const getModuleColors = (module) => {
    switch (module.toLowerCase()) {
      case "conveyancing":
        return "bg-blue-500 text-white";
      case "wills":
        return "bg-emerald-500 text-white";
      case "print media":
        return "bg-amber-500 text-white";
      case "commercial":
        return "bg-indigo-500 text-white";
      case "vocat":
        return "bg-rose-500 text-white";
      case "idg":
        return "bg-slate-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const TriggerIcon = getModuleIcon(currentModule);
  const triggerColors = getModuleColors(currentModule);

  if (availableModules.length <= 1) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 group mr-4 cursor-pointer"
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center ${triggerColors} transition-all duration-200`}
        >
          <TriggerIcon className="w-3 h-3" strokeWidth={2.5} />
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {getModuleDisplayName(currentModule)}
        </span>
        <ChevronDown
          className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
          strokeWidth={2}
        />
      </button>

      {isOpen && (
          <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full z-50 sm:mt-2">
            <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-gray-200 overflow-hidden mx-0 sm:mx-0">
              <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      Workspace
                    </h3>
                    <p className="text-slate-300 text-xs">Select module</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="sm:hidden text-slate-300 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div
                className={`p-1 space-y-1 ${
                  availableModules.length > 6 ? "max-h-64 overflow-y-auto" : ""
                }`}
              >
                {availableModules.map((module) => {
                  const ModuleIcon = getModuleIcon(module);
                  const moduleColors = getModuleColors(module);

                  return (
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
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${moduleColors} transition-all duration-200`}
                      >
                        <ModuleIcon
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          strokeWidth={2}
                        />
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
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check
                            className="w-2 h-2 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {availableModules.length > 6 && (
                <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    {availableModules.length} modules available
                  </p>
                </div>
              )}
              <div className="sm:hidden p-2 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Swipe down or tap outside to close
                </p>
              </div>
            </div>
          </div>

      )}
    </div>
  );
}

export default SidebarModuleSwitcher;
