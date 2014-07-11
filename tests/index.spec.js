var OpenGraphScraper = require('../lib/OpenGraphScraper'),
	expect = require('expect.js');

var app = new OpenGraphScraper();
var ogs = require('../app');

//test url - this has alot of OG info
var options1 = {
	'url':'http://ogp.me/'
};

//test url formats
var	options2 = {
		'url':'http://www.google.com/'
	},
	options3 = {
		'url':'https://www.google.com/'
	},
	options4 = {
		'url':'www.google.com/'
	},
	options5 = {
		'url':'google.com/'
	},
	options6 = {
		'url':'http://google.com/'
	};

//invaild url
var options7 = {
	'url':'http://testtesttest4564568.com'
};

//empty value
var optionsEmpty = {
	'url':''
};

// test timeout
var options8 = {
		'url':'http://www.google.com/',
		'timeout':2000
	},
	options9 = {
		'url':'http://www.google.com/',
		'timeout':''
	},
	options10 = {
		'url':'http://www.google.com/',
		'timeout':'2000'
	},
	options11 = {
		'url':'http://www.google.com/',
		'timeout':'sdsdds'
	};

// some bad urls
var options12 = {
		'url':23233
	},
	options13 = {
		'url':'2323233'
	},
	options14 = {
		'url':'this is a testt'
	};

//no url
var optionsNoUrl = { };

describe('GET OG', function (done) {
	this.timeout(7000); //shoudl wait atleast 3secs before failing

	it('Valid call og - url1', function(done) {
		app.getInfo(options1, function(err, result){
			expect(err).to.be(null);
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url2', function(done) {
		app.getInfo(options2, function(err, result){
			expect(err).to.be(null);
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url3', function(done) {
		app.getInfo(options3, function(err, result){
			expect(err).to.be(null);
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url4', function(done) {
		app.getInfo(options4, function(err, result){
			expect(err).to.be(null);
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url5', function(done) {
		app.getInfo(options5, function(err, result){
			expect(err).to.be(null);
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url6', function(done) {
		app.getInfo(options6, function(err, result){
			expect(err).to.be(null);
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Invalid call og - url7', function(done) {
		app.getInfo(options7, function(err, result){
			done();
		});
	});
	it('Invalid get og - empty url', function(done) {
		app.getInfo(optionsEmpty, function(err, result){
			expect(err.message).to.be('Invalid URL');
			done();
		});
	});
		it('Valid call og - url8', function(done) {
		app.getInfo(options8, function(err, result){
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url9', function(done) {
		app.getInfo(options9, function(err, result){
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url10', function(done) {
		app.getInfo(options10, function(err, result){
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url11', function(done) {
		app.getInfo(options11, function(err, result){
			expect(result.success).to.be(true);
			done();
		});
	});
	it('Valid call og - url12', function(done) {
		app.getInfo(options12, function(err, result){
			expect(err.code).to.be('EHOSTUNREACH');
			done();
		});
	});
	it('Valid call og - url13', function(done) {
		app.getInfo(options13, function(err, result){
			expect(err.code).to.be('EHOSTUNREACH');
			done();
		});
	});
	it('Valid call og - url14', function(done) {
		app.getInfo(options14, function(err, result){
			expect(err.code).to.be('ENOTFOUND');
			done();
		});
	});
	it('Invalid get og - no url', function(done) {
		app.getInfo(optionsNoUrl, function(err, result){
			expect(err.message).to.be('Invalid URL');
			done();
		});
	});

	it('windows encoding', function (done) {
		var options = {
			'url': 'http://byznys.ihned.cz/c1-62120450-ekonom-mafie-by-tu-neprezila-cesi-vsechno-vyzvani-tvrdi-advokat-sokol'
		};
		app.getInfo(options, function (err, result) {
			expect(result.success).to.be(true);
			expect(result.title).to.be('EKONOM: Mafie by tu nepřežila, Češi všechno vyžvaní, tvrdí advokát Sokol');
			done();
		});
	});

	it('should handle NYTimes article', function (done) {
		var options = {
			'url': 'http://www.nytimes.com/2014/05/08/technology/the-unlikely-ascent-of-jack-ma-alibabas-founder.html?ref=technology'
		};
		app.getInfo(options, function (err, result) {
			expect(result.success).to.be(true);
			done();
		});
	});

	it('should handle encoding specified only by http headers', function (done) {
		var options = {
			'url': 'mngsocial.com/cs/blog/84-facebook-nejlepsi-stranky'
		};
		app.getInfo(options, function (err, result) {
			expect(result.success).to.be(true);
			expect(result.title).to.be('Stránky, které stojí za "líbíka" - Manage Social');
			done();
		})
	});

	it('should handle encoding specified only by meta content-type', function (done) {
		var options = {
			'url': 'http://zdravinaroda.cz/blog/vitamin-d-je-dulezitejsi-nez-jsme-mysleli'
		};
		app.getInfo(options, function (err, result) {
			expect(result.success).to.be(true);
			expect(result.title).to.be('Vitamín D je důležitější, než jsme mysleli');
			done();
		})
	});

	it('should parse charset from http headers', function (done) {
		var response = {
			headers: {
				'content-type': 'text/html; charset=windows-1250'
			}
		};
		var charset = app.parseCharset_(response, '');
		expect(charset).to.be('windows-1250');
		done();
	});

	it('should parse charset from meta content-type', function (done) {
		var body = '<meta http-equiv="content-type" content="text/html; charset=WINDOWS-1250" />';
		var charset = app.parseCharset_({}, body);
		expect(charset).to.be('WINDOWS-1250');
		done();
	});

	it('should parse charset from meta charset', function (done) {
		var charset = app.parseCharset_({}, '<meta charset="WINDOWS-1250" />');
		expect(charset).to.be('WINDOWS-1250');

		charset = app.parseCharset_({}, '<META CHARSET="WINDOWS-1250" />');
		expect(charset).to.be('WINDOWS-1250');

		charset = app.parseCharset_({}, "<META CHARSET='WINDOWS-1250' />");
		expect(charset).to.be('WINDOWS-1250');

		done();
	});

	it('final test to be sure export is working', function (done) {
		var options = {
			'url': 'http://google.com'
		};
		ogs(options, function (err, result) {
			expect(result.success).to.be(true);
			done();
		})
	});

	xit('should parse og:image and compute dimensions', function (done) {
		var options = {
			'url': 'http://www.barchick.com/find-a-bar/london/the-imperial-durbar-2'
		};
		ogs(options, function (err, result) {
			expect(err).to.be(null);
			expect(result.image).to.equal('http://www.barchick.com/wp-content/themes/barchick-v3/scripts/timthumb.php?w=90&src=http://www.barchick.com/wp-content/uploads/2014/07/imperialdurbar.image3_.jpg');
			expect(result.image_dimensions.width).to.equal(90);
			expect(result.image_dimensions.height).to.equal(45);
			done();
		})
	});

	xit('should not compute dimensions for not existing image', function (done) {
		var options = {
			'url': 'http://mngsocial.com/cs/blog/103-jak-napsat-titulek'
		};
		ogs(options, function (err, result) {
			expect(err).to.be(null);
			expect(result.image).to.equal('http://mngsocial.com/cs/blog/103-jak-napsat-titulek/admin/image/detail/33');
			expect(result.image_dimensions).to.equal(undefined);
			done();
		})
	});
});
