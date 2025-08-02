import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

interface AnimatedIconProps {
    name: string;
    size?: number;
    color?: string;
    onPress?: () => void;
    animationType?: 'bounce' | 'pulse' | 'rotate' | 'shake' | 'none';
    library?: 'FontAwesome' | 'Ionicons';
    style?: any;
}

export function AnimatedIcon({
    name,
    size = 24,
    color = '#000',
    onPress,
    animationType = 'none',
    library = 'FontAwesome',
    style,
}: AnimatedIconProps) {
    const animValue = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (animationType === 'none') return;

        let animation: Animated.CompositeAnimation;

        switch (animationType) {
            case 'bounce':
                animation = Animated.loop(
                    Animated.sequence([
                        Animated.timing(animValue, {
                            toValue: 1,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animValue, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ])
                );
                break;
            case 'pulse':
                animation = Animated.loop(
                    Animated.sequence([
                        Animated.timing(scaleAnim, {
                            toValue: 1.2,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ])
                );
                break;
            case 'rotate':
                animation = Animated.loop(
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    })
                );
                break;
            case 'shake':
                animation = Animated.loop(
                    Animated.sequence([
                        Animated.timing(animValue, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animValue, {
                            toValue: -1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animValue, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animValue, {
                            toValue: 0,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.delay(2000),
                    ])
                );
                break;
        }

        animation?.start();

        return () => animation?.stop();
    }, [animationType, animValue, scaleAnim]);

    const getTransform = () => {
        switch (animationType) {
            case 'bounce':
                return [
                    {
                        translateY: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10],
                        }),
                    },
                    { scale: scaleAnim },
                ];
            case 'pulse':
                return [{ scale: scaleAnim }];
            case 'rotate':
                return [
                    {
                        rotate: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                        }),
                    },
                ];
            case 'shake':
                return [
                    {
                        translateX: animValue.interpolate({
                            inputRange: [-1, 1],
                            outputRange: [-5, 5],
                        }),
                    },
                ];
            default:
                return [{ scale: scaleAnim }];
        }
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const renderIcon = () => {
        try {
            if (library === 'Ionicons') {
                return <Ionicons name={name as any} size={size} color={color} />;
            }
            return <FontAwesome name={name as any} size={size} color={color} />;
        } catch (error) {
            console.warn('AnimatedIcon render error:', error);
            // Fallback to a simple view
            return (
                <View
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: color,
                        borderRadius: size / 2
                    }}
                />
            );
        }
    };

    const iconElement = (
        <Animated.View
            style={[
                {
                    transform: getTransform(),
                },
                style,
            ]}
        >
            {renderIcon()}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {iconElement}
            </TouchableOpacity>
        );
    }

    return iconElement;
}