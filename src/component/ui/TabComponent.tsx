import type {
  ElementType,
} from "react";
import { useState, memo, useCallback, useMemo } from "react";


interface Tab {
  title: string;
  component: ElementType;
  props: any;
}

interface TabComponentProps {
  tabs: Tab[];
}

// Memoized TabComponent to prevent unnecessary re-renders
export const TabComponent = memo(function TabComponent({ tabs }: TabComponentProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const handleKeyDown = useCallback((e: any, index: number) => {
    // 32 is the key code for Space, 13 for Enter
    if (e.key === ' ' || e.key === 'Enter' || e.keyCode === 32 || e.keyCode === 13) {
      e.preventDefault();
      handleTabClick(index);
    }
  }, [handleTabClick]);

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => ({
    tabsContainer: {
      fontFamily: 'var(--font-interface, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji")',
      width: '100%',
    },
    tabList: {
      display: 'flex',
      borderBottom: '1px solid var(--color-base-30, #ddd)',
      padding: '0',
      margin: '0',
      listStyle: 'none',
    },
    tabItem: {
      padding: '10px 15px',
      cursor: 'pointer',
      border: '0',
      outline: 'none',
      borderBottom: '2px solid transparent',
      background: 'transparent',
      fontSize: '1em',
      color: 'var(--text-muted, #6c757d)',
      transition: 'color .2s ease-in-out, border-color .2s ease-in-out',
      marginBottom: '-1px',
    },
    activeTabItem: {
      color: 'var(--text-normal, #000)',
      borderBottom: '2px solid var(--interactive-accent, #4e78f7)',
      fontWeight: '600',
    },
    tabContent: {
      padding: '15px',
    },
    tabPanel: {
      // The display property is handled dynamically
    },
  }), []);

  return (
    <div style={styles.tabsContainer}>
      <div style={styles.tabList} role="tablist">
        {tabs.map((tab, index) => (
          <div
            key={`tab-${index}`}
            style={{
              ...styles.tabItem,
              ...(index === activeTab ? styles.activeTabItem : {}),
            }}
            onClick={() => handleTabClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            tabIndex={0}
            aria-selected={index === activeTab}
            aria-controls={`tab-panel-${index}`}
            id={`tab-${index}`}
          >
            {tab.title}
          </div>
        ))}
      </div>
      <div style={styles.tabContent}>
        {tabs.map((tab, index) => {
          if (index !== activeTab) {
            return (
              <div
                key={`tab-panel-${index}`}
                id={`tab-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`tab-${index}`}
                style={{ ...styles.tabPanel, display: 'none' }}
              />
            );
          }
          return (
            <div
              key={`tab-panel-${index}`}
              id={`tab-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`tab-${index}`}
              style={{ ...styles.tabPanel, display: 'block' }}
            >
              <tab.component {...tab.props} />
            </div>
          )
        })}
      </div>
    </div>
  );
});
