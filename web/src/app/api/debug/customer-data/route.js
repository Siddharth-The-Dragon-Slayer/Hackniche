/**
 * GET /api/debug/customer-data?uid=xxx&phone=xxx
 * Temporary debug endpoint — shows what data exists for a customer
 * DELETE THIS FILE after debugging
 */
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');
  const phone = searchParams.get('phone');

  const adminDb = getAdminDb();
  const result = {};

  if (uid) {
    // Check user doc
    const userSnap = await adminDb.collection('users').doc(uid).get();
    result.user = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;

    // Leads by customer_uid
    const leadsSnap = await adminDb.collection('leads').where('customer_uid', '==', uid).get();
    result.leads_by_uid = leadsSnap.docs.map(d => ({ id: d.id, status: d.data().status, phone: d.data().phone, customer_name: d.data().customer_name }));

    // Bookings by customer_uid
    const bookingsSnap = await adminDb.collection('bookings').where('customer_uid', '==', uid).get();
    result.bookings_by_uid = bookingsSnap.docs.map(d => ({ id: d.id, status: d.data().status, phone: d.data().phone, customer_name: d.data().customer_name }));
  }

  if (phone) {
    // Leads by phone
    const leadsSnap = await adminDb.collection('leads').where('phone', '==', phone).get();
    result.leads_by_phone = leadsSnap.docs.map(d => ({ id: d.id, status: d.data().status, customer_uid: d.data().customer_uid, customer_name: d.data().customer_name }));

    // Bookings by phone
    const bookingsSnap = await adminDb.collection('bookings').where('phone', '==', phone).get();
    result.bookings_by_phone = bookingsSnap.docs.map(d => ({ id: d.id, status: d.data().status, customer_uid: d.data().customer_uid, customer_name: d.data().customer_name }));
  }

  return NextResponse.json(result);
}
