var URL = require('url');
var request = require('request');

function ZywkViewEvents(req, res, url) {
    console.log('ZywkViewEvents:\t',URL.parse(url).pathname);
}

exports.ZywkViewEvents = ZywkViewEvents;