/**
 * Helper to add QR code to poster templates
 * This creates a QR code element that can be added to any poster
 */

import React from 'react';

/**
 * Creates a QR code component for posters
 * @param {string} qrCodeDataURL - Base64 QR code image
 * @param {object} style - Custom styling options
 * @returns React element with QR code
 */
export function createQRCodeElement(qrCodeDataURL, style = {}) {
  if (!qrCodeDataURL) return null;

  const defaultStyle = {
    position: 'absolute',
    bottom: 30,
    right: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    ...style,
  };

  return React.createElement(
    'div',
    { style: defaultStyle },
    // QR Code Image
    React.createElement('img', {
      src: qrCodeDataURL,
      alt: 'Event QR Code',
      style: {
        width: 120,
        height: 120,
        border: '3px solid #FFFFFF',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
    // "Scan to Check In" text
    React.createElement(
      'div',
      {
        style: {
          background: 'rgba(0,0,0,0.75)',
          color: '#FFFFFF',
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase',
          fontFamily: '"Raleway", sans-serif',
        },
      },
      'Scan to Check In'
    )
  );
}

/**
 * Creates a QR code for wedding posters (gold theme)
 */
export function createWeddingQR(qrCodeDataURL) {
  if (!qrCodeDataURL) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    },
    // QR Code with gold border
    React.createElement('img', {
      src: qrCodeDataURL,
      alt: 'Event QR Code',
      style: {
        width: 180,
        height: 180,
        border: '5px solid #C9A84C',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(201,168,76,0.4)',
        background: '#FFFFFF',
        padding: 8,
      },
    }),
    // Text with gold styling
    React.createElement(
      'div',
      {
        style: {
          background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
          color: '#FFFFFF',
          padding: '10px 28px',
          borderRadius: 28,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          fontFamily: '"Raleway", sans-serif',
          boxShadow: '0 4px 16px rgba(201,168,76,0.5)',
        },
      },
      'Scan to Check In'
    )
  );
}

/**
 * Creates a QR code for birthday posters (purple/gold theme)
 */
export function createBirthdayQR(qrCodeDataURL) {
  if (!qrCodeDataURL) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    },
    React.createElement('img', {
      src: qrCodeDataURL,
      alt: 'Event QR Code',
      style: {
        width: 180,
        height: 180,
        border: '5px solid #FFD700',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(255,215,0,0.5)',
        background: '#FFFFFF',
        padding: 8,
      },
    }),
    React.createElement(
      'div',
      {
        style: {
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#2D0C5E',
          padding: '10px 28px',
          borderRadius: 28,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          fontFamily: '"Raleway", sans-serif',
          boxShadow: '0 4px 16px rgba(255,215,0,0.5)',
        },
      },
      'Scan to Join'
    )
  );
}

/**
 * Creates a QR code for anniversary posters (bronze theme)
 */
export function createAnniversaryQR(qrCodeDataURL) {
  if (!qrCodeDataURL) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    },
    React.createElement('img', {
      src: qrCodeDataURL,
      alt: 'Event QR Code',
      style: {
        width: 180,
        height: 180,
        border: '5px solid #B87333',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(184,115,51,0.4)',
        background: '#FFFFFF',
        padding: 8,
      },
    }),
    React.createElement(
      'div',
      {
        style: {
          background: '#B87333',
          color: '#FFFFFF',
          padding: '10px 28px',
          borderRadius: 28,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          fontFamily: '"Raleway", sans-serif',
          boxShadow: '0 4px 16px rgba(184,115,51,0.5)',
        },
      },
      'Scan to Check In'
    )
  );
}

/**
 * Creates a QR code for corporate posters (blue theme)
 */
export function createCorporateQR(qrCodeDataURL) {
  if (!qrCodeDataURL) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    },
    React.createElement('img', {
      src: qrCodeDataURL,
      alt: 'Event QR Code',
      style: {
        width: 180,
        height: 180,
        border: '5px solid #1E3A8A',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(30,58,138,0.4)',
        background: '#FFFFFF',
        padding: 8,
      },
    }),
    React.createElement(
      'div',
      {
        style: {
          background: '#1E3A8A',
          color: '#FFFFFF',
          padding: '10px 28px',
          borderRadius: 28,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          fontFamily: '"Raleway", sans-serif',
          boxShadow: '0 4px 16px rgba(30,58,138,0.5)',
        },
      },
      'Scan to Register'
    )
  );
}

/**
 * Creates a QR code for engagement posters (pink theme)
 */
export function createEngagementQR(qrCodeDataURL) {
  if (!qrCodeDataURL) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    },
    React.createElement('img', {
      src: qrCodeDataURL,
      alt: 'Event QR Code',
      style: {
        width: 180,
        height: 180,
        border: '5px solid #D4A5A5',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(212,165,165,0.4)',
        background: '#FFFFFF',
        padding: 8,
      },
    }),
    React.createElement(
      'div',
      {
        style: {
          background: 'linear-gradient(135deg, #D4A5A5 0%, #B08080 100%)',
          color: '#FFFFFF',
          padding: '10px 28px',
          borderRadius: 28,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          fontFamily: '"Raleway", sans-serif',
          boxShadow: '0 4px 16px rgba(212,165,165,0.5)',
        },
      },
      'Scan to Check In'
    )
  );
}
