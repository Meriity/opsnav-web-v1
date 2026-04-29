import { User, Shield, Users, Landmark, Home, Heart, FileText, Smartphone, Info, Pencil } from "lucide-react";

const Section = ({ title, icon: Icon, children, onEdit }) => (
  <div className="bg-white rounded-[32px] border border-gray-100 p-8 space-y-6 shadow-sm transition-all hover:shadow-md relative group/section">
    <div className="flex items-center justify-between border-b border-gray-50 pb-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#2E3D99]/5 rounded-xl text-[#2E3D99]">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2.5 text-gray-300 hover:text-[#2E3D99] hover:bg-[#2E3D99]/5 rounded-xl transition-all transform hover:scale-110 active:scale-95"
          aria-label={`Edit ${title}`}
        >
          <Pencil size={18} />
        </button>
      )}
    </div>
    <div className="space-y-4 pt-2">
      {children}
    </div>
  </div>
);

const Row = ({ label, value, isList = false }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 ${!isList ? "py-1.5" : ""}`}>
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest min-w-[160px]">{label}</span>
    <span className="text-sm font-semibold text-gray-700 leading-relaxed">{value || <span className="text-gray-300 italic font-medium">Not provided</span>}</span>
  </div>
);

const SimplifiedReview = ({ formData = {}, onEdit }) => {
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
      <Section title="1. Personal Details" icon={User} onEdit={() => onEdit?.(1)}>
        <Row label="Full Name" value={personal.fullName} />
        <Row label="Occupation" value={personal.occupation} />
        <Row label="Phone Number" value={personal.phone} />
        <Row label="Current Address" value={personal.address} />
        <Row label="Have an existing Will?" value={personal.existingWill ? "Yes" : "No"} />
      </Section>

      <Section title="2. Executors details" icon={Shield} onEdit={() => onEdit?.(2)}>
        {executors.map((ex, i) => (
          <div key={i} className={i > 0 ? "pt-4 border-t border-gray-50" : ""}>
            <p className="text-[10px] font-black text-[#2E3D99] uppercase mb-3 tracking-widest">Executor {i + 1}</p>
            <Row label="Full Name" value={ex.name} isList />
            <Row label="Relationship" value={getRelation(ex.relation)} isList />
            <Row label="Address" value={ex.address} isList />
          </div>
        ))}
      </Section>

      <Section title="3. Beneficiaries Details" icon={Users} onEdit={() => onEdit?.(3)}>
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

      <Section title="4. Real Estate" icon={Home} onEdit={() => onEdit?.(4)}>
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

      <Section title="5. Bank Accounts" icon={Landmark} onEdit={() => onEdit?.(5)}>
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

      <Section title="6. Guardian for Minors" icon={Heart} onEdit={() => onEdit?.(6)}>
        <Row label="Is Executor Guardian?" value={guardian.isExecutor ? "Yes" : "No"} />
        {!guardian.isExecutor && (
          <>
            <Row label="Guardian Name" value={guardian.name} />
            <Row label="Relationship" value={getRelation(guardian.relation)} />
            <Row label="Address" value={guardian.address} />
          </>
        )}
      </Section>

      <Section title="7. Funeral Arrangements" icon={FileText} onEdit={() => onEdit?.(7)}>
        <Row label="Have a funeral plan?" value={funeral.hasPlan ? "Yes" : "No"} />
        <Row label="Funeral Type" value={funeral.type} />
        <Row label="Special Details" value={funeral.details} />
      </Section>

      <Section title="8. Personal Properties" icon={Landmark} onEdit={() => onEdit?.(8)}>
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

      <Section title="9. Other information" icon={Info} onEdit={() => onEdit?.(9)}>
        <Row label="Promised Benefit?" value={other.promisedBenefit ? "Yes" : "No"} />
        <Row label="Digital Rights Beneficiary" value={other.digitalBeneficiary} />
        <Row label="Other Wishes" value={other.otherWishes} />
      </Section>
    </div>
  );
};

export default SimplifiedReview;
