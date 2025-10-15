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
  switch((status || '').toLowerCase()) {
    case 'completed': return '#4CAF50';
    case 'processing': return '#2196F3';
    case 'cancelled': return '#F44336';
    default: return '#9E9E9E'; // pending
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/orders`);
      if (!res.ok) throw new Error('Gagal memuat data pesanan');
      const data = await res.json();

      const processedOrders = data.map(order => ({
        ...order,
        status: (order.status || 'pending').toLowerCase(),
        status_color: getStatusColor(order.status),
      }));

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
      ? item.items.reduce((sum, product) => sum + (parseInt(product.quantity) || 0), 0)
      : 0;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status_color + '20' }]}>
            <Text style={[styles.statusText, { color: item.status_color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Text style={styles.customerText}>User: {item.customer_name || 'User #' + (item.user_id || '-')}</Text>
          <Text style={styles.infoValue}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Detail Pesanan ({item.items?.length || 0} menu)</Text>
          {item.items?.map((product, index) => (
            <View key={`${item.id}-${product.id || index}`} style={styles.orderItem}>
              <Image 
                source={{ uri: product.product_image 
                  ? `${BASE_URL}/assets/${product.product_image}` 
                  : 'https://via.placeholder.com/60' 
                }} 
                style={styles.productImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.productName}>{product.product_name || 'Produk'}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.quantity}>x{product.quantity || 1}</Text>
                  <Text style={styles.price}>
                    Rp {product.price ? parseFloat(product.price).toLocaleString('id-ID') : '0'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.totalText}>Total Pembayaran:</Text>
            <Text style={styles.totalPrice}>
              Rp {item.total_price ? parseFloat(item.total_price).toLocaleString('id-ID') : '0'}
            </Text>
          </View>
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
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 12, paddingBottom: 80 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#2D2D2D' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  customerSection: { marginBottom: 12 },
  customerText: { fontSize: 14, color: '#444', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#6F4E37', fontWeight: '500' },
  sectionContainer: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#6F4E37', marginBottom: 8 },
  orderItem: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  productName: { fontSize: 14, color: '#333', marginBottom: 4 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantity: { fontSize: 14, color: '#666' },
  price: { fontSize: 14, fontWeight: '600', color: '#6F4E37' },
  orderFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 16, fontWeight: '600', color: '#444' },
  totalPrice: { fontSize: 18, fontWeight: '700', color: '#6F4E37' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#999', textAlign: 'center' },
});
