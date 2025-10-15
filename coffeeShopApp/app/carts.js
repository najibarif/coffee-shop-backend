import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, StyleSheet, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../constants/api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
    }

    setSubmitting(true);
    try {
      const payload = {
        total_price: (getTotalPrice() * 1.1).toString() // Include 10% tax and convert to string
      };

      const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const resData = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(resData.error || 'Gagal membuat pesanan');
      }

      clearCart();
      Alert.alert('Pesanan Berhasil', 'Terima kasih atas pesanannya!', [
        { text: 'Lihat Pesanan', onPress: () => router.push('/orders') }
      ]);

    } catch (err) {
      console.error('Checkout error:', err);
      Alert.alert('Terjadi Kesalahan', err.message || 'Silakan coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        <Image
          source={{ uri: item.image ? `${BASE_URL}/assets/${item.image}` : 'https://via.placeholder.com/80' }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        <Text style={styles.itemPrice}>Rp {Number(item.price).toLocaleString('id-ID')}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} 
            style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
            disabled={item.quantity <= 1}
          >
            <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#CCCCCC" : "#6F4E37"} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, item.quantity + 1)} 
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={16} color="#6F4E37" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          Rp {(item.quantity * Number(item.price)).toLocaleString('id-ID')}
        </Text>
        <TouchableOpacity 
          onPress={() => removeFromCart(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <Ionicons name="cart-outline" size={100} color="#E0E0E0" />
        <Text style={styles.emptyText}>Keranjang Kamu Kosong</Text>
        <Text style={styles.emptySubtext}>Ayo tambahkan beberapa produk favoritmu!</Text>
        <TouchableOpacity 
          onPress={() => router.push('/products')} 
          style={styles.shopButton}
        >
          <Text style={styles.shopButtonText}>Jelajahi Produk</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keranjang Belanja</Text>
          <Text style={styles.itemCount}>{cart.length} {cart.length > 1 ? 'items' : 'item'}</Text>
        </View>

        <FlatList
          data={cart}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.cartList}
        />

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Harga</Text>
            <Text style={styles.summaryValue}>Rp {getTotalPrice().toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pajak (10%)</Text>
            <Text style={styles.summaryValue}>Rp {(getTotalPrice() * 0.1).toLocaleString('id-ID')}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Bayar</Text>
            <Text style={styles.totalValue}>Rp {(getTotalPrice() * 1.1).toLocaleString('id-ID')}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>Rp {(getTotalPrice() * 1.1).toLocaleString('id-ID')}</Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          style={[styles.checkoutButton, submitting && styles.checkoutButtonDisabled]}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>Checkout Sekarang</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  itemCount: {
    color: '#6C757D',
    fontSize: 14,
  },
  cartList: {
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6F4E37',
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontWeight: '600',
    color: '#2D3436',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  itemTotal: {
    fontWeight: 'bold',
    color: '#2D3436',
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#6C757D',
    fontSize: 14,
  },
  summaryValue: {
    color: '#2D3436',
    fontWeight: '500',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2D3436',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#6F4E37',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  priceContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  checkoutButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 16,
    minWidth: 160,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#A68A72',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  shopButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});