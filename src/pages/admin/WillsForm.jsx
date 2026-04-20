import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, FileText, LogOut } from "lucide-react";
import Header from "../../components/layout/Header";
import WillsStepForm from "../../components/wills/WillsStepForm";
import WillsPreview from "../../components/wills/WillsPreview";
import SimplifiedReview from "../../components/wills/SimplifiedReview";
import WillsAPI from "../../api/willsAPI";
import { generateWillsDocx } from "../../components/utils/generateWillsDocx";
import { toast } from "react-toastify";
import WillsSignUp from "../../components/wills/WillsSignUp";
import SubmitConfirmationModal from "../../components/wills/SubmitConfirmationModal";
import { APP_VERSION } from "../../config/version";


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
  const { referenceNumber } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const api = useRef(new WillsAPI());
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GMAPS_APIKEY;

  const finalRefNumber = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const matterNumberFromQuery = params.get("matterNumber");
    const refFromQuery = params.get("referenceNumber");
    const pathParts = window.location.pathname.split("/");
    const refFromPath = pathParts.includes("get-by-reference-number") 
      ? pathParts[pathParts.indexOf("get-by-reference-number") + 1] 
      : null;
    return referenceNumber || refFromPath || matterNumberFromQuery || refFromQuery;
  }, [location.search, referenceNumber, location.pathname]);


  const isFromReference = useMemo(() => {
    return new URLSearchParams(location.search).has("matterNumber") || !!finalRefNumber;
  }, [location.search, finalRefNumber]);

  useEffect(() => {
    if (isFromReference) {
      setIsSignedUp(true);
    }
  }, [isFromReference]);



  useEffect(() => {
    // Session Persistence: Check for client session on refresh
    const clientToken = localStorage.getItem("clientAuthToken");
    const clientEmail = localStorage.getItem("clientEmail");
    const clientName = localStorage.getItem("clientName");

    if (clientToken && !isFromReference) {
      setIsSignedUp(true);
      if (clientEmail || clientName) {
        setFormData(prev => ({
          ...prev,
          email: clientEmail || (prev && prev.email) || "",
          personal: {
            ...(prev ? prev.personal : {}),
            fullName: clientName || (prev && prev.personal ? prev.personal.fullName : "")
          }
        }));
      }
    }
  }, [isFromReference]);

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
    const firmIdInUrl = params.get("firmId");

    if (firmIdInUrl) {
      setFormData(prev => ({ ...prev, firmId: firmIdInUrl }));
    }

    const matterNumber = params.get("matterNumber");

    if (finalRefNumber || matterNumber) {
      const fetchForm = async () => {
        try {
          let response;
          if (finalRefNumber) {
            // Priority: Call the reference number API if it's in the URL path
            response = await api.current.getFormByReferenceNumber(finalRefNumber);
          } else {
            // Fallback: Call standard project data API
            response = await api.current.getProjectFullData(matterNumber);
          }
            
          if (response) {
            // Extract the actual form data from the response
            const actualData = response.data || response;
            // Merge with INITIAL_STATE to ensure safety of nested objects
            setFormData(prev => ({
              ...INITIAL_STATE,
              ...actualData,
              personal: { ...INITIAL_STATE.personal, ...(actualData.personal || {}) },
              executors: actualData.executors || INITIAL_STATE.executors,
              beneficiaries: actualData.beneficiaries || INITIAL_STATE.beneficiaries,
            }));
            
            // Automatically jump to Step 10 (Review) if from reference or already submitted
            if (actualData.status === "submitted" || finalRefNumber) {
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
  }, [location.search, finalRefNumber]);

  const INITIAL_STATE = {
    firmId: localStorage.getItem("userID") || "",
    email: "",
    matterReferenceNumber: "", // New explicit identifier field
    personal: {
      fullName: "",
      occupation: "",
      phone: "",
      address: "",
      existingWill: null,
      existingWillFiles: [],
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
  };

  const [formData, setFormData] = useState(INITIAL_STATE);
  const formDataRef = useRef(INITIAL_STATE);
  
  // Sync Ref with State to ensure async handlers (like submit) always have the latest data
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

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
      let refNumber = finalRefNumber || formData.matterReferenceNumber || formData.matterNumber;
      
      if (!refNumber || refNumber === "1234567") {
        try {
          const createResponse = await api.current.createWillsForm(formData);
          const createdData = createResponse.data || createResponse;
          refNumber = createdData.matterReferenceNumber || createdData.MatterReferenceNumber;
          
          if (refNumber) {
            // Update local state and ref with the new identity
            setFormData(prev => ({ ...prev, matterReferenceNumber: refNumber }));
            formDataRef.current.matterReferenceNumber = refNumber;
          } else {
            throw new Error("Form created but no reference number returned");
          }
        } catch (createError) {
          console.error("Auto-create failed:", createError);
          throw new Error("Please save the form at least once before uploading files");
        }
      }

      const finalFormattedRef = refNumber.startsWith("REF") ? refNumber : `REF${refNumber}`;
      await api.current.uploadMultipleUrls(uploadResults, finalFormattedRef);

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

  const submitForm = async (status = "submitted") => {
    // Always use the latest data from the Ref
    const updatedData = { 
      ...formDataRef.current, 
      status
    };
    
    try {
      if (finalRefNumber) {
        // Use the new PATCH API if we have a reference number from the URL
        const response = await api.current.updateFormByReferenceNumber(finalRefNumber, updatedData);
        if (response?.data) {
          setFormData(response.data);
          return response.data;
        }
      } else if (updatedData.matterReferenceNumber) {
        // Fallback for query-param based updates
        await api.current.updateWillsForm(updatedData);
        setFormData(updatedData);
      } else {
        // Standard creation flow
        const response = await api.current.createWillsForm(updatedData);
        if (response?.data) {
          setFormData(response.data);
          return response.data;
        }
      }
    } catch (error) {
      console.error("Error in submitForm:", error);
      throw error;
    }
    return updatedData;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Final submission check if not already submitted
      if (formData.status !== "submitted") {
        await submitForm("submitted");
      }
      
      // Use latest formData (including any new matterReferenceNumber) for filename
      const fileName = `Will_${formData.personal?.fullName || 'Draft'}.docx`;
      await generateWillsDocx(formData, fileName);
      toast.success("DOCX generated and form submitted!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to submit form!");
    } finally {
      setIsDownloading(false);
    }
  };

  const syncToApi = async () => {
    if (!isDirty) return;
    try {
      await submitForm("draft");
      setIsDirty(false);
    } catch (error) {
      console.error("Error syncing progress:", error);
      toast.error("Failed to auto-save progress!");
    }
  };

  const nextStep = async () => {
    if (currentStep < 10) {
      await syncToApi();
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleSignUp = (signUpData) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...(prev ? prev.personal : {}),
        fullName: signUpData.name,
      },
      email: signUpData.email,
    }));
    setIsSignedUp(true);
  };

  const handleLogout = () => {
    // Clear client session related data
    localStorage.removeItem("clientAuthToken");
    localStorage.removeItem("matterReferenceNumber");
    localStorage.removeItem("clientEmail");
    localStorage.removeItem("clientName");
    
    // Reset state and navigate
    setIsSignedUp(false);
    toast.info("Logged out successfully");
    navigate("/admin/dashboard");
  };

  if (!isSignedUp) {
    return <WillsSignUp onSignUp={handleSignUp} />;
  }

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
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50] font-medium transition-all duration-300 text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>

              {isFromReference && (
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#2E3D99] transition-colors group"
                >
                  <div className="p-2 rounded-lg group-hover:bg-[#2E3D99]/5">
                    <ChevronLeft size={20} />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wider">Back</span>
                </button>
              )}
            </div>
            
            <div className="text-right hidden sm:block">
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
                          <h2 className="text-3xl font-bold text-[#2E3D99]">
                            {isFromReference ? "Final Review" : "Confirm Your Details"}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 font-medium italic">
                            {isFromReference 
                              ? "Please verify the legal document before downloading."
                              : "Review your entries below before submitting the form."}
                          </p>
                        </div>
                        {isFromReference && (
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
                            {isDownloading ? "GENERATING DOCX..." : "DOWNLOAD AS DOCX"}
                          </button>
                        )}
                      </div>
                      <div className={`${isFromReference ? "bg-[#F8FAFC] rounded-[32px] p-6 md:p-12 border border-blue-50/30 shadow-inner max-h-[800px] overflow-y-auto" : ""} print:bg-white print:p-0 print:m-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible print:block`}>
                        {isFromReference ? (
                          <WillsPreview formData={formData} />
                        ) : (
                          <SimplifiedReview formData={formData} onEdit={goToStep} />
                        )}
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
                onClick={currentStep === 10 ? () => setIsSubmitModalOpen(true) : nextStep}
                className="flex items-center gap-4 px-12 py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {currentStep === 10 ? "Submit" : "Next Phase"} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <SubmitConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        isLoading={isSubmitting}
        onConfirm={async () => {
          setIsSubmitting(true);
          try {
            await submitForm("submitted");
            toast.success("Form submitted successfully!");
            setIsSubmitModalOpen(false);
            navigate(-1);
          } catch (err) {
            console.error("Submission error:", err);
            toast.error(err.message || "Failed to submit form!");
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </div>
  );
};

export default WillsForm;
