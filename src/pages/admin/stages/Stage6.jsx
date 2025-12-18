import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PropTypes from "prop-types";
import { useArchivedClientStore } from "../../ArchivedClientStore/UseArchivedClientStore";

const formConfig = {
  conveyancing: {
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
  "print media": {
    fields: [
      {
        name: "installerAssigned",
        label: "Assign Installer / Field Staff",
        type: "text",
      },
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
          "installerAssigned",
          "onsiteStickersApplied",
          "completionPhotos",
          "finalStatus",
          "invoiceGenerated",
          "archiveOrder",
          "installationDone",
          "streetPointersPlaced",
          "capturePhotos",
          "updateStatusExcel",
          "generateInvoice",
        ],
      },
    ],
  },
  commercial: {
    fields: [
      {
        name: "notifySoaToClient",
        label: "Notify SOA to Client",
        type: "radio",
      },
      { name: "council", label: "Council", type: "text" },
      {
        name: "settlementNotificationToClient",
        label: "Settlement Notification to Client",
        type: "radio",
      },
      {
        name: "settlementNotificationToCouncil",
        label: "Settlement Notification to Council",
        type: "radio",
      },
      {
        name: "settlementNotificationToWater",
        label: "Settlement Notification to Water",
        type: "radio",
      },
      {
        name: "finalLetterToClient",
        label: "Final Letter to Client",
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

const normalizeValue = (v) => {
  if (v === undefined || v === null) return "";
  return String(v).toLowerCase().trim();
};

const getStatus = (value) => {
  const val = normalizeValue(value);
  if (!val) return "Not Completed";
  if (["yes", "na", "n/a", "nr", "completed", "cancelled"].includes(val))
    return "Completed";
  if (val === "no") return "Not Completed";
  if (["processing", "inprogress"].includes(val)) return "In Progress";
  if (val) return "Completed";
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

const extractNotes = (noteForSystem = "", noteForClient = "") => {
  return {
    systemNote: noteForSystem || "",
    clientComment: noteForClient || "",
  };
};

export default function Stage6({ changeStage, data, stageNumber = 6, setReloadTrigger, onStageUpdate }) {
  const { matterNumber } = useParams();
  
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteForClient, setNoteForClient] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const originalData = useRef({});
  const hasLoaded = useRef(false);
  
  const reloadArchivedClients = useArchivedClientStore(
    (s) => s.reloadArchivedClients
  );

  const currentModule = localStorage.getItem("currentModule");
  const currentConfig = formConfig[currentModule] || formConfig.conveyancing;
  
  const modalField = currentConfig.fields.find((f) => f.triggersModal);

  // Initial Load
  useEffect(() => {
    if (!data || hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
        // As with Stage 5 refactor, we rely on 'data' prop from parent (StageLayout)
        let stageData = data;
        
        const newForm = {};
        const newStatus = {};
        let loadedClientComment = "";
        let loadedSystemNote = "";

        currentConfig.fields.forEach((field) => {
            const rawVal = stageData[field.name];
            let val = rawVal ?? "";

            if (field.type === "radio") {
                // Keep minimal normalization logic for initial load to match old stage6
                if (field.triggersModal) {
                    const normVal = normalizeValue(rawVal);
                    if (["yes", "true", "closed", "complete", "completed", "done"].includes(normVal)) {
                        val = "Completed";
                    } else if (["cancel", "cancelled", "canceled", "void", "no"].includes(normVal)) {
                        val = "Cancelled";
                    } else {
                        val = "";
                    }
                } else {
                     // Standard radio
                     const nVal = normalizeValue(rawVal);
                     if (nVal === "yes") val = "Yes";
                     else if (nVal === "no") val = "No";
                     else if (["processing", "inprogress"].includes(nVal)) val = "Processing";
                     else if (["nr", "n/r"].includes(nVal)) val = "N/R";
                     else val = rawVal ?? ""; 
                }
            } else {
                val = rawVal ?? "";
            }

            newForm[field.name] = val;
            newStatus[field.name] = getStatus(val);
        });

        if (currentModule === "commercial") {
            const { systemNote, clientComment } = extractNotes(
              stageData.noteForSystem,
              stageData.noteForClient
            );
            loadedSystemNote = systemNote;
            loadedClientComment = clientComment;
            setNoteForClient(clientComment || "");
        } else {
            currentConfig.noteGroups.forEach((group) => {
              const noteString = stageData[group.noteForClientKey] || "";
              const noteParts = noteString.split(" - ").filter((part) => part.trim() !== "");
              loadedSystemNote = noteParts[0]?.trim() || "";
              loadedClientComment = noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";
              newForm[group.clientCommentKey] = loadedClientComment;
            });
        }

        setFormState(newForm);
        setStatusState(newStatus);
        
        originalData.current = {
            formData: { ...newForm },
            noteForClient: loadedClientComment,
            noteForSystem: loadedSystemNote
        };
        
        setIsLoading(false);
    };
    
    load();
  }, [data, currentModule, currentConfig]);


  const generateSystemNote = (groupId = "main") => {
      const noteGroup = currentConfig.noteGroups.find(ng => ng.id === groupId);
      if (!noteGroup) return "";

      const greenValues = new Set([
        "yes",
        "na",
        "n/a",
        "nr",
        "completed",
        "cancelled",
      ]);

      const fieldsToCheck = currentConfig.fields.filter((f) =>
        noteGroup.fieldsForNote.includes(f.name)
      );

      const incomplete = fieldsToCheck
        .filter((field) => {
          const value = normalizeValue(formState[field.name] || "");
          if (field.type === "text" && value !== "") return false;
          if (field.type === "radio" && greenValues.has(value)) return false;
          return true;
        })
        .map((field) => field.label);

      if (incomplete.length === 0) return "All tasks completed";
      return `Pending: ${incomplete.join(", ")}`;
  };


  const handleChange = (key, value) => {
    const field = currentConfig.fields.find((f) => f.name === key);
    let processed = value;

    // Update form state
    setFormState((prev) => ({ ...prev, [key]: processed }));
    
    // Update status immediate
    if (field) { // both radio and text can have statuses in this config
        setStatusState((prev) => ({ ...prev, [key]: getStatus(processed) }));
    }
  };

  const isChanged = () => {
      const original = originalData.current || {};
      const formChanged = JSON.stringify(formState) !== JSON.stringify(original.formData);
      
      let clientNoteChanged = false;
      if (currentModule === "commercial") {
          clientNoteChanged = (noteForClient || "") !== (original.noteForClient || "");
      } else {
          // for others, client comment is inside formState so formChanged covers it usually, 
          // but strictly speaking clientCommentKey is in noteGroups. 
          // However we load it into formState, so JSON stringify formState handles it.
      }
      
      return formChanged || clientNoteChanged; 
      // System note change is derived from form change, so no need to explicitly check usually, 
      // unless logic depends solely on system note which is rare without form change.
  };

  const performSave = async () => {
      setIsSaving(true);
      
      const systemNote = generateSystemNote("main");
      // Calculate color status
      const allCompleted = currentConfig.fields.every(
        (field) => getStatus(formState[field.name]) === "Completed"
      );
      const colorStatus = allCompleted ? "green" : "amber";
      
      let payload = {};

      if (currentModule === "commercial") {
          const filteredPayload = {};
          currentConfig.fields.forEach((f) => {
             const val = formState[f.name];
             filteredPayload[f.name] = (val === undefined || val === null) ? "" : val;
          });
          
          filteredPayload.noteForSystem = systemNote;
          filteredPayload.noteForClient = noteForClient || "";
          filteredPayload.colorStatus = colorStatus;
          filteredPayload.matterNumber = matterNumber;
          
          if (filteredPayload.closeMatter) {
             const cm = String(filteredPayload.closeMatter).toLowerCase();
             if(["completed","complete","done"].includes(cm)) filteredPayload.closeMatter = "completed";
             else if(["cancelled","cancel"].includes(cm)) filteredPayload.closeMatter = "cancelled";
          }
          
          payload = filteredPayload;

      } else {
          payload = { ...formState };
          currentConfig.noteGroups.forEach((group) => {
             const comment = payload[group.clientCommentKey] || "";
             payload[group.noteForClientKey] = comment ? `${systemNote} - ${comment}` : systemNote;
             delete payload[group.clientCommentKey]; // remove temp key
          });
          
          payload.colorStatus = colorStatus;
          if (currentModule === "print media") {
              payload.orderId = matterNumber;
          } else {
              payload.matterNumber = matterNumber;
          }
      }

      // Safe Primitive Conversion
      const safePayload = {};
      Object.keys(payload).forEach((k) => {
          const v = payload[k];
          if (v === null || v === undefined) {
              safePayload[k] = null;
          } else if (typeof v === 'object') {
              safePayload[k] = String(v);
          } else {
              safePayload[k] = v;
          }
      });
      
      try {
          if (currentModule === "commercial") {
             // Dual save strategy: 
             // 1. Save to Stage 6 specific endpoint
             await commercialApi.upsertStage(6, matterNumber, safePayload);
             
             // 2. Also save to main client endpoint (root fields like closeMatter, notifySoaToClient)
             // This ensures persistence if GET /clients/alldata pulls from root
             try {
                await api.updateClientData(matterNumber, safePayload);
             } catch (err) {
                 console.warn("Secondary save to updateClientData failed", err);
                 // Don't block success if at least one worked, but log it.
             }

          } else if (currentModule === "print media") {
             await api.upsertIDGStages(matterNumber, 6, safePayload);
          } else {
             await api.upsertStageSix(safePayload);
          }

          toast.success("Stage 6 Saved Successfully!");
          
          // Trigger updates
          setReloadTrigger((p) => p + 1);
          if (typeof reloadArchivedClients === "function") reloadArchivedClients();
          if (onStageUpdate) onStageUpdate({ ...safePayload }, 6);
          
          // Update original ref
          originalData.current = {
             formData: { ...formState },
             noteForClient: currentModule === "commercial" ? noteForClient : undefined,
             noteForSystem: systemNote,
          };

      } catch (e) {
          console.error(e);
          toast.error("Failed to save Stage 6.");
      }
      
      setIsSaving(false);
      setIsModalOpen(false);
  };

  const handleSave = async () => {
     if (!isChanged() || isSaving) return;

     if (modalField) {
         const originalValue = normalizeValue(originalData.current?.formData?.[modalField.name]);
         const currentValue = normalizeValue(formState[modalField.name]);
         
         if (currentValue && (originalValue !== currentValue)) {
             setIsModalOpen(true);
             return;
         }
     }
     
     // strict compare for close matter if it's not empty? 
     // The logic above says if it CHANGED and is NOT empty, show modal. 
     // If it is empty, or didn't change, just save.
     
     await performSave();
  };

  const confirmSave = async () => {
      await performSave();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {currentConfig.fields.map((field) => (
         <div key={field.name} className="mt-5">
            {field.type === "radio" ? (
                <>
                  <div className="flex justify-between items-center mb-3">
                     <label className="font-bold">{field.label}</label>
                     <div
                        className={`w-[90px] h-[18px] flex items-center justify-center rounded-4xl ${bgcolor(statusState[field.name])}`}
                     >
                       <p className="text-[11px]">{statusState[field.name]}</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                     {(field.options || ["Yes", "No", "Processing", "N/R"]).map((opt) => (
                        <label key={opt} className="flex gap-2">
                           <input
                              type="radio"
                              checked={normalizeValue(formState[field.name]) === normalizeValue(opt)}
                              onChange={() => handleChange(field.name, opt)}
                           />
                           {opt}
                        </label>
                     ))}
                  </div>
                </>
            ) : (
                <div className="w-full">
                    <label className="font-bold block mb-2">{field.label}</label>
                    <input
                       type="text"
                       value={formState[field.name] || ""}
                       onChange={(e) => handleChange(field.name, e.target.value)}
                       className="border rounded p-2 w-full bg-gray-100"
                    />
                </div>
            )}
         </div>
      ))}

      {currentModule === "commercial" ? (
         <>
            <div className="mt-5">
                <label className="font-bold">System Note for Client</label>
                <input
                   disabled
                   value={generateSystemNote("main")}
                   className="w-full rounded p-2 bg-gray-100"
                />
            </div>
            <div className="mt-5">
                <label className="font-bold">Comment for Client</label>
                <textarea
                   value={noteForClient}
                   onChange={(e) => setNoteForClient(e.target.value)}
                   className="w-full rounded p-2 bg-gray-100"
                />
            </div>
         </>
      ) : (
         currentConfig.noteGroups.map(group => (
            <div key={group.id}>
                <div className="mt-5">
                    <label className="font-bold">{group.systemNoteLabel}</label>
                    <input
                       disabled
                       value={generateSystemNote(group.id)}
                       className="w-full rounded p-2 bg-gray-100"
                    />
                </div>
                <div className="mt-5">
                    <label className="font-bold">{group.clientCommentLabel}</label>
                    <textarea
                       value={formState[group.clientCommentKey] || ""}
                       onChange={(e) => handleChange(group.clientCommentKey, e.target.value)}
                       className="w-full rounded p-2 bg-gray-100"
                    />
                </div>
            </div>
         ))
      )}

      <div className="flex justify-between mt-10">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
          onClick={() => changeStage(stageNumber - 1)}
        />
        <div className="flex gap-2">
          {/* Stage 6 is usually final, so Next takes to Cost/Stage7 if exists, otherwise might just be Save */}
          <Button
            label={isSaving ? "Saving..." : "Save"}
            width="w-[100px] md:w-[100px]"
            bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
            onClick={handleSave}
            disabled={isSaving}
          />
          {/* Some stages layouts have stage 7/Cost. If so, Next button is valid. 
              The parent will handle logic if stageNumber+1 > max. 
              Usually Stage6 is last, but sometimes there is cost. */}
             <Button
                label="Next"
                width="w-[70px] md:w-[100px]"
                bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
                onClick={() => changeStage(stageNumber + 1)}
             />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmSave}
        title="Confirm Status Change"
        message={`Are you sure you want to mark this matter as ${
            formState[modalField?.name]
        }? This action will archive the matter.`}
      />
    </div>
  );
}

Stage6.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  stageNumber: PropTypes.number,
  setReloadTrigger: PropTypes.func.isRequired,
  onStageUpdate: PropTypes.func,
};
