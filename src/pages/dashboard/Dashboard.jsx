import Plus from "../../icons/Button icons/Icon-Color.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ClientAPI from "../../api/userAPI";
import CommercialAPI from "../../api/commercialAPI";
import { create } from "zustand";
import Header from "../../components/layout/Header";
import CreateClientModal from "../../components/ui/CreateClientModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// --- Calendar Imports ---
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
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
      // Get the available 6 months data (could be monthlyStats or last10MonthsStats)
      const sixMonthsData = Array.isArray(data.monthlyStats)
        ? data.monthlyStats
        : Array.isArray(data.last10MonthsStats)
        ? data.last10MonthsStats
        : [];

      // Get the last 6 months of data
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

      // Calculate total completed from lifetime totals
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

  // Reset function
  resetDashboard: () =>
    set({
      totalusers: 0,
      totalactive: 0,
      totalCompleted: 0,
      lastrecord: 0,
      loading: true,
    }),
}));

const CheckmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="checkmark-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={4}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CustomEvent = ({ event }) => {
  let eventTypeLabel;
  const currentModule = localStorage.getItem("currentModule");

  if (currentModule === "commercial") {
    // For commercial, use the event type directly
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

  // For commercial, use clientType; for others, use the existing logic
  const typeInitial =
    currentModule === "commercial"
      ? event.clientType
        ? event.clientType.charAt(0)
        : ""
      : event.clientType
      ? event.clientType.charAt(0)
      : "";

  const displayTitle = `[${identifier}] - ${eventTypeLabel} - [${typeInitial}]`;

  return (
    <div className="custom-event-content">
      <span className="event-title">{displayTitle}</span>
      {event.isApproved && <CheckmarkIcon />}
    </div>
  );
};

const CustomAgendaEvent = ({ event }) => (
  <div className="mb-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 text-sm sm:text-base">
          {event?.title || "Untitled"}
        </span>
        <span className="text-xs text-gray-500 mt-1">
          {event?.start ? moment(event.start).format("DD MMM YYYY") : ""}
        </span>
      </div>
      <span
        className={`mt-2 sm:mt-0 text-xs sm:text-sm px-3 py-1 rounded-full self-start sm:self-center ${
          event.type === "buildingAndPest"
            ? "bg-purple-100 text-purple-700"
            : event.type === "financeApproval"
            ? "bg-orange-100 text-orange-700"
            : event.type === "commercial"
            ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {event?.clientType || event?.projectType || "Event"}
      </span>
    </div>
  </div>
);

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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          Something went wrong loading the calendar.
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

// --- Custom Toolbar ---
const ResponsiveCalendarToolbar = ({
  label,
  onNavigate,
  onView,
  views,
  view: currentView,
}) => {
  return (
    <div className="rbc-toolbar flex flex-col sm:flex-row items-center justify-between p-2 mb-3">
      <div className="flex items-center justify-center gap-2.5 w-full sm:w-auto mb-2 sm:mb-0">
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          aria-label="Previous"
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="mx-2 px-4 py-1.5 text-sm font-semibold border rounded-md hover:bg-gray-200 transition"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          aria-label="Next"
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="text-lg font-bold text-gray-800 order-first sm:order-0 mb-2 sm:mb-0">
        {label}
      </div>
      <div className="flex items-center border border-gray-200 rounded-lg p-1 text-sm bg-white">
        {views.map((viewName) => (
          <button
            key={viewName}
            onClick={() => onView(viewName)}
            className={`capitalize px-3 py-1 rounded-md transition-colors ${
              currentView === viewName
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {viewName}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- API Functions for React Query ---
const fetchDashboardData = async (currentModule, company) => {
  const clientApi = new ClientAPI();
  const commercialApi = new CommercialAPI();

  if (currentModule === "commercial") {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      // Fetch both endpoints in parallel
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
      // Fallback to API method
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

  // Fix for commercial module calendar data
  if (currentModule === "commercial") {
    // Handle different response formats for commercial
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
      // Handle different date field names for commercial
      const eventDate =
        item.eventDate || item.date || item.settlementDate || item.projectDate;

      if (eventDate) {
        // Get the proper client type for commercial
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
    // Handle VKL calendar data
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
    // Handle IDG calendar data
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

  const safeEvents = events
    .filter((e) => e && e.start && e.end)
    .map((e) => ({
      title:
        e.title ||
        `[${e.orderId || e.projectCode || e.matterNumber || "NoID"}]`,
      ...e,
    }));

  return safeEvents;
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
    monthlyStats: [], // Changed from sixMonths to monthlyStats
    allTimeStats: [],
  });
  const [currentChartData, setCurrentChartData] = useState([]);
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");
  const userRole = localStorage.getItem("userRole") || "admin";

  // Set calendar view based on screen size
  useEffect(() => {
    setCalendarView(isMobile ? Views.AGENDA : Views.MONTH);
  }, [isMobile]);

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
      if (currentModule === "commercial") {
        console.log("Commercial Dashboard Data:", dashboardData);
        if (
          dashboardData.monthlyStats &&
          dashboardData.monthlyStats.length > 0
        ) {
          const lastSix = dashboardData.monthlyStats.slice(-6);
          const reversed = [...lastSix].reverse();
          const mostRecent = reversed.find((item) => item?.closedMatters > 0);
          console.log("Most recent with data:", mostRecent);
          console.log("Expected lastrecord:", mostRecent?.closedMatters || 0);
        }
      }

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

      // Determine matter number based on module and available data
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
        // Store event context for the stages page
        sessionStorage.setItem("lastSelectedEvent", JSON.stringify(event));

        // Navigate to existing StagesLayout with the matter number
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
          padding: "2px 5px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
      };
    },
    [currentModule]
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
        <div className="bg-white border border-[#00AEEF] p-2 rounded shadow text-xs">
          <p className="font-semibold">{label}</p>
          <p>{`${closedLabel}: ${payload[0].value}`}</p>
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

  const { views, defaultView } = useMemo(() => {
    if (isMobile) {
      return { views: [Views.AGENDA, Views.DAY], defaultView: Views.AGENDA };
    }
    return {
      views: [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA],
      defaultView: Views.MONTH,
    };
  }, [isMobile]);

  // Calculate current period total based on chart view
  const chartPeriodTotal = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return 0;
    return currentChartData.reduce(
      (sum, item) => {
        const closedCount = 
          item.closedMatters ??
          item.closedProjects ??
          item.completedProjects ??
          item.closedOrders ??
          item.count ??
          item.total ??
          0;
        return sum + closedCount;
      },
      0
    );
  }, [currentChartData]);

  // Handle chart data processing
  useEffect(() => {
    if (!allChartData.monthlyStats.length && !allChartData.allTimeStats.length)
      return;

    const sourceData =
      chartView === "last6Months"
        ? (allChartData.monthlyStats || []).slice(-6) // Changed from slice(-10) to slice(-6)
        : allChartData.allTimeStats || [];

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
          0;

        const name =
          chartView === "last6Months"
            ? item.month || item.name || item.label || `Month ${index + 1}`
            : `${item.month || ""} ${item.year || ""}`.trim() ||
              item.name ||
              item.label ||
              `Period ${index + 1}`;

        return {
          ...item,
          name: name,
          closedMatters: closedCount,
        };
      });
    } else if (company === "vkl") {
      formattedData = sourceData.map((item, index) => ({
        ...item,
        name:
          chartView === "last6Months"
            ? item.month || item.name || `Month ${index + 1}`
            : `${item.month || ""} ${item.year || ""}`.trim() ||
              `Period ${index + 1}`,
        closedMatters: item.closedMatters ?? item.count ?? item.total ?? 0,
      }));
    } else if (company === "idg") {
      formattedData = sourceData.map((item, index) => ({
        ...item,
        name:
          chartView === "last6Months"
            ? item.month || item.name || `Month ${index + 1}`
            : `${item.month || ""} ${item.year || ""}`.trim() ||
              `Period ${index + 1}`,
        closedMatters: item.closedOrders ?? item.count ?? item.total ?? 0,
      }));
    }

    setCurrentChartData(formattedData || []);
  }, [chartView, allChartData, currentModule, company]);

  const StatCard = ({ icon, label, value, isArchived = false }) => {
    const displayValue = isArchived ? chartPeriodTotal : value;

    return (
      <div className="flex items-center p-4 bg-white rounded-lg shadow-sm w-full">
        <img src={icon} alt={label} className="h-10 w-10 mr-4" />
        <div>
          <p className="text-3xl font-bold">
            {displayValue !== null ? displayValue : 0}
          </p>
          <p className="text-sm text-gray-600">{label}</p>
          {isArchived && (
            <p className="text-xs text-gray-500 mt-1">
              ({chartView === "last6Months" ? "Last 6 Months" : "All Time"})
            </p>
          )}
        </div>
      </div>
    );
  };

  const getAddButtonLabel = () => {
    if (currentModule === "commercial") return "Add New Project";
    if (company === "idg") return "Add New Order";
    return "Add New Client";
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

  if (loading && isDashboardLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 p-2">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Welcome Banner */}
          <div className="bg-[#A6E7FF] p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold">Welcome to Opsnav</h1>
            <p className="text-sm mt-1 text-gray-800 max-w-5xl">
              Your operations. Simplified. Amplified.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2"
              onClick={() => setcreateuser(true)}
            >
              <img src={Plus} alt="" className="w-5" />
              <span>Add New Client</span>
            </button>
            {company === "idg" && (
              <button
                className="ml-4 mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2"
                onClick={() => setcreateOrder(true)}
              >
                <img src={Plus} alt="" className="w-5" />
                <span>Add New Order</span>
              </button>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Important Dates
            </h2>
            <div className="h-[65vh] min-h-[500px]">
              <CalendarErrorBoundary>
                <Calendar
                  localizer={localizer}
                  events={Array.isArray(calendarEvents) ? calendarEvents : []}
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
                    agenda: { event: CustomAgendaEvent },
                    toolbar: ResponsiveCalendarToolbar,
                  }}
                />
              </CalendarErrorBoundary>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={ManageUsersIcon}
              label="Total Users"
              value={totalusers}
            />
            <StatCard
              icon={ViewClientsIcon}
              label={
                currentModule === "commercial"
                  ? "Total Projects"
                  : company === "idg"
                  ? "Total Orders"
                  : "Total Clients"
              }
              value={totalactive}
            />
            <StatCard
              icon={ArchivedChatsIcon}
              label={
                currentModule === "commercial"
                  ? "Completed Projects"
                  : company === "idg"
                  ? "Total Completed Orders"
                  : "Total Archived Clients"
              }
              value={totalCompleted}
              isArchived={true}
            />
          </div>

          {/* Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-lg font-semibold text-gray-700">
                {currentModule === "commercial"
                  ? "Completed Projects"
                  : company === "vkl"
                  ? "Closed Matters"
                  : company === "idg"
                  ? "Closed Orders"
                  : "Closed"}{" "}
                ({chartView === "last6Months" ? "Last 6 Months" : "All Time"})
              </h2>
              <div className="flex items-center border border-gray-200 rounded-lg p-1 text-sm bg-gray-50">
                <button
                  onClick={() => setChartView("last6Months")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    chartView === "last6Months"
                      ? "bg-blue-500 text-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setChartView("allTime")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    chartView === "allTime"
                      ? "bg-blue-500 text-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            {isDashboardLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#00AEEF]" />
                <span className="ml-4 text-lg font-medium text-gray-600">
                  Loading Chart...
                </span>
              </div>
            ) : currentChartData && currentChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={currentChartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="closedMatters"
                      fill="#00AEEF"
                      barSize={30}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {chartView === "last6Months" && (
                  <p className="text-center text-md font-semibold mt-4 text-gray-800">
                    {lastrecord || totalCompleted}{" "}
                    {currentModule === "commercial"
                      ? "Projects Completed In Last Month"
                      : company === "vkl"
                      ? "Matters Solved In Last Month"
                      : company === "idg"
                      ? "Orders Closed In Last Month"
                      : "Completed"}
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <div className="text-lg mb-2">No chart data to display</div>
                <div className="text-sm text-center">
                  <div>Current Module: {currentModule}</div>
                  <div>Company: {company}</div>
                  <div>Chart View: {chartView}</div>
                  <div>
                    Data Available: {allChartData.monthlyStats?.length || 0}{" "}
                    months
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateClientModal
        createType="client"
        companyName={company}
        isOpen={createuser}
        setIsOpen={() => setcreateuser(false)}
        onClose={()=>setcreateuser(false)}
      />
      <CreateClientModal
        createType="order"
        companyName={company}
        isOpen={createOrder}
        setIsOpen={() => setcreateOrder(false)}
      />
    </div>
  );
}

export default Dashboard;
