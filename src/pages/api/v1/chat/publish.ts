import { type APIContext } from 'astro';
import { validateOrThrow } from '../../../../config';
import z from 'zod';
import { actions } from 'astro:actions';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const schema = z.object({ message: z.string().max(512), displayname: z.string().max(64) });

export async function POST(context: APIContext) {
    const input = validateOrThrow(schema, await context.request.json());

    const res = await context.callAction(actions.chat.publish, {
        message: input.message,
        displayname: input.displayname,
    });
    if (res.error) {
        return new Response('', { status: 500, headers });
    }

    return new Response(JSON.stringify({}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
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
