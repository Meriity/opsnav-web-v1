import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Check, ChevronDown, X } from "lucide-react";

/**
 * WillsSmartTips - A sidebar/collapsible component that displays helpful tips.
 */
const WillsSmartTips = ({ tips, isMobile = false, isOpen = false, onToggle, isInline = false, footer }) => {
  if (!tips || (tips.length === 0 && !footer)) return null;

  const [isExpanded, setIsExpanded] = React.useState(true);

  const headerContent = (
    <button 
      onClick={() => {
        if (!isMobile) {
          setIsExpanded(!isExpanded);
        }
      }}
      disabled={isMobile}
      className={`w-full flex items-center justify-between focus:outline-none group text-left ${isMobile ? "" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-2.5 text-[#2E3D99]">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-50">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500/10" />
        </div>
        <h3 className="font-bold text-[15px] tracking-tight">Smart Tips</h3>
      </div>
      {!isMobile && (
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#2E3D99] transition-colors" />
        </motion.div>
      )}
      {isMobile && (
        <div 
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggle(); 
          }} 
          className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
        >
          <X size={18} />
        </div>
      )}
    </button>
  );

  const bodyContent = (
    <div className="space-y-5">
      {tips.map((tip, idx) => (
        <div key={idx} className="flex items-start gap-3 group">
          <div className="mt-1 flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-[#2E3D99]" strokeWidth={3} />
          </div>
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
            {tip}
          </p>
        </div>
      ))}
    </div>
  );

  const content = (
    <div className={`flex flex-col ${!isInline ? "bg-white rounded-3xl border border-gray-100 shadow-sm" : ""} ${isMobile ? "w-full bg-white rounded-3xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-200" : !isInline ? "sticky top-8" : ""}`}>
      {isMobile ? (
        <>
          {headerContent}
          {bodyContent}
        </>
      ) : (
        <>
          {/* Header with padding */}
          <div className="p-8 pb-4">
            {headerContent}
          </div>
          
          {/* Collapsible Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-8 pt-2 space-y-6">
                  {bodyContent}
                  {footer && (
                    <div className="pt-6 border-t border-gray-200/50">
                      {footer}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[70] lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return <div className={`hidden lg:block ${isInline ? "w-full" : "w-72 flex-shrink-0"}`}>{content}</div>;
};

export default WillsSmartTips;
