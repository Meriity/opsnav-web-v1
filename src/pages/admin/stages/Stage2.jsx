import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

// --- Configuration Object for Stage 2 ---
const formConfig = {
  vkl: {
    fields: [
      { name: "signedContract", label: "Signed Contract", type: "radio" },
      { name: "sendKeyDates", label: "Send Key Dates", type: "radio" },
      { name: "voi", label: "VOI", type: "radio" },
      { name: "caf", label: "CAF", type: "radio" },
      {
        name: "depositReceipt",
        label: "Deposit Receipt",
        type: "radio",
        hasDate: true,
        dateFieldName: "depositReceiptDate",
      },
      {
        name: "buildingAndPest",
        label: "Building and Pest",
        type: "radio",
        hasDate: true,
        dateFieldName: "buildingAndPestDate",
      },
      {
        name: "financeApproval",
        label: "Finance Approval",
        type: "radio",
        hasDate: true,
        dateFieldName: "financeApprovalDate",
      },
      {
        name: "checkCtController",
        label: "Check CT Controller",
        type: "radio",
      },
      { name: "obtainDaSeller", label: "Obtain DA(Seller)", type: "radio" },
    ],
    noteGroups: [
      {
        id: "A",
        systemNoteLabel: "System Note (VOI / CAF / Deposit)",
        clientCommentLabel: "Client Comment (VOI / CAF / Deposit)",
        systemNoteKey: "systemNoteA",
        clientCommentKey: "clientCommentA",
        noteForClientKey: "noteForClientA",
        fieldsForNote: ["voi", "caf", "depositReceipt", "obtainDaSeller"],
      },
      {
        id: "B",
        systemNoteLabel: "System Note (B&P / Finance)",
        clientCommentLabel: "Client Comment (B&P / Finance)",
        systemNoteKey: "systemNoteB",
        clientCommentKey: "clientCommentB",
        noteForClientKey: "noteForClientB",
        fieldsForNote: ["buildingAndPest", "financeApproval"],
      },
    ],
  },
  idg: {
    fields: [
      {
        name: "agent",
        label: "Assign Agent / Team Member",
        type: "text",
      },
      {
        name: "materialsInStock",
        label: "Check if Materials Needed are in stock",
        type: "radio",
      },
      {
        name: "additionalMaterialsRequired",
        label: "Procure additional materials if required",
        type: "radio",
      },
      {
        name: "designArtwork",
        label: "Create / update Design Artwork",
        type: "text",
      },
      {
        name: "internalApproval",
        label: "Review and internally approve design",
        type: "radio",
      },
      {
        name: "proofSentToClient",
        label: "Send Proof to Client",
        type: "radio",
      },
      {
        name: "clientApprovalReceived",
        label: "Record Client Approval",
        type: "radio",
      },
      {
        name: "printReadyFiles",
        label: "Generate Print-Ready Files",
        type: "radio",
      },
      {
        name: "jobActivity",
        label: "Ensure Job Activity & Priority are correctly logged",
        type: "text",
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System note for client",
        clientCommentLabel: "Comment for client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "designArtwork",
          "jobActivity",
          "vehicleAllocated",
          "materialsInStock",
          "additionalMaterialsRequired",
          "internalApproval",
          "proofSentToClient",
          "clientApprovalReceived",
          "printReadyFiles",
        ],
      },
    ],
  },
  commercial: {
    fields: [
      {
        name: "voi",
        label: "VOI",
        type: "radio",
      },
      {
        name: "leaseTransfer",
        label: "Lease Transfer",
        type: "radio",
      },
      {
        name: "contractOfSale",
        label: "Contract of Sale",
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
        fieldsForNote: ["voi", "leaseTransfer", "contractOfSale"],
      },
    ],
  },
};

const normalizeValue = (v) => {
  if (v === undefined || v === null) return "";
  return String(v).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
};

export default function Stage2({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
  clientType,
  user,
}) {
  const stage = 2;
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const company = localStorage.getItem("company") || "vkl";
  const currentModule = localStorage.getItem("currentModule");
  const currentConfig =
    currentModule === "commercial"
      ? formConfig.commercial
      : formConfig[company] || formConfig.vkl;

  const getStatus = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not Completed";
    }
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
  };

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  }

  // Extracts notes based on system/client format in data
  const extractNotes = (noteForSystem = "", noteForClient = "") => {
    return {
      systemNote: noteForSystem || "",
      clientComment: noteForClient || "",
    };
  };

  // Returns the generated system note per note group
  const generateSystemNote = (noteGroupId) => {
    const noteGroup = currentConfig.noteGroups.find(
      (ng) => ng.id === noteGroupId
    );
    if (!noteGroup) return "";

    const greenValues = new Set([
      "yes", "nr", "na", "approved"
    ]);
    const fieldsToCheck = currentConfig.fields.filter((f) =>
      noteGroup.fieldsForNote.includes(f.name)
    );

    const notReceived = fieldsToCheck
      .filter((field) => {
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return false;
        }
        return !greenValues.has(normalizeValue(formData[field.name] || ""));
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not received`;
  };

  // Effect: Data Initialization
  useEffect(() => {
    if (!data) return;

    setIsLoading(true);

    const initializeData = async () => {
      try {
        const initialFormData = {};
        const initialStatuses = {};
        const formatDate = (dateString) => {
          if (!dateString) return "";
          return new Date(dateString).toISOString().split("T")[0];
        };

        let stageData = data;

        // For commercial stage 2: fetch stage data from API
        if (currentModule === "commercial") {
          try {
            const stageResponse = await commercialApi.getStageData(
              2,
              matterNumber
            );
            if (stageResponse && stageResponse.data) {
              stageData = { ...data, ...stageResponse.data };
            } else if (stageResponse) {
              stageData = { ...data, ...stageResponse };
            }
          } catch (error) {
            stageData = data;
          }
        } else if (data.stages && Array.isArray(data.stages)) {
          const stage2Data = data.stages.find(
            (stage) => stage.stageNumber === 2
          );
          if (stage2Data) {
            stageData = stage2Data;
          }
        }

        // Process fields
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
          } else {
            initialFormData[field.name] = stageData[field.name] || "";
          }

          if (field.hasDate) {
            initialFormData[field.dateFieldName] = formatDate(
              stageData[field.dateFieldName]
            );
          }

          initialStatuses[field.name] = getStatus(stageData[field.name]);
        });

        // Notes
        if (currentModule === "commercial") {
          const { systemNote, clientComment } = extractNotes(
            stageData.noteForSystem,
            stageData.noteForClient
          );
          initialFormData.noteForSystem = systemNote;
          initialFormData.noteForClient = clientComment;
        } else {
          currentConfig.noteGroups.forEach((group) => {
            const notes = extractNotes(stageData[group.noteForClientKey]);
            initialFormData[group.clientCommentKey] = notes.clientComment;
          });
        }

        setFormData(initialFormData);
        setStatuses(initialStatuses);
        originalData.current = JSON.parse(JSON.stringify(initialFormData));
      } catch (error) {
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
    clientType,
    currentConfig.fields,
    currentConfig.noteGroups,
    currentModule,
    matterNumber,
  ]);

  // Change handler for form fields
  const handleChange = (field, value) => {
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);
    let processedValue = value;

    if (
      fieldConfig &&
      fieldConfig.type === "radio" &&
      typeof processedValue === "string"
    ) {
      processedValue = normalizeValue(processedValue);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    if (fieldConfig) {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(value) }));
    }
  };

  // Whether the form has changed
  const isChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData.current);
  };

  // Handles saving stage 2
  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      const company = localStorage.getItem("company");
      const currentModule = localStorage.getItem("currentModule");
      let payload = { ...formData };

      // Notes
      if (currentModule === "commercial") {
        const commercialFields = [
          "voi",
          "leaseTransfer",
          "contractOfSale",
          "noteForSystem",
          "noteForClient",
        ];
        const filteredPayload = {};

        commercialFields.forEach((field) => {
          if (payload[field] !== undefined) {
            filteredPayload[field] = payload[field];
          }
        });

        payload = filteredPayload;

        // Generate system note (for commercial, uses "main")
        payload.noteForSystem = generateSystemNote("main");
        payload.noteForClient = formData.noteForClient || "";

        delete payload.systemNote;
        delete payload.clientComment;
      } else {
        currentConfig.noteGroups.forEach((group) => {
          const systemNote = generateSystemNote(group.id);
          const clientComment = formData[group.clientCommentKey] || "";
          payload[group.noteForClientKey] =
            `${systemNote} - ${clientComment}`.trim();

          delete payload[group.systemNoteKey];
          delete payload[group.clientCommentKey];
        });
      }

      // Evaluate color status
      const relevantFields = currentConfig.fields.filter((field) => {
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return false;
        }
        return true;
      });
      const allCompleted = relevantFields.every(
        (f) => getStatus(formData[f.name]) === "Completed"
      );
      const colorStatus = allCompleted ? "green" : "amber";

      // Remove obtainDaSeller if not seller
      if ((clientType || "").toLowerCase() !== "seller") {
        delete payload.obtainDaSeller;
        delete payload.obtainDaSellerDate;
      }

      // API call section
      let apiResponse;
      if (currentModule === "commercial") {
        payload.matterNumber = matterNumber;
        payload.colorStatus = colorStatus;
        apiResponse = await commercialApi.upsertStage(2, matterNumber, payload);
      } else if (company === "vkl") {
        payload.matterNumber = matterNumber;
        apiResponse = await api.upsertStageTwo(matterNumber, colorStatus, payload);
      } else if (company === "idg") {
        payload.orderId = matterNumber;
        apiResponse = await api.upsertIDGStages(payload.orderId, 2, {
          ...payload,
          colorStatus,
        });
      }

      // Update original
      originalData.current = { ...formData };
      setReloadTrigger((prev) => !prev);

      toast.success("Stage 2 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (error) {
      let errorMessage = "Failed to save Stage 2. Please try again.";
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

  // Renderers
  const renderField = (field) => (
    <div key={field.name} className="mt-5">
      <div className="flex gap-4 justify-between items-center mb-2">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {field.label}
        </label>

        {field.name !== "agent" && (
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses[field.name]
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[10px] md:text-[12px] whitespace-nowrap">
              {statuses[field.name]}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
        {field.name === "agent" ? (
          <select
            name={field.name}
            className={
              localStorage.getItem("role") !== "admin"
                ? "bg-gray-100 p-2 text-gray-500 rounded w-full"
                : "bg-white p-2 border rounded w-full"
            }
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={localStorage.getItem("role") !== "admin"}
          >
            <option value="">Select Agent</option>
            {user.map((agent) => (
              <option
                key={agent._id}
                value={agent._id + "-" + agent.displayName}
              >
                {agent.displayName}
              </option>
            ))}
          </select>
        ) : (
          ["Yes", "No", "Processing", "N/R"].map((val) => (
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
          ))
        )}

        {field.hasDate && (
          <input
            type="date"
            value={formData[field.dateFieldName] || ""}
            onChange={(e) => handleChange(field.dateFieldName, e.target.value)}
            className="ml-2 p-1 border rounded"
          />
        )}
      </div>
    </div>
  );

  const renderNoteGroup = (group) => (
    <div key={group.id}>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          {group.systemNoteLabel}
        </label>
        <input
          disabled
          className="w-full rounded p-2 bg-gray-100"
          value={generateSystemNote(group.id)}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          {group.clientCommentLabel}
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={formData[group.clientCommentKey] || ""}
          onChange={(e) => handleChange(group.clientCommentKey, e.target.value)}
        />
      </div>
    </div>
  );

  const renderCommercialNotes = () => (
    <div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          System Note for Client
        </label>
        <input
          disabled
          className="w-full rounded p-2 bg-gray-100"
          value={generateSystemNote("main")}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          Comment for Client
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={formData.noteForClient || ""}
          onChange={(e) => handleChange("noteForClient", e.target.value)}
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
      {currentConfig.fields.map((field) => {
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return null;
        }
        return renderField(field);
      })}

      {/* Render notes based on module */}
      {currentModule === "commercial"
        ? renderCommercialNotes()
        : currentConfig.noteGroups.map(renderNoteGroup)}

      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
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

Stage2.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  clientType: PropTypes.string,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
  user: PropTypes.array,
};