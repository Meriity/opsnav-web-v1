import React from "react";
import { User, Phone, Mail, Home, Briefcase, FileText, Plus, Trash2, Users, Shield, Archive, Landmark, Heart } from "lucide-react";

/**
 * WillsStepForm - Handles the 10-step logic for 42 questions.
 * (Dynamic generation for Banks per user request).
 */
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
  isUploading
}) => {
  // --- SAFETY CHECK: Ensure formData and its nested objects exist ---
  if (!formData) return null;

  const data = {
    personal: formData.personal || {},
    executors: formData.executors || [],
    beneficiaries: formData.beneficiaries || [],
    properties: {
      joint: formData.properties?.joint || [],
      sole: formData.properties?.sole || []
    },
    bankAccounts: {
      joint: formData.bankAccounts?.joint || [],
      single: formData.bankAccounts?.single || []
    },
    guardian: formData.guardian || { relation: {} },
    funeral: formData.funeral || {},
    personalAssets: {
      joint: formData.personalAssets?.joint || [],
      sole: formData.personalAssets?.sole || []
    },
    other: formData.other || {},
    numSingleBanks: formData.numSingleBanks || "0",
    numJointBanks: formData.numJointBanks || "0",
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
  } = data;

  const relationshipOptions = [
    "Spouse", "Brother", "Sister", "Mother", "Father", 
    "Son", "Daughter", "Friend", "Cousin", "Other"
  ];

  // --- STEP 1: Personal (Q1-Q6) ---
  if (step === 1) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Personal details</h3>
          <p className="text-gray-500">Please provide your foundation information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputGroup label="Enter your full name" name="personal.fullName" value={personal.fullName} onChange={handleInputChange} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
          <InputGroup label="Enter your occupation" name="personal.occupation" value={personal.occupation} onChange={handleInputChange} placeholder="Occupation" icon={<Briefcase className="w-4 h-4" />} />
          <InputGroup label="Email" name="email" value={email} onChange={handleInputChange} placeholder="email@example.com" type="email" icon={<Mail className="w-4 h-4" />} />
          <InputGroup label="Phone number" name="personal.phone" value={personal.phone} onChange={handleInputChange} placeholder="Phone number" icon={<Phone className="w-4 h-4" />} />
        </div>

        <AddressInputGroup 
          label="Residential address" 
          value={personal.address} 
          onAddressSelect={(addr) => handleInputChange({ target: { name: "personal.address", value: addr } })} 
          placeholder="Enter your full residential address" 
          icon={<Home className="w-4 h-4" />} 
          isLoaded={isGoogleMapsLoaded}
        />

        <YesNoToggle 
          label="Is there an existing Will?" 
          name="personal.existingWill" 
          value={personal.existingWill} 
          onChange={handleInputChange} 
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

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Note</p>
            <p className="text-[13px] text-amber-700 font-medium leading-relaxed">
              The Will we draft will <strong>revoke all previous Wills</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: Executor (Q7-Q13) ---
  if (step === 2) {
    const addSecondExecutor = executors.length > 1;

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Executor details</h3>
          <p className="text-gray-500">Appoint your primary and optional second executor.</p>
        </div>

        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Enter the Executor’s full name" value={executors[0]?.name} onChange={(e) => handleArrayChange("executors", 0, "name", e.target.value)} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
            <div className="space-y-2">
              <SelectGroup 
                label="What is your relationship with the Executor?" 
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
                  className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl outline-none text-xs" 
                />
              )}
            </div>
          </div>
            <AddressInputGroup 
              label="Enter full address of the Executor" 
              value={executors[0]?.address} 
              onAddressSelect={(addr) => handleArrayChange("executors", 0, "address", addr)} 
              placeholder="Full Address" 
              icon={<Home className="w-4 h-4" />} 
              isLoaded={isGoogleMapsLoaded}
            />
          </div>

        <YesNoToggle 
          label="Do you want add another Executor?" 
          value={addSecondExecutor} 
          onChange={(e) => {
            if (e.target.value === true && executors.length === 1) {
              addArrayItem("executors", { name: "", relation: { category: null, customValue: "" }, address: "" });
            } else if (e.target.value === false && executors.length > 1) {
              removeArrayItem("executors", 1);
            }
          }} 
        />

        {addSecondExecutor === true && (
          <div className="bg-[#2E3D99]/5 p-8 rounded-[32px] border border-[#2E3D99]/10 space-y-8 transition-all animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Enter the second Executor’s full name" value={executors[1]?.name} onChange={(e) => handleArrayChange("executors", 1, "name", e.target.value)} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
              <div className="space-y-2">
                <SelectGroup 
                  label="What is your relationship with the Executor?" 
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
                    className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl outline-none text-xs" 
                  />
                )}
              </div>
            </div>
            <AddressInputGroup 
              label="Enter full address of the second Executor" 
              value={executors[1]?.address} 
              onAddressSelect={(addr) => handleArrayChange("executors", 1, "address", addr)} 
              placeholder="Full Address" 
              icon={<Home className="w-4 h-4" />} 
              isLoaded={isGoogleMapsLoaded}
            />
          </div>
        )}
      </div>
    );
  }

  // --- STEP 3: Beneficiaries (Q14-Q20) ---
  if (step === 3) {
    const nBeneficiaries = beneficiaries.length.toString();

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Beneficiaries details</h3>
          <p className="text-gray-500">Specify who inherits from your estate.</p>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700">How many beneficiaries will be in the Will?</label>
          <div className="grid grid-cols-5 gap-4">
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
                 <div className="p-4 text-center rounded-2xl border-2 border-gray-100 transition-all peer-checked:border-[#1D97D7] peer-checked:bg-[#1D97D7]/5 peer-checked:text-[#1D97D7] hover:bg-gray-50 font-bold">
                   {num}
                 </div>
               </label>
             ))}
          </div>
        </div>

        <div className="space-y-8">
          {beneficiaries.map((beneficiary, index) => (
            <div key={index} className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm relative group">
              <div className="absolute -top-3 left-8 px-4 py-1.5 bg-[#1D97D7] text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
                Beneficiary {index + 1}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <InputGroup label={`Enter the Beneficiary's full name`} value={beneficiary.name} onChange={(e) => handleArrayChange("beneficiaries", index, "name", e.target.value)} placeholder="Full Name" icon={<User className="w-4 h-4" />} />
                <InputGroup label={`What is the age of the Beneficiary`} value={beneficiary.age} onChange={(e) => handleArrayChange("beneficiaries", index, "age", e.target.value)} placeholder="Age" type="number" icon={<FileText className="w-4 h-4" />} />
                <div className="space-y-2">
                  <SelectGroup 
                    label={`What is your relationship with the Beneficiary?`} 
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
                      className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl outline-none text-xs" 
                    />
                  )}
                </div>
                <AddressInputGroup 
                  label={`Enter full address of the Beneficiary`} 
                  value={beneficiary.address} 
                  onAddressSelect={(addr) => handleArrayChange("beneficiaries", index, "address", addr)} 
                  placeholder="Full Address" 
                  icon={<Home className="w-4 h-4" />} 
                  isLoaded={isGoogleMapsLoaded}
                />
              </div>

              {index < beneficiaries.length - 1 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Do you want add another Beneficiary? (Included below)</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 4: Real Estate (Q21-Q24) ---
  if (step === 4) {
    return (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Real Estate</h3>
          <p className="text-gray-500">Real-estate assets and distribution.</p>
        </div>

        <StepPropertySection 
          title="Joint Ownership Properties"
          description="Do you own any real-estate properties as joint ownership?"
          arrayName="properties.joint"
          properties={properties.joint}
          beneficiaries={beneficiaries}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Do you own any other realestate properties as joint ownership?"
          isGoogleMapsLoaded={isGoogleMapsLoaded}
        />

        <StepPropertySection 
          title="Sole Ownership Properties"
          description="Do you own any real-estate properties as sole ownership?"
          arrayName="properties.sole"
          properties={properties.sole}
          beneficiaries={beneficiaries}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Do you own any other realestate properties as sole ownership?"
          isGoogleMapsLoaded={isGoogleMapsLoaded}
        />
      </div>
    );
  }

  // --- STEP 5: Banks (Q26-Q31) ---
  if (step === 5) {
    return (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Bank Accounts</h3>
          <p className="text-gray-500">Joint and single financial accounts.</p>
        </div>

        <StepBankSection 
          title="Bank Accounts (Joint)"
          description="Do you have any Joint bank accounts?"
          arrayName="bankAccounts.joint"
          numName="numJointBanks"
          numValue={(bankAccounts.joint.length || 0).toString()}
          accounts={bankAccounts.joint}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          countLabel="How many bank accounts do you own as joint accounts?"
        />

        <StepBankSection 
          title="Bank Accounts (Single)"
          description="Do you have any bank accounts under your name only?"
          arrayName="bankAccounts.single"
          numName="numSingleBanks"
          numValue={(bankAccounts.single.length || 0).toString()}
          accounts={bankAccounts.single}
          beneficiaries={beneficiaries}
          handleInputChange={handleInputChange}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          countLabel="How many bank accounts do you own under your name only?"
        />
      </div>
    );
  }

  // --- STEP 6: Guardians (Q32-Q33) ---
  if (step === 6) {
    return (
      <StepGuardianSection 
        formData={data}
        handleInputChange={handleInputChange}
        isGoogleMapsLoaded={isGoogleMapsLoaded}
        relationshipOptions={relationshipOptions}
      />
    );
  }


  // --- STEP 7: Funeral (Q34) ---
  if (step === 7) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Funeral Arrangement</h3>
          <p className="text-gray-500">Your final wishes.</p>
        </div>

        <div className="space-y-8">
          <YesNoToggle label="Do you have a funeral arrangement planned?" name="funeral.hasPlan" value={funeral.hasPlan} onChange={handleInputChange} />

          {funeral.hasPlan === true ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <label className="text-sm font-bold text-gray-700">Please provide all details of the funeral plan</label>
              <textarea
                name="funeral.details"
                value={funeral.details ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder="Enter details..."
                className="w-full p-4 bg-white border border-gray-200 rounded-[28px] focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] shadow-sm outline-none resize-none"
              />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              <label className="text-sm font-bold text-gray-700">Do you want to be:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {["Buried", "Cremation", "Donate for medical research"].map((option, idx) => (
                   <label key={option} className="cursor-pointer">
                     <input type="radio" name="funeral.details" value={option} checked={funeral.details === option} onChange={handleInputChange} className="hidden peer" />
                     <div className="p-6 text-center rounded-[24px] border-2 border-gray-100 transition-all peer-checked:border-[#2E3D99] peer-checked:bg-[#2E3D99]/5 peer-checked:text-[#2E3D99] hover:bg-gray-50 font-bold text-xs uppercase tracking-wider">
                       {idx + 1}. {option}
                     </div>
                   </label>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 8: Personal Props (Q35-Q38) ---
  if (step === 8) {
    return (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Personal properties</h3>
          <p className="text-gray-500">Motor Vechicles, House Hold Items, Shares, etc</p>
        </div>

        <StepPersonalPropertySection 
          title="Joint Personal Properties"
          description="Do you own any personal properties as joint ownership?"
          arrayName="personalAssets.joint"
          properties={personalAssets.joint}
          beneficiaries={beneficiaries}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Do you own any other personal properties as joint ownership?"
        />

        <StepPersonalPropertySection 
          title="Sole Personal Properties"
          description="Do you own any personal properties as sole ownership?"
          arrayName="personalAssets.sole"
          properties={personalAssets.sole}
          beneficiaries={beneficiaries}
          handleArrayChange={handleArrayChange}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          loopQ="Do you own any other personal properties as sole ownership?"
        />
      </div>
    );
  }

  // --- STEP 9: Disclosures (Q39-Q42) ---
  if (step === 9) {
    return (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Other information</h3>
          <p className="text-gray-500">Final disclosures and digital rights.</p>
        </div>

        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-10">
          <YesNoToggle label="Has anyone been promised a benefit under the will?" name="other.promisedBenefit" value={other.promisedBenefit} onChange={handleInputChange} />
          
          <YesNoToggle label="Are any Family Court orders still on foot, has a binding financial agreement been entered into, is there a registered relationship under the Family Court Act 1997 or an unregistered domestic partner?" name="other.legalMatters" value={other.legalMatters} onChange={handleInputChange} />

          <YesNoToggle label="Are there any other matters which might affect the dispositions in the will?" name="other.otherNotes" value={other.otherNotes} onChange={handleInputChange} />
        </div>

        <InputGroup 
          label="Beneficiary of all your digital rights" 
          name="other.digitalBeneficiary" 
          value={other.digitalBeneficiary} 
          onChange={handleInputChange} 
          placeholder="e.g. Spouse / Name of Beneficiary" 
          icon={<Shield className="w-4 h-4" />} 
        />
      </div>
    );
  }

  return null;
};

// --- Sub-components (Reused) ---

const StepPropertySection = ({ title, description, arrayName, properties, beneficiaries, handleArrayChange, addArrayItem, removeArrayItem, loopQ, isGoogleMapsLoaded }) => {
  const hasItems = properties.length > 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-gray-800">{title}</h4>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{description}</p>
        </div>
        {!hasItems && (
          <button 
            onClick={() => addArrayItem(arrayName, { address: "", volumeFolio: "", beneficiary: "", ratio: "Equally" })}
            className="px-6 py-2.5 bg-[#2E3D99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1D97D7] transition-all shadow-lg"
          >
            <Plus size={16} /> ADD PROPERTY
          </button>
        )}
      </div>

      <div className="space-y-6">
        {properties.map((prop, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group animate-in zoom-in-95 duration-300">
            <button onClick={() => removeArrayItem(arrayName, idx)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AddressInputGroup 
                label="i. enter the property address" 
                value={prop.address} 
                onAddressSelect={(addr) => handleArrayChange(arrayName, idx, "address", addr)} 
                placeholder="Property Address" 
                icon={<Home size={14} />} 
                isLoaded={isGoogleMapsLoaded}
              />
              <InputGroup label="ii. enter the Volume and Folio" value={prop.volumeFolio} onChange={(e) => handleArrayChange(arrayName, idx, "volumeFolio", e.target.value)} icon={<Archive size={14} />} />
              <SelectGroup label="iii. Whom do you want to give this property to" value={prop.beneficiary} onChange={(e) => handleArrayChange(arrayName, idx, "beneficiary", e.target.value)} options={beneficiaries.map(b => b.name || "Untitled Beneficiary")} icon={<Users size={14} />} />
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Gift ratio</label>
                <div className="flex gap-2">
                   {["Equally", "Other"].map(r => (
                     <button key={r} onClick={() => handleArrayChange(arrayName, idx, "ratio", r === "Equally" ? "Equally" : "Other")} className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all ${prop.ratio === r || (r === "Other" && prop.ratio !== "Equally") ? "border-[#2E3D99] bg-[#2E3D99]/5 text-[#2E3D99]" : "border-gray-50 text-gray-400"}`}>
                       {r}
                     </button>
                   ))}
                </div>
                {prop.ratio !== "Equally" && (
                   <input placeholder="Enter other ratio..." value={prop.ratio === "Other" ? "" : prop.ratio} onChange={(e) => handleArrayChange(arrayName, idx, "ratio", e.target.value)} className="w-full mt-2 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs" />
                )}
              </div>
            </div>
          </div>
        ))}
        {hasItems && (
          <button 
            onClick={() => addArrayItem(arrayName, { address: "", volumeFolio: "", beneficiary: "", ratio: "Equally" })}
            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-bold hover:border-[#2E3D99] hover:text-[#2E3D99] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 bg-white/50"
          >
            <Plus size={20} /> {loopQ}
          </button>
        )}
      </div>
    </div>
  );
};

const StepBankSection = ({ 
  title, description, arrayName, numName, numValue, accounts, beneficiaries, 
  handleInputChange, handleArrayChange, addArrayItem, removeArrayItem, countLabel 
}) => {
  const [choice, setChoice] = React.useState(accounts.length > 0);

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
    <div className="space-y-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div>
          <h4 className="text-xl font-bold text-[#2E3D99]">{title}</h4>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{description}</p>
        </div>
        <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
          {[ { label: "Yes", val: true }, { label: "No", val: false } ].map(opt => (
            <button 
              key={opt.label} 
              type="button" 
              onClick={() => {
                setChoice(opt.val);
                if (opt.val === false) {
                  syncAccounts(0);
                  handleInputChange({ target: { name: numName, value: "0" } });
                }
              }} 
              className={`px-8 py-2 text-xs font-bold rounded-lg transition-all ${choice === opt.val ? "bg-[#2E3D99] text-white shadow-md" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {choice === true && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700">{countLabel}</label>
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
               {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map(num => (
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
                   <div className="aspect-square flex items-center justify-center rounded-xl border-2 border-gray-50 text-xs font-bold transition-all peer-checked:border-[#1D97D7] peer-checked:bg-[#1D97D7]/5 peer-checked:text-[#1D97D7] hover:bg-gray-50">
                     {num}
                   </div>
                 </label>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {accounts.map((acc, idx) => (
              <div key={idx} className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 shadow-sm relative group animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="absolute -top-3 left-8 px-4 py-1.5 bg-[#2E3D99] text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Account {idx + 1}
                </div>
                <div className="space-y-6 mt-2">
                   <InputGroup label="i. Name of Bank" value={acc.bankName} onChange={(e) => handleArrayChange(arrayName, idx, "bankName", e.target.value)} icon={<Landmark size={14} />} />
                   <InputGroup label="ii. Last four digits of the account" value={acc.last4} onChange={(e) => handleArrayChange(arrayName, idx, "last4", e.target.value)} maxLength={4} icon={<Shield size={14} />} />
                   <SelectGroup 
                      label="iii. Whom do you want to give this property to" 
                      value={acc.beneficiary} 
                      onChange={(e) => handleArrayChange(arrayName, idx, "beneficiary", e.target.value)} 
                      options={beneficiaries.map(b => b.name).filter(Boolean)} 
                      icon={<Users size={14} />} 
                    />
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Gift ratio</label>
                     <div className="flex gap-2">
                        {["Equally", "Other"].map(r => (
                          <button 
                            key={r} 
                            type="button"
                            onClick={() => handleArrayChange(arrayName, idx, "ratio", r === "Equally" ? "Equally" : "Other")} 
                            className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all ${acc.ratio === r || (r === "Other" && acc.ratio !== "Equally" && acc.ratio !== undefined) ? "border-[#2E3D99] bg-[#2E3D99]/5 text-[#2E3D99]" : "border-gray-50 text-gray-400"}`}
                          >
                            {r}
                          </button>
                        ))}
                     </div>
                     {(acc.ratio !== "Equally" && acc.ratio !== undefined) && (
                        <input 
                          placeholder="Enter other ratio..." 
                          value={acc.ratio === "Other" ? "" : acc.ratio} 
                          onChange={(e) => handleArrayChange(arrayName, idx, "ratio", e.target.value)} 
                          className="w-full mt-2 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs animate-in slide-in-from-top-2" 
                        />
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StepGuardianSection = ({ formData, handleInputChange, isGoogleMapsLoaded, relationshipOptions }) => {
  const [guardianChoice, setGuardianChoice] = React.useState(
    (formData.guardian?.name || formData.guardian?.isExecutor !== null) ? (formData.guardian?.isExecutor === false && !formData.guardian?.name ? false : true) : null
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Guardian for Minors</h3>
        <p className="text-gray-500">Future care for your children.</p>
      </div>

      <div className="space-y-6">
        <YesNoToggle 
          label="Do you want to select any guardian to the minor children?" 
          value={guardianChoice} 
          onChange={(e) => {
            setGuardianChoice(e.target.value);
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
        />
        
        {guardianChoice === true && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
            <YesNoToggle label="Do you want to appoint the Executor as guardian?" name="guardian.isExecutor" value={formData.guardian.isExecutor} onChange={handleInputChange} />
            
            {formData.guardian.isExecutor === false && (
              <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-8">
                <InputGroup label="Enter the name of the guardian" name="guardian.name" value={formData.guardian.name} onChange={handleInputChange} icon={<User className="w-4 h-4" />} />
                <AddressInputGroup 
                  label="Address of the guardian" 
                  value={formData.guardian.address} 
                  onAddressSelect={(addr) => handleInputChange({ target: { name: "guardian.address", value: addr } })} 
                  placeholder="Guardian Address" 
                  icon={<Home className="w-4 h-4" />} 
                  isLoaded={isGoogleMapsLoaded}
                />
                <div className="space-y-2">
                  <SelectGroup 
                    label="Your relationship to the guardian" 
                    name="guardian.relation.category" 
                    value={formData.guardian.relation?.category} 
                    onChange={handleInputChange} 
                    options={relationshipOptions} 
                    icon={<Users className="w-4 h-4" />} 
                  />
                  {formData.guardian.relation?.category === "Other" && (
                    <input 
                      placeholder="Please specify..." 
                      value={formData.guardian.relation?.customValue || ""} 
                      onChange={(e) => handleInputChange({ target: { name: "guardian.relation.customValue", value: e.target.value } })}
                      className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl outline-none text-xs" 
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

const StepPersonalPropertySection = ({ title, description, arrayName, properties, beneficiaries, handleArrayChange, addArrayItem, removeArrayItem, loopQ }) => {
  const hasItems = properties.length > 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-gray-800">{title}</h4>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{description}</p>
        </div>
        {!hasItems && (
          <button 
            onClick={() => addArrayItem(arrayName, { type: "", beneficiary: "", ratio: "Equally" })}
            className="px-6 py-2.5 bg-[#2E3D99] text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-[#1D97D7] transition-all"
          >
            <Plus size={16} /> ADD ITEM
          </button>
        )}
      </div>

      <div className="space-y-6">
        {properties.map((prop, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group animate-in zoom-in-95 duration-300">
            <button onClick={() => removeArrayItem(arrayName, idx)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="i. enter the property type" value={prop.type} onChange={(e) => handleArrayChange(arrayName, idx, "type", e.target.value)} placeholder="e.g. Motor Vehicle" icon={<Archive size={14} />} />
              <SelectGroup label="ii. Whom do you want to give this property to" value={prop.beneficiary} onChange={(e) => handleArrayChange(arrayName, idx, "beneficiary", e.target.value)} options={beneficiaries.map(b => b.name || "Untitled Beneficiary")} icon={<Heart size={14} />} />
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Gift ratio</label>
                <div className="flex gap-2">
                   {["Equally", "Other"].map(r => (
                     <button 
                       key={r} 
                       type="button"
                       onClick={() => handleArrayChange(arrayName, idx, "ratio", r === "Equally" ? "Equally" : "Other")} 
                       className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all ${prop.ratio === r || (r === "Other" && prop.ratio !== "Equally" && prop.ratio !== undefined) ? "border-[#2E3D99] bg-[#2E3D99]/5 text-[#2E3D99]" : "border-gray-50 text-gray-400"}`}
                     >
                       {r}
                     </button>
                   ))}
                </div>
                {(prop.ratio !== "Equally" && prop.ratio !== undefined) && (
                   <input 
                     placeholder="Enter other ratio..." 
                     value={prop.ratio === "Other" ? "" : prop.ratio} 
                     onChange={(e) => handleArrayChange(arrayName, idx, "ratio", e.target.value)} 
                     className="w-full mt-2 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs animate-in slide-in-from-top-2" 
                   />
                )}
              </div>
            </div>
          </div>
        ))}
        {hasItems && (
          <button 
            onClick={() => addArrayItem(arrayName, { type: "", beneficiary: "", ratio: "Equally" })} 
            className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[32px] text-gray-400 font-bold hover:border-[#2E3D99] hover:text-[#2E3D99] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> {loopQ}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Standard Input Groups ---

const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", icon, maxLength }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    <input type={type} name={name} value={value ?? ""} onChange={onChange} placeholder={placeholder} maxLength={maxLength} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all shadow-sm outline-none" />
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options, icon }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    <select name={name} value={value ?? ""} onChange={onChange} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] shadow-sm outline-none">
      <option value="">Select Option</option>
      {options.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
    </select>
  </div>
);

const YesNoToggle = ({ label, name, value, onChange }) => (
  <div className="flex items-start justify-between gap-12 group pb-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-4 px-4 rounded-xl transition-all">
    <label className="text-sm font-bold text-gray-700 leading-relaxed pt-1.5 flex-1">{label}</label>
    <div className="flex bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm h-fit flex-shrink-0 animate-in fade-in slide-in-from-right-2">
      {[ { label: "Yes", val: true }, { label: "No", val: false } ].map(opt => (
        <button 
          key={opt.label} 
          type="button" 
          onClick={() => onChange({ target: { name, value: opt.val } })} 
          className={`px-8 py-2.5 text-[11px] font-bold rounded-xl transition-all uppercase tracking-wider ${
            value === opt.val 
              ? "bg-[#2E3D99] text-white shadow-lg shadow-blue-900/20" 
              : "text-gray-400 hover:text-[#1D97D7] hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const AddressInputGroup = ({ label, value, onAddressSelect, placeholder, icon, isLoaded }) => {
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
      if (autocomplete && window.google) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [isLoaded]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        ref={inputRef}
        type="text" 
        value={inputValue} 
        onChange={(e) => {
          setInputValue(e.target.value);
          onAddressSelect(e.target.value);
        }} 
        placeholder={placeholder} 
        className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all shadow-sm outline-none" 
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
          <FileText className="w-4 h-4" /> Upload existing Wills (PDF)
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
            ${isUploading ? "border-gray-200 bg-gray-50 cursor-wait" : "border-gray-100 hover:border-[#2E3D99] hover:bg-gray-50/50"}
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
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#2E3D99]" />
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
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[20px] shadow-sm animate-in slide-in-from-right-4 duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-red-50 rounded-xl">
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
            <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale scale-90">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WillsStepForm;
