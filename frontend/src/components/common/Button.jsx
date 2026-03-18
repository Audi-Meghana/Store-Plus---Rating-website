import { useState } from "react";

const VARIANTS = {
  primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-transparent shadow-sm hover:shadow-md",
  secondary: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border-transparent",
  outline: "bg-transparent hover:bg-blue-50 active:bg-blue-100 text-blue-600 border-blue-500 hover:border-blue-600",
  ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 border-transparent",
  danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-transparent shadow-sm hover:shadow-md",
  dangerOutline: "bg-transparent hover:bg-red-50 active:bg-red-100 text-red-500 border-red-400 hover:border-red-500",
  success: "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white border-transparent shadow-sm hover:shadow-md",
  successOutline: "bg-transparent hover:bg-green-50 text-green-600 border-green-500",
  warning: "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-white border-transparent shadow-sm",
  white: "bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 border-gray-200 shadow-sm hover:shadow-md",
  dark: "bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white border-transparent shadow-sm hover:shadow-md",
};

const SIZES = {
  xs: "px-2.5 py-1.5 text-xs gap-1",
  sm: "px-3.5 py-2 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
  xl: "px-8 py-4 text-lg gap-2.5",
};

const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

const ROUNDED = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

const Spinner = ({ size }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8z"
    />
  </svg>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  rounded = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) => {
  const [pressed, setPressed] = useState(false);

  const isDisabled = disabled || loading;
  const iconSize = ICON_SIZES[size] || ICON_SIZES.md;

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400
    select-none
    ${VARIANTS[variant] || VARIANTS.primary}
    ${SIZES[size] || SIZES.md}
    ${ROUNDED[rounded] || ROUNDED.md}
    ${fullWidth ? "w-full" : ""}
    ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer active:scale-95"}
    ${pressed ? "scale-95" : ""}
    ${iconOnly ? "aspect-square !px-0 flex items-center justify-center" : ""}
    ${className}
  `;

  const iconOnlySize = {
    xs: "w-7 h-7",
    sm: "w-9 h-9",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`${baseClasses} ${iconOnly ? iconOnlySize[size] : ""}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={iconSize} />
          {!iconOnly && (
            <span className="ml-1 opacity-80">
              {typeof loading === "string" ? loading : "Loading..."}
            </span>
          )}
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
              {leftIcon}
            </span>
          )}
          {!iconOnly && children}
          {rightIcon && (
            <span className="flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
              {rightIcon}
            </span>
          )}
          {iconOnly && children}
        </>
      )}
    </button>
  );
};

export const ButtonGroup = ({
  children,
  className = "",
  attached = false,
}) => {
  return (
    <div
      className={`
        flex items-center
        ${attached ? "[&>button]:rounded-none [&>button:first-child]:rounded-l-xl [&>button:last-child]:rounded-r-xl [&>button:not(:last-child)]:border-r-0" : "gap-2"}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const IconButton = ({
  icon,
  label,
  variant = "ghost",
  size = "md",
  rounded = "md",
  loading = false,
  disabled = false,
  className = "",
  onClick,
  badge,
  ...props
}) => {
  return (
    <div className="relative inline-flex">
      <Button
        variant={variant}
        size={size}
        rounded={rounded}
        loading={loading}
        disabled={disabled}
        iconOnly
        className={className}
        onClick={onClick}
        title={label}
        aria-label={label}
        {...props}
      >
        {icon}
      </Button>
      {badge !== undefined && badge !== null && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 leading-none pointer-events-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
  );
};

export const LoadingButton = ({
  children,
  loadingText = "Loading...",
  isLoading = false,
  ...props
}) => {
  return (
    <Button loading={isLoading ? loadingText : false} {...props}>
      {children}
    </Button>
  );
};

export const ConfirmButton = ({
  children,
  onConfirm,
  confirmText = "Are you sure?",
  variant = "danger",
  size = "md",
  className = "",
}) => {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    } else {
      setConfirming(false);
      if (onConfirm) onConfirm();
    }
  };

  return (
    <Button
      variant={confirming ? "danger" : variant}
      size={size}
      className={`transition-all duration-200 ${className}`}
      onClick={handleClick}
    >
      {confirming ? confirmText : children}
    </Button>
  );
};

export default Button;