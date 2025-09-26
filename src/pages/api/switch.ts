import type { APIRoute } from 'astro';
import { Tap } from 'tuntap2';

export const prerender = false;

const macSwitch: { [mac: string]: WebSocket } = {};
const tap = new Tap();

function processPacket(mac: string, packet: Uint8Array) {
    let destMac = packet
        .slice(0, 6)
        .values()
        .map((e) => e.toString(16))
        .reduce((a, b) => a + ':' + b);
    console.log(`${mac} -> ${destMac} (${packet.length} bytes)`);

    if (destMac == 'ff:ff:ff:ff:ff:ff') {
        for (const s in macSwitch) {
            if (s == mac) {
                continue;
            }
            macSwitch[s].send(packet);
        }
        tap.write(packet);
    } else if (macSwitch[destMac]) {
        macSwitch[destMac].send(packet);
    } else {
        tap.write(packet);
    }
}

export const GET: APIRoute = (ctx) => {
    if (ctx.request.headers.get('upgrade') === 'websocket') {
        const { response, socket } = ctx.locals.upgradeWebSocket();

        let mac: string | null = null;

        socket.onmessage = async (event) => {
            const buf = await (event.data as Blob).bytes();

            if (!mac) {
                mac = buf
                    .slice(6, 12)
                    .values()
                    .map((e) => e.toString(16))
                    .reduce((a, b) => a + ':' + b);
                console.log('connected using mac: ' + mac);

                macSwitch[mac] = socket;
            }

            processPacket(mac, buf);
        };
        socket.onclose = (event) => {
            if (mac) {
                delete macSwitch[mac];
            }
        };
        return response;
    }
    return new Response('Upgrade required', { status: 426 });
};

tap.ipv4 = '10.0.0.1/16';
tap.mtu = 1500;
tap.isUp = true;

tap.on('data', async (data) => {
    const buf: Uint8Array = await data.bytes();
    const mac = buf
        .slice(6, 12)
        .values()
        .map((e) => e.toString(16))
        .reduce((a, b) => a + ':' + b);

    processPacket(mac, buf);
});

console.log(`created tap: ${tap.name}, ip: ${tap.ipv4}, mtu: ${tap.mtu}`);
