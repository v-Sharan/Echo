// CustomView.tsx

import React from "react";
import { Text as NativeText, TextProps } from "react-native";
import { useTheme } from "@react-navigation/native"; // your theme context/provider

interface CustomViewProps extends TextProps {
  lightColor?: string; // Color for Light Theme
  darkColor?: string; // Color for Dark Theme
}

const Text: React.FC<CustomViewProps> = ({
  lightColor,
  darkColor,
  style,
  children,
  ...rest
}) => {
  const { dark, colors } = useTheme(); // Assume theme = 'light' | 'dark'

  let color = colors.text; // default fallback

  if (!dark && lightColor) {
    color = lightColor;
  } else if (dark && darkColor) {
    color = darkColor;
  }

  return (
    <NativeText style={[{ color }, style]} {...rest}>
      {children}
    </NativeText>
  );
};

export default Text;
