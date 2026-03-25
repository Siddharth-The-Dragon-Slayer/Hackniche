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
    <div className="min-h-screen mb-6 flex flex-col bg-[var(--color-bg)] text-[var(--color-text-body)]">
      {/* Header */}
      <div className="sticky top-0 z-[var(--z-sticky)] bg-[var(--color-bg-nav)] shadow-sm backdrop-blur-xl border-b border-[var(--color-border)] px-4 py-4 md:py-6">
        <div className="container mx-auto text-center flex flex-col items-center justify-center">
          <h1 className="h1 text-gradient inline-flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-2">
            <Camera className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-accent)] shrink-0" />
            <span>{bookingDetails?.customerName || "Event"} Gallery</span>
          </h1>
          {bookingDetails?.eventDate && (
            <p className="text-[var(--color-text-body)] text-sm md:text-base font-medium">
              {bookingDetails.eventDate} <span className="text-[var(--color-accent)] mx-2">•</span> {bookingDetails.venue || "Our Venue"}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mt-5 flex-1 py-6 px-4 md:px-8 pb-32">
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

      {/* Floating Action Bar (Upload) */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-6 md:bottom-10 left-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] sm:w-auto max-w-xl"
          >
            <div className="bg-[var(--color-bg-card)]/90 backdrop-blur-2xl shadow-[var(--shadow-modal)] border border-[var(--color-border)] rounded-full p-2 pl-4 sm:pl-6 flex flex-row items-center gap-2 sm:gap-4 justify-between">

              <div className="flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="Your Name..."
                  className="w-full bg-transparent text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] focus:outline-none text-sm sm:text-base font-medium"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  disabled={uploading}
                />
              </div>

              <div className="w-[1px] h-8 bg-[var(--color-border)] mx-1 hidden sm:block"></div>

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
                className="btn btn-primary !rounded-full shrink-0 group hover:shadow-[var(--shadow-btn-hover)] transition-all !px-4 sm:!px-6"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-0 sm:mr-2" />
                    <span className="hidden sm:inline">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-0 sm:mr-2 transition-transform group-hover:-translate-y-1" />
                    <span className="hidden sm:inline font-bold">Upload Photo</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
