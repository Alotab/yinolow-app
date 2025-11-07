import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  Animated, 
  TouchableOpacity 
} from 'react-native';
import React, { useEffect, useRef, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// Constants for layout
const { width } = Dimensions.get('window');
const TAB_COUNT = 4;
const TAB_WIDTH = width / TAB_COUNT;
const BASE_TAB_BAR_HEIGHT = 65; // Fixed height for content area (icons/labels)
const BAR_WIDTH = 30;
const BAR_HEIGHT = 3;
const BAR_TOP = -1; // Pushes the bar 1px above the border

/**
 * Custom Tab Bar component that renders the animated sliding bar and handles safe area insets.
 */
const CustomTabBar = (props) => {
    const { state, descriptors, navigation } = props;
    
    // Get the safe area insets for Android soft navigation bar handling
    const insets = useSafeAreaInsets();

    // Calculate the total height: fixed content height + safe area padding
    const totalHeight = BASE_TAB_BAR_HEIGHT + insets.bottom;

    // 1. Animated Value for the bar's horizontal position
    const translateXAnim = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;

    // 2. Animate Position on Index Change
    useEffect(() => {
        const targetX = state.index * TAB_WIDTH;
        
        Animated.spring(translateXAnim, {
            toValue: targetX,
            useNativeDriver: true,
            tension: 40, // Controls how snappy the animation is
            friction: 12, // Controls the overshoot
        }).start();
    }, [state.index, translateXAnim]);

    // 3. Map icon names for quick lookup
    const routeIconMap = useMemo(() => ({
        index: { focused: 'home', unfocused: 'home-outline' },
        search: { focused: 'search', unfocused: 'search-outline' },
        wishList: { focused: 'heart', unfocused: 'heart-outline' },
        profile: { focused: 'person', unfocused: 'person-outline' },
    }), []);

    // 4. Bar Centering Calculation
    // Centers the 30px bar within the calculated TAB_WIDTH space
    const centerAdjustment = (TAB_WIDTH / 2) - (BAR_WIDTH / 2);

    return (
        <View 
            style={[
                styles.tabBarContainer,
                // CRITICAL FIX: Set the dynamic total height here
                { height: totalHeight } 
            ]}
        >
            {/* --- 1. THE SINGLE SLIDING BAR (Animated) --- */}
            <Animated.View 
                style={[
                    styles.slidingBar,
                    { 
                        backgroundColor: props.tabBarActiveTintColor || '#007AFF', 
                        transform: [
                            { translateX: translateXAnim }, // Moves to the correct slot
                            { translateX: centerAdjustment }, // Centers within the slot
                            { translateY: BAR_TOP } // Pushes up to the border
                        ]
                    }
                ]} 
            />

            {/* --- 2. THE TAB BUTTONS WRAPPER (Visual Content Area) --- */}
            <View 
                style={[
                    styles.tabButtonsWrapper,
                    // CRITICAL FIX: Apply padding to push icons/labels above the Android system bar
                    { paddingBottom: insets.bottom } 
                ]}
            >
                {state.routes.map((route, index) => {
                    // Use the descriptor to get screen options
                    const { options } = descriptors[route.key];
                    const label = options.title !== undefined ? options.title : route.name;
                    const isFocused = state.index === index;
                    const iconName = isFocused 
                        ? routeIconMap[route.name].focused 
                        : routeIconMap[route.name].unfocused;
                    
                    const color = isFocused 
                        ? props.tabBarActiveTintColor || '#007AFF' 
                        : props.tabBarInactiveTintColor || '#8E8E93';

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Ionicons name={iconName} size={24} color={color} />
                            <Text style={{ color: color, fontSize: 12, marginTop: 4 }}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};


export default CustomTabBar;

const styles = StyleSheet.create({
    tabBarContainer: {
        backgroundColor: '#ffffff',
        borderTopColor: '#d1d1d1',
        borderTopWidth: 1,
        // Height should match the combined height of the tabs
        height: 65, 
        paddingTop: 8, // Space for the bar and top padding
    },
    tabButtonsWrapper: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        justifyContent: 'space-around',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    slidingBar: {
        position: 'absolute',
        width: BAR_WIDTH, 
        height: BAR_HEIGHT, 
        borderRadius: 2,
    },
})