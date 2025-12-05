import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

interface NavbarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export type Category = "HOME" | "WOMEN" | "MEN";

const NavBar: React.FC<NavbarProps> = ({ activeCategory, onCategoryChange}) => {
    const categories: Category[] = ["HOME", "WOMEN", "MEN"];

  return (
    <View style={styles.navbar}>
        {/* Left side buttons  */}
      <View style={styles.leftSide}>
            {categories.map((cat) => (
                <TouchableOpacity
                    key={cat}
                    onPress={() => onCategoryChange(cat)}
                    style={[
                        styles.button,
                        activeCategory === cat && styles.activeButton,
                    ]}
                >
                    <Text
                        style={[
                            styles.text,
                            activeCategory === cat && styles.activeText

                        ]}
                    
                    >
                        {cat}
                    </Text>

                </TouchableOpacity>
            ))}
      </View>

        {/* Right side cart icon  */}
        <TouchableOpacity style={styles.cartIcon}>
            {/* <Ionicons name="bag-outline" size={24} color="#333" /> */}
        </TouchableOpacity>
    </View>
  );
}

export default NavBar

const styles = StyleSheet.create({
    navbar: {
         flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    leftSide: {
        flexDirection: "row",
        gap: 8,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    activeButton: {
        backgroundColor: "#333",
    },
    text: {
        color: "#333",
        fontWeight: "bold",
    },
    activeText: {
        color: "#fff",
    },
    cartIcon: {
        padding: 6,
    },

});