// CustomView.tsx

import React from "react";
import { View as NativeView, ViewProps } from "react-native";
import { useTheme } from "@react-navigation/native"; // your theme context/provider

interface CustomViewProps extends ViewProps {
  lightColor?: string; // Color for Light Theme
  darkColor?: string; // Color for Dark Theme
}

const View: React.FC<CustomViewProps> = ({
  lightColor,
  darkColor,
  style,
  children,
  ...rest
}) => {
  const { dark, colors } = useTheme(); // Assume theme = 'light' | 'dark'

  let backgroundColor = colors.background; // default fallback

  if (!dark && lightColor) {
    backgroundColor = lightColor;
  } else if (dark && darkColor) {
    backgroundColor = darkColor;
  }

  return (
    <NativeView style={[{ backgroundColor }, style]} {...rest}>
      {children}
    </NativeView>
  );
};

export default View;
