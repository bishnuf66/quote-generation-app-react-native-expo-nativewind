import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { Text, TextProps } from "react-native";

type TextType = 'title' | 'subtitle' | 'body' | 'link' | 'caption' | 'hero' | 'display';

type ThemedTextProps = TextProps & {
  type?: TextType;
  className?: string;
  gradient?: boolean;
  shadow?: boolean;
};

export function ThemedText({
  type = 'body',
  style,
  className,
  gradient = false,
  shadow = false,
  ...otherProps
}: ThemedTextProps) {
  const colorScheme = useColorScheme();

  const getTextStyles = (): any => {
    const isDark = colorScheme === 'dark';
    const baseColor = isDark ? '#ffffff' : '#1a202c';
    const mutedColor = isDark ? '#a0aec0' : '#718096';

    const styles = {
      hero: {
        fontSize: 48,
        fontWeight: '900' as const,
        marginBottom: 12,
        color: baseColor,
        letterSpacing: -1,
      },
      display: {
        fontSize: 36,
        fontWeight: '800' as const,
        marginBottom: 10,
        color: baseColor,
        letterSpacing: -0.5,
      },
      title: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        marginBottom: 8,
        color: baseColor,
      },
      subtitle: {
        fontSize: 24,
        fontWeight: '600' as const,
        marginBottom: 6,
        color: baseColor,
      },
      body: {
        fontSize: 16,
        marginBottom: 4,
        color: baseColor,
        lineHeight: 24,
      },
      link: {
        fontSize: 16,
        color: '#667eea',
        textDecorationLine: 'underline' as const,
      },
      caption: {
        fontSize: 12,
        color: mutedColor,
        fontStyle: 'italic' as const,
      },
    };

    let textStyle: any = styles[type];

    if (shadow) {
      textStyle = {
        ...textStyle,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      };
    }

    return textStyle;
  };

  return (
    <Text
      style={[getTextStyles(), style]}
      className={className}
      {...otherProps}
    />
  );
}
