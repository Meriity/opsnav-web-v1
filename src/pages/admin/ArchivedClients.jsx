import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { create } from "zustand";
import ClientAPI from "../../api/userAPI";
import * as XLSX from "xlsx-js-style";
import Header from "../../components/layout/Header";
import DatePicker from "react-datepicker";
import moment from "moment";
import DateRangeModal from "../../components/ui/DateRangeModal";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";
import Loader from "../../components/ui/Loader";

// Zustand Store for Archived Clients
const useArchivedClientStore = create((set) => ({
  archivedClients: [],
  loading: false,
  isFetched: false,
  setClients: (clients) => set({ archivedClients: clients }),
  setLoading: (loading) => set({ loading }),
  setIsFetched: (isFetched) => set({ isFetched }),
  fetchArchivedClients: async () => {
    set({ loading: true });
    const api = new ClientAPI();
    try {
      const res = await api.getArchivedClients();

      const mapped = res.clients.map((client, index) => {
        // Updated formatDate function for DD-MM-YYYY
        const formatDate = (dateString) => {
          if (!dateString) return "N/A";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            // Format to DD-MM-YYYY
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          } catch {
            return "N/A";
          }
        };

        return {
          id: index + 1,
          matternumber: client.matterNumber || "N/A",
          client_name: client.clientName || "N/A",
          property_address: client.propertyAddress || "N/A",
          state: client.state || "N/A",
          type: client.clientType || "N/A",
          matter_date: formatDate(client.matterDate),
          settlement_date: formatDate(client.settlementDate),
          status: client.closeMatter || "N/A",
          data_entry_by: client.dataEntryBy || "N/A",
          referral: client.referral || "N/A",
          contract_price:
            client.costData?.[0]?.quoteAmount?.$numberDecimal || "0.00",
          council: client.council || "N/A",
          invoiced:
            client.costData?.[0]?.invoiceAmount?.$numberDecimal || "0.00",
          total_costs:
            client.costData?.[0]?.totalCosts?.$numberDecimal || "0.00",
        };
      });

      set({ archivedClients: mapped, isFetched: true });
    } catch (err) {
      console.error("Failed to fetch archived clients", err);
      set({ archivedClients: [], isFetched: true });
    } finally {
      set({ loading: false });
    }
  },
}));

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

  const [openExcel, setOpenExcel] = useState(false);
  const [showSettlementDateModal, setShowSettlementDateModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clientList, setClientList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const api = new ClientAPI();

  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (!isFetched) {
      fetchArchivedClients();
    }
  }, [isFetched, fetchArchivedClients]);

  useEffect(() => {
    let filteredData = archivedClients;

    if (fromDate && toDate) {
      filteredData = filteredData.filter((client) => {
        const clientDate = moment(new Date(client?.settlement_date));
        return clientDate.isBetween(fromDate, toDate, "day", "[]");
      });
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (client) =>
          String(client.matternumber).toLowerCase().includes(lowercasedQuery) ||
          String(client.client_name).toLowerCase().includes(lowercasedQuery) ||
          String(client.property_address)
            .toLowerCase()
            .includes(lowercasedQuery)
      );
    }
    setClientList(filteredData);
  }, [archivedClients, fromDate, toDate, searchQuery]);

  const columns = [
    { key: "matternumber", title: "Matter Number" },
    { key: "client_name", title: "Client Name" },
    { key: "property_address", title: "Property Address" },
    { key: "state", title: "State" },
    { key: "type", title: "Client Type" },
    { key: "matter_date", title: "Matter Date" },
    { key: "settlement_date", title: "Settlement Date" },
    { key: "status", title: "Status" },
  ];

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

        // Handle date sorting specifically since 'DD-MM-YYYY' is not lexicographically sortable
        if (
          sortedColumn === "matter_date" ||
          sortedColumn === "settlement_date"
        ) {
          const dateA = moment(aVal, "DD-MM-YYYY");
          const dateB = moment(bVal, "DD-MM-YYYY");
          if (dateA.isBefore(dateB)) {
            return sortDirection === "asc" ? -1 : 1;
          }
          if (dateA.isAfter(dateB)) {
            return sortDirection === "asc" ? 1 : -1;
          }
          return 0;
        }

        if (aVal < bVal) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [clientList, sortedColumn, sortDirection]);

  async function handleExcelExport() {
    setIsLoading(true);
    if (!fromDate || !toDate) {
      toast.error("Please select a valid date range");
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getArchivedClientsDate(fromDate, toDate);
      const data = res.data;

      if (!data || data.length === 0) {
        toast.info("No data available for the selected date range");
      }
      convertToExcel(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
      setOpenExcel(false);
      setFromDate("");
      setToDate("");
    }
  }

  const handleDataFilter = (fromDate, toDate) => {
    if (fromDate === "" && toDate === "") {
      setClientList(archivedClients);
    } else if (fromDate !== "" && toDate !== "") {
      const filtered = archivedClients.filter((client) => {
        const clientDate = moment(new Date(client?.settlement_date));
        return clientDate.isBetween(fromDate, toDate, "day", "[]");
      });
      setClientList(filtered);
    }
  };

  const convertToExcel = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map((obj) => headers.map((key) => obj[key]));
    const allData = [headers, ...rows];
    downloadExcel(allData);
  };

  const downloadExcel = (data) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = data[0].map((_, i) => {
      const maxLength = data.reduce(
        (max, row) => Math.max(max, row[i] ? String(row[i]).length : 0),
        10
      );
      return { wch: maxLength + 4 };
    });
    ws["!rows"] = data.map((row, i) => ({ hpt: i === 0 ? 40 : 20 }));
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
          fill: {
            patternType: "solid",
            fgColor: { rgb: "CCD9CF" },
          },
        };
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Archived Clients");
    XLSX.writeFile(wb, "ArchivedClients.xlsx");
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 overflow-hidden">
      <main className="w-full max-w-8xl mx-auto">
        <Header />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Archived Clients</h2>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                label="Export"
                onClick={() => setOpenExcel(true)}
                className="bg-[#00AEEF] hover:bg-blue-600 text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
              />
              <Button
                label="Filter"
                onClick={() => setShowSettlementDateModal(true)}
                className="text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
              />
            </div>
          </div>
          <div className="flex lg:hidden items-center space-x-2">
            <Button
              label="Export"
              onClick={() => setOpenExcel(true)}
              className="bg-[#00AEEF] hover:bg-blue-600 text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
            />
            <Button
              label="Filter"
              onClick={() => setShowSettlementDateModal(true)}
              className="text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
            />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="flex justify-start mb-4">
                <ClientsPerPage
                  value={clientsPerPage}
                  onChange={(e) => setClientsPerPage(Number(e.target.value))}
                />
              </div>
              <Table
                data={sortedClientList}
                columns={columns}
                itemsPerPage={clientsPerPage}
                showActions={true}
                cellWrappingClass="whitespace-normal"
                headerBgColor="bg-[#A6E7FF]"
                OnEye={(client) =>
                  navigate(`/admin/client/view/${client.matternumber}`)
                }
                sortedColumn={sortedColumn}
                sortDirection={sortDirection}
                handleSort={handleSort}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              <div className="flex justify-start">
                <ClientsPerPage
                  value={clientsPerPage}
                  onChange={(e) => setClientsPerPage(Number(e.target.value))}
                />
              </div>
              {sortedClientList.slice(0, clientsPerPage).map((client) => (
                <div key={client.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold truncate">
                      {client.client_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {client.matternumber}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {client.property_address}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">State: </span>
                      {client.state}
                    </div>
                    <div>
                      <span className="font-semibold">Type: </span>
                      {client.type}
                    </div>
                    <div>
                      <span className="font-semibold">Matter Date: </span>
                      {client.matter_date}
                    </div>
                    <div>
                      <span className="font-semibold">Settlement Date: </span>
                      {client.settlement_date}
                    </div>
                    <div>
                      <span className="font-semibold">Status: </span>
                      {client.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <DateRangeModal
        isOpen={showSettlementDateModal}
        setIsOpen={setShowSettlementDateModal}
        handelSubmitFun={(from, to) => {
          setFromDate(from);
          setToDate(to);
          handleDataFilter(from, to);
          setShowSettlementDateModal(false);
        }}
      />
      <Dialog open={openExcel} onClose={() => setOpenExcel(false)}>
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <DialogPanel className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h3 className="text-lg font-semibold mb-4">Export to Excel</h3>
          <p className="mb-4">Select the date range for the Excel export.</p>
          <div className="flex flex-col space-y-4">
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              placeholderText="From Date"
              className="w-full p-2 border rounded"
            />
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              placeholderText="To Date"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              label="Cancel"
              onClick={() => setOpenExcel(false)}
              className="bg-gray-200 text-gray-800"
            />
            <Button
              label={isLoading ? "Exporting..." : "Export"}
              onClick={handleExcelExport}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            />
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
