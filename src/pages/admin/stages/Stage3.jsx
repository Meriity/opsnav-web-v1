import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

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

  // fields config
  let fields = [];
  if (localStorage.getItem("company") === "vkl") {
    fields = [
      { key: "titleSearch", label: "Title Search", hasDate: true },
      { key: "planImage", label: "Plan Image" },
      { key: "landTax", label: "Land Tax" },
      { key: "instrument", label: "Instrument" },
      { key: "rates", label: "Rates" },
      { key: "water", label: "Water" },
      { key: "ownersCorp", label: "Owners Corp" },
      { key: "pexa", label: "PEXA" },
      { key: "inviteBank", label: "Invite Bank" },
    ];
  } else if (localStorage.getItem("company") === "idg") {
    fields = [
      { key: "agent", label: "Assign Agent / Team Member", type: "text" },
      {
        key: "materialsInStock",
        label: "Check if Materials Needed are in stock",
      },
      {
        key: "additionalMaterialsRequired",
        label: "Procure additional materials if required",
      },
      { key: "priority", label: "Confirm Job Priority", type: "text" },
      { key: "jobActivity", label: "Schedule Job Activity", type: "text" },
      { key: "status", label: "Confirm Job Status", type: "text" },
      {
        key: "vehicleAllocated",
        label: "Allocate Vehicle / Installer",
        type: "text",
      },
      {
        key: "draftCostSheet",
        label: "Finalize Draft Cost Sheet (Fixed + Variable)",
        type: "text",
      },
      // { key: "approvePlan", label: "Approve plan and move to preparation" },
    ];
  }

  const normalizeValue = (v) => {
    if (v === undefined || v === null) return "";
    return String(v)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  };

  const getStatus = (value) => {
    const val = normalizeValue(value);
    if (!val) return "Not Completed";
    const completedValues = ["yes", "na", "n/a", "nr", "n/r"];
    if (completedValues.includes(val)) {
      return "Completed";
    }
    if (val === "no") return "Not Completed";
    if (["processing", "inprogress", "in progress"].includes(val))
      return "In Progress";
    if (val) return "Completed";
    return "Not Completed";
  };

  const bgcolor = (status) => {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  };

  const [formState, setFormState] = useState({});
  const [statusState, setStatusState] = useState({});
  const [clientComment, setClientComment] = useState("");
  const originalData = useRef({});

  const updateNoteForClient = () => {
    const completedValues = new Set(["yes", "na", "n/a", "nr", "n/r"]);

    const incompleteTasks = fields
      .filter(({ key, type }) => {
        const rawValue = formState[key] || "";
        const value = normalizeValue(rawValue);

        if (type === "text") {
          // text fields count as completed if not empty
          return value === "";
        }

        // non-text fields use completedValues
        return !completedValues.has(value);
      })
      .map(({ label }) => label);

    if (incompleteTasks.length === 0) return "All tasks completed";
    if (incompleteTasks.length === fields.length) return "No tasks completed";
    return `${incompleteTasks.join(" and ")} not received`;
  };

  useEffect(() => {
    if (!data) return;

    const newFormState = {};
    const newStatusState = {};

    fields.forEach(({ key, hasDate }) => {
      const rawValue = data[key] || "";
      newFormState[key] = normalizeValue(rawValue);
      newStatusState[key] = getStatus(newFormState[key]);

      if (hasDate) {
        newFormState[`${key}Date`] = data[`${key}Date`]
          ? data[`${key}Date`].split("T")[0]
          : "";
      }
    });

    const noteParts = (data.noteForClient || "").split(" - ");
    const clientCommentPart = noteParts.length > 1 ? noteParts[1].trim() : "";

    setFormState(newFormState);
    setStatusState(newStatusState);
    setClientComment(clientCommentPart);

    originalData.current = {
      ...newFormState,
      clientComment: clientCommentPart,
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

    const formChanged = fields.some(
      ({ key }) =>
        String(formState[key] || "").trim() !==
        String(original[key] || "").trim()
    );
    const dateChanged = fields.some(
      ({ key, hasDate }) =>
        hasDate &&
        String(formState[`${key}Date`] || "").trim() !==
          String(original[`${key}Date`] || "").trim()
    );
    const commentChanged =
      String(clientComment).trim() !== String(original.clientComment).trim();
    const noteChanged = currentSystemNote !== original.systemNote;

    return formChanged || dateChanged || commentChanged || noteChanged;
  }

  const handleChange = (key, value, hasDate) => {
    let processedValue = value;
    if (typeof processedValue === "string") {
      processedValue = normalizeValue(processedValue);
    }

    setFormState((prev) => ({ ...prev, [key]: processedValue }));
    setStatusState((prev) => ({ ...prev, [key]: getStatus(processedValue) }));

    // if (hasDate) {
    //   if (processedValue === "yes") {
    //     setFormState((prev) => ({
    //       ...prev,
    //       [`${key}Date`]:
    //         prev[`${key}Date`] || new Date().toISOString().split("T")[0],
    //     }));
    //   } else {
    //     setFormState((prev) => ({ ...prev, [`${key}Date`]: "" }));
    //   }
    // }
  };

  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      const company = localStorage.getItem("company");

      const systemNote = updateNoteForClient();
      const fullNote = clientComment
        ? `${systemNote} - ${clientComment}`
        : systemNote;

      let payload = {
        ...formState,
        noteForClient: fullNote,
      };

      // handle dates: send null if empty
      fields.forEach(({ key, hasDate }) => {
        if (hasDate) {
          const dateKey = `${key}Date`;
          payload[dateKey] =
            formState[dateKey] && String(formState[dateKey]).trim() !== ""
              ? formState[dateKey]
              : null;
        }
      });

      // company-specific handling
      if (company === "vkl") {
        payload.matterNumber = matterNumber;
        await api.upsertStageThree(payload);
      } else if (company === "idg") {
        payload.orderId = matterNumber;
        await api.upsertIDGStages(payload.orderId, 3, payload);
      }

      // update original data
      originalData.current = {
        ...formState,
        clientComment,
        systemNote,
      };

      setReloadTrigger?.((prev) => !prev);
      toast.success("Stage 3 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (err) {
      console.error("Failed to save Stage 3:", err);
    } finally {
      setIsSaving(false);
    }
  }

  const renderRadioGroup = ({ key, label, hasDate }) => (
    <div className="mt-5" key={key}>
      <div className="flex gap-4 items-center justify-between mb-3">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {label}
        </label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(
            statusState[key]
          )} flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[10px] md:text-[12px] whitespace-nowrap">
            {statusState[key]}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-start gap-x-8 gap-y-2 items-center">
        {[
          "agent",
          "priority",
          "jobActivity",
          "status",
          "vehicleAllocated",
          "draftCostSheet",
        ].includes(key) ? (
          <input
            type="text"
            name={key}
            value={formState[key] || ""}
            onChange={(e) => handleChange(key, e.target.value, hasDate)}
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
                  normalizeValue(formState[key] || "") === normalizeValue(val)
                }
                onChange={() => handleChange(key, val, hasDate)}
              />
              {val}
            </label>
          ))
        )}
        {hasDate && (
          <input
            type="date"
            value={formState[`${key}Date`] || ""}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                [`${key}Date`]: e.target.value,
              }))
            }
            className="border p-1 rounded text-md"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto">
      {fields.map(renderRadioGroup)}

      <div className="mt-5">
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
