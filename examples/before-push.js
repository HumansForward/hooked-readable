'use strict';

/**
 * Transform stream that formats data as JSON strings.
 */
class JsonFormatter extends require('stream').Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(chunk, encoding, callback) {
    try {
      this.push(JSON.stringify(chunk) + '\r\n');
    } catch (e) {
      // No-op
    }

    callback();
  }
}

const HookedReadable = require('../lib/hooked-readable');

/**
 * Configure beforePush hook to timestamp events as soon as they're pushed.
 */
const myStream = new HookedReadable({
  beforePush: (data) => {
    data.timestamp = new Date();
    return data;
  }
})

myStream.pipe(new JsonFormatter()).pipe(process.stdout);

myStream.push({
  hello: 'world'
});

myStream.push(null);
