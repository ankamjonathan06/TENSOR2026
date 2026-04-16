require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Import modules
const { profileDataset } = require('./engine/profiler');
const { selectAlgorithms } = require('./engine/aiSelector');
const { compressDataset } = require('./engine/compressor');
const { validateFidelity } = require('./engine/validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://adaptzip.netlify.app'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.hdf5', '.h5', '.nc', '.netcdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Use CSV, HDF5, or NetCDF.'));
    }
  }
});

// MongoDB connection (optional - works without DB too)
let dbConnected = false;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => { dbConnected = true; console.log('✅ MongoDB connected'); })
    .catch(err => console.log('⚠️ MongoDB connection error:', err.message));
} else {
  console.log('ℹ️ Running in standalone mode (no MongoDB URI provided)');
}

// In-memory job store
const jobs = new Map();

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AdaptZip Engine',
    version: '1.0.0',
    dbConnected,
    uptime: process.uptime()
  });
});

// Upload and process dataset
app.post('/api/compress', upload.single('dataset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No dataset file uploaded' });
    }

    const jobId = uuidv4();
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    // Parse options
    const options = {
      fidelityThreshold: parseFloat(req.body.fidelityThreshold) || 0.001,
      targetReduction: parseFloat(req.body.targetReduction) || 40,
      lossless: req.body.lossless === 'true' || req.body.lossless === true
    };

    // Initialize job
    jobs.set(jobId, {
      id: jobId,
      fileName,
      fileSize,
      status: 'profiling',
      progress: 0,
      startTime: Date.now(),
      steps: []
    });

    res.json({ jobId, status: 'processing', message: 'Compression job started' });

    // Process asynchronously
    processDataset(jobId, filePath, fileName, fileSize, options);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job status
app.get('/api/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values()).sort((a, b) => b.startTime - a.startTime);
  res.json(allJobs);
});

// Demo compression (no file upload needed)
app.post('/api/demo/compress', async (req, res) => {
  try {
    const { datasetType = 'climate' } = req.body;
    const jobId = uuidv4();

    // Generate demo dataset based on type
    const demoData = generateDemoDataset(datasetType);

    jobs.set(jobId, {
      id: jobId,
      fileName: `demo_${datasetType}_dataset.csv`,
      fileSize: demoData.originalSize,
      status: 'profiling',
      progress: 0,
      startTime: Date.now(),
      isDemo: true,
      steps: []
    });

    res.json({ jobId, status: 'processing', message: 'Demo compression started' });

    // Process demo asynchronously
    processDemoDataset(jobId, demoData, datasetType);

  } catch (error) {
    console.error('Demo error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get compression stats
app.get('/api/stats', (req, res) => {
  const allJobs = Array.from(jobs.values()).filter(j => j.status === 'completed');
  const totalOriginal = allJobs.reduce((sum, j) => sum + (j.fileSize || 0), 0);
  const totalCompressed = allJobs.reduce((sum, j) => sum + (j.result?.compressedSize || 0), 0);
  const avgRatio = allJobs.length > 0
    ? allJobs.reduce((sum, j) => sum + (j.result?.compressionRatio || 0), 0) / allJobs.length
    : 0;

  res.json({
    totalJobs: allJobs.length,
    totalOriginalSize: totalOriginal,
    totalCompressedSize: totalCompressed,
    averageCompressionRatio: avgRatio,
    totalSaved: totalOriginal - totalCompressed,
    jobHistory: allJobs.slice(0, 10)
  });
});

// ==================== PROCESSING PIPELINE ====================

async function processDataset(jobId, filePath, fileName, fileSize, options) {
  const job = jobs.get(jobId);
  try {
    // Step 1: Profile
    updateJob(jobId, { status: 'profiling', progress: 10 });
    await delay(500);
    const profile = await profileDataset(filePath, fileName);
    updateJob(jobId, {
      progress: 25,
      profile,
      steps: [...job.steps, { name: 'Profiling', status: 'completed', duration: Date.now() - job.startTime }]
    });

    // Step 2: AI Selection
    updateJob(jobId, { status: 'selecting', progress: 35 });
    await delay(400);
    const algorithms = selectAlgorithms(profile, options);
    updateJob(jobId, {
      progress: 50,
      algorithms,
      steps: [...jobs.get(jobId).steps, { name: 'AI Selection', status: 'completed', duration: Date.now() - job.startTime }]
    });

    // Step 3: Compress
    updateJob(jobId, { status: 'compressing', progress: 60 });
    await delay(600);
    const compressed = compressDataset(profile, algorithms, fileSize);
    updateJob(jobId, {
      progress: 80,
      steps: [...jobs.get(jobId).steps, { name: 'Compression', status: 'completed', duration: Date.now() - job.startTime }]
    });

    // Step 4: Validate
    updateJob(jobId, { status: 'validating', progress: 90 });
    await delay(300);
    const validation = validateFidelity(profile, compressed, options);
    updateJob(jobId, {
      progress: 100,
      status: 'completed',
      result: {
        ...compressed,
        validation,
        algorithms: algorithms.selections,
        totalDuration: Date.now() - job.startTime
      },
      steps: [...jobs.get(jobId).steps, { name: 'Validation', status: 'completed', duration: Date.now() - job.startTime }]
    });

    // Cleanup uploaded file
    try { fs.unlinkSync(filePath); } catch (e) {}

  } catch (error) {
    console.error('Processing error:', error);
    updateJob(jobId, { status: 'failed', error: error.message, progress: 0 });
  }
}

async function processDemoDataset(jobId, demoData, datasetType) {
  const job = jobs.get(jobId);
  try {
    // Step 1: Profile
    updateJob(jobId, { status: 'profiling', progress: 10 });
    await delay(800);

    const profile = generateDemoProfile(demoData, datasetType);
    updateJob(jobId, {
      progress: 25,
      profile,
      steps: [{ name: 'Statistical Profiling', status: 'completed', duration: 800 }]
    });

    // Step 2: AI Selection
    updateJob(jobId, { status: 'selecting', progress: 35 });
    await delay(600);

    const algorithms = generateDemoAlgorithms(profile, datasetType);
    updateJob(jobId, {
      progress: 50,
      algorithms,
      steps: [
        ...jobs.get(jobId).steps,
        { name: 'AI Algorithm Selection', status: 'completed', duration: 600 }
      ]
    });

    // Step 3: Compress
    updateJob(jobId, { status: 'compressing', progress: 60 });
    await delay(1200);

    const compressed = generateDemoCompression(demoData, algorithms, datasetType);
    updateJob(jobId, {
      progress: 80,
      steps: [
        ...jobs.get(jobId).steps,
        { name: 'Adaptive Compression', status: 'completed', duration: 1200 }
      ]
    });

    // Step 4: Validate
    updateJob(jobId, { status: 'validating', progress: 90 });
    await delay(500);

    const validation = generateDemoValidation(compressed, datasetType);
    const totalDuration = Date.now() - job.startTime;

    updateJob(jobId, {
      progress: 100,
      status: 'completed',
      result: {
        ...compressed,
        validation,
        totalDuration,
        throughput: ((demoData.originalSize / (1024 * 1024)) / (totalDuration / 1000)).toFixed(2)
      },
      steps: [
        ...jobs.get(jobId).steps,
        { name: 'Fidelity Validation', status: 'completed', duration: 500 }
      ]
    });

  } catch (error) {
    console.error('Demo processing error:', error);
    updateJob(jobId, { status: 'failed', error: error.message, progress: 0 });
  }
}

function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates);
    jobs.set(jobId, job);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== DEMO DATA GENERATORS ====================

function generateDemoDataset(type) {
  const configs = {
    climate: {
      name: 'ERA5 Climate Dataset',
      originalSize: 256 * 1024 * 1024, // 256 MB
      columns: 12,
      rows: 2500000,
      description: 'ERA5 reanalysis climate data with temperature, pressure, humidity, wind speed'
    },
    genomics: {
      name: '1000 Genomes Project',
      originalSize: 384 * 1024 * 1024, // 384 MB
      columns: 18,
      rows: 1800000,
      description: 'Human sequence genomic data with SNP identifiers and quality indicators'
    },
    astronomy: {
      name: 'SKA Telescope Observation',
      originalSize: 512 * 1024 * 1024, // 512 MB
      columns: 15,
      rows: 3200000,
      description: 'Radio telescope observation data with frequency, amplitude, phase, and sky coordinates'
    }
  };
  return configs[type] || configs.climate;
}

function generateDemoProfile(demoData, type) {
  const profileConfigs = {
    climate: {
      totalColumns: 12,
      totalRows: demoData.rows,
      fileFormat: 'CSV',
      overallEntropy: 4.82,
      overallSparsity: 0.12,
      columns: [
        { name: 'timestamp', type: 'sequential', entropy: 1.2, sparsity: 0.0, distribution: 'uniform', uniqueRatio: 1.0 },
        { name: 'temperature_2m', type: 'continuous', entropy: 5.8, sparsity: 0.02, distribution: 'normal', mean: 15.3, std: 8.7, min: -45.2, max: 52.1 },
        { name: 'pressure_msl', type: 'continuous', entropy: 4.9, sparsity: 0.01, distribution: 'normal', mean: 1013.25, std: 12.4, min: 925.0, max: 1085.0 },
        { name: 'relative_humidity', type: 'continuous', entropy: 5.1, sparsity: 0.05, distribution: 'beta', mean: 0.65, std: 0.22, min: 0.0, max: 1.0 },
        { name: 'wind_speed_10m', type: 'continuous', entropy: 5.4, sparsity: 0.08, distribution: 'weibull', mean: 5.2, std: 3.8, min: 0.0, max: 45.3 },
        { name: 'wind_direction', type: 'continuous', entropy: 6.2, sparsity: 0.03, distribution: 'uniform', mean: 180, std: 104, min: 0, max: 360 },
        { name: 'precipitation', type: 'sparse', entropy: 2.1, sparsity: 0.72, distribution: 'exponential', mean: 0.8, std: 3.2, min: 0.0, max: 180.5 },
        { name: 'cloud_cover', type: 'categorical', entropy: 2.8, sparsity: 0.15, categories: 8, distribution: 'multinomial' },
        { name: 'solar_radiation', type: 'continuous', entropy: 4.5, sparsity: 0.42, distribution: 'truncated_normal', mean: 250, std: 180, min: 0, max: 1200 },
        { name: 'station_id', type: 'categorical', entropy: 3.2, sparsity: 0.0, categories: 1200, distribution: 'uniform' },
        { name: 'latitude', type: 'continuous', entropy: 3.8, sparsity: 0.0, distribution: 'uniform', mean: 30.0, std: 25.0, min: -90, max: 90 },
        { name: 'longitude', type: 'continuous', entropy: 3.9, sparsity: 0.0, distribution: 'uniform', mean: 0.0, std: 90.0, min: -180, max: 180 }
      ]
    },
    genomics: {
      totalColumns: 18,
      totalRows: demoData.rows,
      fileFormat: 'CSV',
      overallEntropy: 3.94,
      overallSparsity: 0.28,
      columns: [
        { name: 'chromosome', type: 'categorical', entropy: 3.8, sparsity: 0.0, categories: 24, distribution: 'multinomial' },
        { name: 'position', type: 'continuous', entropy: 6.5, sparsity: 0.0, distribution: 'uniform', mean: 75000000, std: 45000000 },
        { name: 'rsid', type: 'categorical', entropy: 7.2, sparsity: 0.12, categories: 1500000, distribution: 'uniform' },
        { name: 'ref_allele', type: 'categorical', entropy: 1.8, sparsity: 0.0, categories: 4, distribution: 'multinomial' },
        { name: 'alt_allele', type: 'categorical', entropy: 1.9, sparsity: 0.05, categories: 4, distribution: 'multinomial' },
        { name: 'quality_score', type: 'continuous', entropy: 5.2, sparsity: 0.0, distribution: 'gamma', mean: 85.3, std: 22.1 },
        { name: 'filter_status', type: 'categorical', entropy: 0.8, sparsity: 0.0, categories: 3, distribution: 'multinomial' },
        { name: 'allele_frequency', type: 'continuous', entropy: 4.1, sparsity: 0.18, distribution: 'beta', mean: 0.15, std: 0.12 },
        { name: 'depth', type: 'continuous', entropy: 4.5, sparsity: 0.0, distribution: 'poisson', mean: 30, std: 12 },
        { name: 'genotype', type: 'categorical', entropy: 1.5, sparsity: 0.0, categories: 3, distribution: 'multinomial' },
        { name: 'phred_score', type: 'continuous', entropy: 3.8, sparsity: 0.22, distribution: 'exponential', mean: 25.0, std: 15.0 },
        { name: 'strand', type: 'categorical', entropy: 1.0, sparsity: 0.0, categories: 2, distribution: 'binary' },
        { name: 'info_field', type: 'text', entropy: 6.8, sparsity: 0.35, distribution: 'mixed' },
        { name: 'sample_id', type: 'categorical', entropy: 4.2, sparsity: 0.0, categories: 5000, distribution: 'uniform' },
        { name: 'p_value', type: 'continuous', entropy: 3.2, sparsity: 0.45, distribution: 'exponential', mean: 0.05, std: 0.12 },
        { name: 'beta_coefficient', type: 'continuous', entropy: 4.8, sparsity: 0.38, distribution: 'normal', mean: 0.0, std: 0.15 },
        { name: 'confidence_interval', type: 'continuous', entropy: 4.6, sparsity: 0.38, distribution: 'normal', mean: 0.2, std: 0.08 },
        { name: 'annotation', type: 'categorical', entropy: 3.5, sparsity: 0.55, categories: 12, distribution: 'multinomial' }
      ]
    },
    astronomy: {
      totalColumns: 15,
      totalRows: demoData.rows,
      fileFormat: 'CSV',
      overallEntropy: 5.12,
      overallSparsity: 0.18,
      columns: [
        { name: 'observation_id', type: 'categorical', entropy: 7.0, sparsity: 0.0, categories: 3200000, distribution: 'uniform' },
        { name: 'timestamp', type: 'sequential', entropy: 1.5, sparsity: 0.0, distribution: 'uniform' },
        { name: 'right_ascension', type: 'continuous', entropy: 5.8, sparsity: 0.0, distribution: 'uniform', mean: 180, std: 104 },
        { name: 'declination', type: 'continuous', entropy: 5.5, sparsity: 0.0, distribution: 'uniform', mean: 0, std: 52 },
        { name: 'frequency_mhz', type: 'continuous', entropy: 4.2, sparsity: 0.0, distribution: 'uniform', mean: 1420, std: 350 },
        { name: 'amplitude', type: 'continuous', entropy: 6.1, sparsity: 0.15, distribution: 'log_normal', mean: 0.05, std: 0.12 },
        { name: 'phase', type: 'continuous', entropy: 5.9, sparsity: 0.02, distribution: 'uniform', mean: 0, std: 1.81 },
        { name: 'polarization', type: 'categorical', entropy: 2.0, sparsity: 0.0, categories: 4, distribution: 'multinomial' },
        { name: 'baseline_length', type: 'continuous', entropy: 3.8, sparsity: 0.0, distribution: 'uniform', mean: 5000, std: 3000 },
        { name: 'noise_rms', type: 'continuous', entropy: 4.5, sparsity: 0.08, distribution: 'log_normal', mean: 0.001, std: 0.0005 },
        { name: 'integration_time', type: 'continuous', entropy: 2.2, sparsity: 0.0, distribution: 'discrete', mean: 10, std: 5 },
        { name: 'antenna_id', type: 'categorical', entropy: 6.0, sparsity: 0.0, categories: 512, distribution: 'uniform' },
        { name: 'flag_rfi', type: 'sparse', entropy: 0.6, sparsity: 0.85, distribution: 'binary' },
        { name: 'calibration_factor', type: 'continuous', entropy: 3.5, sparsity: 0.0, distribution: 'normal', mean: 1.0, std: 0.05 },
        { name: 'snr', type: 'continuous', entropy: 4.8, sparsity: 0.22, distribution: 'log_normal', mean: 15, std: 25 }
      ]
    }
  };
  return profileConfigs[type] || profileConfigs.climate;
}

function generateDemoAlgorithms(profile, type) {
  const algorithmMap = {
    continuous: { algorithm: 'ZFP', confidence: 0.94, reason: 'Floating-point data with high entropy benefits from ZFP lossy compression with configurable precision' },
    categorical: { algorithm: 'Huffman + RLE', confidence: 0.91, reason: 'Low-cardinality categorical data achieves best ratio with Huffman coding combined with run-length encoding' },
    sparse: { algorithm: 'BLOSC + Bitshuffle', confidence: 0.96, reason: 'Highly sparse data benefits from bit-level shuffling before block compression' },
    sequential: { algorithm: 'Delta + ZSTD', confidence: 0.93, reason: 'Monotonically increasing sequential data compresses efficiently with delta encoding followed by ZSTD' },
    datetime: { algorithm: 'Delta + ZSTD', confidence: 0.93, reason: 'Monotonically increasing timestamps compress efficiently with delta encoding followed by ZSTD' },
    text: { algorithm: 'ZSTD (dict)', confidence: 0.88, reason: 'Text fields with repeated patterns benefit from dictionary-trained ZSTD compression' }
  };

  const selections = profile.columns.map(col => {
    const mapping = algorithmMap[col.type] || algorithmMap.continuous;
    const ratioMultiplier = {
      continuous: 0.55 + Math.random() * 0.15,
      categorical: 0.25 + Math.random() * 0.15,
      sparse: 0.15 + Math.random() * 0.15,
      datetime: 0.30 + Math.random() * 0.10,
      text: 0.45 + Math.random() * 0.15
    };

    return {
      column: col.name,
      dataType: col.type,
      algorithm: mapping.algorithm,
      confidence: mapping.confidence + (Math.random() * 0.06 - 0.03),
      expectedRatio: ratioMultiplier[col.type] || 0.5,
      reason: mapping.reason,
      parameters: getAlgorithmParams(mapping.algorithm, col)
    };
  });

  return {
    modelVersion: '2.1.0',
    selectionTime: Math.floor(Math.random() * 200 + 300),
    selections
  };
}

function getAlgorithmParams(algorithm, column) {
  const params = {
    'ZFP': { precision: 16, mode: 'accuracy', tolerance: 1e-6 },
    'Huffman + RLE': { minRunLength: 3, symbolBits: 8, tableSize: column.categories || 256 },
    'BLOSC + Bitshuffle': { blockSize: 8192, typeSize: 8, shuffleType: 'bitshuffle' },
    'Delta + ZSTD': { deltaOrder: 1, zstdLevel: 3 },
    'ZSTD (dict)': { level: 5, dictSize: 32768 }
  };
  return params[algorithm] || {};
}

function generateDemoCompression(demoData, algorithms, type) {
  const savedPercentages = { climate: 0.38, genomics: 0.44, astronomy: 0.31 };
  const savedPct = savedPercentages[type] || 0.35;

  const compressedSize = Math.floor(demoData.originalSize * (1 - savedPct));
  const compressionRatio = (demoData.originalSize / compressedSize).toFixed(2);

  const columnResults = algorithms.selections.map(sel => {
    const originalColSize = Math.floor(demoData.originalSize / algorithms.selections.length);
    const compressedColSize = Math.floor(originalColSize * sel.expectedRatio);
    return {
      column: sel.column,
      algorithm: sel.algorithm,
      originalSize: originalColSize,
      compressedSize: compressedColSize,
      ratio: (originalColSize / compressedColSize).toFixed(2),
      savings: ((1 - compressedColSize / originalColSize) * 100).toFixed(1) + '%',
      speed: (Math.random() * 80 + 60).toFixed(1) + ' MB/s',
      decompressionSpeed: (Math.random() * 100 + 120).toFixed(1) + ' MB/s',
      rmse: (Math.random() * 0.0003 + 0.00005).toFixed(6)
    };
  });

  return {
    originalSize: demoData.originalSize,
    compressedSize,
    compressionRatio: parseFloat(compressionRatio),
    savedPercentage: (savedPct * 100).toFixed(1),
    columnResults,
    algorithms: algorithms.selections,
    throughput: (Math.random() * 50 + 100).toFixed(2),
    decompressionThroughput: (Math.random() * 80 + 150).toFixed(2)
  };
}

function generateDemoValidation(compressed, type) {
  return {
    overallStatus: 'PASSED',
    rmse: {
      overall: (Math.random() * 0.0005 + 0.0001).toFixed(6),
      threshold: 0.001,
      passed: true,
      perColumn: compressed.columnResults.map(col => ({
        column: col.column,
        rmse: (Math.random() * 0.0003 + 0.00005).toFixed(6),
        passed: true
      }))
    },
    lossless: {
      bitVerification: true,
      checksumMatch: true,
      algorithm: 'SHA-256'
    },
    reconstructionAccuracy: (99.95 + Math.random() * 0.049).toFixed(4) + '%',
    validationTime: Math.floor(Math.random() * 200 + 300)
  };
}

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`\n🚀 AdaptZip Engine running at http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Ready for compression jobs\n`);
});
