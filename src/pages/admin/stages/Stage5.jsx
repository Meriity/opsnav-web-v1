import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage5({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 5;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

  const fieldMap = {
    notifySoaToClient: "Notify SOA to Client",
    transferDocsOnPexa: "Transfer Docs on PEXA",
    gstWithholding: "GST Withholding",
    disbursementsInPexa: "Disbursements in PEXA",
    addAgentFee: "Add Agent Fee",
    settlementNotification: "Settlement Notification",
  };

  const getStatus = (value) => {
    if (!value) return "Not Completed"; // Default to red
    const val = value.toLowerCase().trim();
    if (
      val === "yes" ||
      val === "na" ||
      val === "n/a" ||
      val === "nr" ||
      val === "n/r"
    )
      return "Completed"; // Green
    if (val === "no") return "Not Completed"; // Red
    if (val === "processing" || val === "in progress") return "In Progress"; // Yellow
    return "Not Completed"; // Fallback to red
  };

  // function bgcolor(status) {
  //   switch (status) {
  //     case "In progress":
  //       return "bg-[#FFEECF]";
  //     case "Completed":
  //       return "bg-[#00A506]";
  //     case "Not Completed":
  //       return "bg-[#FF0000]";
  //     default:
  //       return "";
  //   }
  // }

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  }

  function extractNotes(note = "") {
    let systemNote = "",
      clientComment = "";
    if (typeof note === "string" && note.includes(" - ")) {
      [systemNote, clientComment] = note.split(" - ").map((str) => str.trim());
    } else {
      systemNote = note || "";
    }
    return { systemNote, clientComment };
  }

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [council, setCouncil] = useState("");
  const [systemNote, setSystemNote] = useState("");
  const [clientComment, setClientComment] = useState("");
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
    setCouncil(data.council || "");

    const { systemNote, clientComment } = extractNotes(
      data.noteForClient || ""
    );
    setSystemNote(systemNote);
    setClientComment(clientComment);

    originalData.current = {
      ...newFormState,
      council,
      systemNote,
      clientComment,
    };
  }, [data, reloadTrigger]);

  function isChanged() {
    const current = {
      ...formState,
      council,
      systemNote,
      clientComment,
    };
    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  function generateSystemNote() {
    const greenValues = ["yes", "na", "n/a", "nr", "n/r"];
    const incomplete = Object.entries(fieldMap)
      .filter(([key, label]) => {
        return !greenValues.includes(formState[label]?.toLowerCase());
      })
      .map(([key, label]) => label);

    if (incomplete.length === 0) return "All tasks completed";
    return `Pending: ${incomplete.join(", ")}`;
  }

  async function handleSave() {
    try {
      if (isChanged()) {
        const payload = {
          matterNumber,
          council,
          noteForClient: `${generateSystemNote()} - ${clientComment}`,
        };

        Object.entries(fieldMap).forEach(([key, label]) => {
          payload[key] = formState[label];
        });

        console.log("Saving Stage 5:", payload);
        await api.upsertStageFive(payload);

        originalData.current = {
          ...formState,
          council,
          systemNote,
          clientComment,
        };
        setReloadTrigger?.((prev) => !prev);
      }
    } catch (err) {
      console.error("Failed to save Stage 5:", err);
    }
  }

  const renderRadioGroup = (label) => (
    <div key={label} className="mt-5">
      <div className="flex gap-4 justify-between items-center mb-3">
        {/* Changed text-base to text-sm md:text-base */}
        <label className="block mb-1 text-sm md:text-base font-bold">
          {label}
        </label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(statusState[label])} ${
            statusState[label] === "In progress"
              ? "text-[#FF9500]"
              : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          {/* Changed text-[12px] to text-[10px] md:text-[12px] */}
          <p className="text-[10px] md:text-[12px] whitespace-nowrap">
            {statusState[label]}
          </p>
        </div>
      </div>
      <div className="flex gap-4 justify-between flex-wrap items-center">
        {["Yes", "No", "Processing", "N/R"].map((val) => (
          // Added text-sm md:text-base for consistency
          <label
            key={val}
            className="flex items-center gap-2 text-sm md:text-base"
          >
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

      {/* Council */}
      <div className="mt-5">
        {/* Changed text-base to text-sm md:text-base */}
        <label className="block mb-1 text-sm md:text-base font-bold">
          Council
        </label>
        <input
          type="text"
          value={council}
          onChange={(e) => setCouncil(e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* System Note */}
      <div className="mt-5">
        {/* Changed text-base to text-sm md:text-base */}
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

      {/* Client Comment */}
      <div className="mt-5">
        {/* Changed text-base to text-sm md:text-base */}
        <label className="block mb-1 text-sm md:text-base font-bold">
          Comment for Client
        </label>
        <textarea
          value={clientComment}
          onChange={(e) => setClientComment(e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

      {/* Buttons */}
      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
        />
        <div className="flex gap-2">
          <Button
            label="Save"
            width="w-[70px] md:w-[100px]"
            bg="bg-blue-500"
            onClick={handleSave}
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
