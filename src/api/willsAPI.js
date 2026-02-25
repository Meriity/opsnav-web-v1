import { WILLS_ENDPOINTS } from "../willsEndpoints";
import { getApiBaseUrl } from "../utils/apiConfig";

class WillsAPI {
  constructor() {
    this.baseUrl = getApiBaseUrl("wills"); // Assuming 'wills' maps to the correct port/path in apiConfig, or defaults to backend
    // If getApiBaseUrl doesn't support 'wills' yet, might need to use a default or check that file. 
    // Usually it just returns the localhost:5000 or production URL.
    if (!this.baseUrl || this.baseUrl === "undefined") {
        this.baseUrl = "http://localhost:5000"; // Fallback based on Postman variable
    }
    this.endpoints = WILLS_ENDPOINTS;
  }

  getHeaders() {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    if (response.status === 500) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: "Internal server error" };
      }
      const error = new Error(errorData.message || "Internal server error");
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    if (response.status === 404) {
      const error = new Error("Resource not found");
      error.response = {
        status: response.status,
        data: { message: "Resource not found" },
      };
      throw error;
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = {};
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `HTTP error! status: ${response.status}`
      );
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  }

  // --- Dashboard ---
  async getDashboardData(range = "sixMonths") {
    try {
      // Postman: /wills/dashboard?range=sixMonths
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.DASHBOARD}?range=${range}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting wills dashboard data:", error);
      throw error;
    }
  }

  // --- Clients ---

  // Get active clients (equivalent to getActiveProjects in Commercial)
  async getActiveClients() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.ACTIVE_CLIENTS}`,
        {
           method: "GET", 
           headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
       console.error("Error getActiveClients:", error);
       return [];
    }
  }

  // Alias for compatibility
  async getActiveProjects() {
    return this.getActiveClients();
  }

  // Derived calendar data from active clients since no specific endpoint exists yet
  async getCalendarDates() {
    try {
      const clients = await this.getActiveClients();
      // The Dashboard expects a list of objects with date fields.
      // Active clients list should contain these fields if the backend returns them.
      return clients; 
    } catch (error) {
       console.error("Error getting calendar dates:", error);
       return [];
    }
  }
  
  async createProject(clientData) {
      // Maps to Create Wills Client
      try {
          const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENTS}`, {
              method: "POST",
              headers: this.getHeaders(),
              body: JSON.stringify(clientData)
          });
          return await this.handleResponse(response);
      } catch (error) {
          console.error("Error creating wills client:", error);
          throw error;
      }
  }

  async updateProject(matterNumber, clientData) {
      // Maps to Update Wills Client: PUT /wills/client/{{matterNumber}}
      try {
          // Note: endpoints.CLIENT_UPDATE is /wills/client
          const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENT_UPDATE}/${matterNumber}`, {
              method: "PUT",
              headers: this.getHeaders(),
              body: JSON.stringify(clientData)
          });
          return await this.handleResponse(response);
      } catch (error) {
          console.error("Error updating wills client:", error);
          throw error;
      }
  }

  async getProjectFullData(matterNumber) {
      // Using Get Wills Client: GET /wills/client?matterNumber=...
      try {
          const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENT_BY_ID}?matterNumber=${matterNumber}`, {
              method: "GET",
              headers: this.getHeaders()
          });
          return await this.handleResponse(response);
      } catch (error) {
          console.error("Error getting full data:", error);
          throw error;
      }
  }

  async checkClientExists(matterNumber) {
    try {
        const response = await fetch(`${this.baseUrl}${this.endpoints.CHECK_CLIENT_EXISTS}/${matterNumber}`, {
            method: "GET",
            headers: this.getHeaders()
        });
        return await this.handleResponse(response);
    } catch (error) {
        console.error("Error checking checkClientExists:", error);
         // Treat 404 as false (client doesn't exist) if handleResponse throws it, 
         // but handleResponse throws for 404. We might want to catch it here to return false/true structure?
         // But the modal expects the response object or boolean logic.
         // Let's rely on call site handling or standard behavior. The endpoint likely returns { exists: boolean }.
        throw error;
    }
  }

  // --- Stages ---
  async upsertStage(stageNumber, matterNumber, stageData) {
      const endpointMap = {
          1: this.endpoints.STAGE_ONE,
          2: this.endpoints.STAGE_TWO,
          3: this.endpoints.STAGE_THREE
      };
      const endpoint = endpointMap[stageNumber];
      if (!endpoint) throw new Error(`Invalid stage number: ${stageNumber}`);

      try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
              method: "POST",
              headers: this.getHeaders(),
              body: JSON.stringify({ matterNumber, ...stageData })
          });
          return await this.handleResponse(response);
      } catch (error) {
          console.error("Error upserting stage:", error);
          throw error;
      }
  }

  async getStageData(stageNumber, matterNumber) {
      const endpointMap = {
          1: this.endpoints.STAGE_ONE_BY_ID,
          2: this.endpoints.STAGE_TWO_BY_ID,
          3: this.endpoints.STAGE_THREE_BY_ID
      };
      const endpoint = endpointMap[stageNumber];
      if (!endpoint) throw new Error(`Invalid stage number: ${stageNumber}`);

      try {
          const response = await fetch(`${this.baseUrl}${endpoint}/${matterNumber}`, {
              method: "GET",
              headers: this.getHeaders()
          });
          if (response.status === 404) return null; // Handle missing stage gracefully
          return await this.handleResponse(response);
      } catch (error) {
           console.error("Error getting stage data:", error);
           throw error;
      }
  }

  // --- Costs ---
  async upsertCost(matterNumber, costData) {
      try {
          const response = await fetch(`${this.baseUrl}${this.endpoints.COST}`, {
              method: "POST",
              headers: this.getHeaders(),
              body: JSON.stringify({ matterNumber, ...costData })
          });
          return await this.handleResponse(response);
      } catch (error) {
          throw error;
      }
  }

  async getCostData(matterNumber) {
    try {
        const response = await fetch(`${this.baseUrl}${this.endpoints.COST_BY_ID}/${matterNumber}`, {
            method: "GET",
            headers: this.getHeaders()
        });
        if (response.status === 404) return null;
        return await this.handleResponse(response);
    } catch (error) {
        throw error;
    }
  }

  // Send Reminder Email to Client
  async sendReminderEmail(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/send-reminder`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending reminder email:", error);
      throw error;
    }
  }
}

export default WillsAPI;
