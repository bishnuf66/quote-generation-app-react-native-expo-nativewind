// Global type definitions for the project

declare module "react-native-view-shot" {
  import { Component } from "react";
  import { ViewStyle } from "react-native";

  export interface CaptureOptions {
    format?: "png" | "jpg" | "webm" | "raw";
    quality?: number;
    result?: "tmpfile" | "base64" | "data-uri" | "zip-base64";
    height?: number;
    width?: number;
    snapshotContentContainer?: boolean;
  }

  export default class ViewShot extends Component<{
    children: React.ReactNode;
    style?: ViewStyle;
    options?: CaptureOptions;
  }> {
    capture(options?: CaptureOptions): Promise<string>;
  }
}

// Extend Animated.Value to include private properties for compatibility
declare module "react-native" {
  namespace Animated {
    interface Value {
      _value?: number;
      _offset?: number;
    }
  }
}

// Global utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
