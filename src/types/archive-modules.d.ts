declare module 'seek-bzip' {
  export function decode(buffer: Uint8Array | Buffer): Buffer;
}

declare module 'lzma' {
  export function compress(
    data: string | Uint8Array,
    mode: number,
    onFinish: (result: number[]) => void,
    onProgress?: (percent: number) => void
  ): void;

  export function decompress(
    byte_array: number[] | Uint8Array,
    onFinish: (result: string | number[]) => void,
    onProgress?: (percent: number) => void
  ): void;
}
