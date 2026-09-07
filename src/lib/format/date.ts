export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  },
) {
  return new Intl.DateTimeFormat("en", options).format(new Date(value));
}

export function formatDateTime(value: string) {
  return formatDate(value, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
