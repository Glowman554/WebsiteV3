import { type APIContext } from 'astro';
import { scalePngFromUrl } from '../server/image';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// 90 days in seconds
const cacheLifetime = 90 * 24 * 60 * 60;

export async function GET(context: APIContext) {
    const url = context.url.searchParams.get('url');
    if (!url) {
        throw new Error("Missing parameter 'url'");
    }

    const scale = context.url.searchParams.get('scale') || '1920';

    const buffer = await scalePngFromUrl(url!, parseInt(scale));

    return new Response(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': `public, max-age=${cacheLifetime}`,
            ...headers,
        },
    });
}

export async function OPTIONS(context: APIContext) {
    return new Response(null, {
        status: 200,
        headers,
    });
}
