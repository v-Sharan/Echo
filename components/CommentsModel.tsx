import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import Text from "./Text";
import View from "./View";
import { useTheme } from "@react-navigation/native";
import { MyTheme } from "@/constants/Colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import Loader from "./Loader";
import Comment from "./Comment";

type CommentProps = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
};

const { width } = Dimensions.get("screen");

const CommentsModel = ({
  postId,
  visible,
  onClose,
  onCommentAdded,
}: CommentProps) => {
  const [newComment, setNewComment] = useState<string>("");

  const { colors } = useTheme() as MyTheme;

  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.addComments);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        content: newComment,
        postId: postId,
      });

      setNewComment("");
      //   onCommentAdded();
    } catch (error: any) {
      Alert.alert(`SomeThing went wrong!.${error?.message}`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={({ _id }) => _id}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={styles.commentsList}
          />
        )}

        <View style={[styles.commentInput, { borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            placeholder="Add a Comment..."
            placeholderTextColor={colors.text}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />

          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim()}
            style={[!newComment.trim() && styles.postButtonDisabled]}
          >
            <Feather name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentsModel;

const styles = StyleSheet.create({
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
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  postButtonDisabled: {
    opacity: 0.7,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
