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

    if(indexer && scraper) {
        console.log('should init now');
    }
}

function loadModule(path, name) {
    try {
        return require(path);
    } catch(e) {
        return console.error('Failed to load ' + name + '!');
    }
}
