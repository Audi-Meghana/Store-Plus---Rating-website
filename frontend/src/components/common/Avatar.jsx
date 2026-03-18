import { useState } from "react";

const COLORS = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-cyan-500", text: "text-white" },
];

const getColorFromName = (name) => {
  if (!name) return COLORS[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return COLORS[sum % COLORS.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-20 h-20 text-2xl",
};

const RING_CLASSES = {
  none: "",
  white: "ring-2 ring-white",
  blue: "ring-2 ring-blue-500",
  gray: "ring-2 ring-gray-200",
};

const STATUS_SIZE = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
  "2xl": "w-4 h-4",
};

const STATUS_COLORS = {
  online: "bg-green-400",
  offline: "bg-gray-400",
  busy: "bg-red-400",
  away: "bg-yellow-400",
};

const Avatar = ({
  name,
  src,
  size = "md",
  ring = "none",
  status,
  shape = "circle",
  className = "",
  onClick,
  showTooltip = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const color = getColorFromName(name);
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const ringClass = RING_CLASSES[ring] || RING_CLASSES.none;
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const cursorClass = onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : "";

  const showImage = src && !imgError;

  return (
    <div
      className={`relative inline-flex flex-shrink-0 ${className}`}
      onClick={onClick}
      title={showTooltip && name ? name : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "Avatar"}
          onError={() => setImgError(true)}
          className={`${sizeClass} ${shapeClass} ${ringClass} ${cursorClass} object-cover`}
        />
      ) : (
        <div
          className={`
            ${sizeClass} ${shapeClass} ${ringClass} ${cursorClass}
            ${color.bg} ${color.text}
            flex items-center justify-center
            font-semibold select-none
          `}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${STATUS_SIZE[size] || STATUS_SIZE.md}
            ${STATUS_COLORS[status] || STATUS_COLORS.offline}
            ${shape === "circle" ? "rounded-full" : "rounded-full"}
            ring-2 ring-white
          `}
        />
      )}
    </div>
  );
};

export const AvatarGroup = ({
  users = [],
  size = "sm",
  max = 4,
  className = "",
}) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((user, i) => (
        <div
          key={user.id || i}
          className="-ml-2 first:ml-0"
          style={{ zIndex: visible.length - i }}
        >
          <Avatar
            name={user.name}
            src={user.profilePhoto}
            size={size}
            ring="white"
            showTooltip
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            -ml-2 z-0
            ${SIZE_CLASSES[size] || SIZE_CLASSES.sm}
            rounded-full ring-2 ring-white
            bg-gray-200 text-gray-600
            flex items-center justify-center
            text-xs font-semibold select-none
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export const AvatarWithInfo = ({
  name,
  src,
  subtitle,
  size = "md",
  ring = "none",
  status,
  className = "",
  onClick,
  badge,
}) => {
  return (
    <div
      className={`flex items-center gap-3 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <Avatar
        name={name}
        src={src}
        size={size}
        ring={ring}
        status={status}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          {badge && (
            <span className="flex-shrink-0 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export const AvatarUpload = ({
  name,
  src,
  size = "xl",
  onUpload,
  className = "",
}) => {
  const [preview, setPreview] = useState(src || null);
  const [hovering, setHovering] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onUpload) onUpload(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <Avatar
          name={name}
          src={preview}
          size={size}
          ring="gray"
        />
        <label
          htmlFor="avatar-upload"
          className={`
            absolute inset-0 rounded-full
            flex items-center justify-center
            cursor-pointer transition-all duration-200
            ${hovering ? "bg-black/40" : "bg-transparent"}
          `}
        >
          {hovering && (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
        Click to change
      </p>
    </div>
  );
};

export default Avatar;