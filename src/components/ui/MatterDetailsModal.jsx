import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  Calendar,
  MapPin,
  User,
  FileText,
  DollarSign,
  Tag,
  Clock,
} from "lucide-react";
import moment from "moment";
import ClientAPI from "@/api/userAPI";
import CommercialAPI from "@/api/commercialAPI";

const MatterDetailsModal = ({
  isOpen,
  onClose,
  matter,
  currentModule,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [stageData, setStageData] = useState(null);

  const display = stageData || matter || {};

  const effectiveCostData = useMemo(() => {
    const candidates = [];

    if (stageData) {
      if (Array.isArray(stageData.costData) && stageData.costData.length)
        candidates.push(...stageData.costData);
      if (Array.isArray(stageData.costs) && stageData.costs.length)
        candidates.push(...stageData.costs);
      if (stageData.client && Array.isArray(stageData.client.costData))
        candidates.push(...stageData.client.costData);
    }

    if (Array.isArray(matter?.costData) && matter.costData.length)
      candidates.push(...matter.costData);
    if (Array.isArray(matter?.__raw?.costData) && matter.__raw.costData.length)
      candidates.push(...matter.__raw.costData);

    const pushIfObject = (v) => {
      if (v && typeof v === "object" && !Array.isArray(v)) candidates.push(v);
    };

    if (stageData && stageData.costData && !Array.isArray(stageData.costData))
      pushIfObject(stageData.costData);
    if (matter && matter.costData && !Array.isArray(matter.costData))
      pushIfObject(matter.costData);

    const seen = new Set();
    const deduped = [];
    for (const c of candidates) {
      try {
        const id = c.id ?? c.matterNumber ?? JSON.stringify(c);
        if (!seen.has(id)) {
          seen.add(id);
          deduped.push(c);
        }
      } catch {
        deduped.push(c);
      }
    }
    return deduped;
  }, [stageData, matter]);

  const { otherFeeNotesFromNotes } = useMemo(() => {
    const rawNotes = (display.notes || display.note || "") + "";
    if (!rawNotes.trim()) return { otherFeeNotesFromNotes: [] };

    const parts = rawNotes
      .split(/\||\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const otherFeeRegex = /other fee\s*\(?\d*\)?/i;
    const otherFeeParts = [];
    for (const p of parts) {
      if (
        /^note\b/i.test(p) ||
        /title\s*&\s*plan/i.test(p) ||
        /important notes/i.test(p)
      )
        continue;
      if (otherFeeRegex.test(p)) otherFeeParts.push(p);
    }
    return { otherFeeNotesFromNotes: otherFeeParts };
  }, [display.notes]);

  const normalizeMoney = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "object") {
      const raw = v.$numberDecimal ?? v.value ?? v.amount ?? null;
      if (raw !== null && raw !== undefined) {
        const n = parseFloat(raw);
        return isNaN(n) ? 0 : n;
      }
      const s = JSON.stringify(v).replace(/[^0-9.\-]/g, "");
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    }
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const formatCurrency = (amount, currency = "AUD") => {
    const n = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      return `${currency} ${n.toFixed(2)}`;
    }
  };

  const labelForKey = (key) => {
    switch (key) {
      case "voiCaf":
        return "VOI/CAF";
      case "title":
        return "Title";
      case "plan":
        return "Plan";
      case "landTax":
        return "Land Tax";
      case "landInformationCertificate":
        return "Land Info Certificate";
      case "waterCertificate":
        return "Water Certificate";
      case "otherFee_1":
        return "Other Fee 1";
      case "otherFee_2":
        return "Other Fee 2";
      case "otherFee_3":
        return "Other Fee 3";
      case "otherFee_4":
        return "Other Fee 4";
      case "otherTotal":
        return "Other Total";
      default:
        return key.replace(/_/g, " ");
    }
  };

  const detailFieldsOrder = [
    "voiCaf",
    "title",
    "plan",
    "landTax",
    "landInformationCertificate",
    "waterCertificate",
    "otherFee_1",
    "otherFee_2",
    "otherFee_3",
    "otherFee_4",
    "otherTotal",
  ];

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
      case "closed":
        return "bg-green-100 text-green-800 border-green-200";
      case "active":
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchMatterDetails = async () => {
      if (
        !matter ||
        matter.__fullyLoaded ||
        stageData ||
        currentModule === "commercial"
      )
        return;

      setLoading(true);
      try {
        const api =
          currentModule === "commercial"
            ? new CommercialAPI()
            : new ClientAPI();
        const idCandidate = matter._id || matter.id;
        const matNoCandidate =
          matter.matternumber || matter.matterNumber || matter.orderId;
        let details = null;

        // Skip API calls for commercial since we already have the data
        if (currentModule !== "commercial") {
          if (idCandidate && typeof api.getClientAllData === "function") {
            try {
              details = await api.getClientAllData(idCandidate);
            } catch {}
          }
          if (
            !details &&
            matNoCandidate &&
            typeof api.getClientAllData === "function"
          ) {
            try {
              details = await api.getClientAllData(matNoCandidate);
            } catch {}
          }
          if (!details && typeof api.getProjectFullData === "function") {
            try {
              details = await api.getProjectFullData(
                idCandidate || matNoCandidate
              );
            } catch {}
          }
        }

        let normalized = null;
        if (details) {
          normalized =
            details.client ||
            details.data ||
            (Array.isArray(details.clients)
              ? details.clients[0]
              : details.clients) ||
            details.project ||
            details;
        }

        if (normalized && mounted) {
          const merged = {
            ...(matter.__raw || {}),
            ...normalized,
            __fullyLoaded: true,
          };
          setStageData(merged);
        }
      } catch (err) {
        console.error("Error fetching matter details:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (isOpen) fetchMatterDetails();
    return () => {
      mounted = false;
    };
  }, [isOpen, matter, currentModule]);

  function formatDate(date) {
    if (!date) return "Not set";
    return moment(date).isValid()
      ? moment(date).format("DD MMMM YYYY")
      : "Not set";
  }

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Client Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
          Client Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-500 block">
              Client Name
            </label>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {display.client_name || display.clientName || "N/A"}
            </p>
          </div>
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-500 block">
              Client Email
            </label>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {display.clientEmail || display.email || "N/A"}
            </p>
          </div>
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-500 block">
              Client Type
            </label>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {display.clientType || display.type || display.ordertype || "N/A"}
            </p>
          </div>
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-500 block">
              Reference Number
            </label>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {display.matternumber ||
                display.matterNumber ||
                display.orderId ||
                "N/A"}
            </p>
          </div>
          {(currentModule === "vocat" || currentModule === "conveyancing" || currentModule === "commercial" || currentModule === "wills") && display.matterUrl && (
            <div className="min-w-0 sm:col-span-2">
              <label className="text-xs sm:text-sm font-medium text-gray-500 block">
                {currentModule === "commercial" ? "Project URL" : "Matter URL"}
              </label>
              <a 
                href={display.matterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm sm:text-lg font-semibold text-blue-600 hover:underline break-all"
              >
                {display.matterUrl}
              </a>
            </div>
          )}
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-500 block">
              Data Entry By
            </label>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {display.dataEntryBy || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Property/Business Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
          {currentModule === "commercial"
            ? "Business Information"
            : currentModule === "print media"
            ? "Billing Information"
            : "Property Information"}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-500 block">
              Address
            </label>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 break-words">
              {currentModule === "commercial"
                ? display.business_address || display.businessAddress || "N/A"
                : display.property_address || display.propertyAddress || "N/A"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium text-gray-500 block">
                State
              </label>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">
                {display.state || "N/A"}
              </p>
            </div>
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium text-gray-500 block">
                Postcode
              </label>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">
                {display.postcode || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-4 sm:space-y-6">
      {effectiveCostData && effectiveCostData.length > 0 ? (
        effectiveCostData.map((cost, index) => {
          const invoice = normalizeMoney(
            cost.invoiceAmount ?? cost.invoice_amount ?? cost.invoice
          );
          const quote = normalizeMoney(
            cost.quoteAmount ??
              cost.quote_amount ??
              cost.quote ??
              cost.quoteAmount?.$numberDecimal
          );
          const totalCosts = normalizeMoney(
            cost.totalCosts ??
              cost.total_costs ??
              cost.totalCosts?.$numberDecimal
          );
          const quoteType = (
            cost.quoteType ||
            cost.quotetype ||
            cost.quote_type ||
            ""
          ).toString();

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
                  Cost Breakdown
                </h3>

                <div className="flex flex-wrap gap-2 sm:gap-3 items-center text-xs sm:text-sm">
                  <div className="text-center p-1.5 sm:p-2 rounded bg-blue-50 min-w-[80px] sm:min-w-[100px]">
                    <div className="text-xs text-blue-600">Invoice Amount</div>
                    <div className="text-sm sm:text-lg font-bold text-blue-900">
                      {formatCurrency(invoice)}
                    </div>
                  </div>

                  <div className="text-center p-1.5 sm:p-2 rounded bg-green-50 min-w-[80px] sm:min-w-[100px]">
                    <div className="text-xs text-green-600">Quote Amount</div>
                    <div className="text-sm sm:text-lg font-bold text-green-900">
                      {formatCurrency(quote)}
                    </div>
                  </div>

                  <div className="text-center p-1.5 sm:p-2 rounded bg-purple-50 min-w-[80px] sm:min-w-[100px]">
                    <div className="text-xs text-purple-600">Total Costs</div>
                    <div className="text-sm sm:text-lg font-bold text-purple-900">
                      {formatCurrency(totalCosts)}
                    </div>
                  </div>

                  <div className="text-center p-1.5 sm:p-2 rounded bg-orange-50 min-w-[80px] sm:min-w-[100px]">
                    <div className="text-xs text-orange-600">Quote Type</div>
                    <div className="text-xs sm:text-sm font-semibold text-orange-900 capitalize truncate">
                      {quoteType || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                  Detailed Costs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {detailFieldsOrder.map((key) => {
                    const rawValue =
                      cost[key] ??
                      cost[key.replace("_", "")] ??
                      cost[key.replace(/_/g, "")];
                    if (rawValue === undefined || rawValue === null)
                      return null;
                    const numeric = normalizeMoney(rawValue);
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded text-sm"
                      >
                        <span className="text-gray-700 truncate mr-2">
                          {labelForKey(key)}
                        </span>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                          {formatCurrency(numeric)}
                        </span>
                      </div>
                    );
                  })}

                  {/* show any other numeric fields (except notes) */}
                  {Object.keys(cost)
                    .filter(
                      (k) =>
                        ![
                          ...detailFieldsOrder,
                          "invoiceAmount",
                          "quoteAmount",
                          "totalCosts",
                          "quoteType",
                          "id",
                          "matterNumber",
                        ].includes(k) && !/note/i.test(k)
                    )
                    .map((k) => {
                      const v = cost[k];
                      if (v === null || v === undefined) return null;
                      const n = normalizeMoney(v);
                      if (isNaN(n)) return null;
                      return (
                        <div
                          key={k}
                          className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded text-sm"
                        >
                          <span className="text-gray-700 truncate mr-2">
                            {labelForKey(k)}
                          </span>
                          <span className="font-semibold text-gray-900 whitespace-nowrap">
                            {formatCurrency(n)}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Render otherFee lines extracted from notes */}
                {otherFeeNotesFromNotes.length > 0 && (
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-2 sm:gap-3">
                    {otherFeeNotesFromNotes.map((text, i) => (
                      <div
                        key={`note-${i}`}
                        className="p-2 sm:p-3 bg-indigo-50 rounded border border-indigo-100 text-sm"
                      >
                        <div className="text-xs sm:text-sm text-indigo-700 font-semibold">
                          Other Fee (from notes)
                        </div>
                        <div className="text-xs sm:text-sm text-gray-800 break-words">
                          {text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border border-gray-200">
          <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-500 text-sm sm:text-lg">
            No financial data available
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
            Cost information hasn't been added yet
          </p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "financial":
        return renderFinancial();
      default:
        return renderOverview();
    }
  };

  if (!matter) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      {/* softer glass backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
          <DialogPanel className="w-full max-w-6xl transform overflow-hidden rounded-xl sm:rounded-2xl bg-white text-left align-middle shadow-xl transition-all max-h-[90vh] sm:max-h-[95vh] flex flex-col">
            {/* Header with logo */}
            <div className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="flex-shrink-0">
                    <img
                      src={
                        display.logo ||
                        display.__raw?.logo ||
                        "/logo-placeholder.png"
                      }
                      alt="logo"
                      className="h-8 w-8 sm:h-12 sm:w-12 rounded-md object-cover border border-white/30 bg-white"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-2xl font-bold text-white truncate">
                      {display.client_name || display.clientName || "N/A"}
                    </div>
                    <p className="text-blue-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                      <span className="font-medium truncate">
                        {display.matternumber ||
                          display.matterNumber ||
                          display.orderId ||
                          "N/A"}
                      </span>
                      <span className="mx-1 sm:mx-2">•</span>
                      <span className="truncate">
                        {currentModule === "commercial"
                          ? "Commercial Project"
                          : currentModule === "print media"
                          ? "Print Media Order"
                          : "Conveyancing Matter"}
                      </span>
                    </p>

                    <div className="mt-1 sm:mt-2 text-xs text-blue-100 flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-1">
                      <span className="truncate">
                        Type:{" "}
                        {display.clientType ||
                          display.type ||
                          display.ordertype ||
                          "N/A"}
                      </span>
                      <span className="truncate">
                        State: {display.state || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 flex-shrink-0">
              <nav
                className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 overflow-x-auto"
                aria-label="Tabs"
              >
                {[
                  { id: "overview", name: "Overview", icon: Calendar },
                  { id: "financial", name: "Financial", icon: DollarSign },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content - This is the only scrollable area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50">
              {isLoading || loading ? (
                <div className="flex justify-center items-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                renderContent()
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                {/* <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Last updated: {formatDate(display.updatedAt)}</span>
                </div> */}
                <div className="flex space-x-2 sm:space-x-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default MatterDetailsModal;
