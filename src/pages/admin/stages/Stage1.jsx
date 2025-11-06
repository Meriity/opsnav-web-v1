import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
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
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "text" },
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
  stageNumber = 1,
  onStageUpdate, // Add this new prop
}) {
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    // Check if we have a success message stored from before refresh
    const wasSuccess = localStorage.getItem("stage1_save_success");
    if (wasSuccess === "true") {
      // Show success toast with longer autoClose
      toast.success("Stage 1 Saved Successfully!", {
        autoClose: 3000, // Show for 3 seconds
        hideProgressBar: false,
      });
      // Clear the stored message
      localStorage.removeItem("stage1_save_success");
    }
  }, []);
  // isSaving and isLoading are now handled by React Query
  const originalData = useRef({});

  console.log("Initial data prop:", data);
  const stage = 1;
  const { matterNumber } = useParams();

  // Memoize API instances so they are stable
  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  // Stabilize company + fields so they can be safely used in hooks' deps
  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  // Safely get current fields, including IDG admin logic
  const currentFields = useMemo(() => {
    let baseFields;

    if (currentModule === "commercial") {
      baseFields = formConfig.commercial || formConfig.vkl;
    } else {
      baseFields = formConfig[company] || formConfig.vkl;
    }

    // Safely add IDG admin fields without mutating the original config
    if (
      company === "idg" &&
      (localStorage.getItem("role") === "admin" ||
        localStorage.getItem("role") === "superadmin")
    ) {
      const hasCostingFields = baseFields.some(
        (field) => field.name === "costing_amount"
      );

      if (!hasCostingFields) {
        // Return a *new* array
        return [
          ...baseFields,
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
        ];
      }
    }
    return baseFields;
  }, [company, currentModule]);

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

  // Get the query client instance
  const queryClient = useQueryClient();

  // 1. DEFINE THE FETCHER FUNCTION
  const fetchStageData = useCallback(async () => {
    if (!matterNumber) return null;

    let stageData = data; // Start with the base prop data

    if (currentModule === "commercial") {
      try {
        console.log("Commercial stage 1 - fetching actual stage data");
        const stageResponse = await commercialApi.getStageData(1, matterNumber);

        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log("No existing stage 1 data found, using default data");
        // We still return the base `data` prop even if the fetch fails
      }
    }

    // For VKL/IDG, we just use the 'data' prop directly
    console.log("Processing stage data:", stageData);
    return stageData;
  }, [matterNumber, currentModule, data, commercialApi]);

  // 2. USE THE useQuery HOOK
  // This replaces your big useEffect and isLoading state
  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 1, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!matterNumber,
  });

  // 3. NEW useEffect to populate form from query data
  // This runs ONLY when the query data (stageData) changes
  useEffect(() => {
    if (stageData) {
      console.log("Query data received, setting form state:", stageData);

      const { systemNote, clientComment } = extractNotes(
        stageData.noteForClient
      );
      const initialFormData = {};
      const initialStatuses = {};

      currentFields.forEach((field) => {
        if (field.name === "quoteAmount") {
          initialFormData[field.name] =
            stageData[field.name]?.$numberDecimal ||
            stageData[field.name] ||
            "";
        } else {
          if (field.type === "radio") {
            initialFormData[field.name] = normalizeValue(
              stageData[field.name] || ""
            );
          } else {
            initialFormData[field.name] = stageData[field.name] || "";
          }
        }

        if (field.type === "radio") {
          initialStatuses[field.name] = getStatus(initialFormData[field.name]);
        }
      });

      initialFormData.systemNote = systemNote;
      initialFormData.clientComment = clientComment || "";

      setFormData(initialFormData);
      setStatuses(initialStatuses);
      originalData.current = initialFormData; // Set original data for comparison
    }
  }, [stageData, currentFields, getStatus, normalizeValue]); // Dependencies

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

  // 4. USE THE useMutation HOOK
  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      // This is the logic from your old handleSave
      if (currentModule === "commercial") {
        console.log("Using Commercial API for stage 1");
        return commercialApi.upsertStage(1, matterNumber, payload);
      } else if (company === "vkl") {
        console.log("Using VKL API for stage 1");
        payload.matterNumber = matterNumber;
        return api.upsertStageOne(payload);
      } else if (company === "idg") {
        console.log("Using IDG API for stage 1");
        payload.orderId = matterNumber;
        return api.upsertIDGStages(payload.orderId, 1, payload);
      }
    },
    onSuccess: (responseData, payload) => {
      // Store success message in localStorage before refresh
      localStorage.setItem("stage1_save_success", "true");
      localStorage.setItem("current_stage", "1");

      // Invalidate ALL related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["stageData", 1, matterNumber, currentModule],
      });
      queryClient.invalidateQueries({
        queryKey: ["clientData", matterNumber, company, currentModule],
      });

      // Update originalData to match the saved state
      originalData.current = { ...formData };

      // NEW: Notify parent component about the stage update for real-time status changes
      if (onStageUpdate) {
        console.log("Notifying parent about stage update:", payload);

        // Calculate the updated stage data to send to parent
        const updatedStageData = {
          ...payload,
          // Ensure colorStatus is included for commercial projects
          colorStatus:
            currentModule === "commercial" ? payload.colorStatus : undefined,
        };

        onStageUpdate(updatedStageData, stageNumber);
      }

      // FORCE PAGE REFRESH after a short delay to ensure progress updates
      setTimeout(() => {
        console.log("Refreshing page to update progress status...");
        window.location.reload();
      }, 1000); // Increased to 1000ms to ensure localStorage is set
    },
    onError: (error) => {
      console.error("=== SAVE ERROR ===", error);
      let errorMessage = "Failed to save Stage 1. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  // 5. SIMPLIFIED handleSave function
  async function handleSave() {
    if (!isChanged() || isSaving) return;

    const systemNote = generateSystemNote();
    let noteForClient = `${systemNote} - ${
      formData.clientComment || ""
    }`.trim();

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
    } else {
      // For other modules, use combined note structure
      payload.noteForClient = noteForClient;
    }

    // remove temporary fields
    delete payload.systemNote;
    delete payload.clientComment;

    console.log("=== SAVE DEBUG ===");
    console.log("Current module:", currentModule);
    console.log("Company:", company);
    console.log("Matter number:", matterNumber);
    console.log("Payload:", payload);

    // Now, just call the mutation!
    saveStage(payload);
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

  // This isLoading now comes from useQuery
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
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
        />
        <div className="flex gap-2">
          <Button
            // isSaving now comes from useMutation
            label={isSaving ? "Saving..." : "Save"}
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
