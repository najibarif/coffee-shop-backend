import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../HomeScreen';
import Products from '../products';
import Orders from '../orders';
import Carts from '../carts';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Products" component={Products} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="Carts" component={Carts} />
    </Stack.Navigator>
  );
}
