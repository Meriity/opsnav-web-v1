import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage1({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const [formData, setFormData] = useState({
    referral: "",
    retainer: "",
    declarationForm: "",
    contractReview: "",
    quoteType: "",
    quoteAmount: "",
    tenants: "",
    systemNote: "",
    clientComment: "",
  });

  const [statuses, setStatuses] = useState({
    retainer: "In progress",
    declaration: "In progress",
    contract: "In progress",
    quoteType: "In progress",
    tenants: "In progress",
  });

  const [isSaving, setIsSaving] = useState(false);
  const originalData = useRef({});

  const stage = 1;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  const getStatus = (value) => {
    if (typeof value !== "string") return "Not Completed"; // Default for new clients

    const val = value.toLowerCase().trim();

    // Completed statuses
    if (
      val === "yes" ||
      val === "nr" ||
      val === "n/r" ||
      val === "na" ||
      val === "n/a" ||
      val === "Variable" ||
      val === "Fixed"
    )
      return "Completed";

    // Not Completed statuses
    if (val === "no") return "Not Completed";

    // In progress statuses
    if (val === "processing" || val === "in progress") return "In progress";

    return "Not Completed"; // Default fallback
  };

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white", // Green
      "Not Completed": "bg-[#FF0000] text-white", // Red
      "In progress": "bg-[#FFEECF] text-[#FF9500]", // Amber/Yellow
    };
    return statusColors[status] || "bg-[#FF0000] text-white"; // Default to red
  }

  function extractNotes(note = "") {
    const [systemNote = "", clientComment = ""] = note
      .split(" - ")
      .map((str) => str.trim());
    return { systemNote, clientComment };
  }

  // Initialize form data
  useEffect(() => {
    if (!data) return;

    const { systemNote, clientComment } = extractNotes(data.noteForClient);

    const newFormData = {
      referral: data.referral || "",
      retainer: data.retainer || "",
      declarationForm: data.declarationForm || "",
      contractReview: data.contractReview || "",
      quoteType: data.quoteType || "",
      quoteAmount: data.quoteAmount?.$numberDecimal || data.quoteAmount || "",
      tenants: data.tenants || "",
      systemNote,
      clientComment,
    };

    setFormData(newFormData);

    setStatuses({
      retainer: getStatus(newFormData.retainer),
      declaration: getStatus(newFormData.declarationForm),
      contract: getStatus(newFormData.contractReview),
      quoteType: getStatus(newFormData.quoteType),
      tenants: getStatus(newFormData.tenants),
    });

    originalData.current = newFormData;
  }, [data, reloadTrigger]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      ["retainer", "declarationForm", "contractReview", "tenants"].includes(
        field
      )
    ) {
      setStatuses((prev) => ({
        ...prev,
        [field === "declarationForm"
          ? "declaration"
          : field === "contractReview"
          ? "contract"
          : field]: getStatus(value),
      }));
    }
    if (field === "quoteType") {
      setStatuses((prev) => ({
        ...prev,
        quoteType: getStatus(value),
      }));
    }
  };

  function isChanged() {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData.current[key]
    );
  }

  const generateSystemNote = () => {
    const { retainer, declarationForm, contractReview } = formData;
    const greenValues = ["yes", "nr", "n/r", "na", "n/a"];

    const isRetainerGreen = greenValues.includes(retainer.toLowerCase());
    const isDeclarationGreen = greenValues.includes(
      declarationForm.toLowerCase()
    );
    const isContractGreen = greenValues.includes(contractReview.toLowerCase());

    if (!isRetainerGreen && !isDeclarationGreen && !isContractGreen) {
      return "Retainer, Declaration and Contract Review not received";
    }
    if (!isRetainerGreen) return "Retainer not received";
    if (!isDeclarationGreen) return "Declaration not received";
    if (!isContractGreen) return "Contract review not received";
    return "Tasks completed";
  };

  async function handleSave() {
    if (!isChanged() || isSaving) return;

    setIsSaving(true);

    try {
      const systemNote = generateSystemNote();
      const noteForClient = `${systemNote} - ${formData.clientComment}`.trim();

      const payload = {
        matterNumber,
        referral: formData.referral,
        retainer: formData.retainer,
        declarationForm: formData.declarationForm,
        contractReview: formData.contractReview,
        quoteType: formData.quoteType,
        quoteAmount: formData.quoteAmount,
        tenants: formData.tenants,
        noteForClient,
      };

      await api.upsertStageOne(payload);

      originalData.current = {
        ...formData,
        systemNote,
      };

      setReloadTrigger((prev) => !prev);
    } catch (error) {
      console.error("Failed to update stage 1:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="overflow-y-auto">
      {/* Referral */}
      <div className="mb-3">
        <label className="block mb-1 text-base font-bold">Referral</label>
        <input
          type="text"
          value={formData.referral}
          onChange={(e) => handleChange("referral", e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* Retainer */}
      <div className="mt-5">
        <div className="flex gap-4 justify-between items-center mb-3">
          <label className="block mb-1 text-base font-bold">Retainer</label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses.retainer
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{statuses.retainer}</p>
          </div>
        </div>
        <div className="flex gap-4 justify-between flex-wrap">
          {["Yes", "No", "Processing", "N/R"].map((val) => (
            <label key={val} className="flex items-center gap-2">
              <input
                type="radio"
                name="retainer"
                value={val}
                checked={formData.retainer?.toLowerCase() === val.toLowerCase()}
                onChange={() => handleChange("retainer", val)}
              />
              {val}
            </label>
          ))}
        </div>
      </div>

      {/* Declaration Form */}
      <div className="mt-5">
        <div className="flex gap-4 justify-between items-center mb-3">
          <label className="block mb-1 text-base font-bold">
            Declaration form
          </label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses.declaration
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">
              {statuses.declaration}
            </p>
          </div>
        </div>
        <div className="flex gap-4 justify-between flex-wrap">
          {["Yes", "No", "Processing", "N/R"].map((val) => (
            <label key={val} className="flex items-center gap-2">
              <input
                type="radio"
                name="declarationForm"
                value={val}
                checked={
                  formData.declarationForm.toLowerCase() === val.toLowerCase()
                }
                onChange={() => handleChange("declarationForm", val)}
              />
              {val}
            </label>
          ))}
        </div>
      </div>

      {/* Contract Review */}
      <div className="mt-5">
        <div className="flex gap-4 justify-between items-center mb-3">
          <label className="block mb-1 text-base font-bold">
            Contract Review
          </label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses.contract
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{statuses.contract}</p>
          </div>
        </div>
        <div className="flex gap-4 justify-between flex-wrap">
          {["Yes", "No", "Processing", "N/R"].map((val) => (
            <label key={val} className="flex items-center gap-2">
              <input
                type="radio"
                name="contractReview"
                value={val}
                checked={
                  formData.contractReview.toLowerCase() === val.toLowerCase()
                }
                onChange={() => handleChange("contractReview", val)}
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
          {/* <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses.quoteType
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">
              {statuses.quoteType}
            </p>
          </div> */}
        </div>
        <div className="flex gap-4 flex-wrap">
          {["Variable", "Fixed"].map((val) => (
            <label key={val} className="flex items-center gap-2">
              <input
                type="radio"
                name="quoteType"
                value={val}
                checked={formData.quoteType.toLowerCase() === val.toLowerCase()}
                onChange={() => handleChange("quoteType", val)}
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
            value={formData.quoteAmount}
            onChange={(e) => handleChange("quoteAmount", e.target.value)}
            className="w-full rounded p-2 bg-gray-100"
          />
        </div>
      </div>

      {/* Tenants */}
      <div className="mt-5">
        <div className="flex gap-4 justify-between items-center mb-3">
          <label className="block mb-1 text-base font-bold">Tenants</label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses.tenants
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{statuses.tenants}</p>
          </div>
        </div>
        <div className="flex gap-4 justify-between flex-wrap">
          {["Yes", "No", "Processing", "N/R"].map((val) => (
            <label key={val} className="flex items-center gap-2">
              <input
                type="radio"
                name="tenants"
                value={val}
                checked={formData.tenants.toLowerCase() === val.toLowerCase()}
                onChange={() => handleChange("tenants", val)}
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
          value={formData.systemNote}
          onChange={(e) => handleChange("systemNote", e.target.value)}
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
          value={formData.clientComment}
          onChange={(e) => handleChange("clientComment", e.target.value)}
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
        <div className="flex gap-2">
          <Button
            label={isSaving ? "Saving" : "Save"}
            width="w-[100px]"
            bg="bg-blue-500"
            onClick={handleSave}
            disabled={isSaving || !isChanged()}
          />
          <Button
            label="Next"
            width="w-[100px]"
            onClick={() => changeStage(stage + 1)}
          />
        </div>
      </div>
    </div>
  );
}
