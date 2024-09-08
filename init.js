const { Transform } = require('stream');

let byteCount = 0;
let startTime = null;
let intervalId = null;

function printStats() {
  if (startTime === null) return;

  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const bytesPerSecond = byteCount / elapsedSeconds;

  process.stderr.write(
    `Bytes: ${byteCount}, Time: ${elapsedSeconds.toFixed(2)}s, Speed: ${bytesPerSecond.toFixed(2)} B/s\n`
  );
}

function cleanup() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  printStats();
}

const transformer = new Transform({
  transform(chunk, encoding, callback) {
    if (startTime === null) {
      startTime = Date.now();
      intervalId = setInterval(printStats, 1000);
    }

    byteCount += chunk.length;
    this.push(chunk);
    callback();
  },
  flush(callback) {
    cleanup();
    callback();
  }
});

process.stdin.pipe(transformer).pipe(process.stdout);

process.on('SIGINT', () => {
  cleanup();
  process.exit();
});

// Handle the 'end' event on stdout
process.stdout.on('finish', () => {
  process.exit();
});
