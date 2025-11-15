import { COMMERCIAL_ENDPOINTS } from "../commercialEndpoints";
import { getApiBaseUrl, getApiHeaders } from "../utils/apiConfig";

class CommercialAPI {
  constructor() {
    this.baseUrl = getApiBaseUrl("commercial");
    this.endpoints = COMMERCIAL_ENDPOINTS;
  }

  // Get authorization headers
  getHeaders() {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
    };

    // Add Authorization header only if token exists
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
      // If response is not JSON, create empty data
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

  // Dashboard Data
  async getDashboardData(range = "tenMonths") {
    try {
      // If no specific range is provided, return the same structure as userAPI
      if (!range || range === "combined") {
        const [tenMonthsData, allData] = await Promise.all([
          this.getDashboardData("tenMonths"),
          this.getDashboardData("all"),
        ]);

        return {
          lifetimeTotals:
            tenMonthsData?.lifetimeTotals || allData?.lifetimeTotals || {},
          last10MonthsStats: Array.isArray(tenMonthsData?.monthlyStats)
            ? tenMonthsData.monthlyStats
            : [],
          allTimeStats: Array.isArray(allData?.monthlyStats)
            ? allData.monthlyStats
            : [],
        };
      }

      // Original implementation for specific ranges
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.DASHBOARD}?range=${range}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting commercial dashboard data:", error);
      throw error;
    }
  }

  // Get Commercial Calendar Dates
  async getCalendarDates() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.CLIENT_DATES}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting commercial calendar dates:", error);
      throw error;
    }
  }

  // Get Active Commercial Clients
  async getActiveProjects() {
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
      console.error("Error getting active commercial clients:", error);
      throw error;
    }
  }

  // Get Archived Commercial Clients
  async getArchivedProjects() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.ARCHIVED_CLIENTS}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting archived commercial clients:", error);
      throw error;
    }
  }

  // Create New Commercial Client
  async createProject(projectData) {
    try {
      console.log("Creating commercial project with data:", projectData);
      console.log("URL:", `${this.baseUrl}${this.endpoints.CLIENTS}`);

      const response = await fetch(`${this.baseUrl}${this.endpoints.CLIENTS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(projectData),
      });

      console.log("Create project response status:", response.status);

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating commercial project:", error);
      throw error;
    }
  }

  // Update Commercial Client
  async updateProject(clientId, projectData) {
    console.log("Commercial API - Update Project:");
    console.log("Client ID:", clientId);
    console.log("Project Data:", projectData);
    console.log(
      "URL:",
      `${this.baseUrl}${this.endpoints.CLIENT_BY_ID}/${clientId}`
    );
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.CLIENT_BY_ID}/${clientId}`,
        {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(projectData),
        }
      );

      console.log("Update response status:", response.status);

      const result = await this.handleResponse(response);
      console.log("Update response result:", result);
      return result;
    } catch (error) {
      console.error("Error updating commercial project:", error);
      console.error("Error details:", error.response);
      throw error;
    }
  }

  // Search Commercial Clients
  async searchProjects(query) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.SEARCH_CLIENTS}?keywords=${query}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error searching commercial clients:", error);
      throw error;
    }
  }

  // Get Commercial Client Full Data
  async getProjectFullData(matterNumber) {
    try {
      // Get all active projects and find the specific one
      const activeProjects = await this.getActiveProjects();

      // Handle different response structures
      let data = [];
      if (Array.isArray(activeProjects)) {
        data = activeProjects;
      } else if (activeProjects && Array.isArray(activeProjects.data)) {
        data = activeProjects.data;
      } else if (activeProjects && Array.isArray(activeProjects.clients)) {
        data = activeProjects.clients;
      } else if (activeProjects && Array.isArray(activeProjects.projects)) {
        data = activeProjects.projects;
      }

      // Find the project with matching matterNumber
      const project = data.find(
        (p) =>
          String(p.matterNumber) === String(matterNumber) ||
          String(p._id) === String(matterNumber) ||
          String(p.id) === String(matterNumber)
      );

      if (!project) {
        return null; // Project not found
      }

      return project;
    } catch (error) {
      console.error("Error getting commercial project full data:", error);
      return null;
    }
  }

  // Get Stage Colors
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

  async checkProjectExists(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.CHECK_CLIENT_EXISTS}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      // 404 means project doesn't exist - return false
      if (response.status === 404) {
        return { exists: false };
      }

      // For other non-200 status, throw error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking commercial client existence:", error);
      // If 404, return false
      if (error.response?.status === 404 || error.message.includes("404")) {
        return { exists: false };
      }

      throw error;
    }
  }

  // Stage Operations
  async upsertStage(stageNumber, matterNumber, stageData) {
    try {
      const endpointMap = {
        1: this.endpoints.STAGE_ONE,
        2: this.endpoints.STAGE_TWO,
        3: this.endpoints.STAGE_THREE,
        4: this.endpoints.STAGE_FOUR,
        5: this.endpoints.STAGE_FIVE,
        6: this.endpoints.STAGE_SIX,
      };

      const endpoint = endpointMap[stageNumber];
      if (!endpoint) {
        throw new Error(`Invalid stage number: ${stageNumber}`);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          ...stageData,
        }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error updating stage ${stageNumber}:`, error);
      throw error;
    }
  }

  // Get Stage Data
  async getStageData(stageNumber, matterNumber) {
    try {
      const endpointMap = {
        1: this.endpoints.STAGE_ONE_BY_ID,
        2: this.endpoints.STAGE_TWO_BY_ID,
        3: this.endpoints.STAGE_THREE_BY_ID,
        4: this.endpoints.STAGE_FOUR_BY_ID,
        5: this.endpoints.STAGE_FIVE_BY_ID,
        6: this.endpoints.STAGE_SIX_BY_ID,
      };

      const endpoint = endpointMap[stageNumber];
      if (!endpoint) {
        throw new Error(`Invalid stage number: ${stageNumber}`);
      }

      const response = await fetch(
        `${this.baseUrl}${endpoint}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error getting stage ${stageNumber} data:`, error);
      throw error;
    }
  }

  // Cost Operations
  async upsertCost(matterNumber, costData) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.COST}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          ...costData,
        }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating cost data:", error);
      throw error;
    }
  }

  // Get Commercial Client All Data
  async getClientAllData(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.CLIENT_ALL_DATA}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting commercial client all data:", error);
      throw error;
    }
  }

  // Get Cost Data
  async getCostData(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.COST_BY_ID}/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting cost data:", error);
      throw error;
    }
  }

  // Client View Operations
  async sendClientLink(email, matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.SEND_CLIENT_LINK}`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            email,
            matterNumber,
          }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error sending client link:", error);
      throw error;
    }
  }

  // Get Outstanding Tasks
  async getOutstandingTasks(params = {}) {
    try {
      ``;
      let queryString;
      if (params instanceof URLSearchParams) {
        queryString = params.toString();
      } else {
        queryString = new URLSearchParams(params).toString();
      }
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.OUTSTANDING_TASKS}?${queryString}`,
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

export default CommercialAPI;
