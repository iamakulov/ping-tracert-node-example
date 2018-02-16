import 'dotenv/config';
import * as raw from 'raw-socket';
import { parseIpMessageFromBuffer } from './messages/ip';
import {
    createBufferFromPingMessage,
    parsePingMessageFromBuffer,
} from './messages/ping';

const socket = raw.createSocket({
    protocol: raw.Protocol.ICMP,
    addressFamily: raw.AddressFamily.IPv4,
});

let sequenceNumber = 0;
setInterval(() => {
    const buffer = createBufferFromPingMessage({
        identifier: 200,
        sequenceNumber,
    });
    socket.send(
        buffer,
        0,
        buffer.length,
        process.env.IP_ADDRESS,
        () => {},
        () => {},
    );

    socket.once('message', (buffer: Buffer, source: string) => {
        const pingMessage = parsePingMessageFromBuffer(
            parseIpMessageFromBuffer(buffer).data,
        );
        console.log(
            `Received ${buffer.length} bytes from ${source}. Identifier is ${
                pingMessage.identifier
            }, sequence number is ${pingMessage.sequenceNumber}`,
        );
    });

    ++sequenceNumber;
}, 1000);
