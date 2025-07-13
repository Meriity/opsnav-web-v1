import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Stage1 from "./Stage1";
import Stage2 from "./Stage2";
import Stage3 from "./Stage3";
import Stage4 from "./Stage4";
import Stage5 from "./Stage5";
import Stage6 from "./Stage6";
import Cost from "./cost";
import ClientAPI from "../../../api/clientAPI";

export default function StagesLayout() {
  const { matterNumber } = useParams();
  const api = new ClientAPI();
  const navigate = useNavigate();
  const [reloadStage1, setReloadStage1] = useState(false);
  const [selectedStage, setSelectedStage] = useState(1);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stageStatuses, setStageStatuses] = useState({
    status1: "Not Completed",
    status2: "Not Completed",
    status3: "Not Completed",
    status4: "Not Completed",
    status5: "Not Completed",
    status6: "Not Completed",
  });

  const stages = [
    { id: 1, title: "Retainer/Declaration" },
    { id: 2, title: "VOI/CAF/Approvals" },
    { id: 3, title: "Searches/PEXA" },
    { id: 4, title: "DTS/DOL/SOA" },
    { id: 5, title: "Notify/Transfer/Disb" },
    { id: 6, title: "Final Letter/Close" },
  ];

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

  function evaluateStageStatus(stageData, fields) {
    if (!stageData || fields.length === 0) return "Not Completed";

    let yesCount = 0;
    let emptyCount = 0;

    for (const field of fields) {
      const val = stageData[field]?.toString().toLowerCase();
      if (val === "yes") yesCount++;
      else if (!val || val === "null" || val === "undefined" || val === "")
        emptyCount++;
    }

    if (emptyCount === fields.length) return "Not Completed";
    if (yesCount === fields.length) return "Completed";
    return "In progress";
  }

  function RenderStage(newStage) {
    setSelectedStage(newStage);
  }

  function Showstage(stage) {
    switch (stage) {
      case 1:
        return (
          <Stage1
            data={clientData?.stage1}
            changeStage={RenderStage}
            reloadTrigger={reloadStage1}
            setReloadTrigger={setReloadStage1}
          />
        );
      case 2:
        return <Stage2 data={clientData?.stage2} changeStage={RenderStage} />;
      case 3:
        return <Stage3 data={clientData?.stage3} changeStage={RenderStage} />;
      case 4:
        return <Stage4 data={clientData?.stage4} changeStage={RenderStage} />;
      case 5:
        return <Stage5 data={clientData?.stage5} changeStage={RenderStage} />;
      case 6:
        return <Stage6 data={clientData?.stage6} changeStage={RenderStage} />;
      case 7:
        return <Cost data={clientData?.costData} changeStage={RenderStage} />;
      default:
        return <Stage1 data={clientData?.stage1} changeStage={RenderStage} />;
    }
  }

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const response = await api.getAllStages(matterNumber);
        setClientData(response);

        const section = {
          status1: evaluateStageStatus(response.stage1, [
            "referral",
            "declarationForm",
            "contractReview",
            "tenants",
            "retainer",
          ]),
          status2: evaluateStageStatus(response.stage2, [
            "voi",
            "caf",
            "signedContract",
            "sendKeyDates",
            "depositReceipt",
            "buildingAndPest",
            "financeApproval",
            "obtainDaSeller",
            "checkCtController",
          ]),
          status3: evaluateStageStatus(response.stage3, [
            "titleSearch",
            "planImage",
            "landTax",
            "instrument",
            "rates",
            "water",
            "ownersCorp",
            "pexa",
            "inviteBank",
          ]),
          status4: evaluateStageStatus(response.stage4, [
            "dts",
            "soa",
            "frcgw",
            "dutyOnline",
          ]),
          status5: evaluateStageStatus(response.stage5, [
            "notifySoaToClient",
            "transferDocsOnPexa",
            "gstWithholding",
            "disbursementsInPexa",
            "addAgentFee",
            "settlementNotification",
          ]),
          status6: evaluateStageStatus(response.stage6, [
            "noaToCouncilWater",
            "dutyPaid",
            "finalLetterToClient",
            "finalLetterToAgent",
            "invoiced",
            "closeMatter",
          ]),
        };

        setStageStatuses(section);
      } catch (e) {
        console.error("Error fetching stage details:", e);
      } finally {
        setLoading(false);
      }
    }

    if (matterNumber) {
      fetchDetails();
    }
  }, [matterNumber]);

 async function handleupdate(){
  event.preventDefault();
    try {
    const payload = {
      settlementDate: clientData.settlementDate,
      notes: clientData.notes
    };

    await api.updateClientData(matterNumber, payload);
    alert("Updated successfully!");
  } catch (err) {
    console.error("Error updating matter details:", err);
    alert("Failed to update. Please try again.");
  }
 }

  return (
    <div className="flex w-full h-full bg-gray-100">
      <main className="flex-grow h-full space-y-4 w-[1230px]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Hello {localStorage.getItem("user")}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              label="Back"
              bg="bg-[#FB4A52]"
              width="w-[84px]"
              onClick={() => navigate("/admin/view-clients")}
            />
            <Button
              label="Cost"
              bg="bg-[#FB4A52]"
              width="w-[84px]"
              onClick={() => setSelectedStage(7)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] mt-25">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
            <span className="ml-4 text-lg font-medium text-[#00AEEF]">
              Loading stage details...
            </span>
          </div>
        ) : (
          <>
            <div className="flex px-4 py-3 bg-[#F2FBFF] gap-[10px] rounded flex-wrap">
              {stages.map((stage, index) => {
                const stageStatus = stageStatuses[`status${stage.id}`];
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(stage.id)}
                    className={`cursor-pointer p-2 rounded shadow w-[190px] h-[62px] transition-colors duration-200 ${
                      selectedStage === stage.id ? "bg-white" : "bg-[#F3F7FF]"
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className="font-bold font-poppins">
                        Stage {index + 1}
                      </p>
                      <div
                        className={`w-[90px] h-[18px] ${bgcolor(stageStatus)} ${
                          stageStatus === "In progress"
                            ? "text-[#FF9500]"
                            : "text-white"
                        } flex items-center justify-center rounded-4xl`}
                      >
                        <p className="text-[12px] whitespace-nowrap">
                          {stageStatus}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p>{stage.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-[22px]">
              <div className="w-[923px] h-[540px] p-[40px] bg-white overflow-y-auto">
                {clientData && Showstage(selectedStage)}
              </div>

              <div className="w-[710px] h-[540px]">
                <div className="w-full max-w-4xl p-[30px] bg-white rounded-[10px] shadow">
                  <h2 className="text-xl font-bold mb-3">Matter Details</h2>
                  <form className="space-y-1">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Matter Date
                        </label>
                        <input
                          type="date"
                          value={clientData?.matterDate?.split("T")[0] || ""}
                          className="w-full rounded p-2 bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Matter Number
                        </label>
                        <input
                          type="text"
                          value={clientData?.matterNumber || ""}
                          className="w-full rounded p-2 bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Client Name
                        </label>
                        <input
                          type="text"
                          value={clientData?.clientName || ""}
                          className="w-full rounded p-2 bg-gray-100"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block mb-1 text-sm font-medium">
                          Property Address
                        </label>
                        <input
                          type="text"
                          value={clientData?.propertyAddress || ""}
                          className="w-full rounded p-2 bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          State
                        </label>
                        <input
                          type="text"
                          value={clientData?.state || ""}
                          className="w-full rounded p-2 bg-gray-100"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Client Type
                        </label>
                        <input
                          type="text"
                          value={clientData?.clientType || ""}
                          className="w-full rounded p-2 bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Settlement Date
                        </label>
                        <input
                          type="date"
                          value={
                            clientData?.settlementDate?.split("T")[0] || ""
                          }
                          onChange={(e) =>
                            setClientData((prev) => ({
                              ...prev,
                              settlementDate: e.target.value,
                            }))
                          }
                          className="w-full rounded p-2 border"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Data Entry By
                      </label>
                      <input
                        type="text"
                        value={clientData?.dataEntryBy || ""}
                        className="w-full rounded p-2 bg-gray-100"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Notes / Comments
                      </label>
                      <textarea
                        rows={4}
                        value={clientData?.notes || ""}
                        onChange={(e) =>
                          setClientData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Enter comments here..."
                        className="w-full border rounded p-2 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#00AEEF] hover:bg-[#0086bf] text-white font-medium py-2 rounded"
                      onClick={handleupdate}
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
