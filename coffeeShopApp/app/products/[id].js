import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../../constants/api';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { addToCart } = useCart();

  const fetchProduct = async () => {
    if (!id) {
      console.error('Error: Product ID is missing');
      setError('ID produk tidak valid');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}/products/${id}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Gagal memuat data produk (${response.status})`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data) {
        throw new Error('Tidak ada data yang diterima dari server');
      }

      setProduct(data);
      setError(null);
    } catch (err) {
      console.error('Error in fetchProduct:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(`Gagal memuat data produk: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    try {
      addToCart({
        ...product,
        quantity: 1
      });
      Alert.alert('Berhasil', 'Produk berhasil ditambahkan ke keranjang');
      router.push('/carts');
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Error', err.message || 'Gagal menambahkan ke keranjang');
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
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Produk tidak ditemukan</Text>
        <TouchableOpacity
          style={[styles.retryButton, { marginTop: 10 }]}
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
        onPress={handleAddToCart}
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