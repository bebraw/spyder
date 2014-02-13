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

    var config = loadConfig(program.config);

    init(config);
}

function loadConfig(path) {
    try {
        return require(path);
    } catch(e) {
        return console.error('Failed to load configuration');
    }
}

function init(config) {
    if(!config) {
        return;
    }

    console.log('should init now');
}
