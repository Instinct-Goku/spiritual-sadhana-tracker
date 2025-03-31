
export const formatDateForDisplay = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateForInput = (date: Date) => {
  return date.toISOString().split("T")[0];
};
