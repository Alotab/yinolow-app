import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { vs, ms } from 'react-native-size-matters';
interface headlineTextProps {
    text1: string;
    text2: string
}
const Headline: React.FC<headlineTextProps> = ({text1, text2}: headlineTextProps) => {
  return (
    <View 
    style={{ marginTop: vs(8) }}
        className='flex flex-col justify-center items-center'
    >
      <Text style={{ fontSize: ms(12), transform: "uppercase" }} className='font-normal uppercase'>{text1}</Text>
      <Text
        style={{ fontSize: ms(14), marginTop: ms(6), transform: "uppercase" }}
        className='font-extrabold uppercase'
      
      >{text2}</Text>
    </View>
  )
}

export default Headline

const styles = StyleSheet.create({})