import { useState, useEffect } from "react"; // Added useEffect import
import WillsLogo from "../../icons/Button icons/Group 746.png";
import matterLogo from "../../icons/Button icons/Group 746.png";
import { useNavigate } from "react-router-dom";

function WorkSelection() {
  const navigate = useNavigate();
  const [isAutoNavigating, setIsAutoNavigating] = useState(false); // Added state for auto-navigation

  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handleSubmit = (moduleType) => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    // Set the current module in localStorage
    if (moduleType) {
      const moduleKey = moduleType.toLowerCase();
      localStorage.setItem("currentModule", moduleKey);
      localStorage.setItem("workType", moduleType.toUpperCase());
    }

    try {
      if (!token) {
        navigate("/admin/login");
      } else if (role === "admin" || role === "superadmin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/user/dashboard");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Auto-select first module if only one is available
  useEffect(() => {
    if (accessList.length === 1) {
      setIsAutoNavigating(true);
      const singleModule = accessList[0];
      localStorage.setItem("currentModule", singleModule.toLowerCase());
      localStorage.setItem("workType", singleModule.toUpperCase());

      // Auto-navigate after a short delay
      const timer = setTimeout(() => {
        const token = localStorage.getItem("authToken");
        const role = localStorage.getItem("role");

        if (token) {
          if (role === "admin" || role === "superadmin") {
            navigate("/admin/dashboard");
          } else if (role === "user") {
            navigate("/user/dashboard");
          }
        }
        setIsAutoNavigating(false);
      }, 1000); // 1 second delay to show loading state

      return () => clearTimeout(timer);
    }
  }, [accessList, navigate]);

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

  // Show loading state if auto-navigating
  if (isAutoNavigating && accessList.length === 1) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center from-sky-200 to-white relative bg-cover bg-center"
        style={{ backgroundImage: "url('/home_bg.jpg')" }}
      >
        <div className="absolute top-5 left-0 right-0 md:left-8 md:right-auto flex justify-center md:justify-start px-4">
          <img
            src="/Logo.png"
            alt="VK Lawyers Logo"
            className="h-10 sm:h-12 md:h-8"
          />
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">
            Loading {getModuleDisplayName(accessList[0])}...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Auto-directing to your module
          </p>
        </div>

        <div className="absolute bottom-4 text-[10px] sm:text-xs md:text-sm text-center w-full text-gray-700 font-semibold px-2">
          Powered By Opsnav™
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center from-sky-200 to-white relative pb-20 bg-cover bg-center"
      style={{ backgroundImage: "url('/home_bg.jpg')" }}
    >
      {/* Logo */}
      <div className="absolute top-5 left-0 right-0 md:left-8 md:right-auto flex justify-center md:justify-start px-4">
        <img
          src="/Logo.png"
          alt="VK Lawyers Logo"
          className="h-10 sm:h-12 md:h-8"
        />
      </div>

      {/* Main content */}
      <div className="w-full max-w-6xl px-4 sm:px-6 mt-24 md:mt-24">
        {/* Header */}
        <div className="w-full flex justify-center items-center mb-2 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-xl font-poppins font-bold text-center px-2 leading-snug">
            WHAT WOULD YOU LIKE TO WORK ON TODAY?
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 px-2">
          {accessList.map((item, index) => (
            <div
              key={index}
              className="w-full xs:w-11/12 sm:w-5/6 md:w-1/2 max-w-md transform hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-[#F8F7FC] shadow-lg rounded-xl p-6 sm:p-8 flex flex-col items-center border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                <img
                  src={matterLogo}
                  alt={item}
                  className="h-10 sm:h-14 md:h-16 my-3 sm:my-4 opacity-90"
                />
                <h4 className="text-lg sm:text-xl md:text-2xl font-poppins font-semibold text-center text-gray-800 mb-2">
                  {getModuleDisplayName(item)}
                </h4>
                <button
                  type="button"
                  className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 transition-all duration-300 mt-2 mb-2 text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
                  onClick={() => handleSubmit(item)}
                >
                  Next
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-[10px] sm:text-xs md:text-sm text-center w-full text-gray-700 font-semibold px-2">
        Powered By Opsnav™
      </div>
    </div>
  );
}

export default WorkSelection;
