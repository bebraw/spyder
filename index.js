#!/usr/bin/env node

var program = require('commander');

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

    var indexer = loadModule(config.indexer, 'indexer');
    var scraper = loadModule(config.scraper, 'scraper');
    var onError = loadOnError(config.onError);
    var onResult = loadOnResult(config.onResult);
    var variance = config.variance || 0;
    var schedule = config.schedule || console.error('Missing schedule!');

    if(indexer && scraper && schedule) {
        console.log('should init now');
    }
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

function loadModule(path, name) {
    try {
        return require(path);
    } catch(e) {
        return console.error('Failed to load ' + name + '!');
    }
}
