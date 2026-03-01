/**
 * Cloudinary unsigned upload helper.
 *
 * Uses the Cloudinary Upload API with an unsigned preset — no server needed.
 * Set these in .env:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME   — your Cloudinary cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET — an *unsigned* upload preset (e.g. "decor_images")
 *
 * Usage:
 *   import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary-upload';
 *   const { url, public_id } = await uploadToCloudinary(file, 'decor_packages');
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single File object to Cloudinary.
 * @param {File}   file    - Browser File object
 * @param {string} folder  - Cloudinary folder path, e.g. 'decor_packages/branch_001'
 * @param {function} [onProgress] - Optional callback (0–100)
 * @returns {Promise<{ url: string, public_id: string, thumbnail_url: string }>}
 */
export async function uploadToCloudinary(
  file,
  folder = "decor_packages",
  onProgress,
) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env",
    );
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", folder);

  // Use XMLHttpRequest for progress support
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    );

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          public_id: data.public_id,
          // Convenience thumbnail (200px wide, auto-cropped)
          thumbnail_url: data.secure_url.replace(
            "/upload/",
            "/upload/w_200,h_200,c_fill,q_auto,f_auto/",
          ),
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

/**
 * Validate a file before uploading.
 * @param {File} file
 * @param {{ maxSizeMB?: number, allowedTypes?: string[] }} opts
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, opts = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  } = opts;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Only ${allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")} files are allowed`,
    };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File too large (${sizeMB.toFixed(1)} MB). Max ${maxSizeMB} MB allowed.`,
    };
  }

  return { valid: true };
}
