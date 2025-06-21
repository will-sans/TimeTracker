import React, { useState, useEffect, useRef } from 'react';
     import { View, Text, Button, StyleSheet, Alert } from 'react-native';
     import { useTranslation } from 'react-i18next';
     import AsyncStorage from '@react-native-async-storage/async-storage';
     import { getUserTimeZone, toUTC } from '../utils/dateUtils';
     import { TimeEntry } from '../models/TimeEntry';

     const TimerScreen: React.FC = () => {
       const { t } = useTranslation();
       const [isRunning, setIsRunning] = useState(false);
       const [minutes, setMinutes] = useState(0);
       const [seconds, setSeconds] = useState(0);
       const [totalSeconds, setTotalSeconds] = useState(0);
       const [startTime, setStartTime] = useState<Date | null>(null);
       const [userTimeZone, setUserTimeZone] = useState<string>('UTC');
       const idCounter = useRef(0); // 代替ID生成

       useEffect(() => {
         const loadTimeZone = async () => {
           const tz = await getUserTimeZone();
           setUserTimeZone(tz);
         };
         loadTimeZone();
       }, []);

       useEffect(() => {
         let interval: NodeJS.Timeout;
         if (isRunning && startTime) {
           interval = setInterval(() => {
             const now = toUTC(new Date(), userTimeZone);
             const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
             setTotalSeconds(diff);
             setMinutes(Math.floor(diff / 60));
             setSeconds(diff % 60);
             console.log('Timer running:', { minutes, seconds, totalSeconds });
           }, 1000);
         }
         return () => {
           console.log('Cleaning up interval');
           clearInterval(interval);
         };
       }, [isRunning, startTime, userTimeZone]);

       const startTimer = () => {
         setMinutes(0);
         setSeconds(0);
         setTotalSeconds(0);
         setStartTime(toUTC(new Date(), userTimeZone));
         setIsRunning(true);
       };

       const stopTimer = async () => {
         if (!isRunning || !startTime) {
           console.log('Stop attempted but timer not running or no start time');
           return;
         }

         console.log('Stopping timer, startTime:', startTime);
         const endTime = toUTC(new Date(), userTimeZone);
         const entry: TimeEntry = {
           id: `${Date.now()}-${idCounter.current++}`, // 代替ID
           time: totalSeconds,
           category: 'Default',
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
           Alert.alert('成功', '時間が保存されました');
         } catch (error) {
           console.error('Failed to save time entry:', error);
           Alert.alert('エラー', '保存に失敗しました');
         } finally {
           console.log('Finally block executed');
           setIsRunning(false);
           setStartTime(null);
           setMinutes(0);
           setSeconds(0);
           setTotalSeconds(0);
         }
       };

       return (
         <View style={styles.container}>
           <Text style={styles.timer}>
             {t('timer', { minutes: minutes.toString().padStart(2, '0'), seconds: seconds.toString().padStart(2, '0') })}
           </Text>
         <View style={styles.buttonContainer}>
           {!isRunning ? (
             <Button title={t('start')} onPress={startTimer} />
           ) : (
             <Button title={t('pause')} onPress={() => { stopTimer().catch(console.error); }} />
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
       gap: 10,
     },
   });

   export default TimerScreen;