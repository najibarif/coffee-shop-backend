import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Najib Coffee</Text>
      <Text style={styles.subtitle}>
        Temukan berbagai pilihan kopi terbaik untuk hari Anda!
      </Text>
      <Link href="/products" asChild>
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Lihat Menu Produk</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    padding: 24,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 32,
    marginTop: -48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6f4e37',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7b5e3c',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6f4e37',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#6f4e37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
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