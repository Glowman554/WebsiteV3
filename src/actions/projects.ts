import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { permission } from './authentication';
import { eq, desc, type InferSelectModel } from 'drizzle-orm';
import { db } from '../database/database';
import { Projects } from '../database/schema';
export type Project = InferSelectModel<typeof Projects>;

export const projects = {
    create: defineAction({
        input: z.object({
            name: z.string(),
            link: z.string().url(),
            description: z.string(),
        }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            const result = await db
                .insert(Projects)
                .values({ name: input.name, link: input.link, description: input.description })
                .returning()
                .get();
            return result.id;
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.number().int() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db.delete(Projects).where(eq(Projects.id, input.id));
        },
    }),

    update: defineAction({
        input: z.object({
            name: z.string(),
            link: z.string().url(),
            description: z.string(),
            id: z.number().int(),
        }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db
                .update(Projects)
                .set({ name: input.name, link: input.link, description: input.description })
                .where(eq(Projects.id, input.id));
        },
    }),

    loadAll: defineAction({
        input: z.object({ limit: z.number() }),
        async handler(input) {
            return (await db
                .select()
                .from(Projects)
                .limit(input.limit)
                .orderBy(desc(Projects.creationDate))) satisfies Project[];
        },
    }),
};
