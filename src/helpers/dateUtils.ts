import {
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from "../constants/time";

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Сегодня";
  } else if (isSameDay(date, yesterday)) {
    return "Вчера";
  } else {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  }
};

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / MILLISECONDS_IN_SECOND);
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);

  if (hours > 0) {
    return `${hours}ч ${minutes % MINUTES_IN_HOUR}м`;
  } else if (minutes > 0) {
    return `${minutes}м ${seconds % SECONDS_IN_MINUTE}с`;
  } else {
    return `${seconds}с`;
  }
};

function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return isSameDay(today, date);
}

export { isSameDay, formatDate, isToday, formatDuration };
