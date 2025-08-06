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
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ClientAPI from "../../api/userAPI";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import Header from "../../components/layout/Header";
import CreateClientModal from "../../components/ui/CreateClientModal";

// Zustand store
const useDashboardStore = create((set) => ({
  totalusers: null,
  totalarchived: null,
  totalactive: null,
  lastrecord: null,
  chart: null,
  loading: true,
  isFetched: false,

  setDashboardData: (data) =>
    set({
      totalusers: data.lifetimeTotals.totalUsers,
      totalactive: data.lifetimeTotals.totalActiveClients,
      totalarchived: data.lifetimeTotals.totalArchivedClients,
      chart: data.last10MonthsStats.map((item) => ({
        name: item.month,
        value: item.closedMatters,
      })),
      lastrecord:
        data.last10MonthsStats[data.last10MonthsStats.length - 2].closedMatters,
      loading: false,
      isFetched: true,
    }),

  setLoading: (isLoading) => set({ loading: isLoading }),
}));

function Dashboard() {
  const {
    totalusers,
    totalarchived,
    totalactive,
    lastrecord,
    chart,
    loading,
    setDashboardData,
    setLoading,
    isFetched,
  } = useDashboardStore();

  const [createuser, setcreateuser] = useState(false);
  // const api = new ClientAPI();
  const navigate = useNavigate();

  const StatCard = ({ icon, label, value }) => (
    <div className="flex items-center p-4 bg-white rounded-md shadow-sm w-full space-between">
      <img src={icon} alt={label} className="h-10 w-30" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );

  useEffect(() => {
    if (!isFetched) {
      async function fetchDashboard() {
        try {
          setLoading(true);
          const api = new ClientAPI();
          const res = await api.getDashboardData();
          setDashboardData(res);
        } catch (e) {
          console.log("Error", e);
          toast.error("Failed to load dashboard data", {
            position: "bottom-center",
          });
          setLoading(false);
        }
      }
      fetchDashboard();
    }
  }, []);

  const [formData, setFormData] = useState({
    matterNumber: "",
    clientName: "",
    state: "",
    clientType: "",
    propertyAddress: "",
    matterDate: "",
    settlementDate: "",
    dataEntryBy: localStorage.getItem("user"),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 mt-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
        <div className="ml-5 text-[#00AEEF]">Loading Please wait!</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <main className="w-full max-w-8xl mx-auto space-y-4">
        <Header />
        {/* Welcome Card */}
        <div className="bg-[#A6E7FF] p-6 rounded-md overflow-y-auto max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] lg:max-h-[75vh] xl:max-h-[80vh]">
          <h1 className="text-xl font-bold mt-3 font-poppins">
            Welcome to OPSNAV
          </h1>
          <p className="font-poppins text-sm mt-1 text-gray-800 max-w-5xl">
            We are a client-focused law firm committed to delivering expert
            legal solutions with integrity, professionalism, and personalized
            care.
          </p>

          <button
            className="mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2 cursor-pointer"
            onClick={() => setcreateuser(true)}
          >
            <img src={Plus} alt="" className="w-5" />
            <p>Add New Client</p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={ManageUsersIcon}
            label="Total Users"
            value={totalusers}
          />
          <StatCard
            icon={ViewClientsIcon}
            label="Total Clients"
            value={totalactive}
          />
          <StatCard
            icon={ArchivedChatsIcon}
            label="Total Archives"
            value={totalarchived}
          />
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-base font-medium mb-4">Closed Matters</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00AEEF" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Summary */}
        <p className="text-lg font-semibold mt-2">
          {lastrecord} Matters Solved In Last Month
        </p>

        {/* Dialog for creating new user */}
        <CreateClientModal
          isOpen={createuser}
          setIsOpen={() => setcreateuser(false)}
        />
      </main>
    </div>
  );
}

export default Dashboard;
