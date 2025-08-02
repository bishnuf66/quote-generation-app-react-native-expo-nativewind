import React from "react";
import { Text, TextProps } from "react-native";

export function ThemedText(props: TextProps & { className?: string }) {
  const { style, className, ...otherProps } = props;
  // You can enhance this to use NativeWind if desired
  return <Text style={style} {...otherProps} />;
}
