import { prepareUpload, uploadFromUrl } from '../server/filething';
import { permission } from './authentication';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const uploads = {
    uploadFromUrl: defineAction({
        input: z.object({ url: z.string().url(), name: z.string().optional() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            return await uploadFromUrl(input.url, input.name);
        },
    }),

    prepare: defineAction({
        input: z.object({ name: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);
            return await prepareUpload(input.name);
        },
    }),
};
