// utils/mockNotificationAPI.js
class MockNotificationAPI {
  constructor() {
    this.mockNotifications = [
      {
        _id: "1",
        type: "user",
        message: "New user created: John Doe (john@company.com)",
        read: false,
        metadata: {
          userEmail: "john@company.com",
          userName: "John Doe",
          role: "admin",
          route: "/admin/manage-users",
        },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        type: "client",
        message: "New commercial project created: ABC Corporation",
        read: false,
        metadata: {
          clientName: "ABC Corporation",
          clientId: "CL-001",
          route: "/admin/view-clients",
        },
        createdAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        _id: "3",
        type: "order",
        message: "New order created: ORD-2024-001",
        read: true,
        metadata: {
          orderId: "ORD-2024-001",
          clientName: "XYZ Ltd",
          route: "/admin/view-clients",
        },
        createdAt: new Date(Date.now() - 600000).toISOString(),
      },
    ];
  }

  async getNotifications() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { notifications: this.mockNotifications };
  }

  async getUnreadCount() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const count = this.mockNotifications.filter((n) => !n.read).length;
    return { count };
  }

  async markAsRead(notificationId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const notification = this.mockNotifications.find(
      (n) => n._id === notificationId
    );
    if (notification) notification.read = true;
    return notification;
  }

  async markAllAsRead() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.mockNotifications.forEach((n) => (n.read = true));
    return { message: "All notifications marked as read" };
  }

  async deleteNotification(notificationId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.mockNotifications = this.mockNotifications.filter(
      (n) => n._id !== notificationId
    );
    return { message: "Notification deleted" };
  }

  async clearAllNotifications() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.mockNotifications = [];
    return { message: "All notifications cleared" };
  }

  async createNotification(notificationData) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newNotification = {
      _id: Date.now().toString(),
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.mockNotifications.unshift(newNotification);
    return newNotification;
  }
}

export default MockNotificationAPI;
