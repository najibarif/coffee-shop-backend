import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>Rp {product.price?.toLocaleString('id-ID')}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    flex: 1,
    marginHorizontal: 6,
    elevation: 3,
    shadowColor: '#6f4e37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    overflow: 'hidden',
    minWidth: 150,
    maxWidth: '48%',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6f4e37',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    color: '#7b5e3c',
    fontWeight: '600',
  },
});
