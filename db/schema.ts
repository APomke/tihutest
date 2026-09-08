import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const results = sqliteTable('results', {
  id: text('id').primaryKey(), title: text('title').notNull(), model: text('model').notNull(),
  description: text('description').notNull().default(''), accent: text('accent').notNull().default('#f0523d'),
  objectKey: text('object_key').notNull(), likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0), createdAt: integer('created_at').notNull(),
});

export const votes = sqliteTable('votes', {
  resultId: text('result_id').notNull(), ipHash: text('ip_hash').notNull(),
  value: integer('value').notNull(), createdAt: integer('created_at').notNull(),
}, (table) => [primaryKey({ columns: [table.resultId, table.ipHash] })]);
