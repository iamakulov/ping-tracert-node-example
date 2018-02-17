import * as raw from 'raw-socket';
import { uint16ToBytes, bytesToUint16 } from '../uint16';

interface IpMessage {
    identification: number;
    sourceIp: string;
    destinationIp: string;
    ttl: number;
    protocol: number;
    data: Buffer;
}

export const createBufferFromIpMessage = ({
    identification,
    sourceIp,
    destinationIp,
    ttl,
    protocol,
    data,
}: IpMessage): Buffer => {
    const HEADER_LENGTH = 20;
    const header = new Buffer([
        // Version + IHL
        0x45,
        // DCSP + ESN
        0x00,
        // Total length
        ...uint16ToBytes(HEADER_LENGTH + data.length),
        // Identification
        ...uint16ToBytes(identification),
        // Flags + fragment offset
        ...uint16ToBytes(0),
        // TTL
        ttl,
        // Protocol
        protocol,
        // Header checksum (initially zeroed)
        ...uint16ToBytes(0),
        ...sourceIp.split('.').map(Number),
        ...destinationIp.split('.').map(Number),
    ]);

    raw.writeChecksum(header, 10, raw.createChecksum(header));

    return new Buffer([...header, ...data]);
};

export const parseIpMessageFromBuffer = (buffer: Buffer): IpMessage => {
    return {
        identification: bytesToUint16([...buffer.slice(4, 6)]),
        sourceIp: [...buffer.slice(12, 16)].join('.'),
        destinationIp: [...buffer.slice(16, 20)].join('.'),
        ttl: buffer[8],
        protocol: buffer[9],
        data: buffer.slice(20),
    };
};
