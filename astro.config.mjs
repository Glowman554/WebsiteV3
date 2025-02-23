// @ts-check
import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';

import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    // Enable Solid to support Solid JSX components.
    site: 'https://glowman554.de',
    integrations: [
        solid({ include: ['**'] }),
        sitemap({
            filter: (route) => !route.includes('/internal'),
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
    },

    adapter: node({
        mode: 'standalone',
    }),
});
