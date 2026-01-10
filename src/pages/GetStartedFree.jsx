import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ArrowRight,
  ArrowLeft,
  User,
  Building,
  Mail,
  FileText,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

function GetStartedFree() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    state: "",
    address: "",
    services: {
      conveyancing: false,
      commercial: false,
      wills: false,
      printMedia: false,
    },
    additionalComments: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service],
      },
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setFormError("Please enter your name");
      return false;
    }
    if (!formData.companyName.trim()) {
      setFormError("Please enter your company name");
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return false;
    }
    if (!formData.state.trim()) {
      setFormError("Please enter your state");
      return false;
    }
    if (!formData.address.trim()) {
      setFormError("Please enter your address");
      return false;
    }
    setFormError("");
    return true;
  };

  const validateStep2 = () => {
    const selectedServices = Object.values(formData.services).filter(Boolean);
    if (selectedServices.length === 0) {
      setFormError("Please select at least one service");
      return false;
    }
    setFormError("");
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setFormError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 2 && validateStep2()) {
      setIsLoading(true);
      try {
        const payload = {
          fullName: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          state: formData.state,
          address: formData.address,
          modulesRequested: Object.entries(formData.services)
            .filter(([_, value]) => value)
            .map(([key]) => {
              switch (key) {
                case "printMedia":
                  return "Signage & Print";
                case "wills":
                  return "Wills & Estates";
                default:
                  return key.charAt(0).toUpperCase() + key.slice(1);
              }
            }),
          comments: formData.additionalComments,
          type: "free_trial",
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/lead`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Free trial request failed");
        }

        toast.success(
          "Thank you for requesting a free trial! Our team will contact you shortly."
        );
        navigate("/");
      } catch (error) {
        console.error("Free trial request error:", error);
        setFormError(
          error.message || "Something went wrong. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
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

  const servicesList = [
    { id: "conveyancing", label: "Conveyancing", icon: "🏠" },
    { id: "commercial", label: "Commercial", icon: "💼" },
    { id: "wills", label: "Wills", icon: "📝" },
    { id: "printMedia", label: "Signage & Print", icon: "📰" },
  ];

  // Step 1: Basic Information - Compact
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all"
            placeholder="John Smith"
          />
        </div>
      </div>

      {/* Company Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            required
            className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all"
            placeholder="Your Company Ltd"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all"
            placeholder="you@company.com"
          />
        </div>
      </div>

      {/* State Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State *
        </label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50"
          placeholder="Victoria"
        />
      </div>

      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 resize-none"
          placeholder="Office address"
        />
      </div>

      {/* Form Error */}
      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5"
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
            <span className="text-xs font-medium">{formError}</span>
          </div>
        </motion.div>
      )}

      {/* Next Button */}
      <motion.button
        type="button"
        onClick={nextStep}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );

  // Step 2: Services & Comments - Compact
  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Services Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Interested In *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {servicesList.map((service) => (
            <motion.button
              key={service.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleServiceChange(service.id)}
              className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all text-sm ${
                formData.services[service.id]
                  ? "bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 border-[#2E3D99] text-[#2E3D99]"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="text-sm">{service.icon}</span>
              <span className="font-medium">{service.label}</span>
              {formData.services[service.id] && (
                <CheckCircle className="w-3.5 h-3.5 ml-auto" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Additional Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Comments (Optional)
        </label>
        <div className="relative">
          <div className="absolute top-2.5 left-3 pointer-events-none">
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <textarea
            name="additionalComments"
            value={formData.additionalComments}
            onChange={handleInputChange}
            rows="2"
            className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] transition-all resize-none"
            placeholder="Any specific requirements or questions..."
          />
        </div>
      </div>

      {/* Form Error */}
      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5"
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
            <span className="text-xs font-medium">{formError}</span>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          type="button"
          onClick={prevStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Processing...
            </>
          ) : (
            <>
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>

      {/* Terms & Privacy Note - ONLY in Step 2 */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          By clicking "Start Free Trial", you agree to our{" "}
          <a href="/terms" className="text-[#2E3D99] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#2E3D99] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
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
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-lg py-3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-end"
          >
            <img
              src="/Logo.png"
              alt="OpsNav"
              className="h-8 sm:h-9 md:h-10 w-auto"
            />
            <span className="text-[10px] text-gray-400 font-medium mt-1 leading-none">v5.0.1</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHome}
            className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content - Compact */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 pt-16">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4 border border-[#2E3D99]/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">
                Start Your Free Trial
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Get Started with{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                OpsNav Free Trial
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-xl">
              Experience the power of OpsNav with our 14-day free trial. No
              credit card required. Fill out the form and our team will contact
              you to set up your personalized trial.
            </p>

            {/* Progress Steps - Main indicator (Desktop) */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center justify-start gap-1.5 mb-3">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                        currentStep === step
                          ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                          : currentStep > step
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 2 && (
                      <div
                        className={`w-8 h-1 mx-1.5 ${
                          currentStep > step ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-start gap-8 text-xs">
                <span
                  className={`font-medium ${
                    currentStep === 1
                      ? "text-[#2E3D99]"
                      : currentStep > 1
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Basic Info
                </span>
                <span
                  className={`font-medium ${
                    currentStep === 2 ? "text-[#2E3D99]" : "text-gray-500"
                  }`}
                >
                  Services
                </span>
              </div>
            </div>

            {/* Benefits List - Hidden on smaller screens */}
            <div className="space-y-3 hidden lg:block">
              {[
                {
                  icon: "🚀",
                  title: "14-Day Free Trial",
                  description:
                    "Full access to all features, no credit card required",
                },
                {
                  icon: "🔒",
                  title: "Secure & Compliant",
                  description:
                    "Enterprise-grade security aligned with Data Privacy Act",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 flex items-center justify-center flex-shrink-0 text-base">
                    {benefit.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block mt-8 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Powered by{" "}
                <span className="font-bold text-[#2E3D99]">OpsNav™</span>
              </p>
            </div>
          </motion.div>

          {/* Right Side - Compact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              {/* Mobile: Step indicator instead of icon */}
              <div className="text-center mb-4">
                {/* Desktop: Show User icon */}
                <div className="hidden sm:block">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Mobile: Show step indicator with actual labels */}
                <div className="sm:hidden mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {[1, 2].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                            currentStep === step
                              ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                              : currentStep > step
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 2 && (
                          <div
                            className={`w-8 h-1 mx-1 ${
                              currentStep > step
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-8 text-xs">
                    <span
                      className={`font-medium ${
                        currentStep === 1
                          ? "text-[#2E3D99]"
                          : currentStep > 1
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Basic Info
                    </span>
                    <span
                      className={`font-medium ${
                        currentStep === 2 ? "text-[#2E3D99]" : "text-gray-500"
                      }`}
                    >
                      Services
                    </span>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {currentStep === 1
                    ? "Create Your Free Trial"
                    : "Select Services"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {currentStep === 1
                    ? "Enter your basic information"
                    : "Choose your services and preferences"}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 ? renderStep1() : renderStep2()}
                </AnimatePresence>

                {/* Already have account - Always visible */}
                <div className="text-center pt-3">
                  <p className="text-xs text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/admin/login")}
                      className="text-[#2E3D99] hover:underline font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Compact Footer */}
      <footer className="absolute bottom-2 left-0 right-0 text-center lg:hidden">
        <p className="text-xs text-gray-600">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span>
        </p>
      </footer>
    </div>
  );
}

export default GetStartedFree;
