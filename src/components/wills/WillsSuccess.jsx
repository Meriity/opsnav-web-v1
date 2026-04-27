import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Home, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 pointer-events-none"
    style={{
      width: size,
      height: size,
      top,
      left,
    }}
    animate={{
      y: [0, -20, 0],
      scale: [1, 1.1, 1],
      opacity: [0.1, 0.2, 0.1],
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const WillsSuccess = ({ name, referenceNumber, email }) => {
  const navigate = useNavigate();
  const brandLogo = localStorage.getItem("logo") || "/Logo.png";

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto font-inter">
      {/* Background Layer */}
      <div className="absolute inset-0 pointer-events-none fixed">
        <div className="absolute inset-0 opacity-[0.04]" style={{ 
          backgroundImage: `linear-gradient(#2E3D99 1.5px, transparent 1.5px), linear-gradient(90deg, #2E3D99 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px' 
        }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-[#2E3D99]/5" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center py-6 px-4">
        {/* 1. Refined Header Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <img 
            src="/Logo.png" 
            alt="OpsNav" 
            className="h-11 w-auto object-contain block mx-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden items-center gap-2">
             <ShieldCheck size={24} className="text-[#2E3D99]" />
             <span className="text-xl font-black text-slate-900 uppercase tracking-[4px]">OpsNav</span>
          </div>
        </motion.div>

        {/* 2. Compact Main Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white/80 backdrop-blur-sm rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(46,61,153,0.08)] p-6 md:p-10 text-center"
        >
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 rounded-2xl border border-emerald-500/20 bg-emerald-50 flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <Check size={24} className="text-emerald-500 stroke-[3]" />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Submission Confirmed
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
            Thank you, <span className="text-[#2E3D99] font-bold">{name || "Client"}</span>. Your data has been securely received under reference <span className="text-slate-900 font-bold">{referenceNumber}</span>.
          </p>

          {/* Tight Summary Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 px-7 bg-[#2E3D99]/[0.02] rounded-[24px] border border-[#2E3D99]/5 mb-8">
            <div className="text-center sm:text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Reference</p>
              <p className="text-base font-black text-slate-800 tabular-nums">{referenceNumber || "REF-PENDING"}</p>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200/60" />
            <div className="text-center sm:text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Status</p>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Received</p>
            </div>
          </div>

          {/* Compact Next Steps Section */}
          <div className="text-left space-y-5 mb-10">
            <div className="flex gap-4 group">
              <div className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0 shadow-sm">01</div>
              <div>
                <p className="text-base font-bold text-slate-800 tracking-tight">Compliance Review</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Our legal team will perform an internal compliance audit of your data within 48 hours.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0 shadow-sm">02</div>
              <div>
                <p className="text-base font-bold text-slate-800 tracking-tight">Final Execution</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">A legal practitioner will contact you at <span className="text-slate-700 font-semibold underline decoration-[#2E3D99]/20">{email}</span> to finalize the formal execution.</p>
              </div>
            </div>
          </div>

          {/* Action Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-4 bg-[#2E3D99] text-white font-bold rounded-2xl shadow-lg hover:bg-[#1E2970] transition-all flex items-center justify-center gap-2 active:scale-95 text-[11px] uppercase tracking-wider"
            >
              <Home size={16} />
              <span>Go to Dashboard</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="px-6 py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-[11px] uppercase tracking-wider shadow-sm"
            >
              <FileText size={16} className="text-[#2E3D99]" />
              <span>Generate PDF</span>
            </button>
          </div>
        </motion.div>

        {/* 3. Compact Footer Branding */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 pb-8 w-full max-w-[280px] text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
             <ShieldCheck size={18} className="text-[#2E3D99]" />
             <span className="text-[11px] font-black text-slate-900 uppercase">OpsNav™</span>
          </div>
          <button 
            onClick={() => navigate("/contact-support")}
            className="text-[10px] text-slate-400 font-bold tracking-[2px] uppercase hover:text-[#2E3D99] transition-colors cursor-pointer"
          >
            Contact OpsNav Support
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default WillsSuccess;
