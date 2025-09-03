import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

// --- Configuration Object for Stage 4 ---
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
        fieldsForNote: ["dts", "dutyOnline", "soa", "frcgw"], // Only radio fields affect the note
      },
    ],
  },
  idg: {
    fields: [
      { name: "createArtwork", label: "Create / update Design Artwork", type: "radio" },
      { name: "approveDesign", label: "Review and internally approve design", type: "radio" },
      { name: "sendProof", label: "Send Proof to Client", type: "radio" },
      { name: "recordApproval", label: "Record Client Approval", type: "radio" },
      { name: "generatePrintFiles", label: "Generate Print-Ready Files", type: "radio" },
      { name: "organizeMaterials", label: "Organize Boards, Stickers, Stands, Posts", type: "radio" },
      { name: "logJobActivity", label: "Ensure Job Activity & Priority are correctly logged", type: "radio" },
      { name: "updateJobStatus", label: "Update Job Status (Excel: Status)", type: "radio" },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        // All fields in IDG's config are radio types and should affect the note
        fieldsForNote: [
            "createArtwork", "approveDesign", "sendProof", "recordApproval",
            "generatePrintFiles", "organizeMaterials", "logJobActivity", "updateJobStatus"
        ],
      },
    ],
  },
};

// --- Component Definition ---
export default function Stage4({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 4;
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
        if (field.type === 'number') {
            const rawPrice = data[field.name];
            initialFormData[field.name] = (typeof rawPrice === "object" && rawPrice?.$numberDecimal) ? rawPrice.$numberDecimal : (rawPrice?.toString() || "");
        } else {
            initialFormData[field.name] = data[field.name] || "";
        }
      
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
            delete payload[group.clientCommentKey]; // Clean up temp key
        });

        // Ensure number fields are sent as numbers or null
        currentConfig.fields.forEach(field => {
            if (field.type === 'number') {
                payload[field.name] = payload[field.name] === '' ? null : Number(payload[field.name]);
            }
        });

        await api.upsertStageFour(payload);
        originalData.current = { ...formData };
        setReloadTrigger(prev => !prev);
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
      case "number":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">{field.label}</label>
            <input
              type="number" step="0.01"
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

Stage4.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};