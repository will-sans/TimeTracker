import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { toUTC, getUserTimeZone } from '../utils/dateUtils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const TimerScreen: React.FC = () => {
  const { t } = useTranslation();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPro, setIsPro] = useState(false); // 買い切り版チェック（仮）

  useEffect(() => {
    // 買い切り版の購入状態を確認（仮実装）
    AsyncStorage.getItem('isProPurchased').then((value) => {
      setIsPro(value === 'true');
    });

    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const saveTime = async () => {
    try {
      const timeZone = await getUserTimeZone();
      const now = new Date();
      const utcDate = toUTC(now, timeZone).toISOString();
      const newEntry = {
        id: uuidv4(),
        time,
        category: isPro ? 'Default' : null,
        date: utcDate,
        timeZone,
      };
      const history = await AsyncStorage.getItem('timeHistory');
      const updatedHistory = history ? [...JSON.parse(history), newEntry] : [newEntry];
      await AsyncStorage.setItem('timeHistory', JSON.stringify(updatedHistory));
      setTime(0);
      setIsRunning(false);
    } catch (e) {
      console.error('Failed to save time', e);
      Alert.alert(t('error'), t('save_failed'));
    }
  };

  const exportToCSV = async () => {
    if (!isPro) {
      Alert.alert(t('pro_only'), t('upgrade_pro'));
      return;
    }

    try {
      const history = await AsyncStorage.getItem('timeHistory');
      if (!history) {
        Alert.alert(t('no_data'), t('no_history'));
        return;
      }

      const data = JSON.parse(history);
      const csvContent = [
        'ID,Time (seconds),Category,Date,TimeZone',
        ...data.map((entry: any) =>
          `${entry.id},${entry.time},${entry.category || ''},${entry.date},${entry.timeZone}`
        ),
      ].join('\n');

      const fileUri = `${FileSystem.documentDirectory}time_tracker_export.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: t('share_csv') });
    } catch (e) {
      console.error('Failed to export CSV', e);
      Alert.alert(t('error'), t('export_failed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</Text>
      <Button title={isRunning ? t('pause') : t('start')} onPress={() => setIsRunning(!isRunning)} />
      <Button title={t('save')} onPress={saveTime} disabled={time === 0} />
      {isPro && <Button title={t('export_csv')} onPress={exportToCSV} />}
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
});

export default TimerScreen;