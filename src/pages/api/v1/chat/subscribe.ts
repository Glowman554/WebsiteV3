import { type APIContext } from 'astro';
import type { ChatMessage } from '../../../../actions/chat';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
};

type PublishFunction = (message: ChatMessage) => Promise<void>;
const subscribers = new Set<PublishFunction>();

export async function GET(context: APIContext) {
    if (context.request.headers.get('upgrade') == 'websocket') {
        const { response, socket } = context.locals.upgradeWebSocket();

        const publish: PublishFunction = async (message: ChatMessage) => {
            socket.send(JSON.stringify(message));
        };

        socket.onmessage = (event) => {
            console.log('Received message from client:', event.data);
        };

        socket.onopen = () => {
            subscribers.add(publish);
        };

        socket.onclose = () => {
            subscribers.delete(publish);
        };

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

export function publishChatMessage(message: ChatMessage) {
    for (const publish of subscribers) {
        publish(message).catch((err) => {
            console.error('Error publishing chat message to subscriber:', err);
        });
    }
}
