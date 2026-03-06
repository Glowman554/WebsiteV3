import { type APIContext } from 'astro';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const matrixConfig = {
    'm.homeserver': {
        base_url: 'https://matrix.toxicfox.de',
    },
};

export async function GET(context: APIContext) {
    return new Response(JSON.stringify(matrixConfig), {
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
