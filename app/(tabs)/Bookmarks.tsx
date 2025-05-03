import { Loader, Text, View } from "@/components";
import { MyTheme } from "@/constants/Colors";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import React from "react";
import { FlatList, StyleSheet } from "react-native";

const Bookmarks = () => {
  const { colors } = useTheme() as MyTheme;
  const bookmarks = useQuery(api.bookmarks.getBookmarkedPost);

  if (bookmarks === undefined) return <Loader />;

  if (bookmarks.length === 0)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 28 }}>Bookmarks not Found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Bookmarks
        </Text>
      </View>
      <FlatList
        contentContainerStyle={{
          padding: 8,
        }}
        numColumns={2}
        data={bookmarks}
        renderItem={({ item }) => (
          <View style={{ width: "50%", padding: 1, margin: 2 }}>
            <Image
              source={item.imageUrl}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 8 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        )}
        keyExtractor={({ _id }) => _id}
      />
    </View>
  );
};

export default Bookmarks;

const styles = StyleSheet.create({
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
  },
});
