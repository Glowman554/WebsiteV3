import { type APIContext } from 'astro';

import { config } from '../../config';

export const prerender = false;

export async function GET(context: APIContext) {
    return new Response(config.blueSky.did);
}
