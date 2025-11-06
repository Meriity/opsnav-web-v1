import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button"; // Corrected path
import ClientAPI from "@/api/clientAPI"; // Corrected path
import CommercialAPI from "@/api/commercialAPI"; // Corrected path
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";

// --- Configuration Object for Stage 3 ---
// NOTE: Your config had `key` but the code used `field.name`. I've standardized on `key`.
const formConfig = {
  vkl: {
    fields: [
      {
        key: "titleSearch",
        label: "Title Search",
        type: "radio",
        hasDate: true,
      },
      { key: "planImage", label: "Plan Image", type: "radio" },
      { key: "landTax", label: "Land Tax", type: "radio" },
      { key: "instrument", label: "Instrument", type: "radio" },
      { key: "rates", label: "Rates", type: "radio" },
      { key: "water", label: "Water", type: "radio" },
      { key: "ownersCorp", label: "Owners Corp", type: "radio" },
      { key: "pexa", label: "PEXA", type: "radio" },
      { key: "inviteBank", label: "Invite Bank", type: "radio" },
    ],
  },
  idg: {
    fields: [
      { key: "boardsPrinted", label: "Boards Printed", type: "radio" },
      { key: "packaged", label: "Packaged", type: "radio" },
      {
        key: "qualityCheckPassed",
        label: "Quality Check Passed",
        type: "radio",
      },
      {
        key: "onsiteStickersApplied",
        label: "Apply On-Site Stickers",
        type: "radio",
      },
      { key: "finalStatus", label: "Update Status", type: "text" },
      {
        key: "invoiceGenerated",
        label: "Generate and send Invoice",
        type: "radio",
      },
    ],
  },
  commercial: {
    fields: [
      { key: "ppsrSearch", label: "PPSR Search", type: "radio" },
      { key: "asicSearch", label: "ASIC Search", type: "radio" },
      { key: "ratesSearch", label: "Rates Search", type: "radio" },
      { key: "waterSearch", label: "Water Search", type: "radio" },
      { key: "title", label: "Title", type: "radio" },
    ],
  },
};

export default function Stage3({
  changeStage,
  data,
  stageNumber = 3,
  onStageUpdate,
}) {
  const stage = 3;
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();
  const originalData = useRef({});

  // --- State ---
  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [noteForClient, setNoteForClient] = useState("");
  // isLoading and isSaving are now handled by React Query

  useEffect(() => {
    // Check if we have a success message stored from before refresh
    const wasSuccess = localStorage.getItem("stage3_save_success");
    if (wasSuccess === "true") {
      // Show success toast with longer autoClose
      toast.success("Stage 3 Saved Successfully!", {
        autoClose: 3000, // Show for 3 seconds
        hideProgressBar: false,
      });
      // Clear the stored message
      localStorage.removeItem("stage3_save_success");
    }
  }, []);

  // --- Memoized Values ---
  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  // Get the correct field configuration
  const fields = useMemo(() => {
    if (currentModule === "commercial") {
      return formConfig.commercial.fields;
    } else if (company === "vkl") {
      return formConfig.vkl.fields;
    } else if (company === "idg") {
      return formConfig.idg.fields;
    }
    return []; // Default empty
  }, [currentModule, company]);

  // --- Callback Helpers ---
  const normalizeValue = useCallback((v) => {
    if (v === undefined || v === null) return "";
    return String(v)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  }, []);

  const getStatus = useCallback(
    (value) => {
      const val = normalizeValue(value);
      if (!val) return "Not Completed";
      const completedValues = ["yes", "na", "n/a", "nr", "n/r"];
      if (completedValues.includes(val)) {
        return "Completed";
      }
      if (val === "no") return "Not Completed";
      if (["processing", "inprogress", "in progress"].includes(val))
        return "In Progress";
      // For IDG text fields, any value means "Completed"
      if (company === "idg" && val) return "Completed";
      return "Not Completed";
    },
    [normalizeValue, company]
  );

  const bgcolor = (status) => {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  };

  const generateSystemNote = useCallback(() => {
    const greenValues = new Set(["yes", "nr", "na", "n/a", "n/r"]);
    const notReceived = fields
      .filter((field) => {
        // For IDG text fields, empty = not received
        if (
          field.type === "text" &&
          (!formState[field.key] || formState[field.key].trim() === "")
        ) {
          return true;
        }
        // For radio fields
        if (field.type === "radio") {
          return !greenValues.has(normalizeValue(formState[field.key] || ""));
        }
        return false;
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not received`;
  }, [fields, formState, normalizeValue]);

  // --- Data Fetching with useQuery ---
  const fetchStageData = useCallback(async () => {
    if (!data) return null;
    let stageData = data;

    if (currentModule === "commercial") {
      try {
        const stageResponse = await commercialApi.getStageData(3, matterNumber);
        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log(
          "No existing stage 3 data found for commercial, using base"
        );
      }
    } else if (data.stages && Array.isArray(data.stages)) {
      // For VKL/IDG, find the stage 3 data
      const stage3Data = data.stages.find((stage) => stage.stageNumber === 3);
      if (stage3Data) {
        stageData = { ...data, ...stage3Data }; // Merge with base
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 3, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
  });

  // --- Effect to Populate Form from Query Data ---
  useEffect(() => {
    if (!stageData) return;

    try {
      const newFormState = {};
      const newStatusState = {};
      let loadedSystemNote = "";
      let loadedClientComment = "";

      fields.forEach(({ key, hasDate, type }) => {
        const rawValue = stageData[key] || "";
        // Don't normalize text fields on load
        newFormState[key] =
          type === "radio" ? normalizeValue(rawValue) : rawValue;
        newStatusState[key] = getStatus(newFormState[key]);

        if (hasDate) {
          newFormState[`${key}Date`] = stageData[`${key}Date`]
            ? stageData[`${key}Date`].split("T")[0]
            : "";
        }
      });

      if (currentModule === "commercial") {
        loadedSystemNote = stageData.noteForSystem || "";
        loadedClientComment = stageData.noteForClient || "";
      } else {
        const noteParts = (stageData.noteForClient || "").split(" - ");
        loadedSystemNote = noteParts[0]?.trim() || "";
        loadedClientComment = noteParts.length > 1 ? noteParts[1].trim() : "";
      }

      setFormState(newFormState);
      setStatusState(newStatusState);
      setNoteForClient(loadedClientComment);

      originalData.current = {
        ...newFormState,
        noteForSystem: loadedSystemNote,
        noteForClient: loadedClientComment,
      };
    } catch (error) {
      console.error("Error initializing form data:", error);
      toast.error("Failed to load stage data");
    }
  }, [stageData, fields, getStatus, normalizeValue, currentModule]);

  // --- Change Handlers ---
  const handleChange = (key, value) => {
    const fieldConfig = fields.find((f) => f.key === key);
    let processedValue = value;

    // Only normalize radio buttons
    if (
      fieldConfig &&
      fieldConfig.type === "radio" &&
      typeof processedValue === "string"
    ) {
      processedValue = normalizeValue(processedValue);
    }

    setFormState((prev) => ({ ...prev, [key]: processedValue }));
    setStatusState((prev) => ({ ...prev, [key]: getStatus(processedValue) }));
  };

  const isChanged = () => {
    const currentSystemNote = generateSystemNote();
    const original = originalData.current;
    if (!original) return false;

    const formChanged = fields.some(
      ({ key }) =>
        String(formState[key] || "").trim() !==
        String(original[key] || "").trim()
    );
    const dateChanged = fields.some(
      ({ key, hasDate }) =>
        hasDate &&
        String(formState[`${key}Date`] || "").trim() !==
          String(original[`${key}Date`] || "").trim()
    );
    const noteForClientChanged =
      String(noteForClient).trim() !== String(original.noteForClient).trim();

    // Compare generated note to the *loaded* system note
    const noteForSystemChanged = currentSystemNote !== original.noteForSystem;

    return (
      formChanged || dateChanged || noteForClientChanged || noteForSystemChanged
    );
  };

  // --- Data Saving with useMutation ---
  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      let apiResponse;
      if (currentModule === "commercial") {
        apiResponse = await commercialApi.upsertStage(3, matterNumber, payload);
      } else if (company === "vkl") {
        apiResponse = await api.upsertStageThree(payload);
      } else if (company === "idg") {
        apiResponse = await api.upsertIDGStages(matterNumber, 3, payload);
      }
      return apiResponse;
    },
    onSuccess: (responseData, payload) => {
      // Store success message in localStorage before refresh
      localStorage.setItem("stage3_save_success", "true");
      // Store current stage to persist after refresh
      localStorage.setItem("current_stage", "3");
      queryClient.invalidateQueries({
        queryKey: ["stageData", 3, matterNumber, currentModule],
      });

      queryClient.invalidateQueries({
        queryKey: ["clientData", matterNumber, company, currentModule],
      });
      // Update original data to reflect the new saved state
      originalData.current = {
        ...formState,
        noteForSystem: generateSystemNote(),
        noteForClient: noteForClient,
      };

      if (onStageUpdate) {
        console.log("Notifying parent about stage update:", payload);
        onStageUpdate(payload, stageNumber);
      }

      setTimeout(() => {
        console.log("Refreshing page to update progress status...");
        window.location.reload();
      }, 1000);
    },
    onError: (err) => {
      console.error("=== SAVE ERROR ===", err);
      let errorMessage = "Failed to save Stage 3. Please try again.";
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

    let payload = { ...formState };
    const systemNote = generateSystemNote();

    // Calculate color status
    const allCompleted = fields.every(
      (field) => getStatus(formState[field.key]) === "Completed"
    );
    const colorStatus = allCompleted ? "green" : "amber";
    payload.colorStatus = colorStatus;

    if (currentModule === "commercial") {
      const commercialFields = fields.map((f) => f.key);
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
      // For VKL/IDG
      const fullNote = noteForClient
        ? `${systemNote} - ${noteForClient}`
        : systemNote;
      payload.noteForClient = fullNote;

      // handle dates: send null if empty
      fields.forEach(({ key, hasDate }) => {
        if (hasDate) {
          const dateKey = `${key}Date`;
          payload[dateKey] =
            formState[dateKey] && String(formState[dateKey]).trim() !== ""
              ? formState[dateKey]
              : null;
        }
      });

      if (company === "vkl") {
        payload.matterNumber = matterNumber;
      } else if (company === "idg") {
        payload.orderId = matterNumber;
      }
    }

    console.log("=== SAVE PAYLOAD ===", payload);
    saveStage(payload);
  }

  const renderRadioGroup = ({ key, label, hasDate, type = "radio" }) => (
    <div className="mt-5" key={key}>
      <div className="flex gap-4 items-center justify-between mb-3">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {label}
        </label>
        {type !== "text" && type !== "image" && (
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statusState[key]
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[10px] md:text-[12px] whitespace-nowrap">
              {statusState[key]}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-start gap-x-8 gap-y-2 items-center">
        {type === "text" ? (
          <input
            type="text"
            name={key}
            value={formState[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="border rounded-md p-2 text-sm md:text-base w-full"
          />
        ) : (
          ["Yes", "No", "Processing", "N/R"].map((val) => (
            <label
              key={val}
              className="flex items-center gap-2 text-sm md:text-base"
            >
              <input
                type="radio"
                name={key}
                value={val}
                checked={
                  normalizeValue(formState[key] || "") === normalizeValue(val)
                }
                onChange={() => handleChange(key, val)}
              />
              {val}
            </label>
          ))
        )}
        {hasDate && (
          <input
            type="date"
            value={formState[`${key}Date`] || ""}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                [`${key}Date`]: e.target.value,
              }))
            }
            className="border p-1 rounded text-md"
          />
        )}
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
      {fields.map(renderRadioGroup)}

      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          System Note for Client
        </label>
        <input
          type="text"
          value={generateSystemNote()} // Always display the generated note
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

      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
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

Stage3.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  stageNumber: PropTypes.number,
  onStageUpdate: PropTypes.func,
};
