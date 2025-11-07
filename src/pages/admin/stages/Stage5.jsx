import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

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

const extractNotes = (noteForSystem = "", noteForClient = "") => {
  return {
    systemNote: noteForSystem || "",
    clientComment: noteForClient || "",
  };
};

export default function Stage5({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 5;
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noteForSystem, setNoteForSystem] = useState("");
  const [noteForClient, setNoteForClient] = useState("");

  // Get company and module
  const company = localStorage.getItem("company") || "vkl";
  const currentModule = localStorage.getItem("currentModule");

  // FIXED: Proper field configuration logic - check module first
  let currentConfig;
  if (currentModule === "commercial") {
    currentConfig = formConfig.commercial;
  } else if (company === "vkl") {
    currentConfig = formConfig.vkl;
  } else if (company === "idg") {
    currentConfig = formConfig.idg;
  } else {
    currentConfig = formConfig.vkl; // default fallback
  }

  console.log("=== STAGE 5 CONFIG ===");
  console.log("Company:", company);
  console.log("Current Module:", currentModule);
  console.log("Selected Config:", currentConfig);

  const generateSystemNote = (noteGroupId) => {
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
  };

  // UPDATED: Data initialization effect
  useEffect(() => {
    if (!data) return;

    console.log("=== STAGE 5 INITIALIZATION ===");
    console.log("Using config:", currentConfig);

    setIsLoading(true);

    const initializeData = async () => {
      try {
        let stageData = data;

        // For commercial stage 5, fetch the actual stage data from API
        if (currentModule === "commercial") {
          console.log("Commercial stage 5 - fetching actual stage data");
          try {
            const stageResponse = await commercialApi.getStageData(
              5,
              matterNumber
            );
            console.log("Commercial stage 5 API response:", stageResponse);

            if (stageResponse && stageResponse.data) {
              stageData = { ...data, ...stageResponse.data };
            } else if (stageResponse) {
              stageData = { ...data, ...stageResponse };
            }
            console.log("Combined stage data for commercial:", stageData);
          } catch (error) {
            console.log("No existing stage 5 data found, using default data");
            stageData = data;
          }
        }

        const initialFormData = {};
        const initialStatuses = {};

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
            initialStatuses[field.name] = getStatus(
              initialFormData[field.name]
            );
          } else if (field.type === "text") {
            initialFormData[field.name] = stageData[field.name] || "";
          } else {
            initialFormData[field.name] = stageData[field.name] || "";
          }

          if (field.hasDate) {
            initialFormData[field.dateFieldName] = stageData[
              field.dateFieldName
            ]
              ? new Date(stageData[field.dateFieldName])
                  .toISOString()
                  .split("T")[0]
              : "";
          }
        });

        // Handle notes differently for commercial vs other modules
        if (currentModule === "commercial") {
          const { systemNote, clientComment } = extractNotes(
            stageData.noteForSystem,
            stageData.noteForClient
          );
          setNoteForSystem(systemNote);
          setNoteForClient(clientComment);
        } else {
          currentConfig.noteGroups.forEach((group) => {
            const notes = extractNotes(stageData[group.noteForClientKey]);
            initialFormData[group.clientCommentKey] = notes.clientComment;
          });
        }

        setFormData(initialFormData);
        setStatuses(initialStatuses);
        originalData.current = initialFormData;

        console.log("Initialized form data:", initialFormData);
      } catch (error) {
        console.error("Error initializing form data:", error);
        toast.error("Failed to load stage data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [
    data,
    reloadTrigger,
    company,
    currentModule,
    currentConfig,
    matterNumber,
  ]);

  const handleChange = (field, value) => {
    let processedValue = value;
    if (typeof processedValue === "string") {
      processedValue = normalizeValue(processedValue);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    const fieldConfig = currentConfig.fields.find((f) => f.name === field);
    if (fieldConfig && fieldConfig.type === "radio") {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
    }
  };

  const handleDateChange = (dateField, value) => {
    setFormData((prev) => ({ ...prev, [dateField]: value }));
  };

  const isChanged = () => {
    const currentSystemNote = generateSystemNote("main");

    if (currentModule === "commercial") {
      return (
        JSON.stringify(formData) !== JSON.stringify(originalData.current) ||
        noteForSystem !== (data?.noteForSystem || "") ||
        noteForClient !== (data?.noteForClient || "")
      );
    } else {
      return JSON.stringify(formData) !== JSON.stringify(originalData.current);
    }
  };

  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      let payload = { ...formData };

      // FIXED: Filter commercial fields and ensure correct payload structure
      if (currentModule === "commercial") {
        // Only include fields that exist in the commercial schema
        const commercialFields = [
          "statementOfAdjustment",
          "contractPrice",
          "liquorLicence",
          "transferBusinessName",
          "leaseTransfer",
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
        const systemNote = generateSystemNote("main");
        payload.noteForSystem = systemNote;
        payload.noteForClient = noteForClient || "";

        // Calculate and add color status
        const allCompleted = currentConfig.fields.every(
          (field) => getStatus(formData[field.name]) === "Completed"
        );
        payload.colorStatus = allCompleted ? "green" : "amber";
      } else {
        // For other modules, use combined note structure
        currentConfig.noteGroups.forEach((group) => {
          const systemNote = generateSystemNote(group.id);
          const clientComment = formData[group.clientCommentKey] || "";
          payload[group.noteForClientKey] =
            `${systemNote} - ${clientComment}`.trim();
          delete payload[group.clientCommentKey];
        });
      }

      // handle number fields
      currentConfig.fields.forEach((field) => {
        if (field.type === "number") {
          payload[field.name] =
            payload[field.name] === "" ? null : Number(payload[field.name]);
        }
      });

      console.log("=== SAVE DEBUG ===");
      console.log("Current module:", currentModule);
      console.log("Company:", company);
      console.log("Matter number:", matterNumber);
      console.log("Payload:", payload);

      // API CALL SECTION
      if (currentModule === "commercial") {
        console.log("Using Commercial API for stage 5");
        payload.matterNumber = matterNumber;
        await commercialApi.upsertStage(5, matterNumber, payload);
      } else if (company === "vkl") {
        console.log("Using VKL API for stage 5");
        payload.matterNumber = matterNumber;
        await api.upsertStageFive(payload);
      } else if (company === "idg") {
        console.log("Using IDG API for stage 5");
        payload.orderId = matterNumber;
        await api.upsertIDGStages(payload.orderId, 5, payload);
      }

      console.log("API call successful");

      // update original data
      originalData.current = { ...formData };
      setReloadTrigger((prev) => !prev);

      toast.success("Stage 5 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (err) {
      console.error("=== SAVE ERROR ===");
      console.error("Failed to save Stage 5:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      let errorMessage = "Failed to save Stage 5. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

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

              {field.hasDate && (
                <input
                  type="date"
                  value={formData[field.dateFieldName] || ""}
                  onChange={(e) =>
                    handleDateChange(field.dateFieldName, e.target.value)
                  }
                  className="ml-2 p-1 border rounded"
                />
              )}
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
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
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};
