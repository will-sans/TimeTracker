import AsyncStorage from '@react-native-async-storage/async-storage';
   import { create } from 'zustand';

   interface PurchaseState {
     isProPurchased: boolean;
     setProPurchased: (purchased: boolean) => void;
   }

   export const usePurchaseStore = create<PurchaseState>((set) => ({
     isProPurchased: false,
     setProPurchased: async (purchased) => {
       await AsyncStorage.setItem('isProPurchased', purchased.toString());
       set({ isProPurchased: purchased });
     },
   }));

   // 初期化時に購入状態を復元
   AsyncStorage.getItem('isProPurchased').then((value) => {
     if (value === 'true') {
       usePurchaseStore.getState().setProPurchased(true);
     }
   });