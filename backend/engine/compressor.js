/**
 * Compression Engine Module
 * Applies selected algorithms per column with parallel processing simulation
 */

const pako = require('pako');

/**
 * Compress dataset using selected algorithms per column
 */
function compressDataset(profile, algorithms, originalSize) {
  const startTime = Date.now();

  const columnResults = algorithms.selections.map((sel, idx) => {
    const column = profile.columns[idx];
    const colOriginalSize = Math.floor(originalSize / profile.columns.length);

    const result = compressColumn(column, sel, colOriginalSize);
    return result;
  });

  const totalCompressed = columnResults.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalOriginal = columnResults.reduce((sum, r) => sum + r.originalSize, 0);

  return {
    originalSize: totalOriginal,
    compressedSize: totalCompressed,
    compressionRatio: parseFloat((totalOriginal / totalCompressed).toFixed(2)),
    savedPercentage: parseFloat(((1 - totalCompressed / totalOriginal) * 100).toFixed(1)),
    columnResults,
    algorithms: algorithms.selections,
    processingTime: Date.now() - startTime,
    throughput: ((totalOriginal / (1024 * 1024)) / ((Date.now() - startTime + 1) / 1000)).toFixed(2)
  };
}

/**
 * Compress a single column
 */
function compressColumn(column, selection, originalSize) {
  const { algorithm, expectedRatio } = selection;

  // Simulate compression with realistic ratios
  const compressionFactor = expectedRatio + (Math.random() * 0.05 - 0.025);
  const compressedSize = Math.max(
    Math.floor(originalSize * compressionFactor),
    100 // Minimum size
  );

  const speed = (60 + Math.random() * 100).toFixed(1);

  return {
    column: column.name,
    algorithm,
    originalSize,
    compressedSize,
    ratio: parseFloat((originalSize / compressedSize).toFixed(2)),
    savings: parseFloat(((1 - compressedSize / originalSize) * 100).toFixed(1)),
    speed: `${speed} MB/s`,
    parameters: selection.parameters
  };
}

module.exports = { compressDataset };
