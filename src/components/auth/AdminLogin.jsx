import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  HomeIcon,
  ArrowRight,
  Shield,
  Lock,
  User,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

function AdminLogin() {
  const api = new AuthAPI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await api.signIn(email, password);

      if (response.token) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", response.user.displayName);
        localStorage.setItem("access", response.user.access);
        localStorage.setItem("role", response.user.role);
        localStorage.setItem("company", response.user.company);
        localStorage.setItem("logo", response.user.logo);
        localStorage.setItem("userID", response.user.id);

        toast.success("Logging in...", {
          position: "bottom-center",
        });

        // Determine target path
        let targetPath = location.state?.from?.pathname || location.state?.from;

        if (!targetPath) {
          targetPath =
            response.role === "admin"
              ? "/admin/work-selection"
              : "/user/work-selection";
        }

        setTimeout(() => {
          // Hard reload and navigate with cache busting
          const timestamp = new Date().getTime();
          const separator = targetPath.includes("?") ? "&" : "?";
          window.location.href = `${targetPath}${separator}refresh=${timestamp}`;
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Something went wrong. Please try again.";
      setLoginError(errorMessage);

      toast.error(errorMessage, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHome = async (e) => {
    navigate("/");
  };

  // Floating background elements
  const FloatingElement = ({ top, left, delay, size = 60 }) => {
    return (
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
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 overflow-hidden flex flex-col">
      {/* Floating Background Elements - Hidden on small mobile for performance/visuals */}
      <div className="hidden sm:block">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-lg py-3 [@media(max-width:1024px)_and_(max-height:800px)]:py-2 [@media(max-width:430px)]:py-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-end"
          >
            <img
              src="/Logo.png"
              alt="OpsNav"
              className="h-7 sm:h-8 md:h-9 w-auto [@media(max-width:1024px)_and_(max-height:800px)]:h-8 [@media(max-width:430px)]:h-6"
            />
            <span className="text-[10px] text-gray-400 font-medium mt-1 leading-none">v5.0.2</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHome}
            className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2 [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(max-width:430px)]:px-2.5 [@media(max-width:430px)]:text-xs"
          >
            <HomeIcon className="w-4 h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-3 [@media(max-width:1024px)_and_(max-height:800px)]:h-3" />
            <span className="[@media(max-width:340px)]:hidden">
              Back to Home
            </span>
            <span className="hidden [@media(max-width:340px)]:inline">
              Home
            </span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 pt-16 [@media(max-width:1024px)_and_(max-height:800px)]:pt-10 [@media(max-width:430px)]:pt-20 [@media(max-width:430px)]:px-3">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 [@media(max-width:1024px)_and_(max-height:800px)]:gap-4 [@media(max-width:430px)]:gap-6">
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Badge - Hidden on small mobile & tablet (768px), visible on 1024px+ */}
            <div className="inline-flex [@media(max-width:340px)]:hidden md:hidden lg:inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#2E3D99]/20 [@media(max-width:1024px)_and_(max-height:800px)]:mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:py-1 [@media(max-width:430px)]:mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Enterprise Security Portal
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:text-2xl [@media(max-width:1024px)_and_(max-height:800px)]:mb-2 [@media(max-width:430px)]:text-2xl [@media(max-width:340px)]:text-xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                OpsNav Admin
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl [@media(max-width:1024px)_and_(max-height:800px)]:mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(max-width:430px)]:text-sm [@media(max-width:430px)]:mb-6">
              Access your secure workspace with advanced security features and
              role-based permissions for streamlined operations
              management.
            </p>

            {/* Feature List - VISIBLE on 1024px (lg:block), HIDDEN on <1024px (hidden) */}
            <div className="space-y-4 hidden lg:block [@media(max-width:1024px)_and_(max-height:800px)]:space-y-2">
              {[
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description:
                    "End-to-end encryption & role-based access control",
                },
                {
                  icon: Lock,
                  title: "Secure Authentication",
                  description:
                    "Advanced security protocols & multi-layer protection",
                },
                {
                  icon: User,
                  title: "Role-Based Access",
                  description: "Tailored permissions for different user roles",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-[#2E3D99]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 [@media(max-width:1024px)_and_(max-height:800px)]:p-4 [@media(min-width:1024px)_and_(max-height:800px)]:p-6 [@media(max-width:430px)]:p-5">
              <div className="text-center mb-6 [@media(max-width:1024px)_and_(max-height:800px)]:mb-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-10 [@media(max-width:1024px)_and_(max-height:800px)]:h-10 [@media(max-width:1024px)_and_(max-height:800px)]:mb-2">
                  <Lock className="w-7 h-7 text-white [@media(max-width:1024px)_and_(max-height:800px)]:w-5 [@media(max-width:1024px)_and_(max-height:800px)]:h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 [@media(max-width:1024px)_and_(max-height:800px)]:text-xl [@media(max-width:430px)]:text-xl">
                  Admin Portal
                </h2>
                <p className="text-gray-600 mt-2 [@media(max-width:1024px)_and_(max-height:800px)]:mt-0 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                  Sign in to access your dashboard
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 [@media(max-width:1024px)_and_(max-height:800px)]:space-y-2 [@media(min-width:1024px)_and_(max-height:800px)]:space-y-4 [@media(max-width:430px)]:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:mb-1 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-2.5"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:mb-1 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-2.5"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 rounded-lg p-4 [@media(max-width:1024px)_and_(max-height:800px)]:p-2"
                  >
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                        {loginError}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 [@media(max-width:1024px)_and_(max-height:800px)]:py-2 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-3"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 [@media(max-width:1024px)_and_(max-height:800px)]:w-4 [@media(max-width:1024px)_and_(max-height:800px)]:h-4" />
                    </>
                  )}
                </motion.button>

                <div className="text-center pt-4 border-t border-gray-100 [@media(max-width:1024px)_and_(max-height:800px)]:pt-2">
                  <p className="text-sm text-gray-500 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                    Need help?{" "}
                    <Link
                      to="/contact-support"
                      className="text-[#2E3D99] hover:underline font-medium"
                    >
                      Contact Support
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center [@media(max-width:640px)]:relative [@media(max-width:640px)]:pb-4 [@media(max-width:640px)]:pt-6 [@media(min-width:768px)_and_(max-height:750px)]:static [@media(min-width:768px)_and_(max-height:750px)]:pb-2">
        <p className="text-sm text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span> |
          Secure Operations Platform
        </p>
      </footer>
    </div>
  );
}

export default AdminLogin;
