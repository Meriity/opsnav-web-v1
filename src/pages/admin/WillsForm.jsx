import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, FileText } from "lucide-react";
import Header from "../../components/layout/Header";
import WillsStepForm from "../../components/wills/WillsStepForm";
import WillsPreview from "../../components/wills/WillsPreview";
import { generateWillsPDF } from "../../components/utils/generateWillsPDF";

const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block pointer-events-none print:hidden"
    style={{
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
    }}
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      rotate: [0, 90, 0],
    }}
    transition={{
      duration: 5 + delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const WillsForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    occupation: "",
    email: "",
    phone: "",
    address: "",
    existingWill: "No",
    executorName1: "",
    executorRelation1: "",
    executorAddress1: "",
    addSecondExecutor: "No",
    executorName2: "",
    executorRelation2: "",
    executorAddress2: "",
    numBeneficiaries: "1",
    beneficiaries: [{ name: "", age: "", relation: "", address: "" }],
    jointProperties: [],
    soleProperties: [],
    jointBanks: [],
    numJointBanks: "0",
    singleBanks: [],
    numSingleBanks: "0",
    hasGuardian: "No",
    isExecutorGuardian: "No",
    guardianName: "",
    guardianAddress: "",
    guardianRelation: "",
    funeralPlanned: "No",
    funeralDetails: "",
    funeralChoice: "",
    jointPersonalProperties: [],
    solePersonalProperties: [],
    promisedBenefit: "No",
    familyCourtOrders: "No",
    otherMatters: "No",
    digitalRightsBeneficiary: "",
  });

  const steps = [
    "Personal", 
    "Executor", 
    "Beneficiaries", 
    "Real Estate", 
    "Banks", 
    "Guardians", 
    "Funeral", 
    "Personal Props", 
    "Disclosures", 
    "Review"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, emptyItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], emptyItem],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateWillsPDF("wills-preview-doc", `Will_${formData.fullName || 'Draft'}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-x-hidden relative print:p-0 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>
      
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none print:hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                          linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <FloatingElement top={15} left={5} delay={0} size={120} />
      <FloatingElement top={60} left={8} delay={2} size={80} />
      <FloatingElement top={25} left={85} delay={1} size={150} />
      <FloatingElement top={75} left={88} delay={3} size={60} />
      <FloatingElement top={40} left={92} delay={4} size={40} />
      <FloatingElement top={10} left={95} delay={0.5} size={30} />

      <main className="flex-1 flex flex-col py-8 px-4 md:px-12 relative z-10 transition-all duration-500 print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full print:max-w-none print:m-0 print:block">
          
          <div className="flex items-center justify-between mb-8 print:hidden">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-[#2E3D99] transition-colors group"
            >
              <div className="p-2 rounded-lg group-hover:bg-[#2E3D99]/5">
                <ChevronLeft size={20} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">Back</span>
            </button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-[#2E3D99]">Wills Preparation</h1>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-12 overflow-x-auto no-scrollbar print:hidden">
            <div className="flex items-center justify-between min-w-[900px] px-4">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                
                return (
                  <React.Fragment key={idx}>
                    <button 
                      onClick={() => goToStep(stepNum)}
                      className={`flex flex-col items-center gap-2 group transition-all`}
                    >
                      <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all duration-300
                        ${isActive ? "bg-[#2E3D99] text-white ring-4 ring-[#2E3D99]/10" : ""}
                        ${isCompleted ? "bg-[#22C55E] text-white" : ""}
                        ${!isActive && !isCompleted ? "bg-gray-50 text-gray-400 group-hover:bg-gray-200" : ""}
                      `}>
                        {isCompleted ? <Check size={16} /> : stepNum}
                      </div>
                      <span className={`text-[10px] font-bold transition-colors uppercase tracking-tight ${isActive ? "text-[#2E3D99]" : "text-gray-400"}`}>
                        {step}
                      </span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`h-[2px] flex-1 mx-3 transition-colors duration-500 ${isCompleted ? "bg-[#22C55E]" : "bg-gray-100"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden flex flex-col print:shadow-none print:border-none print:rounded-none print:block print:p-0">
            <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar print:overflow-visible print:p-0 print:m-0 print:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="print:block"
                >
                  {currentStep === 10 ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 print:block print:p-0 print:space-y-0">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-8 print:hidden">
                        <div>
                          <h2 className="text-3xl font-bold text-[#2E3D99]">Final Review</h2>
                          <p className="text-sm text-gray-500 mt-1 font-medium italic">Please verify the legal document before downloading.</p>
                        </div>
                        <button 
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="flex items-center gap-3 px-8 py-4 bg-[#2E3D99] text-white rounded-2xl hover:bg-[#1D97D7] transition-all font-bold text-sm shadow-xl shadow-blue-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                          {isDownloading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <FileText size={18} className="group-hover:rotate-12 transition-transform" />
                          )}
                          {isDownloading ? "GENERATING PDF..." : "DOWNLOAD AS PDF"}
                        </button>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-[32px] p-6 md:p-12 border border-blue-50/30 shadow-inner max-h-[1200px] overflow-y-auto custom-scrollbar print:bg-white print:p-0 print:m-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible print:block">
                        <WillsPreview formData={formData} />
                      </div>
                    </div>
                  ) : (
                    <WillsStepForm 
                      step={currentStep} 
                      formData={formData} 
                      handleInputChange={handleInputChange}
                      handleArrayChange={handleArrayChange}
                      addArrayItem={addArrayItem}
                      removeArrayItem={removeArrayItem}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between backdrop-blur-sm print:hidden">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${
                  currentStep === 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-[#2E3D99] hover:bg-white border border-transparent hover:border-gray-100 shadow-sm"
                }`}
              >
                <ChevronLeft size={20} /> Back
              </button>
              
              <button
                onClick={currentStep === 10 ? () => navigate(-1) : nextStep}
                className="flex items-center gap-4 px-12 py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {currentStep === 10 ? "Finish" : "Next Phase"} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WillsForm;
