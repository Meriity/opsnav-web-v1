// src/pages/ArchivedClientStore/UseArchivedClientStore.js
import { create } from "zustand";
import ClientAPI from "../../api/userAPI";
import moment from "moment";
import { toast } from "react-toastify";

const formatDate = (dateString, format) => {
  if (!dateString) return "N/A";
  try {
    const date = moment(dateString);
    return date.isValid() ? date.format(format) : "N/A";
  } catch {
    return "N/A";
  }
};

export const useArchivedClientStore = create((set, get) => ({
  archivedClients: [],
  loading: false,
  isFetched: false,
  refreshKey: 0, 
  isError:false,

  // --- Fetch archived clients ---
  fetchArchivedClients: async () => {
    set({ loading: true });
    const api = new ClientAPI();

    try {
      const company = localStorage.getItem("company");
      const res =
        company === "vkl"
          ? await api.getArchivedClients()
          : company === "idg"
          ? await api.getIDGCompletedOrders()
          : await api.getClients();

      let mapped = [];

      if (company === "vkl") {
        mapped = res.clients.map((client, index) => ({
          id: index + 1,
          matternumber: client.matterNumber || "N/A",
          client_name: client.clientName || "N/A",
          property_address: client.propertyAddress || "N/A",
          state: client.state || "N/A",
          type: client.clientType || "N/A",
          status: client.closeMatter || "N/A",
          matter_date: formatDate(client.matterDate, "DD-MM-YYYY"),
          settlement_date: formatDate(client.settlementDate, "DD-MM-YYYY"),
          settlement_date_iso: formatDate(client.settlementDate, "YYYY-MM-DD"),
          isClosed: client.closeMatter === "closed",
        }));
      } else if (company === "idg") {
        mapped = res.map((client, index) => ({
          orderId: client.orderId,
          clientName: client.client_name,
          dataEntryBy: client.dataEntryBy,
          orderType: client.orderType,
          propertyAddress: client.deliveryAddress,
          ordertype: client.orderType,
          status: client.closeOrder,
          state: client.state || "N/A",
          orderDate: client.orderDate?.slice(0, 10),
          deliveryDate: client.deliveryDate?.slice(0, 10),
        }));
      }

      set({ archivedClients: mapped, isFetched: true, loading: false });
    } catch (err) {
      console.error("Failed to fetch archived clients", err);
      toast.error("Could not load archived client data.");
      set({ archivedClients: [], isFetched: true, loading: false,isError:true });
    }
  },

  // --- Trigger a refetch manually ---
  reloadArchivedClients: () => {
    set({ isFetched: false, refreshKey: get().refreshKey + 1 });
  },
}));