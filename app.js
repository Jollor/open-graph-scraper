var cheerio = require('cheerio');
var Iconv = require('iconv').Iconv;
var request = require('request');

module.exports = function (options, callback) {
	exports.getInfo(options, function (err, results) {
		callback(err, results);
	});
};

/*
 * get info
 * @param string url - user input of url
 * @param function callback
 */
exports.getInfo = function (options, callback) {
	var error = null;
	var data = {};
	var that = this;

	if (!options.url) {
		return callback(new Error('Invalid URL'));
	}

	options.url = this.validateUrl(options.url);
	options.timeout = !isNaN(options.timeout) ? options.timeout : 2000;
	options.encoding = 'binary';

	that.getOpenGraph(options, function (err, results) {
		if (err) {
			return callback(err);
		}

		callback(null, results);
	});
};


/*
 * validate url - all urls must have http:// in front of them
 * @param string var - the url we want to scrape
 * @param function callback
 */
exports.validateUrl = function (inputUrl) {
	if (!/^(f|ht)tps?:\/\//i.test(inputUrl)) {
		inputUrl = "http://" + inputUrl;
	};
	return inputUrl;
};

/*
 * validate timeout - how long should we wait for a request
 * @param number var - the time we want to wait
 * @param function callback
 */
exports.validateTimeout = function(inputTimeout) {
	if(!/^\d{1,10}$/.test(inputTimeout)) {
		return false;
	};
	return true;
};

/*
 * getOG - scrape that url!
 * @param string url - the url we want to scrape
 * @param function callback
 */
exports.getOpenGraph = function(options, callback) {
	request(options, function(err, response, body) {
		if (err) {
			callback(err, null);
		} else if (!body) {
			callback(new Error('Page is empty'));
		} else {
			var charset = body.match(/charset=([a-zA-Z0-9-]+)/);

			if (charset) {
				var iconv = new Iconv(charset[1], 'UTF8//IGNORE');
				body = iconv.convert(new Buffer(body, 'binary')).toString();
			}

			var $ = cheerio.load(body),
				meta = $('meta'),
				keys = Object.keys(meta),
				ogObject = {};

			//able to get og info
			ogObject.success = true;

			keys.forEach(function (key) {
				if (!meta[key].attribs) return;
				var attrs = meta[key].attribs;

				if (attrs.property) {
					var parts = attrs.property.split(':');
					if (parts.length > 1 && parts[0] == 'og') {
						parts.shift();
						var name = parts.join(':');
						ogObject[name] = attrs.content;
					}
				}

				if (!ogObject.description && attrs.name == 'description') {
					ogObject.description = attrs.content;
				}
			});

			// Get title tag if og:title not provided
			if (!ogObject.title) {
				ogObject.title = $('title').text();
			}

			callback(null, ogObject);
		};
	});
};