import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ArrowRight,
  Sparkles,
  Briefcase,
  FileText,
  Printer,
  Building2,
  Cpu,
  LayoutGrid,
} from "lucide-react";
import { motion } from "framer-motion";

function WorkSelection() {
  const navigate = useNavigate();
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);

  // Parse access list
  const accessList = (localStorage.getItem("access") || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Handle Module Selection
  const handleSubmit = (moduleType) => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

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

  // Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // Auto-navigation Effect
  useEffect(() => {
    if (accessList.length === 1) {
      setIsAutoNavigating(true);
      const singleModule = accessList[0];
      localStorage.setItem("currentModule", singleModule.toLowerCase());
      localStorage.setItem("workType", singleModule.toUpperCase());

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
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [accessList, navigate]);

  // Helper: Get Display Name
  const getModuleDisplayName = (module) => {
    const moduleMap = {
      conveyancing: "Conveyancing",
      wills: "Wills & Estates",
      "print media": "Print Media",
      commercial: "Commercial Law",
      idg: "IDG",
      default: module.charAt(0).toUpperCase() + module.slice(1),
    };
    return moduleMap[module.toLowerCase()] || moduleMap.default;
  };

  // Helper: Get Modern Icon
  const getModuleIcon = (module) => {
    const iconProps = { className: "w-8 h-8 text-white" };
    const key = module.toLowerCase();

    if (key.includes("conveyancing")) return <Building2 {...iconProps} />;
    if (key.includes("wills")) return <FileText {...iconProps} />;
    if (key.includes("print")) return <Printer {...iconProps} />;
    if (key.includes("commercial")) return <Briefcase {...iconProps} />;
    if (key.includes("idg")) return <Cpu {...iconProps} />;

    return <LayoutGrid {...iconProps} />;
  };

  // Floating Background Element (Blue Theme)
  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20"
      style={{
        width: size,
        height: size,
        top: `${top}%`,
        left: `${left}%`,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
      }}
      transition={{
        duration: 3 + delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  // --- LOADING STATE (Blue Theme) ---
  if (isAutoNavigating && accessList.length === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
        <FloatingElement top={20} left={20} delay={0} size={100} />
        <FloatingElement top={80} left={80} delay={1} size={80} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl flex flex-col items-center border border-white/50"
        >
          <img src="/Logo.png" alt="OpsNav" className="h-10 mb-6" />
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-[#2E3D99]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#2E3D99] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Accessing {getModuleDisplayName(accessList[0])}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Please wait while we direct you...
          </p>
        </motion.div>
      </div>
    );
  }

  // --- MAIN COMPONENT ---
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 overflow-hidden flex flex-col">
      {/* Floating Background Elements */}
      <div className="hidden sm:block">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header / Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-lg py-3 [@media(max-width:1024px)_and_(max-height:800px)]:py-2 [@media(max-width:430px)]:py-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <img
              src="/Logo.png"
              alt="OpsNav"
              className="h-7 sm:h-8 md:h-9 w-auto [@media(max-width:1024px)_and_(max-height:800px)]:h-8 [@media(max-width:430px)]:h-6"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2 [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(max-width:430px)]:px-2.5 [@media(max-width:430px)]:text-xs"
          >
            <LogOut className="w-4 h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-3 [@media(max-width:1024px)_and_(max-height:800px)]:h-3" />
            <span className="[@media(max-width:340px)]:hidden">Sign Out</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-12 [@media(max-width:1024px)_and_(max-height:800px)]:pt-16 [@media(max-width:430px)]:pt-20">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 [@media(max-width:1024px)_and_(max-height:800px)]:mb-6"
        >
          {/* Badge (Blue Theme) */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 border border-[#2E3D99]/20 shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              Workspace Selection
            </span>
          </div>

          {/* Title (Blue Gradient Theme) */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:text-3xl">
            What would you like to{" "}
            <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
              work on?
            </span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg [@media(max-width:1024px)_and_(max-height:800px)]:text-base">
            Select a module below to access your tailored workspace
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[90rem] flex flex-wrap justify-center gap-6 [@media(max-width:1024px)_and_(max-height:800px)]:gap-4"
        >
          {accessList.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              // Card: Default Border White. Hover Border Red.
              className="group relative w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[280px] max-w-md bg-white/80 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-white/50 hover:border-[#FB4A50]/50 transition-all duration-300 flex flex-col"
            >
              {/* Card Inner */}
              <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-xl p-6 sm:p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
                {/* Decorative Top Bar: Hidden Default. Visible Red on Hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FB4A50] to-[#FF8085] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container: Blue Default */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] shadow-lg flex items-center justify-center mb-6 group-hover:shadow-[#FB4A50]/20 transition-shadow duration-300">
                  {getModuleIcon(item)}
                </div>

                {/* Title: Dark Gray Default. Red on Hover. */}
                <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 transition-colors">
                  {getModuleDisplayName(item)}
                </h4>

                <p className="text-sm text-gray-500 mb-8 line-clamp-2">
                  Access tools and workflows for {getModuleDisplayName(item)}{" "}
                  operations.
                </p>

                <div className="mt-auto w-full">
                  <button
                    type="button"
                    onClick={() => handleSubmit(item)}
                    // Button: Default Blue Gradient. Hover Red Gradient.
                    className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Enter Workspace
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 relative z-10 [@media(max-width:1024px)_and_(max-height:800px)]:py-2">
        <p className="text-sm text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span> |
          Secure Legal Operations Platform
        </p>
      </footer>
    </div>
  );
}

export default WorkSelection;
