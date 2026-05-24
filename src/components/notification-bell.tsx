"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  relatedId: string | null
  userId: string | null
  user: { name: string } | null
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications()
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return

    const interval = setInterval(() => {
      fetchNotifications(true)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAdmin])

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const markAllAsRead = async () => {
    for (const n of notifications.filter(n => !n.isRead)) {
      await markAsRead(n.id)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!isAdmin) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-shade-50 dark:text-shade-40 hover:bg-shade-30/50 dark:hover:bg-white/5 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-[550] rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-canvas-light dark:bg-canvas-night-elevated rounded-xl shadow-xl border border-hairline-light dark:border-hairline-dark z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-hairline-light dark:border-hairline-dark">
              <h3 className="font-[550] text-ink dark:text-on-dark">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-shade-50 hover:text-ink hover:bg-shade-30 dark:hover:bg-white/10 rounded-full"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-shade-50 hover:text-ink hover:bg-shade-30 dark:hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-shade-50 dark:text-shade-40">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-shade-50 dark:text-shade-40">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-shade-30/30 dark:hover:bg-white/5 ${
                        !notification.isRead ? "bg-shade-30/20 dark:bg-white/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-[550] text-ink dark:text-on-dark">
                            {notification.title}
                          </p>
                          <p className="text-xs text-shade-50 dark:text-shade-40 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-shade-40 dark:text-shade-50 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-shade-40 hover:text-ink hover:bg-shade-30 dark:hover:bg-white/10 rounded-full"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-shade-40 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
