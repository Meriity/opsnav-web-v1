import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage6({ changeStage, data, reloadTrigger, setReloadTrigger }) {
  const stage = 6;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  const fieldMap = {
    noaToCouncilWater: "NOA to Council/Water",
    dutyPaid: "Duty Paid",
    finalLetterToClient: "Final Letter to Client",
    finalLetterToAgent: "Final Letter to Agent",
    invoiced: "Invoiced",
    closeMatter: "Close Matter"
  };

  const getStatus = (value) => {
    if (!value) return "In progress";
    const val = value.toLowerCase();
    if (val === "yes") return "Completed";
    if (val === "no") return "Not Completed";
    return "In progress";
  };

  const bgcolor = (status) => {
    switch (status) {
      case "In progress": return "bg-[#FFEECF]";
      case "Completed": return "bg-[#00A506]";
      case "Not Completed": return "bg-[#FF0000]";
      default: return "";
    }
  };

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [systemNote, setSystemNote] = useState("");
  const originalData = useRef({});

  useEffect(() => {
    if (!data) return;

    const newFormState = {};
    const newStatusState = {};

    Object.entries(fieldMap).forEach(([key, label]) => {
      const val = data[key] || "";
      newFormState[label] = val;
      newStatusState[label] = getStatus(val);
    });

    setFormState(newFormState);
    setStatusState(newStatusState);
    setSystemNote(data.noteForClient || "");

    originalData.current = {
      ...newFormState,
      systemNote: data.noteForClient || ""
    };
  }, [data, reloadTrigger]);

  function isChanged() {
    const current = {
      ...formState,
      systemNote
    };
    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  function generateSystemNote() {
    const incomplete = Object.entries(fieldMap).filter(([key, label]) => {
      return formState[label]?.toLowerCase() !== "yes";
    }).map(([key, label]) => label);

    if (incomplete.length === 0) return "All tasks completed";
    return `Pending: ${incomplete.join(", ")}`;
  }

  async function handleNextClick() {
    try {
      if (isChanged()) {
        const payload = {
          matterNumber,
          noteForClient: systemNote
        };

        Object.entries(fieldMap).forEach(([key, label]) => {
          payload[key] = formState[label];
        });

        console.log("Saving Stage 6:", payload);
        await api.upsertStageSix(payload);

        originalData.current = {
          ...formState,
          systemNote
        };

        setReloadTrigger?.(prev => !prev);
      }

      changeStage(stage + 1);
    } catch (err) {
      console.error("Failed to save Stage 6:", err);
    }
  }

  const renderRadioGroup = (label) => (
    <div key={label} className="mt-5">
      <div className="flex gap-4 items-center mb-2">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(statusState[label])} ${
            statusState[label] === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{statusState[label]}</p>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap items-center mb-3">
        {["Yes", "No", "Processing", "N/R"].map((val) => (
          <label key={val} className="flex items-center gap-2">
            <input
              type="radio"
              name={label}
              value={val}
              checked={formState[label]?.toLowerCase() === val.toLowerCase()}
              onChange={() => {
                setFormState({ ...formState, [label]: val });
                setStatusState({ ...statusState, [label]: getStatus(val) });
              }}
            />
            {val}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto">
      {Object.values(fieldMap).map((label) => renderRadioGroup(label))}

      {/* System Note */}
      <div className="mt-5">
        <div className="flex gap-4 items-center mb-3">
          <label className="block mb-1 text-base font-bold">System Note for Client</label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(getStatus(systemNote))} ${
              getStatus(systemNote) === "In progress" ? "text-[#FF9500]" : "text-white"
            } flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{getStatus(systemNote)}</p>
          </div>
        </div>
        <input
          type="text"
          value={systemNote}
          onChange={(e) => setSystemNote(e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* Buttons */}
      <div className="flex mt-10 justify-between">
        <Button label="Back" width="w-[100px]" onClick={() => changeStage(stage - 1)} />
        <Button label="Next" width="w-[100px]" onClick={handleNextClick} />
      </div>
    </div>
  );
}
