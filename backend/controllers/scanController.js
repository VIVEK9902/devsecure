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
    const scanData = req.body;

    if (!scanData) {
      return res.status(400).json({
        message: 'Scan data is required to generate the report.',
      });
    }

    return streamPdfReport(scanData, res);
  } catch (error) {
    return next(error);
  }
};