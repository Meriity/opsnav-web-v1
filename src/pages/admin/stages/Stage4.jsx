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

const formConfig = {
  conveyancing: {
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
  "print media": {
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
      { name: "closeOrder", label: "Close Order", type: "radio" },
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
      { name: "purchaseContracts", label: "Purchase Contracts", type: "radio" },
      { name: "customerContracts", label: "Customer Contracts", type: "radio" },
      { name: "leaseAgreement", label: "Lease Agreement", type: "radio" },
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
  onStageUpdate,
  setReloadTrigger,
  stageNumber = 4,
}) {
  const { matterNumber } = useParams();

  const originalData = useRef({});
  const hasLoadedData = useRef(false);

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [preview, setPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileName, setfileName] = useState("");
  const [noteForClient, setNoteForClient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  const currentConfig = useMemo(() => {
    if (currentModule === "commercial") return formConfig.commercial;
    return formConfig[currentModule] || formConfig.conveyancing;
  }, [currentModule]);

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

          if (field.type === "text") return value === "";
          return !greenValues.has(value);
        })
        .map((field) => field.label);

      if (notReceived.length === 0) return "Tasks completed";
      return `${notReceived.join(" and ")} not completed`;
    },
    [currentConfig, formData]
  );

  // Initialize from props (no internal fetch)
  useEffect(() => {
    if (!data) return;
    if (hasLoadedData.current) return;

    // Use data prop directly
    const stageData = data;
    
    try {
        const initialFormData = {};
        const initialStatuses = {};
        let loadedClientComment = "";
        let loadedSystemNote = "";

        currentConfig.fields.forEach((field) => {
          const rawValue = stageData[field.name];

          if (field.type === "number") {
            const rawPrice = rawValue;
            initialFormData[field.name] =
              typeof rawPrice === "object" && rawPrice?.$numberDecimal
                ? rawPrice.$numberDecimal
                : rawPrice?.toString() ?? "";
          } else if (field.type === "radio") {
            initialFormData[field.name] = normalizeValue(rawValue ?? "");
            initialStatuses[field.name] = getStatus(
              initialFormData[field.name]
            );
          } else if (field.type === "text") {
            initialFormData[field.name] = rawValue ?? "";
          }

          if (
            initialFormData[field.name] === undefined ||
            initialFormData[field.name] === null
          ) {
            initialFormData[field.name] = "";
          }
        });

        // notes
        if (currentModule === "commercial") {
          const { systemNote, clientComment } = extractNotes(
            stageData.noteForSystem,
            stageData.noteForClient
          );
          loadedSystemNote = systemNote || "";
          loadedClientComment = clientComment || "";
          setNoteForClient(loadedClientComment);
        } else {
          currentConfig.noteGroups.forEach((group) => {
            const noteString = stageData[group.noteForClientKey] || "";
            const noteParts = noteString.split(" - ");
            loadedSystemNote = noteParts[0]?.trim() || "";
            loadedClientComment =
              noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";
            initialFormData[group.clientCommentKey] = loadedClientComment;
          });
        }

        // idg images
        if (currentModule === "print media") {
          const lastImage = stageData?.images?.[stageData?.images?.length - 1];
          setPreview(lastImage?.url || null);
          setfileName(lastImage?.filename || "");
        }

        setFormData(initialFormData);
        setStatuses(initialStatuses);

        originalData.current = {
          formData: JSON.parse(JSON.stringify(initialFormData)),
          noteForClient: loadedClientComment,
          noteForSystem: loadedSystemNote,
        };

        hasLoadedData.current = true;
        setIsLoading(false);
      } catch (e) {
        toast.error("Failed to load stage data");
      }
  }, [data, currentConfig, currentModule]);

  // Reset loaded flag when matter changes
  useEffect(() => {
    hasLoadedData.current = false;
  }, [matterNumber]);

  const handleChange = useCallback(
    (field, value) => {
      const fieldConfig = currentConfig.fields.find((f) => f.name === field);
      let processedValue = value;

      if (fieldConfig && fieldConfig.type === "radio") {
        if (typeof processedValue === "string")
          processedValue = normalizeValue(processedValue);
        setStatuses((prev) => ({
          ...(prev || {}),
          [field]: getStatus(processedValue),
        }));
      } else {
        setStatuses((prev) => ({
          ...(prev || {}),
          [field]: getStatus(processedValue),
        }));
      }

      setFormData((prev) => ({ ...(prev || {}), [field]: processedValue }));
    },
    [currentConfig.fields]
  );

  const isChanged = () => {
    const original = originalData.current || {};
    if (!original || !original.formData) {
       // if no original data yet, check if any field is filled
       const anyFilled = Object.keys(formData || {}).some(
        (k) => formData[k] !== undefined && String(formData[k]).trim() !== ""
       );
       return anyFilled;
    }

    try {
      const currentForm = currentConfig.fields.reduce((acc, field) => {
        if (field.type === "image") return acc;
        acc[field.name] = formData[field.name] ?? "";
        return acc;
      }, {});

      const originalForm = Object.keys(original.formData || {}).reduce(
        (acc, k) => {
          if (
            currentConfig.fields.some((f) => f.name === k && f.type !== "image")
          ) {
            acc[k] = original.formData[k] ?? "";
          }
          return acc;
        },
        {}
      );

      const formChanged =
        JSON.stringify(currentForm) !== JSON.stringify(originalForm);

      let clientNoteChanged = false;
      if (currentModule === "commercial") {
        const currentNote = noteForClient ?? "";
        const originalNote = original.noteForClient ?? "";
        clientNoteChanged =
          String(currentNote).trim() !== String(originalNote).trim();
      } else {
        clientNoteChanged = currentConfig.noteGroups.some((group) => {
          const currentNote = formData[group.clientCommentKey] ?? "";
          const originalNote = original.formData[group.clientCommentKey] ?? "";
          return String(currentNote).trim() !== String(originalNote).trim();
        });
      }

      const currentSystemNote = generateSystemNote("main");
      const originalSystemNote = original.noteForSystem ?? "";
      const normalizeSystemNote = (note) =>
        note
          ? String(note)
              .replace(/\s*-+\s*$/, "")
              .trim()
          : "";
      const systemNoteChanged =
        normalizeSystemNote(currentSystemNote) !==
          normalizeSystemNote(originalSystemNote) && formChanged;

      return formChanged || clientNoteChanged || systemNoteChanged;
    } catch (e) {
      return true;
    }
  };


  // ---------- IMAGE UPLOAD / DELETE (IDG) ----------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    (async () => {
      setIsUploading(true);
      setPreview(URL.createObjectURL(file));
      try {
        await api.uploadImageForOrder(matterNumber, file);
        toast.success("Image uploaded successfully!");
        setReloadTrigger((prev) => (typeof prev === "number" ? prev + 1 : (prev || 0) + 1));
      } catch (err) {
        toast.error("Image upload failed.");
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    })();
  };

  const getCleanImageName = (fullPath) => {
    const prefixToRemove = "idg-stage-images/";
    return String(fullPath).replace(prefixToRemove, "");
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.deleteImageForOrder(matterNumber, getCleanImageName(fileName));
      setPreview(null);
      setfileName("");
      setShowConfirmModal(false);

      toast.success("Image deleted successfully!");
      setReloadTrigger((prev) =>
          typeof prev === "number" ? prev + 1 : (prev || 0) + 1
      );
    } catch (err) {
      toast.error("Failed to delete image.");
      setShowConfirmModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- SAVE ----------
  async function handleSave() {
    if (!isChanged() || isSaving) return;

    setIsSaving(true);

    const systemNote = generateSystemNote("main");
    let payload = JSON.parse(JSON.stringify(formData || {}));

    // normalize fields
    currentConfig.fields.forEach((field) => {
      const raw = payload[field.name];
      if (field.type === "radio") {
        payload[field.name] = raw ?? "";
      } else if (field.type === "number") {
        if (payload[field.name] === "" || payload[field.name] === undefined)
          payload[field.name] = null;
        else if (typeof payload[field.name] === "string") {
          const n = Number(payload[field.name]);
          payload[field.name] = Number.isFinite(n) ? n : null;
        }
      } else {
        payload[field.name] = payload[field.name] ?? "";
      }
    });

    // compute colorStatus
    const completedSet = new Set([
      "yes",
      "nr",
      "n/r",
      "na",
      "n/a",
      "fixed",
      "variable",
      "approved",
    ]);
    const fieldsValues = currentConfig.fields.map((f) =>
      normalizeValue(String(payload[f.name] ?? ""))
    );
    const nonEmpty = fieldsValues.filter((v) => v !== "");
    const computedColorStatus =
      nonEmpty.length > 0 && nonEmpty.every((v) => completedSet.has(v))
        ? "green"
        : nonEmpty.length === 0
        ? "red"
        : "amber";

    if (currentModule === "commercial") {
      const commercialFields = currentConfig.fields.map((f) => f.name);
      const filtered = {};
      commercialFields.forEach((n) => {
        if (payload[n] !== undefined) filtered[n] = payload[n];
      });
      filtered.noteForSystem = systemNote;
      filtered.noteForClient = noteForClient || "";
      filtered.colorStatus = computedColorStatus;
      filtered.matterNumber = matterNumber;
      payload = filtered;
    } else {
      currentConfig.noteGroups.forEach((group) => {
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] =
          `${systemNote} - ${clientComment}`.trim();
        delete payload[group.clientCommentKey];
      });
      if (currentModule === "print media") {
        payload.orderId = matterNumber;
      } else {
        payload.matterNumber = matterNumber;
      }
      payload.colorStatus = computedColorStatus;
    }

    try {
      let res;
      if (currentModule === "commercial") {
        res = await commercialApi.upsertStage(4, matterNumber, payload);
      } else if (currentModule === "print media") {
        res = await api.upsertIDGStages(matterNumber, 4, payload);
      } else {
        res = await api.upsertStageFour(payload);
      }

      toast.success("Stage 4 Saved Successfully!", {
        autoClose: 2500,
        hideProgressBar: false,
      });

      // Update original ref with new state
      const serverStage = (res && (res.data || res.stage4 || res)) || payload;
      
      originalData.current = {
          formData: JSON.parse(JSON.stringify(formData)),
          noteForClient: currentModule === "commercial" ? noteForClient : undefined,
          noteForSystem: systemNote
      };

      // notify parent / listings to refresh
      setReloadTrigger((prev) =>
          typeof prev === "number" ? prev + 1 : (prev || 0) + 1
      );
      
      if (onStageUpdate) {
         onStageUpdate({ ...payload, colorStatus: computedColorStatus }, 4);
      }

    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to save Stage 4. Please try again.";
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
                      normalizeValue(formData[field.name] ?? "") ===
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
              value={formData[field.name] ?? ""}
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
              value={formData[field.name] ?? ""}
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
                    onClick={() => setShowConfirmModal(true)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs"
                    disabled={isDeleting}
                  >
                     X
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
      {currentConfig.fields.map(renderField)}

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
                       value={formData[group.clientCommentKey] || ""}
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

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </div>
  );
}

Stage4.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  onStageUpdate: PropTypes.func,
  setReloadTrigger: PropTypes.func.isRequired,
  stageNumber: PropTypes.number,
};
