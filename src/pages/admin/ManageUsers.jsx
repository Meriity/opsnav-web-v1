// Merged ManageUsers.jsx
// UI from second file, functionality from first file preserved
import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Home,
  FileText,
  Newspaper,
  Briefcase,
  Users,
  UserPlus,
  Shield,
  Key,
  Mail,
  Calendar,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import AdminApi from "../../api/adminAPI";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import NotificationAPI from "../../api/notificationAPI";

/* -------------------------
   Config / Small Components
   ------------------------- */
const ACCESS_MODULES = [
  {
    value: "CONVEYANCING",
    label: "Conveyancing",
    icon: Home,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    value: "WILLS",
    label: "Wills",
    icon: FileText,
    color: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  {
    value: "PRINT MEDIA",
    label: "Print Media",
    icon: Newspaper,
    color: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    icon: Briefcase,
    color: "bg-gradient-to-r from-indigo-500 to-purple-500",
  },
];

const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block"
    style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
    transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// Stat Card Component (from second file)
const StatCard = ({
  icon: Icon,
  title,
  value,
  color = "blue",
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white/90 backdrop-blur-lg border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
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
        className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 bg-gradient-to-r ${
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
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl bg-gradient-to-br ${
              color === "blue"
                ? "from-[#2E3D99]/20 to-[#1D97D7]/30"
                : color === "green"
                ? "from-emerald-500/20 to-teal-500/30"
                : color === "purple"
                ? "from-violet-500/20 to-purple-500/30"
                : "from-amber-500/20 to-orange-500/30"
            }`}
          >
            <Icon
              className={`w-5 h-6 ${
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
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function UsersPerPage({ value, onChange }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>Show</span>
      <select
        id="users-per-page"
        value={value}
        onChange={onChange}
        className="block px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-[#2E3D99] transition-all"
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

function AccessModulesCheckbox({ selectedAccess, onAccessChange }) {
  return (
    <div className="mb-6">
      <label className="block font-medium mb-3 text-gray-700">
        Access Modules
      </label>
      <div className="grid grid-cols-2 gap-3">
        {ACCESS_MODULES.map((module) => (
          <label
            key={module.value}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white/50 hover:bg-white transition-all cursor-pointer"
          >
            <input
              type="checkbox"
              value={module.value}
              checked={selectedAccess.includes(module.value)}
              onChange={(e) => {
                if (e.target.checked)
                  onAccessChange([...selectedAccess, module.value]);
                else
                  onAccessChange(
                    selectedAccess.filter((a) => a !== module.value)
                  );
              }}
              className="form-checkbox h-5 w-5 text-[#2E3D99] rounded border-gray-300 focus:ring-[#2E3D99]"
            />
            <div
              className={`w-8 h-8 rounded-lg ${module.color} flex items-center justify-center`}
            >
              <module.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {module.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MobileAccessModulesDisplay({ access = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const company = localStorage.getItem("company");

  // Hide for IDG
  if (company === "idg") {
    return (
      <div className="text-gray-400 italic text-sm">Not applicable for IDG</div>
    );
  }

  if (!access || access.length === 0)
    return <span className="text-gray-400">None</span>;

  const getTargetPath = (currentPath) => {
    const role = localStorage.getItem("role");
    const basePath = role === "user" ? "/user" : "/admin";
    if (currentPath.includes("/dashboard")) return `${basePath}/dashboard`;
    if (currentPath.includes("/view-clients"))
      return `${basePath}/view-clients`;
    if (currentPath.includes("/manage-clients"))
      return `${basePath}/manage-clients`;
    if (currentPath.includes("/manage-users"))
      return `${basePath}/manage-users`;
    if (currentPath.includes("/archived-clients"))
      return `${basePath}/archived-clients`;
    if (currentPath.includes("/client/stages")) return `${basePath}/dashboard`;
    return `${basePath}/dashboard`;
  };

  const handleModuleClick = (module) => {
    localStorage.setItem("currentModule", module.value.toLowerCase());
    localStorage.setItem("workType", module.value.toUpperCase());
    window.dispatchEvent(new Event("moduleChanged"));
    const targetPath = getTargetPath(location.pathname);
    setTimeout(() => navigate(targetPath), 100);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ACCESS_MODULES.map((module) =>
        access.includes(module.value) ? (
          <button
            key={module.value}
            onClick={() => handleModuleClick(module)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${module.color} text-white hover:scale-110 transition-transform cursor-pointer shadow-sm`}
            title={`Switch to ${module.label}`}
          >
            <module.icon className="w-4 h-4" strokeWidth={2.5} />
          </button>
        ) : null
      )}
    </div>
  );
}

/* -------------------------
   Zustand store (unchanged from first file)
   ------------------------- */
const useUserStore = create((set) => ({
  users: [],
  isFetched: false,
  loading: false,
  setUsers: (users) => set({ users }),
  setIsFetched: (isFetched) => set({ isFetched }),
  setLoading: (loading) => set({ loading }),
  fetchUsers: async () => {
    const api = new AdminApi();
    set({ loading: true });
    try {
      const response = await api.getAllUsers();
      const formatted = response.users.map((user) => ({
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        status: user.status,
        role: user.role,
        access: user.access || [],
        createdAt: new Date(user.createdAt)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-"),
      }));
      set({ users: formatted, isFetched: true });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));

/* -------------------------
   Main Component with UI from second file but functionality from first
   ------------------------- */
export default function ManageUsers() {
  const { users, isFetched, loading, fetchUsers, setIsFetched } =
    useUserStore();
  const { searchQuery } = useSearchStore();

  const api = new AdminApi();
  const [selectedUser, setSelectedUser] = useState({});
  const [id, setId] = useState("");
  const [openUser, setOpenUser] = useState(false);
  const [openUserIDG, setOpenUserIDG] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");
  const [userList, setUserList] = useState([]);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [editAccess, setEditAccess] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const userUsers = users.filter((u) => u.role === "user").length;

  const handleChange = (e) => setRole(e.target.value);

  useEffect(() => {
    if (!isFetched) fetchUsers();
  }, [isFetched, fetchUsers]);

  // Search filtering (from first file)
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          String(user.displayName).toLowerCase().includes(lowercasedQuery) ||
          String(user.email).toLowerCase().includes(lowercasedQuery) ||
          String(user.role).toLowerCase().includes(lowercasedQuery)
      );
      setUserList(filtered);
    } else setUserList(users);
  }, [searchQuery, users]);

  // Columns (from first file) - Modified for IDG and with proper render function for access modules
  const columns =
    company !== "idg"
      ? [
          { key: "displayName", title: "Display Name" },
          { key: "email", title: "Email" },
          { key: "status", title: "Status" },
          { key: "role", title: "Role" },
          {
            key: "access",
            title: "Access Modules",
            render: (item) => {
              if (!item.access || item.access.length === 0) {
                return <span className="text-gray-400">None</span>;
              }

              return (
                <div className="flex flex-wrap gap-2 justify-center">
                  {ACCESS_MODULES.map((module) => {
                    if (item.access.includes(module.value)) {
                      const ModuleIcon = module.icon;
                      return (
                        <div
                          key={module.value}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${module.color} text-white shadow-sm`}
                          title={module.label}
                        >
                          <ModuleIcon
                            className="w-4 h-4 text-center"
                            strokeWidth={2.5}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            },
          },
          { key: "createdAt", title: "Created At" },
        ]
      : [
          { key: "displayName", title: "Display Name" },
          { key: "email", title: "Email" },
          { key: "status", title: "Status" },
          { key: "role", title: "Role" },
          { key: "createdAt", title: "Created At" },
        ];

  /* -------------------------
     Handlers (EXACTLY from first file - preserved)
     ------------------------- */
  const handleUserCreation = async (display_name, email, role) => {
    setIsLoading(true);
    try {
      await api.createUser(email, role, display_name, selectedAccess);
      toast.success("User created successfully!");
      setOpenUser(false);
      setSelectedAccess([]);
      setIsFetched(false);
      try {
        const notificationAPI = new NotificationAPI();
        await notificationAPI.createNotification({
          type: "user",
          message: `New user created: ${display_name} (${email})`,
          metadata: {
            userEmail: email,
            userName: display_name,
            role,
            route: "/admin/manage-users",
          },
        });
      } catch (notifyErr) {
        console.error("Notification send failed:", notifyErr);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409 || status === 400) {
        toast.error(
          err.response?.data?.message || "This email is already registered!"
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            "Something went wrong. Please try again!"
        );
      }
      console.error("Create User Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCreationIDG = async (display_name, email, role, password) => {
    try {
      setIsLoading(true);
      await api.createUserIDG(
        email,
        role,
        display_name,
        password,
        selectedAccess
      );
      toast.success("User created successfully!");
      setOpenUserIDG(false);
      setSelectedAccess([]);
      setIsFetched(false);
    } catch (err) {
      if (err.response?.status === 404)
        toast.error(
          err.response.data?.message || "This email is already registered!"
        );
      else
        toast.error(
          err.response?.data?.message ||
            "Something went wrong. Please try again!"
        );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserUpdate = async () => {
    try {
      await api.editUser({ ...selectedUser, access: editAccess });
      toast.success("User updated successfully!");
      setOpenEdit(false);
      setIsFetched(false);
    } catch (err) {
      toast.error("Failed to update user.");
      console.error("Update Error:", err);
    }
  };

  const handleUserDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.deleteUser(id);
      const userToDelete = users.find((u) => u.id === id);
      toast.success("User deleted successfully!");
      setOpenDelete(false);
      setIsFetched(false);
      if (userToDelete) {
        try {
          const notificationAPI = new NotificationAPI();
          await notificationAPI.createNotification({
            type: "user",
            message: `User deleted: ${userToDelete.displayName} (${userToDelete.email})`,
            metadata: {
              userEmail: userToDelete.email,
              userName: userToDelete.displayName,
              route: "/admin/manage-users",
            },
          });
        } catch (notifyErr) {
          console.error("Notification send failed:", notifyErr);
        }
      }
    } catch (err) {
      toast.error("Failed to delete user.");
      console.error("Delete Error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditAccess(user.access || []);
    setOpenEdit(true);
  };

  const shouldShowCreateButton = () =>
    currentModule === "commercial" || company === "vkl" || company === "idg";

  const handleCreateUserClick = () => {
    if (currentModule === "commercial") setOpenUser(true);
    else if (company === "vkl") setOpenUser(true);
    else if (company === "idg") setOpenUserIDG(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-[#00AEEF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 relative overflow-hidden">
      {/* Background floating elements from second file */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        {/* Grid Background from second file */}
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

      <div className="relative z-10 max-w-full">
        <Header />
        <main className="p-3 sm:p-4 md:p-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-full">
          {/* Header from second file */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                    User Management
                  </span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-2 truncate">
                  Manage user accounts, permissions, and access modules
                </p>
              </div>
              <div className="flex items-center gap-2">
                {shouldShowCreateButton() && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateUserClick}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Create User</span>
                    <span className="xs:hidden">Add User</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid from second file */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 w-full">
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              color="blue"
              loading={loading}
            />
            <StatCard
              title="Active Users"
              value={activeUsers}
              icon={Shield}
              color="green"
              loading={loading}
            />
            <StatCard
              title="Admin Users"
              value={adminUsers}
              icon={Key}
              color="purple"
              loading={loading}
            />
            <StatCard
              title="Regular Users"
              value={userUsers}
              icon={Users}
              color="orange"
              loading={loading}
            />
          </div>

          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Desktop table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden lg:block rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-full"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      All Users
                    </h3>
                  </div>
                  <UsersPerPage
                    value={usersPerPage}
                    onChange={(e) => setUsersPerPage(Number(e.target.value))}
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table
                    data={userList}
                    columns={columns}
                    onEdit={(user) => handleEditClick(user)}
                    onDelete={(user) => {
                      setId(user.id);
                      setOpenDelete(true);
                    }}
                    headerBgColor="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white"
                    itemsPerPage={usersPerPage}
                    cellWrappingClass="whitespace-normal"
                    compact={true}
                  />
                </div>
              </div>
            </motion.div>

            {/* Mobile view from second file */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FB4A50] rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">All Users</h3>
                </div>
                <UsersPerPage
                  value={usersPerPage}
                  onChange={(e) => setUsersPerPage(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userList.slice(0, usersPerPage).map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ y: -4 }}
                    className="bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 truncate">
                              {user.displayName}
                            </h3>
                            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditClick(user)}
                          title="Edit"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setId(user.id);
                            setOpenDelete(true);
                          }}
                          title="Delete"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100/50">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-500">
                            Status:
                          </span>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.status}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-500">
                            Role:
                          </span>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role}
                          </div>
                        </div>
                        {company !== "idg" && (
                          <div className="space-y-1 col-span-2">
                            <span className="font-semibold text-gray-500">
                              Access Modules:
                            </span>
                            <MobileAccessModulesDisplay access={user.access} />
                          </div>
                        )}
                        <div className="space-y-1 col-span-2">
                          <span className="font-semibold text-gray-500">
                            Created:
                          </span>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {user.createdAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Create User Dialog - For VKL and Commercial */}
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
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  &times;
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Create User
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add a new user to the system
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>

                  {company !== "idg" && (
                    <AccessModulesCheckbox
                      selectedAccess={selectedAccess}
                      onAccessChange={setSelectedAccess}
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2E3D99] transition-colors cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={role === "user"}
                          onChange={handleChange}
                          className="form-radio text-[#2E3D99]"
                        />
                        <div>
                          <div className="font-medium text-gray-700">User</div>
                          <div className="text-xs text-gray-500">
                            Regular user access
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#FB4A50] transition-colors cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="role"
                          value="admin"
                          checked={role === "admin"}
                          onChange={handleChange}
                          className="form-radio text-[#FB4A50]"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Admin</div>
                          <div className="text-xs text-gray-500">
                            Full system access
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type={isLoading ? "button" : "submit"}
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating User...
                    </div>
                  ) : (
                    "Create User"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </Dialog>

      {/* Create User Dialog - For IDG */}
      <Dialog
        open={openUserIDG}
        onClose={setOpenUserIDG}
        className="relative z-50"
      >
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
                  const password = form.get("password");
                  handleUserCreationIDG(display_name, email, role, password);
                }}
                className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative"
              >
                <button
                  type="button"
                  onClick={() => setOpenUserIDG(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  &times;
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Create User
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add a new user to the system
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      name="password"
                      type="text"
                      required
                      placeholder="Enter password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>

                  {company !== "idg" && (
                    <AccessModulesCheckbox
                      selectedAccess={selectedAccess}
                      onAccessChange={setSelectedAccess}
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2E3D99] transition-colors cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={role === "user"}
                          onChange={handleChange}
                          className="form-radio text-[#2E3D99]"
                        />
                        <div>
                          <div className="font-medium text-gray-700">User</div>
                          <div className="text-xs text-gray-500">
                            Regular user access
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#FB4A50] transition-colors cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="role"
                          value="admin"
                          checked={role === "admin"}
                          onChange={handleChange}
                          className="form-radio text-[#FB4A50]"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Admin</div>
                          <div className="text-xs text-gray-500">
                            Full system access
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type={isLoading ? "button" : "submit"}
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating User...
                    </div>
                  ) : (
                    "Create User"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog from second file */}
      <Dialog open={openEdit} onClose={setOpenEdit} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={() => setOpenEdit(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  &times;
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Edit User
                    </h2>
                    <p className="text-sm text-gray-600">
                      Update user details and permissions
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      value={selectedUser.displayName || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
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

                  {company !== "idg" && (
                    <AccessModulesCheckbox
                      selectedAccess={editAccess}
                      onAccessChange={setEditAccess}
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2E3D99] transition-colors cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="role"
                          checked={selectedUser.role === "user"}
                          onChange={() =>
                            setSelectedUser({ ...selectedUser, role: "user" })
                          }
                          className="form-radio text-[#2E3D99]"
                        />
                        <div>
                          <div className="font-medium text-gray-700">User</div>
                          <div className="text-xs text-gray-500">
                            Regular user access
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#FB4A50] transition-colors cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="role"
                          checked={selectedUser.role === "admin"}
                          onChange={() =>
                            setSelectedUser({ ...selectedUser, role: "admin" })
                          }
                          className="form-radio text-[#FB4A50]"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Admin</div>
                          <div className="text-xs text-gray-500">
                            Full system access
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleUserUpdate}
                    className="w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all"
                  >
                    Update User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Dialog>

      {/* Delete Dialog from second file */}
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
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={() => setOpenDelete(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  &times;
                </button>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Delete User
                  </h2>
                  <p className="text-gray-600">
                    Are you sure you want to delete this user? This action
                    cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleUserDelete}
                  disabled={deleteLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading && (
                    <Loader2 size={20} className="animate-spin" />
                  )}
                  {deleteLoading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
