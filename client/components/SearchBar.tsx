import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from "@react-navigation/native";
import { s, vs, ms } from 'react-native-size-matters';

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const navigation = useNavigation();

    const handleSearch = () => {
        console.log("Searching for:", query);
    };

    return (
        <View className='flex justify-center items-center'>
            <Text className='text-black font-normal text-[12px]'>Free Shipping for over $100 and 30 Day Returns</Text>
        <Pressable 
            // onPress={() => navigation.navigate("Search")}
            className='flex-row items-center px-4 mt-3 mb-2 border border-secondary-200'
            style={{ height: vs(40), borderRadius: s(8) }}
        >
            <Ionicons name="search" size={ms(20)} color="#555"/>
            <TextInput 
            
                className='flex-1 ml-2 text-base text-gray-800'
                style={{ fontSize: ms(12) }}
                placeholder='Search products...'
                placeholderTextColor="#888"
                value={query}
                onChangeText={setQuery}
                returnKeyType='search'
                onSubmitEditing={handleSearch}
            />
        </Pressable>
        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({})
