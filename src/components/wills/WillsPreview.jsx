import React from "react";

const WillsPreview = ({ formData }) => {
  const {
    personal,
    executors,
    beneficiaries,
    properties,
    bankAccounts,
    guardian,
    funeral,
    personalAssets,
    other
  } = formData;

  const { fullName, occupation, address } = personal;
  const primaryExecutor = executors[0] || { name: "", relation: { category: "" }, address: "" };
  const secondaryExecutor = executors[1];
  const primaryBeneficiary = beneficiaries[0] || { name: "", relation: { category: "" } };

  const jointProperties = properties.joint || [];
  const soleProperties = properties.sole || [];
  const jointBanks = bankAccounts.joint || [];
  const singleBanks = bankAccounts.single || [];
  const jointPersonalProperties = personalAssets.joint || [];
  const solePersonalProperties = personalAssets.sole || [];

  const digitalRightsBeneficiary = other.digitalBeneficiary;

  const BoldValue = ({ children, placeholder = "____________________" }) => (
    <span className="font-bold uppercase tracking-tight">{children || placeholder}</span>
  );

  return (
    <div id="wills-preview-doc" className="bg-white min-h-full text-[#1a1a1a] leading-[1.6] print:p-0 print:shadow-none">
      
      {/* PAGE 1 CONTENT */}
      <div className="pdf-page p-8 md:p-12 space-y-6 text-[11px] text-justify max-w-3xl mx-auto">
        {/* Preamble */}
        <p className="uppercase font-bold tracking-tight mb-4">
          THIS IS THE LAST WILL AND TESTAMENT of me <BoldValue>{fullName}</BoldValue>, 
          of <BoldValue>{address}</BoldValue>, <BoldValue>{occupation}</BoldValue>
        </p>

        {/* Clause 1 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">1.</span>
          <p>…..</p>
        </div>

        {/* Clause 2 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">2.</span>
          <p>
            <span className="font-bold uppercase">I APPOINT</span> as my executor and trustee my <BoldValue>{primaryExecutor.relation?.category === "Other" ? primaryExecutor.relation?.customValue : primaryExecutor.relation?.category}</BoldValue> <BoldValue>{primaryExecutor.name}</BoldValue> 
            {secondaryExecutor ? (
              <> unless unable or unwilling to act or continue to act in which event I APPOINT my <BoldValue>{secondaryExecutor.relation?.category === "Other" ? secondaryExecutor.relation?.customValue : secondaryExecutor.relation?.category}</BoldValue> <BoldValue>{secondaryExecutor.name}</BoldValue> of <BoldValue>{secondaryExecutor.address}</BoldValue></>
            ) : ""} 
            <span className="font-bold uppercase"> AND I DECLARE</span> that the expression ‘my trustees’ when hereinafter used and where the context permits shall mean and include the executor or executors and trustee or trustees for the time being of my will whether original, surviving, substituted or additionally appointed, and I direct that providing one trustee remains other trustees may retire without being replaced.
          </p>
        </div>

        {/* Clause 3 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">3.</span>
          <p>…….</p>
        </div>

        {/* Clause 4 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">4.</span>
          <div className="flex-1 space-y-3">
            <p>My executors and trustees hold my estate:</p>
            
            {/* 4(a) */}
            <div className="flex gap-4">
              <span className="min-w-[20px]">(a)</span>
              <p>
                To sell, call in or convert into money any part of my estate and pay any and all death, estate or succession duties, debts, funeral and testamentary expenses and any other costs, fees or expenses associated with my death or the administration of my estate;
              </p>
            </div>
            
            {/* 4(b) */}
            <div className="flex gap-4">
              <span className="min-w-[20px]">(b)</span>
              <div className="flex-1 space-y-2">
                <p>To give to my <BoldValue>{primaryExecutor.relation?.category === "Other" ? primaryExecutor.relation?.customValue : primaryExecutor.relation?.category}</BoldValue> <BoldValue>{primaryExecutor.name}</BoldValue> all my properties listed below:</p>
                <div className="space-y-1 pl-6">
                  {soleProperties.map((p, i) => (
                    <p key={i}>({i === 0 ? "i" : "i".repeat(i+1)}) <BoldValue>{p.address}</BoldValue>, <BoldValue>{p.volumeFolio}</BoldValue></p>
                  ))}
                  {jointBanks.filter(b => b.beneficiary === primaryExecutor.name).map((b, i) => (
                    <p key={i}>(ii) monies held in <BoldValue>{b.bankName}</BoldValue>, with account ending in <BoldValue placeholder="____">{b.last4}</BoldValue></p>
                  ))}
                </div>
                <p className="italic">provided they survive me, and if not, this gift shall form part of the rest and residue of my estate;</p>
              </div>
            </div>

            {/* 4(c) */}
            <div className="flex gap-4">
              <span className="min-w-[20px]">(c)</span>
              <p>
                To do all things necessary to enable <BoldValue>{digitalRightsBeneficiary}</BoldValue> to have the use and enjoyment of all digital rights, accounts, assets, and device content;
              </p>
            </div>

            {/* 4(d) */}
            <div className="flex gap-4">
              <span className="min-w-[20px]">(d)</span>
              <p>
                To give the rest and residue of my estate (real and personal) to my spouse; and
              </p>
            </div>

            {/* 4(e) */}
            <div className="flex gap-4">
              <span className="min-w-[20px]">(e)</span>
              <div className="flex-1 space-y-3">
                <p>In the event that my spouse does not survive me, then to hold the rest and residue of my estate (real and personal) on trust:</p>
                
                <div className="space-y-3 pl-6">
                  {/* 4(e)(i) */}
                  <div className="space-y-1">
                    <p>
                      (i) To give to my <BoldValue>{primaryBeneficiary.relation?.category === "Other" ? primaryBeneficiary.relation?.customValue : primaryBeneficiary.relation?.category}</BoldValue> <BoldValue>{primaryBeneficiary.name}</BoldValue> my following Properties transferred as a sole proprietor provided she survives me and if not this gift shall form part of the rest and residue of my estate;
                    </p>
                    <div className="pl-6 space-y-0.5">
                      <p>(1) <BoldValue>{jointProperties[0]?.address}</BoldValue>, <BoldValue>{jointProperties[0]?.volumeFolio}</BoldValue></p>
                      <p>(2) <BoldValue>{soleProperties[0]?.address}</BoldValue>, <BoldValue>{soleProperties[0]?.volumeFolio}</BoldValue></p>
                    </div>
                  </div>
                  
                  {/* 4(e)(ii) */}
                  <div className="space-y-1">
                    <p>
                      (ii) To give my share of the monies held in the following accounts to the respective beneficiaries listed below:
                    </p>
                    <div className="pl-6 space-y-0.5">
                      {jointBanks.map((b, i) => (
                        <p key={`j-${i}`}>({i + 1}) <BoldValue>{b.bankName}</BoldValue>, account ending in <BoldValue placeholder="____">{b.last4}</BoldValue> to my <BoldValue>{b.beneficiary || primaryBeneficiary.name}</BoldValue></p>
                      ))}
                      {singleBanks.map((b, i) => (
                        <p key={`s-${i}`}>({jointBanks.length + i + 1}) <BoldValue>{b.bankName}</BoldValue>, account ending in <BoldValue placeholder="____">{b.last4}</BoldValue> to my <BoldValue>{b.beneficiary || primaryBeneficiary.name}</BoldValue></p>
                      ))}
                      <p>({jointBanks.length + singleBanks.length + 1}) All contents from the safe deposit (if any)</p>
                    </div>
                    <p className="italic text-[10px] mt-2">provided they survive me and if not, this gift shall form part of the rest and residue of my estate;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 CONTENT */}
      <div className="pdf-page p-8 md:p-12 space-y-6 text-[11px] text-justify max-w-3xl mx-auto">
        <div className="space-y-3">
          <div className="flex gap-4">
            <span className="min-w-[20px] invisible">4.</span>
            <div className="flex-1 space-y-3">
               <div className="pl-6 space-y-3">
                  {/* 4(e)(iii) */}
                  <div className="space-y-1 mt-4">
                    <p>
                      (iii) To give to my <BoldValue>{primaryBeneficiary.relation?.category === "Other" ? primaryBeneficiary.relation?.customValue : primaryBeneficiary.relation?.category}</BoldValue> <BoldValue>{primaryBeneficiary.name}</BoldValue> my share in the proceeds of sale of the below items provided she survives me and if not, this gift shall form part of the rest and residue of my estate;
                    </p>
                    <div className="pl-6 space-y-0.5">
                      <p>(1) <BoldValue>{jointPersonalProperties[0]?.type || solePersonalProperties[0]?.type}</BoldValue>;</p>
                      <p>(2) Any motor vehicle registered under my name and personalised vehicle number plate KA19;</p>
                      <p>(3) Home furnishings and personal chattels situated at the personal place of residence property known as <BoldValue>{address}</BoldValue>;</p>
                      <p>(4) All collectables, jewellery, watches, book collections and articles of personal adornment owned by me at my death; and</p>
                      <p>(5) Any art work in my possession.</p>
                    </div>
                  </div>

                  {/* 4(e)(iv) */}
                  <div className="space-y-1">
                    <p>
                      (iv) To divide the rest and residue of In the event that my spouse does not survive me and the above clause applies, and if there are gifts of money in that clause which mirror my spouse’s will, and if my spouse and I die within 30 days of each other, in order to prevent the gift being made twice then it shall be for one half of the said sum.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Clause 5 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">5.</span>
          <p>
            If the other parent of any of my children has not survived me then I <span className="font-bold uppercase">APPOINT</span> my 
            { (guardian.name || guardian.isExecutor === true) ? (
               <> <BoldValue>{guardian.isExecutor === true ? (primaryExecutor.relation?.category === "Other" ? primaryExecutor.relation?.customValue : primaryExecutor.relation?.category) : (guardian.relation?.category === "Other" ? guardian.relation?.customValue : guardian.relation?.category)}</BoldValue> <BoldValue>{guardian.isExecutor === true ? primaryExecutor.name : guardian.name}</BoldValue></>
            ) : " ____________________ ____________________"}
            {secondaryExecutor ? (
               <> unless unable or unwilling to act or continue to act in which event I APPOINT my <BoldValue>{secondaryExecutor.relation?.category === "Other" ? secondaryExecutor.relation?.customValue : secondaryExecutor.relation?.category}</BoldValue> <BoldValue>{secondaryExecutor.name}</BoldValue> of <BoldValue>{secondaryExecutor.address}</BoldValue></>
            ) : ""} 
            as guardian of my minor children.
          </p>
        </div>

        {/* Clause 6 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">6.</span>
          <p>
            <span className="font-bold uppercase">I DIRECT</span> my executor to arrange for <BoldValue>{funeral.details || "____________________"}</BoldValue>.
          </p>
        </div>

        {/* Clause 7 */}
        <div className="flex gap-4">
          <span className="min-w-[20px]">7.</span>
          <p>
            My trustees may in their discretion:
            <br />……..
          </p>
        </div>

        {/* Signature Section - Commented out per user manual edit */}
        {/* <div className="mt-32 pt-20 border-t border-gray-200 text-[10px]">
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="uppercase font-bold">Signed by the Testator:</p>
                <div className="border-b border-gray-900 w-full h-8"></div>
                <p className="italic">({fullName || "NAME OF TESTATOR"})</p>
              </div>
              <p>Dated: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-8">
              <p className="uppercase font-bold">Witnessed by:</p>
              <div className="space-y-6">
                <div>
                  <div className="border-b border-gray-400 w-full h-6"></div>
                  <p className="text-[8px] text-gray-400 mt-1">1. Witness Signature & Name</p>
                </div>
                <div>
                  <div className="border-b border-gray-400 w-full h-6"></div>
                  <p className="text-[8px] text-gray-400 mt-1">2. Witness Signature & Name</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default WillsPreview;
