import {
    createBufferFromIcmpMessage,
    parseIcmpMessageFromBuffer,
} from './icmp';
import { uint16ToBytes, bytesToUint16 } from '../uint16';

const ECHO_REQUEST_TYPE = 0x08;
const ECHO_REQUEST_CODE = 0x00;

const PING_DATA = 'abcdefghijklmnopqrstuvwxyz';

export interface PingMessage {
    identifier: number;
    sequenceNumber: number;
}

export const createBufferFromPingMessage = ({
    identifier,
    sequenceNumber,
}: PingMessage): Buffer => {
    return createBufferFromIcmpMessage({
        type: ECHO_REQUEST_TYPE,
        code: ECHO_REQUEST_CODE,
        restOfHeader: new Buffer([
            ...uint16ToBytes(identifier),
            ...uint16ToBytes(sequenceNumber),
        ]),
        data: Buffer.from(PING_DATA),
    });
};

export const parsePingMessageFromBuffer = (buffer: Buffer): PingMessage => {
    const icmpMessage = parseIcmpMessageFromBuffer(buffer);

    if (!(icmpMessage.type === 0 || icmpMessage.type === 8)) {
        throw new Error(
            `Expected the ping message and instead received type ${
                icmpMessage.type
            }`,
        );
    }

    const receivedData = icmpMessage.data.toString('utf8');
    if (receivedData !== PING_DATA) {
        throw new Error(
            `Failed to parse the ping message: received a wrong response: ${[
                ...icmpMessage.data,
            ].join(' ')}`,
        );
    }

    return {
        identifier: bytesToUint16([...icmpMessage.restOfHeader.slice(0, 2)]),
        sequenceNumber: bytesToUint16([
            ...icmpMessage.restOfHeader.slice(2, 4),
        ]),
    };
};
