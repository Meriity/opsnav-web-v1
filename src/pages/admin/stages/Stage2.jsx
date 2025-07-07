import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";

export default function Stage2({ changeStage }) {
  const stage = 2;
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

  const [signedContract, setSignedContract] = useState("");
  const [keyDates, setkeyDates] = useState("");
  const [voi, setVoi] = useState("");
  const [caf, setCaf] = useState("");
  const [depositReceipt, setdepositReceipt] = useState("");
  const [buildingPest, setbuildingPest] = useState("");
  const [obtainDA, setObtainDA] = useState("");
  const [ct, setCt] = useState("");
  const [system1_note1, setSystem1_note2] = useState("");
  const [system2_note1, setSystem2_note2] = useState("");
  const [client1_note1, setClient1_note2] = useState("");
  const [client2_note1, setClient2_note2] = useState("");

  const [depositDate, setDepositDate] = useState("");
  const [buildingDate, setBuildingDate] = useState("");
  const [financeDate, setFinanceDate] = useState("");

  const [statusSignedContract, setStatusSignedContract] = useState("In progress");
  const [statusKeyDates, setStatusKeyDates] = useState("In progress");
  const [statusVoi, setStatusVoi] = useState("In progress");
  const [statusCaf, setStatusCaf] = useState("In progress");
  const [statusDepositReceipt, setStatusDepositReceipt] = useState("In progress");
  const [statusBuildingPest, setStatusBuildingPest] = useState("In progress");
  const [statusObtainDA, setStatusObtainDA] = useState("In progress");
  const [statusCt, setStatusCt] = useState("In progress");
  const [statusSystem1, setStatusSystem1] = useState("In progress");
  const [statusSystem2, setStatusSystem2] = useState("In progress");
  const [statusClient1, setStatusClient1] = useState("In progress");
  const [statusClient2, setStatusClient2] = useState("In progress");

  useEffect(() => {
    const mockData = {
      signedContract: "Yes",
      keyDates: "No",
      voi: "Yes",
      caf: "No",
      depositReceipt: "Processing",
      buildingPest: "Yes",
      obtainDA: "No",
      ct: "Yes",
      system1: "Need VOI update",
      system2: "CAF done",
      client1: "Please confirm",
      client2: "Need final approval"
    };

    setSignedContract(mockData.signedContract);
    setkeyDates(mockData.keyDates);
    setVoi(mockData.voi);
    setCaf(mockData.caf);
    setdepositReceipt(mockData.depositReceipt);
    setbuildingPest(mockData.buildingPest);
    setObtainDA(mockData.obtainDA);
    setCt(mockData.ct);
    setSystem1_note2(mockData.system1);
    setSystem2_note2(mockData.system2);
    setClient1_note2(mockData.client1);
    setClient2_note2(mockData.client2);

    setStatusSignedContract(getStatus(mockData.signedContract));
    setStatusKeyDates(getStatus(mockData.keyDates));
    setStatusVoi(getStatus(mockData.voi));
    setStatusCaf(getStatus(mockData.caf));
    setStatusDepositReceipt(getStatus(mockData.depositReceipt));
    setStatusBuildingPest(getStatus(mockData.buildingPest));
    setStatusObtainDA(getStatus(mockData.obtainDA));
    setStatusCt(getStatus(mockData.ct));
    setStatusSystem1(getStatus(mockData.system1));
    setStatusSystem2(getStatus(mockData.system2));
    setStatusClient1(getStatus(mockData.client1));
    setStatusClient2(getStatus(mockData.client2));
  }, []);

  const renderRadioGroup = (label, name, value, setValue, status, setStatus, showDate = false, dateValue = "", setDateValue = () => {}) => (
    <div className=" py-2">
      <div className="flex justify-between mb-3">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(status)} ${
            status === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{status}</p>
        </div>
      </div>
      <div className={`flex justify-between ${showDate ? "gap-2" : "gap-4"} flex-wrap items-center`}>
        {"Yes,No,Processing,N/R".split(",").map((val) => (
          <label key={val} className="flex items-center gap-1">
            <input
              type="radio"
              name={name}
              value={val}
              checked={value === val}
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

  const renderTextInput = (label, value, setValue, status, setStatus) => (
    <div className="mt-5">
      <div className="flex justify-between mb-3">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(status)} ${
            status === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{status}</p>
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus(getStatus(e.target.value));
        }}
        className="w-full rounded p-2 bg-gray-100"
      />
    </div>
  );

  const renderTextarea = (label, value, setValue, status, setStatus) => (
    <div className="mt-5">
      <div className="flex justify-between mb-3">
        <label className="block mb-1 text-base font-bold">{label}</label>
        <div
          className={`w-[90px] h-[18px] ${bgcolor(status)} ${
            status === "In progress" ? "text-[#FF9500]" : "text-white"
          } flex items-center justify-center rounded-4xl`}
        >
          <p className="text-[12px] whitespace-nowrap">{status}</p>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus(getStatus(e.target.value));
        }}
        className="w-full rounded p-2 bg-gray-100"
      />
    </div>
  );

  return (
    <div className="overflow-y-auto">
      {renderRadioGroup("Signed Contract", "signedContract", signedContract, setSignedContract, statusSignedContract, setStatusSignedContract)}
      {renderRadioGroup("Send Key Dates", "keyDates", keyDates, setkeyDates, statusKeyDates, setStatusKeyDates)}
      {renderRadioGroup("VOI", "voi", voi, setVoi, statusVoi, setStatusVoi)}
      {renderRadioGroup("CAF", "caf", caf, setCaf, statusCaf, setStatusCaf)}
      {renderRadioGroup("Deposit Receipt", "depositReceipt", depositReceipt, setdepositReceipt, statusDepositReceipt, setStatusDepositReceipt, true, depositDate, setDepositDate)}
      {renderRadioGroup("Building and Pest", "buildingPest", buildingPest, setbuildingPest, statusBuildingPest, setStatusBuildingPest, true, buildingDate, setBuildingDate)}
      {renderRadioGroup("Finance Approval", "obtainDA", obtainDA, setObtainDA, statusObtainDA, setStatusObtainDA, true, financeDate, setFinanceDate)}
      {renderRadioGroup("Check CT Controller", "ct", ct, setCt, statusCt, setStatusCt)}
      {renderTextInput("System note for client (VOI / CAF / Deposit)", system1_note1, setSystem1_note2, statusSystem1, setStatusSystem1)}
      {renderTextarea("Comment for client (VOI / CAF / Deposit)", client1_note1, setClient1_note2, statusClient1, setStatusClient1)}
      {renderTextInput("System note for client (B&P / Finance)", system2_note1, setSystem2_note2, statusSystem2, setStatusSystem2)}
      {renderTextarea("Comment for client (B&P / Finance)", client2_note1, setClient2_note2, statusClient2, setStatusClient2)}

      <div className="flex mt-10 justify-between">
        <Button label="Back" width="w-[100px]" onClick={() => changeStage(stage - 1)} />
        <Button label="Next" width="w-[100px]" onClick={() => changeStage(stage + 1)} />
      </div>
    </div>
  );
}
