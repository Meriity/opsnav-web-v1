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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---------- Helpers ----------

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

const STATE_OPTIONS = ["VIC", "NSW", "QLD", "SA"];
const CLIENT_TYPE_OPTIONS = ["Buyer", "Seller", "Transfer"];

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

// Normalize data from various APIs into a single shape
const transformClientData = (data) => {
  if (!data) return null;

  const normalized = {
    ...data,
    matterDate: data.matterDate
      ? typeof data.matterDate === "string"
        ? data.matterDate
        : new Date(data.matterDate).toISOString()
      : "",
    settlementDate: data.settlementDate
      ? typeof data.settlementDate === "string"
        ? data.settlementDate
        : new Date(data.settlementDate).toISOString()
      : "",
    notes:
      data.notes !== undefined
        ? data.notes
        : data.notes ?? data?.data?.notes ?? "",
    businessName: data.businessName || data.business_name || "",
    businessAddress:
      data.businessAddress ||
      data.business_address ||
      data.propertyAddress ||
      data?.data?.deliveryAddress ||
      "",
    clientName: data.clientName || data.client_name || "",
    clientType: data.clientType || data.client_type || data?.data?.orderType || "",
    dataEntryBy: data.dataEntryBy || data.dataentryby || data?.data?.dataEntryBy || "",
    postcode: data.postcode || data.postCode || data?.data?.postCode || "",
  };

  return normalized;
};

// Compute stage statuses from server data
const processStageStatuses = (data) => {
  const section = {};
  const localCompany = localStorage.getItem("company");
  const currentModule = localStorage.getItem("currentModule");

  // default all as Not Completed
  for (let i = 1; i <= 6; i++) {
    section[`status${i}`] = "Not Completed";
  }

  if (currentModule === "commercial") {
    // stages array with S1, S2... keys
    if (data.stages && Array.isArray(data.stages) && data.stages.length > 0) {
      const stageObject = data.stages[0];
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

    // fallback: individual stageX.colorStatus
    for (let i = 1; i <= 6; i++) {
      const stageKey = `stage${i}`;
      if (data[stageKey] && data[stageKey].colorStatus) {
        const statusMap = {
          green: "Completed",
          red: "Not Completed",
          amber: "In Progress",
        };
        section[`status${i}`] =
          statusMap[data[stageKey].colorStatus] || section[`status${i}`];
      }
    }

    // global colorStatus applies to stage 1
    if (data.colorStatus) {
      const statusMap = {
        green: "Completed",
        red: "Not Completed",
        amber: "In Progress",
      };
      section.status1 = statusMap[data.colorStatus] || section.status1;
    }
  } else if (localCompany === "vkl") {
    section.status1 = data.stage1?.colorStatus || "Not Completed";
    section.status2 = data.stage2?.colorStatus || "Not Completed";
    section.status3 = data.stage3?.colorStatus || "Not Completed";
    section.status4 = data.stage4?.colorStatus || "Not Completed";
    section.status5 = data.stage5?.colorStatus || "Not Completed";
    section.status6 = data.stage6?.colorStatus || "Not Completed";
  } else if (localCompany === "idg") {
    section.status1 = data.data?.stage1?.colorStatus || "Not Completed";
    section.status2 = data.data?.stage2?.colorStatus || "Not Completed";
    section.status3 = data.data?.stage3?.colorStatus || "Not Completed";
    section.status4 = data.data?.stage4?.colorStatus || "Not Completed";
  }

  return section;
};

// ---------- Component ----------

export default function StagesLayout() {
  const { matterNumber, stageNo } = useParams();
  const apiRef = useRef(new ClientAPI());
  const commercialApiRef = useRef(new CommercialAPI());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const company = localStorage.getItem("company");
  const currentModule = localStorage.getItem("currentModule");

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
        const payload = JSON.parse(atob(t.split(".")[1] || ""));
        if (payload && payload.role) return payload.role;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const isAnyAdmin = role === "superadmin" || role === "admin";
  const isSuperAdmin = role === "superadmin";

  const [selectedStage, setSelectedStage] = useState(
    Number(stageNo) || 1
  );
  const [reloadStage, setReloadStage] = useState(false);

  const [clientData, setClientData] = useState(null); // editable copy
  const [originalClientData, setOriginalClientData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  // keep originalMatterNumber in sync
  useEffect(() => {
    setOriginalMatterNumber(matterNumber);
  }, [matterNumber]);

  // Role auto-refresh on focus/storage changes
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

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Stages list based on company/module
  let stages = [];
  if (currentModule === "commercial") {
    stages = [
      { id: 1, title: "Engagement & Proposal" },
      { id: 2, title: "Due Diligence & Negotiation" },
      { id: 3, title: "Execution & Registration" },
      { id: 4, title: "Finalization & Settlement" },
      { id: 5, title: "Review & Compliance" },
      { id: 6, title: "Completion & Archiving" },
    ];
  } else if (company === "idg") {
    stages = [
      { id: 1, title: "Initiate & Approve" },
      { id: 2, title: "Plan & Prepare" },
      { id: 3, title: "Process & Deliver" },
      { id: 4, title: "Upload Image & Close" },
    ];
  } else {
    stages = [
      { id: 1, title: "Retainer/Declaration" },
      { id: 2, title: "VOI/CAF/Approvals" },
      { id: 3, title: "Searches/PEXA" },
      { id: 4, title: "DTS/DOL/SOA" },
      { id: 5, title: "Notify/Transfer/Disb" },
      { id: 6, title: "Final Letter/Close" },
    ];
  }

  // --------- Data fetching (React Query) ---------

  const fetchDetails = async () => {
    const localCompany = localStorage.getItem("company");
    const localModule = localStorage.getItem("currentModule");

    let response = null;

    try {
      if (localModule === "commercial") {
        // First: active projects
        const activeProjectsResponse =
          await commercialApiRef.current.getActiveProjects();

        let dataArr = [];
        if (Array.isArray(activeProjectsResponse)) {
          dataArr = activeProjectsResponse;
        } else if (
          activeProjectsResponse &&
          Array.isArray(activeProjectsResponse.data)
        ) {
          dataArr = activeProjectsResponse.data;
        } else if (
          activeProjectsResponse &&
          Array.isArray(activeProjectsResponse.clients)
        ) {
          dataArr = activeProjectsResponse.clients;
        } else if (
          activeProjectsResponse &&
          Array.isArray(activeProjectsResponse.projects)
        ) {
          dataArr = activeProjectsResponse.projects;
        }

        response =
          dataArr.find(
            (project) =>
              String(project.matterNumber) === String(matterNumber) ||
              String(project._id) === String(matterNumber) ||
              String(project.id) === String(matterNumber)
          ) || null;

        // If not found in active, try full data endpoint
        if (!response) {
          try {
            response =
              await commercialApiRef.current.getProjectFullData(matterNumber);
          } catch {
            // ignore; fallback below
          }
        }

        if (!response) {
          response = createDefaultProjectData(matterNumber);
        }
      } else if (localCompany === "vkl") {
        response = await apiRef.current.getAllStages(matterNumber);
      } else if (localCompany === "idg") {
        response = await apiRef.current.getIDGStages(matterNumber);
      } else {
        response = await apiRef.current.getAllStages(matterNumber);
      }
    } catch (error) {
      // For commercial: fallback to default structure
      if (localModule === "commercial") {
        response = createDefaultProjectData(matterNumber);
      } else {
        throw error;
      }
    }

    // Handle role returned from server
    const serverRole =
      response?.role || response?.currentUser?.role || null;
    if (serverRole) {
      setRole(serverRole);
    }

    return response;
  };

  const {
    data: fetchedData,
    isLoading: isClientLoading,
    error: clientError,
    isError,
  } = useQuery({
    queryKey: ["clientData", matterNumber, company, currentModule],
    queryFn: fetchDetails,
    enabled: !!matterNumber,
    retry: (failureCount) => failureCount < 2,
    select: (data) => transformClientData(data),
  });

  // When data loads, sync into local editable copy & compute statuses
  useEffect(() => {
    if (fetchedData) {
      setClientData(fetchedData);
      setOriginalClientData(JSON.parse(JSON.stringify(fetchedData)));
      const statuses = processStageStatuses(fetchedData);
      setStageStatuses(statuses);
    }
  }, [fetchedData]);

  // Error handling
  useEffect(() => {
    if (isError) {
      console.error("Error fetching stage details:", clientError);
      const localModule = localStorage.getItem("currentModule");
      if (localModule === "commercial") {
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
    }
  }, [isError, clientError, matterNumber]);

  // Loading state
  useEffect(() => {
    setLoading(isClientLoading || isUpdating);
  }, [isClientLoading, isUpdating]);

  // Detect unsaved changes
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

  // --------- Stage data helpers ---------

  const getStageData = (stageNumber) => {
    if (!clientData) return null;

    if (currentModule === "commercial") {
      // Try stages array
      if (
        clientData.stages &&
        Array.isArray(clientData.stages) &&
        clientData.stages.length > 0
      ) {
        const stageObject = clientData.stages[0];
        const stageKey = `S${stageNumber}`;
        if (stageObject[stageKey]) {
          return { colorStatus: stageObject[stageKey] };
        }
      }
      // Or stage1, stage2, ...
      return clientData[`stage${stageNumber}`] || null;
    }

    if (company === "idg") {
      return clientData.data?.[`stage${stageNumber}`] || null;
    }

    if (clientData.data && clientData.data[`stage${stageNumber}`]) {
      return clientData.data[`stage${stageNumber}`];
    }

    return clientData[`stage${stageNumber}`] || null;
  };

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

    const stageData = getStageData(stage);

    switch (stage) {
      case 1:
        return (
          <Stage1
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
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
          />
        );
      case 3:
        return (
          <Stage3
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 4:
        return (
          <Stage4
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 5:
        return (
          <Stage5
            data={stageData}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
      case 6:
        return (
          <Stage6
            data={
              company === "vkl"
                ? normalizeCloseMatterForClient(stageData)
                : stageData
            }
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
            data={getStageData(1)}
            changeStage={RenderStage}
            reloadTrigger={reloadStage}
            setReloadTrigger={setReloadStage}
          />
        );
    }
  }

  // --------- Update / Mutation ---------

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const localModule = localStorage.getItem("currentModule");
      const localCompany = localStorage.getItem("company");

      let resp;
      if (localModule === "commercial") {
        const isNewProject =
          !originalClientData?.clientName &&
          !originalClientData?.businessName &&
          !originalClientData?.state;

        if (isNewProject) {
          resp = await commercialApiRef.current.createProject(payload);
          toast.success("Project created successfully!");
        } else {
          const updateMatterNumber =
            payload.matterNumber || originalMatterNumber;
          resp = await commercialApiRef.current.updateProject(
            updateMatterNumber,
            payload
          );
          toast.success("Project details updated successfully");
        }
      } else if (localCompany === "vkl") {
        resp = await apiRef.current.updateClientData(
          originalMatterNumber,
          payload
        );
        toast.success("Matter details updated successfully");
      } else if (localCompany === "idg") {
        resp = await apiRef.current.updateIDGClientData(
          originalMatterNumber,
          payload
        );
        toast.success("Order details updated successfully");
      } else {
        resp = await apiRef.current.updateClientData(
          originalMatterNumber,
          payload
        );
        toast.success("Details updated successfully");
      }

      return resp;
    },
    onSuccess: (resp) => {
      const updatedClient = resp?.client || resp || clientData;
      const normalizedUpdated = transformClientData(updatedClient);

      queryClient.setQueryData(
        ["clientData", matterNumber, company, currentModule],
        normalizedUpdated
      );

      setClientData(normalizedUpdated);
      setOriginalClientData(JSON.parse(JSON.stringify(normalizedUpdated)));

      // update stage statuses
      const statuses = processStageStatuses(normalizedUpdated);
      setStageStatuses(statuses);

      // update original matter number if changed
      if (
        normalizedUpdated.matterNumber &&
        String(normalizedUpdated.matterNumber) !== String(originalMatterNumber)
      ) {
        setOriginalMatterNumber(normalizedUpdated.matterNumber);
      }

      // optional redirect
      if (resp?.directUrl) {
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
          const newUrl = `/admin/client/stages/${normalizedUpdated.matterNumber}`;
          try {
            navigate(newUrl);
          } catch {
            window.location.href = newUrl;
          }
        }, 450);
      }
    },
    onError: (err) => {
      console.error("Update error:", err);
      let msg = "Failed to update. Please try again.";
      if (err?.message) msg = err.message;
      else if (err?.response?.data?.message) msg = err.response.data.message;
      toast.error(msg);
    },
    onSettled: () => {
      setIsUpdating(false);
      setShowConfirmModal(false);
    },
  });

  async function handleupdate(e) {
    e.preventDefault();
    if (!hasChanges) return;
    setShowConfirmModal(true);
  }

  function performUpdate() {
    if (!hasChanges || !clientData) {
      setShowConfirmModal(false);
      return;
    }

    setIsUpdating(true);

    const localModule = localStorage.getItem("currentModule");
    const localCompany = localStorage.getItem("company");

    let payload = {};

    if (localModule === "commercial") {
      payload = {
        matterNumber: clientData?.matterNumber || matterNumber,
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
        status: clientData?.status || "active",
      };
    } else if (localCompany === "vkl") {
      payload = {
        settlementDate: clientData?.settlementDate || null,
        notes: clientData?.notes || "",
        propertyAddress: clientData?.propertyAddress || "",
        matterDate: clientData?.matterDate || null,
        clientName: clientData?.clientName || "",
        state: clientData?.state || "",
        clientType: clientData?.clientType || "",
        dataEntryBy: clientData?.dataEntryBy || "",
        postcode: clientData?.postcode || "",
      };
    } else if (localCompany === "idg") {
      payload = {
        deliveryDate: clientData?.data?.deliveryDate || null,
        order_details: clientData?.data?.order_details || null,
        notes: clientData?.notes || clientData?.data?.notes || "",
        deliveryAddress:
          clientData?.data?.deliveryAddress ||
          clientData?.propertyAddress ||
          "",
        postcode:
          clientData?.postcode || clientData?.data?.postCode || "",
      };
    } else {
      payload = {
        settlementDate: clientData?.settlementDate || null,
        notes: clientData?.notes || "",
        propertyAddress: clientData?.propertyAddress || "",
        matterDate: clientData?.matterDate || null,
        clientName: clientData?.clientName || "",
        state: clientData?.state || "",
        clientType: clientData?.clientType || "",
        dataEntryBy: clientData?.dataEntryBy || "",
        postcode: clientData?.postcode || "",
      };
    }

    // superadmin can override identifiers & extra fields
    if (isSuperAdmin) {
      payload.matterDate = clientData?.matterDate || payload.matterDate || null;
      payload.clientName = clientData?.clientName || payload.clientName || "";
      payload.businessName =
        clientData?.businessName || payload.businessName || "";
      payload.state = clientData?.state || payload.state || "";
      payload.clientType =
        clientData?.clientType || payload.clientType || "";
      payload.dataEntryBy =
        clientData?.dataEntryBy || payload.dataEntryBy || "";

      if (localModule === "commercial") {
        payload.businessAddress =
          clientData?.businessAddress || payload.businessAddress || "";
      } else if (localCompany === "vkl") {
        payload.propertyAddress =
          clientData?.propertyAddress || payload.propertyAddress || "";
      } else if (localCompany === "idg") {
        payload.deliveryAddress =
          clientData?.data?.deliveryAddress ||
          clientData?.propertyAddress ||
          payload.deliveryAddress ||
          "";
      }

      if (
        clientData?.matterNumber &&
        String(clientData.matterNumber) !== String(originalMatterNumber)
      ) {
        payload.matterNumber = clientData.matterNumber;
      }
    }

    // postcode editable for all
    payload.postcode =
      clientData?.postcode || clientData?.data?.postcode || payload.postcode || "";

    updateMutation.mutate(payload);
  }

  // --------- Render ---------

  if (loading && !clientData) {
    return (
      <div className="flex flex-col w-full h-screen bg-gray-100 overflow-hidden">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100 overflow-hidden">
      <UploadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <main className="flex-grow flex flex-col p-4 w-full max-w-screen-xl mx-auto overflow-auto">
        {/* Desktop header */}
        <div className="hidden md:flex justify-between items-center mb-2 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold">
            Hello {localStorage.getItem("user")}
          </h2>
          <div className="flex items-center gap-1">
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
            {(company === "vkl" ||
              (company === "idg" &&
                ["admin", "superadmin"].includes(
                  localStorage.getItem("role")
                )) ||
              currentModule === "commercial") && (
              <Button
                label="Cost"
                bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
                width="w-[60px] md:w-[70px]"
                onClick={() => setSelectedStage(7)}
              />
            )}
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex flex-col md:hidden mb-2 flex-shrink-0">
          <h2 className="text-lg font-semibold mb-2">
            Hello {localStorage.getItem("user")}
          </h2>
          <div className="flex justify-between w-full gap-1">
            <Button
              label="Upload Image"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[48%]"
              onClick={() => setIsOpen(true)}
            />
            <Button
              label="Cost"
              bg="bg-[#00AEEF] hover:bg-sky-600 active:bg-sky-700"
              width="w-[48%]"
              onClick={() => setSelectedStage(7)}
            />
          </div>
        </div>

        {loading && clientData ? (
          <Loader />
        ) : (
          <>
            {/* Stages section */}
            <div className="relative">
              {/* Mobile stages (collapsible) */}
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
                </div>
              )}

              {/* Desktop stages */}
              {!isSmallScreen && (
                <div>
                  <ul className="relative flex flex-col md:flex-row gap-2">
                    {stages.map((stage, index) => {
                      const stageStatus = stageStatuses[`status${stage.id}`];
                      const isActive = selectedStage === stage.id;
                      const isCompleted =
                        stageStatus === "Completed" || stageStatus === "green";
                      const isInProgress =
                        stageStatus === "In Progress" ||
                        stageStatus === "amber";

                      return (
                        <li
                          key={stage.id}
                          onClick={() => setSelectedStage(stage.id)}
                          className={`mb-5 md:shrink md:basis-0 flex-1 group flex gap-x-2 md:block cursor-pointer p-2 rounded-lg border-2 transition-all duration-300 ${
                            isActive
                              ? "bg-blue-50 border-[#00AEEF] scale-105 shadow-lg"
                              : "scale-95 border-gray-300"
                          }`}
                        >
                          <div className="min-w-7 min-h-5 flex flex-col items-center md:w-full md:inline-flex md:flex-wrap md:flex-row text-x align-middle">
                            <span
                              className={`size-9 flex justify-center items-center shrink-0 font-bold rounded-full border transition-colors ${
                                isActive
                                  ? "bg-[#00AEEF] text-white border-[#00AEEF] shadow-[0_0_12px_3px_rgba(59,130,246,0.6)]"
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

              {/* Mobile collapse toggle */}
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

              {/* Right panel: details (desktop) */}
              <div className="hidden lg:block w-[430px] xl:w-[500px] flex-shrink-0">
                <div className="w-full bg-white rounded shadow border border-gray-200 p-4 lg:h-[calc(100vh-160px)] lg:overflow-hidden lg:pb-8 lg:flex lg:flex-col">
                  <h2 className="text-lg font-bold mb-2">
                    {currentModule === "commercial"
                      ? "Project Details"
                      : company === "vkl"
                      ? "Matter Details"
                      : company === "idg"
                      ? (
                        <>
                          Order Details{" "}
                          <span className="absolute right-8 text-sm font-medium text-gray-600">
                            Unit Number : (
                            {clientData?.data?.unitNumber || "unset"})
                          </span>
                        </>
                      )
                      : ""}
                  </h2>
                  <form
                    className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 lg:flex-1 lg:overflow-y-auto lg:pr-2 lg:pb-2"
                    onSubmit={handleupdate}
                  >
                    {/* Date */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-0.5">
                        {currentModule === "commercial"
                          ? "Project Date"
                          : company === "vkl"
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

                    {/* Number / ID */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-0.5">
                        {currentModule === "commercial"
                          ? "Project Number"
                          : company === "vkl"
                          ? "Matter Number"
                          : company === "idg"
                          ? "Order ID"
                          : ""}
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

                    {/* Business Name (commercial) */}
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

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {currentModule === "commercial"
                          ? "Business Address"
                          : company === "vkl"
                          ? "Property Address"
                          : company === "idg"
                          ? "Billing Address"
                          : "Address"}
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
                            : clientData?.propertyAddress ||
                              clientData?.data?.deliveryAddress ||
                              ""
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

                    {/* State */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        State
                      </label>
                      {isSuperAdmin ? (
                        <select
                          id="state"
                          name="state"
                          value={
                            clientData?.state || clientData?.data?.state || ""
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

                    {/* Client/Order Type */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {currentModule === "commercial"
                          ? "Client Type"
                          : company === "vkl"
                          ? "Client Type"
                          : company === "idg"
                          ? "Order Type"
                          : ""}
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
                            clientData?.data?.orderType ||
                            ""
                          }
                          className="w-full rounded bg-gray-100 px-2 py-[8px] text-xs md:text-sm border border-gray-200"
                          disabled
                          readOnly
                        />
                      )}
                    </div>

                    {/* Post Code */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        Post Code
                      </label>
                      <input
                        type="text"
                        id="postcode"
                        name="postcode"
                        value={
                          clientData?.postcode ||
                          clientData?.data?.postCode ||
                          ""
                        }
                        onChange={(e) => {
                          setClientData((prev) => ({
                            ...(prev || {}),
                            postcode: e.target.value,
                          }));
                        }}
                        pattern="^[0-9]{4}$"
                        maxLength={4}
                        inputMode="numeric"
                        className="w-full rounded px-2 py-2 text-xs md:text-sm border border-gray-200"
                      />
                    </div>

                    {/* Completion / Settlement / Delivery Date */}
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-semibold mb-1">
                        {currentModule === "commercial"
                          ? "Completion Date"
                          : company === "vkl"
                          ? "Settlement Date"
                          : company === "idg"
                          ? "Delivery Date"
                          : ""}
                      </label>
                      <input
                        id={
                          currentModule === "commercial"
                            ? "completionDate"
                            : company === "vkl"
                            ? "settlementDate"
                            : "deliveryDate"
                        }
                        name={
                          currentModule === "commercial"
                            ? "completionDate"
                            : company === "vkl"
                            ? "settlementDate"
                            : "deliveryDate"
                        }
                        type="date"
                        value={
                          currentModule === "commercial"
                            ? clientData?.settlementDate
                              ? new Date(clientData.settlementDate)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                            : company === "vkl"
                            ? clientData?.settlementDate
                              ? new Date(clientData.settlementDate)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                            : company === "idg"
                            ? clientData?.data?.deliveryDate
                              ? new Date(clientData.data.deliveryDate)
                                  .toISOString()
                                  .substring(0, 10)
                              : ""
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (currentModule === "commercial") {
                            setClientData((prev) => ({
                              ...(prev || {}),
                              settlementDate: dateValue,
                            }));
                          } else if (company === "vkl") {
                            setClientData((prev) => ({
                              ...(prev || {}),
                              settlementDate: dateValue,
                            }));
                          } else if (company === "idg") {
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

                    {/* Notes / Order details */}
                    <div className="md:col-span-3">
                      {company === "idg" ? (
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

                    {/* Update button */}
                    <div className="md:col-span-3 mt-2">
                      <div className="mt-2">
                        <button
                          type="submit"
                          className={`w-full ${
                            hasChanges
                              ? "bg-[#00AEEF] hover:bg-[#0086bf] text-white"
                              : "bg-gray-300 text-gray-200 cursor-not-allowed"
                          } font-medium rounded py-2 text-base`}
                          disabled={!hasChanges || isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Mobile Details */}
            {isSmallScreen && clientData && (
              <div className="w-full mt-4 bg-white rounded shadow border border-gray-200 p-4 overflow-y-auto max-h-96">
                <h2 className="text-lg font-bold mb-2">
                  {currentModule === "commercial"
                    ? "Project Details"
                    : company === "vkl"
                    ? "Matter Details"
                    : company === "idg"
                    ? "Order Details"
                    : ""}
                </h2>
                <form
                  className="grid grid-cols-1 gap-x-4 gap-y-2"
                  onSubmit={handleupdate}
                >
                  <div>
                    <label className="block text-xs md:text-sm font-semibold mb-1">
                      {currentModule === "commercial"
                        ? "Project Date"
                        : company === "vkl"
                        ? "Matter Date"
                        : company === "idg"
                        ? "Order Date"
                        : ""}
                    </label>
                    <input
                      id="matterDateMobile"
                      name="matterDateMobile"
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

                  {/* You can mirror other fields here if you want full mobile form parity */}

                  <div className="mt-3">
                    <button
                      type="submit"
                      className={`w-full ${
                        hasChanges
                          ? "bg-[#00AEEF] hover:bg-[#0086bf] text-white"
                          : "bg-gray-300 text-gray-200 cursor-not-allowed"
                      } font-medium rounded py-2 text-base`}
                      disabled={!hasChanges || isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
