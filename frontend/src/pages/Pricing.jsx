import { HiOutlineCheck } from 'react-icons/hi';
import './Pricing.css';

export default function Pricing() {
  return (
    <div className="pricing-page">
      <div className="page-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1>💎 Simple, Transparent Pricing</h1>
        <p>Save petabytes of storage and thousands of dollars on your cloud bill. Choose the plan that fits your data scale.</p>
      </div>

      <div className="pricing-cards section">
        
        {/* Hobbyist */}
        <div className="pricing-card">
          <div className="tier-name">Researcher</div>
          <div className="tier-price">Free<span>/forever</span></div>
          <p className="tier-desc">For open-science researchers analyzing small to medium datasets locally.</p>
          
          <ul className="tier-features">
            <li><HiOutlineCheck /> Max 500 MB per file</li>
            <li><HiOutlineCheck /> Web Interface Access</li>
            <li><HiOutlineCheck /> Standard AI Models</li>
            <li><HiOutlineCheck /> CSV, HDF5, NetCDF support</li>
          </ul>

          <button className="btn btn-secondary tier-action">Current Plan</button>
        </div>

        {/* Pro */}
        <div className="pricing-card popular">
          <div className="popular-badge">Most Popular</div>
          <div className="tier-name">Pro Studio</div>
          <div className="tier-price">$99<span>/mo</span></div>
          <p className="tier-desc">For scaling startups and labs pushing data to AWS/GCP pipelines.</p>
          
          <ul className="tier-features">
            <li><HiOutlineCheck /> Max 50 GB per file</li>
            <li><HiOutlineCheck /> <strong>Developer API Access</strong></li>
            <li><HiOutlineCheck /> Multi-Cloud Export Integration</li>
            <li><HiOutlineCheck /> Priority AI Node Queueing</li>
            <li><HiOutlineCheck /> Python / C++ SDKs</li>
          </ul>

          <button className="btn btn-primary tier-action">Start Free Trial</button>
        </div>

        {/* Enterprise */}
        <div className="pricing-card">
          <div className="tier-name">Enterprise</div>
          <div className="tier-price">Custom</div>
          <p className="tier-desc">Petabyte-scale archival storage with uncompromising security standards.</p>
          
          <ul className="tier-features">
            <li><HiOutlineCheck /> Unlimited file sizes</li>
            <li><HiOutlineCheck /> <strong>AES-256 Data Encryption</strong></li>
            <li><HiOutlineCheck /> HIPAA / GDPR Readiness</li>
            <li><HiOutlineCheck /> Custom AI Model Training</li>
            <li><HiOutlineCheck /> 99.99% SLA Uptime</li>
            <li><HiOutlineCheck /> GPU-Accelerated Clusters</li>
          </ul>

          <button className="btn btn-secondary tier-action" style={{ borderColor: 'var(--text-secondary)' }}>Contact Sales</button>
        </div>

      </div>
    </div>
  );
}
