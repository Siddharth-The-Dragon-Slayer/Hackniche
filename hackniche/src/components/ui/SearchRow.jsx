'use client';
import { Search } from 'lucide-react';

/**
 * SearchRow — responsive search + filter bar
 */
export default function SearchRow({
  placeholder = 'Search...',
  value,
  onChange,
  children,
  className = '',
  style = {},
}) {
  return (
    <div className={`search-row ${className}`} style={style}>
      <div className="search-input-wrap">
        <Search size={16} className="search-icon" />
        <input
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingLeft: 40 }}
        />
      </div>
      {children}
    </div>
  );
}
