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
import UploadDialog from "../../../components/ui/uploadDialog";

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
    } catch (e) {}

    try {
      const t = localStorage.getItem("token");
      if (t) {
        const payload = JSON.parse(atob(t.split(".")[1] || ""));
        if (payload?.role) return payload.role;
      }
    } catch (e) {}

    return null;
  });

  const isAnyAdmin = role === "superadmin" || role === "admin";
  const isSuperAdmin = role === "superadmin";

  useEffect(() => {
    console.log("StagesLayout: role ->", role, "isSuperAdmin ->", isSuperAdmin);
  }, [role, isSuperAdmin]);

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
      if (currentRole !== role) {
        setRole(currentRole);
      }
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
  }, [role, setRole]);

  // ---------- component state ----------
  const [reloadStage, setReloadStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(Number(stageNo) || 1);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);
  const [isOpen, setIsOpen] = useState(false);
  const company = localStorage.getItem("company");

  const [stageStatuses, setStageStatuses] = useState({
    status1: "Not Completed",
    status2: "Not Completed",
    status3: "Not Completed",
    status4: "Not Completed",
    status5: "Not Completed",
    status6: "Not Completed",
  });

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

  function cardBaseClasses(selected) {
    return [
      "cursor-pointer p-3 rounded-lg border bg-white",
      "border-gray-300 transition-all duration-200 shadow-sm",
      selected
        ? "ring-2 ring-sky-400"
        : "hover:shadow-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400",
    ].join(" ");
  }

  function leftAccent(status) {
    const map = {
      Completed: "bg-green-600",
      "Not Completed": "bg-red-600",
      "In Progress": "bg-amber-500",
      green: "bg-green-600",
      red: "bg-red-600",
      amber: "bg-amber-500",
    };
    return map[status] || "bg-gray-300";
  }

  function badgeClasses(status) {
    const color =
      status === "Completed"
        ? "text-green-700 border-green-300 bg-green-50"
        : status === "Not Completed"
        ? "text-red-700 border-red-300 bg-red-50"
        : "text-amber-700 border-amber-300 bg-amber-50";

    return [
      "px-2 py-0.5 text-[10px] xl:text-xs rounded-full border font-medium",
      color,
    ].join(" ");
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

      if (!value || value.trim() === "") {
        newValue = "";
      } else if (value.toLowerCase() === "cancelled") {
        newValue = "Cancelled";
      } else if (value.toLowerCase() === "closed") {
        newValue = "Completed";
      } else {
        newValue = value;
      }

      return {
        ...client,
        closeMatter: newValue,
      };
    }

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
            data={normalizeCloseMatterForClient(clientData?.stage6)}
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

        // read role from server response if provided and set it immediately
        const serverRole =
          response?.role || response?.currentUser?.role || null;
        if (serverRole) {
          setRole(serverRole);
        }

        // normalize dates and notes to strings to avoid object-valued inputs
        setClientData((prev) => {
          const normalized = {
            ...prev,
            ...response,
            matterDate: response.matterDate
              ? typeof response.matterDate === "string"
                ? response.matterDate
                : new Date(response.matterDate).toISOString()
              : prev?.matterDate || "",
            settlementDate: response.settlementDate
              ? typeof response.settlementDate === "string"
                ? response.settlementDate
                : new Date(response.settlementDate).toISOString()
              : prev?.settlementDate || "",
            notes:
              response.notes !== undefined ? response.notes : prev?.notes || "",
          };
          return normalized;
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
        // always include settlementDate & notes
        settlementDate: clientData?.settlementDate || null,
        notes: clientData?.notes || "",
      };

      // only include fields that superadmin can edit
      if (isSuperAdmin) {
        payload.matterDate = clientData?.matterDate || null;
        payload.clientName = clientData?.clientName || "";
        payload.propertyAddress = clientData?.propertyAddress || "";
        payload.state = clientData?.state || "";
        payload.clientType = clientData?.clientType || "";
      }

      const updatedData = await api.updateClientData(matterNumber, payload);
      setClientData((prev) => ({
        ...prev,
        settlementDate: updatedData.settlementDate ?? prev.settlementDate,
        notes: updatedData.notes ?? prev.notes,
        matterDate: updatedData.matterDate ?? prev.matterDate,
        clientName: updatedData.clientName ?? prev.clientName,
        propertyAddress: updatedData.propertyAddress ?? prev.propertyAddress,
        state: updatedData.state ?? prev.state,
        clientType: updatedData.clientType ?? prev.clientType,
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
      <UploadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <main className="flex-grow p-4 w-full max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg md:text-xl font-semibold">
            Hello {localStorage.getItem("user")}
          </h2>

          <div className="flex items-center gap-1">
            <Button
              label="Upload Image"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[140px] "
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
              onClick={() => RenderStage(7)}
            />
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <>
            {isSmallScreen ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {stages.map((stage, index) => {
                    const stageStatus = stageStatuses[`status${stage.id}`];
                    return (
                      <div
                        key={stage.id}
                        onClick={() => setSelectedStage(stage.id)}
                        className={`cursor-pointer p-2 rounded shadow transition-colors duration-200 h-[62px] border-2 ${
                          selectedStage === stage.id
                            ? "bg-[#FFFFFF] text-black border-gray-500"
                            : `${bgcolor(stageStatus)} border-gray-300`
                        }`}
                      >
                        <div className="flex justify-between">
                          <p className="font-bold font-poppins text-xs">
                            Stage {index + 1}
                          </p>

                          <div
                            className={`h-[18px] ${
                              stageStatus === "In Progress" ||
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
              </>
            ) : (
              <div
                className={`grid grid-cols-6 gap-1 xl:gap-2 px-2 py-1 bg-[#F2FBFF] rounded mb-4`}
              >
                {stages.map((stage, index) => {
                  const stageStatus = stageStatuses[`status${stage.id}`];
                  return (
                    <div
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`cursor-pointer p-1 rounded shadow transition-colors duration-200 h-[70px] border-2 ${
                        selectedStage === stage.id
                          ? "bg-[#FFFFFF] text-black border-gray-500"
                          : `${bgcolor(stageStatus)} border-gray-300`
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold font-poppins text-xs xl:text-sm">
                          Stage {index + 1}
                        </p>
                        <div
                          className={`min-w-[70px] xl:min-w-[75px] px-1 h-[18px] ${
                            stageStatus === "In Progress" ||
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
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="w-full xl:w-3/4 p-4 rounded-md bg-white overflow-y-auto">
                {clientData && Showstage(selectedStage)}
              </div>
              <div className="w-full xl:w-1/2">
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
                    {/* First Row - 3 columns */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Matter Date"
                          : company === "idg"
                          ? "Order Date"
                          : ""}
                      </label>
                      <input
                        id="matterDate"
                        name="matterDate"
                        type={isSuperAdmin ? "date" : "text"}
                        value={
                          clientData?.matterDate
                            ? clientData.matterDate.split?.("T")[0] ??
                              clientData.matterDate
                            : ""
                        }
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          const v = e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "";
                          setClientData((prev) => ({ ...prev, matterDate: v }));
                        }}
                        className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled={!isSuperAdmin}
                      />
                    </div>

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
                        value={clientData?.matterNumber || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled={true}
                        readOnly
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Client Name
                      </label>
                      <input
                        id="clientName"
                        name="clientName"
                        type="text"
                        value={clientData?.clientName || ""}
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          setClientData((prev) => ({
                            ...prev,
                            clientName: e.target.value,
                          }));
                        }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                          !isSuperAdmin ? "bg-gray-100" : ""
                        }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    {/* Second Row - 2 columns */}
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
                        value={clientData?.propertyAddress || ""}
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          setClientData((prev) => ({
                            ...prev,
                            propertyAddress: e.target.value,
                          }));
                        }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                          !isSuperAdmin ? "bg-gray-100" : ""
                        }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        State
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={clientData?.state || ""}
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          setClientData((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }));
                        }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                          !isSuperAdmin ? "bg-gray-100" : ""
                        }`}
                        disabled={!isSuperAdmin}
                      >
                        <option value="">Select state</option>
                        {STATE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Third Row - 2 columns */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {company === "vkl"
                          ? "Client Type"
                          : company === "idg"
                          ? "Order Type"
                          : ""}
                      </label>
                      <select
                        id="clientType"
                        name="clientType"
                        value={clientData?.clientType || ""}
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          setClientData((prev) => ({
                            ...prev,
                            clientType: e.target.value,
                          }));
                        }}
                        className={`w-full rounded px-1 py-[8px] text-xs md:text-sm border border-gray-200 ${
                          !isSuperAdmin ? "bg-gray-100" : ""
                        }`}
                        disabled={!isSuperAdmin}
                      >
                        <option value="">Select client type</option>
                        {CLIENT_TYPE_OPTIONS.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                    </div>

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
                            ? clientData.settlementDate.split?.("T")[0] ??
                              clientData.settlementDate
                            : ""
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

                    {/* Fourth Row - 1 column */}
                    <div className="md:col-span-3">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Data Entry By
                      </label>
                      <input
                        type="text"
                        value={clientData?.dataEntryBy || ""}
                        className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                        disabled={true}
                        readOnly
                      />
                    </div>

                    {/* Fifth Row - Full width */}
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
