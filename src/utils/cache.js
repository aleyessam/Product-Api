const NodeCache = require("node-cache");

// cache for 5 minutes
const statsCache = new NodeCache({ stdTTL: 300 });

module.exports = statsCache;
