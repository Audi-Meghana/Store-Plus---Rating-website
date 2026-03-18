import { useEffect, useRef, useCallback } from "react";
import { X, AlertTriangle, CheckCircle, Info, Trash2 } from "lucide-react";

const SIZE_CLASSES = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full mx-4",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  noPadding = false,
}) => {
  const overlayRef = useRef(null);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (!closeOnEsc) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeOnEsc, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`
          relative w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
          bg-white rounded-2xl shadow-2xl
          transform transition-all duration-200
          animate-in slide-in-from-bottom-4 fade-in
          ${className}
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className={`flex items-start justify-between px-6 py-5 border-b border-gray-100 ${headerClassName}`}>
            <div className="flex-1 min-w-0 pr-4">
              {title && (
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`${noPadding ? "" : "px-6 py-5"} ${bodyClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  const VARIANTS = {
    danger: {
      icon: <Trash2 size={24} className="text-red-500" />,
      iconBg: "bg-red-100",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-yellow-500" />,
      iconBg: "bg-yellow-100",
      button: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: <Info size={24} className="text-blue-500" />,
      iconBg: "bg-blue-100",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    success: {
      icon: <CheckCircle size={24} className="text-green-500" />,
      iconBg: "bg-green-100",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const v = VARIANTS[variant] || VARIANTS.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
    >
      <div className="text-center py-2">
        <div className={`w-14 h-14 ${v.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {v.icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        {message && (
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${v.button}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "Got it",
}) => {
  const TYPES = {
    info: {
      icon: <Info size={24} className="text-blue-500" />,
      iconBg: "bg-blue-100",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    success: {
      icon: <CheckCircle size={24} className="text-green-500" />,
      iconBg: "bg-green-100",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-yellow-500" />,
      iconBg: "bg-yellow-100",
      button: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    error: {
      icon: <AlertTriangle size={24} className="text-red-500" />,
      iconBg: "bg-red-100",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const t = TYPES[type] || TYPES.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center py-2">
        <div className={`w-14 h-14 ${t.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {t.icon}
        </div>
        {title && <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>}
        {message && <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>}
        <button
          onClick={onClose}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${t.button}`}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};

export const DrawerModal = ({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  size = "md",
  showClose = true,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const DRAWER_SIZE = {
    sm: "w-72",
    md: "w-80",
    lg: "w-96",
    xl: "w-[480px]",
    full: "w-full",
  };

  const POSITION = {
    right: "right-0 top-0 h-full",
    left: "left-0 top-0 h-full",
    bottom: "bottom-0 left-0 w-full",
    top: "top-0 left-0 w-full",
  };

  const isVertical = position === "right" || position === "left";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`
          absolute bg-white shadow-2xl flex flex-col
          ${POSITION[position]}
          ${isVertical ? DRAWER_SIZE[size] || DRAWER_SIZE.md : "max-h-[85vh]"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ImageModal = ({
  isOpen,
  onClose,
  src,
  alt,
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt={alt || "Image"}
        className="max-w-full max-h-full object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Modal;