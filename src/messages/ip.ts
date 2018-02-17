interface IpMessage {
    header: Buffer;
    sourceIp: string;
    destinationIp: string;
    data: Buffer;
}

export const parseIpMessageFromBuffer = (buffer: Buffer): IpMessage => {
    return {
        header: buffer.slice(0, 20),
        sourceIp: [...buffer.slice(12, 16)].join('.'),
        destinationIp: [...buffer.slice(16, 20)].join('.'),
        data: buffer.slice(20),
    };
};
