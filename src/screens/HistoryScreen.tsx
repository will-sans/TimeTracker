import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import { useTranslation } from 'react-i18next';

   const HistoryScreen: React.FC = () => {
     const { t } = useTranslation();

     return (
       <View style={styles.container}>
         <Text style={styles.title}>{t('history')}</Text>
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

   export default HistoryScreen;