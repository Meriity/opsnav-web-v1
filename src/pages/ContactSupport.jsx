// ContactSupport.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  HomeIcon,
  ArrowRight,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Shield,
  Clock,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";

function ContactSupport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    issueType: "OTHER",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHome = () => {
    navigate("/");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setFormError("Please enter your full name");
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return false;
    }
    if (!formData.message.trim()) {
      setFormError("Please describe your issue");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setFormError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to submit support request"
        );
      }

      toast.success("Support request submitted successfully!", {
        position: "bottom-center",
      });
      setIsSubmitted(true);

      setTimeout(() => {
        setFormData({
          fullName: "",
          email: "",
          issueType: "OTHER",
          message: "",
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Failed to submit support request", {
        position: "bottom-center",
      });
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

  const issueTypes = [
    { value: "PASSWORD_RESET", label: "Password Reset" },
    { value: "ACCOUNT_ACCESS", label: "Account Access" },
    { value: "EMAIL_CHANGE", label: "Email Change" },
    { value: "OTHER", label: "Other Issue" },
  ];

  const quickTips = [
    {
      icon: Clock,
      title: "Quick Response",
      description: "We typically respond within 2 business hours",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your information is encrypted and confidential",
    },
    {
      icon: HelpCircle,
      title: "Common Solutions",
      description: "Check our FAQ for quick answers to common questions",
    },
  ];

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
            className="flex items-center gap-2 sm:gap-3"
          >
            <img
              src="/Logo.png"
              alt="OpsNav"
              className="h-7 sm:h-8 md:h-9 w-auto"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHome}
            className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 pt-16">
        <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6 border border-[#2E3D99]/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">
                Support Center
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Need{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Help?
              </span>
            </h1>

            <p className="text-gray-600 mb-6 text-sm">
              Our support team is here to help you with any issues or questions.
              Fill out the form and we'll get back to you promptly.
            </p>

            {/* Quick Tips */}
            <div className="space-y-4 mb-6">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-4 h-4 text-[#2E3D99]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {tip.title}
                    </h3>
                    <p className="text-xs text-gray-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Alternative Contact:
              </p>
              <p className="text-xs text-gray-600">
                Email:{" "}
                <a
                  href="mailto:support@opsnav.com"
                  className="text-[#2E3D99] hover:underline"
                >
                  support@opsnav.com
                </a>
              </p>
             
            </div>
          </motion.div>

          {/* Right Side - Compact Support Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-gray-100">
              {/* Success Message */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 bg-green-50 border border-green-100 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Request submitted! We'll contact you shortly.
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-2">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Contact Support
                </h2>
                <p className="text-gray-600 mt-1 text-xs">
                  How can we help you today?
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]"
                      placeholder="John Smith"
                    />
                  </div>
                </div>

                {/* Email - Compact */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99]"
                      placeholder="support@opsnav.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This is our support email. Enter your own email address to
                    receive our response.
                  </p>
                </div>

                {/* Issue Type - Compact */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Issue Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {issueTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            issueType: type.value,
                          }))
                        }
                        className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                          formData.issueType === type.value
                            ? "bg-[#2E3D99] text-white border-[#2E3D99]"
                            : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/50 focus:border-[#2E3D99] resize-none"
                    placeholder="Briefly describe your issue..."
                  />
                </div>

                {/* Form Error */}
                {formError && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-medium">{formError}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || isSubmitted}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
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
                      Submitting...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-gray-600">
          Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span>
        </p>
      </footer>
    </div>
  );
}

export default ContactSupport;
