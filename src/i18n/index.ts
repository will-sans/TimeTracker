import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import en from './locales/en.json';
   import ja from './locales/ja.json';
   import es from './locales/es.json';

   const resources = {
     en: { translation: en },
     ja: { translation: ja },
     es: { translation: es },
   };

   (async () => {
     await i18n
       .use(initReactI18next)
       .init({
         resources,
         lng: 'ja', // デフォルト言語を強制
         fallbackLng: 'en',
         interpolation: {
           escapeValue: false,
         },
       });
     console.log('i18next initialized with language:', i18n.language);

     // AsyncStorageから言語を読み込み、デフォルトを上書き
     const storedLang = await AsyncStorage.getItem('userLanguage');
     if (storedLang) {
       await i18n.changeLanguage(storedLang);
       console.log('Loaded stored language:', storedLang);
     } else {
       console.log('No stored language, using default:', i18n.language);
       await AsyncStorage.setItem('userLanguage', 'ja'); // デフォルトをjaにリセット
     }
   })();

   i18n.on('languageChanged', (lng) => {
     console.log('Language changed to:', lng);
   });

   export default i18n;