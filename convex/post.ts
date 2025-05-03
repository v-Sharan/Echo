import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthendicatedUser } from "./user";

export const generateUploadUrl = mutation(async (ctx) => {
  await getAuthendicatedUser(ctx);
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User Not found!");

    const imageUrl = await ctx.storage.getUrl(args.storageId);

    if (!imageUrl) throw new Error("Image Not found!");

    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      comments: 0,
      likes: 0,
    });

    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeeds = query({
  handler: async (ctx) => {
    const currentUser = await getAuthendicatedUser(ctx);

    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length === 0) return [];

    const postWithInfo = await Promise.all(
      posts.map(async (post) => {
        const author = (await ctx.db.get(post.userId))!;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: author?._id,
            username: author?.username,
            image: author?.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );

    return postWithInfo;
  },
});

export const toogleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthendicatedUser(ctx);

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);

    if (!post) throw new Error("Post not Found");

    if (existing) {
      const notification = await ctx.db
        .query("notification")
        .withIndex("by_post_sender_type_receiver", (q) =>
          q
            .eq("postId", args.postId)
            .eq("senderId", currentUser._id)
            .eq("type", "like")
        )
        .unique();
      if (notification) ctx.db.delete(notification._id);
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false;
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notification", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }
      return true;
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthendicatedUser(ctx);

    const post = await ctx.db.get(args.postId);

    if (!post) throw new Error("Post not Found!.");

    if (post.userId !== currentUser._id)
      throw new Error("Not Authorizef for deleting this post");

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const bookmarks = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    const notifications = await ctx.db
      .query("notification")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    await ctx.storage.delete(post.storageId);

    await ctx.db.delete(args.postId);

    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    });
  },
});

export const getPostByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId
      ? await ctx.db.get(args.userId)
      : await getAuthendicatedUser(ctx);

    if (!user) throw new ConvexError("User Not Found!.");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return posts;
  },
});
