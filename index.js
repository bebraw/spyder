#!/usr/bin/env node

'use strict';

var extend = require('util')._extend;
var path = require('path');

var async = require('async');
var cronJob = require('cron').CronJob;
var math = require('annomath');
var minimist = require('minimist');
var wait = require('wait').wait;


main();

function main() {
    var argv = minimist(process.argv.slice(2));
    var configPath = argv.c || argv.config || path.join(argv._[0], 'spyder_config');
    var baseConfig = loadModule(configPath, 'configuration');

    if(!baseConfig) {
        return console.error('Failed to load configuration');
    }

    init(extend(baseConfig, argv));
}

function init(config) {
    if(!config) {
        return;
    }

    var conf = {
        indexer: config.indexer,
        scraper: config.scraper,
        onError: config.onError || console.error.bind(console),
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

        if(config.instant) {
            execute(config, conf);
        }

        schedule(config, config.schedule, conf);
    });
}

function schedule(config, cron, conf) {
    if(!cron) {
        return console.error('Missing schedule!');
    }

    new cronJob(cron, execute.bind(null, config, conf), null, true);
}

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

function loadModule(p, name) {
    try {
        return require('./' + path.relative(__dirname, path.join(process.cwd(), p)));
    } catch(e) {
        return console.error('Failed to load ' + name + '!', e);
    }
}
