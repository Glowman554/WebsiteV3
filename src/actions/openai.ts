import OpenAI from 'openai';
import { permission } from './authentication';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { config } from '../config';

export const openAi = {
    generate: defineAction({
        input: z.object({ system: z.string(), prompt: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const openAi = new OpenAI({ apiKey: config.openAi.authToken });
            const completion = await openAi.chat.completions.create({
                messages: [
                    { role: 'system', content: input.system },
                    { role: 'user', content: input.prompt },
                ],
                model: config.openAi.chatModel!,
            });

            return completion.choices[0].message.content;
        },
    }),

    generateImage: defineAction({
        input: z.object({ prompt: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const openAi = new OpenAI({ apiKey: config.openAi.authToken });
            const image = await openAi.images.generate({
                prompt: input.prompt,
                model: config.openAi.imageModel,
                response_format: 'url',
            });

            return image.data[0].url;
        },
    }),
};
