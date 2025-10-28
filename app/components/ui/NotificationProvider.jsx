"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

let notificationId = 0;

const typeStyles = {
  success: {
    container: "border-green-400 bg-green-50 text-green-700",
    icon: "✅",
  },
  error: {
    container: "border-red-400 bg-red-50 text-red-700",
    icon: "❌",
  },
  info: {
    container: "border-blue-400 bg-blue-50 text-blue-700",
    icon: "ℹ️",
  },
  warning: {
    container: "border-yellow-400 bg-yellow-50 text-yellow-700",
    icon: "⚠️",
  },
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showNotification = useCallback(
    ({ type = "info", message, title, duration = 3500 }) => {
      if (!message) return;
      notificationId += 1;
      const id = notificationId;

      setNotifications((prev) => [...prev, { id, type, message, title, duration }]);

      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
      }
    },
    [removeNotification]
  );

  const success = useCallback(
    (message, options = {}) => showNotification({ ...options, type: "success", message }),
    [showNotification]
  );

  const error = useCallback(
    (message, options = {}) => showNotification({ ...options, type: "error", message }),
    [showNotification]
  );

  const info = useCallback(
    (message, options = {}) => showNotification({ ...options, type: "info", message }),
    [showNotification]
  );

  const warning = useCallback(
    (message, options = {}) => showNotification({ ...options, type: "warning", message }),
    [showNotification]
  );

  const confirm = useCallback(
    ({
      title = "Konfirmasi",
      message,
      confirmText = "Ya",
      cancelText = "Batal",
      variant = "danger",
    }) => {
      if (!message) {
        return Promise.resolve(false);
      }

      return new Promise((resolve) => {
        setConfirmState({
          title,
          message,
          confirmText,
          cancelText,
          variant,
          resolve,
        });
      });
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      notify: showNotification,
      success,
      error,
      info,
      warning,
      confirm,
      removeNotification,
    }),
    [confirm, error, info, removeNotification, showNotification, success, warning]
  );

  const handleConfirmChoice = useCallback(
    (value) => {
      if (confirmState?.resolve) {
        confirmState.resolve(value);
      }
      setConfirmState(null);
    },
    [confirmState]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationToasts notifications={notifications} onDismiss={removeNotification} />
      <ConfirmDialog data={confirmState} onChoice={handleConfirmChoice} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification harus dipakai di dalam NotificationProvider");
  }
  return context;
}

function NotificationToasts({ notifications, onDismiss }) {
  return (
    <div className="pointer-events-none fixed top-20 right-6 z-50 flex flex-col gap-3">
      {notifications.map((notification) => {
        const { container, icon } = typeStyles[notification.type] ?? typeStyles.info;
        return (
          <div
            key={notification.id}
            className={`pointer-events-auto relative flex w-80 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-opacity ${container}`}
          >
            <span className="text-xl">{icon}</span>
            <div className="flex-1">
              {notification.title && (
                <p className="font-semibold leading-tight">{notification.title}</p>
              )}
              <p className="text-sm leading-snug">{notification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              className="text-xl leading-none text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmDialog({ data, onChoice }) {
  if (!data) return null;

  const confirmButtonClass =
    data.variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800">{data.title}</h3>
        <p className="mt-3 text-sm text-gray-600">{data.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onChoice(false)}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {data.cancelText}
          </button>
          <button
            type="button"
            onClick={() => onChoice(true)}
            className={`rounded px-4 py-2 text-sm font-medium ${confirmButtonClass}`}
          >
            {data.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
