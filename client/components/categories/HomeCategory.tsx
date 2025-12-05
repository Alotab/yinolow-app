import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { s, vs, ms } from "react-native-size-matters";
import SmallButtons from "../SmallButtons";
import SearchBar from "../SearchBar";
import { images } from "../../constants/images";
import Headline from "../Headline";

const HomeCategory = () => {
  return (
    <View className="flex-1 bg-white">
      <SearchBar />

      {/* Banner: full height minus responsive bottom gap */}
      <View style={{ flex: 1, marginBottom: vs(5) }}>
        <ImageBackground
          source={images.hero_banner}
          className="w-full h-full justify-end items-center"
          resizeMode="cover"
        >
          {/* Overlay */}
          <View className="absolute inset-0 bg-black/5" />

          {/* Text & Button */}
          <View className="flex flex-col items-center space-y-2" style={{ paddingBottom: vs(50) }}>
            <Text className="text-white font-bold" style={{ fontSize: ms(24), marginBottom: vs(5) }}>
              PUMP UNLOCKED
            </Text>
            <Text className="text-white font-semibold" style={{ fontSize: ms(16) }}>
              New Pump matching now available
            </Text>
            <SmallButtons text="Shop Women" />
          </View>
        </ImageBackground>
      </View>

      <Headline text1="Shop" text2="New This Week"/>
    </View>
  );
};

export default HomeCategory;


















// import React from "react";
// import { View, Text, ImageBackground, Button } from "react-native";
// import { images } from "../../constants/images";
// import SmallButtons from "../SmallButtons";
// import SearchBar from "../SearchBar";


// const HomeCategory = () => {
//   return (
//     <View className="flex-1">
//       <SearchBar />
//       <View 
//         className="w-full" 
//       >
//           <ImageBackground
//           source={images.hero_banner}
//           className="h-[350px] justify-end items-center"
//           resizeMode="cover"
//         >
//           <View className="absolute inset-0 bg-black/5" />
//           <View className="flex flex-col items-center space-y-2"
//             style={{ paddingBottom: 50 }}
//           > 
//             <Text className="font-bold text-3xl text-white mb-5">PUMP UNLOCKED</Text>
//             <Text className=" font-semibold text-[16px] text-white">New Pump matching now available</Text>
//             <SmallButtons text="Shop Women"/>
//           </View>
//         </ImageBackground>
//       </View>
      

//       <Text className="text-red-600 text-center mt-4">
//         Discover our newest arrivals and best-selling items.
//       </Text>
//     </View>
//   );
// };

// export default HomeCategory;