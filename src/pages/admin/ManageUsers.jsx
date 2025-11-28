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
} from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table"; // Used for desktop view
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import AdminApi from "../../api/adminAPI";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";
import { useNavigate, useLocation } from "react-router-dom";

import NotificationAPI from "../../api/notificationAPI";

const ACCESS_MODULES = [
  {
    value: "CONVEYANCING",
    label: "Conveyancing",
    icon: Home,
    color: "bg-blue-500",
  },
  { value: "WILLS", label: "Wills", icon: FileText, color: "bg-emerald-500" },
  {
    value: "PRINT MEDIA",
    label: "Print Media",
    icon: Newspaper,
    color: "bg-amber-500",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    icon: Briefcase,
    color: "bg-indigo-500",
  },
];

// 🔸 Zustand Store
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

// UsersPerPage dropdown component
function UsersPerPage({ value, onChange }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>Show</span>
      <select
        id="users-per-page"
        value={value}
        onChange={onChange}
        className="block px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
      <label className="block font-medium mb-3">Access Modules</label>
      <div className="grid grid-cols-2 gap-3">
        {ACCESS_MODULES.map((module) => (
          <label key={module.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              value={module.value}
              checked={selectedAccess.includes(module.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onAccessChange([...selectedAccess, module.value]);
                } else {
                  onAccessChange(
                    selectedAccess.filter((access) => access !== module.value)
                  );
                }
              }}
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{module.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MobileAccessModulesDisplay({ access = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!access || access.length === 0) {
    return <span className="text-gray-400">None</span>;
  }

  const getTargetPath = (currentPath, module) => {
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
    // Save the module to localStorage
    localStorage.setItem("currentModule", module.value.toLowerCase());
    localStorage.setItem("workType", module.value.toUpperCase());

    // Dispatch event to update the sidebar
    window.dispatchEvent(new Event("moduleChanged"));

    // Navigate to the appropriate page
    const targetPath = getTargetPath(location.pathname, module);
    setTimeout(() => {
      navigate(targetPath);
    }, 100);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {ACCESS_MODULES.map((module) => {
        if (access.includes(module.value)) {
          const ModuleIcon = module.icon;
          return (
            <button
              key={module.value}
              onClick={() => handleModuleClick(module)}
              className={`w-5 h-5 rounded flex items-center justify-center ${module.color} text-white hover:scale-110 transition-transform cursor-pointer`}
              title={`Switch to ${module.label}`}
            >
              <ModuleIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}

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

  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

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
          String(user.displayName).toLowerCase().includes(lowercasedQuery) ||
          String(user.email).toLowerCase().includes(lowercasedQuery) ||
          String(user.role).toLowerCase().includes(lowercasedQuery)
      );
      setUserList(filtered);
    } else {
      setUserList(users);
    }
  }, [searchQuery, users]);

  const columns = [
    { key: "displayName", title: "Display Name" },
    { key: "email", title: "Email" },
    { key: "status", title: "Status" },
    { key: "role", title: "Role" },
    {
      key: "access",
      title: "Access Modules",
      render: null,
    },
    { key: "createdAt", title: "Created At" },
  ];

  const handleUserCreation = async (display_name, email, role) => {
    try {
      setIsLoading(true);
      await api.createUser(email, role, display_name, selectedAccess);

      // Create notification
      const notificationAPI = new NotificationAPI();
      await notificationAPI.createNotification({
        type: "user",
        message: `New user created: ${display_name} (${email})`,
        metadata: {
          userEmail: email,
          userName: display_name,
          role: role,
          route: "/admin/manage-users",
        },
      });

      toast.success("User created successfully!");
      setOpenUser(false);
      setSelectedAccess([]);
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
      await api.editUser({
        ...selectedUser,
        access: editAccess,
      });
      toast.success("User updated successfully!");
      setOpenEdit(false);
      setIsFetched(false);
    } catch (err) {
      toast.error("Failed to update user.");
      console.error("Update Error:", err);
    }
  };

  const handleUserDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.deleteUser(id);

      const userToDelete = users.find((user) => user.id === id);
      if (userToDelete) {
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
      }

      toast.success("User deleted successfully!");
      setOpenDelete(false);
      setIsFetched(false);
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

  const shouldShowCreateButton = () => {
    if (currentModule === "commercial") {
      return true;
    }
    return company === "vkl" || company === "idg";
  };

  const handleCreateUserClick = () => {
    if (currentModule === "commercial") {
      setOpenUser(true);
    } else if (company === "vkl") {
      setOpenUser(true);
    } else if (company === "idg") {
      setOpenUserIDG(true);
    }
  };

  const getCreateButtonLabel = () => {
    if (currentModule === "commercial") {
      return "Create User";
    }
    return "Create User";
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 overflow-hidden p-2">
      <Header />
      <main className="w-full max-w-8xl mx-auto p-5">
        {/* Manage Users Header */}
        <div className="flex justify-between items-center mb-[15px]">
          <h2 className="text-2xl font-semibold">
            {currentModule === "commercial"
              ? "Manage Users - Commercial"
              : "Manage Users"}
          </h2>
          {shouldShowCreateButton() && (
            <Button
              label={getCreateButtonLabel()}
              icon={Plus}
              onClick={handleCreateUserClick}
              className="text-sm px-2 py-1 sm:text-base sm:px-4 sm:py-2"
            />
          )}
        </div>

        {/* Table or Loader */}
        {loading ? (
          <Loader />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="flex justify-start mb-4">
                <UsersPerPage
                  value={usersPerPage}
                  onChange={(e) => setUsersPerPage(Number(e.target.value))}
                />
              </div>
              <Table
                data={userList}
                columns={columns}
                onEdit={(user) => {
                  handleEditClick(user);
                }}
                // onReset={handleReset}
                onDelete={(user) => {
                  setId(user.id);
                  setOpenDelete(true);
                }}
                itemsPerPage={usersPerPage}
                headerBgColor="bg-[#A6E7FF]"
                cellWrappingClass="whitespace-normal"
                compact={true}
                // resetLoadingEmail={resetLoadingEmail}
                // resetSuccessEmail={resetSuccessEmail}
              />
            </div>
            {/* Mobile & Tablet Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              <div className="sm:col-span-2">
                <UsersPerPage
                  value={usersPerPage}
                  onChange={(e) => setUsersPerPage(Number(e.target.value))}
                />
              </div>
              {userList.slice(0, usersPerPage).map((user) => {
                // const isRowLoading = resetLoadingEmail === user.email;
                // const isRowSuccess = resetSuccessEmail === user.email;
                return (
                  <div
                    key={user.id}
                    className="bg-white p-4 rounded-2xl shadow space-y-3"
                  >
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                          {user.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleEditClick(user)}
                          title="Edit"
                          className="flex flex-col items-center p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit size={16} />
                          <span className="text-xs mt-1">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setId(user.id);
                            setOpenDelete(true);
                          }}
                          title="Delete"
                          className="flex flex-col items-center p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs mt-1">Delete</span>
                        </button>
                        {/* <button
                          onClick={() => handleReset(user.email)}
                          disabled={isRowLoading}
                          title={
                            isRowLoading
                              ? "Sending reset link..."
                              : isRowSuccess
                              ? "Reset link sent"
                              : "Reset Password"
                          }
                          className={`flex flex-col items-center p-2 rounded-lg transition-colors
                            ${
                              isRowSuccess
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                : "text-gray-600 hover:bg-gray-100"
                            }
                            ${
                              isRowLoading
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                        >
                          {isRowLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                          <span className="text-xs mt-1">
                            {isRowLoading
                              ? "Sending…"
                              : isRowSuccess
                              ? "Sent"
                              : "Reset"}
                          </span>
                        </button> */}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-500">
                            Status:
                          </span>{" "}
                          {user.status}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-500">
                            Role:
                          </span>{" "}
                          {user.role}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">
                            Access:
                          </span>
                          <MobileAccessModulesDisplay access={user.access} />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-500">
                            Created:
                          </span>{" "}
                          {user.createdAt}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Create User Dialog - For VKL and Commercial */}
      <Dialog open={openUser} onClose={setOpenUser} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const email = form.get("email");
                const display_name = form.get("name");
                handleUserCreation(display_name, email, role);
              }}
              className="bg-[#F3F4FB] rounded-lg p-6 shadow-xl sm:w-full sm:max-w-lg relative"
            >
              <button
                type="button"
                onClick={() => setOpenUser(false)}
                className="absolute top-4 right-5 text-red-500 text-3xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">Create User</h2>
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="w-full mb-4 px-4 py-3 border rounded"
              />
              <input
                name="name"
                type="text"
                required
                placeholder="Display Name"
                className="w-full mb-4 px-4 py-3 border rounded"
              />

              <AccessModulesCheckbox
                selectedAccess={selectedAccess}
                onAccessChange={setSelectedAccess}
              />

              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  User
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={handleChange}
                    className="form-radio text-pink-600"
                  />
                  Admin
                </label>
              </div>
              <button
                type={isLoading ? "button" : "submit"}
                disabled={isLoading}
                className="w-full bg-[#00AEEF] text-white font-bold py-3 px-4 rounded hover:bg-blue-600"
              >
                {isLoading ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Create User Dialog - For IDG */}
      <Dialog
        open={openUserIDG}
        onClose={setOpenUserIDG}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const email = form.get("email");
                const display_name = form.get("name");
                const password = form.get("password");
                handleUserCreationIDG(display_name, email, role, password);
              }}
              className="bg-[#F3F4FB] rounded-lg p-6 shadow-xl sm:w-full sm:max-w-lg relative"
            >
              <button
                type="button"
                onClick={() => setOpenUserIDG(false)}
                className="absolute top-4 right-5 text-red-500 text-3xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">Create User</h2>
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="w-full mb-4 px-4 py-3 border rounded"
              />
              <input
                name="name"
                type="text"
                required
                placeholder="Display Name"
                className="w-full mb-4 px-4 py-3 border rounded"
              />
              <input
                name="password"
                type="text"
                required
                placeholder="Password"
                className="w-full mb-4 px-4 py-3 border rounded"
              />

              <AccessModulesCheckbox
                selectedAccess={selectedAccess}
                onAccessChange={setSelectedAccess}
              />
              <label className="block font-medium mb-2">Role</label>
              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  User
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={handleChange}
                    className="form-radio text-pink-600"
                  />
                  Admin
                </label>
              </div>
              <button
                type={isLoading ? "button" : "submit"}
                disabled={isLoading}
                className="w-full bg-[#00AEEF] text-white font-bold py-3 px-4 rounded hover:bg-blue-600"
              >
                {isLoading ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={setOpenEdit} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="bg-[#F3F4FB] rounded-lg p-6 shadow-xl sm:w-full sm:max-w-lg relative">
              <button
                onClick={() => setOpenEdit(false)}
                className="absolute top-4 right-5 text-red-500 text-3xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">Edit User</h2>
              <input
                value={selectedUser.displayName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    displayName: e.target.value,
                  })
                }
                className="w-full mb-4 px-4 py-3 border rounded"
              />
              <input
                value={selectedUser.email || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                className="w-full mb-4 px-4 py-3 border rounded"
              />

              <AccessModulesCheckbox
                selectedAccess={editAccess}
                onAccessChange={setEditAccess}
              />
              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    checked={selectedUser.role === "user"}
                    onChange={() =>
                      setSelectedUser({ ...selectedUser, role: "user" })
                    }
                  />
                  User
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    checked={selectedUser.role === "admin"}
                    onChange={() =>
                      setSelectedUser({ ...selectedUser, role: "admin" })
                    }
                  />
                  Admin
                </label>
              </div>
              <Button label="Update" onClick={handleUserUpdate} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDelete}
        onClose={setOpenDelete}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="bg-[#F3F4FB] rounded-lg p-6 shadow-xl sm:w-full sm:max-w-md relative">
              <button
                onClick={() => setOpenDelete(false)}
                className="absolute top-4 right-5 text-red-500 text-3xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">Delete User</h2>
              <p className="mb-6">Are you sure you want to delete this user?</p>
              <button
                onClick={handleUserDelete}
                disabled={deleteLoading}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* a11y live announcements (non-visual) */}
      {/* <div className="sr-only" aria-live="polite">
        {resetLoadingEmail && `Sending reset link to ${resetLoadingEmail}`}
        {resetSuccessEmail && `Reset link sent to ${resetSuccessEmail}`}
      </div> */}
    </div>
  );
}
