import { VOCAT_FAS_ENDPOINTS } from "../vocatFasEndpoints";
import { getApiBaseUrl } from "../utils/apiConfig";

class VocatFasAPI {
  constructor() {
    this.baseUrl = getApiBaseUrl(); // Use default base URL
    this.endpoints = VOCAT_FAS_ENDPOINTS;
  }

  // Get authorization headers
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
      // Return null or throw specific error? Commercial API throws.
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
      error.response = {
        status: response.status,
        data,
      };
      throw error;
    }

    return data;
  }

  // --- Client Management ---

  async createClient(clientData) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENTS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(clientData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating VOCAT client:", error);
      throw error;
    }
  }

  async getActiveClients() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.ACTIVE_CLIENTS}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting active VOCAT clients:", error);
      throw error;
    }
  }

  async getArchivedClients() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.ARCHIVED_CLIENTS}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting archived VOCAT clients:", error);
      throw error;
    }
  }

  async getClients() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENTS}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting VOCAT clients:", error);
      throw error;
    }
  }


  async getClient(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.CLIENTS}?matterNumber=${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting VOCAT client:", error);
      throw error;
    }
  }

  async updateClient(matterNumber, updateData) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.CLIENTS}/${matterNumber}`,
        {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating VOCAT client:", error);
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

  // --- Stages ---

  async saveStageOne(data) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.STAGE_ONE}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error saving Stage 1:", error);
      throw error;
    }
  }

  async getStageOne(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_ONE}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting Stage 1:", error);
      throw error;
    }
  }

  async saveStageTwo(data) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.STAGE_TWO}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error saving Stage 2:", error);
      throw error;
    }
  }

  async getStageTwo(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_TWO}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting Stage 2:", error);
      throw error;
    }
  }

  async saveStageThree(data) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_THREE}`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error saving Stage 3:", error);
      throw error;
    }
  }

  async getStageThree(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_THREE}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting Stage 3:", error);
      throw error;
    }
  }

  async saveStageFour(data) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_FOUR}`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error saving Stage 4:", error);
      throw error;
    }
  }

  async getStageFour(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_FOUR}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting Stage 4:", error);
      throw error;
    }
  }

  // --- Costs ---

  async saveCost(data) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.COSTS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error saving cost:", error);
      throw error;
    }
  }

  async getCost(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.COSTS}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting cost:", error);
      throw error;
    }
  }

  // --- Utilities ---

  async getStageColors(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.STAGE_COLORS}?matterNumber=${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting stage colors:", error);
      throw error;
    }
  }

  async getFullMatter(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.ALL_DATA}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting full matter:", error);
      throw error;
    }
  }

  async getClientDates() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENT_DATES}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching VOCAT client dates:", error);
      throw error;
    }
  }

  // --- Dashboard ---

  async getDashboard(range) {
    try {
      const url = range 
        ? `${this.baseUrl}${this.endpoints.DASHBOARD}?range=${range}`
        : `${this.baseUrl}${this.endpoints.DASHBOARD}`;
        
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting dashboard:", error);
      throw error;
    }
  }

  // --- Notifications ---

  async getNotifications() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.NOTIFICATIONS}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.NOTIFICATIONS}/${notificationId}/read`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error marking notification read:", error);
      throw error;
    }
  }

  // --- User ---

  async getCurrentUser() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.USER_CURRENT}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.USER_PROFILE}`,
        {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async getOutstandingTasks() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.USER_TASKS}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting outstanding tasks:", error);
      throw error;
    }
  }
}

export default VocatFasAPI;
