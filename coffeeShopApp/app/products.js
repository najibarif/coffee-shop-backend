import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard';
import { BASE_URL } from '../constants/api';
import { useRouter } from 'expo-router';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#6f4e37" />
    </View>
  );

  if (!products || products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Tidak ada produk.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/ProductDetail?id=${item.id}`)}
          />
        )}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
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
    marginTop: 20,
  },
});
