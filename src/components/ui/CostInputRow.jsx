import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function CostInputRow({
  label,
  amountValue,
  noteValue,
  onAmountChange,
  onNoteChange,
  isReadOnly = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const amountInputRef = useRef(null);
  const noteInputRef = useRef(null);

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "amount") {
        noteInputRef.current?.focus();
      } else if (field === "note") {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-bold text-gray-700 text-sm md:text-base text-left">
          {label}
        </span>
        <div className="flex items-center gap-2 md:gap-4">
          {/* FONT CHANGE: Removed font-mono and other styling for a cleaner look */}
          <span className="text-gray-800 font-semibold text-sm md:text-base">
            {amountValue || "0.00"}
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-600 mb-1 block text-sm md:text-base">
                Amount
              </label>
              <input
                ref={amountInputRef}
                type="text"
                value={amountValue}
                onChange={onAmountChange}
                onKeyDown={(e) => handleKeyDown(e, "amount")}
                className="w-full rounded p-2 bg-gray-100 text-sm md:text-base"
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-600 mb-1 block text-sm md:text-base">
                Notes
              </label>
              <input
                ref={noteInputRef}
                type="text"
                value={noteValue}
                onChange={onNoteChange}
                onKeyDown={(e) => handleKeyDown(e, "note")}
                className="w-full rounded p-2 bg-gray-100 text-sm md:text-base"
                placeholder="Enter Note"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
