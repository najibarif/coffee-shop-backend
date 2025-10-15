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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID produk tidak valid');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/products/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
        } else {
          setError('Produk tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Gagal memuat detail produk');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Add to cart
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: 1
      });
      
      // Navigate directly to cart
      router.push('/carts');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6f4e37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Produk tidak ditemukan</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image 
            source={{ 
              uri: product.image.startsWith('http') 
                ? product.image 
                : `${BASE_URL}/assets/${product.image}` 
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Tidak ada gambar</Text>
          </View>
        )}
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>
          Rp {parseFloat(product.price).toLocaleString('id-ID')}
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.productDescription}>
            {product.description || 'Tidak ada deskripsi tersedia'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>+ Tambah ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#6f4e37',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0e6d9',
  },
  placeholderText: {
    color: '#a39e99',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6f4e37',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
  },
  addToCartButton: {
    backgroundColor: '#6f4e37',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});