import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";

export default function Stage6({ changeStage }) {
  const stage = 6;

  const getStatus = (value) => {
    if (value === "Yes") return "Completed";
    if (value === "No") return "Not Completed";
    return "In progress";
  };

  function bgcolor(status) {
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
  }

  const radioFields = [
    "NOA to Council/Water",
    "Duty Paid",
    "Final Letter to Client",
    "Final Letter to Agent",
    "Invoiced",
    "Close Matter"
  ];

  const [formState, setFormState] = useState(
    Object.fromEntries(radioFields.map((field) => [field, ""]))
  );
  const [statusState, setStatusState] = useState(
    Object.fromEntries(radioFields.map((field) => [field, "In progress"]))
  );

  const [systemNote, setSystemNote] = useState("");
  const [statusSystemNote, setStatusSystemNote] = useState("In progress");

  useEffect(() => {
    const mockApiResponse = {
      "NOA to Council/Water": "Yes",
      "Duty Paid": "Yes",
      "Final Letter to Client": "No",
      "Final Letter to Agent": "Processing",
      "Invoiced": "Yes",
      "Close Matter": "N/R",
      systemNote: "Duty paid but NOA pending verification"
    };

    const newFormState = {};
    const newStatusState = {};
    radioFields.forEach((field) => {
      newFormState[field] = mockApiResponse[field] || "";
      newStatusState[field] = getStatus(mockApiResponse[field]);
    });

    setFormState(newFormState);
    setStatusState(newStatusState);
    setSystemNote(mockApiResponse.systemNote);
    setStatusSystemNote(getStatus(mockApiResponse.systemNote));
  }, []);

  const renderRadioGroup = (label) => (
    <div>
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
              checked={formState[label] === val}
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
      {radioFields.map((field) => renderRadioGroup(field))}

      {/* System Note */}
      <div className="mt-5">
        <div className="flex justify-between mb-3">
          <label className="block mb-1 text-base font-bold">System Note for Client</label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(statusSystemNote)} ${
              statusSystemNote === "In progress" ? "text-[#FF9500]" : "text-white"
            } flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{statusSystemNote}</p>
          </div>
        </div>
        <input
          type="text"
          value={systemNote}
          onChange={(e) => {
            setSystemNote(e.target.value);
            setStatusSystemNote(getStatus(e.target.value));
          }}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* Buttons */}
      <div className="flex mt-10 justify-between">
        <Button label="Back" width="w-[100px]" onClick={() => changeStage(stage - 1)} />
        <Button label="Next" width="w-[100px]" onClick={() => changeStage(stage + 1)} />
      </div>
    </div>
  );
}
