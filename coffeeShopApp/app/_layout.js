import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function Layout() {
  return (
    <CartProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#6f4e37' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Beranda',
            headerShown: false // Menyembunyikan header di halaman beranda
          }}
        />
        <Stack.Screen
          name="products"
          options={{
            title: 'Produk',
          }}
        />
        <Stack.Screen
          name="products/[id]"
          options={{
            title: 'Detail Produk',
          }}
        />
        <Stack.Screen
          name="carts"
          options={{
            title: 'Keranjang',
          }}
        />
        <Stack.Screen
          name="orders"
          options={{
            title: 'Pesanan Saya',
          }}
        />
      </Stack>
    </CartProvider>
  );
}