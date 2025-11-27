import { useEffect, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import PropTypes from "prop-types";

const normalizeValue = (v) => {
  if (v === undefined || v === null) return "";
  return String(v).toLowerCase().trim();
};

const formConfig = {
  vkl: {
    fields: [
      { name: "noaToCouncilWater", label: "NOA to Council/Water", type: "radio" },
      { name: "dutyPaid", label: "Duty Paid", type: "radio" },
      { name: "finalLetterToClient", label: "Final Letter to Client", type: "radio" },
      { name: "finalLetterToAgent", label: "Final Letter to Agent", type: "radio" },
      { name: "invoiced", label: "Invoiced", type: "radio" },
      {
        name: "closeMatter",
        label: "Close Matter",
        type: "radio",
        options: ["Completed", "Cancelled"],
        triggersModal: true,
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "noaToCouncilWater",
          "dutyPaid",
          "finalLetterToClient",
          "finalLetterToAgent",
          "invoiced",
          "closeMatter",
        ],
      },
    ],
  },
  idg: {
    fields: [
      { name: "installerAssigned", label: "Assign Installer / Field Staff", type: "text" },
      { name: "onsiteStickersApplied", label: "Apply On-Site Stickers", type: "radio" },
      { name: "completionPhotos", label: "Capture Proof of Completion Photos", type: "text" },
      { name: "finalStatus", label: "Update Status", type: "text" },
      { name: "invoiceGenerated", label: "Generate and send Invoice", type: "radio" },
      {
        name: "archiveOrder",
        label: "Move order to Archived Orders",
        type: "radio",
        options: ["Completed", "Cancelled"],
        triggersModal: true,
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "installerAssigned",
          "onsiteStickersApplied",
          "completionPhotos",
          "finalStatus",
          "invoiceGenerated",
          "archiveOrder",
        ],
      },
    ],
  },
  commercial: {
    fields: [
      { name: "notifySoaToClient", label: "Notify SOA to Client", type: "radio" },
      { name: "council", label: "Council", type: "text" },
      { name: "settlementNotificationToClient", label: "Settlement Notification to Client", type: "radio" },
      { name: "settlementNotificationToCouncil", label: "Settlement Notification to Council", type: "radio" },
      { name: "settlementNotificationToWater", label: "Settlement Notification to Water", type: "radio" },
      { name: "finalLetterToClient", label: "Final Letter to Client", type: "radio" },
      { name: "invoiced", label: "Invoiced", type: "radio" },
      {
        name: "closeMatter",
        label: "Close Matter",
        type: "radio",
        options: ["Completed", "Cancelled"],
        triggersModal: true,
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "notifySoaToClient",
          "settlementNotificationToClient",
          "settlementNotificationToCouncil",
          "settlementNotificationToWater",
          "finalLetterToClient",
          "invoiced",
          "closeMatter",
        ],
      },
    ],
  },
};

const getStatus = (value) => {
  const val = normalizeValue(value);
  if (!val) return "Not Completed";
  if (["yes", "na", "n/a", "nr", "completed", "cancelled"].includes(val))
    return "Completed";
  if (val === "no") return "Not Completed";
  if (["processing", "inprogress"].includes(val)) return "In Progress";
  return "Not Completed";
};

const bgcolor = (status) => {
  const statusColors = {
    Completed: "bg-[#00A506] text-white",
    "Not Completed": "bg-[#FF0000] text-white",
    "In Progress": "bg-[#FFEECF] text-[#FF9500]",
  };
  return statusColors[status] || "bg-[#FF0000] text-white";
};

export default function Stage6({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 6;
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const { matterNumber } = useParams();

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteForSystem, setNoteForSystem] = useState("");
  const [noteForClient, setNoteForClient] = useState("");
  const originalData = useRef({});

  // Get company and module
  const company = localStorage.getItem("company") || "vkl";
  const currentModule = localStorage.getItem("currentModule");

  const currentConfig =
    currentModule === "commercial"
      ? formConfig.commercial
      : formConfig[company] || formConfig.vkl;

  const modalField = currentConfig.fields.find((f) => f.triggersModal);

  const generateSystemNote = (noteGroupId) => {
    const noteGroup = currentConfig.noteGroups.find(
      (ng) => ng.id === noteGroupId
    );
    if (!noteGroup) return "";
    const greenValues = ["yes", "na", "n/a", "nr", "completed", "cancelled"];
    const fieldsToCheck = currentConfig.fields.filter((f) =>
      noteGroup.fieldsForNote.includes(f.name)
    );
    const incomplete = fieldsToCheck
      .filter(
        (field) =>
          !greenValues.includes(normalizeValue(formData[field.name] || ""))
      )
      .map((field) => field.label);
    if (incomplete.length === 0) return "All tasks completed";
    return `Pending: ${incomplete.join(", ")}`;
  };

  useEffect(() => {
    if (!data) return;
    setIsLoading(true);

    const initializeData = async () => {
      try {
        let stageData = data;
        if (currentModule === "commercial") {
          try {
            const stageResponse = await commercialApi.getStageData(6, matterNumber);
            if (stageResponse && stageResponse.data) {
              stageData = { ...data, ...stageResponse.data };
            } else if (stageResponse) {
              stageData = { ...data, ...stageResponse };
            }
          } catch {
            stageData = data;
          }
        }

        const initialFormData = {};
        const initialStatuses = {};
        currentConfig.fields.forEach((field) => {
          const rawVal = stageData[field.name] ?? data[field.name] ?? "";

          if (field.name === "closeMatter" || field.name === "archiveOrder") {
            const norm = normalizeValue(rawVal);
            if (
              [
                "yes",
                "true",
                "closed",
                "complete",
                "completed",
                "done"
              ].includes(norm)
            ) {
              initialFormData[field.name] = "Completed";
            } else if (
              ["cancel", "cancelled", "canceled", "void"].includes(norm)
            ) {
              initialFormData[field.name] = "Cancelled";
            } else {
              initialFormData[field.name] = rawVal;
            }
          } else {
            initialFormData[field.name] = rawVal;
          }
          initialStatuses[field.name] = getStatus(initialFormData[field.name]);
        });

        // Notes
        if (currentModule === "commercial") {
          setNoteForSystem(stageData.noteForSystem || "");
          setNoteForClient(stageData.noteForClient || "");
        } else {
          currentConfig.noteGroups.forEach((group) => {
            const noteParts = (
              stageData[group.noteForClientKey] ||
              data[group.noteForClientKey] ||
              ""
            ).split(" - ");
            initialFormData[group.systemNoteKey] =
              noteParts.length > 1 ? noteParts[1].trim() : "";
          });
        }

        setFormData(initialFormData);
        setStatuses(initialStatuses);
        originalData.current = initialFormData;
      } catch {
        toast.error("Failed to load stage data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
    // eslint-disable-next-line
  }, [data, reloadTrigger, company, currentModule, matterNumber]);

  const handleChange = (field, value) => {
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);

    let processedValue = value;

    if (fieldConfig && fieldConfig.type === "radio") {
      processedValue = normalizeValue(processedValue);
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
    }
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
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

  async function proceedWithSave() {
    setIsSaving(true);

    try {
      let payload = { ...formData };

      if (currentModule === "commercial") {
        const commercialFields = [
          "notifySoaToClient",
          "council",
          "settlementNotificationToClient",
          "settlementNotificationToCouncil",
          "settlementNotificationToWater",
          "finalLetterToClient",
          "invoiced",
          "closeMatter",
          "noteForSystem",
          "noteForClient",
          "colorStatus",
          "matterNumber"
        ];
        const filteredPayload = {};
        commercialFields.forEach((field) => {
          if (payload[field] !== undefined) {
            filteredPayload[field] = payload[field];
          }
        });
        payload = filteredPayload;
        payload.noteForSystem = generateSystemNote("main");
        payload.noteForClient = noteForClient || "";
        const allCompleted = currentConfig.fields.every(
          (field) => getStatus(formData[field.name]) === "Completed"
        );
        payload.colorStatus = allCompleted ? "green" : "amber";
        payload.matterNumber = matterNumber;
        await commercialApi.upsertStage(6, matterNumber, payload);
      } else {
        currentConfig.noteGroups.forEach((group) => {
          const systemNote = generateSystemNote(group.id);
          const clientComment = formData[group.systemNoteKey] || "";
          payload[group.noteForClientKey] = clientComment
            ? `${systemNote} - ${clientComment}`
            : systemNote;
          delete payload[group.systemNoteKey];
        });
        if (company === "vkl") {
          payload.matterNumber = matterNumber;
          await api.upsertStageSix(payload);
        } else if (company === "idg") {
          payload.orderId = matterNumber;
          await api.upsertIDGStages(payload.orderId, 6, payload);
        }
      }

      originalData.current = { ...formData };
      setReloadTrigger((prev) => !prev);
      setIsModalOpen(false);

      toast.success("Stage 6 saved successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (err) {
      let errorMessage = "Failed to save Stage 6. Please try again.";
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

  async function handleSave() {
    if (!isChanged() || isSaving) return;

    if (modalField) {
      const originalValue = normalizeValue(originalData.current[modalField.name] || "");
      const currentValue = normalizeValue(formData[modalField.name] || "");

      if (currentValue && originalValue !== currentValue) {
        setIsModalOpen(true);
        return;
      }
    }
    await proceedWithSave();
  }

  const renderField = (field) => {
    const options = field.options || ["Yes", "No", "Processing", "N/R"];
    return (
      <div key={field.name} className="mt-8">
        <div className="flex gap-4 items-center justify-between mb-3">
          <label className="block mb-1 text-sm md:text-base font-bold">
            {field.label}
          </label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses[field.name]
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[10px] md:text-[12px] whitespace-nowrap">
              {statuses[field.name] ?? "Not Completed"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
          {field.type === "text" ? (
            <input
              type="text"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          ) : (
            options.map((val) => (
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
        </div>
      </div>
    );
  };

  const renderNoteGroup = (group) => (
    <div key={group.id} className="mt-8">
      <div className="mb-6">
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
      <div>
        <label className="block mb-1 text-sm md:text-base font-bold">
          {group.clientCommentLabel}
        </label>
        <textarea
          value={formData[group.systemNoteKey] || ""}
          onChange={(e) => handleChange(group.systemNoteKey, e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
    </div>
  );

  const renderCommercialNotes = () => (
    <div className="mt-8">
      <div className="mb-6">
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
      <div>
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
    <>
      <div className="overflow-y-auto">
        {currentConfig.fields.map(renderField)}
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
      {isModalOpen && modalField && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={proceedWithSave}
          title="Confirm Action"
          message={`Are you sure you want to ${formData[
            modalField.name
          ]?.toLowerCase()} this matter? This action may be irreversible.`}
        />
      )}
    </>
  );
}

Stage6.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};