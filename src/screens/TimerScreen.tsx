import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserTimeZone, toUTC } from '../utils/dateUtils';
import { TimeEntry } from '../models/TimeEntry';

const TimerScreen: React.FC = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0); // 直接この値を更新するように変更
  const [startTime, setStartTime] = useState<Date | null>(null); // 開始時間は参照用として保持
  const [userTimeZone, setUserTimeZone] = useState<string>('UTC');
  const [category, setCategory] = useState('Default');
  const idCounter = useRef(0);

  // useRefを使ってinterval IDを保持
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadTimeZone = async () => {
      const tz = await getUserTimeZone();
      setUserTimeZone(tz);
    };
    loadTimeZone();
  }, []);

  useEffect(() => {
    if (isRunning) {
      // intervalRef.current がすでに設定されている場合はクリアしない（多重起動防止）
      if (intervalRef.current) return;

      intervalRef.current = setInterval(() => {
        setTotalSeconds(prevTotalSeconds => prevTotalSeconds + 1); // 1秒ごとにtotalSecondsをインクリメント
      }, 1000);
    } else {
      // isRunning が false になったら interval をクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // クリーンアップ関数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]); // 依存配列から startTime を削除し、isRunning のみで制御

  // totalSeconds の変更を minutes と seconds に反映する useEffect を追加
  useEffect(() => {
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
  }, [totalSeconds]);

  const startTimer = () => {
    setMinutes(0);
    setSeconds(0);
    setTotalSeconds(0); // タイマー開始時にリセット
    setStartTime(toUTC(new Date(), userTimeZone)); // 初回開始時間のみ記録
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    // startTime が null の場合は再開できない (まだ開始されていないか、完全に停止されている場合)
    if (startTime) {
      setIsRunning(true);
    }
  };

  const stopTimer = async () => {
    // startTime が null の場合は何もしない
    if (!startTime) {
      console.log('Stop attempted but no start time');
      return;
    }

    console.log('Stopping timer, startTime:', startTime);
    const endTime = toUTC(new Date(), userTimeZone);
    const entry: TimeEntry = {
      id: `${Date.now()}-${idCounter.current++}`,
      time: totalSeconds, // 最終的な totalSeconds を保存
      category,
      date: endTime.toISOString(),
      timeZone: userTimeZone,
    };

    try {
      console.log('Saving time entry:', entry);
      const storedHistory = await AsyncStorage.getItem('timeHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.push(entry);
      await AsyncStorage.setItem('timeHistory', JSON.stringify(history));
      console.log('Time entry saved:', entry);
      Alert.alert('成功', getSaveMessage(totalSeconds));
    } catch (error) {
      console.error('Failed to save time entry:', error);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      console.log('Finally block executed');
      setIsRunning(false);
      setStartTime(null); // タイマーを完全に停止した場合は startTime をリセット
      setMinutes(0);
      setSeconds(0);
      setTotalSeconds(0); // タイマーを完全に停止した場合は totalSeconds をリセット
    }
  };

  const getSaveMessage = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 1) return `保存完了: ${hours}時間${minutes}分計測`;
    if (hours === 1) return `保存完了: 1時間${minutes}分計測`;
    if (minutes > 1) return `保存完了: ${minutes}分計測`;
    return '保存完了: 短時間計測';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        {t('timer', { minutes: minutes.toString().padStart(2, '0'), seconds: seconds.toString().padStart(2, '0') })}
      </Text>
      <View style={styles.buttonContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue: string) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Default" value="Default" />
          <Picker.Item label="Work" value="Work" />
          <Picker.Item label="Study" value="Study" />
        </Picker>

        {!isRunning && !startTime ? ( // タイマーが停止している初期状態
          <Button title={t('start')} onPress={startTimer} />
        ) : !isRunning && startTime ? ( // タイマーが一時停止している状態
          <>
            <Button title={t('resume')} onPress={resumeTimer} />
            <Button title={t('save')} onPress={() => { stopTimer().catch(console.error); }} />
          </>
        ) : ( // タイマーが実行中の状態
          <>
            <Button title={t('pause')} onPress={pauseTimer} />
            <Button title={t('save')} onPress={() => { stopTimer().catch(console.error); }} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
});

export default TimerScreen;