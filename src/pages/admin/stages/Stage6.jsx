import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useArchivedClientStore } from "../../ArchivedClientStore/UseArchivedClientStore";

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

export default function Stage6({ changeStage, data, onStageUpdate }) {
  const stage = 6;
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();
  const originalData = useRef({});
  const hasLoadedData = useRef(false);

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteForClient, setNoteForClient] = useState("");

  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  const currentConfig = useMemo(() => {
    if (currentModule === "commercial") return formConfig.commercial;
    if (company === "vkl") return formConfig.vkl;
    if (company === "idg") return formConfig.idg;
    return formConfig.vkl;
  }, [currentModule, company]);

  const modalField = useMemo(
    () => currentConfig.fields.find((f) => f.triggersModal),
    [currentConfig]
  );

  const reloadArchivedClients = useArchivedClientStore(
    (s) => s.reloadArchivedClients
  );

  const generateSystemNote = useCallback(
    (noteGroupId) => {
      const noteGroup = currentConfig.noteGroups.find(
        (ng) => ng.id === noteGroupId
      );
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
          const value = normalizeValue(formData[field.name] || "");
          if (field.type === "text" && value !== "") return false;
          if (field.type === "radio" && greenValues.has(value)) return false;
          return true;
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
        const stageResponse = await commercialApi.getStageData(6, matterNumber);
        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log(
          "No existing stage 6 data found for commercial, using base"
        );
      }
    } else if (data.stages && Array.isArray(data.stages)) {
      const stage6Data = data.stages.find((stage) => stage.stageNumber === 6);
      if (stage6Data) {
        stageData = { ...data, ...stage6Data };
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 6, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    console.log("Stage6 - Data loading check:", {
      hasStageData: !!stageData,
      formDataKeys: Object.keys(formData),
      stageDataKeys: stageData ? Object.keys(stageData) : [],
    });

    if (!stageData || isLoading || hasLoadedData.current) return;

    try {
      const initialFormData = {};
      const initialStatuses = {};

      let loadedSystemNote = "";
      let loadedClientComment = "";

      currentConfig.fields.forEach((field) => {
        const rawVal = stageData[field.name] ?? "";

        if (field.type === "radio") {
          let val = rawVal;

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
            } else {
              // keep empty string so radio isn't preselected with a non-matching token
              val = "";
            }
          } else {
            // For regular radio fields, normalize but preserve the option text
            val = normalizeValue(rawVal);
            // Map normalized values back to display options
            if (val === "yes") val = "Yes";
            else if (val === "no") val = "No";
            else if (["processing", "inprogress"].includes(val))
              val = "Processing";
            else if (["nr", "n/r"].includes(val)) val = "N/R";
            else val = rawVal; // Fallback to original value
          }
          initialFormData[field.name] = val;
        } else {
          initialFormData[field.name] =
            rawVal === null || rawVal === undefined ? "" : String(rawVal);
        }

        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
      });

      console.log("Stage6 - Loaded form data:", initialFormData);
      console.log("Stage6 - Loaded statuses:", initialStatuses);

      if (currentModule === "commercial") {
        const { systemNote, clientComment } = extractNotes(
          stageData.noteForSystem,
          stageData.noteForClient
        );
        loadedSystemNote = systemNote;
        loadedClientComment = clientComment;
        setNoteForClient(clientComment);
      } else {
        currentConfig.noteGroups.forEach((group) => {
          const noteString = stageData[group.noteForClientKey] || "";
          const noteParts = noteString
            .split(" - ")
            .filter((part) => part.trim() !== "");
          loadedSystemNote = noteParts[0]?.trim() || "";
          loadedClientComment =
            noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";
          initialFormData[group.systemNoteKey] = loadedClientComment;
        });
      }

      setFormData(initialFormData);
      setStatuses(initialStatuses);

      originalData.current = {
        formData: { ...initialFormData },
        noteForClient: loadedClientComment,
        noteForSystem: loadedSystemNote,
      };
      hasLoadedData.current = true;
    } catch (error) {
      console.error("Stage6 - Error loading data:", error);
      toast.error("Failed to load stage data");
    }
  }, [stageData, currentConfig, currentModule]);

  // Reset loaded data flag when matterNumber changes
  useEffect(() => {
    return () => {
      hasLoadedData.current = false;
    };
  }, [matterNumber]);

  const handleChange = useCallback(
    (field, value) => {
      const fieldConfig = currentConfig.fields.find((f) => f.name === field);
      console.log(`Stage6 - Changing ${field} to:`, value);

      let processedValue = value;

      if (fieldConfig && fieldConfig.type === "radio") {
        // For radio buttons, store the exact option value
        processedValue = value;
        setStatuses((prev) => ({
          ...prev,
          [field]: getStatus(processedValue),
        }));
      } else {
        // For text fields
        setStatuses((prev) => ({
          ...prev,
          [field]: getStatus(processedValue),
        }));
      }

      setFormData((prev) => {
        const newData = { ...prev, [field]: processedValue };
        console.log(`Stage6 - New form data for ${field}:`, newData[field]);
        return newData;
      });
    },
    [currentConfig]
  );

  const isChanged = () => {
    const original = originalData.current || {};
    if (!original.formData) {
      const hasFormValues = Object.keys(formData || {}).some(
        (k) => formData[k] !== undefined && formData[k] !== ""
      );
      const currentClientNote =
        currentModule === "commercial" ? noteForClient : formData.clientComment || "";
      const hasClientNote = !!(
        currentClientNote && currentClientNote.trim() !== ""
      );
      const systemNoteChanged = generateSystemNote("main") !== "";

      return hasFormValues || hasClientNote || systemNoteChanged;
    }

    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(original.formData);
    const currentClientNote =
      currentModule === "commercial"
        ? noteForClient
        : formData.clientComment || "";
    const clientNoteChanged = currentClientNote !== original.noteForClient;
    const systemNoteChanged =
      generateSystemNote("main") !== original.noteForSystem;

    return formChanged || clientNoteChanged || systemNoteChanged;
  };

  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      const normalizePrimitives = (obj) => {
        const out = {};
        Object.keys(obj || {}).forEach((k) => {
          const v = obj[k];
          if (v === undefined) {
            out[k] = null;
          } else if (
            v === null ||
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
          ) {
            out[k] = v;
          } else {
            out[k] = typeof v.toString === "function" ? String(v) : null;
          }
        });
        return out;
      };

      try {
        let apiResponse;
        const safePayload = normalizePrimitives(payload);

        if (currentModule === "commercial") {
          apiResponse = await commercialApi.upsertStage(
            6,
            matterNumber,
            safePayload
          );
        } else if (company === "vkl") {
          apiResponse = await api.upsertStageSix(safePayload);
        } else if (company === "idg") {
          apiResponse = await api.upsertIDGStages(matterNumber, 6, safePayload);
        }
        return apiResponse;
      } catch (e) {
        console.error(
          "Stage6 mutation failed while sending payload:",
          e,
          payload
        );
        throw e;
      }
    },

    onSuccess: (res, payload) => {
      localStorage.setItem("current_stage", "6");

      const companyKey = localStorage.getItem("company") || company;
      const currentModuleKey =
        localStorage.getItem("currentModule") || currentModule;

      // 1) Update the clientData cache used by StagesLayout for instant UI updates
      try {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, currentModuleKey],
          (old) => {
            const stageProp = `stage${stage}`;

            const stagePayload =
              (res && (res[stageProp] || res.stageData)) ||
              (res &&
                Object.keys(res).reduce((acc, key) => {
                  if (
                    currentConfig.fields.some((field) => field.name === key) ||
                    key === "colorStatus" ||
                    key === "noteForClient" ||
                    key === "noteForSystem"
                  ) {
                    acc[key] = res[key];
                  }
                  return acc;
                }, {}));

            if (!old) {
              const base = { ...(res || {}) };
              base[stageProp] = { ...(stagePayload || {}) };
              return base;
            }

            const merged = { ...old };
            merged[stageProp] = {
              ...(old[stageProp] || {}),
              ...(stagePayload || {}),
            };

            if (payload.colorStatus && merged[stageProp]) {
              merged[stageProp].colorStatus = payload.colorStatus;
            }

            return merged;
          }
        );
      } catch (e) {
        queryClient.invalidateQueries([
          "clientData",
          matterNumber,
          companyKey,
          currentModuleKey,
        ]);
      }

      const systemNote = generateSystemNote("main");
      originalData.current = {
        formData: { ...formData },
        noteForClient:
          currentModule === "commercial"
            ? noteForClient
            : formData.clientComment || "",
        noteForSystem: systemNote,
      };

      // 2) Update the view/list cache so any listing showing the color/status updates
      try {
        queryClient.setQueryData(["viewClients", currentModuleKey], (list) => {
          if (!Array.isArray(list)) return list;
          return list.map((c) => {
            if (String(c.matterNumber) !== String(matterNumber)) return c;
            const updated = { ...c };
            if (payload.colorStatus) {
              updated.stage6 = updated.stage6
                ? { ...updated.stage6, colorStatus: payload.colorStatus }
                : { colorStatus: payload.colorStatus };
            }
            if (currentModuleKey === "commercial" && payload.colorStatus) {
              updated.colorStatus = payload.colorStatus;
            }
            return updated;
          });
        });
      } catch (err) {
        queryClient.invalidateQueries(["viewClients", currentModuleKey]);
      }

      try {
        queryClient.setQueryData(
          ["stageData", 6, matterNumber, currentModuleKey],
          (old) => {
            const updatedStageData = { ...(old || {}) };

            // Update all fields from payload
            Object.keys(payload).forEach((key) => {
              if (payload[key] !== undefined) {
                updatedStageData[key] = payload[key];
              }
            });

            // Ensure all config fields have values (even if empty)
            currentConfig.fields.forEach((field) => {
              if (updatedStageData[field.name] === undefined) {
                updatedStageData[field.name] = old?.[field.name] || "";
              }
            });

            return updatedStageData;
          }
        );
      } catch (e) {}

      setIsModalOpen(false);

      try {
        toast.success("Stage 6 Saved Successfully!", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      } catch (e) {}

      const statusMap = {
        green: "Completed",
        red: "Not Completed",
        amber: "In Progress",
      };
      const newStatus = statusMap[payload.colorStatus] || "Not Completed";

      try {
        const reported = payload || {};
        if (!reported.colorStatus && res && res.colorStatus)
          reported.colorStatus = res.colorStatus;
        if (onStageUpdate) {
          try {
            onStageUpdate({ ...payload, colorStatus: payload.colorStatus }, 6);
          } catch (e) {}
        }
      } catch (err) {}

      const currentStatuses = JSON.parse(
        localStorage.getItem("stageStatuses") || "{}"
      );
      currentStatuses[`status6`] = newStatus;
      localStorage.setItem("stageStatuses", JSON.stringify(currentStatuses));
    },
    onError: (err) => {
      setIsModalOpen(false);
      console.error("Error updating stage 6:", err);
      let errorMessage = "Failed to save Stage 6. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err?.toString) {
        errorMessage = err.toString();
      }
      toast.error(errorMessage);
    },
  });

  const buildAndSavePayload = () => {
    const systemNote = generateSystemNote("main");

    const allCompleted = currentConfig.fields.every(
      (field) => getStatus(formData[field.name]) === "Completed"
    );
    const colorStatus = allCompleted ? "green" : "amber";

    if (currentModule === "commercial") {
      // Build a tight payload containing *only* allowed keys for commercial endpoint.
      // Include all expected fields (use empty string if missing) so server won't accidentally remove keys.
      const filteredPayload = {};
      currentConfig.fields.forEach((f) => {
        const name = f.name;
        let value =
          formData[name] === undefined || formData[name] === null
            ? ""
            : formData[name];

        filteredPayload[name] = value;
      });

      // Attach notes / status / identifiers
      filteredPayload.noteForSystem = systemNote;
      filteredPayload.noteForClient = noteForClient || "";
      filteredPayload.colorStatus = colorStatus;
      filteredPayload.matterNumber = matterNumber;

      // Defensive: remove any accidental immutable or matter-level keys
      delete filteredPayload._id;
      delete filteredPayload.__v;
      delete filteredPayload.createdAt;
      delete filteredPayload.updatedAt;

      if (filteredPayload.closeMatter) {
        const cm = String(filteredPayload.closeMatter);
        if (["Completed", "completed", "complete", "done"].includes(cm)) {
          filteredPayload.closeMatter = "completed";
        } else if (
          ["Cancelled", "cancelled", "canceled", "cancel"].includes(cm)
        ) {
          filteredPayload.closeMatter = "cancelled";
        }
      }

      // Normalize primitives (avoid objects/arrays)
      const safePayload = {};
      Object.keys(filteredPayload).forEach((k) => {
        const v = filteredPayload[k];
        if (
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
        ) {
          safePayload[k] = v;
        } else {
          safePayload[k] = typeof v?.toString === "function" ? String(v) : "";
        }
      });

      console.debug("Stage6 - commercial payload (SAFE):", safePayload);
      saveStage(safePayload);
      return;
    }

    // Non-commercial flow: include noteGroups and matter identifiers
    const payload = { ...formData };
    currentConfig.noteGroups.forEach((group) => {
      const clientComment = formData[group.systemNoteKey] || "";
      payload[group.noteForClientKey] = clientComment
        ? `${systemNote} - ${clientComment}`
        : systemNote;
      delete payload[group.systemNoteKey];
    });

    payload.colorStatus = colorStatus;
    if (company === "vkl") {
      payload.matterNumber = matterNumber;
    } else if (company === "idg") {
      payload.orderId = matterNumber;
    }

    // normalize primitives
    const safePayload = {};
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      safePayload[k] =
        v === undefined || typeof v === "object"
          ? v === null
            ? null
            : String(v)
          : v;
    });

    console.debug("Stage6 - non-commercial payload:", safePayload);
    saveStage(safePayload);
  };

  async function handleSave() {
    if (!isChanged() || isSaving) return;

    if (modalField) {
      const originalValue = normalizeValue(
        originalData.current.formData?.[modalField.name] || ""
      );
      const currentValue = normalizeValue(formData[modalField.name] || "");

      if (currentValue && originalValue !== currentValue) {
        setIsModalOpen(true);
        return;
      }
    }

    buildAndSavePayload();
  }

  const handleModalConfirm = () => {
    buildAndSavePayload();
  };

  const renderField = (field) => {
    const options = field.options || ["Yes", "No", "Processing", "N/R"];

    // Debug logging for field rendering
    console.log(`Stage6 - Rendering field ${field.name}:`, {
      currentValue: formData[field.name],
      options: options,
    });

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
                  checked={String(formData[field.name] ?? "") === String(val)}
                  onChange={() => {
                    console.log(
                      `Stage6 - Radio selected: ${field.name} = ${val}`
                    );
                    handleChange(field.name, val);
                  }}
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
          onConfirm={handleModalConfirm}
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
};
