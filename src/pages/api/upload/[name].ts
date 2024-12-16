import type { APIRoute } from 'astro';
import { permission } from '../../../actions/authentication';
import { upload, type UploadResult } from '../../../actions/uploads';

export const prerender = false;

export const POST: APIRoute = async (context) => {
    await permission(context, (u) => u.administrator);

    const url = await upload(await context.request.blob(), context.params.name!);
    return new Response(JSON.stringify({ url } satisfies UploadResult));
};
