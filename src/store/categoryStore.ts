import AsyncStorage from '@react-native-async-storage/async-storage';
     import { create } from 'zustand';
     import { v4 as uuidv4 } from 'uuid';
     import { Category } from '../models/Category';

     interface CategoryState {
       categories: Category[];
       addCategory: (name: string, icon: string) => void;
       removeCategory: (id: string) => void;
     }

     export const useCategoryStore = create<CategoryState>((set) => ({
       categories: [
         { id: uuidv4(), name: 'Work', icon: 'briefcase' },
         { id: uuidv4(), name: 'Study', icon: 'book' },
         { id: uuidv4(), name: 'Personal', icon: 'user' },
       ],
       addCategory: async (name, icon) => {
         const newCategory = { id: uuidv4(), name, icon };
         set((state) => {
           const newCategories = [...state.categories, newCategory];
           AsyncStorage.setItem('categories', JSON.stringify(newCategories));
           return { categories: newCategories };
         });
       },
       removeCategory: async (id) => {
         set((state) => {
           const newCategories = state.categories.filter((cat) => cat.id !== id);
           AsyncStorage.setItem('categories', JSON.stringify(newCategories));
           return { categories: newCategories };
         });
       },
     }));

     // 初期化時にカテゴリを復元
     AsyncStorage.getItem('categories').then((value) => {
       if (value) {
         useCategoryStore.setState({ categories: JSON.parse(value) });
       }
     });