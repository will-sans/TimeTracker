import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimeEntry {
  time: number;
  date: string;
}

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('timeHistory');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error('Failed to load history', e);
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: TimeEntry }) => (
    <View style={styles.historyItem}>
      <Text>
        {Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')} -{' '}
        {new Date(item.date).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracking History</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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