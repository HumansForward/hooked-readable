'use strict';

/**
 * Derived from HookedReadable; continuously pushes count events.
 */
class IntervalStream extends require('../lib/hooked-readable') {
  constructor(options) {
    super(options);
  }

  start(ms) {
    this._count = 1;
    this._tid = setInterval(() => {
      this.push({
        count: this._count++
      })
    }, ms);
  }

  stop() {
    clearInterval(this._tid);
  }
}

/**
 * Transform stream that formats data as JSON strings.
 * NOTE: With simulated back-pressure.
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

    // Simulate back-pressure; i.e. a slow transformer
    setTimeout(() => {
      callback();
    }, 500);

  }
}

/**
 * Start streaming 'count' objects, then quit.
 *
 * The highWaterMark is set intentionally low to trigger 'overflow' events.
 */

const myStream = new IntervalStream({highWaterMark: 1});

myStream.on('overflow', () => {
  console.log("Slow down!!!");
})

myStream.pipe(new JsonFormatter()).pipe(process.stdout);
myStream.start(100);

setTimeout(() => {
  myStream.stop();
  myStream.unpipe();
}, 5000);
