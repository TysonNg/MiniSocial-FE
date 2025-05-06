'use client'
import dayjs from "dayjs";


export const formatTime = (timeStr: string) => {
    const now = dayjs();
    const time = dayjs(timeStr);
    
    const diffInMinutes = now.diff(time, "minute");
    const diffInHours = now.diff(time, "hour");

    if (diffInMinutes < 1) return "recent";
    if (diffInMinutes < 60) return `${diffInMinutes} m `;
    if (diffInHours > 24) return `${Math.floor(diffInHours / 24)} d`;

    return `${diffInHours} h`;
  };

export const formatTimeToMinuteAndHour = (time: Date|string) => {
  const d = dayjs(time);
  return d.format("HH:mm")
}
