const BASE_URL = 'https://opsnav-app-service-871399330172.us-central1.run.app';

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

  // Create a new user
  async createUser(email, role, displayName) {
    console.log(JSON.stringify({ email, role, displayName }));
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          role: role,
          display_name: displayName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async resetPass(email, role, displayName) {
    console.log(email);
    console.log(JSON.stringify({ email, role, displayName }));

    try {
      const response = await fetch(
        `http://localhost:5000/admin/users/reset-password`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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
      return await this.editUser(userId, user.display_name, newRole);
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((user) => user.role === role);
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
      return allUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.display_name.toLowerCase().includes(searchLower)
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
        totalUsers: allUsers.length,
        adminUsers: allUsers.filter((u) => u.role === "admin").length,
        regularUsers: allUsers.filter((u) => u.role === "user").length,
        activeUsers: allUsers.filter((u) => u.status === "active").length,
        inactiveUsers: allUsers.filter((u) => u.status === "inactive").length,
      };

      return stats;
    } catch (error) {
      console.error("Error getting user statistics:", error);
      throw error;
    }
  }
}

export default AdminAPI;
