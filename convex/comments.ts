import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthendicatedUser } from "./user";

export const addComments = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthendicatedUser(ctx);

    const post = await ctx.db.get(args.postId);

    if (!post) throw new ConvexError("Post not Found!.");

    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      content: args.content,
      postId: args.postId,
    });

    await ctx.db.patch(args.postId, {
      comments: post.comments + 1,
    });

    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notification", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId: commentId,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = (await ctx.db.get(comment.userId))!;

        return {
          ...comment,
          user: {
            fullname: user?.fullname,
            image: user?.image,
          },
        };
      })
    );

    return commentsWithInfo;
  },
});
