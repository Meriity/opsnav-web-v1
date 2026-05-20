import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Eye, Maximize2, X } from "lucide-react";
import WillsPreview from "./WillsPreview";

/**
 * WillsDocumentMinimap — A live minimap preview of the final Will document.
 * Shows a scaled-down version of WillsPreview with a highlight overlay
 * that visually indicates which section of the document corresponds
 * to the current form step.
 */

// Maps each form step (1-9) to the relevant document clause/section
const STEP_TO_CLAUSE_MAP = {
  1: { label: "Introduction & Personal Details", pageIndex: 1 },
  2: { label: "Executor Appointment (Clause 5)", pageIndex: 1 },
  3: { label: "Beneficiary Provisions (Clause 11)", pageIndex: 2 },
  4: { label: "Property Distribution (Clause 8b)", pageIndex: 2 },
  5: { label: "Bank Accounts (Clause 8b)", pageIndex: 2 },
  6: { label: "Guardian Appointment (Clause 15)", pageIndex: 3 },
  7: { label: "Funeral Arrangements (Clause 16)", pageIndex: 3 },
  8: { label: "Personal Assets (Clause 12)", pageIndex: 2 },
  9: { label: "Digital Rights & Other (Clause 9)", pageIndex: 2 },
};

const WillsDocumentMinimap = ({ formData, currentStep, onNavigateToStep }) => {
  const minimapRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(0.5);
  const currentMapping = STEP_TO_CLAUSE_MAP[currentStep];

  // Dynamically calculate scale factor based on container width
  useEffect(() => {
    if (!minimapRef.current || !isExpanded) return;
    const updateScale = () => {
      const containerWidth = minimapRef.current.getBoundingClientRect().width;
      const docWidth = 830; // 794px width of WillsPreview (w-[210mm]) + scrollbars & shadow margins
      const newScale = Math.min(1, Math.max(0.25, containerWidth / docWidth));
      setScale(newScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(minimapRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isExpanded]);

  // Auto-scroll minimap container to the relevant page when step changes
  useEffect(() => {
    if (!minimapRef.current || !currentMapping || !isExpanded) return;
    const pageIndex = currentMapping.pageIndex;
    const pages = minimapRef.current.querySelectorAll(".pdf-page");
    if (pages[pageIndex]) {
      pages[pageIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentStep, currentMapping, isExpanded]);

  if (currentStep === 10) return null;

  return (
    <>
      {/* Minimap Card */}
      <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100/80 shadow-sm">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#2E3D99]/[0.03] to-[#1D97D7]/[0.03] hover:from-[#2E3D99]/[0.06] hover:to-[#1D97D7]/[0.06] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center shadow-sm">
              <Eye size={14} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-[#2E3D99] uppercase tracking-wider">Document Preview</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Live minimap of your Will</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-400 group-hover:text-[#2E3D99] transition-colors" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Current Section Indicator */}
              {currentMapping && (
                <div className="mx-4 mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-bold text-amber-700 truncate">
                    Editing: {currentMapping.label}
                  </span>
                </div>
              )}

              {/* Scaled Document Preview — uses CSS zoom so layout box scales correctly and scrolling works */}
              <div className="px-3 pb-3">
                <div
                  ref={minimapRef}
                  className="rounded-2xl border border-gray-100 overflow-y-auto overflow-x-hidden bg-gray-50/50 scrollbar-hide"
                  style={{ maxHeight: "680px" }}
                >
                  <div style={{ zoom: scale }}>
                    <WillsPreview formData={formData} onClauseClick={onNavigateToStep} isMinimap={true} />
                  </div>
                </div>

                {/* Expand button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
                  className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-[#2E3D99] bg-gray-50 hover:bg-[#2E3D99]/5 rounded-xl border border-gray-100 transition-all"
                >
                  <Maximize2 size={11} />
                  View Full Document
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Will Document Preview</h3>
                    <p className="text-[11px] text-gray-400 font-medium">Live preview with your current form data</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Current Step Indicator in Modal */}
              {currentMapping && (
                <div className="mx-6 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-700">
                    Currently editing: {currentMapping.label}
                  </span>
                </div>
              )}

              {/* Document Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="mx-auto" style={{ maxWidth: "210mm" }}>
                  <WillsPreview formData={formData} onClauseClick={(step) => { setIsFullscreen(false); onNavigateToStep?.(step); }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WillsDocumentMinimap;
