import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import WillsAPI from "@/api/willsAPI";
import VocatFasAPI from "@/api/vocatFasAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const formConfig = {
  conveyancing: {
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
  "print media": {
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
  wills: {
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
  vocat: {
    fields: [
      { key: "searchesAnalysis", label: "Searches Analysis", type: "radio", options: ["Yes", "No", "N/R"] },
      { key: "lettersFromParties", label: "Letters from relevant parties", type: "radio", options: ["Yes", "No", "N/R"] },
    ],
  },
};

export default function Stage3({
  changeStage,
  data,
  stageNumber = 3,
  setReloadTrigger,
  setHasChanges,
}) {
  const { matterNumber } = useParams();

  const api = new ClientAPI();
  const commercialApi = new CommercialAPI();
  const willsApi = new WillsAPI();
  const vocatApi = new VocatFasAPI();

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [noteForClient, setNoteForClient] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const originalData = useRef({});
  const hasLoaded = useRef(false);

  const currentModule = localStorage.getItem("currentModule");
  const isReadOnly = ["readonly", "read-only"].includes(localStorage.getItem("role"));

  const fields =
    currentModule === "commercial"
      ? formConfig.commercial.fields
      : formConfig[currentModule].fields;

  const normalizeValue = (v) =>
    v
      ? String(v)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]/g, "")
      : "";

  const getStatus = (value) => {
    const val = normalizeValue(value);
    if (!val) return "Not Completed";
    if (["yes", "nr", "na", "n/a", "n/r"].includes(val)) return "Completed";
    if (val === "no") return "Not Completed";
    if (["processing", "inprogress", "in progress"].includes(val))
      return "In Progress";
    return "Not Completed";
  };

  useEffect(() => {
    if (!data || hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
      // setIsLoading(true);

      let stageData = data;

      try {
        // if (currentModule === "commercial") {
        //   const res = await commercialApi.getStageData(3, matterNumber);
        //   stageData = res?.data ? { ...data, ...res.data } : data;
        // } else if (company === "vkl") {
        //   const res = await api.getStageThree(matterNumber);
        //   stageData = res?.data ? { ...data, ...res.data } : data;
        // } else if (company === "idg") {
        //   const res = await api.getIDGStages(matterNumber, 3);
        //   stageData = res?.data ? { ...data, ...res.data } : data;
        // }
      } catch {}

      const newForm = {};
      const newStatus = {};

      fields.forEach((f) => {
        const raw = stageData[f.key] ?? "";
        newForm[f.key] = f.type === "radio" ? normalizeValue(raw) : raw;
        newStatus[f.key] = getStatus(newForm[f.key]);

        if (f.hasDate) {
          newForm[`${f.key}Date`] = stageData[`${f.key}Date`]
            ? String(stageData[`${f.key}Date`]).split("T")[0]
            : "";
        }
      });

      const sysNote =
        currentModule === "commercial"
          ? stageData.noteForSystem || ""
          : (stageData.noteForClient || "").split(" - ")[0] || "";

      const clientNote =
        currentModule === "commercial"
          ? stageData.noteForClient || ""
          : (stageData.noteForClient || "").split(" - ").slice(1).join(" - ");

      setFormState(newForm);
      setStatusState(newStatus);
      setNoteForClient(clientNote || "");

      originalData.current = {
        ...newForm,
        noteForSystem: sysNote,
        noteForClient: clientNote,
      };

      setIsLoading(false);
      setHasChanges(false);
    };

    load();
  }, [data, currentModule, fields, api, commercialApi, matterNumber]);

  const generateSystemNote = () => {
    const green = new Set(["yes", "nr", "na", "n/a", "n/r"]);
    const missing = fields
      .filter((f) =>
        f.type === "text"
          ? !formState[f.key]?.trim()
          : !green.has(normalizeValue(formState[f.key] || ""))
      )
      .map((f) => f.label);

    return missing.length
      ? `${missing.join(" and ")} not received`
      : "Tasks completed";
  };

  const handleChange = (key, value) => {
    const field = fields.find((f) => f.key === key);
    const processed = field?.type === "radio" ? normalizeValue(value) : value;

    setFormState((prev) => ({ ...prev, [key]: processed }));
    setStatusState((prev) => ({ ...prev, [key]: getStatus(processed) }));
    setHasChanges(true);
  };

  const isChanged = () =>
    JSON.stringify(formState) !== JSON.stringify(originalData.current);

  const handleSave = async () => {
    if (isSaving || !isChanged()) return;

    setIsSaving(true);

    let payload = { ...formState };
    const systemNote = generateSystemNote();

    const allCompleted = fields.every(
      (f) => getStatus(formState[f.key]) === "Completed"
    );

    const colorStatus = allCompleted ? "green" : "amber";
    payload.colorStatus = colorStatus;

    if (currentModule === "commercial") {
      payload.noteForSystem = systemNote;
      payload.noteForClient = noteForClient || "";
      payload.matterNumber = matterNumber;
    } else {
      payload.noteForClient = noteForClient
        ? `${systemNote} - ${noteForClient}`
        : systemNote;

      fields.forEach((f) => {
        if (f.hasDate) {
          payload[`${f.key}Date`] = formState[`${f.key}Date`] || null;
        }
      });

      if (currentModule === "print media") {
        payload.orderId = matterNumber;
      } else {
        payload.matterNumber = matterNumber;
      }
    }

    try {
      if (currentModule === "commercial") {
        await commercialApi.upsertStage(3, matterNumber, payload);
      } else if (currentModule === "vocat") {
        payload.notes = payload.noteForClient;
        await vocatApi.saveStageThree(payload);
      } else if (currentModule === "print media") {
        await api.upsertIDGStages(matterNumber, 3, payload);
      } else if (currentModule === "wills") {
        await willsApi.upsertStage(3, matterNumber, payload);
      } else {
        await api.upsertStageThree(payload);
      }

      toast.success("Stage 3 Saved Successfully!");

      setReloadTrigger((p) => p + 1);

      originalData.current = {
        ...formState,
        noteForSystem: systemNote,
        noteForClient,
      };
      setHasChanges(false);
    } catch {
      toast.error("Failed to save Stage 3.");
    }

    setIsSaving(false);
  };

  useEffect(() => {
    const handleExternalSave = () => {
      handleSave();
    };

    window.addEventListener("saveCurrentStage", handleExternalSave);
    return () => {
      window.removeEventListener("saveCurrentStage", handleExternalSave);
    };
  }, [handleSave]);

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
      {fields.map((f) => (
        <div key={f.key} className="mt-5">
          <div className="flex justify-between items-center mb-3">
            <label className="font-bold text-sm xl:text-base">{f.label}</label>
            {f.type !== "text" && (
              <div
                className={`w-[90px] h-[18px] flex items-center justify-center rounded-4xl ${
                  statusState[f.key] === "Completed"
                    ? "bg-[#00A506] text-white"
                    : statusState[f.key] === "In Progress"
                    ? "bg-[#FFEECF] text-[#FF9500]"
                    : "bg-[#FF0000] text-white"
                }`}
              >
                <p className="text-[11px]">{statusState[f.key]}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {f.type === "text" ? (
              <input
                type="text"
                value={formState[f.key] || ""}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className={`border rounded p-2 w-full text-sm xl:text-base ${isReadOnly ? "bg-gray-200 text-gray-800 font-medium cursor-not-allowed" : ""}`}
                disabled={isReadOnly}
              />
            ) : (
              (f.options || ["Yes", "No", "Processing", "N/R"]).map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm xl:text-base">
                  <input
                    type="radio"
                    checked={
                      normalizeValue(formState[f.key]) === normalizeValue(v)
                    }
                    onChange={() => !isReadOnly && handleChange(f.key, v)}
                    disabled={false}
                    className={isReadOnly ? "accent-gray-500 w-4 h-4 pointer-events-none" : ""}
                  />
                  {v}
                </label>
              ))
            )}

            {f.hasDate && (
              <input
                type="date"
                value={formState[`${f.key}Date`] || ""}
                onChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    [`${f.key}Date`]: e.target.value,
                  }));
                  setHasChanges(true);
                }}
                className={`border p-1 rounded text-sm xl:text-base ${isReadOnly ? "bg-gray-200 text-gray-800 font-medium cursor-not-allowed" : ""}`}
                disabled={isReadOnly}
              />
            )}
          </div>
        </div>
      ))}

      <div className="mt-5">
        <label className="font-bold text-sm xl:text-base">System Note for Client</label>
        <input
          disabled
          value={generateSystemNote()}
          className="w-full rounded p-2 bg-gray-100 text-sm xl:text-base"
        />
      </div>

      <div className="mt-5">
        <label className="font-bold text-sm xl:text-base">Comment for Client</label>
        <textarea
          value={noteForClient}
          onChange={(e) => {
            setNoteForClient(e.target.value);
            setHasChanges(true);
          }}
          className={`w-full rounded p-2 bg-gray-100 text-sm xl:text-base ${isReadOnly ? "bg-gray-200 text-gray-800 font-medium cursor-not-allowed" : ""}`}
          disabled={isReadOnly}
        />
      </div>

      <div className="flex justify-between mt-10">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
          onClick={() => changeStage(stageNumber - 1)}
        />
        <div className="flex gap-2">
          {!isReadOnly && (
            <Button
              label={isSaving ? "Saving..." : "Save"}
              width="w-[100px] md:w-[100px]"
              bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
              onClick={handleSave}
              disabled={isSaving}
            />
          )}
          <Button
            label="Next"
            width="w-[70px]  md:w-[100px]"
            bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]"
            onClick={() => changeStage(stageNumber + 1)}
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
  setReloadTrigger: PropTypes.func.isRequired,
  setHasChanges: PropTypes.func.isRequired,
};
