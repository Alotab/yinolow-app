import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const MenCategory = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/400x150/87cefa/000000?text=Men+Collection" }}
        style={styles.banner}
        resizeMode="cover"
      />
      <Text style={styles.title}>Men’s Collection</Text>
      <Text>Shop our latest jackets, shoes, and accessories for men.</Text>
    </View>
  );
};

export default MenCategory;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  banner: { width: "100%", height: 150, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
});
