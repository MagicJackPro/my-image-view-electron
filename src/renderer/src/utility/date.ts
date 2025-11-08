import dayjs from "dayjs";

export function getDateFullString(): string {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}