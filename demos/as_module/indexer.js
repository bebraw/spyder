var url = require('url');

var request = require('request');
var cheerio = require('cheerio');


module.exports = function(o, cb) {
    var baseUrl = 'http://localhost:3000';

    console.log('demo:', o.demo);

    request(baseUrl, function(err, res, data) {
        if(err) {
            return cb(err);
        }

        var $ = cheerio.load(data);
        var links = [];
        $('.funnyPages a').each(function(i, e) {
            links.push(url.resolve(baseUrl, $(e).attr('href')));
        });

        cb(null, links);
    });
};
