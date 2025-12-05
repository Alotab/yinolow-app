import { StyleSheet, Text, View, Image, FlatList } from 'react-native'
import React from 'react'
import { Category } from './NavBarOld';

interface Product {
    id: string;
    name: string
}

interface ProductViewProps {
    category: Category
}

export const HERO_BANNERS: Record<Category, string> = {
  HOME: "https://picsum.photos/400/150?random=1",
  WOMEN: "https://picsum.photos/400/150?random=2",
  MEN: "https://picsum.photos/400/150?random=3",
};


const PRODUCTS: Record<Category, Product[]> = {
  HOME: [
    { id: "1", name: "Unisex Hat" },
    { id: "2", name: "Candle" },
  ],
  WOMEN: [
    { id: "3", name: "Red Dress" },
    { id: "4", name: "Heels" },
  ],
  MEN: [
    { id: "5", name: "Jacket" },
    { id: "6", name: "Watch" },
  ],
};


const ProductView: React.FC<ProductViewProps> = ({ category }) => {
    const products = PRODUCTS[category];
  return (
    <View style={styles.container}>
        {/* <Image
            source={{ uri: HERO_BANNERS[category] }}
            style={styles.banner}
            resizeMode="cover"
        /> */}
    

        <FlatList 
            data={products}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text style={styles.product}>{item.name}</Text>
                </View>
            )}
        />
    </View>
  )
}

export default ProductView

const styles = StyleSheet.create({
    container: { flex: 1},
    banner: {
        width: "100%",
        height: 150,
        borderRadius: 10,
        marginVertical: 10,
    },
    row: {
        justifyContent: "space-between"
    },
    card: {
        flex: 1,
        margin: 5,
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        alignItems: "center",
    },
    product: {
        fontWeight: "bold"
    }
})