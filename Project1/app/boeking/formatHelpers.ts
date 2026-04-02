export const formatTijd = (d: Date) =>
  d.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });

export const formatDatum = (d: Date) =>
  d.toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
