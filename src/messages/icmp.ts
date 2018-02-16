import { Buffer } from 'buffer';
import * as raw from 'raw-socket';
import { uint16ToBytes } from '../uint16';

interface IcmpMessage {
    type: number;
    code: number;
    restOfHeader: Buffer;
    data: Buffer;
}

export const createBufferFromIcmpMessage = ({
    type,
    code,
    restOfHeader,
    data,
}: IcmpMessage): Buffer => {
    const buffer = new Buffer([
        type,
        code,
        // Checksum is initially zeroed
        ...uint16ToBytes(0),
        ...restOfHeader,
        ...data,
    ]);

    raw.writeChecksum(buffer, 2, raw.createChecksum(buffer));

    return buffer;
};

export const parseIcmpMessageFromBuffer = (buffer: Buffer): IcmpMessage => {
    return {
        type: buffer[0],
        code: buffer[1],
        restOfHeader: buffer.slice(4, 8),
        data: buffer.slice(8),
    };
};
