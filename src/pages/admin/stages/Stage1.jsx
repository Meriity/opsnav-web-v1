import { useState, useEffect, useRef } from "react";
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
      name: "jobAddress",
      label: "Job Address",
      type: "text",
    },
    {
      name: "distanceFeasibility",
      label: "Check Distance / Feasibility",
      type: "text",
    },
    {
      name: "orderType",
      label: "Order Type",
      type: "text",
    },
    {
      name: "costingType",
      label: "Confirm Costing Type",
      type: "radio",
      options: ["Fixed", "Variable"],
    },
    {
      name: "timeline",
      label: "Timeline / Deadline",
      type: "text",
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
}) {
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const originalData = useRef({});
  console.log(data);
  const stage = 1;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  // Determine the company and get its specific configuration
  const company = localStorage.getItem("company") || "vkl"; // Default to 'vkl'
  const currentFields = formConfig[company] || formConfig.vkl; // Fallback to 'vkl' config

  // Helper to normalize/standardize values for comparison and storage
  const normalizeValue = (v) => {
    if (v === undefined || v === null) return "";
    return String(v)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  };

  const getStatus = (value) => {
    const val = normalizeValue(value);
    const completed = new Set(["yes", "nr", "na", "variable", "fixed"]);
    if (completed.has(val)) return "Completed";
    if (val === "no") return "Not Completed";
    if (["processing", "inprogress"].includes(val)) return "In Progress";
    return "Not Completed";
  };

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
    const greenValues = new Set(["yes", "nr", "na", "variable", "fixed"]);

    const notReceived = radioFields
      .filter(
        (field) => !greenValues.has(normalizeValue(formData[field.name] || ""))
      )
      .map((field) => field.label);

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
      if (field.name === "quoteAmount") {
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
  }, [data, reloadTrigger, company]);

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
      let payload = {
        ...formData,
      };

      // dynamically set the key
      if (company === "vkl") {
        payload.matterNumber = matterNumber; // keep matterNumber
        payload.noteForClient = noteForClient;
      } else if (company === "idg") {
        payload.orderId = matterNumber; // use orderId instead
        payload.noteForClient = noteForClient;
      }

      console.log(`${company} payload:`, payload);

      // remove temporary fields
      delete payload.systemNote;
      delete payload.clientComment;

      if (company === "vkl") {
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
              className="w-full rounded p-2 bg-gray-100"
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
                className={`w-[90px] h-[18px] ${bgcolor(
                  statuses[field.name]
                )} flex items-center justify-center rounded-4xl`}
              >
                <p className="text-[10px] md:text-[12px] whitespace-nowrap">
                  {statuses[field.name]}
                </p>
              </div>
            </div>
            {/* <div
              className={`flex gap-4 ${
                field.options.length > 2 ? "justify-between" : ""
              } flex-wrap`}
            > */}
            {/* tight spacing of every fields*/}
            <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
              {field.options.map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm md:text-base"
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
                  {val}
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
              className="w-full rounded p-2 bg-gray-100"
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
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="overflow-y-auto">
      {currentFields.map((field) => renderField(field))}
      {commonFields.map((field) => renderField(field))}

      <div className="flex mt-10 justify-between">
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
    </div>
  );
}
