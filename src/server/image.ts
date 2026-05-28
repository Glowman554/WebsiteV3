import sharp from 'sharp';
import { db } from '../database/database';
import { ScaleCache } from '../database/schema';
import { eq } from 'drizzle-orm';

export async function scalePngFromUrl(url: string, scale: number) {
    const cached = await db.select().from(ScaleCache).where(eq(ScaleCache.url, url)).get();
    if (cached) {
        const blob = new Blob([new Uint8Array(cached.content)], {
            type: 'image/png',
        });
        return blob;
    }

    console.log('Scaling ' + url + '...');
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const inputBuffer = Buffer.from(await response.arrayBuffer());

    const outputBuffer = await sharp(inputBuffer)
        .resize({ width: scale }) // let Sharp preserve aspect ratio
        .png()
        .toBuffer();

    await db.insert(ScaleCache).values({ url, content: outputBuffer }).onConflictDoNothing();

    const blob = new Blob([new Uint8Array(outputBuffer)], {
        type: 'image/png',
    });

    return blob;
}
