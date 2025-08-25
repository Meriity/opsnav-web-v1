import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
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
        // Helper function to safely format dates
        const formatDate = (dateString) => {
          if (!dateString) return "N/A";
          try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
              ? "N/A"
              : date.toISOString().split("T")[0];
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

export default function ArchivedClients() {
  const { archivedClients, loading, isFetched, fetchArchivedClients } =
    useArchivedClientStore();
  const { searchQuery } = useSearchStore();

  const [openExcel, setOpenExcel] = useState(false);
  const [showSettlementDateModal, setShowSettlementDateModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clientList, setClientList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const api = new ClientAPI();

  useEffect(() => {
    fetchArchivedClients();
  }, [isFetched]);

  useEffect(() => {
    let filteredData = archivedClients;

    // Apply date range filter first
    if (fromDate && toDate) {
      filteredData = filteredData.filter((client) => {
        const clientDate = moment(new Date(client?.settlement_date));
        return clientDate.isBetween(fromDate, toDate, "day", "[]");
      });
    }

    // Apply search query filter
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
      const maxLength = data.reduce((max, row) => {
        const len = row[i] ? row[i].toString().length : 0;
        return Math.max(max, len);
      }, 10);
      return { wch: maxLength + 4 };
    });

    ws["!rows"] = data.map((row, i) => {
      if (i === 0) return { hpt: 40 };
      const maxHeight = row.reduce((max, cell) => {
        const lines = cell?.toString().split("\n").length || 1;
        return Math.max(max, lines * 15);
      }, 15);
      return { hpt: maxHeight };
    });

    const headerColors = [
      "CCD9CF",
      "ABD0ED",
      "F0F005",
      "A3D7F0",
      "F0C6A3",
      "9EF0BC",
      "95E5F5",
      "ECBBF2",
      "B3F2B5",
    ];

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: { rgb: headerColors[C % headerColors.length] },
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Archived Clients");
    XLSX.writeFile(wb, "archived_clients.xlsx");

    setOpenExcel(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <main className="w-full max-w-8xl mx-auto">
        {/* Top Header */}
        <Header />
        {/* Archive Header */}
        <div className="flex justify-between items-center w-full mb-[15] p-2">
          <h2 className="text-xl lg:text-lg font-semibold">Archived Clients</h2>
          <div className="flex gap-5">
            <Button
              label="Export to Excel"
              onClick={() => setOpenExcel(true)}
            />
            <Button
              label="Filter Data"
              onClick={() => setShowSettlementDateModal(true)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center h-48 mt-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
              <div className="ml-5 text-[#00AEEF]">Loading Please wait!</div>
            </div>
          ) : (
            <Table
              data={clientList}
              columns={columns}
              itemsPerPage={5}
              pagination="absolute bottom-5 left-1/2 transform -translate-x-1/2 mt-4 ml-28"
              OnEye={true}
              showReset={false}
              cellFontSize="text-xs lg:text-sm xl:text-base" // Pass the custom font size here
            />
          )}
        </div>
      </main>

      {/* Excel Export Dialog */}
      <DateRangeModal
        isOpen={showSettlementDateModal}
        setIsOpen={setShowSettlementDateModal}
        handelSubmitFun={handleDataFilter}
        subTitle="Filter on settlement date"
      />

      <Dialog
        open={openExcel}
        onClose={() => setOpenExcel(false)}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-7 text-center">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg p-6">
              <button
                onClick={() => setOpenExcel(false)}
                className="absolute top-4 right-5 text-red-500 text-2xl font-bold hover:scale-110"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-2">Export to Excel</h2>
              <p className="text-sm lg:text-xs text-gray-600 mb-5">
                Filter by settlement date:
              </p>

              <div className="space-y-4">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFromDate(""), setToDate(""), setOpenExcel(false);
                  }}
                  className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  <RefreshCcw className="inline-block mr-1" size={16} />
                </button>
                <Button
                  label={isLoading ? "Processing..." : "Download CSV"}
                  onClick={handleExcelExport}
                  disabled={isLoading}
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
