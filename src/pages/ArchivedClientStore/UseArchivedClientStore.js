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
      const company = localStorage.getItem("company");
      const res =
        company === "vkl"
          ? await api.getArchivedClients()
          : company === "idg"
          ? await api.getIDGCompletedOrders()
          : await api.getClients();

      let sourceArray = [];

      // normalize source array for different responses
      if (company === "vkl") {
        sourceArray = res && Array.isArray(res.clients) ? res.clients : [];
      } else if (company === "idg") {
        // idg might return an array or an object; try to support both
        if (Array.isArray(res)) sourceArray = res;
        else if (res && Array.isArray(res.clients)) sourceArray = res.clients;
        else sourceArray = [];
      } else {
        // default clients endpoint might return { clients: [...] } or an array
        if (Array.isArray(res)) sourceArray = res;
        else if (res && Array.isArray(res.clients)) sourceArray = res.clients;
        else sourceArray = [];
      }

      let mapped = [];

      if (company === "vkl") {
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
      } else if (company === "idg") {
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
      } else {
        // generic clients mapping for other companies
        mapped = sourceArray.map((client, index) => ({
          id: client._id || client.id || index + 1,
          matternumber: client.matterNumber || client.matternumber || "N/A",
          client_name: client.clientName || client.client_name || "N/A",
          property_address:
            client.propertyAddress ||
            client.businessAddress ||
            client.property_address ||
            "N/A",
          businessAddress:
            client.businessAddress || client.propertyAddress || "N/A",
          state: client.state || "N/A",
          clientType: client.clientType || client.type || "N/A",
          status: client.closeMatter || client.status || "N/A",
          matter_date: formatDate(
            client.matterDate || client.matter_date,
            "DD-MM-YYYY"
          ),
          settlement_date: formatDate(
            client.settlementDate || client.settlement_date,
            "DD-MM-YYYY"
          ),
          settlement_date_iso: client.settlementDate
            ? moment(client.settlementDate).format("YYYY-MM-DD")
            : client.settlement_date
            ? moment(client.settlement_date).format("YYYY-MM-DD")
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
