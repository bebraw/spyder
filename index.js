#!/usr/bin/env node
'use strict';

var async = require('async');
var math = require('annomath');
var wait = require('wait').wait;


module.exports = function(config) {
    if(!config) {
        console.warn('Missing configuration');

        return;
    }

    var conf = {
        indexer: config.indexer,
        scraper: config.scraper,
        onError: config.onError || console.trace.bind(console),
        onResult: config.onResult || console.log.bind(console),
        onFinish: config.onFinish || console.log.bind(console, 'Finished'),
        variance: config.variance || 0
    };

    if(!config.indexer) {
        return console.error('Missing indexer!');
    }

    if(!config.scraper) {
        return console.error('Missing scraper!');
    }

    process.on('uncaughtException', function(err) {
        // keep on running even if we get an error
        conf.onError(config, err.stack);
    });

    var initializer = config.initializer || function(err, cb) {cb();};

    initializer(config, function(err) {
        if(err) {
            return conf.onError(config, err);
        }

        execute(config, conf);
    });
};

function execute(config, o) {
    o.indexer(config, function(err, targets) {
        if(err) {
            return o.onError(config, err);
        }

        async.eachSeries(targets, function(target, cb) {
            wait(math.randint(0, o.variance), function() {
                o.scraper(config, target, function(err, result) {
                    if(err) {
                        // keep on running even if we get an error
                        o.onError(config, err);
                    }
                    else {
                        o.onResult(config, result, function(err) {
                            if(err) {
                                o.onError(config, err);
                            }
                        });
                    }

                    cb();
                });
            });
        }, function() {
            o.onFinish(config);
        });
    });
}
