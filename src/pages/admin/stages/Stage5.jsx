import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button"; // Corrected path
import ClientAPI from "@/api/clientAPI"; // Corrected path
import CommercialAPI from "@/api/commercialAPI"; // Corrected path
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const formConfig = {
  vkl: {
    fields: [
      {
        name: "notifySoaToClient",
        label: "Notify SOA to Client",
        type: "radio",
      },
      {
        name: "transferDocsOnPexa",
        label: "Transfer Docs on PEXA",
        type: "radio",
      },
      { name: "gstWithholding", label: "GST Withholding", type: "radio" },
      {
        name: "disbursementsInPexa",
        label: "Disbursements in PEXA",
        type: "radio",
      },
      { name: "addAgentFee", label: "Add Agent Fee", type: "radio" },
      {
        name: "settlementNotification",
        label: "Settlement Notification",
        type: "radio",
      },
      { name: "council", label: "Council", type: "text" },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "notifySoaToClient",
          "transferDocsOnPexa",
          "gstWithholding",
          "disbursementsInPexa",
          "addAgentFee",
          "settlementNotification",
        ],
      },
    ],
  },
  idg: {
    fields: [
      { name: "boardsPrinted", label: "Boards Printed", type: "radio" },
      {
        name: "packaged",
        label: "Packaged",
        type: "radio",
      },
      {
        name: "qualityCheckPassed",
        label: "Quality Check Passed",
        type: "radio",
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "boardsPrinted",
          "laminationApplied",
          "cuttingDone",
          "mountingDone",
          "auctionStickersPreapplied",
          "packaged",
          "qualityCheckPassed",
          "labeled",
        ],
      },
    ],
  },
  commercial: {
    fields: [
      {
        name: "statementOfAdjustment",
        label: "Statement of Adjustment",
        type: "radio",
      },
      {
        name: "contractPrice",
        label: "Contract Price",
        type: "number",
      },
      {
        name: "liquorLicence",
        label: "Liquor Licence",
        type: "radio",
      },
      {
        name: "transferBusinessName",
        label: "Transfer Business Name",
        type: "radio",
      },
      {
        name: "leaseTransfer",
        label: "Lease Transfer",
        type: "radio",
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "statementOfAdjustment",
          "liquorLicence",
          "transferBusinessName",
          "leaseTransfer",
        ],
      },
    ],
  },
};

// --- Helper Functions (Memoized) ---

const normalizeValue = (v) => {
  if (v === undefined || v === null) return "";
  return String(v)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
};

const getStatus = (value) => {
  const val = normalizeValue(value);
  if (val === "") return "Not Completed";
  if (!val) return "Not Completed";
  if (["yes", "na", "n/a", "nr"].includes(val)) return "Completed";
  if (val === "no") return "Not Completed";
  if (["processing", "inprogress", "inprogress"].includes(val))
    return "In Progress";
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

// For Commercial module
const extractNotes = (noteForSystem = "", noteForClient = "") => {
  return {
    systemNote: noteForSystem || "",
    clientComment: noteForClient || "",
  };
};

export default function Stage5({
  changeStage,
  data,
  // reloadTrigger, (Removed)
  // setReloadTrigger, (Removed)
}) {
  const stage = 5;
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();
  const originalData = useRef({});

  // --- State ---
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  // isLoading and isSaving are now handled by React Query
  // Only Commercial module uses a separate client note state
  const [noteForClient, setNoteForClient] = useState("");

  useEffect(() => {
    // Check if we have a success message stored from before refresh
    const wasSuccess = localStorage.getItem("stage5_save_success");
    if (wasSuccess === "true") {
      // Show success toast with longer autoClose
      toast.success("Stage 5 Saved Successfully!", {
        autoClose: 3000, // Show for 3 seconds
        hideProgressBar: false,
      });
      // Clear the stored message
      localStorage.removeItem("stage5_save_success");
    }
  }, []);

  // --- Memoized Values ---
  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  const currentConfig = useMemo(() => {
    if (currentModule === "commercial") {
      return formConfig.commercial;
    } else if (company === "vkl") {
      return formConfig.vkl;
    } else if (company === "idg") {
      return formConfig.idg;
    }
    return formConfig.vkl; // default fallback
  }, [currentModule, company]);

  // --- Callback Helpers ---
  const generateSystemNote = useCallback(
    (noteGroupId) => {
      const noteGroup = currentConfig.noteGroups.find(
        (ng) => ng.id === noteGroupId
      );
      if (!noteGroup) return "";

      const greenValues = new Set(["yes", "na", "n/a", "nr"]);

      const fieldsToCheck = currentConfig.fields.filter((f) =>
        noteGroup.fieldsForNote.includes(f.name)
      );

      const incomplete = fieldsToCheck
        .filter((field) => {
          const value = normalizeValue(formData[field.name] || "");
          return !greenValues.has(value);
        })
        .map((field) => field.label);

      if (incomplete.length === 0) return "All tasks completed";
      return `Pending: ${incomplete.join(", ")}`;
    },
    [currentConfig, formData]
  );

  // --- Data Fetching with useQuery ---
  const fetchStageData = useCallback(async () => {
    if (!data) return null;
    let stageData = data;

    if (currentModule === "commercial") {
      try {
        const stageResponse = await commercialApi.getStageData(5, matterNumber);
        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log(
          "No existing stage 5 data found for commercial, using base"
        );
      }
    } else if (data.stages && Array.isArray(data.stages)) {
      // For VKL/IDG, find the stage 5 data
      const stage5Data = data.stages.find((stage) => stage.stageNumber === 5);
      if (stage5Data) {
        stageData = { ...data, ...stage5Data }; // Merge with base
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 5, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
  });

  // --- Effect to Populate Form from Query Data ---
  useEffect(() => {
    if (!stageData) return;

    try {
      const initialFormData = {};
      const initialStatuses = {};
      let loadedSystemNote = "";
      let loadedClientComment = "";

      currentConfig.fields.forEach((field) => {
        if (field.type === "number") {
          const rawPrice = stageData[field.name];
          initialFormData[field.name] =
            typeof rawPrice === "object" && rawPrice?.$numberDecimal
              ? rawPrice.$numberDecimal
              : rawPrice?.toString() || "";
        } else if (field.type === "radio") {
          initialFormData[field.name] = normalizeValue(
            stageData[field.name] || ""
          );
          initialStatuses[field.name] = getStatus(initialFormData[field.name]);
        } else if (field.type === "text") {
          initialFormData[field.name] = stageData[field.name] || "";
        } else {
          initialFormData[field.name] = stageData[field.name] || "";
        }
      });

      // Handle notes
      if (currentModule === "commercial") {
        const { systemNote, clientComment } = extractNotes(
          stageData.noteForSystem,
          stageData.noteForClient
        );
        loadedSystemNote = systemNote;
        loadedClientComment = clientComment;
        setNoteForClient(clientComment);
      } else {
        // VKL/IDG
        currentConfig.noteGroups.forEach((group) => {
          const noteString = stageData[group.noteForClientKey] || "";
          const noteParts = noteString.split(" - ");
          loadedSystemNote = noteParts[0]?.trim() || "";
          loadedClientComment = noteParts.length > 1 ? noteParts[1].trim() : "";
          initialFormData[group.clientCommentKey] = loadedClientComment;
        });
      }

      setFormData(initialFormData);
      setStatuses(initialStatuses);

      // Set originalData for change tracking
      originalData.current = {
        formData: { ...initialFormData },
        noteForClient: loadedClientComment,
        noteForSystem: loadedSystemNote,
      };
    } catch (error) {
      console.error("Error initializing form data:", error);
      toast.error("Failed to load stage data");
    }
  }, [stageData, currentConfig, currentModule]);

  // --- Form Change Handlers ---
  const handleChange = (field, value) => {
    let processedValue = value;
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);

    // Only normalize radio buttons, keep text/number as-is
    if (fieldConfig && fieldConfig.type === "radio") {
      if (typeof processedValue === "string") {
        processedValue = normalizeValue(processedValue);
      }
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
  };

  const isChanged = () => {
    const original = originalData.current;
    if (!original.formData) return false; // Not yet initialized

    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(original.formData);

    const currentClientNote =
      currentModule === "commercial"
        ? noteForClient
        : formData.clientComment || "";
    const clientNoteChanged = currentClientNote !== original.noteForClient;

    // Compare currently generated note with the note loaded from server
    const systemNoteChanged =
      generateSystemNote("main") !== original.noteForSystem;

    return formChanged || clientNoteChanged || systemNoteChanged;
  };

  // --- Data Saving with useMutation ---
  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      let apiResponse;
      if (currentModule === "commercial") {
        apiResponse = await commercialApi.upsertStage(5, matterNumber, payload);
      } else if (company === "vkl") {
        apiResponse = await api.upsertStageFive(payload);
      } else if (company === "idg") {
        apiResponse = await api.upsertIDGStages(matterNumber, 5, payload);
      }
      return apiResponse;
    },
    onSuccess: () => {
      localStorage.setItem("stage5_save_success", "true");
      localStorage.setItem("current_stage", "5");

      queryClient.invalidateQueries({
        queryKey: ["stageData", 5, matterNumber, currentModule],
      });

      // Update original data to reflect new saved state
      const currentClientNote =
        currentModule === "commercial"
          ? noteForClient
          : formData.clientComment || "";
      originalData.current = {
        formData: { ...formData },
        noteForClient: currentClientNote,
        noteForSystem: generateSystemNote("main"),
      };

      // FORCE PAGE REFRESH after a short delay to ensure progress updates
      setTimeout(() => {
        console.log("Refreshing page to update progress status...");
        window.location.reload();
      }, 1000);
    },
    onError: (err) => {
      console.error("=== SAVE ERROR ===", err);
      let errorMessage = "Failed to save Stage 5. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    },
  });

  async function handleSave() {
    if (!isChanged() || isSaving) return;

    let payload = { ...formData };
    const systemNote = generateSystemNote("main");

    // Calculate color status
    const allCompleted = currentConfig.fields.every(
      (field) => getStatus(formData[field.name]) === "Completed"
    );
    const colorStatus = allCompleted ? "green" : "amber";

    if (currentModule === "commercial") {
      const commercialFields = currentConfig.fields.map((f) => f.name);
      const filteredPayload = {};
      commercialFields.forEach((field) => {
        if (payload[field] !== undefined) {
          filteredPayload[field] = payload[field];
        }
      });
      payload = filteredPayload;

      payload.noteForSystem = systemNote;
      payload.noteForClient = noteForClient || "";
      payload.colorStatus = colorStatus;
      payload.matterNumber = matterNumber;
    } else {
      // For VKL/IDG
      currentConfig.noteGroups.forEach((group) => {
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] =
          `${systemNote} - ${clientComment}`.trim();
        delete payload[group.clientCommentKey];
      });

      // handle number fields
      currentConfig.fields.forEach((field) => {
        if (field.type === "number") {
          payload[field.name] =
            payload[field.name] === "" ? null : Number(payload[field.name]);
        }
      });

      if (company === "vkl") {
        payload.matterNumber = matterNumber;
      } else if (company === "idg") {
        payload.orderId = matterNumber;
      }
    }

    console.log("=== SAVE PAYLOAD ===", payload);
    saveStage(payload);
  }

  // --- Render Functions ---
  const renderField = (field) => {
    switch (field.type) {
      case "radio":
        return (
          <div key={field.name} className="mt-5">
            <div className="flex gap-4 items-center justify-between mb-2">
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

            <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
              {["Yes", "No", "Processing", "N/R"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm md:text-base"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={val}
                    checked={
                      normalizeValue(formData[field.name] || "") ===
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
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
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
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderNoteGroup = (group) => (
    <div key={group.id}>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {group.systemNoteLabel}
        </label>
        <input
          type="text"
          value={generateSystemNote(group.id)}
          disabled
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {group.clientCommentLabel}
        </label>
        <textarea
          value={formData[group.clientCommentKey] || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              [group.clientCommentKey]: e.target.value,
            }))
          }
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
    </div>
  );

  const renderCommercialNotes = () => (
    <div>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          System Note for Client
        </label>
        <input
          type="text"
          value={generateSystemNote("main")}
          disabled
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          Comment for Client
        </label>
        <textarea
          value={noteForClient}
          onChange={(e) => setNoteForClient(e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {currentConfig.fields.map(renderField)}

      {/* Render notes based on module */}
      {currentModule === "commercial"
        ? renderCommercialNotes()
        : currentConfig.noteGroups.map(renderNoteGroup)}

      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
        />
        <div className="flex gap-2">
          <Button
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
    </div>
  );
}

Stage5.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  // reloadTrigger: PropTypes.bool, // Removed
  // setReloadTrigger: PropTypes.func, // Removed
};
