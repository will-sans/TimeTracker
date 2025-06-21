import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserTimeZone, formatDateInTimeZone } from '../utils/dateUtils';
import { TimeEntry } from '../models/TimeEntry';

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<TimeEntry[]>([]);
  const [userTimeZone, setUserTimeZone] = useState<string>('UTC');

  useEffect(() => {
    const loadHistory = async () => {
      const storedHistory = await AsyncStorage.getItem('timeHistory');
      const tz = await getUserTimeZone();
      setUserTimeZone(tz);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory) as TimeEntry[]);
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: TimeEntry }) => (
    <View style={styles.historyItem}>
      <Text>
        {Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')} -{' '}
        {item.category || 'No Category'} - {formatDateInTimeZone(item.date, userTimeZone)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('history')}</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HistoryScreen;