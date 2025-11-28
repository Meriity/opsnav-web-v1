import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline/index.js";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useArchivedClientStore } from "../../ArchivedClientStore/UseArchivedClientStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// Note: This logic seems specific to Commercial. VKL/IDG notes are parsed differently.
const extractNotes = (noteForSystem = "", noteForClient = "") => {
  return {
    systemNote: noteForSystem || "",
    clientComment: noteForClient || "",
  };
};

export default function Stage4({
  changeStage,
  data,
  onStageUpdate,
  // reloadTrigger, (Removed)
  // setReloadTrigger, (Removed)
}) {
  const stage = 4;
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();
  const originalData = useRef({});

  // --- State ---
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [preview, setPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileName, setfileName] = useState("");
  // Only Commercial module uses a separate client note state
  const [noteForClient, setNoteForClient] = useState("");
  // isLoading and isSaving are now handled by React Query


  // --- Memoized Values ---
  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  console.log("=== STAGE 4 CONFIG ===");
  console.log("Company:", company);
  console.log("Current Module:", currentModule);

  const handleUpload = async (fileToUpload) => {
    try {
      const response = await api.uploadImageForOrder(
        matterNumber,
        fileToUpload
      );
      setReloadTrigger((prev) => !prev);
      // console.log(response);
    } catch (e) {
      console.error(e);
    }
  };

  const currentConfig = useMemo(() => {
    if (currentModule === "commercial") {
      return formConfig.commercial;
    } else if (company === "vkl") {
      return formConfig.vkl;
    } else if (company === "idg") {
      return formConfig.idg;
    }
    return formConfig.vkl; // default fallback
  }, [currentModule, company]);

  const reloadArchivedClients = useArchivedClientStore(
    (s) => s.reloadArchivedClients
  );

  // --- Callback Helpers ---
  const generateSystemNote = useCallback(
    (noteGroupId) => {
      const noteGroup = currentConfig.noteGroups.find(
        (ng) => ng.id === noteGroupId
      );
      if (!noteGroup) return "";

      const greenValues = new Set([
        "yes",
        "nr",
        "na",
        "approved",
        "completed",
        "cancelled",
      ]);

      const fieldsToCheck = currentConfig.fields.filter((f) =>
        noteGroup.fieldsForNote.includes(f.name)
      );

      const notReceived = fieldsToCheck
        .filter((field) => {
          const rawValue = formData[field.name] || "";
          const value = normalizeValue(rawValue);

          if (field.type === "text") {
            return value === ""; // text fields count as completed if not empty
          }
          return !greenValues.has(value); // non-text fields rely on greenValues
        })
        .map((field) => field.label);

      if (notReceived.length === 0) return "Tasks completed";
      return `${notReceived.join(" and ")} not completed`;
    },
    [currentConfig, formData]
  );

  // --- Data Fetching with useQuery ---
  const fetchStageData = useCallback(async () => {
    if (!data) return null;
    let stageData = data;

    if (currentModule === "commercial") {
      try {
        const stageResponse = await commercialApi.getStageData(4, matterNumber);
        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log(
          "No existing stage 4 data found for commercial, using base"
        );
      }
    } else if (data.stages && Array.isArray(data.stages)) {
      // For VKL/IDG, find the stage 4 data
      const stage4Data = data.stages.find((stage) => stage.stageNumber === 4);
      if (stage4Data) {
        stageData = { ...data, ...stage4Data }; // Merge with base
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 4, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
  });

  useEffect(() => {
    if (!stageData) return;

    try {
      const initialFormData = {};
      const initialStatuses = {};
      let loadedClientComment = "";
      let loadedSystemNote = ""; // For change tracking

      currentConfig.fields.forEach((field) => {
        // Initialize ALL fields with proper default values
        if (field.type === "number") {
          const rawPrice = stageData[field.name];
          initialFormData[field.name] =
            typeof rawPrice === "object" && rawPrice?.$numberDecimal
              ? rawPrice.$numberDecimal
              : rawPrice?.toString() || "";
        } else if (field.type === "radio") {
          // For radio fields, ensure we have a normalized value
          const rawValue = stageData[field.name] || "";
          initialFormData[field.name] = normalizeValue(rawValue);
          initialStatuses[field.name] = getStatus(initialFormData[field.name]);
        } else if (field.type === "text") {
          initialFormData[field.name] = stageData[field.name] || "";
        } else if (field.type === "image") {
          // Image fields don't go into formData for change detection
          // They're handled separately via preview state
        }

        // Ensure every field has a value, even if empty
        if (initialFormData[field.name] === undefined) {
          initialFormData[field.name] = "";
        }
      });

      // Handle notes
      if (currentModule === "commercial") {
        const { systemNote, clientComment } = extractNotes(
          stageData.noteForSystem,
          stageData.noteForClient
        );
        loadedSystemNote = systemNote;
        loadedClientComment = clientComment;
        setNoteForClient(clientComment);
      } else {
        // VKL/IDG
        currentConfig.noteGroups.forEach((group) => {
          const noteString = stageData[group.noteForClientKey] || "";
          const noteParts = noteString.split(" - ");
          loadedSystemNote = noteParts[0]?.trim() || "";
          loadedClientComment = noteParts.length > 1 ? noteParts[1].trim() : "";
          initialFormData[group.clientCommentKey] = loadedClientComment;
        });
      }

      setFormData(initialFormData);
      setStatuses(initialStatuses);

      if (company === "idg") {
        const lastImage = stageData?.images?.[stageData?.images?.length - 1];
        setPreview(lastImage?.url || null);
        setfileName(lastImage?.filename || "");
      }

      originalData.current = {
        formData: { ...initialFormData },
        noteForClient: loadedClientComment,
        noteForSystem: loadedSystemNote,
      };
    } catch (error) {
      toast.error("Failed to load stage data");
    }
  }, [stageData, currentConfig, company, currentModule]);

  const handleChange = (field, value) => {
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);
    let processedValue = value;

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

    // If original data hasn't been set yet, consider no changes
    if (!original || !original.formData) return false;

    // Check if any form field has changed
    const formChanged = currentConfig.fields.some((field) => {
      // Skip image fields for change detection
      if (field.type === "image") return false;

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
      return note.replace(/\s*-+\s*$/, "").trim(); // Remove trailing dashes and spaces
    };

    const systemNoteChanged =
      normalizeSystemNote(currentSystemNote) !==
        normalizeSystemNote(originalSystemNote) && formChanged; // Only consider system note changed if form fields actually changed

    console.log("Change detection:", {
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
  // Add debug useEffect to monitor changes
  useEffect(() => {
    console.log("Form changed status:", isChanged());
    console.log("Current formData:", formData);
    console.log("Original formData:", originalData.current.formData);
  }, [formData, noteForClient]);

  const { mutate: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: (file) => api.uploadImageForOrder(matterNumber, file),
    onSuccess: (response) => {
      toast.success("Image uploaded successfully!");
      queryClient.invalidateQueries({
        queryKey: ["stageData", 4, matterNumber, currentModule],
      });
    },
    onError: (err) => {
      toast.error("Image upload failed.");
    },
  });

  function getCleanImageName(fullPath) {
    const prefixToRemove = "idg-stage-images/";
    return fullPath.replace(prefixToRemove, "");
  }

  const { mutate: deleteImage, isPending: isDeleting } = useMutation({
    mutationFn: (filename) =>
      api.deleteImageForOrder(matterNumber, getCleanImageName(filename)),
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      setPreview(null);
      setfileName("");
      setShowConfirmModal(false);
      queryClient.invalidateQueries({
        queryKey: ["stageData", 4, matterNumber, currentModule],
      });
    },
    onError: (err) => {
      toast.error("Failed to delete image.");
      setShowConfirmModal(false);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      let apiResponse;
      if (currentModule === "commercial") {
        apiResponse = await commercialApi.upsertStage(4, matterNumber, payload);
      } else if (company === "vkl") {
        apiResponse = await api.upsertStageFour(payload);
      } else if (company === "idg") {
        apiResponse = await api.upsertIDGStages(matterNumber, 4, payload);
      }
      return apiResponse;
    },
    onSuccess: (responseData, payload) => {
      // Normalize server response
      const res = responseData?.data || responseData;



      const companyKey = localStorage.getItem("company") || company;
      const currentModuleKey =
        localStorage.getItem("currentModule") || currentModule;

      // 1) Update the clientData cache used by StagesLayout for instant UI updates
      try {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, currentModuleKey],
          (old) => {
            const stageProp = `stage${stage}`; // "stage4"

            // Build stage payload from response
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

            // IMPORTANT: Update the stage4 colorStatus for instant UI update
            if (payload.colorStatus && merged[stageProp]) {
              merged[stageProp].colorStatus = payload.colorStatus;
            }

            return merged;
          }
        );
      } catch (e) {
        // fallback: refetch client data in background
        queryClient.invalidateQueries([
          "clientData",
          matterNumber,
          companyKey,
          currentModuleKey,
        ]);
      }

      // 2) Update the view/list cache so any listing showing the color/status updates
      try {
        queryClient.setQueryData(["viewClients", currentModuleKey], (list) => {
          if (!Array.isArray(list)) return list;
          return list.map((c) => {
            if (String(c.matterNumber) !== String(matterNumber)) return c;

            const updated = { ...c };

            // Update stage4 colorStatus for instant UI update in lists
            if (payload.colorStatus) {
              updated.stage4 = updated.stage4
                ? { ...updated.stage4, colorStatus: payload.colorStatus }
                : { colorStatus: payload.colorStatus };
            }

            // Also update top-level colorStatus if it exists in commercial module
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
        toast.success("Stage 4 Saved Successfully!", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      } catch (e) {}

      // 3) Keep the specific stageData in sync (refetch in background)
      try {
        queryClient.invalidateQueries({
          queryKey: ["stageData", 4, matterNumber, currentModuleKey],
        });
      } catch (e) {
        // ignore
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

      const statusMap = {
        green: "Completed",
        red: "Not Completed",
        amber: "In Progress",
      };

      // Update the stage status immediately
      const newStatus = statusMap[payload.colorStatus] || "Not Completed";

      // This will trigger an immediate re-render of the stage navigation
      if (onStageUpdate) {
        try {
          onStageUpdate({ ...payload, colorStatus: payload.colorStatus }, 4);
        } catch {}
      }
      const currentStatuses = JSON.parse(
        localStorage.getItem("stageStatuses") || "{}"
      );
      currentStatuses[`status4`] = newStatus;
      localStorage.setItem("stageStatuses", JSON.stringify(currentStatuses));
    },
    onError: (err) => {
      let errorMessage = "Failed to save Stage 4. Please try again.";
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
      (field) =>
        field.type === "image" ||
        getStatus(formData[field.name]) === "Completed"
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
        delete payload.completionPhotos;
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
          <div className="w-full mt-5" key={field.name}>
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>

            <div className="relative w-full">
              {!preview ? (
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    isUploading ? "opacity-50" : ""
                  } border-gray-300 bg-gray-50 hover:bg-gray-100 `}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  ) : (
                    <CloudArrowUpIcon className="w-10 h-10 text-gray-400 hover:text-[#00AEEF]" />
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-400 hover:text-[#00AEEF]">
                      {isUploading ? "Uploading..." : "Click here to upload"}
                    </span>
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              ) : (
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
                    disabled={isDeleting}
                    className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 shadow hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    ) : (
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
                    )}
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
        onConfirm={() => deleteImage(fileName)}
      >
        Do you really want to delete this Image?
      </ConfirmationModal>
    </div>
  );
}

Stage4.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
};
