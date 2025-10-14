import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerStyle: { backgroundColor: '#6f4e37' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          title: 'Produk',
          headerStyle: { backgroundColor: '#6f4e37' },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}


