/**
 * EMI Calculator for BanquetEase
 * Generates installment schedules for event bookings.
 */

/**
 * Generate an EMI schedule
 * @param {number} totalAmount     - Total amount to be paid in EMIs
 * @param {number} numInstallments - Number of installments (2-12)
 * @param {string} startDate       - ISO date string for first installment
 * @param {'monthly'|'weekly'|'custom'} frequency
 * @returns {Array} installments array
 */
export function generateEMISchedule(totalAmount, numInstallments, startDate, frequency = 'monthly') {
  if (!totalAmount || !numInstallments || !startDate) return [];

  const perInstallment = Math.floor(totalAmount / numInstallments);
  const remainder = totalAmount - perInstallment * numInstallments;

  const installments = [];
  const base = new Date(startDate);

  for (let i = 0; i < numInstallments; i++) {
    const dueDate = new Date(base);

    if (frequency === 'monthly') {
      dueDate.setMonth(base.getMonth() + i);
    } else if (frequency === 'weekly') {
      dueDate.setDate(base.getDate() + i * 7);
    }
    // 'custom' — all same date, user will edit manually

    // Add remainder to last installment
    const amount = i === numInstallments - 1
      ? perInstallment + remainder
      : perInstallment;

    installments.push({
      installment_number: i + 1,
      amount,
      due_date: dueDate.toISOString().slice(0, 10),
      status: 'pending',       // pending | paid | overdue
      paid_at: null,
      payment_id: null,        // Razorpay payment ID
      razorpay_order_id: null,
    });
  }

  return installments;
}

/**
 * Calculate EMI summary from installments array
 */
export function getEMISummary(installments = []) {
  const total = installments.reduce((s, i) => s + i.amount, 0);
  const paid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pending = installments.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const overdue = installments.filter(i => {
    return i.status === 'pending' && i.due_date && new Date(i.due_date) < new Date();
  });

  return { total, paid, pending, overdueCount: overdue.length, paidCount: installments.filter(i => i.status === 'paid').length };
}
