import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Stages({ stageName, data }) {

    function bgcolor(status){
    switch(status){
      case "In progress":
        return "bg-[#FFEECF]";
      case "Completed":
        return "bg-[#00A506]";
      case "Not Completed":
        return "bg-[#FF0000]"  
    }
  }
  const [expanded, setExpanded] = useState(true);




  return (
    <div className="overflow-x-hidden overflow-y-hidden">
      {/* Header Row */}
      <div
        className="flex w-full max-w-[1720px] p-4 bg-white rounded-t-xl items-center gap-6 mt-5 mx-auto cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {/* Chevron Toggle */}
        <div className="w-[50px] flex justify-center items-center">
          {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>

        {/* Stage Name */}
        <div className="w-[240px] flex items-center h-[50px]">
          <p className="text-[20px] text-gray-800">{stageName}</p>
        </div>

        {/* Status Sections */}
        {data.sections.map((section, idx) => (
          <div key={idx} className="flex items-center gap-4 w-[240px] h-[50px]">
            <div className="w-[136px] h-[38px] flex items-center justify-center bg-white">
              <p className="text-[16px] text-gray-800 whitespace-nowrap">
                {section.title}
              </p>
            </div>
            <div
              className={`w-[104px] h-[28px] ${bgcolor(section.status)} ${section.status === "In progress" ? "text-[#FF9500]" : "text-white"} flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{section.status}</p>
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="flex flex-col justify-center w-[600px] h-[50px] overflow-hidden">
          <p className="text-[16px] text-gray-800 font-medium truncate">
            {data.noteTitle}
          </p>
          <p className="text-[14px] text-gray-700 truncate">{data.noteText}</p>
        </div>
      </div>

      {/* Animated Expand/Collapse Section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col w-full max-w-[1720px] px-[20px] py-[10px] bg-[#DDF1FF] rounded-b-xl gap-4 mx-auto">
              {data.rows.map((row, i) => (
                <div key={i} className="flex items-start gap-6">
                  {/* Align to match header */}
                  <div className="w-[50px]"></div>
                  <div className={i===0 ? "w-[240px]":"w-[180px]"}></div>

                  {/* Statuses */}
                  {row.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 w-[240px] min-h-[50px]"
                    >
                      <div className="w-[136px] h-[38px] flex items-center justify-center">
                        <p className="text-[16px] text-gray-800">
                          {section.title}
                        </p>
                      </div>
                      <div
                        className={`w-[104px] h-[28px]  ${bgcolor(section.status)} ${section.status === "In progress" ? "text-[#FF9500]" : "text-white"} flex items-center justify-center rounded-4xl`}
                      >
                        <p className="text-[12px]">{section.status}</p>
                      </div>
                    </div>
                  ))}

                  {/* Notes */}
                  {i === 0 && (
                    <div className="flex flex-col justify-center w-[600px] min-h-[50px] overflow-hidden items-start">
                      <p className="text-[16px] text-gray-800 font-semibold mb-1">
                        Comment for Client
                      </p>
                      <p className="text-[14px] text-gray-700">
                        {row.noteText}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
