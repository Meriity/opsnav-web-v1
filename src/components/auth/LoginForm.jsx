import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const api = new AuthAPI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.signIn(email, password);

      if (!response.token) {
        throw new Error(response.message || "Authentication failed");
      }

      // Store token and role
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", response.user.displayName);
      localStorage.setItem("role", response.role);

      // Navigate to work-selection and pass success state
      let targetPath = location.state?.from?.pathname || location.state?.from;

      if (!targetPath) {
        targetPath =
          response.role === "admin"
            ? "/admin/work-selection"
            : "/user/work-selection";
      }

      const timestamp = new Date().getTime();
      const separator = targetPath.includes("?") ? "&" : "?";
      window.location.href = `${targetPath}${separator}refresh=${timestamp}`;
    } catch (err) {
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
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 overflow-hidden">
      {/* Floating Background Elements */}
      <FloatingElement top={10} left={10} delay={0} />
      <FloatingElement top={20} left={85} delay={1} size={80} />
      <FloatingElement top={70} left={5} delay={2} size={40} />
      <FloatingElement top={80} left={90} delay={1.5} size={100} />

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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#2E3D99]/20">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Secure Operations Platform
              </span>
            </div>

            <div className="mb-6 flex flex-col items-end w-fit mx-auto lg:mx-0">
              <img
                src="/Logo.png"
                alt="OpsNav Logo"
                className="h-16"
              />
              <span className="text-xs text-gray-400 font-medium mt-1 leading-none">v5.1.1</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Streamline with{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Precision
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              Access your centralised workspace for streamlined
              operations, automated processes, and real-time insights that keep
              your team productive and moving forward.
            </p>

            <div className="grid grid-cols-2 gap-4">
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
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 flex items-center justify-center mb-2">
                    <feature.icon className="w-5 h-5 text-[#2E3D99]" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {feature.description}
                  </p>
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
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                <p className="text-gray-600 mt-2">Access your OpsNav account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 rounded-lg p-4"
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
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
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

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-gray-600">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span> |
          Streamline with Precision • Scale Without Bottlenecks
        </p>
      </footer>
    </div>
  );
}

export default LoginForm;
