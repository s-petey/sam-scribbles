import { pgTableCreator, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { SHORT_ID_LENGTH, shortId } from '../../shortener';

const pgTable = pgTableCreator((name) => `scribbles_${name}`);

export const post = pgTable('post', {
	id: varchar({ length: SHORT_ID_LENGTH }).primaryKey().$default(shortId),
	title: text().notNull(),
	imageUrl: text(),
	content: text().notNull(),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date())
});

// TODO: Add users -- currently there will only be me (admin)
export const user = pgTable('user', {
	id: varchar({ length: SHORT_ID_LENGTH }).primaryKey().$default(shortId),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	role: text({ enum: ['admin', 'user', 'creator'] }),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date())
});

export type Post = typeof post.$inferSelect;
export type User = typeof user.$inferSelect;

// TODO: Track views by users

// TODO:
