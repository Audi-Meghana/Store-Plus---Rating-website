// validators/storeValidators.js

// Returns error string if invalid, null if valid

export const validateProfile = (data) => {
  if (!data.name || data.name.trim().length < 2)
    return "Shop name must be at least 2 characters.";
  if (data.name.trim().length > 100)
    return "Shop name must be under 100 characters.";
  if (data.description && data.description.length > 500)
    return "Description must be under 500 characters.";
  if (data.phone && !/^[+\d\s\-()\.\,]{7,20}$/.test(data.phone))
    return "Invalid phone number format.";
  if (data.website && !/^https?:\/\/.+/.test(data.website))
    return "Website must start with http:// or https://";
  return null;
};

export const validateLocation = (data) => {
  if (!data.address || data.address.trim().length < 5)
    return "Full address is required (min 5 characters).";
  if (!data.city || data.city.trim().length < 2)
    return "City is required.";
  if (data.pincode && !/^\d{4,10}$/.test(data.pincode))
    return "Invalid PIN code.";
  if (data.lat && isNaN(Number(data.lat)))
    return "Latitude must be a valid number.";
  if (data.lng && isNaN(Number(data.lng)))
    return "Longitude must be a valid number.";
  return null;
};

export const validateHours = (data) => {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  for (const day of days) {
    if (data[day]?.open && (!data[day].from || !data[day].to))
      return `${day}: opening and closing time are required when day is open.`;
  }
  return null;
};

// Middleware factory — works the same as auth validate()
export const validate = (fn) => (req, res, next) => {
  const error = fn(req.body);
  if (error) return res.status(422).json({ success: false, message: error });
  next();
};
