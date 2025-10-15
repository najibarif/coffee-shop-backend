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
    default: return '#9E9E9E';
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch(`${BASE_URL}/users`),
        fetch(`${BASE_URL}/orders`)
      ]);

      if (!usersRes.ok) throw new Error('Gagal memuat data pengguna');
      if (!ordersRes.ok) throw new Error('Gagal memuat data pesanan');

      const [usersData, ordersData] = await Promise.all([
        usersRes.json(),
        ordersRes.json()
      ]);

      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      const processedOrders = ordersData.map(order => {
        const user = usersMap[order.user_id] || {};
        const orderDate = order.created_at ? new Date(order.created_at) : new Date();
        
        const formattedDate = orderDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        let orderItems = [];
        try {
          orderItems = Array.isArray(order.items) 
            ? order.items 
            : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
        } catch (e) {
          console.error('Error parsing order items:', e);
          orderItems = [];
        }

        return {
          ...order,
          items: orderItems,
          customer_name: user.name || 'Pelanggan',
          customer_email: user.email || 'tidak ada email',
          formatted_date: formattedDate,
          status: (order.status || 'pending').toLowerCase(),
          status_color: getStatusColor(order.status)
        };
      });

      const sortedOrders = [...processedOrders].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );

      setUsers(usersMap);
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
    fetchAllData();
  }, []);

  const renderOrderItem = ({ item }) => {
    const totalItems = Array.isArray(item.items) 
      ? item.items.reduce((sum, product) => sum + (parseInt(product.quantity) || 0), 0)
      : 0;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{item.formatted_date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status_color + '20' }]}>
            <Text style={[styles.statusText, { color: item.status_color }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <Ionicons name="person" size={16} color="#6F4E37" />
            <Text style={styles.customerName}>{item.customer_name}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Ionicons name="mail" size={14} color="#6F4E37" />
            <Text style={styles.customerEmail}>{item.customer_email}</Text>
          </View>
          <Text style={styles.infoValue}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cafe-outline" size={20} color="#6F4E37" />
            <Text style={styles.sectionTitle}>Detail Pesanan ({item.items?.length || 0} menu)</Text>
          </View>
          
          {item.items?.map((product, index) => (
            <View key={`${item.id}-${product.id || index}`} style={styles.orderItem}>
              <Image 
                source={{ 
                  uri: product.image?.startsWith('http') 
                    ? product.image 
                    : (product.image ? `${BASE_URL}${product.image}` : 'https://via.placeholder.com/60')
                }} 
                style={styles.productImage}
                defaultSource={{ uri: 'https://via.placeholder.com/60' }}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name || 'Produk'}
                </Text>
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
            onRefresh={fetchAllData}
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
    alignItems: 'center', 
    backgroundColor: '#FFF' 
  },
  listContainer: { 
    padding: 12, 
    paddingBottom: 80 
  },
  orderCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 3, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  orderId: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2D2D2D', 
    marginBottom: 4 
  },
  orderDate: { 
    fontSize: 12, 
    color: '#888' 
  },
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginLeft: 10 
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerSection: {
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  customerEmail: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#6F4E37',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37',
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
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
    marginTop: 16,
    paddingTop: 16,
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
});