import React from "react";
import { User, Shield, Users, Landmark, Home, Heart, FileText, Smartphone, Info } from "lucide-react";

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
      <div className="p-2 bg-blue-50 rounded-lg text-[#2E3D99]">
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3 pt-2">
      {children}
    </div>
  </div>
);

const Row = ({ label, value, isList = false }) => (
  <div className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 ${!isList ? "py-1" : ""}`}>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[180px]">{label}:</span>
    <span className="text-sm font-semibold text-gray-700">{value || "Not provided"}</span>
  </div>
);

const SimplifiedReview = ({ formData = {} }) => {
  const {
    personal = {},
    executors = [],
    beneficiaries = [],
    properties = { joint: [], sole: [] },
    bankAccounts = { joint: [], single: [] },
    guardian = { relation: {} },
    funeral = {},
    personalAssets = { joint: [], sole: [] },
    other = {}
  } = formData;

  const getRelation = (rel) => {
    if (!rel) return "";
    return rel.category === "Other" ? rel.customValue : rel.category;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Section title="1. Personal Details" icon={User}>
        <Row label="Full Name" value={personal.fullName} />
        <Row label="Occupation" value={personal.occupation} />
        <Row label="Phone Number" value={personal.phone} />
        <Row label="Current Address" value={personal.address} />
        <Row label="Have an existing Will?" value={personal.existingWill ? "Yes" : "No"} />
      </Section>

      <Section title="2. Executors details" icon={Shield}>
        {executors.map((ex, i) => (
          <div key={i} className={i > 0 ? "pt-4 border-t border-gray-50" : ""}>
            <p className="text-[10px] font-black text-[#2E3D99] uppercase mb-3 tracking-widest">Executor {i + 1}</p>
            <Row label="Full Name" value={ex.name} isList />
            <Row label="Relationship" value={getRelation(ex.relation)} isList />
            <Row label="Address" value={ex.address} isList />
          </div>
        ))}
      </Section>

      <Section title="3. Beneficiaries details" icon={Users}>
        {beneficiaries.map((ben, i) => (
          <div key={i} className={i > 0 ? "pt-4 border-t border-gray-50" : ""}>
            <p className="text-[10px] font-black text-[#2E3D99] uppercase mb-3 tracking-widest">Beneficiary {i + 1}</p>
            <Row label="Full Name" value={ben.name} isList />
            <Row label="Age" value={ben.age} isList />
            <Row label="Relationship" value={getRelation(ben.relation)} isList />
            <Row label="Address" value={ben.address} isList />
          </div>
        ))}
      </Section>

      <Section title="4. Real Estate" icon={Home}>
        {properties.joint.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Joint Ownership Properties</p>
            {properties.joint.map((p, i) => (
              <div key={i} className="pl-4 border-l-2 border-amber-100 space-y-1">
                <Row label="Address" value={p.address} isList />
                <Row label="Volume/Folio" value={p.volumeFolio} isList />
                <Row label="Gift To" value={p.beneficiary} isList />
                <Row label="Ratio" value={p.ratio} isList />
              </div>
            ))}
          </div>
        )}
        {properties.sole.length > 0 && (
          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sole Ownership Properties
            </p>
            {properties.sole.map((p, i) => (
              <div key={i} className="pl-4 border-l-2 border-emerald-100 space-y-1">
                <Row label="Address" value={p.address} isList />
                <Row label="Volume/Folio" value={p.volumeFolio} isList />
                <Row label="Gift To" value={p.beneficiary} isList />
                <Row label="Ratio" value={p.ratio} isList />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="5. Bank Accounts" icon={Landmark}>
        {bankAccounts.joint.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Joint Accounts</p>
            {bankAccounts.joint.map((acc, i) => (
              <div key={i} className="pl-4 border-l-2 border-amber-100 space-y-1">
                <Row label="Bank Name" value={acc.bankName} isList />
                <Row label="Account (Last 4)" value={acc.last4} isList />
                <Row label="Gift To" value={acc.beneficiary} isList />
                <Row label="Ratio" value={acc.ratio} isList />
              </div>
            ))}
          </div>
        )}
        {bankAccounts.single.length > 0 && (
          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Single Accounts</p>
            {bankAccounts.single.map((acc, i) => (
              <div key={i} className="pl-4 border-l-2 border-emerald-100 space-y-1">
                <Row label="Bank Name" value={acc.bankName} isList />
                <Row label="Account (Last 4)" value={acc.last4} isList />
                <Row label="Gift To" value={acc.beneficiary} isList />
                <Row label="Ratio" value={acc.ratio} isList />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="6. Guardian for Minors" icon={Heart}>
        <Row label="Is Executor Guardian?" value={guardian.isExecutor ? "Yes" : "No"} />
        {!guardian.isExecutor && (
          <>
            <Row label="Guardian Name" value={guardian.name} />
            <Row label="Relationship" value={getRelation(guardian.relation)} />
            <Row label="Address" value={guardian.address} />
          </>
        )}
      </Section>

      <Section title="7. Funeral Arrangements" icon={FileText}>
        <Row label="Have a funeral plan?" value={funeral.hasPlan ? "Yes" : "No"} />
        <Row label="Funeral Type" value={funeral.type} />
        <Row label="Special Details" value={funeral.details} />
      </Section>

      <Section title="8. Personal properties" icon={Landmark}>
        {personalAssets.joint.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Joint Personal Properties</p>
            {personalAssets.joint.map((a, i) => (
              <div key={i} className="pl-4 border-l-2 border-amber-100 space-y-1">
                <Row label="Asset Type" value={a.type} isList />
                <Row label="Description" value={a.description} isList />
                <Row label="Gift To" value={a.beneficiary} isList />
              </div>
            ))}
          </div>
        )}
        {personalAssets.sole.length > 0 && (
          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sole Personal Properties</p>
            {personalAssets.sole.map((a, i) => (
              <div key={i} className="pl-4 border-l-2 border-emerald-100 space-y-1">
                <Row label="Asset Type" value={a.type} isList />
                <Row label="Description" value={a.description} isList />
                <Row label="Gift To" value={a.beneficiary} isList />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="9. Other information" icon={Info}>
        <Row label="Promised Benefit?" value={other.promisedBenefit ? "Yes" : "No"} />
        <Row label="Digital Rights Beneficiary" value={other.digitalBeneficiary} />
        <Row label="Other Wishes" value={other.otherWishes} />
      </Section>
    </div>
  );
};

export default SimplifiedReview;
