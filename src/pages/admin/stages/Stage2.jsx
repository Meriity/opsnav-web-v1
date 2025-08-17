import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/clientAPI";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

Stage2.propTypes = {
  changeStage: PropTypes.func.isRequired,
  data: PropTypes.object,
  reloadTrigger: PropTypes.bool.isRequired,
  setReloadTrigger: PropTypes.func.isRequired,
};

export default function Stage2({
  changeStage,
  data,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 2;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const originalData = useRef({});

  // const getStatus = (value) => {
  //   if (!value) return "In progress";
  //   const val = value.toLowerCase();
  //   if (val === "yes") return "Completed";
  //   if (val === "no") return "Not Completed";
  //   return "In progress";
  // };

  const getStatus = (value) => {
    if (!value) return "Not Completed"; // Default to red
    const val = value.toLowerCase().trim();
    if (val === "yes" || val === "nr" || val === "n/r" || val === "nr")
      return "Completed"; // Green
    if (val === "no") return "Not Completed"; // Red
    if (val === "processing" || val === "in progress") return "In progress"; // Yellow
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
      Completed: "bg-[#00A506] text-white", // Green
      "Not Completed": "bg-[#FF0000] text-white", // Red
      "In progress": "bg-[#FFEECF] text-[#FF9500]", // Yellow (amber)
    };
    return statusColors[status] || "bg-[#FF0000] text-white"; // Default to red
  }

  const extractNotes = (note = "") => {
    let [systemNote = "", clientComment = ""] = (note || "")
      .split(" - ")
      .map((str) => str.trim());
    return { systemNote, clientComment };
  };

  // State declarations
  const [signedContract, setSignedContract] = useState("");
  const [keyDates, setKeyDates] = useState("");
  const [voi, setVoi] = useState("");
  const [caf, setCaf] = useState("");
  const [depositReceipt, setDepositReceipt] = useState("");
  const [buildingPest, setBuildingPest] = useState("");
  const [financeApproval, setFinanceApproval] = useState("");
  const [ct, setCt] = useState("");
  const [da, setDA] = useState("");

  const [depositDate, setDepositDate] = useState("");
  const [buildingDate, setBuildingDate] = useState("");
  const [financeDate, setFinanceDate] = useState("");

  const [systemNote1, setSystemNote1] = useState("");
  const [clientNote1, setClientNote1] = useState("");
  const [systemNote2, setSystemNote2] = useState("");
  const [clientNote2, setClientNote2] = useState("");

  const [statusSignedContract, setStatusSignedContract] =
    useState("In progress");
  const [statusKeyDates, setStatusKeyDates] = useState("In progress");
  const [statusVoi, setStatusVoi] = useState("In progress");
  const [statusCaf, setStatusCaf] = useState("In progress");
  const [statusDepositReceipt, setStatusDepositReceipt] =
    useState("In progress");
  const [statusBuildingPest, setStatusBuildingPest] = useState("In progress");
  const [statusFinanceApproval, setStatusFinanceApproval] =
    useState("In progress");
  const [statusCt, setStatusCt] = useState("In progress");
  const [statusDA, setStatusDA] = useState("In progress");

  useEffect(() => {
    if (!data) return;

    const noteA = extractNotes(data.noteForClientA);
    const noteB = extractNotes(data.noteForClientB);
    console.log("data", data);
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };
    setSignedContract(data.signedContract || "");
    setKeyDates(data.sendKeyDates || "");
    setVoi(data.voi || "");
    setCaf(data.caf || "");
    setDepositReceipt(data.depositReceipt || "");
    setBuildingPest(data.buildingAndPest || "");
    setFinanceApproval(data.financeApproval || "");
    setCt(data.checkCtController || "");
    setDA(data.obtainDaSeller || "");

    setDepositDate(formatDate(data.depositReceiptDate));
    setBuildingDate(formatDate(data.buildingAndPestDate));
    setFinanceDate(formatDate(data.financeApprovalDate));

    setSystemNote1(noteA.systemNote);
    setClientNote1(noteA.clientComment);
    setSystemNote2(noteB.systemNote);
    setClientNote2(noteB.clientComment);

    setStatusSignedContract(getStatus(data.signedContract));
    setStatusKeyDates(getStatus(data.sendKeyDates));
    setStatusVoi(getStatus(data.voi));
    setStatusCaf(getStatus(data.caf));
    setStatusDepositReceipt(getStatus(data.depositReceipt));
    setStatusBuildingPest(getStatus(data.buildingAndPest));
    setStatusFinanceApproval(getStatus(data.financeApproval));
    setStatusCt(getStatus(data.checkCtController));
    setStatusDA(getStatus(data.obtainDaSeller));

    originalData.current = {
      signedContract: data.signedContract || "",
      sendKeyDates: data.sendKeyDates || "",
      voi: data.voi || "",
      caf: data.caf || "",
      depositReceipt: data.depositReceipt || "",
      buildingAndPest: data.buildingAndPest || "",
      financeApproval: data.financeApproval || "",
      checkCtController: data.checkCtController || "",
      obtainDaSeller: data.obtainDaSeller || "",
      depositReceiptDate: data.depositReceiptDate || "",
      buildingAndPestDate: data.buildingAndPestDate || "",
      financeApprovalDate: data.financeApprovalDate || "",
      noteForClientA: data.noteForClientA || "",
      noteForClientB: data.noteForClientB || "",
    };
  }, [data, reloadTrigger]);

  function checkFormStatus() {
    const radios = [
      signedContract,
      keyDates,
      voi,
      caf,
      depositReceipt,
      buildingPest,
      financeApproval,
      ct,
      da,
    ];
    const inputs = [systemNote1, clientNote1, systemNote2, clientNote2];

    const allYes = radios.every((val) => val.toLowerCase() === "yes");
    const allNo = radios.every((val) => val.toLowerCase() === "no");
    const anyFilled =
      radios.some((val) => val) || inputs.some((val) => val.trim() !== "");

    if (allYes) return "green";
    if (allNo) return "red";
    if (anyFilled) return "amber";
    return "red";
  }

  function isChanged() {
    const current = {
      signedContract,
      sendKeyDates: keyDates,
      voi,
      caf,
      depositReceipt,
      buildingAndPest: buildingPest,
      financeApproval,
      checkCtController: ct,
      obtainDaSeller: da,
      depositReceiptDate: depositDate,
      buildingAndPestDate: buildingDate,
      financeApprovalDate: financeDate,
      noteForClientA: `${systemNote1} - ${clientNote1}`,
      noteForClientB: `${systemNote2} - ${clientNote2}`,
    };

    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  async function handleSave() {
    const updateNoteAForClient = (
      voi_value,
      caf_value,
      deposit_value,
      obtain_da_seller
    ) => {
      const greenValues = ["Yes", "yes", "NR", "nr", "na", "NA"];

      const isVoiGreen = greenValues.includes(voi_value);
      const isCafGreen = greenValues.includes(caf_value);
      const isDepositGreen = greenValues.includes(deposit_value);
      const isObtainDA = greenValues.includes(obtain_da_seller);

      if (!isVoiGreen && !isCafGreen && !isDepositGreen && !isObtainDA) {
        return "VOI /CAF /Deposit and Obtain DA Seller receipt not received";
      } else if (!isVoiGreen && !isCafGreen) {
        return "VOI and CAF not received";
      } else if (!isCafGreen && !isDepositGreen) {
        return "CAF and Deposit receipt not received";
      } else if (!isVoiGreen && !isDepositGreen) {
        return "VOI and Deposit not received";
      } else if (!isDepositGreen) {
        return "Deposit receipt not received";
      } else if (!isCafGreen) {
        return "CAF not received ";
      } else if (!isVoiGreen) {
        return "VOI not received ";
      } else if (!isObtainDA) {
        return "Obtain DA Seller not received ";
      } else {
        return "Tasks completed ";
      }
    };
    const updateNoteBForClient = (
      building_and_pest_value,
      finance_approval_value
    ) => {
      const greenValues = ["Yes", "yes", "NR", "nr", "na", "NA"];

      const isBandPGreen = greenValues.includes(building_and_pest_value);
      const isFinanceGreen = greenValues.includes(finance_approval_value);

      if (!isBandPGreen && !isFinanceGreen) {
        return "Building and Pest and Finance Approval not received";
      } else if (!isBandPGreen) {
        return "Building and Pest not received";
      } else if (!isFinanceGreen) {
        return "Finance Approval not received";
      } else {
        return "Tasks completed";
      }
    };
    try {
      if (isChanged()) {
        const payload = {
          signedContract,
          sendKeyDates: keyDates,
          voi,
          caf,
          depositReceipt,
          buildingAndPest: buildingPest,
          financeApproval,
          checkCtController: ct,
          obtainDaSeller: da,
          depositReceiptDate: depositDate,
          buildingAndPestDate: buildingDate,
          financeApprovalDate: financeDate,
          noteForClientA: `${updateNoteAForClient(
            voi,
            caf,
            depositReceipt,
            da
          )} - ${clientNote1}`,
          noteForClientB: `${updateNoteBForClient(
            buildingPest,
            financeApproval
          )} - ${clientNote2}`,
        };

        await api.upsertStageTwo(matterNumber, checkFormStatus(), payload);
        originalData.current = payload;
        console.log("Stage 2 updated!");
        setReloadTrigger((prev) => !prev);
      }
    } catch (error) {
      console.error("Failed to update stage 2:", error);
    }
  }

  const renderRadioGroup = (
    label,
    name,
    value,
    setValue,
    status,
    setStatus,
    showDate = false,
    dateValue = "",
    setDateValue = () => {}
  ) => (
    <div className="py-2">
      <div className="flex gap-4 justify-between items-center mb-2">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(status)} ${
            status === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{status}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {["Yes", "No", "Processing", "N/R"].map((val) => (
          <label key={val} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={val}
              checked={value.toLowerCase() === val.toLowerCase()}
              onChange={() => {
                setValue(val);
                setStatus(getStatus(val));
              }}
            />
            {val}
          </label>
        ))}
        {showDate && (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="ml-2 p-1 border rounded"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto">
      {renderRadioGroup(
        "Signed Contract",
        "signedContract",
        signedContract,
        setSignedContract,
        statusSignedContract,
        setStatusSignedContract
      )}
      {renderRadioGroup(
        "Send Key Dates",
        "keyDates",
        keyDates,
        setKeyDates,
        statusKeyDates,
        setStatusKeyDates
      )}
      {renderRadioGroup("VOI", "voi", voi, setVoi, statusVoi, setStatusVoi)}
      {renderRadioGroup("CAF", "caf", caf, setCaf, statusCaf, setStatusCaf)}
      {renderRadioGroup(
        "Deposit Receipt",
        "depositReceipt",
        depositReceipt,
        setDepositReceipt,
        statusDepositReceipt,
        setStatusDepositReceipt,
        true,
        depositDate,
        setDepositDate
      )}
      {renderRadioGroup(
        "Building and Pest",
        "buildingPest",
        buildingPest,
        setBuildingPest,
        statusBuildingPest,
        setStatusBuildingPest,
        true,
        buildingDate,
        setBuildingDate
      )}
      {renderRadioGroup(
        "Finance Approval",
        "financeApproval",
        financeApproval,
        setFinanceApproval,
        statusFinanceApproval,
        setStatusFinanceApproval,
        true,
        financeDate,
        setFinanceDate
      )}
      {renderRadioGroup(
        "Check CT Controller",
        "ct",
        ct,
        setCt,
        statusCt,
        setStatusCt
      )}
      {renderRadioGroup(
        "Obtain DA(Seller)",
        "da",
        da,
        setDA,
        statusDA,
        setStatusDA
      )}

      <div className="mt-5">
        <label className="font-bold text-base mb-1 block">
          System Note (VOI / CAF / Deposit)
        </label>
        <input
          className="w-full rounded p-2 bg-gray-100"
          value={systemNote1}
          onChange={(e) => setSystemNote1(e.target.value)}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-base mb-1 block">
          Client Comment (VOI / CAF / Deposit)
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={clientNote1}
          onChange={(e) => setClientNote1(e.target.value)}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-base mb-1 block">
          System Note (B&P / Finance)
        </label>
        <input
          className="w-full rounded p-2 bg-gray-100"
          value={systemNote2}
          onChange={(e) => setSystemNote2(e.target.value)}
        />
      </div>
      <div className="mt-5">
        <label className="font-bold text-base mb-1 block">
          Client Comment (B&P / Finance)
        </label>
        <textarea
          className="w-full rounded p-2 bg-gray-100"
          value={clientNote2}
          onChange={(e) => setClientNote2(e.target.value)}
        />
      </div>

      <div className="flex mt-10 justify-between">
        <Button
          label="Back"
          width="w-[100px]"
          onClick={() => changeStage(stage - 1)}
          disabled={stage === 1}
        />
        <div className="flex gap-2">
          <Button
            label="Save"
            width="w-[100px]"
            bg="bg-blue-500"
            onClick={handleSave}
          />
          <Button
            label="Next"
            width="w-[100px]"
            onClick={() => changeStage(stage + 1)}
          />
        </div>
      </div>
    </div>
  );
}
