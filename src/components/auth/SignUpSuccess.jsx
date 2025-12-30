import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";

export default function SignUpSuccess() {
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={800}
        gravity={0.2}
        initialVelocityY={10}
        colors={["#2E3D99", "#1D97D7", "#ffffff"]}
      />

      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
            className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-[#2E3D99]/5 blur-3xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full bg-[#1D97D7]/10 blur-3xl"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 sm:p-12 max-w-lg w-full text-center relative z-10"
      >
        {/* Logo */}
        <motion.img
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          src="/Logo.png"
          alt="OpsNav"
          className="h-10 mx-auto mb-8 w-auto"
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mx-auto w-24 h-24 bg-gradient-to-tr from-[#2E3D99] to-[#1D97D7] rounded-full flex items-center justify-center shadow-lg mb-8"
        >
          <Check className="w-12 h-12 text-white stroke-[3]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Account Created!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8 text-lg leading-relaxed"
        >
          Thank you for signing up. Our team has received your request and will contact you shortly to set up your free 14-day trial.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#2E3D99]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          Back to Home
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-sm text-gray-500"
      >
        Powered by <span className="font-bold text-[#2E3D99]">OpsNav™</span>
      </motion.p>
    </div>
  );
}
