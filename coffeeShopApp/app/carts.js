import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../constants/api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice
  } = useCart();

  // ... (previous imports and component code remain the same)

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      Alert.alert('Nama Kosong', 'Silakan masukkan nama Anda');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Create or update user
      console.log('Creating/updating user...');
      const userResponse = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: customerName.trim(),
          email: `${customerName.trim().toLowerCase().replace(/\s+/g, '')}@example.com`
        })
      });

      const userData = await userResponse.json();
      console.log('User response:', userData);

      if (!userResponse.ok || !userData.data?.id) {
        throw new Error(userData.error || 'User ID tidak valid diterima dari server');
      }

      const userId = userData.data.id; // <-- pastikan ambil dari data.id

      // 2. Prepare order data
      const orderData = {
        user_id: userId,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image
        })),
        total_price: getTotalPrice(),
        status: 'pending'
      };

      console.log('Sending order data:', orderData);

      // 3. Create order
      const orderResponse = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();
      console.log('Order response:', orderResult);

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || 'Gagal membuat pesanan');
      }

      // 4. Clear cart
      clearCart();

      // 5. Navigate to orders page
      router.push({
        pathname: '/orders',
        params: { refresh: Date.now() }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat memproses pesanan');
    } finally {
      setSubmitting(false);
    }
  };


  // ... (rest of the component code remains the same)

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image ? `${BASE_URL}/assets/${item.image}` : 'https://via.placeholder.com/100' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          Rp {parseFloat(item.price).toLocaleString('id-ID')}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#6F4E37" />
          </TouchableOpacity>
          <TextInput
            style={styles.quantityInput}
            value={item.quantity.toString()}
            onChangeText={text => {
              const num = parseInt(text) || 1;
              updateQuantity(item.id, num);
            }}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#6F4E37" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <Ionicons name="cart-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyCartText}>Keranjang Anda Kosong</Text>
        <Text style={styles.emptyCartSubtext}>
          Ayo tambahkan beberapa produk favorit Anda
        </Text>
        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => router.push('/products')}
        >
          <Text style={styles.continueShoppingText}>Belanja Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.customerInfo}>
          <Text style={styles.sectionTitle}>Data Pemesan</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama Anda"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.cartList}>
          <Text style={styles.sectionTitle}>Pesanan Anda</Text>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rp {getTotalPrice().toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.continueShoppingButton]}
            onPress={() => router.push('/products')}
          >
            <Text style={[styles.actionButtonText, { color: '#6F4E37' }]}>Lanjut Belanja</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.checkoutButton,
              submitting && styles.disabledButton
            ]}
            onPress={handleCheckout}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>Bayar Sekarang</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  customerInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartList: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    width: 40,
    height: 36,
    textAlign: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueShoppingButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  checkoutButton: {
    backgroundColor: '#6F4E37',
    marginLeft: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    color: '#FFF',
  },
});