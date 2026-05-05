import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WILLS_TIPS } from "../../data/willsTipsData";
import { Info, Lightbulb, ChevronRight, ChevronDown, Check, User, Phone, Mail, Home, Briefcase, FileText, Plus, Trash2, Users, Shield, Archive, Landmark, Heart, Flower, Flame, Activity, MessageSquare } from "lucide-react";

/**
 * Helper Components for Step Layouts
 */
const StepHeader = ({ title, description, stepNumber }) => (
  <div className="space-y-4 mb-8">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{title}</h2>
        {stepNumber && (
          <div className="w-7 h-7 rounded-full bg-[#2E3D99]/10 flex items-center justify-center text-[#2E3D99] font-bold text-sm border border-[#2E3D99]/10">
            {stepNumber}
          </div>
        )}
      </div>
      <div className="p-1.5 rounded-full bg-gray-50 border border-gray-100 group cursor-help transition-all hover:bg-white hover:shadow-sm">
        <Info size={16} className="text-gray-300 group-hover:text-[#2E3D99] transition-colors" />
      </div>
    </div>
    <p className="text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">
      {description}
    </p>
  </div>
);

const SmartTipsInline = ({ hasTips, onToggle }) => {
  if (!hasTips) return null;
  return (
    <div 
      onClick={onToggle}
      className="flex items-center gap-2 mb-8 group cursor-pointer lg:hidden"
    >
      <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100/50">
        <Lightbulb size={16} className="text-amber-500" />
      </div>
      <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#2E3D99] transition-colors">Smart Tips</span>
      <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
    </div>
  );
};

const WillsStepForm = ({ 
  step, 
  formData, 
  handleInputChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  isGoogleMapsLoaded,
  email,
  onFileUpload,
  onFileDelete,
  isUploading,
  toggleTips
}) => {
  const [expandedIndices, setExpandedIndices] = React.useState({});

  // Detect desktop view to keep sections open
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 1024);
  
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleExpand = (section, index) => {
    if (isDesktop) return; // Keep open on desktop
    setExpandedIndices(prev => {
      const sectionIndices = prev[section] || [];
      if (sectionIndices.includes(index)) {
        return { ...prev, [section]: sectionIndices.filter(i => i !== index) };
      } else {
        return { ...prev, [section]: [...sectionIndices, index] };
      }
    });
  };

  const isItemExpanded = (section, index) => {
    if (isDesktop) return true; // Always expanded on desktop
    // Default to first item expanded if no state yet for this section
    if (!expandedIndices[section]) return index === 0;
    return expandedIndices[section].includes(index);
  };

  // --- SAFETY CHECK: Ensure formData and its nested objects exist ---
  if (!formData) return null;

  const data = {
    personal: formData.personal || {},
    executors: formData.executors || [],
    beneficiaries: formData.beneficiaries || [],
    properties: {
      joint: formData.properties?.joint || [],
      sole: formData.properties?.sole || [],
      hasJoint: formData.properties?.hasJoint,
      hasSole: formData.properties?.hasSole,
    },
    bankAccounts: {
      joint: formData.bankAccounts?.joint || [],
      single: formData.bankAccounts?.single || [],
      hasJoint: formData.bankAccounts?.hasJoint,
      hasSingle: formData.bankAccounts?.hasSingle,
    },
    guardian: formData.guardian || { relation: {} },
    funeral: formData.funeral || {},
    personalAssets: {
      joint: formData.personalAssets?.joint || [],
      sole: formData.personalAssets?.sole || [],
      hasJoint: formData.personalAssets?.hasJoint,
      hasSole: formData.personalAssets?.hasSole,
    },
    other: formData.other || {},
    numSingleBanks: formData.numSingleBanks || "0",
    numJointBanks: formData.numJointBanks || "0",
    hasSecondExecutor: formData.hasSecondExecutor,
  };

  const {
    personal,
    executors,
    beneficiaries,
    properties,
    bankAccounts,
    guardian,
    funeral,
    personalAssets,
    other,
    numSingleBanks,
    numJointBanks,
    hasSecondExecutor,
  } = data;

  const relationshipOptions = [
    "Spouse", "Brother", "Sister", "Mother", "Father", 
    "Son", "Daughter", "Friend", "Cousin", "Other"
  ];

  // --- STEP 1: Personal (Q1-Q6) ---
  if (step === 1) {
    const tipData = WILLS_TIPS[1];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup 
            label="Full Name *" 
            name="personal.fullName" 
            value={personal.fullName} 
            onChange={handleInputChange} 
            placeholder="e.g. John Doe" 
            icon={<User className="w-4 h-4" />} 
          />
          <InputGroup 
            label="Email Address *" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            placeholder="e.g. john@example.com" 
            icon={<Mail className="w-4 h-4" />} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup label="Occupation *" name="personal.occupation" value={personal.occupation} onChange={handleInputChange} placeholder="e.g. Accountant, Business Owner, Retired" icon={<Briefcase className="w-4 h-4" />} />
          <InputGroup label="Phone Number" name="personal.phone" value={personal.phone} onChange={handleInputChange} placeholder="Include your mobile number for any follow-up" icon={<Phone className="w-4 h-4" />} />
        </div>

        <AddressInputGroup 
          label="Residential address *" 
          value={personal.address} 
          onAddressSelect={(addr) => handleInputChange({ target: { name: "personal.address", value: addr } })} 
          placeholder="Enter your full residential address" 
          icon={<Home className="w-4 h-4" />} 
          isLoaded={isGoogleMapsLoaded}
        />

        <YesNoToggle 
          label="Do you currently have an existing Will? *" 
          name="personal.existingWill" 
          value={personal.existingWill} 
          onChange={handleInputChange} 
          helper="If yes, your new Will can replace the previous one."
          largeLabel={true}
        />

        {personal.existingWill === true && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <FileUploadSection 
              files={personal.existingWillFiles || []}
              onFileUpload={onFileUpload}
              onFileDelete={onFileDelete}
              isUploading={isUploading}
            />
          </div>
        )}

        <div className="mt-2 p-3 md:p-4 bg-amber-50/50 border border-amber-100 rounded-2xl md:rounded-[28px] flex items-start gap-2 md:gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-amber-200/50 flex-shrink-0 shadow-sm">
            <Info className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-bold text-amber-900 mb-1">Note</p>
            <p className="text-[13px] text-amber-700 font-medium leading-relaxed">
              Any new Will prepared will <strong>generally supersede</strong> previous Wills, unless specified otherwise.
            </p>
          </div>
        </div>
        <StepCommentBox name="personal.notes" value={formData.personal?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "personal.notes", value: e.target.value } })} step={1} />
      </div>
    );
  }

  // --- STEP 2: Executor (Q7-Q13) ---
  if (step === 2) {
    const tipData = WILLS_TIPS[2];

    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputGroup label="Executor’s full name *" value={executors[0]?.name} onChange={(e) => handleArrayChange("executors", 0, "name", e.target.value)} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
            <div className="space-y-2">
              <SelectGroup 
                label="Relationship with the Executor *" 
                value={executors[0]?.relation?.category} 
                onChange={(e) => handleArrayChange("executors", 0, "relation.category", e.target.value)} 
                options={relationshipOptions} 
                icon={<Users className="w-4 h-4" />} 
              />
              {executors[0]?.relation?.category === "Other" && (
                <input 
                  placeholder="Please specify..." 
                  value={executors[0]?.relation?.customValue || ""} 
                  onChange={(e) => handleArrayChange("executors", 0, "relation.customValue", e.target.value)}
                  className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-sm placeholder:text-gray-300" 
                />
              )}
            </div>
          </div>
            <AddressInputGroup 
              label="Full address of the Executor *" 
              value={executors[0]?.address} 
              onAddressSelect={(addr) => handleArrayChange("executors", 0, "address", addr)} 
              placeholder="Full Address" 
              icon={<Home className="w-4 h-4" />} 
              isLoaded={isGoogleMapsLoaded}
              residentialAddress={personal.address}
              showUseResidential={true}
            />
          </div>

        <YesNoToggle 
          label="Do you want add another Executor? *" 
          name="hasSecondExecutor"
          value={hasSecondExecutor} 
          onChange={(e) => {
            handleInputChange(e);
            if (e.target.value === true && executors.length === 1) {
              addArrayItem("executors", { name: "", relation: { category: null, customValue: "" }, address: "" });
            } else if (e.target.value === false && executors.length > 1) {
              removeArrayItem("executors", 1);
            }
          }} 
        />

        {hasSecondExecutor === true && (
          <div className="p-4 md:p-8 rounded-2xl md:rounded-[40px] bg-[#2E3D99]/[0.02] border border-[#2E3D99]/5 transition-all animate-in fade-in slide-in-from-top-4 overflow-hidden">
            {/* Mobile/Tablet Shutter Toggle */}
            <button 
              onClick={() => toggleExpand("executors", 1)}
              className="w-full flex items-center justify-between group py-2 lg:hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2E3D99]/5 border border-[#2E3D99]/20 text-[#2E3D99] flex items-center justify-center font-bold text-[13px] shadow-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-gray-800">Second Executor {executors[1]?.name && `— ${executors[1].name}`}</h4>
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isItemExpanded("executors", 1) ? "rotate-180" : ""}`} />
            </button>

            <div className="hidden lg:flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-[#2E3D99]/5 border border-[#2E3D99]/10 text-[#2E3D99] flex items-center justify-center font-bold text-lg shadow-sm">
                2
              </div>
              <div className="h-6 w-[2px] bg-[#2E3D99]/10 rounded-full" />
              <h4 className="text-xl font-bold text-gray-900 tracking-tight">Second Executor</h4>
            </div>

            {isItemExpanded("executors", 1) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-5 md:space-y-8 mt-5 md:mt-8 pt-5 md:pt-8 border-t border-[#2E3D99]/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup label="Second Executor’s full name *" value={executors[1]?.name} onChange={(e) => handleArrayChange("executors", 1, "name", e.target.value)} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
                  <div className="space-y-2">
                    <SelectGroup 
                      label="Relationship with the second Executor *" 
                      value={executors[1]?.relation?.category} 
                      onChange={(e) => handleArrayChange("executors", 1, "relation.category", e.target.value)} 
                      options={relationshipOptions} 
                      icon={<Users className="w-4 h-4" />} 
                    />
                    {executors[1]?.relation?.category === "Other" && (
                      <input 
                        placeholder="Please specify..." 
                        value={executors[1]?.relation?.customValue || ""} 
                        onChange={(e) => handleArrayChange("executors", 1, "relation.customValue", e.target.value)}
                        className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-sm placeholder:text-gray-300" 
                      />
                    )}
                  </div>
                </div>
                <AddressInputGroup 
                  label="Full address of the second Executor *" 
                  value={executors[1]?.address} 
                  onAddressSelect={(addr) => handleArrayChange("executors", 1, "address", addr)} 
                  placeholder="Full Address" 
                  icon={<Home className="w-4 h-4" />} 
                  isLoaded={isGoogleMapsLoaded}
                  residentialAddress={personal.address}
                  showUseResidential={true}
                />
              </motion.div>
            )}
          </div>
        )}
        <StepCommentBox name="executors.0.notes" value={formData.executors?.[0]?.notes ?? ""} onChange={(e) => handleArrayChange("executors", 0, "notes", e.target.value)} step={2} />
      </div>
    );
  }

  // --- STEP 3: Beneficiaries (Q14-Q20) ---
  if (step === 3) {
    const nBeneficiaries = beneficiaries.length.toString();
    const tipData = WILLS_TIPS[3];

    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <div className="space-y-6 mb-12">
          <label className="text-sm font-bold text-gray-700">How many beneficiaries will be in the Will? *</label>
          <div className="grid grid-cols-5 gap-4 max-w-md">
             {["1", "2", "3", "4", "5"].map(num => (
               <label key={num} className="cursor-pointer">
                 <input 
                   type="radio" 
                   name="numBeneficiaries" 
                   value={num} 
                   checked={nBeneficiaries === num} 
                   onChange={(e) => {
                     const n = parseInt(num);
                     const current = beneficiaries.length;
                     if (n > current) {
                       for(let i=0; i<n-current; i++) addArrayItem("beneficiaries", { name: "", age: "", relation: { category: null, customValue: "" }, address: "" });
                     } else if (n < current) {
                       for(let i=0; i<current-n; i++) removeArrayItem("beneficiaries", beneficiaries.length - 1 - i);
                     }
                   }} 
                   className="hidden peer" 
                 />
                 <div className="py-4 text-center rounded-2xl border border-gray-100 transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2E3D99] peer-checked:to-[#1D97D7] peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-blue-900/20 peer-checked:border-transparent hover:bg-gray-50 font-bold text-sm">
                   {num}
                 </div>
               </label>
             ))}
          </div>
        </div>

        <div className="space-y-5">
          {beneficiaries.map((beneficiary, index) => (
            <div key={index} className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-gray-100 shadow-sm relative group overflow-hidden">
            {/* Mobile/Tablet Shutter Toggle */}
            <button 
              onClick={() => toggleExpand("beneficiaries", index)}
              className="w-full text-left flex items-center justify-between lg:hidden"
            >
              <div className="flex items-center gap-3">
                 <div className="w-7 h-7 bg-white border-2 border-[#2E3D99]/30 text-[#2E3D99] text-[12px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
                {beneficiary.name && !isItemExpanded("beneficiaries", index) && (
                  <span className="text-sm font-bold text-gray-800 animate-in fade-in slide-in-from-left-2">— {beneficiary.name}</span>
                )}
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isItemExpanded("beneficiaries", index) ? "rotate-180" : ""}`} />
            </button>

            <div className="hidden lg:flex items-center gap-4 mb-10">
               <div className="w-12 h-12 bg-white border-2 border-[#2E3D99]/10 text-[#2E3D99] text-xl font-extrabold rounded-2xl flex items-center justify-center shadow-sm">
                {index + 1}
              </div>
              <div className="h-6 w-[1.5px] bg-gray-100 rounded-full" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Beneficiary</span>
            </div>
            
            {isItemExpanded("beneficiaries", index) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-50"
                >
                  <InputGroup label={`Beneficiary's full name *`} value={beneficiary.name} onChange={(e) => handleArrayChange("beneficiaries", index, "name", e.target.value)} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
                  <InputGroup label={`Age of the Beneficiary *`} value={beneficiary.age} onChange={(e) => handleArrayChange("beneficiaries", index, "age", e.target.value)} placeholder="Age" type="number" icon={<FileText className="w-4 h-4" />} />
                  <div className="space-y-2">
                    <SelectGroup 
                      label={`Relationship with the Beneficiary *`} 
                      value={beneficiary.relation?.category} 
                      onChange={(e) => handleArrayChange("beneficiaries", index, "relation.category", e.target.value)} 
                      options={relationshipOptions} 
                      icon={<Users className="w-4 h-4" />} 
                    />
                    {beneficiary.relation?.category === "Other" && (
                      <input 
                        placeholder="Please specify..." 
                        value={beneficiary.relation?.customValue || ""} 
                        onChange={(e) => handleArrayChange("beneficiaries", index, "relation.customValue", e.target.value)}
                        className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-sm placeholder:text-gray-300" 
                      />
                    )}
                  </div>
                  <AddressInputGroup 
                    label={`Full address of the Beneficiary *`} 
                    value={beneficiary.address} 
                    onAddressSelect={(addr) => handleArrayChange("beneficiaries", index, "address", addr)} 
                    placeholder="Full Address" 
                    icon={<Home className="w-4 h-4" />} 
                    isLoaded={isGoogleMapsLoaded}
                    residentialAddress={personal.address}
                    showUseResidential={true}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
        <StepCommentBox name="beneficiaries.0.notes" value={formData.beneficiaries?.[0]?.notes ?? ""} onChange={(e) => handleArrayChange("beneficiaries", 0, "notes", e.target.value)} step={3} />
      </div>
    );
  }

  // --- STEP 4: Real Estate (Q21-Q24) ---
  if (step === 4) {
    const tipData = WILLS_TIPS[4];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <StepPropertySection 
          title="Joint Ownership Properties"
          description="Do you own any real-estate properties as joint ownership? *"
          arrayName="properties.joint"
          choiceName="properties.hasJoint"
          choice={properties.hasJoint}
          properties={properties.joint}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Add another Joint Property"
          isGoogleMapsLoaded={isGoogleMapsLoaded}
          residentialAddress={personal.address}
          isItemExpanded={isItemExpanded}
          onToggleExpand={toggleExpand}
          isDesktop={isDesktop}
        />

        <StepPropertySection 
          title="Sole Ownership Properties"
          description="Do you own any real-estate properties as sole ownership? *"
          arrayName="properties.sole"
          choiceName="properties.hasSole"
          choice={properties.hasSole}
          properties={properties.sole}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Add another Sole Property"
          isGoogleMapsLoaded={isGoogleMapsLoaded}
          residentialAddress={personal.address}
          isItemExpanded={isItemExpanded}
          onToggleExpand={toggleExpand}
          isDesktop={isDesktop}
        />
        <StepCommentBox name="properties.notes" value={formData.properties?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "properties.notes", value: e.target.value } })} step={4} />
      </div>
    );
  }

  // --- STEP 5: Banks (Q26-Q31) ---
  if (step === 5) {
    const tipData = WILLS_TIPS[5];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <StepBankSection 
          title="Bank Accounts (Joint)"
          description="Do you have any Joint bank accounts? *"
          arrayName="bankAccounts.joint"
          choiceName="bankAccounts.hasJoint"
          choice={bankAccounts.hasJoint}
          numName="numJointBanks"
          numValue={(bankAccounts.joint.length || 0).toString()}
          accounts={bankAccounts.joint}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          countLabel="How many bank accounts do you own as joint accounts? *"
          isItemExpanded={isItemExpanded}
          onToggleExpand={toggleExpand}
          isDesktop={isDesktop}
        />

        <StepBankSection 
          title="Bank Accounts (Single)"
          description="Do you have any bank accounts under your name only? *"
          arrayName="bankAccounts.single"
          choiceName="bankAccounts.hasSingle"
          choice={bankAccounts.hasSingle}
          numName="numSingleBanks"
          numValue={(bankAccounts.single.length || 0).toString()}
          accounts={bankAccounts.single}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          countLabel="How many bank accounts do you own under your name only? *"
          isItemExpanded={isItemExpanded}
          onToggleExpand={toggleExpand}
          isDesktop={isDesktop}
        />
        <StepCommentBox name="bankAccounts.notes" value={formData.bankAccounts?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "bankAccounts.notes", value: e.target.value } })} step={5} />
      </div>
    );
  }

  // --- STEP 6: Guardians (Q32-Q33) ---
  if (step === 6) {
    const tipData = WILLS_TIPS[6];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <StepGuardianSection 
          formData={formData}
          handleInputChange={handleInputChange}
          isGoogleMapsLoaded={isGoogleMapsLoaded}
          relationshipOptions={relationshipOptions}
          residentialAddress={personal.address}
        />
        <StepCommentBox name="guardian.notes" value={formData.guardian?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "guardian.notes", value: e.target.value } })} step={6} />
      </div>
    );
  }


  // --- STEP 7: Funeral (Q34) ---
  if (step === 7) {
    const tipData = WILLS_TIPS[7];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <div className="space-y-5">
          <YesNoToggle label="Do you have a funeral arrangement planned? *" name="funeral.hasPlan" value={funeral.hasPlan} onChange={handleInputChange} />

          {funeral.hasPlan === true ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <label className="text-[13px] font-bold text-gray-700">Please provide all details of the funeral plan *</label>
              <textarea
                name="funeral.details"
                value={funeral.details ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder="Enter details..."
                className="w-full p-6 bg-white border border-gray-100 rounded-[32px] focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] shadow-sm outline-none resize-none text-sm placeholder:text-gray-300"
              />
            </div>
          ) : funeral.hasPlan === false ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <label className="text-[13px] font-bold text-gray-700 ml-1">Choose your preference: *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {["Buried", "Cremation", "Donate for research"].map((option) => (
                   <label key={option} className="cursor-pointer h-full">
                     <input 
                       type="radio" 
                       name="funeral.details" 
                       value={option} 
                       checked={funeral.details === option} 
                       onChange={handleInputChange} 
                       className="hidden peer" 
                     />
                     <div className="py-4 px-6 text-center rounded-2xl border-2 border-gray-50 bg-white transition-all duration-300 peer-checked:border-[#2E3D99] peer-checked:bg-blue-50/40 text-gray-400 peer-checked:text-[#2E3D99] font-bold text-xs uppercase tracking-widest hover:border-[#2E3D99]/30 hover:bg-gray-50/80 hover:text-gray-600 shadow-sm peer-checked:shadow-md">
                       {option}
                     </div>
                   </label>
                 ))}
              </div>
            </div>
          ) : null}
        </div>
        <StepCommentBox name="funeral.notes" value={formData.funeral?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "funeral.notes", value: e.target.value } })} step={7} />
      </div>
    );
  }

  // --- STEP 8: Personal Props (Q35-Q38) ---
  if (step === 8) {
    const tipData = WILLS_TIPS[8];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <StepPersonalPropertySection 
          title="Joint Personal Properties"
          description="Do you own any personal properties as joint ownership? *"
          arrayName="personalAssets.joint"
          choiceName="personalAssets.hasJoint"
          choice={personalAssets.hasJoint}
          properties={personalAssets.joint}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Add another Joint Item"
          isItemExpanded={isItemExpanded}
          onToggleExpand={toggleExpand}
          isDesktop={isDesktop}
        />

        <StepPersonalPropertySection 
          title="Sole Personal Properties"
          description="Do you own any personal properties as sole ownership? *"
          arrayName="personalAssets.sole"
          choiceName="personalAssets.hasSole"
          choice={personalAssets.hasSole}
          properties={personalAssets.sole}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Add another Sole Item"
          isItemExpanded={isItemExpanded}
          onToggleExpand={toggleExpand}
          isDesktop={isDesktop}
        />
        <StepCommentBox name="personalAssets.notes" value={formData.personalAssets?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "personalAssets.notes", value: e.target.value } })} step={8} />
      </div>
    );
  }

  // --- STEP 9: Disclosures (Q39-Q42) ---
  if (step === 9) {
    const tipData = WILLS_TIPS[9];
    return (
      <div className="space-y-5">
        <SmartTipsInline hasTips={tipData.tips.length > 0} onToggle={toggleTips} />

        <div className="space-y-10">
          <YesNoToggle label="Has anyone been promised a benefit under the will? *" name="other.promisedBenefit" value={other.promisedBenefit} onChange={handleInputChange} />
          
          <YesNoToggle label="Are any Family Court orders still on foot, or binding financial agreements entered into? *" name="other.legalMatters" value={other.legalMatters} onChange={handleInputChange} />

          <YesNoToggle label="Are there any other matters which might affect the dispositions in the will? *" name="other.otherNotes" value={other.otherNotes} onChange={handleInputChange} />
        </div>

        <InputGroup 
          label="Beneficiary of all your digital rights *" 
          name="other.digitalBeneficiary" 
          value={other.digitalBeneficiary} 
          onChange={handleInputChange} 
          placeholder="e.g. Spouse / Name of Beneficiary" 
          icon={<Shield className="w-4 h-4" />} 
        />
        <StepCommentBox name="other.notes" value={formData.other?.notes ?? ""} onChange={(e) => handleInputChange({ target: { name: "other.notes", value: e.target.value } })} step={9} />
      </div>
    );
  }

  return null;
};

// --- Sub-components (Reused) ---
const StepPropertySection = ({ 
  title, description, arrayName, choiceName, choice, properties, beneficiaries, 
  handleInputChange, handleArrayChange, addArrayItem, removeArrayItem, loopQ, 
  isGoogleMapsLoaded, residentialAddress, isItemExpanded, onToggleExpand, isDesktop
}) => {
  const hasItems = properties.length > 0;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-gray-800">{title}</h4>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed">{description}</p>
        </div>
        <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm h-fit flex-shrink-0">
          {[ { label: "YES", val: true }, { label: "No", val: false } ].map(opt => (
            <button 
              key={opt.label} 
              type="button" 
              onClick={() => {
                handleInputChange({ target: { name: choiceName, value: opt.val } });
                if (opt.val === false) {
                  // If switching to No, clear all items
                  for(let i=properties.length-1; i>=0; i--) removeArrayItem(arrayName, i);
                } else if (opt.val === true && properties.length === 0) {
                  // If switching to Yes and empty, add one item
                  addArrayItem(arrayName, { address: "", volumeFolio: "", beneficiary: "", ratio: "Equally" });
                }
              }} 
              className={`px-8 py-2 text-[11px] font-bold rounded-xl transition-all tracking-wider ${choice === opt.val ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {choice === true && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
          {properties.map((prop, idx) => (
            <div key={idx} className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-gray-100 shadow-sm relative group animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Mobile/Tablet Shutter Toggle */}
              <button 
                onClick={() => onToggleExpand(arrayName, idx)}
                className="w-full text-left flex items-center justify-between group lg:hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white border-2 border-[#2E3D99]/30 text-[#2E3D99] text-[12px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </div>
                  {prop.address && !isItemExpanded(arrayName, idx) && (
                    <span className="text-sm font-bold text-gray-800 truncate max-w-[150px] md:max-w-md animate-in fade-in slide-in-from-left-2">
                      — {prop.address}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArrayItem(arrayName, idx);
                    }} 
                    className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isItemExpanded(arrayName, idx) ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Desktop Header */}
              <div className="hidden lg:flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-2 border-[#2E3D99]/10 text-[#2E3D99] text-xl font-extrabold rounded-2xl flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="h-6 w-[1.5px] bg-gray-100 rounded-full" />
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Property Detail</span>
                </div>
                <button 
                  onClick={() => removeArrayItem(arrayName, idx)} 
                  className="p-2.5 rounded-xl bg-white text-red-500 hover:text-white hover:bg-red-500 transition-all border border-red-100 hover:border-red-500 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-5 shadow-sm active:scale-95"
                >
                  <Trash2 size={14} /> Remove Property
                </button>
              </div>
              
              {isItemExpanded(arrayName, idx) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 pt-8 border-t border-gray-50"
                >
                <AddressInputGroup 
                  label="Property address *" 
                  value={prop.address} 
                  onAddressSelect={(addr) => handleArrayChange(arrayName, idx, "address", addr)} 
                  placeholder="Full Address" 
                  icon={<Home size={14} />} 
                  isLoaded={isGoogleMapsLoaded}
                  residentialAddress={residentialAddress}
                  showUseResidential={true}
                />
                <InputGroup label="Volume & Folio *" value={prop.volumeFolio} onChange={(e) => handleArrayChange(arrayName, idx, "volumeFolio", e.target.value)} placeholder="e.g. 12345/678" icon={<Archive size={14} />} />
                <SelectGroup label="Who do you want to give this property to *" value={prop.beneficiary} onChange={(e) => handleArrayChange(arrayName, idx, "beneficiary", e.target.value)} options={beneficiaries.map(b => b.name || "Untitled Beneficiary")} icon={<Heart size={14} />} />
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-gray-700">Gift ratio *</label>
                  <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm">
                    {["Equally", "Other"].map(r => (
                      <button 
                        key={r} 
                        type="button"
                        onClick={() => handleArrayChange(arrayName, idx, "ratio", r === "Equally" ? "Equally" : "Other")} 
                        className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${prop.ratio === r || (r === "Other" && prop.ratio !== "Equally" && prop.ratio !== undefined) ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {(prop.ratio !== "Equally" && prop.ratio !== undefined) && (
                      <input 
                        placeholder="Enter custom ratio" 
                        value={prop.ratio === "Other" ? "" : prop.ratio} 
                        onChange={(e) => handleArrayChange(arrayName, idx, "ratio", e.target.value)} 
                        className="w-full mt-4 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] transition-all shadow-sm outline-none text-sm placeholder:text-gray-400 animate-in slide-in-from-top-2" 
                      />
                  )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          <button 
            onClick={() => addArrayItem(arrayName, { address: "", volumeFolio: "", beneficiary: "", ratio: "Equally" })} 
            className="w-full py-6 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 hover:text-[#2E3D99] hover:border-[#2E3D99]/40 hover:bg-[#2E3D99]/[0.02] transition-all flex items-center justify-center gap-3 group"
          >
            <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-[#2E3D99]/10 group-hover:text-[#2E3D99] transition-all">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold tracking-tight uppercase">{loopQ}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const StepBankSection = ({ 
  title, description, arrayName, choiceName, choice, numName, numValue, accounts, beneficiaries, 
  handleInputChange, handleArrayChange, addArrayItem, removeArrayItem, countLabel,
  isItemExpanded, onToggleExpand, isDesktop
}) => {
  const syncAccounts = (num) => {
    const n = parseInt(num) || 0;
    const current = accounts.length;
    if (n > current) {
      for(let i=0; i<n-current; i++) addArrayItem(arrayName, { bankName: "", last4: "", beneficiary: "", ratio: "Equally" });
    } else if (n < current) {
      for(let i=0; i<current-n; i++) removeArrayItem(arrayName, accounts.length - 1 - i);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-gray-800">{title}</h4>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed">{description}</p>
        </div>
        <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm h-fit flex-shrink-0">
          {[ { label: "YES", val: true }, { label: "No", val: false } ].map(opt => (
            <button 
              key={opt.label} 
              type="button" 
              onClick={() => {
                handleInputChange({ target: { name: choiceName, value: opt.val } });
                if (opt.val === false) {
                  syncAccounts(0);
                  handleInputChange({ target: { name: numName, value: "0" } });
                } else if (opt.val === true && numValue === "0") {
                  handleInputChange({ target: { name: numName, value: "1" } });
                  syncAccounts(1);
                }
              }} 
              className={`px-8 py-2 text-[11px] font-bold rounded-xl transition-all tracking-wider ${choice === opt.val ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {choice === true && (
        <div className="space-y-12 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-6 mb-8">
            <label className="text-[13px] font-bold text-gray-700">{countLabel}</label>
            <div className="grid grid-cols-5 gap-4 max-w-md">
               {["1", "2", "3", "4", "5"].map(num => (
                 <label key={num} className="cursor-pointer">
                   <input 
                     type="radio" 
                     name={numName} 
                     value={num} 
                     checked={numValue === num} 
                     onChange={(e) => {
                       handleInputChange(e);
                       syncAccounts(e.target.value);
                     }} 
                     className="hidden peer"
                   />
                   <div className="py-4 text-center rounded-2xl border border-gray-100 transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2E3D99] peer-checked:to-[#1D97D7] peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-blue-900/20 peer-checked:border-transparent hover:bg-gray-50 font-bold text-sm">
                     {num}
                   </div>
                 </label>
               ))}
            </div>
          </div>

          <div className="space-y-5">
            {accounts.map((acc, idx) => (
              <div key={idx} className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-gray-100 shadow-sm relative group animate-in slide-in-from-bottom-4 overflow-hidden">
                {/* Mobile/Tablet Shutter Toggle */}
                <button 
                  onClick={() => onToggleExpand(arrayName, idx)}
                  className="w-full text-left flex items-center justify-between group lg:hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white border-2 border-[#2E3D99]/30 text-[#2E3D99] text-[12px] font-bold rounded-full flex items-center justify-center">
                       {idx + 1}
                    </div>
                    {acc.bankName && !isItemExpanded(arrayName, idx) && (
                      <span className="text-sm font-bold text-gray-800 truncate max-w-[150px] md:max-w-md animate-in fade-in slide-in-from-left-2">
                        — {acc.bankName} {acc.last4 ? `(xxxx ${acc.last4})` : ""}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isItemExpanded(arrayName, idx) ? "rotate-180" : ""}`} />
                </button>

                <div className="hidden lg:flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-white border-2 border-[#2E3D99]/10 text-[#2E3D99] text-xl font-extrabold rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="h-6 w-[1.5px] bg-gray-100 rounded-full" />
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Bank Detail</span>
                </div>
                
                {isItemExpanded(arrayName, idx) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-50"
                  >
                     <InputGroup label="Bank *" value={acc.bankName} onChange={(e) => handleArrayChange(arrayName, idx, "bankName", e.target.value)} placeholder="e.g. CBA" icon={<Landmark size={14} />} />
                   <InputGroup label="Last four digits *" value={acc.last4} onChange={(e) => handleArrayChange(arrayName, idx, "last4", e.target.value)} maxLength={4} placeholder="e.g. 1234" icon={<Shield size={14} />} />
                   <SelectGroup 
                      label="Who should inherit this account *" 
                      value={acc.beneficiary} 
                      onChange={(e) => handleArrayChange(arrayName, idx, "beneficiary", e.target.value)} 
                      options={beneficiaries.map(b => b.name).filter(Boolean)} 
                      icon={<Heart size={14} />} 
                    />
                   <div className="space-y-3">
                     <label className="text-[13px] font-bold text-gray-700">Gift ratio *</label>
                     <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm">
                        {["Equally", "Other"].map(r => (
                          <button 
                            key={r} 
                            type="button"
                            onClick={() => handleArrayChange(arrayName, idx, "ratio", r === "Equally" ? "Equally" : "Other")} 
                           className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${acc.ratio === r || (r === "Other" && acc.ratio !== "Equally" && acc.ratio !== undefined) ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {r}
                          </button>
                        ))}
                     </div>
                     {(acc.ratio !== "Equally" && acc.ratio !== undefined) && (
                        <input 
                          placeholder="Enter custom ratio" 
                          value={acc.ratio === "Other" ? "" : acc.ratio} 
                          onChange={(e) => handleArrayChange(arrayName, idx, "ratio", e.target.value)} 
                          className="w-full mt-4 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] transition-all shadow-sm outline-none text-sm placeholder:text-gray-400 animate-in slide-in-from-top-2" 
                        />
                     )}
                   </div>
                </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StepGuardianSection = ({ formData, handleInputChange, isGoogleMapsLoaded, relationshipOptions, residentialAddress }) => {
  const { guardian } = formData;
  const choice = guardian.hasChoice;

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <YesNoToggle 
          label="Do you want to appoint a guardian for your minor children? *" 
          name="guardian.hasChoice"
          value={choice} 
          onChange={(e) => {
            handleInputChange(e);
            if (e.target.value === false) {
              handleInputChange({ target: { name: "guardian.name", value: "" } });
              handleInputChange({ target: { name: "guardian.isExecutor", value: false } });
              handleInputChange({ target: { name: "guardian.address", value: "" } });
              handleInputChange({ target: { name: "guardian.relation.category", value: null } });
              handleInputChange({ target: { name: "guardian.relation.customValue", value: "" } });
            } else {
              handleInputChange({ target: { name: "guardian.isExecutor", value: null } });
            }
          }} 
          helper="This person will care for your children if both parents pass away."
        />
        
        {choice === true && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
            <YesNoToggle label="Do you want to appoint the Executor as guardian? *" name="guardian.isExecutor" value={guardian.isExecutor} onChange={handleInputChange} />
            
            {guardian.isExecutor === false && (
              <div className="bg-[#2E3D99]/[0.02] p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-[#2E3D99]/5 space-y-5 md:space-y-8 mt-4 md:mt-8">
                <InputGroup label="Guardian's full name *" name="guardian.name" value={guardian.name} onChange={handleInputChange} icon={<User className="w-4 h-4" />} />
                <AddressInputGroup 
                  label="Guardian's full address *" 
                  value={guardian.address} 
                  onAddressSelect={(addr) => handleInputChange({ target: { name: "guardian.address", value: addr } })} 
                  placeholder="Guardian Address" 
                  icon={<Home className="w-4 h-4" />} 
                  isLoaded={isGoogleMapsLoaded}
                  residentialAddress={residentialAddress}
                  showUseResidential={true}
                />
                <div className="space-y-2">
                  <SelectGroup 
                    label="Relationship with the guardian *" 
                    name="guardian.relation.category" 
                    value={guardian.relation?.category} 
                    onChange={handleInputChange} 
                    options={relationshipOptions} 
                    icon={<Users className="w-4 h-4" />} 
                  />
                  {guardian.relation?.category === "Other" && (
                    <input 
                      placeholder="Please specify..." 
                      value={guardian.relation?.customValue || ""} 
                      onChange={(e) => handleInputChange({ target: { name: "guardian.relation.customValue", value: e.target.value } })}
                      className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl outline-none text-sm placeholder:text-gray-300" 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StepPersonalPropertySection = ({ 
  title, description, arrayName, choiceName, choice, properties, beneficiaries, 
  handleInputChange, handleArrayChange, addArrayItem, removeArrayItem, loopQ,
  isItemExpanded, onToggleExpand, isDesktop
}) => {
  const hasItems = properties.length > 0;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-gray-800">{title}</h4>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed">{description}</p>
        </div>
        <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm h-fit flex-shrink-0">
          {[ { label: "YES", val: true }, { label: "No", val: false } ].map(opt => (
            <button 
              key={opt.label} 
              type="button" 
              onClick={() => {
                handleInputChange({ target: { name: choiceName, value: opt.val } });
                if (opt.val === false) {
                  for(let i=properties.length-1; i>=0; i--) removeArrayItem(arrayName, i);
                } else if (opt.val === true && properties.length === 0) {
                  addArrayItem(arrayName, { type: "", beneficiary: "", ratio: "Equally" });
                }
              }} 
              className={`px-8 py-2 text-[11px] font-bold rounded-xl transition-all tracking-wider ${choice === opt.val ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {choice === true && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
          {properties.map((prop, idx) => (
            <div key={idx} className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-gray-100 shadow-sm relative group animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Mobile/Tablet Shutter Toggle */}
              <button 
                onClick={() => onToggleExpand(arrayName, idx)}
                className="w-full text-left flex items-center justify-between group lg:hidden"
              >
                <div className="flex items-center gap-3">
                   <div className="w-7 h-7 bg-white border-2 border-[#2E3D99]/30 text-[#2E3D99] text-[12px] font-bold rounded-full flex items-center justify-center whitespace-nowrap">
                     {idx + 1}
                  </div>
                  {prop.type && !isItemExpanded(arrayName, idx) && (
                    <span className="text-sm font-bold text-gray-800 truncate max-w-[150px] md:max-w-md animate-in fade-in slide-in-from-left-2">
                      — {prop.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArrayItem(arrayName, idx);
                    }} 
                    className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isItemExpanded(arrayName, idx) ? "rotate-180" : ""}`} />
                </div>
              </button>

              <div className="hidden lg:flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-2 border-[#2E3D99]/10 text-[#2E3D99] text-xl font-extrabold rounded-2xl flex items-center justify-center shadow-sm">
                     {idx + 1}
                  </div>
                  <div className="h-6 w-[1.5px] bg-gray-100 rounded-full" />
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Asset Detail</span>
                </div>
                <button 
                  onClick={() => removeArrayItem(arrayName, idx)} 
                  className="p-2.5 rounded-xl bg-white text-red-500 hover:text-white hover:bg-red-500 transition-all border border-red-100 hover:border-red-500 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-5 shadow-sm active:scale-95"
                >
                  <Trash2 size={14} /> Remove Item
                </button>
              </div>
              
              {isItemExpanded(arrayName, idx) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 pt-8 border-t border-gray-50"
                >
                  <InputGroup label="Property type *" value={prop.type} onChange={(e) => handleArrayChange(arrayName, idx, "type", e.target.value)} placeholder="e.g. Motor Vehicle" icon={<Archive size={14} />} />
                <SelectGroup label="Who do you want to give this property to *" value={prop.beneficiary} onChange={(e) => handleArrayChange(arrayName, idx, "beneficiary", e.target.value)} options={beneficiaries.map(b => b.name || "Untitled Beneficiary")} icon={<Heart size={14} />} />
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-gray-700">Gift ratio *</label>
                  <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm">
                    {["Equally", "Other"].map(r => (
                      <button 
                        key={r} 
                        type="button"
                        onClick={() => handleArrayChange(arrayName, idx, "ratio", r === "Equally" ? "Equally" : "Other")} 
                        className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${prop.ratio === r || (r === "Other" && prop.ratio !== "Equally" && prop.ratio !== undefined) ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {(prop.ratio !== "Equally" && prop.ratio !== undefined) && (
                      <input 
                        placeholder="Enter custom ratio" 
                        value={prop.ratio === "Other" ? "" : prop.ratio} 
                        onChange={(e) => handleArrayChange(arrayName, idx, "ratio", e.target.value)} 
                        className="w-full mt-4 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] transition-all shadow-sm outline-none text-sm placeholder:text-gray-400 animate-in slide-in-from-top-2" 
                      />
                  )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          <button 
            onClick={() => addArrayItem(arrayName, { type: "", beneficiary: "", ratio: "Equally" })} 
            className="w-full py-6 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 hover:text-[#2E3D99] hover:border-[#2E3D99]/40 hover:bg-[#2E3D99]/[0.02] transition-all flex items-center justify-center gap-3 group"
          >
            <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-[#2E3D99]/10 group-hover:text-[#2E3D99] transition-all">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold tracking-tight uppercase">{loopQ}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- Standard Input Groups ---

const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", icon, maxLength }) => (
  <div className="space-y-3">
    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
    </label>
    <input 
      type={type} 
      name={name} 
      value={value ?? ""} 
      onChange={onChange} 
      placeholder={placeholder} 
      maxLength={maxLength} 
      className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] transition-all shadow-sm outline-none text-sm placeholder:text-gray-300" 
    />
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options, icon }) => (
  <div className="space-y-3">
    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
    </label>
    <div className="relative">
      <select 
        name={name} 
        value={value ?? ""} 
        onChange={onChange} 
        className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] shadow-sm outline-none text-sm appearance-none"
      >
        <option value="">Select Option</option>
        {options.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronRight className="w-4 h-4 text-gray-300 rotate-90" />
      </div>
    </div>
  </div>
);

const YesNoToggle = ({ label, name, value, onChange, helper, largeLabel = false }) => {
  const normalizedValue = value === "true" ? true : value === "false" ? false : value;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-8">
        <div className="space-y-1">
          <label className={`${largeLabel ? "text-[16px]" : "text-[13px]"} font-bold text-gray-700 leading-relaxed transition-all`}>{label}</label>
          {helper && <p className="text-[11px] text-gray-400 flex items-center gap-1.5"><Info size={12} className="text-[#2E3D99]/40" /> {helper}</p>}
        </div>
        <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100 shadow-sm h-fit flex-shrink-0">
          {[ { label: "YES", val: true }, { label: "No", val: false } ].map(opt => (
             <button
               key={opt.label}
               type="button"
               onClick={() => onChange({ target: { name, value: opt.val } })}
               className={`px-8 py-2 text-[11px] font-bold rounded-xl transition-all tracking-wider ${
                 normalizedValue === opt.val
                   ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md shadow-blue-900/20"
                   : "text-gray-400 hover:text-gray-600"
               }`}
             >
               {opt.label}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AddressInputGroup = ({ label, value, onAddressSelect, placeholder, icon, isLoaded, residentialAddress, showUseResidential }) => {
  const inputRef = React.useRef(null);
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  React.useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: ["au"] },
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onAddressSelect(place.formatted_address);
      }
    });

    return () => {
      if (listener) window.google.maps.event.removeListener(listener);
    };
  }, [isLoaded]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          {label}
        </label>
        {showUseResidential && residentialAddress && value !== residentialAddress && (
          <button 
            type="button"
            onClick={() => onAddressSelect(residentialAddress)}
            className="text-[10px] text-[#2E3D99] font-bold uppercase tracking-wider hover:text-[#1D97D7] transition-all"
          >
            Same as Residential
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onAddressSelect(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/5 focus:border-[#2E3D99] transition-all shadow-sm outline-none text-sm placeholder:text-gray-300"
      />
    </div>
  );
};

const FileUploadSection = ({ files, onFileUpload, onFileDelete, isUploading }) => {
  const fileInputRef = React.useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" /> Upload existing Wills (PDF)
        </label>
        {files.length > 0 && (
          <span className="text-[10px] font-bold text-[#2E3D99] bg-[#2E3D99]/5 px-3 py-1 rounded-full uppercase tracking-wider">
            {files.length} {files.length === 1 ? 'File' : 'Files'} Uploaded
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={!isUploading ? handleFileClick : undefined}
          className={`group relative h-48 border-2 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden
            ${isUploading ? "border-gray-200 bg-gray-50 cursor-wait" : "border-gray-100 hover:border-[#2E3D99] hover:bg-gray-50/5"}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept=".pdf" 
            className="hidden" 
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#2E3D99]/20 border-t-[#2E3D99] rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-400">Uploading files...</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
                <Plus className="w-6 h-6 text-gray-300 group-hover:text-[#2E3D99]" />
              </div>
              <div className="text-center px-6">
                <p className="text-xs font-bold text-gray-700">Click to upload PDFs</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium">Multiple files allowed</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {files.map((file, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm animate-in slide-in-from-right-4 duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <FileText className="w-4 h-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">{file.urlName}</p>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#1D97D7] hover:underline font-medium">View document</a>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file.urlName);
                }}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {files.length === 0 && !isUploading && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale scale-90">
              <FileText className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StepCommentBox = ({ name, value, onChange, step }) => (
  <div className="pt-8 mt-8 border-t border-gray-100/60 animate-in fade-in duration-500">
    <div className="bg-[#2E3D99]/[0.02] p-5 md:p-6 rounded-[24px] border border-[#2E3D99]/5 space-y-4 relative overflow-hidden group">
      <div className="space-y-1.5 relative z-10">
        <label className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white border border-gray-100 shadow-sm text-[#2E3D99]">
            <MessageSquare size={14} />
          </div>
          Notes & Comments (Optional)
        </label>
        <p className="text-[12px] text-gray-500 font-medium leading-relaxed pl-[34px]">
          Use this space to share any additional information for our team. These notes are for review purposes only and will not be included in your Will.
        </p>
      </div>
      <textarea
        name={name || "notes"}
        value={value}
        onChange={onChange}
        placeholder={`Add any specific instructions or notes here...`}
        rows={3}
        className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2E3D99]/10 focus:border-[#2E3D99]/30 transition-all shadow-sm outline-none text-sm placeholder:text-gray-300 resize-y relative z-10"
      />
    </div>
  </div>
);

export default WillsStepForm;
