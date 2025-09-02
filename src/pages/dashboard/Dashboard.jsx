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

// --- Calendar Imports ---
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
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
        totalactive: data.lifetimeTotals?.totalActiveClients || 0,
        lastrecord: lastRec,
        loading: false,
      };
    }),
}));

const CustomEvent = ({ event }) => {
  return (
    <div
      style={{
        wordWrap: "break-word",
        whiteSpace: "normal",
        lineHeight: "1.2",
      }}
    >
      <div className="font-semibold text-[11.5px] text-white leading-tight">
        {event.title} - [{event.clientType}]
      </div>
    </div>
  );
};

// --- Helper Components & Hooks ---

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
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [chartView, setChartView] = useState("last10Months");
  const [allChartData, setAllChartData] = useState({
    tenMonths: [],
    allTime: [],
  });
  const [currentChartData, setCurrentChartData] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]); // State for calendar events
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const clientApi = useMemo(() => new ClientAPI(), []);

  // Effect for general dashboard data (charts, stats)
  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const data = await clientApi.getDashboardData();
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
              title: `[${item.matterNumber}] - B&P`,
              start: moment(item.buildingAndPestDate).toDate(),
              end: moment(item.buildingAndPestDate).toDate(),
              allDay: true,
              type: "buildingAndPest",
              clientType: item.clientType,
              matterNumber: item.matterNumber,
            });
          }
          if (item.financeApprovalDate) {
            events.push({
              title: `[${item.matterNumber}] - Finance`,
              start: moment(item.financeApprovalDate).toDate(),
              end: moment(item.financeApprovalDate).toDate(),
              allDay: true,
              type: "financeApproval",
              clientType: item.clientType,
              matterNumber: item.matterNumber,
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

  const eventStyleGetter = useCallback((event, start, end, isSelected) => {
    let backgroundColor = "#3174ad"; // Default color
    if (event.type === "buildingAndPest") {
      backgroundColor = "#B24592"; //violet
    } else if (event.type === "financeApproval") {
      backgroundColor = "#f83600"; //orange
    }

    const style = {
      backgroundColor,
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
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
      return {
        views: ["agenda", "day"],
        defaultView: "agenda",
      };
    }
    return {
      views: ["month", "week", "day", "agenda"],
      defaultView: "month",
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-[#A6E7FF] p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold">Welcome to Opsnav</h1>
            <p className="text-sm mt-1 text-gray-800 max-w-5xl">
              We are a client-focused firm dedicated to providing reliable solutions with integrity, professionalism, and personalized care.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2"
              onClick={() => setcreateuser(true)}
            >
              <img src={Plus} alt="" className="w-5" />
              <span>Add New Client</span>
            </button>
            {localStorage.getItem("company") === "idg" &&
             <button
              className="ml-4 mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2"
              onClick={() => setcreateOrder(true)}
            >
              <img src={Plus} alt="" className="w-5" />
              <span>Add New Order</span>
            </button>
            }
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={ManageUsersIcon}
              label="Total Users"
              value={totalusers}
            />
            <StatCard
              icon={ViewClientsIcon}
              label="Total Active Clients"
              value={totalactive}
            />
            <StatCard
              icon={ArchivedChatsIcon}
              label="Total Archived Clients"
              value={chartPeriodTotal}
            />
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-lg font-semibold text-gray-700">
                Closed Matters (
                {chartView === "last10Months" ? "Last 10 Months" : "All Time"})
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
            {currentChartData && currentChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={currentChartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
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
                    {lastrecord} Matters Solved In Last Month
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No chart data to display.
              </div>
            )}
          </div>

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
        isOpen={createOrder}
        setIsOpen={() => setcreateOrder(false)}
      />
    </div>
  );
}

export default Dashboard;
