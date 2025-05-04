import { MyTheme } from "@/constants/Colors";
import { api } from "@/convex/_generated/api";
import { usePushNotifications } from "@/hooks/usePushExpoNotification";
import { useAuth } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useMutation } from "convex/react";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";

const TabsLayout = () => {
  const { isSignedIn } = useAuth();
  const { colors } = useTheme() as MyTheme;

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/login"} />;
  }
  const expotoken = usePushNotifications();
  const recordNotification = useMutation(
    api.notifications.recordPushNotificationToken
  );

  useEffect(() => {
    if (!expotoken) return;
    (async () => {
      try {
        await recordNotification({ token: expotoken });
      } catch (e: any) {
        console.log("Error in Record", e);
      }
    })();
  }, [expotoken]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.border,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Bookmarks"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Create"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Notification"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
