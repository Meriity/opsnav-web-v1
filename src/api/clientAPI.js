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
  // clientAPI.js — improved updateClientData
  async updateClientData(matterNumber, data) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/${matterNumber}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      // read body as text then try to parse JSON (so we can surface server messages)
      const text = await response.text();
      let parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        // prefer server-provided message, then generic fallback
        const serverMsg =
          (parsed && (parsed.message || parsed.error || parsed.msg)) ||
          `HTTP error! status: ${response.status}`;
        const err = new Error(serverMsg);
        err.status = response.status;
        err.body = parsed;
        throw err;
      }

      // on success return parsed JSON (or empty object)
      const res = parsed || {};
      // keep existing shape compatibility (callers expect resp.client || resp)
      return res.client || res;
    } catch (error) {
      console.error("Error updating client data:", error);
      throw error;
    }
  }

    // Get client details by matter number
    async getIDGUsers() {
        try {
            const response = await fetch(
                `${this.baseUrl}/idg/users`,
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


  async updateIDGClientData(clientId, data = {}) {
    console.log(clientId, data);
    try {
      const response = await fetch(`${this.baseUrl}/idg/orders/${clientId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      console.log(response);
      console.log(`${this.baseUrl}/idg/orders/${clientId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      return res.client || res;
    } catch (error) {
      console.error("Error updating client data:", error);
      throw error;
    }
  }

  // Insert/Update Stage One
  async upsertStageOne(additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/stage-one`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(additionalData),
      });

      console.log(`${this.baseUrl}/clients/stage-one`);
      console.log(JSON.stringify(additionalData));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  async upsertIDGStages(clientId, stage, additionalData = {}) {
    try {
      const response = await fetch(
        `${this.baseUrl}/idg/orders/${clientId}/stage`,
        {
          method: "PATCH",
          headers: {
            ...this.getHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stageNumber: stage,
            data: additionalData, // Spread additionalData into the object
          }),
        }
      );

      console.log(additionalData);

      console.log(JSON.stringify(additionalData));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  async upsertStage(stage, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/stage-${stage}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(additionalData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating stage ${stage}:`, error);
      throw error;
    }
  }

  // Get All Stages data
  async getAllStages(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/clients/stages/${matterNumber}`,
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

  async getIDGStages(clientId) {
    console.log(`${this.baseUrl}/idg/orders/${clientId}`);
    try {
      const response = await fetch(`${this.baseUrl}/idg/orders/${clientId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data);
      return data;
    } catch (error) {
      console.error("Error getting stage one:", error);
      throw error;
    }
  }

  // Insert/Update Stage Two
  async upsertStageTwo(matterNumber, colorStatus, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/stage-two`, {
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
        `${this.baseUrl}/clients/stage-two/${matterNumber}`,
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
  async upsertStageThree(additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/stage-three`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(additionalData),
      });

      console.log(JSON.stringify(additionalData));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  async upsertStageFour(additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/stage-four`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(additionalData),
      });

      console.log(JSON.stringify(additionalData));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  async upsertStageFive(additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/stage-five`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(additionalData),
      });

      console.log(JSON.stringify(additionalData));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  async upsertStageSix(additionalData = {}) {
    try {
      // console.log(additionalData);
      // Function to update closeMatter status
      function updateCloseMatter(client) {
        if (!client.closeMatter || client.closeMatter.trim() === "") {
          client.closeMatter = "open";
        } else if (client.closeMatter === "Completed") {
          client.closeMatter = "closed";
        } else if (client.closeMatter === "Cancelled") {
          client.closeMatter = "cancelled";
        }
        return client;
      }

      const response = await fetch(`${this.baseUrl}/clients/stage-six`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(updateCloseMatter(additionalData)),
      });
      // console.log();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating stage one:", error);
      throw error;
    }
  }

  // Insert/Update Cost
  async upsertCost(matterNumber, cost, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/clients/costs`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          cost,
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

  async upsertIDGCost(orderId, cost, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/idg/costs/${orderId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          cost,
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

  // Get Cost data
  async getCost(matterNumber) {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/costs/${matterNumber}`,
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
      const response = await fetch(`${this.baseUrl}/client-view/resend-link`, {
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

  // Send notification to client
  async getSearchResult(query) {
    try {
      const response = await fetch(
        `${this.baseUrl}/clients/search?keywords=${query}`,
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
      console.error("Error sending notification to client:", error);
      throw error;
    }
  }

  async getIDGSearchResult(query) {
    try {
      const response = await fetch(
        `${this.baseUrl}/idg/orders/search?keywords=${query}`,
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
      console.error("Error sending notification to client:", error);
      throw error;
    }
  }

  // Set initial password for new users
  async setPassword(token, password) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error setting password:", error);
      throw error;
    }
  }
}

export default ClientAPI;
