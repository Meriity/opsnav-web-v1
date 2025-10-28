import { useEffect, useState, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Header from "../../components/layout/Header";
import * as XLSX from "xlsx-js-style";
import moment from "moment";
import DateRangeModal from "../../components/ui/DateRangeModal";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";
import Loader from "../../components/ui/Loader";
import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import { useArchivedClientStore } from "../ArchivedClientStore/UseArchivedClientStore.js";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

function ClientsPerPage({ value, onChange }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>Show</span>
      <select
        id="clients-per-page"
        value={value}
        onChange={onChange}
        className="block px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option>5</option>
        <option>10</option>
        <option>20</option>
        <option>50</option>
        <option>100</option>
        <option>200</option>
        <option>500</option>
      </select>
      <span>entries</span>
    </div>
  );
}

export default function ArchivedClients() {
  const navigate = useNavigate();
  const { archivedClients, loading, isFetched, fetchArchivedClients } =
    useArchivedClientStore();
  const { searchQuery } = useSearchStore();

  // Modals
  const [openExcel, setOpenExcel] = useState(false);
  const [showSettlementDateModal, setShowSettlementDateModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [clientList, setClientList] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [clientsPerPage, setClientsPerPage] = useState(100);
  const [commercialLoading, setCommercialLoading] = useState(false);

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  const api = useMemo(() => {
    if (currentModule === "commercial") {
      return new CommercialAPI();
    } else {
      return new ClientAPI();
    }
  }, [currentModule]);

  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (!isFetched && currentModule !== "commercial") {
      fetchArchivedClients();
    }
  }, [isFetched, fetchArchivedClients, currentModule]);

  // Fetch commercial archived clients if in commercial module
  useEffect(() => {
    const fetchCommercialArchivedClients = async () => {
      if (currentModule === "commercial") {
        setCommercialLoading(true);
        try {
          const response = await api.getArchivedProjects();
          console.log("Commercial archived projects response:", response);

          // Handle different response structures
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
            console.warn("Unexpected response format:", response);
            toast.error("Unexpected data format received");
            return;
          }

          // Transform the data to match the expected format
          const transformedData = data.map((client) => ({
            ...client,
            id: client.id || client.matterNumber || client.orderId,
            matternumber: client.matterNumber || client.id || client.orderId,
            client_name: client.clientName || client.client_name,
            property_address: client.propertyAddress || client.property_address,
            matter_date: client.matterDate || client.matter_date,
            settlement_date: client.settlementDate || client.settlement_date,
            state: client.state || "",
            clientType: client.clientType || client.type,
            status: client.status || "archived",
          }));

          setClientList(transformedData);
        } catch (error) {
          console.error("Error fetching commercial archived clients:", error);
          toast.error("Failed to load archived projects");
        } finally {
          setCommercialLoading(false);
        }
      }
    };

    if (currentModule === "commercial") {
      fetchCommercialArchivedClients();
    }
  }, [currentModule, api]);

  // Apply date & search filters to list
  useEffect(() => {
    let filteredData =
      currentModule === "commercial" ? clientList : archivedClients;

    if (fromDate && toDate) {
      filteredData = filteredData.filter((client) => {
        let clientDate;
        if (currentModule === "commercial") {
          clientDate = moment(
            new Date(client?.settlement_date || client?.settlementDate)
          );
        } else {
          clientDate = moment(new Date(client?.settlement_date));
        }
        return clientDate.isBetween(fromDate, toDate, "day", "[]");
      });
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (client) =>
          String(client.matternumber || client.matterNumber || client.orderId)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(client.client_name || client.clientName)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(client.property_address || client.propertyAddress)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(client.state).toLowerCase().includes(lowercasedQuery) ||
          String(client.referral || client.referralName)
            .toLowerCase()
            .includes(lowercasedQuery)
      );
    }

    if (currentModule !== "commercial") {
      setClientList(filteredData);
    }
  }, [
    archivedClients,
    clientList,
    fromDate,
    toDate,
    searchQuery,
    currentModule,
  ]);

  const getColumns = () => {
    if (currentModule === "commercial") {
      return [
        { key: "matternumber", title: "Project Number" },
        { key: "client_name", title: "Client Name" },
        { key: "property_address", title: "Property Address" },
        { key: "state", title: "State" },
        { key: "clientType", title: "Client Type" },
        { key: "matter_date", title: "Project Date" },
        { key: "settlement_date", title: "Completion Date" },
        { key: "status", title: "Status" },
      ];
    } else if (company === "vkl") {
      return [
        { key: "matternumber", title: "Matter Number" },
        { key: "client_name", title: "Client Name" },
        { key: "property_address", title: "Property Address" },
        { key: "state", title: "State" },
        { key: "type", title: "Client Type" },
        { key: "matter_date", title: "Matter Date" },
        { key: "settlement_date", title: "Settlement Date" },
        { key: "status", title: "Status" },
      ];
    } else if (company === "idg") {
      return [
        { key: "orderId", title: "Order ID" },
        { key: "clientName", title: "Client Name" },
        { key: "propertyAddress", title: "Billing Address" },
        { key: "state", title: "State" },
        { key: "ordertype", title: "Client Type" },
        { key: "orderDate", title: "Order Date" },
        { key: "deliveryDate", title: "Delivery Date" },
        { key: "status", title: "Status" },
      ];
    }
    return [];
  };

  const columns = getColumns();

  const handleSort = (columnKey) => {
    const isAsc = sortedColumn === columnKey && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortedColumn(columnKey);
  };

  const sortedClientList = useMemo(() => {
    let sortableItems = [...clientList];
    if (sortedColumn !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortedColumn];
        const bVal = b[sortedColumn];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === "asc" ? -1 : 1;
        if (bVal == null) return sortDirection === "asc" ? 1 : -1;

        // Sort DD-MM-YYYY correctly
        if (
          sortedColumn === "matter_date" ||
          sortedColumn === "settlement_date" ||
          sortedColumn === "orderDate" ||
          sortedColumn === "deliveryDate"
        ) {
          const dateA = moment(aVal, "DD-MM-YYYY");
          const dateB = moment(bVal, "DD-MM-YYYY");
          if (dateA.isBefore(dateB)) return sortDirection === "asc" ? -1 : 1;
          if (dateA.isAfter(dateB)) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [clientList, sortedColumn, sortDirection]);

  // ----- Export helpers -----
  async function handleExcelExport(withFrom, withTo) {
    setIsExporting(true);
    if (!withFrom || !withTo) {
      toast.error("Please select a valid date range");
      setIsExporting(false);
      return;
    }
    try {
      const from = moment(withFrom).format("YYYY-MM-DD");
      const to = moment(withTo).format("YYYY-MM-DD");

      let data;
      if (currentModule === "commercial") {
        // For commercial, we'll filter the existing data since we don't have a specific endpoint
        data = clientList.filter((client) => {
          const clientDate = moment(
            new Date(client.settlement_date || client.settlementDate)
          );
          return clientDate.isBetween(withFrom, withTo, "day", "[]");
        });
      } else {
        const res = await api.getArchivedClientsDate(from, to);
        data = res.data || [];
      }

      if (!data || data.length === 0) {
        toast.info("No data available for the selected date range");
      } else {
        convertToExcel(data);
      }
    } catch (e) {
      console.error("Export error:", e);
      toast.error(e.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  const convertToExcel = (data) => {
    if (!data || data.length === 0) {
      toast.info("No data to export");
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const rows = data.map((obj) => headers.map((key) => obj[key]));
      const allData = [headers, ...rows];
      downloadExcel(allData);
    } catch (error) {
      console.error("Excel conversion error:", error);
      toast.error("Failed to convert data to Excel format");
    }
  };

  const downloadExcel = (data) => {
    try {
      const ws = XLSX.utils.aoa_to_sheet(data);

      // column widths
      ws["!cols"] = data[0].map((_, i) => {
        const maxLength = data.reduce(
          (max, row) => Math.max(max, row[i] ? String(row[i]).length : 0),
          10
        );
        return { wch: maxLength + 4 };
      });

      // row heights
      ws["!rows"] = data.map((row, i) => ({ hpt: i === 0 ? 40 : 20 }));

      // header styles
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "000000" } },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
            fill: { patternType: "solid", fgColor: { rgb: "CCD9CF" } },
          };
        }
      }

      const wb = XLSX.utils.book_new();
      const sheetName =
        currentModule === "commercial"
          ? "Archived Projects"
          : "Archived Clients";
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${sheetName}.xlsx`);
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Excel download error:", error);
      toast.error("Failed to download Excel file");
    }
  };

  const handleDataFilter = (from, to) => {
    setFromDate(from || null);
    setToDate(to || null);
  };

  const getPageTitle = () => {
    if (currentModule === "commercial") return "Archived Projects";
    if (company === "idg") return "Completed Orders";
    return "Archived Clients";
  };

  const getDateFieldLabel = () => {
    if (currentModule === "commercial") return "Completion Date";
    if (company === "idg") return "Delivery Date";
    return "Settlement Date";
  };

  const handleViewClient = (client) => {
    const clientId =
      client.matternumber || client.matterNumber || client.orderId;
    if (currentModule === "commercial") {
      navigate(`/admin/client/view/${clientId}`);
    } else {
      navigate(`/admin/client/view/${clientId}`);
    }
  };

  const isLoading =
    currentModule === "commercial" ? commercialLoading : loading;

  return (
    <div className="min-h-screen w-full bg-gray-100 overflow-hidden p-2">
      <Header />
      <main className="w-full max-w-8xl mx-auto p-5">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{getPageTitle()}</h2>
          {/* --- Desktop-only Buttons --- */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                label={isExporting ? "Exporting..." : "Export"}
                onClick={() => setOpenExcel(true)}
                disabled={isExporting}
                className="bg-[#00AEEF] hover:bg-blue-600 text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
              />
              <Button
                label="Filter"
                onClick={() => setShowSettlementDateModal(true)}
                className="text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
              />
              <Button
                label="Select Date Range"
                onClick={() => setShowSettlementDateModal(true)}
                className="text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* --- Desktop Table View --- */}
            <div className="hidden lg:block">
              <div className="flex justify-start mb-4">
                <ClientsPerPage
                  value={clientsPerPage}
                  onChange={(e) => setClientsPerPage(Number(e.target.value))}
                />
              </div>
              {sortedClientList.length > 0 ? (
                <Table
                  data={sortedClientList}
                  columns={columns}
                  itemsPerPage={clientsPerPage}
                  showActions={true}
                  cellWrappingClass="whitespace-normal"
                  headerBgColor="bg-[#A6E7FF]"
                  OnEye={handleViewClient}
                  sortedColumn={sortedColumn}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No{" "}
                  {currentModule === "commercial"
                    ? "archived projects"
                    : "archived clients"}{" "}
                  found
                </div>
              )}
            </div>

            {/* --- Mobile & Tablet Card View --- */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {/* Container for Dropdown and Three-Dots Menu */}
              <div className="flex justify-between items-center mb-4">
                <ClientsPerPage
                  value={clientsPerPage}
                  onChange={(e) => setClientsPerPage(Number(e.target.value))}
                />

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
                              onClick={() => setOpenExcel(true)}
                              disabled={isExporting}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : "text-gray-700"
                                } ${isExporting
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                }`}
                            >
                              {isExporting ? "Exporting..." : "Export"}
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowSettlementDateModal(true)}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : "text-gray-700"
                                }`}
                            >
                              Filter
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowSettlementDateModal(true)}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : "text-gray-700"
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

              {/* Mobile Client Cards */}
              {sortedClientList.length > 0 ? (
                sortedClientList.slice(0, clientsPerPage).map((client) => (
                  <div
                    key={client.id || client.matterNumber || client.orderId}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold truncate">
                        {client.client_name || client.clientName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {client.matternumber ||
                          client.matterNumber ||
                          client.orderId}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {client.property_address || client.propertyAddress}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">State: </span>
                        {client.state || client.dataEntryBy}
                      </div>
                      <div>
                        <span className="font-semibold">Type: </span>
                        {client.type || client.clientType || client.ordertype}
                      </div>
                      <div>
                        <span className="font-semibold">
                          {currentModule === "commercial"
                            ? "Project Date:"
                            : company === "vkl"
                              ? "Matter Date:"
                              : "Order Date"}
                        </span>
                        {client.matter_date || client.orderDate}
                      </div>
                      <div>
                        <span className="font-semibold">
                          {getDateFieldLabel()}:{" "}
                        </span>
                        {client.settlement_date || client.deliveryDate}
                      </div>
                      <div>
                        <span className="font-semibold">Status: </span>
                        {client.status}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No{" "}
                  {currentModule === "commercial"
                    ? "archived projects"
                    : "archived clients"}{" "}
                  found
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <DateRangeModal
        isOpen={showSettlementDateModal}
        setIsOpen={setShowSettlementDateModal}
        subTitle={`Select the date range to filter ${currentModule === "commercial" ? "projects" : "clients"
          }.`}
        handelSubmitFun={(from, to) => {
          handleDataFilter(from, to);
          setShowSettlementDateModal(false);
        }}
        onReset={() => handleDataFilter(null, null)}
      />

      <DateRangeModal
        isOpen={openExcel}
        setIsOpen={setOpenExcel}
        subTitle={`Select the date range for the Excel export.`}
        handelSubmitFun={async (from, to) => {
          setFromDate(from);
          setToDate(to);
          await handleExcelExport(from, to);
          setOpenExcel(false);
        }}
        onReset={() => {
          setFromDate(null);
          setToDate(null);
        }}
      />
    </div>
  );
}
