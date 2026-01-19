import { useState, useEffect, useRef } from "react";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationAPI from "../../api/notificationAPI";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const popoverRef = useRef(null);
  const notificationAPI = new NotificationAPI();
  const navigate = useNavigate();
  const location = useLocation();

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        notificationAPI.getNotifications(),
        notificationAPI.getCommercialNotifications(),
      ]);

      const convResult = results[0];
      const commResult = results[1];

      let convData = [];
      if (convResult.status === 'fulfilled') {
        convData = convResult.value;
      } else {
        console.error("Error fetching conveyancing notifications:", convResult.reason);
      }

      let commData = [];
      if (commResult.status === 'fulfilled') {
        commData = commResult.value;
      } else {
        console.error("Error fetching commercial notifications:", commResult.reason);
      }
      
      const convNotifs = (Array.isArray(convData) ? convData : convData.notifications || []).map(n => ({ ...n, type: 'conveyancing' }));
      const commNotifs = (Array.isArray(commData) ? commData : commData.notifications || []).map(n => ({ ...n, type: 'commercial' }));

      const allNotifs = [...convNotifs, ...commNotifs].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(allNotifs);
      setUnreadCount(allNotifs.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
        fetchNotifications();
    }
  };

  const markAsRead = async (notification) => {
    try {
      // Optimistically update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notification._id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      switch (notification.type) {
        case 'commercial':
          await notificationAPI.markCommercialAsRead(notification._id);
          break;
        case 'conveyancing':
        default:
          await notificationAPI.markAsRead(notification._id);
          break;
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getStageNumber = (stageName) => {
    switch (stageName) {
      case "StageOne": return 1;
      case "StageTwo": return 2;
      case "StageThree": return 3;
      case "StageFour": return 4;
      default: return 1;
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsRead(notification);
    }

    setIsOpen(false);

    // Redirect to matter page
    // Determine user role based on current path prefix
    let prefix = "/admin";
    if (location.pathname.startsWith("/user")) {
        prefix = "/user";
    }

    // Determine target stage (default to first pending stage or 1)
    let stageNo = 1;
    if (notification.pendingStages && notification.pendingStages.length > 0) {
        stageNo = getStageNumber(notification.pendingStages[0]);
    }

    // Route: /admin/client/stages/:matterNumber/:stageNo
    const route = `${prefix}/client/stages/${notification.matterNumber}/${stageNo}`;
    navigate(route);
  };

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

      {/* Notification Popover */}
      {isOpen && (
        <>
            {/* Mobile Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 z-40 md:hidden" 
                onClick={() => setIsOpen(false)}
            />
            <div className="fixed inset-x-4 top-20 md:absolute md:top-12 md:right-0 md:left-auto md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">
                  Notifications
                </h3>
                <p className="text-slate-300 text-xs">Recent notifications</p>
              </div>
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="text-slate-300 hover:text-white p-1 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${
                      notification.isRead 
                        ? "bg-white border-transparent" 
                        : "bg-blue-50 border-blue-500"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#FB4A50]/90 text-white rounded-full">
                                {notification.matterNumber}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>{new Date(notification.createdAt).toLocaleDateString("en-GB")}</span>
                            <div className="flex relative w-4 h-3">
                                <svg
                                    width="12"
                                    height="8"
                                    viewBox="0 0 12 8"
                                    fill="none"
                                    className={`absolute left-0 top-1 transition-colors duration-300 ${notification.isRead ? "text-[#53bdeb]" : "text-gray-300"}`}
                                >
                                    <path
                                        d="M1 3.5L4.5 7L11 0.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <svg
                                    width="12"
                                    height="8"
                                    viewBox="0 0 12 8"
                                    fill="none"
                                    className={`absolute left-[5px] top-1 transition-colors duration-300 ${notification.isRead ? "text-[#53bdeb]" : "text-gray-300"}`}
                                >
                                    <path
                                        d="M1 3.5L4.5 7L11 0.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>

                    {notification.settlementDate && (
                        <p className="text-xs text-gray-700 font-bold">
                            Settlement: {new Date(notification.settlementDate).toLocaleDateString("en-GB")}
                        </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Bell size={24} className="mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
