import React from 'react';
   import { View, Text, Button, StyleSheet } from 'react-native';
   import { NativeStackNavigationProp } from '@react-navigation/native-stack';
   import { useTranslation } from 'react-i18next';

   type RootStackParamList = {
     Home: undefined;
     Timer: undefined;
     History: undefined;
     Settings: undefined;
   };

   type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

   interface Props {
     navigation: HomeScreenNavigationProp;
   }

   const HomeScreen: React.FC<Props> = ({ navigation }) => {
     const { t } = useTranslation();

     return (
       <View style={styles.container}>
         <Text style={styles.title}>{t('welcome')}</Text>
         <Button title={t('start_tracking')} onPress={() => navigation.navigate('Timer')} />
         <Button title={t('view_history')} onPress={() => navigation.navigate('History')} />
         <Button title={t('settings')} onPress={() => navigation.navigate('Settings')} />
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

   export default HomeScreen;