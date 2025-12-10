type DHCPMessageType = 'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK';

interface Lease {
    ip: string;
    mac: string;
    expiresAt: number;
}

function checksum16(data: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i += 2) {
        const word = (data[i] << 8) + (data[i + 1] || 0);
        sum += word;
        while (sum > 0xffff) sum = (sum & 0xffff) + (sum >> 16);
    }
    return ~sum & 0xffff;
}

export class SimpleDHCPServer {
    leases: Lease[] = [];

    dnsServer = '8.8.8.8';
    subnet: string;
    gateway: string;

    leaseDuration = 15 * 60 * 1000;
    maxHosts = 254;

    constructor(gateway: string) {
        this.subnet = gateway.split('.').slice(0, 3).join('.') + '.';
        this.gateway = gateway;
        this.leases.push({
            ip: gateway,
            mac: 'ff:ff:ff:ff:ff:ff',
            expiresAt: Infinity,
        });
    }

    handlePacket(packet: Uint8Array): Uint8Array | null {
        const msgType = this.getDHCPMessageType(packet);
        const mac = this.getMACAddress(packet);

        if (!mac || !msgType) {
            return null;
        }

        this.leases = this.leases.filter((l) => l.expiresAt > Date.now());

        let assignedIP: string | null = null;

        if (msgType === 'DISCOVER') {
            assignedIP = this.getAvailableIP(mac);
            if (!assignedIP) {
                return null;
            }

            console.log(`Offering IP ${assignedIP} to ${mac}`);

            return this.buildFullPacket(packet, assignedIP, 2);
        } else if (msgType === 'REQUEST') {
            let lease = this.leases.find((l) => l.mac === mac);

            if (!lease) {
                assignedIP = this.getAvailableIP(mac);
                if (!assignedIP) {
                    return null;
                }

                lease = { ip: assignedIP, mac, expiresAt: Date.now() + this.leaseDuration };
                this.leases.push(lease);

                console.log(`Assigning IP ${assignedIP} to ${mac}`);
            } else {
                lease.expiresAt = Date.now() + this.leaseDuration;
                assignedIP = lease.ip;
                console.log(`Renewing lease for IP ${assignedIP} to ${mac}`);
            }

            return this.buildFullPacket(packet, assignedIP, 5);
        }

        return null;
    }

    private buildFullPacket(requestPacket: Uint8Array, yiaddr: string, dhcpType: number): Uint8Array {
        const ipParts = yiaddr.split('.').map(Number);
        const dnsParts = this.dnsServer.split('.').map(Number);
        const gwParts = this.gateway.split('.').map(Number);

        const ipHeaderLen = (requestPacket[14] & 0x0f) * 4;
        const udpOffset = 14 + ipHeaderLen;
        const dhcpOffset = udpOffset + 8;
        const clientMac = requestPacket.slice(dhcpOffset + 28, dhcpOffset + 34);

        const dhcpPayload = new Uint8Array(240 + 64);
        dhcpPayload.set(requestPacket.slice(dhcpOffset, dhcpOffset + 240), 0);
        dhcpPayload[0] = 2; // BOOTREPLY
        dhcpPayload[16] = ipParts[0];
        dhcpPayload[17] = ipParts[1];
        dhcpPayload[18] = ipParts[2];
        dhcpPayload[19] = ipParts[3];

        let optOffset = 240;

        // DHCP Message Type (Option 53)
        dhcpPayload[optOffset++] = 53;
        dhcpPayload[optOffset++] = 1;
        dhcpPayload[optOffset++] = dhcpType;

        // Subnet Mask (Option 1)
        dhcpPayload[optOffset++] = 1;
        dhcpPayload[optOffset++] = 4; // length
        dhcpPayload[optOffset++] = 255;
        dhcpPayload[optOffset++] = 255;
        dhcpPayload[optOffset++] = 255;
        dhcpPayload[optOffset++] = 0;

        // Router / Gateway (Option 3)
        dhcpPayload[optOffset++] = 3;
        dhcpPayload[optOffset++] = 4; // length
        dhcpPayload[optOffset++] = gwParts[0];
        dhcpPayload[optOffset++] = gwParts[1];
        dhcpPayload[optOffset++] = gwParts[2];
        dhcpPayload[optOffset++] = gwParts[3];

        // DNS Server (Option 6)
        dhcpPayload[optOffset++] = 6;
        dhcpPayload[optOffset++] = 4; // length
        dhcpPayload[optOffset++] = dnsParts[0];
        dhcpPayload[optOffset++] = dnsParts[1];
        dhcpPayload[optOffset++] = dnsParts[2];
        dhcpPayload[optOffset++] = dnsParts[3];

        // IP Address Lease Time (Option 51)
        dhcpPayload[optOffset++] = 51;
        dhcpPayload[optOffset++] = 4; // length
        const leaseSeconds = this.leaseDuration / 1000;
        dhcpPayload[optOffset++] = (leaseSeconds >> 24) & 0xff;
        dhcpPayload[optOffset++] = (leaseSeconds >> 16) & 0xff;
        dhcpPayload[optOffset++] = (leaseSeconds >> 8) & 0xff;
        dhcpPayload[optOffset++] = leaseSeconds & 0xff;

        // End
        dhcpPayload[optOffset++] = 255;

        const udpLength = 8 + dhcpPayload.length;
        const udpHeader = new Uint8Array(8);
        udpHeader[0] = (67 >> 8) & 0xff;
        udpHeader[1] = 67 & 0xff;
        udpHeader[2] = (68 >> 8) & 0xff;
        udpHeader[3] = 68 & 0xff;

        udpHeader[4] = (udpLength >> 8) & 0xff;
        udpHeader[5] = udpLength & 0xff;
        udpHeader[6] = 0; // checksum
        udpHeader[7] = 0; // checksum

        const ipTotalLength = 20 + udpLength;
        const ipHeader = new Uint8Array(20);
        ipHeader[0] = 0x45;
        ipHeader[1] = 0;
        ipHeader[2] = (ipTotalLength >> 8) & 0xff;
        ipHeader[3] = ipTotalLength & 0xff;
        ipHeader[8] = 64; // TTL
        ipHeader[9] = 17; // UDP
        ipHeader[12] = gwParts[0]; // src
        ipHeader[13] = gwParts[1]; // src
        ipHeader[14] = gwParts[2]; // src
        ipHeader[15] = gwParts[3]; // src
        ipHeader[16] = 255; // dest
        ipHeader[17] = 255; // dest
        ipHeader[18] = 255; // dest
        ipHeader[19] = 255; // dest
        const ipCksum = checksum16(ipHeader);
        ipHeader[10] = (ipCksum >> 8) & 0xff;
        ipHeader[11] = ipCksum & 0xff;

        const ethernetHeader = new Uint8Array(14);
        ethernetHeader.set(clientMac, 0); // dest
        ethernetHeader.set([0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 6); // src
        ethernetHeader[12] = 0x08;
        ethernetHeader[13] = 0x00;

        const packet = new Uint8Array(ethernetHeader.length + ipHeader.length + udpHeader.length + dhcpPayload.length);
        let offset = 0;
        packet.set(ethernetHeader, offset);
        offset += ethernetHeader.length;
        packet.set(ipHeader, offset);
        offset += ipHeader.length;
        packet.set(udpHeader, offset);
        offset += udpHeader.length;
        packet.set(dhcpPayload, offset);

        return packet;
    }

    private getDHCPMessageType(packet: Uint8Array): DHCPMessageType | null {
        const ipHeaderLen = (packet[14] & 0x0f) * 4;
        const udpOffset = 14 + ipHeaderLen;
        const dhcpOffset = udpOffset + 8;
        const optionsStart = dhcpOffset + 240;

        for (let i = optionsStart; i < packet.length; ) {
            const type = packet[i];
            if (type === 255) {
                break;
            }

            const len = packet[i + 1];
            if (type === 53) {
                const val = packet[i + 2];
                switch (val) {
                    case 1:
                        return 'DISCOVER';
                    case 3:
                        return 'REQUEST';
                    case 2:
                        return 'OFFER';
                    case 5:
                        return 'ACK';
                }
            }
            i += 2 + len;
        }
        return null;
    }

    private getMACAddress(packet: Uint8Array): string | null {
        const ipHeaderLen = (packet[14] & 0x0f) * 4;
        const udpOffset = 14 + ipHeaderLen;
        const dhcpOffset = udpOffset + 8;

        return Array.from(packet.slice(dhcpOffset + 28, dhcpOffset + 34))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(':');
    }

    private getAvailableIP(mac: string): string | null {
        const existing = this.leases.find((l) => l.mac === mac);
        if (existing) {
            return existing.ip;
        }

        for (let i = 2; i <= this.maxHosts; i++) {
            const ip = this.subnet + i;
            if (!this.leases.find((l) => l.ip === ip)) {
                return ip;
            }
        }

        return null;
    }
}
