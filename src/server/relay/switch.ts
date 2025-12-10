import { Tap } from 'tuntap2';
import { addFirewallRules } from './firewall';
import { SimpleDHCPServer } from './dhcp';
import { config } from '../../config';

let tap: Tap | null = null;

const network = '192.168.8.0/24';
const tapip = '192.168.8.1/24';

const dhcp = new SimpleDHCPServer(tapip.split('/').shift()!);

function initializeTap() {
    tap = new Tap();

    tap.ipv4 = tapip;
    tap.mtu = 1500;
    tap.isUp = true;

    console.log(`created tap: ${tap.name}, ip: ${tap.ipv4}, mtu: ${tap.mtu}`);
    tap.setMaxListeners(0);

    tap.on('data', (bytes) => {
        let srcMac = macFromBuffer(new Int32Array(bytes.slice(6, 12)));
        let dstMac = macFromBuffer(new Int32Array(bytes.slice(0, 6)));

        forward(bytes, srcMac, dstMac, true);
    });

    addFirewallRules(tap.name, network);
}

if (config.enableTap) {
    initializeTap();
}

const connections: { [mac: string]: WebSocket } = {};
function forward(packet: Uint8Array, srcMac: string, dstMac: string, isFromNetwork: boolean) {
    let response: Uint8Array | null;
    if ((response = dhcp.handlePacket(packet)) != null) {
        forward(response, dstMac, srcMac, false);
    } else if (dstMac == 'ff:ff:ff:ff:ff:ff') {
        for (const client in connections) {
            console.log('Forwarding to broadcast');
            if (client == srcMac) {
                continue;
            }
            connections[client].send(packet);
        }
        if (!isFromNetwork) {
            tap?.write(packet);
        }
    } else if (connections[dstMac]) {
        console.log('Forwarding to ' + dstMac);
        connections[dstMac].send(packet);
    } else {
        if (!isFromNetwork) {
            console.log('Forwarding to network');
            tap?.write(packet);
        }
    }
}

export function initializeWebSocket(socket: WebSocket) {
    let srcMac: string | null = null;

    socket.onmessage = async (event) => {
        const buffer = await event.data.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        if (!srcMac) {
            srcMac = macFromBuffer(new Int32Array(bytes.slice(6, 12)));
            console.log('Socket connected using mac: %s', srcMac);
            connections[srcMac] = socket;
        }

        let dstMac = macFromBuffer(new Int32Array(bytes.slice(0, 6)));

        forward(bytes, srcMac, dstMac, false);
    };

    socket.onopen = () => {};

    socket.onclose = () => {
        if (srcMac && connections[srcMac]) {
            delete connections[srcMac];
        }
    };
}

function macFromBuffer(buffer: Int32Array) {
    const macBuf = [];
    for (let hex of hexFormatValues(new Int32Array(buffer))) {
        macBuf.push(hex);
    }

    return macBuf.join(':');
}

function hexFormatValues(buffer: Int32Array) {
    const res: string[] = [];
    for (let x of buffer) {
        const hex = x.toString(16);
        res.push(hex.padStart(2, '0'));
    }

    return res;
}
