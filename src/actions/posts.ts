import { desc, eq, type InferSelectModel } from 'drizzle-orm';
import { Posts } from '../database/schema';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db } from '../database/database';
import { permission } from './authentication';

export type Post = InferSelectModel<typeof Posts>;
export type PartialPost = Omit<Post, 'content'>;

export const posts = {
    create: defineAction({
        input: z.object({ title: z.string(), content: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            const result = await db
                .insert(Posts)
                .values({ content: input.content, title: input.title })
                .returning()
                .get();
            return result.id;
        },
    }),

    update: defineAction({
        input: z.object({ id: z.number().int(), title: z.string(), content: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db.update(Posts).set({ title: input.title, content: input.content }).where(eq(Posts.id, input.id));
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.number().int() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db.delete(Posts).where(eq(Posts.id, input.id));
        },
    }),

    loadAll: defineAction({
        async handler() {
            return (await db
                .select({ id: Posts.id, title: Posts.title, creationDate: Posts.creationDate })
                .from(Posts)
                .orderBy(desc(Posts.creationDate))) satisfies PartialPost[];
        },
    }),

    load: defineAction({
        input: z.object({ id: z.number() }),
        async handler(input) {
            const post = await db.select().from(Posts).where(eq(Posts.id, input.id)).get();
            if (!post) {
                throw new Error('Post not found');
            }
            return post satisfies Post;
        },
    }),
};
