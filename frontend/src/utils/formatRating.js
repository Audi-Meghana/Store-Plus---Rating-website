export const formatRating = (rating) => {
  return Number(rating).toFixed(1);
};

export const ratingColor = (rating) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-blue-600";
  if (rating >= 2.5) return "text-yellow-500";
  return "text-red-500";
};

export const ratingBg = (rating) => {
  if (rating >= 4.5) return "bg-green-100 text-green-700";
  if (rating >= 3.5) return "bg-blue-100 text-blue-700";
  if (rating >= 2.5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};