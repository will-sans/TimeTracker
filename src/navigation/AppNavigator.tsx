import React from 'react';
     import { NavigationContainer } from '@react-navigation/native';
     import { createNativeStackNavigator } from '@react-navigation/native-stack';
     import HomeScreen from '../screens/HomeScreen';
     import TimerScreen from '../screens/TimerScreen';
     import HistoryScreen from '../screens/HistoryScreen';
     import SettingsScreen from '../screens/SettingsScreen';

     const Stack = createNativeStackNavigator();

     export default function AppNavigator() {
       return (
         <NavigationContainer>
           <Stack.Navigator initialRouteName="Home">
             <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TimeTracker' }} />
             <Stack.Screen name="Timer" component={TimerScreen} options={{ title: 'Track Time' }} />
             <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
             <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
           </Stack.Navigator>
         </NavigationContainer>
       );
     }