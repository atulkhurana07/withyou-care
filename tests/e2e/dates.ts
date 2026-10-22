export const demoStart = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
export const demoEnd = new Date(Date.parse(demoStart) + 2 * 86400000)
  .toISOString()
  .slice(0, 10);
