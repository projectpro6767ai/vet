import QRCode from 'qrcode';

/**
 * Utility to generate high-resolution scannable QR codes for Para-vets and LDOs
 */
export async function generateReportQrCode(
  data: string | object,
  options: { width?: number; margin?: number } = {}
): Promise<string> {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      width: options.width || 256,
      margin: options.margin || 2,
      color: {
        dark: '#052e16', // Deep emerald dark for high veterinary contrast
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to render QR Code:', err);
    return '';
  }
}
