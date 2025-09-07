import { useEffect, useState, useMemo } from "react";
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
import { useArchivedClientStore } from "../ArchivedClientStore/UseArchivedClientStore.js";

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
  const [openExcel, setOpenExcel] = useState(false); // uses DateRangeModal now
  const [showSettlementDateModal, setShowSettlementDateModal] = useState(false);

  // Date range state (Date objects from DateRangeModal)
  const [fromDate, setFromDate] = useState(null); // Date | null
  const [toDate, setToDate] = useState(null); // Date | null

  const [clientList, setClientList] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const api = new ClientAPI();

  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (!isFetched) {
      fetchArchivedClients();
    }
  }, [isFetched, fetchArchivedClients]);

  // Apply date & search filters to list
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

  let columns=[];
  if(localStorage.getItem("company")==="vkl"){
   columns = [
    { key: "matternumber", title: "Matter Number" },
    { key: "client_name", title: "Client Name" },
    { key: "property_address", title: "Property Address" },
    { key: "state", title: "State" },
    { key: "type", title: "Client Type" },
    { key: "matter_date", title: "Matter Date" },
    { key: "settlement_date", title: "Settlement Date" },
    { key: "status", title: "Status" },
  ];
}
else if(localStorage.getItem("company")==="idg"){
   columns = [
    { key: "matternumber", title: "Client ID" },
    { key: "client_name", title: "Client Name" },
    { key: "property_address", title: "Billing Address" },
    { key: "state", title: "State" },
    { key: "type", title: "Client Type" },
    { key: "matter_date", title: "Order Date" },
    { key: "settlement_date", title: "Delivery Date" },
    { key: "status", title: "Status" },
  ];
}

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

        // Sort DD-MM-YYYY correctly
        if (
          sortedColumn === "matter_date" ||
          sortedColumn === "settlement_date"
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
      const res = await api.getArchivedClientsDate(from, to);
      const data = res.data;

      if (!data || data.length === 0) {
        toast.info("No data available for the selected date range");
      } else {
        convertToExcel(data);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsExporting(false);
    }
  }

  const convertToExcel = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map((obj) => headers.map((key) => obj[key]));
    const allData = [headers, ...rows];
    downloadExcel(allData);
  };

  const downloadExcel = (data) => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Archived Clients");
    XLSX.writeFile(wb, "ArchivedClients.xlsx");
  };

  // Reuse for list filtering (called by Filter modal)
  const handleDataFilter = (from, to) => {
    setFromDate(from || null);
    setToDate(to || null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 overflow-hidden p-2">
              <Header />
      <main className="w-full max-w-8xl mx-auto p-5">


        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">  {localStorage.getItem("company") === "vkl"? "Archived Clients" : "Completed Orders"} </h2>
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

          <div className="flex lg:hidden items-center space-x-2">
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

        {/* Table / Cards */}
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

      {/* FILTER modal (same as before) */}
      <DateRangeModal
        isOpen={showSettlementDateModal}
        setIsOpen={setShowSettlementDateModal}
        subTitle="Select the date range to filter clients."
        handelSubmitFun={(from, to) => {
          handleDataFilter(from, to);
          setShowSettlementDateModal(false);
        }}
      />

      {/* EXPORT modal — reuses the exact same DateRangeModal */}
      <DateRangeModal
        isOpen={openExcel}
        setIsOpen={setOpenExcel}
        subTitle="Select the date range for the Excel export."
        handelSubmitFun={async (from, to) => {
          setFromDate(from);
          setToDate(to);
          await handleExcelExport(from, to); // do the export after picking dates
          setOpenExcel(false);
        }}
      />
    </div>
  );
}
