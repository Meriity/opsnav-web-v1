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
import { useClientStore } from "../ClientStore/clientstore.js";
import { useSearchStore } from "../SearchStore/searchStore.js";

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
  const [settlementDate, setSettlementDate] = useState(["", ""]);
  const [showDateRange, setShowDateRange] = useState(false);
  const { clients: Clients, fetchClients, loading, error } = useClientStore();
  const { searchQuery } = useSearchStore();
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [commercialLoading, setCommercialLoading] = useState(false);
  const [commercialClients, setCommercialClients] = useState([]);

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

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
    let filteredData =
      currentModule === "commercial" ? commercialClients : Clients;

    // Apply date range filter first
    const [startDate, endDate] = settlementDate;
    if (startDate && endDate) {
      filteredData = filteredData.filter((client) => {
        let clientDate;
        if (currentModule === "commercial") {
          clientDate = moment(client.settlement_date || client.settlementDate);
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

    // Apply search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter((client) => {
        // For commercial projects
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
          ];

          return searchableFields.some(
            (field) =>
              field && String(field).toLowerCase().includes(lowercasedQuery)
          );
        } else {
          // For regular clients
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

    setClientList(filteredData);
  }, [settlementDate, Clients, commercialClients, searchQuery, currentModule]);

  console.log(clientList);
  let columns = [];
  if (localStorage.getItem("company") === "vkl") {
    if (currentModule === "commercial") {
      // Commercial projects columns
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
    } else {
      // Regular VKL clients
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
  } else if (localStorage.getItem("company") === "idg") {
    columns = [
      { key: "clientId", title: "Client ID", width: "8%" },
      { key: "orderId", title: "Order ID", width: "10%" },
      { key: "client_name", title: "Client Name", width: "9%" },
      { key: "client_type", title: "Order Type", width: "12%" },
      { key: "allocatedUser", title: "Allocated User", width: "10%" },
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

  const shouldShowOutstandingTasks = () => {
    return currentModule === "commercial" || company === "vkl";
  };

  const shouldShowCreateOrder = () => {
    return company === "idg";
  };

  const isLoading =
    currentModule === "commercial" ? commercialLoading : loading;

  return (
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
        companyName={company}
        isOpen={createuser || createProject}
        setIsOpen={() => {
          setcreateuser(false);
          setCreateProject(false);
        }}
      />
      <CreateClientModal
        createType="order"
        companyName={company}
        isOpen={createOrder}
        setIsOpen={() => setcreateOrder(false)}
      />
      <DateRangeModal
        isOpen={showDateRange}
        setIsOpen={() => setShowDateRange(false)}
        subTitle={`Select the date range to filter ${
          currentModule === "commercial" ? "projects" : "clients"
        }.`}
        handelSubmitFun={(fromDate, toDate) => {
          setSettlementDate([fromDate, toDate]);
          setShowDateRange(false);
        }}
        onReset={() => setSettlementDate(["", ""])}
      />

      <Dialog
        open={showShareDialog}
        onClose={handelShareEmailModalClose}
        className="relative z-50"
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

      <div className="space-y-4 p-2">
        <Header />

        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 p-5">
          <h3 className="text-2xl lg:text-2xl font-semibold shrink-0">
            {getPageTitle()}
          </h3>
          <div className="flex w-full flex-wrap items-center justify-between md:w-auto md:justify-end gap-4">
            {/* Search input is now only in Header.jsx */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="items-per-page"
                className="text-sm font-medium text-gray-700"
              >
                {currentModule === "commercial" ? "Projects" : "Clients"} per
                page:
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

            {/* Consolidated Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {localStorage.getItem("company") === "vkl" && (
                <>
                  <Button
                    label="Create Client"
                    Icon1={userplus}
                    onClick={() => setcreateuser(true)}
                    width="w-[150px]"
                  />
                  <Button
                    label="Outstanding Tasks"
                    onClick={() => setShowOutstandingTask(true)}
                    width="w-[150px]"
                  />
                  <Button
                    label="Select Date Range"
                    onClick={() => setShowDateRange(true)}
                    width="w-[150px]"
                  />
                </>
              )}
              {localStorage.getItem("company") === "idg" && (
                <>
                  <Button
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
                  />
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
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              active
                                ? "bg-sky-50 text-sky-700"
                                : "text-gray-700"
                            }`}
                          >
                            {getCreateButtonLabel()}
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowOutstandingTask(true)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              active
                                ? "bg-sky-50 text-sky-700"
                                : "text-gray-700"
                            }`}
                          >
                            Outstanding Tasks
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowDateRange(true)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              active
                                ? "bg-sky-50 text-sky-700"
                                : "text-gray-700"
                            }`}
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

        {error && (
          <div
            className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

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
  );
};

export default ViewClients;
