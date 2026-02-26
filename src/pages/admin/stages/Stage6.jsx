import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PropTypes from "prop-types";
import { useArchivedClientStore } from "../../ArchivedClientStore/UseArchivedClientStore";
import { useQueryClient } from "@tanstack/react-query";

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
        options: ["Completed", "Cancelled", "Open"],
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
        options: ["Completed", "Cancelled", "Open"],
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

export default function Stage6({
  changeStage,
  data,
  stageNumber = 6,
  setReloadTrigger,
  onStageUpdate,
  setHasChanges,
}) {
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();

  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCloseMatter, setPendingCloseMatter] = useState(null);
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

  const isSuperAdmin = (localStorage.getItem("role") || "").toLowerCase().trim() === "superadmin";

  const modalField = currentConfig.fields.find((f) => f.triggersModal);

  // Initial Load
  useEffect(() => {
    if (!data || hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
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
            if (
              [
                "yes",
                "true",
                "closed",
                "complete",
                "completed",
                "done",
              ].includes(normVal)
            ) {
              val = "Completed";
            } else if (
              ["cancel", "cancelled", "canceled", "void", "no"].includes(
                normVal
              )
            ) {
              val = "Cancelled";
            } else if (normVal === "open") {
              val = isSuperAdmin ? "Open" : "";
            } else {
              val = "";
            }
          } else {
            // Standard radio
            const nVal = normalizeValue(rawVal);
            if (nVal === "yes") val = "Yes";
            else if (nVal === "no") val = "No";
            else if (["processing", "inprogress"].includes(nVal))
              val = "Processing";
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
          const noteParts = noteString
            .split(" - ")
            .filter((part) => part.trim() !== "");
          loadedSystemNote = noteParts[0]?.trim() || "";
          loadedClientComment =
            noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";
          newForm[group.clientCommentKey] = loadedClientComment;
        });
      }

      setFormState(newForm);
      setStatusState(newStatus);

      originalData.current = {
        formData: { ...newForm },
        noteForClient: loadedClientComment,
        noteForSystem: loadedSystemNote,
      };

      setIsLoading(false);
      setHasChanges(false);
    };

    load();
  }, [data, currentModule, currentConfig]);

  const generateSystemNote = (groupId = "main") => {
    const noteGroup = currentConfig.noteGroups.find((ng) => ng.id === groupId);
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

    // Special handling for Close Matter triggering modal on selection
    if (key === "closeMatter" && ["Completed", "Cancelled", "Open"].includes(value)) {
       setPendingCloseMatter(value);
       setIsModalOpen(true);
       // DO NOT update form state yet
       return;
    }

    // Update form state
    setFormState((prev) => ({ ...prev, [key]: processed }));
    setHasChanges(true);

    // Update status immediate
    if (field) {
      // both radio and text can have statuses in this config
      setStatusState((prev) => ({ ...prev, [key]: getStatus(processed) }));
    }
  };

  const isChanged = () => {
    const original = originalData.current || {};
    const formChanged =
      JSON.stringify(formState) !== JSON.stringify(original.formData);

    let clientNoteChanged = false;
    if (currentModule === "commercial") {
      clientNoteChanged =
        (noteForClient || "") !== (original.noteForClient || "");
    } else {
    }

    return formChanged || clientNoteChanged;
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
        filteredPayload[f.name] = val === undefined || val === null ? "" : val;
      });

      filteredPayload.noteForSystem = systemNote;
      filteredPayload.noteForClient = noteForClient || "";
      filteredPayload.colorStatus = colorStatus;
      filteredPayload.matterNumber = matterNumber;

      if (filteredPayload.closeMatter) {
        const cm = String(filteredPayload.closeMatter).toLowerCase();
        if (["completed", "complete", "done"].includes(cm))
          filteredPayload.closeMatter = "completed";
        else if (["cancelled", "cancel"].includes(cm))
          filteredPayload.closeMatter = "cancelled";
        else if (cm === "open")
          filteredPayload.closeMatter = isSuperAdmin ? "open" : "";
      }

      payload = filteredPayload;
    } else {
      payload = { ...formState };
      
      if (!isSuperAdmin) {
        if (normalizeValue(payload.closeMatter) === "open") payload.closeMatter = "";
        if (normalizeValue(payload.archiveOrder) === "open") payload.archiveOrder = "";
      }

      currentConfig.noteGroups.forEach((group) => {
        const comment = payload[group.clientCommentKey] || "";
        payload[group.noteForClientKey] = comment
          ? `${systemNote} - ${comment}`
          : systemNote;
        delete payload[group.clientCommentKey]; // remove temp key
      });

      payload.colorStatus = colorStatus;
      if (currentModule === "print media") {
        payload.orderId = matterNumber;
      } else {
        payload.matterNumber = matterNumber;
      }
    }

    if (!isSuperAdmin) {
      if (normalizeValue(payload.closeMatter) === "open") {
        payload.closeMatter = "";
      }
      if (normalizeValue(payload.archiveOrder) === "open") {
        payload.archiveOrder = "";
      }
    }

    // Safe Primitive Conversion
    const safePayload = {};
    Object.keys(payload).forEach((k) => {
      let v = payload[k];

      if (!isSuperAdmin && (k === "closeMatter" || k === "archiveOrder") && normalizeValue(v) === "open") {
        v = "";
      }

      if (v === null || v === undefined) {
        safePayload[k] = null;
      } else if (typeof v === "object") {
        safePayload[k] = String(v);
      } else {
        safePayload[k] = v;
      }
    });

    try {
      if (currentModule === "commercial") {
        await commercialApi.upsertStage(6, matterNumber, safePayload);
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

      // Invalidate queries if commercial
      if (currentModule === "commercial") {
        queryClient.invalidateQueries({
          queryKey: ["archivedClients", "commercial"],
        });
      }

      // Update original ref
      originalData.current = {
        formData: { ...formState },
        noteForClient:
          currentModule === "commercial" ? noteForClient : undefined,
        noteForSystem: systemNote,
      };
      setHasChanges(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save Stage 6.");
    }

    setIsSaving(false);
    setIsSaving(false);
    // Modal is handled by selection now
  };

  const handleSave = async () => {
    if (!isChanged() || isSaving) return;
    await performSave();
  };

  const confirmSave = async () => {
    await performSave();
  };

  useEffect(() => {
    const handleExternalSave = () => {
      handleSave();
    };

    window.addEventListener("saveCurrentStage", handleExternalSave);
    return () => {
      window.removeEventListener("saveCurrentStage", handleExternalSave);
    };
  }, [handleSave]);

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
      {currentConfig.fields.map((field) => {
        const isDangerField = field.name === "closeMatter";
        
        return (
        <div 
          key={field.name} 
          className={`mt-5 ${isDangerField ? "bg-red-50 border-2 border-red-200 p-4 rounded-xl" : ""}`}
        >
          {field.type === "radio" ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {isDangerField && (
                    <div className="bg-red-100 p-1.5 rounded-full text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <label className={`font-bold ${isDangerField ? "text-red-900 text-base lg:text-base xl:text-lg" : "text-sm xl:text-base"}`}>{field.label}</label>
                </div>
                <div
                  className={`w-[90px] h-[18px] flex items-center justify-center rounded-4xl ${bgcolor(
                    statusState[field.name]
                  )}`}
                >
                  <p className="text-[11px]">{statusState[field.name]}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {(field.options || ["Yes", "No", "Processing", "N/R"])
                  .filter((opt) => opt !== "Open" || isSuperAdmin)
                  .map((opt) => (
                    <label key={opt} className={`flex items-center gap-2 cursor-pointer text-sm xl:text-base ${isDangerField ? "px-3 py-1.5 rounded-lg border border-red-100 bg-white hover:bg-red-50 transition-colors" : ""}`}>
                      <input
                        type="radio"
                        checked={
                          normalizeValue(formState[field.name]) ===
                          normalizeValue(opt)
                        }
                        onChange={() => handleChange(field.name, opt)}
                        className={isDangerField ? "accent-red-600 w-4 h-4" : ""}
                      />
                      <span className={isDangerField ? "font-medium text-red-900" : ""}>{opt}</span>
                    </label>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="w-full">
              <label className="font-bold block mb-2 text-sm xl:text-base">{field.label}</label>
              <input
                type="text"
                value={formState[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="border rounded p-2 w-full bg-gray-100 text-sm xl:text-base"
              />
            </div>
          )}
        </div>
      )})}

      {currentModule === "commercial" ? (
        <>
          <div className="mt-5">
            <label className="font-bold text-sm xl:text-base">System Note for Client</label>
            <input
              disabled
              value={generateSystemNote("main")}
              className="w-full rounded p-2 bg-gray-100 text-sm xl:text-base"
            />
          </div>
          <div className="mt-5">
            <label className="font-bold text-sm xl:text-base">Comment for Client</label>
            <textarea
              value={noteForClient}
              onChange={(e) => {
                setNoteForClient(e.target.value);
                setHasChanges(true);
              }}
              className="w-full rounded p-2 bg-gray-100 text-sm xl:text-base"
            />
          </div>
        </>
      ) : (
        currentConfig.noteGroups.map((group) => (
          <div key={group.id}>
            <div className="mt-5">
              <label className="font-bold text-sm xl:text-base">{group.systemNoteLabel}</label>
              <input
                disabled
                value={generateSystemNote(group.id)}
                className="w-full rounded p-2 bg-gray-100 text-sm xl:text-base"
              />
            </div>
            <div className="mt-5">
              <label className="font-bold text-sm xl:text-base">{group.clientCommentLabel}</label>
              <textarea
                value={formState[group.clientCommentKey] || ""}
                onChange={(e) =>
                  handleChange(group.clientCommentKey, e.target.value)
                }
                className="w-full rounded p-2 bg-gray-100 text-sm xl:text-base"
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
          <Button
            label={isSaving ? "Saving..." : "Save"}
            width="w-[100px] md:w-[100px]"
            bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
            onClick={handleSave}
            disabled={isSaving}
          />
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
        onClose={() => {
            setIsModalOpen(false);
            setPendingCloseMatter(null);
        }}
        onConfirm={() => {
            if (pendingCloseMatter) {
                // Apply the pending value
                setFormState((prev) => ({ ...prev, closeMatter: pendingCloseMatter }));
                setStatusState((prev) => ({ ...prev, closeMatter: getStatus(pendingCloseMatter) }));
                setHasChanges(true);
                setIsModalOpen(false);
                setPendingCloseMatter(null);
            }
        }}
        title={pendingCloseMatter === "Open" ? "Confirm Matter Reopen" : "Confirm Matter Closure"}
        message={
          pendingCloseMatter === "Completed"
            ? "Are you sure you want to mark this matter as Completed?  This action will archive the matter."
            : pendingCloseMatter === "Cancelled"
            ? "Are you sure you want to mark this matter as Cancelled? This action cannot be undone."
            : "Are you sure you want to reopen this matter? This will restore it to an active status."
        }
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
  setHasChanges: PropTypes.func.isRequired,
};
