import { Loader, Text, View } from "@/components";
import { MyTheme } from "@/constants/Colors";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

const { width, height } = Dimensions.get("window");

type ProfileEdite = {
  fullname: string;
  bio: string;
};

const profile = () => {
  const { signOut, userId } = useAuth();
  const { colors } = useTheme() as MyTheme;
  const [isEditModelVisible, setIsEditModelVisible] = useState<boolean>(false);
  const currentUser = useQuery(
    api.user.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const [editedProfile, setEditedProfile] = useState<ProfileEdite>({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  const posts = useQuery(api.post.getPostByUser, {});

  const updateProfile = useMutation(api.user.updateProfile);

  if (!currentUser || posts === undefined) return <Loader />;

  const handleEditProfile = () => {};

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editedProfile);
    } catch (error: any) {
      Alert.alert(`Something went wrong!.${error?.message}`);
    } finally {
      setIsEditModelVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={currentUser.image}
                style={[styles.avatar, { borderColor: colors.surface }]}
                contentFit="cover"
                transition={200}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
          <Text style={styles.name}>{currentUser.fullname}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: colors.tabBarInactive },
              ]}
              onPress={() => setIsEditModelVisible(true)}
            >
              <Text
                style={styles.editButtonText}
                lightColor={colors.primary}
                darkColor={colors.primary}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.shareButton,
                { backgroundColor: colors.tabBarInactive },
              ]}
            >
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {posts.length === 0 ? (
          <View style={styles.noPostsContainer}>
            <Text style={[styles.noPostsText, { color: colors.text }]}>
              No Posts Yet!
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => setSelectedPost(item)}
              >
                <Image
                  source={item.imageUrl}
                  style={styles.gridImage}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
      <Modal
        visible={isEditModelVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModelVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModelVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.card },
                  ]}
                  value={editedProfile.fullname}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, fullname: text }))
                  }
                  placeholderTextColor={colors.text}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.bioInput,
                    { color: colors.text, backgroundColor: colors.card },
                  ]}
                  value={editedProfile.bio}
                  multiline
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, bio: text }))
                  }
                  numberOfLines={4}
                  placeholderTextColor={colors.text}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={styles.saveButtonText}
                  lightColor="#fff"
                  darkColor="#1a1a1a"
                >
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Image
                source={selectedPost.imageUrl}
                cachePolicy={"memory-disk"}
                style={styles.postDetailImage}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    // borderBottomColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    // color: COLORS.white,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  profileInfo: {
    padding: 16,
  },
  avatarAndStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 32,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    // borderColor: COLORS.surface,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 17,
    fontWeight: "700",
    // color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    // color: COLORS.grey,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    // color: COLORS.white,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    // color: COLORS.white,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    // backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    // color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  shareButton: {
    // backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    // backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    // color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    // color: COLORS.grey,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    // backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    // color: COLORS.white,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    // backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    // color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
  },
  postDetailContainer: {
    // backgroundColor: COLORS.background,
    maxHeight: height * 0.9,
  },
  postDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 12,
    borderBottomWidth: 0.5,
    // borderBottomColor: COLORS.surface,
  },
  postDetailImage: {
    width: width,
    height: width,
  },
  followButton: {
    // backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  followingButton: {
    // backgroundColor: COLORS.surface,
    borderWidth: 1,
    // borderColor: COLORS.primary,
  },
  followButtonText: {
    // color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  followingButtonText: {
    // color: COLORS.white,
    textAlign: "center",
  },
  noPostsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
    flex: 1,
  },
  noPostsText: {
    // color: COLORS.grey,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    // color: COLORS.white,
  },
});
