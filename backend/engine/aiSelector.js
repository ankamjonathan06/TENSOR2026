/**
 * AI Algorithm Selector Module
 * Uses ML-inspired heuristics to select optimal compression algorithms per column
 */

/**
 * Select best compression algorithm for each column based on profile
 */
function selectAlgorithms(profile, options = {}) {
  const startTime = Date.now();

  const selections = profile.columns.map(column => {
    const selection = selectForColumn(column, options);
    return {
      column: column.name,
      dataType: column.type,
      ...selection
    };
  });

  return {
    modelVersion: '2.1.0',
    selectionTime: Date.now() - startTime,
    selections
  };
}

/**
 * Select algorithm for a single column based on its statistical profile
 */
function selectForColumn(column, options) {
  const { type, entropy, sparsity, distribution } = column;

  // Decision tree-based selection (simulating ML model output)
  let algorithm, confidence, reason, parameters;

  switch (type) {
    case 'continuous':
      if (entropy > 5.5) {
        algorithm = 'ZFP';
        confidence = 0.94;
        reason = 'High-entropy floating-point data benefits from ZFP\'s precision-controlled lossy compression';
        parameters = {
          precision: options.lossless ? 64 : 16,
          mode: options.lossless ? 'reversible' : 'accuracy',
          tolerance: options.fidelityThreshold || 1e-6
        };
      } else if (entropy > 3.0) {
        algorithm = 'SZ3';
        confidence = 0.91;
        reason = 'Moderate-entropy continuous data achieves good ratios with SZ3 error-bounded compression';
        parameters = {
          errorBound: options.fidelityThreshold || 1e-4,
          mode: 'ABS',
          quantizationIntervals: 65536
        };
      } else {
        algorithm = 'Delta + ZSTD';
        confidence = 0.89;
        reason = 'Low-entropy continuous data with patterns compresses well with delta encoding + ZSTD';
        parameters = { deltaOrder: 2, zstdLevel: 5 };
      }
      break;

    case 'categorical':
      if ((column.categories || 10) <= 16) {
        algorithm = 'Huffman + RLE';
        confidence = 0.95;
        reason = 'Low-cardinality categorical data maximizes compression with Huffman + run-length encoding';
        parameters = {
          minRunLength: 2,
          symbolBits: Math.ceil(Math.log2((column.categories || 10) + 1)),
          adaptiveHuffman: true
        };
      } else {
        algorithm = 'Dictionary + LZ4';
        confidence = 0.88;
        reason = 'High-cardinality categorical data benefits from dictionary encoding with fast LZ4 compression';
        parameters = {
          dictSize: Math.min((column.categories || 100) * 2, 65536),
          lz4Level: 1
        };
      }
      break;

    case 'sparse':
      algorithm = 'BLOSC + Bitshuffle';
      confidence = 0.96;
      reason = `Sparse data (${(sparsity * 100).toFixed(0)}% zeros) achieves exceptional ratios with bitshuffle + BLOSC`;
      parameters = {
        blockSize: 8192,
        typeSize: 8,
        shuffleType: 'bitshuffle',
        compressor: 'lz4hc'
      };
      break;

    case 'datetime':
      algorithm = 'Delta + ZSTD';
      confidence = 0.93;
      reason = 'Monotonic timestamps compress extremely well with delta encoding followed by ZSTD';
      parameters = {
        deltaOrder: 1,
        zstdLevel: 3,
        timestampResolution: 'millisecond'
      };
      break;

    case 'text':
      algorithm = 'ZSTD (dict)';
      confidence = 0.87;
      reason = 'Text fields with repeated patterns benefit from dictionary-trained ZSTD compression';
      parameters = {
        level: 5,
        dictSize: 32768,
        windowLog: 20
      };
      break;

    default:
      algorithm = 'ZSTD';
      confidence = 0.82;
      reason = 'General-purpose ZSTD compression for unclassified data types';
      parameters = { level: 3 };
  }

  // Calculate expected compression ratio
  const expectedRatio = calculateExpectedRatio(type, entropy, sparsity, algorithm);

  return {
    algorithm,
    confidence: parseFloat(confidence.toFixed(3)),
    expectedRatio: parseFloat(expectedRatio.toFixed(3)),
    reason,
    parameters
  };
}

/**
 * Estimate expected compression ratio based on data characteristics
 */
function calculateExpectedRatio(type, entropy, sparsity, algorithm) {
  // Base ratios by type
  const baseRatios = {
    continuous: 0.55,
    categorical: 0.25,
    sparse: 0.10,
    datetime: 0.30,
    text: 0.50
  };

  let ratio = baseRatios[type] || 0.50;

  // Adjust by entropy (higher entropy = harder to compress)
  ratio *= (0.7 + entropy * 0.05);

  // Adjust by sparsity (higher sparsity = better compression)
  ratio *= (1 - sparsity * 0.5);

  // Clamp between 0.05 and 0.95
  return Math.max(0.05, Math.min(0.95, ratio));
}

module.exports = { selectAlgorithms };
