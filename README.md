[![build status](https://secure.travis-ci.org/bebraw/spyder.png)](http://travis-ci.org/bebraw/spyder)
# spyder - Web indexer and scraper runner

`spyder` provides basic architecture for running perpetual web indexers and scrapers. It comes as a CLI tool which you then provide configuration using either `-c` or `--config` parameter (`spyder -c ./config.js`).

Consider the following `config.js` for basic configuration:

```js
module.exports = {
    indexer: './indexer',
    scraper: './scraper',

    // event handlers (optional)
    onError: './error',
    onResult: './result',
    onFinish: './finish',

    // time controls
    variance: 5000, // variance between operations in ms
    schedule: '00 30 11 * * 1', // cron pattern for running the spider (optional)
    instant: true // execute instantly (defaults to false). handy for testing
};
```

## Indexer and Scraper

`indexer` and `scraper` point to modules that do the actual work. An `indexer` could look like this:

```js
module.exports = function(o, cb) {
    // index some page or pages here

    // once finished, cb
    cb(null, [
        'http:// ...' // url to target to scrape
    ]);
};
```

The first parameter contains all arguments passed to `spyder`. This way you may customize behavior of the indexer easily.

A `scraper` could look like this:

```js
module.exports = function(o, url, cb) {
    // scrape the content from url now

    // once finished, cb
    cb(null, {
        title: 'Demo'
    });
};
```

The same idea applies here. First the function receives arguments passed to spyder, then url to scrape and finally a callback to call when finished.

`spyder` takes care of running these modules for you. First an indexer is invoked. After that it runs the scraper against each url indexed.

## Events

In case an error is received, module defined at `onError` is defined. When a scraping result is received, `onResult` module is invoked. Once the whole process has finished, `onFinished` is invoked. To give you an idea of what these files should look like, consider the following.

`./error.js`:

```js
module.exports = function(err) {
    // let's just log errors for now
    // this is also the default behavior. if you don't provide a handler,
    // spyder defaults to this
    console.error(err);
};
```

`./result.js`:

```js
module.exports = function(result) {
    // got some scraping result now, do something with it
    // spyder defaults to console.log (handy during development)
    console.log(result);
};
```

`./finish.js`:

```js
module.exports = function() {
    // spyder default
    console.log('Finished');
}
```

## Timing Options

In order to provide some control over timing of the indexing and scraping `spyder` provides `variance` and `perDay` options.

`variance` is given in milliseconds and refers to possible maximum delay between operations. It is possible to make `spyder` spam target sites less this way and make the traffic easier to deal with.

`schedule` defines when to execute the spider using a [cron pattern](http://en.wikipedia.org/wiki/Cron).

If `instant` flag is set, the spider will execute instantly. The flag defaults to false. This is handy for testing.

## License

`spyder` is available under MIT. See LICENSE for more details.
