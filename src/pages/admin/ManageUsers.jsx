import { useEffect, useState } from "react";
import { create } from "zustand";
import { Search, Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import AdminApi from "../../api/adminAPI";
import Header from "../../components/layout/Header";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

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
        createdAt: new Date(user.createdAt).toLocaleDateString("en-GB").split("/").reverse().join("-"),
      }));
      set({ users: formatted, isFetched: true });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));

export default function ManageUsers() {
  const {
    users,
    isFetched,
    loading,
    fetchUsers,
    setIsFetched,
    setUsers,
  } = useUserStore();

  const api = new AdminApi();
  const [selectedUser, setSelectedUser] = useState({});
  const [id, setId] = useState("");
  const [openUser, setOpenUser] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('');

  const handleChange = (e) => {
    setRole(e.target.value);
  };

  useEffect(() => {
    if (!isFetched) fetchUsers();
  }, [isFetched]);

  const columns = [
    { key: "displayName", title: "Display Name" },
    { key: "email", title: "Email" },
    { key: "status", title: "Status" },
    { key: "role", title: "Role" },
    { key: "createdAt", title: "Created At" },
  ];

  const handleUserCreation = async (name, email) => {
    try {
      setIsLoading(true)
      await api.createUser(email, role, name);
      toast.success("User created successfully!")
    } catch (err) {
      toast.success("Something went wrong!")
    } finally {
      setIsLoading(false)
      setOpenUser(false);
      setIsFetched(false);
    }
  };

  const handleUserUpdate = async () => {
    try {
      await api.editUser(selectedUser);
      setOpenEdit(false);
      setIsFetched(false);
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleUserDelete = async () => {
    try {
      await api.deleteUser(id);
      setOpenDelete(false);
      setIsFetched(false);
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 overflow-hidden">
      <main className="w-full max-w-8xl mx-auto">
        <Header />
        {/* Manage Users Header */}
        <div className="flex justify-between items-center mb-[15px]">
          <h2 className="text-2xl font-semibold">Manage Users</h2>
          <Button label="Create new user" icon={Plus} onClick={() => setOpenUser(true)} />
        </div>

        {/* Table or Loader */}
        {loading ? (
          <Loader />
        ) : (
          <Table
            data={users}
            columns={columns}
            onEdit={(u) => { setSelectedUser(u); setOpenEdit(true); }}
            onDelete={(id) => { setId(id); setOpenDelete(true); }}
            itemsPerPage={5}
          />
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
                const name = form.get("name");
                handleUserCreation(name, email, role);
              }}
              className="bg-[#F3F4FB] rounded-lg p-6 shadow-xl sm:w-full sm:max-w-lg relative"
            >
              <button type="button" onClick={() => setOpenUser(false)} className="absolute top-4 right-5 text-red-500 text-3xl font-bold">&times;</button>
              <h2 className="text-lg font-bold mb-4">Create User</h2>
              <input name="email" type="email" required placeholder="Email" className="w-full mb-4 px-4 py-3 border rounded" />
              <input name="name" type="text" required placeholder="Display Name" className="w-full mb-4 px-4 py-3 border rounded" />
              <label className="block font-medium mb-2">Role</label>
              <div className="flex gap-6 mb-6">
                <label><input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={role === 'Male'}
                  onChange={handleChange}
                  className="form-radio text-blue-600"
                /> User</label>
                <label><input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={role === 'Female'}
                  onChange={handleChange}
                  className="form-radio text-pink-600"
                /> Admin</label>
              </div>
              {
                isLoading ? (<button
                  type="button"
                  disabled={true}
                  className="w-full bg-sky-600 text-white py-2 rounded-md"
                >
                  Saving...
                </button>) : (
                  <button type="submit" className="w-full bg-[#00AEEF] text-white py-2 rounded hover:bg-blue-600">Create</button>
                )
              }
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
              <button onClick={() => setOpenEdit(false)} className="absolute top-4 right-5 text-red-500 text-3xl font-bold">&times;</button>
              <h2 className="text-lg font-bold mb-4">Edit User</h2>
              <input value={selectedUser.displayName || ''} onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })} className="w-full mb-4 px-4 py-3 border rounded" />
              <input value={selectedUser.email || ''} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full mb-4 px-4 py-3 border rounded" />
              <div className="flex gap-6 mb-6">
                <label><input type="radio" name="role" checked={selectedUser.role === "user"} onChange={() => setSelectedUser({ ...selectedUser, role: "user" })} /> User</label>
                <label><input type="radio" name="role" checked={selectedUser.role === "admin"} onChange={() => setSelectedUser({ ...selectedUser, role: "admin" })} /> Admin</label>
              </div>
              <Button label="Update" onClick={handleUserUpdate} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={setOpenDelete} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="bg-[#F3F4FB] rounded-lg p-6 shadow-xl sm:w-full sm:max-w-md relative">
              <button onClick={() => setOpenDelete(false)} className="absolute top-4 right-5 text-red-500 text-3xl font-bold">&times;</button>
              <h2 className="text-lg font-bold mb-4">Delete User</h2>
              <p className="mb-6">Are you sure you want to delete this user?</p>
              <button onClick={handleUserDelete} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Delete</button>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
