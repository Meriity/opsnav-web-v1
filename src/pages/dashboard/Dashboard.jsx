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
    set({
      totalusers: data.lifetimeTotals.totalUsers || 0,
      totalactive: data.lifetimeTotals.totalActiveClients || 0,
      lastrecord:
        data.last10MonthsStats[data.last10MonthsStats.length - 2]
          ?.closedMatters || 0,
      loading: false,
    }),
}));

const CustomEvent = ({ event }) => <div title={event.title}>{event.title}</div>;

// --- Dashboard Component ---
function Dashboard() {
  const { totalusers, totalactive, lastrecord, loading, setDashboardData } =
    useDashboardStore();
  const {
    archivedClients,
    isFetched: isArchivedFetched,
    fetchArchivedClients,
  } = useArchivedClientStore();

  const [createuser, setcreateuser] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // --- State for Chart Logic ---
  const [chartView, setChartView] = useState("last10Months");
  const [allChartData, setAllChartData] = useState({
    tenMonths: [],
    allTime: [],
  });
  const [currentChartData, setCurrentChartData] = useState([]);

  const clientApi = useMemo(() => new ClientAPI(), []);

  // --- Combined Effect for Data Fetching and View Switching ---
  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const data = await clientApi.getDashboardData();
        setDashboardData(data); // Update Zustand store

        // Store both datasets in a single state object
        setAllChartData({
          tenMonths: data.last10MonthsStats || [],
          allTime: data.allTimeStats || [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data.");
      }
    };
    fetchAndSetData();
  }, [clientApi, setDashboardData]);

  // --- Effect to update the chart when the view or data changes ---
  useEffect(() => {
    // This is for debugging - check your browser console (F12)
    console.log(`Switching chart view to: ${chartView}`);
    console.log("Available 10-month data:", allChartData.tenMonths);
    console.log("Available All-Time data:", allChartData.allTime);

    if (chartView === "last10Months") {
      const formattedData = allChartData.tenMonths.map((item) => ({
        ...item,
        name: item.month, // e.g., "Jan"
      }));
      setCurrentChartData(formattedData);
    } else if (chartView === "allTime") {
      const formattedData = allChartData.allTime.map((item) => ({
        ...item,
        name: `${item.month} ${item.year}`, // e.g., "Jan 2023"
      }));
      setCurrentChartData(formattedData);
    }
  }, [chartView, allChartData]);

  // --- Calendar Data Fetching ---
  useEffect(() => {
    if (!isArchivedFetched) {
      fetchArchivedClients();
    }
  }, [isArchivedFetched, fetchArchivedClients]);

  // --- Memoized calculation for the dynamic card total ---
  const chartPeriodTotal = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return 0;
    return currentChartData.reduce(
      (sum, item) => sum + (item.closedMatters || 0),
      0
    );
  }, [currentChartData]);

  // --- Calendar Events and Styling ---
  const calendarEvents = useMemo(() => {
    if (!archivedClients || archivedClients.length === 0) return [];
    return archivedClients
      .filter(
        (client) =>
          client.isClosed &&
          client.settlement_date_iso &&
          client.settlement_date_iso !== "N/A"
      )
      .map((client) => ({
        title: `[${client.matternumber}] - ${client.client_name}`,
        start: moment(client.settlement_date_iso, "YYYY-MM-DD").toDate(),
        end: moment(client.settlement_date_iso, "YYYY-MM-DD").toDate(),
        allDay: true,
      }));
  }, [archivedClients]);

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

  // --- JSX a---
  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-[#A6E7FF] p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold">Welcome to Opsnav</h1>
            <p className="text-sm mt-1 text-gray-800 max-w-5xl">
              We are a client-focused law firm committed to delivering expert
              legal solutions with integrity, professionalism, and personalized
              care.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2"
              onClick={() => setcreateuser(true)}
            >
              <img src={Plus} alt="" className="w-5" />
              <span>Add New Client</span>
            </button>
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
                    <YAxis tick={{ fontSize: 12 }} />
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
              Settlement Calendar
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
                components={{ event: CustomEvent }}
              />
            </div>
          </div>
        </div>
      </main>
      <CreateClientModal
        isOpen={createuser}
        setIsOpen={() => setcreateuser(false)}
      />
    </div>
  );
}

export default Dashboard; 
