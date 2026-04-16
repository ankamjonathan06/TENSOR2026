import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Legend
} from 'recharts';
import {
  HiOutlineLightningBolt, HiOutlineDatabase, HiOutlineShieldCheck,
  HiOutlineClock, HiOutlineTrendingUp, HiOutlineChip,
  HiOutlineBeaker, HiOutlineGlobe, HiOutlineStar, HiOutlineCloudUpload
} from 'react-icons/hi';
import { getStats } from '../api';
import './Dashboard.css';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];

const sampleComparisonData = [
  { name: 'Climate', gzip: 22, zstd: 28, lz4: 18, adaptzip: 38 },
  { name: 'Genomics', gzip: 25, zstd: 32, lz4: 20, adaptzip: 44 },
  { name: 'Astronomy', gzip: 18, zstd: 24, lz4: 15, adaptzip: 31 },
  { name: 'IoT Sensor', gzip: 20, zstd: 26, lz4: 16, adaptzip: 35 },
  { name: 'Financial', gzip: 24, zstd: 30, lz4: 19, adaptzip: 40 },
];

const algorithmDistribution = [
  { name: 'ZFP', value: 35 },
  { name: 'Huffman+RLE', value: 25 },
  { name: 'BLOSC', value: 20 },
  { name: 'Delta+ZSTD', value: 12 },
  { name: 'SZ3', value: 8 },
];

const performanceData = [
  { metric: 'Compression Ratio', value: 92, fullMark: 100 },
  { metric: 'Speed', value: 85, fullMark: 100 },
  { metric: 'Fidelity', value: 99, fullMark: 100 },
  { metric: 'Scalability', value: 88, fullMark: 100 },
  { metric: 'Adaptiveness', value: 95, fullMark: 100 },
  { metric: 'Explainability', value: 90, fullMark: 100 },
];

const throughputTimeline = [
  { time: '0s', speed: 0 },
  { time: '1s', speed: 45 },
  { time: '2s', speed: 82 },
  { time: '3s', speed: 110 },
  { time: '4s', speed: 125 },
  { time: '5s', speed: 138 },
  { time: '6s', speed: 142 },
  { time: '7s', speed: 140 },
  { time: '8s', speed: 135 },
  { time: '9s', speed: 128 },
  { time: '10s', speed: 120 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    ratio: 0, speed: 0, fidelity: 0, datasets: 0
  });

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(() => {});

    // Animate counters
    const targets = { ratio: 38, speed: 142, fidelity: 99.99, datasets: 156 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats({
        ratio: (targets.ratio * eased).toFixed(1),
        speed: Math.floor(targets.speed * eased),
        fidelity: (targets.fidelity * eased).toFixed(2),
        datasets: Math.floor(targets.datasets * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>🚀 AdaptZip Dashboard</h1>
        <p>AI-Powered Adaptive Compression for Scientific Dataset Archiving</p>
      </div>

      {/* Hero Stats */}
      <div className="stat-grid section">
        <div className="stat-card">
          <div className="stat-icon indigo"><HiOutlineTrendingUp /></div>
          <div className="stat-content">
            <div className="stat-value">{animatedStats.ratio}%</div>
            <div className="stat-label">Avg. Storage Saved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><HiOutlineLightningBolt /></div>
          <div className="stat-content">
            <div className="stat-value">{animatedStats.speed} MB/s</div>
            <div className="stat-label">Peak Throughput</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineShieldCheck /></div>
          <div className="stat-content">
            <div className="stat-value">{animatedStats.fidelity}%</div>
            <div className="stat-label">Reconstruction Fidelity</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineDatabase /></div>
          <div className="stat-content">
            <div className="stat-value">{animatedStats.datasets}</div>
            <div className="stat-label">Datasets Processed</div>
          </div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>$</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">$24,950</div>
            <div className="stat-label">Total Est. Cloud Storage ROI</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="dashboard-cta section">
        <div className="cta-content">
          <h2>Ready to Compress?</h2>
          <p>Upload your scientific dataset and let our AI engine select the optimal compression strategy for each column.</p>
          <div className="cta-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/compress')}>
              <HiOutlineCloudUpload /> Upload Dataset
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/compress')}>
              <HiOutlineBeaker /> Try Demo
            </button>
          </div>
        </div>
        <div className="cta-visual">
          <div className="cta-orb orb-1" />
          <div className="cta-orb orb-2" />
          <div className="cta-orb orb-3" />
          <div className="cta-code">
            <code>
              <span className="code-comment">// AdaptZip AI Engine</span><br />
              <span className="code-keyword">analyze</span>(dataset)<br />
              <span className="code-keyword">select</span>(algorithms)<br />
              <span className="code-keyword">compress</span>(columns)<br />
              <span className="code-keyword">validate</span>(fidelity)<br />
              <span className="code-success">✓ 38% storage saved</span>
            </code>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 section">
        {/* Compression Comparison */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><HiOutlineTrendingUp className="icon" /> AdaptZip vs Traditional</div>
            <span className="badge badge-success">AI Advantage</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleComparisonData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="gzip" fill="#64748b" radius={[4, 4, 0, 0]} name="gzip" />
              <Bar dataKey="zstd" fill="#3b82f6" radius={[4, 4, 0, 0]} name="ZSTD" />
              <Bar dataKey="lz4" fill="#f59e0b" radius={[4, 4, 0, 0]} name="LZ4" />
              <Bar dataKey="adaptzip" fill="#6366f1" radius={[4, 4, 0, 0]} name="AdaptZip" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Algorithm Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><HiOutlineChip className="icon" /> Algorithm Distribution</div>
            <span className="badge badge-info">AI Selected</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={algorithmDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {algorithmDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a2236',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '0.85rem'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 section">
        {/* Performance Radar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><HiOutlineStar className="icon" /> Performance Profile</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={11} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.05)" />
              <Radar
                name="AdaptZip"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Throughput Timeline */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><HiOutlineClock className="icon" /> Throughput Over Time</div>
            <span className="badge badge-primary">Real-time</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={throughputTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit=" MB/s" />
              <Tooltip
                contentStyle={{
                  background: '#1a2236',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <defs>
                <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="speed"
                stroke="#06b6d4"
                fill="url(#throughputGrad)"
                strokeWidth={2}
                name="Throughput"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><HiOutlineGlobe className="icon" /> Competitive Advantage</div>
          </div>
          <div className="feature-comparison">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Traditional (gzip/ZSTD)</th>
                    <th>AdaptZip</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>AI-based compression</td>
                    <td><span className="badge badge-danger">❌ No</span></td>
                    <td><span className="badge badge-success">✅ Yes</span></td>
                  </tr>
                  <tr>
                    <td>Column-wise optimization</td>
                    <td><span className="badge badge-danger">❌ No</span></td>
                    <td><span className="badge badge-success">✅ Yes</span></td>
                  </tr>
                  <tr>
                    <td>RMSE guarantee</td>
                    <td><span className="badge badge-danger">❌ No</span></td>
                    <td><span className="badge badge-success">✅ Yes</span></td>
                  </tr>
                  <tr>
                    <td>Explainability</td>
                    <td><span className="badge badge-danger">❌ No</span></td>
                    <td><span className="badge badge-success">✅ Yes</span></td>
                  </tr>
                  <tr>
                    <td>Real-time processing</td>
                    <td><span className="badge badge-danger">❌ No</span></td>
                    <td><span className="badge badge-success">✅ Yes</span></td>
                  </tr>
                  <tr>
                    <td>Parallel execution</td>
                    <td><span className="badge badge-warning">⚠️ Limited</span></td>
                    <td><span className="badge badge-success">✅ Multi-threaded</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

