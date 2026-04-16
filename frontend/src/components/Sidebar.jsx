import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineChartBar,
  HiOutlineCloudUpload,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineLightningBolt,
  HiOutlineTerminal,
  HiOutlineCurrencyDollar,
  HiOutlineLogout,
  HiOutlineUserCircle
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
              <span className="sidebar-logo-sub">AI Engine</span>
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

        {/* User Info & Footer */}
        <div className="sidebar-footer">
          {user && (
            <div className={`sidebar-user ${collapsed ? 'center' : ''}`}>
              <div className="sidebar-user-info">
                <span className="sidebar-user-avatar"><HiOutlineUserCircle /></span>
                {!collapsed && (
                  <div className="sidebar-user-details">
                    <span className="sidebar-user-name">{user.name}</span>
                    <span className="sidebar-user-role">{user.role}</span>
                  </div>
                )}
              </div>
              <button 
                className="sidebar-logout-btn" 
                onClick={handleLogout}
                title="Logout"
              >
                <HiOutlineLogout />
              </button>
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
