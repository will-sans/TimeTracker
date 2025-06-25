import React, { useEffect, useState } from 'react';
   import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
   import { useTranslation } from 'react-i18next';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import * as FileSystem from 'expo-file-system';
   import * as Sharing from 'expo-sharing';
   import { getUserTimeZone, formatDateInTimeZone } from '../utils/dateUtils';
   import { TimeEntry } from '../models/TimeEntry';
   import { usePurchaseStore } from '../store/purchaseStore';
   import { subMonths, startOfMonth, endOfMonth, differenceInDays, addDays } from 'date-fns';

   const HistoryScreen: React.FC = () => {
     const { t } = useTranslation();
     const [history, setHistory] = useState<TimeEntry[]>([]);
     const [userTimeZone, setUserTimeZone] = useState<string>('UTC');
     const isPro = usePurchaseStore((state) => state.isProPurchased);

     useEffect(() => {
       const loadHistory = async () => {
         const storedHistory = await AsyncStorage.getItem('timeHistory');
         const tz = await getUserTimeZone();
         setUserTimeZone(tz);
         if (storedHistory) {
           const data = JSON.parse(storedHistory) as TimeEntry[];
           setHistory(data);
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

     const exportHistory = async () => {
       if (!isPro) {
         Alert.alert(t('pro_only'));
         return;
       }
       const csv = [
         'Date,Time (min),Category',
         ...history.map((entry) =>
           `${formatDateInTimeZone(entry.date, userTimeZone)},${Math.floor(entry.time / 60)},${entry.category || 'No Category'}`
         ),
       ].join('\n');
       const filePath = `${FileSystem.documentDirectory}timetracker_history.csv`;
       await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
       await Sharing.shareAsync(filePath);
       Alert.alert(t('export_csv'));
     };

     const getTotalTimeByCategory = () => {
       const totals = history.reduce((acc, entry) => {
         const key = entry.category || 'No Category';
         acc[key] = (acc[key] || 0) + entry.time;
         return acc;
       }, {} as { [key: string]: number });
       return Object.entries(totals).map(([cat, time]) => ({
         category: cat,
         totalMinutes: Math.floor(time / 60),
         totalSeconds: time,
       }));
     };

     const getMonthlyTrends = () => {
       if (!isPro) return [];
       const now = new Date();
       const start = startOfMonth(subMonths(now, 1)); // 1ヶ月前月初
       const end = endOfMonth(now); // 今月月末
       const trends = [];
       for (let i = 0; i <= differenceInDays(end, start); i++) {
         const date = addDays(start, i);
         const total = history
           .filter((entry) => {
             const entryDate = new Date(entry.date);
             return entryDate >= date && entryDate < addDays(date, 1);
           })
           .reduce((sum, entry) => sum + entry.time, 0);
         trends.push({
           date: formatDateInTimeZone(date.toISOString(), userTimeZone, 'yyyy-MM-dd'),
           totalMinutes: Math.floor(total / 60),
         });
       }
       return trends;
     };

     const getProductivityTrends = () => {
       if (!isPro) return [];
       const now = new Date();
       const start = startOfMonth(subMonths(now, 1));
       const end = endOfMonth(now);
       const categories = [...new Set(history.map((entry) => entry.category || 'No Category'))];
       const trends = categories.map((cat) => {
         const total = history
           .filter((entry) => entry.category === cat && new Date(entry.date) >= start && new Date(entry.date) <= end)
           .reduce((sum, entry) => sum + entry.time, 0);
         return { category: cat, totalMinutes: Math.floor(total / 60) };
       });
       return trends.filter((trend) => trend.totalMinutes > 0);
     };

     return (
       <View style={styles.container}>
         <Text style={styles.title}>{t('history')}</Text>
         <Button title={t('export_csv')} onPress={exportHistory} disabled={!isPro} />
         <Text style={styles.section}>{t('total_time_by_category')}</Text>
         {getTotalTimeByCategory().map((item) => (
           <View key={item.category} style={styles.reportItem}>
             <Text>{item.category}: {item.totalMinutes} min ({Math.floor(item.totalSeconds / 3600)}h {Math.floor((item.totalSeconds % 3600) / 60)}m)</Text>
           </View>
         ))}
         {isPro && (
           <>
             <Text style={styles.section}>{t('monthly_trends')}</Text>
             <FlatList
               data={getMonthlyTrends()}
               renderItem={({ item }) => (
                 <Text style={styles.reportItem}>{item.date}: {item.totalMinutes} min</Text>
               )}
               keyExtractor={(item, index) => index.toString()}
               scrollEnabled={true}
             />
             <Text style={styles.section}>{t('productivity_trends')}</Text>
             {getProductivityTrends().map((trend) => (
               <Text key={trend.category} style={styles.reportItem}>
                 {trend.category}: {trend.totalMinutes} min
               </Text>
             ))}
           </>
         )}
         <FlatList
           data={history}
           renderItem={renderItem}
           keyExtractor={(item) => item.id}
           scrollEnabled={true}
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
     section: {
       fontSize: 18,
       marginTop: 20,
       marginBottom: 10,
     },
     historyItem: {
       padding: 10,
       borderBottomWidth: 1,
       borderBottomColor: '#ccc',
     },
     reportItem: {
       padding: 5,
       borderBottomWidth: 1,
       borderBottomColor: '#eee',
     },
   });

   export default HistoryScreen;