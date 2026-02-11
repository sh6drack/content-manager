import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───

export const platformEnum = pgEnum("platform", [
  "x",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "threads",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "publishing",
  "published",
  "failed",
]);

export const postPlatformStatusEnum = pgEnum("post_platform_status", [
  "pending",
  "publishing",
  "published",
  "failed",
]);

// ─── Auth.js Tables ───

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    providerProviderAccountId: uniqueIndex(
      "provider_provider_account_id_idx"
    ).on(table.provider, table.providerAccountId),
  })
);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    identifierToken: uniqueIndex("identifier_token_idx").on(
      table.identifier,
      table.token
    ),
  })
);

// ─── Application Tables ───

export const platformConnections = pgTable(
  "platform_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    platformAccountId: varchar("platform_account_id", {
      length: 255,
    }).notNull(),
    platformUsername: varchar("platform_username", { length: 255 }),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
    scopes: text("scopes"),
    metadata: jsonb("metadata"),
    connectedAt: timestamp("connected_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userPlatformAccount: uniqueIndex("user_platform_account_idx").on(
      table.userId,
      table.platform,
      table.platformAccountId
    ),
  })
);

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  status: postStatusEnum("status").default("draft").notNull(),
  scheduledFor: timestamp("scheduled_for", { mode: "date" }),
  publishedAt: timestamp("published_at", { mode: "date" }),
  retryCount: integer("retry_count").default(0).notNull(),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const postPlatforms = pgTable(
  "post_platforms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    platformConnectionId: uuid("platform_connection_id").references(
      () => platformConnections.id
    ),
    nativePostId: varchar("native_post_id", { length: 255 }),
    nativePostUrl: text("native_post_url"),
    status: postPlatformStatusEnum("status").default("pending").notNull(),
    error: text("error"),
    publishedAt: timestamp("published_at", { mode: "date" }),
  },
  (table) => ({
    postPlatform: uniqueIndex("post_platform_idx").on(
      table.postId,
      table.platform
    ),
  })
);

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "set null" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 500 }),
  mimeType: varchar("mime_type", { length: 100 }),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  postPlatformId: uuid("post_platform_id")
    .notNull()
    .references(() => postPlatforms.id, { onDelete: "cascade" }),
  impressions: integer("impressions").default(0).notNull(),
  engagements: integer("engagements").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  reach: integer("reach").default(0).notNull(),
  snapshotAt: timestamp("snapshot_at", { mode: "date" }).defaultNow().notNull(),
});
