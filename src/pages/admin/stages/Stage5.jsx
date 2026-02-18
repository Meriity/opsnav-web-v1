import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

// Keep the exact same form configuration as before
const formConfig = {
  conveyancing: {
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
  "print media": {
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
        fieldsForNote: ["boardsPrinted", "packaged", "qualityCheckPassed"],
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
    // Commercial logic is slightly different, usually handled manually in render, but structure kept for consistency
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
  if (!val) return "Not Completed";
  if (["yes", "nr", "na", "n/a", "n/r"].includes(val)) return "Completed";
  if (val === "no") return "Not Completed";
  if (["processing", "inprogress", "in progress"].includes(val))
    return "In Progress";
  return "Not Completed";
};

const extractNotes = (noteForSystem = "", noteForClient = "") => {
  return {
    systemNote: noteForSystem || "",
    clientComment: noteForClient || "",
  };
};

export default function Stage5({
  changeStage,
  data,
  stageNumber = 5,
  setReloadTrigger,
  setHasChanges,
}) {
  const { matterNumber } = useParams();

  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [noteForClient, setNoteForClient] = useState(""); // For commercial main note or general use
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const originalData = useRef({});
  const hasLoaded = useRef(false);

  const currentModule = localStorage.getItem("currentModule");

  const currentConfig = formConfig[currentModule] || formConfig.conveyancing;
  const fields = currentConfig.fields;
  const noteGroups = currentConfig.noteGroups;

  // Load Data Effect
  useEffect(() => {
    if (!data || hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
      // We rely on 'data' passed from parent, similar to Stage 3.
      // If we needed to fetch more, we would do it here, but Stage 3 just uses `data`.

      // However, Stage 5 original code sometimes fetched specific stage data if 'data' wasn't enough?
      // Stage 3 code: just used `data` passed in prop.
      // Stage 5 original code: fetched if commercial, or used data.stages.find
      // For consistency and reliability, let's use the 'data' prop as the source of truth,
      // assuming the parent StagesLayout fetches the full object.
      // If the parent didn't fetch deep enough, we might miss data, but Stage 3 worked, so Stage 5 should too.
      // Let's stick to the props for now to match Stage 3.

      let stageData = data;

      // Commercial might need extra help if 'data' is the whole client object but not structured right?
      // Stage 3 had a commented out block for fetching.
      // We'll assume 'data' is the specific stage object or the client object containing it.
      // Actually, looking at StagesLayout, it passes `getStageData(stage)` which is the specific stage object.
      // So `data` IS the stage 5 data. Perfect.

      const newForm = {};
      const newStatus = {};
      let loadedClientComment = "";

      fields.forEach((f) => {
        const raw = stageData[f.name];
        if (f.type === "number") {
          const rawPrice = raw;
          newForm[f.name] =
            typeof rawPrice === "object" && rawPrice?.$numberDecimal
              ? rawPrice.$numberDecimal
              : rawPrice?.toString() ?? "";
        } else {
          newForm[f.name] = raw ?? "";
        }

        if (f.type === "radio") {
          newStatus[f.name] = getStatus(newForm[f.name]);
        }
      });

      if (currentModule === "commercial") {
        const { clientComment } = extractNotes(
          stageData.noteForSystem,
          stageData.noteForClient
        );
        loadedClientComment = clientComment || "";
        setNoteForClient(loadedClientComment);
      } else {
        // Standard conveyance/print media note parsing
        // Typically "System Note - Client Comment"
        noteGroups.forEach((group) => {
          const noteString = stageData[group.noteForClientKey] || "";
          const noteParts = noteString
            .split(" - ")
            .filter((p) => p.trim() !== "");
          // part[0] is system note, rest is client comment
          const clientComment =
            noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";

          // We store the client comment in formState for the specific group key
          newForm[group.clientCommentKey] = clientComment;
        });
      }

      setFormState(newForm);
      setStatusState(newStatus);

      originalData.current = {
        ...newForm,
        noteForClient: loadedClientComment, // For commercial
      };

      setIsLoading(false);
      setHasChanges(false);
    };

    load();
  }, [data, currentModule, fields, noteGroups]);

  const generateSystemNote = (groupId = "main") => {
    const noteGroup = noteGroups.find((ng) => ng.id === groupId);
    if (!noteGroup) return "";

    const green = new Set(["yes", "nr", "na", "n/a", "n/r"]);
    const fieldsToCheck = fields.filter((f) =>
      noteGroup.fieldsForNote.includes(f.name)
    );

    const missing = fieldsToCheck
      .filter((f) => {
        const val = normalizeValue(formState[f.name] || "");
        return !green.has(val);
      })
      .map((f) => f.label);

    return missing.length === 0
      ? "All tasks completed"
      : `Pending: ${missing.join(", ")}`;
  };

  const handleChange = (key, value) => {
    const field = fields.find((f) => f.name === key);
    let processed = value;

    // For radio, we might not normalize here, but we do need to update status
    // Stage 3 normalizes validation but keeps raw value in state?
    // Stage 3: setFormState(processed), setStatusState(getStatus(processed))

    // If it's a radio, we generally want to store it as the value passed (e.g. "Yes")
    // but verify status normalized.

    setFormState((prev) => ({ ...prev, [key]: processed }));
    setHasChanges(true);

    if (field?.type === "radio") {
      setStatusState((prev) => ({ ...prev, [key]: getStatus(processed) }));
    }
  };

  const isChanged = () => {
    const formChanged =
      JSON.stringify(formState) !== JSON.stringify(originalData.current);
    // Check commercial note separate state
    if (currentModule === "commercial") {
      return (
        formChanged ||
        noteForClient !== (originalData.current.noteForClient || "")
      );
    }
    return formChanged;
  };

  const handleSave = async () => {
    if (isSaving || !isChanged()) return;

    setIsSaving(true);

    let payload = { ...formState };
    const systemNote = generateSystemNote("main");

    // Calculate overall color status
    const allCompleted = fields.every(
      (f) => f.type !== "radio" || getStatus(formState[f.name]) === "Completed"
    );
    const colorStatus = allCompleted ? "green" : "amber";
    payload.colorStatus = colorStatus;

    if (currentModule === "commercial") {
      // Filter payload to only config fields
      const cleanPayload = {};
      fields.forEach((f) => {
        if (payload[f.name] !== undefined)
          cleanPayload[f.name] = payload[f.name];
      });

      cleanPayload.noteForSystem = systemNote;
      cleanPayload.noteForClient = noteForClient || "";
      cleanPayload.matterNumber = matterNumber;
      cleanPayload.colorStatus = colorStatus; // ensure color status is sent

      payload = cleanPayload;
    } else {
      // Standard modules
      noteGroups.forEach((group) => {
        const comment = payload[group.clientCommentKey] || "";
        // If system note says "Pending: ...", we combine.
        // format: "SystemNote - ClientComment"
        payload[group.noteForClientKey] = comment
          ? `${systemNote} - ${comment}`
          : systemNote;

        // cleanup temp keys
        delete payload[group.clientCommentKey];
      });

      // Number conversion
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.name] === "") {
          payload[f.name] = null;
        } else if (f.type === "number") {
          payload[f.name] = Number(payload[f.name]);
        }
      });

      if (currentModule === "print media") {
        payload.orderId = matterNumber;
      } else {
        payload.matterNumber = matterNumber;
      }
    }

    try {
      if (currentModule === "commercial") {
        await commercialApi.upsertStage(5, matterNumber, payload);
        // Commercial doesn't always return the full object structure needed for toast?
        // Assuming success if no throw.
      } else if (currentModule === "print media") {
        await api.upsertIDGStages(matterNumber, 5, payload);
      } else {
        await api.upsertStageFive(payload);
      }

      toast.success("Stage 5 Saved Successfully!");
      setReloadTrigger((p) => p + 1);

      // Update original data ref
      originalData.current = {
        ...formState,
        noteForClient:
          currentModule === "commercial" ? noteForClient : undefined,
      };
      setHasChanges(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save Stage 5.");
    }

    setIsSaving(false);
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
      {fields.map((f) => (
        <div key={f.name} className="mt-5">
          {f.type === "radio" ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-sm xl:text-base">{f.label}</label>
                <div
                  className={`w-[90px] h-[18px] flex items-center justify-center rounded-4xl ${
                    statusState[f.name] === "Completed"
                      ? "bg-[#00A506] text-white"
                      : statusState[f.name] === "In Progress"
                      ? "bg-[#FFEECF] text-[#FF9500]"
                      : "bg-[#FF0000] text-white"
                  }`}
                >
                  <p className="text-[11px]">{statusState[f.name]}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {["Yes", "No", "Processing", "N/R"].map((v) => (
                  <label key={v} className="flex gap-2 text-sm xl:text-base">
                    <input
                      type="radio"
                      checked={
                        normalizeValue(formState[f.name]) === normalizeValue(v)
                      }
                      onChange={() => handleChange(f.name, v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="w-full">
              <label className="font-bold block mb-2 text-sm xl:text-base">{f.label}</label>
              <input
                type={f.type === "number" ? "number" : "text"}
                value={formState[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                onKeyDown={(e) => {
                  if (
                    f.type === "number" &&
                    ["e", "E", "+", "-"].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`border rounded p-2 w-full bg-gray-100 text-sm xl:text-base ${
                  f.type === "number"
                    ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    : ""
                }`}
                step={f.type === "number" ? "0.01" : undefined}
                placeholder={f.type === "number" ? "0.00" : ""}
              />
            </div>
          )}
        </div>
      ))}

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
        noteGroups.map((group) => (
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
            width="w-[70px]  md:w-[100px]"
            bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
            onClick={() => changeStage(stageNumber + 1)}
          />
        </div>
      </div>
    </div>
  );
}

Stage5.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  stageNumber: PropTypes.number,
  setReloadTrigger: PropTypes.func.isRequired,
  setHasChanges: PropTypes.func.isRequired,
};
