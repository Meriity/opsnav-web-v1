import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function Stage3({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 3;
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const { matterNumber } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get company and module
  const company = localStorage.getItem("company") || "vkl";
  const currentModule = localStorage.getItem("currentModule");

  // FIXED: Proper field configuration logic
  let fields = [];
  if (currentModule === "commercial") {
    // COMMERCIAL MODULE FIELDS
    fields = [
      { key: "ppsrSearch", label: "PPSR Search", type: "radio" },
      { key: "asicSearch", label: "ASIC Search", type: "radio" },
      { key: "ratesSearch", label: "Rates Search", type: "radio" },
      { key: "waterSearch", label: "Water Search", type: "radio" },
      { key: "title", label: "Title", type: "radio" },
    ];
  } else if (company === "vkl") {
    // VKL COMPANY FIELDS
    fields = [
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
    ];
  } else if (company === "idg") {
    // IDG COMPANY FIELDS
    fields = [
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
    ];
  }

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
    const completedValues = ["yes", "na", "n/a", "nr", "n/r"];
    if (completedValues.includes(val)) {
      return "Completed";
    }
    if (val === "no") return "Not Completed";
    if (["processing", "inprogress", "in progress"].includes(val))
      return "In Progress";
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

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [noteForClient, setNoteForClient] = useState("");
  const [noteForSystem, setNoteForSystem] = useState("");
  const originalData = useRef({});

  // NEW: Generate system note for commercial
  const generateSystemNote = () => {
    const greenValues = new Set(["yes", "nr", "na", "approved"]);
    const notReceived = fields
      .filter((field) => {
        return !greenValues.has(normalizeValue(formState[field.key] || ""));
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not received`;
  };

  // UPDATED: Data initialization effect
  useEffect(() => {
    if (!data) return;

    console.log("=== INITIALIZING STAGE 3 FORM DATA ===");
    console.log("Raw data received:", data);

    setIsLoading(true);

    const initializeData = async () => {
      try {
        let stageData = data;

        // For commercial stage 3, fetch the actual stage data from API
        if (currentModule === "commercial") {
          console.log("Commercial stage 3 - fetching actual stage data");
          try {
            const stageResponse = await commercialApi.getStageData(
              3,
              matterNumber
            );
            console.log("Commercial stage 3 API response:", stageResponse);

            if (stageResponse && stageResponse.data) {
              stageData = { ...data, ...stageResponse.data };
            } else if (stageResponse) {
              stageData = { ...data, ...stageResponse };
            }
            console.log("Combined stage data for commercial:", stageData);
          } catch (error) {
            console.log("No existing stage 3 data found, using default data");
            stageData = data;
          }
        }

        const newFormState = {};
        const newStatusState = {};
        let systemNotePart = "";
        let clientCommentPart = "";

        fields.forEach(({ key, hasDate }) => {
          const rawValue = stageData[key] || "";
          newFormState[key] = normalizeValue(rawValue);
          newStatusState[key] = getStatus(newFormState[key]);

          if (hasDate) {
            newFormState[`${key}Date`] = stageData[`${key}Date`]
              ? stageData[`${key}Date`].split("T")[0]
              : "";
          }
        });

        if (currentModule === "commercial") {
          setNoteForSystem(stageData.noteForSystem || "");
          setNoteForClient(stageData.noteForClient || "");
          systemNotePart = stageData.noteForSystem || "";
          clientCommentPart = stageData.noteForClient || "";
        } else {
          const noteParts = (stageData.noteForClient || "").split(" - ");
          systemNotePart = noteParts[0]?.trim() || generateSystemNote();
          clientCommentPart = noteParts.length > 1 ? noteParts[1].trim() : "";

          setNoteForSystem(systemNotePart);
          setNoteForClient(clientCommentPart);
        }

        setFormState(newFormState);
        setStatusState(newStatusState);

        originalData.current = {
          ...newFormState,
          noteForSystem: systemNotePart,
          noteForClient: clientCommentPart,
        };

        console.log("Initialized form state:", newFormState);
      } catch (error) {
        console.error("Error initializing form data:", error);
        toast.error("Failed to load stage data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [data, reloadTrigger, company, currentModule, matterNumber]);

  function isChanged() {
    const currentSystemNote =
      currentModule === "commercial" ? noteForSystem : generateSystemNote();
    const current = {
      ...formState,
      noteForSystem: currentSystemNote,
      noteForClient,
    };
    const original = originalData.current;

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

    let noteForSystemChanged = false;
    if (currentModule === "commercial") {
      noteForSystemChanged =
        String(noteForSystem).trim() !== String(original.noteForSystem).trim();
    } else {
      noteForSystemChanged = generateSystemNote() !== original.noteForSystem;
    }

    return (
      formChanged || dateChanged || noteForClientChanged || noteForSystemChanged
    );
  }

  const handleChange = (key, value, hasDate) => {
    let processedValue = value;
    if (typeof processedValue === "string") {
      processedValue = normalizeValue(processedValue);
    }

    setFormState((prev) => ({ ...prev, [key]: processedValue }));
    setStatusState((prev) => ({ ...prev, [key]: getStatus(processedValue) }));
  };

  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      let payload = {
        ...formState,
      };

      // FIXED: Filter commercial fields and ensure correct payload structure
      if (currentModule === "commercial") {
        // Only include fields that exist in the commercial schema
        const commercialFields = [
          "ppsrSearch",
          "asicSearch",
          "ratesSearch",
          "waterSearch",
          "title",
          "noteForSystem",
          "noteForClient",
          "colorStatus",
          "matterNumber",
        ];
        const filteredPayload = {};

        commercialFields.forEach((field) => {
          if (payload[field] !== undefined) {
            filteredPayload[field] = payload[field];
          }
        });

        payload = filteredPayload;

        // Generate system note
        const systemNote = generateSystemNote();
        payload.noteForSystem = systemNote;
        payload.noteForClient = noteForClient || "";
      } else {
        // For other modules, use combined note structure
        const systemNote = generateSystemNote();
        const fullNote = noteForClient
          ? `${systemNote} - ${noteForClient}`
          : systemNote;
        payload.noteForClient = fullNote;
      }

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

      console.log("=== SAVE DEBUG ===");
      console.log("Current module:", currentModule);
      console.log("Company:", company);
      console.log("Matter number:", matterNumber);
      console.log("Payload:", payload);

      // Calculate color status based on field completion
      const allCompleted = fields.every(
        (field) => getStatus(formState[field.key]) === "Completed"
      );
      const colorStatus = allCompleted ? "green" : "amber";

      // Add colorStatus to payload for commercial
      if (currentModule === "commercial") {
        payload.colorStatus = colorStatus;
      }

      // API CALL SECTION
      if (currentModule === "commercial") {
        console.log("Using Commercial API for stage 3");
        payload.matterNumber = matterNumber;
        await commercialApi.upsertStage(3, matterNumber, payload);
      } else if (company === "vkl") {
        console.log("Using VKL API for stage 3");
        payload.matterNumber = matterNumber;
        await api.upsertStageThree(payload);
      } else if (company === "idg") {
        console.log("Using IDG API for stage 3");
        payload.orderId = matterNumber;
        await api.upsertIDGStages(payload.orderId, 3, payload);
      }

      console.log("API call successful");

      // update original data
      originalData.current = {
        ...formState,
        noteForSystem:
          currentModule === "commercial" ? noteForSystem : generateSystemNote(),
        noteForClient,
      };

      setReloadTrigger?.((prev) => !prev);
      toast.success("Stage 3 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (err) {
      console.error("=== SAVE ERROR ===");
      console.error("Failed to save Stage 3:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      let errorMessage = "Failed to save Stage 3. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
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
        {type === "image" ? (
          <div className="w-full">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCompletionPhotoFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formState.completionPhotos && (
              <div className="mt-2">
                <p className="text-xs font-semibold">Current Photo:</p>
                <a
                  href={formState.completionPhotos}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Uploaded Photo
                </a>
              </div>
            )}
          </div>
        ) : type === "text" ? (
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
        {currentModule === "commercial" ? (
          <input
            type="text"
            value={generateSystemNote()}
            disabled
            className="w-full rounded p-2 bg-gray-100"
          />
        ) : (
          <input
            type="text"
            value={generateSystemNote()}
            disabled
            className="w-full rounded p-2 bg-gray-100"
          />
        )}
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
