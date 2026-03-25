'use client';
import { useRef, useEffect } from 'react';

/**
 * Tabs — responsive tab bar with active indicator
 *
 * tabs: [{ key, label, count? }]
 * activeTab: string
 * onChange: (key) => void
 */
export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  const activeTabRef = useRef(null);
  
  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (activeTabRef.current && activeTabRef.current.parentElement) {
      const tabList = activeTabRef.current.parentElement;
      const activeTab = activeTabRef.current;
      const activeTabLeft = activeTab.offsetLeft;
      const activeTabRight = activeTabLeft + activeTab.offsetWidth;
      const scrollLeft = tabList.scrollLeft;
      const scrollRight = scrollLeft + tabList.clientWidth;
      
      // If active tab is not visible, scroll it into view
      if (activeTabLeft < scrollLeft) {
        tabList.scrollLeft = activeTabLeft - 12;
      } else if (activeTabRight > scrollRight) {
        tabList.scrollLeft = activeTabRight - tabList.clientWidth + 12;
      }
    }
  }, [activeTab]);

  return (
    <div className={`tab-list ${className}`} role="tablist">
      {tabs.map(tab => {
        const tabKey = tab.key ?? tab.label;
        const isActive = activeTab === tabKey;
        
        return (
          <button
            key={tabKey}
            ref={isActive ? activeTabRef : null}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onChange?.(tabKey)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tabKey}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 6,
                minWidth: '22px',
                height: '22px',
                fontSize: 10,
                fontWeight: 700,
                padding: '0 6px',
                borderRadius: 99,
                background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
