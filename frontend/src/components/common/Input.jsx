import { useState, forwardRef } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, Search, X } from "lucide-react";

const Input = forwardRef(({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  onClear,
  error,
  success,
  hint,
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  required = false,
  readOnly = false,
  className = "",
  inputClassName = "",
  size = "md",
  variant = "default",
  prefix,
  suffix,
  maxLength,
  showCount = false,
  autoFocus = false,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const SIZE = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const LABEL_SIZE = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-sm",
  };

  const baseInput = `
    w-full rounded-xl border outline-none transition-all duration-200
    text-gray-900 placeholder-gray-400
    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
    read-only:bg-gray-50 read-only:cursor-default
    ${SIZE[size] || SIZE.md}
  `;

  const getVariantClass = () => {
    if (error) {
      return "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400";
    }
    if (success) {
      return "border-green-300 bg-green-50 focus:ring-2 focus:ring-green-200 focus:border-green-400";
    }
    if (variant === "filled") {
      return "border-transparent bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400";
    }
    return "border-gray-200 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400";
  };

  const getPaddingLeft = () => {
    if (prefix) return "pl-14";
    if (Icon) return "pl-10";
    return "";
  };

  const getPaddingRight = () => {
    const rights = [];
    if (isPassword || IconRight || onClear) rights.push("pr-10");
    if (showCount) rights.push("pr-14");
    if (suffix) rights.push("pr-14");
    return rights[0] || "";
  };

  return (
    <div className={`w-full ${className}`}>

      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={`block font-medium text-gray-700 mb-1.5 ${LABEL_SIZE[size] || LABEL_SIZE.md}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">

        {/* Left icon */}
        {Icon && !prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon
              size={size === "lg" ? 18 : 16}
              className={`transition-colors ${
                focused ? "text-blue-500" : error ? "text-red-400" : "text-gray-400"
              }`}
            />
          </div>
        )}

        {/* Prefix */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center">
            <span className="pl-3.5 pr-2.5 text-sm text-gray-500 border-r border-gray-200 h-full flex items-center bg-gray-50 rounded-l-xl">
              {prefix}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={`
            ${baseInput}
            ${getVariantClass()}
            ${getPaddingLeft()}
            ${getPaddingRight()}
            ${inputClassName}
          `}
          {...rest}
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">

          {/* Clear button */}
          {onClear && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          )}

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* Custom right icon */}
          {IconRight && !isPassword && (
            <div className="text-gray-400 pointer-events-none">
              <IconRight size={16} />
            </div>
          )}

          {/* Success icon */}
          {success && !isPassword && !IconRight && (
            <CheckCircle size={16} className="text-green-500 pointer-events-none" />
          )}

          {/* Error icon */}
          {error && !isPassword && !IconRight && (
            <AlertCircle size={16} className="text-red-400 pointer-events-none" />
          )}

          {/* Suffix */}
          {suffix && (
            <span className="text-sm text-gray-500 border-l border-gray-200 pl-2.5 h-full flex items-center bg-gray-50 rounded-r-xl -mr-3 pr-3.5">
              {suffix}
            </span>
          )}
        </div>

        {/* Character count */}
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-3">
            <span className={`text-xs ${value?.length >= maxLength ? "text-red-400" : "text-gray-400"}`}>
              {value?.length || 0}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && typeof success === "string" && (
        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
          <CheckCircle size={12} />
          {success}
        </p>
      )}

      {/* Hint */}
      {hint && !error && !success && (
        <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export const Textarea = forwardRef(({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  hint,
  disabled = false,
  required = false,
  readOnly = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = "",
  resize = "vertical",
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);

  const resizeClass = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 text-sm rounded-xl border outline-none
            transition-all duration-200
            text-gray-900 placeholder-gray-400
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${resizeClass[resize] || resizeClass.vertical}
            ${error
              ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400"
              : success
              ? "border-green-300 bg-green-50 focus:ring-2 focus:ring-green-200 focus:border-green-400"
              : "border-gray-200 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            }
            ${showCount ? "pb-7" : ""}
          `}
          {...rest}
        />

        {showCount && maxLength && (
          <span className={`absolute bottom-2.5 right-3 text-xs ${value?.length >= maxLength ? "text-red-400" : "text-gray-400"}`}>
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {success && typeof success === "string" && (
        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
          <CheckCircle size={12} />
          {success}
        </p>
      )}
      {hint && !error && !success && (
        <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  size = "md",
  className = "",
  autoFocus = false,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(value); }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full rounded-xl border border-gray-200 bg-white
          text-gray-900 placeholder-gray-400 outline-none
          focus:ring-2 focus:ring-blue-200 focus:border-blue-400
          transition-all duration-200
          pl-10 ${value ? "pr-9" : "pr-4"}
          ${size === "sm" ? "py-2 text-xs" : size === "lg" ? "py-3 text-base" : "py-2.5 text-sm"}
        `}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
};

export const OTPInput = ({
  length = 6,
  value = "",
  onChange,
  error,
  className = "",
}) => {
  const digits = Array(length).fill("").map((_, i) => value[i] || "");

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return;
    const newValue = digits.map((d, i) => (i === index ? digit : d)).join("");
    onChange(newValue);
    if (digit && index < length - 1) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`
              w-11 h-12 text-center text-lg font-bold rounded-xl border-2
              outline-none transition-all duration-200
              ${digit ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-900"}
              ${error ? "border-red-300 bg-red-50" : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500 text-center flex items-center justify-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;