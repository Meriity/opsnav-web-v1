import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Zap,
  History,
  Lightbulb,
  HomeIcon
} from "lucide-react";
import { APP_VERSION } from "../../config/version";
import WillsAPI from "../../api/willsAPI";
import PasswordStrengthMeter from "../../components/ui/PasswordStrengthMeter";

const WillsResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const api = new WillsAPI();

  useEffect(() => {
    // Debug token presence
    console.log("[WillsResetPassword] Token from URL:", token);
    
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
      setStatus("error");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordStrength < 3) {
      setError("Please choose a stronger password.");
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(token, password);
      setStatus("success");
    } catch (err) {
      console.error("Reset password error:", err);
      // Specifically handle the "Token and new password required" message if it comes from backend
      const errMsg = err.message || "Failed to reset password. The link may have expired.";
      setError(errMsg);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 pointer-events-none"
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 overflow-x-hidden overflow-y-auto flex flex-col font-sans">
      {/* Static Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="hidden sm:block pointer-events-none">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-lg py-3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex flex-col items-end">
            <img src="/Logo.png" alt="OpsNav" className="h-7 sm:h-8 md:h-9 w-auto" />
            <span className="text-[10px] text-gray-400 font-medium mt-1 leading-none">{APP_VERSION}</span>
          </div>

          <button
            onClick={() => navigate("/wills/form")}
            className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center pt-20 pb-4 overflow-visible">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-center gap-6 lg:gap-12 xl:gap-20">
          
          {/* Left Side: Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left lg:pb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 border border-[#2E3D99]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[12px] font-bold text-gray-700">Security Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-[38px] font-bold text-gray-800 mb-2 tracking-tight leading-tight">
              Reset Your <br />
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Account Password
              </span>
            </h1>

            <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto lg:mx-0">
              Choose a strong, unique password to secure your Will preparation journey.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 hidden lg:grid max-w-2xl">
              {[
                { icon: Zap, title: "Instant Recovery", desc: "Regain access to your secure session immediately" },
                { icon: ShieldCheck, title: "Enterprise Security", desc: "Encryption standards aligned with legal compliance" },
                { icon: History, title: "Seamless Continuity", desc: "Resume your form exactly where you left off" },
                { icon: Lightbulb, title: "Expert Guidance", desc: "Tips to help you choose a secure and memorable password" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-white/60 shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300">
                  <div className="w-9 h-9 rounded-lg bg-[#EDF2FE] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-[#2E3D99]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-[#2E3D99] text-[13px] leading-tight">{item.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-[24px] shadow-2xl p-5 sm:p-6 border border-gray-100 relative z-20">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-sm border border-emerald-100">
                      <CheckCircle2 size={40} className="stroke-[1.5]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Updated</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-10">
                      Your password has been successfully reset. You can now use your new credentials to access your account.
                    </p>
                    <button
                      onClick={() => navigate("/wills/form")}
                      className="w-full py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>Sign In Now</span>
                      <ArrowRight size={18} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] mb-3 shadow-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800 leading-tight">Set New Password</h2>
                      <p className="text-gray-500 mt-0.5 text-[9px] font-black uppercase">ACCOUNT SECURITY</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">New Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Lock className="h-3.5 h-3.5 text-gray-300" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/10 transition-all font-medium"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Confirm Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <ShieldCheck className="h-3.5 h-3.5 text-gray-300" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="w-full pl-10 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/10 transition-all font-medium"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      {password && (
                        <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100 shadow-inner">
                          <h3 className="font-bold text-gray-800 text-[11px] mb-1.5">Requirements:</h3>
                          <PasswordStrengthMeter password={password} onStrengthChange={setPasswordStrength} />
                        </div>
                      )}

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3"
                          >
                            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[12px] text-red-600 font-medium leading-relaxed">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={isLoading || !token}
                        className="w-full py-3.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-bold rounded-xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group shadow-md"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Update Password</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                       <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                         Need assistance? <button onClick={() => navigate("/contact-support")} className="text-[#2E3D99] font-bold hover:underline">Contact OpsNav Support</button>
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 mt-auto relative z-20 border-t border-[#2E3D99]/5 hidden sm:block">
        <p className="text-sm text-gray-600">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span> | Secure Operations Platform
        </p>
      </footer>
      
      {/* Mobile Footer */}
      <footer className="w-full text-center py-4 mt-auto relative z-20 border-t border-[#2E3D99]/5 sm:hidden bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-gray-500">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span>
        </p>
      </footer>
    </div>
  );
};

export default WillsResetPassword;
