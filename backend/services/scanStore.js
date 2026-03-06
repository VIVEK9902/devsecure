let latestScan = null;

const setLatestScan = (scanResult) => {
  latestScan = scanResult;
};

const getLatestScan = () => latestScan;

module.exports = {
  setLatestScan,
  getLatestScan,
};
