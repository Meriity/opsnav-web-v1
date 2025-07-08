import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";

export default function Stage1({changeStage}) {
  const stage=1;
  const getStatus = (value) => {
    if (value === "Yes") return "Completed";
    if (value === "No") return "Not Completed";
    return "In progress";
  };

  function bgcolor(status) {
    switch (status) {
      case "In progress":
        return "bg-[#FFEECF]";
      case "Completed":
        return "bg-[#00A506]";
      case "Not Completed":
        return "bg-[#FF0000]";
      default:
        return "";
    }
  }


  const [referral, setReferral] = useState("");
  const [retainer, setRetainer] = useState("");
  const [declarationForm, setDeclarationForm] = useState("");
  const [quoteType, setQuoteType] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [tenants, setTenants] = useState("");
  const [systemNote, setSystemNote] = useState("");
  const [clientComment, setClientComment] = useState("");


  


  const [statusReferral, setStatusReferral] = useState("In progress");
  const [statusRetainer, setStatusRetainer] = useState("In progress");
  const [statusDeclaration, setStatusDeclaration] = useState("In progress");
  const [statusQuoteType, setStatusQuoteType] = useState("In progress");
  const [statusQuoteAmount, setStatusQuoteAmount] = useState("In progress");
  const [statusTenants, setStatusTenants] = useState("In progress");
  const [statusSystemNote, setStatusSystemNote] = useState("In progress");
  const [statusClientComment, setStatusClientComment] = useState("In progress");

 
  useEffect(() => {
    const mockData = {
      referral: "Random Referral",
      retainer: "Yes",
      declarationForm: "No",
      quoteType: "Fixed",
      quoteAmount: "5000",
      tenants: "Processing",
      systemNote: "Client needs update",
      clientComment: "Please confirm quote"
    };

    setReferral(mockData.referral);
    setRetainer(mockData.retainer);
    setDeclarationForm(mockData.declarationForm);
    setQuoteType(mockData.quoteType);
    setQuoteAmount(mockData.quoteAmount);
    setTenants(mockData.tenants);
    setSystemNote(mockData.systemNote);
    setClientComment(mockData.clientComment);

    // Set status fields
    setStatusReferral(getStatus(mockData.referral));
    setStatusRetainer(getStatus(mockData.retainer));
    setStatusDeclaration(getStatus(mockData.declarationForm));
    setStatusQuoteType(getStatus(mockData.quoteType));
    setStatusQuoteAmount(getStatus(mockData.quoteAmount));
    setStatusTenants(getStatus(mockData.tenants));
    setStatusSystemNote(getStatus(mockData.systemNote));
    setStatusClientComment(getStatus(mockData.clientComment));
  }, []);

  return (
    <div>
      <div className="overflow-y-auto">
        {/* Referral */}
        <div className="flex justify-between mb-3">
          <label className="block mb-1 text-base font-bold">Referral</label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(statusReferral)} ${
              statusReferral === "In progress" ? "text-[#FF9500]" : "text-white"
            } flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{statusReferral}</p>
          </div>
        </div>
        <input
          type="text"
          value={referral}
          onChange={(e) => {
            setReferral(e.target.value);
            setStatusReferral(getStatus(e.target.value));
          }}
          className="w-full rounded p-2 bg-gray-100"
        />

        {/* Retainer */}
        <div className="mt-5">
          <div className="flex justify-between mb-3">
            <label className="block mb-1 text-base font-bold">Retainer</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusRetainer)} ${
                statusRetainer === "In progress" ? "text-[#FF9500]" : "text-white"
              } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusRetainer}</p>
            </div>
          </div>
          <div className="flex justify-between gap-4 flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="retainer"
                  value={val}
                  checked={retainer === val}
                  onChange={() => {
                    setRetainer(val);
                    setStatusRetainer(getStatus(val));
                  }}
                />
                {val}
              </label>
            ))}
          </div>
        </div>

        {/* Declaration Form */}
        <div className="mt-5">
          <div className="flex justify-between mb-3">
            <label className="block mb-1 text-base font-bold">Declaration form</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusDeclaration)} ${
                statusDeclaration === "In progress" ? "text-[#FF9500]" : "text-white"
              } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusDeclaration}</p>
            </div>
          </div>
          <div className="flex justify-between gap-4 flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="declarationForm"
                  value={val}
                  checked={declarationForm === val}
                  onChange={() => {
                    setDeclarationForm(val);
                    setStatusDeclaration(getStatus(val));
                  }}
                />
                {val}
              </label>
            ))}
          </div>
        </div>

        {/* Quote Type */}
        <div className="mt-5">
          <div className="flex justify-between mb-3">
            <label className="block mb-1 text-base font-bold">Quote Type</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusQuoteType)} ${
                statusQuoteType === "In progress" ? "text-[#FF9500]" : "text-white"
              } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusQuoteType}</p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            {["Variable", "Fixed"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quoteType"
                  value={val}
                  checked={quoteType === val}
                  onChange={() => {
                    setQuoteType(val);
                    setStatusQuoteType(getStatus(val));
                  }}
                />
                {val}
              </label>
            ))}
          </div>

          {/* Quote Amount */}
          <div className="mt-5">
            <div className="flex justify-between mb-3">
              <label className="block mb-1 text-base font-bold">Quote amount (incl GST)</label>
              <div
                className={`w-[90px] h-[18px] ${bgcolor(statusQuoteAmount)} ${
                  statusQuoteAmount === "In progress" ? "text-[#FF9500]" : "text-white"
                } flex items-center justify-center rounded-4xl`}
              >
                <p className="text-[12px] whitespace-nowrap">{statusQuoteAmount}</p>
              </div>
            </div>
            <input
              type="text"
              value={quoteAmount}
              onChange={(e) => {
                setQuoteAmount(e.target.value);
                setStatusQuoteAmount(getStatus(e.target.value));
              }}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Tenants */}
        <div className="mt-5">
          <div className="flex justify-between mb-3">
            <label className="block mb-1 text-base font-bold">Tenants</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusTenants)} ${
                statusTenants === "In progress" ? "text-[#FF9500]" : "text-white"
              } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusTenants}</p>
            </div>
          </div>
          <div className="flex justify-between gap-4 flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tenants"
                  value={val}
                  checked={tenants === val}
                  onChange={() => {
                    setTenants(val);
                    setStatusTenants(getStatus(val));
                  }}
                />
                {val}
              </label>
            ))}
          </div>
        </div>

        {/* System Note for Client */}
        <div className="mt-5">
          <div className="flex justify-between mb-3">
            <label className="block mb-1 text-base font-bold">System note for client</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusSystemNote)} ${
                statusSystemNote === "In progress" ? "text-[#FF9500]" : "text-white"
              } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusSystemNote}</p>
            </div>
          </div>
          <input
            type="text"
            value={systemNote}
            onChange={(e) => {
              setSystemNote(e.target.value);
              setStatusSystemNote(getStatus(e.target.value));
            }}
            className="w-full rounded p-2 bg-gray-100"
          />
        </div>

        {/* Comment for Client */}
        <div className="mt-5">
          <div className="flex justify-between mb-3">
            <label className="block mb-1 text-base font-bold">Comment for client</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusClientComment)} ${
                statusClientComment === "In progress" ? "text-[#FF9500]" : "text-white"
              } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusClientComment}</p>
            </div>
          </div>
          <textarea
            value={clientComment}
            onChange={(e) => {
              setClientComment(e.target.value);
              setStatusClientComment(getStatus(e.target.value));
            }}
            className="w-full rounded p-2 bg-gray-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex mt-10 justify-between">
          <Button label="Back" width="w-[100px]" onClick={()=>changeStage(stage-1)} disabled={stage === 1}/>
          <Button label="Next" width="w-[100px]" onClick={()=>changeStage(stage+1)}  />
        </div>
      </div>
    </div>
  );
}
