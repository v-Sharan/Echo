import { MyTheme } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Text from "./Text";
import View from "./View";

const Notification = (notification: any) => {
  const { colors } = useTheme() as MyTheme;

  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/user/${notification.sender._id}`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={notification.sender.image}
              style={[styles.avatar, { borderColor: colors.surface }]}
              contentFit="cover"
              transition={200}
            />
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.surface,
                },
              ]}
            >
              {notification.type === "like" ? (
                <Ionicons name="heart" size={14} color={colors.primary} />
              ) : notification.type === "follow" ? (
                <Ionicons name="person-add" size={14} color="#8B5CF6" />
              ) : (
                <Ionicons name="chatbubble" size={14} color="#3832F6" />
              )}
            </View>
          </TouchableOpacity>
        </Link>
        <View style={styles.notificationInfo}>
          <Link href={`/user/${notification.sender._id}`} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>
                {notification.sender.username}
              </Text>
            </TouchableOpacity>
          </Link>
          <Text>
            {notification.type === "follow"
              ? "started following you"
              : notification.type === "like"
                ? "liked your post"
                : `commented: ${notification.comment}`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>
      {notification.post && (
        <Image
          source={notification.post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    // borderColor: COLORS.surface,
  },
  iconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    // backgroundColor: COLORS.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    // borderColor: COLORS.surface,
  },
  notificationInfo: {
    flex: 1,
  },
  username: {
    // color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  action: {
    // color: COLORS.grey,
    fontSize: 14,
    marginBottom: 2,
  },
  timeAgo: {
    // color: COLORS.grey,
    fontSize: 12,
  },
  postImage: {
    width: 44,
    height: 44,
    borderRadius: 3,
  },
});
