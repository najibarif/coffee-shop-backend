import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { BASE_URL } from '../constants/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{marginTop:30}} size="large" />;

  return (
    <View style={{flex:1}}>
      <FlatList
        data={orders}
        keyExtractor={o => o.id?.toString() ?? Math.random().toString()}
        renderItem={({item}) => (
          <View style={{padding:12, borderBottomWidth:1, borderColor:'#eee'}}>
            <Text>Order ID: {item.id}</Text>
            <Text>User ID: {item.user_id}</Text>
            <Text>Total: Rp {Number(item.total_price).toLocaleString()}</Text>
            <Text>Tanggal: {item.created_at}</Text>
          </View>
        )}
      />
    </View>
  );
}
