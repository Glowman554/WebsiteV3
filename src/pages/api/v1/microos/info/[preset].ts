import { type APIContext } from 'astro';
import { actions } from 'astro:actions';
import z from 'zod';
import { validateOrThrow } from '../../../../../config';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
};

export async function GET(context: APIContext) {
    const preset = context.params.preset as string;

    const result = await context.callAction(actions.microos.load, { preset });

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
