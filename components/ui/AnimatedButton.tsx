import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
    Animated,
    GestureResponderEvent,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { ThemedText } from '../ThemedText';

interface AnimatedButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    gradientColors?: string[];
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    icon?: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    variant?: 'gradient' | 'solid' | 'outline';
}

export function AnimatedButton({
    title,
    onPress,
    gradientColors = ['#667eea', '#764ba2'],
    style,
    textStyle,
    disabled = false,
    icon,
    size = 'medium',
    variant = 'gradient',
}: AnimatedButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.8,
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
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 };
            case 'large':
                return { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 };
            default:
                return { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 };
        }
    };

    const getTextSize = () => {
        switch (size) {
            case 'small':
                return 14;
            case 'large':
                return 18;
            default:
                return 16;
        }
    };

    const buttonContent = (
        <Animated.View
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...getSizeStyles(),
                    opacity: disabled ? 0.5 : 1,
                },
                style,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            {icon && <>{icon}</>}
            <ThemedText
                style={[
                    {
                        color: 'white',
                        fontWeight: '600',
                        fontSize: getTextSize(),
                        marginLeft: icon ? 8 : 0,
                    },
                    textStyle,
                ]}
            >
                {title}
            </ThemedText>
        </Animated.View>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={1}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: getSizeStyles().borderRadius,
                        shadowColor: gradientColors[0],
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    {buttonContent}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={1}
            style={{
                backgroundColor: variant === 'solid' ? gradientColors[0] : 'transparent',
                borderWidth: variant === 'outline' ? 2 : 0,
                borderColor: gradientColors[0],
                borderRadius: getSizeStyles().borderRadius,
                shadowColor: variant === 'solid' ? gradientColors[0] : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: variant === 'solid' ? 8 : 0,
            }}
        >
            {buttonContent}
        </TouchableOpacity>
    );
}