import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import WillsAPI from "@/api/willsAPI";
import VocatFasAPI from "@/api/vocatFasAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

// Configuration object for different clients
const formConfig = {
  conveyancing: [
    { name: "referral", label: "Referral", type: "text" },
    {
      name: "retainer",
      label: "Retainer",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "declarationForm",
      label: "Declaration form",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "contractReview",
      label: "Contract Review",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "quoteType",
      label: "Quote Type",
      type: "radio",
      options: ["Variable", "Fixed"],
    },
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "number" },
    {
      name: "tenants",
      label: "Tenants",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
  ],
  "print media": [
    {
      name: "customerDetailsVerified",
      label: "Verify Customer Details",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "distanceFeasibility",
      label: "Check Distance / Feasibility",
      type: "text",
    },
    {
      name: "timeline",
      label: "Timeline / Deadline",
      type: "text",
    },
    {
      name: "customerAcceptedQuote",
      label: "Confirm Customer Acceptance of Quote",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "approvalStatus",
      label: "Approve or reject order for planning",
      type: "radio",
      options: ["Approved", "Rejected", "Pending"],
    },
  ],
  commercial: [
    { name: "referral", label: "Referral", type: "text" },
    {
      name: "retainer",
      label: "Retainer",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "contractReview",
      label: "Contract Review",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "quoteType",
      label: "Quote Type",
      type: "radio",
      options: ["Fixed", "Variable"],
    },
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "number" },
  ],
  wills: [
    { name: "referral", label: "Referral", type: "text" },
    {
      name: "retainer",
      label: "Retainer",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "declarationForm",
      label: "Declaration form",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "quoteType",
      label: "Quote Type",
      type: "radio",
      options: ["Variable", "Fixed"],
    },
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "number" },
  ],
  vocat: [
    {
      name: "referral",
      label: "Referral",
      type: "text",
    },
    {
      name: "clientAuthority",
      label: "Client Authority",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      name: "evidenceOfIncident",
      label: "Evidence of Incident",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      name: "reportedToPolice",
      label: "Reported to Police",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      name: "policeDetailsProvided",
      label: "If Yes, details provided",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      name: "typeOfAidHeader",
      label: "Type of aid: (pick multiple)",
      type: "header", // Just a visual label
    },
    {
      name: "lossOfEarning",
      label: "Loss of earning",
      type: "checkbox",
    },
    {
      name: "clothing",
      label: "Clothing",
      type: "checkbox",
    },
    {
      name: "securityExpenses",
      label: "Security related expenses",
      type: "checkbox",
    },
    {
      name: "medicalExpenses",
      label: "Medical expenses",
      type: "checkbox",
    },
    {
      name: "recoveryExpenses",
      label: "Recovery related expenses",
      type: "checkbox",
    },
  ],
};

// Common fields for all clients
const commonFields = [
  { name: "systemNote", label: "System note for client", type: "system-note" },
  { name: "clientComment", label: "Comment for client", type: "textarea" },
];

export default function Stage1({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
  setHasChanges,
  stageNumber = 1,
}) {
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const originalData = useRef({});

  const hasLoaded = useRef(false);

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);
  const willsApi = useMemo(() => new WillsAPI(), []);
  const vocatApi = useMemo(() => new VocatFasAPI(), []);
  const { matterNumber } = useParams();

  // Stabilize company + fields so they can be safely used in hooks' deps
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const isReadOnly = useMemo(() => localStorage.getItem("role") === "read-only", []);

  const currentFields = useMemo(
    () => formConfig[currentModule] || formConfig.conveyancing,
    [currentModule]
  );

  // Helper to normalize/standardize values for comparison and storage
  const normalizeValue = useCallback((v) => {
    if (v === undefined || v === null) return "";
    return String(v)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  }, []);

  const getStatus = useCallback(
    (value) => {
      const val = normalizeValue(value);
      const completed = new Set([
        "yes",
        "nr",
        "na",
        "variable",
        "fixed",
        "approved",
      ]);
      if (completed.has(val)) return "Completed";
      if (val === "no") return "Not Completed";
      if (["processing", "inprogress"].includes(val)) return "In Progress";
      return "Not Completed";
    },
    [normalizeValue]
  );

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  }

  function extractNotes(note) {
    const [systemNote = "", clientComment = ""] = (note || "")
      .split(" - ")
      .map((str) => str.trim());
    return { systemNote, clientComment };
  }

  const generateSystemNote = () => {
    const radioFields = currentFields.filter((field) => field.type === "radio");
    const textFields = currentFields.filter((field) => field.type === "text");
    const greenValues = new Set([
      "yes",
      "nr",
      "na",
      "variable",
      "fixed",
      "approved",
    ]);

    // radio fields not received
    const notReceivedRadio = radioFields
      .filter(
        (field) => !greenValues.has(normalizeValue(formData[field.name] || ""))
      )
      .map((field) => field.label);

    // text fields not received (empty or whitespace)
    const notReceivedText = textFields
      .filter(
        (field) =>
          !formData[field.name] || formData[field.name].toString().trim() === ""
      )
      .map((field) => field.label);

    const notReceived = [...notReceivedRadio, ...notReceivedText];

    if (notReceived.length === 0) {
      return "Tasks completed";
    }
    if (notReceived.length === 1) {
      return `${notReceived[0]} not received`;
    }
    return `${notReceived.join(", ")} not received`;
  };

  // Add costing fields for IDG admins - Effect to inject fields
  useEffect(() => {
    if (
      currentModule === "print media" &&
      (localStorage.getItem("role") === "admin" ||
        localStorage.getItem("role") === "superadmin")
    ) {
      const hasCostingFields = formConfig["print media"].some(
        (field) => field.name === "costing_amount"
      );

      if (!hasCostingFields) {
        formConfig["print media"].push(
          {
            name: "costingType",
            label: "Confirm Costing Type",
            type: "radio",
            options: ["Fixed", "Variable"],
          },
          {
            name: "costing_amount",
            label: "Costing Amount",
            type: "text",
          }
        );
      }
    }
  }, [currentModule]);

  // Initialize from props
  useEffect(() => {
    if (!data) return;
    if (hasLoaded.current) return;

    const initializeData = () => {
      // Use data prop directly
      const stageData = data;

      const { systemNote, clientComment } = extractNotes(
        stageData?.noteForClient
      );

      const initialFormData = {};
      const initialStatuses = {};
      const aidTypes = stageData.aidTypes || {};

      currentFields.forEach((field) => {
        let value = "";

        if (currentModule === "vocat" && field.type === "checkbox") {
             value = aidTypes[field.name] ?? stageData[field.name] ?? false;
        } else if (field.name === "quoteAmount") {
          value =
            stageData[field.name]?.$numberDecimal ??
            stageData[field.name] ??
            "";
        } else if (field.type === "radio") {
          value = normalizeValue(stageData[field.name] ?? "");
        } else {
          value = stageData[field.name] ?? "";
        }

        initialFormData[field.name] = value;

        if (field.type === "radio") {
          initialStatuses[field.name] = getStatus(value);
        }
      });
      if (currentModule === "print media") {
        if (stageData.costingType)
          initialFormData.costingType = normalizeValue(stageData.costingType);
        if (stageData.costing_amount)
          initialFormData.costing_amount = stageData.costing_amount;

        if (initialFormData.costingType)
          initialStatuses.costingType = getStatus(initialFormData.costingType);
      }

      initialFormData.systemNote = systemNote;
      initialFormData.clientComment = clientComment;

      setFormData(initialFormData);
      setStatuses(initialStatuses);

      originalData.current = {
        ...initialFormData,
      };

      hasLoaded.current = true;
      setIsLoading(false);
      setHasChanges(false);
    };

    initializeData();
  }, [data, currentModule, currentFields, getStatus]);

  useEffect(() => {
    hasLoaded.current = false;
  }, [matterNumber]);

  const handleChange = (field, value) => {
    const fieldConfig = currentFields.find((f) => f.name === field);
    // fallback for dynamic fields like costing
    const dynamicFieldType =
      field === "costingType"
        ? "radio"
        : field === "costing_amount"
        ? "text"
        : "text";
    const isRadio =
      fieldConfig?.type === "radio" || dynamicFieldType === "radio";

    const processed = isRadio ? normalizeValue(value) : value;

    setFormData((prev) => ({ ...prev, [field]: processed }));
    setHasChanges(true);

    if (isRadio) {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processed) }));
    }
  };

  function isChanged() {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData.current[key]
    );
  }

  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      const systemNote = generateSystemNote();
      let noteForClient = `${systemNote} - ${formData.clientComment}`.trim();

      let payload = {
        ...formData,
      };

      // FIXED: Filter commercial fields and ensure correct payload structure
      if (currentModule === "commercial") {
        // Only include fields that exist in the commercial schema
        const commercialFields = [
          "referral",
          "retainer",
          "contractReview",
          "quoteType",
          "quoteAmount",
          "noteForSystem",
          "noteForClient",
          "colorStatus",
          "matterNumber",
        ];
        const filteredPayload = {};

        commercialFields.forEach((field) => {
          if (payload[field] !== undefined) {
            filteredPayload[field] = payload[field];
          }
        });

        payload = filteredPayload;

        // Generate system note
        payload.noteForSystem = systemNote;
        payload.noteForClient = noteForClient;

        // Calculate and add color status
        const allCompleted = currentFields.every(
          (field) => getStatus(formData[field.name]) === "Completed"
        );
        payload.colorStatus = allCompleted ? "green" : "amber";
      } else if (currentModule === "vocat") {
        payload.noteForClient = noteForClient;
        
        // Nest aid types
        const aidTypes = {
             lossOfEarning: payload.lossOfEarning || false,
             clothing: payload.clothing || false,
             securityExpenses: payload.securityExpenses || false,
             medicalExpenses: payload.medicalExpenses || false,
             recoveryExpenses: payload.recoveryExpenses || false
        };
        payload.aidTypes = aidTypes;

        delete payload.lossOfEarning;
        delete payload.clothing;
        delete payload.securityExpenses;
        delete payload.medicalExpenses;
        delete payload.recoveryExpenses;
      } else {
        // For other modules, use combined note structure
        payload.noteForClient = noteForClient;
      }

      // remove temporary fields
      delete payload.systemNote;
      delete payload.clientComment;

      // API CALL SECTION
      if (currentModule === "print media") {
        payload.orderId = matterNumber;
      } else {
        payload.matterNumber = matterNumber;
      }

      if (currentModule === "commercial") {
        await commercialApi.upsertStage(1, matterNumber, payload);
      } else if (currentModule === "print media") {
        await api.upsertIDGStages(matterNumber, 1, payload);
      } else if (currentModule === "wills") {
        await willsApi.upsertStage(1, matterNumber, payload);
      } else if (currentModule === "vocat") {
        payload.notes = payload.noteForClient; 
        await vocatApi.saveStageOne(payload);
      } else {
        const res = await api.upsertStageOne(payload);

        // Store authoritative Stage 1 color from POST response
        if (res?.data?.colorStatus) {
          sessionStorage.setItem("stage1ColorOverride", res.data.colorStatus);
        }
      }

      originalData.current = { ...formData };
      setHasChanges(false);

      // Notify parent
      setReloadTrigger((prev) => !prev);

      toast.success("Stage 1 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (error) {
      let errorMessage = "Failed to save Stage 1. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  const renderField = (field) => {
    // Conditional rendering for VOCAT
    if (currentModule === "vocat" && field.name === "policeDetailsProvided") {
       const reported = normalizeValue(formData.reportedToPolice);
       if (reported !== "yes") return null;
    }

    switch (field.type) {
      case "number":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData[field.name] || ""}
              disabled={isReadOnly}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="0.00"
              className={`w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isReadOnly ? "cursor-not-allowed bg-gray-200 text-gray-800 font-medium" : ""}`}
            />
          </div>
        );

      case "text":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="text"
              value={formData[field.name] || ""}
              disabled={isReadOnly}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base ${isReadOnly ? "cursor-not-allowed bg-gray-200 text-gray-800 font-medium" : ""}`}
            />
          </div>
        );

      case "radio":
        return (
          <div key={field.name} className="mt-5">
            <div className="flex gap-4 justify-between items-center mb-3">
              <label className="block mb-1 text-sm md:text-base font-bold">
                {field.label}
              </label>
              <div
                className={`w-auto sm:w-[90px] h-[18px] ${bgcolor(
                  statuses[field.name]
                )} flex items-center justify-center rounded-4xl px-2`}
              >
                <p className="text-[10px] md:text-[12px] whitespace-nowrap">
                  {statuses[field.name] || "Not Completed"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2">
              {field.options.map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm md:text-base min-w-0"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={val}
                    checked={
                      normalizeValue(formData[field.name]) ===
                      normalizeValue(val)
                    }
                    onChange={() => !isReadOnly && handleChange(field.name, val)}
                    disabled={false}
                    className={isReadOnly ? "accent-gray-500 w-4 h-4 pointer-events-none" : ""}
                  />
                  <span className="truncate">{val}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "system-note":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="text"
              value={generateSystemNote()}
              disabled
              className="w-full rounded p-2 bg-gray-100 text-sm md:text-base"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <textarea
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base resize-none ${isReadOnly ? "cursor-not-allowed bg-gray-200 text-gray-800 font-medium" : ""}`}
              disabled={isReadOnly}
            />
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="mt-4 flex items-center">
            <input
              type="checkbox"
              id={field.name}
              checked={!!formData[field.name]}
              disabled={isReadOnly}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3"
            />
             <label htmlFor={field.name} className="text-sm md:text-base font-bold text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case "header":
          return (
             <div key={field.name} className="mt-6 mb-2">
                <h3 className="text-lg font-bold text-gray-800">{field.label}</h3>
             </div>
          );

      default:
        return null;
    }
  };

  useEffect(() => {
    const handleExternalSave = () => {
      handleSave();
    };

    window.addEventListener("saveCurrentStage", handleExternalSave);
    return () => {
      window.removeEventListener("saveCurrentStage", handleExternalSave);
    };
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-2 stage1-responsive">
      {currentFields.map((field) => renderField(field))}
      {commonFields.map((field) => renderField(field))}

      <div className="flex mt-10 justify-between items-center gap-2">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
          onClick={() => changeStage(stageNumber - 1)}
          disabled={stageNumber === 1}
        />
        <div className="flex gap-2">
          {!isReadOnly && (
            <Button
              label={isSaving ? "Saving..." : "Save"}
              width="w-[70px] md:w-[100px]"
              bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
              onClick={handleSave}
              disabled={isSaving || !isChanged()}
            />
          )}
          <Button
            label="Next"
            width="w-[70px] md:w-[100px]"
            bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
            onClick={() => changeStage(stageNumber + 1)}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stage1-responsive { padding: 1rem 0.5rem; }
          .stage1-responsive label { font-size: 0.95rem !important; }
          .stage1-responsive input, .stage1-responsive textarea { font-size: 0.95rem !important; padding: 0.5rem !important; }
        }
        @media (max-width: 425px) {
          .stage1-responsive { padding: 0.5rem 0.25rem; }
          .stage1-responsive label { font-size: 0.9rem !important; }
          .stage1-responsive input, .stage1-responsive textarea { font-size: 0.9rem !important; padding: 0.4rem !important; }
        }
      `}</style>
    </div>
  );
}

Stage1.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool,
  setReloadTrigger: PropTypes.func.isRequired,
  setHasChanges: PropTypes.func.isRequired,
  stageNumber: PropTypes.number,
};
