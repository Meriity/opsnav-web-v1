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

// --- Calendar Imports ---
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../ArchivedClientStore/styles/calendar.css";
import { useArchivedClientStore } from "../ArchivedClientStore/UseArchivedClientStore.js";
import ConfirmationModal from "../../components/ui/ConfirmationModal.jsx";

const localizer = momentLocalizer(moment);

// --- Zustand Store ---
const useDashboardStore = create((set) => ({
  totalusers: 0,
  totalactive: 0,
  totalCompleted: 0,
  lastrecord: 0,
  loading: true,
  setDashboardData: (data) =>
    set(() => {
      const arr = Array.isArray(data.last10MonthsStats)
        ? data.last10MonthsStats.slice(-10)
        : [];
      const lastRec =
        arr[arr.length - 1]?.closedMatters ??
        arr[arr.length - 1]?.closedProjects ??
        arr[arr.length - 1]?.closedOrders ??
        arr[arr.length - 1]?.count ??
        arr[arr.length - 1]?.total ??
        0;

      return {
        totalusers: data.lifetimeTotals?.totalUsers || 0,
        totalactive:
          data.lifetimeTotals?.totalActiveClients ||
          data.lifetimeTotals?.totalActiveProjects ||
          data.lifetimeTotals?.totalActiveOrders ||
          0,
        totalCompleted:
          data.lifetimeTotals?.totalClosedOrders ||
          data.lifetimeTotals?.totalClosedProjects ||
          data.lifetimeTotals?.totalClosedMatters ||
          0,
        lastrecord: lastRec,
        loading: false,
      };
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
        eventTypeLabel = event.client_name;
        break;
      default:
        eventTypeLabel = "Event";
    }
  }

  const identifier = event.matterNumber || event.orderId || event.projectCode;
  const typeInitial = event.clientType
    ? event.clientType.charAt(0)
    : event.projectType
      ? event.projectType.charAt(0)
      : event.orderType
        ? event.orderType.charAt(0)
        : event.allocatedUser ?
        event.allocatedUser : "";  

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
        className={`mt-2 sm:mt-0 text-xs sm:text-sm px-3 py-1 rounded-full self-start sm:self-center ${event.type === "buildingAndPest"
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
  componentDidCatch(error, info) {
    console.error("Calendar rendering error:", error, info);
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
    <div className="rbc-toolbar flex flex-col sm:flex-row items-center justify-between p-2 mb-3 gap-5">
      <div className="flex items-center justify-center gap-[5px] w-full sm:w-auto mb-2 sm:mb-0">
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
      <div className="text-lg font-bold text-gray-800 order-first sm:order-none mb-2 sm:mb-0">
        {label}
      </div>
      <div className="flex items-center border border-gray-200 rounded-lg p-1 text-sm bg-white">
        {views.map((viewName) => (
          <button
            key={viewName}
            onClick={() => onView(viewName)}
            className={`capitalize px-3 py-1 rounded-md transition-colors ${currentView === viewName
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

function Dashboard() {
  const navigate = useNavigate();
  const {
    totalusers,
    totalactive,
    totalCompleted,
    lastrecord,
    loading,
    setDashboardData,
  } = useDashboardStore();
  const {
    archivedClients,
    isFetched: isArchivedFetched,
    fetchArchivedClients,
  } = useArchivedClientStore();
  const [createuser, setcreateuser] = useState(false);
  const [createOrder, setcreateOrder] = useState(false);
  const [createProject, setCreateProject] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [chartView, setChartView] = useState("last10Months");
  const [allChartData, setAllChartData] = useState({
    tenMonths: [],
    allTime: [],
  });
  const [currentChartData, setCurrentChartData] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");
  const userRole = localStorage.getItem("userRole") || "admin";

  useEffect(() => {
    setCalendarView(isMobile ? Views.AGENDA : Views.MONTH);
  }, [isMobile]);

  // ✅ ADDED: Handle event selection from calendar
  const handleEventSelect = (event) => {
    const currentModule = localStorage.getItem("currentModule");
    const company = localStorage.getItem("company");
    const userRole = localStorage.getItem("userRole") || "admin";

    console.log("Selected event:", event);

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
  };

  // ✅ UPDATED: Enhanced event styling with clickable cursor
  const eventStyleGetter = useCallback(
    (event) => {
      let backgroundColor = "#00aeef"; // Using your existing blue color

      if (currentModule === "commercial") {
        backgroundColor = "#10B981"; // Green for commercial
      } else if (event.type === "buildingAndPest") {
        backgroundColor = "#B24592"; // Magenta / Deep Pink
      } else if (event.type === "financeApproval") {
        backgroundColor = "#f83600"; // Red-Orange
      } else if (event.type === "titleSearch") {
        backgroundColor = "#34495E"; // Indigo
      } else if (event.type === "settlement") {
        backgroundColor = "#8E44AD"; // Pleasant Purple
      } else if (event.type === "deliveryDate") {
        backgroundColor = "#F39C12"; // Orange for IDG
      }

      return {
        style: {
          backgroundColor,
          borderRadius: "4px",
          opacity: 0.9,
          color: "white",
          border: "none",
          padding: "2px 5px",
          cursor: "pointer", // ✅ Added clickable cursor
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

  const clientApi = useMemo(() => new ClientAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchAndSetData = async () => {
      setIsChartLoading(true);
      try {
        let data;

        if (currentModule === "commercial") {
          data = await commercialApi.getDashboardData();
        } else if (company === "vkl") {
          data = await clientApi.getDashboardData();
        } else if (company === "idg") {
          data = await clientApi.getIDGDashboardData();
        } else {
          data = await clientApi.getDashboardData();
        }

        console.log("Dashboard data:", data);
        setDashboardData(data);
        setAllChartData({
          tenMonths: Array.isArray(data.last10MonthsStats)
            ? data.last10MonthsStats
            : [],
          allTime: Array.isArray(data.allTimeStats) ? data.allTimeStats : [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setShowConfirmModal(true);
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchAndSetData();
  }, [clientApi, commercialApi, setDashboardData, currentModule, company]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        let data;

        if (currentModule === "commercial") {
          data = await commercialApi.getCalendarDates();
        } else if (company === "vkl") {
          data = await clientApi.getCalendarDates();
        } else {
          data = await clientApi.getIDGCalendarDates();
        }

        console.log("Calendar data:", data);
        const events = [];

        if (currentModule === "commercial") {
          data.forEach((item) => {
            if (item.eventDate) {
              events.push({
                title: `[${item.projectCode}] - ${item.eventType} - [${item.projectType}]`,
                start: moment(item.eventDate).toDate(),
                end: moment(item.eventDate).toDate(),
                allDay: true,
                type: item.eventType,
                projectType: item.projectType,
                projectCode: item.projectCode,
                id: item.projectCode,
              });
            }
          });
        } else if (company === "vkl") {
          data.forEach((item) => {
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
          data.forEach((item) => {
            console.log(item);
            if (item.deliveryDate) {
              events.push({
                title: `[${item.client_name}] - [${item.orderId}] - [${item.allocatedUser}]`,
                start: moment(item.deliveryDate).toDate(),
                end: moment(item.deliveryDate).toDate(),
                allDay: true,
                type: "deliveryDate",
                client_name: item.client_name,
                orderId: item.orderId,
                allocatedUser: item.allocatedUser,
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

        setCalendarEvents(safeEvents);
      } catch (error) {
        toast.error("Could not load calendar dates.");
        console.error("Error fetching calendar data:", error);
      }
    };
    fetchCalendarData();
  }, [clientApi, commercialApi, currentModule, company]);

  // Handle chart view switch
  useEffect(() => {
    if (chartView === "last10Months") {
      const ten = (allChartData.tenMonths || []).slice(-10);
      let formattedData;

      if (currentModule === "commercial") {
        formattedData = ten.map((item) => ({
          ...item,
          name: item.month,
          closedMatters: item.closedProjects ?? item.count ?? item.total ?? 0,
        }));
      } else if (company === "vkl") {
        formattedData = ten.map((item) => ({
          ...item,
          name: item.month,
          closedMatters: item.closedMatters ?? item.count ?? item.total ?? 0,
        }));
      } else if (company === "idg") {
        formattedData = ten.map((item) => ({
          ...item,
          name: item.month,
          closedMatters: item.closedOrders ?? item.count ?? item.total ?? 0,
        }));
      }

      setCurrentChartData(formattedData || []);
    } else if (chartView === "allTime") {
      const all = allChartData.allTime || [];
      let formattedData;

      if (currentModule === "commercial") {
        formattedData = all.map((item) => ({
          ...item,
          name: `${item.month} ${item.year}`,
          closedMatters: item.closedProjects ?? item.count ?? item.total ?? 0,
        }));
      } else if (company === "vkl") {
        formattedData = all.map((item) => ({
          ...item,
          name: `${item.month} ${item.year}`,
          closedMatters: item.closedMatters ?? item.count ?? item.total ?? 0,
        }));
      } else if (company === "idg") {
        formattedData = all.map((item) => ({
          ...item,
          name: `${item.month} ${item.year}`,
          closedMatters: item.closedOrders ?? item.count ?? item.total ?? 0,
        }));
      }

      setCurrentChartData(formattedData || []);
    }
  }, [chartView, allChartData, currentModule, company]);

  // Archived fetch
  useEffect(() => {
    if (!isArchivedFetched && currentModule !== "commercial") {
      fetchArchivedClients();
    }
  }, [isArchivedFetched, fetchArchivedClients, currentModule]);

  const chartPeriodTotal = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return 0;
    return currentChartData.reduce(
      (sum, item) => sum + (item.closedMatters || 0),
      0
    );
  }, [currentChartData]);

  const StatCard = ({ icon, label, value }) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm w-full">
      <img src={icon} alt={label} className="h-10 w-10 mr-4" />
      <div>
        <p className="text-3xl font-bold">{value !== null ? value : 0}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
        <span className="ml-4 text-lg text-gray-700">Loading Dashboard...</span>
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
            {localStorage.getItem("company") === "idg" && (
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
                    `[${event?.orderId ||
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
                  // ✅ ADDED: Event click handler
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
              value={chartPeriodTotal || totalCompleted}
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
                ({chartView === "last10Months" ? "Last 10 Months" : "All Time"})
              </h2>
              <div className="flex items-center border border-gray-200 rounded-lg p-1 text-sm bg-gray-50">
                <button
                  onClick={() => setChartView("last10Months")}
                  className={`px-3 py-1 rounded-md transition-colors ${chartView === "last10Months"
                    ? "bg-blue-500 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  10 Months
                </button>
                <button
                  onClick={() => setChartView("allTime")}
                  className={`px-3 py-1 rounded-md transition-colors ${chartView === "allTime"
                    ? "bg-blue-500 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  All Time
                </button>
              </div>
            </div>
            {isChartLoading ? (
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
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                {chartView === "last10Months" && (
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
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No chart data to display.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateClientModal
        createType="client"
        companyName={localStorage.getItem("company")}
        isOpen={createuser}
        setIsOpen={() => setcreateuser(false)}
      />
      <CreateClientModal
        createType="order"
        companyName={company}
        isOpen={createOrder}
        setIsOpen={() => setcreateOrder(false)}
      />
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => console.log("")}
        title="Session Expired!"
        isLogout={true}
      >
        Please Login Again
      </ConfirmationModal>
    </div>
  );
}

export default Dashboard;
