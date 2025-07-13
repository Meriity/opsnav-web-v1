import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage4({ changeStage, data, reloadTrigger, setReloadTrigger }) {
  const stage = 4;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  const fieldMap = {
    dts: "DTS",
    dutyOnline: "Duty Online",
    soa: "SOA",
    frcgw: "FRCGW"
  };

  const getStatus = (value) => {
    if (!value) return "In progress";
    const val = value.toLowerCase();
    if (val === "yes") return "Completed";
    if (val === "no") return "Not Completed";
    return "In progress";
  };

  function bgcolor(status) {
    switch (status) {
      case "In progress": return "bg-[#FFEECF]";
      case "Completed": return "bg-[#00A506]";
      case "Not Completed": return "bg-[#FF0000]";
      default: return "";
    }
  }

  function extractNotes(note = "") {
    let systemNote = "", clientComment = "";
    if (typeof note === "string" && note.includes(" - ")) {
      [systemNote, clientComment] = note.split(" - ").map(str => str.trim());
    } else {
      systemNote = note || "";
    }
    return { systemNote, clientComment };
  }

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [contractPrice, setContractPrice] = useState("");
  const [systemNote, setSystemNote] = useState("");
  const [clientComment, setClientComment] = useState("");
  const originalData = useRef({});

  useEffect(() => {
    if (!data) return;

    const newFormState = {};
    const newStatusState = {};

    Object.keys(fieldMap).forEach((key) => {
      const val = data[key] || "";
      const label = fieldMap[key];
      newFormState[label] = val;
      newStatusState[label] = getStatus(val);
    });

    setFormState(newFormState);
    setStatusState(newStatusState);
    setContractPrice(data.contractPrice?.$numberDecimal || "");

    const { systemNote, clientComment } = extractNotes(data.noteForClient || "");
    setSystemNote(systemNote);
    setClientComment(clientComment);

    originalData.current = {
      ...newFormState,
      contractPrice,
      systemNote,
      clientComment
    };
  }, [data, reloadTrigger]);

  function isChanged() {
    const current = {
      ...formState,
      contractPrice,
      systemNote,
      clientComment
    };
    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  function generateSystemNote() {
    const incomplete = Object.keys(fieldMap).filter((key) => {
      const label = fieldMap[key];
      return formState[label]?.toLowerCase() !== "yes";
    }).map(key => fieldMap[key]);

    if (incomplete.length === 0) return "All tasks completed";
    return `Pending: ${incomplete.join(", ")}`;
  }

  async function handleNextClick() {
    try {
      if (isChanged()) {
        const payload = {
          matterNumber,
          contractPrice,
          noteForClient: `${generateSystemNote()} - ${clientComment}`
        };

        // Convert labeled formState back to key-based
        Object.keys(fieldMap).forEach((key) => {
          const label = fieldMap[key];
          payload[key] = formState[label];
        });

        console.log("Saving Stage 4:", payload);
        await api.upsertStageFour(payload);

        originalData.current = {
          ...formState,
          contractPrice,
          systemNote,
          clientComment
        };

        setReloadTrigger?.(prev => !prev);
      }

      changeStage(stage + 1);
    } catch (err) {
      console.error("Failed to save Stage 4:", err);
    }
  }

  const renderRadioGroup = (label) => (
    <div key={label} className="mt-5">
      <div className="flex justify-between mb-2">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(statusState[label])} ${
            statusState[label] === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{statusState[label]}</p>
        </div>
      </div>
      <div className="flex justify-between flex-wrap items-center mb-3">
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

      {/* Contract Price */}
      <div className="mt-5">
        <label className="block mb-1 text-base font-bold">Contract Price</label>
        <input
          type="number"
          value={contractPrice}
          onChange={(e) => setContractPrice(e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* System Note */}
      <div className="mt-5">
        <label className="block mb-1 text-base font-bold">System Note for Client</label>
        <input
          type="text"
          value={systemNote}
          disabled
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* Client Comment */}
      <div className="mt-5">
        <label className="block mb-1 text-base font-bold">Comment for Client</label>
        <textarea
          value={clientComment}
          onChange={(e) => setClientComment(e.target.value)}
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
