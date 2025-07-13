import Sidebar from "../../components/ui/Sidebar";
import Plus from "../../icons/Button icons/🔹Icon-Color.png"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { Search } from "lucide-react";
import ManageUsersIcon from "../../icons/Sidebar icons/Manage_users.svg";
import ViewClientsIcon from "../../icons/Sidebar icons/ViewClients.svg";
import ArchivedChatsIcon from "../../icons/Sidebar icons/ArchievedClients.svg";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ClientAPI from "../../api/userAPI";
import { useNavigate } from "react-router-dom";
import { create } from 'zustand';

// Zustand store
const useDashboardStore = create((set) => ({
  totalusers: null,
  totalarchived: null,
  totalactive: null,
  lastrecord: null,
  chart: null,
  loading: true,
  isFetched: false,
  
  setDashboardData: (data) => set({
    totalusers: data.lifetimeTotals.totalUsers,
    totalactive: data.lifetimeTotals.totalActiveClients,
    totalarchived: data.lifetimeTotals.totalArchivedClients,
    chart: data.last10MonthsStats.map(item => ({
      name: item.month,
      value: item.closedMatters
    })),
    lastrecord: data.last10MonthsStats[data.last10MonthsStats.length - 2].closedMatters,
    loading: false,
    isFetched: true
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
    isFetched
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
    if(!isFetched){
    async function fetchDashboard() {
      try {
        setLoading(true);
        const api=new ClientAPI();
        const res = await api.getDashboardData();
        console.log(res);
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
    dataEntryBy: localStorage.getItem("user")
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit() {
    const matterNumber = formData.matterNumber;
    try {
      await api.createClient(formData);
      toast.success("User created successfully!", {
        position: "bottom-center",
      });
      setcreateuser(false);
      navigate(`/admin/client/stages/${matterNumber}`);
    } catch(e) {
      console.log("Error", e);
      toast.error("User not created", {
        position: "bottom-center",
      });
    }
    console.log("Submitted Client Data:", formData);
  };

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
      <main className="w-full max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hello {localStorage.getItem("user")}</h2>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Matter Number, Client Name"
              className="outline-none text-sm bg-transparent"
              style={{ width: "250px", height: "25px" }}
            />
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-[#A6E7FF] p-6 rounded-md h-[190px]">
          <h1 className="text-xl font-bold mt-3 font-poppins">Welcome to VK LAWYERS</h1>
          <p className="font-poppins text-sm mt-1 text-gray-800 max-w-5xl">
            We are a client-focused law firm committed to delivering expert legal solutions with integrity, professionalism, and personalized care.
          </p>

          <button 
            className="mt-4 px-4 py-2 bg-white rounded-md font-medium hover:bg-sky-100 transition inline-flex items-center gap-2" 
            onClick={() => setcreateuser(true)}
          >
            <img src={Plus} alt="" className="w-5" /> 
            <p>Add New Client</p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={ManageUsersIcon} label="Total Users" value={totalusers} />
          <StatCard icon={ViewClientsIcon} label="Total Clients" value={totalactive} />
          <StatCard icon={ArchivedChatsIcon} label="Total Archives" value={totalarchived} />
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
        <Dialog open={createuser} onClose={() => setcreateuser(false)} className="relative z-10">
          <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
    
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-y-auto">
            <DialogPanel
              className="max-w-500 relative transform overflow-hidden rounded-lg bg-[#F3F4FB] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setcreateuser(false)}
                className="absolute top-4 right-5 text-red-500 text-xl font-bold hover:scale-110 transition-transform"
              >
                &times;
              </button>
    
              {/* Title */}
              <h2 className="text-2xl font-bold mb-6 text-center">Create Client</h2>
    
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}>
                {/* Form fields remain the same as before */}
                {/* Matter Number & Client Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Number</label>
                    <input
                      type="text"
                      name="matterNumber"
                      value={formData.matterNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                {/* State & Client Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">State</label>
                    <div className="flex gap-4 flex-wrap">
                      {["VIC", "NSW", "QLD", "SA"].map((stateOption) => (
                        <label key={stateOption} className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name="state"
                            value={stateOption}
                            checked={formData.state === stateOption}
                            onChange={handleChange}
                            className="w-4 h-4"
                          />
                          <span>{stateOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Client Type</label>
                    <div className="flex gap-4 flex-wrap">
                      {["Buyer", "Seller", "Transfer"].map((type) => (
                        <label key={type} className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name="clientType"
                            value={type}
                            checked={formData.clientType === type}
                            onChange={handleChange}
                            className="w-4 h-4"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Property Address */}
                <div>
                  <label className="block mb-1 font-medium">Property Address</label>
                  <input
                    type="text"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white"
                  />
                </div>

                {/* Matter Date & Settlement Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Matter Date</label>
                    <input
                      type="date"
                      name="matterDate"
                      value={formData.matterDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Settlement Date</label>
                    <input
                      type="date"
                      name="settlementDate"
                      value={formData.settlementDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500"
                    />
                  </div>
                </div>

                {/* Data Entry By */}
                <div>
                  <label className="block mb-1 font-medium">Data Entry By</label>
                  <input
                    type="text"
                    value={formData.dataEntryBy}
                    readOnly
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-md hover:bg-sky-600"
                  >
                    Add New Client
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
        
        <ToastContainer />
      </main>
    </div>
  );
};

export default Dashboard;