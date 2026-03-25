/**
 * POST /api/ai/generate-poster-qr
 * 
 * Enhanced poster generation with QR code support
 * Generates event posters with embedded QR codes for guest check-in
 */

import { NextResponse } from "next/server";
import QRCode from 'qrcode';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, eventType = "wedding", guestName, eventDate, eventTime, venueName } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Generate QR code for guest check-in
    const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/check-in?booking=${bookingId}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(checkInUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 200,
      color: {
        dark: '#1a1a1a',
        light: '#FFFFFF',
      },
    });

    // Return QR code and poster data
    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      checkInUrl,
      bookingId,
      message: "QR code generated successfully. Use this with the poster generation API.",
      usage: {
        description: "Include this QR code in your poster by passing qrCode parameter to /api/ai/generate-poster",
        example: {
          eventType,
          formValues: {
            guestName,
            eventDate,
            eventTime,
            venueName,
          },
          qrCode: qrCodeDataURL,
        }
      }
    });

  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "QR code generation failed" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/ai/generate-poster-qr",
    description: "Generate QR codes for event posters (guest check-in)",
    requiredFields: ["bookingId"],
    optionalFields: ["eventType", "guestName", "eventDate", "eventTime", "venueName"],
    example: {
      bookingId: "BOOK_001",
      eventType: "wedding",
      guestName: "John & Jane",
      eventDate: "2026-06-15",
      eventTime: "7:00 PM",
      venueName: "Grand Ballroom"
    },
    qrCodeContains: "/check-in?booking={bookingId}",
    usage: "Scan QR code at event entrance for guest check-in"
  });
}
