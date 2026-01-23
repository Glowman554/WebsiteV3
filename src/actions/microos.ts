import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Embed, Webhook } from '@teever/ez-hook';
import { config } from '../config';
import { exec, execSync } from 'child_process';
import { permission } from './authentication';
import { MicroOSBuilds, MicroOSBuildTokens } from '../database/schema';
import { db } from '../database/database';
import { eq, sql, type InferSelectModel } from 'drizzle-orm';
import { deleteFile, idFromUrl } from '../server/filething';

export type BuildToken = InferSelectModel<typeof MicroOSBuildTokens>;

function createRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < 25; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}

interface BuildParams {
    preset: string;
    kernel: string;
    symbols: string;
    initrd: string;
}

async function buildISO(params: BuildParams) {
    return new Promise<URL>((resolve, reject) => {
        exec(
            `bash build_automated.sh ${params.preset} ${params.kernel} ${params.symbols} ${params.initrd}`,
            {
                cwd: 'microos',
                env: {
                    UPLOAD_SERVER: config.upload.uploadServer,
                    UPLOAD_AUTH_TOKEN: config.upload.authToken,
                },
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                const uploadedUrl = new URL(stdout.trim());
                resolve(uploadedUrl);
            }
        );
    });
}

export const microos = {
    createBuildToken: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const buildToken = createRandomToken();

            const result = await db.insert(MicroOSBuildTokens).values({ token: buildToken }).returning().get();

            return result satisfies BuildToken;
        },
    }),

    listBuildTokens: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const tokens = await db.select().from(MicroOSBuildTokens).all();

            return tokens satisfies BuildToken[];
        },
    }),

    deleteBuildToken: defineAction({
        input: z.object({ token: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.delete(MicroOSBuildTokens).where(eq(MicroOSBuildTokens.token, input.token));
        },
    }),

    load: defineAction({
        input: z.object({ preset: z.string() }),
        async handler(input, context) {
            console.log(`Loading MicroOS build for preset ${input.preset}`);
            const build = await db.select().from(MicroOSBuilds).where(eq(MicroOSBuilds.preset, input.preset)).get();

            if (!build) {
                throw new Error('Build not found');
            }

            return build;
        },
    }),

    loadAll: defineAction({
        async handler(input, context) {
            const builds = await db.select().from(MicroOSBuilds).all();

            return builds;
        },
    }),

    build: defineAction({
        input: z.object({
            preset: z.string(),
            kernel: z.string().url(),
            symbols: z.string().url(),
            initrd: z.string().url(),
        }),
        async handler(input, context) {
            const buildToken = context.request.headers.get('Authentication');
            if (!buildToken) {
                throw new Error('No build token provided');
            }

            const token = await db
                .select()
                .from(MicroOSBuildTokens)
                .where(eq(MicroOSBuildTokens.token, buildToken))
                .get();

            if (!token) {
                throw new Error('Invalid build token');
            }

            const oldBuild = await db.select().from(MicroOSBuilds).where(eq(MicroOSBuilds.preset, input.preset)).get();

            if (oldBuild) {
                console.log(`Deleting old build artifact at ${oldBuild.isoUrl}`);
                await deleteFile(idFromUrl(oldBuild.isoUrl));
            }

            const isoUrl = await buildISO(input);

            const buildRecord = await db
                .insert(MicroOSBuilds)
                .values({
                    preset: input.preset,
                    kernel: input.kernel,
                    symbols: input.symbols,
                    initrd: input.initrd,
                    isoUrl: isoUrl.toString(),
                })
                .onConflictDoUpdate({
                    target: MicroOSBuilds.preset,
                    set: {
                        kernel: input.kernel,
                        symbols: input.symbols,
                        initrd: input.initrd,
                        isoUrl: isoUrl.toString(),
                    },
                })
                .returning()
                .get();

            console.log(`Created new build artifact at ${isoUrl.toString()} for preset ${input.preset}`);

            return buildRecord;
        },
    }),
};
