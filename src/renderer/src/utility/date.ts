import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

/**
 * 
 * @param date 
 * @returns YYYY-MM-DD HH:mm:ss
 */
export function getDateFullString(date?: Date | Dayjs): string {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}
