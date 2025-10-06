import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import ImageUploadField from "@/components/ui/ImageUploadField.jsx";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline/index.js";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

const formConfig = {
  vkl: {
    fields: [
      { name: "dts", label: "DTS", type: "radio" },
      { name: "dutyOnline", label: "Duty Online", type: "radio" },
      { name: "soa", label: "SOA", type: "radio" },
      { name: "frcgw", label: "FRCGW", type: "radio" },
      { name: "contractPrice", label: "Contract Price", type: "number" },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: ["dts", "dutyOnline", "soa", "frcgw"],
      },
    ],
  },
  idg: {
    fields: [
      { name: "uploadImageConfirmation", label: "Image Uploaded Correctly", type: "radio" },
      {
        name: "completionPhotos",
        label: "Capture Proof of Completion Photos",
        type: "image",
      },
    ],
    noteGroups: [
      {
        id: "main",
        systemNoteLabel: "System Note for Client",
        clientCommentLabel: "Comment for Client",
        systemNoteKey: "systemNote",
        clientCommentKey: "clientComment",
        noteForClientKey: "noteForClient",
        fieldsForNote: [
          "uploadImageConfirmation"
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

const getStatus = (value) => {
  const val = normalizeValue(value);
  if (!val) return "Not Completed";
  if (["yes", "na", "n/a", "nr"].includes(val)) return "Completed";
  if (val === "no") return "Not Completed";
  if (["processing", "inprogress"].includes(val)) return "In Progress";
  return "Not Completed";
};

function bgcolor(status) {
  const statusColors = {
    "Completed": "bg-[#00A506] text-white",
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

export default function Stage4({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  console.log("Stage 4 data:", data);
  const stage = 4;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const[showConfirmModal,setShowConfirmModal]=useState(false);
  const[fileName,setfileName]=useState("");
  const [isDragging, setIsDragging] = useState(false);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
    // Automatically trigger the upload
    handleUpload(file);
  };

  const handleUpload = async (fileToUpload) => {
    try {
      const response = await api.uploadImageForOrder(matterNumber, fileToUpload);
      console.log(response);
    }
    catch (e) {
      console.error(e);
    }
  };

  function getCleanImageName(fullPath) {
  const prefixToRemove = 'idg-stage-images/';
  return fullPath.replace(prefixToRemove, '');
}
  const handleImagedelete = async (filename) => {
    setPreview(null);
    setShowConfirmModal(false);
    // try {
    //   console.log(matterNumber);
    //   console.log(getCleanImageName(fileName));
    //   const response = await api.deleteImageForOrder(matterNumber, getCleanImageName(filename));
    //   console.log(response);
    // }
    // catch (e) {
    //   console.error(e);
    // }
  };

  const company = localStorage.getItem("company") || "vkl";
  const currentConfig = formConfig[company] || formConfig.vkl;

  const generateSystemNote = (noteGroupId) => {
    const noteGroup = currentConfig.noteGroups.find(
      (ng) => ng.id === noteGroupId
    );
    if (!noteGroup) return "";

    const greenValues = new Set(["yes", "nr", "na", "approved"]);

    const fieldsToCheck = currentConfig.fields.filter((f) =>
      noteGroup.fieldsForNote.includes(f.name)
    );

    const notReceived = fieldsToCheck
      .filter((field) => {
        const rawValue = formData[field.name] || "";
        const value = normalizeValue(rawValue);

        // Special case: skip obtainDaSeller if clientType is not seller
        if (
          field.name === "obtainDaSeller" &&
          clientType?.toLowerCase() !== "seller"
        ) {
          return false;
        }

        if (field.type === "text") {
          // text fields count as completed if not empty
          return value === "";
        }

        // non-text fields rely on greenValues
        return !greenValues.has(value);
      })
      .map((field) => field.label);

    if (notReceived.length === 0) return "Tasks completed";
    return `${notReceived.join(" and ")} not received`;
  };

  useEffect(() => {
    if (!data) return;

    const initialFormData = {};
    const initialStatuses = {};
    currentConfig.fields.forEach((field) => {
      if (field.type === "number") {
        const rawPrice = data[field.name];
        initialFormData[field.name] =
          typeof rawPrice === "object" && rawPrice?.$numberDecimal
            ? rawPrice.$numberDecimal
            : rawPrice?.toString() || "";
      } else if (field.type === "radio") {
        initialFormData[field.name] = normalizeValue(data[field.name] || "");
        initialStatuses[field.name] = getStatus(initialFormData[field.name]);
      } else {
        initialFormData[field.name] = data[field.name] || "";
      }
    });

    currentConfig.noteGroups.forEach((group) => {
      const notes = extractNotes(data[group.noteForClientKey]);
      initialFormData[group.clientCommentKey] = notes.clientComment;
    });

    setFormData(initialFormData);
    setStatuses(initialStatuses);
    if(company==="idg"){
      setPreview(data?.images[data?.images?.length - 1]?.url || null);
      setfileName(data?.images[0]?.filename||" ");
    }
    originalData.current = initialFormData;
  }, [data, reloadTrigger, company]);

  const handleChange = (field, value) => {
    let processedValue = value;
    if (typeof processedValue === "string") {
      processedValue = normalizeValue(processedValue);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    const fieldConfig = currentConfig.fields.find((f) => f.name === field);
    if (fieldConfig && fieldConfig.type === "radio") {
      setStatuses((prev) => ({ ...prev, [field]: getStatus(processedValue) }));
    }
  };
  const isChanged = () =>
    JSON.stringify(formData) !== JSON.stringify(originalData.current);

  async function handleSave() {
    if (!isChanged() || isSaving) return;
    setIsSaving(true);

    try {
      const company = localStorage.getItem("company");
      let payload = { ...formData };

      // handle note groups
      currentConfig.noteGroups.forEach((group) => {
        const systemNote = generateSystemNote(group.id);
        const clientComment = formData[group.clientCommentKey] || "";
        payload[group.noteForClientKey] =
          `${systemNote} - ${clientComment}`.trim();
        delete payload[group.clientCommentKey];
      });

      // handle number fields
      currentConfig.fields.forEach((field) => {
        if (field.type === "number") {
          payload[field.name] =
            payload[field.name] === "" ? null : Number(payload[field.name]);
        }
      });

      // company-specific save
      if (company === "vkl") {
        payload.matterNumber = matterNumber;
        await api.upsertStageFour(payload);
      } else if (company === "idg") {
        payload.orderId = matterNumber;
        await api.upsertIDGStages(payload.orderId, 4, payload);
      }

      // update original data
      originalData.current = { ...formData };
      setReloadTrigger((prev) => !prev);

      toast.success("Stage 4 Saved Successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (err) {
      console.error("Failed to save Stage 4:", err);
    } finally {
      setIsSaving(false);
    }
  }

  const renderField = (field) => {
    switch (field.type) {
      case "radio":
        return (
          <div key={field.name} className="mt-5">
            <div className="flex gap-4 items-center justify-between mb-2">
              <label className="block mb-1 text-sm md:text-base font-bold">
                {field.label}
              </label>
              <div
                className={`w-[90px] h-[18px] ${bgcolor(
                  statuses[field.name]
                )} flex items-center justify-center rounded-4xl`}
              >
                <p className="text-[10px] md:text-[12px] whitespace-nowrap">
                  {statuses[field.name] || "Not Completed"}
                </p>
              </div>
            </div>
            {/* <div className="flex gap-4 justify-between flex-wrap items-center mb-3"> */}
            {/* tight spacing of every fields*/}
            <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2">
              {["Yes", "No", "Processing", "N/R"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm md:text-base"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={val}
                    checked={
                      normalizeValue(formData[field.name]) ===
                      normalizeValue(val)
                    }
                    onChange={() => handleChange(field.name, val)}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        );
      case "number":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
        );
      case "text":
        return (
          <div key={field.name} className="mt-5">
            <label className="block mb-1 text-sm md:text-base font-bold">
              {field.label}
            </label>
            <input
              type="text"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
        );
      case "image":
  return (
    <div className="w-full mt-5">
      <label className="block mb-1 text-sm md:text-base font-bold">
        {field.label}
      </label>

      <div className="relative w-full">
        {!preview ? (
          <label
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition border-gray-300 bg-gray-50 hover:bg-gray-100`}
          >
            <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-semibold text-blue-600">
                Click to upload
              </span>
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          // Image preview (no changes needed here)
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-40 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => {
                setShowConfirmModal(true);
              }}
              className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 shadow hover:bg-red-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );


      //     <div className="w-full">
      //         <label className="block mb-1 text-sm md:text-base font-bold">
      //             {field.label}
      //         </label>
      //         <input
      //             type="file"
      //             accept="image/*"
      //             // onChange={(e) => setCompletionPhotoFile(e.target.files[0])}
      //             className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
      //         />
      //         {/*/!* Display current image if it exists *!/*/}
      //         {/*{formState.completionPhotos && (*/}
      //         {/*    <div className="mt-2">*/}
      //         {/*        <p className="text-xs font-semibold">Current Photo:</p>*/}
      //         {/*        <a href={"/"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">*/}
      //         {/*            View Uploaded Photo*/}
      //         {/*        </a>*/}
      //         {/*    </div>*/}
      //         {/*)}*/}
      //     </div>

      default:
        return null;
    }
  };

  const renderNoteGroup = (group) => (
    <div key={group.id}>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {group.systemNoteLabel}
        </label>
        <input
          type="text"
          value={generateSystemNote(group.id)}
          disabled
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
      <div className="mt-5">
        <label className="block mb-1 text-sm md:text-base font-bold">
          {group.clientCommentLabel}
        </label>
        <textarea
          value={formData[group.clientCommentKey] || ""}
          onChange={(e) => handleChange(group.clientCommentKey, e.target.value)}
          className="w-full rounded p-2 bg-gray-100"
        />
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto">
      {currentConfig.fields.map(renderField)}
      {currentConfig.noteGroups.map(renderNoteGroup)}

      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[70px] md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
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
      <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Delete Image"
          onConfirm={()=>handleImagedelete(fileName)}
          >
          Do you really want to delete this Image??
      </ConfirmationModal>
    </div>
  );
}

Stage4.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};
