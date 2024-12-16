import { UTApi } from 'uploadthing/server';
import { config } from '../config';
import { permission } from './authentication';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export async function upload(blob: Blob, filename: string): Promise<string> {
    const thing = new UTApi({ token: config.uploadThing.authToken });
    const result = await thing.uploadFiles(new File([blob], filename));

    if (result.error) {
        throw new Error(result.error.message);
    }

    return result.data.url;
}

export interface UploadResult {
    url: string;
}

export const uploads = {
    uploadFromUrl: defineAction({
        input: z.object({ url: z.string().url() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const thing = new UTApi({ token: config.uploadThing.authToken });
            const result = await thing.uploadFilesFromUrl(input.url);

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.data.url;
        },
    }),
};
