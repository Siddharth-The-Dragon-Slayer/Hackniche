/**
 * QR Code Generator Utility
 * 
 * Generates QR codes for:
 * - Guest check-in (GRE scanning)
 * - RSVP confirmation
 * - Event posters
 * - Photo gallery access
 */

import QRCode from 'qrcode';

/**
 * Generate QR code as Data URL (base64)
 * @param {string} data - Data to encode in QR
 * @param {object} options - QR code options
 * @returns {Promise<string>} Data URL of QR code image
 */
export async function generateQRDataURL(data, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  };

  try {
    return await QRCode.toDataURL(data, defaultOptions);
  } catch (err) {
    console.error('QR generation failed:', err);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate guest check-in QR code
 * @param {string} bookingId - Booking ID
 * @param {string} guestId - Guest ID or name
 * @returns {Promise<string>} QR code data URL
 */
export async function generateGuestCheckInQR(bookingId, guestId) {
  const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gre/check-in?booking=${bookingId}&guest=${encodeURIComponent(guestId)}`;
  return generateQRDataURL(checkInUrl, { width: 250 });
}

/**
 * Generate RSVP confirmation QR code
 * @param {string} bookingId - Booking ID
 * @param {string} token - Unique RSVP token
 * @returns {Promise<string>} QR code data URL
 */
export async function generateRSVPQR(bookingId, token) {
  const rsvpUrl = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${bookingId}?token=${token}`;
  return generateQRDataURL(rsvpUrl, { width: 250 });
}

/**
 * Generate photo gallery access QR code
 * @param {string} bookingId - Booking ID
 * @returns {Promise<string>} QR code data URL
 */
export async function generatePhotoGalleryQR(bookingId) {
  const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${bookingId}`;
  return generateQRDataURL(galleryUrl, { width: 250 });
}

/**
 * Generate event details QR code (for posters)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<string>} QR code data URL
 */
export async function generateEventDetailsQR(bookingId) {
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/event/${bookingId}`;
  return generateQRDataURL(eventUrl, { 
    width: 200,
    color: {
      dark: '#1a1a1a',
      light: '#FFFFFF',
    }
  });
}
