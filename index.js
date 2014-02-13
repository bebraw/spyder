#!/usr/bin/env node

var async = require('async');
var cronJob = require('cron').CronJob;
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
        onError: loadConfig(config, 'onError', console.error.bind(console)),
        onResult: loadConfig(config, 'onResult', console.log.bind(console)),
        onFinish: loadConfig(config, 'onFinish', console.log.bind(console, 'Finished')),
        variance: config.variance || 0
    };

    if(conf.indexer && conf.scraper) {
        if(config.instant) {
            execute(conf);
        }

        schedule(config.schedule, conf);
    }
}

function schedule(cron, conf) {
    if(!cron) {
        console.error('Missing schedule!');
    }

    console.log('execute');

    new cronJob(cron, execute.bind(null, conf), null, true);
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

function loadConfig(config, name, defaultFn) {
    var property = config[name];

    if(property) {
        return loadModule(property, name);
    }

    return defaultFn;
}

function loadModule(path, name) {
    try {
        return require(path);
    } catch(e) {
        return console.error('Failed to load ' + name + '!');
    }
}
