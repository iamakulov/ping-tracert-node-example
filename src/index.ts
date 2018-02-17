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

    socket.once('message', (buffer: Buffer, source: string) => {
        const ipMessage = parseIpMessageFromBuffer(buffer);
        console.log(memoizedCurrentStep, source);

        try {
            parsePingMessageFromBuffer(ipMessage.data);
            // If parsed successfully, then the ping message was returned => we reached the end
            process.exit(0);
        } catch (e) {
            // Do nothing
        }
    });

    socket.once('error', error => {
        console.log(error);
    });

    socket.once('close', error => {
        console.log(error);
    });

    ++currentStep;
}, 1000);
