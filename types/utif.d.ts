declare module "utif" {
  interface UtifIfd {
    width: number;
    height: number;
  }

  interface UtifModule {
    decode(buffer: ArrayBuffer): UtifIfd[];
    decodeImage(buffer: ArrayBuffer, page: UtifIfd): void;
    toRGBA8(page: UtifIfd): Uint8Array;
  }

  const UTIF: UtifModule;
  export default UTIF;
}
