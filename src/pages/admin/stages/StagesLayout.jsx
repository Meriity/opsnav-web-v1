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
import WillsAPI from "../../../api/willsAPI";
import VocatFasAPI from "../../../api/vocatFasAPI";
import Loader from "../../../components/ui/Loader";
import UploadDialog from "../../../components/ui/uploadDialog";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// Helper function to load Google Maps script (copied from CreateClientModal)
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
};

const formatDateForDisplay = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

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
  const willsApiRef = useRef(new WillsAPI());
  const vocatApiRef = useRef(new VocatFasAPI());
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
  const [stageDirty, setStageDirty] = useState(false);
  const [matterDirty, setMatterDirty] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);
  const [isOpen, setIsOpen] = useState(false);
  const currentModule = localStorage.getItem("currentModule");
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [_isUpdating, setIsUpdating] = useState(false);
  const [isStagesCollapsed, setIsStagesCollapsed] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("stage");

  // Google Maps Refs
  const addressInputRef = useRef(null);
  const mobileAddressInputRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GMAPS_APIKEY;

  // Handle Google Maps Place Selection
  const handlePlaceSelected = (place) => {
    if (!place.geometry || !place.address_components) return;

    let postcode = "";
    let state = "";
    // address is formatted_address
    const address = place.formatted_address; 

    place.address_components.forEach((component) => {
      if (component.types.includes("postal_code"))
        postcode = component.long_name;
      if (component.types.includes("administrative_area_level_1"))
        state = component.short_name;
    });

    setClientData((prev) => {
      const newData = { ...prev };
      
      // Update Address based on module
      if (currentModule === "commercial") {
        newData.businessAddress = address;
      } else if (currentModule === "print media") {
         if(!newData.data) newData.data = {};
         newData.data.deliveryAddress = address;
      } else if (currentModule === "vocat") {
        newData.clientAddress = address;
      } else {
        newData.propertyAddress = address;
      }

      // Update State and Postcode
      if(currentModule === "print media") {
          if(!newData.data) newData.data = {};
          
          newData.data.state = state;
          newData.state = state; // Sync root state
          
          newData.data.postCode = postcode; 
          newData.data.postcode = postcode;
          newData.postcode = postcode; // Sync root postcode
      } else {
          newData.state = state;
          newData.postcode = postcode;
      }

      return newData;
    });
    // Mark as dirty so Update button enables
    setMatterDirty(true); 
  };

  // Initialize Autocomplete Effect
  useEffect(() => {
    // Only load if we have inputs to attach to
    if ((!addressInputRef.current && !mobileAddressInputRef.current)) return;

    let desktopAutocomplete = null;
    let mobileAutocomplete = null;
    let desktopListener = null;
    let mobileListener = null;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!window.google) return;

        // Desktop Input
        if (addressInputRef.current) {
          desktopAutocomplete = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            { types: ["address"], componentRestrictions: { country: ["au"] } }
          );
          desktopListener = desktopAutocomplete.addListener("place_changed", () => {
             handlePlaceSelected(desktopAutocomplete.getPlace());
          });
        }

        // Mobile Input
        if (mobileAddressInputRef.current) {
          mobileAutocomplete = new window.google.maps.places.Autocomplete(
             mobileAddressInputRef.current,
             { types: ["address"], componentRestrictions: { country: ["au"] } }
          );
          mobileListener = mobileAutocomplete.addListener("place_changed", () => {
              handlePlaceSelected(mobileAutocomplete.getPlace());
          });
        }
      })
      .catch((err) => console.error("Google Maps Load Error:", err));

    return () => {
      if(desktopListener) window.google.maps.event.removeListener(desktopListener);
      if(mobileListener) window.google.maps.event.removeListener(mobileListener);
      if(desktopAutocomplete) window.google.maps.event.clearInstanceListeners(desktopAutocomplete);
      if(mobileAutocomplete) window.google.maps.event.clearInstanceListeners(mobileAutocomplete);
    };
  }, [
    isSmallScreen, 
    activeMobileTab, 
    // Re-run if screen size changes or mobile tab switches to details (mounting the input)
    currentModule
  ]);

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
  const isPrintMedia = currentModule === "print media";
  const CLIENT_TYPE_OPTIONS = isPrintMedia 
    ? ["Real Estate", "Vehicle", "Commercial", "Others"] 
    : ["Buyer", "Seller", "Transfer"];

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
  } else if (currentModule === "vocat") {
    stages = [
      { id: 1, title: "Client & Incident" },
      { id: 2, title: "VOI" },
      { id: 3, title: "Searches & Analysis" },
      { id: 4, title: "FAS Approval" },
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

  const navigateToCost = () => {
    const baseUrl = isAnyAdmin ? "/admin/client/stages" : "/user/client";
    // For user route: /user/client/:matterNumber/stages/:stageNo
    // For admin route: /admin/client/stages/:matterNumber/:stageNo
    
    let targetUrl;
    if (isAnyAdmin) {
      targetUrl = `${baseUrl}/${matterNumber}/7`;
    } else {
       // Match the new User route structure: client/:matterNumber/stages/:stageNo
      targetUrl = `${baseUrl}/${matterNumber}/stages/7`;
    }

    // Force hard reload if already on the cost page or just navigation if not
    if (String(selectedStage) === "7") {
       window.location.reload();
    } else {
       window.location.href = targetUrl;
    }
  };

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
    if (stageDirty) {
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
            setHasChanges={setStageDirty}
          />
        );
      case 2:
        return (
          <Stage2
            data={stageData}
            stage1Data={clientData?.stage1 ?? {}}
            user={clientData?.users || []}
            clientType={clientData?.clientType}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setStageDirty}
          />
        );
      case 3:
        return (
          <Stage3
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setStageDirty}
          />
        );
      case 4:
        return (
          <Stage4
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setStageDirty}
          />
        );
      case 5:
        return (
          <Stage5
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setStageDirty}
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
            setHasChanges={setStageDirty}
          />
        );
      case 7:
        return (
          <Cost
            data={clientData?.costData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setStageDirty}
          />
        );
      default:
        return (
          <Stage1
            data={getStageData(1)}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
            setHasChanges={setStageDirty}
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

                const getStage6Data = () => {
                  let base = getS(s6, "stage6", "stageSix");
                  
                  // FIX: If the response is the full client object, unwrap the stage6 data
                  if (base && base.stage6) {
                    base = base.stage6;
                  }

                  const merged = { ...base };
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

                  rootFields.forEach((field) => {
                    const stageVal = merged[field];
                    const rootVal = clientData[field];

                    if (
                      (stageVal === undefined ||
                        stageVal === null ||
                        stageVal === "") &&
                      rootVal !== undefined &&
                      rootVal !== null &&
                      rootVal !== ""
                    ) {
                      merged[field] = rootVal;
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
        } else if (currentModule === "wills") {
          // Fetch full data using WillsAPI
          // We can use getProjectFullData or getClientDetails depending on what returns full stage info
          // Similar to Commercial, we might need parallel fetching if backend doesn't return everything in one go.
          // For now, assuming getProjectFullData is robust or we parallel fetch if needed.
          // Let's try parallel similar to Commercial for safety if APIs are granular.
          try {
             const [clientData, s1, s2, s3] = await Promise.all([
                 willsApiRef.current.getProjectFullData(matterNumber).catch(e => null),
                 willsApiRef.current.getStageData(1, matterNumber).catch(() => ({})),
                 willsApiRef.current.getStageData(2, matterNumber).catch(() => ({})),
                 willsApiRef.current.getStageData(3, matterNumber).catch(() => ({}))
             ]);
             
             if (clientData) {
                 const getS = (s, key) => s?.data || s || clientData[key] || {};
                 response = {
                     ...clientData,
                     stage1: getS(s1, "stage1"),
                     stage2: getS(s2, "stage2"),
                     stage3: getS(s3, "stage3"),
                     // Wills typically has 3 stages? Postman showed 3.
                 };
             } else {
                 response = createDefaultProjectData(matterNumber);
             }
          } catch (e) {
             console.error("Wills data fetch failed", e);
             response = createDefaultProjectData(matterNumber);
          }
        } else if (currentModule === "vocat") {
          try {
             const [clientData, s1, s2, s3, s4] = await Promise.all([
                 vocatApiRef.current.getClient(matterNumber),
                 vocatApiRef.current.getStageOne(matterNumber).catch(() => ({})),
                 vocatApiRef.current.getStageTwo(matterNumber).catch(() => ({})),
                 vocatApiRef.current.getStageThree(matterNumber).catch(() => ({})),
                 vocatApiRef.current.getStageFour(matterNumber).catch(() => ({}))
             ]);
            
            if (clientData) {
               response = {
                 ...clientData,
                 stage1: s1?.data || s1 || {},
                 stage2: s2?.data || s2 || {},
                 stage3: s3?.data || s3 || {},
                 stage4: s4?.data || s4 || {},
               };
            } else {
               response = createDefaultProjectData(matterNumber);
            }
          } catch (e) {
            console.error("Vocat fetch failed", e);
             response = createDefaultProjectData(matterNumber);
          }
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
        const normalized = {
          ...response,
          businessName:
            response.businessName ||
            response.businessname ||
            response.client?.businessName ||
            response.data?.businessName ||
            "",
          businessAddress:
            response.businessAddress ||
            response.businessaddress ||
            response.propertyAddress ||
            response.client?.businessAddress ||
            "",
          postcode:
            response.postcode ||
            response.postCode ||
            response.client?.postcode ||
            "",
          clientName:
            response.clientName ||
            response.client_name ||
            response.client?.clientName ||
            "",
          clientType:
            response.clientType ||
            response.client_type ||
            response.client?.clientType ||
            "",
          dataEntryBy:
            response.dataEntryBy ||
            response.dataentryby ||
            response.client?.dataEntryBy ||
            "",
          notes:
            response.notes !== undefined
              ? response.notes
              : response.client?.notes ?? "",
          state: response.state || clientData?.state || "",
          matterDate: response.matterDate
            ? typeof response.matterDate === "string"
              ? response.matterDate
              : new Date(response.matterDate).toISOString()
            : response.data?.orderDate
            ? typeof response.data.orderDate === "string"
              ? response.data.orderDate
              : new Date(response.data.orderDate).toISOString()
            : clientData?.matterDate || "",
          settlementDate: response.settlementDate
            ? typeof response.settlementDate === "string"
              ? response.settlementDate
              : new Date(response.settlementDate).toISOString()
            : clientData?.settlementDate || "",
          // Map stage data properly, preserving existing if not in response
          stage1:
            response.stage1 ||
            response.stageOne ||
            response.data?.stage1 ||
            response.data?.stageOne ||
            clientData?.stage1 ||
            {},
          stage2:
            response.stage2 ||
            response.stageTwo ||
            response.data?.stage2 ||
            response.data?.stageTwo ||
            clientData?.stage2 ||
            {},
          stage3:
            response.stage3 ||
            response.stageThree ||
            response.data?.stage3 ||
            response.data?.stageThree ||
            clientData?.stage3 ||
            {},
          stage4:
            response.stage4 ||
            response.stageFour ||
            response.data?.stage4 ||
            response.data?.stageFour ||
            clientData?.stage4 ||
            {},
          stage5:
            response.stage5 ||
            response.stageFive ||
            response.data?.stage5 ||
            response.data?.stageFive ||
            clientData?.stage5 ||
            {},
          stage6:
            response.stage6 ||
            response.stageSix ||
            response.data?.stage6 ||
            response.data?.stageSix ||
            clientData?.stage6 ||
            {},
          status:
            response.status ||
            (currentModule === "vocat" ? response.closeMatter : undefined) ||
            "active",
        };

        // Sync allocatedUser to stage2 agent if missing or mismatch
        if (response.allocatedUser) {
          const users = response.users || [];
          const matchedUser = users.find(
            (u) =>
              u.displayName === response.allocatedUser ||
              u.name === response.allocatedUser
          );

          if (matchedUser) {
            normalized.stage2.agent = `${matchedUser._id}-${matchedUser.displayName}`;
          }
        }

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
              }
            }
          }

          // Check individual stage properties (stage1, stage2, etc.) as fallback
          for (let i = 1; i <= 6; i++) {
            const stageKey = `stage${i}`;
            const stageData = normalized[stageKey] || response[stageKey];
            if (stageData && stageData.colorStatus) {
              const statusMap = {
                green: "Completed",
                red: "Not Completed",
                amber: "In Progress",
              };
              section[`status${i}`] =
                statusMap[stageData.colorStatus] || "Not Completed";
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
          section.status1 = normalized.stage1?.colorStatus || "Not Completed";
          section.status2 = normalized.stage2?.colorStatus || "Not Completed";
          section.status3 = normalized.stage3?.colorStatus || "Not Completed";
          section.status4 = normalized.stage4?.colorStatus || "Not Completed";
          section.status5 = normalized.stage5?.colorStatus || "Not Completed";
          section.status6 = normalized.stage6?.colorStatus || "Not Completed";
        } else if (currentModule === "print media") {
          // IDG stage status logic
          section.status1 =
            normalized.data?.stage1?.colorStatus || "Not Completed";
          section.status2 =
            normalized.data?.stage2?.colorStatus || "Not Completed";
          section.status3 =
            normalized.data?.stage3?.colorStatus || "Not Completed";
          section.status4 =
            normalized.data?.stage4?.colorStatus || "Not Completed";
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
      setMatterDirty(false);
      return;
    }
    try {
      const a = JSON.stringify(clientData);
      const b = JSON.stringify(originalClientData);
      setMatterDirty(a !== b);
    } catch {
      setMatterDirty(true);
    }
  }, [clientData, originalClientData]);

  async function handleupdate(e) {
    console.log(
      "🟡 [UPDATE CLICKED]",
      "matterDirty =",
      matterDirty,
      "module =",
      localStorage.getItem("currentModule")
    );
    e.preventDefault();
    if (!matterDirty) return;
    setShowUpdateConfirm(true);
  }

  async function performUpdate() {
    console.log("🟢 [CONFIRM CLICKED] performUpdate() started");
    if (!matterDirty) {
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
          businessAddress: clientData.businessAddress || "",
          state: clientData?.state || "",
          clientType: clientData?.clientType || "",
          matterDate: clientData?.matterDate || null,
          dataEntryBy: clientData?.dataEntryBy || "",
          postcode: clientData?.postcode || "",
        };
      } else if (currentModule === "vocat") {
        payload = {
          settlementDate: clientData?.settlementDate || null,
          notes: clientData?.notes || "",
          postcode: clientData?.postcode,
          clientAddress: clientData?.clientAddress || "",
        };
      } else if (currentModule !== "print media") {
        payload = {
          settlementDate: clientData?.settlementDate || null,
          notes: clientData?.notes || "",
          postcode: clientData?.postcode,
        };
      } else if (currentModule === "print media") {
        payload = {
          deliveryAddress: clientData?.data?.deliveryAddress || "",
          order_details: clientData?.data?.order_details || null,
          notes: clientData?.data?.notes || "",
          postCode: clientData?.data?.postcode || clientData?.data?.postCode,
          orderDate:
            clientData?.matterDate ||
            clientData?.data?.orderDate ||
            null,
          orderId: clientData?.data?.orderId || clientData?.matterNumber || "",
          clientName:
            clientData?.clientName ||
            clientData?.data?.client?.name ||
            "",
          state: clientData?.data?.state || clientData?.state || "",
          orderType:
            clientData?.clientType ||
            clientData?.data?.orderType ||
            "",
          deliveryDate: clientData?.data?.deliveryDate || null,
          dataEntryBy:
            clientData?.data?.dataEntryBy || clientData?.dataEntryBy || "",
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
        } else if (currentModule === "vocat") {
          payload.clientAddress = clientData?.clientAddress || "";
        } else if (currentModule !== "print media") {
          // FOR CONVEYANCING: Map the address to 'propertyAddress'
          payload.propertyAddress = clientData?.propertyAddress || "";
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
        if (!payload.orderId && clientData?.data?.orderId) {
          payload.orderId = clientData.data.orderId;
        }
        if (!payload.orderId && clientData?.matterNumber) {
          payload.orderId = clientData.matterNumber;
        }
        resp = await apiRef.current.updateIDGClientData(
          originalMatterNumber,
          payload
        );
      } else if (currentModule === "vocat") {
        console.log("[API] Vocat update");
        resp = await vocatApiRef.current.updateClient(
          originalMatterNumber,
          payload
        );
      } else {
        console.log("[API] Conveyancing update");
        resp = await apiRef.current.updateClientData(
          originalMatterNumber,
          payload
        );
      }
      console.log("✅ [API RESPONSE]", resp);
      const updatedClient = resp.client || resp || clientData;
      if (currentModule === "commercial") {
        const mergedData = {
          ...clientData,
          ...updatedClient,
          stage1: clientData?.stage1 || updatedClient?.stage1,
          stage2: clientData?.stage2 || updatedClient?.stage2,
          stage3: clientData?.stage3 || updatedClient?.stage3,
          stage4: clientData?.stage4 || updatedClient?.stage4,
          stage5: clientData?.stage5 || updatedClient?.stage5,
          stage6: clientData?.stage6 || updatedClient?.stage6,
        };

        setClientData(mergedData);
        setTimeout(() => {
          setReloadStage((prev) => !prev);
        }, 500);
        setOriginalClientData(JSON.parse(JSON.stringify(mergedData)));
      } else {
        // For other modules, use the existing logic
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
      }

      // Update matter number if it changed
      if (
        updatedClient.matterNumber &&
        updatedClient.matterNumber !== originalMatterNumber
      ) {
        setOriginalMatterNumber(updatedClient.matterNumber);
      }

      // Handle navigation
      if (resp.directUrl && currentModule !== "commercial") {
        let direct = resp.directUrl;
        if (!direct.startsWith("/")) direct = `/${direct}`;
        if (!direct.match(/^\/admin/)) direct = `/admin${direct}`;

        window.location.href = direct;
        return;
      }

      if (
        updatedClient?.matterNumber &&
        String(updatedClient.matterNumber) !== String(originalMatterNumber)
      ) {
        // setTimeout(() => {
        //   try {
        //     navigate(`/admin/client/stages/${updatedClient.matterNumber}`);
        //   } catch {
        //     window.location.href = `/admin/client/stages/${updatedClient.matterNumber}`;
        //   }
        // }, 450);
        window.location.href = `/admin/client/stages/${updatedClient.matterNumber}`;
      } else {
        // Force hard reload on the current page
        window.location.reload();
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
        <main className="flex-grow flex flex-col p-2 md:p-4 w-full max-w-screen-xl mx-auto overflow-auto scrollbar-hide">
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
              {true && (
                <Button
                  label="Cost"
                  bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-sky-600 active:bg-sky-700"
                  width="w-[60px] md:w-[70px]"
                  onClick={navigateToCost}
                />
              )}
            </div>
          </div>

          {/* Mobile layout - buttons below Hello */}
          <div className="flex flex-col md:hidden mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
              Hello, {localStorage.getItem("user")}
            </h2>
            <div className="flex justify-between w-full gap-3">
              <Button
                label="Upload Image"
                bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] shadow-md hover:shadow-lg transition-all"
                width="w-[48%]"
                onClick={() => setIsOpen(true)}
              />
              <Button
                label="Cost"
                bg="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] shadow-md hover:shadow-lg transition-all"
                width="w-[48%]"
                onClick={navigateToCost}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 flex-shrink-0 px-0.5">
                      {stages.map((stage, index) => {
                        const stageStatus = stageStatuses[`status${stage.id}`];
                        return (
                          <div
                            key={stage.id}
                            onClick={() => RenderStage(stage.id)}
                            className={`cursor-pointer p-2 rounded-xl shadow-sm transition-all duration-200 h-[70px] border flex flex-col justify-center relative overflow-hidden ${
                              selectedStage === stage.id
                                ? "bg-white ring-2 ring-[#2E3D99] ring-offset-1 border-transparent z-10"
                                : `${bgcolor(
                                    stageStatus
                                  )} border-transparent opacity-90 hover:opacity-100`
                            }`}
                          >
                            {selectedStage === stage.id && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2E3D99] to-[#1D97D7]" />
                            )}

                            <div className="flex justify-between items-start mb-1 pl-1">
                              <p
                                className={`font-bold font-poppins text-xs ${
                                  selectedStage === stage.id
                                    ? "text-[#2E3D99]"
                                    : "text-gray-800"
                                }`}
                              >
                                Stage {index + 1}
                              </p>
                              <div
                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  stageStatus === "In Progress" ||
                                  stageStatus === "amber"
                                    ? "bg-amber-100 text-amber-700"
                                    : stageStatus === "Completed" ||
                                      stageStatus === "green"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {getStatusDisplayText(stageStatus)}
                              </div>
                            </div>
                            <div className="pl-1">
                              <p className="text-[11px] font-medium leading-tight truncate text-gray-700">
                                {stage.title}
                              </p>
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
                  <div className="flex justify-center mb-3">
                    <button
                      onClick={() => setIsStagesCollapsed(!isStagesCollapsed)}
                      className="p-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-500 hover:text-[#2E3D99] hover:bg-white transition-all duration-200"
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

              {/* Mobile Tab Switcher - Added for better viewport management */}
              {isSmallScreen && (
                <div className="flex w-full bg-white/80 backdrop-blur-sm rounded-xl p-1 mb-3 border border-gray-200/60 shadow-sm">
                  <button
                    onClick={() => setActiveMobileTab("stage")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                      activeMobileTab === "stage"
                        ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Stage Tasks
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("details")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                      activeMobileTab === "details"
                        ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Matter Details
                  </button>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-1 flex-grow overflow-hidden">
                {(!isSmallScreen || activeMobileTab === "stage") && (
                  <div className="w-full lg:w-[calc(100%-300px)] p-2 md:p-4 rounded-xl bg-white shadow-sm border border-gray-100/50 overflow-y-auto">
                    {clientData && Showstage(selectedStage)}
                  </div>
                )}

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
                              : clientData?.data?.orderDate || clientData?.orderDate
                              ? formatDateForDisplay(
                                  clientData?.data?.orderDate || clientData?.orderDate
                                )
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
                            : currentModule === "vocat"
                            ? "Client Address"
                            : "Property Address"}
                        </label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={
                            currentModule === "commercial"
                              ? clientData?.businessAddress || ""
                              : currentModule === "print media"
                              ? clientData?.data?.deliveryAddress || ""
                              : currentModule === "vocat"
                              ? clientData?.clientAddress || ""
                              : clientData?.propertyAddress || ""
                          }
                          onChange={(e) => {
                            if (!isSuperAdmin) return;
                            const value = e.target.value;
                            setClientData((prev) => {
                              if (currentModule === "commercial") {
                                return { ...prev, businessAddress: value };
                              }
                              if (currentModule === "print media") {
                                return {
                                  ...prev,
                                  data: {
                                    ...(prev?.data || {}),
                                    deliveryAddress: value,
                                  },
                                };
                              }
                              if (currentModule === "vocat") {
                                return { ...prev, clientAddress: value };
                              }
                              return { ...prev, propertyAddress: value };
                            });
                          }}
                          className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                            !isSuperAdmin ? "bg-gray-100" : ""
                          }`}
                          disabled={!isSuperAdmin}
                          ref={addressInputRef}
                        />
                      </div>

                      {/* State Field */}
                      <div className="md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold mb-1">
                          State
                        </label>
                        {isSuperAdmin ? (
                        <input
                            id="state"
                            name="state"
                            type="text"
                            value={
                              clientData?.state ||
                              clientData?.data?.state ||
                              ""
                            }
                            onChange={(e) =>
                              setClientData((prev) => {
                                const val = e.target.value;
                                const next = { ...(prev || {}), state: val };
                                if (currentModule === "print media") {
                                  if (!next.data) next.data = {};
                                  next.data.state = val;
                                }
                                return next;
                              })
                            }
                            className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                          />
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
                      {currentModule !== "vocat" && (
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
                            <option value="">Select {currentModule === "print media" ? "Order" : "Client"} Type</option>
                            {(currentModule === "vocat"
                              ? ["Primary Victim", "Related Victim", "Funeral Expenses"]
                              : CLIENT_TYPE_OPTIONS
                            ).map((ct) => (
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
                      )}
                      {currentModule === "vocat" && (
                        <div className="md:col-span-3 flex flex-col md:flex-row gap-4">
                           <div className="flex-[1.5]">
                              <label className="block text-xs md:text-sm font-semibold mb-1">
                                Client Type
                              </label>
                              {isSuperAdmin ? (
                                <select
                                  id="clientType"
                                  name="clientType"
                                  value={clientData?.clientType || ""}
                                  onChange={(e) =>
                                    setClientData((prev) => ({
                                      ...(prev || {}),
                                      clientType: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                                >
                                  <option value="">Select Client Type</option>
                                  {["Primary Victim", "Related Victim", "Funeral Expenses"].map((ct) => (
                                    <option key={ct} value={ct}>
                                      {ct}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={clientData?.clientType || ""}
                                  className="w-full rounded bg-gray-100 px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                                  disabled
                                  readOnly
                                />
                              )}
                           </div>
                           <div className="flex-1">
                              <label className="block text-xs md:text-sm font-semibold mb-1">
                                Criminal Incident Date
                              </label>
                              {isSuperAdmin ? (
                                <input
                                  id="criminalIncidentDate"
                                  name="criminalIncidentDate"
                                  type="date"
                                  value={
                                    clientData?.criminalIncidentDate
                                      ? new Date(clientData.criminalIncidentDate)
                                          .toISOString()
                                          .substring(0, 10)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    setClientData((prev) => ({
                                      ...(prev || {}),
                                      criminalIncidentDate: e.target.value,
                                    }));
                                  }}
                                  className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={
                                    clientData?.criminalIncidentDate
                                      ? formatDateForDisplay(clientData.criminalIncidentDate)
                                      : ""
                                  }
                                  className="w-full rounded bg-gray-100 px-2 py-2 text-xs md:text-sm border border-gray-200"
                                  disabled
                                  readOnly
                                />
                              )}
                           </div>
                        </div>
                      )}

                      {/* Post Code */}
                      {currentModule !== "vocat" && (
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
                         ${
                           currentModule === "print media" && "bg-gray-100"
                         }`}
                          />
                        </div>
                      )}

                      {/* Completion/Settlement/Delivery Date */}
                      {/* Completion/Settlement/Delivery Date (Standard) */}
                      {currentModule !== "vocat" && (
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
                              if (!isSuperAdmin) return;
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
                            className={`w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200 ${
                              !isSuperAdmin ? "bg-gray-100" : ""
                            }`}
                            disabled={!isSuperAdmin}
                          />
                      </div>
                      )}

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
                              clientData?.data?.dataEntryBy ||
                              ""
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
                              matterDirty
                                ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] hover:bg-[#0086bf] text-white cursor-pointer"
                                : "bg-gray-300 text-gray-200 cursor-not-allowed"
                            } font-medium rounded py-2 text-base`}
                            disabled={!matterDirty}
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
              {isSmallScreen && activeMobileTab === "details" && (
                <div className="w-full mt-4 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5 overflow-y-auto">
                  <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
                    {currentModule === "commercial"
                      ? "Project Details"
                      : currentModule === "print media"
                      ? "Order Details"
                      : "Matter Details"}
                  </h2>
                  <form
                    className="grid grid-cols-1 gap-y-4"
                    onSubmit={handleupdate}
                  >
                    {/* Mobile form fields - similar structure but simplified */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
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
                        className={`w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none ${
                          !isSuperAdmin
                            ? "bg-gray-50 text-gray-500"
                            : "bg-white"
                        }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
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
                          className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={
                            clientData?.matterNumber ||
                            clientData?.data?.orderId ||
                            ""
                          }
                          className="w-full rounded-lg bg-gray-50 px-3 py-3 text-sm border border-gray-200 text-gray-500"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    {/* Client Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
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
                        className={`w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none ${
                          !isSuperAdmin
                            ? "bg-gray-50 text-gray-500"
                            : "bg-white"
                        }`}
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    {/* Business Name */}
                    {currentModule === "commercial" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
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
                            className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={clientData?.businessName || ""}
                            className="w-full rounded-lg bg-gray-50 px-3 py-3 text-sm border border-gray-200 text-gray-500"
                            disabled
                            readOnly
                          />
                        )}
                      </div>
                    )}

                    {/* Address Field */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        {currentModule === "commercial"
                          ? "Business Address"
                          : currentModule === "print media"
                          ? "Billing Address"
                          : "Property Address"}
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={
                          currentModule === "commercial"
                            ? clientData?.businessAddress || ""
                            : currentModule === "print media"
                            ? clientData?.data?.deliveryAddress || ""
                            : clientData?.propertyAddress || ""
                        }
                        onChange={(e) => {
                          if (!isSuperAdmin) return;
                          const value = e.target.value;
                          setClientData((prev) => {
                            if (currentModule === "commercial") {
                              return { ...prev, businessAddress: value };
                            }
                            if (currentModule === "print media") {
                              return {
                                ...prev,
                                data: {
                                  ...(prev?.data || {}),
                                  deliveryAddress: value,
                                },
                              };
                            }
                            return { ...prev, propertyAddress: value };
                          });
                        }}
                        className={`w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none ${
                          !isSuperAdmin
                            ? "bg-gray-50 text-gray-500"
                            : "bg-white"
                        }`}
                        disabled={!isSuperAdmin}
                        ref={mobileAddressInputRef}
                      />
                    </div>

                    {/* State Field */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        State
                      </label>
                      {isSuperAdmin ? (
                        <input
                          type="text"
                          value={
                            clientData?.state || clientData?.data?.state || ""
                          }
                          onChange={(e) =>
                            setClientData((prev) => {
                              const val = e.target.value;
                              const next = { ...(prev || {}), state: val };
                              if (currentModule === "print media") {
                                if (!next.data) next.data = {};
                                next.data.state = val;
                              }
                              return next;
                            })
                          }
                          className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none bg-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={
                            clientData?.state || clientData?.data?.state || ""
                          }
                          className="w-full rounded-lg bg-gray-50 px-3 py-3 text-sm border border-gray-200 text-gray-500"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    {/* Client Type Field */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
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
                          className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none bg-white"
                        >
                          <option value="">Select {currentModule === "print media" ? "Order" : "Client"} Type</option>
                          {(currentModule === "vocat"
                            ? ["Primary Victim", "Related Victim", "Funeral Expenses"]
                            : CLIENT_TYPE_OPTIONS
                          ).map((ct) => (
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
                          className="w-full rounded-lg bg-gray-50 px-3 py-3 text-sm border border-gray-200 text-gray-500"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    {/* Post Code */}
                    {currentModule !== "vocat" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
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
                          className={`w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none
                     ${
                       currentModule === "print media"
                         ? "bg-gray-50 text-gray-500"
                         : "bg-white"
                     }`}
                        />
                      </div>
                    )}

                    {/* Completion/Settlement/DeliveryDate */}
                    {currentModule !== "vocat" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          {currentModule === "commercial"
                            ? "Completion Date"
                            : currentModule === "print media"
                            ? "Delivery Date"
                            : "Settlement Date"}
                        </label>
                        <input
                          id="settlementDate"
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
                          className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none bg-white"
                        />
                      </div>
                    )}

                    {/* Criminal Incident Date (VOCAT only) - Mobile */}
                    {currentModule === "vocat" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          Criminal Incident Date
                        </label>
                        <input
                          id="criminalIncidentDate"
                          type="date"
                          value={
                            clientData?.criminalIncidentDate
                              ? new Date(clientData.criminalIncidentDate)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                          }
                          onChange={(e) => {
                            setClientData((prev) => ({
                              ...(prev || {}),
                              criminalIncidentDate: e.target.value,
                            }));
                          }}
                          className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none bg-white"
                        />
                      </div>
                    )}

                    {/* Data Entry By */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Data Entry By
                      </label>
                      {isSuperAdmin ? (
                        <input
                          type="text"
                          value={
                            clientData?.dataEntryBy ||
                            clientData?.data?.dataEntryBy ||
                            ""
                          }
                          onChange={(e) =>
                            setClientData((prev) => ({
                              ...(prev || {}),
                              dataEntryBy: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={
                            clientData?.dataEntryBy ||
                            clientData?.data?.dataEntryBy ||
                            ""
                          }
                          className="w-full rounded-lg bg-gray-50 px-3 py-3 text-sm border border-gray-200 text-gray-500"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-3">
                      {currentModule === "print media" ? (
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                              Order Details
                            </label>
                            <textarea
                              rows={4}
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
                              className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                              Notes / Comments
                            </label>
                            <textarea
                              rows={4}
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
                              className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none resize-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Notes / Comments
                          </label>
                          <textarea
                            rows={4}
                            value={
                              clientData?.notes || clientData?.data?.notes || ""
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
                            className="w-full rounded-lg px-3 py-3 text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E3D99]/20 focus:border-[#2E3D99] transition-all outline-none resize-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <button
                        type="submit"
                        className={`w-full ${
                          matterDirty
                            ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] shadow-lg hover:shadow-xl active:scale-[0.98]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        } font-bold rounded-lg py-3 text-sm tracking-wide text-white transition-all duration-200`}
                        disabled={!matterDirty}
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
            setStageDirty(false);
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
