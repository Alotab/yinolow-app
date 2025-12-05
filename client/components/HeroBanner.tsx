import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { images } from '@/constants/images';

interface HeroProp {
    text: string;
    image: string
}
// const HeroBanner: React.FC<HeroProp> = ({text, image}: HeroProp) => {
const HeroBanner = () =>{
  return (
    <View>
        <ImageBackground
            source={images.hero_banner}
            className='flex flex-row w-full h-full justify-center items-center'
        >
            <Text>HeroBanner</Text>
        </ImageBackground>
      
    </View>
  )
}

export default HeroBanner

const styles = StyleSheet.create({})