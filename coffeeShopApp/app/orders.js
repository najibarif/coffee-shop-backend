import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { BASE_URL } from '../constants/api';
import { Ionicons } from '@expo/vector-icons';

const getStatusColor = (status) => {
  if (!status) return '#9E9E9E';
  switch (status.toLowerCase()) {
    case 'completed': return '#4CAF50';
    case 'processing': return '#2196F3';
    case 'cancelled': return '#F44336';
    default: return '#9E9E9E';
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${BASE_URL}/orders`);
      if (!response.ok) throw new Error('Gagal memuat data pesanan');
      const result = await response.json();

      // Handle both { data: [...] } and direct array responses
      const ordersData = Array.isArray(result) ? result : (result.data || []);

      if (!Array.isArray(ordersData)) {
        throw new Error('Format data pesanan tidak valid');
      }

      const processedOrders = ordersData.map(order => {
        const status = (order.status || 'pending').toLowerCase();
        return {
          id: order.id?.toString() || order.order_id?.toString() || Math.random().toString(),
          status: status,
          status_color: getStatusColor(status),
          total_price: parseFloat(order.total_price || 0),
          created_at: order.created_at || new Date().toISOString(),
          items: Array.isArray(order.items) ? order.items.map(item => ({
            id: item.id?.toString() || item.product_id?.toString() || Math.random().toString(),
            product_id: item.product_id,
            product_name: item.product_name || item.name || 'Produk',
            product_image: item.product_image || item.image || null,
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1, 10)
          })) : [],
          customer_name: order.customer_name || 'Pelanggan',
          user_id: order.user_id
        };
      });

      // Sort by creation date (newest first)
      const sortedOrders = [...processedOrders].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrderItem = ({ item }) => {
    const totalItems = Array.isArray(item.items)
      ? item.items.reduce((sum, product) => sum + (parseInt(product.quantity, 10) || 0), 0)
      : 0;

    // Format date
    const orderDate = new Date(item.created_at);
    const formattedDate = orderDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalText}>Total Pembayaran:</Text>
          <Text style={styles.totalPrice}>
            Rp {item.total_price ? item.total_price.toLocaleString('id-ID') : '0'}
          </Text>
        </View>

      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchOrders}
            colors={['#6F4E37']}
            tintColor="#6F4E37"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>Belum ada pesanan</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F4E37',
  },
  orderFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6F4E37',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  noItemsText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
});
