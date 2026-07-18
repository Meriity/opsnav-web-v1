import { getApiBaseUrl } from "../utils/apiConfig";
import { CRM_ENDPOINTS } from "./endpoints/crmEndpoints";

class CrmAPI {
  constructor() {
    this.baseUrl = getApiBaseUrl();
    if (!this.baseUrl || this.baseUrl === "undefined") {
      this.baseUrl = "http://localhost:5000";
    }
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
      const message = errorData.message || errorData.error || "Internal server error";
      console.error(`[CrmAPI] Backend 500 Error: ${message}`, {
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
        data.message || data.error || `HTTP error! status: ${response.status}`
      );
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  }

  // Create lead
  async createLead(leadData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(leadData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating CRM lead:", error);
      throw error;
    }
  }

  // Get all leads with support for search and status filtering
  async getAllLeads(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      // Handle params flexibly, supporting both lowercase and uppercase keys if needed
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `${this.baseUrl}${CRM_ENDPOINTS.LEADS}${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting CRM leads:", error);
      throw error;
    }
  }

  // Get single lead by ID
  async getLeadById(leadId) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching CRM lead by ID:", error);
      throw error;
    }
  }

  // Update lead status
  async updateLeadStatus(leadId, status) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating CRM lead status:", error);
      throw error;
    }
  }

  // Update proposal status
  async updateProposalStatus(leadId, proposalStatus) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}/proposal-status`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ proposalStatus }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating CRM lead proposal status:", error);
      throw error;
    }
  }

  // Delete lead
  async deleteLead(leadId) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting CRM lead:", error);
      throw error;
    }
  }

  // Assign lead
  async assignLead(leadId, assignedTo) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}/assign`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ assignedTo }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error assigning CRM lead:", error);
      throw error;
    }
  }

  // Convert lead to client
  async convertLeadToClient(leadId, phone, email) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}/convert`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ phone, email }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error converting CRM lead to client:", error);
      throw error;
    }
  }

  // Update lead
  async updateLead(leadId, updatedFields) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(updatedFields),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating CRM lead:", error);
      throw error;
    }
  }

  // Create task for lead
  async createTask(leadId, taskData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.TASKS}/${encodeURIComponent(leadId)}/new-task`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating CRM task:", error);
      throw error;
    }
  }

  // Edit a task
  async editTask(taskId, updatedData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.TASKS}/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(updatedData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error editing CRM task:", error);
      throw error;
    }
  }

  // Get all tasks
  async getAllTasks() {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.TASKS}/`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching all CRM tasks:", error);
      throw error;
    }
  }

  // Get all tasks under a specific lead
  async getTasksForLead(leadId) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.TASKS}/lead/${encodeURIComponent(leadId)}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching tasks for lead:", error);
      throw error;
    }
  }

  // --- Contacts API ---

  async getAllContacts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });
      const qs  = queryParams.toString();
      const url = `${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}${qs ? `?${qs}` : ""}`;
      const response = await fetch(url, { method: "GET", headers: this.getHeaders() });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting CRM contacts:", error);
      throw error;
    }
  }

  async getContactById(contactId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}/${encodeURIComponent(contactId)}`,
        { method: "GET", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching CRM contact by ID:", error);
      throw error;
    }
  }

  async createContact(contactData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(contactData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating CRM contact:", error);
      throw error;
    }
  }

  // PATCH /crm/contacts/:id  (no /update suffix — matches the API spec)
  async updateContact(contactId, updatedFields) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}/${encodeURIComponent(contactId)}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(updatedFields),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating CRM contact:", error);
      throw error;
    }
  }

  // DELETE /crm/contacts/:id  (no /delete suffix — matches the API spec)
  async deleteContact(contactId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}/${encodeURIComponent(contactId)}`,
        { method: "DELETE", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting CRM contact:", error);
      throw error;
    }
  }

  // PATCH /crm/contacts/:id/restore
  async restoreContact(contactId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}/${encodeURIComponent(contactId)}/restore`,
        { method: "PATCH", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error restoring CRM contact:", error);
      throw error;
    }
  }

  // GET /crm/contacts/duplicate-check?email=&phone=&name=
  async duplicateCheck({ email = "", phone = "", name = "" } = {}) {
    try {
      const qs = new URLSearchParams({ email, phone, name }).toString();
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.CONTACTS}/duplicate-check?${qs}`,
        { method: "GET", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error checking contact duplicate:", error);
      throw error;
    }
  }

  // --- Companies API ---

  async getAllCompanies(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });
      const qs  = queryParams.toString();
      const url = `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}${qs ? `?${qs}` : ""}`;
      const response = await fetch(url, { method: "GET", headers: this.getHeaders() });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting CRM companies:", error);
      throw error;
    }
  }

  async getCompanyById(companyId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}`,
        { method: "GET", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching CRM company by ID:", error);
      throw error;
    }
  }

  async createCompany(companyData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(companyData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating CRM company:", error);
      throw error;
    }
  }

  async updateCompany(companyId, updatedFields) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(updatedFields),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating CRM company:", error);
      throw error;
    }
  }

  async deleteCompany(companyId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}`,
        { method: "DELETE", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting CRM company:", error);
      throw error;
    }
  }

  // GET /crm/companies/:id/contacts
  async getCompanyContacts(companyId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}/contacts`,
        { method: "GET", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching company contacts:", error);
      throw error;
    }
  }

  // POST /crm/companies/:id/contacts/new  — creates a new contact AND links it
  async createAndLinkContact(companyId, contactData) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}/contacts/new`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(contactData),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating and linking contact:", error);
      throw error;
    }
  }

  // POST /crm/companies/:id/contacts/link  — body: { contactId }
  async linkContactToCompany(companyId, contactId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}/contacts/link`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ contactId }),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error linking contact to company:", error);
      throw error;
    }
  }

  // DELETE /crm/companies/:id/contacts/:contactId
  async unlinkContactFromCompany(companyId, contactId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CRM_ENDPOINTS.COMPANIES}/${encodeURIComponent(companyId)}/contacts/${encodeURIComponent(contactId)}`,
        { method: "DELETE", headers: this.getHeaders() }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error unlinking contact from company:", error);
      throw error;
    }
  }

  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.DASHBOARD}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching CRM dashboard data:", error);
      throw error;
    }
  }

  // --- Notes API ---
  
  async createNote(noteData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.NOTES}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(noteData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }

  async getNotes(leadId) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.NOTES}/${encodeURIComponent(leadId)}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting notes:", error);
      throw error;
    }
  }

  async updateNote(noteId, updateData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.NOTES}/${encodeURIComponent(noteId)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  }

  async deleteNote(noteId) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.NOTES}/${encodeURIComponent(noteId)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }

  // --- Settings API ---

  async getEnquiryTypes() {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/enquiry-types`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting enquiry types:", error);
      throw error;
    }
  }

  async createEnquiryType(typeData) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/enquiry-type`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(typeData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating enquiry type:", error);
      throw error;
    }
  }

  async deleteEnquiryType(typeId) {
    try {
      const response = await fetch(`${this.baseUrl}${CRM_ENDPOINTS.LEADS}/enquiry-type`, {
        method: "DELETE",
        headers: this.getHeaders(),
        body: JSON.stringify({ enquiryType: typeId })
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting enquiry type:", error);
      throw error;
    }
  }
}

export default new CrmAPI();
