import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage3({ changeStage, data, reloadTrigger, setReloadTrigger }) {
  const stage = 3;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  const fields = [
    { key: "titleSearch", label: "Title Search" },
    { key: "planImage", label: "Plan Image" },
    { key: "landTax", label: "Land Tax" },
    { key: "instrument", label: "Instrument" },
    { key: "rates", label: "Rates" },
    { key: "water", label: "Water" },
    { key: "ownersCorp", label: "Owners Corp" },
    { key: "pexa", label: "PEXA" },
    { key: "inviteBank", label: "Invite Bank" }
  ];

  const getStatus = (value) => {
    if (!value) return "In progress";
    const val = value.toLowerCase();
    if (val === "yes") return "Completed";
    if (val === "no") return "Not Completed";
    return "In progress";
  };

  const bgcolor = (status) => {
    switch (status) {
      case "In progress":
        return "bg-[#FFEECF]";
      case "Completed":
        return "bg-[#00A506]";
      case "Not Completed":
        return "bg-[#FF0000]";
      default:
        return "";
    }
  };

  function extractNotes(note = "") {
    let systemNote = "";
    let clientComment = "";
    if (typeof note === "string" && note.includes(" - ")) {
      [systemNote, clientComment] = note.split(" - ").map((str) => str.trim());
    } else {
      systemNote = note || "";
    }
    return {
      systemNote: systemNote || "",
      clientComment: clientComment || ""
    };
  }

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [systemNote, setSystemNote] = useState("");
  const [clientComment, setClientComment] = useState("");
  const originalData = useRef({});

  useEffect(() => {
    if (!data) return;

    const newFormState = {};
    const newStatusState = {};

    fields.forEach(({ key }) => {
      const value = data[key] || "";
      newFormState[key] = value;
      newStatusState[key] = getStatus(value);
    });

    const { systemNote: sn, clientComment: cc } = extractNotes(data.noteForClient);

    setFormState(newFormState);
    setStatusState(newStatusState);
    setSystemNote(sn);
    setClientComment(cc);

    originalData.current = { ...newFormState, systemNote: sn, clientComment: cc };
  }, [data, reloadTrigger]);

  function isChanged() {
    const current = { ...formState, systemNote, clientComment };
    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  function checkFormStatus() {
    const values = Object.values(formState);
    const allYes = values.every((val) => val?.toLowerCase() === "yes");
    const anyFilled = values.some((val) => val?.trim() !== "");

    if (allYes) return "green";
    if (anyFilled) return "amber";
    return "red";
  }

  const updateNoteForClient = () => {
    const incomplete = fields
      .filter(({ key }) => formState[key]?.toLowerCase() !== "yes")
      .map(({ label }) => label);

    if (incomplete.length === 0) return "All tasks completed";
    return `Pending: ${incomplete.join(", ")}`;
  };

  async function handleNextClick() {
    try {
      if (isChanged()) {
        const payload = {
          matterNumber,
          ...formState,
          noteForClient: `${updateNoteForClient()} - ${clientComment}`,
        };

        console.log("Saving Stage 3:", payload);
        await api.upsertStageThree(payload);

        originalData.current = { ...formState, systemNote, clientComment };
        setReloadTrigger?.(prev => !prev);
      }
      changeStage(stage + 1);
    } catch (err) {
      console.error("Failed to save Stage 3:", err);
    }
  }

  const renderRadioGroup = ({ key, label }) => (
    <div className="mt-5" key={key}>
      <div className="flex gap-4 items-center mb-3">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(statusState[key])} ${
            statusState[key] === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{statusState[key]}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {["Yes", "No", "Processing", "N/R"].map((val) => (
          <label key={val} className="flex items-center gap-2">
            <input
              type="radio"
              name={key}
              value={val}
              checked={formState[key]?.toLowerCase() === val.toLowerCase()}
              onChange={() => {
                setFormState({ ...formState, [key]: val });
                setStatusState({ ...statusState, [key]: getStatus(val) });
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
      {fields.map(renderRadioGroup)}

      {/* System Note */}
      <div className="mt-5">
        <label className="block mb-1 text-base font-bold">System Note for Client</label>
        <input
          type="text"
          value={systemNote}
          disabled
          onChange={(e) => setSystemNote(e.target.value)}
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
