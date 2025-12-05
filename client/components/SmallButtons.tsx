import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface textProp {
    text: string;
    onPress?: () => void
}

const SmallButtons = ({text, onPress}: textProp) => {
  return (
    <Pressable
        onPress={onPress}
        className='bg-white px-6 py-2 rounded-full mt-4'
    >
        <Text className='text-black font-medium text-sm'>{text}</Text>
    </Pressable>
  )
}

export default SmallButtons

const styles = StyleSheet.create({})