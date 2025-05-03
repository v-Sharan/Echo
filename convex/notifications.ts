import { query } from "./_generated/server";
import { getAuthendicatedUser } from "./user";

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
