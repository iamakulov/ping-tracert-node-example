interface IpMessage {
    header: Buffer;
    data: Buffer;
}

export const parseIpMessageFromBuffer = (buffer: Buffer): IpMessage => {
    return {
        header: buffer.slice(0, 20),
        data: buffer.slice(20),
    };
};
