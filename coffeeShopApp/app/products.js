import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, RefreshControl } from 'react-native';
import ProductCard from '../components/ProductCard';
import { BASE_URL } from '../constants/api';

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts().then(() => wait(1000));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6f4e37" />
      </View>
    );
  }

  if (!products || products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Tidak ada produk tersedia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6f4e37']}
            tintColor="#6f4e37"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#6f4e37',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});
