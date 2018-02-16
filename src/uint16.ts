export const uint16ToBytes = (uint16: number): number[] => {
    return [Math.floor(uint16 / 256), uint16 % 256];
};

export const bytesToUint16 = (bytes: number[]): number => {
    return bytes[0] * 256 + bytes[1];
};
