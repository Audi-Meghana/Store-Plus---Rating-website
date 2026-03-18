import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader } from "lucide-react";

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bg: "bg-white",
    border: "border-green-200",
    iconColor: "text-green-500",
    progressColor: "bg-green-500",
    titleColor: "text-gray-900",
    descColor: "text-gray-500",
    badgeBg: "bg-green-50",
  },
  error: {
    icon: XCircle,
    bg: "bg-white",
    border: "border-red-200",
    iconColor: "text-red-500",
    progressColor: "bg-red-500",
    titleColor: "text-gray-900",
    descColor: "text-gray-500",
    badgeBg: "bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-white",
    border: "border-yellow-200",
    iconColor: "text-yellow-500",
    progressColor: "bg-yellow-400",
    titleColor: "text-gray-900",
    descColor: "text-gray-500",
    badgeBg: "bg-yellow-50",
  },
  info: {
    icon: Info,
    bg: "bg-white",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    progressColor: "bg-blue-500",
    titleColor: "text-gray-900",
    descColor: "text-gray-500",
    badgeBg: "bg-blue-50",
  },
  loading: {
    icon: Loader,
    bg: "bg-white",
    border: "border-gray-200",
    iconColor: "text-gray-500",
    progressColor: "bg-gray-400",
    titleColor: "text-gray-900",
    descColor: "text-gray-500",
    badgeBg: "bg-gray-50",
  },
};

const POSITIONS = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

let toastId = 0;
let globalAddToast = null;

export const toast = {
  success: (message, options = {}) => globalAddToast?.({ type: "success", message, ...options }),
  error: (message, options = {}) => globalAddToast?.({ type: "error", message, ...options }),
  warning: (message, options = {}) => globalAddToast?.({ type: "warning", message, ...options }),
  info: (message, options = {}) => globalAddToast?.({ type: "info", message, ...options }),
  loading: (message, options = {}) => globalAddToast?.({ type: "loading", message, duration: 0, ...options }),
  dismiss: (id) => globalAddToast?.({ type: "dismiss", id }),
  dismissAll: () => globalAddToast?.({ type: "dismissAll" }),
};

const ToastItem = ({ id, type, message, description, duration, onRemove, action }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = config.icon;

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!duration || duration === 0 || paused) return;
    const step = 100 / (duration / 50);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          handleRemove();
          return 0;
        }
        return prev - step;
      });
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [duration, paused]);

  const handleRemove = useCallback(() => {
    setVisible(false);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  return (
    <div
      className={`
        relative flex items-start gap-3 w-full max-w-sm
        ${config.bg} border ${config.border}
        rounded-2xl shadow-lg px-4 py-3.5
        transition-all duration-300 ease-out cursor-pointer
        overflow-hidden
        ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"}
      `}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={handleRemove}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.badgeBg}`}>
        <Icon
          size={16}
          className={`${config.iconColor} ${type === "loading" ? "animate-spin" : ""}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold ${config.titleColor} leading-tight`}>
          {message}
        </p>
        {description && (
          <p className={`text-xs ${config.descColor} mt-0.5 leading-relaxed`}>
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={(e) => { e.stopPropagation(); action.onClick(); handleRemove(); }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1.5 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleRemove(); }}
        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
          <div
            className={`h-full ${config.progressColor} transition-none rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer = ({
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    if (options.type === "dismiss") {
      setToasts((prev) => prev.filter((t) => t.id !== options.id));
      return;
    }
    if (options.type === "dismissAll") {
      setToasts([]);
      return;
    }

    const id = ++toastId;
    const newToast = {
      id,
      type: options.type || "info",
      message: options.message || "",
      description: options.description || null,
      duration: options.duration !== undefined ? options.duration : 4000,
      action: options.action || null,
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  useEffect(() => {
    globalAddToast = addToast;
    return () => { globalAddToast = null; };
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className={`
        fixed z-[9999] flex flex-col gap-2.5 p-4
        pointer-events-none
        ${POSITIONS[position] || POSITIONS["top-right"]}
      `}
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full">
          <ToastItem
            {...t}
            onRemove={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    warning: (message, options) => toast.warning(message, options),
    info: (message, options) => toast.info(message, options),
    loading: (message, options) => toast.loading(message, options),
    dismiss: (id) => toast.dismiss(id),
    dismissAll: () => toast.dismissAll(),
  };
};

export default ToastContainer;