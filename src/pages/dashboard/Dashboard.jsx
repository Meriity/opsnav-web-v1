import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  TrendingUp,
  Users,
  FolderOpen,
  Archive,
  Calendar as CalendarIcon,
  BarChart3,
  Clock,
  CheckCircle,
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Activity,
  UserCog,
  Building,
  Zap,
  Shield,
  Globe,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import Header from "../../components/layout/Header";
import CreateClientModal from "../../components/ui/CreateClientModal";
import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import { create } from "zustand";

// --- Calendar Imports ---
import moment from "moment";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../ArchivedClientStore/styles/calendar.css";

const localizer = momentLocalizer(moment);

// --- React Query Keys ---
const QUERY_KEYS = {
  DASHBOARD_DATA: "dashboardData",
  CALENDAR_EVENTS: "calendarEvents",
};

// --- Zustand Store ---
const useDashboardStore = create((set) => ({
  totalusers: 0,
  totalactive: 0,
  totalCompleted: 0,
  lastrecord: 0,
  loading: true,

  setDashboardData: (data, currentModule = "") =>
    set(() => {
      const sixMonthsData = Array.isArray(data.monthlyStats)
        ? data.monthlyStats
        : Array.isArray(data.last10MonthsStats)
        ? data.last10MonthsStats
        : [];

      const arr = sixMonthsData.slice(-6);
      const reversedArr = [...arr].reverse();
      const mostRecentWithData = reversedArr.find((item) => {
        const closedCount =
          item?.closedMatters ??
          item?.closedProjects ??
          item?.completedProjects ??
          item?.closedOrders ??
          item?.count ??
          item?.total ??
          0;
        return closedCount > 0;
      });

      const lastRec = mostRecentWithData
        ? mostRecentWithData.closedMatters ??
          mostRecentWithData.closedProjects ??
          mostRecentWithData.completedProjects ??
          mostRecentWithData.closedOrders ??
          mostRecentWithData.count ??
          mostRecentWithData.total ??
          0
        : 0;

      const totalCompleted =
        data.lifetimeTotals?.totalClosedOrders ||
        data.lifetimeTotals?.totalClosedProjects ||
        data.lifetimeTotals?.totalClosedMatters ||
        data.lifetimeTotals?.totalArchivedClients ||
        0;

      return {
        totalusers: data.lifetimeTotals?.totalUsers || 0,
        totalactive:
          data.lifetimeTotals?.totalActiveClients ||
          data.lifetimeTotals?.totalActiveProjects ||
          data.lifetimeTotals?.totalActiveOrders ||
          0,
        totalCompleted: totalCompleted,
        lastrecord: lastRec,
        loading: false,
      };
    }),

  setLoading: (loading) => set({ loading }),

  resetDashboard: () =>
    set({
      totalusers: 0,
      totalactive: 0,
      totalCompleted: 0,
      lastrecord: 0,
      loading: true,
    }),
}));

const CustomEvent = ({ event }) => {
  let eventTypeLabel;
  const currentModule = localStorage.getItem("currentModule");

  if (currentModule === "commercial") {
    eventTypeLabel = event.type || "Event";
  } else {
    switch (event.type) {
      case "buildingAndPest":
        eventTypeLabel = "B&P";
        break;
      case "financeApproval":
        eventTypeLabel = "Finance";
        break;
      case "titleSearch":
        eventTypeLabel = "T. Search";
        break;
      case "settlement":
        eventTypeLabel = "Settlement";
        break;
      case "deliveryDate":
        eventTypeLabel = "Delivery";
        break;
      default:
        eventTypeLabel = "Event";
    }
  }

  const identifier = event.matterNumber || event.orderId || event.projectCode;
  const typeInitial =
    currentModule === "commercial"
      ? event.clientType
        ? event.clientType.charAt(0)
        : ""
      : event.clientType
      ? event.clientType.charAt(0)
      : "";

  return (
    <div className="custom-event-content">
      <span className="event-title text-xs truncate">
        [{identifier}] - {eventTypeLabel} - [{typeInitial}]
      </span>
      {event.isApproved && (
        <CheckCircle className="w-3 h-3 text-green-500 ml-1 flex-shrink-0" />
      )}
    </div>
  );
};

class CalendarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          Calendar loading error.
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Helper Hooks ---
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

// Responsive Calendar Toolbar Component
const ResponsiveCalendarToolbar = ({
  label,
  onNavigate,
  onView,
  views,
  view: currentView,
}) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <div className="rbc-toolbar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 sm:p-4 mb-3 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl">
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      </div>

      <h2 className="text-sm sm:text-base font-semibold text-gray-800 text-center my-1 sm:my-0 truncate px-2">
        {label}
      </h2>

      <div className="flex items-center border border-gray-200 rounded-lg p-0.5 text-xs sm:text-sm bg-white">
        {(isMobile ? [Views.MONTH, Views.AGENDA] : views).map((viewName) => (
          <button
            key={viewName}
            onClick={() => onView(viewName)}
            className={`capitalize px-2 sm:px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              currentView === viewName
                ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {isMobile && viewName === Views.MONTH
              ? "Month"
              : isMobile && viewName === Views.AGENDA
              ? "List"
              : viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

// Floating Background Elements (inspired by Home.jsx)
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

// --- API Functions ---
const fetchDashboardData = async (currentModule, company) => {
  const clientApi = new ClientAPI();
  const commercialApi = new CommercialAPI();

  if (currentModule === "commercial") {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    try {
      const [sixMonthsRes, allTimeRes] = await Promise.all([
        fetch(`${baseUrl}/commercial/dashboard?range=sixMonths`, {
          method: "GET",
          headers: commercialApi.getHeaders(),
        }),
        fetch(`${baseUrl}/commercial/dashboard?range=all`, {
          method: "GET",
          headers: commercialApi.getHeaders(),
        }),
      ]);

      const sixMonthsData = await sixMonthsRes.json();
      const allTimeData = await allTimeRes.json();

      return {
        lifetimeTotals:
          sixMonthsData?.lifetimeTotals || allTimeData?.lifetimeTotals || {},
        monthlyStats: Array.isArray(sixMonthsData?.monthlyStats)
          ? sixMonthsData.monthlyStats
          : [],
        allTimeStats: Array.isArray(allTimeData?.monthlyStats)
          ? allTimeData.monthlyStats
          : [],
      };
    } catch (error) {
      console.error("Error fetching commercial dashboard data:", error);
      const fallbackData = await commercialApi.getDashboardData("combined");
      return {
        lifetimeTotals: fallbackData?.lifetimeTotals || {},
        monthlyStats: Array.isArray(fallbackData?.monthlyStats)
          ? fallbackData.monthlyStats
          : [],
        allTimeStats: [],
      };
    }
  } else if (company === "idg") {
    return await clientApi.getIDGDashboardData();
  } else {
    return await clientApi.getDashboardData();
  }
};

const fetchCalendarData = async (currentModule, company) => {
  const clientApi = new ClientAPI();
  const commercialApi = new CommercialAPI();

  let data;
  if (currentModule === "commercial") {
    data = await commercialApi.getCalendarDates();
  } else if (company === "vkl") {
    data = await clientApi.getCalendarDates();
  } else {
    data = await clientApi.getIDGCalendarDates();
  }

  return processCalendarData(data, currentModule, company);
};

const processCalendarData = (data, currentModule, company) => {
  const events = [];

  if (currentModule === "commercial") {
    let calendarItems = [];

    if (Array.isArray(data)) {
      calendarItems = data;
    } else if (data && Array.isArray(data.data)) {
      calendarItems = data.data;
    } else if (data && Array.isArray(data.clients)) {
      calendarItems = data.clients;
    } else if (data && Array.isArray(data.events)) {
      calendarItems = data.events;
    }

    calendarItems.forEach((item) => {
      const eventDate =
        item.eventDate || item.date || item.settlementDate || item.projectDate;
      if (eventDate) {
        const clientType =
          item.clientType || item.projectType || item.type || "Commercial";
        const eventType = item.eventType || "Event";
        const identifier =
          item.projectCode || item.matterNumber || item.id || "N/A";

        events.push({
          title: `[${identifier}] - ${eventType} - [${clientType}]`,
          start: moment(eventDate).toDate(),
          end: moment(eventDate).toDate(),
          allDay: true,
          type: eventType,
          clientType: clientType,
          projectType: item.projectType,
          projectCode: item.projectCode,
          matterNumber: item.matterNumber,
          id: identifier,
        });
      }
    });
  } else if (company === "vkl") {
    let calendarItems = [];

    if (Array.isArray(data)) {
      calendarItems = data;
    } else if (data && Array.isArray(data.data)) {
      calendarItems = data.data;
    } else if (data && Array.isArray(data.clients)) {
      calendarItems = data.clients;
    }

    calendarItems.forEach((item) => {
      if (item.buildingAndPestDate) {
        events.push({
          title: `[${item.matterNumber}] - B&P - [${item.clientType}]`,
          start: moment(item.buildingAndPestDate).toDate(),
          end: moment(item.buildingAndPestDate).toDate(),
          allDay: true,
          type: "buildingAndPest",
          clientType: item.clientType,
          matterNumber: item.matterNumber,
          isApproved: item.buildingAndPest?.toLowerCase() === "yes",
          id: item.matterNumber,
        });
      }
      if (item.financeApprovalDate) {
        events.push({
          title: `[${item.matterNumber}] - Finance - [${item.clientType}]`,
          start: moment(item.financeApprovalDate).toDate(),
          end: moment(item.financeApprovalDate).toDate(),
          allDay: true,
          type: "financeApproval",
          clientType: item.clientType,
          matterNumber: item.matterNumber,
          isApproved: item.financeApproval?.toLowerCase() === "yes",
          id: item.matterNumber,
        });
      }
      if (item.titleSearchDate) {
        events.push({
          title: `[${item.matterNumber}] - Title Search - [${item.clientType}]`,
          start: moment(item.titleSearchDate).toDate(),
          end: moment(item.titleSearchDate).toDate(),
          allDay: true,
          type: "titleSearch",
          clientType: item.clientType,
          matterNumber: item.matterNumber,
          isApproved: item.titleSearch?.toLowerCase() === "yes",
          id: item.matterNumber,
        });
      }
      if (item.settlementDate) {
        events.push({
          title: `[${item.matterNumber}] - Settlement - [${item.clientType}]`,
          start: moment(item.settlementDate).toDate(),
          end: moment(item.settlementDate).toDate(),
          allDay: true,
          type: "settlement",
          clientType: item.clientType,
          matterNumber: item.matterNumber,
          id: item.matterNumber,
        });
      }
    });
  } else {
    let calendarItems = [];

    if (Array.isArray(data)) {
      calendarItems = data;
    } else if (data && Array.isArray(data.data)) {
      calendarItems = data.data;
    } else if (data && Array.isArray(data.orders)) {
      calendarItems = data.orders;
    }

    calendarItems.forEach((item) => {
      if (item.deliveryDate) {
        events.push({
          title: `[${item.orderId}] - ${item.orderType || "Order"}`,
          start: moment(item.deliveryDate).toDate(),
          end: moment(item.deliveryDate).toDate(),
          allDay: true,
          type: "deliveryDate",
          clientType: item.orderType,
          orderId: item.orderId,
          id: item.orderId,
        });
      }
    });
  }

  return events
    .filter((e) => e && e.start && e.end)
    .map((e) => ({
      title:
        e.title ||
        `[${e.orderId || e.projectCode || e.matterNumber || "NoID"}]`,
      ...e,
    }));
};

// Responsive Stat Card Component - Enhanced with Home.jsx style
const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  color = "blue",
  loading,
}) => {
  const isPositive = change >= 0;
  const { width } = useWindowSize();
  const isMobile = width < 640;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white/90 backdrop-blur-lg border border-white/50 shadow-lg hover:shadow-xl dashboard-card group"
    >
      {/* Gradient background inspired by Home.jsx */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          color === "blue"
            ? "from-[#2E3D99]/5 to-[#1D97D7]/10"
            : color === "green"
            ? "from-emerald-500/5 to-teal-500/10"
            : color === "purple"
            ? "from-violet-500/5 to-purple-500/10"
            : "from-amber-500/5 to-orange-500/10"
        }`}
      />
      <div
        className={`absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16 opacity-10 bg-gradient-to-r ${
          color === "blue"
            ? "from-[#2E3D99] to-[#1D97D7]"
            : color === "green"
            ? "from-emerald-500 to-teal-500"
            : color === "purple"
            ? "from-violet-500 to-purple-500"
            : "from-amber-500 to-orange-500"
        }`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${
              color === "blue"
                ? "from-[#2E3D99]/20 to-[#1D97D7]/30 group-hover:from-[#2E3D99]/30 group-hover:to-[#1D97D7]/40"
                : color === "green"
                ? "from-emerald-500/20 to-teal-500/30 group-hover:from-emerald-500/30 group-hover:to-teal-500/40"
                : color === "purple"
                ? "from-violet-500/20 to-purple-500/30 group-hover:from-violet-500/30 group-hover:to-purple-500/40"
                : "from-amber-500/20 to-orange-500/30 group-hover:from-amber-500/30 group-hover:to-orange-500/40"
            }`}
          >
            <Icon
              className={`w-4 h-4 sm:w-5 sm:h-6 ${
                color === "blue"
                  ? "text-[#2E3D99]"
                  : color === "green"
                  ? "text-emerald-600"
                  : color === "purple"
                  ? "text-violet-600"
                  : "text-amber-600"
              }`}
            />
          </motion.div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
                isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              <span className="font-semibold">{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide truncate">
            {title}
          </h3>
          {loading ? (
            <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              {value.toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100/50">
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="truncate">Updated just now</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Performance Trend Chart Component
const PerformanceTrendChart = ({
  data,
  title,
  color = "#2E3D99",
  loading,
  isMobile,
}) => {
  return (
    <div className="h-[180px] sm:h-[220px]">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-4 border-b-4 border-[#2E3D99]" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`trend-gradient-${color}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 9 : 11, fill: "#6B7280" }}
              interval={isMobile ? 2 : 1}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 9 : 11, fill: "#6B7280" }}
              width={isMobile ? 25 : 30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: isMobile ? "11px" : "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#trend-gradient-${color})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const {
    totalusers,
    totalactive,
    totalCompleted,
    lastrecord,
    loading,
    setDashboardData,
    setLoading,
  } = useDashboardStore();

  const [createuser, setcreateuser] = useState(false);
  const [createOrder, setcreateOrder] = useState(false);
  const [createProject, setCreateProject] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [chartView, setChartView] = useState("last6Months");
  const [allChartData, setAllChartData] = useState({
    monthlyStats: [],
    allTimeStats: [],
  });
  const [currentChartData, setCurrentChartData] = useState([]);
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isLaptop = width >= 1024;
  const isSmallLaptop = width >= 1024 && width < 1280;

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");
  const userRole = localStorage.getItem("userRole") || "admin";

  // Set calendar view based on screen size
  useEffect(() => {
    if (isMobile) {
      setCalendarView(Views.AGENDA);
    } else if (isTablet) {
      setCalendarView(Views.MONTH);
    } else {
      setCalendarView(Views.MONTH);
    }
  }, [isMobile, isTablet]);

  // Use React Query for dashboard data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_DATA, currentModule, company],
    queryFn: () => fetchDashboardData(currentModule, company),
    enabled: !!currentModule && !!company,
  });

  // Use React Query for calendar events
  const {
    data: calendarEvents = [],
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, currentModule, company],
    queryFn: () => fetchCalendarData(currentModule, company),
    enabled: !!currentModule && !!company,
  });

  // Process dashboard data when it loads
  useEffect(() => {
    if (dashboardData) {
      setDashboardData(dashboardData, currentModule);
      setAllChartData({
        monthlyStats: Array.isArray(dashboardData.monthlyStats)
          ? dashboardData.monthlyStats
          : Array.isArray(dashboardData.last10MonthsStats)
          ? dashboardData.last10MonthsStats
          : [],
        allTimeStats: Array.isArray(dashboardData.allTimeStats)
          ? dashboardData.allTimeStats
          : [],
      });
    }
  }, [dashboardData, currentModule, setDashboardData]);

  // Handle errors
  useEffect(() => {
    if (dashboardError) {
      toast.error("Failed to load dashboard data.");
    }
    if (calendarError) {
      toast.error("Could not load calendar dates.");
    }
  }, [dashboardError, calendarError]);

  // Set loading state based on queries
  useEffect(() => {
    setLoading(isDashboardLoading);
  }, [isDashboardLoading, setLoading]);

  // Handle event selection from calendar
  const handleEventSelect = useCallback(
    (event) => {
      const currentModule = localStorage.getItem("currentModule");
      const company = localStorage.getItem("company");
      const userRole = localStorage.getItem("userRole") || "admin";

      let matterNumber = "";

      if (currentModule === "commercial") {
        matterNumber = event.projectCode || event.matterNumber || event.id;
      } else if (company === "idg") {
        matterNumber = event.orderId || event.clientId || event.id;
      } else {
        matterNumber = event.matterNumber || event.clientId || event.id;
      }

      if (
        matterNumber &&
        matterNumber !== "Untitled" &&
        matterNumber !== "NoID"
      ) {
        sessionStorage.setItem("lastSelectedEvent", JSON.stringify(event));
        navigate(`/${userRole}/client/stages/${matterNumber}`);
      } else {
        toast.warning("Cannot navigate: Invalid matter identifier");
      }
    },
    [navigate]
  );

  // Event styling with clickable cursor
  const eventStyleGetter = useCallback(
    (event) => {
      let backgroundColor = "#00aeef";

      if (currentModule === "commercial") {
        backgroundColor = "#10B981";
      } else if (event.type === "buildingAndPest") {
        backgroundColor = "#B24592";
      } else if (event.type === "financeApproval") {
        backgroundColor = "#f83600";
      } else if (event.type === "titleSearch") {
        backgroundColor = "#34495E";
      } else if (event.type === "settlement") {
        backgroundColor = "#8E44AD";
      } else if (event.type === "deliveryDate") {
        backgroundColor = "#F39C12";
      }

      return {
        style: {
          backgroundColor,
          borderRadius: "4px",
          opacity: 0.9,
          color: "white",
          border: "none",
          padding: "1px 3px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: isMobile ? "10px" : "12px",
        },
      };
    },
    [currentModule, isMobile]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let closedLabel;
      if (currentModule === "commercial") {
        closedLabel = "Completed Projects";
      } else if (company === "idg") {
        closedLabel = "Closed Orders";
      } else {
        closedLabel = "Closed Matters";
      }

      return (
        <div className="bg-white border border-gray-200 p-2 sm:p-3 rounded-lg shadow-lg text-xs sm:text-sm">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-gray-600">{`${closedLabel}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const dayPropGetter = useCallback(
    (date) => ({
      className:
        moment(date).month() !== moment(calendarDate).month()
          ? "off-month-day"
          : "",
    }),
    [calendarDate]
  );

  const handleNavigate = (newDate) => setCalendarDate(newDate);

  const { views } = useMemo(() => {
    if (isMobile) {
      return { views: [Views.AGENDA, Views.MONTH] };
    } else if (isTablet) {
      return { views: [Views.MONTH, Views.WEEK] };
    }
    return { views: [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA] };
  }, [isMobile, isTablet]);

  // Calculate current period total based on chart view
  const chartPeriodTotal = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return 0;
    return currentChartData.reduce((sum, item) => {
      const closedCount =
        item.closedMatters ??
        item.closedProjects ??
        item.completedProjects ??
        item.closedOrders ??
        item.count ??
        item.total ??
        0;
      return sum + closedCount;
    }, 0);
    return currentChartData.reduce((sum, item) => {
      const closedCount =
        item.closedMatters ??
        item.closedProjects ??
        item.completedProjects ??
        item.closedOrders ??
        item.count ??
        item.total ??
        0;
      return sum + closedCount;
    }, 0);
  }, [currentChartData]);


  useEffect(() => {
    if (!allChartData.monthlyStats.length && !allChartData.allTimeStats.length)
      return;

    let sourceData;
    let isAllTimeView = chartView === "allTime";

    if (isAllTimeView) {
      // For "All Time" view on mobile/tablet, show aggregated yearly data instead of all months
      const allTimeData = allChartData.allTimeStats || [];
      if (isMobile || isTablet) {
        // Group by year for mobile/tablet
        const yearlyData = {};
        allTimeData.forEach((item) => {
          const year = item.year || new Date().getFullYear();
          if (!yearlyData[year]) {
            yearlyData[year] = {
              name: year.toString(),
              closedMatters: 0,
              year: year,
            };
          }
          yearlyData[year].closedMatters +=
            item.closedMatters ??
            item.closedProjects ??
            item.completedProjects ??
            item.closedOrders ??
            item.count ??
            item.total ??
            0;
        });
        sourceData = Object.values(yearlyData).slice(-5); // Show last 5 years
      } else {
        // For desktop, show all data but with smart labeling
        sourceData = allTimeData.slice(-12); // Show last 12 periods
      }
    } else {
      // For "Last 6 Months" view
      sourceData = (allChartData.monthlyStats || []).slice(-6);
    }

    let formattedData;

    if (currentModule === "commercial") {
      formattedData = sourceData.map((item, index) => {
        const closedCount =
          item.closedProjects ??
          item.completedProjects ??
          item.count ??
          item.total ??
          item.closedMatters ??
          item.value ??
          item.closedMatters ?? // For yearly aggregated data
          0;

        let name;
        if (isAllTimeView && (isMobile || isTablet)) {
          // For mobile/tablet all time view, show years
          name = item.name || item.year || `Year ${index + 1}`;
        } else if (chartView === "last6Months") {
          // For 6 months view
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthIndex = item.month ? monthNames.indexOf(item.month) : -1;
          name =
            monthIndex !== -1
              ? item.month
              : item.name || item.label || `M${index + 1}`;
        } else {
          // For desktop all time view
          name =
            item.month && item.year
              ? `${item.month} ${item.year}`.trim()
              : item.name || item.label || `P${index + 1}`;
        }

        return {
          ...item,
          name: name,
          closedMatters: closedCount,
        };
      });
    } else if (company === "vkl") {
      formattedData = sourceData.map((item, index) => {
        let name;
        if (isAllTimeView && (isMobile || isTablet)) {
          name = item.name || item.year || `Year ${index + 1}`;
        } else if (chartView === "last6Months") {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthIndex = item.month ? monthNames.indexOf(item.month) : -1;
          name = monthIndex !== -1 ? item.month : item.name || `M${index + 1}`;
        } else {
          name =
            item.month && item.year
              ? `${item.month} ${item.year}`.trim()
              : `P${index + 1}`;
        }

        return {
          ...item,
          name: name,
          closedMatters: item.closedMatters ?? item.count ?? item.total ?? 0,
        };
      });
    } else if (company === "idg") {
      formattedData = sourceData.map((item, index) => {
        let name;
        if (isAllTimeView && (isMobile || isTablet)) {
          name = item.name || item.year || `Year ${index + 1}`;
        } else if (chartView === "last6Months") {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthIndex = item.month ? monthNames.indexOf(item.month) : -1;
          name = monthIndex !== -1 ? item.month : item.name || `M${index + 1}`;
        } else {
          name =
            item.month && item.year
              ? `${item.month} ${item.year}`.trim()
              : `P${index + 1}`;
        }

        return {
          ...item,
          name: name,
          closedMatters: item.closedOrders ?? item.count ?? item.total ?? 0,
        };
      });
    }

    setCurrentChartData(formattedData || []);
  }, [chartView, allChartData, currentModule, company, isMobile, isTablet]);

  const getAddButtonLabel = () => {
    if (currentModule === "commercial") return "New Project";
    if (company === "idg") return "New Order";
    return "New Client";
  };

  const handleAddButtonClick = () => {
    if (currentModule === "commercial") {
      setCreateProject(true);
    } else if (company === "idg") {
      setcreateOrder(true);
    } else {
      setcreateuser(true);
    }
  };

  // Performance trend data for the area chart
  const performanceTrendData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 78 },
    { name: "Mar", value: 85 },
    { name: "Apr", value: 72 },
    { name: "May", value: 90 },
    { name: "Jun", value: 68 },
    { name: "Jul", value: 80 },
    { name: "Aug", value: 75 },
    { name: "Sep", value: 88 },
    { name: "Oct", value: 92 },
    { name: "Nov", value: 85 },
    { name: "Dec", value: 95 },
  ];

  if (loading && isDashboardLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-[#00AEEF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden">
      {/* Floating Background Elements (inspired by Home.jsx) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        {/* Grid Background (inspired by Home.jsx hero section) */}
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
        <style>{`
          .dashboard-card {
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
            will-change: transform;
          }
          .dashboard-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(16,24,40,0.12), 0 8px 16px rgba(16,24,40,0.06);
            border-color: rgba(46, 61, 153, 0.15);
          }
          .stat-icon-accent {
            box-shadow: inset 0 -1px 0 rgba(255,255,255,0.12);
          }
          .time-toggler-button {
            transition: all 0.3s ease;
          }
          .time-toggler-button:hover {
            transform: translateY(-1px);
          }
          @media (max-width: 640px) {
            .dashboard-grid { display: none; }
          }
        `}</style>

        <Header />

        <main className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
          {/* Welcome Section - Enhanced with Home.jsx styling */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    OpsNav
                  </span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-2 truncate">
                  Your operations. Simplified. Amplified.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddButtonClick}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">
                    {getAddButtonLabel()}
                  </span>
                  <span className="xs:hidden">{localStorage.getItem("company")==="idg" ? "New Order" : "New Client"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid - Enhanced styling */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Users"
              value={totalusers}
              // change={12}
              icon={UserCog}
              color="blue"
              loading={loading}
            />
            <StatCard
              title={
                currentModule === "commercial"
                  ? "Projects"
                  : company === "idg"
                  ? "Orders"
                  : "Clients"
              }
              value={totalactive}
              // change={8}
              icon={
                currentModule === "commercial"
                  ? Building
                  : company === "idg"
                  ? FolderOpen
                  : Users
              }
              color="green"
              loading={loading}
            />
            <StatCard
              title={
                currentModule === "commercial"
                  ? "Completed"
                  : company === "idg"
                  ? "Completed"
                  : "Archived"
              }
              value={totalCompleted}
              // change={-3}
              icon={Archive}
              color="purple"
              loading={loading}
            />
            <StatCard
              title="Last Month"
              value={lastrecord}
              // change={24}
              icon={TrendingUp}
              color="orange"
              loading={loading}
            />
          </div>

          {/* Main Content Grid - Enhanced with Home.jsx card styling */}
          <div
            className={`${
              isLaptop
                ? "space-y-6"
                : "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
            }`}
          >
            {/* Calendar Section - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl hover:shadow-2xl dashboard-card"
            >
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                        Calendar
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Important dates & deadlines
                    </p>
                  </div>
                </div>
                <div
                  className={`${
                    isLaptop
                      ? "h-[500px] overflow-visible"
                      : "h-[350px] sm:h-[400px] overflow-visible"
                  }`}
                >
                  <style>{`
                    .rbc-overlay, .rbc-popup, .rbc-overlay * , .rbc-popup * {
                      z-index: 99999 !important;
                    }
                    .rbc-calendar, .rbc-btn-group {
                      overflow: visible !important;
                    }
                  `}</style>
                  <CalendarErrorBoundary>
                    <BigCalendar
                      localizer={localizer}
                      events={
                        Array.isArray(calendarEvents) ? calendarEvents : []
                      }
                      titleAccessor={(event) =>
                        event?.title ||
                        `[${
                          event?.orderId ||
                          event?.projectCode ||
                          event?.matterNumber ||
                          "Untitled"
                        }]`
                      }
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      popup
                      onNavigate={handleNavigate}
                      dayPropGetter={dayPropGetter}
                      views={views}
                      view={calendarView}
                      onView={setCalendarView}
                      date={calendarDate}
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleEventSelect}
                      components={{
                        event: CustomEvent,
                        toolbar: ResponsiveCalendarToolbar,
                      }}
                    />
                  </CalendarErrorBoundary>
                </div>
              </div>
            </motion.div>

            {/* Charts Section - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl hover:shadow-2xl dashboard-card"
            >
              <div className="p-3 sm:p-4 md:p-6">
                {/* Completion Stats Chart with Time Toggle */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                          {currentModule === "commercial"
                            ? "Project Completion"
                            : company === "vkl"
                            ? "Matter Completion"
                            : company === "idg"
                            ? "Order Completion"
                            : "Completion Statistics"}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Track completion rates over time
                      </p>
                    </div>
                    {/* Time Toggle - Enhanced */}
                    <div className="flex items-center border border-gray-200 rounded-lg p-0.5 text-xs sm:text-sm bg-white shadow-sm">
                      <button
                        onClick={() => setChartView("last6Months")}
                        className={`time-toggler-button px-2 sm:px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                          chartView === "last6Months"
                            ? "bg-[#FB4A50] text-white shadow"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isMobile ? "6M" : "6 Months"}
                      </button>
                      <button
                        onClick={() => setChartView("allTime")}
                        className={`time-toggler-button px-2 sm:px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                          chartView === "allTime"
                            ? "bg-[#FB4A50] text-white shadow"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isMobile ? "All" : "All Time"}
                      </button>
                    </div>
                  </div>

                  {/* Completion Chart */}
                  <div
                    className={`${
                      isLaptop ? "h-[300px]" : "h-[250px] sm:h-[280px]"
                    }`}
                  >
                    {isDashboardLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-4 border-b-4 border-[#00AEEF]" />
                      </div>
                    ) : currentChartData && currentChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={currentChartData}
                          margin={{
                            top: 10,
                            right: isMobile ? 0 : 10,
                            left: isMobile ? -20 : -10,
                            bottom: isMobile
                              ? chartView === "allTime"
                                ? 30
                                : 20
                              : 40,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(0,0,0,0.05)"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: isMobile
                                ? chartView === "allTime"
                                  ? 8
                                  : 10
                                : 12,
                              fill: "#6B7280",
                            }}
                            interval={
                              isMobile && chartView === "allTime"
                                ? 0
                                : "preserveStartEnd"
                            }
                            angle={
                              isMobile && chartView === "allTime" ? -45 : 0
                            }
                            textAnchor={
                              isMobile && chartView === "allTime"
                                ? "end"
                                : "middle"
                            }
                            height={
                              isMobile
                                ? chartView === "allTime"
                                  ? 60
                                  : 50
                                : 30
                            }
                            tickMargin={isMobile ? 5 : 10}
                          />
                          <YAxis
                            tick={{
                              fontSize: isMobile ? 10 : 12,
                              fill: "#6B7280",
                            }}
                            allowDecimals={false}
                            width={isMobile ? 30 : 40}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="closedMatters"
                            fill="url(#barGradient)"
                            barSize={
                              isMobile
                                ? chartView === "allTime"
                                  ? 15
                                  : 20
                                : 30
                            }
                            radius={[4, 4, 0, 0]}
                          />
                          <defs>
                            <linearGradient
                              id="barGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#2E3D99" />
                              <stop offset="100%" stopColor="#1D97D7" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mb-3" />
                        <div className="text-sm sm:text-base mb-1">
                          No chart data
                        </div>
                        <div className="text-xs sm:text-sm text-center text-gray-400">
                          <div>Module: {currentModule}</div>
                          <div>Company: {company}</div>
                          <div>View: {chartView}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Stats - Enhanced */}
                  {chartView === "last6Months" && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 rounded-xl border border-[#2E3D99]/10">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">
                            Total in last 6 months
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">
                            {chartPeriodTotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">
                            Last month achievement
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">
                            {lastrecord || totalCompleted}
                            <span className="text-xs sm:text-sm font-normal text-gray-600 ml-1">
                              {currentModule === "commercial"
                                ? "projects"
                                : company === "vkl"
                                ? "matters"
                                : company === "idg"
                                ? "orders"
                                : "completed"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Time View Note for Mobile/Tablet */}
                  {chartView === "allTime" && (isMobile || isTablet) && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                      <p className="font-medium">Note:</p>
                      <p>
                        Showing yearly data for better visibility on smaller
                        screens
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Metric Cards - Enhanced with gradient styling from Home.jsx */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
          >
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">
                    Completion Rate
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {totalactive > 0
                      ? (
                          (totalCompleted / (totalactive + totalCompleted)) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 opacity-80" />
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        totalactive > 0
                          ? (
                              (totalCompleted /
                                (totalactive + totalCompleted)) *
                              100
                            ).toFixed(1)
                          : 0
                      }%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Active</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {totalactive.toLocaleString()}
                  </p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 opacity-80" />
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm opacity-90">
                  Currently in progress
                </p>
              </div>
            </div>

            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">
                    Monthly Growth
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    +{lastrecord || 0}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 opacity-80" />
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm opacity-90">New this month</p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      <CreateClientModal
        createType="client"
        companyName={company}
        isOpen={createuser}
        setIsOpen={() => setcreateuser(false)}
      />
      <CreateClientModal
        createType="order"
        companyName={company}
        isOpen={createOrder}
        setIsOpen={() => setcreateOrder(false)}
      />
      <CreateClientModal
        createType="project"
        companyName={company}
        isOpen={createProject}
        setIsOpen={() => setCreateProject(false)}
      />
    </div>
  );
}

export default Dashboard;
