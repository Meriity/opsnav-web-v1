import { useEffect, useState } from "react";
import { create } from "zustand";
import { Search, Plus, Edit, Trash2, RefreshCw, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table"; // Used for desktop view
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import AdminApi from "../../api/adminAPI";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";

import NotificationAPI from "../../api/notificationAPI";

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
        canCreateUsers: user.canCreateUsers || false,
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

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info from localStorage or context
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return currentUser;
};

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

  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const currentModule = localStorage.getItem("currentModule");
  const company = localStorage.getItem("company");

  const currentUserRole = localStorage.getItem("role");
  const isSuperAdmin = currentUserRole === "superadmin";

  useEffect(() => {
    console.log("=== SIMPLE DEBUG ===");
    console.log("User Role:", currentUserRole);
    console.log("Is Super Admin:", isSuperAdmin);
    console.log("===================");
  }, [currentUserRole, isSuperAdmin]);

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

  const displayUserList = userList.map((user) => ({
    ...user,
    // Keep original canCreateUsers for editing
    // Create a display version for the table
    displayCanCreateUsers: user.canCreateUsers ? "Yes" : "No",
  }));

  // Update columns to use the display version
  const columns = [
    { key: "displayName", title: "Display Name" },
    { key: "email", title: "Email" },
    { key: "status", title: "Status" },
    { key: "role", title: "Role" },
    ...(isSuperAdmin
      ? [{ key: "displayCanCreateUsers", title: "Can Create Users" }]
      : []),
    { key: "createdAt", title: "Created At" },
  ];

  const handleEdit = (displayUser) => {
    // Find the original user from userList (not displayUserList)
    const originalUser = userList.find((u) => u.id === displayUser.id);
    if (originalUser) {
      setSelectedUser(originalUser);
      setOpenEdit(true);
    }
  };

  const handleUserCreation = async (
    display_name,
    email,
    role,
    canCreateUsers = false
  ) => {
    try {
      setIsLoading(true);
      await api.createUser(email, role, display_name, canCreateUsers);

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

  const handleUserCreationIDG = async (
    display_name,
    email,
    role,
    password,
    canCreateUsers = false
  ) => {
    try {
      setIsLoading(true);
      await api.createUserIDG(
        email,
        role,
        display_name,
        password,
        canCreateUsers
      );
      toast.success("User created successfully!");
      setOpenUserIDG(false);
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
      await api.editUser(selectedUser);
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
            {currentModule === "commercial" ? "Manage Users" : "Manage Users"}
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
                data={displayUserList}
                columns={columns}
                onEdit={handleEdit}
                onDelete={(user) => {
                  // Handle both original and display users
                  const userId = user.id;
                  setId(userId);
                  setOpenDelete(true);
                }}
                itemsPerPage={usersPerPage}
                headerBgColor="bg-[#A6E7FF]"
                cellWrappingClass="whitespace-normal"
                compact={true}
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
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenEdit(true);
                          }}
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
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
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
                        {isSuperAdmin && (
                          <div>
                            <span className="font-semibold text-gray-500">
                              Can Create:
                            </span>{" "}
                            {user.canCreateUsers ? "Yes" : "No"}
                          </div>
                        )}
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
                const canCreateUsers = form.get("canCreateUsers") === "on";
                handleUserCreation(display_name, email, role, canCreateUsers);
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
              <label className="block font-medium mb-2">Role</label>
              <div className="flex gap-6 mb-4">
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

              {/* Can Create Users Checkbox - Only for Super Admin */}
              {isSuperAdmin && (
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="canCreateUsers"
                      className="form-checkbox text-blue-600 rounded"
                    />
                    <span className="font-medium">Can Create Users</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Allow this user to create other users
                  </p>
                </div>
              )}

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
                const canCreateUsers = form.get("canCreateUsers") === "on";
                handleUserCreationIDG(
                  display_name,
                  email,
                  role,
                  password,
                  canCreateUsers
                );
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
              <label className="block font-medium mb-2">Role</label>
              <div className="flex gap-6 mb-4">
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

              {/* Can Create Users Checkbox - Only for Super Admin */}
              {isSuperAdmin && (
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="canCreateUsers"
                      className="form-checkbox text-blue-600 rounded"
                    />
                    <span className="font-medium">Can Create Users</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Allow this user to create other users
                  </p>
                </div>
              )}

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
              <div className="flex gap-6 mb-4">
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

              {/* Can Create Users Checkbox - Only for Super Admin */}
              {isSuperAdmin && (
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUser.canCreateUsers || false}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          canCreateUsers: e.target.checked,
                        })
                      }
                      className="form-checkbox text-blue-600 rounded"
                    />
                    <span className="font-medium">Can Create Users</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Allow this user to create other users
                  </p>
                </div>
              )}

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
    </div>
  );
}
