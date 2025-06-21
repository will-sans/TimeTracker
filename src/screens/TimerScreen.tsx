import React, { useState, useEffect } from 'react';
   import { View, Text, Button, StyleSheet } from 'react-native';
   import { useTranslation } from 'react-i18next';

   const TimerScreen: React.FC = () => {
     const { t } = useTranslation();
     const [isRunning, setIsRunning] = useState(false);
     const [minutes, setMinutes] = useState(0);
     const [seconds, setSeconds] = useState(0);

     useEffect(() => {
       let interval: NodeJS.Timeout;
       if (isRunning) {
         interval = setInterval(() => {
           setSeconds((prev) => (prev + 1) % 60);
           setMinutes((prev) => prev + Math.floor((prev * 60 + seconds + 1) / 60));
         }, 1000);
       }
       return () => clearInterval(interval);
     }, [isRunning, seconds]);

     const startTimer = () => setIsRunning(true);
     const stopTimer = () => setIsRunning(false);

     return (
       <View style={styles.container}>
         <Text style={styles.timer}>{t('timer', { minutes: minutes.toString().padStart(2, '0'), seconds: seconds.toString().padStart(2, '0') })}</Text>
         <View style={styles.buttonContainer}>
           {!isRunning ? (
             <Button title={t('start')} onPress={startTimer} />
           ) : (
             <Button title={t('pause')} onPress={stopTimer} />
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