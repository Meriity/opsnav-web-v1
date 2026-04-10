import React from "react";

const WillsPreview = ({ formData = {} }) => {
  const {
    personal = {},
    executors = [],
    beneficiaries = [],
    properties = { joint: [], sole: [] },
    bankAccounts = { joint: [], single: [] },
    guardian = { relation: {} },
    funeral = {},
    personalAssets = { joint: [], sole: [] },
    other = {},
    matterReferenceNumber = "N/A"
  } = formData;

  const getRelationText = (rel, placeholder = "") => {
    if (!rel) return placeholder;
    if (typeof rel === 'string') return rel;
    const val = rel.category === "Other" ? rel.customValue : rel.category;
    return val || placeholder;
  };

  const toRoman = (n) => {
    const romans = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
    return romans[n - 1] || n.toString();
  };

  const PageFooter = ({ pageNum, totalPages }) => (
    <div className="absolute bottom-8 left-0 right-0 text-center text-[10pt] text-gray-500 font-serif border-t border-gray-200 pt-4 mx-12">
      Page {pageNum} of {totalPages}
    </div>
  );

  const BoldValue = ({ children, placeholder = "____________________" }) => (
    <span className="font-bold">{children || placeholder}</span>
  );

  const TOTAL_PAGES = 4;

  const trusteePowers = [
    "Exercise any powers given to them by law and have all the powers, authorities and discretions of a natural person, including but not limited to the power to invest and change investments freely as if they were beneficially entitled to them;",
    "Apply for the maintenance, education, including travel to broaden the mind, advancement or benefit of a beneficiary the whole or any part of the capital and income of that part of my estate to which the beneficiary is entitled or may in future be entitled;",
    "Make a payment or payments to a minor beneficiary’s parent or guardian or a person with whom the minor beneficiary resides and accept the receipt of that payee as an absolute discharge;",
    "Make loans to beneficiaries on whatever terms;",
    "Acquire or lease property for occupation, use or enjoyment by a beneficiary, whether alone or with some other person or persons;",
    "Sell, lease, exchange, transfer to a beneficiary or otherwise dispose of property in my estate in the terms they consider expedient as though they were absolute beneficial owners;",
    "Without the consent of any beneficiary, appropriate any assets of my estate at their value in or towards the satisfaction of a legacy or a share of any person in my estate;",
    "Do all such acts and things in relation to the affairs of any company in which my estate is or may become interested or concerned;",
    "Borrow money, either with or without giving security, and enter into any mortgage, charge, security agreement, lien or security over any part of my estate;",
    "Maintain, repair, improve, develop, alter, renovate, pull down, erect or re-erect any part of my estate;",
    "Maintain, take out or participate in any policy of insurance or superannuation scheme;",
    "For any reason, for instance to allow an early distribution of residue, set aside out of my estate a fund sufficient to meet all debts, charges, taxes and other liabilities of my estate;",
    "Carry on, either alone or in partnership with any person or persons the whole or part of any business in which I am engaged or interested at my death until such time as administration of my estate is finalised, and in this respect I direct my trustees to apply for a grant of letters of administration in order to get in the goods, pending a grant of probate, if necessary;",
    "Enter into a formal trust deed in order to provide for any trusts created by this my will, including the power to appoint any additional trustees and any costs, fees, duties or other expenses consequent upon the establishment of such trust deed shall be borne by my estate; and",
    "Hold all or part of any superannuation death benefits paid to my estate in a separate superannuation proceeds trust upon and subject to the rights and powers herein created for any of the beneficiaries under this my will who qualify as death benefit dependants pursuant to the Income Tax Assessment Act 1997 in such proportions as my executors may determine provided that my estate is divided between all the beneficiaries of my estate in the proportions that accord with my wishes expressed herein."
  ];

  return (
    <div id="wills-preview-doc" className="bg-white min-h-full text-[#000] leading-[1.5] font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      
      {/* PAGE 1: TITLE PAGE */}
      <div className="pdf-page relative p-16 min-h-[297mm] w-[210mm] mx-auto shadow-sm flex flex-col justify-between text-[12pt]">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center border-t-2 border-b-2 border-black py-8 space-y-6">
            <h1 className="text-4xl font-bold tracking-[0.2em] leading-tight">
              WILL<br />OF<br />
              {(personal.fullName || "INPUT FIELD 1").toUpperCase()}
            </h1>
          </div>
        </div>
        
        <div className="text-center pb-16 space-y-2">
          <p className="text-xl font-bold">VK Lawyers Pty Ltd</p>
          <p className="text-sm">PO Box 4001, Narre Warren South VIC 3805</p>
          <p className="text-sm">Phone: (03) 5996 0691</p>
          <p className="text-sm">Email: communication@vklawyers.com.au</p>
          <p className="text-sm font-bold pt-2">Ref: {matterReferenceNumber}</p>
        </div>

        <PageFooter pageNum={1} totalPages={TOTAL_PAGES} />
      </div>

      {/* PAGE 2: CLAUSES 1-7 */}
      <div className="pdf-page relative p-16 min-h-[297mm] w-[210mm] mx-auto shadow-sm space-y-6 text-[12pt]">
        <div className="space-y-6 text-justify">
          <p>
            <span className="font-bold uppercase">THIS IS THE LAST WILL AND TESTAMENT</span> of me <BoldValue>{personal.fullName}</BoldValue>, of <BoldValue>{personal.address}</BoldValue>
          </p>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">1.</div>
            <div>
              <span className="font-bold uppercase">I HEREBY REVOKE</span> all former Wills and Testament previously made by me and declare this to be my last Will and Testament.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">2.</div>
            <div>
              <span className="font-bold uppercase">IN THIS WILL</span> the word <span className="font-bold">‘children’</span> includes child and the word <span className="font-bold">‘spouse’</span> includes a partner as determined by either marriage or a de facto relationship.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">3.</div>
            <div>
              <span className="font-bold uppercase">WHERE ANY GIFT HEREIN</span> is made to a person who does not survive me for a period of <span className="font-bold">thirty (30) days</span> the gift is to be treated as though the person died before me.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">4.</div>
            <div>
              <span className="font-bold uppercase">IN THIS WILL</span> any gift which depends upon the beneficiary surviving me by <span className="font-bold">thirty (30) days or attaining an age specified</span> in this Will does not vest unless the beneficiary survives me or attains the age specified. Income accumulated after my death and prior to the gift vesting comprises part of that gift.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">5.</div>
            <div>
              <span className="font-bold uppercase">I APPOINT</span> as my executor and trustee my <BoldValue>{getRelationText(executors[0]?.relation)}</BoldValue> <BoldValue>{executors[0]?.name}</BoldValue> 
              {executors.length > 1 && (
                <> unless unable or unwilling to act or continue to act in which event <span className="font-bold uppercase">I APPOINT</span> my <BoldValue>{getRelationText(executors[1]?.relation)}</BoldValue> <BoldValue>{executors[1]?.name}</BoldValue> of <BoldValue>{executors[1]?.address}</BoldValue></>
              )}
              <span className="font-bold uppercase"> AND I DECLARE</span> that the expression ‘my trustees’ when hereinafter used and where the context permits shall mean and include the executor or executors and trustee or trustees for the time being of my will whether original, surviving, substituted or additionally appointed, and I direct that providing one trustee remains other trustees may retire without being replaced.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">6.</div>
            <div>
              Gifts to my trustees are not dependent on them acting as executors or trustees, and they may apply to the court for commission.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">7.</div>
            <div>
              All digital rights, accounts, assets, and device content which is not otherwise personal property or the subject of a specific bequest, shall form part of the residue of my estate and my executor is empowered to deal with these assets.
            </div>
          </div>
        </div>

        <PageFooter pageNum={2} totalPages={TOTAL_PAGES} />
      </div>

      {/* PAGE 3: CLAUSES 8-14 */}
      <div className="pdf-page relative p-16 min-h-[297mm] w-[210mm] mx-auto shadow-sm space-y-8 text-[12pt]">
        <div className="space-y-6 text-justify">
          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">8.</div>
            <div>My executors and trustees hold my estate:</div>
          </div>

          <div className="pl-10 space-y-6">
            <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
              <div>(a)</div>
              <div>To sell, call in or convert into money any part of my estate and pay any and all death, estate or succession duties, debts, funeral and testamentary expenses and any other costs, fees or expenses associated with my death or the administration of my estate;</div>
            </div>

            {(properties.joint.length > 0 || bankAccounts.joint.length > 0) && (
              <div className="space-y-4">
                <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
                  <div>(b)</div>
                  <div>To give to my <BoldValue placeholder="[INPUT FIELD 8]">{getRelationText(executors[0]?.relation)}</BoldValue> <BoldValue placeholder="[INPUT FIELD 7]">{executors[0]?.name}</BoldValue> all my properties listed below:</div>
                </div>
                <div className="pl-10 space-y-2">
                  {[
                    ...properties.joint.map((p) => ({
                      text: `${p.address || "[INPUT FIELD 23(a)(i)]"}, ${p.volumeFolio || "[INPUT FIELD 23(a)(ii)]"}`
                    })),
                    ...bankAccounts.joint.map((acc) => ({
                      text: `monies held in ${acc.bankName || "[INPUT FIELD 30(b)(i)]"}, with account ending in ${acc.last4 || "[INPUT FIELD 30(b)(ii)]"}`
                    }))
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-[40px_1fr] gap-2 items-start font-bold">
                      <div>({toRoman(i+1)})</div>
                      <div>{item.text}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-[40px_1fr] gap-2 items-start font-normal pt-2">
                    <div></div>
                    <div>provided they survive me, and if not, this gift shall form part of the rest and residue of my estate;</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">9.</div>
            <div>To do all things necessary to enable <BoldValue>{other.digitalBeneficiary}</BoldValue> to have the use and enjoyment of all digital rights, accounts, assets, and device content;</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">10.</div>
            <div>To give the rest and residue of my estate (real and personal) to my spouse; and</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">11.</div>
            <div>
              <div>In the event that my spouse does not survive me, then to hold the rest and residue of my estate (real and personal) on trust:</div>
              <div className="pl-10 space-y-6 pt-4">
                {beneficiaries.map((ben, bIdx) => {
                  const benSoleProps = properties.sole.filter(p => p.beneficiary === ben.name);
                  const benSingleBanks = bankAccounts.single.filter(a => a.beneficiary === ben.name);
                  
                  if (benSoleProps.length === 0 && benSingleBanks.length === 0) return null;

                  return (
                    <div key={bIdx} className="space-y-6">
                      {/* Sub-clause a: Properties */}
                      {benSoleProps.length > 0 && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-[30px_1fr] gap-2 items-start">
                            <div className="font-bold text-[#000]">a.</div>
                            <div>
                              To give to my <BoldValue>{getRelationText(ben.relation)}</BoldValue> <BoldValue>{ben.name}</BoldValue> my following Properties transferred as a sole proprietor provided she/he survives me and if not this gift shall form part of the rest and residue of my estate;
                            </div>
                          </div>
                          <div className="pl-10 space-y-2">
                            {benSoleProps.map((p, i) => (
                              <div key={i} className="grid grid-cols-[40px_1fr] gap-2 items-start text-[#000]">
                                <div className="font-bold">({toRoman(i+1)})</div>
                                <div>{p.address}, {p.volumeFolio}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sub-clause b: Bank Accounts */}
                      {benSingleBanks.length > 0 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-[30px_1fr] gap-2 items-start">
                            <div className="font-bold text-[#000]">b.</div>
                            <div>
                              To give to my <BoldValue>{getRelationText(ben.relation)}</BoldValue> <BoldValue>{ben.name}</BoldValue> my share of the monies held in:
                            </div>
                          </div>
                          <div className="pl-10 space-y-2">
                            {benSingleBanks.map((acc, i) => (
                              <div key={i} className="grid grid-cols-[40px_1fr] gap-2 items-start text-[#000]">
                                <div className="font-bold">({toRoman(i+1)})</div>
                                <div>{acc.bankName}, with account ending in {acc.last4}</div>
                              </div>
                            ))}
                            <div className="grid grid-cols-[40px_1fr] gap-2 items-start text-[#000]">
                              <div className="font-bold">({toRoman(benSingleBanks.length + 1)})</div>
                              <div>All contents from the safe deposit (if any)</div>
                            </div>
                          </div>
                          <div className="pl-10">
                            provided she/he survives me and if not, this gift shall form part of the rest and residue of my estate;
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">12.</div>
            <div className="space-y-4">
              {beneficiaries.map((ben, bIdx) => {
                const benAssets = [...personalAssets.joint, ...personalAssets.sole].filter(a => a.beneficiary === ben.name);
                if (benAssets.length === 0) return null;
                return (
                  <div key={bIdx} className="space-y-4">
                    <p>
                      To give to my <BoldValue>{getRelationText(ben.relation)}</BoldValue> <BoldValue>{ben.name}</BoldValue> my share in the proceeds of sale of the below items provided she/he survives me and if not, this gift shall form part of the rest and residue of my estate;
                    </p>
                    <div className="pl-10 space-y-2">
                      {benAssets.map((a, i) => (
                        <div key={i} className={`grid grid-cols-[40px_1fr] gap-2 items-start ${i === 0 ? "font-bold text-[#000]" : ""}`}>
                          <div className="font-bold">{String.fromCharCode(97 + i)}.</div>
                          <div>{a.type}{a.description ? `: ${a.description}` : ""}</div>
                        </div>
                      ))}
                      <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
                        <div className="font-bold">{String.fromCharCode(97 + benAssets.length)}.</div>
                        <div>Any motor vehicle registered under my name;</div>
                      </div>
                      <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
                        <div className="font-bold">{String.fromCharCode(97 + benAssets.length + 1)}.</div>
                        <div>Home furnishings and personal chattels situated at the personal place of residence property known as <BoldValue>{personal.address}</BoldValue>;</div>
                      </div>
                      <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
                        <div className="font-bold">{String.fromCharCode(97 + benAssets.length + 2)}.</div>
                        <div>All collectables, jewellery, watches, book collections and articles of personal adornment owned by me at my death; and</div>
                      </div>
                      <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
                        <div className="font-bold">{String.fromCharCode(97 + benAssets.length + 3)}.</div>
                        <div>Any art work in my possession.</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">13.</div>
            <div>
              To divide the rest and residue of my estate equally among those of my children who survive me, provided always that should any of my children not survive me to take under this my will, leaving children who survive me and attain the age of 18 years then such children shall take by substitution and if more than one equally the share in my estate which their parent would otherwise have taken;
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">14.</div>
            <div>
              In the event that my spouse does not survive me and the above clause applies, and if there are gifts of money in that clause which mirror my spouse’s will, and if my spouse and I die within 30 days of each other, in order to prevent the gift being made twice then it shall be for one half of the said sum.
            </div>
          </div>
        </div>

        <PageFooter pageNum={3} totalPages={TOTAL_PAGES} />
      </div>

      {/* PAGE 4: CLAUSES 15-17 & EXECUTION */}
      <div className="pdf-page relative p-16 min-h-[297mm] w-[210mm] mx-auto shadow-sm space-y-8 text-[12pt]">
        <div className="space-y-6 text-justify">
          {(guardian.name || guardian.isExecutor) && (
            <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
              <div className="font-bold">15.</div>
              <div>
                If the other parent of any of my children has not survived me then I <span className="font-bold uppercase tracking-tight">APPOINT</span> my <BoldValue>{guardian.isExecutor ? getRelationText(executors[0]?.relation) : getRelationText(guardian.relation)}</BoldValue> <BoldValue>{guardian.isExecutor ? executors[0]?.name : guardian.name}</BoldValue> {executors.length > 1 && executors[1] && <>unless unable or unwilling to act or continue to act in which event <span className="font-bold uppercase tracking-tight">I APPOINT</span> my <BoldValue>{getRelationText(executors[1]?.relation)}</BoldValue> <BoldValue>{executors[1]?.name}</BoldValue></>} as guardian of my minor children.
              </div>
            </div>
          )}

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">16.</div>
            <div>
              <span className="font-bold uppercase">I DIRECT</span> my executor to arrange for <BoldValue>{funeral.details || "[funeral details]"}</BoldValue> . OR <span className="font-bold uppercase">I WISH</span> to be cremated and my funeral arrangements be carried out according to the wishes of my surviving family.
            </div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 items-start">
            <div className="font-bold">17.</div>
            <div>My trustees may in their discretion:</div>
          </div>
          
          <div className="pl-10 space-y-3">
            {trusteePowers.map((power, idx) => (
              <div key={idx} className="grid grid-cols-[40px_1fr] gap-2 items-start">
                <div>({String.fromCharCode(97 + idx)})</div>
                <div>{power}</div>
              </div>
            ))}
          </div>

          <p className="pt-8 text-justify">
            <span className="font-bold uppercase tracking-tight">IN WITNESS </span>whereof I have hereunto set my hand to this my last Will and Testament this day of
          </p>

          <div className="pt-8 grid grid-cols-[1.5fr_0.2fr_2fr] gap-4 items-start">
            <div className="text-[11pt]">
              <span className="font-bold uppercase">SIGNED</span> by <BoldValue>{personal.fullName}</BoldValue> as her/his last Will and Testament in the presence of us both present at the same time who at her/his request and in her/his presence and in the presence of each other have hereunto subscribed our names as witnesses:
            </div>
            <div className="flex justify-center h-full pt-1">
              <div className="border-l border-black h-full min-h-[100px]"></div>
            </div>
            <div className="pt-12 space-y-4">
              <div className="border-b border-black border-dotted h-4 w-full"></div>
              <p className="text-center font-bold uppercase tracking-tight">{personal.fullName}</p>
            </div>
          </div>

          <div className="pt-12 grid grid-cols-2 gap-16 text-[10pt]">
            {[1, 2].map(i => (
              <div key={i} className="space-y-8">
                <div className="space-y-1"><div className="border-b border-black border-dotted h-8 w-full"></div><p className="italic">Signature of Witness</p></div>
                <div className="space-y-1"><div className="border-b border-black border-dotted h-8 w-full"></div><p className="italic">Witness Name</p></div>
                <div className="space-y-1">
                  <div className="border-b border-black border-dotted h-8 w-full"></div>
                  <div className="border-b border-black border-dotted h-8 w-full"></div>
                  <div className="border-b border-black border-dotted h-8 w-full"></div>
                  <p className="italic">Witness Address</p>
                </div>
                <div className="space-y-1"><div className="border-b border-black border-dotted h-8 w-full"></div><p className="italic">Witness Occupation</p></div>
              </div>
            ))}
          </div>
        </div>

        <PageFooter pageNum={4} totalPages={TOTAL_PAGES} />
      </div>
    </div>
  );
};

export default WillsPreview;
