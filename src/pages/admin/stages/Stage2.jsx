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
      { name: "signedContract", label: "Signed Contract", type: "radio" },
      {
        name: "vendorDisclosure",
        label: "Vendor Disclosure",
        type: "radio",
        hasDate: true,
        dateFieldName: "vendorDisclosureDate",
      },
      { name: "sendKeyDates", label: "Send Key Dates", type: "radio" },
      { name: "voi", label: "VOI", type: "radio" },
      { name: "caf", label: "CAF", type: "radio" },
      {
        name: "depositReceipt",
        label: "Deposit Receipt",
        type: "radio",
        hasDate: true,
        dateFieldName: "depositReceiptDate",
      },
      {
        name: "buildingAndPest",
        label: "Building and Pest",
        type: "radio",
        hasDate: true,
        dateFieldName: "buildingAndPestDate",
      },
      {
        name: "financeApproval",
        label: "Finance Approval",
        type: "radio",
        hasDate: true,
        dateFieldName: "financeApprovalDate",
      },
      {
        name: "checkCtController",
        label: "Check CT Controller",
        type: "radio",
      },
      { name: "obtainDaSeller", label: "Obtain DA(Seller)", type: "radio" },
    ],
    noteGroups: [
      {
        id: "A",
        systemNoteLabel: "System Note (VOI / CAF / Deposit)",
        clientCommentLabel: "Client Comment (VOI / CAF / Deposit)",
        systemNoteKey: "systemNoteA",
        clientCommentKey: "clientCommentA",
        noteForClientKey: "noteForClientA",
        fieldsForNote: ["voi", "caf", "depositReceipt", "obtainDaSeller"],
      },
      {
        id: "B",
        systemNoteLabel: "System Note (B&P / Finance)",
        clientCommentLabel: "Client Comment (B&P / Finance)",
        systemNoteKey: "systemNoteB",
        clientCommentKey: "clientCommentB",
        noteForClientKey: "noteForClientB",
        fieldsForNote: ["buildingAndPest", "financeApproval"],
      },
    ],
  },
  idg: {
    fields: [
      {
        name: "agent",
        label: "Assign Agent / Team Member",
        type: "text",
      },
      {
        name: "materialsInStock",
        label: "Check if Materials Needed are in stock",
        type: "radio",
      },
      {
        name: "additionalMaterialsRequired",
        label: "Procure additional materials if required",
        type: "radio",
      },
      {
        name: "designArtwork",
        label: "Create / update Design Artwork",
        type: "text",
      },
      {
        name: "internalApproval",
        label: "Review and internally approve design",
        type: "radio",
      },
      {
        name: "proofSentToClient",
        label: "Send Proof to Client",
        type: "radio",
      },
      {
        name: "clientApprovalReceived",
        label: "Record Client Approval",
        type: "radio",
      },
      {
        name: "printReadyFiles",
        label: "Generate Print-Ready Files",
        type: "radio",
      },
      {
        name: "jobActivity",
        label: "Ensure Job Activity & Priority are correctly logged",
        type: "text",
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System note for client",
        clientCommentLabel: "Comment for client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "designArtwork",
          "jobActivity",
          "vehicleAllocated",
          "materialsInStock",
          "additionalMaterialsRequired",
          "internalApproval",
          "proofSentToClient",
          "clientApprovalReceived",
          "printReadyFiles",
        ],
      },
    ],
  },
  commercial: {
    fields: [
      {
        name: "voi",
        label: "VOI",
        type: "radio",
      },
      {
        name: "leaseTransfer",
        label: "Lease Transfer",
        type: "radio",
      },
      {
        name: "contractOfSale",
        label: "Contract of Sale",
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
        fieldsForNote: ["voi", "leaseTransfer", "contractOfSale"],
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

// Helper function to check if a value is a vendor disclosure value
const isVendorDisclosureValue = (value) => {
  if (!value) return false;
  const normalized = normalizeValue(value);
  return normalized.includes("vendordisclosure");
};

// Helper to get the display value for vendor disclosure
const getVendorDisclosureDisplayValue = (value) => {
  if (!value) return "";
  if (isVendorDisclosureValue(value)) return "Yes";
  const normalized = normalizeValue(value);
  if (normalized === "no") return "No";
  if (normalized === "processing") return "Processing";
  if (normalized === "n/r") return "N/R";
  return "";
};

export default function Stage2({
  changeStage,
  data,
  stageNumber = 2,
  onStageUpdate,
  clientType,
  user,
}) {
  const stage = 2;
  const { matterNumber } = useParams();
  const originalData = useRef({});
  const hasLoadedData = useRef(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});

  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  const currentConfig = useMemo(
    () =>
      currentModule === "commercial"
        ? formConfig.commercial
        : formConfig[company] || formConfig.vkl,
    [currentModule, company]
  );

  const getStatus = useCallback((value, fieldName = "") => {
    if (value === undefined || value === null || value === "") {
      return "Not Completed";
    }
    const val = normalizeValue(value);
    const completed = new Set([
      "yes",
      "nr",
      "na",
      "variable",
      "fixed",
      "approved",
    ]);

    if (fieldName === "vendorDisclosure") {
      if (isVendorDisclosureValue(value) || val === "yes") {
        return "Completed";
      }
      if (val === "no") {
        return "In Progress";
      }
    }

    if (completed.has(val)) return "Completed";
    if (val === "no") return "Not Completed";
    if (["processing", "inprogress", "pending"].includes(val))
      return "In Progress";
    return "Not Completed";
  }, []);

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  }

  const extractNotes = useCallback(
    (noteForSystem = "", noteForClient = "") => {
      if (currentModule !== "commercial" && noteForSystem) {
        const parts = noteForSystem.split(" - ");
        if (parts.length > 1) {
          return {
            systemNote: parts.slice(0, -1).join(" - "),
            clientComment: parts.slice(-1)[0] || "",
          };
        }
        return { systemNote: noteForSystem, clientComment: "" };
      }
      return {
        systemNote: noteForSystem || "",
        clientComment: noteForClient || "",
      };
    },
    [currentModule]
  );

  const generateSystemNote = useCallback(
    (noteGroupId) => {
      const noteGroup = currentConfig.noteGroups.find(
        (ng) => ng.id === noteGroupId
      );
      if (!noteGroup) return "";

      const greenValues = new Set(["yes", "nr", "na", "approved"]);
      const fieldsToCheck = currentConfig.fields.filter((f) =>
        noteGroup.fieldsForNote.includes(f.name)
      );

      const getVendorDisclosureLabel = (stateVal) => {
        if (!stateVal) return "Vendor Disclosure";
        const s = String(stateVal).trim().toUpperCase();
        if (s === "VIC" || s.includes("VIC")) return "Vendor Disclosure (S32)";
        if (s === "QLD" || s.includes("QLD"))
          return "Vendor Disclosure (Form 2)";
        if (s === "SA" || s.includes("SA")) return "Vendor Disclosure (Form 1)";
        if (s === "NSW" || s.includes("NSW"))
          return "Vendor Disclosure (S10.7)";
        return "Vendor Disclosure";
      };

      const notReceived = fieldsToCheck
        .filter((field) => {
          if (
            field.name === "obtainDaSeller" &&
            clientType?.toLowerCase() !== "seller"
          ) {
            return false;
          }
          if (field.name === "vendorDisclosure") {
            return false;
          }
          return !greenValues.has(normalizeValue(formData[field.name] || ""));
        })
        .map((field) => {
          // use dynamic label for vendorDisclosure so notes match the client's state
          if (field.name === "vendorDisclosure") {
            const stateFromData =
              (data && data.state) || (formData && formData.state) || "";
            return getVendorDisclosureLabel(stateFromData);
          }
          return field.label;
        });

      if (notReceived.length === 0) {
        return "Tasks completed";
      }
      return notReceived.length > 1
        ? `${notReceived.slice(0, -1).join(", ")} and ${
            notReceived.slice(-1)[0]
          } not received`
        : `${notReceived[0]} not received`;
    },
    [currentConfig, formData, clientType, data]
  );

  const fetchStageData = useCallback(async () => {
    if (!data) return null;
    let stageData = data;

    if (currentModule === "commercial") {
      try {
        const stageResponse = await commercialApi.getStageData(2, matterNumber);
        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        stageData = data;
      }
    } else if (data.stages && Array.isArray(data.stages)) {
      const stage2Data = data.stages.find((stage) => stage.stageNumber === 2);
      if (stage2Data) {
        stageData = { ...data, ...stage2Data };
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 2, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
  });

  useEffect(() => {
    if (!stageData || hasLoadedData.current) return;

    try {
      const initialFormData = {};
      const initialStatuses = {};
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
      };

      currentConfig.fields.forEach((field) => {
        const raw = stageData[field.name];

        if (field.type === "number") {
          const rawPrice = raw;
          initialFormData[field.name] =
            typeof rawPrice === "object" && rawPrice?.$numberDecimal
              ? rawPrice.$numberDecimal
              : rawPrice?.toString() ?? "";
        } else if (field.type === "radio") {
          // Special handling for vendorDisclosure - preserve the actual value
          if (field.name === "vendorDisclosure") {
            initialFormData[field.name] = raw ?? "";
          } else {
            initialFormData[field.name] = normalizeValue(raw ?? "");
          }
        } else {
          initialFormData[field.name] = raw ?? "";
        }

        if (field.hasDate) {
          initialFormData[field.dateFieldName] = formatDate(
            stageData[field.dateFieldName]
          );
        }

        initialStatuses[field.name] = getStatus(
          stageData[field.name],
          field.name
        );
      });

      if (currentModule === "commercial") {
        const { systemNote, clientComment } = extractNotes(
          stageData.noteForSystem,
          stageData.noteForClient
        );
        initialFormData.noteForSystem = systemNote || "";
        initialFormData.noteForClient = clientComment || "";
      } else {
        currentConfig.noteGroups.forEach((group) => {
          const notes = extractNotes(stageData[group.noteForClientKey] || "");
          initialFormData[group.clientCommentKey] = notes.clientComment || "";
        });
      }

      // Ensure all expected keys exist (avoid uncontrolled -> controlled)
      currentConfig.fields.forEach((field) => {
        if (
          initialFormData[field.name] === undefined ||
          initialFormData[field.name] === null
        ) {
          initialFormData[field.name] = field.type === "radio" ? "" : "";
        }
        if (field.hasDate && !initialFormData[field.dateFieldName]) {
          initialFormData[field.dateFieldName] = "";
        }
      });

      setFormData(initialFormData);
      setStatuses(initialStatuses);
      // Deep clone for stable comparisons (Stage6/Stage1 pattern)
      originalData.current = JSON.parse(JSON.stringify(initialFormData));
      hasLoadedData.current = true;
    } catch (error) {
      toast.error("Failed to parse stage data");
    }
  }, [stageData, currentConfig, getStatus, extractNotes, currentModule]);

  const handleChange = useCallback(
    (field, value) => {
      const fieldConfig = currentConfig.fields.find((f) => f.name === field);
      let processedValue = value;

      if (fieldConfig && fieldConfig.type === "radio") {
        if (field === "vendorDisclosure") {
          // For vendorDisclosure, save based on state
          const stateVal = (data && data.state) || "";
          const state = String(stateVal).trim().toUpperCase();
          if (value.toLowerCase() === "yes") {
            if (state === "VIC" || state.includes("VIC"))
              processedValue = "vendordisclosures32";
            else if (state === "QLD" || state.includes("QLD"))
              processedValue = "vendordisclosureform2";
            else if (state === "SA" || state.includes("SA"))
              processedValue = "vendordisclosureform1";
            else if (state === "NSW" || state.includes("NSW"))
              processedValue = "vendordisclosures107";
            else processedValue = "vendordisclosure";
          } else if (value.toLowerCase() === "no") {
            processedValue = "no";
          } else {
            processedValue = value; // Keep the value as-is if it's already a vendor disclosure value
          }
        } else {
          processedValue = normalizeValue(value);
        }
      }

      // Update formData
      setFormData((prev) => ({ ...(prev || {}), [field]: processedValue }));

      if (fieldConfig) {
        setStatuses((prev) => ({
          ...(prev || {}),
          [field]: getStatus(processedValue, field),
        }));
      }
    },
    [currentConfig.fields, getStatus, data]
  );

  const isChanged = () => {
    try {
      // If originalData is empty, treat any non-empty formData as change
      if (
        !originalData.current ||
        Object.keys(originalData.current).length === 0
      ) {
        const anyFilled = Object.keys(formData || {}).some(
          (k) => formData[k] !== undefined && String(formData[k]).trim() !== ""
        );
        return anyFilled;
      }
      return (
        JSON.stringify(formData || {}) !==
        JSON.stringify(originalData.current || {})
      );
    } catch (e) {
      return true;
    }
  };

  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      let apiResponse;
      if (currentModule === "commercial") {
        apiResponse = await commercialApi.upsertStage(2, matterNumber, payload);
      } else if (company === "vkl") {
        apiResponse = await api.upsertStageTwo(
          matterNumber,
          payload.colorStatus,
          payload
        );
      } else if (company === "idg") {
        apiResponse = await api.upsertIDGStages(matterNumber, 2, payload);
      }
      return apiResponse;
    },

    // Optimistic update - ADDED THIS
    onMutate: async (payload) => {
      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;
      const optimisticColor = payload.colorStatus;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["clientData", matterNumber, companyKey, moduleKey],
      });
      await queryClient.cancelQueries({
        queryKey: ["clientMatter", matterNumber],
      });
      await queryClient.cancelQueries({ queryKey: ["viewClients", moduleKey] });

      // Snapshot previous values
      const previousClientData = queryClient.getQueryData([
        "clientData",
        matterNumber,
        companyKey,
        moduleKey,
      ]);
      const previousClientMatter = queryClient.getQueryData([
        "clientMatter",
        matterNumber,
      ]);
      const previousViewClients = queryClient.getQueryData([
        "viewClients",
        moduleKey,
      ]);

      // Optimistically update clientData
      if (previousClientData) {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, moduleKey],
          (old) => {
            const copy = { ...(old || {}) };
            copy[`stage${stageNumber}`] = {
              ...(copy[`stage${stageNumber}`] || {}),
              colorStatus: optimisticColor,
            };
            return copy;
          }
        );
      }

      // Optimistically update clientMatter
      if (previousClientMatter) {
        queryClient.setQueryData(["clientMatter", matterNumber], (old) => {
          const copy = { ...(old || {}) };
          copy[`stage${stageNumber}`] = {
            ...(copy[`stage${stageNumber}`] || {}),
            colorStatus: optimisticColor,
          };
          return copy;
        });
      }

      // Optimistically update viewClients listing
      if (Array.isArray(previousViewClients)) {
        queryClient.setQueryData(["viewClients", moduleKey], (list) => {
          return list.map((c) => {
            if (String(c.matterNumber) !== String(matterNumber)) return c;
            const updated = { ...c };
            updated[`stage${stageNumber}`] = {
              ...(updated[`stage${stageNumber}`] || {}),
              colorStatus: optimisticColor,
            };
            if (moduleKey === "commercial")
              updated.colorStatus = optimisticColor;
            return updated;
          });
        });
      }

      // Optimistically call onStageUpdate for immediate UI update
      if (onStageUpdate) {
        try {
          onStageUpdate(
            { ...payload, colorStatus: optimisticColor },
            stageNumber
          );
        } catch (e) {
          console.warn("onStageUpdate optimistic call failed", e);
        }
      }

      return {
        previousClientData,
        previousClientMatter,
        previousViewClients,
      };
    },

    // Error handling with rollback - ADDED THIS
    onError: (err, payload, context) => {
      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;

      // Rollback caches
      if (context?.previousClientData) {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, moduleKey],
          context.previousClientData
        );
      }
      if (context?.previousClientMatter) {
        queryClient.setQueryData(
          ["clientMatter", matterNumber],
          context.previousClientMatter
        );
      }
      if (context?.previousViewClients) {
        queryClient.setQueryData(
          ["viewClients", moduleKey],
          context.previousViewClients
        );
      }

      // Rollback local snapshot if possible
      if (context?.previousClientData) {
        const prevStageData =
          context.previousClientData[`stage${stageNumber}`] || {};
        originalData.current = { ...prevStageData };
      }

      let errorMessage = "Failed to save Stage 2. Please try again.";
      if (err?.response?.data?.message)
        errorMessage = err.response.data.message;
      else if (err?.message) errorMessage = err.message;
      toast.error(errorMessage);
    },

    onSuccess: (responseData, payload) => {
      const res = responseData?.data || responseData;

      localStorage.setItem("current_stage", "3");

      try {
        sessionStorage.setItem("opsnav_clients_should_reload", "1");
      } catch (e) {}

      const companyKey = localStorage.getItem("company") || company;
      const currentModuleKey =
        localStorage.getItem("currentModule") || currentModule;

      const stageProp = `stage${stage}`; // "stage2"
      const stageKeys = currentConfig.fields.reduce((acc, f) => {
        acc.push(f.name);
        if (f.hasDate && f.dateFieldName) acc.push(f.dateFieldName);
        return acc;
      }, []);

      try {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, currentModuleKey],
          (old) => {
            // Build a safe stagePayload:
            //  - if server returned nested stage (res.stage2 or res.stageData) prefer that
            //  - else pick only keys from `res` that belong to this stageKeys array
            const stagePayload =
              (res && (res[stageProp] || res.stageData)) ||
              stageKeys.reduce((acc, k) => {
                if (res && res[k] !== undefined) acc[k] = res[k];
                return acc;
              }, {});

            if (!old) {
              // If there's no existing clientData, keep top-level fields from res
              // but ensure nested stageProp contains only stagePayload
              const base = { ...(res || {}) };
              base[stageProp] = { ...(stagePayload || {}) };
              // avoid copying nested other stages if res contained them
              return base;
            }

            const merged = { ...old };
            merged[stageProp] = {
              ...(old[stageProp] || {}),
              ...(stagePayload || {}),
            };

            // Sync list-friendly top-level keys safely (color/status/notes) if server provided them
            if (res && res.colorStatus !== undefined)
              merged.colorStatus = res.colorStatus;
            if (res && res.noteForClient !== undefined)
              merged.noteForClient = res.noteForClient;
            if (res && res.noteForSystem !== undefined)
              merged.noteForSystem = res.noteForSystem;

            if (payload.colorStatus && merged[stageProp]) {
              merged[stageProp].colorStatus = payload.colorStatus;
            }

            return merged;
          }
        );
      } catch (err) {
        queryClient.invalidateQueries([
          "clientData",
          matterNumber,
          companyKey,
          currentModuleKey,
        ]);
      }
      // 2) Keep the specific stageData in sync (refetch in background)
      try {
        queryClient.invalidateQueries({
          queryKey: ["stageData", 2, matterNumber, currentModuleKey],
        });
      } catch (e) {
        // ignore
      }

      // 3) Also update single-matter cache but only the nested stage object (clientMatter.stage2)
      try {
        queryClient.setQueryData(["clientMatter", matterNumber], (old) => {
          const stagePayload =
            (res && (res[stageProp] || res.stageData)) ||
            stageKeys.reduce((acc, k) => {
              if (res && res[k] !== undefined) acc[k] = res[k];
              return acc;
            }, {});

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
          if (res && res.colorStatus !== undefined)
            merged.colorStatus = res.colorStatus;
          if (res && res.noteForClient !== undefined)
            merged.noteForClient = res.noteForClient;
          if (res && res.noteForSystem !== undefined)
            merged.noteForSystem = res.noteForSystem;
          return merged;
        });
      } catch (err) {
        queryClient.invalidateQueries(["clientMatter", matterNumber]);
      }

      // 4) Update the view/list cache so any listing showing the color/status updates
      try {
        queryClient.setQueryData(["viewClients", currentModuleKey], (list) => {
          if (!Array.isArray(list)) return list;
          return list.map((c) => {
            if (String(c.matterNumber) !== String(matterNumber)) return c;
            const updated = { ...c };
            if (res.colorStatus !== undefined)
              updated.colorStatus = res.colorStatus;
            if (res.council !== undefined) updated.council = res.council;
            return updated;
          });
        });
      } catch (err) {
        queryClient.invalidateQueries(["viewClients", currentModuleKey]);
      }

      try {
        toast.success("Stage 2 Saved Successfully!", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      } catch (e) {
        // non-critical - swallow toast errors
      }

      // Keep local snapshot for UI stability
      originalData.current = { ...formData };

      const newStatuses = { ...statuses };
      currentConfig.fields.forEach((field) => {
        if (field.name in formData) {
          newStatuses[field.name] = getStatus(formData[field.name], field.name);
        }
      });
      setStatuses(newStatuses);

      if (onStageUpdate) {
        onStageUpdate(
          { ...payload, colorStatus: payload.colorStatus },
          stageNumber
        );
      }
      if (company === "vkl") {
        console.log("Conveyancing stage saved - performing hard reload...");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    },

    onSettled: () => {
      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["clientData", matterNumber, companyKey, moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["clientMatter", matterNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["viewClients", moduleKey] });
    },
  });

  async function handleSave() {
    if (!isChanged() || isSaving) return;

    let payload = { ...formData };
    const relevantFields = currentConfig.fields.filter((field) => {
      if (
        field.name === "obtainDaSeller" &&
        clientType?.toLowerCase() !== "seller"
      ) {
        return false;
      }
      return true;
    });
    const allCompleted = relevantFields.every(
      (f) => getStatus(formData[f.name]) === "Completed"
    );

    const newStatuses = { ...statuses };
    relevantFields.forEach((field) => {
      newStatuses[field.name] = getStatus(formData[field.name], field.name);
    });
    setStatuses(newStatuses);

    const colorStatus = allCompleted ? "green" : "amber";
    payload.colorStatus = colorStatus;

    if (currentModule === "commercial") {
      const commercialFields = [
        "voi",
        "leaseTransfer",
        "contractOfSale",
        "colorStatus",
      ];
      const filteredPayload = {};
      commercialFields.forEach((field) => {
        if (payload[field] !== undefined) {
          filteredPayload[field] = payload[field];
        }
      });

      payload = filteredPayload;

      const noteForSystem = generateSystemNote("main");
      const noteForClient = formData.noteForClient || "";
      payload.noteForSystem = noteForSystem;
      payload.noteForClient = noteForClient;
    } else {
      currentConfig.noteGroups.forEach((group) => {
        const systemNote = generateSystemNote(group.id);
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] =
          `${systemNote} - ${clientComment}`.trim();

        delete payload[group.systemNoteKey];
        delete payload[group.clientCommentKey];
      });

      if ((clientType || "").toLowerCase() !== "seller") {
        delete payload.obtainDaSeller;
        delete payload.obtainDaSellerDate;
      }
    }

    if (currentModule !== "commercial") {
      if (company === "vkl") {
        payload.matterNumber = matterNumber;
      } else if (company === "idg") {
        payload.orderId = matterNumber;
      }
    }
    saveStage(payload);
  }

  const renderField = (field) => (
    <div key={field.name} className="mt-5">
      <div className="flex gap-4 justify-between items-center mb-2">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {field.name === "vendorDisclosure"
            ? (() => {
                const getVendorDisclosureLabel = (stateVal) => {
                  if (!stateVal) return "Vendor Disclosure";
                  const s = String(stateVal).trim().toUpperCase();
                  if (s === "VIC" || s.includes("VIC"))
                    return "Vendor Disclosure (S32)";
                  if (s === "QLD" || s.includes("QLD"))
                    return "Vendor Disclosure (Form 2)";
                  if (s === "SA" || s.includes("SA"))
                    return "Vendor Disclosure (Form 1)";
                  if (s === "NSW" || s.includes("NSW"))
                    return "Vendor Disclosure (S10.7)";
                  return "Vendor Disclosure";
                };
                const stateFromData =
                  (data && data.state) || (formData && formData.state) || "";
                return getVendorDisclosureLabel(stateFromData);
              })()
            : field.label}
        </label>

        {field.type === "radio" && (
          <div
            className={`w-[90px] h-[18px] ${bgcolor(
              statuses[field.name]
            )} flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[10px] md:text-[12px] whitespace-nowrap">
              {statuses[field.name]}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
        {field.type === "text" ? (
          <input
            type="text"
            name={field.name}
            className="w-full rounded p-2 bg-gray-100 text-sm md:text-base"
            value={formData[field.name] ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        ) : field.name === "agent" ? (
          <select
            name={field.name}
            className={
              localStorage.getItem("role") !== "admin"
                ? "bg-gray-100 p-2 text-gray-500 rounded w-full"
                : "bg-white p-2 border rounded w-full"
            }
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={localStorage.getItem("role") !== "admin"}
          >
            <option value="">Select Agent</option>
            {/* Add check for user prop to prevent crash */}
            {user &&
              user.map((agent) => (
                <option
                  key={agent._id}
                  value={agent._id + "-" + agent.displayName}
                >
                  {agent.displayName}
                </option>
              ))}
          </select>
        ) : // For Vendor Disclosure, only show "Yes" and "No" options
        field.name === "vendorDisclosure" ? (
          ["Yes", "No"].map((val) => (
            <label
              key={val}
              className="flex items-center gap-2 text-sm md:text-base"
            >
              <input
                type="radio"
                name={field.name}
                value={val}
                checked={(() => {
                  const formValue = formData[field.name] ?? "";
                  if (field.name === "vendorDisclosure") {
                    const displayValue =
                      getVendorDisclosureDisplayValue(formValue);
                    return displayValue === val;
                  }
                  return normalizeValue(formValue) === normalizeValue(val);
                })()}
                onChange={() => handleChange(field.name, val)}
              />
              {val}
            </label>
          ))
        ) : (
          // For other fields, show all options
          ["Yes", "No", "Processing", "N/R"].map((val) => (
            <label
              key={val}
              className="flex items-center gap-2 text-sm md:text-base"
            >
              <input
                type="radio"
                name={field.name}
                value={val}
                checked={(() => {
                  const formValue = formData[field.name] ?? "";
                  if (field.name === "vendorDisclosure") {
                    const displayValue =
                      getVendorDisclosureDisplayValue(formValue);
                    return displayValue === val;
                  }
                  return normalizeValue(formValue) === normalizeValue(val);
                })()}
                onChange={() => handleChange(field.name, val)}
              />
              {val}
            </label>
          ))
        )}

        {field.hasDate && (
          <input
            type="date"
            value={formData[field.dateFieldName] ?? ""}
            onChange={(e) => handleChange(field.dateFieldName, e.target.value)}
            className="ml-2 p-1 border rounded"
          />
        )}
      </div>
    </div>
  );

  const renderNoteGroup = (group) => (
    <div key={group.id}>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          {group.systemNoteLabel}
        </label>
        <input
          disabled
          className="w-full rounded p-2 bg-gray-100"
          value={generateSystemNote(group.id)}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          {group.clientCommentLabel}
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={formData[group.clientCommentKey] || ""}
          onChange={(e) => handleChange(group.clientCommentKey, e.target.value)}
        />
      </div>
    </div>
  );

  const renderCommercialNotes = () => (
    <div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          System Note for Client
        </label>
        <input
          disabled
          className="w-full rounded p-2 bg-gray-100"
          value={generateSystemNote("main")}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          Comment for Client
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={formData.noteForClient || ""}
          onChange={(e) => handleChange("noteForClient", e.target.value)}
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
      {currentConfig.fields.map((field) => {
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return null;
        }
        return renderField(field);
      })}

      {/* Render notes based on module */}
      {currentModule === "commercial"
        ? renderCommercialNotes()
        : currentConfig.noteGroups.map(renderNoteGroup)}

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

Stage2.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  clientType: PropTypes.string,
  user: PropTypes.array,
};
