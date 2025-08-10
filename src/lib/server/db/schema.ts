import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { SHORT_ID_LENGTH, shortId } from '../../shortener';

const pgTable = pgTableCreator((name) => `scribbles_${name}`);

export const post = pgTable('post', {
  id: varchar({ length: SHORT_ID_LENGTH }).primaryKey().$default(shortId),
  slug: text().notNull().unique(),
  title: text().notNull(),
  isPrivate: boolean().notNull().default(true),
  preview: text().notNull(),
  previewHtml: text().notNull(),
  readingTimeSeconds: integer().notNull(),
  readingTimeWords: integer().notNull(),

  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),

  // TODO: Add relation to tags table / add array of strings?
  // tags,
});

// TODO: Make the links table, which I can describe
// check off, share, edit, delete, etc. -- They should be "private" or "shared"
export const link = pgTable('link', {
  shortId: varchar({ length: SHORT_ID_LENGTH }).primaryKey().$default(shortId),
  // TODO: Trim tailing slashes!
  link: text().notNull().unique(),
  private: boolean().notNull().default(false),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const tag = pgTable('tag', { name: text().primaryKey().notNull() });

export const linksToTags = pgTable(
  'links_to_tags',
  {
    linkId: varchar({ length: SHORT_ID_LENGTH })
      .notNull()
      .references(() => link.shortId, { onDelete: 'cascade' }),
    tag: text()
      .notNull()
      .references(() => tag.name),
  },
  (table) => [
    primaryKey({
      name: 'linkIdTagIndex',
      columns: [table.linkId, table.tag],
    }),
  ],
);

export const postsToTags = pgTable(
  'posts_to_tags',
  {
    postId: varchar({ length: SHORT_ID_LENGTH })
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    tag: text()
      .notNull()
      .references(() => tag.name),
  },
  (t) => [
    primaryKey({
      name: 'postIdTagIndex',
      columns: [t.postId, t.tag],
    }),
  ],
);

export const postsToRelatedPosts = pgTable(
  'posts_to_related_posts',
  {
    postId: varchar({ length: SHORT_ID_LENGTH })
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    relatedPostId: varchar({ length: SHORT_ID_LENGTH })
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: 'postIdRelatedPostIdIndex',
      columns: [t.postId, t.relatedPostId],
    }),
  ],
);

// TODO: Add users -- currently there will only be me (admin)
export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  role: text({ enum: ['admin', 'user', 'creator'] }),
  image: text(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const session = pgTable('session', {
  id: text().primaryKey(),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

export const account = pgTable('account', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  scope: text(),
  password: text(),

  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),

  createdAt: timestamp().notNull(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const verification = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),

  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userLink = pgTable('user_link', {
  userId: text()
    .notNull()
    .references(() => user.id),
  linkId: varchar({ length: SHORT_ID_LENGTH })
    .notNull()
    .references(() => link.shortId),
  status: text({ enum: ['read', 'unread'] })
    .notNull()
    .default('unread'),
  favorite: boolean().notNull().default(false),

  // TODO: Add tags

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(post, { fields: [postsToTags.postId], references: [post.id] }),
  tag: one(tag, { fields: [postsToTags.tag], references: [tag.name] }),
}));

export const postsToRelatedPostsRelations = relations(postsToRelatedPosts, ({ one }) => ({
  post: one(post, { fields: [postsToRelatedPosts.postId], references: [post.id] }),
  relatedPost: one(post, { fields: [postsToRelatedPosts.relatedPostId], references: [post.id] }),
}));

export const linkRelations = relations(link, ({ many }) => ({
  users: many(userLink),
  tags: many(linksToTags),
}));

export const linksToTagsRelations = relations(linksToTags, ({ one }) => ({
  link: one(link, { fields: [linksToTags.linkId], references: [link.shortId] }),
  tag: one(tag, { fields: [linksToTags.tag], references: [tag.name] }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  links: many(linksToTags),
  posts: many(postsToTags),
}));

export const postRelations = relations(post, ({ many }) => ({
  tags: many(postsToTags),
  relatedPosts: many(postsToRelatedPosts, { relationName: 'postToRelated' }),
  relatedFromPosts: many(postsToRelatedPosts, { relationName: 'relatedToPost' }),
}));

export const userRelations = relations(user, ({ many }) => ({ userToLinks: many(userLink) }));

export const usersToLinksRelations = relations(userLink, ({ one }) => ({
  user: one(user, { fields: [userLink.userId], references: [user.id] }),
  link: one(link, { fields: [userLink.linkId], references: [link.shortId] }),
}));

export type Post = typeof post.$inferSelect;
export type User = typeof user.$inferSelect;
export type Link = typeof link.$inferSelect;
export type Tag = typeof tag.$inferSelect;

// TODO: Track views by users
