import { useEffect, useState, useMemo, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Header from "@/components/layout/Header";
import * as XLSX from "xlsx-js-style";
import moment from "moment";
import DateRangeModal from "@/components/ui/DateRangeModal";
import { toast } from "react-toastify";
import ArchivedFilterModal from "@/components/ui/ArchivedFilterModal";
import { useSearchStore } from "../SearchStore/searchStore.js";
import Loader from "@/components/ui/Loader";
import ClientAPI from "@/api/userAPI";
import CommercialAPI from "@/api/commercialAPI";
import VocatFasAPI from "@/api/vocatFasAPI";
import { useArchivedClientStore } from "../ArchivedClientStore/UseArchivedClientStore.js";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MatterDetailsModal from "@/components/ui/MatterDetailsModal";
import { useClientDetails } from "@/hooks/useClientDetails";
import { motion } from "framer-motion";
import {
  Archive,
  Download,
  Filter,
  Calendar,
  Search,
  FileText,
  Building,
  FolderOpen,
  ChevronRight,
  Plus,
  AlertCircle,
  Users,
} from "lucide-react";

function ClientsPerPage({ value, onChange }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>Show</span>
      <select
        id="clients-per-page"
        value={value}
        onChange={onChange}
        className="block px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
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

// Floating Background Elements
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

export default function ArchivedClients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    archivedClients,
    loading: zustandLoading,
    isFetched,
    fetchArchivedClients,
  } = useArchivedClientStore();
  const { searchQuery } = useSearchStore();

  // Modals & selection
  const [openExcel, setOpenExcel] = useState(false);
  const [showSettlementDateModal, setShowSettlementDateModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  
  // New Filter State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    state: "",
    clientType: "",
    closeMatter: "",
  });

  // Client details modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [isExporting, setIsExporting] = useState(false);
  const [clientsPerPage, setClientsPerPage] = useState(100);

  // Handle navigation from search dropdown
  const location = useLocation();
  useEffect(() => {
    if (location.state?.val) {
      handleViewClient(location.state.val);
      // Clear state to prevent reopening on refresh (optional but recommended mechanism)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const currentModule = localStorage.getItem("currentModule");

  const api = useMemo(() => {
    if (currentModule === "commercial") {
      return new CommercialAPI();
    } else if (currentModule === "vocat") {
      return new VocatFasAPI();
    } else {
      return new ClientAPI();
    }
  }, [currentModule]);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const { isLoading: vklLoading, error: vklError } = useQuery({
    queryKey: ["archivedClients", currentModule],
    queryFn: fetchArchivedClients,
    enabled: currentModule !== "commercial" && currentModule !== "vocat" && !isFetched,
  });

  const fetchCommercialArchivedClients = async () => {
    const response = await api.getArchivedProjects();

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
      toast.error("Unexpected data format received");
      return [];
    }

    // Transform the data - use businessAddress for commercial
    return data.map((client) => ({
      ...client,
      id: client.id || client.matterNumber || client.orderId,
      matternumber: client.matterNumber || client.id || client.orderId,
      client_name: client.clientName || client.client_name,
      property_address:
        currentModule === "commercial"
          ? client.businessAddress
          : client.propertyAddress || client.property_address,
      business_address: client.businessAddress,
      matter_date: client.matterDate || client.matter_date || null,
      settlement_date: client.settlementDate || client.settlement_date || null,

      state: client.state || "",
      clientType: client.clientType || client.type,
      status: client.status || client.closeMatter || client.projectStatus || "archived",
      // Ensure logo is included
      logo:
        client.logo ||
        (currentModule === "commercial"
          ? "https://storage.googleapis.com/opsnav_logo/logo_opsnav_new.png"
          : "https://storage.googleapis.com/opsnav_logo/logo_vkl_new.png"),
    }));
  };

  const {
    data: commercialData,
    isLoading: commercialLoading,
    error: commercialError,
  } = useQuery({
    queryKey: ["archivedClients", currentModule],
    queryFn: fetchCommercialArchivedClients,
    enabled: currentModule === "commercial",
    onError: (error) => {
      toast.error("Failed to load archived projects");
    },
  });
  
  const fetchVocatArchivedClients = async () => {
    // Use the getArchivedClients method which hits /vocat/user/clients/archived
    const response = await api.getArchivedClients();
    console.log("VOCAT archived clients response:", response);

    let data = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response && Array.isArray(response.data)) {
      data = response.data;
    } else if (response && Array.isArray(response.clients)) {
      data = response.clients;
    }
     
    return data.map((client) => ({
      ...client,
      id: client._id || client.id || client.matterNumber,
      matternumber: client.matterNumber,
      client_name: client.clientName,
      client_type: client.clientType,
      matterDate: client.matterDate,
      state: client.state,
      property_address: client.clientAddress,
      status: client.status || "archived",
      stages: Array.isArray(client.stages) ? client.stages : [client.stages || {}],
    }));
  };

  const {
    data: vocatData,
    isLoading: vocatLoading,
    error: vocatError,
  } = useQuery({
    queryKey: ["archivedClientsVocat", currentModule],
    queryFn: fetchVocatArchivedClients,
    enabled: currentModule === "vocat",
     onError: (error) => {
      console.error("Failed to load VOCAT archived clients", error);
      toast.error("Failed to load archived clients");
    },
  });

  // Use React Query for client details
  const { data: detailedClientData, isLoading: clientDetailsLoading } =
    useClientDetails(
      selectedClient?._id || selectedClient?.id,
      selectedClient?.matternumber ||
        selectedClient?.matterNumber ||
        selectedClient?.orderId,
      currentModule,
      isClientModalOpen ? api : null // Only enable when modal is open
    );

  // Update selectedClient when detailed data is available
  useEffect(() => {
    if (detailedClientData && selectedClient) {
      // Merge the detailed data with our existing client data
      const mergedData = {
        ...selectedClient,
        ...detailedClientData,
        // Preserve the original display data
        client_name:
          selectedClient.client_name || detailedClientData.clientName,
        property_address:
          selectedClient.property_address ||
          detailedClientData.propertyAddress ||
          detailedClientData.businessAddress,
        business_address:
          selectedClient.business_address || detailedClientData.businessAddress,

        matter_date:
          currentModule === "commercial"
            ? detailedClientData.matter_date ||
              detailedClientData.matterDate ||
              selectedClient.matter_date
            : undefined,
        settlement_date:
          currentModule === "commercial"
            ? detailedClientData.settlement_date ||
              detailedClientData.settlementDate ||
              selectedClient.settlement_date
            : undefined,

        // CONVEYANCING: Strict camelCase mapping
        matterDate:
          currentModule !== "commercial"
            ? detailedClientData.matterDate ||
              detailedClientData.matter_date ||
              selectedClient.matterDate
            : undefined,
        settlementDate:
          currentModule !== "commercial"
            ? detailedClientData.settlementDate ||
              detailedClientData.settlement_date ||
              selectedClient.settlementDate
            : undefined,

        logo: selectedClient.logo || detailedClientData.logo,
        __fullyLoaded: true,
      };

      setSelectedClient(mergedData);
    }
  }, [detailedClientData]);

  // Consolidate loading, error, and data
  const isLoading =
    currentModule === "commercial"
      ? commercialLoading
      : currentModule === "vocat"
      ? vocatLoading
      : vklLoading || zustandLoading;

  const error = 
    currentModule === "commercial" 
      ? commercialError 
      : currentModule === "vocat"
      ? vocatError
      : vklError;

  const activeData =
    currentModule === "commercial"
      ? commercialData || []
      : currentModule === "vocat"
      ? vocatData || []
      : archivedClients || [];

  const normalizedActiveData = useMemo(() => {
    if (currentModule === "commercial") return activeData;

    return (activeData || []).map((client) => ({
      ...client,
      matternumber: client.matterNumber || client.matternumber,
      client_name: client.clientName || client.client_name,
      property_address: client.propertyAddress || client.property_address,
      matterDate: client.matterDate || client.matter_date || null,
      settlementDate: client.settlementDate || client.settlement_date || null,
    }));
  }, [activeData, currentModule]);

  // Apply date & search filters using useMemo
  const filteredClientList = useMemo(() => {
    let filteredData = normalizedActiveData;

    if (fromDate && toDate) {
      filteredData = filteredData.filter((client) => {
        let clientDate;
        if (currentModule === "commercial") {
          clientDate = moment(
            new Date(client?.settlement_date || client?.settlementDate)
          );
        } else if (currentModule === "print media") {
          if (client.deliveryDate && client.deliveryDate !== "N/A") {
            clientDate = moment(client.deliveryDate);
          } else if (client.orderDate && client.orderDate !== "N/A") {
             clientDate = moment(client.orderDate);
          } else {
            return false;
          }
        } else {
          if (!client?.settlement_date) return false;
          clientDate = moment(client.settlement_date);
        }
        return clientDate.isBetween(fromDate, toDate, "day", "[]");
      });
    }

    // Apply strict filters (State, Client Type, Close Matter)
    if (activeFilters.state || activeFilters.clientType || activeFilters.closeMatter) {
      filteredData = filteredData.filter((client) => {
        // State Filter
        if (activeFilters.state) {
          if (!client.state || !client.state.toLowerCase().includes(activeFilters.state.toLowerCase())) {
            return false;
          }
        }

        // Client Type / Order Type Filter
        if (activeFilters.clientType) {
          const type =
            client.clientType ||
            client.type ||
            client.ordertype ||
            client.orderType;
          if (
            !type ||
            type.toLowerCase() !== activeFilters.clientType.toLowerCase()
          ) {
            return false;
          }
        }

        // Close Matter / Order Status Filter
        if (activeFilters.closeMatter) {
          const status =
            client.closeMatter ||
            client.projectStatus ||
            client.status ||
            "open";
          
          const filterValue = activeFilters.closeMatter; // 'closed' or 'open' (cancelled)

          // If filter is 'closed', we want 'closed' or 'completed'
          if (filterValue === "closed") {
             if (status !== "closed" && status !== "completed") return false;
          } 
          // If filter is 'open' (which we treat as 'cancelled'), check for 'cancelled'
          else if (filterValue === "open") {
             if (status !== "cancelled" && status !== "open") return false;
          }
        }

        return true;
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
          // Search in both property_address and business_address
          String(client.property_address || client.propertyAddress)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(client.business_address || client.businessAddress)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(client.state).toLowerCase().includes(lowercasedQuery) ||
          String(client.referral || client.referralName)
            .toLowerCase()
            .includes(lowercasedQuery)
      );
    }

    return filteredData;
  }, [activeData, fromDate, toDate, searchQuery, currentModule, activeFilters]);

  const getColumns = () => {
    if (currentModule === "commercial") {
      return [
        { key: "matternumber", title: "Project Number" },
        { key: "client_name", title: "Client Name" },
        { key: "property_address", title: "Business Address" },
        { key: "state", title: "State" },
        { key: "clientType", title: "Client Type" },
        { key: "matter_date", title: "Project Date" },
        { key: "settlement_date", title: "Completion Date" },
        { key: "status", title: "Status" },
      ];
    } else if (currentModule === "conveyancing" || currentModule === "wills") {
      return [
        { key: "matternumber", title: "Matter Number" },
        { key: "client_name", title: "Client Name" },
        { key: "property_address", title: "Property Address" },
        { key: "state", title: "State" },
        { key: "type", title: "Client Type" },
        { key: "matterDate", title: "Matter Date" },
        { key: "settlementDate", title: "Settlement Date" },
        { key: "status", title: "Status" },
      ];
    } else if (currentModule === "print media") {
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
    } else if (currentModule === "vocat") {
      return [
        { key: "matternumber", title: "Matter Number" },
        { key: "client_name", title: "Client Name" },
        { key: "property_address", title: "Client Address" },
        { key: "state", title: "State" },
        { key: "client_type", title: "Client Type" }, 
        {
          key: "matterDate",
          title: "Matter Date",
          render: (client) =>
            client.matterDate
              ? moment(client.matterDate).isValid()
                ? moment(client.matterDate).format("DD-MM-YYYY")
                : "-"
              : "-",
        },
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
    let sortableItems = [...filteredClientList];

    if (sortedColumn !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortedColumn];
        const bVal = b[sortedColumn];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === "asc" ? -1 : 1;
        if (bVal == null) return sortDirection === "asc" ? 1 : -1;

        if (
          sortedColumn === "matter_date" ||
          sortedColumn === "settlement_date" ||
          sortedColumn === "orderDate" ||
          sortedColumn === "deliveryDate"
        ) {
          const dateA = moment(aVal);
          const dateB = moment(bVal);

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
  }, [filteredClientList, sortedColumn, sortDirection]);

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
        // For commercial, filter the already-fetched list
        data = filteredClientList.filter((client) => {
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
      toast.error("Failed to download Excel file");
    }
  };

  const handleDataFilter = (from, to) => {
    setFromDate(from || null);
    setToDate(to || null);
  };

  const getPageTitle = () => {
    if (currentModule === "commercial") return "Archived Projects";
    if (currentModule === "print media") return "Completed Orders";
    return "Archived Clients";
  };

  const getDateFieldLabel = () => {
    if (currentModule === "commercial") return "Completion Date";
    if (currentModule === "print media") return "Delivery Date";
    return "Settlement Date";
  };

  const getAddressFieldLabel = () => {
    if (currentModule === "commercial") return "Business Address";
    if (currentModule === "print media") return "Billing Address";
    return "Property Address";
  };

  const handleViewClient = (client) => {
    console.log("handleViewClient called with:", client);

    let initialData = { ...client };

    if (currentModule === "commercial" && !initialData.logo) {
      initialData.logo =
        "https://storage.googleapis.com/opsnav_logo/logo_opsnav_new.png";
    }

    if (client && client.__raw) {
      initialData = { ...client.__raw, ...initialData };
      initialData.__mergedFromRaw = true;
    }

    if (currentModule === "commercial") {
      initialData.__fullyLoaded = true;
    }

    setSelectedClient(initialData);
    setIsClientModalOpen(true);

    if (
      currentModule !== "commercial" &&
      (!client.costData || client.costData.length === 0) &&
      api
    ) {
      const preferId = client._id || client.id;
      const preferMatNo =
        client.matternumber || client.matterNumber || client.orderId;

      queryClient.invalidateQueries({
        queryKey: ["clientDetails", preferId, preferMatNo, currentModule],
      });
    }
  };

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

      <div className="relative z-10">
        <Header />

        <main className="p-3 sm:p-4 md:p-6 w-full">
          {/* Welcome Section */}
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
                  View and manage{" "}
                  {currentModule === "commercial"
                    ? "archived projects"
                    : currentModule === "print media"
                    ? "completed orders"
                    : "archived clients"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl sm:rounded-3xl overflow-visible bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl mb-6 relative z-20"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    All{" "}
                    {currentModule === "commercial"
                      ? "Archived Projects"
                      : currentModule === "print media"
                      ? "Completed Orders"
                      : "Archived Clients"}
                  </h3>
                </div>

                <div className="flex flex-row items-center justify-between w-full sm:w-auto sm:justify-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="clients-per-page"
                      className="text-sm font-medium text-gray-700"
                    >
                      Show:
                    </label>
                    <select
                      id="clients-per-page"
                      value={clientsPerPage}
                      onChange={(e) =>
                        setClientsPerPage(Number(e.target.value))
                      }
                      className="block px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all text-sm"
                    >
                      <option>5</option>
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                      <option>100</option>
                      <option>200</option>
                      <option>500</option>
                    </select>
                  </div>

                  <div className="hidden lg:flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOpenExcel(true)}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? "Exporting..." : "Export"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilterModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSettlementDateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Date Range
                    </motion.button>
                  </div>

                  {/* Mobile Actions Menu */}
                  <div className="flex lg:hidden items-center">
                    <Menu as="div" className="relative z-30">
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
                        <Menu.Items className="absolute right-0 z-[999] mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setOpenExcel(true)}
                                  disabled={isExporting}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  } ${
                                    isExporting
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    {isExporting ? "Exporting..." : "Export"}
                                  </div>
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setShowFilterModal(true)}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filter
                                  </div>
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    setShowSettlementDateModal(true)
                                  }
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

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
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

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
              </div>
            ) : !sortedClientList || sortedClientList.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                  <Archive className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No{" "}
                  {currentModule === "commercial"
                    ? "archived projects"
                    : currentModule === "print media"
                    ? "completed orders"
                    : "archived clients"}{" "}
                  found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchQuery || fromDate
                    ? "Try adjusting your search or filter criteria"
                    : `No ${
                        currentModule === "commercial"
                          ? "projects have been archived yet"
                          : currentModule === "print media"
                          ? "orders have been completed yet"
                          : "clients have been archived yet"
                      }`}
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  {/* <Table
                    data={sortedClientList}
                    columns={columns}
                    itemsPerPage={clientsPerPage}
                    showActions={true}
                    cellWrappingClass="whitespace-normal"
                    // headerBgColor="bg-gradient-to-r from-[#2E3D99]/20 to-[#1D97D7]/30"
                    OnEye={handleViewClient}
                    sortedColumn={sortedColumn}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  /> */}

                  <Table
                    data={sortedClientList}
                    columns={columns}
                    itemsPerPage={clientsPerPage}
                    showActions={true}
                    cellWrappingClass="whitespace-normal"
                    headerBgColor="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                    OnEye={handleViewClient}
                    EditOrder={true}
                    sortedColumn={sortedColumn}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                  />
                </div>

                {/* Mobile & Tablet Card View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                  {sortedClientList.slice(0, clientsPerPage).map((client) => (
                    <motion.div
                      key={client.id || client.matterNumber || client.orderId}
                      whileHover={{ y: -4 }}
                      className="bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start space-x-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                              {currentModule === "commercial" ? (
                                <Building className="w-4 h-4 text-white" />
                              ) : currentModule === "print media" ? (
                                <FolderOpen className="w-4 h-4 text-white" />
                              ) : (
                                <Users className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 truncate">
                                {client.client_name || client.clientName}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {client.matternumber ||
                                  client.matterNumber ||
                                  client.orderId}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100/50">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1 col-span-2">
                            <span className="font-semibold text-gray-500">
                              {getAddressFieldLabel()}:
                            </span>
                            <p className="text-gray-600">
                              {currentModule === "commercial"
                                ? client.business_address ||
                                  client.businessAddress
                                : client.property_address ||
                                  client.propertyAddress}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-500">
                              State:
                            </span>
                            <div className="text-gray-600">{client.state}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-500">
                              Type:
                            </span>
                            <div className="text-gray-600">
                              {client.type ||
                                client.clientType ||
                                client.ordertype}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-500">
                              {currentModule === "commercial"
                                ? "Project Date:"
                                : currentModule === "print media"
                                ? "Order Date:"
                                : "Matter Date:"}
                            </span>
                            <div className="text-gray-600">
                              {client.matter_date || client.orderDate}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-500">
                              {getDateFieldLabel()}:
                            </span>
                            <div className="text-gray-600">
                              {client.settlement_date || client.deliveryDate}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-500">
                              Status:
                            </span>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                client.status === "archived"
                                  ? "bg-gray-100 text-gray-700"
                                  : client.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {client.status}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleViewClient(client)}
                          className="flex items-center gap-1 text-sm text-[#2E3D99] hover:text-[#1D97D7] font-medium"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      <ArchivedFilterModal
        isOpen={showFilterModal}
        setIsOpen={setShowFilterModal}
        initialFilters={activeFilters}
        onApply={setActiveFilters}
        currentModule={currentModule}
        onReset={() =>
          setActiveFilters({ state: "", clientType: "", closeMatter: "" })
        }
      />

      <DateRangeModal
        isOpen={showSettlementDateModal}
        setIsOpen={setShowSettlementDateModal}
        subTitle={`Select the date range to filter ${
          currentModule === "commercial" ? "projects" : "clients"
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

      <MatterDetailsModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setSelectedClient(null);
        }}
        matter={selectedClient}
        currentModule={currentModule}
        isLoading={clientDetailsLoading}
      />
    </div>
  );
}
