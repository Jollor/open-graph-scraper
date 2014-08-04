var cheerio = require('cheerio');
var Url = require('url');
var http = require('http');
var Iconv = require('iconv').Iconv;
var request = require('request');
var sizeOf = require('image-size');


var OpenGraphScraper = function () {
};


/*
 * get info
 * @param string url - user input of url
 * @param function callback
 */
OpenGraphScraper.prototype.getInfo = function (options, callback) {
	var error = null;
	var data = {};
	var that = this;

	if (!options.url) {
		return callback(new Error('Invalid URL'));
	}

	options.url = this.validateUrl_(options.url);
	options.timeout = !isNaN(options.timeout) ? options.timeout : 2000;
	options.encoding = 'binary';
	options.maxRedirects = 20;
	options.jar = true;

	that.getOpenGraph_(options, function (err, results) {
		if (err) {
			return callback(err);
		}

		callback(null, results);
		/*
		that.processData_(results, function (err, results) {
			callback(err, results);
		});
		*/
	});
};


/**
 * Processes OpenGraph data.
 */
OpenGraphScraper.prototype.processData_ = function (results, callback) {
	if (results['image']) {
		this.computeImageDimensions_(results['image'], function (err, dimensions) {
			if (err) {
				return callback(err);
			}

			if (dimensions) {
				results['image_dimensions'] = dimensions;
			}

			callback(null, results);
		});
	} else {
		callback(null, results);
	}
};


/**
 * Computes image dimensions.
 * @param {string} url
 * @param {function(Error, { width: number, height: number })} callback
 */
OpenGraphScraper.prototype.computeImageDimensions_ = function (url, callback) {
	var options = Url.parse(url);
	http.get(options, function (response) {
		var chunks = [];
		response.on('data', function (chunk) {
			chunks.push(chunk);
		}).on('end', function () {
			var buffer = Buffer.concat(chunks);
			try {
				var dimensions = sizeOf(buffer);
				callback(null, dimensions);
			} catch (err) {
				console.log('Cannot get size of ' + url  + ' due to error', err);
				callback();
			}
		})
	});
};


/*
 * validate url - all urls must have http:// in front of them
 * @param string var - the url we want to scrape
 * @param function callback
 */
OpenGraphScraper.prototype.validateUrl_ = function (inputUrl) {
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
OpenGraphScraper.prototype.validateTimeout_ = function(inputTimeout) {
	if(!/^\d{1,10}$/.test(inputTimeout)) {
		return false;
	};
	return true;
};


OpenGraphScraper.prototype.parseCharset_ = function(response, body) {
	var charset;

	// http content-type header
	if (response && response.headers && response.headers['content-type']) {
		var content_type = response.headers['content-type'].split('; ');
		if (content_type.length > 1)  {
			charset = content_type[1].split('=')[1];
		}
	}

	// meta content-type and meta charset
	if (!charset) {
			var matches = body.match(/charset="?'?([a-zA-Z0-9-]+)/i);
			if (matches && matches.length > 1) {
				charset = matches[1];
			}
	}

	// default charset
	charset = charset || 'utf-8';

	return charset;
};


/*
 * getOG - scrape that url!
 * @param string url - the url we want to scrape
 * @param function callback
 */
OpenGraphScraper.prototype.getOpenGraph_ = function(options, callback) {
	request(options, function(err, response, body) {
		if (err) {
			callback(err, null);
		} else if (!body) {
			callback(new Error('Page is empty'));
		} else {
			var charset = this.parseCharset_(response, body);
			var iconv = new Iconv(charset, 'UTF8//IGNORE');

			try {
				body = iconv.convert(new Buffer(body, 'binary')).toString();
			} catch (err) {
				return callback(new Error('This link has no metadata'));
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
	}.bind(this));
};


module.exports = OpenGraphScraper;