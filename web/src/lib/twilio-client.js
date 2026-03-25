/**
 * Twilio WhatsApp Client
 *
 * To enable:
 *   1. Sign up at https://console.twilio.com
 *   2. Go to Messaging → Try it out → Send a WhatsApp message
 *   3. Join the sandbox by sending "join <word>" to the sandbox number
 *   4. Add to .env:
 *      TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *      TWILIO_AUTH_TOKEN=your_auth_token
 *      TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   (sandbox number)
 *
 * Then uncomment the code below and the calls in send-balance-reminder/route.js
 */

// ─── UNCOMMENT BELOW TO ENABLE TWILIO WHATSAPP ───────────────────────────────

/*
import twilio from 'twilio';

let _client = null;

export function getTwilioClient() {
  if (_client) return _client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set in .env');
  }

  _client = twilio(accountSid, authToken);
  return _client;
}

// Normalize Indian phone numbers to WhatsApp format
// e.g. "9876543210" → "whatsapp:+919876543210"
export function toWhatsAppNumber(phone) {
  if (!phone) return null;
  let n = String(phone).replace(/\D/g, '');
  if (n.length === 10) n = '91' + n;
  if (n.startsWith('0')) n = '91' + n.slice(1);
  return `whatsapp:+${n}`;
}

export async function sendWhatsApp(to, body) {
  const client = getTwilioClient();
  const from   = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const toNum  = toWhatsAppNumber(to);

  if (!toNum) throw new Error('Invalid phone number');

  const message = await client.messages.create({ from, to: toNum, body });
  return message;
}
*/

// ─── PLACEHOLDER (active when Twilio is commented out) ───────────────────────

export async function sendWhatsApp(to, body) {
  console.log(`[Twilio WhatsApp - DISABLED] To: ${to}\nMessage: ${body}`);
  return { status: 'disabled', message: 'Twilio not configured. Uncomment twilio-client.js to enable.' };
}
