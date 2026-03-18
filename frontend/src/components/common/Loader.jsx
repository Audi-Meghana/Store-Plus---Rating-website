const Spinner = ({
  size = "md",
  color = "blue",
  className = "",
}) => {
  const sizes = {
    xs: "w-3 h-3 border-[2px]",
    sm: "w-4 h-4 border-[2px]",
    md: "w-6 h-6 border-[2px]",
    lg: "w-8 h-8 border-[3px]",
    xl: "w-12 h-12 border-4",
    "2xl": "w-16 h-16 border-4",
  };

  const colors = {
    blue: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent",
    green: "border-green-500 border-t-transparent",
    red: "border-red-500 border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
  };

  return (
    <div
      className={`
        rounded-full animate-spin
        ${sizes[size] || sizes.md}
        ${colors[color] || colors.blue}
        ${className}
      `}
    />
  );
};

export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-b-blue-300 animate-spin absolute inset-0" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
      <div className="text-center">
        <p className="text-gray-700 font-semibold text-base">{message}</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
};

export const SectionLoader = ({ message = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <Spinner size="lg" color="blue" />
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
};

export const InlineLoader = ({ message = "", size = "sm", className = "" }) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Spinner size={size} color="blue" />
      {message && <span className="text-gray-500 text-sm">{message}</span>}
    </span>
  );
};

export const SkeletonLine = ({ width = "w-full", height = "h-4", className = "" }) => {
  return (
    <div
      className={`
        ${width} ${height} ${className}
        bg-gray-200 rounded-lg
        animate-pulse
      `}
    />
  );
};

export const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse ${className}`}>
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-10" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
            ))}
          </div>
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonReviewCard = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 animate-pulse ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-16 w-16 bg-gray-200 rounded-xl" />
        <div className="h-16 w-16 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonStoreDetail = () => {
  return (
    <div className="animate-pulse">
      <div className="h-64 md:h-80 bg-gray-200 w-full" />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="h-7 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-xl" />
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <SkeletonReviewCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 bg-gray-200 rounded-xl" />
              <div className="h-6 w-14 bg-gray-200 rounded-full" />
            </div>
            <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse ${className}`}>
      <div className="grid gap-4 px-6 py-4 border-b border-gray-50"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array(cols).fill(0).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 px-6 py-4 border-b border-gray-50 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array(cols).fill(0).map((_, j) => (
            <div key={j} className={`h-4 bg-gray-100 rounded ${j === 0 ? "w-full" : "w-2/3"}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ButtonLoader = ({ size = "sm" }) => {
  return <Spinner size={size} color="white" />;
};

export const OverlayLoader = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 mx-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        </div>
        <p className="text-gray-800 font-semibold text-base">{message}</p>
        <p className="text-gray-400 text-sm">Please do not close this window</p>
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon,
  title = "Nothing here yet",
  description = "",
  action,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-5">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default Spinner;