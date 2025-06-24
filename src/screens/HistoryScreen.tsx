import React, { useEffect, useState } from 'react';
    import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
    import { useTranslation } from 'react-i18next';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import * as FileSystem from 'expo-file-system'; // 追加
    import * as Sharing from 'expo-sharing'; // 追加
    import { getUserTimeZone, formatDateInTimeZone } from '../utils/dateUtils';
    import { TimeEntry } from '../models/TimeEntry';
    import { usePurchaseStore } from '../store/purchaseStore';

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
            let data = JSON.parse(storedHistory) as TimeEntry[];
            if (!isPro) {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              data = data.filter((entry) => new Date(entry.date) >= sevenDaysAgo);
            }
            setHistory(data);
          }
        };
        loadHistory();
      }, [isPro]);

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

        const filePath = `${FileSystem.documentDirectory}timetracker_history.csv`; // 変更: FileSystem.documentDirectory を使用
        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 }); // 変更: writeAsStringAsync を使用
        await Sharing.shareAsync(filePath); // 変更: Sharing.shareAsync を使用
        console.log('Exporting history:', csv);
        console.log('File path:', filePath);
        Alert.alert(t('export_csv'));
      };
    
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{t('history')}</Text>
          <Button title={t('export_csv')} onPress={exportHistory} disabled={!isPro} />
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