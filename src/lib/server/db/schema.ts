import { relations } from 'drizzle-orm';
import { boolean, integer, pgTableCreator, text, timestamp, varchar } from 'drizzle-orm/pg-core';
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
	updatedAt: timestamp().notNull()

	// TODO: Add relation to tags table / add array of strings?
	// tags,
});

// TODO: Add users -- currently there will only be me (admin)
export const user = pgTable('user', {
	id: varchar({ length: SHORT_ID_LENGTH }).primaryKey().$default(shortId),
	username: text().notNull().unique(),
	email: text().notNull(),
	password: text().notNull(),
	role: text({ enum: ['admin', 'user', 'creator'] }),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date())
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
		.$onUpdate(() => new Date())
});

export const userLink = pgTable('user_link', {
	userId: varchar({ length: SHORT_ID_LENGTH })
		.notNull()
		.references(() => user.id),
	linkId: varchar({ length: SHORT_ID_LENGTH })
		.notNull()
		.references(() => link.shortId),
	status: text({
		enum: ['read', 'unread']
	})
		.notNull()
		.default('unread'),
	favorite: boolean().notNull().default(false),

	// TODO: Add tags

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date())
});

export const userRelations = relations(user, ({ many }) => ({
	userToLinks: many(userLink)
}));

export const linkRelations = relations(link, ({ many }) => ({
	linkToUsers: many(userLink)
}));

export const usersToLinksRelations = relations(userLink, ({ one }) => ({
	user: one(user, {
		fields: [userLink.userId],
		references: [user.id]
	}),
	link: one(link, {
		fields: [userLink.linkId],
		references: [link.shortId]
	})
}));

export type Post = typeof post.$inferSelect;
export type User = typeof user.$inferSelect;

// TODO: Track views by users
