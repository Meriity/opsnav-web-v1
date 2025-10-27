// components/ui/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Trash2,
  CheckCircle,
  Settings,
  RefreshCw,
  Eye,
  X,
  Filter,
  Users,
  UserCheck,
  ShoppingCart,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import NotificationAPI from "../../api/notificationAPI";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30000,
    enabledTypes: {
      user: true,
      client: true,
      order: true,
    },
  });

  const popoverRef = useRef(null);
  const notificationAPI = new NotificationAPI();

  // Temporary mock data for testing - remove when APIs are ready
  const mockNotifications = [
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
    {
      _id: "4",
      type: "system",
      message: "System backup completed successfully",
      read: false,
      metadata: {
        system: "backup",
        route: "/admin/dashboard",
      },
      createdAt: new Date(Date.now() - 1200000).toISOString(),
    },
  ];

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications using NotificationAPI with fallback to mock data
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Try real API first, fallback to mock data if it fails
      try {
        const data = await notificationAPI.getNotifications();
        setNotifications(data.notifications || data || []);
      } catch (apiError) {
        console.log("API not ready, using mock notifications data");
        // Use mock data for development
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to mock data
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count using NotificationAPI with fallback to mock data
  const fetchUnreadCount = async () => {
    try {
      // Try real API first, fallback to mock data if it fails
      try {
        const data = await notificationAPI.getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch (apiError) {
        console.log("API not ready, using mock unread count");
        // Calculate from mock data
        const unread = mockNotifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
      // Fallback to mock calculation
      const unread = mockNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!settings.autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    fetchNotifications();
    fetchUnreadCount();
  };

  // Mark as read using NotificationAPI with mock fallback
  const markAsRead = async (notificationId) => {
    try {
      // Try real API first
      try {
        await notificationAPI.markAsRead(notificationId);
      } catch (apiError) {
        console.log("Mark as read API not ready, updating locally");
      }

      // Update local state regardless of API success
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read using NotificationAPI with mock fallback
  const markAllAsRead = async () => {
    try {
      // Try real API first
      try {
        await notificationAPI.markAllAsRead();
      } catch (apiError) {
        console.log("Mark all as read API not ready, updating locally");
      }

      // Update local state regardless of API success
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification using NotificationAPI with mock fallback
  const deleteNotification = async (notificationId) => {
    try {
      const deletedNotification = notifications.find(
        (n) => n._id === notificationId
      );

      // Try real API first
      try {
        await notificationAPI.deleteNotification(notificationId);
      } catch (apiError) {
        console.log("Delete notification API not ready, updating locally");
      }

      // Update local state regardless of API success
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Clear all notifications using NotificationAPI with mock fallback
  const clearAllNotifications = async () => {
    try {
      // Try real API first
      try {
        await notificationAPI.clearAllNotifications();
      } catch (apiError) {
        console.log("Clear all notifications API not ready, updating locally");
      }

      // Update local state regardless of API success
      setNotifications([]);
      setUnreadCount(0);
      setShowClearConfirm(false);
      setIsOpen(false);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  // Get notification type styling and icons
  const getNotificationConfig = (type) => {
    const configs = {
      user: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "User",
        icon: Users,
        description: "User management activities",
      },
      client: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Client",
        icon: UserCheck,
        description: "Client creation and updates",
      },
      order: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: "Order",
        icon: ShoppingCart,
        description: "Order processing updates",
      },
    };
    return configs[type] || configs.system;
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Handle actions based on notification type and metadata
    if (notification.metadata?.route) {
      window.location.href = notification.metadata.route;
    }

    setIsOpen(false);
  };

  const filteredNotifications = notifications.filter(
    (notification) => settings.enabledTypes[notification.type]
  );

  return (
    <div className="relative" ref={popoverRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popover - Made more compact */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header - Made more compact */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center gap-1">
              {/* Refresh */}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                title="Settings"
              >
                <Settings size={14} />
              </button>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                  title="Mark all as read"
                >
                  <CheckCircle size={14} />
                </button>
              )}

              {/* Clear All */}
              {notifications.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List - Made more compact */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const config = getNotificationConfig(notification.type);
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={notification._id}
                      className={`p-3 cursor-pointer transition-colors ${
                        notification.read ? "bg-white" : "bg-blue-50"
                      } hover:bg-gray-50 border-l-3 ${
                        config.color.split(" ")[2]
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <IconComponent size={12} />
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Eye size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="p-0.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-800 mb-1 leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>

                      {notification.metadata && (
                        <div className="mt-1 space-y-0.5">
                          {notification.metadata.userEmail && (
                            <p className="text-xs text-gray-500 truncate">
                              User: {notification.metadata.userEmail}
                            </p>
                          )}
                          {notification.metadata.clientName && (
                            <p className="text-xs text-gray-500 truncate">
                              Client: {notification.metadata.clientName}
                            </p>
                          )}
                          {notification.metadata.orderId && (
                            <p className="text-xs text-gray-500 truncate">
                              Order: {notification.metadata.orderId}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(notification.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                <Bell size={24} className="mb-1 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Glass morphism backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Modal content */}
          <div className="relative bg-white/90 backdrop-blur-md rounded-xl p-6 w-full max-w-sm shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Clear All Notifications
              </h3>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all notifications? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-white/50"
              >
                Cancel
              </button>
              <button
                onClick={clearAllNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal - Made more compact */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Glass morphism backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Modal content - Made more compact */}
          <div className="relative bg-white/90 backdrop-blur-md rounded-xl p-5 w-full max-w-sm shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Notification Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Auto Refresh */}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-colors">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    Auto-refresh
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Check for new notifications
                  </p>
                </div>
                <div className="relative inline-block w-10 h-5 ml-2">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoRefresh: e.target.checked,
                      })
                    }
                    className="sr-only"
                    id="auto-refresh"
                  />
                  <label
                    htmlFor="auto-refresh"
                    className={`block w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      settings.autoRefresh ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                        settings.autoRefresh ? "transform translate-x-5" : ""
                      }`}
                    />
                  </label>
                </div>
              </div>

              {/* Refresh Interval */}
              <div className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refresh Interval
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      refreshInterval: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                >
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                </select>
              </div>

              {/* Notification Types */}
              <div className="p-2 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Filter size={14} />
                  Notification Types
                </h4>
                <div className="space-y-3">
                  {Object.entries(settings.enabledTypes).map(
                    ([type, enabled]) => {
                      const config = getNotificationConfig(type);
                      const IconComponent = config.icon;

                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-md ${
                                config.color.split(" ")[0]
                              }`}
                            >
                              <IconComponent
                                size={14}
                                className={config.color.split(" ")[1]}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <label className="text-sm font-medium text-gray-700 capitalize block truncate">
                                {type}
                              </label>
                              <p className="text-xs text-gray-500 truncate">
                                {config.description}
                              </p>
                            </div>
                          </div>
                          <div className="relative inline-block w-10 h-5 ml-2">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  enabledTypes: {
                                    ...settings.enabledTypes,
                                    [type]: e.target.checked,
                                  },
                                })
                              }
                              className="sr-only"
                              id={`type-${type}`}
                            />
                            <label
                              htmlFor={`type-${type}`}
                              className={`block w-10 h-5 rounded-full transition-colors cursor-pointer ${
                                enabled ? "bg-blue-600" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                                  enabled ? "transform translate-x-5" : ""
                                }`}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-gray-200/50">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
