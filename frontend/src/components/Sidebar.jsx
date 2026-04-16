import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineCloudUpload,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineLightningBolt,
  HiOutlineTerminal,
  HiOutlineCurrencyDollar
} from 'react-icons/hi';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HiOutlineChartBar },
  { path: '/compress', label: 'Compress', icon: HiOutlineCloudUpload },
  { path: '/history', label: 'History', icon: HiOutlineClock },
  { path: '/api-portal', label: 'API SDKs', icon: HiOutlineTerminal },
  { path: '/pricing', label: 'Pricing', icon: HiOutlineCurrencyDollar },
  { path: '/about', label: 'About', icon: HiOutlineInformationCircle },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenuAlt2 />}
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HiOutlineLightningBolt />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-name">AdaptZip</span>
              <span className="sidebar-logo-sub">AI Compression</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-link-icon"><Icon /></span>
                {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
                {isActive && <span className="sidebar-link-indicator" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-version">
              <div className="sidebar-dot" />
              v1.0.0 — Engine Ready
            </div>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
