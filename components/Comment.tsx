import { StyleSheet } from "react-native";
import React from "react";
import Text from "./Text";
import View from "./View";
import { Id } from "@/convex/_generated/dataModel";
import { Image } from "expo-image";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@react-navigation/native";
import { MyTheme } from "@/constants/Colors";

interface Comment {
  _id: Id<"comments">;
  _creationTime: number;
  userId: Id<"users">;
  postId: Id<"posts">;
  content: string;
  user: {
    fullname: string;
    image: string;
  };
}

const Comment = ({ comment }: { comment: Comment }) => {
  const { colors } = useTheme() as MyTheme;
  return (
    <View style={styles.commentContainer}>
      <Image source={comment.user.image} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={[styles.commentTime, { color: colors.surfaceLight }]}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
};

export default Comment;

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    // color: COLORS.white,
    fontWeight: "500",
    marginBottom: 4,
  },
  commentText: {
    // color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    // color: COLORS.grey,
    fontSize: 12,
    marginTop: 4,
  },
});
