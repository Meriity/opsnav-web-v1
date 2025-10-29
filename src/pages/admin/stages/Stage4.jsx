import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
import ImageUploadField from "@/components/ui/ImageUploadField.jsx";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline/index.js";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import { useArchivedClientStore } from "../../ArchivedClientStore/UseArchivedClientStore";

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
        fieldsForNote: ["dts", "dutyOnline", "soa", "frcgw"],
      },
    ],
  },
  idg: {
    fields: [
      {
        name: "uploadImageConfirmation",
        label: "Image Uploaded Correctly",
        type: "radio",
      },
      {
        name: "completionPhotos",
        label: "Capture Proof of Completion Photos",
        type: "image",
      },
      {
        name: "closeOrder",
        label: "Close Order",
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
        fieldsForNote: ["uploadImageConfirmation", "closeOrder"],
      },
    ],
  },
  commercial: {
    fields: [
      {
        name: "employeesEntitlements",
        label: "Employees Entitlements",
        type: "radio",
      },
      {
        name: "purchaseContracts",
        label: "Purchase Contracts",
        type: "radio",
      },
      {
        name: "customerContracts",
        label: "Customer Contracts",
        type: "radio",
      },
      {
        name: "leaseAgreement",
        label: "Lease Agreement",
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
          "employeesEntitlements",
          "purchaseContracts",
          "customerContracts",
          "leaseAgreement",
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
  if (["yes", "na", "n/a", "nr", "cancelled", "completed"].includes(val))
    return "Completed";
  if (val === "no") return "Not Completed";
  if (["processing", "inprogress"].includes(val)) return "In Progress";
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

export default function Stage4({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 4;
  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileName, setfileName] = useState("");
  const [noteForSystem, setNoteForSystem] = useState("");
  const [noteForClient, setNoteForClient] = useState("");

  // Get company and module
  const company = localStorage.getItem("company") || "vkl";
  const currentModule = localStorage.getItem("currentModule");

  // Add Zustland retrigger
  const reloadArchivedClients = useArchivedClientStore(
    (s) => s.reloadArchivedClients
  );

  // FIXED: Proper field configuration logic - check module first
  let currentConfig;
  if (currentModule === "commercial") {
    currentConfig = formConfig.commercial;
  } else if (company === "vkl") {
    currentConfig = formConfig.vkl;
  } else if (company === "idg") {
    currentConfig = formConfig.idg;
  } else {
    currentConfig = formConfig.vkl; // default fallback
  }

  console.log("=== STAGE 4 CONFIG ===");
  console.log("Company:", company);
  console.log("Current Module:", currentModule);
  console.log("Selected Config:", currentConfig);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
    // Automatically trigger the upload
    handleUpload(file);
  };

  const handleUpload = async (fileToUpload) => {
    try {
      const response = await api.uploadImageForOrder(
        matterNumber,
        fileToUpload
      );
      // console.log(response);
    } catch (e) {
      console.error(e);
    }
  };

  function getCleanImageName(fullPath) {
    const prefixToRemove = "idg-stage-images/";
    return fullPath.replace(prefixToRemove, "");
  }

  const handleImagedelete = async (filename) => {
    setPreview(null);
    setShowConfirmModal(false);
    // try {
    //   console.log(matterNumber);
    //   console.log(getCleanImageName(fileName));
    //   const response = await api.deleteImageForOrder(matterNumber, getCleanImageName(filename));
    //   console.log(response);
    // }
    // catch (e) {
    //   console.error(e);
    // }
  };

  const generateSystemNote = (noteGroupId) => {
    const noteGroup = currentConfig.noteGroups.find(
      (ng) => ng.id === noteGroupId
    );
    if (!noteGroup) return "";

    const greenValues = new Set(["yes", "nr", "na", "approved"]);

    const fieldsToCheck = currentConfig.fields.filter((f) =>
      noteGroup.fieldsForNote.includes(f.name)
    );

    const notReceived = fieldsToCheck
      .filter((field) => {
        const rawValue = formData[field.name] || "";
        const value = normalizeValue(rawValue);

        if (field.type === "text") {
          // text fields count as completed if not empty
          return value === "";
        }

        // non-text fields rely on greenValues
        return !greenValues.has(value);
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not completed`;
  };

  // UPDATED: Data initialization effect
  useEffect(() => {
    if (!data) return;

    console.log("=== STAGE 4 INITIALIZATION ===");
    console.log("Using config:", currentConfig);

    setIsLoading(true);

    const initializeData = async () => {
      try {
        let stageData = data;

        // For commercial stage 4, fetch the actual stage data from API
        if (currentModule === "commercial") {
          console.log("Commercial stage 4 - fetching actual stage data");
          try {
            const stageResponse = await commercialApi.getStageData(
              4,
              matterNumber
            );
            console.log("Commercial stage 4 API response:", stageResponse);

            if (stageResponse && stageResponse.data) {
              stageData = { ...data, ...stageResponse.data };
            } else if (stageResponse) {
              stageData = { ...data, ...stageResponse };
            }
            console.log("Combined stage data for commercial:", stageData);
          } catch (error) {
            console.log("No existing stage 4 data found, using default data");
            stageData = data;
          }
        }

        const initialFormData = {};
        const initialStatuses = {};

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
            initialStatuses[field.name] = getStatus(
              initialFormData[field.name]
            );
          } else {
            initialFormData[field.name] = stageData[field.name] || "";
          }
        });

        // Handle notes differently for commercial vs other modules
        if (currentModule === "commercial") {
          const { systemNote, clientComment } = extractNotes(
            stageData.noteForSystem,
            stageData.noteForClient
          );
          setNoteForSystem(systemNote);
          setNoteForClient(clientComment);
        } else {
          currentConfig.noteGroups.forEach((group) => {
            const notes = extractNotes(stageData[group.noteForClientKey]);
            initialFormData[group.clientCommentKey] = notes.clientComment;
          });
        }

        setFormData(initialFormData);
        setStatuses(initialStatuses);

        if (company === "idg") {
          setPreview(
            stageData?.images[stageData?.images?.length - 1]?.url || null
          );
          setfileName(stageData?.images[0]?.filename || " ");
        }

        originalData.current = initialFormData;

        console.log("Initialized form data:", initialFormData);
      } catch (error) {
        console.error("Error initializing form data:", error);
        toast.error("Failed to load stage data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [
    data,
    reloadTrigger,
    company,
    currentModule,
    currentConfig,
    matterNumber,
  ]);

  const handleChange = (field, value) => {
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);

    let processedValue = value;

    // Only normalize radio fields, leave other fields as-is
    if (fieldConfig && fieldConfig.type === "radio") {
      if (typeof processedValue === "string") {
        processedValue = normalizeValue(processedValue);
      }

      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
  };

  const isChanged = () => {
    const currentSystemNote = generateSystemNote("main");

    if (currentModule === "commercial") {
      return (
        JSON.stringify(formData) !== JSON.stringify(originalData.current) ||
        noteForSystem !== (data?.noteForSystem || "") ||
        noteForClient !== (data?.noteForClient || "")
      );
    } else {
      return JSON.stringify(formData) !== JSON.stringify(originalData.current);
    }
  };

  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      let payload = { ...formData };

      // FIXED: Filter commercial fields and ensure correct payload structure
      if (currentModule === "commercial") {
        // Only include fields that exist in the commercial schema
        const commercialFields = [
          "employeesEntitlements",
          "purchaseContracts",
          "customerContracts",
          "leaseAgreement",
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
        const systemNote = generateSystemNote("main");
        payload.noteForSystem = systemNote;
        payload.noteForClient = noteForClient || "";

        // Calculate and add color status
        const allCompleted = currentConfig.fields.every(
          (field) => getStatus(formData[field.name]) === "Completed"
        );
        payload.colorStatus = allCompleted ? "green" : "amber";
      } else {
        // For other modules, use combined note structure
        currentConfig.noteGroups.forEach((group) => {
          const systemNote = generateSystemNote(group.id);
          const clientComment = formData[group.clientCommentKey] || "";
          payload[group.noteForClientKey] =
            `${systemNote} - ${clientComment}`.trim();
          delete payload[group.clientCommentKey];
        });
      }

      // --- Convert number fields properly ---
      currentConfig.fields.forEach((field) => {
        if (field.type === "number") {
          payload[field.name] =
            payload[field.name] === "" ? null : Number(payload[field.name]);
        }
      });

      console.log("=== SAVE DEBUG ===");
      console.log("Current module:", currentModule);
      console.log("Company:", company);
      console.log("Matter number:", matterNumber);
      console.log("Payload:", payload);

      // API CALL SECTION
      if (currentModule === "commercial") {
        console.log("Using Commercial API for stage 4");
        payload.matterNumber = matterNumber;
        await commercialApi.upsertStage(4, matterNumber, payload);
      } else if (company === "vkl") {
        console.log("Using VKL API for stage 4");
        payload.matterNumber = matterNumber;
        await api.upsertStageFour(payload);
      } else if (company === "idg") {
        console.log("Using IDG API for stage 4");
        payload.orderId = matterNumber;
        await api.upsertIDGStages(payload.orderId, 4, payload);
      }

      console.log("API call successful");

      // --- Update local state & reload ---
      originalData.current = { ...formData };
      setReloadTrigger((prev) => !prev);
      reloadArchivedClients();
      toast.success("Stage 4 Saved Successfully!", {
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
      console.error("Failed to save Stage 4:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      let errorMessage = "Failed to save Stage 4. Please try again.";
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
                  {statuses[field.name] || "Not Completed"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
              {(field.name !== "closeOrder"
                ? ["Yes", "No", "Processing", "N/R"]
                : ["Completed", "Cancelled"]
              ).map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm md:text-base"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={val}
                    checked={
                      normalizeValue(formData[field.name]) ===
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
      case "image":
        return (
          <div className="w-full mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>

            <div className="relative w-full">
              {!preview ? (
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition border-gray-300 bg-gray-50 hover:bg-gray-100 `}
                >
                  <CloudArrowUpIcon className="w-10 h-10 text-gray-400 hover:text-[#00AEEF]" />
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-400 hover:text-[#00AEEF]">
                      Click here to upload
                    </span>
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                // Image preview (no changes needed here)
                <div className="relative w-full text-center">
                  <img
                    src={preview}
                    alt="Uploaded preview"
                    className="inline-block rounded-lg border max-w-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(true);
                    }}
                    className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
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
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Delete Image"
        onConfirm={() => handleImagedelete(fileName)}
      >
        Do you really want to delete this Image??
      </ConfirmationModal>
    </div>
  );
}

Stage4.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};
