import { useEffect, useState, useRef } from "react";
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
import CommercialAPI from "../../../api/commercialAPI";
import Loader from "../../../components/ui/Loader";
import UploadDialog from "../../../components/ui/uploadDialog";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const formatDateForDisplay = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Default project structure for new commercial projects
const createDefaultProjectData = (matterNumber) => ({
  matterNumber,
  stage1: {},
  stage2: {},
  stage3: {},
  stage4: {},
  stage5: {},
  stage6: {},
  notes: "",
  clientName: "",
  businessName: "",
  businessAddress: "",
  state: "",
  clientType: "",
  matterDate: "",
  settlementDate: "",
  dataEntryBy: "",
  postcode: "",
  status: "active",
});

export default function StagesLayout() {
  const { matterNumber, stageNo } = useParams();
  const apiRef = useRef(new ClientAPI());
  const commercialApiRef = useRef(new CommercialAPI());
  const navigate = useNavigate();

  const [role, setRole] = useState(() => {
    const r = localStorage.getItem("role");
    if (r) return r;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u && u.role) return u.role;
    } catch {
      // ignore parse error
    }
    try {
      const t = localStorage.getItem("token");
      if (t) {
        try {
          const payload = JSON.parse(atob(t.split(".")[1] || ""));
          if (payload && payload.role) return payload.role;
        } catch {
          // ignore token parse error
        }
      }
    } catch {
      // ignore localStorage access error
    }
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
            } catch {
              // ignore parse error
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
          } catch {
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
  const currentModule = localStorage.getItem("currentModule");
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [_isUpdating, setIsUpdating] = useState(false);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);

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

  if (currentModule === "conveyancing" || currentModule === "wills") {
    stages = [
      { id: 1, title: "Retainer/Declaration" },
      { id: 2, title: "VOI/CAF/Approvals" },
      { id: 3, title: "Searches/PEXA" },
      { id: 4, title: "DTS/DOL/SOA" },
      { id: 5, title: "Notify/Transfer/Disb" },
      { id: 6, title: "Final Letter/Close" },
    ];
  } else if (currentModule === "print media") {
    stages = [
      { id: 1, title: "Initiate & Approve" },
      { id: 2, title: "Plan & Prepare" },
      { id: 3, title: "Process & Deliver" },
      { id: 4, title: "Upload Image & Close" },
    ];
  } else if (currentModule === "commercial") {
    stages = [
      { id: 1, title: "Engagement & Proposal" },
      { id: 2, title: "Due Diligence & Negotiation" },
      { id: 3, title: "Execution & Registration" },
      { id: 4, title: "Finalization & Settlement" },
      { id: 5, title: "Review & Compliance" },
      { id: 6, title: "Completion & Archiving" },
    ];
  }

  // Floating Background Elements (same as ViewClients)
  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block"
      style={{
        width: size,
        height: size,
        top: `${top}%`,
        left: `${left}%`,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
      }}
      transition={{
        duration: 3 + delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

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

  const pendingStageRef = useRef(null);

  function RenderStage(newStage) {
    if (hasChanges) {
      pendingStageRef.current = newStage;
      setShowUnsavedConfirm(true);
      return;
    }

    setSelectedStage(newStage);
    setReloadStage((prev) => !prev);
  }
  const getStageData = (stageNumber) => {
    if (!clientData) return null;

    // For commercial projects
    if (currentModule === "commercial") {
      // Prioritize the full stage object if available
      let stageData = clientData[`stage${stageNumber}`] || {};

      // If we have a stages array (status summary), merge the color status
      if (
        clientData.stages &&
        Array.isArray(clientData.stages) &&
        clientData.stages.length > 0
      ) {
        const stageObject = clientData.stages[0];
        const stageKey = `S${stageNumber}`;
        if (stageObject[stageKey]) {
          stageData = { ...stageData, colorStatus: stageObject[stageKey] };
        }
      }
      return stageData;
    }

    // For other modules, use the existing structure
    if (clientData.data && clientData.data[`stage${stageNumber}`]) {
      return clientData.data[`stage${stageNumber}`];
    }

    return clientData[`stage${stageNumber}`] || null;
  };

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

    const stageData = getStageData(stage);

    switch (stage) {
      case 1:
        return (
          <Stage1
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      case 2:
        return (
          <Stage2
            data={stageData}
            user={clientData?.users || []}
            clientType={clientData?.clientType}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      case 3:
        return (
          <Stage3
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      case 4:
        return (
          <Stage4
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      case 5:
        return (
          <Stage5
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      case 6:
        return (
          <Stage6
            data={
              currentModule !== "print media"
                ? normalizeCloseMatterForClient(stageData)
                : stageData
            }
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      case 7:
        return (
          <Cost
            data={clientData?.costData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
      default:
        return (
          <Stage1
            data={getStageData(1)}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setHasChanges}
          />
        );
    }
  }

  useEffect(() => {
    // Update the fetchDetails function for commercial module
    async function fetchDetails() {
      try {
        setLoading(true);
        const currentModule = localStorage.getItem("currentModule");

        let response = null;
        if (currentModule === "commercial") {
          try {
            // Try to get full client data directly which includes stage details
            try {
              // Fetch main client data and ALL stages in parallel to ensure we have the latest data
              const [clientData, s1, s2, s3, s4, s5, s6] = await Promise.all([
                commercialApiRef.current
                  .getClientAllData(matterNumber)
                  .catch((e) => {
                    console.warn("getClientAllData failed", e);
                    return null;
                  }),
                commercialApiRef.current
                  .getStageData(1, matterNumber)
                  .catch(() => ({})),
                commercialApiRef.current
                  .getStageData(2, matterNumber)
                  .catch(() => ({})),
                commercialApiRef.current
                  .getStageData(3, matterNumber)
                  .catch(() => ({})),
                commercialApiRef.current
                  .getStageData(4, matterNumber)
                  .catch(() => ({})),
                commercialApiRef.current
                  .getStageData(5, matterNumber)
                  .catch(() => ({})),
                commercialApiRef.current
                  .getStageData(6, matterNumber)
                  .catch(() => ({})),
              ]);

              if (clientData) {
                // Helper to safely extract stage data
                const getS = (s, key, altKey) => {
                  const direct = s?.data || s || {};
                  // If direct is not empty (has keys), use it
                  if (direct && Object.keys(direct).length > 0) return direct;
                  // Fallback to clientData keys
                  return clientData[key] || clientData[altKey] || {};
                };

                // Helper to merge root fields for Stage 6 if they exist there
                const getStage6Data = () => {
                  const base = getS(s6, "stage6", "stageSix");
                  // List of Commercial Stage 6 fields that might be on root
                  const rootFields = [
                    "notifySoaToClient",
                    "council",
                    "settlementNotificationToClient",
                    "settlementNotificationToCouncil",
                    "settlementNotificationToWater",
                    "finalLetterToClient",
                    "invoiced",
                    "closeMatter",
                    "colorStatus",
                  ];

                  const merged = { ...base };
                  rootFields.forEach((field) => {
                    if (
                      clientData[field] !== undefined &&
                      clientData[field] !== null &&
                      clientData[field] !== ""
                    ) {
                      merged[field] = clientData[field];
                    }
                  });
                  return merged;
                };

                response = {
                  ...clientData,
                  stage1: getS(s1, "stage1", "stageOne"),
                  stage2: getS(s2, "stage2", "stageTwo"),
                  stage3: getS(s3, "stage3", "stageThree"),
                  stage4: getS(s4, "stage4", "stageFour"),
                  stage5: getS(s5, "stage5", "stageFive"),
                  stage6: getStage6Data(),
                };
              } else {
                // Fallback if main fetch fails but we have stage data?
                const backupData =
                  await commercialApiRef.current.getProjectFullData(
                    matterNumber
                  );
                const safeBackup =
                  backupData || createDefaultProjectData(matterNumber);

                const getSBackup = (s, key, altKey) => {
                  const direct = s?.data || s || {};
                  if (direct && Object.keys(direct).length > 0) return direct;
                  return safeBackup[key] || safeBackup[altKey] || {};
                };

                response = {
                  ...safeBackup,
                  stage1: getSBackup(s1, "stage1", "stageOne"),
                  stage2: getSBackup(s2, "stage2", "stageTwo"),
                  stage3: getSBackup(s3, "stage3", "stageThree"),
                  stage4: getSBackup(s4, "stage4", "stageFour"),
                  stage5: getSBackup(s5, "stage5", "stageFive"),
                  stage6: getSBackup(s6, "stage6", "stageSix"),
                };
              }
            } catch (e) {
              console.warn("Parallel fetch failed, falling back", e);
              response = await commercialApiRef.current.getProjectFullData(
                matterNumber
              );
            }
          } catch (error) {
            console.error("Failed to load commercial details", error);
            response = createDefaultProjectData(matterNumber);
          }
        } else if (currentModule === "print media") {
          response = await apiRef.current.getIDGStages(matterNumber);
        } else {
          response = await apiRef.current.getAllStages(matterNumber);
        }

        // Handle server role
        const serverRole =
          response?.role || response?.currentUser?.role || null;
        if (serverRole) setRole(serverRole);
        if (response.stages && Array.isArray(response.stages)) {
          response.stages.forEach((stage, index) => {});
        } else {
        }

        // Normalize dates for the response AND ensure business fields are included
        const normalized = {
          ...response, // Preserve ALL original data including stage1, stage2, etc.
          // Map commercial stage names (stageOne -> stage1) if necessary
          stage1:
            response.stage1 ||
            response.stageOne ||
            response.data?.stage1 ||
            response.data?.stageOne ||
            {},
          stage2:
            response.stage2 ||
            response.stageTwo ||
            response.data?.stage2 ||
            response.data?.stageTwo ||
            {},
          stage3:
            response.stage3 ||
            response.stageThree ||
            response.data?.stage3 ||
            response.data?.stageThree ||
            {},
          stage4:
            response.stage4 ||
            response.stageFour ||
            response.data?.stage4 ||
            response.data?.stageFour ||
            {},
          stage5:
            response.stage5 ||
            response.stageFive ||
            response.data?.stage5 ||
            response.data?.stageFive ||
            {},
          stage6:
            response.stage6 ||
            response.stageSix ||
            response.data?.stage6 ||
            response.data?.stageSix ||
            {},

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
          // Ensure business fields are included with proper fallbacks
          businessName: response.businessName || response.business_name || "",
          businessAddress:
            response.businessAddress ||
            response.business_address ||
            response.propertyAddress ||
            "",
          // Map the data structure properly
          clientName: response.clientName || response.client_name || "",
          clientType: response.clientType || response.client_type || "",
          dataEntryBy: response.dataEntryBy || response.dataentryby || "",
          postcode: response.postcode || response.postCode || "",
        };

        setClientData(normalized);
        setOriginalClientData(JSON.parse(JSON.stringify(normalized)));

        // Handle stage statuses
        const section = {};

        if (currentModule === "commercial") {
          // Initialize all stages as "Not Completed"
          for (let i = 1; i <= 6; i++) {
            section[`status${i}`] = "Not Completed";
          }

          // Use colorStatus from stages array with S1, S2, etc. structure
          if (
            response.stages &&
            Array.isArray(response.stages) &&
            response.stages.length > 0
          ) {
            const stageObject = response.stages[0]; // Get the first object with S1, S2 properties

            // Process each stage (S1, S2, S3, S4, S5, S6)
            for (let i = 1; i <= 6; i++) {
              const stageKey = `S${i}`;
              if (stageObject[stageKey]) {
                const statusMap = {
                  green: "Completed",
                  red: "Not Completed",
                  amber: "In Progress",
                };
                section[`status${i}`] =
                  statusMap[stageObject[stageKey]] || "Not Completed";
                console.log(
                  `Stage ${i} (${stageKey}) status: ${
                    stageObject[stageKey]
                  } -> ${section[`status${i}`]}`
                );
              }
            }
          }

          // Check individual stage properties (stage1, stage2, etc.) as fallback
          for (let i = 1; i <= 6; i++) {
            const stageKey = `stage${i}`;
            if (response[stageKey] && response[stageKey].colorStatus) {
              const statusMap = {
                green: "Completed",
                red: "Not Completed",
                amber: "In Progress",
              };
              section[`status${i}`] =
                statusMap[response[stageKey].colorStatus] || "Not Completed";
            }
          }

          // Also check for global colorStatus on the main response object
          if (response.colorStatus) {
            const statusMap = {
              green: "Completed",
              red: "Not Completed",
              amber: "In Progress",
            };
            // If there's a global colorStatus, apply it to stage 1
            section.status1 =
              statusMap[response.colorStatus] || section.status1;
          }
        } else if (currentModule !== "print media") {
          // VKL stage status logic
          section.status1 = response.stage1?.colorStatus || "Not Completed";
          section.status2 = response.stage2?.colorStatus || "Not Completed";
          section.status3 = response.stage3?.colorStatus || "Not Completed";
          section.status4 = response.stage4?.colorStatus || "Not Completed";
          section.status5 = response.stage5?.colorStatus || "Not Completed";
          section.status6 = response.stage6?.colorStatus || "Not Completed";
        } else if (currentModule === "print media") {
          // IDG stage status logic
          section.status1 =
            response.data?.stage1?.colorStatus || "Not Completed";
          section.status2 =
            response.data?.stage2?.colorStatus || "Not Completed";
          section.status3 =
            response.data?.stage3?.colorStatus || "Not Completed";
          section.status4 =
            response.data?.stage4?.colorStatus || "Not Completed";
        }
        setStageStatuses(section);
      } catch (e) {
        // For commercial module, create default structure on any error
        if (currentModule === "commercial") {
          const defaultData = createDefaultProjectData(matterNumber);
          setClientData(defaultData);
          setOriginalClientData(JSON.parse(JSON.stringify(defaultData)));

          setStageStatuses({
            status1: "Not Completed",
            status2: "Not Completed",
            status3: "Not Completed",
            status4: "Not Completed",
            status5: "Not Completed",
            status6: "Not Completed",
          });

          toast.info("New project created. Please fill in the details.");
        } else {
          toast.error("Failed to fetch project details.");
        }
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
    } catch {
      setHasChanges(true);
    }
  }, [clientData, originalClientData]);

  async function handleupdate(e) {
    console.log(
      "🟡 [UPDATE CLICKED]",
      "hasChanges =",
      hasChanges,
      "module =",
      localStorage.getItem("currentModule")
    );
    e.preventDefault();
    if (!hasChanges) return;
    setShowUpdateConfirm(true);
  }

  async function performUpdate() {
    console.log("🟢 [CONFIRM CLICKED] performUpdate() started");
    if (!hasChanges) {
      setShowUpdateConfirm(false);
      return;
    }
    setIsUpdating(true);
    try {
      const currentModule = localStorage.getItem("currentModule");
      console.log("🚀 [MODULE]", currentModule);
      let payload = {};
      if (currentModule === "commercial") {
        payload = {
          settlementDate: clientData?.settlementDate || null,
          notes: clientData?.notes || "",
          clientName: clientData?.clientName || "",
          businessName: clientData?.businessName || "",
          businessAddress: clientData?.businessAddress || "",
          state: clientData?.state || "",
          clientType: clientData?.clientType || "",
          matterDate: clientData?.matterDate || null,
          dataEntryBy: clientData?.dataEntryBy || "",
          postcode: clientData?.postcode || "",
        };
      } else if (currentModule !== "print media") {
        payload = {
          settlementDate: clientData?.settlementDate || null,
          notes: clientData?.notes || "",
          postcode: clientData?.postcode,
        };
      } else if (currentModule === "print media") {
        payload = {
          deliveryDate: clientData?.data?.deliveryDate || null,
          order_details: clientData?.data?.order_details || null,
          notes: clientData?.data?.notes || "",
          postCode: clientData?.data?.postcode || clientData?.data?.postCode,
        };
      }

      console.log("📦 [FINAL PAYLOAD]", payload);

      // Include superadmin fields
      if (isSuperAdmin) {
        payload.matterDate = clientData?.matterDate || null;
        payload.clientName = clientData?.clientName || "";
        payload.state = clientData?.state || "";
        payload.clientType = clientData?.clientType || "";
        payload.dataEntryBy = clientData?.dataEntryBy || "";

        if (currentModule === "commercial") {
          payload.businessName = clientData?.businessName || "";
          payload.businessAddress = clientData?.businessAddress || "";
        } else if (currentModule !== "print media") {
          // FOR CONVEYANCING: Map the address to 'propertyAddress'
          payload.propertyAddress = clientData?.businessAddress || "";
        }

        if (
          clientData?.matterNumber &&
          String(clientData?.matterNumber) !== String(originalMatterNumber)
        ) {
          payload.matterNumber = clientData.matterNumber;
        }
      }

      // Postcode is editable by all users
      // payload.postcode =
      //   clientData?.postcode || clientData?.data?.postcode || "";

      let resp = {};
      if (currentModule === "commercial") {
        console.log("🚀 [API] Commercial update/create");
        // Check if this is a new project (has default empty structure)
        const isNewProject =
          !originalClientData?.clientName &&
          !originalClientData?.businessName &&
          !originalClientData?.state;

        if (isNewProject) {
          // Use create project for new projects
          resp = await commercialApiRef.current.createProject(payload);
          toast.success("Project created successfully!");
        } else {
          // Use update project for existing projects
          resp = await commercialApiRef.current.updateProject(
            originalMatterNumber,
            payload
          );
          toast.success("Project details updated successfully");
        }
      } else if (currentModule === "print media") {
        console.log("🚀 [API] Print Media update");
        resp = await apiRef.current.updateIDGClientData(
          originalMatterNumber,
          payload
        );
      } else {
        console.log("🚀 [API] Conveyancing update");
        resp = await apiRef.current.updateClientData(
          originalMatterNumber,
          payload
        );
      }
      console.log("✅ [API RESPONSE]", resp);

      const updatedClient = resp.client || resp || clientData;
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

      setClientData(normalizedUpdated);
      setOriginalClientData(JSON.parse(JSON.stringify(normalizedUpdated)));

      // Update matter number if it changed
      if (
        normalizedUpdated.matterNumber &&
        normalizedUpdated.matterNumber !== originalMatterNumber
      ) {
        setOriginalMatterNumber(normalizedUpdated.matterNumber);
      }

      // Handle navigation
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
      let msg = "Failed to update. Please try again.";
      if (err?.message) msg = err.message;
      else if (err?.response?.data?.message) msg = err.response.data.message;

      toast.error(msg);
    } finally {
      setIsUpdating(false);
      setShowUpdateConfirm(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                               linear-gradient(to bottom, #000 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 flex flex-col w-full h-screen overflow-hidden">
        <UploadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <main className="flex-grow flex flex-col p-4 w-full max-w-screen-xl mx-auto overflow-auto">
          {/* Desktop layout - buttons next to Hello */}
          <div className="hidden md:flex justify-between items-center mb-2 flex-shrink-0">
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
              Hello, {localStorage.getItem("user")}
            </h2>

            <div className="flex items-center gap-1">
              <Button
                label="Back"
                bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-sky-600 active:bg-sky-700"
                width="w-[60px] md:w-[70px]"
                onClick={() => {
                  isAnyAdmin
                    ? navigate("/admin/view-clients")
                    : navigate("/user/view-clients");
                  localStorage.removeItem("client-storage");
                }}
              />
              {(currentModule !== "print media" ||
                currentModule === "commercial") && (
                <Button
                  label="Cost"
                  bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-sky-600 active:bg-sky-700"
                  width="w-[60px] md:w-[70px]"
                  onClick={() => setSelectedStage(7)}
                />
              )}
            </div>
          </div>

          {/* Mobile layout - buttons below Hello */}
          <div className="flex flex-col md:hidden mb-2 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-2">
              Hello {localStorage.getItem("user")}
            </h2>
            <div className="flex justify-between w-full gap-1">
              <Button
                label="Upload Image"
                bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-sky-600 active:bg-sky-700"
                width="w-[48%]"
                onClick={() => setIsOpen(true)}
              />
              <Button
                label="Cost"
                bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-sky-600 active:bg-sky-700"
                width="w-[48%]"
                onClick={() => setSelectedStage(7)}
              />
            </div>
          </div>

          {false ? (
            <></>
          ) : (
            <>
              {/* Stages section with collapse button at the bottom */}
              <div className="relative">
                {/* Mobile stages with smooth transition */}
                {isSmallScreen && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isStagesCollapsed ? "max-h-0" : "max-h-96"
                    }`}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 flex-shrink-0">
                      {stages.map((stage, index) => {
                        const stageStatus = stageStatuses[`status${stage.id}`];
                        return (
                          <div
                            key={stage.id}
                            onClick={() => RenderStage(stage.id)}
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
                  </div>
                )}

                {/* Desktop stages (always visible) */}
                {!isSmallScreen && (
                  <div>
                    <ul className="relative flex flex-col md:flex-row gap-2">
                      {stages.map((stage, index) => {
                        const stageStatus = stageStatuses[`status${stage.id}`];
                        const isActive = selectedStage === stage.id;
                        const isCompleted =
                          stageStatus === "Completed" ||
                          stageStatus === "green";
                        const isInProgress =
                          stageStatus === "In Progress" ||
                          stageStatus === "amber";

                        return (
                          <li
                            key={stage.id}
                            onClick={() => RenderStage(stage.id)}
                            className={`mb-5 md:shrink md:basis-0 flex-1 group flex gap-x-2 md:block cursor-pointer p-2 rounded-lg border-2 transition-all duration-300 ${
                              isActive
                                ? "bg-blue-50 border-[#2E3D99]/60 scale-105 shadow-lg"
                                : "scale-95 border-gray-300"
                            }`}
                          >
                            <div className="min-w-7 min-h-5 flex flex-col items-center md:w-full md:inline-flex md:flex-wrap md:flex-row text-x align-middle">
                              <span
                                className={`size-9 flex justify-center items-center shrink-0 font-bold rounded-full border transition-colors ${
                                  isActive
                                    ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white border-[#2E3D99]] shadow-[0_0_12px_3px_rgba(59,130,246,0.4)]"
                                    : isCompleted
                                    ? "bg-green-600 text-white border-green-600"
                                    : isInProgress
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "bg-red-500 text-gray-100 border-gray-300"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </div>

                            <div className="grow md:grow-0 md:mt-3">
                              <div className="flex gap-1 items-center">
                                <p className="font-bold font-poppins text-xl xl:text-sm">
                                  Stage {index + 1}
                                </p>
                                <div
                                  className={`min-w-[70px] xl:min-w-[75px] px-1 h-[18px] flex items-center justify-center rounded-4xl ${
                                    isInProgress
                                      ? "text-[#FF9500]"
                                      : isCompleted
                                      ? "text-green-600"
                                      : isActive
                                      ? "text-[red]"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <p className="text-[11px] xl:text-xs whitespace-nowrap font-bold">
                                    {getStatusDisplayText(stageStatus)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-0.5">
                                <p className="text-xl font-bold xl:text-sm">
                                  {stage.title}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Mobile-only collapse toggle button */}
                {isSmallScreen && (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => setIsStagesCollapsed(!isStagesCollapsed)}
                      className="p-1 rounded-full bg-gray-200 shadow-md hover:bg-gray-300 transition-colors duration-200"
                      title={isStagesCollapsed ? "Show Stages" : "Hide Stages"}
                    >
                      {isStagesCollapsed ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-1 flex-grow overflow-hidden">
                <div className="w-full lg:w-[calc(100%-300px)] p-4 rounded-md bg-white overflow-y-auto">
                  {clientData && Showstage(selectedStage)}
                </div>

                {/* Project/Matter/Order Details - Desktop */}
                <div className="hidden lg:block w-[430px] xl:w-[500px] flex-shrink-0">
                  <div className="w-full bg-white rounded shadow border border-gray-200 p-4 lg:h-[calc(100vh-180px)] lg:overflow-y-auto">
                    <h2 className="text-lg font-bold mb-2">
                      {currentModule === "commercial"
                        ? "Project Details"
                        : currentModule === "print media"
                        ? "Order Details"
                        : "Matter Details"}
                    </h2>
                    <form
                      className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 pb-4"
                      onSubmit={handleupdate}
                    >
                      {/* Date Field */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-0.5">
                          {currentModule === "commercial"
                            ? "Project Date"
                            : currentModule === "print media"
                            ? "Order Date"
                            : "Matter Date"}
                        </label>
                        <input
                          id="matterDate"
                          name="matterDate"
                          type={isSuperAdmin ? "date" : "text"}
                          value={
                            isSuperAdmin
                              ? clientData?.matterDate
                                ? new Date(clientData.matterDate)
                                    .toISOString()
                                    .substring(0, 10)
                                : ""
                              : clientData?.matterNumber
                              ? formatDateForDisplay(clientData.matterDate)
                              : clientData?.data?.orderDate
                              ? formatDateForDisplay(clientData.data.orderDate)
                              : ""
                          }
                          onChange={(e) => {
                            if (!isSuperAdmin) return;
                            const v = e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "";
                            setClientData((prev) => ({
                              ...(prev || {}),
                              matterDate: v,
                            }));
                          }}
                          className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                            !isSuperAdmin ? "bg-gray-100" : ""
                          }`}
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      {/* Number Field */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-0.5">
                          {currentModule === "commercial"
                            ? "Project Number"
                            : currentModule === "print media"
                            ? "Order ID"
                            : "Matter Number"}
                        </label>
                        {isSuperAdmin ? (
                          <input
                            type="text"
                            value={
                              clientData?.matterNumber ||
                              clientData?.data?.orderId ||
                              ""
                            }
                            onChange={(e) =>
                              setClientData((prev) => ({
                                ...(prev || {}),
                                matterNumber: e.target.value,
                              }))
                            }
                            className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                          />
                        ) : (
                          <input
                            type="text"
                            value={
                              clientData?.matterNumber ||
                              clientData?.data?.orderId ||
                              ""
                            }
                            className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                            disabled
                            readOnly
                          />
                        )}
                      </div>

                      {/* Client Name */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-0.5">
                          Client Name
                        </label>
                        <input
                          id="clientName"
                          name="clientName"
                          type="text"
                          value={
                            clientData?.clientName ||
                            clientData?.data?.client?.name ||
                            ""
                          }
                          onChange={(e) => {
                            if (!isSuperAdmin) return;
                            setClientData((prev) => ({
                              ...(prev || {}),
                              clientName: e.target.value,
                            }));
                          }}
                          className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                            !isSuperAdmin ? "bg-gray-100" : ""
                          }`}
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      {/* Business Name */}
                      {currentModule === "commercial" && (
                        <div className="md:col-span-1">
                          <label className="block text-xs md:text-sm font-semibold mb-0.5">
                            Business Name
                          </label>
                          {isSuperAdmin ? (
                            <input
                              type="text"
                              value={clientData?.businessName || ""}
                              onChange={(e) => {
                                setClientData((prev) => ({
                                  ...(prev || {}),
                                  businessName: e.target.value,
                                }));
                              }}
                              className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                            />
                          ) : (
                            <input
                              type="text"
                              value={clientData?.businessName || ""}
                              className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                              disabled
                              readOnly
                            />
                          )}
                        </div>
                      )}

                      {/* Address Field */}
                      <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold mb-1">
                          {currentModule === "commercial"
                            ? "Business Address"
                            : currentModule === "print media"
                            ? "Billing Address"
                            : "Property Address"}
                        </label>
                        <input
                          id={
                            currentModule === "commercial"
                              ? "businessAddress"
                              : "propertyAddress"
                          }
                          name={
                            currentModule === "commercial"
                              ? "businessAddress"
                              : "propertyAddress"
                          }
                          type="text"
                          value={
                            currentModule === "commercial"
                              ? clientData?.businessAddress || ""
                              : clientData?.propertyAddress || ""
                          }
                          onChange={(e) => {
                            if (!isSuperAdmin) return;
                            const fieldName =
                              currentModule === "commercial"
                                ? "businessAddress"
                                : "propertyAddress";
                            setClientData((prev) => ({
                              ...(prev || {}),
                              [fieldName]: e.target.value,
                            }));
                          }}
                          className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                            !isSuperAdmin ? "bg-gray-100" : ""
                          }`}
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      {/* State Field */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-1">
                          State
                        </label>
                        {isSuperAdmin ? (
                          <select
                            id="state"
                            name="state"
                            value={
                              clientData?.state ||
                              clientData?.data?.country ||
                              ""
                            }
                            onChange={(e) =>
                              setClientData((prev) => ({
                                ...(prev || {}),
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
                            value={
                              clientData?.state || clientData?.data?.state || ""
                            }
                            className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                            disabled
                            readOnly
                          />
                        )}
                      </div>

                      {/* Client Type Field */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-1">
                          {currentModule === "commercial"
                            ? "Client Type"
                            : currentModule === "print media"
                            ? "Order Type"
                            : "Client Type"}
                        </label>
                        {isSuperAdmin ? (
                          <select
                            id="clientType"
                            name="clientType"
                            value={
                              clientData?.clientType ||
                              clientData?.data?.orderType ||
                              ""
                            }
                            onChange={(e) =>
                              setClientData((prev) => ({
                                ...(prev || {}),
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
                            value={
                              clientData?.clientType ||
                              clientData?.data?.orderType
                            }
                            className="w-full rounded bg-gray-100 px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                            disabled
                            readOnly
                          />
                        )}
                      </div>

                      {/* Post Code */}
                      <div>
                        <label className="block text-xs md:text-sm font-semibold mb-1 ">
                          Post Code
                        </label>
                        <input
                          type="text"
                          id="postcode"
                          name="postcode"
                          disabled={currentModule === "print media"}
                          value={
                            clientData?.postcode ||
                            clientData?.data?.postCode ||
                            ""
                          }
                          onChange={(e) => {
                            setClientData((prev) => ({
                              ...prev,
                              postcode: e.target.value,
                            }));
                          }}
                          pattern="^[0-9]{4}$"
                          maxLength={4}
                          inputMode="numeric"
                          className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 
                       ${currentModule === "print media" && "bg-gray-100"}`}
                        />
                      </div>

                      {/* Completion/Settlement/Delivery Date */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-1">
                          {currentModule === "commercial"
                            ? "Completion Date"
                            : currentModule === "print media"
                            ? "Delivery Date"
                            : "Settlement Date"}
                        </label>
                        <input
                          id={
                            currentModule === "commercial"
                              ? "completionDate"
                              : currentModule === "print media"
                              ? "deliveryDate"
                              : "settlementDate"
                          }
                          name={
                            currentModule === "commercial"
                              ? "completionDate"
                              : currentModule === "print media"
                              ? "deliveryDate"
                              : "settlementDate"
                          }
                          type="date"
                          value={
                            currentModule === "commercial"
                              ? clientData?.settlementDate
                                ? new Date(clientData.settlementDate)
                                    .toISOString()
                                    .substring(0, 10)
                                : ""
                              : currentModule !== "print media"
                              ? clientData?.settlementDate
                                ? new Date(clientData.settlementDate)
                                    .toISOString()
                                    .substring(0, 10)
                                : ""
                              : clientData?.data?.deliveryDate
                              ? new Date(clientData.data.deliveryDate)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                          }
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            if (currentModule === "commercial") {
                              setClientData((prev) => ({
                                ...(prev || {}),
                                settlementDate: dateValue,
                              }));
                            } else if (currentModule !== "print media") {
                              setClientData((prev) => ({
                                ...(prev || {}),
                                settlementDate: dateValue,
                              }));
                            } else if (currentModule === "print media") {
                              setClientData((prev) => ({
                                ...(prev || {}),
                                data: {
                                  ...((prev && prev.data) || {}),
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
                            value={
                              clientData?.dataEntryBy ||
                              clientData?.data?.dataEntryBy || ""
                            }
                            onChange={(e) =>
                              setClientData((prev) => ({
                                ...(prev || {}),
                                dataEntryBy: e.target.value,
                              }))
                            }
                            className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                          />
                        ) : (
                          <input
                            type="text"
                            value={
                              clientData?.dataEntryBy ||
                              clientData?.data?.dataEntryBy ||
                              ""
                            }
                            className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                            disabled
                            readOnly
                          />
                        )}
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-3">
                        {currentModule === "print media" ? (
                          <div className="flex gap-1 w-full">
                            <div className="flex-1">
                              <label className="block text-xs md:text-sm font-semibold mb-0.5">
                                Order Details
                              </label>
                              <textarea
                                rows={5}
                                value={clientData?.data?.order_details || ""}
                                onChange={(e) => {
                                  const newOrderDetails = e.target.value;
                                  setClientData((prev) => ({
                                    ...(prev || {}),
                                    data: {
                                      ...((prev && prev.data) || {}),
                                      order_details: newOrderDetails,
                                    },
                                  }));
                                }}
                                placeholder="Enter order details here..."
                                className="w-full border border-gray-200 rounded px-2 py-0.5 text-xs md:text-sm resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs md:text-sm font-semibold mb-0.5">
                                Notes / Comments
                              </label>
                              <textarea
                                rows={5}
                                value={
                                  clientData?.notes ||
                                  clientData?.data?.notes ||
                                  ""
                                }
                                onChange={(e) => {
                                  const newNote = e.target.value;
                                  setClientData((prev) => {
                                    const updated = { ...(prev || {}) };
                                    updated.notes = newNote;
                                    if (updated.data) {
                                      updated.data.notes = newNote;
                                    } else {
                                      updated.data = { notes: newNote };
                                    }
                                    return updated;
                                  });
                                }}
                                placeholder="Enter comments here..."
                                className="w-full border border-gray-200 rounded px-2 py-0.5 text-xs md:text-sm resize-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs md:text-sm font-semibold mb-0.5">
                              Notes / Comments
                            </label>
                            <textarea
                              rows={5}
                              value={
                                clientData?.notes ||
                                clientData?.data?.notes ||
                                ""
                              }
                              onChange={(e) => {
                                const newNote = e.target.value;
                                setClientData((prev) => {
                                  const updated = { ...(prev || {}) };
                                  updated.notes = newNote;
                                  if (updated.data) {
                                    updated.data.notes = newNote;
                                  } else {
                                    updated.data = { notes: newNote };
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="Enter comments here..."
                              className="w-full border border-gray-200 rounded px-2 py-0.5 text-xs md:text-sm resize-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-3 mt-6 mb-6">
                        <div className="mt-2">
                          <button
                            type="submit"
                            className={`w-full ${
                              hasChanges
                                ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-[#0086bf] text-white cursor-pointer"
                                : "bg-gray-300 text-gray-200 cursor-not-allowed"
                            } font-medium rounded py-2 text-base`}
                            disabled={!hasChanges}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Mobile Details */}
              {isSmallScreen && (
                <div className="w-full mt-4 bg-white rounded shadow border border-gray-200 p-4 overflow-y-auto max-h-96">
                  <h2 className="text-lg font-bold mb-2">
                    {currentModule === "commercial"
                      ? "Project Details"
                      : currentModule === "print media"
                      ? "Order Details"
                      : "Matter Details"}
                  </h2>
                  <form
                    className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2"
                    onSubmit={handleupdate}
                  >
                    {/* Mobile form fields - similar structure but simplified */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {currentModule === "commercial"
                          ? "Project Date"
                          : currentModule === "print media"
                          ? "Order Date"
                          : "Matter Date"}
                      </label>
                      <input
                        id="matterDate"
                        name="matterDate"
                        type={isSuperAdmin ? "date" : "text"}
                        value={
                          isSuperAdmin
                            ? clientData?.matterDate
                              ? new Date(clientData.matterDate)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                            : clientData?.matterNumber
                            ? formatDateForDisplay(clientData.matterDate)
                            : clientData?.data?.orderDate
                            ? formatDateForDisplay(clientData.data.orderDate)
                            : ""
                        }
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          const v = e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "";
                          setClientData((prev) => ({
                            ...(prev || {}),
                            matterDate: v,
                          }));
                        }}
                        className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                          !isSuperAdmin ? "bg-gray-100" : ""
                        }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    <div className="mt-3">
                      <button
                        type="submit"
                        className={`w-full ${
                          hasChanges
                            ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-[#0086bf] text-white"
                            : "bg-gray-300 text-gray-200 cursor-not-allowed"
                        } font-medium rounded py-2 text-base`}
                        disabled={!hasChanges}
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
        <ConfirmationModal
          isOpen={showUpdateConfirm}
          onClose={() => setShowUpdateConfirm(false)}
          title="Confirm update"
          onConfirm={performUpdate}
        >
          Are you sure you want to update client data?
        </ConfirmationModal>

        <ConfirmationModal
          isOpen={showUnsavedConfirm}
          title="Unsaved Changes"
          message="You have unsaved changes in this stage. Would you like to save before leaving?"
          onClose={() => {
            setShowUnsavedConfirm(false);
            pendingStageRef.current = null;
          }}
          onDiscard={() => {
            setShowUnsavedConfirm(false);
            if (pendingStageRef.current !== null) {
              setSelectedStage(pendingStageRef.current);
              setReloadStage((p) => !p);
              pendingStageRef.current = null;
            }
          }}
          onConfirm={async () => {
            window.dispatchEvent(new Event("saveCurrentStage"));
            setHasChanges(false);
            setShowUnsavedConfirm(false);

            if (pendingStageRef.current !== null) {
              setSelectedStage(pendingStageRef.current);
              setReloadStage((prev) => !prev);
              pendingStageRef.current = null;
            }
          }}
        />
      </div>
    </div>
  );
}
