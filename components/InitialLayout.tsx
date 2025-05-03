import { useAuth, useClerk } from "@clerk/clerk-expo";
import { useTheme } from "@react-navigation/native";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { dark, colors } = useTheme();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    signOut();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const isAuthScreen = segments[0] == "(auth)";

    if (!isSignedIn && !isAuthScreen) router.replace("/(auth)/login");
    else if (isSignedIn && isAuthScreen) router.replace("/(tabs)");
  }, [segments, isLoaded, isSignedIn]);

  const onLayoutRootView = useCallback(async () => {
    if (isLoaded) await SplashScreen.hideAsync();
  }, [isLoaded]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar
          animated
          style={dark ? "light" : "dark"}
          backgroundColor={colors.background}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default InitialLayout;
