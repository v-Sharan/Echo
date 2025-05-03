import { CommentsModel, Loader, Text, View } from "@/components";
import { MyTheme } from "@/constants/Colors";
import { api } from "@/convex/_generated/api";
import { PostProps } from "@/types/post.types";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");

const Post = ({ post }: PostProps) => {
  const { colors } = useTheme() as MyTheme;
  const [visible, setVisible] = useState<boolean>(false);

  const { user } = useUser();

  const CurrentUser = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip"
  );

  const toggleLike = useMutation(api.post.toogleLike);

  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const deletePostByUser = useMutation(api.post.deletePost);

  const handleToggleLike = async () => {
    try {
      await toggleLike({ postId: post._id });
    } catch (err: any) {
      Alert.alert(`Oops!. Error Occured in Liking a Post. ${err?.message}`);
    }
  };

  const hanldeToogleBookmark = async () => {
    try {
      await toggleBookmark({ postId: post._id });
    } catch (err: any) {
      Alert.alert(`Oops!. Error Occured While add in Bookmark.${err?.message}`);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePostByUser({ postId: post._id });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert(`Oops!. Error Occured in Deleting a Post.${err?.message}`);
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Link href={`/user/${post.author._id}`} asChild>
          <TouchableOpacity style={styles.postHeader}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy={"memory-disk"}
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>
        {post.author._id === CurrentUser?._id ? (
          <TouchableOpacity onPress={handleDeletePost}>
            <Ionicons name="trash-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy={"memory-disk"}
      />
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleToggleLike}>
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={24}
              color={post.isLiked ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setVisible(true)}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={hanldeToogleBookmark}>
          <Ionicons
            name={post.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes > 0
            ? `${post.likes.toLocaleString()} likes`
            : "Be the first to likes"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}
        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setVisible(true)}>
            <Text style={styles.commentText}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>
      <CommentsModel
        onClose={() => setVisible(false)}
        postId={post._id}
        visible={visible}
        onCommentAdded={() => {}}
      />
    </View>
  );
};

export default function Index() {
  const { colors } = useTheme() as MyTheme;

  const { signOut } = useClerk();

  const posts = useQuery(api.post.getFeeds);

  if (posts === undefined) return <Loader />;

  if (posts.length === 0)
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ fontSize: 28 }}>Post not Found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          SpotLight
        </Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        keyExtractor={({ _id }) => _id}
        // contentContainerStyle={{ paddingBottom: 60 }}
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    // fontFamily: "JetBrainsMono-Medium",
    // color: COLORS.primary,
  },
  storiesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    // borderBottomColor: COLORS.surface,
  },
  storyWrapper: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 72,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    // backgroundColor: COLORS.background,
    borderWidth: 2,
    // borderColor: COLORS.primary,
    marginBottom: 4,
  },
  noStory: {
    // borderColor: COLORS.grey,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    // borderColor: COLORS.background,
  },
  storyUsername: {
    fontSize: 11,
    // color: COLORS.white,
    textAlign: "center",
  },
  post: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postUsername: {
    fontSize: 14,
    fontWeight: "600",
    // color: COLORS.white,
  },
  postImage: {
    width: width,
    height: width,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  postActionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  postInfo: {
    paddingHorizontal: 12,
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    // color: COLORS.white,
    marginBottom: 6,
  },
  captionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  captionUsername: {
    fontSize: 14,
    fontWeight: "600",
    // color: COLORS.white,
    marginRight: 6,
  },
  captionText: {
    fontSize: 14,
    // color: COLORS.white,
    flex: 1,
  },
  commentsText: {
    fontSize: 14,
    // color: COLORS.grey,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    // color: COLORS.grey,
    marginBottom: 8,
  },
  modalContainer: {
    // backgroundColor: COLORS.background,
    marginBottom: Platform.OS === "ios" ? 44 : 0,
    flex: 1,
    marginTop: Platform.OS === "ios" ? 44 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 0.5,
    // borderBottomColor: COLORS.surface,
  },
  modalTitle: {
    // color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    // borderBottomColor: COLORS.surface,
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
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    // borderTopColor: COLORS.surface,
    // backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    // color: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    // backgroundColor: COLORS.surface,
    borderRadius: 20,
    fontSize: 14,
  },
  postButton: {
    // color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
