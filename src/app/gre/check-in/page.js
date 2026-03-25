"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Users, Clock } from "lucide-react";

export default function GRECheckInPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const guestId = searchParams.get("guest");

  const [loading, setLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      // TODO: Fetch booking details from Firestore
      // For now, mock data
      setBookingDetails({
        id: bookingId,
        customerName: "John & Jane Wedding",
        eventDate: "2026-06-15",
        eventTime: "7:00 PM",
        venue: "Grand Ballroom",
        expectedGuests: 250,
        checkedInGuests: 127,
      });
    } catch (err) {
      setError("Failed to load booking details");
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Call API to record check-in
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setCheckInStatus("success");
      
      // Update checked-in count
      if (bookingDetails) {
        setBookingDetails({
          ...bookingDetails,
          checkedInGuests: bookingDetails.checkedInGuests + 1,
        });
      }
    } catch (err) {
      setError("Check-in failed. Please try again.");
      setCheckInStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">
            This QR code is not valid. Please scan a valid event QR code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Guest Check-In</h1>
            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
              GRE Portal
            </div>
          </div>

          {bookingDetails && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Event</p>
                <p className="text-lg font-semibold text-gray-800">
                  {bookingDetails.customerName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-700">
                    {bookingDetails.eventDate}
                  </p>
                  <p className="text-sm text-gray-600">{bookingDetails.eventTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="font-medium text-gray-700">{bookingDetails.venue}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Guest Counter */}
        {bookingDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-xl p-6 mb-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Guests Arrived</p>
                <p className="text-4xl font-bold">
                  {bookingDetails.checkedInGuests}
                  <span className="text-2xl text-purple-200">
                    {" "}
                    / {bookingDetails.expectedGuests}
                  </span>
                </p>
              </div>
              <Users className="w-16 h-16 text-purple-200" />
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(bookingDetails.checkedInGuests / bookingDetails.expectedGuests) * 100}%`,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Check-in Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {checkInStatus === "success" ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Check-in Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Guest has been checked in successfully.
              </p>
              <button
                onClick={() => setCheckInStatus(null)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Check In Another Guest
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ready to Check In
              </h2>
              <p className="text-gray-600 mb-6">
                Confirm guest arrival for this event
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Checking In..." : "Confirm Check-In"}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Booking ID: {bookingId}
              </p>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <p className="text-sm text-blue-800">
            <strong>GRE Instructions:</strong> Scan guest QR codes at the entrance. The
            system will automatically update the guest count and notify the kitchen staff.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
