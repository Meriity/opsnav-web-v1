import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, FileText } from "lucide-react";
import Header from "../../components/layout/Header";
import WillsStepForm from "../../components/wills/WillsStepForm";
import WillsPreview from "../../components/wills/WillsPreview";
import WillsAPI from "../../api/willsAPI";
import { generateWillsPDF } from "../../components/utils/generateWillsPDF";
import { toast } from "react-toastify";

// Helper function to load Google Maps script
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
};

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
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const api = useRef(new WillsAPI());
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GMAPS_APIKEY;

  useEffect(() => {
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        setIsGoogleMapsLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
      });
  }, [GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const matterNumber = params.get("matterNumber");
    const firmIdInUrl = params.get("firmId");

    if (firmIdInUrl) {
      setFormData(prev => ({ ...prev, firmId: firmIdInUrl }));
    }

    if (matterNumber) {
      const fetchForm = async () => {
        try {
          const data = await api.current.getProjectFullData(matterNumber);
          if (data) {
            setFormData(data);
            // Optionally set step to 10 (Review) if it's already submitted
            if (data.status === "submitted") {
              setCurrentStep(10);
            }
          }
        } catch (error) {
          console.error("Error fetching wills form:", error);
          toast.error("Failed to load form data");
        }
      };
      fetchForm();
    }
  }, [location.search]);
  const [formData, setFormData] = useState({
    firmId: localStorage.getItem("userID") || "",
    email: "",
    personal: {
      fullName: "",
      occupation: "",
      phone: "",
      address: "",
      existingWill: null, // Use null for initial state
      existingWillFiles: [], // Array of { name, url }
    },
    executors: [
      {
        name: "",
        relation: { category: null, customValue: "" },
        address: ""
      }
    ],
    beneficiaries: [
      {
        name: "",
        age: "",
        relation: { category: null, customValue: "" },
        address: ""
      }
    ],
    properties: {
      joint: [],
      sole: []
    },
    bankAccounts: {
      joint: [],
      single: []
    },
    guardian: {
      isExecutor: null,
      name: "",
      relation: { category: null, customValue: "" },
      address: ""
    },
    funeral: {
      hasPlan: null,
      type: "",
      details: ""
    },
    personalAssets: {
      joint: [],
      sole: []
    },
    other: {
      promisedBenefit: null,
      legalMatters: null,
      otherNotes: null,
      digitalBeneficiary: ""
    },
    status: "draft",
    numSingleBanks: "0",
    numJointBanks: "0"
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

  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, obj);
    target[lastKey] = value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      // Map empty string to null ONLY for category and boolean fields to avoid validation errors
      const isNullField = (name.endsWith('.category') || name === 'category' || name === 'personal.existingWill' || name === 'guardian.isExecutor' || name === 'funeral.hasPlan' || name === 'other.promisedBenefit' || name === 'other.legalMatters' || name === 'other.otherNotes');
      const finalValue = isNullField && value === "" ? null : value;
      setNestedValue(newData, name, finalValue);
      return newData;
    });
  };

  const handleArrayChange = (arrayPath, index, field, value) => {
    setIsDirty(true);
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let targetArray = newData;
      for (const key of keys) {
        targetArray = targetArray[key];
      }
      
      if (field.includes('.')) {
        // Map empty string to null for category and boolean fields
        const isNullField = (field.endsWith('.category') || field === 'category' || field === 'personal.existingWill' || field === 'guardian.isExecutor' || field === 'funeral.hasPlan' || field === 'other.promisedBenefit' || field === 'other.legalMatters' || field === 'other.otherNotes');
        const finalValue = isNullField && value === "" ? null : value;
        setNestedValue(targetArray[index], field, finalValue);
      } else {
        targetArray[index][field] = value;
      }
      return newData;
    });
  };

  const addArrayItem = (arrayPath, emptyItem) => {
    setIsDirty(true);
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let targetArray = newData;
      const lastKey = keys.pop();
      for (const key of keys) {
        if (!targetArray[key]) targetArray[key] = {};
        targetArray = targetArray[key];
      }
      if (!targetArray[lastKey]) targetArray[lastKey] = [];
      targetArray[lastKey].push(emptyItem);
      return newData;
    });
  };

  const removeArrayItem = (arrayPath, index) => {
    setIsDirty(true);
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let targetArray = newData;
      for (const key of keys) {
        targetArray = targetArray[key];
      }
      targetArray.splice(index, 1);
      return newData;
    });
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const fileData = Array.from(files).map(file => ({
        fileType: file.type,
        fileSize: file.size
      }));

      // 1. Generate Signed URLs
      const response = await api.current.generateSignedUrls(fileData);
      const signedUrls = response.urls || response.data || response;
      
      const uploadResults = [];

      // 2. Upload to GCS
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const signedUrlData = signedUrls[i];
        const { signedUrl: uploadUrl, fileUrl: url, fileType: backendFileType } = signedUrlData;

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": backendFileType || file.type || "application/pdf"
          },
          body: file
        });

        if (!uploadResponse.ok) {
          const errorMsg = `GCS upload failed: ${uploadResponse.status}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        uploadResults.push({ 
          urlName: file.name, 
          url: url // This matches fileUrl from response
        });
      }

      // 3. Sync Metadata
      const matterNumber = formData.matterNumber || "1234567";
      await api.current.uploadMultipleUrls(uploadResults, matterNumber);

      // 4. Update State
      setFormData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          existingWillFiles: [...(prev.personal.existingWillFiles || []), ...uploadResults]
        }
      }));
      
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = (fileName) => {
    setFormData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        existingWillFiles: (prev.personal.existingWillFiles || []).filter(f => f.urlName !== fileName)
      }
    }));
    toast.info("File removed from list");
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Final submission check
      if (formData.status !== "submitted") {
        const updatedData = { ...formData, status: "submitted" };
        await api.current.updateWillsForm(updatedData);
        setFormData(updatedData);
      }
      await generateWillsPDF("wills-preview-doc", `Will_${formData.personal?.fullName || 'Draft'}.pdf`);
      toast.success("PDF generated and form submitted!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form!");
    } finally {
      setIsDownloading(false);
    }
  };

  const syncToApi = async (step, data) => {
    try {
      if (step === 1) {
        await api.current.createWillsForm({ ...data, status: "draft" });
        console.log("Form created successfully");
      } else if (step > 1 && isDirty) {
        await api.current.updateWillsForm({ ...data, status: "draft" });
        console.log("Form updated successfully");
      }
      setIsDirty(false);
    } catch (error) {
      console.error(`Error in stage ${step} sync:`, error);
      toast.error("Failed to save progress!");
    }
  };

  const nextStep = async () => {
    if (currentStep < 10) {
      await syncToApi(currentStep, formData);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
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
                      isGoogleMapsLoaded={isGoogleMapsLoaded}
                      email={formData.email}
                      onFileUpload={handleFileUpload}
                      onFileDelete={handleFileDelete}
                      isUploading={isUploading}
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
                onClick={currentStep === 10 ? async () => {
                  try {
                    const updatedData = { ...formData, status: "submitted" };
                    await api.current.updateWillsForm(updatedData);
                    setFormData(updatedData);
                    toast.success("Form submitted successfully!");
                    navigate(-1);
                  } catch (err) {
                    console.error("Submission error:", err);
                    toast.error("Failed to submit form!");
                  }
                } : nextStep}
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
