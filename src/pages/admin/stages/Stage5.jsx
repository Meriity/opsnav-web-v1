import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

// --- Configuration Object for Stage 5 ---
const formConfig = {
  vkl: {
    fields: [
      { name: "notifySoaToClient", label: "Notify SOA to Client", type: "radio" },
      { name: "transferDocsOnPexa", label: "Transfer Docs on PEXA", type: "radio" },
      { name: "gstWithholding", label: "GST Withholding", type: "radio" },
      { name: "disbursementsInPexa", label: "Disbursements in PEXA", type: "radio" },
      { name: "addAgentFee", label: "Add Agent Fee", type: "radio" },
      { name: "settlementNotification", label: "Settlement Notification", type: "radio" },
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
        fieldsForNote: [ // Only radio fields affect the note
          "notifySoaToClient", "transferDocsOnPexa", "gstWithholding", 
          "disbursementsInPexa", "addAgentFee", "settlementNotification"
        ],
      },
    ],
  },
  idg: {
    fields: [
      { name: "printMaterials", label: "Print Boards, Stickers, Signage", type: "radio" },
      { name: "applyFinishing", label: "Apply Lamination / Cutting / Mounting", type: "radio" },
      { name: "preapplyStickers", label: "Pre-apply Auction / Leased / Sold Stickers", type: "radio" },
      { name: "packageMaterials", label: "Package Boards / Materials for delivery", type: "radio" },
      { name: "qualityCheck", label: "Perform Quality Check", type: "radio" },
      { name: "labelJob", label: "Label job with Agent / Address / Suburb", type: "radio" },
      { name: "markJobReady", label: "Mark job as ready for delivery", type: "radio" },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [ // All fields for IDG are radio types and affect the note
          "printMaterials", "applyFinishing", "preapplyStickers", "packageMaterials",
          "qualityCheck", "labelJob", "markJobReady"
        ],
      },
    ],
  },
};

// --- Component Definition ---
export default function Stage5({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 5;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const company = localStorage.getItem("company") || "vkl";
  const currentConfig = formConfig[company] || formConfig.vkl;

  const getStatus = (value) => {
    if (!value) return "Not Completed";
    const val = value.toLowerCase().trim();
    if (["yes", "na", "n/a", "nr", "n/r"].includes(val)) return "Completed";
    if (val === "no") return "Not Completed";
    if (["processing", "in progress"].includes(val)) return "In Progress";
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

  const generateSystemNote = (noteGroupId) => {
    const noteGroup = currentConfig.noteGroups.find(ng => ng.id === noteGroupId);
    if (!noteGroup) return "";
    
    const greenValues = ["yes", "na", "n/a", "nr", "n/r"];
    const fieldsToCheck = currentConfig.fields.filter(f => noteGroup.fieldsForNote.includes(f.name));
    
    const incomplete = fieldsToCheck
      .filter(field => !greenValues.includes((formData[field.name] || "").toLowerCase()))
      .map(field => field.label);
      
    if (incomplete.length === 0) return "All tasks completed";
    return `Pending: ${incomplete.join(", ")}`;
  };
  
  useEffect(() => {
    if (!data) return;
    const initialFormData = {};
    const initialStatuses = {};

    currentConfig.fields.forEach((field) => {
      initialFormData[field.name] = data[field.name] || "";
      if (field.type === "radio") {
        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
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
    setFormData(prev => ({ ...prev, [field]: value }));
    const fieldConfig = currentConfig.fields.find(f => f.name === field);
    if (fieldConfig && fieldConfig.type === "radio") {
      setStatuses(prev => ({ ...prev, [field]: getStatus(value) }));
    }
  };

  const isChanged = () => JSON.stringify(formData) !== JSON.stringify(originalData.current);
  
  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      const payload = { matterNumber, ...formData };
      
      currentConfig.noteGroups.forEach(group => {
        const systemNote = generateSystemNote(group.id);
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] = `${systemNote} - ${clientComment}`.trim();
        delete payload[group.clientCommentKey];
      });

      await api.upsertStageFive(payload);
      originalData.current = { ...formData };
      setReloadTrigger(prev => !prev);
    } catch (err) {
      console.error("Failed to save Stage 5:", err);
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
              <label className="block mb-1 text-sm md:text-base font-bold">{field.label}</label>
              <div className={`w-[90px] h-[18px] ${bgcolor(statuses[field.name])} flex items-center justify-center rounded-4xl`}>
                <p className="text-[10px] md:text-[12px] whitespace-nowrap">{statuses[field.name]}</p>
              </div>
            </div>
            <div className="flex gap-4 justify-between flex-wrap items-center mb-3">
              {["Yes", "No", "Processing", "N/R"].map((val) => (
                <label key={val} className="flex items-center gap-2 text-sm md:text-base">
                  <input
                    type="radio" name={field.name} value={val}
                    checked={(formData[field.name] || "").toLowerCase() === val.toLowerCase()}
                    onChange={() => handleChange(field.name, val)}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        );
      case "text":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">{field.label}</label>
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
        <label className="block mb-1 text-sm md:text-base font-bold">{group.systemNoteLabel}</label>
        <input type="text" value={generateSystemNote(group.id)} disabled className="w-full rounded p-2 bg-gray-100" />
      </div>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">{group.clientCommentLabel}</label>
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
          label="Back" width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
        />
        <div className="flex gap-2">
          <Button
            label={isSaving ? "Saving..." : "Save"} width="w-[70px] md:w-[100px]" bg="bg-blue-500"
            onClick={handleSave} disabled={isSaving || !isChanged()}
          />
          <Button
            label="Next" width="w-[70px] md:w-[100px]"
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