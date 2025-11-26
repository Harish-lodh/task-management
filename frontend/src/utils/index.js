export const initialColumns = [
  {
    id: "todo",
    title: "TO DO",
    countColor: "#1e293b",
    badgeColor: "#1e293b",      // Dark slate for badge background
    badgeText: "#ffffff",       // White text
    headerBg: "#f8fafc",
    accent: "#cbd5f5",
    tasks: [],
  },
  {
    id: "in-progress",
    title: "IN PROGRESS",
    countColor: "#2563eb",
    headerBg: "#ffffff",
    badgeColor: "#2563eb",      // Blue for badge background
    badgeText: "#ffffff",       // White text
    accent: "#0000ff",
    tasks: [],
  },
  {
    id: "completed",
    title: "COMPLETED",
    countColor: "#059669",
    headerBg: "#ffffff",
    badgeColor: "#059669",      // Green for badge background
    badgeText: "#ffffff",       // White text
    accent: "#00cc00",
    tasks: [],
  },
];


export const PRIORITY_RANK = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};