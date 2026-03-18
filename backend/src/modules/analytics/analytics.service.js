// Group records by month
export const groupByMonth = (records = [], dateField = "createdAt") => {
  const map = {};

  records.forEach((record) => {
    const date = new Date(record?.[dateField]);

    if (isNaN(date)) return;

    const label = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!map[label]) {
      map[label] = [];
    }

    map[label].push(record);
  });

  return map;
};


// Get last N months labels
export const lastNMonths = (n = 6) => {
  const months = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);

    months.push(
      d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    );
  }

  return months;
};


// Calculate growth percentage
export const growthPercent = (current = 0, previous = 0) => {
  if (!previous || previous === 0) return 0;

  const growth = ((current - previous) / previous) * 100;

  return Math.round(growth);
};