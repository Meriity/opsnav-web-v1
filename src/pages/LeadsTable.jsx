import React, { useEffect, useState } from "react";
import { 
  Search, 
  Home, 
  Briefcase, 
  FileText, 
  Newspaper, 
  Scale, 
} from "lucide-react";
import ViewClientsTable from "../components/ui/ViewClientsTable";
import Header from "../components/layout/Header";

const MODULE_ICONS = {
  "conveyancing": {
    icon: Home,
    label: "Conveyancing",
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  "commercial": {
    icon: Briefcase,
    label: "Commercial",
    color: "bg-gradient-to-r from-indigo-500 to-purple-500",
  },
  "wills & estates": {
    icon: FileText,
    label: "Wills & Estates",
    color: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  "signage & print": {
    icon: Newspaper,
    label: "Signage & Print",
    color: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  "vocat & fas": {
    icon: Scale,
    label: "Vocat & FAS",
    color: "bg-gradient-to-r from-rose-500 to-pink-500",
  }
};

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(100);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(
          "https://opsnav-app-service-dev-871399330172.us-central1.run.app/lead/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        const data = await response.json();
        const leadsData = Array.isArray(data) ? data : data.data || data.leads || [];
        setLeads(leadsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedLeads = filteredLeads.map((lead) => ({
    ...lead,
    id: lead._id || lead.id || Math.random().toString(36).substr(2, 9),
    // Keep modulesRequested as an array for rendering icons
    modulesRequestedRaw: Array.isArray(lead.modulesRequested) ? lead.modulesRequested : [],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden font-sans">
      <Header simplified={true} />
      
      <div className="relative z-10 space-y-4 p-2 lg:p-4 max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-3 p-5 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 truncate">
                <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                  View Leads
                </span>
              </h1>
              <p className="text-gray-600 text-xs lg:text-xs xl:text-sm 2xl:text-base mt-1 line-clamp-2 lg:line-clamp-1 wrap-break-word font-sm lg:font-sm">
                View and manage all incoming leads and inquiries
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 mt-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-4">
              {/* Items Per Page */}
              <div className="flex items-center gap-2 text-xs lg:text-xs xl:text-sm text-gray-700">
                <label htmlFor="items-per-page" className="font-medium">
                  Leads per page:
                </label>
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="block w-full px-2.5 py-1.5 lg:py-1.5 xl:py-2 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all text-xs lg:text-xs xl:text-sm"
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

              {/* Search Bar */}
              <div className="flex items-center gap-2 w-full sm:w-auto group">
                <div className="relative flex items-center gap-2 px-3 py-1.5 lg:py-1.5 xl:py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-[#2E3D99] focus-within:border-[#2E3D99] transition-all w-full sm:w-64">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#2E3D99] transition-colors" />
                  <input
                    type="text"
                    className="w-full bg-transparent border-none focus:outline-none text-xs lg:text-xs xl:text-sm text-gray-700 placeholder-gray-400"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="px-5">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3D99]"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500 font-medium">
              <p>Error: {error}</p>
            </div>
          ) : formattedLeads.length === 0 ? (
            <div className="py-10 text-center text-gray-500 font-medium">
              No leads found.
            </div>
          ) : (
            <ViewClientsTable
              data={formattedLeads}
              columns={[
                { key: "fullName", title: "Full Name", width: "15%" },
                { key: "email", title: "Email", width: "15%" },
                { key: "companyName", title: "Company", width: "15%" },
                { key: "state", title: "State", width: "10%" },
                { key: "address", title: "Address", width: "15%" },
                { 
                  key: "modulesRequested", 
                  title: "Modules", 
                  width: "15%",
                  render: (item) => {
                    const modules = item.modulesRequestedRaw || [];
                    if (modules.length === 0) return <span className="text-gray-400">—</span>;

                    return (
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {modules.map((moduleKey, idx) => {
                          const config = MODULE_ICONS[moduleKey.toLowerCase()];
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <div
                              key={idx}
                              className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${config.color} text-white shadow-sm transition-transform hover:scale-110`}
                              title={config.label}
                            >
                              <Icon className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                },
                { key: "comments", title: "Comments", width: "15%" }
              ]}
              currentModule="leads"
              showStages={false}
              showTasks={false}
              showActions={false}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsTable;
