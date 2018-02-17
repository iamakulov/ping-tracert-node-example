import 'dotenv/config';
import * as raw from 'raw-socket';
import { parseIpMessageFromBuffer } from './messages/ip';
import {
    createBufferFromPingMessage,
    parsePingMessageFromBuffer,
    PingMessage,
} from './messages/ping';
import { parseIcmpMessageFromBuffer } from './messages/icmp';

const socket = raw.createSocket({
    protocol: raw.Protocol.ICMP,
    addressFamily: raw.AddressFamily.IPv4,
});

console.log(`Tracing route to ${process.env.IP_ADDRESS}...`);
let currentStep = 1;
setInterval(() => {
    const memoizedCurrentStep = currentStep;
    const buffer = createBufferFromPingMessage({
        identifier: 200,
        sequenceNumber: currentStep,
    });
    socket.setOption(
        raw.SocketLevel.IPPROTO_IP,
        raw.SocketOption.IP_TTL,
        currentStep,
    );
    socket.send(
        buffer,
        0,
        buffer.length,
        process.env.IP_ADDRESS,
        () => {
            socket.setOption(
                raw.SocketLevel.IPPROTO_IP,
                raw.SocketOption.IP_TTL,
                memoizedCurrentStep,
            );
        },
        () => {},
    );

    ++currentStep;
}, 1000);

socket.on('message', (buffer: Buffer, source: string) => {
    const ipMessage = parseIpMessageFromBuffer(buffer);

    let pingMessage: PingMessage;
    try {
        // If parsed successfully, then the ping message was returned
        pingMessage = parsePingMessageFromBuffer(ipMessage.data);
    } catch (e) {
        // If parsed unsuccessfully, then the error message was returned
        // THe ping message is included into the ICMP’s message body
        const icmpMessage = parseIcmpMessageFromBuffer(ipMessage.data);
        const includedIpMessage = parseIpMessageFromBuffer(icmpMessage.data);
        pingMessage = parsePingMessageFromBuffer(includedIpMessage.data, {
            validateBody: false,
        });
    }

    console.log(pingMessage.sequenceNumber, ipMessage.sourceIp);

    if (ipMessage.sourceIp === process.env.IP_ADDRESS) {
        // We reached the end
        process.exit(0);
    }
});

socket.on('error', error => {
    console.log('Error', error);
});

socket.on('close', error => {
    console.log('Close', error);
});
