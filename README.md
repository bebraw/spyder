[![build status](https://secure.travis-ci.org/bebraw/spyder.png)](http://travis-ci.org/bebraw/spyder)
# spyder - Indexer and scraper runner

`spyder` provides basic architecture for running indexers and scrapers. It comes as a CLI tool which you then provide configuration using either `-c` or `--config` parameter (`spyder -c ./config.js`).

It is also possible to provide a directory with `spyder_config.js` in it. In that case `spyder` tries to load the configuration automatically. Example: `spyder demo`.

You can also pass additional parameters to both commands. They will override the default configuration.

Consider the following `config.js` for basic configuration:

```js
module.exports = {
    // workers
    initializer: require('./init'), // optional
    indexer: require('./indexer'),
    scraper: require('./scraper'),

    // events
    onError: require('./error'),
    onResult: require('./result'),
    onFinish: require('./finish'),

    // other
    variance: 5000 // variance between scrape operations in ms
};
```

## Workers

`spyder` provides three workers into which you may attach actual functionality. `initializer` is executed once when `spyder` process is started. You may set auth keys and such there. `indexer` is run once per scraping round. `scraper` is executed per each url returned by `indexer`.

### Initializer

`initializer` is optional. A basic implementation could look like this:

```js
module.exports = function(o, cb) {
    // do something with o now
    // ...

    cb(); // done
};
```

The first parameter will contain arguments passed to `spyder` process. This behavior is the same for all workers.

### Indexer

An `indexer` could look like this:

```js
module.exports = function(o, cb) {
    // index some page or pages here

    // once finished, cb
    cb(null, [
        'http:// ...' // url to target to scrape
    ]);
};
```

Remember to return the urls you want to scrape here. In case you run into error, pass it as the first parameter to the callback.

### Scraper

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

The same idea as earlier applies here. First the function receives arguments passed to spyder, then url to scrape and finally a callback to call when finished.

## Events

In case an error is received, module defined at `onError` is defined. When a scraping result is received, `onResult` module is invoked. Once the whole process has finished, `onFinished` is invoked. Like above each handler receives arguments. You can for instance inject an object there at `initializer` and then use that to perform some operation. To give you an idea of what these files should look like, consider the following.

`./error.js`:

```js
module.exports = function(o, err) {
    // let's just log errors for now
    // this is also the default behavior. if you don't provide a handler,
    // spyder defaults to this
    console.error(err);
};
```

`./result.js`:

```js
module.exports = function(o, result, cb) {
    // got some scraping result now, do something with it
    // spyder defaults to console.log (handy during development)
    console.log(result);

    // the callback is optional and allows you to communicate possible errors
    cb(new Error('Demo error'));
};
```

`./finish.js`:

```js
module.exports = function(o) {
    // spyder default
    console.log('Finished');
}
```

## Other

* `variance` - Use `variance` to add arbitrary, random delay between scrape operations to make traffic look more irregular.

## License

`spyder` is available under MIT. See LICENSE for more details.
