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
import { useEffect, useState, useMemo, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ClientAPI from "../../api/userAPI";
import { create } from "zustand";
import Header from "../../components/layout/Header";
import CreateClientModal from "../../components/ui/CreateClientModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../../components/ui/Loader";

// --- Calendar Imports ---
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../ArchivedClientStore/styles/calendar.css";
import { useArchivedClientStore } from "../ArchivedClientStore/UseArchivedClientStore.js";

const localizer = momentLocalizer(moment);

// --- Zustand Store ---
const useDashboardStore = create((set) => ({
  totalusers: 0,
  totalactive: 0,
  lastrecord: 0,
  loading: true,
  setDashboardData: (data) =>
    set(() => {
      const arr = Array.isArray(data.last10MonthsStats)
        ? data.last10MonthsStats.slice(-10)
        : [];
      const lastRec =
        arr[arr.length - 1]?.closedMatters ??
        arr[arr.length - 1]?.count ??
        arr[arr.length - 1]?.total ??
        0;
      return {
        totalusers: data.lifetimeTotals?.totalUsers || 0,
        totalactive:
          data.lifetimeTotals?.totalActiveClients ||
          data.lifetimeTotals?.totalActiveOrders,
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
    default:
      eventTypeLabel = "Event";
  }
  const clientTypeInitial = event.clientType ? event.clientType.charAt(0) : "";
  const displayTitle = `[${event.matterNumber}] - ${eventTypeLabel} - [${clientTypeInitial}]`;

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
          {event.title}
        </span>
        <span className="text-xs text-gray-500 mt-1">
          {moment(event.start).format("DD MMM YYYY")}
        </span>
      </div>
      <span
        className={`mt-2 sm:mt-0 text-xs sm:text-sm px-3 py-1 rounded-full self-start sm:self-center ${
          event.type === "buildingAndPest"
            ? "bg-purple-100 text-purple-700"
            : event.type === "financeApproval"
            ? "bg-orange-100 text-orange-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {event.clientType}
      </span>
    </div>
  </div>
);

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
      <div className="flex items-center justify-center w-full sm:w-auto mb-2 sm:mb-0">
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

function Dashboard() {
  const { totalusers, totalactive, lastrecord, loading, setDashboardData } =
    useDashboardStore();
  const {
    archivedClients,
    isFetched: isArchivedFetched,
    fetchArchivedClients,
  } = useArchivedClientStore();
  const [createuser, setcreateuser] = useState(false);
  const [createOrder, setcreateOrder] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [chartView, setChartView] = useState("last10Months");
  const [allChartData, setAllChartData] = useState({
    tenMonths: [],
    allTime: [],
  });
  const [currentChartData, setCurrentChartData] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const company = localStorage.getItem("company");
      const closedLabel =
        company === "idg"
          ? "Closed Orders"
          : company === "vkl"
          ? "Closed Matters"
          : "Closed";

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
  let company = localStorage.getItem("company");
  // Fetch dashboard data
  useEffect(() => {
    const fetchAndSetData = async () => {
      setIsChartLoading(true);
      try {
        const data = await (company === "vkl"
          ? clientApi.getDashboardData()
          : company === "idg"
          ? clientApi.getIDGDashboardData()
          : clientApi.getDashboardData());
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
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchAndSetData();
  }, [clientApi, setDashboardData]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const data = await clientApi.getCalendarDates();
        const events = [];
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
              isApproved: false,
            });
          }
        });

        setCalendarEvents(events);
      } catch (error) {
        toast.error("Could not load calendar dates.");
        console.error("Error fetching calendar data:", error);
      }
    };
    fetchCalendarData();
  }, [clientApi]);

  // Handle chart view switch
  useEffect(() => {
    if (chartView === "last10Months") {
      const ten = (allChartData.tenMonths || []).slice(-10);
      const formattedData = ten.map((item) => ({
        ...item,
        name: item.month,
        closedMatters: item.closedMatters ?? item.count ?? item.total ?? 0,
      }));
      setCurrentChartData(formattedData);
    } else if (chartView === "allTime") {
      const all = allChartData.allTime || [];
      const formattedData = all.map((item) => ({
        ...item,
        name: `${item.month} ${item.year}`,
        closedMatters: item.closedMatters ?? item.count ?? item.total ?? 0,
      }));
      setCurrentChartData(formattedData);
    }
  }, [chartView, allChartData]);

  // Archived fetch
  useEffect(() => {
    if (!isArchivedFetched) {
      fetchArchivedClients();
    }
  }, [isArchivedFetched, fetchArchivedClients]);

  const chartPeriodTotal = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return 0;
    return currentChartData.reduce(
      (sum, item) => sum + (item.closedMatters || 0),
      0
    );
  }, [currentChartData]);

  const eventStyleGetter = useCallback((event) => {
    let backgroundColor = "#3174ad";
    if (event.type === "buildingAndPest") {
      backgroundColor = "#B24592"; // Magenta / Deep Pink
    } else if (event.type === "financeApproval") {
      backgroundColor = "#f83600"; // Red-Orange
    } else if (event.type === "titleSearch") {
      backgroundColor = "#34495E"; // Indigo
    } else if (event.type === "settlement") {
      backgroundColor = "#8E44AD"; // Pleasant Purple
    }
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        padding: "2px 6px",
      },
    };
  }, []);
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

  const StatCard = ({ icon, label, value }) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm w-full">
      <img src={icon} alt={label} className="h-10 w-10 mr-4" />
      <div>
        <p className="text-3xl font-bold">{value !== null ? value : 0}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );

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
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-4">
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
                localStorage.getItem("company") === "idg"
                  ? "Total Orders"
                  : "Total Clients"
              }
              value={totalactive}
            />
            <StatCard
              icon={ArchivedChatsIcon}
              label={
                localStorage.getItem("company") === "idg"
                  ? "Total Completed Orders"
                  : "Total Archived Clients"
              }
              value={chartPeriodTotal}
            />
          </div>

          {/* Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-lg font-semibold text-gray-700">
                {localStorage.getItem("company") === "vkl"
                  ? "Closed Matters"
                  : localStorage.getItem("company") === "idg"
                  ? "Closed Orders"
                  : "Closed"}{" "}
                ({chartView === "last10Months" ? "Last 10 Months" : "All Time"})
              </h2>
              <div className="flex items-center border border-gray-200 rounded-lg p-1 text-sm bg-gray-50">
                <button
                  onClick={() => setChartView("last10Months")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    chartView === "last10Months"
                      ? "bg-blue-500 text-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  10 Months
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
                    {lastrecord}{" "}
                    {localStorage.getItem("company") === "vkl"
                      ? "Matters Solved In Last Month"
                      : localStorage.getItem("company") === "idg"
                      ? "Orders Closed In Last Month"
                      : "Closed"}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No chart data to display.
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Important Dates
            </h2>
            <div className="h-[65vh] min-h-[500px]">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                popup
                onNavigate={handleNavigate}
                dayPropGetter={dayPropGetter}
                views={views}
                defaultView={defaultView}
                eventPropGetter={eventStyleGetter}
                components={{
                  event: CustomEvent,
                  agenda: { event: CustomAgendaEvent },
                  toolbar: ResponsiveCalendarToolbar,
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <CreateClientModal
        createType="client"
        companyName={localStorage.getItem("company")}
        isOpen={createuser}
        setIsOpen={() => setcreateuser(false)}
      />
      <CreateClientModal
        createType="order"
        companyName={localStorage.getItem("company")}
        isOpen={createOrder}
        setIsOpen={() => setcreateOrder(false)}
      />
    </div>
  );
}

export default Dashboard;
