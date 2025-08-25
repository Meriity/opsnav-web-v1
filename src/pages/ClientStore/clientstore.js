import { create } from "zustand";
import { persist } from "zustand/middleware";
import ClientAPI from "../../api/userAPI";

export const useClientStore = create(
  persist(
    (set) => ({
      clients: [],
      loading: false,
      error: null,
      searchQuery: "",
      stage1: {
        referral: "",
        retainer: "",
        declarationForm: "",
        quoteType: "",
        quoteAmount: "",
        tenants: "",
        systemNote: "",
        clientComment: "",
      },

      // ACTIONS
      fetchClients: async () => {
        set({ loading: true, error: null });
        const api = new ClientAPI();
        try {
          const response = await api.getClients();
          const formattedClients = response.map((client) => ({
            id: client._id,
            matternumber: client.matterNumber || "N/A",
            dataentryby: client.dataEntryBy || "N/A",
            client_name: client.clientName || "N/A",
            property_address: client.propertyAddress || "N/A",
            state: client.state || "N/A",
            client_type: client.clientType || "N/A",
            settlement_date: client.settlementDate
              ? client.settlementDate.split("T")[0]
              : "N/A",
            final_approval: client.matterDate
              ? client.matterDate.split("T")[0]
              : "N/A",
            close_matter: client.closeMatter || "Active",
            stages: client?.stages || [],
          }));
          set({ clients: formattedClients });
        } catch (err) {
          console.error("Error fetching clients:", err);
          set({ error: err.message, clients: [] });
        } finally {
          set({ loading: false });
        }
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
      updateStage1: (updates) =>
        set((state) => ({
          stage1: { ...state.stage1, ...updates },
        })),
      setStage1Field: (field, value) =>
        set((state) => ({
          stage1: { ...state.stage1, [field]: value },
        })),
      resetStage1: () =>
        set({
          stage1: {
            referral: "",
            retainer: "",
            declarationForm: "",
            quoteType: "",
            quoteAmount: "",
            tenants: "",
            systemNote: "",
            clientComment: "",
          },
        }),
      initializeStage1: (apiData) => {
        const { noteForClient, ...rest } = apiData;
        const [systemNote = "", clientComment = ""] =
          noteForClient?.split(" - ") || [];
        set({
          stage1: {
            ...rest,
            systemNote,
            clientComment,
            quoteAmount: apiData.quoteAmount?.$numberDecimal || "",
          },
        });
      },
    }),
    { name: "client-storage" }
  )
);
