import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { authentication } from './authentication';
import { messages } from './messages';
import { projects } from './projects';
import { downloads } from './downloads';
import { openAi } from './openai';
import { posts } from './posts';
import { uploads } from './uploads';

export const server = {
    authentication,
    messages,
    projects,
    downloads,
    openAi,
    posts,
    uploads,
};
