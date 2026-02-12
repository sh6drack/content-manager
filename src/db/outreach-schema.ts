import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./schema";

// ─── Enums ───

export const outreachStatusEnum = pgEnum("outreach_status", [
  "draft",
  "active",
  "paused",
  "completed",
]);

export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "replied",
  "bounced",
  "failed",
]);

export const vcStageEnum = pgEnum("vc_stage", [
  "pre-seed",
  "seed",
  "series-a",
  "series-b",
  "growth",
  "multi-stage",
]);

// ─── VC Contacts ───

export const vcContacts = pgTable("vc_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  firm: varchar("firm", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  focus: jsonb("focus").$type<string[]>(),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  stage: vcStageEnum("stage"),
  checkSize: varchar("check_size", { length: 100 }),
  location: varchar("location", { length: 255 }),
  notes: text("notes"),
  source: varchar("source", { length: 100 }), // where we got this contact
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Outreach Campaigns ───

export const outreachCampaigns = pgTable("outreach_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  fromName: varchar("from_name", { length: 255 }).notNull(),
  templateId: varchar("template_id", { length: 100 }),
  status: outreachStatusEnum("status").default("draft").notNull(),
  totalRecipients: integer("total_recipients").default(0).notNull(),
  sent: integer("sent").default(0).notNull(),
  opened: integer("opened").default(0).notNull(),
  replied: integer("replied").default(0).notNull(),
  ratePerHour: integer("rate_per_hour").default(80).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Outreach Emails (individual sends) ───

export const outreachEmails = pgTable("outreach_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: varchar("campaign_id", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactFirm: varchar("contact_firm", { length: 255 }).notNull(),
  subject: text("subject").notNull(),
  status: emailStatusEnum("status").default("pending").notNull(),
  resendId: varchar("resend_id", { length: 255 }),
  error: text("error"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  openedAt: timestamp("opened_at", { mode: "date" }),
  clickedAt: timestamp("clicked_at", { mode: "date" }),
  repliedAt: timestamp("replied_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Reddit Outreach Posts ───

export const redditPosts = pgTable("reddit_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subreddit: varchar("subreddit", { length: 255 }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  nativePostId: varchar("native_post_id", { length: 255 }),
  nativePostUrl: text("native_post_url"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  upvotes: integer("upvotes").default(0),
  comments: integer("comments").default(0),
  error: text("error"),
  scheduledFor: timestamp("scheduled_for", { mode: "date" }),
  postedAt: timestamp("posted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
