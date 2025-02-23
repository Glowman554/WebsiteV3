import { defineAction } from 'astro:actions';
import { Downloads } from '../database/schema';
import { permission } from './authentication';
import { desc, eq, type InferSelectModel } from 'drizzle-orm';
import { z } from 'astro:schema';
import { db } from '../database/database';

export type Download = InferSelectModel<typeof Downloads>;

export const downloads = {
    create: defineAction({
        input: z.object({ name: z.string(), link: z.string().url() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            const result = await db.insert(Downloads).values({ name: input.name, link: input.link }).returning().get();
            return result.id;
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.number().int() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db.delete(Downloads).where(eq(Downloads.id, input.id));
        },
    }),

    update: defineAction({
        input: z.object({ name: z.string(), link: z.string().url(), id: z.number().int() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db.update(Downloads).set({ name: input.name, link: input.link }).where(eq(Downloads.id, input.id));
        },
    }),

    loadAll: defineAction({
        async handler() {
            return await db.select().from(Downloads).orderBy(desc(Downloads.creationDate));
        },
    }),
};
