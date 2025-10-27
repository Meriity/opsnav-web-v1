import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Configuration object for different clients
const formConfig = {
  vkl: [
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
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "text" },
    {
      name: "tenants",
      label: "Tenants",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
  ],
  idg: [
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
    {
      name: "clientEngagement",
      label: "Client Engagement",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "scopeReview",
      label: "Scope Review",
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
      name: "feeProposal",
      label: "Fee Proposal",
      type: "radio",
      options: ["Variable", "Fixed"],
    },
    {
      name: "proposalAmount",
      label: "Proposal Amount (incl GST)",
      type: "text",
    },
    {
      name: "conflictCheck",
      label: "Conflict Check",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
  ],
};

// Common fields for all clients
const commonFields = [
  { name: "systemNote", label: "System note for client", type: "system-note" },
  { name: "clientComment", label: "Comment for client", type: "textarea" },
];

// Admin-only fields for different modules
const adminFields = {
  idg: [
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
    },
  ],
  commercial: [
    {
      name: "budgetApproval",
      label: "Budget Approval",
      type: "radio",
      options: ["Approved", "Pending", "Rejected"],
    },
    {
      name: "budgetAmount",
      label: "Budget Amount",
      type: "text",
    },
  ],
  vkl: [], // No additional admin fields for VKL
};

export default function Stage1({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const originalData = useRef({});
  console.log(data);
  const stage = 1;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  // Stabilize company + fields so they can be safely used in hooks' deps
  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule") || "default",
    []
  );
  const userRole = useMemo(() => localStorage.getItem("role") || "user", []);

  // Get base fields based on company and module
  const baseFields = useMemo(() => {
    if (currentModule === "commercial") {
      return formConfig.commercial || formConfig.vkl;
    }
    return formConfig[company] || formConfig.vkl;
  }, [company, currentModule]);

  // Get admin fields if user is admin/superadmin
  const additionalAdminFields = useMemo(() => {
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    if (!isAdmin) return [];

    if (currentModule === "commercial") {
      return adminFields.commercial || [];
    }
    return adminFields[company] || [];
  }, [company, currentModule, userRole]);

  // Combine base fields with admin fields
  const currentFields = useMemo(() => {
    return [...baseFields, ...additionalAdminFields];
  }, [baseFields, additionalAdminFields]);

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
      if (["processing", "inprogress", "pending"].includes(val))
        return "In Progress";
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

  function extractNotes(note = "") {
    const [systemNote = "", clientComment = ""] = note
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

  useEffect(() => {
    if (!data) return;

    const { systemNote, clientComment } = extractNotes(data.noteForClient);
    const initialFormData = {};
    const initialStatuses = {};

    currentFields.forEach((field) => {
      if (
        field.name === "quoteAmount" ||
        field.name === "proposalAmount" ||
        field.name === "costing_amount" ||
        field.name === "budgetAmount"
      ) {
        initialFormData[field.name] =
          data[field.name]?.$numberDecimal || data[field.name] || "";
      } else {
        if (field.type === "radio") {
          initialFormData[field.name] = normalizeValue(data[field.name] || "");
        } else {
          initialFormData[field.name] = data[field.name] || "";
        }
      }

      if (field.type === "radio") {
        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
      }
    });

    initialFormData.systemNote = systemNote;
    initialFormData.clientComment = clientComment;

    setFormData(initialFormData);
    setStatuses(initialStatuses);
    originalData.current = initialFormData;
  }, [data, reloadTrigger, currentFields, getStatus, normalizeValue]);

  const handleChange = (field, value) => {
    const fieldConfig = currentFields.find((f) => f.name === field);
    let processedValue = value;

    if (fieldConfig && fieldConfig.type === "radio") {
      processedValue = normalizeValue(value);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    if (fieldConfig && fieldConfig.type === "radio") {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
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

      const company = localStorage.getItem("company");
      const currentModule = localStorage.getItem("currentModule");
      let payload = {
        ...formData,
      };

      // Set the appropriate identifier based on module
      if (currentModule === "commercial") {
        payload.matterNumber = matterNumber; // Commercial uses matterNumber
        payload.noteForClient = noteForClient;
      } else if (company === "vkl") {
        payload.matterNumber = matterNumber;
        payload.noteForClient = noteForClient;
      } else if (company === "idg") {
        payload.orderId = matterNumber; // IDG uses orderId
        payload.noteForClient = noteForClient;
      }

      console.log(`${currentModule || company} payload:`, payload);

      // remove temporary fields
      delete payload.systemNote;
      delete payload.clientComment;

      // Use appropriate API method based on module
      if (currentModule === "commercial") {
        await api.upsertStageOne(payload); // Commercial uses same as VKL
      } else if (company === "vkl") {
        await api.upsertStageOne(payload);
      } else if (company === "idg") {
        await api.upsertIDGStages(payload.orderId, 1, payload);
      }

      originalData.current = { ...formData, systemNote };
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
      console.error("Failed to update stage 1:", error);
      toast.error("Failed to save stage 1");
    } finally {
      setIsSaving(false);
    }
  }

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="text"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base"
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
                  {statuses[field.name]}
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
                    onChange={() => handleChange(field.name, val)}
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
              className="w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base resize-none"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="overflow-y-auto p-2 stage1-responsive">
      {currentFields.map((field) => renderField(field))}
      {commonFields.map((field) => renderField(field))}

      <div className="flex mt-10 justify-between items-center gap-2">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
        />
        <div className="flex gap-2">
          <Button
            label={isSaving ? "Saving" : "Save"}
            width="w-[70px] md:w-[100px]"
            bg="bg-blue-500"
            onClick={handleSave}
            disabled={isSaving || !isChanged()}
          />
          <Button
            label="Next"
            width="w-[70px] md:w-[100px]"
            onClick={() => changeStage(stage + 1)}
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
