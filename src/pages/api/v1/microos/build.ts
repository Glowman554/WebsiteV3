import { type APIContext } from 'astro';
import { actions } from 'astro:actions';
import z from 'zod';
import { validateOrThrow } from '../../../../config';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

const schema = z.object({
    preset: z.string(),
    kernel: z.string().url(),
    symbols: z.string().url(),
    initrd: z.string().url(),
});

export async function POST(context: APIContext) {
    const input = validateOrThrow(schema, await context.request.json());

    const result = await context.callAction(actions.microos.build, input);

    return new Response(JSON.stringify(result), {
        status: 200,
        headers,
    });
}

export async function OPTIONS(context: APIContext) {
    return new Response(null, {
        status: 200,
        headers,
    });
}
