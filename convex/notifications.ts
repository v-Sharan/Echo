import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthendicatedUser } from "./user";

const pushNotifications = new PushNotifications(components.pushNotifications);

export const getNotifications = query({
  handler: async (ctx) => {
    const currentUser = await getAuthendicatedUser(ctx);

    const notifications = await ctx.db
      .query("notification")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .collect();

    const notificationsWithInfo = await Promise.all(
      notifications.map(async (notification) => {
        const sender = (await ctx.db.get(notification.senderId))!;
        let post = null;
        let comment = null;

        if (notification.postId) {
          post = (await ctx.db.get(notification.postId))!;
        }

        if (notification.commentId) {
          comment = (await ctx.db.get(notification.commentId))!;
        }

        return {
          ...notification,
          sender: {
            _id: sender._id,
            image: sender.image,
            username: sender.username,
          },
          post,
          comment: comment?.content,
        };
      })
    );

    return notificationsWithInfo.filter(
      (notification): notification is NonNullable<typeof notification> =>
        notification !== null
    );
  },
});

export const recordPushNotificationToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthendicatedUser(ctx);
    // Record push notification tokens
    await pushNotifications.recordToken(ctx, {
      userId: currentUser._id,
      pushToken: args.token,
    });

    // Query the push notification status for a user
    const status = await pushNotifications.getStatusForUser(ctx, {
      userId: currentUser._id,
    });
    if (!status.hasToken) {
      throw new ConvexError("Failed to record token");
    }
  },
});

export const sendPushNotification = internalMutation({
  args: { title: v.string(), to: v.id("users") },
  handler: async (ctx, args) => {
    // Sending a notification
    return pushNotifications.sendPushNotification(ctx, {
      //@ts-ignore
      userId: args.to,
      notification: {
        title: args.title,
      },
    });
  },
});

export const getNotificationStatus = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const notification = await pushNotifications.getNotification(ctx, args);
    return notification?.state;
  },
});
