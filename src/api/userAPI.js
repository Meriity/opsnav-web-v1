const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BASE_URL = "http://localhost:5000";

class ClientAPI {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  // Get authorization headers
  getHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // --- FUNCTION TO GET CALENDAR DATES ---
  async getCalendarDates() {
    try {
      // The endpoint you provided is used here
      const response = await fetch(`${this.baseUrl}/user/clients/dates`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting calendar dates:", error);
      throw error;
    }
  }

  // Get client details by matter number
  async getClientDetails(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/clients?matterNumber=${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting client details:", error);
      throw error;
    }
  }

  // Update client data
  async updateClientData(matterNumber, data) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/${matterNumber}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating client data:", error);
      throw error;
    }
  }

  // Insert/Update Stage One
  async upsertStageOne(matterNumber, colorStatus, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-one`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          color_status: colorStatus,
          ...additionalData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  // Get Stage One data
  async getStageOne(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/clients/stage-one/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting stage one:", error);
      throw error;
    }
  }

  // Insert/Update Stage Two
  async upsertStageTwo(matterNumber, colorStatus, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-two`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          color_status: colorStatus,
          ...additionalData,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage two:", error);
      throw error;
    }
  }

  // Get Stage Two data
  async getStageTwo(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/stage-two/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting stage two:", error);
      throw error;
    }
  }

  // Insert/Update Cost
  async upsertCost(additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/costs`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...additionalData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating cost:", error);
      throw error;
    }
  }

  // get clients
  async getClients() {
    try {
      const response = await fetch(`${this.baseUrl}/user/clients/active`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting cost:", error);
      throw error;
    }
  }

  // Get Cost data
  async getCost(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/clients/costs/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting cost:", error);
      throw error;
    }
  }

  // Check if client exists
  async checkClientExists(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/check/${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking client existence:", error);
      throw error;
    }
  }

  // Get stage colors for client
  async getStageColors(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/stage-colors?matterNumber=${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting stage colors:", error);
      throw error;
    }
  }

  // Client View Operations
  async sendLinkToClient(email, matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/send-link`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          matterNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending link to client:", error);
      throw error;
    }
  }

  // Get client emails
  async getClientEmails(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/client-view/emails?matterNumber=${matterNumber}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting client emails:", error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      const response = await fetch(`${this.baseUrl}/user/clients`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  // get clients
  async getArchivedClients() {
    try {
      const response = await fetch(`${this.baseUrl}/user/clients/archived`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error("Error getting cost:", error);
      throw error;
    }
  }

  async getArchivedClientsDate(from, to) {
    try {
      const response = await fetch(
        `${this.baseUrl}/clients/settled?from=${from}&to=${to}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting cost:", error);
      throw error;
    }
  }

  async getDashboardData() {
    const fetchRange = async (range) => {
      const res = await fetch(`${this.baseUrl}/dashboard?range=${range}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    };

    try {
      let tenData;
      try {
        tenData = await fetchRange("tenmonths");
      } catch {
        tenData = await fetchRange("tenMonths");
      }

      // All time
      const allData = await fetchRange("all");

      return {
        lifetimeTotals:
          tenData?.lifetimeTotals || allData?.lifetimeTotals || {},
        last10MonthsStats: Array.isArray(tenData?.monthlyStats)
          ? tenData.monthlyStats
          : [],
        allTimeStats: Array.isArray(allData?.monthlyStats)
          ? allData.monthlyStats
          : [],
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      throw error;
    }
  }

  // Remove client access
  async removeClientAccess(email, matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/client-view/remove-access`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
          body: JSON.stringify({
            email,
            matterNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing client access:", error);
      throw error;
    }
  }

  // Resend link to client
  async resendLinkToClient(email, matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/send-link`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          matterNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return await response.json();
    } catch (error) {
      console.error("Error resending link to client:", error);
      throw error;
    }
  }

  // Send notification to client
  async sendNotificationToClient(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/notify`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending notification to client:", error);
      throw error;
    }
  }

  // Get All Outstanding Task Report
  async getAllOutstandingTasks(page, activeMatter, matterFilter) {
    try {
      let url = `${this.baseUrl}/user/tasks/outstanding?page=${page}&filter=${matterFilter}`;
      if (activeMatter) {
        url = `${url}&matterNumber=${activeMatter}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting stage one:", error);
      throw error;
    }
  }
}

export default ClientAPI;
