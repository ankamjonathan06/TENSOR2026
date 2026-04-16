import './About.css';
import {
  HiOutlineLightningBolt, HiOutlineChip, HiOutlineShieldCheck,
  HiOutlineDatabase, HiOutlineClock, HiOutlineEye,
  HiOutlineGlobe, HiOutlineCode, HiOutlineAcademicCap
} from 'react-icons/hi';

export default function About() {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>ℹ️ About AdaptZip</h1>
        <p>AI-Powered Adaptive Compression for Scientific Dataset Archiving</p>
      </div>

      {/* Hero */}
      <div className="about-hero section">
        <div className="about-hero-content">
          <div className="about-hero-badge">v1.0.0</div>
          <h2>Compress Smarter.<br />Archive Better.</h2>
          <p>
            AdaptZip transforms compression from a generic utility into an intelligent,
            adaptive, and explainable system. Designed for scientific datasets in genomics,
            climate science, and astronomy.
          </p>
        </div>
        <div className="about-hero-visual">
          <div className="hex-grid">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`hex hex-${i}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Problem */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚨 The Problem</div>
          </div>
          <div className="problem-grid">
            <div className="problem-item">
              <div className="problem-stat">400 TB</div>
              <div className="problem-label">ERA5 Climate Dataset</div>
            </div>
            <div className="problem-item">
              <div className="problem-stat">40+ PB</div>
              <div className="problem-label">UK Biobank</div>
            </div>
            <div className="problem-item">
              <div className="problem-stat">1 EB/yr</div>
              <div className="problem-label">SKA Telescope</div>
            </div>
          </div>
          <div className="problem-issues">
            <div className="issue">❌ Generic compression treats all data the same</div>
            <div className="issue">❌ No understanding of column types (numeric, categorical, sparse)</div>
            <div className="issue">❌ No reconstruction fidelity guarantee</div>
            <div className="issue">❌ Misses 30–50% potential compression</div>
          </div>
        </div>
      </div>

      {/* Core Components */}
      <div className="section">
        <h2 className="section-title">🔑 Core Components</h2>
        <div className="grid-4 components-grid">
          <div className="component-card">
            <div className="component-icon prof"><HiOutlineDatabase /></div>
            <h3>Statistical Profiler</h3>
            <p>Detects data types, measures entropy & sparsity, identifies distributions</p>
          </div>
          <div className="component-card">
            <div className="component-icon ai"><HiOutlineChip /></div>
            <h3>AI Strategy Selector</h3>
            <p>ML model selects best algorithm per column, optimizes parameters</p>
          </div>
          <div className="component-card">
            <div className="component-icon comp"><HiOutlineLightningBolt /></div>
            <h3>Compression Engine</h3>
            <p>Parallel processing, multi-threaded, high-speed &gt;100 MB/s throughput</p>
          </div>
          <div className="component-card">
            <div className="component-icon valid"><HiOutlineShieldCheck /></div>
            <h3>Fidelity Verifier</h3>
            <p>RMSE validation, lossless verification, accuracy assurance</p>
          </div>
        </div>
      </div>

      {/* Algorithm Strategy */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🧠 Algorithm Selection Strategy</div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Algorithm</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-primary">Continuous</span></td>
                  <td><strong>ZFP / SZ3</strong></td>
                  <td>Precision-controlled compression for floating-point data</td>
                </tr>
                <tr>
                  <td><span className="badge badge-success">Categorical</span></td>
                  <td><strong>Huffman + RLE</strong></td>
                  <td>Optimal for low-cardinality discrete values</td>
                </tr>
                <tr>
                  <td><span className="badge badge-warning">Sparse</span></td>
                  <td><strong>BLOSC + Bitshuffle</strong></td>
                  <td>Bit-level shuffling maximizes zero-heavy data compression</td>
                </tr>
                <tr>
                  <td><span className="badge badge-info">Time-series</span></td>
                  <td><strong>Delta + ZSTD</strong></td>
                  <td>Delta encoding captures temporal patterns efficiently</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏗️ System Architecture</div>
          </div>
          <div className="architecture-flow">
            <div className="arch-step">
              <div className="arch-icon">📤</div>
              <div className="arch-label">Upload</div>
              <div className="arch-sub">CSV / HDF5 / NetCDF</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-step">
              <div className="arch-icon">📊</div>
              <div className="arch-label">Profile</div>
              <div className="arch-sub">Entropy & Stats</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-step">
              <div className="arch-icon">🧠</div>
              <div className="arch-label">AI Select</div>
              <div className="arch-sub">ML Model</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-step">
              <div className="arch-icon">⚡</div>
              <div className="arch-label">Compress</div>
              <div className="arch-sub">Parallel Engine</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-step">
              <div className="arch-icon">✅</div>
              <div className="arch-label">Validate</div>
              <div className="arch-sub">RMSE + Checksum</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-step">
              <div className="arch-icon">📋</div>
              <div className="arch-label">Report</div>
              <div className="arch-sub">Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚙️ Technology Stack</div>
          </div>
          <div className="tech-grid">
            <div className="tech-group">
              <h4><HiOutlineCode /> Frontend</h4>
              <div className="tech-tags">
                <span className="chip">React.js</span>
                <span className="chip">Vite</span>
                <span className="chip">Recharts</span>
                <span className="chip">Framer Motion</span>
              </div>
            </div>
            <div className="tech-group">
              <h4><HiOutlineDatabase /> Backend</h4>
              <div className="tech-tags">
                <span className="chip">Node.js</span>
                <span className="chip">Express.js</span>
                <span className="chip">MongoDB Atlas</span>
              </div>
            </div>
            <div className="tech-group">
              <h4><HiOutlineChip /> AI Engine</h4>
              <div className="tech-tags">
                <span className="chip">ML Selector</span>
                <span className="chip">Statistical Profiler</span>
                <span className="chip">NumPy / Pandas</span>
              </div>
            </div>
            <div className="tech-group">
              <h4><HiOutlineGlobe /> Deployment</h4>
              <div className="tech-tags">
                <span className="chip">Netlify</span>
                <span className="chip">Render</span>
                <span className="chip">Docker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="section">
        <h2 className="section-title">🌍 Real-World Impact</h2>
        <div className="grid-3">
          <div className="impact-card">
            <div className="impact-icon">🧬</div>
            <h3>Genomics</h3>
            <p>Reduces storage cost, enables faster research and analysis of genetic data</p>
          </div>
          <div className="impact-card">
            <div className="impact-icon">🌍</div>
            <h3>Climate Science</h3>
            <p>Efficient data storage for petabyte-scale climate models and simulations</p>
          </div>
          <div className="impact-card">
            <div className="impact-icon">🔭</div>
            <h3>Astronomy</h3>
            <p>Handles massive telescope data from next-generation observatories</p>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="about-footer section">
        <blockquote>
          "Compress smarter. Archive better. Let science scale without limits."
        </blockquote>
        <p className="about-footer-sub">AdaptZip — The Future of Scientific Data Storage</p>
      </div>
    </div>
  );
}
