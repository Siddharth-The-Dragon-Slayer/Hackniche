"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary-upload";

/**
 * ImageUpload — drag-and-drop multi-image uploader backed by Cloudinary.
 *
 * Props:
 *   images      {string[]}  — current array of image URLs (controlled)
 *   onChange    {fn}        — (newUrls: string[]) => void
 *   folder      {string}    — Cloudinary folder, e.g. 'decor_packages'
 *   maxImages   {number}    — default 10
 *   label       {string}    — section title
 *   disabled    {boolean}
 */
export default function ImageUpload({
  images = [],
  onChange,
  folder = "decor_packages",
  maxImages = 10,
  label = "Reference Images",
  disabled = false,
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false); // any upload in flight?
  const [progMap, setProgMap] = useState({}); // filename → 0-100
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const canAdd = images.length < maxImages && !disabled;

  const handleFiles = useCallback(
    async (files) => {
      const fileArr = Array.from(files).slice(0, maxImages - images.length);
      if (!fileArr.length) return;

      const newErrors = [];
      const validFiles = fileArr.filter((f) => {
        const { valid, error } = validateImageFile(f, { maxSizeMB: 5 });
        if (!valid) newErrors.push(`${f.name}: ${error}`);
        return valid;
      });

      setErrors(newErrors);
      if (!validFiles.length) return;

      setUploading(true);
      const results = await Promise.allSettled(
        validFiles.map((file) => {
          setProgMap((p) => ({ ...p, [file.name]: 0 }));
          return uploadToCloudinary(file, folder, (pct) =>
            setProgMap((p) => ({ ...p, [file.name]: pct })),
          );
        }),
      );
      setUploading(false);
      setProgMap({});

      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value.url);

      const failed = results
        .filter((r) => r.status === "rejected")
        .map(
          (r, i) =>
            `${validFiles[i]?.name}: ${r.reason?.message || "Upload failed"}`,
        );

      if (failed.length) setErrors((prev) => [...prev, ...failed]);
      if (successful.length) onChange([...images, ...successful]);
    },
    [images, onChange, folder, maxImages],
  );

  const removeImage = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  // Drag handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (canAdd) handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Section label */}
      <div
        className="form-section-title"
        style={{ marginTop: 24, marginBottom: 8 }}
      >
        {label}
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "var(--color-text-muted)",
            marginLeft: 8,
          }}
        >
          ({images.length}/{maxImages} · JPG, PNG, WEBP · max 5 MB each)
        </span>
      </div>

      {/* Existing image grid */}
      {images.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {images.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: 10,
                overflow: "hidden",
                border: "1.5px solid var(--color-border)",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Package image ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.65)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}

          {/* In-progress placeholders */}
          {Object.entries(progMap).map(([name, pct]) => (
            <div
              key={name}
              style={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: 10,
                border: "1.5px solid var(--color-border)",
                background: "var(--color-bg-alt)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <Loader2
                size={20}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "var(--color-primary)",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {pct}%
              </span>
              {/* progress bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: 3,
                  width: `${pct}%`,
                  background: "var(--color-primary)",
                  transition: "width .2s",
                  borderRadius: "0 0 10px 10px",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border)"}`,
            borderRadius: 12,
            padding: "20px 16px",
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            background: dragging ? "var(--color-primary-ghost)" : "transparent",
            transition: "all .15s",
          }}
        >
          {uploading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Loader2
                size={22}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "var(--color-primary)",
                }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Uploading…
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ImagePlus
                size={22}
                style={{ color: "var(--color-text-muted)", opacity: 0.6 }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                <span
                  style={{ color: "var(--color-primary)", fontWeight: 600 }}
                >
                  Click to upload
                </span>{" "}
                or drag & drop
              </span>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {maxImages - images.length} image
                {maxImages - images.length !== 1 ? "s" : ""} remaining
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
            disabled={uploading}
          />
        </div>
      )}

      {images.length >= maxImages && !disabled && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginTop: 6,
          }}
        >
          Maximum {maxImages} images reached. Remove one to add more.
        </p>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {errors.map((err, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                fontSize: 12,
                color: "var(--color-danger)",
              }}
            >
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
