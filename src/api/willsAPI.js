import { WILLS_ENDPOINTS } from "../willsEndpoints";
import { getApiBaseUrl } from "../utils/apiConfig";

class WillsAPI {
  constructor() {
    this.baseUrl = getApiBaseUrl("wills"); 
    if (!this.baseUrl || this.baseUrl === "undefined") {
        this.baseUrl = "http://localhost:5000"; 
    }
  }

  getHeaders() {
    // Prioritize clientAuthToken for returning users/clients, fallback to admin authToken
    const token = localStorage.getItem("clientAuthToken") || localStorage.getItem("authToken");
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
      
      const message = errorData.error || errorData.message || "Internal server error";
      console.error(`[WillsAPI] Backend 500 Error: ${message}`, {
          url: response.url,
          data: errorData
      });

      const error = new Error(message);
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
        data.error || data.message || `HTTP error! status: ${response.status}`
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
        `${this.baseUrl}${WILLS_ENDPOINTS.DASHBOARD}?range=${range}`,
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

  // --- Outstanding Tasks ---
  async getOutstandingTasks(page = 1, activeMatter = null, matterFilter = "none") {
    try {
      let url = `${this.baseUrl}${WILLS_ENDPOINTS.OUTSTANDING_TASKS}?page=${page}&filter=${matterFilter}`;
      if (activeMatter) {
        url = `${url}&matterNumber=${activeMatter}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting wills outstanding tasks:", error);
      throw error;
    }
  }

  // --- Clients ---

  // Get active clients (equivalent to getActiveProjects in Commercial)
  async getActiveClients() {
    try {
      const response = await fetch(
        `${this.baseUrl}${WILLS_ENDPOINTS.ACTIVE_CLIENTS}`,
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

  async getArchivedClients() {
    try {
      const response = await fetch(
        `${this.baseUrl}${WILLS_ENDPOINTS.ARCHIVED_CLIENTS}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getArchivedClients:", error);
      throw error;
    }
  }

  // Derived calendar data from active clients since no specific endpoint exists yet
  async getCalendarDates() {
    try {
      const response = await fetch(
        `${this.baseUrl}${WILLS_ENDPOINTS.CALENDAR_DATES}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting calendar dates:", error);
      return [];
    }
  }
  
  async createProject(clientData) {
      // Maps to Create Wills Client
      try {
          const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.CLIENTS}`, {
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
          const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.CLIENT_UPDATE}/${matterNumber}`, {
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
          const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.CLIENT_BY_ID}?matterNumber=${matterNumber}`, {
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
        const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.CHECK_CLIENT_EXISTS}/${matterNumber}`, {
            method: "GET",
            headers: this.getHeaders()
        });
        return await this.handleResponse(response);
    } catch (error) {
        console.error("Error checking checkClientExists:", error);
        throw error;
    }
  }

  // --- Stages ---
  async upsertStage(stageNumber, matterNumber, stageData) {
      const endpointMap = {
          1: WILLS_ENDPOINTS.STAGE_ONE,
          2: WILLS_ENDPOINTS.STAGE_TWO,
          3: WILLS_ENDPOINTS.STAGE_THREE
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
          1: WILLS_ENDPOINTS.STAGE_ONE_BY_ID,
          2: WILLS_ENDPOINTS.STAGE_TWO_BY_ID,
          3: WILLS_ENDPOINTS.STAGE_THREE_BY_ID
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
          const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.COST}`, {
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
        const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.COST_BY_ID}/${matterNumber}`, {
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

  cleanPayload(data) {
    const cleaned = { ...data };
    
    // Explicitly set isDeleted to false
    cleaned.isDeleted = false;

    // Strip internal/backend-only fields that might interfere with updates
    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.willsUrl;
    delete cleaned.converted;
    delete cleaned.isCompleted;
    // Exact match for requested payload
    delete cleaned.numSingleBanks;
    delete cleaned.numJointBanks;

    return cleaned;
  }

  async createWillsForm(data) {
    try {
      const cleanedData = this.cleanPayload(data);
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.FORM_CREATE}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(cleanedData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating wills form:", error);
      throw error;
    }
  }

  async updateWillsForm(data) {
    try {
      const cleanedData = this.cleanPayload(data);
      const url = `${this.baseUrl}${WILLS_ENDPOINTS.FORM_UPDATE}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(cleanedData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating wills form:", error);
      throw error;
    }
  }

  async getSubmittedForms() {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.SUBMITTED_FORMS}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting submitted forms:", error);
      throw error;
    }
  }

  async getFormByReferenceNumber(referenceNumber) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.GET_BY_REFERENCE}/${referenceNumber}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting form by reference number:", error);
      throw error;
    }
  }

  async downloadDocx(referenceNumber) {
    try {
      const { generateWillsDocx } = await import("../components/utils/generateWillsDocx");
      
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.GET_BY_REFERENCE}/${referenceNumber}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document data: ${response.statusText}`);
      }

      const result = await response.json();
      
      // The API returns { message: "...", data: { ... } }
      const formData = result.data || result;

      await generateWillsDocx(formData, `Will_${referenceNumber}.docx`);
    } catch (error) {
      console.error("Error downloading document:", error);
      throw error;
    }
  }

  async updateFormByReferenceNumber(referenceNumber, payload) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.UPDATE_BY_REFERENCE}/${referenceNumber}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating form by reference number:", error);
      throw error;
    }
  }

  async convertToMatter(payload) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.CONVERT_TO_MATTER}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error converting to matter:", error);
      throw error;
    }
  }

  async unlockForm(matterReferenceNumber) {
    try {
      // POST /v1/unlock-form
      // Body: { "matterReferenceNumber": "..." }
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.UNLOCK_FORM}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ matterReferenceNumber }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in unlockForm:", error);
      throw error;
    }
  }

  // --- File Upload V1 ---
  async generateSignedUrls(files) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.GENERATE_SIGNED_URLS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ files }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error generating signed URLs:", error);
      throw error;
    }
  }

  async uploadMultipleUrls(urls, matterReferenceNumber) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.UPLOAD_MULTIPLE_URLS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ urls, matterReferenceNumber }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error uploading multiple URLs:", error);
      throw error;
    }
  }

  async sendWillsEmail(payload) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.SEND_EMAIL}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error sending wills email:", error);
      throw error;
    }
  }

  async signup(payload) {
    try {
      // Prioritize firmId from payload if provided, fallback to localStorage("userID")
      const firmId = payload.firmId || localStorage.getItem("userID");
      const fullPayload = { ...payload, firmId };
      
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.SIGNUP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in Wills Signup:", error);
      throw error;
    }
  }

  async login(payload) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in Wills Login:", error);
      throw error;
    }
  }

  async loadFormV1(matterReferenceNumber) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.LOAD_FORM_V1}/${matterReferenceNumber}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in LOAD FORM V1:", error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.FORGOT_PASSWORD}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in Wills Forgot Password:", error);
      throw error;
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await fetch(`${this.baseUrl}${WILLS_ENDPOINTS.RESET_PASSWORD}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in Wills Reset Password:", error);
      throw error;
    }
  }
}

export default WillsAPI;
