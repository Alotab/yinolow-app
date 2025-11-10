import { StyleSheet } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';



const _layout = () => {
  return (
    <Tabs
        // CRITICAL: Use the custom component for the entire tab bar 1C274C
        tabBar={(props) => <CustomTabBar {...props} />} 
        screenOptions={{
            tabBarActiveTintColor: '#1C274C',
            // tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
        }}
    >
        <Tabs.Screen 
            name='index'
            options={{ title: "Home", headerShown: false }}
        />
        <Tabs.Screen 
            name='search'
            options={{ title: "Search", headerShown: false }}
        />
        <Tabs.Screen 
            name='wishList'
            options={{ title: "WishList", headerShown: false }}
        />
        <Tabs.Screen 
            name='profile'
            options={{ title: "Profile", headerShown: false }}
        />
    </Tabs>
  )
}

export default _layout;

const styles = StyleSheet.create({})




















// import { StyleSheet, Text, View } from 'react-native';
// import React from 'react';
// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import CustomTabBar from '@/components/CustomTabBar';

// /**
//  * A custom component to render the tab icon with an active bar on top.
//  */
// // const ActiveTabIcon = ({ name, focused, color, size }) => {
// //   return (
// //     <View style={styles.tabIconContainer}>
// //       {/* This is the active bar, now absolutely positioned */}
// //       <View 
// //         style={[
// //           styles.activeBar,
// //           { backgroundColor: focused ? color : 'transparent' }
// //         ]} 
// //       />
// //       {/* This is the icon */}
// //       <Ionicons name={name} size={size} color={color} />
// //     </View>
// //   );
// // };

// // const _layout = () => {
// //   return (
// //     <Tabs
// //         screenOptions={{
// //             tabBarShowLabel: true, 
// //             tabBarItemStyle: {
// //                 width: '100%',
// //                 height: '100%',
// //                 justifyContent: 'center',
// //                 alignItems: 'center',
// //                 // Keep some padding to ensure the icon/label content is pushed down, 
// //                 // allowing the bar to sit at the absolute top.
// //                 paddingTop: 8, 
// //             },
// //             tabBarStyle: {
// //                 backgroundColor: '#ffffff',
// //                 borderTopColor: '#d1d1d1',
// //                 borderTopWidth: 1,
// //                 shadowColor: '#000',
// //                 shadowOpacity: 0.04,
// //                 shadowOffset: { width: 0, height: -2 },
// //                 shadowRadius: 4,
// //                 height: 65,
// //             },
// //             tabBarActiveTintColor: '#007AFF',
// //             tabBarInactiveTintColor: '#8E8E93',
// //         }}
// //         tabBar={(props) => <CustomTabBar {...props}/>}
// //     >

// //         <Tabs.Screen 
// //             name='index'
// //             options={{
// //                 title: "Home",
// //                 headerShown: false
// //             }}
// //         />

// //         <Tabs.Screen 
// //             name='search'
// //             options={{
// //                 title: "Search",
// //                 headerShown: false
// //             }}
// //         />
// //         <Tabs.Screen 
// //             name='wishList'
// //             options={{
// //                 title: "WishList",
// //                 headerShown: false
// //             }}
// //         />
// //         <Tabs.Screen 
// //             name='profile'
// //             options={{
// //                 title: "Profile",
// //                 headerShown: false
// //             }}
// //         />

// //     </Tabs>
// //   )
// // }

// // export default _layout

// // const styles = StyleSheet.create({
// //   tabIconContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     width: '100%',
// //     // IMPORTANT: Set position to 'relative' so the absolute bar anchors to this container.
// //     position: 'relative', 
// //   },
// //   activeBar: {
// //     width: 40, 
// //     height: 3, 
// //     borderRadius: 2,
    
// //     // *** NEW POSITIONING LOGIC ***
// //     position: 'absolute',
    
// //     // Adjust 'top' to control the vertical position. 
// //     // A negative value lifts it above the container's starting point.
// //     // '-10' should position it just above or on the top border.
// //     top: -15, 
    
// //     // Center the bar horizontally
// //     left: '40%',
// //     transform: [{ translateX: -15 }], // -15 is half of the 30px width
// //     // 'marginBottom' is no longer needed since 'top' controls the position
// //   },
// // })





















// // import { StyleSheet, Text, View } from 'react-native'
// // import React from 'react'
// // import { Tabs } from 'expo-router'


// // /**
// //  * A custom component to render the tab label with an active bar on top.
// //  * It receives `focused` (boolean) and `color` (string) from React Navigation.
// //  */
// const ActiveTabBarLabel = ({ label, focused, color }) => {
//   return (
//     <View style={styles.tabLabelContainer}>
//       {/* This is the active bar */}
//       <View 
//         style={[
//           styles.activeBar,
//           // We use the 'color' prop (which is the active tint color) 
//           // to color the bar only when 'focused' is true.
//           { backgroundColor: focused ? color : 'transparent' }
//         ]} 
//       />
//       {/* This is the label text */}
//       <Text style={{ color: color, fontSize: 12, fontWeight: focused ? '600' : '500' }}>
//         {label}
//       </Text>
//     </View>
//   );
// };


// export default function _layout() {
//   return (
//     <Tabs
   
//         screenOptions={{
//             // tabBarShowLabel: true,
//             tabBarItemStyle: {
//                 width: '100%',
//                 height: '100%',
//                 justifyContent: 'center',
//                 alignItems: 'center'
//             },
//             tabBarStyle: {
//                 backgroundColor: '#ffffff',
//                 borderTopColor: '#d1d1d1',
//                 borderTopWidth: 1,
//                 shadowColor: '#000',
//                 shadowOpacity:0.04,
//                 shadowOffset: { width: 0, height: -2 },
//                 shadowRadius: 4,
//                 // height: 60

//             }
//         }}
        
    
//     >

//         <Tabs.Screen 
//             name='index'
//             options={{
//                 title: "Home",
//                 headerShown: false,
//                  // Use the custom component for the tab label
//                 tabBarLabel: ({ focused, color }) => (
//                     <ActiveTabBarLabel label="Home" focused={focused} color={color} />
//                 ),
//             }}
//         />

//         <Tabs.Screen 
//             name='search'
//             options={{
//                 title: "Search",
//                 headerShown: false,
//                  // Use the custom component for the tab label
//                 tabBarLabel: ({ focused, color }) => (
//                     <ActiveTabBarLabel label="Search" focused={focused} color={color} />
//                 ),
//             }}
//         />
//         <Tabs.Screen 
//             name='wishList'
//             options={{
//                 title: "WishList",
//                 headerShown: false,
//                  // Use the custom component for the tab label
//                 tabBarLabel: ({ focused, color }) => (
//                     <ActiveTabBarLabel label="WishList" focused={focused} color={color} />
//                 ),
//             }}
//         />
//         <Tabs.Screen 
//             name='profile'
//             options={{
//                 title: "Profile",
//                 headerShown: false,
//                  // Use the custom component for the tab label
//                 tabBarLabel: ({ focused, color }) => (
//                     <ActiveTabBarLabel label="Profile" focused={focused} color={color} />
//                 ),
//             }}
//         />

//     </Tabs>
//   )
// }


// const styles = StyleSheet.create({
//   tabLabelContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   activeBar: {
//     width: 30, // Width of the active bar
//     height: 3, // Height of the active bar
//     borderRadius: 2,
//     marginBottom: 4, // Space between bar and label
//   },
// })