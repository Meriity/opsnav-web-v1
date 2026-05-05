  import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, X, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import WillsAPI from "../../api/willsAPI";

const WillsForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [error, setError] = useState("");
  
  const api = new WillsAPI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");
    
    try {
      // Assuming endpoint exists or will be added: POST /wills/form/v1/forgot-password
      // If not, this serves as the UI implementation
      await api.forgotPassword(email);
      setStatus("success");
    } catch (err) {
      console.error("Forgot password error:", err);
      
      const msg = err.message || "";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        setError("We couldn't find an account with that email. Please check your email or contact support.");
      } else {
        setError("Failed to send recovery email. Please try again later.");
      }
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 sm:p-10">
            {status === "success" ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-sm border border-emerald-100">
                  <CheckCircle2 size={40} className="stroke-[1.5]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  We've sent password recovery instructions to <br />
                  <span className="text-gray-900 font-bold">{email}</span>
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#2E3D99]/5 rounded-2xl flex items-center justify-center text-[#2E3D99] border border-[#2E3D99]/10">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Forgot Password?</h3>
                    <p className="text-xs text-gray-500 font-medium">No worries, we'll help you reset it.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-300" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/20 transition-all placeholder:text-gray-300 font-medium"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3"
                    >
                      <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-red-600 font-medium leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Instructions</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
          
          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[3px]">
              Secure Authentication by <span className="text-[#2E3D99]">OpsNav™</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WillsForgotPasswordModal;
