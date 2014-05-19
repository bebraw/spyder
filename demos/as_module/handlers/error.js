module.exports = function(o, err) {
    // let's just log errors for now
    // this is also the default behavior. if you don't provide a handler,
    // spyder defaults to this
    console.error(err);
};
