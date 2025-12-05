// import "../globals.css"
import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets"; // ✅ modern version
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

// category components
import HomeCategory from "@/components/categories/HomeCategory";
import WomenCategory from "@/components/categories/WomenCategory";
import MenCategory from "@/components/categories/MenCategory";

export type Category = "HOME" | "WOMEN" | "MEN";

const { width } = Dimensions.get("window");
const categories: Category[] = ["HOME", "WOMEN", "MEN"];

const CATEGORY_COMPONENTS = {
  HOME: HomeCategory,
  WOMEN: WomenCategory,
  MEN: MenCategory,
} as const;

const HomeScreen: React.FC = () => {
  const [category, setCategory] = useState<Category>("HOME");
  const translateX = useSharedValue(0);
  const activeIndex = useSharedValue(categories.indexOf(category));
  const currentIndex = categories.indexOf(category);


  // 👇 New values for animated indicator
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const categoryLayouts = useRef<{ x: number; width: number }[]>([]);

  const updateCategory = (newCategory: Category) => {
    setCategory(newCategory);
    activeIndex.value = categories.indexOf(newCategory);

    // animated indicate when category changes
    const newIndex = categories.indexOf(newCategory);
    const layout = categoryLayouts.current[newIndex];
    if (layout) {
        indicatorX.value = withSpring(layout.x, {
            damping: 15,
            stiffness: 120,
            mass: 0.5,
        });
        indicatorWidth.value = withSpring(layout.width, {
            damping: 15,
            stiffness: 120,
            mass: 0.5,
        });
    }
  };

  // Gesture logic
  const panGesture = Gesture.Pan().onEnd((e) => {
    "worklet";
    const { translationX } = e;

    if (translationX < -50 && activeIndex.value < categories.length - 1) {
      const newCategory = categories[activeIndex.value + 1];
      translateX.value = width;
      scheduleOnRN(updateCategory, newCategory);
      translateX.value = withTiming(0, { duration: 300 });
    } else if (translationX > 50 && activeIndex.value > 0) {
      const newCategory = categories[activeIndex.value - 1];
      translateX.value = -width;
      scheduleOnRN(updateCategory, newCategory);
      translateX.value = withTiming(0, { duration: 300 });
    }
  });

  // Navbar button handler
  const handleCategoryChange = (
    newCategory: Category,
    direction?: "left" | "right"
  ) => {
    const offset = direction === "left" ? width : -width;
    translateX.value = offset;
    updateCategory(newCategory);
    translateX.value = withTiming(0, { duration: 300 });
  };

  // Animated content slide
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  
  const CategoryComponent = CATEGORY_COMPONENTS[category];

    // Animated indicator
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        {categories.map((cat, index) => (
          <TouchableOpacity
          
            key={cat}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              categoryLayouts.current[index] = { x, width };

              // Initialize indicator position
              if (cat === category) {
                indicatorX.value = x;
                indicatorWidth.value = width;
              }
            }}
            onPress={() => {
                const newIndex = categories.indexOf(cat);
                const oldIndex = categories.indexOf(category); // safe, from state
                const direction = newIndex > oldIndex ? "left" : "right";
                handleCategoryChange(cat, direction);
            }}
          >
            <Text
              style={[styles.navText, category === cat && styles.activeNavText]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.cart}>
          <Ionicons 
            name="bag-outline"
            size={24} 
            color="#000000"
          />
        </View>

        {/* Animated underline indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
     
      </View>

      {/* Swipeable category content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <CategoryComponent />
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  navbar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    position: "relative",
  },
  navText: {
    fontSize: 14,
    marginHorizontal: 10,
    color: "#555555",
    fontWeight: "bold",
  },
  activeNavText: {
    color: "#121111",
  },
  cart: {
    marginLeft: "auto",
    marginBottom: 5,
  },
  animatedContainer: {
    flex: 1,
  },
  indicator: {
    position: "absolute",
    height: 3,
    backgroundColor: "#121111",
    borderRadius: 2,
    bottom: 5, // space between text and bar
  },
});
































// import HomeCategory from "@/components/categories/HomeCategory";
// import WomenCategory from "@/components/categories/WomenCategory";
// import MenCategory from "@/components/categories/MenCategory";
// import React, { useState } from "react";
// import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
// } from "react-native-reanimated";
// import { scheduleOnRN } from "react-native-worklets";
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import { Ionicons } from "@expo/vector-icons";

// export type Category = "HOME" | "WOMEN" | "MEN";

// const { width } = Dimensions.get("window");
// const categories: Category[] = ["HOME", "WOMEN", "MEN"];

// const CATEGORY_COMPONENTS = {
//     HOME: HomeCategory,
//     WOMEN: WomenCategory,
//     MEN: MenCategory
// } as const;


// const HomeScreen: React.FC = () => {
//   const [category, setCategory] = useState<Category>("HOME");
//   const translateX = useSharedValue(0);

//   const indicatorX = useSharedValue(0);
//   const indicatorWidth = useSharedValue(0);

//   // 2. Create a shared value for the index that the UI thread can read
//   const activeIndex = useSharedValue(categories.indexOf(category));

//   const currentIndex = categories.indexOf(category); // Keep this for the JS-thread navbar

//   // 3. Create a function to update State AND the shared value
//   // This will be called from both the JS thread (navbar)
//   // and from the UI thread (gesture) via scheduleOnRN.
//   const updateCategory = (newCategory: Category) => {
//     // animate indicator whenever category changes
//     const newIndex = categories.indexOf(newCategory);
//     const layout = categoryLayouts.current[newIndex]
//     if (layout) {
//         indicatorX.value = withTiming(layout.x, { duration: 300, easing:  Easing.out(Easing.exp) });
//         indicatorWidth.value = withTiming(layout.width, { duration: 300, easing: Easing.out(Easing.exp) });

//     }

//     setCategory(newCategory);
//     activeIndex.value = categories.indexOf(newCategory);
//   };

//   // Gesture logic
//   const panGesture = Gesture.Pan().onEnd((e) => {
//     'worklet'; // Mark this as a Reanimated worklet
//     const { translationX } = e;

//     // 4. Use the shared 'activeIndex.value' instead of 'currentIndex'
//     if (translationX < -50 && activeIndex.value < categories.length - 1) {
//       // Swipe left
//       const newCategory = categories[activeIndex.value + 1];
//       const offset = width;

//       // Run the animation logic on the UI thread
//       translateX.value = offset;
//       // 5. Use scheduleOnRN to update state safely
      
//       scheduleOnRN(updateCategory, newCategory);
//       translateX.value = withTiming(0, { duration: 300 });

//     } else if (translationX > 50 && activeIndex.value > 0) {
//       // Swipe right
//       const newCategory = categories[activeIndex.value - 1];
//       const offset = -width;
      
//       // Run the animation logic on the UI thread
//       translateX.value = offset;
//       // 5. Use scheduleOnRN to update state safely
//       scheduleOnRN(updateCategory, newCategory);
//       translateX.value = withTiming(0, { duration: 300 });
//     }
//   });

//   // This function is now just for the (JS thread) navbar buttons
//   const handleCategoryChange = (newCategory: Category, direction?: "left" | "right") => {
//     const offset = direction === "left" ? width : -width;

//     translateX.value = offset;
    
//     // Call the same update function
//     updateCategory(newCategory);

//     translateX.value = withTiming(0, { duration: 300 });
//   };

//   // Animated style for the product + banner container
//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: translateX.value }],
//   }));

//   const CategoryComponent = CATEGORY_COMPONENTS[category];
//   const categoryLayouts = React.useRef<{ x: number; width: number }[]>([]);


//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Navbar */}
//       <View style={styles.navbar}>
//         {categories.map((cat, index) => (
//           <TouchableOpacity 
//             key={cat} 
//             onLayout={(event) => {
//                 const { x, width } = event.nativeEvent.layout;
//                 categoryLayouts.current[index] = {x, width };

//                 // set initial position on mount
//                 if (cat === category) {
//                     indicatorX.value = x;
//                     indicatorWidth.value = width;
//                 }
//             }}
//             onPress={() => 
//                 handleCategoryChange(
//                     cat, 
//                     categories.indexOf(cat) > currentIndex ? "left" : "right"
//                     )
//                 }
//             >
//             <Text style={[styles.navText, category === cat && styles.activeNavText]}>
//                 {cat}
//             </Text>
//           </TouchableOpacity>
//         ))}
//         <View style={styles.cart}>
//           <Text style={{ fontSize: 18 }}>
//             <Ionicons name="bag-outline" size={24} color="#333" />
//           </Text>
//         </View>
//       </View>

//         <Animated.View
//             style={[
//                 styles.indicator,
//                 useAnimatedStyle(() => ({
//                 transform: [{ translateX: indicatorX.value }],
//                 width: indicatorWidth.value,
//                 })),
//             ]}
//         />



//       {/* Animated Category Content */}
//       <GestureDetector gesture={panGesture}>
//         <Animated.View style={[styles.animatedContainer, animatedStyle]}>
//           <CategoryComponent />
//         </Animated.View>
//       </GestureDetector>
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// // (Styles remain the same)
// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#fff" },
// indicator: {
//   position: "absolute",
//   bottom: 0, // or adjust lower to create gap
//   height: 3,
//   backgroundColor: "#000",
//   borderRadius: 2,
// },
//   navbar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     position: "relative",
//   },
//   navText: {
//     fontSize: 16,
//     marginHorizontal: 10,
//     color: "#555",
//     fontWeight: "bold",
//   },
//   activeNavText: {
//     color: "#000",
//     textDecorationLine: "underline",
    
//   },
//   cart: {
//     marginLeft: "auto",
//   },
//   animatedContainer: {
//     flex: 1,
//   },
//   banner: {
//     width: "100%",
//     height: 150,
//     borderRadius: 10,
//     marginVertical: 10,
//   },
// });