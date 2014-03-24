'use strict';

var request = require('request');
var cheerio = require('cheerio');


module.exports = function(o, url, cb) {
    console.log('demo:', o.demo);

    request(url, function(err, res, data) {
        if(err) {
            return cb(err);
        }

        var error;
        var $ = cheerio.load(data);

        if(error[0] === 'foo') {
            console.log('foobar');
        }

        cb(null, {
            description: $('.description').text()
        });
    });
};
