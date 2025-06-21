import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz'; // Corrected import for fromZonedTime
import AsyncStorage from '@react-native-async-storage/async-storage';

// デフォルトタイムゾーン（デバイス設定から取得、フォールバックはUTC）
const getDefaultTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

// ユーザーのタイムゾーンを取得または保存
export const getUserTimeZone = async () => {
  const storedTimeZone = await AsyncStorage.getItem('userTimeZone');
  return storedTimeZone || getDefaultTimeZone();
};

export const setUserTimeZone = async (timeZone: string) => {
  await AsyncStorage.setItem('userTimeZone', timeZone);
};

// 日時をユーザーのタイムゾーンでフォーマット
export const formatDateInTimeZone = (date: string, timeZone: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss') => {
  const parsedDate = parseISO(date);
  // Corrected: Use toZonedTime instead of utcToZonedTime
  const zonedDate = toZonedTime(parsedDate, timeZone);
  return format(zonedDate, formatStr);
};

// UTCで保存するための日時変換
export const toUTC = (date: Date, timeZone: string) => {
  // Corrected: Use fromZonedTime instead of zonedTimeToUtc
  // fromZonedTime takes a Date (or string) and the timezone it represents, then returns a UTC Date.
  return fromZonedTime(date, timeZone);
};