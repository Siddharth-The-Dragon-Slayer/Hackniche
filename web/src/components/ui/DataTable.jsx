'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * DataTable + MobileCardList — responsive table that becomes cards on mobile
 *
 * columns: [{ key, label, render?, align?, className?, width? }]
 * data: array of row objects
 * onRowClick: (row) => void
 * mobileRender: (row) => ReactNode  — custom mobile card layout per row
 * keyField: string — field to use as React key (default 'id')
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  mobileRender,
  loading = false,
  emptyMessage = 'No data found',
  className = '',
  style = {},
}) {
  return (
    <>
      {/* ── Desktop table ── */}
      <div className={`desktop-table-wrap ${className}`} style={style}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <TableSkeleton cols={columns.length} />
          ) : data.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {emptyMessage}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th
                        key={col.key}
                        className={col.className}
                        style={{ width: col.width, textAlign: col.align || 'left' }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIdx) => (
                    <motion.tr
                      key={row[keyField] ?? rowIdx}
                      onClick={(e) => {
                        if (e.target.closest('a, button')) return;
                        onRowClick?.(row);
                      }}
                      style={{ cursor: onRowClick ? 'pointer' : undefined }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: rowIdx * 0.03 }}
                    >
                      {columns.map(col => (
                        <td
                          key={col.key}
                          className={col.tdClassName}
                          style={{ textAlign: col.align || 'left' }}
                        >
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile card list ── */}
      <div className="mobile-card-list">
        {data.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            {emptyMessage}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {data.map((row, rowIdx) => (
              <motion.div
                key={row[keyField] ?? rowIdx}
                className="mobile-card-item"
                onClick={(e) => {
                  if (e.target.closest('a, button')) return;
                  onRowClick?.(row);
                }}
                style={{ cursor: onRowClick ? 'pointer' : undefined }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: rowIdx * 0.04 }}
              >
                {mobileRender ? (
                  mobileRender(row)
                ) : (
                  <DefaultMobileCard row={row} columns={columns} />
                )}
                {onRowClick && (
                  <ChevronRight
                    size={16}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function DefaultMobileCard({ row, columns }) {
  const [primary, secondary, ...rest] = columns;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {primary && (
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)' }}>
          {primary.render ? primary.render(row[primary.key], row) : row[primary.key]}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
        {secondary && (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {secondary.render ? secondary.render(row[secondary.key], row) : row[secondary.key]}
          </span>
        )}
        {rest.map(col => (
          <span key={col.key} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span style={{ fontWeight: 600 }}>{col.label}: </span>
            {col.render ? col.render(row[col.key], row) : row[col.key]}
          </span>
        ))}
      </div>
    </div>
  );
}

function TableSkeleton({ cols }) {
  return (
    <table className="data-table">
      <thead>
        <tr>{Array.from({ length: cols }).map((_, i) => <th key={i}>&nbsp;</th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, animation: 'shimmer 1.4s ease infinite' }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
