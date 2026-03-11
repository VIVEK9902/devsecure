const axios = require("axios");

async function fetchCVE(keyword) {
  try {
    const response = await axios.get(`https://cve.circl.lu/api/search/${keyword}`);

    if (!response.data || response.data.length === 0) {
      return null;
    }

    const cve = response.data[0];

    return {
      id: cve.id,
      summary: cve.summary,
      cvss: cve.cvss
    };

  } catch (error) {
    console.log("CVE lookup failed:", error.message);
    return null;
  }
}

module.exports = { fetchCVE };