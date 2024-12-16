import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const messages = {
    message: defineAction({
        input: z.object({ message: z.string() }),
        handler(input, context) {
            console.log(input);
        },
    }),
};
