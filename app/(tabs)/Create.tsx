import { Text, View } from "@/components";
import { MyTheme } from "@/constants/Colors";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useMutation } from "convex/react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get("window");

const CreateBlog = () => {
  const router = useRouter();
  const { user } = useUser();
  const { colors } = useTheme() as MyTheme;
  const [caption, setCaption] = useState<string>("");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [mineType, setMineType] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const generateUploadPhoto = useMutation(api.post.generateUploadUrl);
  const createPost = useMutation(api.post.createPost);

  const handleShare = async () => {
    if (!selectedImg) return;

    try {
      setIsSharing(true);
      const uploadUrl = await generateUploadPhoto();
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImg,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: mineType ? mineType : "image/jpeg",
        }
      );

      if (uploadResult.status !== 200) throw new Error("Upload Failed");

      const { storageId } = JSON.parse(uploadResult.body);
      await createPost({ storageId });

      router.push("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error Occured while Creating Post");
      console.log(err);
    } finally {
      setIsSharing(false);
      setSelectedImg(null);
      setMineType(null);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImg(result.assets[0].uri);
      if (result.assets[0].mimeType) setMineType(result.assets[0].mimeType);
      else setMineType(null);
    }
  };

  if (!selectedImg) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 28 }} />
        </View>
        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons name="images-outline" size={48} color={colors.text} />
          <Text style={styles.emptyImageText}>Tap to select Image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      keyboardShouldPersistTaps="never"
      // contentOffset={{ x: 0, y: 100 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View style={styles.container}>
          <View
            style={[styles.header, { borderBottomColor: colors.surfaceLight }]}
          >
            <TouchableOpacity
              onPress={() => {
                setSelectedImg(null);
                setCaption("");
              }}
              disabled={isSharing}
            >
              <Ionicons
                name="close-outline"
                size={28}
                color={isSharing ? colors.surfaceLight : colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Post</Text>
            <TouchableOpacity
              style={[
                styles.shareButton,
                isSharing && styles.shareButtonDisabled,
              ]}
              onPress={handleShare}
              disabled={isSharing || !selectedImg}
            >
              {isSharing ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Ionicons
                  name="share-outline"
                  color={colors.primary}
                  size={24}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.content, isSharing && styles.contentDisabled]}>
            <View style={styles.imageSection}>
              <Image
                source={selectedImg}
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  darkColor={colors.primary}
                  lightColor={colors.primary}
                  style={styles.changeImageText}
                >
                  Change
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image
                  style={styles.userAvatar}
                  source={user?.imageUrl}
                  contentFit="cover"
                  transition={200}
                />
                <TextInput
                  onPress={() => console.log("Textinput")}
                  style={[styles.captionInput, { color: colors.text }]}
                  placeholder="Write a caption...."
                  placeholderTextColor={colors.text}
                  multiline
                  value={caption}
                  onChangeText={setCaption}
                  editable={!isSharing}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default CreateBlog;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  contentDisabled: {
    opacity: 0.7,
  },
  shareButton: {
    minWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyImageText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageSection: {
    width: width,
    height: width,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputSection: {
    padding: 16,
    flex: 1,
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  captionInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    minHeight: 40,
  },
});
