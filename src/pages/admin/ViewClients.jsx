import {
  Dialog,
  Menu,
  Transition,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Button from "../../components/ui/Button";
import userplus from "../../icons/Button icons/Group 313 (1).png";
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
import { motion } from "framer-motion";
import { Users, Plus, Calendar, AlertCircle } from "lucide-react";

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
    return saved
      ? JSON.parse(saved)
      : { type: "delivery_date", range: ["", ""] };
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
  const company = localStorage.getItem("company");

  const api = useMemo(() => {
    if (currentModule === "commercial") {
      return new CommercialAPI();
    } else {
      return new ClientAPI();
    }
  }, [currentModule]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentModule === "commercial") {
        setCommercialLoading(true);
        try {
          const response = await api.getActiveProjects();

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
    console.log(user);
    let filteredData =
      currentModule === "commercial" ? commercialClients : Clients || [];

    const [startDate, endDate] = Array.isArray(dateFilter?.range)
      ? dateFilter.range
      : ["", ""];

    if (company?.toLowerCase() === "idg" && startDate && endDate) {
      filteredData = filteredData.filter((client) => {
        let deliveryDateObj = moment(client.delivery_date);
        let orderDateObj = moment(client.order_date || client.orderDate);

        const inDeliveryRange =
          deliveryDateObj.isValid() &&
          deliveryDateObj.isBetween(
            moment(startDate),
            moment(endDate),
            "day",
            "[]"
          );

        const inOrderRange =
          orderDateObj.isValid() &&
          orderDateObj.isBetween(
            moment(startDate),
            moment(endDate),
            "day",
            "[]"
          );

        if (dateFilter.type === "delivery_date") {
          return inDeliveryRange;
        } else if (dateFilter.type === "order_date") {
          return inOrderRange;
        } else if (dateFilter.type === "both_date") {
          return inDeliveryRange && inOrderRange;
        }

        return;
      });
    } else {
      if (startDate && endDate) {
        filteredData = filteredData.filter((client) => {
          let clientDate;
          if (currentModule === "commercial") {
            clientDate = moment(
              client.settlement_date || client.settlementDate
            );
          } else {
            clientDate = moment(client.settlement_date);
          }
          return clientDate.isBetween(
            moment(startDate),
            moment(endDate),
            "day",
            "[]"
          );
        });
      }
    }

    // Search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter((client) => {
        if (currentModule === "commercial") {
          const searchableFields = [
            client.matterNumber,
            client.clientName,
            client.businessName,
            client.businessAddress,
            client.state,
            client.clientType,
            client.dataEntryBy,
            client.postcode,
            client.referral,
          ];

          return searchableFields.some(
            (field) =>
              field && String(field).toLowerCase().includes(lowercasedQuery)
          );
        } else {
          const searchableFields = [
            client.client_name || client.clientName,
            client.matternumber || client.matterNumber || client.orderId,
            client.businessAddress || client.business_address,
            client.property_address || client.propertyAddress,
            client.state,
            client.referral || client.referralName,
          ];

          return searchableFields.some(
            (field) =>
              field && String(field).toLowerCase().includes(lowercasedQuery)
          );
        }
      });
    }

    filteredData = [...filteredData].reverse();
    setClientList(filteredData);
  }, [
    dateFilter,
    Clients,
    commercialClients,
    searchQuery,
    currentModule,
    company,
  ]);

  let columns = [];
  if (company === "vkl") {
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
      ];
    } else {
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
    }
  } else if (company === "idg") {
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

  async function changeUser(userName, orderId) {
    try {
      const res = api.changeUser(userName, orderId);
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
    if (company === "idg") return "View Orders";
    return "View Clients";
  };

  const getCreateButtonLabel = () => {
    if (currentModule === "commercial") return "Create Project";
    if (company === "idg") return "Create Client";
    return "Create Client";
  };

  const handleCreateButtonClick = () => {
    if (currentModule === "commercial") {
      setCreateProject(true);
    } else if (company === "idg") {
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
    return currentModule === "commercial" || company === "vkl";
  };

  const shouldShowCreateOrder = () => {
    return company === "idg";
  };

  const isLoading =
    currentModule === "commercial" ? commercialLoading : loading;


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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

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

      <div className="relative z-10">
        <Header />

        <main className="p-3 sm:p-4 md:p-6 mx-2 sm:mx-3 md:mx-4 lg:mx-6 xl:mx-8 2xl:mx-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    {getPageTitle()}
                  </span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-2 truncate">
                  Manage and track all{" "}
                  {currentModule === "commercial"
                    ? "projects"
                    : company === "idg"
                    ? "orders"
                    : "clients"}{" "}
                  in one place
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateButtonClick}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">
                    {getCreateButtonLabel()}
                  </span>
                  <span className="xs:hidden">Add New</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl mb-6 w-full"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    All{" "}
                    {currentModule === "commercial"
                      ? "Projects"
                      : company === "idg"
                      ? "Orders"
                      : "Clients"}
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="items-per-page"
                      className="text-sm font-medium text-gray-700"
                    >
                      Show:
                    </label>
                    <select
                      id="items-per-page"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="block px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all text-sm"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                    </select>
                  </div>

                  <div className="hidden lg:flex items-center gap-2">
                    {company === "vkl" && (
                      <>
                        {shouldShowOutstandingTasks() && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowOutstandingTask(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Outstanding Tasks
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowDateRange(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                        >
                          <Calendar className="w-4 h-4" />
                          Date Range
                        </motion.button>
                      </>
                    )}
                    {company === "idg" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setcreateOrder(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Create Order
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowDateRange(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                        >
                          <Calendar className="w-4 h-4" />
                          Date Range
                        </motion.button>
                      </>
                    )}
                  </div>

                  <div className="flex lg:hidden items-center">
                    <Menu as="div" className="relative">
                      <Menu.Button className="h-10 w-10 flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {shouldShowOutstandingTasks() && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => setShowOutstandingTask(true)}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4" />
                                      Outstanding Tasks
                                    </div>
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            {shouldShowCreateOrder() && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => setcreateOrder(true)}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                      active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Plus className="w-4 h-4" />
                                      Create Order
                                    </div>
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setShowDateRange(true)}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date Range
                                  </div>
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
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 w-full"
          >
            {error && (
              <div
                className="p-4 m-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-r-lg"
                role="alert"
              >
                <p className="font-medium">Error loading data</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}

            {isLoading || !clientList ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : clientList.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No{" "}
                  {currentModule === "commercial"
                    ? "projects"
                    : company === "idg"
                    ? "orders"
                    : "clients"}{" "}
                  found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchQuery || (dateFilter.range && dateFilter.range[0])
                    ? "Try adjusting your search or filter criteria"
                    : `Get started by creating your first ${
                        currentModule === "commercial"
                          ? "project"
                          : company === "idg"
                          ? "order"
                          : "client"
                      }`}
                </p>
                {!searchQuery && !(dateFilter.range && dateFilter.range[0]) && (
                  <button
                    onClick={handleCreateButtonClick}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create{" "}
                    {currentModule === "commercial"
                      ? "Project"
                      : company === "idg"
                      ? "Order"
                      : "Client"}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-6">
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
          </motion.div>
        </main>
      </div>

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
        companyName={company}
        isOpen={createuser || createProject}
        setIsOpen={() => {
          setcreateuser(false);
          setCreateProject(false);
        }}
        onClose={() => setcreateuser(false)}
      />

      <CreateClientModal
        createType="order"
        companyName={company}
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
          setDateFilter({ type: "settlement_date", range: ["", ""] });
          setShowDateRange(false);
        }}
      />

      <Dialog
        open={showShareDialog}
        onClose={handelShareEmailModalClose}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={handelShareEmailModalClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  &times;
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Share to Client
                    </h2>
                    <p className="text-sm text-gray-600">
                      Send access link to client
                    </p>
                  </div>
                </div>
                <div className="mb-4 p-3 bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {currentModule === "commercial"
                      ? "Project"
                      : company === "idg"
                      ? "Order"
                      : "Matter"}{" "}
                    No:{" "}
                    <span className="font-semibold text-[#2E3D99]">
                      {shareDetails?.matterNumber}
                    </span>
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {isClicked ? (
                  <button className="w-full bg-[#00AEEF] text-white font-semibold py-3 rounded-lg transition mb-3">
                    Sending...
                  </button>
                ) : (
                  <button
                    className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handelReShareEmail}
                  >
                    Send Access Link
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ViewClients;
