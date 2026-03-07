let latestScan = null;

const setLatestScan = (scanResult) => {
  latestScan = scanResult;
};

const getLatestScan = () => latestScan;

const updateLatestScan = (partialData) => {
  if (!latestScan) {
    return null;
  }

  latestScan = {
    ...latestScan,
    ...partialData,
  };

  return latestScan;
};

module.exports = {
  setLatestScan,
  getLatestScan,
  updateLatestScan,
};