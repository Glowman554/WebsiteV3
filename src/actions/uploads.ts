import { config } from '../config';
import { permission } from './authentication';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

interface UploadResult {
    uploadToken: string;
    id: string;
    url: string;
}

type PartialUploadResult = Omit<UploadResult, 'uploadToken'>;

export const uploads = {
    uploadFromUrl: defineAction({
        input: z.object({ url: z.string().url(), name: z.string().optional() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const res = await fetch(config.upload.uploadServer + '/api/v1/fromUrl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authentication: config.upload.authToken,
                },
                body: JSON.stringify({ url: input.url, name: input.name }),
            });
            if (!res.ok) {
                throw new Error('Failed to upload from URL');
            }

            const json = (await res.json()) as PartialUploadResult;
            return json;
        },
    }),

    prepare: defineAction({
        input: z.object({ name: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const res = await fetch(config.upload.uploadServer + '/api/v1/prepare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authentication: config.upload.authToken,
                },
                body: JSON.stringify({ name: input.name }),
            });
            if (!res.ok) {
                throw new Error('Failed to prepare upload');
            }

            const json = (await res.json()) as UploadResult;
            return json;
        },
    }),
};
