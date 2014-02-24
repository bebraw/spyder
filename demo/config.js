module.exports = {
    initializer: require('./init'),
    indexer: require('./indexer'),
    scraper: require('./scraper'),

    onError: require('./handlers/error'),
    onResult: require('./handlers/result'),
    onFinish: require('./handlers/finish'),

    variance: 5000,
    schedule: '00 00 11 * * *',
    instant: true
};
