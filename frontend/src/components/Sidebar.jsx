import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HiOutlineChartBar, HiOutlineCloudUpload, HiOutlineDatabase, 
  HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineAdjustments,
  HiOutlineKey, HiOutlineLogout, HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeWorkspace, setActiveWorkspace] = useState('Genomics Unit');

  const mainNav = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBar },
    { path: '/compress', label: 'Compress Engine', icon: HiOutlineCloudUpload },
    { path: '/jobs', label: 'Processing Logs', icon: HiOutlineDatabase },
  ];

  const enterpriseNav = [
    { path: '/team', label: 'Team access', icon: HiOutlineUserGroup },
    { path: '/compliance', label: 'Marketplace', icon: HiOutlineShieldCheck },
    { path: '/api', label: 'Developer Hub', icon: HiOutlineKey },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveWorkspace(activeWorkspace === 'Genomics Unit' ? 'Climate Science' : 'Genomics Unit')}>
        <div className="sidebar-logo-icon">
          <HiOutlineOfficeBuilding />
        </div>
        <div>
          <div className="sidebar-logo-name">{activeWorkspace}</div>
          <div className="sidebar-logo-sub">Enterprise • Workspace</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '16px 14px 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Core Platform</div>
        {mainNav.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="sidebar-link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '16px 14px 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginTop: '8px' }}>Enterprise</div>
        {enterpriseNav.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="sidebar-link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--accent-primary-light)' }}>
                {user?.name?.[0] || 'G'}
              </div>
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{user?.name || 'Guest User'}</div>
              <div className="sidebar-user-role">Professional Plan</div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={logout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
