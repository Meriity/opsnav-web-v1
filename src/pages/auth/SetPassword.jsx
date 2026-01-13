import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthAPI from "../../api/authAPI";
import { toast } from "react-toastify";
import {
  HomeIcon,
  ArrowRight,
  Lock,
  Shield,
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";

function SetPassword() {
  const api = new AuthAPI();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter both password fields");
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please use a stronger password.");
      toast.error("Password is too weak");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.setPassword(token, password);
      if (response) {
        toast.success("Password set successfully!", {
          position: "bottom-center",
        });

        // Show success animation before navigating
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Failed to set password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHome = () => {
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

  const PasswordRequirement = ({ text, met }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          met ? "bg-green-100" : "bg-gray-100"
        }`}
      >
        {met ? (
          <CheckCircle className="w-3 h-3 text-green-600" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        )}
      </div>
      <span className={`text-xs ${met ? "text-green-600" : "text-gray-500"}`}>
        {text}
      </span>
    </motion.div>
  );

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
            <span className="text-[10px] text-gray-400 font-medium mt-1 leading-none">v5.0.3</span>
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
            {/* Badge */}
            <div className="inline-flex [@media(max-width:340px)]:hidden md:hidden lg:inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#2E3D99]/20 [@media(max-width:1024px)_and_(max-height:800px)]:mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:py-1 [@media(max-width:430px)]:mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Secure Password Setup
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:text-2xl [@media(max-width:1024px)_and_(max-height:800px)]:mb-2 [@media(max-width:430px)]:text-2xl [@media(max-width:340px)]:text-xl">
              Set Your{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Secure Password
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl [@media(max-width:1024px)_and_(max-height:800px)]:mb-4 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(max-width:430px)]:text-sm [@media(max-width:430px)]:mb-6">
              Create a strong password to protect your account. Your security is
              our top priority.
            </p>

            {/* Password Requirements */}
            <div className="space-y-3 hidden lg:block [@media(max-width:1024px)_and_(max-height:800px)]:space-y-2">
              <h3 className="font-semibold text-gray-800 text-sm">
                Password Requirements:
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <PasswordRequirement
                  text="At least 8 characters long"
                  met={password.length >= 8}
                />
                <PasswordRequirement
                  text="Contains uppercase letter"
                  met={/[A-Z]/.test(password)}
                />
                <PasswordRequirement
                  text="Contains number"
                  met={/[0-9]/.test(password)}
                />
                <PasswordRequirement
                  text="Contains special character"
                  met={/[^A-Za-z0-9]/.test(password)}
                />
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    Password Strength
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {passwordStrength === 0 && "Very Weak"}
                    {passwordStrength === 1 && "Weak"}
                    {passwordStrength === 2 && "Fair"}
                    {passwordStrength === 3 && "Good"}
                    {passwordStrength === 4 && "Strong"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      passwordStrength === 0
                        ? "w-0"
                        : passwordStrength === 1
                        ? "w-1/4 bg-red-500"
                        : passwordStrength === 2
                        ? "w-1/2 bg-yellow-500"
                        : passwordStrength === 3
                        ? "w-3/4 bg-blue-500"
                        : "w-full bg-green-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        passwordStrength === 0
                          ? "0%"
                          : passwordStrength === 1
                          ? "25%"
                          : passwordStrength === 2
                          ? "50%"
                          : passwordStrength === 3
                          ? "75%"
                          : "100%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Set Password Form */}
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
                  Create New Password
                </h2>
                <p className="text-gray-600 mt-2 text-sm [@media(max-width:1024px)_and_(max-height:800px)]:mt-0 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                  Enter a strong password for your account
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 [@media(max-width:1024px)_and_(max-height:800px)]:space-y-2 [@media(min-width:1024px)_and_(max-height:800px)]:space-y-4 [@media(max-width:430px)]:space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:mb-1 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-2.5"
                      placeholder="Enter new password"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 [@media(max-width:1024px)_and_(max-height:800px)]:mb-1 [@media(max-width:1024px)_and_(max-height:800px)]:text-xs">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all [@media(max-width:1024px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-2.5"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 [@media(max-width:1024px)_and_(max-height:800px)]:h-4 [@media(max-width:1024px)_and_(max-height:800px)]:w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Password Requirements */}
                <div className="lg:hidden space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Requirements:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <PasswordRequirement
                      text="8+ characters"
                      met={password.length >= 8}
                    />
                    <PasswordRequirement
                      text="Uppercase letter"
                      met={/[A-Z]/.test(password)}
                    />
                    <PasswordRequirement
                      text="Number"
                      met={/[0-9]/.test(password)}
                    />
                    <PasswordRequirement
                      text="Special char"
                      met={/[^A-Za-z0-9]/.test(password)}
                    />
                  </div>
                </div>

                {error && (
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
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed [@media(max-width:1024px)_and_(max-height:800px)]:py-2 [@media(max-width:1024px)_and_(max-height:800px)]:text-sm [@media(min-width:1024px)_and_(max-height:800px)]:py-3"
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
                      Setting Password...
                    </>
                  ) : (
                    <>
                      Set Password
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

export default SetPassword;
