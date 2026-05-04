import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, ChevronRight, Info } from "lucide-react";

/**
 * Modal to display validation errors when attempting to submit an incomplete Wills form.
 */
const IncompleteFormModal = ({ isOpen, onClose, errors, onJumpToStep }) => {
  if (!isOpen) return null;

  // Convert error object to a sorted array of steps
  const stepsWithErrors = Object.keys(errors)
    .map(Number)
    .sort((a, b) => a - b);

  const totalErrors = Object.values(errors).flat().length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl shadow-blue-900/20 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-white to-gray-50/50 border-b border-gray-100 relative">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50">
                <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Form Incomplete</h3>
                <p className="text-[13px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  {totalErrors} {totalErrors === 1 ? "Requirement" : "Requirements"} Missing
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Your Will is almost ready, but some mandatory sections need your attention before we can finalize the document.
            </p>
          </div>

          {/* Error List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
            {stepsWithErrors.map((step) => (
              <div 
                key={step}
                className="group p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#2E3D99]/20 transition-all hover:shadow-md hover:shadow-[#2E3D99]/5"
              >
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#2E3D99]/5 flex items-center justify-center text-[#2E3D99] font-extrabold text-[11px] border border-[#2E3D99]/10">
                      {step}
                    </span>
                    <h4 className="text-sm font-bold text-gray-800">Step {step}</h4>
                   </div>
                   <button 
                     onClick={() => onJumpToStep(step)}
                     className="flex items-center gap-1.5 text-[10px] font-bold text-[#2E3D99] uppercase tracking-wider hover:text-[#1D97D7] transition-colors"
                   >
                     Go to Step <ChevronRight size={14} />
                   </button>
                </div>
                
                <ul className="space-y-2 ml-9">
                  {errors[step].map((err, i) => (
                    <li key={i} className="text-xs text-gray-500 font-medium flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-gray-400">
               <Info size={14} />
               <span className="text-[11px] font-bold uppercase tracking-wider">Tap a step to fix it</span>
             </div>
             <button
               onClick={onClose}
               className="px-8 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
               Got it, I'll Fix it
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IncompleteFormModal;
