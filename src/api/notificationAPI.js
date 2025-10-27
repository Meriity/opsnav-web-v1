// api/notificationAPI.js
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

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications/unread/count`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/read-all`, {
        method: "PUT",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/clear-all`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw error;
    }
  }

  // Create a notification (for testing or admin purposes)
  async createNotification(notificationData) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(notificationData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/settings`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/settings`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(settings),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      throw error;
    }
  }
}

export default NotificationAPI;
