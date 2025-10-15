import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductCard({ product }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const handlePress = () => {
    if (product?.id) {
      router.push(`/products/${product.id}`);
    }
  };

  const renderImage = () => {
    if (imgError || !product?.image) {
      const firstLetter = product?.name ? product.name.charAt(0).toUpperCase() : '?';
      return (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>{firstLetter}</Text>
        </View>
      );
    }
    
    return (
      <Image 
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={handlePress}
    >
      {renderImage()}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product?.name || 'Nama Produk'}
        </Text>
        <Text style={styles.price}>
          Rp {product?.price ? Number(product.price).toLocaleString('id-ID') : '0'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
    marginHorizontal: '1%',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0e6d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6f4e37',
    fontSize: 48,
    fontWeight: 'bold',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6f4e37',
  },
});