export interface TimeEntry {
     id: string;
     time: number; // 秒単位
     category: string | null;
     date: string; // ISO 8601形式
     timeZone: string;
   }