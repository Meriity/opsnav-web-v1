import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, FileText, LogOut, Save, Lightbulb, Info, Shield, X, CheckCircle2, Clock, Circle, RotateCw, AlertCircle, MinusCircle } from "lucide-react";
// Header replaced with custom Wills header inline
import WillsStepForm from "../../components/wills/WillsStepForm";
import WillsPreview from "../../components/wills/WillsPreview";
import SimplifiedReview from "../../components/wills/SimplifiedReview";
import WillsAPI from "../../api/willsAPI";
import { generateWillsDocx } from "../../components/utils/generateWillsDocx";
import { toast } from "react-toastify";
import WillsSignUp from "../../components/wills/WillsSignUp";
import SubmitConfirmationModal from "../../components/wills/SubmitConfirmationModal";
import WillsSmartTips from "../../components/wills/WillsSmartTips";
import { WILLS_TIPS } from "../../data/willsTipsData";
import { Lock } from "lucide-react";


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
  const [isSaving, setIsSaving] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState("");

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
    
    const urlRef = referenceNumber || refFromPath || matterNumberFromQuery || refFromQuery;
    if (urlRef) return urlRef;

    // Session Persistence fallback:
    return localStorage.getItem("matterReferenceNumber");
  }, [location.search, referenceNumber, location.pathname]);


  const isFromReference = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const hasUrlParam = params.has("matterNumber") || params.has("referenceNumber") || window.location.pathname.includes("get-by-reference-number");
    return hasUrlParam || !!referenceNumber;
  }, [location.search, referenceNumber, location.pathname]);

  useEffect(() => {
    if (isFromReference || localStorage.getItem("matterReferenceNumber")) {
      setIsSignedUp(true);
    }
    // Contextualize global search for Wills module
    localStorage.setItem("currentModule", "wills");
  }, [isFromReference]);



  useEffect(() => {
    // Session Persistence: Check for client session on refresh
    const clientToken = localStorage.getItem("clientAuthToken");

    // If we have a token but aren't from an explicit URL reference, 
    // we still mark as signed up to trigger the fetch logic via finalRefNumber
    if (clientToken && !isFromReference) {
      setIsSignedUp(true);
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
            // Check if this is an explicit URL reference or a session persistence reload
            const params = new URLSearchParams(location.search);
            const isUrlRef = !!(referenceNumber || params.get("matterNumber") || params.get("referenceNumber") || window.location.pathname.includes("get-by-reference-number"));
            
            if (isUrlRef) {
              // Priority: Call the reference number API if it's explicitly in the URL
              response = await api.current.getFormByReferenceNumber(finalRefNumber);
            } else {
              // Session Persistence: Use loadFormV1 (matching sign-in behavior)
              response = await api.current.loadFormV1(finalRefNumber);
            }
          } else {
            // Fallback: Call standard project data API
            response = await api.current.getProjectFullData(matterNumber);
          }
            
          if (response) {
            // Extract the actual form data from the response
            const actualData = response.data || response;
            
              setFormData(prev => {
                // Deep merge strategy to ensure all fields are captured
                const merged = {
                  ...INITIAL_STATE,
                  ...prev, // Keep what we have
                  ...actualData, // Overwrite with DB data
                  personal: { 
                    ...INITIAL_STATE.personal, 
                    ...(prev.personal || {}), 
                    ...(actualData.personal || {}) 
                  },
                  executors: (actualData.executors && actualData.executors.length > 0) ? actualData.executors : (prev.executors || INITIAL_STATE.executors),
                  beneficiaries: (actualData.beneficiaries && actualData.beneficiaries.length > 0) ? actualData.beneficiaries : (prev.beneficiaries || INITIAL_STATE.beneficiaries),
                  // Ensure ID is explicitly kept
                  matterReferenceNumber: actualData.matterReferenceNumber || finalRefNumber || prev.matterReferenceNumber
                };

                // Registration data pre-fill fallback
                if (!merged.personal.fullName) {
                   merged.personal.fullName = localStorage.getItem("clientName") || "";
                }
                if (!merged.email) {
                   merged.email = localStorage.getItem("clientEmail") || "";
                }
                if (!merged.personal.email) {
                   merged.personal.email = localStorage.getItem("clientEmail") || "";
                }

                return merged;
              });
            
            // Automatically jump to Step 10 (Review) if from an EXPLICIT URL reference or already submitted
            if (actualData.status === "submitted" || isFromReference) {
              setCurrentStep(10);
            }
          }
        } catch (error) {
          console.error("Error fetching wills form:", error);
          setError("Failed to load your form data. Please refresh or try again later.");
        }
        };
        fetchForm();    }
  }, [location.search, finalRefNumber, isFromReference]);

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

  const phases = steps.map((title, index) => ({
    id: index + 1,
    title,
    step: index + 1
  }));

  const getPhaseStatus = (phase) => {
    if (currentStep > phase.step) return "completed";
    if (currentStep === phase.step) return "inprogress";
    return "pending";
  };

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
            
      if (!targetArray[index]) {
        targetArray[index] = {};
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
          const updateResponse = await api.current.updateWillsForm(formData);
          const updatedData = updateResponse.data || updateResponse;
          refNumber = updatedData.matterReferenceNumber || updatedData.MatterReferenceNumber;
          
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
      
      setIsDirty(false);
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
      let response;
      if (finalRefNumber) {
        // Use the new PATCH API if we have a reference number from the URL
        response = await api.current.updateFormByReferenceNumber(finalRefNumber, updatedData);
      } else if (updatedData.matterReferenceNumber) {
        // Fallback for query-param based updates
        response = await api.current.updateWillsForm(updatedData);
      } else {
        // Standard update flow
        response = await api.current.updateWillsForm(updatedData);
      }

      if (response) {
        const actualData = response.data || response;
        setFormData(prev => ({
          ...prev,
          ...actualData
        }));
        return actualData;
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
      toast.error(error.message || "Failed to auto-save progress!");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await submitForm("draft");
      setIsDirty(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save progress");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < 10) {
      setIsSaving(true);
      try {
        await submitForm("draft");
        setIsDirty(false);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      } catch (error) {
        console.error("Error saving on next step:", error);
        toast.error("Failed to save progress. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleSignUp = (signUpData) => {
    setIsSignedUp(true);
    
    // Persist session to localStorage for reload recovery
    if (signUpData.referenceNumber) {
      localStorage.setItem("matterReferenceNumber", signUpData.referenceNumber);
    }
    if (signUpData.email) {
      localStorage.setItem("clientEmail", signUpData.email);
    }
    if (signUpData.name) {
      localStorage.setItem("clientName", signUpData.name);
    }
    
    if (signUpData.loadedData) {
      const actualData = signUpData.loadedData.data || signUpData.loadedData;
      
      setFormData(prev => ({
        ...INITIAL_STATE,
        ...actualData,
        personal: { 
          ...INITIAL_STATE.personal, 
          ...(actualData.personal || {}),
          fullName: signUpData.name || actualData.personal?.fullName || prev.personal?.fullName
        },
        email: signUpData.email || actualData.email || prev.email,
        matterReferenceNumber: signUpData.referenceNumber || actualData.matterReferenceNumber || prev.matterReferenceNumber,
        executors: (actualData.executors && actualData.executors.length > 0) ? actualData.executors : INITIAL_STATE.executors,
        beneficiaries: (actualData.beneficiaries && actualData.beneficiaries.length > 0) ? actualData.beneficiaries : INITIAL_STATE.beneficiaries,
      }));

      // Automatically jump to Step 10 (Review) if already submitted
      if (actualData.status === "submitted") {
        setCurrentStep(10);
      }
    } else {
      // Fallback for simple signup
      setFormData((prev) => ({
        ...prev,
        personal: {
          ...(prev ? prev.personal : {}),
          fullName: signUpData.name,
        },
        email: signUpData.email,
        matterReferenceNumber: signUpData.referenceNumber,
      }));
    }
  };

  const handleLogout = () => {
    // Clear client session related data
    localStorage.removeItem("clientAuthToken");
    localStorage.removeItem("matterReferenceNumber");
    localStorage.removeItem("clientEmail");
    localStorage.removeItem("clientName");
    
    // Reset state - this will trigger re-render to show WillsSignUp
    setIsSignedUp(false);
    toast.info("Logged out successfully");
  };

  if (!isSignedUp) {
    return <WillsSignUp onSignUp={handleSignUp} />;
  }

  return (

    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-x-hidden relative print:p-0 print:bg-white">
      <div className="print:hidden">
        {/* Custom Wills Header — shows client name and firm logo instead of admin header */}
        <header className="sticky top-0 z-40 mb-3 md:mb-8 transition-all duration-500">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.02)]" />
          <div className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2E3D99]/15 to-transparent" />
          
          <div className="relative px-4 py-3 md:px-10 md:py-5 flex justify-between items-center transition-all">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              {/* Logo Container */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#2E3D99]/10 to-[#1D97D7]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-1.5 md:p-2 shadow-sm border border-gray-100/50 group-hover:border-[#2E3D99]/20 transition-all duration-300">
                  <img
                    className="h-7 w-7 md:h-10 md:w-10 object-contain flex-shrink-0"
                    src={localStorage.getItem("logo") || "/Logo.png"}
                    alt="Logo"
                  />
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <h1 className="text-base md:text-2xl font-black text-[#1E293B] tracking-tight truncate leading-none">
                  Hello, <span className="bg-gradient-to-r from-[#2E3D99] via-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">{formData.personal?.fullName || localStorage.getItem("clientName") || "there"}</span>
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="px-2.5 py-0.5 rounded-full bg-[#2E3D99]/5 border border-[#2E3D99]/10 flex items-center gap-1.5">
                    <FileText size={10} className="text-[#2E3D99]" />
                    <span className="text-[9px] md:text-[10px] text-[#2E3D99] font-bold uppercase tracking-wider">Wills Form</span>
                  </div>
                  
                  
                </div>
              </div>
            </div>

            {/* Logout Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout} 
                className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 text-[#1E293B] rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 active:scale-95 group"
              >
                <LogOut size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                <span>Logout</span>
              </button>
              
              <button 
                onClick={handleLogout} 
                className="md:hidden flex items-center justify-center w-10 h-10 bg-white border border-gray-100 text-gray-400 rounded-xl shadow-sm hover:text-red-500 hover:bg-gray-50 transition-all active:scale-95"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
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

      <main className="flex-1 flex flex-col py-4 px-3 md:py-10 md:px-16 lg:px-24 relative z-10 transition-all duration-500 print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full print:max-w-none print:m-0 print:block">
          
          {/* Premium Phase Navigation Stepper - 10 Stages */}
          <div className="hidden md:block mb-10 max-w-6xl mx-auto w-full">
            <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-6 pb-4 border border-white/50 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
              
              {/* Continuous Track — background gray line */}
              <div className="absolute top-[42px] left-[5%] right-[5%] h-[3px] bg-gray-100 rounded-full print:hidden" />
              
              {/* Continuous Track — green progress overlay */}
              {(() => {
                // Find the rightmost completed step to draw the green line to
                // Progress line extends up to the current step position
                const progressIndex = currentStep - 1; // 0-indexed
                const progressPercent = progressIndex > 0 ? (progressIndex / (phases.length - 1)) * 100 : 0;
                
                return progressPercent > 0 ? (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute top-[42px] left-[5%] h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full print:hidden z-[1]"
                  />
                ) : null;
              })()}
              
              <div className="relative flex justify-between items-start z-[2]">
                {phases.map((phase) => {
                  const status = getPhaseStatus(phase);
                  
                  return (
                    <div 
                       key={phase.id}
                       onClick={() => goToStep(phase.step)}
                       className="flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer"
                       style={{ width: "10%" }}
                    >
                      {/* Status Indicator */}
                      <motion.div 
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm relative ${
                          status === "completed" 
                            ? "bg-emerald-500 text-white border-[3px] border-white shadow-emerald-200/60 shadow-md" 
                            : status === "inprogress" 
                              ? "bg-amber-400 text-white scale-110 shadow-lg shadow-amber-200/60 border-[3px] border-white" 
                              : "bg-white border-2 border-gray-200 text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        {status === "completed" ? (
                          <Check size={16} strokeWidth={3.5} />
                        ) : (
                          <span className="text-[11px] font-black">{phase.id}</span>
                        )}

                        {/* Active Glow */}
                        {status === "inprogress" && (
                          <motion.div 
                            layoutId="active-glow"
                            className="absolute -inset-2 rounded-full border-2 border-amber-400/20 animate-ping shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                          />
                        )}
                      </motion.div>

                      {/* Label */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                          status === "inprogress" ? "text-amber-600" : status === "completed" ? "text-emerald-600" : "text-gray-400"
                        }`}>
                          Step {phase.id}
                        </span>
                        
                        <span 
                          className={`text-[11px] font-bold text-center leading-tight whitespace-nowrap transition-all duration-300 ${
                            status === "inprogress" 
                              ? "text-[#1E293B]" 
                              : status === "completed" 
                                ? "text-emerald-700" 
                                : "text-gray-400"
                          }`}
                        >
                          {phase.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Step Indicator — compact horizontal stepper for small screens */}
          <div className="md:hidden mb-4">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800">Step <span className="text-[#2E3D99]">{currentStep}</span>/10</span>
                <span className="text-[10px] font-bold text-gray-400">{Math.round((currentStep / 10) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 10) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-full"
                />
              </div>
              <div className="flex items-center justify-between mt-4 overflow-x-auto overflow-y-hidden scrollbar-hide w-full gap-2 py-1">
                {phases.map((phase) => {
                  const status = getPhaseStatus(phase);
                  return (
                    <button
                      key={phase.id}
                      onClick={() => goToStep(phase.step)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        status === "completed"
                          ? "bg-emerald-500 text-white"
                          : status === "inprogress"
                            ? "bg-amber-400 text-white scale-110 shadow-sm"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {status === "completed" ? <Check size={14} strokeWidth={3} /> : phase.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Progress Bar - Now outside the main box as per reference */}
          <div className="bg-white rounded-2xl md:rounded-full shadow-sm border border-gray-100 p-2.5 px-4 md:p-3 md:pl-8 md:pr-8 mb-4 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between print:hidden max-w-5xl mx-auto w-full transition-all gap-2 sm:gap-0">
            <div className="flex items-center gap-3 md:gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-2 md:gap-4 flex-1 sm:flex-initial">
                <span className="text-[12px] md:text-[13px] font-bold text-gray-800">
                  Step <span className="text-[#2E3D99]">{currentStep}</span> of 10 — {steps[currentStep-1]}
                </span>
                <div className="h-4 w-[1px] bg-gray-100 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2 text-gray-400 text-[12px] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {WILLS_TIPS[currentStep]?.estimate || "3-5 mins"}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="hidden md:flex items-center gap-3">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 10) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                  {Math.round((currentStep / 10) * 100)}% COMPLETE
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-5 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <div className={`w-1.5 h-1.5 rounded-full ${isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isDirty ? "Unsaved" : "Saved"}</span>
              </div>
            </div>
          </div>

          {/* Unified Premium Card */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden flex flex-col p-6 md:p-8 lg:p-10 print:shadow-none print:border-none print:rounded-none transition-all">
            
            {/* 1. Header Section (Inside Card) */}
            <div className="mb-6 space-y-2">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm font-bold shadow-sm">
                       <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs flex-shrink-0">!</div>
                       <span className="flex-1">{error}</span>
                       <button onClick={() => setError("")} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                         <X size={16} />
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-4">
                {/* Circled Step Number */}
                <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#2E3D99] font-bold text-sm border border-gray-100 flex-shrink-0">
                  {currentStep}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] tracking-tight">
                  {WILLS_TIPS[currentStep]?.title}
                </h2>
              </div>
              <p className="text-[12px] md:text-[15px] text-gray-500 max-w-4xl leading-relaxed font-medium">
                {WILLS_TIPS[currentStep]?.description}
              </p>
            </div>

            {/* 2. Content Body Section (Two Columns Inside Card) */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 grow">
              
              {/* Left Column: Form Section */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="print:block"
                  >
                    {currentStep === 10 ? (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 print:block print:p-0 print:space-y-0 text-center max-w-2xl mx-auto py-12">
                        <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                          <Check size={40} className="text-[#22C55E]" />
                        </div>
                        <h2 className="text-4xl font-bold text-[#2E3D99]">Ready to Finalise?</h2>
                        <p className="text-gray-500 font-medium">Review your details below to ensure everything is correct.</p>
                        <div className={`${isFromReference ? "bg-[#F8FAFC] rounded-[32px] p-6 md:p-12 border border-blue-50/30 shadow-inner mt-12" : ""} print:bg-white print:p-0 print:m-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible print:block text-left`}>
                          {isFromReference ? <WillsPreview formData={formData} /> : <SimplifiedReview formData={formData} onEdit={goToStep} />}
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
                        toggleTips={() => setIsSidebarOpen(!isSidebarOpen)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Column: Tips & Navigation */}
              <div className="lg:w-[380px] flex flex-col gap-8">
                {/* Smart Tips Card */}
                <div className="bg-[#F1F5F9] rounded-[32px] overflow-hidden border border-gray-100/50">
                  <WillsSmartTips 
                    tips={WILLS_TIPS[currentStep]?.tips || []} 
                    isMobile={false}
                    isInline={true}
                  />
                </div>

                {/* Navigation Buttons aligned below Tips */}
                <div className="flex items-center justify-between gap-3 mt-auto pt-6 border-t border-gray-50 lg:border-none lg:pt-0">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 text-[13px] font-bold transition-all px-4 py-3 rounded-xl ${
                      currentStep === 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-[#2E3D99] hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>

                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-white text-[#2E3D99] border-2 border-[#2E3D99]/10 rounded-2xl font-bold hover:bg-[#2E3D99]/5 transition-all disabled:opacity-50 text-[14px]"
                    >
                      <Save size={16} /> Save
                    </button>

                    <button
                      onClick={currentStep === 10 ? () => setIsSubmitModalOpen(true) : nextStep}
                      disabled={isSaving}
                      className="flex-[1.5] flex items-center justify-center gap-1 px-3 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:brightness-110 transition-all disabled:opacity-70 text-[14px]"
                    >
                      {currentStep === 10 ? "Submit Will" : "Next"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Social Proof/Trust Footer */}
            <div className="mt-2 pt-3 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
              <div className="flex items-center text-gray-400 group transition-all cursor-default">
                <div className="p-2 bg-blue-50/50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Shield size={14} className="text-[#2E3D99]/60" />
                </div>
                <span className="text-[12px] font-bold  text-black group-hover:opacity-100 transition-opacity">
                  Your information is securely stored and handled in accordance with Australian privacy standards.
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/80 rounded-full border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"}`} />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[1px] leading-none">
                  {isDirty ? "unsaved" : "all data saved"}
                </p>
              </div>
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

      {/* Mobile Tips Overlay */}
      <WillsSmartTips 
        tips={WILLS_TIPS[currentStep]?.tips || []} 
        isMobile={true}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default WillsForm;
