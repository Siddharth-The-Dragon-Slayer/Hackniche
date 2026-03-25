/**
 * BanquetEase Invitation Template Registry
 *
 * Loads the correct JSON template based on event_type and merges
 * caller-supplied variables into the template's `variables` block.
 *
 * Usage:
 *   import { loadTemplate, EVENT_TYPES, requiredVariables } from "@/lib/invitation-templates";
 *   const template = await loadTemplate("wedding", { bride: "Priya", groom: "Arjun", ... });
 */

import { readFileSync } from "fs";
import { join } from "path";

// ─── Lazy-loaded template cache (production only) ─────────────────────────

let templateCache = {};
const isDev = process.env.NODE_ENV !== "production";

function loadTemplateJSON(filename) {
  // In dev mode, always re-read from disk so edits are picked up instantly
  if (!isDev && templateCache[filename]) return templateCache[filename];

  try {
    const projectRoot = process.cwd();
    const filepath = join(projectRoot, "src", "lib", "invitation-templates", "json", `${filename}.json`);
    const data = readFileSync(filepath, "utf-8");
    const template = JSON.parse(data);
    if (!isDev) templateCache[filename] = template;
    return template;
  } catch (err) {
    throw new Error(`Failed to load template "${filename}": ${err.message}`);
  }
}

// ─── Registry ──────────────────────────────────────────────────────────────

/** All supported event type keys. */
export const EVENT_TYPES = ["birthday", "wedding", "anniversary", "corporate", "engagement"];

// ─── Required Variable Definitions ─────────────────────────────────────────

/**
 * Minimum required variables for each event type.
 * Used by the route for request validation.
 */
export const requiredVariables = {
  birthday: [
    "guestName",
    "eventDate",
    "eventTime",
    "venueName",
    "venueAddress",
    "hostName",
    "rsvpContact",
  ],
  wedding: [
    "bride",
    "groom",
    "weddingDate",
    "ceremonyTime",
    "receptionTime",
    "venueName",
    "venueAddress",
    "rsvpContact",
  ],
  anniversary: [
    "coupleName",
    "years",
    "eventDate",
    "eventTime",
    "venueName",
    "venueAddress",
    "hostName",
    "rsvpContact",
  ],
  corporate: [
    "eventTitle",
    "companyName",
    "eventDate",
    "eventTime",
    "venueName",
    "venueAddress",
    "contactEmail",
  ],
  engagement: [
    "partner1",
    "partner2",
    "eventDate",
    "eventTime",
    "venueName",
    "venueAddress",
    "rsvpContact",
  ],
};

// ─── Template Loader ────────────────────────────────────────────────────────

/**
 * Load a template with caller-supplied variables merged on top of the defaults.
 *
 * @param {string} eventType  - One of EVENT_TYPES
 * @param {object} variables  - Key/value pairs to merge into template.variables
 * @returns {object}          - Deep-cloned template with merged variables
 * @throws  {Error}           - If eventType is not found
 */
export function loadTemplate(eventType, variables = {}) {
  const normalized = eventType?.toLowerCase()?.trim();

  if (!EVENT_TYPES.includes(normalized)) {
    throw new Error(
      `Unknown event type "${eventType}". Supported types: ${EVENT_TYPES.join(", ")}`
    );
  }

  // Load the JSON template
  const templateData = loadTemplateJSON(normalized);
  
  // Deep clone to avoid mutating the cached template
  const template = JSON.parse(JSON.stringify(templateData));

  // Merge caller variables over template defaults
  template.variables = {
    ...(template.variables || {}),
    ...variables,
  };

  return template;
}

/**
 * Validate that all required variables for an event type are present.
 *
 * @param {string} eventType
 * @param {object} variables
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateVariables(eventType, variables = {}) {
  const normalized = eventType?.toLowerCase()?.trim();
  const required = requiredVariables[normalized] || [];
  const missing = required.filter(
    (key) => variables[key] === undefined || variables[key] === null || variables[key] === ""
  );
  return { valid: missing.length === 0, missing };
}
