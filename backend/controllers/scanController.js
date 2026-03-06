const { scanTarget } = require('../services/scannerService');
const { getLatestScan } = require('../services/scanStore');
const { streamPdfReport } = require('../utils/pdfUtils');

exports.scanWebsite = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'Please provide a valid URL in the request body.' });
    }

    const result = await scanTarget(url);
    return res.json(result);
  } catch (error) {
    if (error.code === 'INVALID_URL') {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 'TARGET_UNREACHABLE') {
      return res.status(502).json({ message: error.message });
    }

    return next(error);
  }
};

exports.downloadReport = (req, res, next) => {
  try {
    const latestScan = getLatestScan();

    if (!latestScan) {
      return res.status(404).json({
        message: 'No scan report available yet. Run a scan first using POST /api/scan.',
      });
    }

    return streamPdfReport(latestScan, res);
  } catch (error) {
    return next(error);
  }
};
