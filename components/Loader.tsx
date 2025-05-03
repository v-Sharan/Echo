import { StyleSheet, ActivityIndicator } from "react-native";
import React from "react";
import View from "./View";
import { useTheme } from "@react-navigation/native";
import { MyTheme } from "@/constants/Colors";

const Loader = () => {
  const { colors } = useTheme() as MyTheme;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({});
