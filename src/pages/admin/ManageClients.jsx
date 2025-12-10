import { useEffect, useState, useMemo, Fragment } from "react";
import { create } from "zustand";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Users,
  Calendar,
  AlertCircle,
  Mail,
  UserPlus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  Transition,
} from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import AdminApi from "../../api/adminAPI";
import ClientApi from "../../api/userAPI.js";
import CommercialAPI from "../../api/commercialAPI";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";
import CreateClientModal from "../../components/ui/CreateClientModal";
import userplus from "../../icons/Button icons/Group 313 (1).png";
import NotificationAPI from "../../api/notificationAPI";
import { motion } from "framer-motion";

// 🔸 Zustand Store (unchanged)
const useUserStore = create((set) => ({
  users: [],
  isFetched: false,
  loading: false,
  setUsers: (users) => set({ users }),
  setIsFetched: (isFetched) => set({ isFetched }),
  setLoading: (loading) => set({ loading }),
  fetchUsers: async () => {
    const currentModule = localStorage.getItem("currentModule");
    const company = localStorage.getItem("company");

    let api;
    if (currentModule === "commercial") {
      api = new CommercialAPI();
    } else {
      api = new ClientApi();
    }

    set({ loading: true });
    try {
      let response;
      if (currentModule === "commercial") {
        response = await api.getActiveProjects();
        console.log("Commercial clients response:", response);

        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response && Array.isArray(response.data)) {
          data = response.data;
        } else if (response && Array.isArray(response.clients)) {
          data = response.clients;
        } else {
          console.warn("Unexpected commercial response format:", response);
          throw new Error("Unexpected data format received");
        }

        const formatted = data.map((user) => ({
          id: user._id || user.id,
          clientId: user.clientId || user.matterNumber,
          name: user.clientName || user.name,
          email: user.email,
          contact: user.contact,
          address: user.propertyAddress || user.billingAddress,
          country: user.country,
          state: user.state,
          postcode: user.postcode,
          abn: user.abn,
          clientType: user.clientType,
          matterDate: user.matterDate,
          settlementDate: user.settlementDate,
        }));
        set({ users: formatted, isFetched: true });
      } else if (company === "idg") {
        response = await api.getIDGClients();
        console.log("IDG Response:", response);
        const formatted = response.map((user) => ({
          id: user._id,
          clientId: user.clientId,
          name: user.name,
          email: user.email,
          contact: user.contact,
          address: user.billingAddress,
          country: user.country,
          state: user.state,
          postcode: user.postcode,
          abn: user.abn,
        }));
        set({ users: formatted, isFetched: true });
      } else {
        set({ users: [], isFetched: true });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load clients");
    } finally {
      set({ loading: false });
    }
  },
}));

// UsersPerPage dropdown component with enhanced UI
function UsersPerPage({ value, onChange }) {
  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  const label =
    currentModule === "commercial"
      ? "Projects"
      : company === "idg"
      ? "Clients"
      : "Clients";

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>Show</span>
      <select
        id="users-per-page"
        value={value}
        onChange={onChange}
        className="block px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all text-sm"
      >
        <option>5</option>
        <option>10</option>
        <option>20</option>
        <option>50</option>
      </select>
      <span>entries</span>
    </div>
  );
}

// Floating Background Elements (from ViewClients theme)
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

export default function ManageUsers() {
  const { users, isFetched, loading, fetchUsers, setIsFetched } =
    useUserStore();
  const { searchQuery } = useSearchStore();

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  const api = new AdminApi();
  const [selectedUser, setSelectedUser] = useState({});
  const [id, setId] = useState("");
  const [openUser, setOpenUser] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");
  const [userList, setUserList] = useState([]);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [resetLoadingEmail, setResetLoadingEmail] = useState("");
  const [resetSuccessEmail, setResetSuccessEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createuser, setcreateuser] = useState(false);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleChange = (e) => {
    setRole(e.target.value);
  };

  useEffect(() => {
    if (!isFetched) fetchUsers();
  }, [isFetched, fetchUsers]);

  // Apply search filter
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          String(user.name || user.displayName)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(user.email).toLowerCase().includes(lowercasedQuery) ||
          String(user.clientId || user.matterNumber)
            .toLowerCase()
            .includes(lowercasedQuery) ||
          String(user.address).toLowerCase().includes(lowercasedQuery)
      );
      setUserList(filtered);
    } else {
      setUserList(users);
    }
  }, [searchQuery, users]);

  const getColumns = () => {
    if (currentModule === "commercial") {
      return [
        { key: "clientId", title: "Project Number", width: "10%" },
        { key: "name", title: "Client Name", width: "12%" },
        { key: "email", title: "Email", width: "15%" },
        { key: "contact", title: "Contact", width: "10%" },
        { key: "address", title: "Property Address", width: "18%" },
        { key: "country", title: "Country", width: "8%" },
        { key: "state", title: "State", width: "8%" },
        { key: "postcode", title: "PostCode", width: "8%" },
        { key: "abn", title: "ABN", width: "8%" },
      ];
    } else if (company === "idg") {
      return [
        { key: "clientId", title: "Client ID", width: "8%" },
        { key: "name", title: "Name", width: "12%" },
        { key: "email", title: "Email", width: "15%" },
        { key: "contact", title: "Contact", width: "10%" },
        { key: "address", title: "Address", width: "20%" },
        { key: "country", title: "Country", width: "8%" },
        { key: "state", title: "State", width: "8%" },
        { key: "postcode", title: "PostCode", width: "8%" },
        { key: "abn", title: "ABN", width: "8%" },
      ];
    }
    return [];
  };

  const columns = getColumns();

  const getPageTitle = () => {
    if (currentModule === "commercial") return "Manage Projects";
    if (company === "idg") return "Manage Clients";
    return "Manage Users";
  };

  const getCreateButtonLabel = () => {
    if (currentModule === "commercial") return "Create Project";
    return "Create Client";
  };

  const handleUserCreation = async (display_name, email, role) => {
    try {
      setIsLoading(true);
      if (currentModule === "commercial") {
        await api.createUser(email, role, display_name);
      } else {
        await api.createUser(email, role, display_name);
      }

      const notificationAPI = new NotificationAPI();
      await notificationAPI.createNotification({
        type: "client",
        message: `New ${
          currentModule === "commercial" ? "project" : "client"
        } created: ${display_name}`,
        metadata: {
          clientName: display_name,
          email: email,
          clientType: currentModule === "commercial" ? "project" : "client",
          route:
            currentModule === "commercial"
              ? "/admin/view-clients"
              : "/admin/manage-clients",
        },
      });

      toast.success(
        `${
          currentModule === "commercial" ? "Project" : "Client"
        } created successfully!`
      );
      setOpenUser(false);
      setIsFetched(false);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error(
          err.response.data?.message || "This email is already registered!"
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            "Something went wrong. Please try again!"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserUpdate = async () => {
    try {
      console.log(selectedUser);
      if (currentModule === "commercial") {
        await api.editIDGClient(selectedUser);
      } else {
        await api.editIDGClient(selectedUser);
      }

      toast.success(
        `${
          currentModule === "commercial" ? "Project" : "Client"
        } updated successfully!`
      );
      setOpenEdit(false);
      setIsFetched(false);
    } catch (err) {
      toast.error(
        `Failed to update ${
          currentModule === "commercial" ? "project" : "client"
        }.`
      );
      console.error("Update Error:", err);
    }
  };

  const handleUserDelete = async () => {
    try {
      setDeleteLoading(true);
      console.log(id.clientId);
      if (currentModule === "commercial") {
        await api.deleteIDGClient(id.clientId);
      } else {
        await api.deleteIDGClient(id.clientId);
      }
      toast.success(
        `${
          currentModule === "commercial" ? "Project" : "Client"
        } deleted successfully!`
      );
      setOpenDelete(false);
      setIsFetched(false);
    } catch (err) {
      toast.error(
        `Failed to delete ${
          currentModule === "commercial" ? "project" : "client"
        }.`
      );
      console.error("Delete Error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReset = async (email) => {
    try {
      setResetSuccessEmail("");
      setResetLoadingEmail(email);
      setIsLoading(true);

      await api.resetPassword(email);

      setResetSuccessEmail(email);
      toast.success("Reset password link sent successfully!");
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
      setResetLoadingEmail("");
      setOpenUser(false);
      setIsFetched(false);
      setTimeout(() => setResetSuccessEmail(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        {/* Grid Background */}
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
        <Header />

        <main className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 mt-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    {getPageTitle()}
                  </span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-2 truncate">
                  Manage all{" "}
                  {currentModule === "commercial"
                    ? "projects"
                    : company === "idg"
                    ? "clients"
                    : "users"}{" "}
                  in one place
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CreateClientModal
                  createType={
                    currentModule === "commercial" ? "project" : "client"
                  }
                  companyName={company}
                  isOpen={createuser}
                  setIsOpen={() => setcreateuser(false)}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setcreateuser(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl lg:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="hidden xs:inline">
                    {getCreateButtonLabel()}
                  </span>
                  <span className="xs:hidden">Add New</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Action Bar*/}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl mb-6"
          >
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-7 lg:h-8 bg-[#FB4A50] rounded-full"></div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                    All{" "}
                    {currentModule === "commercial" ? "Projects" : "Clients"}
                  </h3>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 text-[#2E3D99] text-sm lg:text-base font-medium rounded-full">
                    {userList.length} total
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                  <UsersPerPage
                    value={usersPerPage}
                    onChange={(e) => setUsersPerPage(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {loading ? (
              <div className="flex justify-center items-center py-20 lg:py-24">
                <Loader />
              </div>
            ) : userList.length === 0 ? (
              <div className="py-20 lg:py-24 text-center">
                <div className="w-24 h-24 lg:w-28 lg:h-28 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 lg:w-14 lg:h-14 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></circle>
                  </svg>
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                  No {currentModule === "commercial" ? "projects" : "clients"}{" "}
                  found
                </h3>
                <p className="text-gray-600 max-w-md lg:max-w-lg mx-auto text-base lg:text-lg">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : `Get started by creating your first ${
                        currentModule === "commercial" ? "project" : "client"
                      }`}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setcreateuser(true)}
                    className="mt-4 px-6 py-2.5 lg:px-7 lg:py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg lg:rounded-xl font-medium hover:shadow-lg transition-all text-base lg:text-lg"
                  >
                    Create{" "}
                    {currentModule === "commercial" ? "Project" : "Client"}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 sm:p-4 lg:p-5 xl:p-6">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-full">
                    <Table
                      data={userList}
                      columns={columns}
                      onEdit={(u) => {
                        console.log(u);
                        setSelectedUser(u);
                        setOpenEdit(true);
                      }}
                      onReset={handleReset}
                      onDelete={(id) => {
                        setId(id);
                        setOpenDelete(true);
                      }}
                      itemsPerPage={usersPerPage}
                      headerBgColor="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                      headerTextColor="text-white"
                      cellWrappingClass="whitespace-normal"
                      resetLoadingEmail={resetLoadingEmail}
                      resetSuccessEmail={resetSuccessEmail}
                      showActions={true}
                      isClients={true}
                      tableClassName="w-full" // Added to make table full width
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 md:gap-5">
                  {userList.slice(0, usersPerPage).map((user) => {
                    const isRowLoading = resetLoadingEmail === user.email;
                    const isRowSuccess = resetSuccessEmail === user.email;
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 space-y-4"
                      >
                        <div className="flex justify-between items-start space-x-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <h3 className="text-lg sm:text-xl font-bold truncate text-gray-800">
                                {user.name || user.displayName}
                              </h3>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm sm:text-base text-gray-500 truncate">
                                <span className="font-medium text-gray-700">
                                  {currentModule === "commercial"
                                    ? "Project"
                                    : "Client"}{" "}
                                  ID:
                                </span>{" "}
                                {user.clientId}
                              </p>
                              <p className="text-sm sm:text-base text-gray-500 truncate">
                                <span className="font-medium text-gray-700">
                                  Email:
                                </span>{" "}
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenEdit(true);
                              }}
                              title="Edit"
                              className="flex flex-col items-center p-2 sm:p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit size={18} className="sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm mt-1">
                                Edit
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setId(user);
                                setOpenDelete(true);
                              }}
                              title="Delete"
                              className="flex flex-col items-center p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} className="sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm mt-1">
                                Delete
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 gap-2 text-sm sm:text-base">
                            <div>
                              <span className="font-medium text-gray-700">
                                Address:
                              </span>{" "}
                              <span className="text-gray-600">
                                {user.address}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Contact:
                              </span>{" "}
                              <span className="text-gray-600">
                                {user.contact || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Create User Dialog */}
      <Dialog open={openUser} onClose={setOpenUser} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.target);
                  const email = form.get("email");
                  const display_name = form.get("name");
                  handleUserCreation(display_name, email, role);
                }}
                className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative"
              >
                <button
                  type="button"
                  onClick={() => setOpenUser(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                  &times;
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Create{" "}
                      {currentModule === "commercial" ? "Project" : "Client"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add new{" "}
                      {currentModule === "commercial" ? "project" : "client"}{" "}
                      details
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="client@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentModule === "commercial"
                        ? "Client Name"
                        : "Display Name"}
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder={
                        currentModule === "commercial"
                          ? "Enter client name"
                          : "Enter display name"
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={role === "user"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              role === "user"
                                ? "border-[#2E3D99]"
                                : "border-gray-300"
                            }`}
                          >
                            {role === "user" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#2E3D99]"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-700">User</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={role === "admin"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              role === "admin"
                                ? "border-[#2E3D99]"
                                : "border-gray-300"
                            }`}
                          >
                            {role === "admin" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#2E3D99]"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-700">Admin</span>
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  type={isLoading ? "button" : "submit"}
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Create ${
                      currentModule === "commercial" ? "Project" : "Client"
                    }`
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog - Enhanced */}
      <Dialog open={openEdit} onClose={setOpenEdit} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg"
            >
              <DialogPanel className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={() => setOpenEdit(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                  &times;
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Edit{" "}
                      {currentModule === "commercial" ? "Project" : "Client"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {currentModule === "commercial" ? "Project" : "Client"}{" "}
                      ID:{" "}
                      <span className="font-semibold text-[#2E3D99]">
                        {selectedUser.clientId}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 font-medium text-sm text-gray-700">
                      Name
                    </label>
                    <input
                      value={selectedUser.name}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2 font-medium text-sm text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={selectedUser.email || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block mb-2 font-medium text-sm text-gray-700">
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password to update"
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block mb-2 font-medium text-sm text-gray-700">
                      Address
                    </label>
                    <input
                      value={selectedUser.address || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Country */}
                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">
                        Country
                      </label>
                      <input
                        value={selectedUser.country}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            country: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">
                        State
                      </label>
                      <input
                        value={selectedUser.state}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Postcode */}
                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">
                        Postcode
                      </label>
                      <input
                        value={selectedUser.postcode}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            postcode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* ABN */}
                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">
                        ABN
                      </label>
                      <input
                        value={selectedUser.abn}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            abn: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUserUpdate}
                  className="w-full mt-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Update {currentModule === "commercial" ? "Project" : "Client"}
                </button>
              </DialogPanel>
            </motion.div>
          </div>
        </div>
      </Dialog>

      {/* Delete Dialog - Enhanced */}
      <Dialog
        open={openDelete}
        onClose={setOpenDelete}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <DialogPanel className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={() => setOpenDelete(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                  &times;
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Delete{" "}
                    {currentModule === "commercial" ? "Project" : "Client"}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this{" "}
                    {currentModule === "commercial" ? "project" : "client"}?
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOpenDelete(false)}
                      className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUserDelete}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </motion.div>
          </div>
        </div>
      </Dialog>

      {/* a11y live announcements */}
      <div className="sr-only" aria-live="polite">
        {resetLoadingEmail && `Sending reset link to ${resetLoadingEmail}`}
        {resetSuccessEmail && `Reset link sent to ${resetSuccessEmail}`}
      </div>
    </div>
  );
}
