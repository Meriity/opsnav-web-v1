import { useEffect, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import PropTypes from "prop-types";

const normalizeValue = (v) => {
  if (v === undefined || v === null) return "";
  return String(v)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
};

const formConfig = {
  vkl: {
    fields: [
      {
        name: "noaToCouncilWater",
        label: "NOA to Council/Water",
        type: "radio",
      },
      { name: "dutyPaid", label: "Duty Paid", type: "radio" },
      {
        name: "finalLetterToClient",
        label: "Final Letter to Client",
        type: "radio",
      },
      {
        name: "finalLetterToAgent",
        label: "Final Letter to Agent",
        type: "radio",
      },
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
      {
        name: "installerAssigned",
        label: "Assign Installer / Field Staff",
        type: "text",
      },
      {
        name: "installationDone",
        label: "Perform Installation / Removal On-Site",
        type: "radio",
      },
      { name: "streetPointersPlaced", label: "Place Street Pointers", type: "radio" },
      {
        name: "onsiteStickersApplied",
        label: "Apply On-Site Stickers",
        type: "radio",
      },
      {
        name: "completionPhotos",
        label: "Capture Proof of Completion Photos",
        type: "text",
      },
      { name: "finalStatus", label: "Update Status", type: "text" },
      {
        name: "invoiceGenerated",
        label: "Generate and send Invoice",
        type: "radio",
      },
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
          "assignInstaller",
          "performInstallation",
          "placePointers",
          "applyOnSiteStickers",
          "capturePhotos",
          "updateStatusExcel",
          "generateInvoice",
          "archiveOrder",
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
  const { matterNumber } = useParams();

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const originalData = useRef({});

  const company = localStorage.getItem("company") || "vkl";
  const currentConfig = formConfig[company] || formConfig.vkl;
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

    const stageData = data.stage6 || data.stage || data || {};

    const initialFormData = {};
    const initialStatuses = {};

    currentConfig.fields.forEach((field) => {
      const rawVal = stageData[field.name] ?? data[field.name] ?? "";

      if (field.name === "closeMatter") {
        const norm = normalizeValue(rawVal);
        if (
          ["yes", "true", "closed", "complete", "completed", "done"].includes(
            norm
          )
        ) {
          initialFormData[field.name] = "completed";
        } else if (["cancel", "cancelled", "canceled", "void"].includes(norm)) {
          initialFormData[field.name] = "cancelled";
        } else {
          initialFormData[field.name] = normalizeValue(rawVal);
        }
      } else {
        initialFormData[field.name] = normalizeValue(rawVal);
      }

      initialStatuses[field.name] = getStatus(initialFormData[field.name]);
    });

    currentConfig.noteGroups.forEach((group) => {
      const noteParts = (
        stageData[group.noteForClientKey] ||
        data[group.noteForClientKey] ||
        ""
      ).split(" - ");
      initialFormData[group.systemNoteKey] =
        noteParts.length > 1 ? noteParts[1].trim() : "";
    });

    setFormData(initialFormData);
    setStatuses(initialStatuses);
    originalData.current = initialFormData;
  }, [data, reloadTrigger, company]);

  const handleChange = (field, value) => {
    const processed = typeof value === "string" ? normalizeValue(value) : value;
    setFormData((prev) => ({ ...prev, [field]: processed }));

    const fieldConfig = currentConfig.fields.find((f) => f.name === field);
    if (fieldConfig && fieldConfig.type === "radio") {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processed) }));
    }
  };

  const isChanged = () =>
    JSON.stringify(formData) !== JSON.stringify(originalData.current);

  async function proceedWithSave() {
  setIsSaving(true);

  try {
    const company = localStorage.getItem("company");
    let payload = { ...formData };

    // handle note groups
    currentConfig.noteGroups.forEach((group) => {
      const systemNote = generateSystemNote(group.id);
      const clientComment = formData[group.systemNoteKey] || "";
      payload[group.noteForClientKey] = clientComment
        ? `${systemNote} - ${clientComment}`
        : systemNote;
      delete payload[group.systemNoteKey];
    });

    // company-specific save
    if (company === "vkl") {
      payload.matterNumber = matterNumber;
      await api.upsertStageSix(payload);
    } else if (company === "idg") {
      payload.orderId = matterNumber;
      await api.upsertIDGStages(payload.orderId, 6, payload);
    }

    originalData.current = { ...formData };
    setReloadTrigger((prev) => !prev);
    setIsModalOpen(false);

    toast.success("Stage 6 saved successfully!", {
      position: "bottom-left",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    });
  } catch (err) {
    console.error("Failed to save Stage 6:", err);
    toast.error("Failed to save Stage 6.");
  } finally {
    setIsSaving(false);
  }
}

async function handleSave() {
  if (!isChanged() || isSaving) return;

  if (modalField) {
    const originalValue = normalizeValue(
      originalData.current[modalField.name] || ""
    );
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
    const isCloseMatter =
      field.name === "closeMatter" || field.name === "archiveOrder";

    return (
      <div key={field.name} className="mt-8">
        {/* <div className="flex gap-4 items-center justify-between mb-5">
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
        </div> */}
        {/* tight spacing of every fields*/}
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
        {/* <div
          className={
            isCloseMatter
              ? "flex items-center gap-4 mb-6" // tighter
              : "flex justify-between items-center gap-6 mb-6" // original wide spacing
          }
        > */}
        {/* tight spacing of every fields*/}
        <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
          {options.map((val) => (
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

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        onConfirm={proceedWithSave}
        title="Are you sure?"
      >
        You are about to finalize this matter as{" "}
        <strong className="text-gray-900">
          "{modalField && formData[modalField.name]}"
        </strong>
        . This action may be irreversible.
      </ConfirmationModal>

      <div className="overflow-y-auto">
        {currentConfig.fields.map(renderField)}
        {currentConfig.noteGroups.map(renderNoteGroup)}

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
    </>
  );
}

Stage6.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};
