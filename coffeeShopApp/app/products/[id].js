import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../../constants/api';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchProduct = async () => {
    if (!id) {
      setError('Product ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}/products/${id}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Received empty response from server');
      }
      
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
      });
      setError(`Gagal memuat data produk: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          total_price: parseFloat(product.price)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menambahkan ke keranjang');
      }
      
      Alert.alert('Berhasil', 'Produk ditambahkan ke keranjang');
      router.push('/cart');
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Error', err.message || 'Terjadi kesalahan');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6f4e37" />
        <Text>Memuat produk...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchProduct}
        >
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, {marginTop: 10, backgroundColor: '#4CAF50'}]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Produk tidak ditemukan</Text>
        <TouchableOpacity 
          style={[styles.retryButton, {marginTop: 10}]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image ? `${BASE_URL}/assets/${product.image}` : 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
        onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{product.name || 'Nama Produk'}</Text>
        <Text style={styles.price}>Rp {product.price ? parseFloat(product.price).toLocaleString('id-ID') : '0'}</Text>
        <Text style={styles.description}>{product.description || 'Deskripsi tidak tersedia'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addToCartButton}
        onPress={addToCart}
        disabled={loading}
      >
        <Text style={styles.addToCartText}>+ Tambah ke Keranjang</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 20,
    color: '#6f4e37',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  addToCartButton: {
    backgroundColor: '#6f4e37',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6f4e37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});