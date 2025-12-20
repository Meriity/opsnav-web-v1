import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Lock,
  User,
  Shield,
  Sparkles,
  Building,
  Zap,
  HomeIcon,
} from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const api = new AuthAPI();
  const [matterNumber, setmatterNumber] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // // const [showPassword, setShowPassword] = useState(false);
  // const [showPostcode, setShowPostcode] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.signInClient(matterNumber, postcode);
      console.log("API Response:", response); // Good to log the whole response for debugging

      // Prioritize checking for orderId first
      if (response.clientId) {
        localStorage.removeItem("logo");
        localStorage.setItem("name", response.clientName);
        localStorage.setItem("orders", JSON.stringify(response.orders));
        localStorage.setItem("logo", response.logo);
        localStorage.setItem("company", response.company);
        localStorage.setItem("authToken", response.token);
        console.log("Navigating with orderId:", response.orderId);
        navigate(
          `/idg/client/dashboard/${encodeURIComponent(
            btoa(String(response.clientId))
          )}`
        );
      }
      // Fallback to matterNumber if orderId is not present
      else if (response.matterNumber) {
        localStorage.removeItem("matterNumber");
        localStorage.removeItem("logo");
        localStorage.setItem("matterNumber", response.matterNumber);
        localStorage.setItem("logo", response.logo);
        localStorage.setItem("company", response.company);
        navigate(`/client/dashboard/${btoa(String(response.matterNumber))}`);
      } else {
        throw new Error(
          "Login failed: No valid identifier found in the response."
        );
      }
    }catch (err) {
      toast.error(
        err.message ||
          "Authentication failed! Please check credentials and try again.",
        { position: "bottom-center" }
      );
      setError(err.message || "Authentication failed!");
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
      {/* Floating Background Elements - Hidden on small mobile */}
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
            className="w-full lg:w-1/2 text-center lg:text-left px-2"
          >
            {/* Badge */}
            <div className="inline-flex [@media(max-width:340px)]:hidden md:hidden lg:inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4 border border-[#2E3D99]/20 [@media(max-width:1024px)_and_(max-height:800px)]:mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:py-1">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Secure Operations Platform
              </span>
            </div>

            <div className="mb-4 sm:mb-5 [@media(max-width:1024px)_and_(max-height:800px)]:mb-2">
              {/* <img
                src="/Logo.png"
                alt="OpsNav Logo"
                className="h-10 sm:h-12 md:h-14 mx-auto lg:mx-0 [@media(max-width:1024px)_and_(max-height:800px)]:h-10 [@media(max-width:430px)]:h-8"
              /> */}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:text-2xl [@media(max-width:1024px)_and_(max-height:800px)]:mb-2 [@media(max-width:430px)]:text-2xl">
              Streamline with{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Precision
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-7 max-w-xl [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(max-width:1024px)_and_(max-height:800px)]:mb-4">
              Access your centralised workspace for streamlined
              operations, automated processes, and real-time insights that keep
              your team productive.
            </p>

            {/* Feature List Grid: Hidden on Mobile & Tablet (768px), Visible on 1024px (lg:grid) */}
            <div className="hidden lg:grid grid-cols-2 gap-3 sm:gap-4 [@media(max-width:1024px)_and_(max-height:800px)]:gap-2">
              {[
                {
                  icon: Shield,
                  title: "Secure",
                  description: "Enterprise-grade security",
                },
                {
                  icon: Zap,
                  title: "Fast",
                  description: "Lightning-fast performance",
                },
                {
                  icon: Building,
                  title: "Scalable",
                  description: "Grow without bottlenecks",
                },
                {
                  icon: Lock,
                  title: "Reliable",
                  description: "99.9% uptime guarantee",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 [@media(max-width:1024px)_and_(max-height:800px)]:p-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-[#2E3D99]" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 text-sm [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600 hidden xl:block">
                        {feature.description}
                      </p>
                    </div>
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
            className="w-full lg:w-1/2 max-w-sm sm:max-w-md md:max-w-lg"
          >
            {/* Card Padding */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-7 border border-gray-100 [@media(max-width:1024px)_and_(max-height:800px)]:p-4 [@media(min-width:1024px)_and_(max-height:800px)]:p-6 [@media(max-width:430px)]:p-5">
              <div className="text-center mb-4 sm:mb-5 md:mb-6 [@media(max-width:1024px)_and_(max-height:800px)]:mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-3 sm:mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-10 [@media(max-width:1024px)_and_(max-height:800px)]:h-10 [@media(max-width:1024px)_and_(max-height:800px)]:mb-2">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white [@media(max-width:1024px)_and_(max-height:800px)]:w-5 [@media(max-width:1024px)_and_(max-height:800px)]:h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 [@media(max-width:1024px)_and_(max-height:800px)]:text-xl">
                  Sign In
                </h2>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base [@media(max-width:1024px)_and_(max-height:800px)]:mt-0 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                  Access your OpsNav account
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-5 [@media(max-width:1024px)_and_(max-height:800px)]:space-y-2 [@media(min-width:1024px)_and_(max-height:800px)]:space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:mb-1">
                    Email Address / Matter Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                    </div>
                    <input
                      type="text"
                      value={matterNumber}
                      onChange={(e) => setmatterNumber(e.target.value)}
                      required
                      className="pl-9 sm:pl-10 w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all text-sm sm:text-base [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-2.5"
                      placeholder="ex : 2580824"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:mb-1">
                    Postcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                    </div>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required
                      className="pl-9 sm:pl-10 w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all text-sm sm:text-base [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-2.5"
                      placeholder="ex : Postcode"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 rounded-lg p-3 sm:p-4 [@media(max-width:1024px)_and_(max-height:800px)]:p-2"
                  >
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3"
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
                      <span className="text-xs sm:text-sm font-medium">
                        {error}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-70 text-sm sm:text-base [@media(max-width:1024px)_and_(max-height:800px)]:py-2 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-3"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"
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
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </motion.button>

                <div className="text-center pt-3 sm:pt-4 border-t border-gray-100 [@media(max-width:1024px)_and_(max-height:800px)]:pt-2">
                  <p className="text-xs sm:text-sm text-gray-500">
                    New to OpsNav?{" "}
                    <a
                      href="#"
                      className="text-[#2E3D99] hover:underline font-medium"
                    >
                      Start your free trial
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer - Static on mobile, Absolute on Desktop */}
      <footer className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-0 right-0 text-center px-3 [@media(max-width:640px)]:relative [@media(max-width:640px)]:pb-4 [@media(max-width:640px)]:pt-6 [@media(min-width:768px)_and_(max-height:750px)]:static [@media(min-width:768px)_and_(max-height:750px)]:pb-2">
        <p className="text-xs sm:text-sm text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span> |
          Streamline with Precision • Scale Without Bottlenecks
        </p>
      </footer>
    </div>
  );
}

export default LoginForm;
