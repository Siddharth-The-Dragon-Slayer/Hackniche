"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Users, Camera, X, QrCode } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const bookingIdFromUrl = searchParams.get("booking");
  const peopleFromUrl = searchParams.get("people");

  const [loading, setLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [totalRSVPed, setTotalRSVPed] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannerDivId = "qr-reader";

  useEffect(() => {
    if (bookingIdFromUrl && peopleFromUrl) {
      handleCheckIn(bookingIdFromUrl, parseInt(peopleFromUrl));
    }
  }, [bookingIdFromUrl, peopleFromUrl]);

  useEffect(() => {
    // Load total RSVP count from localStorage
    const stored = localStorage.getItem("totalRSVPed");
    if (stored) {
      setTotalRSVPed(parseInt(stored));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleCheckIn = async (bookingId, numberOfPeople) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Call API to record check-in
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Update total RSVP count
      const newTotal = totalRSVPed + numberOfPeople;
      setTotalRSVPed(newTotal);
      localStorage.setItem("totalRSVPed", newTotal.toString());

      setCheckInStatus({
        success: true,
        bookingId,
        numberOfPeople,
      });

      // Stop scanner if active
      await stopScanner();
      setShowScanner(false);
    } catch (err) {
      setError("Check-in failed. Please try again.");
      setCheckInStatus({ success: false });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setShowScanner(true);
      setError(null);
      setScannerReady(false);

      // Wait for DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(scannerDivId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
      );

      setScannerReady(true);
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.");
      console.error("Camera error:", err);
      setShowScanner(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScannerReady(false);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log("QR Code detected:", decodedText);
    handleQRCodeDetected(decodedText);
  };

  const onScanError = (errorMessage) => {
    // Ignore scan errors (they happen frequently while scanning)
  };

  const handleQRCodeDetected = (qrData) => {
    try {
      // Parse the URL from QR code
      const url = new URL(qrData);
      const bookingId = url.searchParams.get("booking");
      const people = url.searchParams.get("people");

      if (bookingId && people) {
        handleCheckIn(bookingId, parseInt(people));
      } else {
        setError("Invalid QR code: Missing booking or people information");
      }
    } catch (err) {
      setError("Invalid QR code format");
      console.error("QR parse error:", err);
    }
  };

  const handleManualInput = async () => {
    await stopScanner();
    setShowScanner(false);

    const bookingId = prompt("Enter Booking ID:");
    const people = prompt("Enter Number of People:");

    if (bookingId && people) {
      handleCheckIn(bookingId, parseInt(people));
    }
  };

  const handleCloseScanner = async () => {
    await stopScanner();
    setShowScanner(false);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Guest Check-In</h1>
          <p>Scan QR codes to check in guests</p>
        </div>
        <div className="page-actions">
          <div
            style={{
              background: "var(--gradient-btn)",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Users size={16} />
            <div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>Total RSVP'd</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{totalRSVPed}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Scan QR Code</h2>
                <button
                  onClick={handleCloseScanner}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* QR Scanner Container */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <div id={scannerDivId} className="w-full" />
                {!scannerReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-center text-gray-600 text-sm mb-4">
                Position the QR code within the frame
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleManualInput}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Enter Manually Instead
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div variants={fadeUp}>
        {checkInStatus?.success ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle
                className="w-20 h-20 text-green-500 mx-auto mb-4"
                style={{ color: "var(--color-success)" }}
              />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Check-in Successful!
            </h2>
            <p className="text-gray-600 mb-2">
              <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
                {checkInStatus.numberOfPeople}
              </span>{" "}
              {checkInStatus.numberOfPeople === 1 ? "guest" : "guests"} checked in
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Booking ID: {checkInStatus.bookingId}
            </p>
            <button
              onClick={() => {
                setCheckInStatus(null);
                startScanner();
              }}
              className="btn btn-primary"
            >
              Scan Next Guest
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "var(--color-primary-ghost)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <QrCode size={40} style={{ color: "var(--color-primary)" }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Check In</h2>
            <p className="text-gray-600 mb-6">Scan QR code or enter details manually</p>

            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
                style={{ maxWidth: 400, margin: "0 auto 16px" }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={startScanner}
                disabled={loading}
                className="btn btn-primary"
                style={{ minWidth: 200 }}
              >
                <Camera className="inline-block mr-2" size={18} />
                {loading ? "Processing..." : "Scan QR Code"}
              </button>

              <button
                onClick={handleManualInput}
                className="btn btn-secondary"
                style={{ minWidth: 200 }}
              >
                Manual Check-In
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div
          className="card"
          style={{
            marginTop: 24,
            padding: 20,
            background: "var(--color-info-ghost)",
            border: "1px solid var(--color-info)",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--color-text-body)", margin: 0 }}>
            <strong>Instructions:</strong> Scan guest QR codes at the entrance. The system
            will automatically update the guest count and track total RSVPs.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
