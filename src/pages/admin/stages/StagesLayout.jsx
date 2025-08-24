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
import Loader from "../../../components/ui/Loader";

export default function StagesLayout() {
  const { matterNumber, stageNo } = useParams();
  const api = new ClientAPI();
  const navigate = useNavigate();
  const isadmin=  localStorage.getItem("role") === "admin" ? true : false;
  const [reloadStage, setReloadStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(Number(stageNo) || 1);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isTabletView, setIsTabletView] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );
  const [isLaptopView, setIsLaptopView] = useState(
    window.innerWidth >= 1024 && window.innerWidth < 1440
  );
  const [isLargeScreenView, setIsLargeScreenView] = useState(
    window.innerWidth >= 1440
  );
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
  // Handles both colorStatus values and evaluated statuses
  function bgcolor(status) {
    const statusColors = {
      // For evaluated statuses
      "In progress": "bg-[#FFEECF]",
      Completed: "bg-[#00A506]",
      "Not Completed": "bg-[#FF0000]",
      // For direct colorStatus values
      green: "bg-[#00A506]",
      red: "bg-[#FF0000]",
      amber: "bg-[#FFEECF]",
      yellow: "bg-[#facc15]",
      blue: "bg-[#3b82f6]",
    };

    return statusColors[status] || "bg-[#F3F7FF]";
  }

  // Converts any status to display text
  function getStatusDisplayText(status) {
    const textMap = {
      green: "Completed",
      red: "Not Completed",
      amber: "In progress",
      yellow: "Warning",
      blue: "Info",
      "In progress": "In progress",
      Completed: "Completed",
      "Not Completed": "Not Completed",
    };

    return textMap[status] || status;
  }
    function evaluateStageStatus(stageData, fields) {
      if (!stageData || fields.length === 0) return "Not Completed";

      let yesCount = 0;
      let noCount = 0;
      let emptyCount = 0;

    for (const field of fields) {
      const val = stageData[field]?.toString().toLowerCase();
      if (val === "yes" || val == "fixed" || val == "variable") yesCount++;
      else if (val === "no") noCount++;
      else if (!val || val === "null" || val === "undefined" || val === "")
        emptyCount++;
    }

    if (emptyCount === fields.length) return "Not Completed";
    if (yesCount === fields.length) return "Completed";
    if (noCount === fields.length) return "Not Completed";
    return "In progress";
  }

  function RenderStage(newStage) {
    setSelectedStage(newStage);
    setReloadStage((prev) => !prev);
  }

  function Showstage(stage) {
    switch (stage) {
      case 1:
        return (
          <Stage1
            data={clientData?.stage1}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            color={stageStatuses}
          />
        );
      case 2:
        return (
          <Stage2
            data={clientData?.stage2}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 3:
        return (
          <Stage3
            data={clientData?.stage3}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 4:
        return (
          <Stage4
            data={clientData?.stage4}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 5:
        return (
          <Stage5
            data={clientData?.stage5}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 6:
        return (
          <Stage6
            data={clientData?.stage6}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 7:
        return (
          <Cost
            data={clientData?.costData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      default:
        return (
          <Stage1
            data={clientData?.stage1}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
    }
  }

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const response = await api.getAllStages(matterNumber);
        console.log("Full API response:", response);
        setClientData(response);

        // First check if colorStatus exists in any stage
        const hasColorStatus = Object.values(response).some(
          (stage) => stage && stage.colorStatus
        );

        const section = {};

        if (hasColorStatus) {
          section.status1 = response.stage1?.colorStatus || "Not Completed";
          section.status2 = response.stage2?.colorStatus || "Not Completed";
          section.status3 = response.stage3?.colorStatus || "Not Completed";
          section.status4 = response.stage4?.colorStatus || "Not Completed";
          section.status5 = response.stage5?.colorStatus || "Not Completed";
          section.status6 = response.stage6?.colorStatus || "Not Completed";
        } else {
          section.status1 = evaluateStageStatus(response.stage1, [
            "referral",
            "declarationForm",
            "contractReview",
            "tenants",
          ]);
          section.status2 = evaluateStageStatus(response.stage2, [
            "voi",
            "caf",
            "signedContract",
            "sendKeyDates",
            "depositReceipt",
            "buildingAndPest",
            "financeApproval",
            "obtainDaSeller",
            "checkCtController",
          ]);
          section.status3 = evaluateStageStatus(response.stage3, [
            "titleSearch",
            "planImage",
            "landTax",
            "instrument",
            "rates",
            "water",
            "ownersCorp",
            "pexa",
            "inviteBank",
          ]);
          section.status4 = evaluateStageStatus(response.stage4, [
            "dts",
            "soa",
            "frcgw",
            "dutyOnline",
          ]);
          section.status5 = evaluateStageStatus(response.stage5, [
            "notifySoaToClient",
            "transferDocsOnPexa",
            "gstWithholding",
            "disbursementsInPexa",
            "addAgentFee",
            "settlementNotification",
          ]);
          section.status6 = evaluateStageStatus(response.stage6, [
            "noaToCouncilWater",
            "dutyPaid",
            "finalLetterToClient",
            "finalLetterToAgent",
            "invoiced",
            "closeMatter",
          ]);
        }
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
  }, [matterNumber, reloadStage]);

  async function handleupdate(e) {
    e.preventDefault();
    try {
      const payload = {
        settlementDate: clientData.settlementDate || null,
        notes: clientData.notes || "",
      };

      const updatedData = await api.updateClientData(matterNumber, payload);
      setClientData((prev) => ({
        ...prev,
        settlementDate: updatedData.settlementDate,
        notes: updatedData.notes,
      }));

      alert("Updated successfully!");
    } catch (err) {
      console.error("Update error:", {
        error: err,
        response: err.response?.data,
      });
      alert("Failed to update. Please check console for details.");
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100">
      <main className="flex-grow p-4 w-full max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">
            Hello {localStorage.getItem("user")}
          </h2>

          <div className="flex items-center gap-1">
            <Button
              label="Back"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[70px] md:w-[84px]"
              onClick={() => {
                isadmin ? navigate("admin/view-clients") : navigate("/user/view-clients"); 
                localStorage.removeItem("client-storage");
              }}
            />

            <Button
              label="Cost"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[70px] md:w-[84px]"
              onClick={() => RenderStage(7)}
            />
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <>
            {isMobileView || isTabletView || isLaptopView ? (
              <div className="overflow-x-auto mb-4">
                <div className="flex space-x-2 min-w-max px-4 py-1 bg-[#F2FBFF] rounded">
                  {stages.map((stage, index) => {
                    const stageStatus = stageStatuses[`status${stage.id}`];
                    return (
                      <div
                        key={stage.id}
                        onClick={() => setSelectedStage(stage.id)}
                        className={`cursor-pointer p-2 rounded shadow transition-colors duration-200 flex-shrink-0 w-40 h-[62px] ${
                          selectedStage === stage.id
                            ? "bg-[#FFFFFF] text-black"
                            : bgcolor(stageStatus)
                        }`}
                      >
                        <div className="flex justify-between">
                          <p className="font-bold font-poppins text-xs">
                            Stage {index + 1}
                          </p>

                          <div
                            className={`h-[18px] ${
                              stageStatus === "In progress" ||
                              stageStatus === "amber"
                                ? "text-[#FF9500]"
                                : "text-black"
                            } flex items-center justify-center rounded-4xl`}
                          >
                            <p className="text-[10px] whitespace-nowrap font-bold">
                              {getStatusDisplayText(stageStatus)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs">{stage.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`
 grid grid-cols-6 gap-2 px-3 py-1 bg-[#F2FBFF] rounded mb-4`}
              >
                {stages.map((stage, index) => {
                  const stageStatus = stageStatuses[`status${stage.id}`];
                  return (
                    <div
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`cursor-pointer p-2 rounded shadow transition-colors duration-200 h-[70px] ${
                        selectedStage === stage.id
                          ? "bg-[#FFFFFF] text-black "
                          : bgcolor(stageStatus)
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold font-poppins text-md">
                          Stage {index + 1}
                        </p>
                        <div
                          className={`min-w-[90px] px-1 h-[18px] ${
                            stageStatus === "In progress" ||
                            stageStatus === "amber"
                              ? "text-[#FF9500]"
                              : stageStatus === "Completed" ||
                                stageStatus === "green"
                          } flex items-center justify-center rounded-4xl`}
                        >
                          <p className="text-xs whitespace-nowrap font-bold">
                            {getStatusDisplayText(stageStatus)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-md">{stage.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="w-full xl:w-3/4 p-4 rounded-md bg-white overflow-y-auto">
                {clientData && Showstage(selectedStage)}
              </div>
              <div className="w-full xl:w-1/2">
                <div className="w-full bg-white rounded shadow border border-gray-200 p-4">
                  <h2 className="text-lg font-bold mb-2">Matter Details</h2>
                  <form
                    className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2"
                    onSubmit={handleupdate}
                  >
                    {/* First Row - 3 columns */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold mb-1">
                        Matter Date
                      </label>
                      <input
                        type="text"
                        value={clientData?.matterDate?.split("T")[0] || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-md border border-gray-200"
                        disabled
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold mb-1">
                        Matter Number
                      </label>
                      <input
                        type="text"
                        value={clientData?.matterNumber || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-md border border-gray-200"
                        disabled
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={clientData?.clientName || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-md border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Second Row - 2 columns */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Property Address
                      </label>
                      <input
                        type="text"
                        value={clientData?.propertyAddress || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-md border border-gray-200"
                        disabled
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={clientData?.state || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-md border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Third Row - 2 columns */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold mb-1">
                        Client Type
                      </label>
                      <input
                        type="text"
                        value={clientData?.clientType || ""}
                        className="w-full rounded bg-gray-100 px-2 py-[8px] text-sm border border-gray-200"
                        disabled
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Settlement Date
                      </label>
                      <input
                        type="date"
                        value={
                          clientData?.settlementDate
                            ? new Date(clientData.settlementDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setClientData((prev) => ({
                            ...prev,
                            settlementDate: dateValue,
                          }));
                        }}
                        className="w-full rounded p-2 border border-gray-200 text-sm"
                      />
                    </div>

                    {/* Fourth Row - 1 column */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-semibold mb-1">
                        Data Entry By
                      </label>
                      <input
                        type="text"
                        value={clientData?.dataEntryBy || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-sm border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Fifth Row - Full width */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-semibold mb-1">
                        Notes / Comments
                      </label>
                      <textarea
                        rows={5}
                        value={clientData?.notes || ""}
                        onChange={(e) =>
                          setClientData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Enter comments here..."
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm resize-none"
                      />
                    </div>

                    {/* Update Button - Full width */}
                    <div className="md:col-span-3 mt-3">
                      <button
                        type="submit"
                        className="w-full bg-[#00AEEF] hover:bg-[#0086bf] text-white font-medium rounded py-2 text-base"
                      >
                        Update
                      </button>
                    </div>
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
