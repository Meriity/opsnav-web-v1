const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BASE_URL = "http://localhost:5000";
class AdminAPI {
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
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || "Request failed");
      error.response = {
        status: response.status,
        data,
      };
      throw error;
    }

    return data;
  }

  // Create new User
  async createUser(email, role, displayName, access = []) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          role,
          display_name: displayName,
          access,
        }),
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || "Request failed");
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Create new User
  async createUserIDG(email, role, displayName, password, access = []) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/idg/users`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          role,
          display_name: displayName,
          password,
          access,
        }),
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || "Request failed");
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const response = await fetch(
        `${this.baseUrl}/admin/users/reset-password`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ email }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  // Delete a user
  async deleteUser(userId) {
    console.log(userId);
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId.id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Delete a user
  async deleteIDGClient(clientId) {
    console.log(clientId);
    try {
      const response = await fetch(`${this.baseUrl}/idg/clients/${clientId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Edit/Update a user
  async editUser(user) {
    console.log(user);
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${user.id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({
          displayName: user.displayName,
          role: user.role,
          access: user.access || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error editing user:", error);
      throw error;
    }
  }

  async editIDGClient(ClientData) {
    console.log(ClientData);
    try {
      const response = await fetch(
        `${this.baseUrl}/idg/clients/${ClientData.clientId}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify({
            name: ClientData.name,
            email: ClientData.email,
            contact: ClientData.contact,
            billingAddress: ClientData.address,
            country: ClientData.country,
            state: ClientData.state,
            postcode: ClientData.postcode,
            abn: ClientData.abn,
            password: ClientData.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error editing user:", error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  // Bulk operations
  async bulkCreateUsers(users) {
    try {
      const promises = users.map((user) =>
        this.createUser(user.email, user.role, user.display_name)
      );

      const results = await Promise.allSettled(promises);

      return results.map((result, index) => ({
        user: users[index],
        success: result.status === "fulfilled",
        data: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason : null,
      }));
    } catch (error) {
      console.error("Error in bulk create users:", error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      const user = await this.getUserById(userId);
      return await this.editUser({
        id: userId,
        displayName: user.displayName,
        role: newRole,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.users.filter((user) => user.role === role);
    } catch (error) {
      console.error("Error getting users by role:", error);
      throw error;
    }
  }

  // Search users
  async searchUsers(searchTerm) {
    try {
      const allUsers = await this.getAllUsers();
      const searchLower = searchTerm.toLowerCase();

      return allUsers.users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          (user.display_name &&
            user.display_name.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const allUsers = await this.getAllUsers();

      const stats = {
        totalUsers: allUsers.users.length,
        adminUsers: allUsers.users.filter((u) => u.role === "admin").length,
        regularUsers: allUsers.users.filter((u) => u.role === "user").length,
        activeUsers: allUsers.users.filter((u) => u.status === "active").length,
        inactiveUsers: allUsers.users.filter((u) => u.status === "inactive")
          .length,
      };

      return stats;
    } catch (error) {
      console.error("Error getting user statistics:", error);
      throw error;
    }
  }
}

export default AdminAPI;
