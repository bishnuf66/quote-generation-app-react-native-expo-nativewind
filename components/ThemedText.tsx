import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

type TextType = 'title' | 'subtitle' | 'body' | 'link' | 'caption';

type ThemedTextProps = TextProps & {
  type?: TextType;
  className?: string;
};

const textStyles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    marginBottom: 4,
  },
  link: {
    fontSize: 16,
    color: '#1D3D47',
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export function ThemedText({ 
  type = 'body', 
  style, 
  className, 
  ...otherProps 
}: ThemedTextProps) {
  return (
    <Text 
      style={[textStyles[type], style]} 
      className={className}
      {...otherProps} 
    />
  );
}
