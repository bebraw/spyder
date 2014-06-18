#!/usr/bin/env node
'use strict';

var extend = require('util')._extend;
var path = require('path');

var minimist = require('minimist');

var spyder = require('./');


main();

function main() {
    var argv = minimist(process.argv.slice(2));
    var configDir = argv._ && argv._[0];

    if(!configDir) {
        return console.error('Missing configuration directory');
    }

    var configPath = argv.c || argv.config || path.join(configDir, 'spyder_config');
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
