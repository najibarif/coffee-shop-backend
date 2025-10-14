import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../../constants/api';

export default function ProductDetail() {
  const params = useLocalSearchParams();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    try {
      const body = { product_id: product.id, quantity: 1, total_price: product.price };
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        Alert.alert('Gagal', txt || 'Tidak dapat menambahkan order');
        return;
      }
      Alert.alert('Berhasil', 'Produk ditambahkan ke pesanan');
      router.push('/orders');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal konek server');
    }
  };

  if (loading) return <ActivityIndicator style={{marginTop:30}} size="large" color="#6f4e37" />;

  if (!product) return <View style={{padding:20}}><Text>Produk tidak ditemukan</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>Rp {Number(product.price).toLocaleString('id-ID')}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={addToCart}>
        <Text style={styles.buttonText}>Pesan Sekarang</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    padding: 24,
    paddingBottom: 40,
    minHeight: '100%',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 24,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6f4e37',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 22,
    color: '#7b5e3c',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: '#6f4e37',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6f4e37',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#6f4e37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff8f0',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
