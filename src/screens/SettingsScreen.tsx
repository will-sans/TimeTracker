import React from 'react';
   import { View, Text, Button, StyleSheet, Alert } from 'react-native';
   import { useTranslation } from 'react-i18next';
   import AsyncStorage from '@react-native-async-storage/async-storage';

   const SettingsScreen: React.FC = () => {
     const { t, i18n } = useTranslation();

     const changeLanguage = async (lang: string) => {
       try {
         await i18n.changeLanguage(lang);
         await AsyncStorage.setItem('userLanguage', lang);
         console.log('Language changed to:', lang);
         Alert.alert('成功', `言語を${lang}に変更しました`);
       } catch (err) {
         console.error('Language change failed:', err);
         Alert.alert('エラー', '言語の変更に失敗しました');
       }
     };

     return (
       <View style={styles.container}>
         <Text style={styles.title}>{t('settings')}</Text>
         <Text style={styles.section}>{t('language')}</Text>
         <Button title="English" onPress={() => changeLanguage('en')} />
         <Button title="日本語" onPress={() => changeLanguage('ja')} />
         <Button title="Español" onPress={() => changeLanguage('es')} />
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
   });

   export default SettingsScreen;