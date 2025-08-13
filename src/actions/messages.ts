import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Embed, Webhook } from '@teever/ez-hook';
import { config } from '../config';

export const messages = {
    message: defineAction({
        input: z.object({ message: z.string() }),
        async handler(input) {
            const message = input.message;

            if (message.trim() == '') {
                return;
            }

            await new Webhook(config.webhook)
                .setUsername('Website')
                .addEmbed(new Embed().setTitle('Message').setDescription(message))
                .send();
        },
    }),
};
