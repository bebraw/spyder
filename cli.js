#!/usr/bin/env node
'use strict';

var extend = require('util')._extend;
var path = require('path');

var minimist = require('minimist');

var spyder = require('./');


main();

function main() {
    var argv = minimist(process.argv.slice(2));
    var configPath = argv.c || argv.config || path.join(argv._[0], 'spyder_config');
    var baseConfig = loadModule(configPath, 'configuration');

    if(!baseConfig) {
        return console.error('Failed to load configuration');
    }

    spyder(extend(baseConfig, argv));
}

function loadModule(p, name) {
    try {
        return require('./' + path.relative(__dirname, path.join(process.cwd(), p)));
    } catch(e) {
        return console.error('Failed to load ' + name + '!', e);
    }
}
