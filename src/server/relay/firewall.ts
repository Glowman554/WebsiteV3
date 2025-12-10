import { execSync } from 'child_process';

const targetInterface = 'wlo1';

function invokeIptables(command: string) {
    command = '/sbin/iptables ' + command;
    console.log(`${command}`);
    execSync(command);
}

export function addFirewallRules(tapInterface: string, network: string) {
    invokeIptables(`-t nat -A POSTROUTING -o ${targetInterface} -j MASQUERADE`);

    invokeIptables(`-A FORWARD -i ${tapInterface} -o ${targetInterface} -d ${network} -j ACCEPT`);
    invokeIptables(`-A FORWARD -i ${tapInterface} -o ${targetInterface} -d 10.0.0.0/8 -j DROP`);
    invokeIptables(`-A FORWARD -i ${tapInterface} -o ${targetInterface} -d 172.16.0.0/12 -j DROP`);
    invokeIptables(`-A FORWARD -i ${tapInterface} -o ${targetInterface} -d 192.168.0.0/16 -j DROP`);

    invokeIptables(
        `-A FORWARD -i ${targetInterface} -o ${tapInterface} -m state --state RELATED,ESTABLISHED -j ACCEPT`
    );
    invokeIptables(`-A FORWARD -i ${tapInterface} -o ${targetInterface} -j ACCEPT`);
}
