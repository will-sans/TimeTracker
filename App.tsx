import React, { Suspense, useEffect, useState } from 'react';
   import { Text } from 'react-native';
   import './src/i18n'; // Initialize i18next
   import AppNavigator from './src/navigation/AppNavigator';
   import i18n from './src/i18n';

   export default function App() {
     const [isI18nReady, setIsI18nReady] = useState(false);

     useEffect(() => {
       const checkInitialization = async () => {
         if (!i18n.isInitialized) {
           await i18n.init(); // 手動初期化を強制
           console.log('i18next initialized manually:', i18n.language);
         }
         setIsI18nReady(true);
       };
       checkInitialization().catch((err) => console.error('Initialization error:', err));
     }, []);

     if (!isI18nReady) {
       return <Text>Loading...</Text>;
     }

     return (
       <Suspense fallback={<Text>Loading translations...</Text>}>
         <AppNavigator />
       </Suspense>
     );
   }