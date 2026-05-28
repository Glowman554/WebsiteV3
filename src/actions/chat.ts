import { defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { db } from '../database/database';
import { Messages } from '../database/schema';
import { desc, eq, type InferSelectModel } from 'drizzle-orm';
import { publishChatMessage } from '../pages/api/v1/chat/subscribe';
import { permission } from './authentication';

export type ChatMessage = InferSelectModel<typeof Messages>;

async function publish(message: string, displayname: string) {
    const result = await db
        .insert(Messages)
        .values({
            displayname: displayname,
            message: message,
        })
        .returning()
        .get();

    publishChatMessage(result);
}

export const chat = {
    publish: defineAction({
        input: z.object({ message: z.string().max(512), displayname: z.string().max(64) }),
        async handler(input, context) {
            const { message, displayname } = input;

            await publish(message, displayname);
        },
    }),

    loadLatest: defineAction({
        input: z.object({ limit: z.number().min(1).max(100) }),
        async handler(input, context) {
            const messages = await db
                .select()
                .from(Messages)
                .orderBy(desc(Messages.timestamp))
                .limit(input.limit)
                .all();

            return messages;
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.number().int() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.delete(Messages).where(eq(Messages.id, input.id));
        },
    }),
};
