import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
    Animated,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface GradientCardProps {
    children: React.ReactNode;
    gradientColors?: [string, string, ...string[]];
    style?: ViewStyle;
    onPress?: () => void;
    disabled?: boolean;
    borderRadius?: number;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
}

export function GradientCard({
    children,
    gradientColors = ['#667eea', '#764ba2'] as [string, string, ...string[]],
    style,
    onPress,
    disabled = false,
    borderRadius = 16,
    shadowColor,
    shadowOpacity = 0.2,
    shadowRadius = 8,
    elevation = 8,
}: GradientCardProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!onPress) return;

        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        if (!onPress) return;

        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const cardContent = (
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: disabled ? 0.5 : opacityAnim,
                },
            ]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    {
                        borderRadius,
                        shadowColor: shadowColor || gradientColors[0],
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity,
                        shadowRadius,
                        elevation,
                    },
                    style,
                ]}
            >
                {children}
            </LinearGradient>
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={1}
            >
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
}

export function GlassCard({
    children,
    style,
    onPress,
    disabled = false,
    borderRadius = 16,
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    borderColor = 'rgba(255, 255, 255, 0.2)',
}: {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    disabled?: boolean;
    borderRadius?: number;
    backgroundColor?: string;
    borderColor?: string;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!onPress) return;

        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        if (!onPress) return;

        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const cardContent = (
        <Animated.View
            style={[
                {
                    backgroundColor,
                    borderRadius,
                    borderWidth: 1,
                    borderColor,
                    backdropFilter: 'blur(10px)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    transform: [{ scale: scaleAnim }],
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={1}
            >
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
}