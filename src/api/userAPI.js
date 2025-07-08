const BASE_URL = 'https://opsnav-app-service-871399330172.us-central1.run.app';

class ClientAPI {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  // Get authorization headers
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get client details by matter number
  async getClientDetails(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client?matterNumber=${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting client details:', error);
      throw error;
    }
  }

  // Update client data
  async updateClientData(matterNumber, data) {
    try {
      const response = await fetch(`${this.baseUrl}/client/${matterNumber}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating client data:', error);
      throw error;
    }
  }

  // Insert/Update Stage One
  async upsertStageOne(matterNumber, colorStatus, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-one`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          color_status: colorStatus,
          ...additionalData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating stage one:', error);
      throw error;
    }
  }

  // Get Stage One data
  async getStageOne(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-one/${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting stage one:', error);
      throw error;
    }
  }

  // Insert/Update Stage Two
  async upsertStageTwo(matterNumber, colorStatus, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-two`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          color_status: colorStatus,
          ...additionalData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating stage two:', error);
      throw error;
    }
  }

  // Get Stage Two data
  async getStageTwo(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-two/${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting stage two:', error);
      throw error;
    }
  }

  // Insert/Update Cost
  async upsertCost(matterNumber, cost, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/client/costs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber,
          cost,
          ...additionalData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating cost:', error);
      throw error;
    }
  }

  // Get Cost data
  async getCost(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client/costs/${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting cost:', error);
      throw error;
    }
  }

  // Check if client exists
  async checkClientExists(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client/check/${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking client existence:', error);
      throw error;
    }
  }

  // Get stage colors for client
  async getStageColors(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client/stage-colors?matterNumber=${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting stage colors:', error);
      throw error;
    }
  }

  // Client View Operations
  async sendLinkToClient(email, matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/send-link`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          matterNumber
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending link to client:', error);
      throw error;
    }
  }

  // Get client emails
  async getClientEmails(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/emails?matterNumber=${matterNumber}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting client emails:', error);
      throw error;
    }
  }

  // Remove client access
  async removeClientAccess(email, matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/remove-access`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          matterNumber
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing client access:', error);
      throw error;
    }
  }

  // Resend link to client
  async resendLinkToClient(email, matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/resend-link`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          matterNumber
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resending link to client:', error);
      throw error;
    }
  }

  // Send notification to client
  async sendNotificationToClient(matterNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/client-view/notify`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          matterNumber
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending notification to client:', error);
      throw error;
    }
  }
}

export default ClientAPI;