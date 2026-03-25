"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function TestQRPage() {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("BOOK_001");

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-poster-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          eventType: "wedding",
          guestName: "John & Jane",
          eventDate: "2026-06-15",
          eventTime: "7:00 PM",
          venueName: "Grand Ballroom",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQrCode(data);
      }
    } catch (err) {
      console.error("QR generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          QR Code Generator - Test Page
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Generate QR Code
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking ID
                </label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="BOOK_001"
                />
              </div>

              <button
                onClick={generateQR}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate QR Code"}
              </button>
            </div>

            {qrCode && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ QR Code Generated!</strong>
                </p>
                <p className="text-xs text-green-600 mt-1 break-all">
                  {qrCode.checkInUrl}
                </p>
              </div>
            )}
          </div>

          {/* QR Display Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">QR Code</h2>

            {qrCode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="bg-gray-50 p-6 rounded-xl inline-block">
                  <img
                    src={qrCode.qrCode}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Scan this QR code to test check-in
                </p>

                <a
                  href={qrCode.checkInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Open Check-in Page
                </a>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Generate a QR code to see it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            How to Test:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Enter a booking ID (or use the default)</li>
            <li>Click "Generate QR Code"</li>
            <li>Scan the QR code with your phone OR click "Open Check-in Page"</li>
            <li>Test the GRE check-in interface</li>
            <li>Click "Confirm Check-In" to see the success animation</li>
          </ol>
        </div>

        {/* API Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">API Endpoint:</h3>
          <code className="block bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
            POST /api/ai/generate-poster-qr
          </code>
        </div>
      </div>
    </div>
  );
}
