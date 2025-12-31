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

  // --- Fetch archived clients ---
  fetchArchivedClients: async () => {
    set({ loading: true });
    const api = new ClientAPI();

    try {
      const currentModule = localStorage.getItem("currentModule");

      const res =
        currentModule === "print media"
          ? await api.getIDGCompletedOrders()
          : currentModule === "commercial"
          ? await api.getClients()
          : await api.getArchivedClients();

      let sourceArray = [];

      // normalize source array for different responses
      if (currentModule !== "print media") {
        sourceArray = res && Array.isArray(res.clients) ? res.clients : [];
      } else {
        if (Array.isArray(res)) sourceArray = res;
        else if (res && Array.isArray(res.clients)) sourceArray = res.clients;
        else sourceArray = [];
      }

      let mapped = [];

      if (currentModule !== "print media") {
        mapped = sourceArray.map((client, index) => ({
          id: index + 1,
          matternumber: client.matterNumber || "N/A",
          client_name: client.clientName || "N/A",
          property_address: client.propertyAddress || "N/A",
          businessAddress:
            client.businessAddress || client.propertyAddress || "N/A",
          state: client.state || "N/A",
          type: client.clientType || "N/A",
          status: client.closeMatter || "N/A",
          matter_date: formatDate(client.matterDate, "DD-MM-YYYY"),
          settlement_date: formatDate(client.settlementDate, "DD-MM-YYYY"),
          settlement_date_iso: client.settlementDate
            ? moment(client.settlementDate).format("YYYY-MM-DD")
            : "N/A",
          isClosed: client.closeMatter === "closed",
          // include original payload so callers can still access raw fields
          __raw: client,
        }));
      } else {
        mapped = sourceArray.map((client, index) => ({
          orderId: client.orderId || client.id || `idg-${index}`,
          clientName: client.client_name || client.clientName || "N/A",
          dataEntryBy: client.dataEntryBy || "N/A",
          orderType: client.orderType || client.ordertype || "N/A",
          propertyAddress:
            client.deliveryAddress || client.propertyAddress || "N/A",
          ordertype: client.orderType || client.ordertype || "N/A",
          status: client.closeOrder || client.status || "N/A",
          state: client.state || "N/A",
          orderDate: client.orderDate ? client.orderDate.slice(0, 10) : "N/A",
          deliveryDate: client.deliveryDate
            ? client.deliveryDate.slice(0, 10)
            : "N/A",
          __raw: client,
        }));
      }

      set({ archivedClients: mapped, isFetched: true, loading: false });

      // IMPORTANT: return the data so callers (e.g. react-query) don't receive undefined
      return mapped;
    } catch (err) {
      console.error("Failed to fetch archived clients", err);
      toast.error("Could not load archived client data.");
      set({ archivedClients: [], isFetched: true, loading: false });
      return []; // return empty array on error
    }
  },

  // --- Trigger a refetch manually ---
  reloadArchivedClients: () => {
    set({ isFetched: false, refreshKey: get().refreshKey + 1 });
  },
}));
