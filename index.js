#!/usr/bin/env node

var async = require('async');
var math = require('annomath');
var program = require('commander');
var wait = require('wait').wait;

var VERSION = require('./package.json').version;


main();

function main() {
    program.version(VERSION).
        option('-c --config <configuration file>', 'Configuration in JavaScript').
        parse(process.argv);

    if(!program.config) {
        return console.error('Missing configuration');
    }

    var config = loadModule(program.config, 'configuration');

    init(config);
}

function init(config) {
    if(!config) {
        return;
    }

    var conf = {
        indexer: loadModule(config.indexer, 'indexer'),
        scraper: loadModule(config.scraper, 'scraper'),
        onError: loadOnError(config.onError),
        onResult: loadOnResult(config.onResult),
        onFinish: loadOnFinished(config.onFinish),
        variance: config.variance || 0
    };

    if(conf.indexer && conf.scraper) {
        if(config.instant) {
            execute(conf);
        }

        schedule(config.schedule);
    }
}

function schedule(cron) {
    if(!cron) {
        return console.error('Missing schedule!');
    }

    // TODO
}

function execute(o) {
    o.indexer(function(err, targets) {
        if(err) {
            return o.onError(err);
        }

        async.eachSeries(targets, function(target, cb) {
            wait(math.randint(0, o.variance), function() {
                o.scraper(target, function(err, result) {
                    if(err) {
                        // keep on running even if we get an error
                        o.onError(err);
                    }
                    else {
                        o.onResult(result);
                    }

                    cb();
                });
            });
        }, function() {
            o.onFinish();
        });
    });
}

function loadOnError(onError) {
    if(onError) {
        return loadModule(onError, 'onError');
    }

    return console.error.bind(console);
}

function loadOnResult(onResult) {
    if(onResult) {
        return loadModule(onResult, 'onResult');
    }

    return console.log.bind(console);
}

function loadOnFinished(onFinish) {
    if(onFinish) {
        return loadModule(onFinish, 'onFinish');
    }

    return console.log.bind(console, 'Finished');
}

function loadModule(path, name) {
    try {
        return require(path);
    } catch(e) {
        return console.error('Failed to load ' + name + '!');
    }
}
