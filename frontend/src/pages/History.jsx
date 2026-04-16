import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineEye, HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi';
import { getAllJobs } from '../api';
import './History.css';

export default function History() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const map = {
      completed: 'badge-success',
      failed: 'badge-danger',
      profiling: 'badge-info',
      selecting: 'badge-info',
      compressing: 'badge-warning',
      validating: 'badge-primary',
      processing: 'badge-info'
    };
    return map[status] || 'badge-info';
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>📜 Compression History</h1>
        <p>View all past compression jobs and their results</p>
      </div>

      <div className="history-actions section">
        <button className="btn btn-secondary" onClick={fetchJobs}>
          <HiOutlineRefresh /> Refresh
        </button>
        <span className="badge badge-info">{jobs.length} jobs</span>
      </div>

      {loading ? (
        <div className="history-loading">
          <div className="spinner" />
          <p>Loading history...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="history-empty section">
          <div className="empty-icon">📦</div>
          <h3>No compression jobs yet</h3>
          <p>Upload a dataset or try a demo to get started</p>
          <button className="btn btn-primary" onClick={() => navigate('/compress')}>
            Start Compressing
          </button>
        </div>
      ) : (
        <div className="section">
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Savings</th>
                    <th>Ratio</th>
                    <th>Duration</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <div className="job-file">
                          <span className="job-file-icon">
                            {job.isDemo ? '🧪' : '📄'}
                          </span>
                          <div>
                            <div className="job-filename">{job.fileName}</div>
                            <div className="job-id">{job.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono">{formatSize(job.fileSize)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        {job.result ? (
                          <span className="badge badge-success">
                            {job.result.savedPercentage || ((1 - job.result.compressedSize / job.result.originalSize) * 100).toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="mono">
                        {job.result ? `${job.result.compressionRatio}x` : '—'}
                      </td>
                      <td className="mono">
                        {job.result ? `${job.result.totalDuration}ms` : '—'}
                      </td>
                      <td className="mono" style={{ fontSize: '0.78rem' }}>
                        {formatDate(job.startTime)}
                      </td>
                      <td>
                        {job.status === 'completed' && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => navigate(`/results/${job.id}`)}
                          >
                            <HiOutlineEye /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
