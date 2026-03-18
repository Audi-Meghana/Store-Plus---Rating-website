import { Star, CheckCircle, TrendingUp, Award, Shield, Zap, Clock, Tag, AlertCircle, ThumbsUp } from "lucide-react";

const VARIANTS = {
  verified: {
    label: "Verified",
    icon: CheckCircle,
    class: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  topRated: {
    label: "Top Rated",
    icon: Star,
    class: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  mostImproved: {
    label: "Most Improved",
    icon: TrendingUp,
    class: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  featured: {
    label: "Featured",
    icon: Award,
    class: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  trusted: {
    label: "Trusted",
    icon: Shield,
    class: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  new: {
    label: "New",
    icon: Zap,
    class: "bg-pink-100 text-pink-700 border-pink-200",
    dot: "bg-pink-500",
  },
  openNow: {
    label: "Open Now",
    icon: Clock,
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    icon: Clock,
    class: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  deal: {
    label: "Deal",
    icon: Tag,
    class: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  warning: {
    label: "Warning",
    icon: AlertCircle,
    class: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
  helpful: {
    label: "Helpful",
    icon: ThumbsUp,
    class: "bg-teal-100 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    class: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  owner: {
    label: "Owner",
    icon: Award,
    class: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  user: {
    label: "User",
    icon: CheckCircle,
    class: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

const SIZE_CLASSES = {
  xs: "text-xs px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-1 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-1.5",
};

const ICON_SIZE = {
  xs: 10,
  sm: 11,
  md: 13,
  lg: 14,
};

const Badge = ({
  variant,
  label,
  icon: CustomIcon,
  size = "sm",
  showIcon = true,
  showDot = false,
  pulse = false,
  rounded = "full",
  className = "",
  onClick,
}) => {
  const config = VARIANTS[variant] || null;
  const displayLabel = label || config?.label || variant;
  const IconComponent = CustomIcon || config?.icon || null;
  const colorClass = config?.class || "bg-gray-100 text-gray-600 border-gray-200";
  const dotColor = config?.dot || "bg-gray-400";
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const iconSize = ICON_SIZE[size] || ICON_SIZE.sm;
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-lg";
  const cursorClass = onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : "";

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center border font-medium
        ${colorClass} ${sizeClass} ${roundedClass} ${cursorClass}
        ${className}
      `}
    >
      {showDot && (
        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? "animate-pulse" : ""}`} />
      )}
      {showIcon && IconComponent && !showDot && (
        <IconComponent size={iconSize} className="flex-shrink-0" />
      )}
      {displayLabel}
    </span>
  );
};

export const RatingBadge = ({ rating, size = "sm", className = "" }) => {
  const getColor = () => {
    if (rating >= 4.5) return "bg-green-100 text-green-700 border-green-200";
    if (rating >= 4.0) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (rating >= 3.5) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (rating >= 3.0) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-600 border-red-200";
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 border font-semibold rounded-full
        ${SIZE_CLASSES[size]} ${getColor()} ${className}
      `}
    >
      <Star size={ICON_SIZE[size]} className="fill-current flex-shrink-0" />
      {Number(rating).toFixed(1)}
    </span>
  );
};

export const RoleBadge = ({ role, size = "sm", className = "" }) => {
  const map = {
    admin: "admin",
    shop_owner: "owner",
    user: "user",
  };
  return (
    <Badge
      variant={map[role] || "user"}
      size={size}
      className={className}
    />
  );
};

export const StatusBadge = ({ isOpen, size = "sm", className = "" }) => {
  return (
    <Badge
      variant={isOpen ? "openNow" : "closed"}
      size={size}
      showDot
      pulse={isOpen}
      className={className}
    />
  );
};

export const CountBadge = ({
  count,
  color = "blue",
  size = "xs",
  className = "",
}) => {
  const colorMap = {
    blue: "bg-blue-600 text-white",
    red: "bg-red-500 text-white",
    green: "bg-green-500 text-white",
    gray: "bg-gray-500 text-white",
    orange: "bg-orange-500 text-white",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-bold rounded-full border-0
        ${SIZE_CLASSES[size]}
        ${colorMap[color] || colorMap.blue}
        min-w-[1.25rem]
        ${className}
      `}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export const BadgeGroup = ({
  badges = [],
  size = "sm",
  max = 3,
  className = "",
}) => {
  const visible = badges.slice(0, max);
  const remaining = badges.length - max;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visible.map((b, i) => (
        <Badge
          key={i}
          variant={b.variant}
          label={b.label}
          size={size}
          showIcon={b.showIcon !== false}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-gray-400 font-medium">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

export default Badge;