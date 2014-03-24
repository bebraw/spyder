'use strict';

module.exports = function(o, result, cb) {
    // got some scraping result now, do something with it
    // spyder defaults to console.log (handy during development)
    console.log('demo value', o.demo);
    console.log(result);

    cb(new Error('Error at Result'));
};
