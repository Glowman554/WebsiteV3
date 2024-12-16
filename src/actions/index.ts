import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { authentication } from './authentication';

export const server = {
    double: defineAction({
        input: z.number(),
        handler(input, context) {
            return input * 2;
        },
    }),
    authentication,
};
