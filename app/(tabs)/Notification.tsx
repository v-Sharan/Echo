import { Loader, Notification, Text, View } from "@/components";
import { MyTheme } from "@/constants/Colors";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "convex/react";
import React from "react";
import { FlatList, StyleSheet } from "react-native";

const NotificationScreen = () => {
  const { colors } = useTheme() as MyTheme;
  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) return <Loader />;

  if (notifications.length === 0)
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons
          name="notifications-outline"
          size={48}
          color={colors.primary}
        />
        <Text style={{ fontSize: 28 }}>No Notifications</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Notifications
        </Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => <Notification {...item} />}
        keyExtractor={({ _id }) => _id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default NotificationScreen;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    // borderBottomColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 24,
    // fontFamily: "JetBrainsMono-Medium",
    // color: COLORS.primary,
  },
  listContainer: {
    padding: 16,
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
