import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { AnimatedIcon } from './AnimatedIcon';

interface FloatingActionButtonProps {
    onPress: () => void;
    icon: string;
    iconLibrary?: 'FontAwesome' | 'Ionicons';
    gradientColors?: [string, string, ...string[]];
    size?: number;
    bottom?: number;
    right?: number;
    style?: ViewStyle;
    disabled?: boolean;
}

const { width } = Dimensions.get('window');

export function FloatingActionButton({
    onPress,
    icon,
    iconLibrary = 'FontAwesome',
    gradientColors = ['#667eea', '#764ba2'] as [string, string, ...string[]],
    size = 56,
    bottom = 20,
    right = 20,
    style,
    disabled = false,
}: FloatingActionButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const shadowAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Floating animation
        const floatAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );

        floatAnimation.start();

        return () => floatAnimation.stop();
    }, [scaleAnim]);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.9,
                useNativeDriver: true,
            }),
            Animated.timing(shadowAnim, {
                toValue: 0.5,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(shadowAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    bottom,
                    right,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    transform: [{ scale: scaleAnim }],
                    opacity: disabled ? 0.5 : 1,
                    shadowColor: gradientColors[0],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: shadowAnim,
                    shadowRadius: 8,
                    elevation: 8,
                },
                style,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={1}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                }}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <AnimatedIcon
                        name={icon}
                        size={size * 0.4}
                        color="white"
                        animationType="pulse"
                        library={iconLibrary}
                    />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

export function MultiFAB({
    mainIcon,
    mainOnPress,
    actions,
    gradientColors = ['#667eea', '#764ba2'] as [string, string, ...string[]],
    size = 56,
    bottom = 20,
    right = 20,
}: {
    mainIcon: string;
    mainOnPress?: () => void;
    actions: {
        icon: string;
        onPress: () => void;
        label?: string;
        gradientColors?: [string, string, ...string[]];
    }[];
    gradientColors?: [string, string, ...string[]];
    size?: number;
    bottom?: number;
    right?: number;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const animatedValues = useRef(
        actions.map(() => new Animated.Value(0))
    ).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        setIsOpen(!isOpen);

        Animated.parallel([
            ...animatedValues.map((anim, index) =>
                Animated.spring(anim, {
                    toValue,
                    delay: index * 50,
                    useNativeDriver: true,
                })
            ),
            Animated.spring(rotateAnim, {
                toValue,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleMainPress = () => {
        if (mainOnPress) {
            mainOnPress();
        } else {
            toggleMenu();
        }
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <>
            {/* Action buttons */}
            {actions.map((action, index) => {
                const translateY = animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -(size + 10) * (index + 1)],
                });

                const scale = animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                });

                return (
                    <Animated.View
                        key={index}
                        style={{
                            position: 'absolute',
                            bottom,
                            right,
                            transform: [{ translateY }, { scale }],
                        }}
                    >
                        <FloatingActionButton
                            onPress={() => {
                                action.onPress();
                                toggleMenu();
                            }}
                            icon={action.icon}
                            gradientColors={action.gradientColors || gradientColors}
                            size={size * 0.8}
                        />
                    </Animated.View>
                );
            })}

            {/* Main button */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom,
                    right,
                    transform: [{ rotate }],
                }}
            >
                <FloatingActionButton
                    onPress={handleMainPress}
                    icon={mainIcon}
                    gradientColors={gradientColors}
                    size={size}
                />
            </Animated.View>
        </>
    );
}