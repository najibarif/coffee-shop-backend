import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductCard({ product }) {
  const router = useRouter();

  const handlePress = () => {
    if (product?.id) {
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: product?.image 
              ? `https://coffee-shop-backend-production-afce.up.railway.app/api/assets/${product.image}`
              : 'https://via.placeholder.com/150' 
          }}
          style={styles.image}
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product?.name || 'Product Name'}
        </Text>
        <Text style={styles.price}>
          Rp {product?.price ? product.price.toLocaleString('id-ID') : '0'}
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
    elevation: 3,
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
    marginHorizontal: '1%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9F5F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3C2E',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6F4E37',
  },
});