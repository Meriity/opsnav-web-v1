import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function Stage5({ changeStage, data, onStageUpdate }) {
  const stage = 5;
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [noteForClient, setNoteForClient] = useState("");

  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  const currentConfig = useMemo(() => {
    if (currentModule === "commercial") {
      return formConfig.commercial;
    } else if (company === "vkl") {
      return formConfig.vkl;
    } else if (company === "idg") {
      return formConfig.idg;
    }
    return formConfig.vkl;
  }, [currentModule, company]);

  const generateSystemNote = useCallback(
    (noteGroupId) => {
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
    },
    [currentConfig, formData]
  );

  const fetchStageData = useCallback(async () => {
    if (!data) return null;
    let stageData = data;

    if (currentModule === "commercial") {
      try {
        const stageResponse = await commercialApi.getStageData(5, matterNumber);
        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log(
          "No existing stage 5 data found for commercial, using base"
        );
      }
    } else if (data.stages && Array.isArray(data.stages)) {
      const stage5Data = data.stages.find((stage) => stage.stageNumber === 5);
      if (stage5Data) {
        stageData = { ...data, ...stage5Data };
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 5, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
  });

  useEffect(() => {
    if (!stageData) return;

    try {
      const initialFormData = {};
      const initialStatuses = {};
      let loadedSystemNote = "";
      let loadedClientComment = "";

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
          initialStatuses[field.name] = getStatus(initialFormData[field.name]);
        } else if (field.type === "text") {
          initialFormData[field.name] = stageData[field.name] || "";
        } else {
          initialFormData[field.name] = stageData[field.name] || "";
        }
      });

      if (currentModule === "commercial") {
        const { systemNote, clientComment } = extractNotes(
          stageData.noteForSystem,
          stageData.noteForClient
        );
        loadedSystemNote = systemNote;
        loadedClientComment = clientComment;
        setNoteForClient(clientComment);
      } else {
        // Normalize the system note by removing trailing dashes
        currentConfig.noteGroups.forEach((group) => {
          const noteString = stageData[group.noteForClientKey] || "";
          // Split and clean up the note parts
          const noteParts = noteString
            .split(" - ")
            .filter((part) => part.trim() !== "");
          loadedSystemNote = noteParts[0]?.trim() || "";
          loadedClientComment =
            noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";
          initialFormData[group.clientCommentKey] = loadedClientComment;
        });
      }

      setFormData(initialFormData);
      setStatuses(initialStatuses);

      originalData.current = {
        formData: { ...initialFormData },
        noteForClient: loadedClientComment,
        noteForSystem: loadedSystemNote,
      };
    } catch (error) {
      toast.error("Failed to load stage data");
    }
  }, [stageData, currentConfig, currentModule]);

  const handleChange = (field, value) => {
    let processedValue = value;
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);

    if (fieldConfig && fieldConfig.type === "radio") {
      if (typeof processedValue === "string") {
        processedValue = normalizeValue(processedValue);
      }
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
  };

  const isChanged = () => {
    const original = originalData.current;
    if (!original || !original.formData) return false;

    // Check if any form field has changed
    const formChanged = currentConfig.fields.some((field) => {
      const currentValue = formData[field.name] || "";
      const originalValue = original.formData[field.name] || "";

      if (field.type === "radio") {
        return normalizeValue(currentValue) !== normalizeValue(originalValue);
      }

      return String(currentValue).trim() !== String(originalValue).trim();
    });

    // Check client note changes
    let clientNoteChanged = false;
    if (currentModule === "commercial") {
      const currentNote = noteForClient || "";
      const originalNote = original.noteForClient || "";
      clientNoteChanged =
        String(currentNote).trim() !== String(originalNote).trim();
    } else {
      // For VKL/IDG, check each note group
      clientNoteChanged = currentConfig.noteGroups.some((group) => {
        const currentNote = formData[group.clientCommentKey] || "";
        const originalNote = original.formData[group.clientCommentKey] || "";
        return String(currentNote).trim() !== String(originalNote).trim();
      });
    }

    // Check system note changes - only if form fields have actually changed
    const currentSystemNote = generateSystemNote("main");
    const originalSystemNote = original.noteForSystem || "";

    // Normalize system notes for comparison (remove trailing dashes/spaces)
    const normalizeSystemNote = (note) => {
      if (!note) return ""; // Handle undefined/null
      return note.replace(/\s*-+\s*$/, "").trim(); // Remove trailing dashes and spaces
    };

    const systemNoteChanged =
      normalizeSystemNote(currentSystemNote) !==
        normalizeSystemNote(originalSystemNote) && formChanged; // Only consider system note changed if form fields actually changed

    console.log("Stage5 Change detection:", {
      formChanged,
      clientNoteChanged,
      systemNoteChanged,
      currentSystemNote: normalizeSystemNote(currentSystemNote),
      originalSystemNote: normalizeSystemNote(originalSystemNote),
      formData,
      originalFormData: original.formData,
    });

    return formChanged || clientNoteChanged || systemNoteChanged;
  };

  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      let apiResponse;
      if (currentModule === "commercial") {
        apiResponse = await commercialApi.upsertStage(5, matterNumber, payload);
      } else if (company === "vkl") {
        apiResponse = await api.upsertStageFive(payload);
      } else if (company === "idg") {
        apiResponse = await api.upsertIDGStages(matterNumber, 5, payload);
      }
      return apiResponse;
    },
    onSuccess: (responseData, payload) => {
      // Normalize server response
      const res = responseData?.data || responseData;

      localStorage.setItem("current_stage", "5");

      const companyKey = localStorage.getItem("company") || company;
      const currentModuleKey =
        localStorage.getItem("currentModule") || currentModule;

      try {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, currentModuleKey],
          (old) => {
            if (!old) return res;
            return { ...old, ...res };
          }
        );
      } catch (e) {
        // Fallback: ensure clientData refetches in background if merge fails
        queryClient.invalidateQueries([
          "clientData",
          matterNumber,
          companyKey,
          currentModuleKey,
        ]);
      }

      // Keep only this stage's data in sync (refetch stageData in background)
      try {
        queryClient.invalidateQueries({
          queryKey: ["stageData", 5, matterNumber, currentModuleKey],
        });
      } catch (e) {
        // ignore
      }

      try {
        toast.success("Stage 5 Saved Successfully!", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      } catch (e) {
        // non-critical: swallow toast errors
      }

      // Keep local snapshot so UI remains stable while user navigates stages
      const currentClientNote =
        currentModule === "commercial"
          ? noteForClient
          : formData.clientComment || "";
      originalData.current = {
        formData: { ...formData },
        noteForClient: currentClientNote,
        noteForSystem: generateSystemNote("main"),
      };

      try {
        const savedStage =
          res?.stage5 || res?.stage || res?.data || res || payload || {};
        if (typeof onStageUpdate === "function") {
          onStageUpdate(savedStage, 5);
        }
      } catch (e) {}
    },
    onError: (err) => {
      let errorMessage = "Failed to save Stage 5. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    },
  });

  async function handleSave() {
    if (!isChanged() || isSaving) return;

    let payload = { ...formData };
    const systemNote = generateSystemNote("main");

    const allCompleted = currentConfig.fields.every(
      (field) => getStatus(formData[field.name]) === "Completed"
    );
    const colorStatus = allCompleted ? "green" : "amber";

    if (currentModule === "commercial") {
      const commercialFields = currentConfig.fields.map((f) => f.name);
      const filteredPayload = {};
      commercialFields.forEach((field) => {
        if (payload[field] !== undefined) {
          filteredPayload[field] = payload[field];
        }
      });
      payload = filteredPayload;

      payload.noteForSystem = systemNote;
      payload.noteForClient = noteForClient || "";
      payload.colorStatus = colorStatus;
      payload.matterNumber = matterNumber;
    } else {
      currentConfig.noteGroups.forEach((group) => {
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] =
          `${systemNote} - ${clientComment}`.trim();
        delete payload[group.clientCommentKey];
      });

      currentConfig.fields.forEach((field) => {
        if (field.type === "number") {
          payload[field.name] =
            payload[field.name] === "" ? null : Number(payload[field.name]);
        }
      });

      if (company === "vkl") {
        payload.matterNumber = matterNumber;
      } else if (company === "idg") {
        payload.orderId = matterNumber;
      }
    }

    saveStage(payload);
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
  onStageUpdate: PropTypes.func,
};
