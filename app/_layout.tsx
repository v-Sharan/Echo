import { InitialLayout } from "@/components";
import { DarkTheme, LightTheme } from "@/constants/Colors";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const isDark = useColorScheme() == "dark";

  return (
    <ClerkAndConvexProvider>
      <ThemeProvider value={isDark ? DarkTheme : LightTheme}>
        <InitialLayout />
      </ThemeProvider>
    </ClerkAndConvexProvider>
  );
}
