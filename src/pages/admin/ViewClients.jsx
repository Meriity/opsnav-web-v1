import {
  Dialog,
  Menu,
  Transition,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import ViewClientsTable from "../../components/ui/ViewClientsTable";
import { useEffect, useState, Fragment, useMemo } from "react";
import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import Header from "../../components/layout/Header";
import { toast } from "react-toastify";
import OutstandingTasksModal from "../../components/ui/OutstandingTasksModal";
import Loader from "../../components/ui/Loader";
import CreateClientModal from "../../components/ui/CreateClientModal";
import DateRangeModal from "../../components/ui/DateRangeModal";
import moment from "moment";
import ConfirmationModal from "../../components/ui/ConfirmationModal.jsx";
import { generateTaskAllocationPDF } from "../../components/utils/generateReport.js";
import { useClientStore } from "../ClientStore/clientstore.js";
import { useSearchStore } from "../SearchStore/searchStore.js";
import { delay } from "framer-motion";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  Archive,
  Building,
  Plus,
  Calendar,
  Filter,
  ChevronRight,
  Search,
  Download,
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  User,
  UserPlus,
  FolderCheck,
  FolderPlus,
  FilterIcon,
  SheetIcon,
  Clipboard,
} from "lucide-react";

const ViewClients = () => {
  const [createuser, setcreateuser] = useState(false);
  const [createOrder, setcreateOrder] = useState(false);
  const [createProject, setCreateProject] = useState(false);
  const [showOutstandingTask, setShowOutstandingTask] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareDetails, setShareDetails] = useState({
    matterNumber: "",
    reshareEmail: "",
  });
  const [email, setemail] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [clientList, setClientList] = useState(null);
  const [otActiveMatterNumber, setOTActiveMatterNumber] = useState(null);
  const [dateFilter, setDateFilter] = useState(() => {
    const saved = localStorage.getItem("viewClientsDateFilter");
    return saved ? JSON.parse(saved) : { type: "", range: ["", ""] };
  });
  const [showDateRange, setShowDateRange] = useState(false);
  const [showTAR, setShowTar] = useState(false);
  const {
    clients: Clients,
    fetchClients,
    list,
    user,
    loading,
    error,
  } = useClientStore();
  const [allocatedUser, setallocatedUser] = useState("");
  const { searchQuery } = useSearchStore();
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [commercialLoading, setCommercialLoading] = useState(false);
  const [commercialClients, setCommercialClients] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(true);

  const currentModule = localStorage.getItem("currentModule");

  const api = useMemo(() => {
    if (currentModule === "commercial") {
      return new CommercialAPI();
    } else {
      return new ClientAPI();
    }
  }, [currentModule]);

  // Fetch clients based on module
  useEffect(() => {
    // In the fetchData function, improve commercial data handling:
    const fetchData = async () => {
      if (currentModule === "commercial") {
        setCommercialLoading(true);
        try {
          const response = await api.getActiveProjects();
          console.log("Commercial clients response:", response);

          let data = [];
          if (Array.isArray(response)) {
            data = response;
          } else if (response && Array.isArray(response.data)) {
            data = response.data;
          } else if (response && Array.isArray(response.clients)) {
            data = response.clients;
          } else if (response && Array.isArray(response.projects)) {
            data = response.projects;
          } else {
            // Handle empty or null response
            console.warn("Empty or unexpected response format:", response);
            data = [];
          }

          const transformedData = data.map((client) => ({
            ...client,
            id: client.id || client.matterNumber || client._id,
            matternumber: client.matterNumber || client.id || client._id,
            client_name: client.clientName || client.client_name,
            businessAddress: client.businessAddress || client.business_address,
            businessName: client.businessName,
            state: client.state || "",
            client_type: client.clientType || client.type,
            settlement_date: client.settlementDate || client.settlement_date,
            matterDate: client.matterDate,
            dataEntryBy: client.dataEntryBy || "",
            postcode: client.postcode || "",
            finance_approval_date: client.financeApprovalDate,
            building_and_pest_date: client.buildingAndPestDate,
            dataentryby: client.dataEntryBy || "",
            status: client.status || "active",
          }));

          setCommercialClients(transformedData);
        } catch (error) {
          console.error("Error fetching commercial clients:", error);
          // Don't show error toast for empty responses, just set empty array
          if (error.response?.status !== 404) {
            toast.error("Failed to load commercial projects");
          }
          setCommercialClients([]);
        } finally {
          setCommercialLoading(false);
        }
      } else {
        fetchClients();
      }
    };

    fetchData();
  }, [currentModule, api, fetchClients]);

  useEffect(() => {
    let data = currentModule === "commercial" ? commercialClients : Clients;

    if (!Array.isArray(data) || data.length === 0) {
      setClientList([]);
      return;
    }

    const [rawStart, rawEnd] = Array.isArray(dateFilter?.range)
      ? dateFilter.range
      : ["", ""];

    if (!rawStart || !rawEnd) {
      setClientList(data);
      return;
    }

    const start = moment(rawStart).startOf("day");
    const end = moment(rawEnd).endOf("day");

    let filterType = (dateFilter?.type || "").toLowerCase();

    if (!filterType || filterType === "undefined") {
      filterType =
        currentModule === "print media"
          ? "delivery"
          : currentModule === "commercial"
          ? "project"
          : "settlement";
    }

    console.log(
      `Filtering ${filterType}: ${start.format()} to ${end.format()}`
    );

    data = data.filter((client) => {
      // Get the date strings from your data
      const orderDate = client.order_date || client.orderDate;
      const deliveryDate = client.delivery_date || client.deliveryDate;
      const settlementDate = client.settlement_date || client.settlementDate;
      const matterDate = client.matterDate || client.matter_date;

      const isIncluded = (dateStr) => {
        if (!dateStr) return false;
        return moment(dateStr).isBetween(start, end, null, "[]");
      };

      // Check against the correct column
      if (filterType.includes("both")) {
        return isIncluded(orderDate) || isIncluded(deliveryDate);
      } else if (filterType.includes("order")) {
        return isIncluded(orderDate);
      } else if (filterType.includes("delivery")) {
        return isIncluded(deliveryDate);
      } else if (filterType.includes("settlement")) {
        return isIncluded(settlementDate);
      } else if (filterType.includes("project")) {
        return isIncluded(matterDate);
      }

      if (currentModule === "print media") return isIncluded(deliveryDate);
      if (currentModule === "commercial") return isIncluded(matterDate);
      return isIncluded(settlementDate);
    });

    setClientList(data);
  }, [dateFilter, Clients, commercialClients, searchQuery, currentModule]);

  let columns = [];
  if (currentModule === "commercial") {
    columns = [
      { key: "matterNumber", title: "Project Number", width: "10%" },
      { key: "dataEntryBy", title: "Data Entry By", width: "10%" },
      { key: "clientName", title: "Client Name", width: "12%" },
      { key: "businessName", title: "Business Name", width: "12%" },
      { key: "businessAddress", title: "Business Address", width: "15%" },
      { key: "state", title: "State", width: "6%" },
      { key: "clientType", title: "Client Type", width: "8%" },
      { key: "settlementDate", title: "Completion Date", width: "10%" },
      { key: "matterDate", title: "Project Date", width: "10%" },
      // { key: "postcode", title: "Postcode", width: "7%" },
    ];
  } else if (currentModule === "conveyancing" || currentModule === "wills") {
    columns = [
      { key: "matternumber", title: "Matter Number", width: "8%" },
      { key: "dataentryby", title: "Data Entry By", width: "10%" },
      { key: "client_name", title: "Client Name", width: "10%" },
      { key: "property_address", title: "Property Address", width: "10%" },
      { key: "state", title: "State", width: "5%" },
      { key: "client_type", title: "Client Type", width: "7%" },
      { key: "settlement_date", title: "Settlement Date", width: "10%" },
      {
        key: "finance_approval_date",
        title: "Finance Approval Date",
        width: "10%",
      },
      {
        key: "building_and_pest_date",
        title: "Building & Pest Date",
        width: "10%",
      },
    ];
  } else if (currentModule === "print media") {
    columns = [
      { key: "clientId", title: "Client ID", width: "8%" },
      { key: "orderId", title: "Order ID", width: "10%" },
      { key: "client_name", title: "Client Name", width: "9%" },
      { key: "client_type", title: "Order Type", width: "12%" },
      { key: "allocatedUser", title: "Allocated User", width: "15%" },
      { key: "order_date", title: "Order Date", width: "12%" },
      { key: "delivery_date", title: "Delivery Date", width: "12%" },
      { key: "orderDetails", title: "Order Details", width: "10%" },
      { key: "billing_address", title: "Delivery Address", width: "10%" },
      { key: "postcode", title: "Post Code", width: "6.5%" },
    ];
  }

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

  async function handelReShareEmail() {
    try {
      setIsClicked(true);
      await api.resendLinkToClient(email, shareDetails?.matterNumber);
      toast.success("Email sent successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      handelShareEmailModalClose();
    }
  }

  async function changeUser(user, orderId) {
    console.log(user, orderId);
    try {
      const res = api.changeUser(user, orderId);
    } catch (error) {
      console.log("Error occured!!", error);
    }
  }

  const handleClientFilterChange = (selectedName) => {
    setSelectedClientName(selectedName);

    if (!selectedName) {
      setClientList(
        currentModule === "commercial" ? commercialClients : Clients
      );
    } else {
      const filtered = (
        currentModule === "commercial" ? commercialClients : Clients
      ).filter((client) => client.client_name === selectedName);

      setClientList(filtered);
    }
  };

  const handelShareEmailModalClose = () => {
    setShowShareDialog(false);
    setIsClicked(false);
    setemail("");
    setShareDetails({ matterNumber: "", reshareEmail: "" });
  };

  const getPageTitle = () => {
    if (currentModule === "commercial") return "View Projects";
    if (currentModule === "print media") return "View Orders";
    return "View Clients";
  };

  const getCreateButtonLabel = () => {
    if (currentModule === "commercial") return "Create Project";
    if (currentModule === "print media") return "Create Order";
    return "Create Client";
  };

  const handleCreateButtonClick = () => {
    if (currentModule === "commercial") {
      setCreateProject(true);
    } else if (currentModule === "print media") {
      setcreateuser(true);
    } else {
      setcreateuser(true);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    localStorage.setItem("viewClientsDateFilter", JSON.stringify(dateFilter));
  }, [dateFilter]);

  const shouldShowOutstandingTasks = () => {
    return currentModule === "commercial" || currentModule === "conveyancing";
  };

  const shouldShowCreateOrder = () => {
    return currentModule === "print media";
  };

  const isLoading =
    currentModule === "commercial" ? commercialLoading : loading;

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
      <div className="relative z-10">
        <>
          <OutstandingTasksModal
            open={showOutstandingTask}
            onClose={() => {
              setShowOutstandingTask(false);
              setOTActiveMatterNumber(null);
            }}
            activeMatter={otActiveMatterNumber}
          />
          <CreateClientModal
            createType={currentModule === "commercial" ? "project" : "client"}
            companyName={currentModule}
            isOpen={createuser || createProject}
            setIsOpen={() => {
              setcreateuser(false);
              setCreateProject(false);
            }}
            onClose={() => setcreateuser(false)}
          />
          <CreateClientModal
            createType="order"
            companyName={currentModule}
            isOpen={createOrder}
            onClose={reloadPage}
            setIsOpen={() => setcreateOrder(false)}
          />

          <DateRangeModal
            isOpen={showDateRange}
            setIsOpen={() => setShowDateRange(false)}
            subTitle={`Select the date range to filter ${
              currentModule === "commercial" ? "projects" : "clients"
            }.`}
            handelSubmitFun={(fromDate, toDate, dateType) => {
              setDateFilter({ type: dateType, range: [fromDate, toDate] });
              setShowDateRange(false);
            }}
            onReset={() => {
              setDateFilter({ type: "", range: ["", ""] });
              setShowDateRange(false);
            }}
          />

          <Dialog
            open={showShareDialog}
            onClose={handelShareEmailModalClose}
            className="relative z-[1000]"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
            <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative">
                <button
                  onClick={handelShareEmailModalClose}
                  className="absolute top-4 right-4 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
                >
                  &times;
                </button>
                <h2 className="text-xl font-semibold mb-2 text-center">
                  Share to Client
                </h2>
                <p className="text-sm text-center text-gray-700 mb-4">
                  Please enter the client email for{" "}
                  {currentModule === "commercial" ? "project" : "matter"} No. :{" "}
                  <span className="text-blue-500 underline cursor-pointer">
                    {shareDetails?.matterNumber}
                  </span>
                </p>
                <div className="relative mb-4">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setemail(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                    </svg>
                  </span>
                </div>
                {isClicked ? (
                  <button className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md transition mb-3">
                    Sending...
                  </button>
                ) : (
                  <button
                    className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition mb-3"
                    onClick={handelReShareEmail}
                  >
                    Send Link
                  </button>
                )}
                <button className="w-full bg-[#EAF7FF] text-gray-700 font-medium py-2 rounded-md hover:bg-[#d1efff] transition">
                  Manage Access
                </button>
              </DialogPanel>
            </div>
          </Dialog>

          <Dialog
            open={showTAR}
            onClose={() => setShowTar(false)}
            className="relative z-[1000]"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
            <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative">
                <DialogTitle className={"text-xl mb-5 font-bold"}>
                  Task Allocation Report
                </DialogTitle>
                <div className="flex items-center gap-2 mb-5">
                  <label
                    htmlFor="items-per-page"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select by Users
                  </label>
                  <select
                    name="alloactedUser"
                    className="block w-full py-2 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={allocatedUser}
                    onChange={(e) => setallocatedUser(e.target.value)}
                  >
                    <option value="">All Users</option>
                    {user.map((user) => (
                      <option value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition mb-3"
                  onClick={() => {
                    generateTaskAllocationPDF(allocatedUser);
                    setShowTar(false);
                  }}
                >
                  Download
                </button>
              </DialogPanel>
            </div>
          </Dialog>

          <div className="space-y-4 p-2">
            <Header />

            {/* <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 p-5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
            <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
              {getPageTitle()}
            </span>
          </h1> */}

            <div className="flex flex-col gap-3 p-5">
              <div className="max-w-3xl">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    {getPageTitle()}
                  </span>
                </h1>
                {/* Dynamic subtitle similar to Manage Users */}
                <p
                  className="text-gray-600 text-sm sm:text-base mt-1
                    line-clamp-2 lg:line-clamp-1 wrap-break-word"
                >
                  {currentModule === "commercial"
                    ? "Manage projects, tasks and related client details"
                    : currentModule === "print media"
                    ? "Manage orders, deliveries and client records"
                    : "Manage clients, matters and client details"}
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center justify-between gap-4">
                {/* Search input is now only in Header.jsx */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="items-per-page"
                    className="text-sm font-medium text-gray-700"
                  >
                    {currentModule === "commercial" ? "Projects" : "Clients"}{" "}
                    per page:
                  </label>
                  <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="block w-full py-2 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                  </select>
                </div>
                {currentModule === "print media" && (
                  <div className="flex items-center gap-2">
                    {/* <label
                htmlFor="items-per-page"
                className="text-sm font-medium text-gray-700"
              >
                Select by clients
              </label> */}
                    <select
                      name="Client"
                      className="block w-full py-2 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs lg:text-sm xl:text-base text-black"
                      value={selectedClientName}
                      onChange={(e) => handleClientFilterChange(e.target.value)}
                      disabled={localStorage.getItem("role") !== "admin"}
                    >
                      <option value="">All Clients</option>
                      {list.map((client, index) => (
                        <option
                          key={
                            client._id || client.id || `${client.name}-${index}`
                          }
                          value={client.name}
                        >
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Consolidated Desktop Buttons */}
                <div className="hidden lg:flex items-center gap-1.5">
                  {(currentModule === "conveyancing" ||
                    currentModule === "wills" ||
                    currentModule === "commercial") && (
                    <>
                      {/* <Button
                    label="Create Client"
                    Icon1={user}
                    onClick={() => setcreateuser(true)}
                    width="w-[150px]"
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  /> */}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          currentModule === "commercial"
                            ? setCreateProject(true)
                            : setcreateuser(true)
                        }
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <UserPlus className="w-3 h-3 sm:w-5 sm:h-5" />
                        {currentModule === "commercial"
                          ? "Create Project"
                          : "Create Client"}
                      </motion.button>

                      {/* <Button
                    label="Outstanding Tasks"
                    onClick={() => setShowOutstandingTask(true)}
                    width="w-[150px]"
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  /> */}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        label="Outstanding Tasks"
                        onClick={() => setShowOutstandingTask(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <Clipboard className="w-3 h-3 sm:w-5 sm:h-5" />
                        Outstanding Tasks
                      </motion.button>

                      {/* <Button
                  
                    label="Select Date Range"
                    onClick={() => setShowDateRange(true)}
                    width="w-[150px]"
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  /> */}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        label="Select Date Range"
                        onClick={() => setShowDateRange(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <FilterIcon className="w-3 h-3 sm:w-5 sm:h-5" />
                        Date Range
                      </motion.button>
                    </>
                  )}
                  {currentModule === "print media" && (
                    <>
                      {/* <Button
                    label="Create Client"
                    Icon1={userplus}
                    onClick={() => setcreateuser(true)}
                    width="w-[150px]"
                  />
                  <Button
                    label="Create Order"
                    onClick={() => setcreateOrder(true)}
                    width="w-[150px]"
                  />
                  <Button
                    label="Select Date Range"
                    onClick={() => setShowDateRange(true)}
                    width="w-[150px]"
                  /> */}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setcreateuser(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <UserPlus className="w-3 h-3 sm:w-5 sm:h-5" />
                        Create Client
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setcreateOrder(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <FolderPlus className="w-3 h-3 sm:w-5 sm:h-5" />
                        Create Order
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        label="Select Date Range"
                        onClick={() => setShowDateRange(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <FilterIcon className="w-3 h-3 sm:w-5 sm:h-5" />
                        Date Range
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTar(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                      >
                        <SheetIcon className="w-3 h-3 sm:w-5 sm:h-5" />
                        Task Report
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Mobile Menu */}
                <div className="flex lg:hidden items-center gap-2">
                  <Menu as="div" className="relative">
                    <Menu.Button className="h-[40px] w-[40px] flex items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      <EllipsisVerticalIcon
                        className="h-5 w-5 text-gray-600"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {/* Create Client/Project option */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => setcreateuser(true)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition rounded-md w-full"
                              >
                                {getCreateButtonLabel()}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => setShowOutstandingTask(true)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition rounded-md w-full"
                              >
                                Outstanding Tasks
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => setShowDateRange(true)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition rounded-md w-full"
                              >
                                Select Date Range
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            {/* {error && (
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => console.log("")}
            title="Session Expired!"
            isLogout={true}
          >
            Please Login Again
          </ConfirmationModal>
        )} */}

            {isLoading || !clientList ? (
              <Loader />
            ) : clientList.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                {currentModule === "commercial"
                  ? "No projects found"
                  : "No clients found"}
              </div>
            ) : (
              <div className="px-5">
                <ViewClientsTable
                  data={clientList}
                  columns={columns}
                  users={user}
                  handleChangeUser={changeUser}
                  onEdit={true}
                  onShare={(matterNumber, reshareEmail) => {
                    setShareDetails({ matterNumber, reshareEmail });
                    setShowShareDialog(true);
                  }}
                  itemsPerPage={itemsPerPage}
                  status={true}
                  ot={shouldShowOutstandingTasks()}
                  handelOTOpen={() => setShowOutstandingTask(true)}
                  handelOT={setOTActiveMatterNumber}
                  currentModule={currentModule}
                />
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
};

export default ViewClients;
