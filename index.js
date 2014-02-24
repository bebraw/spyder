#!/usr/bin/env node

var async = require('async');
var cronJob = require('cron').CronJob;
var math = require('annomath');
var minimist = require('minimist');
var wait = require('wait').wait;


main();

function main() {
    var argv = minimist(process.argv.slice(2));
    var config = argv.c || argv.config;

    if(!config) {
        return console.error('Missing configuration');
    }

    config = loadModule(config, 'configuration');

    init(argv, config);
}

function init(argv, config) {
    if(!config) {
        return;
    }

    var conf = {
        indexer: loadModule(config.indexer, 'indexer'),
        scraper: loadModule(config.scraper, 'scraper'),
        onError: loadConfig(config, 'onError', console.error.bind(console)),
        onResult: loadConfig(config, 'onResult', console.log.bind(console)),
        onFinish: loadConfig(config, 'onFinish', console.log.bind(console, 'Finished')),
        variance: config.variance || 0
    };

    if(conf.indexer && conf.scraper) {
        var initializer = loadInitializer(config.initializer);

        initializer(argv, function(err) {
            if(err) {
                return conf.onError(err);
            }

            if(config.instant) {
                execute(argv, conf);
            }

            schedule(argv, config.schedule, conf);
        });
    }
}

function schedule(argv, cron, conf) {
    if(!cron) {
        console.error('Missing schedule!');
    }

    console.log('execute');

    new cronJob(cron, execute.bind(null, argv, conf), null, true);
}

function execute(argv, o) {
    o.indexer(argv, function(err, targets) {
        if(err) {
            return o.onError(err);
        }

        async.eachSeries(targets, function(target, cb) {
            wait(math.randint(0, o.variance), function() {
                o.scraper(argv, target, function(err, result) {
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

function loadConfig(config, name, defaultFn) {
    var property = config[name];

    if(property) {
        return loadModule(property, name);
    }

    return defaultFn;
}

function loadInitializer(path) {
    try {
        return require(path);
    } catch(e) {
        return function(o, cb) {
            cb();
        };
    }
}

function loadModule(path, name) {
    try {
        return require(path);
    } catch(e) {
        return console.error('Failed to load ' + name + '!');
    }
}
