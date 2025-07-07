import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";

export default function Stage3({ changeStage }) {
  const stage = 3;
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

  const fields = [
    "Title Search",
    "Plan Image",
    "Land Tax",
    "Instrument",
    "Rates",
    "Water",
    "Owners Corp",
    "PEXA",
    "Invite Bank"
  ];

  const [formState, setFormState] = useState(
    Object.fromEntries(fields.map((field) => [field, ""]))
  );
  const [statusState, setStatusState] = useState(
    Object.fromEntries(fields.map((field) => [field, "In progress"]))
  );

  const [systemNote, setSystemNote] = useState("");
  const [statusSystemNote, setStatusSystemNote] = useState("In progress");
  const [clientComment, setClientComment] = useState("");
  const [statusClientComment, setStatusClientComment] = useState("In progress");

  useEffect(() => {
    const mockApiResponse = {
      "Title Search": "Yes",
      "Plan Image": "No",
      "Land Tax": "Processing",
      "Instrument": "N/R",
      "Rates": "Yes",
      "Water": "No",
      "Owners Corp": "Yes",
      "PEXA": "Processing",
      "Invite Bank": "N/R",
      "systemNote": "PEXA pending",
      "clientComment": "Check title details"
    };

    const newFormState = {};
    const newStatusState = {};
    fields.forEach((field) => {
      newFormState[field] = mockApiResponse[field] || "";
      newStatusState[field] = getStatus(mockApiResponse[field]);
    });
    setFormState(newFormState);
    setStatusState(newStatusState);
    setSystemNote(mockApiResponse.systemNote);
    setStatusSystemNote(getStatus(mockApiResponse.systemNote));
    setClientComment(mockApiResponse.clientComment);
    setStatusClientComment(getStatus(mockApiResponse.clientComment));
  }, []);

  const renderRadioGroup = (label) => (
    <div className="mt-5">
      <div className="flex justify-between mb-3">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(statusState[label])} ${
            statusState[label] === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{statusState[label]}</p>
        </div>
      </div>
      <div className="flex justify-between flex-wrap items-center">
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
      {fields.map((field) => renderRadioGroup(field))}

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

      {/* Client Comment */}
      <div className="mt-5">
        <div className="flex justify-between mb-3">
          <label className="block mb-1 text-base font-bold">Comment for Client</label>
          <div
            className={`w-[90px] h-[18px] ${bgcolor(statusClientComment)} ${
              statusClientComment === "In progress" ? "text-[#FF9500]" : "text-white"
            } flex items-center justify-center rounded-4xl`}
          >
            <p className="text-[12px] whitespace-nowrap">{statusClientComment}</p>
          </div>
        </div>
        <textarea
          value={clientComment}
          onChange={(e) => {
            setClientComment(e.target.value);
            setStatusClientComment(getStatus(e.target.value));
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
