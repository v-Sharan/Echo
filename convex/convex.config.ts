// convex/convex.config.ts
import pushNotifications from "@convex-dev/expo-push-notifications/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(pushNotifications);
// other components

export default app;
