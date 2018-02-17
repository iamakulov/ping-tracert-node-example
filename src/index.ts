import 'dotenv/config';
import * as raw from 'raw-socket';
import {
    parseIpMessageFromBuffer,
    createBufferFromIpMessage,
} from './messages/ip';
import {
    createBufferFromPingMessage,
    parsePingMessageFromBuffer,
} from './messages/ping';
import { parseIcmpMessageFromBuffer } from './messages/icmp';

const socket = raw.createSocket({
    protocol: raw.Protocol.NONE,
    addressFamily: raw.AddressFamily.IPv4,
});

console.log(`Pinging ${process.env.IP_ADDRESS}...`);
let sequenceNumber = 0;
setInterval(() => {
    const pingBuffer = createBufferFromPingMessage({
        identifier: 200,
        sequenceNumber,
    });
    const ipBuffer = createBufferFromIpMessage({
        identification: 0x1234,
        sourceIp: process.env.SOURCE_IP_ADDRESS,
        destinationIp: process.env.IP_ADDRESS,
        ttl: 55,
        protocol: raw.Protocol.ICMP,
        data: pingBuffer,
    });
    socket.setOption(
        raw.SocketLevel.IPPROTO_IP,
        raw.SocketOption.IP_HDRINCL,
        1,
    );
    socket.send(
        ipBuffer,
        0,
        ipBuffer.length,
        process.env.IP_ADDRESS,
        () => {},
        () => {},
    );

    socket.once('message', (buffer: Buffer, source: string) => {
        const ipMessage = parseIpMessageFromBuffer(buffer);
        const icmpMessage = parseIcmpMessageFromBuffer(ipMessage.data);
        console.log(
            `Received ${buffer.length} bytes from ${source}: type ${
                icmpMessage.type
            } · ${buffer.toString('hex')}`,
        );
    });

    socket.once('error', error => {
        console.log(error);
    });

    ++sequenceNumber;
}, 1000);
