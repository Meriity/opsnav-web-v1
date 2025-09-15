import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";


const formConfig = {
  vkl: {
    fields: [
      { name: "dts", label: "DTS", type: "radio" },
      { name: "dutyOnline", label: "Duty Online", type: "radio" },
      { name: "soa", label: "SOA", type: "radio" },
      { name: "frcgw", label: "FRCGW", type: "radio" },
      { name: "contractPrice", label: "Contract Price", type: "number" },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: ["dts", "dutyOnline", "soa", "frcgw"],
      },
    ],
  },
  idg: {
    fields: [
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
      { name: "proofSentToClient", label: "Send Proof to Client", type: "radio" },
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
        name: "materialsOrganized",
        label: "Organize Boards, Stickers, Stands, Posts",
        type: "radio",
      },
      {
        name: "jobActivity",
        label: "Ensure Job Activity & Priority are correctly logged",
        type: "text",
      },
      {
        name: "priority",
        label: "Job Priority",
        type: "text",
      },
      {
        name: "status",
        label: "Update Job Status",
        type: "text",
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
          "designArtwork",
          "internalApproval",
          "proofSentToClient",
          "clientApprovalReceived",
          "printReadyFiles",
          "materialsOrganized",
          "jobActivity",
          "priority",
          "status"
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
  if (!val) return "Not Completed";
  if (["yes", "na", "n/a", "nr"].includes(val)) return "Completed";
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

const extractNotes = (note = "") => {
  const [systemNote = "", clientComment = ""] = (note || "")
    .split(" - ")
    .map((str) => str.trim());
  return { systemNote, clientComment };
};

export default function Stage4({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  console.log("Stage 4 data:", data);
  const stage = 4;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const company = localStorage.getItem("company") || "vkl";
  const currentConfig = formConfig[company] || formConfig.vkl;

const generateSystemNote = (noteGroupId) => {
  const noteGroup = currentConfig.noteGroups.find(
    (ng) => ng.id === noteGroupId
  );
  if (!noteGroup) return "";

  const greenValues = new Set(["yes", "nr", "na", "approved"]);

  const fieldsToCheck = currentConfig.fields.filter((f) =>
    noteGroup.fieldsForNote.includes(f.name)
  );

  const notReceived = fieldsToCheck
    .filter((field) => {
      const rawValue = formData[field.name] || "";
      const value = normalizeValue(rawValue);

      // Special case: skip obtainDaSeller if clientType is not seller
      if (
        field.name === "obtainDaSeller" &&
        clientType?.toLowerCase() !== "seller"
      ) {
        return false;
      }

      if (field.type === "text") {
        // text fields count as completed if not empty
        return value === "";
      }

      // non-text fields rely on greenValues
      return !greenValues.has(value);
    })
    .map((field) => field.label);

  if (notReceived.length === 0) return "Tasks completed";
  return `${notReceived.join(" and ")} not received`;
};


  useEffect(() => {
    if (!data) return;

    const initialFormData = {};
    const initialStatuses = {};

    currentConfig.fields.forEach((field) => {
      if (field.type === "number") {
        const rawPrice = data[field.name];
        initialFormData[field.name] =
          typeof rawPrice === "object" && rawPrice?.$numberDecimal
            ? rawPrice.$numberDecimal
            : rawPrice?.toString() || "";
      } else if (field.type === "radio") {
        initialFormData[field.name] = normalizeValue(data[field.name] || "");
        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
      } else {
        initialFormData[field.name] = data[field.name] || "";
      }
    });

    currentConfig.noteGroups.forEach((group) => {
      const notes = extractNotes(data[group.noteForClientKey]);
      initialFormData[group.clientCommentKey] = notes.clientComment;
    });

    setFormData(initialFormData);
    setStatuses(initialStatuses);
    originalData.current = initialFormData;
  }, [data, reloadTrigger, company]);

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

  const isChanged = () =>
    JSON.stringify(formData) !== JSON.stringify(originalData.current);

async function handleSave() {
  if (!isChanged() || isSaving) return;
  setIsSaving(true);

  try {
    const company = localStorage.getItem("company");
    let payload = { ...formData };

    // handle note groups
    currentConfig.noteGroups.forEach((group) => {
      const systemNote = generateSystemNote(group.id);
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

    // company-specific save
    if (company === "vkl") {
      payload.matterNumber = matterNumber;
      await api.upsertStageFour(payload);
    } else if (company === "idg") {
      payload.orderId = matterNumber;
      await api.upsertIDGStages(payload.orderId, 4, payload);
    }

    // update original data
    originalData.current = { ...formData };
    setReloadTrigger((prev) => !prev);

    toast.success("Stage 4 Saved Successfully!", {
      position: "bottom-left",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    });
  } catch (err) {
    console.error("Failed to save Stage 4:", err);
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
            {/* <div className="flex gap-4 justify-between flex-wrap items-center mb-3"> */}
            {/* tight spacing of every fields*/}
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
          onChange={(e) => handleChange(group.clientCommentKey, e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
    </div>
  );

  return (
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
  );
}

Stage4.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};
