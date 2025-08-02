import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export function ThemedText(props: TextProps & { className?: string }) {
  const { style, className, ...otherProps } = props;
  // You can enhance this to use NativeWind if desired
  return <Text style={style} {...otherProps} />;
}
