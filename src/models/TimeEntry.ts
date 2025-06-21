export interface TimeEntry {
  id: string;
  time: number; // 秒単位
  category: string;
  date: string; // ISO 8601形式（UTC）
  timeZone: string; // 記録時のタイムゾーン
}