// src/pages/ArchivedClientStore/UseArchivedClientStore.js

import { create } from "zustand";
import ClientAPI from "../../api/userAPI";
import moment from "moment";
import { toast } from "react-toastify";

// Reusable date formatting function
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
  fetchArchivedClients: async () => {
    if (get().isFetched) return;

    set({ loading: true });
    const api = new ClientAPI();
    try {
      const res = await api.getArchivedClients();

      const mapped = res.clients.map((client, index) => ({
        // --- Data for Archived Clients Table ---
        id: index + 1,
        matternumber: client.matterNumber || "N/A",
        client_name: client.clientName || "N/A",
        property_address: client.propertyAddress || "N/A",
        state: client.state || "N/A",
        type: client.clientType || "N/A",
        status: client.closeMatter || "N/A",
        // Date formatted specifically for the table (DD-MM-YYYY)
        matter_date: formatDate(client.matterDate, "DD-MM-YYYY"),
        settlement_date: formatDate(client.settlementDate, "DD-MM-YYYY"),

        // --- Data specifically for the Dashboard Calendar ---
        // Date formatted for reliable calendar parsing (YYYY-MM-DD)
        settlement_date_iso: formatDate(client.settlementDate, "YYYY-MM-DD"),
        isClosed: client.closeMatter === "closed",
      }));

      set({ archivedClients: mapped, isFetched: true, loading: false });
    } catch (err) {
      console.error("Failed to fetch archived clients", err);
      toast.error("Could not load archived client data.");
      set({ archivedClients: [], isFetched: true, loading: false });
    }
  },
}));
