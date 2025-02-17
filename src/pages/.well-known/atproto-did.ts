import { config } from '../../config';

export const prerender = false;

export async function GET({ params, request }) {
    return new Response(config.blueSky.did);
}
