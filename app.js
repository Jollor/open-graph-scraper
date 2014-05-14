var OpenGraphScraper = require('./lib/OpenGraphScraper');
var ogs = new OpenGraphScraper();

module.exports = function (options, callback) {
	ogs.getInfo(options, callback);
};