import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage1({ changeStage, data, reloadTrigger, setReloadTrigger }) {
  const [referral, setReferral] = useState("");
  const [retainer, setRetainer] = useState("");
  const [declarationForm, setDeclarationForm] = useState("");
  const [contractReview, setContractReview] = useState("");
  const [quoteType, setQuoteType] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [tenants, setTenants] = useState("");
  const [systemNote, setSystemNote] = useState("");
  const [clientComment, setClientComment] = useState("");
  const [statusRetainer, setStatusRetainer] = useState("In progress");
  const [statusDeclaration, setStatusDeclaration] = useState("In progress");
  const [statusContract, setStatusContract] = useState("In progress");
  const [statusQuoteType, setStatusQuoteType] = useState("In progress");
  const [statusTenants, setStatusTenants] = useState("In progress");
  const originalData = useRef({});

  const stage = 1;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  const getStatus = (value) => {
    if (typeof value !== "string") return "In progress";
    const val = value.toLowerCase();
    if (val === "yes") return "Completed";
    if (val === "no") return "Not Completed";
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

  function extractNotes(note = "") {
    let systemNote = "";
    let clientComment = "";

    if (typeof note === "string" && note.includes(" - ")) {
      [systemNote, clientComment] = note.split(" - ").map((str) => str.trim());
    } else {
      systemNote = note || "";
    }

    return {
      systemNote: systemNote || "",
      clientComment: clientComment || "",
    };
  }

  useEffect(() => {
    if (!data) return;

    const { systemNote, clientComment } = extractNotes(data.noteForClient);
    const fetchedData = {
      referral: data.referral || "",
      retainer: data.retainer || "",
      declarationForm: data.declarationForm || "",
      contractReview: data.contractReview || "",
      quoteType: data.quoteType || "",
      quoteAmount: data.quoteAmount || "",
      tenants: data.tenants || "",
      systemNote,
      clientComment,
    };

    setReferral(fetchedData.referral);
    setRetainer(fetchedData.retainer);
    setDeclarationForm(fetchedData.declarationForm);
    setContractReview(fetchedData.contractReview)
    setQuoteType(fetchedData.quoteType);
    setQuoteAmount(fetchedData.quoteAmount);
    setTenants(fetchedData.tenants);
    setSystemNote(fetchedData.systemNote);
    setClientComment(fetchedData.clientComment);

    setStatusRetainer(getStatus(fetchedData.retainer));
    setStatusDeclaration(getStatus(fetchedData.declarationForm));
    setStatusContract(getStatus(fetchedData?.contractReview))
    setStatusQuoteType(getStatus(fetchedData.quoteType));
    setStatusTenants(getStatus(fetchedData.tenants));
    originalData.current = fetchedData;
  }, [data, reloadTrigger]);

  // ✅ Custom checker function
  function checkFormStatus() {
    const radios = [retainer, declarationForm, tenants];
    const inputs = [referral, quoteAmount, systemNote, clientComment];

    const allYes = radios.every((val) => val.toLowerCase() === "yes");
    const anyFilled =
      radios.some((val) => val) || inputs.some((val) => val.trim() !== "");

    if (allYes) {
      console.log("green");
      return "green";
    } else if (anyFilled) {
      console.log("amber");
      return "amber";
    } else {
      console.log("red");
      return "red";
    }
  }

  function isChanged() {
    const current = {
      referral,
      retainer,
      declarationForm,
      quoteType,
      quoteAmount,
      tenants,
      systemNote,
      clientComment,
      contractReview,
    };

    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  async function handleNextClick() {
    const updateNoteForClient = (retainer_value, declaration_form_value, contract_review_form_value) => {

      const greenValues = ["Yes", "yes", "NR", "nr", "NA", "na"];

      const isRetainerGreen = greenValues.includes(retainer_value)
      const isDeclarationGreen = greenValues.includes(declaration_form_value);
      const isContractGreen = greenValues.includes(contract_review_form_value);

      if (!isRetainerGreen && !isDeclarationGreen && !isContractGreen) {
        return 'Retainer, Declaration and Contract Review not received';
      } else if (!isRetainerGreen) {
        return 'Retainer not received';
      } else if (!isDeclarationGreen) {
        return 'Declaration not received ';
      } else if (!isContractGreen) {
        return 'Contract review not received ';
      } else {
        return 'Tasks completed ';
      }

    }
    try {
      if (isChanged()) {
        const payload = {
          matterNumber,
          referral,
          retainer,
          declarationForm,
          quoteType,
          quoteAmount,
          tenants,
          noteForClient: `${updateNoteForClient(retainer, declarationForm, contractReview)} - ${clientComment}`,
        };

        await api.upsertStageOne(payload);
        console.log("Stage 1 updated successfully!");

        // ✅ Update originalData to reflect saved state
        originalData.current = { ...payload, systemNote, clientComment };
        setReloadTrigger(prev => !prev);
      }

      changeStage(stage + 1);
    } catch (error) {
      console.error("Failed to update stage 1:", error);
    }
  }


  return (
    <div>
      <div className="overflow-y-auto">
        {/* Referral */}
        <div className="mb-3">
          <label className="block mb-1 text-base font-bold">Referral</label>
          <input
            type="text"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            className="w-full rounded p-2 bg-gray-100"
          />
        </div>

        {/* Retainer */}
        <div className="mt-5">
          <div className="flex gap-4 justify-between items-center mb-3">
            <label className="block mb-1 text-base font-bold">Retainer</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusRetainer)} ${statusRetainer === "In progress" ? "text-[#FF9500]" : "text-white"
                } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusRetainer}</p>
            </div>
          </div>
          <div className="flex gap-4 justify-between flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="retainer"
                  value={val}
                  checked={retainer.toLowerCase() === val.toLowerCase()}
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
          <div className="flex gap-4 justify-between items-center mb-3">
            <label className="block mb-1 text-base font-bold">Declaration form</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusDeclaration)} ${statusDeclaration === "In progress"
                ? "text-[#FF9500]"
                : "text-white"
                } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusDeclaration}</p>
            </div>
          </div>
          <div className="flex  gap-4 justify-between flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="declarationForm"
                  value={val}
                  checked={declarationForm.toLowerCase() === val.toLowerCase()}
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

        {/* Declaration Form */}
        <div className="mt-5">
          <div className="flex gap-4 justify-between items-center mb-3">
            <label className="block mb-1 text-base font-bold">Contract Review</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusContract)} ${statusContract === "In progress"
                ? "text-[#FF9500]"
                : "text-white"
                } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusContract}</p>
            </div>
          </div>
          <div className="flex gap-4 justify-between flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contractReview"
                  value={val}
                  checked={contractReview.toLowerCase() === val.toLowerCase()}
                  onChange={() => {
                    setContractReview(val);
                    setStatusContract(getStatus(val));
                  }}
                />
                {val}
              </label>
            ))}
          </div>
        </div>

        {/* Quote Type */}
        <div className="mt-5">
          <div className="flex gap-4 justify-between items-center mb-3">
            <label className="block mb-1 text-base font-bold">Quote Type</label>
          </div>
          <div className="flex gap-4 flex-wrap">
            {["Variable", "Fixed"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quoteType"
                  value={val}
                  checked={quoteType.toLowerCase() === val.toLowerCase()}
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
            <label className="block mb-1 text-base font-bold">
              Quote amount (incl GST)
            </label>
            <input
              type="text"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Tenants */}
        <div className="mt-5">
          <div className="flex gap-4 justify-between items-center mb-3">
            <label className="block mb-1 text-base font-bold">Tenants</label>
            <div
              className={`w-[90px] h-[18px] ${bgcolor(statusTenants)} ${statusTenants === "In progress" ? "text-[#FF9500]" : "text-white"
                } flex items-center justify-center rounded-4xl`}
            >
              <p className="text-[12px] whitespace-nowrap">{statusTenants}</p>
            </div>
          </div>
          <div className="flex  gap-4 justify-between flex-wrap">
            {["Yes", "No", "Processing", "N/R"].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tenants"
                  value={val}
                  checked={tenants.toLowerCase() === val.toLowerCase()}
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
          <label className="block mb-1 text-base font-bold">
            System note for client
          </label>
          <input
            type="text"
            value={systemNote}
            onChange={(e) => setSystemNote(e.target.value)}
            disabled
            className="w-full rounded p-2 bg-gray-100"
          />
        </div>

        {/* Comment for Client */}
        <div className="mt-5">
          <label className="block mb-1 text-base font-bold">
            Comment for client
          </label>
          <textarea
            value={clientComment}
            onChange={(e) => setClientComment(e.target.value)}
            className="w-full rounded p-2 bg-gray-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex mt-10 justify-between">
          <Button
            label="Back"
            width="w-[100px]"
            onClick={() => changeStage(stage - 1)}
            disabled={stage === 1}
          />
          <Button
            label="Next"
            width="w-[100px]"
            onClick={handleNextClick}
          />
        </div>
      </div>
    </div>
  );
}
