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
      "In Progress": "bg-[#FFEECF]",
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
    setReloadStage((prev) => !prev);
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
          />
        );
      case 2:
        return (
          <Stage2
            data={clientData?.stage2 || clientData?.data.stage2}
            clientType={clientData?.clientType}
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
            data={localStorage.getItem("company") === "vkl" ? normalizeCloseMatterForClient(clientData?.stage6) : clientData?.data.stage6}
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
        let response = company === "vkl" ? await api.getAllStages(matterNumber) : company === "idg" ? await api.getIDGStages(matterNumber) : null;
        console.log(response);
        const serverRole =
          response?.role || response?.currentUser?.role || null;
        if (serverRole) setRole(serverRole);

        const normalized = {
          ...response,
          matterDate: response.matterDate
            ? typeof response.matterDate === "string"
              ? response.matterDate
              : new Date(response.matterDate).toISOString()
            : "",
          settlementDate: response.settlementDate
            ? typeof response.settlementDate === "string"
              ? response.settlementDate
              : new Date(response.settlementDate).toISOString()
            : "",
          notes:
            response.notes !== undefined
              ? response.notes
              : response.notes ?? "",
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

        if(localStorage.getItem("company") === "vkl") {

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
      }else if(localStorage.getItem("company") === "idg") {
          section.status1 = response.data.stage1?.colorStatus || "Not Completed";
          section.status2 = response.data.stage2?.colorStatus || "Not Completed";
          section.status3 = response.data.stage3?.colorStatus || "Not Completed";
          section.status4 = response.data.stage4?.colorStatus || "Not Completed";
          section.status5 = response.data.stage5?.colorStatus || "Not Completed";
          section.status6 = response.data.stage6?.colorStatus || "Not Completed";
        setStageStatuses(section);
      }
    }
       catch (e) {
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
    if (!hasChanges) return;
    setShowConfirmModal(true);
  }

  async function performUpdate() {
    if (!hasChanges) {
      setShowConfirmModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      let payload = {};
      if (localStorage.getItem("company") === "vkl") {
        payload = {
          settlementDate: clientData?.settlementDate || null,
          notes: clientData?.notes || "",
        };
      } else if (localStorage.getItem("company") === "idg") {
        payload = {
          deliveryDate: clientData?.data.deliveryDate || null,
          notes: clientData?.data.notes || "",
        };
      }

      if (isSuperAdmin) {
        payload.matterDate = clientData?.matterDate || null;
        payload.clientName = clientData?.clientName || "";
        payload.propertyAddress = clientData?.propertyAddress || "";
        payload.state = clientData?.state || "";
        payload.clientType = clientData?.clientType || "";
        payload.dataEntryBy = clientData?.dataEntryBy || "";

        if (
          clientData?.matterNumber !== undefined &&
          String(clientData?.matterNumber) !== String(originalMatterNumber)
        ) {
          payload.matterNumber = clientData.matterNumber;
        }
      }
      let resp = {};
      if (localStorage.getItem("company") === "vkl") {
        resp = await api.updateClientData(originalMatterNumber, payload);
      }
      else {
        resp = await api.updateIDGClientData(originalMatterNumber, payload);
      }
      const updatedClient = resp.client || resp;
      const normalizedUpdated = {
        ...updatedClient,
        matterDate: updatedClient?.matterDate
          ? typeof updatedClient.matterDate === "string"
            ? updatedClient.matterDate
            : new Date(updatedClient.matterDate).toISOString()
          : "",
        settlementDate: updatedClient?.settlementDate
          ? typeof updatedClient.settlementDate === "string"
            ? updatedClient.settlementDate
            : new Date(updatedClient.settlementDate).toISOString()
          : "",
      };
      setClientData((prev) => ({ ...(prev || {}), ...normalizedUpdated }));
      setOriginalClientData(JSON.parse(JSON.stringify(normalizedUpdated)));
      setOriginalMatterNumber(
        normalizedUpdated.matterNumber || originalMatterNumber
      );
      toast.success("Matter details updated successfully");
      if (resp.directUrl) {
        let direct = resp.directUrl;
        if (!direct.startsWith("/")) direct = `/${direct}`;
        if (!direct.match(/^\/admin/)) direct = `/admin${direct}`;
        setTimeout(() => {
          try {
            navigate(direct);
          } catch {
            window.location.href = direct;
          }
        }, 450);
        return;
      }
      if (
        normalizedUpdated?.matterNumber &&
        String(normalizedUpdated.matterNumber) !== String(originalMatterNumber)
      ) {
        setTimeout(() => {
          try {
            navigate(`/admin/client/stages/${normalizedUpdated.matterNumber}`);
          } catch {
            window.location.href = `/admin/client/stages/${normalizedUpdated.matterNumber}`;
          }
        }, 450);
      }
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
                {console.log("clientData", clientData)}
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
                    <div className="md:col-span-1"> <label className="block text-xs md:text-sm font-semibold mb-1"> {company === "vkl" ? "Matter Date" : company === "idg" ? "Order Date" : ""} </label>
                      <input id="matterDate" name="matterDate"
                        type={isSuperAdmin ? "date" : "text"}
                        value={clientData?.matterNumber ? formatDateForDisplay(clientData.matterDate) : clientData?.data.orderDate ? formatDateForDisplay(clientData.data.orderDate) : ""}
                        onChange={(e) => { if (!isSuperAdmin) return; const v = e.target.value ? new Date(e.target.value).toISOString() : ""; setClientData((prev) => ({ ...prev, matterDate: v })); }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${!isSuperAdmin ? "bg-gray-100" : ""}`}
                        disabled={!isSuperAdmin} />
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

                      {isSuperAdmin ? (
                        <input
                          type="text"
                          value={clientData?.matterNumber || clientData?.data.orderId || ""}
                          onChange={(e) =>
                            setClientData((prev) => ({
                              ...prev,
                              matterNumber: e.target.value,
                            }))
                          }
                          className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                        />
                      ) : (
                        <input
                          type="text"
                          value={clientData?.matterNumber || clientData?.data.orderId || ""}
                          className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                          disabled
                          readOnly
                        />
                      )}
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
                        value={clientData?.clientName || clientData?.data?.client.name || ""}
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          setClientData((prev) => ({
                            ...prev,
                            clientName: e.target.value,
                          }));
                        }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${!isSuperAdmin ? "bg-gray-100" : ""
                          }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    {/* Property Address */}
                    <div className="md:col-span-2">
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
                        value={clientData?.propertyAddress || clientData?.data.deliveryAddress || ""}
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          setClientData((prev) => ({
                            ...prev,
                            propertyAddress: e.target.value,
                          }));
                        }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${!isSuperAdmin ? "bg-gray-100" : ""
                          }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        State
                      </label>
                      {isSuperAdmin ? (
                        <select
                          id="state"
                          name="state"
                          value={clientData?.state || clientData?.data.country || ""}
                          onChange={(e) =>
                            setClientData((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                        >
                          <option value="">Select state</option>
                          {STATE_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={clientData?.state || clientData?.data.state || ""}
                          className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Client Type"
                          : company === "idg"
                            ? "Order Type"
                            : ""}
                      </label>
                      {isSuperAdmin ? (
                        <select
                          id="clientType"
                          name="clientType"
                          value={clientData?.clientType || clientData?.data?.orderType}
                          onChange={(e) =>
                            setClientData((prev) => ({
                              ...prev,
                              clientType: e.target.value,
                            }))
                          }
                          className="w-full rounded px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                        >
                          <option value="">Select client type</option>
                          {CLIENT_TYPE_OPTIONS.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={clientData?.clientType || clientData?.data?.orderType}
                          className="w-full rounded bg-gray-100 px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                          disabled
                          readOnly
                        />
                      )}
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
                        id={company === "vkl" ? "settlementDate" : "deliveryDate"}
                        name={company === "vkl" ? "settlementDate" : "deliveryDate"}
                        type="date"
                        value={
                          company === "vkl"
                            ? clientData?.settlementDate
                              ? new Date(clientData.settlementDate).toISOString().substring(0, 10)
                              : ""
                            : company === "idg"
                              ? clientData?.data?.deliveryDate
                                ? new Date(clientData.data.deliveryDate).toISOString().substring(0, 10)
                                : ""
                              : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value; // ✅ use YYYY-MM-DD directly

                          if (company === "vkl") {
                            setClientData((prev) => ({
                              ...prev,
                              settlementDate: dateValue,
                            }));
                          } else if (company === "idg") {
                            setClientData((prev) => ({
                              ...prev,
                              data: {
                                ...(prev.data || {}),
                                deliveryDate: dateValue,
                              },
                            }));
                          }
                        }}
                        className="w-full rounded p-2 border border-gray-200 text-xs md:text-sm"
                      />
                    </div>

                    {/* Data Entry By */}
                    <div className="md:col-span-3">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Data Entry By
                      </label>

                      {isSuperAdmin ? (
                        <input
                          type="text"
                          value={clientData?.dataEntryBy || clientData?.data.dataEntryBy}
                          onChange={(e) =>
                            setClientData((prev) => ({
                              ...prev,
                              dataEntryBy: e.target.value,
                            }))
                          }
                          className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                        />
                      ) : (
                        <input
                          type="text"
                          value={clientData?.dataEntryBy || clientData?.data.dataEntryBy}
                          className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    {/* Notes */}
                      <div className="md:col-span-3">
                        <label className="block text-xs md:text-sm font-semibold mb-1">
                          Notes / Comments
                        </label>
                        <textarea
                          rows={5}
                          value={clientData?.notes || clientData?.data?.notes}
                          onChange={(e) => {
                            const newNote = e.target.value;
                            setClientData((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                  notes: newNote,
                              },
                            }));
                          }}
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
        onConfirm={performUpdate}
      >
        Are you sure you want to update client data?
      </ConfirmationModal>
    </div>
  );
}