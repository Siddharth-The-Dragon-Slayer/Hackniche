/**
 * WATI WhatsApp API Client
 * Docs: https://docs.wati.io
 * Endpoint: https://live-mt-server.wati.io/10103930
 *
 * Send session messages (within 24h window) and template messages.
 */

const WATI_API_URL   = process.env.WATI_API_URL;
const WATI_TOKEN     = process.env.WATI_ACCESS_TOKEN;

// ---------------------------------------------------------------------------
// Normalise Indian phone numbers → WATI format (no +, starts with 91)
// e.g.  "9876543210"    → "919876543210"
//       "+919876543210" → "919876543210"
//       "919876543210"  → "919876543210"
// ---------------------------------------------------------------------------
export function normalizePhone(phone) {
  if (!phone) return null;
  let n = String(phone).replace(/\D/g, '');
  if (n.length === 10) n = '91' + n;
  if (n.startsWith('0')) n = '91' + n.slice(1);
  return n;
}

// ---------------------------------------------------------------------------
// Send a free-text session message (works within 24h of customer message)
// ---------------------------------------------------------------------------
export async function sendSessionMessage(phone, messageText) {
  const number = normalizePhone(phone);
  if (!number) throw new Error('Invalid phone number');
  if (!WATI_API_URL || !WATI_TOKEN) throw new Error('WATI_API_URL / WATI_ACCESS_TOKEN not set in env');

  const form = new FormData();
  form.append('messageText', messageText);

  const res = await fetch(`${WATI_API_URL}/api/v1/sendSessionMessage/${number}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WATI_TOKEN}` },
    body: form,
  });

  const data = await res.json().catch(() => ({ result: false }));
  if (!res.ok) throw new Error(data?.info || data?.error || `WATI error ${res.status}`);
  return data;
}

// ---------------------------------------------------------------------------
// Send a pre-approved template message (works anytime, no 24h limit)
// parameters: [{ name: 'customer_name', value: 'Rahul' }, ...]
// ---------------------------------------------------------------------------
export async function sendTemplateMessage(phone, templateName, broadcastName, parameters = []) {
  const number = normalizePhone(phone);
  if (!number) throw new Error('Invalid phone number');
  if (!WATI_API_URL || !WATI_TOKEN) throw new Error('WATI_API_URL / WATI_ACCESS_TOKEN not set in env');

  const res = await fetch(
    `${WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${number}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WATI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_name:  templateName,
        broadcast_name: broadcastName,
        parameters,
      }),
    }
  );

  const data = await res.json().catch(() => ({ result: false }));
  if (!res.ok) throw new Error(data?.info || data?.error || `WATI error ${res.status}`);
  return data;
}

// ---------------------------------------------------------------------------
// Build a lead status update message (plain text for session window)
// ---------------------------------------------------------------------------
const STATUS_MESSAGES = {
  new:                  'Your enquiry has been received. Our team will get in touch shortly.',
  visited:              'Thank you for visiting our venue! We hope you loved it. Our team will follow up with more details.',
  tasting_scheduled:    'Your food tasting has been scheduled. Looking forward to seeing you!',
  tasting_done:         'Thank you for the food tasting session! We noted your preferences and will prepare a personalised quote.',
  menu_selected:        'Great news — your menu and quote are ready! Please review the details and let us know your feedback.',
  advance_paid:         'We have received your advance payment. Your booking is now confirmed! Excited to host your event.',
  decoration_scheduled: 'Your decoration and event plan has been finalized. Everything is in place for a wonderful event!',
  paid:                 'Full payment received. Your event is fully confirmed and locked. We look forward to making it memorable!',
  in_progress:          "Your event is now in progress! Wishing you a beautiful celebration. Our team is at your service.",
  completed:            'Your event has been successfully completed. Thank you for choosing us!',
  settlement_complete:  'Post-event settlement is complete. Thank you for being a wonderful guest!',
  closed:               'Your lead is now closed. It was a pleasure serving you! We hope to see you again.',
  on_hold:              'Your enquiry has been temporarily put on hold. We will get back to you soon.',
  lost:                 'We are sorry we could not serve you this time. We hope to work with you in the future!',
};

export function buildLeadUpdateMessage(lead) {
  const name    = lead.customer_name || 'Valued Customer';
  const event   = lead.event_type   || 'your event';
  const date    = lead.event_date   ? new Date(lead.event_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '';
  const status  = lead.status       || '';
  const stageMsg = STATUS_MESSAGES[status] || `Your booking is currently at stage: ${status.replace(/_/g, ' ')}.`;
  const quote   = lead.quote?.total_estimated ? `\n\n💰 Estimated Quote: ₹${Number(lead.quote.total_estimated).toLocaleString('en-IN')}` : '';
  const dateStr = date ? `\n📅 Event Date: ${date}` : '';

  return `🎉 *BanquetEase Update*\n\nHello ${name},\n\n${stageMsg}${dateStr}\n🎊 Event: ${event}${quote}\n\nFor any queries, feel free to contact us anytime. We are here to make your celebration special!\n\n— *BanquetEase Team*`;
}
