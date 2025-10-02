import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

// --- Configuration Object for Stage 2 ---
const formConfig = {
  vkl: {
    fields: [
      { name: "signedContract", label: "Signed Contract", type: "radio" },
      { name: "sendKeyDates", label: "Send Key Dates", type: "radio" },
      { name: "voi", label: "VOI", type: "radio" },
      { name: "caf", label: "CAF", type: "radio" },
      {
        name: "depositReceipt",
        label: "Deposit Receipt",
        type: "radio",
        hasDate: true,
        dateFieldName: "depositReceiptDate",
      },
      {
        name: "buildingAndPest",
        label: "Building and Pest",
        type: "radio",
        hasDate: true,
        dateFieldName: "buildingAndPestDate",
      },
      {
        name: "financeApproval",
        label: "Finance Approval",
        type: "radio",
        hasDate: true,
        dateFieldName: "financeApprovalDate",
      },
      {
        name: "checkCtController",
        label: "Check CT Controller",
        type: "radio",
      },
      { name: "obtainDaSeller", label: "Obtain DA(Seller)", type: "radio" },
    ],
    noteGroups: [
      {
        id: "A",
        systemNoteLabel: "System Note (VOI / CAF / Deposit)",
        clientCommentLabel: "Client Comment (VOI / CAF / Deposit)",
        systemNoteKey: "systemNoteA",
        clientCommentKey: "clientCommentA",
        noteForClientKey: "noteForClientA",
        fieldsForNote: ["voi", "caf", "depositReceipt", "obtainDaSeller"],
      },
      {
        id: "B",
        systemNoteLabel: "System Note (B&P / Finance)",
        clientCommentLabel: "Client Comment (B&P / Finance)",
        systemNoteKey: "systemNoteB",
        clientCommentKey: "clientCommentB",
        noteForClientKey: "noteForClientB",
        fieldsForNote: ["buildingAndPest", "financeApproval"],
      },
    ],
  },
  idg: {
    fields: [
      {
        name: "agent",
        label: "Assign Agent / Team Member",
        type: "text",
      },
      {
        name: "materialsInStock",
        label: "Check if Materials Needed are in stock",
        type: "radio",
      },
      {
        name: "additionalMaterialsRequired",
        label: "Procure additional materials if required",
        type: "radio",
      },
      // {
      //   name: "vehicleAllocated",
      //   label: "Allocate Vehicle / Installer",
      //   type: "text",
      // },
      {
        name: "designArtwork",
        label: "Create / update Design Artwork",
        type: "text",
      },
      {
        name: "internalApproval",
        label: "Review and internally approve design",
        type: "radio",
      },
      {
        name: "proofSentToClient",
        label: "Send Proof to Client",
        type: "radio",
      },
      {
        name: "clientApprovalReceived",
        label: "Record Client Approval",
        type: "radio",
      },
      {
        name: "printReadyFiles",
        label: "Generate Print-Ready Files",
        type: "radio",
      },
      {
        name: "jobActivity",
        label: "Ensure Job Activity & Priority are correctly logged",
        type: "text",
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System note for client",
        clientCommentLabel: "Comment for client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
            "designArtwork",
            "jobActivity",
            "vehicleAllocated",
            "materialsInStock",
            "additionalMaterialsRequired",
            "internalApproval",
            "proofSentToClient",
            "clientApprovalReceived",
            "printReadyFiles",
        ],
      },
    ],
  },
};

const normalizeValue = (v) => {
  if (v === undefined || v === null) return "";
  return String(v)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
};

export default function Stage2({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
  clientType,
  user
}) {
  console.log(data);
  console.log(user);
  const stage = 2;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const[users,setUsers]=useState([]);

  const company = localStorage.getItem("company") || "vkl";
  const currentConfig = formConfig[company] || formConfig.vkl;

  const getStatus = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not Completed";
    }
    const val = normalizeValue(value);
    const completed = new Set([
      "yes",
      "nr",
      "na",
      "variable",
      "fixed",
      "approved",
    ]);
    if (completed.has(val)) return "Completed";
    if (val === "no") return "Not Completed";
    if (["processing", "inprogress", "pending"].includes(val))
      return "In Progress";
    return "Not Completed";
  };

  function bgcolor(status) {
    const statusColors = {
      Completed: "bg-[#00A506] text-white",
      "Not Completed": "bg-[#FF0000] text-white",
      "In Progress": "bg-[#FFEECF] text-[#FF9500]",
    };
    return statusColors[status] || "bg-[#FF0000] text-white";
  }

  const extractNotes = (note = "") => {
    const [systemNote = "", clientComment = ""] = (note || "")
      .split(" - ")
      .map((str) => str.trim());
    return { systemNote, clientComment };
  };

  const generateSystemNote = (noteGroupId) => {
    const noteGroup = currentConfig.noteGroups.find(
      (ng) => ng.id === noteGroupId
    );
    if (!noteGroup) return "";

    const greenValues = new Set(["yes", "nr", "na", "na", "approved"]);
    const fieldsToCheck = currentConfig.fields.filter((f) =>
      noteGroup.fieldsForNote.includes(f.name)
    );

    // const notReceived = fieldsToCheck
    //   .filter(
    //     (field) => !greenValues.has(normalizeValue(formData[field.name] || ""))
    //   )
    //   .map((field) => field.label);

    const notReceived = fieldsToCheck
      .filter((field) => {
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return false;
        }
        return !greenValues.has(normalizeValue(formData[field.name] || ""));
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not received`;
  };

  useEffect(() => {
    if (!data) return;

    const initialFormData = {};
    const initialStatuses = {};
    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toISOString().split("T")[0];
    };

    currentConfig.fields.forEach((field) => {
      if (field.type === "number") {
        const rawPrice = data[field.name];
        initialFormData[field.name] =
          typeof rawPrice === "object" && rawPrice?.$numberDecimal
            ? rawPrice.$numberDecimal
            : rawPrice?.toString() || "";
      } else if (field.type === "radio") {
        initialFormData[field.name] = normalizeValue(data[field.name] || "");
      } else {
        initialFormData[field.name] = data[field.name] || "";
      }

      if (field.hasDate) {
        initialFormData[field.dateFieldName] = formatDate(
          data[field.dateFieldName]
        );
      }

      initialStatuses[field.name] = getStatus(data[field.name]);
    });

    currentConfig.noteGroups.forEach((group) => {
      const notes = extractNotes(data[group.noteForClientKey]);
      initialFormData[group.clientCommentKey] = notes.clientComment;
    });

    setFormData(initialFormData);
    setStatuses(initialStatuses);
    originalData.current = initialFormData;
    originalData.current = JSON.parse(JSON.stringify(initialFormData));
  }, [
    data,
    reloadTrigger,
    company,
    clientType,
    currentConfig.fields,
    currentConfig.noteGroups,
  ]);

  const handleChange = (field, value) => {
    const fieldConfig = currentConfig.fields.find((f) => f.name === field);
    let processedValue = value;

    if (
      fieldConfig &&
      fieldConfig.type === "radio" &&
      typeof processedValue === "string"
    ) {
      processedValue = normalizeValue(processedValue);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    if (fieldConfig) {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(value) }));
    }
  };

  const isChanged = () => {
    // 1. Check if any form values have been modified by the user.
    const valuesHaveChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData.current);

    if (valuesHaveChanged) {
      return true;
    }

    // 2. If values are the same, check if the status needs updating.
    // This allows saving a completed form that was wrongly marked as "In Progress".
    const relevantFields = currentConfig.fields.filter((field) => {
      if (
        field.name === "obtainDaSeller" &&
        clientType?.toLowerCase() !== "seller"
      ) {
        return false;
      }
      return true;
    });

    const allCompleted = relevantFields.every(
      (f) => getStatus(formData[f.name]) === "Completed"
    );

    const calculatedStatus = allCompleted ? "green" : "amber";
    return calculatedStatus !== data?.colorStatus;
  };
  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      const company = localStorage.getItem("company");
      let payload = { ...formData };
      console.log(payload);

      // handle all system notes and client comments dynamically
      currentConfig.noteGroups.forEach((group) => {
        const systemNote = generateSystemNote(group.id);
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] =
          `${systemNote} - ${clientComment}`.trim();

        // remove temporary fields
        delete payload[group.systemNoteKey];
        delete payload[group.clientCommentKey];
      });

      // status check
      const relevantFields = currentConfig.fields.filter((field) => {
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return false;
        }
        return true;
      });

      const allCompleted = relevantFields.every(
        (f) => getStatus(formData[f.name]) === "Completed"
      );
      const formStatus = allCompleted ? "green" : "amber";
      const colorStatus = allCompleted ? "green" : "amber";
      if ((clientType || "").toLowerCase() !== "seller") {
        delete payload.obtainDaSeller;
        delete payload.obtainDaSellerDate;
      }
      // dynamically set the key depending on company
      if (company === "vkl") {
        payload.matterNumber = matterNumber; // keep matterNumber
        await api.upsertStageTwo(matterNumber, formStatus, payload);
      } else if (company === "idg") {
        payload.orderId = matterNumber; // use orderId
        await api.upsertIDGStages(payload.orderId, 2, {
          ...payload,
          colorStatus,
        });
      }

      // update original data
      originalData.current = { ...formData };
      console.log(originalData);
      setReloadTrigger((prev) => !prev);

      toast.success("Stage 2 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (error) {
      console.error("Failed to update stage 2:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const renderField = (field) => (
<div key={field.name} className="mt-5">
  <div className="flex gap-4 justify-between items-center mb-2">
    <label className="block mb-1 text-sm md:text-base font-bold">
      {field.label}
    </label>

    {field.name !== "agent" && (
      <div
        className={`w-[90px] h-[18px] ${bgcolor(
          statuses[field.name]
        )} flex items-center justify-center rounded-4xl`}
      >
        <p className="text-[10px] md:text-[12px] whitespace-nowrap">
          {statuses[field.name]}
        </p>
      </div>
    )}
  </div>


    <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
      {field.name === "agent" ? (
        // ✅ Dropdown for agents
        <select
          name={field.name}
          className={localStorage.getItem("role")!=="admin" ? "bg-gray-600 p-2 border rounded w-full" : "bg-white p-2 border rounded w-full"}
          value={formData[field.name] || ""}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={localStorage.getItem("role")!=="admin"}
        >
          <option value="">Select Agent</option>
          {user.map((agent) => (
            <option key={agent._id} value={agent.displayName}>
              {agent.displayName}
            </option>
          ))}
        </select>
      ) : (
        // ✅ Radios for everything else
        (["Yes", "No", "Processing","N/R"]).map((val) => (
          <label
            key={val}
            className="flex items-center gap-2 text-sm md:text-base"
          >
            <input
              type="radio"
              name={field.name}
              value={val}
              checked={
                normalizeValue(formData[field.name] || "") ===
                normalizeValue(val)
              }
              onChange={() => handleChange(field.name, val)}
            />
            {val}
          </label>
        ))
      )}

      {/* ✅ If the field has an associated date */}
      {field.hasDate && (
        <input
          type="date"
          value={formData[field.dateFieldName] || ""}
          onChange={(e) => handleChange(field.dateFieldName, e.target.value)}
          className="ml-2 p-1 border rounded"
        />
      )}
    </div>
  </div>
);


  const renderNoteGroup = (group) => (
    <div key={group.id}>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          {group.systemNoteLabel}
        </label>
        <input
          disabled
          className="w-full rounded p-2 bg-gray-100"
          value={generateSystemNote(group.id)}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-sm md:text-base mb-1 block">
          {group.clientCommentLabel}
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={formData[group.clientCommentKey] || ""}
          onChange={(e) => handleChange(group.clientCommentKey, e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto">
      {/* {currentConfig.fields.map(renderField)} */}
      {currentConfig.fields.map((field) => {
        // Conditionally render the "Obtain DA(Seller)" field
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return null;
        }
        return renderField(field);
      })}
      {currentConfig.noteGroups.map(renderNoteGroup)}

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

Stage2.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  clientType: PropTypes.string,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};
