import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('userLanguage', lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings')}</Text>
      <Button title="English" onPress={() => changeLanguage('en')} />
      <Button title="日本語" onPress={() => changeLanguage('ja')} />
      <Button title="Español" onPress={() => changeLanguage('es')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default SettingsScreen;