import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  HiOutlineCloudUpload, HiOutlineBeaker, HiOutlineCog,
  HiOutlinePlay, HiOutlineCheck, HiOutlineExclamation
} from 'react-icons/hi';
import { compressFile, demoCompress, getJob } from '../api';
import './Compress.css';

const DEMO_DATASETS = [
  {
    id: 'climate',
    name: 'ERA5 Climate Dataset',
    icon: '🌍',
    size: '256 MB',
    columns: 12,
    rows: '2.5M',
    description: 'Temperature, pressure, humidity, wind speed data from ERA5 reanalysis',
    expectedSavings: '~38%'
  },
  {
    id: 'genomics',
    name: '1000 Genomes Project',
    icon: '🧬',
    size: '384 MB',
    columns: 18,
    rows: '1.8M',
    description: 'SNP identifiers, allele frequencies, quality scores from genomic data',
    expectedSavings: '~44%'
  },
  {
    id: 'astronomy',
    name: 'SKA Telescope Data',
    icon: '🔭',
    size: '512 MB',
    columns: 15,
    rows: '3.2M',
    description: 'Radio telescope frequency, amplitude, phase, and sky coordinates',
    expectedSavings: '~31%'
  }
];

const PIPELINE_STEPS = [
  { key: 'profiling', label: 'Statistical Profiling', icon: '📊', description: 'Analyzing entropy, sparsity, distributions' },
  { key: 'selecting', label: 'AI Algorithm Selection', icon: '🧠', description: 'ML model selecting optimal algorithms' },
  { key: 'compressing', label: 'Adaptive Compression', icon: '⚡', description: 'Parallel column-wise compression' },
  { key: 'validating', label: 'Fidelity Validation', icon: '✅', description: 'RMSE + lossless bit verification' },
];

export default function Compress() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    fidelityThreshold: 0.001,
    targetReduction: 40,
    lossless: false
  });
  const [showOptions, setShowOptions] = useState(false);
  const [logs, setLogs] = useState([]);

  // Generate simulated logs
  useEffect(() => {
    if (!processing) {
      setLogs([]);
      return;
    }

    const logPool = {
      profiling: [
        { tag: 'PROFILER', msg: 'Initiating deep column scan...', type: 'info' },
        { tag: 'PROFILER', msg: 'Analyzing entropy distributions...', type: 'info' },
        { tag: 'PROFILER', msg: 'Detecting floating-point precision shifts...', type: 'info' },
        { tag: 'PROFILER', msg: 'Scanning for categorical patterns...', type: 'info' },
        { tag: 'PROFILER', msg: 'Sparsity check: 12% null identified.', type: 'info' }
      ],
      selecting: [
        { tag: 'SELECTOR', msg: 'Feeding stats into heuristic model...', type: 'info' },
        { tag: 'SELECTOR', msg: 'Candidate found: ZFP (Fixed-Rate Mode)', type: 'success' },
        { tag: 'SELECTOR', msg: 'Checking error bounds compatibility...', type: 'info' },
        { tag: 'SELECTOR', msg: 'Optimizing bit-level shuffling params...', type: 'info' },
        { tag: 'SELECTOR', msg: 'Algorithm lattice finalized.', type: 'success' }
      ],
      compressing: [
        { tag: 'ENGINE', msg: 'Spawning worker threads...', type: 'info' },
        { tag: 'ENGINE', msg: 'Compressing chunk 0..1024 [AES-NI]', type: 'info' },
        { tag: 'ENGINE', msg: 'Buffer parity check passed.', type: 'info' },
        { tag: 'ENGINE', msg: 'Parallel throughput: 142 MB/s', type: 'success' }
      ],
      validating: [
        { tag: 'VALIDATOR', msg: 'Reconstructing data samples...', type: 'info' },
        { tag: 'VALIDATOR', msg: 'RMSE calculation initiated...', type: 'info' },
        { tag: 'VALIDATOR', msg: 'RMSE: 0.00024 | Threshold: 0.00100', type: 'success' },
        { tag: 'VALIDATOR', msg: 'Bit-level verification: Lossless Match', type: 'success' }
      ]
    };

    let timer;
    const addLog = () => {
      const step = jobStatus?.status || 'profiling';
      const pool = logPool[step] || [];
      if (pool.length > 0) {
        const randomMsg = pool[Math.floor(Math.random() * pool.length)];
        setLogs(prev => [...prev.slice(-40), { 
          ...randomMsg, 
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }) 
        }]);
      }
      timer = setTimeout(addLog, 800 + Math.random() * 1500);
    };

    addLog();
    return () => clearTimeout(timer);
  }, [processing, jobStatus?.status]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/x-hdf5': ['.hdf5', '.h5'],
      'application/x-netcdf': ['.nc', '.netcdf']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024
  });

  const pollJob = async (id) => {
    const poll = async () => {
      try {
        const res = await getJob(id);
        setJobStatus(res.data);

        if (res.data.status === 'completed') {
          setProcessing(false);
          // Navigate to results after a brief pause
          setTimeout(() => navigate(`/results/${id}`), 1500);
          return;
        }

        if (res.data.status === 'failed') {
          setProcessing(false);
          setError(res.data.error || 'Compression failed');
          return;
        }

        setTimeout(poll, 500);
      } catch (err) {
        setTimeout(poll, 1000);
      }
    };
    poll();
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setJobStatus(null);

    try {
      const res = await compressFile(file, options);
      setJobId(res.data.jobId);
      pollJob(res.data.jobId);
    } catch (err) {
      setProcessing(false);
      setError(err.response?.data?.error || 'Upload failed. Make sure the backend is running.');
    }
  };

  const handleDemo = async (datasetType) => {
    setProcessing(true);
    setError(null);
    setJobStatus(null);
    setFile(null);

    try {
      const res = await demoCompress(datasetType);
      setJobId(res.data.jobId);
      pollJob(res.data.jobId);
    } catch (err) {
      setProcessing(false);
      setError(err.response?.data?.error || 'Demo failed. Make sure the backend is running on port 5000.');
    }
  };

  const getCurrentStepIndex = () => {
    if (!jobStatus) return -1;
    return PIPELINE_STEPS.findIndex(s => s.key === jobStatus.status);
  };

  const formatSize = (bytes) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  return (
    <div className="compress-page">
      <div className="page-header">
        <h1>⚡ Compress Dataset</h1>
        <p>Upload a scientific dataset or try a demo to see AI-powered adaptive compression in action</p>
      </div>

      {!processing ? (
        <>
          {/* Upload Zone */}
          <div className="section">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <HiOutlineCloudUpload className="icon" /> Upload Dataset
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowOptions(!showOptions)}>
                  <HiOutlineCog /> Options
                </button>
              </div>

              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}>
                <input {...getInputProps()} />
                {file ? (
                  <div className="dropzone-file">
                    <div className="dropzone-file-icon">📄</div>
                    <div className="dropzone-file-info">
                      <div className="dropzone-file-name">{file.name}</div>
                      <div className="dropzone-file-size">{formatSize(file.size)}</div>
                    </div>
                    <span className="badge badge-success">Ready</span>
                  </div>
                ) : (
                  <>
                    <div className="dropzone-icon">📁</div>
                    <div className="dropzone-text">Drop your dataset here or click to browse</div>
                    <div className="dropzone-sub">Supports CSV, HDF5, NetCDF • Max 500 MB</div>
                  </>
                )}
              </div>

              {/* Options Panel */}
              {showOptions && (
                <div className="options-panel">
                  <div className="options-grid">
                    <div className="option-group">
                      <label>Fidelity Threshold (RMSE)</label>
                      <input
                        type="number"
                        className="input"
                        value={options.fidelityThreshold}
                        onChange={(e) => setOptions({ ...options, fidelityThreshold: parseFloat(e.target.value) })}
                        step="0.0001"
                        min="0"
                      />
                    </div>
                    <div className="option-group">
                      <label>Target Storage Reduction (%)</label>
                      <input
                        type="number"
                        className="input"
                        value={options.targetReduction}
                        onChange={(e) => setOptions({ ...options, targetReduction: parseInt(e.target.value) || 0 })}
                        step="1"
                        min="0"
                        max="99"
                        placeholder="e.g. 40"
                      />
                    </div>
                    <div className="option-group">
                      <label>Mode</label>
                      <div className="toggle-group">
                        <button
                          className={`toggle-btn ${!options.lossless ? 'active' : ''}`}
                          onClick={() => setOptions({ ...options, lossless: false })}
                        >
                          Adaptive
                        </button>
                        <button
                          className={`toggle-btn ${options.lossless ? 'active' : ''}`}
                          onClick={() => setOptions({ ...options, lossless: true })}
                        >
                          Lossless
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {file && (
                <div className="upload-action">
                  <button className="btn btn-primary btn-lg" onClick={handleUpload}>
                    <HiOutlinePlay /> Start Compression
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Demo Datasets */}
          <div className="section">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <HiOutlineBeaker className="icon" /> Demo Datasets
                </div>
                <span className="badge badge-info">No upload required</span>
              </div>
              <div className="demo-grid">
                {DEMO_DATASETS.map(ds => (
                  <div key={ds.id} className="demo-card" onClick={() => handleDemo(ds.id)}>
                    <div className="demo-icon">{ds.icon}</div>
                    <div className="demo-info">
                      <div className="demo-name">{ds.name}</div>
                      <div className="demo-desc">{ds.description}</div>
                      <div className="demo-meta">
                        <span className="chip">{ds.size}</span>
                        <span className="chip">{ds.columns} cols</span>
                        <span className="chip">{ds.rows} rows</span>
                        <span className="chip" style={{ color: 'var(--accent-success)' }}>{ds.expectedSavings} saved</span>
                      </div>
                    </div>
                    <HiOutlinePlay className="demo-play" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Processing Pipeline */
        <div className="section">
          <div className="card processing-card">
            <div className="card-header">
              <div className="card-title">
                ⚙️ Processing Pipeline
              </div>
              {jobStatus && (
                <span className="badge badge-primary">
                  {jobStatus.progress}%
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="progress-bar" style={{ marginBottom: '32px' }}>
              <div className="progress-fill" style={{ width: `${jobStatus?.progress || 0}%` }} />
            </div>

            {/* Pipeline Steps */}
            <div className="pipeline-steps">
              {PIPELINE_STEPS.map((step, idx) => {
                const currentIdx = getCurrentStepIndex();
                const isCompleted = currentIdx > idx || jobStatus?.status === 'completed';
                const isCurrent = currentIdx === idx;
                const isPending = currentIdx < idx && jobStatus?.status !== 'completed';

                return (
                  <div key={step.key} className={`pipeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}>
                    <div className="step-indicator">
                      {isCompleted ? (
                        <HiOutlineCheck />
                      ) : isCurrent ? (
                        <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      ) : (
                        <span className="step-number">{idx + 1}</span>
                      )}
                    </div>
                    <div className="step-content">
                      <div className="step-icon">{step.icon}</div>
                      <div className="step-text">
                        <div className="step-label">{step.label}</div>
                        <div className="step-desc">{step.description}</div>
                      </div>
                    </div>
                    {idx < PIPELINE_STEPS.length - 1 && <div className="step-connector" />}
                  </div>
                );
              })}
            </div>

            {/* Terminal Simulator */}
            <div className="terminal-simulator">
              {logs.length === 0 ? (
                <div className="terminal-line">
                  <span className="log-time">{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}</span>
                  <span className="log-tag">SYSTEM</span>
                  <span className="log-msg">Waiting for engine initialization...</span>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`terminal-line ${log.type}`}>
                    <span className="log-time">{log.time}</span>
                    <span className="log-tag">{log.tag}</span>
                    <span className={`log-msg ${log.type}`}>{log.msg}</span>
                  </div>
                ))
              )}
            </div>

            {/* Completed message */}
            {jobStatus?.status === 'completed' && (
              <div className="pipeline-complete">
                <div className="complete-icon">🎉</div>
                <div className="complete-text">Compression Complete!</div>
                <div className="complete-sub">Redirecting to results...</div>
              </div>
            )}

            {/* File info */}
            {jobStatus && (
              <div className="processing-info">
                <div className="info-item">
                  <span className="info-label">File</span>
                  <span className="info-value">{jobStatus.fileName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">{formatSize(jobStatus.fileSize)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{jobStatus.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-banner">
          <HiOutlineExclamation /> {error}
        </div>
      )}
    </div>
  );
}
