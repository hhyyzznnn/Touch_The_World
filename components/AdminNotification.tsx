"use client";

import { useState, useEffect } from "react";
import { Bell, X, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "inquiry" | "event" | "program";
  title: string;
  message: string;
  link: string;
  createdAt: Date;
  read: boolean;
}

export function AdminNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 알림 목록 가져오기
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("알림 가져오기 실패:", error);
      }
    };

    fetchNotifications();
    
    // 30초마다 알림 확인
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/read-all", {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "inquiry":
        return <Mail className="w-5 h-5 text-blue-500" />;
      case "event":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "program":
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:ring-offset-2 rounded-md"
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* 알림 패널 */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">알림</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                    aria-label="모든 알림 읽음 처리"
                  >
                    모두 읽음
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary rounded"
                  aria-label="알림 패널 닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">알림이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className={cn(
                        "block p-4 hover:bg-gray-50 transition-colors",
                        !notification.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                !notification.read && "text-gray-900",
                                notification.read && "text-gray-600"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <Link
                  href="/admin/inquiries"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-brand-green-primary hover:text-brand-green-primary/80 font-medium"
                >
                  모든 알림 보기
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
