import { getApiBaseUrl } from "../utils/apiConfig";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

class NotificationAPI {
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

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || "Request failed");
      error.response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }
    return await response.json();
  }

  // Get all notifications
  async getNotifications() {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

    async getCommercialNotifications() {
      try {
        const url = `${this.baseUrl}/commercial/notifications`;
        const response = await fetch(url, {
          method: "GET",
          headers: this.getHeaders(),
        });
        return await this.handleResponse(response);
      } catch (error) {
        console.error("Error fetching commercial notifications:", error);
        throw error;
      }
    }

    async markCommercialAsRead(notificationId) {
      try {
        const response = await fetch(
          `${this.baseUrl}/commercial/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: this.getHeaders(),
          }
        );
        return await this.handleResponse(response);
      } catch (error) {
        console.error("Error marking commercial notification as read:", error);
        throw error;
      }
    }
}

export default NotificationAPI;
