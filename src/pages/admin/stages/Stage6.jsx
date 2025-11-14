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
      {
        name: "council",
        label: "Council",
        type: "text",
      },
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
      {
        name: "invoiced",
        label: "Invoiced",
        type: "radio",
      },
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

export default function Stage6({
  changeStage,
  data,
}) {
  const stage = 6;
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteForClient, setNoteForClient] = useState("");


  useEffect(() => {
    const wasSuccess = localStorage.getItem("stage6_save_success");
    if (wasSuccess === "true") {
      toast.success("Stage 6 Saved Successfully!", {
        autoClose: 3000,
        hideProgressBar: false,
      });
      localStorage.removeItem("stage6_save_success");
    }
  }, []);

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
          if (field.type === "text" && value !== "") {
            return false;
          }
          if (field.type === "radio" && greenValues.has(value)) {
            return false;
          }
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
  });

  useEffect(() => {
    if (!stageData) return;

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
            const norm = normalizeValue(rawVal);
            if (
              [
                "yes",
                "true",
                "closed",
                "complete",
                "completed",
                "done",
              ].includes(norm)
            ) {
              val = "Completed";
            } else if (
              ["cancel", "cancelled", "canceled", "void"].includes(norm)
            ) {
              val = "Cancelled";
            }
          }
          initialFormData[field.name] = normalizeValue(val);
        } else {

          initialFormData[field.name] = rawVal;
        }
        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
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
        currentConfig.noteGroups.forEach((group) => {
          const noteString = stageData[group.noteForClientKey] || "";
          const noteParts = noteString.split(" - ");
          loadedSystemNote = noteParts[0]?.trim() || "";
          loadedClientComment = noteParts.length > 1 ? noteParts[1].trim() : "";
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
    } catch (error) {
      toast.error("Failed to load stage data");
    }
  }, [stageData, currentConfig, currentModule]);

  const handleChange = useCallback(
    (field, value) => {
      const fieldConfig = currentConfig.fields.find((f) => f.name === field);
      let processedValue = value;

      if (fieldConfig && fieldConfig.type === "radio") {
        processedValue = normalizeValue(processedValue);
        setStatuses((prev) => ({
          ...prev,
          [field]: getStatus(processedValue),
        }));
      } else {
        setStatuses((prev) => ({
          ...prev,
          [field]: getStatus(processedValue),
        }));
      }

      setFormData((prev) => ({ ...prev, [field]: processedValue }));
    },
    [currentConfig]
  );

  const isChanged = () => {
    const original = originalData.current;
    if (!original.formData) return false;

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
      let apiResponse;
      if (currentModule === "commercial") {
        apiResponse = await commercialApi.upsertStage(6, matterNumber, payload);
      } else if (company === "vkl") {
        apiResponse = await api.upsertStageSix(payload);
      } else if (company === "idg") {
        apiResponse = await api.upsertIDGStages(matterNumber, 6, payload);
      }
      return apiResponse;
    },
    onSuccess: () => {
      localStorage.setItem("stage6_save_success", "true");
      localStorage.setItem("current_stage", "6");

      setIsModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["stageData", 6, matterNumber, currentModule],
      });
      reloadArchivedClients(); 

      const currentClientNote =
        currentModule === "commercial"
          ? noteForClient
          : formData.clientComment || "";
      originalData.current = {
        formData: { ...formData },
        noteForClient: currentClientNote,
        noteForSystem: generateSystemNote("main"),
      };

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (err) => {
      setIsModalOpen(false);
      let errorMessage = "Failed to save Stage 6. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    },
  });

  const buildAndSavePayload = () => {
    let payload = { ...formData };
    const systemNote = generateSystemNote("main");

    const allCompleted = currentConfig.fields.every(
      (field) => getStatus(formData[field.name]) === "Completed"
    );
    const colorStatus = allCompleted ? "green" : "amber";
    payload.colorStatus = colorStatus;

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
        const clientComment = formData[group.systemNoteKey] || "";
        payload[group.noteForClientKey] = clientComment
          ? `${systemNote} - ${clientComment}`
          : systemNote;
        delete payload[group.systemNoteKey];
      });

      if (company === "vkl") {
        payload.matterNumber = matterNumber;
      } else if (company === "idg") {
        payload.orderId = matterNumber;
      }
    }
    saveStage(payload);
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
