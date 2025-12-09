import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";

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

  const hasLoadedData = useRef(false);

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [noteForClient, setNoteForClient] = useState("");

  const company = useMemo(() => localStorage.getItem("company") || "vkl", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const api = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  const fields = useMemo(() => {
    if (currentModule === "commercial") {
      return formConfig.commercial.fields;
    } else if (company === "vkl") {
      return formConfig.vkl.fields;
    } else if (company === "idg") {
      return formConfig.idg.fields;
    }
    return [];
  }, [currentModule, company]);

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
        if (
          field.type === "text" &&
          (!formState[field.key] || formState[field.key].trim() === "")
        ) {
          return true;
        }
        if (field.type === "radio") {
          return !greenValues.has(normalizeValue(formState[field.key] || ""));
        }
        return false;
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not received`;
  }, [fields, formState, normalizeValue]);

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
      const stage3Data = data.stages.find((stage) => stage.stageNumber === 3);
      if (stage3Data) {
        stageData = { ...data, ...stage3Data };
      }
    }
    return stageData;
  }, [data, currentModule, matterNumber, commercialApi]);

  const { data: stageData, isLoading } = useQuery({
    queryKey: ["stageData", 3, matterNumber, currentModule],
    queryFn: fetchStageData,
    enabled: !!data,
  });

  useEffect(() => {
    // Only initialize once per matter to avoid clobbering user's in-progress edits
    if (!stageData || hasLoadedData.current) return;

    try {
      const newFormState = {};
      const newStatusState = {};
      let loadedSystemNote = "";
      let loadedClientComment = "";

      fields.forEach(({ key, hasDate, type }) => {
        const rawValue = stageData[key] ?? "";
        // For radio keep the normalized option text (consistent with other stages)
        newFormState[key] =
          type === "radio" ? normalizeValue(rawValue) : rawValue ?? "";
        newStatusState[key] = getStatus(newFormState[key]);

        if (hasDate) {
          newFormState[`${key}Date`] = stageData[`${key}Date`]
            ? String(stageData[`${key}Date`]).split("T")[0]
            : "";
        }
      });

      if (currentModule === "commercial") {
        loadedSystemNote = stageData.noteForSystem ?? "";
        loadedClientComment = stageData.noteForClient ?? "";
      } else {
        const noteString = stageData.noteForClient ?? "";
        const noteParts = noteString
          .split(" - ")
          .filter((part) => part.trim() !== "");
        loadedSystemNote = noteParts[0]?.trim() || "";
        loadedClientComment =
          noteParts.length > 1 ? noteParts.slice(1).join(" - ").trim() : "";
      }

      // ensure all expected keys exist (prevents uncontrolled -> controlled warnings)
      fields.forEach(({ key, hasDate }) => {
        if (newFormState[key] === undefined || newFormState[key] === null) {
          newFormState[key] = "";
        }
        if (hasDate && newFormState[`${key}Date`] === undefined) {
          newFormState[`${key}Date`] = "";
        }
      });

      setFormState(newFormState);
      setStatusState(newStatusState);
      setNoteForClient(loadedClientComment);

      // store deep-cloned original snapshot for comparisons (Stage6 pattern)
      originalData.current = JSON.parse(
        JSON.stringify({
          ...newFormState,
          noteForSystem: loadedSystemNote,
          noteForClient: loadedClientComment,
        })
      );

      hasLoadedData.current = true;
    } catch (error) {
      toast.error("Failed to load stage data");
    }
  }, [
    stageData,
    fields,
    getStatus,
    normalizeValue,
    currentModule,
    matterNumber,
  ]);

  const handleChange = useCallback(
    (key, value) => {
      const fieldConfig = fields.find((f) => f.key === key);
      let processedValue = value;
      if (
        fieldConfig &&
        fieldConfig.type === "radio" &&
        typeof processedValue === "string"
      ) {
        processedValue = normalizeValue(processedValue);
      }
      setFormState((prev) => ({ ...(prev || {}), [key]: processedValue }));
      setStatusState((prev) => ({
        ...(prev || {}),
        [key]: getStatus(processedValue),
      }));
    },
    [fields, normalizeValue, getStatus]
  );

  const isChanged = () => {
    const original = originalData.current || {};
    // If we don't have an original snapshot, consider any filled value a change
    if (!original || Object.keys(original).length === 0) {
      const anyFilled = Object.keys(formState || {}).some(
        (k) => formState[k] !== undefined && String(formState[k]).trim() !== ""
      );
      return (
        anyFilled || (noteForClient && String(noteForClient).trim() !== "")
      );
    }

    // Compare form JSON and notes (deep equality via JSON)
    try {
      const currentFormJSON = JSON.stringify(formState || {});
      const originalFormJSON = JSON.stringify(
        Object.keys(original).reduce((acc, k) => {
          if (!k.startsWith("noteFor")) acc[k] = original[k];
          return acc;
        }, {})
      );

      const formChanged = currentFormJSON !== originalFormJSON;

      const dateChanged = fields.some(
        ({ key, hasDate }) =>
          hasDate &&
          String(formState[`${key}Date`] || "").trim() !==
            String(original[`${key}Date`] || "").trim()
      );

      const noteForClientChanged =
        String(noteForClient).trim() !==
        String(original.noteForClient || "").trim();

      const normalizeSystemNote = (note) => {
        if (!note) return "";
        return String(note)
          .replace(/\s*-\s*$/, "")
          .trim();
      };

      const currentSystemNote = normalizeSystemNote(generateSystemNote());
      const originalSystemNote = normalizeSystemNote(
        original.noteForSystem || ""
      );
      const noteForSystemChanged =
        currentSystemNote !== originalSystemNote &&
        (formChanged || dateChanged);

      return (
        formChanged ||
        dateChanged ||
        noteForClientChanged ||
        noteForSystemChanged
      );
    } catch (e) {
      return true;
    }
  };

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

    // optimistic update
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
      await queryClient.cancelQueries({ queryKey: ["viewClients", moduleKey] });

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

      // apply optimistic updates to clientData
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

      // apply optimistic updates to clientMatter
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

      // apply optimistic updates to viewClients listing
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

      // optimistic onStageUpdate so StagesLayout re-renders immediately
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

      // rollback caches
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

      // rollback local snapshot if possible
      if (context?.previousClientData) {
        originalData.current = {
          ...(context.previousClientData[`stage${stageNumber}`] || {}),
        };
      }

      let errorMessage = "Failed to save Stage 3. Please try again.";
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
      const moduleKey = localStorage.getItem("currentModule") || currentModule;

      try {
        queryClient.setQueryData(
          ["clientData", matterNumber, companyKey, moduleKey],
          (old) => {
            if (!old) {
              const base = { ...(res || {}) };
              base[`stage${stageNumber}`] =
                base[`stage${stageNumber}`] || res.stageData || {};
              return base;
            }
            const merged = { ...old };
            merged[`stage${stageNumber}`] = {
              ...(old[`stage${stageNumber}`] || {}),
              ...(res[`stage${stageNumber}`] || res.stageData || {}),
            };
            if (payload.colorStatus && merged[`stage${stageNumber}`]) {
              merged[`stage${stageNumber}`].colorStatus = payload.colorStatus;
            }
            return merged;
          }
        );
      } catch (e) {
        queryClient.invalidateQueries([
          "clientData",
          matterNumber,
          companyKey,
          moduleKey,
        ]);
      }

      try {
        queryClient.setQueryData(["clientMatter", matterNumber], (old) => {
          if (!old) {
            return { [`stage${stageNumber}`]: { ...(res.stageData || {}) } };
          }
          const merged = { ...old };
          merged[`stage${stageNumber}`] = {
            ...(old[`stage${stageNumber}`] || {}),
            ...(res[`stage${stageNumber}`] || res.stageData || {}),
          };
          if (payload.colorStatus && merged[`stage${stageNumber}`]) {
            merged[`stage${stageNumber}`].colorStatus = payload.colorStatus;
          }
          return merged;
        });
      } catch (e) {
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
      } catch (e) {
        queryClient.invalidateQueries(["viewClients", moduleKey]);
      }

      try {
        toast.success("Stage 3 Saved Successfully!", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      } catch (e) {
        // non-critical - swallow any toast errors
      }

      if (company === "vkl") {
        console.log("Stage 3 saved - performing hard reload...");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }

      // refetch per-stage data in background
      try {
        queryClient.invalidateQueries({
          queryKey: ["stageData", 3, matterNumber, moduleKey],
        });
      } catch (e) {
        // ignore
      }

      // update local snapshot
      originalData.current = {
        ...formState,
        noteForSystem: generateSystemNote(),
        noteForClient: noteForClient,
      };

      if (onStageUpdate) {
        try {
          onStageUpdate(payload, stageNumber);
        } catch (e) {
          // ignore
        }
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
    if (!isChanged() || isSaving) return;

    let payload = { ...formState };
    const systemNote = generateSystemNote();

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
      const fullNote = noteForClient
        ? `${systemNote} - ${noteForClient}`
        : systemNote;
      payload.noteForClient = fullNote;

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
            value={formState[key] ?? ""}
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
                  normalizeValue(formState[key] ?? "") === normalizeValue(val)
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
            value={formState[`${key}Date`] ?? ""}
            onChange={(e) =>
              setFormState((prev) => ({
                ...(prev || {}),
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
          value={generateSystemNote()}
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
