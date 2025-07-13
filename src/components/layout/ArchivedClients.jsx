import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Button from "../ui/Button";
import Table from "../ui/Table";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { create } from "zustand";
import dropdownicon from "../../icons/Button icons/Group 320.png";
import ClientAPI from "../../api/userAPI";
import * as XLSX from "xlsx-js-style";


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
      console.log("API Response:", res);
      
      const mapped = res.data.map((client, index) => {
        // Helper function to safely format dates
        const formatDate = (dateString) => {
          if (!dateString) return "N/A";
          try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? "N/A" : date.toISOString().split('T')[0];
          } catch {
            return "N/A";
          }
        };

        return {
          id: index + 1,
          matternumber: client.MATTER_NUMBER || "N/A",
          client_name: client.CLIENT_NAME || "N/A",
          property_address: client.PROPERTY_ADDRESS || "N/A",
          state: client.STATE || "N/A",
          type: client.CLIENT_TYPE || "N/A",
          matter_date: formatDate(client.MATTER_DATE),
          settlement_date: formatDate(client.SETTLEMENT_DATE),
          status: client.CLOSE_MATTER || "N/A",
          // Additional fields from API
          data_entry_by: client.DATA_ENTRY_BY,
          referral: client.REFERRAL,
          contract_price: client.CONTRACT_PRICE?.$numberDecimal || "0.00",
          council: client.COUNCIL,
          invoiced: client.INVOICED
        };
      });
      
      set({ archivedClients: mapped, isFetched: true });
    } catch (err) {
      console.error("Failed to fetch archived clients", err);
      set({ archivedClients: [], isFetched: true });
    } finally {
      set({ loading: false });
    }
  }
}));

export default function ArchivedClients(){
  const { archivedClients, loading, isFetched, fetchArchivedClients } = useArchivedClientStore();
  const [openExcel, setOpenExcel] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const api = new ClientAPI();

  useEffect(() => {
    if (!isFetched) fetchArchivedClients();
  }, [isFetched]);

  const columns = [
    { key: 'matternumber', title: 'Matter Number' },
    { key: 'client_name', title: 'Client Name' },
    { key: 'property_address', title: 'Property Address' },
    { key: 'state', title: 'State' },
    { key: 'type', title: 'Client Type' },
    { key: 'matter_date', title: 'Matter Date' },
    { key: 'settlement_date', title: 'Settlement Date' },
    { key: 'status', title: 'Status' },
  ];

  async function handleExcelExport() {
  
    console.log(fromDate, toDate);

    try {
      const res = await api.getArchivedClientsDate(fromDate, toDate);
      console.log(res); 
      if (!res.ok) {
        if (res.status === 404) {
          alert("No record found");
        } 
        // throw new Error("Network response was not ok");
      }
      const data = res.data;

      if (!data || data.length === 0) {
        alert("No record found");
        return;
      }
      convertToExcel(data);
    } catch (e) {
      console.log("Error", e);
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

    // Column widths
    ws["!cols"] = data[0].map((_, i) => {
      const maxLength = data.reduce((max, row) => {
        const len = row[i] ? row[i].toString().length : 0;
        return Math.max(max, len);
      }, 10);
      return { wch: maxLength + 4 };
    });

    // Row heights
    ws["!rows"] = data.map((row, i) => {
      if (i === 0) return { hpt: 40 };
      const maxHeight = row.reduce((max, cell) => {
        const lines = cell?.toString().split("\n").length || 1;
        return Math.max(max, lines * 15);
      }, 15);
      return { hpt: maxHeight };
    });

    // Header style
    const headerColors = [
      "CCD9CF", "ABD0ED", "F0F005", "A3D7F0", "F0C6A3", "9EF0BC",
      "95E5F5", "ECBBF2", "B3F2B5",
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
      <main className="w-full max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hello {localStorage.getItem("user")}</h2>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Matter Number, Client Name"
              className="outline-none text-sm bg-transparent"
              style={{ width: "250px", height: "25px" }}
            />
          </div>
        </div>

        {/* Archive Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-2xl font-semibold">Archived Clients</h2>
          <div className="flex gap-5">
            <Button label="Export to Excel" onClick={() => setOpenExcel(true)} />
            <Button label="Settlement Date" bg="bg-[#FB4A52]" Icon2={dropdownicon} bghover="text-red-800" bgactive="text-red-950"  /> 
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
              data={archivedClients}
              columns={columns}
              itemsPerPage={5}
              pagination="absolute bottom-5 left-1/2 transform -translate-x-1/2 mt-4 ml-28"
              OnEye={true}
            />
          )}
        </div>
      </main>

      {/* Excel Export Dialog */}
      <Dialog open={openExcel} onClose={() => setOpenExcel(false)} className="relative z-10">
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
              <p className="text-sm text-gray-600 mb-5">Filter by settlement date:</p>

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

              <button
                onClick={handleExcelExport}
                className="w-full mt-6 bg-[#00AEEF] text-white py-2 rounded hover:bg-blue-600"
              >
                Download Excel
              </button>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

