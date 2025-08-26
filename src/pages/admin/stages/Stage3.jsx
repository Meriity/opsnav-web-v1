import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function Stage3({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 3;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const [isSaving, setIsSaving] = useState(false);

  const fields = [
    { key: "titleSearch", label: "Title Search" },
    { key: "planImage", label: "Plan Image" },
    { key: "landTax", label: "Land Tax" },
    { key: "instrument", label: "Instrument" },
    { key: "rates", label: "Rates" },
    { key: "water", label: "Water" },
    { key: "ownersCorp", label: "Owners Corp" },
    { key: "pexa", label: "PEXA" },
    { key: "inviteBank", label: "Invite Bank" },
  ];

  const getStatus = (value) => {
    if (!value) return "Not Completed";
    const val = value.toLowerCase().trim();
    if (["yes", "na", "n/a", "nr", "n/r"].includes(val)) return "Completed";
    if (val === "no") return "Not Completed";
    if (["processing", "in progress"].includes(val)) return "In progress";
    return "Not Completed";
  };

  const bgcolor = (status) => {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  };

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [clientComment, setClientComment] = useState("");
  const originalData = useRef({});

  const updateNoteForClient = () => {
    const completedValues = ["yes", "na", "n/a", "nr", "n/r"];
    const incompleteTasks = fields
      .filter(
        ({ key }) => !completedValues.includes(formState[key]?.toLowerCase())
      )
      .map(({ label }) => label);

    if (incompleteTasks.length === 0) return "All tasks completed";
    if (incompleteTasks.length === fields.length) return "No tasks completed";
    return `Pending: ${incompleteTasks.join(", ")}`;
  };

  useEffect(() => {
    if (!data) return;

    const newFormState = {};
    const newStatusState = {};

    fields.forEach(({ key }) => {
      const value = data[key] || "";
      newFormState[key] = value;
      newStatusState[key] = getStatus(value);
    });

    const noteParts = data.noteForClient?.split(" - ") || [];
    const clientComment = noteParts.length > 1 ? noteParts[1].trim() : "";

    setFormState(newFormState);
    setStatusState(newStatusState);
    setClientComment(clientComment);

    originalData.current = {
      ...newFormState,
      clientComment,
      systemNote: noteParts[0]?.trim() || updateNoteForClient(),
    };
  }, [data, reloadTrigger]);

  function isChanged() {
    const currentSystemNote = updateNoteForClient();
    const current = {
      ...formState,
      clientComment,
      systemNote: currentSystemNote,
    };
    const original = originalData.current;

    // Compare all fields including the generated system note
    const formChanged = fields.some(
      ({ key }) =>
        String(formState[key] || "").trim() !==
        String(original[key] || "").trim()
    );
    const commentChanged =
      String(clientComment).trim() !== String(original.clientComment).trim();
    const noteChanged = currentSystemNote !== original.systemNote;

    return formChanged || commentChanged || noteChanged;
  }

  async function handleSave() {
    if (!isChanged()) return;

    setIsSaving(true);
    try {
      const systemNote = updateNoteForClient();
      const fullNote = clientComment
        ? `${systemNote} - ${clientComment}`
        : systemNote;

      const payload = {
        matterNumber,
        ...formState,
        noteForClient: fullNote,
      };

      await api.upsertStageThree(payload);

      // Update original data with current state after successful save
      originalData.current = {
        ...formState,
        clientComment,
        systemNote,
      };

      setReloadTrigger?.((prev) => !prev);
    } catch (err) {
      console.error("Failed to save Stage 3:", err);
    } finally {
      setIsSaving(false);
    }
  }

  const renderRadioGroup = ({ key, label }) => (
    <div className="mt-5" key={key}>
      <div className="flex gap-4 items-center justify-between mb-3">
        {/* Changed text-base to text-sm md:text-base */}
        <label className="block mb-1 text-sm md:text-base font-bold">
          {label}
        </label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(statusState[key])} ${
            statusState[key] === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          {/* Changed text-[12px] to text-[10px] md:text-[12px] */}
          <p className="text-[10px] md:text-[12px] whitespace-nowrap">
            {statusState[key]}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-4">
        {["Yes", "No", "Processing", "N/R"].map((val) => (
          // Added text-sm md:text-base for consistency
          <label
            key={val}
            className="flex items-center gap-2 text-sm md:text-base"
          >
            <input
              type="radio"
              name={key}
              value={val}
              checked={formState[key]?.toLowerCase() === val.toLowerCase()}
              onChange={() => {
                setFormState((prev) => ({ ...prev, [key]: val }));
                setStatusState((prev) => ({ ...prev, [key]: getStatus(val) }));
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

      <div className="mt-5">
        {/* Changed text-base to text-sm md:text-base */}
        <label className="block mb-1 text-sm md:text-base font-bold">
          System Note for Client
        </label>
        <input
          type="text"
          value={updateNoteForClient()}
          disabled
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>

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

      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
        />
        <div className="flex gap-2">
          <Button
            label={isSaving ? "Saving " : "Save"}
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
