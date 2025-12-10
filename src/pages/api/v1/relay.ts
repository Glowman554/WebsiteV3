import { type APIContext } from 'astro';
import { initializeWebSocket } from '../../../server/relay/switch';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(context: APIContext) {
    if (context.request.headers.get('upgrade') == 'websocket') {
        const { response, socket } = context.locals.upgradeWebSocket();

        initializeWebSocket(socket);

        return response;
    }

    return new Response('Upgrade required', { status: 426, headers });
}

export async function OPTIONS(context: APIContext) {
    return new Response(null, {
        status: 200,
        headers,
    });
}
