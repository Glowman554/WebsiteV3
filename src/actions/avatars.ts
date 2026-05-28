import { defineAction } from 'astro:actions';
import { Avatars, Downloads } from '../database/schema';
import { permission } from './authentication';
import { desc, eq, type InferSelectModel } from 'drizzle-orm';
import { z } from 'astro:schema';
import { db } from '../database/database';

export type Avatar = InferSelectModel<typeof Avatars>;
export type PartialAvatar = Omit<Avatar, 'configuration'>;

export const avatars = {
    create: defineAction({
        input: z.object({
            name: z.string(),
            modelUrl: z.string().url(),
            configuration: z.string(),
            hidden: z.boolean(),
        }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            const result = await db
                .insert(Avatars)
                .values({
                    name: input.name,
                    modelUrl: input.modelUrl,
                    configuration: input.configuration,
                    hidden: input.hidden,
                })
                .returning()
                .get();
            return result.id;
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.number().int() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db.delete(Avatars).where(eq(Avatars.id, input.id));
        },
    }),

    update: defineAction({
        input: z.object({
            name: z.string(),
            modelUrl: z.string().url(),
            configuration: z.string(),
            id: z.number().int(),
            hidden: z.boolean(),
        }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            await db
                .update(Avatars)
                .set({
                    name: input.name,
                    modelUrl: input.modelUrl,
                    configuration: input.configuration,
                    hidden: input.hidden,
                })
                .where(eq(Avatars.id, input.id));
        },
    }),

    load: defineAction({
        input: z.object({ id: z.number().int() }),
        async handler(input) {
            const result = await db.select().from(Avatars).where(eq(Avatars.id, input.id)).get();
            if (!result) {
                throw new Error('Avatar not found');
            }
            return result;
        },
    }),

    loadAll: defineAction({
        async handler() {
            return (await db
                .select({
                    id: Avatars.id,
                    name: Avatars.name,
                    modelUrl: Avatars.modelUrl,
                    hidden: Avatars.hidden,
                    creationDate: Avatars.creationDate,
                })
                .from(Avatars)
                .orderBy(desc(Avatars.creationDate))) satisfies PartialAvatar[];
        },
    }),
};
