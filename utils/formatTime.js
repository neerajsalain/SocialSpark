import { formatDistanceToNow, format } from "date-fns";

export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function fullDate(date) {
  return format(new Date(date), "MMM d, yyyy");
}
