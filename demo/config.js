module.exports = {
    indexer: './demo/indexer',
    scraper: './demo/scraper',
    onError: './demo/handlers/error',
    onResult: './demo/handlers/result',
    onFinish: './demo/handlers/finish',
    variance: 5000,
    schedule: '00 00 11 * * *',
    instant: true
};
