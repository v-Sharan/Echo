import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  View as NativeView,
} from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { MyTheme } from "@/constants/Colors";
import { useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { View, Text } from "@/components";

const { width, height } = Dimensions.get("window");
const Loing = () => {
  const { colors, dark } = useTheme() as MyTheme;
  const { startSSOFlow } = useSSO();

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert(`Google Authendication Error: ${error?.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.appName, { color: colors.primary }]}>Spotlight</Text>
      <Text style={[styles.tagline, { color: colors.text }]}>
        Don't miss anything
      </Text>
      <View style={styles.illustrationContainer}>
        <LottieView
          autoPlay
          style={styles.illustration}
          source={
            dark
              ? require("@/assets/Loitte/Animation-dark.json")
              : require("@/assets/Loitte/Animation-light.json")
          }
          resizeMode="cover"
        />
      </View>
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.primary }]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
        >
          <NativeView style={styles.googleIconContainer}>
            <Ionicons
              name={"logo-google"}
              size={20}
              color={colors.background}
            />
          </NativeView>
          <Text style={[styles.googleButtonText, { color: colors.background }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By Countine, you agreed to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

export default Loing;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // backgroundColor: COLORS.background,
  },
  brandSection: {
    alignItems: "center",
    marginTop: height * 0.12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    fontFamily: "JetBrainsMono-Medium",
    // color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    // color: COLORS.grey,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustration: {
    width: width * 0.55,
    height: width * 0.55,
    maxHeight: 280,
    // backgroundColor: "rgba(74, 222, 128, 0.15)",
  },
  loginSection: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    // color: COLORS.surface,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    // color: COLORS.grey,
    maxWidth: 280,
  },
});
