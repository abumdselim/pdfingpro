declare module "qrcode" {
  interface QrCodeToDataUrlOptions {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }

  function toDataURL(text: string, options?: QrCodeToDataUrlOptions): Promise<string>;

  const QRCode: {
    toDataURL: typeof toDataURL;
  };

  export default QRCode;
}
