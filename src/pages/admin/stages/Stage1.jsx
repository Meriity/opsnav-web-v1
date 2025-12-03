import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import CommercialAPI from "../../../api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Configuration object for different clients
const formConfig = {
  vkl: [
    { name: "referral", label: "Referral", type: "text" },
    {
      name: "retainer",
      label: "Retainer",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "declarationForm",
      label: "Declaration form",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "contractReview",
      label: "Contract Review",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "quoteType",
      label: "Quote Type",
      type: "radio",
      options: ["Variable", "Fixed"],
    },
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "text" },
    {
      name: "tenants",
      label: "Tenants",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
  ],
  idg: [
    {
      name: "customerDetailsVerified",
      label: "Verify Customer Details",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "distanceFeasibility",
      label: "Check Distance / Feasibility",
      type: "text",
    },
    {
      name: "timeline",
      label: "Timeline / Deadline",
      type: "text",
    },
    {
      name: "customerAcceptedQuote",
      label: "Confirm Customer Acceptance of Quote",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "approvalStatus",
      label: "Approve or reject order for planning",
      type: "radio",
      options: ["Approved", "Rejected", "Pending"],
    },
  ],
  commercial: [
    { name: "referral", label: "Referral", type: "text" },
    {
      name: "retainer",
      label: "Retainer",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "contractReview",
      label: "Contract Review",
      type: "radio",
      options: ["Yes", "No", "Processing", "N/R"],
    },
    {
      name: "quoteType",
      label: "Quote Type",
      type: "radio",
      options: ["Fixed", "Variable"],
    },
    { name: "quoteAmount", label: "Quote amount (incl GST)", type: "text" },
  ],
};

// Common fields for all clients
const commonFields = [
  { name: "systemNote", label: "System note for client", type: "system-note" },
  { name: "clientComment", label: "Comment for client", type: "textarea" },
];

export default function Stage1({
  changeStage,
  data,
  stageNumber = 1,
  onStageUpdate,
}) {
  const [formData, setFormData] = useState({});

  const [statuses, setStatuses] = useState({});
  const originalData = useRef({});
  const hasLoadedData = useRef(false);

  const stage = 1;
  const { matterNumber } = useParams();

  // Memoize API instances so they are stable
  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  // Stabilize company + fields so they can be safely used in hooks' deps
  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  // Safely get current fields, including IDG admin logic
  const currentFields = useMemo(() => {
    let baseFields;

    if (currentModule === "commercial") {
      baseFields = formConfig.commercial || formConfig.vkl;
    } else {
      baseFields = formConfig[company] || formConfig.vkl;
    }

    // Safely add IDG admin fields without mutating the original config
    if (
      company === "idg" &&
      (localStorage.getItem("role") === "admin" ||
        localStorage.getItem("role") === "superadmin")
    ) {
      const hasCostingFields = baseFields.some(
        (field) => field.name === "costing_amount"
      );

      if (!hasCostingFields) {
        // Return a *new* array
        return [
          ...baseFields,
          {
            name: "costingType",
            label: "Confirm Costing Type",
            type: "radio",
            options: ["Fixed", "Variable"],
          },
          {
            name: "costing_amount",
            label: "Costing Amount",
            type: "text",
          },
        ];
      }
    }
    return baseFields;
  }, [company, currentModule]);

  // Helper to normalize/standardize values for comparison and storage
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
      const completed = new Set([
        "yes",
        "nr",
        "n/r",
        "na",
        "n/a",
        "variable",
        "fixed",
        "approved",
      ]);
      if (completed.has(val)) return "Completed";
      if (val === "no") return "Not Completed";
      if (["processing", "inprogress", "pending"].includes(val))
        return "In Progress";
      if (val.length > 0) return "Completed";
      return "Not Completed";
    },
    [normalizeValue]
  );

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  }

  function extractNotes(note = "") {
    const [systemNote = "", clientComment = ""] = note
      .split(" - ")
      .map((str) => str.trim());
    return { systemNote, clientComment };
  }

  const generateSystemNote = () => {
    const radioFields = currentFields.filter((field) => field.type === "radio");
    const textFields = currentFields.filter((field) => field.type === "text");
    const greenValues = new Set([
      "yes",
      "nr",
      "na",
      "variable",
      "fixed",
      "approved",
    ]);

    // radio fields not received
    const notReceivedRadio = radioFields
      .filter(
        (field) => !greenValues.has(normalizeValue(formData[field.name] || ""))
      )
      .map((field) => field.label);

    // text fields not received (empty or whitespace)
    const notReceivedText = textFields
      .filter(
        (field) =>
          !formData[field.name] || formData[field.name].toString().trim() === ""
      )
      .map((field) => field.label);

    const notReceived = [...notReceivedRadio, ...notReceivedText];

    if (notReceived.length === 0) {
      return "Tasks completed";
    }
    if (notReceived.length === 1) {
      return `${notReceived[0]} not received`;
    }
    return `${notReceived.join(", ")} not received`;
  };

  const queryClient = useQueryClient();
  const fetchStageData = useCallback(async () => {
    if (!matterNumber) return null;

    let stageData = data;

    if (currentModule === "commercial") {
      try {
        const stageResponse = await commercialApi.getStageData(1, matterNumber);

        if (stageResponse && stageResponse.data) {
          stageData = { ...data, ...stageResponse.data };
        } else if (stageResponse) {
          stageData = { ...data, ...stageResponse };
        }
      } catch (error) {
        console.log("No existing stage 1 data found, using default data");
      }
    }
    return stageData;
  }, [matterNumber, currentModule, data, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 1, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!matterNumber,
  });

  useEffect(() => {
    // Don't reload if we've already loaded initial data (prevents clobbering user selection)
    if (!stageData || hasLoadedData.current) return;

    const { systemNote, clientComment } = extractNotes(stageData.noteForClient);
    const initialFormData = {};
    const initialStatuses = {};

    currentFields.forEach((field) => {
      const raw = stageData[field.name];

      if (field.name === "quoteAmount") {
        initialFormData[field.name] =
          stageData[field.name]?.$numberDecimal || stageData[field.name] || "";
      } else {
        if (field.type === "radio") {
          // Normalize and map stored value back to one of the configured options when possible
          const rawVal = raw ?? "";
          const normalizedValue = normalizeValue(rawVal);
          const fieldConfig = currentFields.find((f) => f.name === field.name);
          let chosen = "";
          if (fieldConfig && fieldConfig.options) {
            const exactOption = fieldConfig.options.find(
              (opt) => normalizeValue(opt) === normalizedValue
            );
            chosen = exactOption || (rawVal ? String(rawVal) : "");
          } else {
            chosen = rawVal ?? "";
          }
          initialFormData[field.name] = chosen;
        } else {
          initialFormData[field.name] = raw ?? "";
        }
      }

      if (field.type === "radio") {
        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
      }
    });

    currentFields.forEach((field) => {
      if (
        initialFormData[field.name] === undefined ||
        initialFormData[field.name] === null
      ) {
        initialFormData[field.name] = "";
      }
    });

    initialFormData.systemNote = systemNote;
    initialFormData.clientComment = clientComment || "";

    setFormData(initialFormData);
    setStatuses(initialStatuses);

    // Keep originalData in the same shape Stage6 uses so isChanged can compare reliably
    originalData.current = {
      formData: JSON.parse(JSON.stringify(initialFormData)),
      noteForClient: clientComment || "",
      noteForSystem: systemNote || "",
    };

    // Mark we've loaded initial data once
    hasLoadedData.current = true;

    // Reset loaded flag when matterNumber changes (cleanup handled below)
  }, [stageData, currentFields, getStatus, normalizeValue, matterNumber]);

  // Reset the loaded flag whenever matterNumber changes (so new matter can reload)
  useEffect(() => {
    hasLoadedData.current = false;
  }, [matterNumber]);

  const handleChange = useCallback(
    (field, value) => {
      const fieldConfig = currentFields.find((f) => f.name === field);

      let processedValue = value;

      // For radios we prefer the exact option text (Stage6 pattern)
      if (fieldConfig && fieldConfig.type === "radio") {
        processedValue = value;
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

      setFormData((prev) => {
        const next = { ...(prev || {}), [field]: processedValue };
        return next;
      });
    },
    [currentFields, getStatus]
  );

  function isChanged() {
    // If we don't have an original snapshot, consider whether the current form has any filled values
    const original = originalData.current || {};
    if (!original.formData) {
      // If user has entered anything at all, that's a change
      const anyFilled = Object.keys(formData || {}).some(
        (k) => formData[k] !== undefined && String(formData[k]).trim() !== ""
      );
      return (
        anyFilled ||
        (formData.clientComment && String(formData.clientComment).trim() !== "")
      );
    }

    // Deep compare JSON of the form states (Stage6 approach)
    try {
      const currentFormJSON = JSON.stringify(formData || {});
      const originalFormJSON = JSON.stringify(original.formData || {});
      const clientNoteCurrent = (formData.clientComment || "").trim();
      const clientNoteOriginal = (original.noteForClient || "").trim();
      const systemNoteChanged =
        (generateSystemNote() || "").trim() !==
        (original.noteForSystem || "").trim();

      return (
        currentFormJSON !== originalFormJSON ||
        clientNoteCurrent !== clientNoteOriginal ||
        systemNoteChanged
      );
    } catch (e) {
      // fallback to conservative true if stringify fails
      return true;
    }
  }

  // 4. USE THE useMutation HOOK
  const { mutate: saveStage, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => {
      if (currentModule === "commercial") {
        return commercialApi.upsertStage(1, matterNumber, payload);
      } else if (company === "vkl") {
        payload.matterNumber = matterNumber;
        return api.upsertStageOne(payload);
      } else if (company === "idg") {
        payload.orderId = matterNumber;
        return api.upsertIDGStages(payload.orderId, 1, payload);
      }
    },

    // Perform optimistic updates
    onMutate: async (payload) => {
      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;

      // cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["clientData", matterNumber, companyKey, moduleKey],
      });
      await queryClient.cancelQueries({
        queryKey: ["clientMatter", matterNumber],
      });
      await queryClient.cancelQueries({
        queryKey: ["viewClients", moduleKey],
      });

      // snapshot previous values
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

      const optimisticColor = payload.colorStatus;

      // apply optimistic updates
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
      } else {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, moduleKey],
          { [`stage${stageNumber}`]: { colorStatus: optimisticColor } }
        );
      }

      if (previousClientMatter) {
        queryClient.setQueryData(["clientMatter", matterNumber], (old) => {
          const copy = { ...(old || {}) };
          copy[`stage${stageNumber}`] = {
            ...(copy[`stage${stageNumber}`] || {}),
            colorStatus: optimisticColor,
          };
          return copy;
        });
      } else {
        queryClient.setQueryData(["clientMatter", matterNumber], {
          [`stage${stageNumber}`]: { colorStatus: optimisticColor },
        });
      }

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

      // fire the immediate callback so StagesLayout re-renders
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

    onError: (err, payload, context) => {
      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;

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

      if (context?.previousClientData) {
        originalData.current = {
          ...(context.previousClientData[`stage${stageNumber}`] || {}),
        };
      }

      let errorMessage = "Failed to save Stage 1. Please try again.";
      if (err?.response?.data?.message)
        errorMessage = err.response.data.message;
      else if (err?.message) errorMessage = err.message;
      toast.error(errorMessage);
    },

    onSuccess: (responseData, payload) => {
      const res = responseData?.data || responseData;

      localStorage.setItem("current_stage", "1");

      try {
        sessionStorage.setItem("opsnav_clients_should_reload", "1");
      } catch (e) {}

      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;

      const currentFormDataSnapshot = { ...formData };

      try {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, moduleKey],
          (old) => {
            const stageProp = `stage${stageNumber}`;
            const stagePayload =
              (res && (res[stageProp] || res.stageData)) ||
              (res &&
                Object.keys(res).reduce((acc, key) => {
                  if (
                    currentFields.some((field) => field.name === key) ||
                    key === "colorStatus" ||
                    key === "noteForClient" ||
                    key === "noteForSystem"
                  ) {
                    const value = res[key];
                    if (
                      currentFields.find(
                        (f) => f.name === key && f.type === "radio"
                      )
                    ) {
                      // For radio fields, ensure we have the exact option value
                      const fieldConfig = currentFields.find(
                        (f) => f.name === key
                      );
                      const normalizedValue = normalizeValue(value);
                      const exactOption = fieldConfig.options.find(
                        (opt) => normalizeValue(opt) === normalizedValue
                      );
                      acc[key] = exactOption || currentFormDataSnapshot[key];
                    } else {
                      acc[key] = value;
                    }
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
      } catch (err) {
        queryClient.invalidateQueries([
          "clientData",
          matterNumber,
          companyKey,
          moduleKey,
        ]);
      }

      try {
        queryClient.setQueryData(["clientMatter", matterNumber], (old) => {
          const stageProp = `stage${stageNumber}`;
          const stagePayload =
            (res && (res[stageProp] || res.stageData)) ||
            (res &&
              Object.keys(res).reduce((acc, key) => {
                if (
                  currentFields.some((field) => field.name === key) ||
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
        });
      } catch (err) {
        queryClient.invalidateQueries(["clientMatter", matterNumber]);
      }

      try {
        queryClient.setQueryData(["viewClients", moduleKey], (list) => {
          if (!Array.isArray(list)) return list;
          return list.map((c) => {
            if (String(c.matterNumber) !== String(matterNumber)) return c;
            const updated = { ...c };
            if (payload.colorStatus) {
              updated[`stage${stageNumber}`] = updated[`stage${stageNumber}`]
                ? {
                    ...updated[`stage${stageNumber}`],
                    colorStatus: payload.colorStatus,
                  }
                : { colorStatus: payload.colorStatus };
              if (moduleKey === "commercial")
                updated.colorStatus = payload.colorStatus;
            }
            return updated;
          });
        });
      } catch (err) {
        queryClient.invalidateQueries(["viewClients", moduleKey]);
      }

      originalData.current = { ...currentFormDataSnapshot };

      if (onStageUpdate) {
        try {
          onStageUpdate(
            { ...payload, colorStatus: payload.colorStatus },
            stageNumber
          );
        } catch (e) {
          // ignore
        }
      }

      const statusMap = {
        green: "Completed",
        red: "Not Completed",
        amber: "In Progress",
      };
      const newStatus = statusMap[payload.colorStatus] || "Not Completed";
      const currentStatuses = JSON.parse(
        localStorage.getItem("stageStatuses") || "{}"
      );
      currentStatuses[`status${stageNumber}`] = newStatus;
      localStorage.setItem("stageStatuses", JSON.stringify(currentStatuses));

      try {
        toast.success("Stage 1 Saved Successfully!", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      } catch (e) {
        // non-critical: swallow toast errors
      }

      try {
        queryClient.invalidateQueries({
          queryKey: ["stageData", 1, matterNumber, moduleKey],
        });
      } catch (err) {
        // ignore
      }
    },

    onSettled: () => {
      const companyKey = localStorage.getItem("company") || company;
      const moduleKey = localStorage.getItem("currentModule") || currentModule;
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
    // Snapshot the current formData to avoid races with async setState
    const snapshotFormData = { ...formData };

    if (!isChanged(snapshotFormData) || isSaving) return;

    const systemNote = generateSystemNote();
    let noteForClient = `${systemNote} - ${
      snapshotFormData.clientComment || ""
    }`.trim();

    let payload = {
      ...snapshotFormData,
    };
    currentFields.forEach((field) => {
      if (field.type === "radio" && payload[field.name]) {
        // Find the exact matching option value (case-sensitive)
        const exactValue = field.options.find(
          (opt) => normalizeValue(opt) === normalizeValue(payload[field.name])
        );
        if (exactValue) {
          payload[field.name] = exactValue;
        }
      }
    });

    if (currentModule === "commercial") {
      const commercialFields = [
        "referral",
        "retainer",
        "contractReview",
        "quoteType",
        "quoteAmount",
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
      payload.noteForSystem = systemNote;
      payload.noteForClient = noteForClient;

      const allCompleted = currentFields.every(
        (field) => getStatus(snapshotFormData[field.name]) === "Completed"
      );
      payload.colorStatus = allCompleted ? "green" : "amber";
    } else {
      payload.noteForClient = noteForClient;

      // --- NEW: compute colorStatus for non-commercial modules (VKL / IDG)
      // Mirror Stage2: if all relevant fields are completed, mark green, else amber.
      const relevantFields = currentFields.filter((f) => {
        // include all fields that matter for status (radio/text). Adjust if you
        // want to exclude some fields.
        return true;
      });
      const allCompleted = relevantFields.every(
        (f) => getStatus(snapshotFormData[f.name]) === "Completed"
      );
      payload.colorStatus = allCompleted ? "green" : "amber";
    }

    delete payload.systemNote;
    delete payload.clientComment;

    saveStage(payload);
  }
  const renderField = (field) => {
    switch (field.type) {
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
              className="w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base"
            />
          </div>
        );

      case "radio":
        return (
          <div key={field.name} className="mt-5">
            <div className="flex gap-4 justify-between items-center mb-3">
              <label className="block mb-1 text-sm md:text-base font-bold">
                {field.label}
              </label>
              <div
                className={`w-auto sm:w-[90px] h-[18px] ${bgcolor(
                  statuses[field.name]
                )} flex items-center justify-center rounded-4xl px-2`}
              >
                <p className="text-[10px] md:text-[12px] whitespace-nowrap">
                  {statuses[field.name]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2">
              {field.options.map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm md:text-base min-w-0"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={val}
                    checked={formData[field.name] === val}
                    onChange={() => handleChange(field.name, val)}
                  />
                  <span className="truncate">{val}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "system-note":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="text"
              value={generateSystemNote()}
              disabled
              className="w-full rounded p-2 bg-gray-100 text-sm md:text-base"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <textarea
              value={formData[field.name] ?? ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full min-w-0 rounded p-2 bg-gray-100 text-sm md:text-base resize-none"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // This isLoading now comes from useQuery
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-2 stage1-responsive">
      {currentFields.map((field) => renderField(field))}
      {commonFields.map((field) => renderField(field))}

      <div className="flex mt-10 justify-between items-center gap-2">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
        />
        <div className="flex gap-2">
          <Button
            // isSaving now comes from useMutation
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

      <style>{`
        @media (max-width: 768px) {
          .stage1-responsive { padding: 1rem 0.5rem; }
          .stage1-responsive label { font-size: 0.95rem !important; }
          .stage1-responsive input, .stage1-responsive textarea { font-size: 0.95rem !important; padding: 0.5rem !important; }
        }
        @media (max-width: 425px) {
          .stage1-responsive { padding: 0.5rem 0.25rem; }
          .stage1-responsive label { font-size: 0.9rem !important; }
          .stage1-responsive input, .stage1-responsive textarea { font-size: 0.9rem !important; padding: 0.4rem !important; }
        }
      `}</style>
    </div>
  );
}
