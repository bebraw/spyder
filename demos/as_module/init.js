module.exports = function(o, cb) {
    console.log('at initializer\n', o);

    o.demo = 'demo';

    cb();
};

