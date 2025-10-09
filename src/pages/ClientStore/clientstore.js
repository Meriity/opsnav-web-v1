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
  const company = localStorage.getItem("company");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userID");

  const response = await (
    company === "vkl"
      ? api.getClients()
      : company === "idg"
        ? api.getIDGOrders()
        : api.getClients()
  );

  console.log("Raw API response:", response);

  let formattedClients = [];

  if (company === "vkl") {
    formattedClients = response.map((client) => ({
      id: client._id || "N/A",
      matternumber: client.matterNumber || "N/A",
      dataentryby: client.dataEntryBy || "N/A",
      client_name: client.clientName || "N/A",
      property_address: client.propertyAddress || "N/A",
      state: client.state || "N/A",
      client_type: client.clientType || "N/A",
      settlement_date: client.settlementDate
        ? client.settlementDate.split("T")[0]
        : "N/A",
      finance_approval_date: client.financeApprovalDate
        ? client.financeApprovalDate.split("T")[0]
        : null,
      building_and_pest_date: client.buildingAndPestDate
        ? client.buildingAndPestDate.split("T")[0]
        : null,
      close_matter: client.closeMatter || "Active",
      stages: Array.isArray(client.stages) ? client.stages : [],
    }));
  } 
  else if (company === "idg") {
    let filteredResponse = response;
    
    if (role === "user") {
      filteredResponse = response.filter(
        (client) => client.allocatedUserID === userId
      );
    }

    formattedClients = filteredResponse.map((client) => ({
      id: client._id || "N/A",
      clientId: client.clientId,
      orderId: client.orderId || "N/A",
      data_entry_by: client.dataEntryBy || "N/A",
      client_name: client.client_name || "N/A",
      billing_address: client.deliveryAddress || "N/A",
      client_type: client.orderType || "N/A",
      stages: Array.isArray(client.stages) ? client.stages : [],
      order_date: client.orderDate ? client.orderDate.split("T")[0] : "N/A",
      delivery_date: client.deliveryDate
        ? client.deliveryDate.split("T")[0]
        : "2025-09-25",
      priority: client.priority || "N/A",
      postcode: client.postCode || "N/A",
      orderDetails: client.order_details || "N/A",
    }));
  }
          console.log("Formatted Clients:", formattedClients);
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
