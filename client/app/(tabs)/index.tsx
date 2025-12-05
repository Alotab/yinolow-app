import "react-native-gesture-handler";
import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native'
import React, { useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import HomeScreen from '../Screens/HomeScreen'




const index = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1}}>
        <HomeScreen />
    </GestureHandlerRootView>
  )
}

export default index;

const styles = StyleSheet.create({

})
