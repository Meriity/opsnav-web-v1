import {
  Dialog,
  Menu,
  Transition,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Button from "../../components/ui/Button";
import userplus from "../../icons/Button icons/Group 313 (1).png";
import ViewClientsTable from "../../components/ui/ViewClientsTable";
import { useState, Fragment, useMemo, useCallback, useEffect } from "react";
import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import Header from "../../components/layout/Header";
import { toast } from "react-toastify";
import OutstandingTasksModal from "../../components/ui/OutstandingTasksModal";
import Loader from "../../components/ui/Loader";
import CreateClientModal from "../../components/ui/CreateClientModal";
import DateRangeModal from "../../components/ui/DateRangeModal";
import moment from "moment";
import { useSearchStore } from "../SearchStore/searchStore.js";
import { useQuery, useMutation } from "@tanstack/react-query";

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
  const [otActiveMatterNumber, setOTActiveMatterNumber] = useState(null);
  const [settlementDate, setSettlementDate] = useState(["", ""]);
  const [showDateRange, setShowDateRange] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const [showTAR, setShowTar] = useState(false);
  const [allocatedUser, setallocatedUser] = useState("");
  const [user, setUser] = useState([]);

  const { searchQuery } = useSearchStore();
  const currentModule = localStorage.getItem("currentModule");

  useEffect(() => {
    try {
      const reloadFlag = sessionStorage.getItem("opsnav_clients_should_reload");
      if (reloadFlag === "1") {
        // clear the flag so we don't loop
        sessionStorage.removeItem("opsnav_clients_should_reload");
        // hard reload once so the server / list is absolutely fresh
        window.location.reload();
      }
    } catch (e) {
      // ignore any storage errors and continue regular mount
      console.warn("Reload flag check failed", e);
    }
    // run only once on mount
  }, []);

  const company = localStorage.getItem("company");

  const api = useMemo(() => {
    if (currentModule === "commercial") {
      return new CommercialAPI();
    } else {
      return new ClientAPI();
    }
  }, [currentModule]);

  const { mutate: handelReShareEmail, isPending: isSendingEmail } = useMutation(
    {
      mutationFn: () =>
        api.resendLinkToClient(email, shareDetails?.matterNumber),
      onSuccess: () => {
        toast.success("Email sent successfully.");
        handelShareEmailModalClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send email.");
        handelShareEmailModalClose();
      },
    }
  );

  const fetchCommercialProjects = useCallback(async () => {
    const response = await api.getActiveProjects();

    let data =
      response?.data ||
      response?.clients ||
      response?.projects ||
      response ||
      [];
    if (!Array.isArray(data)) data = [];

    return data.map((client) => ({
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
      ...client,
    }));
  }, [api]);

  const fetchVKLClients = useCallback(async () => {
    const response = await api.getClients();

    let data = response?.data || response?.clients || response || [];
    if (!Array.isArray(data)) data = [];

    return data.map((client) => ({
      id: client.id || client.matterNumber || client._id,
      matternumber: client.matterNumber || client.id || client._id,
      client_name: client.clientName || client.client_name,
      businessAddress: client.businessAddress || client.business_address,
      property_address: client.propertyAddress || client.property_address,
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
      ...client,
    }));
  }, [api]);

  const fetchIDGOrders = useCallback(async () => {
    const response = await api.getIDGOrders();

    let data =
      response?.data || response?.orders || response?.clients || response || [];
    if (!Array.isArray(data)) data = [];

    return data.map((client) => ({
      id: client.id || client.orderId || client.clientId || client._id,
      clientId: client.clientId || client.id,
      orderId: client.orderId || client.id,
      client_name: client.clientName || client.client_name,
      client_type: client.orderType || client.client_type,
      allocatedUser: client.allocatedUser || client.allocated_user,
      order_date: client.orderDate || client.order_date,
      delivery_date: client.deliveryDate || client.delivery_date,
      orderDetails: client.orderDetails || client.order_details,
      billing_address: client.billingAddress || client.billing_address,
      postcode: client.postcode || "",
      status: client.status || "active",
      ...client,
    }));
  }, [api]);

  const {
    data: clientData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clients", currentModule, company],
    queryFn: async () => {
      if (currentModule === "commercial") {
        return await fetchCommercialProjects();
      } else if (company === "idg") {
        return await fetchIDGOrders();
      } else {
        return await fetchVKLClients();
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const activeData = clientData || [];

  const clientList = useMemo(() => {
    if (!activeData.length) return [];

    let filteredData = [...activeData];
    const [startDate, endDate] = settlementDate;
    if (startDate && endDate) {
      const startMoment = moment(startDate);
      const endMoment = moment(endDate);

      filteredData = filteredData.filter((client) => {
        let clientDate;
        if (currentModule === "commercial") {
          clientDate = moment(client.settlement_date || client.settlementDate);
        } else if (company === "idg") {
          clientDate = moment(client.delivery_date || client.order_date);
        } else {
          clientDate = moment(client.settlement_date);
        }
        return clientDate.isBetween(startMoment, endMoment, "day", "[]");
      });
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const lowercasedQuery = searchQuery.toLowerCase().trim();

      filteredData = filteredData.filter((client) => {
        const searchableFields = [];

        if (currentModule === "commercial") {
          searchableFields.push(
            client.matterNumber,
            client.clientName,
            client.businessName,
            client.businessAddress,
            client.state,
            client.clientType,
            client.dataEntryBy,
            client.postcode
          );
        } else if (company === "idg") {
          searchableFields.push(
            client.clientId,
            client.orderId,
            client.client_name,
            client.client_type,
            client.allocatedUser,
            client.orderDetails,
            client.billing_address,
            client.postcode
          );
        } else {
          searchableFields.push(
            client.client_name || client.clientName,
            client.matternumber || client.matterNumber || client.orderId,
            client.businessAddress || client.business_address,
            client.property_address || client.propertyAddress,
            client.state,
            client.referral || client.referralName
          );
        }

        return searchableFields.some(
          (field) =>
            field && String(field).toLowerCase().includes(lowercasedQuery)
        );
      });
    }

    return filteredData;
  }, [settlementDate, activeData, searchQuery, currentModule, company]);

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

  const handelShareEmailModalClose = () => {
    setShowShareDialog(false);
    setemail("");
    setShareDetails({ matterNumber: "", reshareEmail: "" });
  };

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
      { key: "allocatedUser", title: "Allocated User", width: "10%" },
      { key: "order_date", title: "Order Date", width: "12%" },
      { key: "delivery_date", title: "Delivery Date", width: "12%" },
      { key: "orderDetails", title: "Order Details", width: "10%" },
      { key: "billing_address", title: "Delivery Address", width: "10%" },
      { key: "postcode", title: "Post Code", width: "6.5%" },
    ];
  }

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
          currentModule === "commercial"
            ? "projects"
            : company === "idg"
            ? "orders"
            : "clients"
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
              {currentModule === "commercial"
                ? "project"
                : company === "idg"
                ? "order"
                : "matter"}{" "}
              No. :{" "}
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
            <button
              className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md transition mb-3 disabled:opacity-50"
              onClick={handelReShareEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? "Sending..." : "Send Link"}
            </button>
            <button className="w-full bg-[#EAF7FF] text-gray-700 font-medium py-2 rounded-md hover:bg-[#d1efff] transition">
              Manage Access
            </button>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog
        open={showTAR}
        onClose={() => setShowTar(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative">
            <DialogTitle className={"text-xl mb-5"}>
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
                  <option key={user.name} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="w-full bg-[rgb(0,174,239)] text-white font-semibold py-2 rounded-md hover:bg-sky-600 active:bg-sky-700 transition mb-3"
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

        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 p-5">
          <h3 className="text-2xl lg:text-2xl font-semibold shrink-0">
            {getPageTitle()}
          </h3>
          <div className="flex w-full flex-wrap items-center justify-between md:w-auto md:justify-end gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="items-per-page"
                className="text-sm font-medium text-gray-700"
              >
                {currentModule === "commercial"
                  ? "Projects"
                  : company === "idg"
                  ? "Orders"
                  : "Clients"}{" "}
                per page:
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="block w-full py-2 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {company === "vkl" && (
                <>
                  <Button
                    label={getCreateButtonLabel()}
                    Icon1={userplus}
                    onClick={handleCreateButtonClick}
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
              {company === "idg" && (
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
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleCreateButtonClick}
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
                      {shouldShowCreateOrder() && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setcreateOrder(true)}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                active
                                  ? "bg-sky-50 text-sky-700"
                                  : "text-gray-700"
                              }`}
                            >
                              Create Order
                            </button>
                          )}
                        </Menu.Item>
                      )}
                      {shouldShowOutstandingTasks() && (
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
                      )}
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
            <p>{error.message || "Error loading data"}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <Loader />
          </div>
        ) : !clientList || clientList.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            {currentModule === "commercial"
              ? "No projects found"
              : company === "idg"
              ? "No orders found"
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
