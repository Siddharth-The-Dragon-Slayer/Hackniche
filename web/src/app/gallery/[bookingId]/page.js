"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, ImageIcon, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { validateImageFile } from "@/lib/cloudinary-upload";

export default function GuestGalleryPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.bookingId;

  const [bookingDetails, setBookingDetails] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploaderName, setUploaderName] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
    fetchPhotos(1);
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/gallery/${bookingId}`);
      if (!res.ok) throw new Error("Failed to load gallery info");
      const data = await res.json();
      setBookingDetails(data);
    } catch (err) {
      setError("This gallery link is invalid or has expired.");
    }
  };

  const fetchPhotos = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${bookingId}/photos?page=${pageNum}&limit=25`);
      if (!res.ok) throw new Error("Failed to load photos");
      const data = await res.json();
      setPhotos(data.photos);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
      setHasPrevPage(data.pagination.hasPrevPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file, { maxSizeMB: 10 });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Save directly via our Next.js API route that handles Cloudinary upload
      const res = await fetch(`/api/gallery/${bookingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Increased max body payload in next.config might be required if file is very large,
        // but 10MB default often covers camera photos via JSON. If not, use multipart/form-data.
        body: JSON.stringify({
          fileBase64: base64Data,
          uploader_name: uploaderName.trim() || "Guest",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save photo to gallery");
      }

      // Clear input and refresh
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploaderName("");
      fetchPhotos(1); // Go back to first page to see new photo

    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (error && !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-alt)]">
        <div className="card card-padded max-w-md w-full text-center">
          <X className="w-16 h-16 text-[var(--color-danger)] mx-auto mb-4" />
          <h2 className="h2 mb-2">Unavailable</h2>
          <p className="text-[var(--color-text-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-body)]">
      {/* Header */}
      <div className="sticky top-0 z-[var(--z-sticky)] bg-[var(--color-bg-nav)] shadow-[var(--shadow-nav)] backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="container mx-auto py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
            <div className="mb-2 md:mb-0">
              <h1 className="h2 text-gradient flex flex-wrap items-center gap-2 mb-1">
                <Camera className="w-7 h-7 text-[var(--color-accent)] shrink-0" />
                <span>{bookingDetails?.customerName || "Event"} Gallery</span>
              </h1>
              {bookingDetails?.eventDate && (
                <p className="text-[var(--color-text-muted)] flex flex-wrap items-center gap-2 font-medium text-sm md:text-base">
                  {bookingDetails.eventDate} <span className="text-[var(--color-accent)] hidden sm:inline">•</span> <span className="w-full sm:w-auto block sm:inline">{bookingDetails.venue || "Our Venue"}</span>
                </p>
              )}
            </div>

            {/* Upload Area */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
              <input
                type="text"
                placeholder="Your Name (optional)"
                className="input w-full sm:w-48"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                disabled={uploading}
              />
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-primary flex-1 sm:flex-none justify-center whitespace-nowrap"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container flex-1 py-6 px-4 md:px-8 mb-10">
        {error && (
          <div className="mb-6 mt-5 px-4 py-3 rounded-md bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mb-4" />
            <p className="text-[var(--color-text-muted)]">Loading memories...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="card card-padded text-center py-16 max-w-2xl mx-auto mt-8 border-dashed border-2 border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-primary-ghost)] rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="h3 mb-2">No photos yet</h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              Be the first to share a memory from this special day! Upload a photo using the button above.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[var(--color-primary)] font-bold hover:text-[var(--color-accent)] underline transition-colors"
            >
              Upload your first photo
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 mt-6">
              <AnimatePresence>
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-square rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-bg-alt)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] cursor-pointer hover-lift"
                    onClick={() => window.open(photo.url, "_blank")}
                  >
                    <img
                      src={photo.thumbnail_url}
                      alt="Event memory"
                      className="w-full h-full object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dur-normal)] flex items-end p-4">
                      <p className="text-white text-sm font-medium truncate w-full shadow-md">
                        By {photo.uploader_name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 mb-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
                <button
                  onClick={() => fetchPhotos(page - 1)}
                  disabled={!hasPrevPage}
                  className="btn btn-ghost !p-2 disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 text-[var(--color-text-h)]" />
                </button>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => fetchPhotos(i + 1)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${page === i + 1
                        ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-[var(--shadow-btn)] text-white"
                        : "text-[var(--color-text-body)] hover:bg-[var(--color-primary-ghost)]"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fetchPhotos(page + 1)}
                  disabled={!hasNextPage}
                  className="btn btn-ghost !p-2 disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
                >
                  <ChevronRight className="w-5 h-5 text-[var(--color-text-h)]" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
