import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const WomenCategory = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/400x150/ffb6c1/000000?text=Women+Collection" }}
        style={styles.banner}
        resizeMode="cover"
      />
      <Text style={styles.title}>Women’s Collection</Text>
      <Text>Explore dresses, handbags, and more from our women’s line.</Text>
    </View>
  );
};

export default WomenCategory;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  banner: { width: "100%", height: 150, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
});
