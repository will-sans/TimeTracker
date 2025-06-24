import React, { useState, useEffect, useRef } from 'react';
   import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
   import { Picker } from '@react-native-picker/picker';
   import { useTranslation } from 'react-i18next';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { FontAwesome5 } from '@expo/vector-icons';
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
     const [category, setCategory] = useState('Default');
     const [categories, setCategories] = useState<string[]>(['Default', 'Work', 'Study']);
     const [newCategory, setNewCategory] = useState('');
     const idCounter = useRef(0);
     const intervalRef = useRef<NodeJS.Timeout | null>(null);

     useEffect(() => {
       const loadTimeZoneAndCategories = async () => {
         const tz = await getUserTimeZone();
         setUserTimeZone(tz);
         const storedCategories = await AsyncStorage.getItem('categories');
         if (storedCategories) {
           setCategories(JSON.parse(storedCategories));
         }
       };
       loadTimeZoneAndCategories();
     }, []);

     useEffect(() => {
       if (isRunning) {
         if (!intervalRef.current) {
           intervalRef.current = setInterval(() => {
             setTotalSeconds(prevTotalSeconds => prevTotalSeconds + 1);
           }, 1000);
         }
       } else {
         if (intervalRef.current) {
           clearInterval(intervalRef.current);
           intervalRef.current = null;
         }
       }
       return () => {
         if (intervalRef.current) {
           clearInterval(intervalRef.current);
           intervalRef.current = null;
         }
       };
     }, [isRunning]);

     useEffect(() => {
       setMinutes(Math.floor(totalSeconds / 60));
       setSeconds(totalSeconds % 60);
     }, [totalSeconds]);

     const startTimer = () => {
       setMinutes(0);
       setSeconds(0);
       setTotalSeconds(0);
       setStartTime(toUTC(new Date(), userTimeZone));
       setIsRunning(true);
     };

     const pauseTimer = () => {
       setIsRunning(false);
     };

     const resumeTimer = () => {
       if (startTime) {
         setIsRunning(true);
       }
     };

     const stopTimer = async () => {
       if (!startTime) {
         console.log('Stop attempted but no start time');
         return;
       }

       console.log('Stopping timer, startTime:', startTime);
       const endTime = toUTC(new Date(), userTimeZone);
       const entry: TimeEntry = {
         id: `${Date.now()}-${idCounter.current++}`,
         time: totalSeconds,
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
         setStartTime(null);
         setMinutes(0);
         setSeconds(0);
         setTotalSeconds(0);
       }
     };

     const addCategory = async () => {
       if (newCategory && !categories.includes(newCategory)) {
         const updatedCategories = [...categories, newCategory];
         setCategories(updatedCategories);
         await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
         setNewCategory('');
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
             {categories.map((cat) => (
               <Picker.Item key={cat} label={cat} value={cat} />
             ))}
           </Picker>
           <TextInput
             style={styles.input}
             value={newCategory}
             onChangeText={setNewCategory}
             placeholder={t('new_category')}
             onSubmitEditing={addCategory}
           />
           <TouchableOpacity
             style={styles.addButton}
             onPress={addCategory}
             activeOpacity={0.7}
           >
             <FontAwesome5 name="plus" size={16} color="white" />
             <Text style={styles.addButtonText}>{t('add_category')}</Text>
           </TouchableOpacity>
           {!isRunning && !startTime ? (
             <TouchableOpacity
               style={styles.customButton}
               onPress={startTimer}
               activeOpacity={0.7}
             >
               <FontAwesome5 name="play" size={16} color="white" />
               <Text style={styles.buttonText}>{t('start')}</Text>
             </TouchableOpacity>
           ) : !isRunning && startTime ? (
             <>
               <TouchableOpacity
                 style={styles.customButton}
                 onPress={resumeTimer}
                 activeOpacity={0.7}
               >
                 <FontAwesome5 name="play" size={16} color="white" />
                 <Text style={styles.buttonText}>{t('resume')}</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={styles.customButton}
                 onPress={() => { stopTimer().catch(console.error); }}
                 activeOpacity={0.7}
               >
                 <FontAwesome5 name="save" size={16} color="white" />
                 <Text style={styles.buttonText}>{t('save')}</Text>
               </TouchableOpacity>
             </>
           ) : (
             <>
               <TouchableOpacity
                 style={styles.customButton}
                 onPress={pauseTimer}
                 activeOpacity={0.7}
               >
                 <FontAwesome5 name="pause" size={16} color="white" />
                 <Text style={styles.buttonText}>{t('pause')}</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={styles.customButton}
                 onPress={() => { stopTimer().catch(console.error); }}
                 activeOpacity={0.7}
               >
                 <FontAwesome5 name="save" size={16} color="white" />
                 <Text style={styles.buttonText}>{t('save')}</Text>
               </TouchableOpacity>
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
       flexWrap: 'wrap',
       justifyContent: 'space-around',
       padding: 10,
     },
     picker: {
       height: 50,
       width: 150,
     },
     input: {
       height: 40,
       borderColor: 'gray',
       borderWidth: 1,
       borderRadius: 4,
       padding: 5,
       width: 150,
       marginRight: 10,
     },
     addButton: {
       backgroundColor: '#28a745',
       padding: 5,
       borderRadius: 4,
       flexDirection: 'row',
       alignItems: 'center',
     },
     addButtonText: {
       color: 'white',
       marginLeft: 5,
     },
     customButton: {
       backgroundColor: '#007bff',
       padding: 5,
       borderRadius: 4,
       flexDirection: 'row',
       alignItems: 'center',
     },
     buttonText: {
       color: 'white',
       marginLeft: 5,
     },
   });

   export default TimerScreen;