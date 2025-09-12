import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
import UploadDialog from "../../../components/ui/uploadDialog";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

const formatDateForDisplay = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDisplayDateForAPI = (displayDate) => {
  if (!displayDate || !/^\d{2}-\d{2}-\d{4}$/.test(displayDate)) {
    return null;
  }
  const [day, month, year] = displayDate.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
};

export default function StagesLayout() {
  const { matterNumber, stageNo } = useParams();
  const api = new ClientAPI();
  const navigate = useNavigate();

  const [role, setRole] = useState(() => {
    const r = localStorage.getItem("role");
    if (r) return r;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?.role) return u.role;
    } catch (e) { }
    try {
      const t = localStorage.getItem("token");
      if (t) {
        const payload = JSON.parse(atob(t.split(".")[1] || ""));
        if (payload?.role) return payload.role;
      }
    } catch (e) { }
    return null;
  });

  const isAnyAdmin = role === "superadmin" || role === "admin";
  const isSuperAdmin = role === "superadmin";

  useEffect(() => {
    const onStorage = (e) => {
      if (["role", "user", "token"].includes(e.key)) {
        const newRole =
          localStorage.getItem("role") ||
          (() => {
            try {
              const u = JSON.parse(localStorage.getItem("user") || "null");
              return u?.role;
            } catch (e) {
              return null;
            }
          })();
        setRole(newRole);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const refreshRole = () => {
      const currentRole =
        localStorage.getItem("role") ||
        (() => {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.role;
          } catch (e) {
            return null;
          }
        })();
      if (currentRole !== role) setRole(currentRole);
    };
    const onVisibility = () => {
      if (!document.hidden) refreshRole();
    };
    const onFocus = () => refreshRole();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [role]);

  const [reloadStage, setReloadStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(Number(stageNo) || 1);
  const [clientData, setClientData] = useState(null);
  const [originalClientData, setOriginalClientData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);
  const [isOpen, setIsOpen] = useState(false);
  const company = localStorage.getItem("company");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [stageStatuses, setStageStatuses] = useState({
    status1: "Not Completed",
    status2: "Not Completed",
    status3: "Not Completed",
    status4: "Not Completed",
    status5: "Not Completed",
    status6: "Not Completed",
  });

  const [originalMatterNumber, setOriginalMatterNumber] =
    useState(matterNumber);
  useEffect(() => {
    setOriginalMatterNumber(matterNumber);
  }, [matterNumber]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const STATE_OPTIONS = ["VIC", "NSW", "QLD", "SA"];
  const CLIENT_TYPE_OPTIONS = ["Buyer", "Seller", "Transfer"];

  let stages = [
    { id: 1, title: "Retainer/Declaration" },
    { id: 2, title: "VOI/CAF/Approvals" },
    { id: 3, title: "Searches/PEXA" },
    { id: 4, title: "DTS/DOL/SOA" },
    { id: 5, title: "Notify/Transfer/Disb" },
    { id: 6, title: "Final Letter/Close" },
  ];

  if (localStorage.getItem("company") === "vkl") {
    stages = [
      { id: 1, title: "Retainer/Declaration" },
      { id: 2, title: "VOI/CAF/Approvals" },
      { id: 3, title: "Searches/PEXA" },
      { id: 4, title: "DTS/DOL/SOA" },
      { id: 5, title: "Notify/Transfer/Disb" },
      { id: 6, title: "Final Letter/Close" },
    ];
  } else if (localStorage.getItem("company") === "idg") {
    stages = [
      { id: 1, title: "Initiate" },
      { id: 2, title: "Approve" },
      { id: 3, title: "Plan" },
      { id: 4, title: "Prepare" },
      { id: 5, title: "Process" },
      { id: 6, title: "Final Deliver" },
    ];
  }

  function bgcolor(status) {
    const statusColors = {
      "In Progress": "bg-[#FFEECF]", // Changed Casing  
      Completed: "bg-[#00A506]",
      "Not Completed": "bg-[#FF0000]",
      green: "bg-[#00A506]",
      red: "bg-[#FF0000]",
      amber: "bg-[#FFEECF]",
      yellow: "bg-[#facc15]",
      blue: "bg-[#3b82f6]",
    };
    return statusColors[status] || "bg-[#F3F7FF]";
  }

  function getStatusDisplayText(status) {
    const textMap = {
      green: "Completed",
      red: "Not Completed",
      amber: "In Progress",
      yellow: "Warning",
      blue: "Info",
      "In Progress": "In Progress",
      Completed: "Completed",
      "Not Completed": "Not Completed",
    };
    return textMap[status] || status;
  }

  function evaluateStageStatus(stageData, fields) {
    if (!stageData || fields.length === 0) return "Not Completed";
    let yesCount = 0,
      noCount = 0,
      emptyCount = 0;
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
    return "In Progress";
  }

  function RenderStage(newStage) {
    setSelectedStage(newStage);
    // setReloadStage((prev) => !prev);
  }

  function Showstage(stage) {
    function normalizeCloseMatterForClient(client) {
      if (!client || typeof client !== "object") return client;
      const value = client.closeMatter;
      let newValue;
      if (!value || value.trim() === "") newValue = "";
      else if (value.toLowerCase() === "cancelled") newValue = "Cancelled";
      else if (value.toLowerCase() === "closed") newValue = "Completed";
      else newValue = value;
      return { ...client, closeMatter: newValue };
    }

    switch (stage) {
      case 1:
        return (
          <Stage1
            data={clientData?.stage1 || clientData?.data.stage1}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            color={stageStatuses}
          />
        );
      case 2:
        return (
          <Stage2
            data={clientData?.stage2 || clientData?.data.stage2}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 3:
        return (
          <Stage3
            data={clientData?.stage3 || clientData?.data.stage3}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 4:
        return (
          <Stage4
            data={clientData?.stage4 || clientData?.data.stage4}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 5:
        return (
          <Stage5
            data={clientData?.stage5 || clientData?.data.stage5}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 6:
        return (
          <Stage6
            data={localStorage.getItem("company")==="vkl" ? normalizeCloseMatterForClient(clientData?.stage6) : clientData?.data.stage6}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 7:
        return (
          <Cost
            data={clientData?.costData || clientData?.data.costData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      default:
        return (
          <Stage1
            data={clientData?.stage1 || clientData?.data.stage1}
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
        let response={};
        if(localStorage.getItem("company") === "idg") {
        response = await api.getIDGStages(matterNumber);
        }
        else{
        response = await api.getAllStages(matterNumber);
        }
        const serverRole =
          response?.role || response?.currentUser?.role || null;
        if (serverRole) setRole(serverRole);

        // Helper function to handle date normalization
        const normalizeDate = (dateValue) => {
          // If the date is null, undefined, or an empty string, return ""
          if (!dateValue) {
            return "";
          }
          // If it's already a string, assume it's correctly formatted
          if (typeof dateValue === "string") {
            return dateValue;
          }
          // Otherwise, convert it to an ISO string
          return new Date(dateValue).toISOString();
        };

        // The simplified object creation
        const normalized = {
          ...response,
          matterDate: normalizeDate(response.matterDate),
          settlementDate: normalizeDate(response.settlementDate),
          notes: response.notes ?? "", // This single line perfectly handles the logic
        };

        setClientData((prev) => {
          return { ...(prev || {}), ...normalized };
        });
        setOriginalClientData((prev) => {
          try {
            if (!prev || prev.matterNumber !== normalized.matterNumber) {
              return JSON.parse(JSON.stringify(normalized));
            }
            return prev;
          } catch {
            return normalized;
          }
        });

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
        toast.error("Failed to fetch client details.");
      } finally {
        setLoading(false);
      }
    }

    if (matterNumber) fetchDetails();
  }, [matterNumber, reloadStage]);
  useEffect(() => {
    if (!clientData || !originalClientData) {
      setHasChanges(false);
      return;
    }
    try {
      const a = JSON.stringify(clientData);
      const b = JSON.stringify(originalClientData);
      setHasChanges(a !== b);
    } catch (err) {
      setHasChanges(true);
    }
  }, [clientData, originalClientData]);

  async function handleupdate(e) {
    e.preventDefault();
    console.log(clientData);
    try {
      let payload = {};
      if (localStorage.getItem("company") === "vkl") {
        payload = {
          settlementDate: clientData.settlementDate || null,
          notes: clientData.notes || "",
        };
      }
      else {
        payload = {
          deliveryDate: clientData.settlementDate || null,
          notes: clientData.notes || "",
        };
      }


      const company = localStorage.getItem("company");
      const updatedData = company === "vkl" ? await api.updateClientData(matterNumber, payload) : company === "idg" ? await api.updateIDGClientData(matterNumber, payload) : null;


      if (localStorage.getItem("company") === "vkl") {
        setClientData((prev) => ({
          ...prev,
          settlementDate: updatedData.settlementDate ?? prev.settlementDate,
          notes: updatedData.notes ?? prev.notes,
        }));
      }
      else if (localStorage.getItem("company") === "idg") {
        setClientData((prev) => ({
          ...prev,
          deliveryDate: updatedData.settlementDate ?? prev.settlementDate,
          notes: updatedData.notes ?? prev.notes,
        }));
      }

      alert("Updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      let msg = "Failed to update. Check console for details.";
      if (err?.message) msg = err.message;
      else if (err?.body?.message) msg = err.body.message;

      toast.error(msg);
    } finally {
      setIsUpdating(false);
      setShowConfirmModal(false);
    }
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100 overflow-hidden">
      <UploadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <main className="flex-grow flex flex-col p-4 w-full max-w-screen-xl mx-auto overflow-hidden">
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold">
            Hello {localStorage.getItem("user")}
          </h2>

          <div className="flex items-center gap-1">
            <Button
              label="Upload Image"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[140px]"
              onClick={() => setIsOpen(true)}
            />
            <Button
              label="Back"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[60px] md:w-[70px]"
              onClick={() => {
                isAnyAdmin
                  ? navigate("/admin/view-clients")
                  : navigate("/user/view-clients");
                localStorage.removeItem("client-storage");
              }}
            />
            <Button
              label="Cost"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[60px] md:w-[70px]"
              onClick={() => setSelectedStage(7)}
            />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {isSmallScreen ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 flex-shrink-0">
                {stages.map((stage, index) => {
                  const stageStatus = stageStatuses[`status${stage.id}`];
                  return (
                    <div
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`cursor-pointer p-2 rounded shadow transition-colors duration-200 h-[62px] border-2 ${selectedStage === stage.id
                          ? "bg-[#FFFFFF] text-black border-gray-500"
                          : `${bgcolor(stageStatus)} border-gray-300`
                        }`}
                    >
                      <div className="flex justify-between">
                        <p className="font-bold font-poppins text-xs">
                          Stage {index + 1}
                        </p>
                        <div
                          className={`h-[18px] ${stageStatus === "In Progress" ||
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
            ) : (
              <div
                className={`grid grid-cols-6 gap-1 xl:gap-2 px-2 py-1 bg-[#F2FBFF] rounded mb-4 flex-shrink-0`}
              >
                {stages.map((stage, index) => {
                  const stageStatus = stageStatuses[`status${stage.id}`];
                  return (
                    <div
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`cursor-pointer p-1 rounded shadow transition-colors duration-200 h-[70px] border-2 ${selectedStage === stage.id
                          ? "bg-[#FFFFFF] text-black border-gray-500"
                          : `${bgcolor(stageStatus)} border-gray-300`
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold font-poppins text-xs xl:text-sm">
                          Stage {index + 1}
                        </p>
                        <div
                          className={`min-w-[70px] xl:min-w-[75px] px-1 h-[18px] ${stageStatus === "In Progress" ||
                              stageStatus === "amber"
                              ? "text-[#FF9500]"
                              : stageStatus === "Completed" ||
                              stageStatus === "green"
                            } flex items-center justify-center rounded-4xl`}
                        >
                          <p className="text-[11px] xl:text-xs whitespace-nowrap font-bold">
                            {getStatusDisplayText(stageStatus)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-0.5">
                        <p className="text-xs xl:text-sm">{stage.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col xl:flex-row gap-4 flex-grow overflow-hidden">
              <div className="w-[1500px] p-4 rounded-md bg-white overflow-y-auto">
                {clientData && Showstage(selectedStage)}
              </div>

              <div className="w-[500px] flex-shrink-0">
                <div className="w-full bg-white rounded shadow border border-gray-200 p-4">
                  <h2 className="text-lg font-bold mb-2">
                    {company === "vkl"
                      ? "Matter Details"
                      : company === "idg"
                        ? "Order Details"
                        : ""}
                  </h2>
                  <form
                    className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2"
                    onSubmit={handleupdate}
                  >
                    {/* Matter Date */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Matter Date"
                          : company === "idg"
                            ? "Order Date"
                            : ""}
                      </label>
                      <input
                        type="text"
                        // value={clientData?.matterDate?.split("T")[0] || ""}
                        value={localStorage.getItem("company") === "idg" ? clientData?.data.orderDate?.split("T")[0] : clientData?.matterDate?.split("T")[0] || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Matter Number */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Matter Number"
                          : company === "idg"
                            ? "Order ID"
                            : ""}
                      </label>
                      <input
                        type="text"
                        // value={clientData?.matterNumber || ""}
                        value={localStorage.getItem("company") === "vkl" ? clientData?.matterNumber : clientData?.data.orderId}

                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Client Name */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Client Name
                      </label>
                      <input
                        id="clientName"
                        name="clientName"
                        type="text"
                        value={localStorage.getItem("company") === "vkl" ? clientData?.clientName : clientData?.data.client.name}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Second Row - 2 columns */}
                    <div className="md:col-span-3">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {localStorage.getItem("company") === "vkl"
                          ? "Property Address"
                          : company === "idg"
                            ? "Billing Address"
                            : "Address"}
                      </label>
                      <input
                        id="propertyAddress"
                        name="propertyAddress"
                        type="text"
                        value={localStorage.getItem("company") === "vkl" ? clientData?.propertyAddress : clientData?.data.client.billingAddress}
                        // value={clientData?.propertyAddress || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>
                    {localStorage.getItem("company") === "vkl" && <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={clientData?.state || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>}

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Client Type"
                          : company === "idg"
                            ? "Order Type"
                            : ""}
                      </label>
                      <input
                        type="text"
                        value={clientData?.clientType || clientData?.data?.orderType}
                        className="w-full rounded bg-gray-100 px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Settlement Date */}
                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Settlement Date"
                          : company === "idg"
                            ? "Delivery Date"
                            : ""}
                      </label>
                      <input
                        id="settlementDate"
                        name="settlementDate"
                        type="date"
                        value={
                          clientData?.settlementDate
                            ? new Date(clientData.settlementDate)
                              .toISOString()
                              .split("T")[0]
                            : clientData?.data.deliveryDate
                              ? new Date(clientData.data.deliveryDate)
                                .toISOString()
                                .split("T")[0] : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "";
                          setClientData((prev) => ({
                            ...prev,
                            settlementDate: dateValue,
                          }));
                        }}
                        className="w-full rounded p-2 border border-gray-200 text-xs md:text-sm"
                      />
                    </div>

                    {/* Data Entry By */}
                    <div className="md:col-span-3">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Data Entry By
                      </label>
                      <input
                        type="text"
                        value={clientData?.dataEntryBy || clientData?.data.dataEntryBy}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-3">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
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
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs md:text-sm resize-none"
                      />
                    </div>

                    <div className="md:col-span-3 mt-3">
                      <button
                        type="submit"
                        className={`w-full ${hasChanges
                            ? "bg-[#00AEEF] hover:bg-[#0086bf] text-white"
                            : "bg-gray-300 text-gray-200 cursor-not-allowed"
                          } font-medium rounded py-2 text-base`}
                        disabled={!hasChanges}
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
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm update"
        // onConfirm={performUpdate}
      >
        Are you sure you want to update client data?
      </ConfirmationModal>
    </div>
  );
}