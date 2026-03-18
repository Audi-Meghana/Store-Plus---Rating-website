// Returns error string if invalid, null if valid

export const validateUpdateProfile = (data) => {
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length < 2)
      return "Name must be at least 2 characters.";
    if (data.name.trim().length > 100)
      return "Name must be under 100 characters.";
  }

  if (data.phone !== undefined && data.phone !== "") {
    if (!/^[+\d\s\-()\.\,]{7,20}$/.test(data.phone))
      return "Invalid phone number format.";
  }

  if (data.city !== undefined && data.city !== "") {
    if (data.city.trim().length < 2)
      return "City must be at least 2 characters.";
    if (data.city.trim().length > 100)
      return "City must be under 100 characters.";
  }

  if (data.avatar !== undefined && data.avatar !== "") {
    if (!/^https?:\/\/.+/.test(data.avatar))
      return "Avatar must be a valid URL starting with http:// or https://";
  }

  return null;
};

export const validateNotifPrefs = (data) => {
  const allowed = ["newReview", "replyReceived", "dealExpiry", "weeklyReport", "tipAlerts", "marketing"];
  for (const key of Object.keys(data)) {
    if (!allowed.includes(key))
      return `Unknown notification preference: ${key}`;
    if (typeof data[key] !== "boolean")
      return `Preference "${key}" must be true or false.`;
  }
  return null;
};

// Middleware factory — same pattern as stores.validator.js
export const validate = (fn) => (req, res, next) => {
  const error = fn(req.body);
  if (error) return res.status(422).json({ success: false, message: error });
  next();
};