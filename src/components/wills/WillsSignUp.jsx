import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HomeIcon, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Eye,
  EyeOff,
  History,
  ListChecks,
  Lightbulb
} from "lucide-react";
import { APP_VERSION } from "../../config/version";
import WillsAPI from "../../api/willsAPI";
import PasswordStrengthMeter from "../../components/ui/PasswordStrengthMeter";
import WillsForgotPasswordModal from "./WillsForgotPasswordModal";

const WillsSignUp = ({ onSignUp, firmId }) => {
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  const api = useRef(new WillsAPI());
  
  // Returning User Detection
  useEffect(() => {
    const returningEmail = localStorage.getItem("clientEmail");
    if (returningEmail && !isLoginForm && !infoMessage) {
      setIsLoginForm(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSuccess = async (response, email) => {
    // Save token
    const token = response.token || response.authToken || response.data?.token;
    if (token) {
      localStorage.setItem("clientAuthToken", token);
      localStorage.setItem("clientEmail", email);
    }

    // 1. Extract matterReferenceNumber from login data
    const refNumber = response.matterReferenceNumber || response.data?.matterReferenceNumber;
    
    let loadedData = null;
    if (refNumber) {
      localStorage.setItem("matterReferenceNumber", refNumber);
      
      // 2. Automatically call LOAD FORM (GET /v1/:ref)
      try {
        const loadResponse = await api.current.loadFormV1(refNumber);
        loadedData = loadResponse.data || loadResponse;
      } catch (loadErr) {
        console.error("Secondary Load Form error:", loadErr);
        // We don't block login if load fails, but we log it
      }
    }

    // Extract name for personalization
    const finalName = loadedData?.personal?.fullName || response.fullName || response.name || response.data?.fullName || response.data?.name || formData.fullName || "User";
    localStorage.setItem("clientName", finalName);

    onSignUp({ 
      email: email, 
      name: finalName, 
      referenceNumber: refNumber,
      loadedData: loadedData 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLoginForm) {
        console.log("[WillsSignUp] Initiating LOGIN flow for:", formData.email);
        if (!formData.email.trim()) throw new Error("Email is required");
        if (!formData.password.trim()) throw new Error("Password is required");

        const response = await api.current.login({
          email: formData.email,
          password: formData.password
        });
        console.log("[WillsSignUp] Login successful");
        await handleLoginSuccess(response, formData.email);
      } else {
        console.log("[WillsSignUp] Initiating SIGNUP flow for:", formData.email);
        
        // 1. Basic validation
        if (!formData.fullName.trim()) throw new Error("Full name is required");
        if (!formData.email.trim()) throw new Error("Email is required");
        if (!formData.password.trim()) throw new Error("Password is required");

        // 2. Password Strength Check (Pre-flight)
        if (passwordStrength < 3) {
          throw new Error("Password requirement not met.");
        }

        // 3. Attempt Signup
        try {
          console.log("[WillsSignUp] Calling SIGNUP API...");
          const response = await api.current.signup({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            firmId: firmId // Passed from parent
          });
          
          console.log("[WillsSignUp] Signup successful");
          
          // Save reference number
          const refNumber = response.matterReferenceNumber || response.data?.matterReferenceNumber;
          if (refNumber) localStorage.setItem("matterReferenceNumber", refNumber);
          
          // Save token if returned
          const token = response.token || response.authToken || response.data?.token;
          if (token) {
            localStorage.setItem("clientAuthToken", token); 
            localStorage.setItem("clientEmail", formData.email);
            localStorage.setItem("clientName", formData.fullName);
          }

          if (onSignUp) onSignUp({ 
            email: formData.email, 
            name: formData.fullName, 
            referenceNumber: refNumber 
          });
        } catch (signupErr) {
          const msg = signupErr.message.toLowerCase();
          const alreadyExists = msg.includes("already") || msg.includes("exists") || msg.includes("registered");
          
          if (alreadyExists) {
            console.log("[WillsSignUp] Detection: User already exists. Switching to Login flow.");
            setIsLoginForm(true);
            setError("You've already registered! Please sign in with your credentials.");
            setIsLoading(false);
            return;
          }

          // Otherwise re-throw the actual signup error
          throw signupErr;
        }
      }
    } catch (err) {
      console.error("[WillsSignUp] Auth error:", err);
      
      // Improved error message mapping
      let displayError = err.message || "An unexpected error occurred";
      
      // Map common backend error strings to user-friendly messages
      const errorMap = {
        "Missing required fields": "Registration failed. Please ensure Name, Email, and Password are all filled out.",
        "Email already exists": "This email is already registered. Please sign in instead.",
        "Invalid credentials": "The email or password you entered is incorrect.",
        "Internal server error": "Our server is having trouble. Please try again in a few minutes.",
        "Firm not found": "Law firm identity missing. Please use the link provided by your solicitor.",
        "Failed to fetch": "Connection lost. Please check your internet and try again.",
        "Unauthorized": "Your session has expired or is invalid. Please sign in again."
      };

      // Check for partial matches or exact matches in the map
      for (const [key, value] of Object.entries(errorMap)) {
        if (displayError.toLowerCase().includes(key.toLowerCase())) {
          displayError = value;
          break;
        }
      }

      setError(displayError);
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
            onClick={() => window.location.href = "/admin/dashboard"}
            className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center pt-32 pb-12 overflow-visible">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-start items-center justify-center gap-12 lg:gap-24 xl:gap-32">
          
          {/* Left Side: Wills Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left lg:pt-8 xl:pt-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#2E3D99]/20">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Wills Form</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight leading-tight">
              {isLoginForm ? "Welcome Back to Your" : "Begin Your Will"} <br />
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                {isLoginForm ? "Secure Session" : "Preparation Journey"}
              </span>
            </h1>

            <p className="text-sm text-gray-600 mb-8 max-w-xl">
              {isLoginForm 
                ? "Sign in to seamlessly continue your Will preparation. Your information remains securely stored and protected at all times."
                : "Create your account to start preparing your Will. You’ll be guided through a structured, step-by-step process designed to make completion simple and straightforward. Your progress is saved automatically, so you can return at any time."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 hidden lg:grid max-w-2xl mt-4">
              {[
                { icon: ShieldCheck, title: "Secure & Compliant", desc: "Aligned with Australian Data Privacy Standards" },
                { icon: ListChecks, title: "Step-by-Step Guidance", desc: "Broken into easy stages for simple progression" },
                { icon: History, title: "Progress Save & Resume", desc: "Return anytime and continue where you left off" },
                { icon: Lightbulb, title: "Smart Assistance", desc: "Expert tips and guidance to help you complete your form" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-[#EDF2FE] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#2E3D99]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-[#2E3D99] text-[15px] leading-tight">{item.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
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
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 relative z-20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                
                {/* Mode Switcher Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6 max-w-[240px] mx-auto border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginForm(false);
                      setError("");
                      setInfoMessage("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      !isLoginForm 
                        ? "bg-white text-[#2E3D99] shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    SIGN UP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginForm(true);
                      setError("");
                      setInfoMessage("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isLoginForm 
                        ? "bg-white text-[#2E3D99] shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    SIGN IN
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  {isLoginForm ? "Sign In to Account" : "Initialise Your Account"}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {isLoginForm ? "Enter your credentials to continue" : "Please provide your details to proceed"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {infoMessage ? (
                     <motion.div
                        key="identity-badge"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 mb-2 shadow-sm"
                     >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white flex-shrink-0">
                           {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : (formData.email ? formData.email.charAt(0).toUpperCase() : "U")}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Account Found</p>
                           <p className="font-semibold text-gray-800 truncate">{formData.email}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { 
                            setInfoMessage(""); 
                            setIsLoginForm(false);
                            setFormData(prev => ({ ...prev, password: "" })); // Clear password for new attempt
                          }} 
                          className="text-xs font-semibold text-[#2E3D99] hover:bg-blue-50 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm transition-all hover:border-[#2E3D99]/30"
                        >
                          Change
                        </button>
                     </motion.div>
                  ) : (
                    <motion.div
                       key="signup-fields"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="space-y-5"
                    >
                      <AnimatePresence initial={false}>
                        {!isLoginForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required={!isLoginForm}
                                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                                placeholder="John Doe"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>


                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator (Signup Only) - Moved here for better DOM isolation */}
                  <AnimatePresence>
                    {!isLoginForm && !infoMessage && formData.password && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-3 mb-2"
                      >
                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                          <h3 className="font-semibold text-gray-800 text-[13px] mb-2">Password Requirements:</h3>
                          <PasswordStrengthMeter 
                            password={formData.password} 
                            onStrengthChange={setPasswordStrength} 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isLoginForm && (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-[12px] font-bold text-[#2E3D99] hover:text-[#1D97D7] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {!isLoginForm && (
                  <div className="flex items-start gap-3 mb-6">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-[#2E3D99] border-gray-300 rounded focus:ring-[#2E3D99] cursor-pointer"
                      />
                    </div>
                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
                    I agree to the <a href="/terms" className="text-[#2E3D99] font-semibold border-b border-[#2E3D99]/30 hover:border-[#2E3D99] transition-all">terms of privacy</a> of collecting and processing my data.
                    </label>                  </div>
                )}

                {/* Red Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-100 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                         <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                         {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading || (!isLoginForm && !agreedToTerms)}
                  whileHover={(!isLoginForm && !agreedToTerms) ? {} : { scale: 1.02 }}
                  whileTap={(!isLoginForm && !agreedToTerms) ? {} : { scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale-[0.3] group shadow-md"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {infoMessage ? "Sign In to Continue" : (isLoginForm ? "Sign In" : "Complete Sign Up")}
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                <p className="text-sm text-gray-500">
                  {isLoginForm ? "New to Wills?" : "Returning to your form?"}{" "}
                  <button 
                    type="button"
                    onClick={() => {
                        setIsLoginForm(!isLoginForm);
                        setInfoMessage("");
                        setError("");
                    }} 
                    className="text-[#2E3D99] border-b border-[#2E3D99]/30 hover:border-[#2E3D99] font-bold transition-all ml-1"
                  >
                    {isLoginForm ? "Create an account" : "Sign in here"}
                  </button>
                </p>
                <div className="mt-4">
                   <p className="text-[11px] text-gray-400">
                     Please read our <span className="text-[#2E3D99] font-medium border-b border-[#2E3D99]/40 hover:border-[#2E3D99] cursor-pointer transition-all">Privacy Policy</span> before proceeding.
                   </p>
                </div>
              </div>
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
      <WillsForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </div>
  );
};

export default WillsSignUp;
