import { useEffect, useState } from "react";
import { create } from "zustand";
import { Search, Plus, Edit, Trash2, RefreshCw, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table"; // Used for desktop view
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import AdminApi from "../../api/adminAPI";
import ClientApi from "../../api/userAPI.js";
import CommercialAPI from "../../api/commercialAPI";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { useSearchStore } from "../SearchStore/searchStore.js";
import CreateClientModal from "../../components/ui/CreateClientModal";
import userplus from "../../icons/Button icons/Group 313 (1).png";
import { motion } from "framer-motion";
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
        // For commercial module, we need to fetch commercial clients
        response = await api.getActiveProjects();
        console.log("Commercial clients response:", response);

        // Handle different response structures for commercial
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
        // IDG clients
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
        // VKL clients - you might want to add VKL client fetching here
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

// UsersPerPage dropdown component
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
        { key: "clientId", title: "Project Number" },
        { key: "name", title: "Client Name" },
        { key: "email", title: "Email" },
        { key: "contact", title: "Contact" },
        { key: "address", title: "Property Address" },
        { key: "country", title: "Country" },
        { key: "state", title: "State" },
        { key: "postcode", title: "PostCode" },
        { key: "abn", title: "ABN" },
      ];
    } else if (company === "idg") {
      return [
        { key: "clientId", title: "Client ID" },
        { key: "name", title: "Name" },
        { key: "email", title: "Email" },
        { key: "contact", title: "Contact" },
        { key: "address", title: "Address" },
        { key: "country", title: "Country" },
        { key: "state", title: "State" },
        { key: "postcode", title: "PostCode" },
        { key: "abn", title: "ABN" },
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
        // For commercial, we'll use the commercial API
        // You might need to adjust this based on your commercial API structure
        await api.createUser(email, role, display_name);
      } else {
        await api.createUser(email, role, display_name);
      }

      // Create notification
      const notificationAPI = new NotificationAPI();
      await notificationAPI.createNotification({
        type: "client",
        message: `New ${currentModule === "commercial" ? "project" : "client"
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
        `${currentModule === "commercial" ? "Project" : "Client"
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
        // For commercial, use commercial update method
        await api.editIDGClient(selectedUser);
      } else {
        await api.editIDGClient(selectedUser);
      }

      // Create notification
      // const notificationAPI = new NotificationAPI();
      // await notificationAPI.createNotification({
      //   type: "client",
      //   message: `${
      //     currentModule === "commercial" ? "Project" : "Client"
      //   } updated: ${selectedUser.name}`,
      //   metadata: {
      //     clientName: selectedUser.name,
      //     clientId: selectedUser.clientId,
      //     route:
      //       currentModule === "commercial"
      //         ? "/admin/view-clients"
      //         : "/admin/manage-clients",
      //   },
      // });

      toast.success(
        `${currentModule === "commercial" ? "Project" : "Client"
        } updated successfully!`
      );
      setOpenEdit(false);
      setIsFetched(false);
    } catch (err) {
      toast.error(
        `Failed to update ${currentModule === "commercial" ? "project" : "client"
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
        // For commercial, use commercial delete method
        await api.deleteIDGClient(id.clientId);
      } else {
        await api.deleteIDGClient(id.clientId);
      }
      toast.success(
        `${currentModule === "commercial" ? "Project" : "Client"
        } deleted successfully!`
      );
      setOpenDelete(false);
      setIsFetched(false);
    } catch (err) {
      toast.error(
        `Failed to delete ${currentModule === "commercial" ? "project" : "client"
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
    <div className="min-h-screen w-full bg-gray-100 overflow-hidden p-2">
      <Header />
      <main className="w-full max-w-8xl mx-auto p-5">
        {/* Manage Users Header */}
        <div className="flex justify-between items-center mb-[15px]">
          <CreateClientModal
            createType={currentModule === "commercial" ? "project" : "client"}
            companyName={company}
            isOpen={createuser}
            setIsOpen={() => setcreateuser(false)}
          />
          <h2 className="text-2xl font-semibold">{getPageTitle()}</h2>
          {/* <Button
            label={getCreateButtonLabel()}
            Icon1={userplus}
            onClick={() => setcreateuser(true)}
            width="w-[150px]"
          /> */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setcreateuser(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            <span className="xs:hidden">Add Client</span>
          </motion.button>
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
                cellWrappingClass="whitespace-normal"
                resetLoadingEmail={resetLoadingEmail}
                resetSuccessEmail={resetSuccessEmail}
                showActions={true}
                isClients={true}
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
                const isRowLoading = resetLoadingEmail === user.email;
                const isRowSuccess = resetSuccessEmail === user.email;
                return (
                  <div
                    key={user.id}
                    className="bg-white p-4 rounded-2xl shadow space-y-3"
                  >
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                          {user.name || user.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {currentModule === "commercial"
                            ? "Project"
                            : "Client"}{" "}
                          ID: {user.clientId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
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
                            setId(user);
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
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="font-semibold text-gray-500">
                            Address:
                          </span>{" "}
                          {user.address}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-500">
                            Email:
                          </span>{" "}
                          {user.email}
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

      {/* Create User Dialog */}
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
              <h2 className="text-lg font-bold mb-4">
                Create {currentModule === "commercial" ? "Project" : "Client"}
              </h2>
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
                placeholder={
                  currentModule === "commercial"
                    ? "Client Name"
                    : "Display Name"
                }
                className="w-full mb-4 px-4 py-3 border rounded"
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
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded hover:bg-blue-600"
              >
                {isLoading
                  ? "Creating..."
                  : `Create ${currentModule === "commercial" ? "Project" : "Client"
                  }`}
              </button>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={setOpenEdit} className="relative z-10">
        {console.log(selectedUser)}
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

              <h2 className="text-lg font-bold mb-4">
                Edit {currentModule === "commercial" ? "Project" : "Client"} ID
                : {selectedUser.clientId}
              </h2>

              {/* Name */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Name
              </label>
              <input
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    name: e.target.value,   // changed to update name, not displayName
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />

              {/* Email */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={selectedUser.email || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />

              <label className="block mb-1 font-medium text-sm text-gray-700">
                Password
              </label>
              <input
                placeholder="Update new password here and click edit"
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    password: e.target.value,   // changed to update name, not displayName
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />

              {/* Address */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Address
              </label>
              <input
                value={selectedUser.address || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    address: e.target.value,  // fixed to update address
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />
              {/* Country */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Country
              </label>
              <input
                value={selectedUser.country}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    country: e.target.value,   // changed to update name, not displayName
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />

              {/* State */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                State
              </label>
              <input
                value={selectedUser.state}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    state: e.target.value,   // changed to update name, not displayName
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />
              {/* Postcode */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Postcode
              </label>
              <input
                value={selectedUser.postcode}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    postcode: e.target.value,   // changed to update name, not displayName
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />

              {/* ABN */}
              <label className="block mb-1 font-medium text-sm text-gray-700">
                ABN
              </label>
              <input
                value={selectedUser.abn}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    abn: e.target.value,   // changed to update name, not displayName
                  })
                }
                className="w-full mb-2 px-4 py-3 border rounded"
              />

              <Button
                label={`Edit ${currentModule === "commercial" ? "Project" : "Client"
                  }`}
                onClick={handleUserUpdate}
              />
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
              <h2 className="text-lg font-bold mb-4">
                Delete {currentModule === "commercial" ? "Project" : "Client"}
              </h2>
              <p className="mb-6">
                Are you sure you want to delete this{" "}
                {currentModule === "commercial" ? "project" : "client"}?
              </p>
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
      <div className="sr-only" aria-live="polite">
        {resetLoadingEmail && `Sending reset link to ${resetLoadingEmail}`}
        {resetSuccessEmail && `Reset link sent to ${resetSuccessEmail}`}
      </div>
    </div>
  );
}
