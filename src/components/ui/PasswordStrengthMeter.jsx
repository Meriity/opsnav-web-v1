import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const PasswordRequirement = ({ text, met }) => (
  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${met ? "bg-green-100" : "bg-gray-100"}`}>
      {met ? <CheckCircle className="w-3 h-3 text-green-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
    </div>
    <span className={`text-[11px] sm:text-xs font-medium ${met ? "text-green-600" : "text-gray-500"}`}>{text}</span>
  </motion.div>
);

const PasswordStrengthMeter = ({ password, onStrengthChange }) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let newStrength = 0;
    const pass = password || "";
    if (pass.length >= 8) newStrength += 1;
    if (/[A-Z]/.test(pass)) newStrength += 1;
    if (/[0-9]/.test(pass)) newStrength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) newStrength += 1;
    
    setStrength(newStrength);
    if (onStrengthChange) {
      onStrengthChange(newStrength);
    }
  }, [password, onStrengthChange]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-y-2 gap-x-1 sm:gap-x-2">
        <PasswordRequirement text="8+ characters" met={(password || "").length >= 8} />
        <PasswordRequirement text="Uppercase" met={/[A-Z]/.test(password || "")} />
        <PasswordRequirement text="Number" met={/[0-9]/.test(password || "")} />
        <PasswordRequirement text="Special characters" met={/[^A-Za-z0-9]/.test(password || "")} />
      </div>
      <div className="mt-2 sm:mt-2.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Strength</span>
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
            strength < 2 ? "text-red-500" :
            strength === 2 ? "text-yellow-500" :
            "text-green-500"
          }`}>
            {strength === 0 && "Very Weak"}
            {strength === 1 && "Weak"}
            {strength === 2 && "Fair"}
            {strength === 3 && "Good"}
            {strength === 4 && "Strong"}
          </span>
        </div>
        <div className="w-full h-1.5 sm:h-2 bg-gray-100 sm:bg-gray-200 rounded-full overflow-hidden flex">
          <motion.div
            className={`h-full ${
              strength === 0 ? "w-0" : 
              strength === 1 ? "w-1/4 bg-red-500" : 
              strength === 2 ? "w-1/2 bg-yellow-400" : 
              strength === 3 ? "w-3/4 bg-blue-500" : 
              "w-full bg-green-500"
            }`}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
