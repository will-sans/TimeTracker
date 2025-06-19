import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimerScreen: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
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
      const history = await AsyncStorage.getItem('timeHistory');
      const newEntry = { time, date: new Date().toISOString() };
      const updatedHistory = history ? [...JSON.parse(history), newEntry] : [newEntry];
      await AsyncStorage.setItem('timeHistory', JSON.stringify(updatedHistory));
      setTime(0);
      setIsRunning(false);
    } catch (e) {
      console.error('Failed to save time', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</Text>
      <Button title={isRunning ? 'Pause' : 'Start'} onPress={() => setIsRunning(!isRunning)} />
      <Button title="Save" onPress={saveTime} disabled={time === 0} />
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