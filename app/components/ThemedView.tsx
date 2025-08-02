import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export function ThemedView(props: ViewProps & { className?: string }) {
  const { style, className, ...otherProps } = props;
  // You can enhance this to use NativeWind if desired
  return <View style={style} {...otherProps} />;
}
